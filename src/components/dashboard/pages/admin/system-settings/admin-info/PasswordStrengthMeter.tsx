export const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export const getStrengthMeta = (score: number) => {
  switch (score) {
    case 0:
    case 1:
      return { label: "Very Weak", color: "bg-danger" };
    case 2:
      return { label: "Weak", color: "bg-orange-500" };
    case 3:
      return { label: "Medium", color: "bg-yellow-500" };
    case 4:
      return { label: "Strong", color: "bg-success" };
    case 5:
      return { label: "Very Strong", color: "bg-emerald-600" };
    default:
      return { label: "", color: "" };
  }
};

interface PasswordStrengthMeterProps {
  password: string;
}

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  if (!password) return null;
  const score = getPasswordStrength(password);
  const { label, color } = getStrengthMeta(score);

  return (
    <div className="space-y-1">
      {/* Animated bar */}
      <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>

      {/* Label */}
      {password && (
        <p className="text-xs text-muted-foreground text-center md:text-right transition-opacity duration-300">
          Strength: <span className="font-medium text-foreground">{label}</span>
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
