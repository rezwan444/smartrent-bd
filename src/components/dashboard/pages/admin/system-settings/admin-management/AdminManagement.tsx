"use client";

import HeaderTitle from "@/components/shared/HeaderTitle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WEBSITE_DETAILS } from "@/lib/constants";
import {
  useDeleteUserMutation,
  useInviteAdminMutation,
  useGetAllUsersQuery,
} from "@/redux/api/user/userApi";
import { formatStatusText } from "@/utils/formatStatusText";
import { Icons } from "@/utils/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import adminSchema, { AdminSchemaType } from "./schema";

const AdminManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: adminDataResponse, isLoading } = useGetAllUsersQuery({ role: "ADMIN" });
  const adminList = adminDataResponse?.data || [];

  const adminForm = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      adminName: "",
      emailAddress: "",
      customMessage: "",
      password: "",
    },
  });

  const [inviteAdmin, { isLoading: isInviting }] = useInviteAdminMutation();

  const adminFormSubmit = async (data: AdminSchemaType) => {
    try {
      const res = await inviteAdmin({
        name: data.adminName,
        email: data.emailAddress,
        customMessage: data.customMessage,
        password: data.password,
      }).unwrap();
      toast.success(res.message || "Admin added successfully!");
      adminForm.reset();
      setIsDialogOpen(false);
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to invite admin");
    }
  };

  const [deleteUser] = useDeleteUserMutation();

  const handleRemoveAdmin = async (id: string) => {
    try {
      const res = await deleteUser(id).unwrap();
      toast.success(res.message || "Removed admin successfully!");
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to remove admin");
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <HeaderTitle
          title="Admin List"
          alignment="left"
          titleColor="primary"
          titleSize="md"
          titleClassName="font-semibold tracking-tight"
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-card hover:bg-primary border text-foreground px-5 py-5 flex items-center gap-2 transition-colors duration-200">
              <Icons.FiPlus className="w-5 h-5" />
              Add Admin
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto bg-card">
            <form onSubmit={adminForm.handleSubmit(adminFormSubmit)}>
              <DialogHeader>
                <DialogTitle className="flex items-center ">
                  <Image
                    src={WEBSITE_DETAILS.SITE_LOGO}
                    alt="site_logo"
                    width={100}
                    height={100}
                    draggable={false}
                    className=" overflow-hidden"
                  />
                  <div className="flex flex-col justify-center leading-none">
                    <span className="text-sm font-semibold text-foreground tracking-wide">
                      {WEBSITE_DETAILS.SITE_ONLY_NAME}
                    </span>
                    <span className="text-[0.73rem] font-medium text-muted-foreground mt-0.5">
                      {WEBSITE_DETAILS.SITE_DESCRIPTION}
                    </span>
                  </div>
                </DialogTitle>
                <DialogDescription className=" text-lg font-medium text-foreground">
                  Add new admin
                </DialogDescription>
                <DialogDescription className="pb-8 text-xs font-normal text-foreground">
                  Invite up to 5 team members to join your plan. Once they
                  accept your invitation, they&apos;ll get access to modify
                  Solicitation&apos;s under your subscription.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                {/* Admin Name */}
                <div className="grid gap-2">
                  <Label>Admin Name</Label>
                  <Input
                    {...adminForm.register("adminName")}
                    placeholder="Write name of the admin"
                    className="border-muted-foreground"
                  />
                  {adminForm.formState.errors.adminName && (
                    <p className="text-xs text-destructive">
                      {adminForm.formState.errors.adminName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label>Email Address</Label>
                  <Input
                    {...adminForm.register("emailAddress")}
                    placeholder="Write email of the admin"
                    className="border-muted-foreground"
                  />
                  {adminForm.formState.errors.emailAddress && (
                    <p className="text-xs text-destructive">
                      {adminForm.formState.errors.emailAddress.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="grid gap-2">
                  <Label>Custom Message</Label>
                  <Input
                    {...adminForm.register("customMessage")}
                    placeholder="Optional message"
                    className="border-muted-foreground"
                  />
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label>Password</Label>
                  <Input
                    {...adminForm.register("password")}
                    type="password"
                    placeholder="Enter password"
                    className="border-muted-foreground"
                  />
                  {adminForm.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {adminForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-6 gap-3">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="border hover:bg-card text-foreground!"
                  >
                    Cancel
                  </Button>
                </DialogClose>

                <Button
                  type="submit"
                  disabled={isInviting}
                  className="border hover:bg-primary bg-card text-foreground "
                >
                  {isInviting ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ================= TABLE ================= */}
      <Card className="rounded-xl border overflow-hidden py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-primary">
              <TableRow className="bg-primary-dark!">
                {["Name", "Email", "Role", "Status", "Action"].map((h) => (
                  <TableHead
                    key={h}
                    className="text-center text-foreground font-semibold"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <motion.tbody
              className="[&_tr:last-child]:border-0"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } },
              }}
              initial="hidden"
              animate="show"
            >
              {isLoading &&
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow
                    key={idx}
                    className="hover:bg-muted/10 border-b bg-primary text-center"
                  >
                    <TableCell>
                      <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40 mx-auto bg-white/10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16 mx-auto bg-white/10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 mx-auto bg-white/10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24 mx-auto bg-white/10" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && adminList.length > 0 &&
                adminList.map((admin) => (
                  <motion.tr
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                    }}
                    key={admin.id}
                    className="hover:bg-muted/10 data-[state=selected]:bg-muted border-b transition-colors text-center bg-primary text-foreground!"
                  >
                    <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{formatStatusText(admin.role)}</TableCell>
                    <TableCell>{formatStatusText(admin.status)}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="border border-destructive bg-primary hover:bg-destructive-soft text-destructive hover:text-foreground"
                          >
                            Remove
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="max-w-sm rounded-xl border border-white/10 border-t-red-500 bg-black/90 backdrop-blur text-white">
                          <AlertDialogHeader className="flex flex-col items-center text-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                              <Icons.PiWarningCircle className="h-8 w-8 text-red-500" />
                            </div>

                            <AlertDialogTitle className="text-center text-xl font-semibold">
                              Are you sure you want to remove this admin?
                            </AlertDialogTitle>
                          </AlertDialogHeader>

                          <AlertDialogFooter className="p-0 mt-4">
                            <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-3">
                              <AlertDialogAction
                                onClick={() => handleRemoveAdmin(admin.id)}
                                className="w-full h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                              >
                                Remove
                              </AlertDialogAction>

                              <AlertDialogCancel className="w-full h-10 rounded-lg border border-white/30 text-white! bg-transparent hover:bg-white/10 m-0 mt-0">
                                Cancel
                              </AlertDialogCancel>
                            </div>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </motion.tr>
                ))}
              {!isLoading && adminList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground bg-primary">
                    No admins found.
                  </TableCell>
                </TableRow>
              )}
            </motion.tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
