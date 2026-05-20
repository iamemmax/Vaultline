"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "@/components/auth/AuthCard";
import { OtpInput } from "@/components/auth/OtpInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useVerify2FA } from "@/hooks/useAuth";
import { ApiError } from "@/types";
import {
  twoFactorChallengeSchema,
  type TwoFactorChallengeInput,
} from "@/schemas/auth.schema";

export default function TwoFactorPage() {
  const form = useForm<TwoFactorChallengeInput>({
    resolver: zodResolver(twoFactorChallengeSchema),
    defaultValues: { code: "" },
  });
  const verify = useVerify2FA();
  const [hasChallenge, setHasChallenge] = useState(true);

  // If the user lands here directly without going through /login first,
  // there's no challenge token in sessionStorage — send them back.
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasChallenge(!!sessionStorage.getItem("ft.2fa.challenge"));
    }
  }, []);

  const generalError =
    verify.error instanceof ApiError ? verify.error.message : null;

  if (!hasChallenge) {
    return (
      <AuthCard
        title="Session expired"
        description="Your sign-in session has expired. Please start over."
        footer={
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign-in
          </Link>
        }
      >
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>No active challenge</AlertTitle>
          <AlertDescription>
            We couldn't find a valid 2FA challenge. Sign in again to receive a new code.
          </AlertDescription>
        </Alert>
      </AuthCard>
    );
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <Stepper />

      <AuthCard
        title="Verify it's you"
        description="Enter the 6-digit code from your authenticator app to finish signing in."
      >
        {generalError ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Verification failed</AlertTitle>
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        ) : null}

        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((v) => verify.mutate(v))}
            noValidate
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Authentication code</FormLabel>
                  <FormControl>
                    <OtpInput
                      value={field.value}
                      onChange={(v) => {
                        field.onChange(v);
                        if (v.length === 6) form.handleSubmit((vals) => verify.mutate(vals))();
                      }}
                      autoFocus
                      invalid={!!form.formState.errors.code}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">Demo</span>: enter{" "}
              <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[0.7rem] text-foreground">
                123456
              </code>{" "}
              to continue.
            </div>

            <div className="flex items-center justify-between gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign-in
              </Link>
              <Button type="submit" loading={verify.isPending} size="lg">
                Verify
              </Button>
            </div>
          </form>
        </Form>
      </AuthCard>

      <p className="text-center text-xs text-muted-foreground">
        Lost access to your authenticator?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Use a recovery code
        </Link>
      </p>
    </div>
  );
}

function Stepper() {
  return (
    <ol className="flex items-center gap-3 text-xs">
      <Step done label="Sign in" />
      <span className="h-px flex-1 bg-border" />
      <Step current label="Verify" icon={ShieldCheck} />
    </ol>
  );
}

function Step({
  label,
  done,
  current,
  icon: Icon,
}: {
  label: string;
  done?: boolean;
  current?: boolean;
  icon?: typeof ShieldCheck;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`grid h-6 w-6 place-items-center rounded-full text-[0.65rem] font-semibold ${
          done
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : current
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="h-3 w-3" /> : Icon ? <Icon className="h-3 w-3" /> : null}
      </span>
      <span
        className={`font-medium ${
          current ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </li>
  );
}
