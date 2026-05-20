"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PinInput } from "@/components/auth/PinInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { useSendCrypto } from "@/hooks/useData";
import { formatCrypto } from "@/lib/utils/format";
import {
  cryptoSendSchema,
  type CryptoSendInput,
} from "@/schemas/crypto.schema";
import { ApiError, type CryptoWallet } from "@/types";

interface Props {
  wallet: CryptoWallet | null;
  onClose: () => void;
}

export function SendCryptoModal({ wallet, onClose }: Props) {
  const send = useSendCrypto();
  const form = useForm<CryptoSendInput>({
    resolver: zodResolver(cryptoSendSchema),
    defaultValues: {
      asset: wallet?.asset ?? "BTC",
      address: "",
      network: wallet?.network ?? "",
      amount: undefined as unknown as number,
      pin: "",
    },
  });

  useEffect(() => {
    if (wallet) {
      form.reset({
        asset: wallet.asset,
        address: "",
        network: wallet.network,
        amount: undefined as unknown as number,
        pin: "",
      });
    }
  }, [wallet, form]);

  const amount = form.watch("amount");
  const insufficient =
    wallet && typeof amount === "number" && amount > wallet.balance;

  const onSubmit = (values: CryptoSendInput) => {
    send.mutate(values, {
      onSuccess: () => {
        toast.success(`Sent ${values.amount} ${values.asset}`);
        onClose();
      },
      onError: (err) => {
        if (err instanceof ApiError && err.fieldErrors) {
          for (const [field, message] of Object.entries(err.fieldErrors)) {
            form.setError(field as keyof CryptoSendInput, { message });
          }
        }
      },
    });
  };

  const generalError =
    send.error instanceof ApiError && !send.error.fieldErrors
      ? send.error.message
      : null;

  return (
    <Dialog open={!!wallet} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {wallet ? (
          <>
            <DialogHeader>
              <DialogTitle>Send {wallet.asset}</DialogTitle>
              <DialogDescription>
                Available: <span className="font-medium text-foreground">{formatCrypto(wallet.balance, wallet.asset)}</span> · Network: {wallet.network}
              </DialogDescription>
            </DialogHeader>

            <Alert variant="warning">
              <AlertTriangle />
              <AlertTitle>Double-check the address</AlertTitle>
              <AlertDescription>
                On-chain transactions are irreversible. Only send {wallet.asset} via {wallet.network}.
              </AlertDescription>
            </Alert>

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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`${wallet.asset} address on ${wallet.network}`}
                          autoComplete="off"
                          className="font-mono"
                          {...field}
                        />
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
                      <FormLabel>Amount ({wallet.asset})</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="any"
                            inputMode="decimal"
                            placeholder="0.00"
                            className="pr-20 tabular-nums"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === "" ? undefined : Number(v));
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                            onClick={() => form.setValue("amount", wallet.balance)}
                          >
                            Max
                          </Button>
                        </div>
                      </FormControl>
                      {insufficient ? (
                        <p className="text-xs text-destructive">Exceeds wallet balance</p>
                      ) : null}
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
                    loading={send.isPending}
                    disabled={!!insufficient}
                  >
                    Confirm send
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
