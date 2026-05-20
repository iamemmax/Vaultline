"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PinInput } from "@/components/auth/PinInput";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/hooks/useAuth";
import { useCreateTransfer } from "@/hooks/useData";
import { formatCurrency } from "@/lib/utils/format";
import {
  internalTransferSchema,
  type InternalTransferInput,
} from "@/schemas/transfer.schema";
import { ApiError, type Transaction } from "@/types";

interface ReceiptData {
  transaction: Transaction;
  recipient: { name: string; accountNumber: string };
}

export default function TransferPage() {
  const me = useMe();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const form = useForm<InternalTransferInput>({
    resolver: zodResolver(internalTransferSchema),
    defaultValues: { recipient: "", amount: undefined as unknown as number, note: "", pin: "" },
  });

  const transfer = useCreateTransfer();
  const amount = form.watch("amount");
  const balance = me.data?.balance ?? 0;
  const insufficient = typeof amount === "number" && amount > balance;

  const onSubmit = (values: InternalTransferInput) => {
    transfer.mutate(values, {
      onSuccess: (data) => {
        setReceipt(data);
        form.reset({ recipient: "", amount: undefined as unknown as number, note: "", pin: "" });
      },
      onError: (error) => {
        if (error instanceof ApiError && error.fieldErrors) {
          for (const [field, message] of Object.entries(error.fieldErrors)) {
            form.setError(field as keyof InternalTransferInput, { message });
          }
        }
      },
    });
  };

  const generalError =
    transfer.error instanceof ApiError && !transfer.error.fieldErrors
      ? transfer.error.message
      : null;

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="Move money"
        title="Transfer"
        description="Send funds to another Vaultline account instantly and free of charge."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>New transfer</CardTitle>
          <CardDescription>
            Available balance:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {formatCurrency(balance)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generalError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          ) : null}

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <FormControl>
                      <Input placeholder="Account number or email" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (USD)</FormLabel>
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
                      <p className="text-xs text-destructive">Amount exceeds available balance</p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note <span className="text-muted-foreground">(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Add a short message…" {...field} />
                    </FormControl>
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={transfer.isPending}
                disabled={insufficient}
              >
                Send transfer
                <ArrowRight />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

        {/* Side panel — guidelines & limits */}
        <aside className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How transfers work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <Bullet>Transfers between Vaultline accounts settle instantly, 24/7.</Bullet>
              <Bullet>There are no fees for internal transfers.</Bullet>
              <Bullet>Every transfer requires your 4-digit transaction PIN.</Bullet>
              <Bullet>Mistyped a recipient? Contact support within 24 hours.</Bullet>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily limit</CardTitle>
              <CardDescription>Resets at 00:00 UTC.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Used today</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(0)} / {formatCurrency(50_000)}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full w-0 rounded-full bg-primary" />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent>
          {receipt ? <Receipt data={receipt} onClose={() => setReceipt(null)} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
      <span>{children}</span>
    </div>
  );
}

function Receipt({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  const copy = () => {
    navigator.clipboard.writeText(data.transaction.reference);
    toast.success("Reference copied");
  };
  return (
    <>
      <DialogHeader>
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <DialogTitle className="text-center">Transfer sent</DialogTitle>
        <DialogDescription className="text-center">
          {formatCurrency(Math.abs(data.transaction.amount))} to {data.recipient.name}
        </DialogDescription>
      </DialogHeader>
      <dl className="space-y-3 text-sm">
        <Row label="Recipient" value={data.recipient.name} />
        <Row label="Account" value={data.recipient.accountNumber} mono />
        <Row
          label="Reference"
          value={data.transaction.reference}
          mono
          action={
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copy}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          }
        />
        <Row label="Date" value={new Date(data.transaction.createdAt).toLocaleString()} />
      </dl>
      <DialogFooter>
        <Button onClick={onClose} className="w-full">Done</Button>
      </DialogFooter>
    </>
  );
}

function Row({ label, value, mono, action }: { label: string; value: string; mono?: boolean; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-none">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`flex items-center gap-1 ${mono ? "font-mono tabular-nums" : "font-medium"}`}>
        <span>{value}</span>
        {action}
      </dd>
    </div>
  );
}
