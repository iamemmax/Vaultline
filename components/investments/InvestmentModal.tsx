"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { PinInput } from "@/components/auth/PinInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMe } from "@/hooks/useAuth";
import { useCreateInvestment } from "@/hooks/useData";
import { formatCurrency } from "@/lib/utils/format";
import {
  createInvestmentSchema,
  type CreateInvestmentInput,
} from "@/schemas/investment.schema";
import { ApiError, type InvestmentPackage } from "@/types";

interface Props {
  pkg: InvestmentPackage | null;
  onClose: () => void;
}

export function InvestmentModal({ pkg, onClose }: Props) {
  const me = useMe();
  const create = useCreateInvestment();
  const balance = me.data?.balance ?? 0;

  const form = useForm<CreateInvestmentInput>({
    resolver: zodResolver(createInvestmentSchema),
    defaultValues: {
      packageId: pkg?.id ?? "",
      amount: undefined as unknown as number,
      acceptTerms: undefined as unknown as true,
      pin: "",
    },
  });

  useEffect(() => {
    if (pkg) {
      form.reset({
        packageId: pkg.id,
        amount: undefined as unknown as number,
        acceptTerms: undefined as unknown as true,
        pin: "",
      });
    }
  }, [pkg, form]);

  const amount = form.watch("amount");
  const projectedReturn =
    pkg && typeof amount === "number" ? amount * (pkg.roiPercent / 100) : 0;
  const totalAtMaturity = (typeof amount === "number" ? amount : 0) + projectedReturn;
  const insufficient = typeof amount === "number" && amount > balance;
  const outOfRange =
    pkg && typeof amount === "number" && (amount < pkg.minAmount || amount > pkg.maxAmount);

  const onSubmit = (values: CreateInvestmentInput) => {
    create.mutate(values, {
      onSuccess: () => onClose(),
      onError: (err) => {
        if (err instanceof ApiError && err.fieldErrors) {
          for (const [field, message] of Object.entries(err.fieldErrors)) {
            form.setError(field as keyof CreateInvestmentInput, { message });
          }
        }
      },
    });
  };

  const generalError =
    create.error instanceof ApiError && !create.error.fieldErrors
      ? create.error.message
      : null;

  return (
    <Dialog open={!!pkg} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {pkg ? (
          <>
            <DialogHeader>
              <DialogTitle>Invest in {pkg.name}</DialogTitle>
              <DialogDescription>
                Lock for {pkg.durationMonths} months · {pkg.roiPercent}% ROI at maturity
              </DialogDescription>
            </DialogHeader>

            {generalError ? (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            ) : null}

            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Amount{" "}
                        <span className="text-xs text-muted-foreground">
                          ({formatCurrency(pkg.minAmount)} – {formatCurrency(pkg.maxAmount)})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            inputMode="decimal"
                            placeholder="0.00"
                            className="pl-7 tabular-nums"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === "" ? undefined : Number(v));
                            }}
                          />
                        </div>
                      </FormControl>
                      {insufficient ? (
                        <p className="text-xs text-destructive">Exceeds available balance ({formatCurrency(balance)})</p>
                      ) : null}
                      {outOfRange ? (
                        <p className="text-xs text-warning">
                          Outside the package range
                        </p>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ROI preview */}
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Projected return</p>
                      <p className="font-semibold tabular-nums text-success">
                        +{formatCurrency(projectedReturn)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total at maturity</p>
                      <p className="font-semibold tabular-nums">
                        {formatCurrency(totalAtMaturity)}
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="acceptInvestTerms"
                          checked={field.value === true}
                          onCheckedChange={(c) => field.onChange(c === true ? true : undefined)}
                        />
                        <Label
                          htmlFor="acceptInvestTerms"
                          className="text-sm font-normal leading-relaxed text-muted-foreground"
                        >
                          I understand my funds are locked for{" "}
                          <strong className="text-foreground">{pkg.durationMonths} months</strong>{" "}
                          and cannot be withdrawn early.
                        </Label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction PIN</FormLabel>
                      <FormControl>
                        <PinInput
                          value={field.value}
                          onChange={field.onChange}
                          invalid={!!form.formState.errors.pin}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={create.isPending}
                    disabled={insufficient}
                  >
                    Confirm investment
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
