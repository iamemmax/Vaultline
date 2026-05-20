"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Check, MailCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { useVerifyEmail } from "@/hooks/useAuth";
import { ApiError } from "@/types";
import {
  verifyEmailSchema,
  type VerifyEmailInput,
} from "@/schemas/auth.schema";

const RESEND_COOLDOWN = 30; // seconds

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageInner />
    </Suspense>
  );
}

function VerifyEmailPageInner() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const form = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email, code: "" },
  });
  const verify = useVerifyEmail();

  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) {
    return (
      <AuthCard
        title="Missing email"
        description="We need to know which account you're verifying."
        footer={
          <Link href="/register" className="font-medium text-primary hover:underline">
            Back to register
          </Link>
        }
      >
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>No email in link</AlertTitle>
          <AlertDescription>
            Try registering again or use the link from your confirmation email.
          </AlertDescription>
        </Alert>
      </AuthCard>
    );
  }

  const generalError =
    verify.error instanceof ApiError ? verify.error.message : null;

  const submit = (values: VerifyEmailInput) => verify.mutate(values);

  const onResend = () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN);
    toast.success(`Code resent to ${email}`);
  };

  return (
    <div className="space-y-8">
      <Stepper />

      <AuthCard
        title="Verify your email"
        description={`We sent a 6-digit code to ${maskEmail(email)}. Enter it below to activate your account.`}
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
            onSubmit={form.handleSubmit(submit)}
            noValidate
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Verification code</FormLabel>
                  <FormControl>
                    <OtpInput
                      value={field.value}
                      onChange={(v) => {
                        field.onChange(v);
                        if (v.length === 6) form.handleSubmit(submit)();
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
              to continue. Real codes are logged to the browser console.
            </div>

            <div className="flex items-center justify-between gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Link>
              <Button type="submit" loading={verify.isPending} size="lg">
                Verify email
              </Button>
            </div>
          </form>
        </Form>
      </AuthCard>

      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0}
          className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </p>
    </div>
  );
}

function Stepper() {
  return (
    <ol className="flex items-center gap-3 text-xs">
      <Step done label="Create account" />
      <span className="h-px flex-1 bg-border" />
      <Step current label="Verify email" icon={MailCheck} />
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
  icon?: typeof MailCheck;
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
        className={`font-medium ${current ? "text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
    </li>
  );
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}${"*".repeat(Math.max(3, local.length - 2))}@${domain}`;
}
