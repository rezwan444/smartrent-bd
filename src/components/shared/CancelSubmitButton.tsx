import CustomButton from "@/components/shared/CustomButton";

const CancelSubmitButton = ({
  handleCancel,
  btn1Text,
  btn2Text,
  isLoading = false,
  disabled = false,
}: {
  handleCancel: () => void;
  btn1Text?: string;
  btn2Text?: string;
  isLoading?: boolean;
  disabled?: boolean;
}) => {
  return (
    <div>
      <div className="flex gap-4 items-center justify-end">
        <CustomButton
          className="md:px-10 border bg-primary-dark text-foreground hover:cursor-pointer  transition-colors duration-200 shadow-none"
          //   variant="outline"
          btnText="Cancel"
          type="button"
          onClick={handleCancel}
          disabled={isLoading || disabled}
        />

        <CustomButton
          type="submit"
          btnText={`${btn1Text ? btn1Text : btn2Text ? btn2Text : "Confirm"}`}
          className="px-10 bg-destructive text-foreground hover:bg-destructive-soft transition-colors duration-200 focus-visible:ring-0 hover:cursor-pointer "
          loading={isLoading}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default CancelSubmitButton;
