"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Suspense, useState } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useLogin } from "@/hooks/useAuth";
import { ApiError } from "@/types";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const login = useLogin();

  const onSubmit = (values: LoginInput) => {
    login.mutate(values, {
      onError: (error) => {
        if (error instanceof ApiError && error.fieldErrors) {
          for (const [field, message] of Object.entries(error.fieldErrors)) {
            form.setError(field as keyof LoginInput, { message });
          }
        }
      },
    });
  };

  const errorMessage =
    login.error instanceof ApiError && !login.error.fieldErrors
      ? login.error.message
      : null;

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your Vaultline account."
      footer={
        <span className="text-muted-foreground">
          New to Vaultline?{" "}
          <Link
            href={`/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </span>
      }
    >
      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Sign-in failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Your password"
                      className="pr-9"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={form.watch("rememberMe") ?? false}
              onCheckedChange={(c) => form.setValue("rememberMe", c === true)}
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal text-muted-foreground">
              Remember me on this device
            </Label>
          </div>

          <Button type="submit" className="w-full" loading={login.isPending} size="lg">
            Sign in
          </Button>

          <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <p className="mb-1.5 font-medium uppercase tracking-wider text-foreground/70">
              Demo accounts
            </p>
            <p>
              <span className="text-foreground">demo@vaultline.app</span>
              <span className="mx-1.5 text-muted-foreground/60">·</span>
              <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[0.7rem] text-foreground">
                Password1!
              </code>
            </p>
            <p className="mt-1">
              <span className="text-foreground">admin@vaultline.app</span>
              <span className="mx-1.5 text-muted-foreground/60">·</span>
              <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[0.7rem] text-foreground">
                Admin123!
              </code>
            </p>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
}
