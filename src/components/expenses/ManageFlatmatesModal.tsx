"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlatMember, MemberFinancialSummary } from "@/types/expense";
import { AppConfirmDialog } from "@/components/shared/AppConfirmDialog";
import {
  Users,
  Crown,
  Utensils,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ShieldAlert,
  ArrowRightLeft,
  Lock,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

interface ManageFlatmatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FlatMember[];
  memberSummaries: MemberFinancialSummary[];
  onUpdateMembers: (newMembers: FlatMember[]) => void;
  isArchived?: boolean;
}

export function ManageFlatmatesModal({
  isOpen,
  onClose,
  members,
  memberSummaries,
  onUpdateMembers,
  isArchived = false,
}: ManageFlatmatesModalProps) {
  // View Tab: "roster" or "add"
  const [modalView, setModalView] = useState<"roster" | "add">("roster");

  // Add Member State (Zero sq ft fields)
  const [newName, setNewName] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newPhone, setNewPhone] = useState("+880 17");
  const [newEmail, setNewEmail] = useState("");

  // Edit Member State (Zero sq ft fields)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRoomName, setEditRoomName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    variant?: "destructive" | "warning" | "default";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const handleStartEdit = (m: FlatMember) => {
    if (isArchived) return;
    setEditingMemberId(m.id);
    setEditName(m.name);
    setEditRoomName(m.roomName);
    setEditPhone(m.phone);
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
  };

  const handleSaveEdit = (memberId: string) => {
    if (!editName.trim()) {
      toast.error("Member name cannot be empty.");
      return;
    }
    const updated = members.map((m) =>
      m.id === memberId
        ? {
            ...m,
            name: editName.trim(),
            roomName: editRoomName.trim() || m.roomName,
            phone: editPhone.trim() || m.phone,
          }
        : m
    );
    onUpdateMembers(updated);
    setEditingMemberId(null);
    toast.success("Flatmate information updated!");
  };

  const handleHandoverMessManager = (target: FlatMember) => {
    if (isArchived) return;
    if (target.isMessManager) {
      toast.info(`${target.name} is already the active Mess Manager.`);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Handover Mess Manager Role",
      description: `Transfer the Mess Manager role to ${target.name}? All existing grocery logs and historical balances are preserved. Subsequent mess bazaar entries and meal settlements will designate ${target.name} as the primary manager.`,
      confirmText: "Confirm Handover",
      variant: "default",
      onConfirm: () => {
        const updated = members.map((m) => ({
          ...m,
          isMessManager: m.id === target.id,
        }));
        onUpdateMembers(updated);
        toast.success(`Mess Manager role successfully handed over to ${target.name}!`);
      },
    });
  };

  const handleRemoveMember = (target: FlatMember) => {
    if (isArchived) return;

    if (members.length <= 1) {
      toast.error("A flat household must have at least one member.");
      return;
    }

    const summary = memberSummaries.find((s) => s.memberId === target.id);
    const fixedBalance = summary?.fixedBalance || 0;
    const messBalance = summary?.messBalance || 0;
    const hasUnsettledBalance = Math.abs(fixedBalance) > 0 || Math.abs(messBalance) > 0;

    if (hasUnsettledBalance) {
      setConfirmDialog({
        isOpen: true,
        title: "Warning: Unsettled Balance Detected",
        description: `${target.name} has an active unsettled balance (Rent/Bills: ৳ ${fixedBalance.toLocaleString()}, Mess Food: ৳ ${messBalance.toLocaleString()}, Net: ৳ ${(summary?.netBalance || 0).toLocaleString()}). Removing them now without settling will leave an uncollected discrepancy in the flat ledger. Do you want to force remove them anyway?`,
        confirmText: "Force Remove Member",
        variant: "destructive",
        onConfirm: () => {
          let updated = members.filter((m) => m.id !== target.id);
          if (target.isMessManager && updated.length > 0) {
            updated = updated.map((m, idx) => ({
              ...m,
              isMessManager: idx === 0,
            }));
          }
          onUpdateMembers(updated);
          toast.warning(`${target.name} was removed. Outstanding balance discarded from active roster.`);
        },
      });
    } else {
      setConfirmDialog({
        isOpen: true,
        title: "Remove Flatmate",
        description: `Are you sure you want to remove ${target.name} from the flat directory? Their account is fully balanced. Past transactions will remain intact in history.`,
        confirmText: "Remove Flatmate",
        variant: "destructive",
        onConfirm: () => {
          let updated = members.filter((m) => m.id !== target.id);
          if (target.isMessManager && updated.length > 0) {
            updated = updated.map((m, idx) => ({
              ...m,
              isMessManager: idx === 0,
            }));
          }
          onUpdateMembers(updated);
          toast.info(`${target.name} was removed from the flatmate roster.`);
        },
      });
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (isArchived) return;

    if (!newName.trim() || !newRoomName.trim()) {
      toast.error("Please provide both flatmate name and room/seat assignment.");
      return;
    }

    const newId = `mem-${Date.now()}`;
    const newMember: FlatMember = {
      id: newId,
      name: newName.trim(),
      email: newEmail.trim() || `${newName.trim().toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: newPhone.trim() || "+880 1700-000000",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      roomName: newRoomName.trim(),
      roomSizeSqFt: 120, // Internal fallback only, no longer shown or required in UI
      rentWeightPercent: Math.round(100 / (members.length + 1)),
      isCurrentUser: false,
      isFlatManager: false,
      isMessManager: false,
    };

    onUpdateMembers([...members, newMember]);
    setNewName("");
    setNewRoomName("");
    setNewPhone("+880 17");
    setNewEmail("");
    setModalView("roster"); // Automatically switch back to roster tab!
    toast.success(`Flatmate "${newMember.name}" added to household roster!`);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-card border border-border text-foreground rounded-xs shadow-xl">
          {/* Header */}
          <DialogHeader className="p-4 sm:p-5 border-b border-border space-y-2 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="space-y-0.5">
                <DialogTitle className="text-base sm:text-lg font-bold font-heading flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary shrink-0" />
                  <span>Flatmate Directory & Roles</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Manage flat roommates, role delegation, and designated manager duties.
                </DialogDescription>
              </div>

              {/* Smart Segmented Switcher at the very top! */}
              {!isArchived && (
                <div className="inline-flex items-center p-1 bg-secondary rounded-xs border border-border shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setModalView("roster")}
                    className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                      modalView === "roster"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Roster ({members.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalView("add")}
                    className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                      modalView === "add"
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add Flatmate</span>
                  </button>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Simulation Notice */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xs p-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-semibold">Demo Household Directory:</strong> Flatmates are simulated student personas stored locally in your browser. All role assignments and balance calculations recalculate instantly.
              </div>
            </div>

            {/* Archived notice if historical */}
            {isArchived && (
              <div className="bg-muted border border-border rounded-xs p-3 flex items-center gap-2.5 text-xs text-muted-foreground">
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>
                  <strong>Archived Month:</strong> Roster modifications are locked for historical months. Switch to October 2026 to edit flatmates.
                </span>
              </div>
            )}

            {/* VIEW 1: SMART ADD FLATMATE FORM (Appears immediately at the top!) */}
            {modalView === "add" && !isArchived && (
              <form
                onSubmit={handleAddMember}
                className="border border-primary/40 bg-secondary/20 rounded-xs p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-primary" />
                    <h3 className="text-xs sm:text-sm font-bold text-foreground font-heading">
                      Add New Flatmate to Group
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalView("roster")}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <Label className="text-[11px] font-semibold text-foreground">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Mahfuzur Rahman"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      className="h-9 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-semibold text-foreground">
                      Room / Seat Assignment <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Master Bedroom (Bed B) or Single Room"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      required
                      className="h-9 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-semibold text-foreground">
                      Phone Number
                    </Label>
                    <Input
                      placeholder="+880 1712-345678"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="h-9 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-semibold text-foreground">
                      Email Address (Optional)
                    </Label>
                    <Input
                      placeholder="e.g. mahfuzur@pub.ac.bd"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="h-9 text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setModalView("roster")}
                    className="px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/80 rounded-xs transition-colors cursor-pointer text-center"
                  >
                    Back to Roster
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer text-center"
                  >
                    Save & Add Flatmate
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 2: FLATMATE ROSTER */}
            {modalView === "roster" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-muted-foreground">
                    Current Residents ({members.length})
                  </h3>
                  {!isArchived && (
                    <button
                      type="button"
                      onClick={() => setModalView("add")}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-primary hover:text-primary-foreground hover:bg-primary bg-secondary border border-primary/20 rounded-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Roommate</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {members.map((member) => {
                    const summary = memberSummaries.find((s) => s.memberId === member.id);
                    const isEditing = editingMemberId === member.id;
                    const fixedBal = summary?.fixedBalance || 0;
                    const messBal = summary?.messBalance || 0;

                    return (
                      <div
                        key={member.id}
                        className="border border-border rounded-xs p-3.5 bg-background shadow-2xs space-y-3 transition-colors"
                      >
                        {isEditing ? (
                          /* Inline Edit Form - Zero sq ft */
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div>
                                <Label className="text-[11px] font-medium text-muted-foreground">Full Name</Label>
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="h-8.5 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-[11px] font-medium text-muted-foreground">Seat / Room</Label>
                                <Input
                                  value={editRoomName}
                                  onChange={(e) => setEditRoomName(e.target.value)}
                                  className="h-8.5 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-[11px] font-medium text-muted-foreground">Phone Number</Label>
                                <Input
                                  value={editPhone}
                                  onChange={(e) => setEditPhone(e.target.value)}
                                  className="h-8.5 text-xs mt-1"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/50 rounded-xs transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(member.id)}
                                className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors cursor-pointer shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5 inline mr-1" />
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Normal Display - Fully Responsive Card */
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-border shrink-0 mt-0.5">
                                <Image
                                  src={member.avatar}
                                  alt={member.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>

                              <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-semibold text-xs sm:text-sm text-foreground">
                                    {member.name}
                                  </span>
                                  {member.isCurrentUser && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-secondary text-primary font-bold">
                                      You
                                    </span>
                                  )}
                                  {member.isFlatManager && (
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-semibold">
                                      <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                      <span>Flat Manager</span>
                                    </span>
                                  )}
                                  {member.isMessManager && (
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-semibold">
                                      <Utensils className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                      <span>Active Mess Manager</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                  <span className="font-medium text-foreground">{member.roomName}</span>
                                  <span>•</span>
                                  <span>{member.phone}</span>
                                </div>

                                {/* Balance Sub-account Badges */}
                                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                                  <span className="text-muted-foreground text-[10px]">Balance:</span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded-xs font-mono text-[10px] font-bold ${
                                      fixedBal >= 0
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    }`}
                                  >
                                    Rent: {fixedBal >= 0 ? `+৳${fixedBal}` : `-৳${Math.abs(fixedBal)}`}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded-xs font-mono text-[10px] font-bold ${
                                      messBal >= 0
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    }`}
                                  >
                                    Mess: {messBal >= 0 ? `+৳${messBal}` : `-৳${Math.abs(messBal)}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action buttons */}
                            {!isArchived && (
                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-0 border-border/40 w-full sm:w-auto justify-end">
                                {!member.isMessManager && (
                                  <button
                                    type="button"
                                    onClick={() => handleHandoverMessManager(member)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xs transition-colors cursor-pointer"
                                    title="Transfer mess manager role to this roommate"
                                  >
                                    <ArrowRightLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>Make Mess Manager</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(member)}
                                  className="p-1.5 text-muted-foreground hover:text-foreground bg-secondary/60 hover:bg-secondary rounded-xs transition-colors cursor-pointer"
                                  title="Edit flatmate info"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(member)}
                                  className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 rounded-xs transition-colors cursor-pointer"
                                  title="Remove flatmate"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-border flex items-center justify-between shrink-0 bg-muted/20">
            <span className="text-[11px] text-muted-foreground">
              {members.length} active flatmates
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-xs transition-colors cursor-pointer"
            >
              Close Directory
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AppConfirmDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, isOpen: open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />
    </>
  );
}
