"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useRegister } from "@/hooks/useAuth";
import { ApiError } from "@/types";
import { registerSchema, type RegisterInput } from "@/schemas/auth.schema";

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      country: "",
      password: "",
      confirmPassword: "",
      acceptTerms: undefined as unknown as true,
    },
  });

  const register = useRegister();

  const password = form.watch("password");

  const onSubmit = (values: RegisterInput) => {
    register.mutate(values, {
      onSuccess: () => {
        toast.success("Account created. Check your email for a code.");
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      },
      onError: (error) => {
        if (error instanceof ApiError && error.fieldErrors) {
          for (const [field, message] of Object.entries(error.fieldErrors)) {
            form.setError(field as keyof RegisterInput, { message });
          }
          // Field-level errors aren't always close to the submit button —
          // surface the first one as a toast so the user can't miss why submission stopped.
          const first = Object.values(error.fieldErrors)[0];
          if (first) toast.error(first);
        } else if (error instanceof ApiError) {
          toast.error(error.message);
        }
      },
    });
  };

  // Fallback redirect: if the mutation succeeds but the onSuccess callback
  // didn't push (e.g. unmounted/Strict-Mode timing edge case), this useEffect
  // covers it. Reads the email from the form's last submitted values.
  useEffect(() => {
    if (register.isSuccess) {
      const email = register.variables?.email;
      if (email) {
        router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    }
  }, [register.isSuccess, register.variables, router]);

  const generalError =
    register.error instanceof ApiError && !register.error.fieldErrors
      ? register.error.message
      : null;

  return (
    <AuthCard
      title="Create your account"
      description="Open a Vaultline account in under a minute."
      footer={
        <span className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
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
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="tel" placeholder="+1 555 0100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input autoComplete="country-name" placeholder="United States" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <PasswordStrengthMeter value={password} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={field.value === true}
                    onCheckedChange={(c) => field.onChange(c === true ? true : undefined)}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm font-normal leading-relaxed text-muted-foreground">
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">terms of service</Link>{" "}
                    and{" "}
                    <Link href="#" className="text-primary hover:underline">privacy policy</Link>.
                  </Label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" loading={register.isPending} size="lg">
            Create account
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
