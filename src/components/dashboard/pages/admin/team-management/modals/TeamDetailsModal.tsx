import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IAllStatusEnum, ITeam } from "@/types/global";
import { cn } from "@/utils";
import { formatStatusText } from "@/utils/formatStatusText";
import Image from "next/image";

interface Props {
  team: ITeam;
  children: React.ReactNode;
}

const TeamDetailsModal = ({ team, children }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain bg-card text-foreground">
        {/* HEADER */}
        <DialogHeader className="items-center text-center space-y-3">
          <div className="h-20 w-20 rounded-full bg-primary overflow-hidden">
            <div className="relative h-full w-full">
              <Image
                src={team.logo_url ?? "/team.png"}
                alt="team_logo"
                fill
                className="object-contain"
                draggable={false}
                sizes="80px"
              />
            </div>
          </div>

          <DialogTitle className="wrap-break-word text-lg font-semibold">
            {team.mascot}
          </DialogTitle>
        </DialogHeader>

        {/* DETAILS */}
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <Detail label="Tier" value={team.tiaraName} />
          <Detail label="Region" value={team.region} />
          <Detail label="Division" value={team.division?.name ?? "-"} />
          <Detail label="City" value={team.city ?? "-"} />
          <Detail
            label="Status"
            value={team.status}
            valueClass={cn(
              "font-medium w-fit mt-1",
              team.status === IAllStatusEnum.ACTIVE
                ? "text-success bg-primary-dark px-2 py-0.5 rounded-md"
                : "text-destructive bg-primary-dark px-2 py-0.5 rounded-md",
            )}
          />
          <Detail
            label="Description"
            value={`${team.description}`}
            valueClass="text-foreground/70 font-normal"
          />

          <div className="col-span-2 rounded-xl border border-border/60 bg-primary-dark/50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Owner profile</p>
                <p className="wrap-break-word text-sm font-semibold text-foreground">
                  {team.owner
                    ? `${team.owner.firstName} ${team.owner.lastName}`.trim()
                    : "Not assigned"}
                </p>
              </div>

              {team.owner?.profilePictureUrl ? (
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-border/60 bg-card">
                  <Image
                    src={team.owner.profilePictureUrl}
                    alt="owner_profile"
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-card text-xs font-semibold text-muted-foreground">
                  {team.owner
                    ? `${team.owner.firstName?.[0] ?? ""}${team.owner.lastName?.[0] ?? ""}`.toUpperCase()
                    : "--"}
                </div>
              )}
            </div>

            {team.owner ? (
              <div className="space-y-3 text-xs">
                <InfoItem
                  label="Email"
                  value={team.owner.email}
                  valueClass="truncate"
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <InfoItem
                    label="Phone"
                    value={team.owner.phone ?? "Not provided"}
                  />
                  <InfoItem
                    label="Role"
                    value={formatStatusText(team.owner.role)}
                  />
                  <InfoItem
                    label="Login method"
                    value={formatStatusText(team.owner.loggedInUsing)}
                  />
                  <div className="min-w-0 rounded-lg border border-border/40 bg-card px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Account status
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "w-fit rounded-md px-2 py-0.5 text-sm font-medium",
                          team.owner.status === IAllStatusEnum.ACTIVE
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {formatStatusText(team.owner.status)}
                      </span>
                      <span
                        className={cn(
                          "w-fit rounded-md px-2 py-0.5 text-sm font-medium",
                          team.owner.verified
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {team.owner.verified ? "Verified" : "Not verified"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No owner information available for this team.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamDetailsModal;

/* helper */
const Detail = ({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) => (
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`wrap-break-word font-medium ${valueClass ?? ""}`}>
      {formatStatusText(value)}
    </p>
  </div>
);

const InfoItem = ({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) => (
  <div className="min-w-0 rounded-lg border border-border/40 bg-card px-3 py-2">
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p
      className={cn(
        "mt-1 wrap-break-word text-sm font-medium text-foreground",
        valueClass,
      )}
    >
      {value}
    </p>
  </div>
);
