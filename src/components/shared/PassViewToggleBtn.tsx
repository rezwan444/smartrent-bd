import { Icons } from "@/utils/icons";

type PasswordField = "oldPassword" | "newPassword";

interface PassViewToggleBtnProps {
  field: PasswordField;
  showPassword: boolean;
  setShowPassword: React.Dispatch<
    React.SetStateAction<{
      oldPassword: boolean;
      newPassword: boolean;
    }>
  >;
}

const PassViewToggleBtn = ({
  field,
  showPassword,
  setShowPassword,
}: PassViewToggleBtnProps) => {
  return (
    <button
      type="button"
      onClick={() =>
        setShowPassword((prev) => ({
          ...prev,
          [field]: !prev[field],
        }))
      }
      className="absolute right-3 top-12 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:cursor-pointer"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <Icons.Eye className="h-5 w-5 text-foreground" />
      ) : (
        <Icons.EyeOff className="h-5 w-5 text-foreground" />
      )}
    </button>
  );
};

export default PassViewToggleBtn;

// how to use this button

/* <PassViewToggleBtn
  showPassword={showPassword}
  setShowPassword={setShowPassword}
/>; */
