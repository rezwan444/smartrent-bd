"use client";
import CancelSubmitButton from "@/components/shared/CancelSubmitButton";
import HeaderTitle from "@/components/shared/HeaderTitle";
import { useGetAllTiersQuery, useCreateTierPlanMutation, useUpdateTierPlanMutation } from "@/redux/api/tier/tierApi";
import { ITier } from "@/types/global";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { defaultPlanValues, PlanForm, planSchema, PlanType } from "./schema";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

const SubscriptionPlan = () => {
  const [activePlan, setActivePlan] = useState<PlanType>("elite");

  // Fetch data
  const { data: tiersData, isLoading, refetch } = useGetAllTiersQuery();
  const [createPlan, { isLoading: isCreating }] = useCreateTierPlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateTierPlanMutation();

  // Find the current tier data if it exists
  const activePlanData = useMemo(() => {
    const allTiers = tiersData?.data || [];
    return allTiers.find((t) => t.tier.toLowerCase() === activePlan);
  }, [tiersData?.data, activePlan]);

  // Helper to get formatted benefits array
  const getFormattedBenefits = useCallback((data: typeof activePlanData) => {
    if (!data) return [];
    const benefitsArray = Object.entries(data.benefits || {})
      .filter(([, value]) => value !== null && value !== undefined && (value as string).trim() !== "")
      .map(([key, value]) => ({
        key,
        value: value as string,
      }));
    if (benefitsArray.length === 0) {
      benefitsArray.push({ key: "benefit1", value: "" });
    }
    return benefitsArray;
  }, []);

  const defaultOrActiveValues = useMemo(() => {
    if (activePlanData) {
      return {
        name: activePlanData.name,
        description: activePlanData.description,
        price: activePlanData.price?.toString() || "0",
        currency: activePlanData.currency || "USD",
        benefits: getFormattedBenefits(activePlanData),
      };
    }
    return defaultPlanValues;
  }, [activePlanData, getFormattedBenefits]);

  const planForm = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: defaultPlanValues,
    values: defaultOrActiveValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: planForm.control,
    name: "benefits",
  });

  const handleSavePlan = async (data: PlanForm) => {
    try {
      // Transform benefits array back to object
      const benefitsObj: Record<string, string> = {};
      
      // First, set all existing keys to empty string to clear them in the backend (if backend merges)
      if (activePlanData && activePlanData.benefits) {
        Object.keys(activePlanData.benefits).forEach((key) => {
          benefitsObj[key] = "";
        });
      }

      // Then populate with the new values
      data.benefits.forEach((b, i) => {
        if (b.value.trim()) {
          benefitsObj[`facilities0${i + 1}`] = b.value.trim();
        }
      });

      const payload = {
        tier: activePlan.toUpperCase() as ITier,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        currency: data.currency,
        benefits: benefitsObj,
      };

      if (activePlanData) {
        // Update
        const res = await updatePlan({ id: activePlanData.id, data: payload }).unwrap();
        if (res.success) {
          toast.success("Plan updated successfully!");
        }
      } else {
        // Create
        const res = await createPlan(payload).unwrap();
        if (res.success) {
          toast.success("Plan created successfully!");
        }
      }
      refetch();
    } catch (err) {
      const error = err as { data?: { message?: string }, message?: string };
      toast.error(error?.data?.message || error?.message || "Something went wrong!");
    }
  };

  const handleCancelPlan = () => {
    planForm.reset();
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <div className="h-fit">
        <HeaderTitle
          title="Subscription plan"
          alignment="left"
          titleColor="white"
          titleSize="sm"
          titleClassName="font-normal"
        />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="rounded-xl p-6 space-y-4 bg-primary-dark">
        {/* Tabs */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="grid grid-cols-4 border-b border-primary-dark">
            {(["elite", "premium", "standard", "viewers"] as PlanType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActivePlan(type)}
                className={`py-3 text-center min-w-0 whitespace-nowrap transition-colors border-b-4 ${
                  activePlan === type
                    ? "border-soft-white font-medium text-primary-2"
                    : "border-transparent text-muted-foreground"
                } md:text-2xl`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-2"></div>
          </div>
        ) : (
          <form onSubmit={planForm.handleSubmit(handleSavePlan)} className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <motion.div variants={itemVariants}>
                <label className="text-sm font-semibold text-primary-2">Plan Name</label>
                <input
                  {...planForm.register("name")}
                  className="w-full rounded-md bg-card px-3 py-3 border border-primary-dark focus:border-destructive focus:outline-none focus:ring-0 transition-colors duration-200 ease-in-out"
                  placeholder="e.g. Viewers Subscription"
                />
                {planForm.formState.errors.name && (
                  <p className="text-danger text-sm">{planForm.formState.errors.name.message}</p>
                )}
              </motion.div>

              {/* Price */}
              <motion.div variants={itemVariants}>
                <label className="text-sm font-semibold text-primary-2">Plan Price</label>
                <div className="flex w-full">
                  <div className="flex bg-foreground/30 border border-primary-dark items-center justify-center bg-primary-2 px-4 text-text-white rounded-l-md">
                    $
                  </div>
                  <input
                    {...planForm.register("price")}
                    className="w-full bg-card border border-primary-dark border-l-0 focus:border-l-0 px-4 py-3 rounded-r-md focus:border-destructive focus:outline-none focus:ring-0 transition-colors duration-200 ease-in-out"
                    placeholder="9.99"
                  />
                </div>
                {planForm.formState.errors.price && (
                  <p className="mt-1 text-sm text-danger">{planForm.formState.errors.price.message}</p>
                )}
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants} className="md:col-span-2">
                <label className="text-sm font-semibold text-primary-2">Description</label>
                <input
                  {...planForm.register("description")}
                  className="w-full rounded-md bg-card px-3 py-3 border border-primary-dark focus:border-destructive focus:outline-none focus:ring-0 transition-colors duration-200 ease-in-out"
                  placeholder="e.g. All access or free limited viewer account"
                />
                {planForm.formState.errors.description && (
                  <p className="text-danger text-sm">{planForm.formState.errors.description.message}</p>
                )}
              </motion.div>

              {/* Benefits */}
              <motion.div variants={itemVariants} className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-primary-2">Plan Benefits</label>
                  <button
                    type="button"
                    onClick={() => append({ key: `benefit${fields.length + 1}`, value: "" })}
                    className="text-xs bg-primary-2 text-white px-3 py-1.5 rounded-md hover:bg-primary-2/80 transition-colors flex items-center gap-1"
                  >
                    + Add Benefit
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field, i) => (
                    <div key={field.id} className="group">
                      <div className="relative">
                        <input
                          {...planForm.register(`benefits.${i}.value`)}
                          placeholder={`e.g. Benefit ${i + 1}`}
                          className="w-full rounded-md bg-card px-3 py-3 border border-primary-dark focus:border-destructive focus:outline-none focus:ring-0 transition-colors duration-200 ease-in-out pr-10"
                        />
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      {planForm.formState.errors.benefits?.[i]?.value && (
                        <p className="text-danger text-sm mt-1">{planForm.formState.errors.benefits[i]?.value?.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="flex justify-end gap-3 mt-6">
              <CancelSubmitButton
                handleCancel={handleCancelPlan}
                btn2Text={isSubmitting ? "Saving..." : activePlanData ? "Update Plan" : "Create Plan"}
              />
            </motion.div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default SubscriptionPlan;
