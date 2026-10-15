import { cn } from "@/lib/utils";
import { IAllStatusEnum } from "@/types/global";

type StatusMakerProps = {
  statusName?: IAllStatusEnum;
  customClass?: string;
};

export default function StatusMaker({
  statusName = IAllStatusEnum.UNKNOWN,
  customClass = "",
}: StatusMakerProps) {
  const baseClass =
    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";

  const statusColorClass = (() => {
    switch (statusName) {
      // GREEN
      case IAllStatusEnum.ACTIVE:
      case IAllStatusEnum.SUCCESS:
      case IAllStatusEnum.COMPLETED:
      case IAllStatusEnum.COMPLETED:
        return "bg-green-100 text-green-800";

      // YELLOW
      case IAllStatusEnum.PENDING:
      case IAllStatusEnum.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800";

      // GRAY
      case IAllStatusEnum.INACTIVE:
      case IAllStatusEnum.DISABLED:
        return "bg-gray-100 text-gray-800";

      // AMBER
      case IAllStatusEnum.SCHEDULED:
        return "bg-amber-100 text-amber-800";

      // RED
      case IAllStatusEnum.ERROR:
      case IAllStatusEnum.FAILED:
      case IAllStatusEnum.CANCELLED:
      case IAllStatusEnum.CANCELLED:
        return "bg-red-100 text-red-800";

      // DEFAULT
      default:
        return "bg-blue-100 text-blue-800";
    }
  })();

  return (
    <span className={cn(baseClass, statusColorClass, customClass)}>
      {String(statusName)}
    </span>
  );
}
