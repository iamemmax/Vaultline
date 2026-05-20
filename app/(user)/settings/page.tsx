"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, ArrowRight, Bell, Check, Copy, KeyRound, Loader2, LogOut, MonitorSmartphone, ScanLine, Shield, ShieldCheck, UserRound } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { OtpInput } from "@/components/auth/OtpInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PinInput } from "@/components/auth/PinInput";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";
import {
  use2FAConfirm,
  use2FADisable,
  use2FASetup,
  useChangePassword,
  useMe,
  useSetPin,
} from "@/hooks/useAuth";
import { useRevokeSession, useSessions, useUpdateProfile } from "@/hooks/useData";
import {
  changePasswordSchema,
  transactionPinSchema,
  type ChangePasswordInput,
  type TransactionPinInput,
} from "@/schemas/auth.schema";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/schemas/profile.schema";
import { ApiError } from "@/types";

const SECTIONS = [
  { value: "profile", label: "Profile", icon: UserRound },
  { value: "security", label: "Security", icon: ShieldCheck },
  { value: "sessions", label: "Devices & sessions", icon: MonitorSmartphone },
  { value: "notifications", label: "Notifications", icon: Bell },
] as const;

type SectionValue = (typeof SECTIONS)[number]["value"];

const SECTION_INTRO: Record<SectionValue, { title: string; description: string }> = {
  profile: {
    title: "Profile",
    description: "How you appear inside Vaultline and to anyone you transact with.",
  },
  security: {
    title: "Security",
    description: "Password, two-factor authentication, and the PIN used for every money move.",
  },
  sessions: {
    title: "Devices & sessions",
    description: "Active sign-ins on your account. Revoke any you don't recognise.",
  },
  notifications: {
    title: "Notifications",
    description: "Decide how you'd like to be alerted about account activity.",
  },
};

export default function SettingsPage() {
  const [active, setActive] = useState<SectionValue>("profile");

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile, security, devices, and notification preferences."
      />

      <ProfileSummary />

      {/* Mobile: horizontal tabs */}
      <div className="lg:hidden">
        <Tabs value={active} onValueChange={(v) => setActive(v as SectionValue)}>
          <TabsList className="grid w-full grid-cols-4">
            {SECTIONS.map((s) => (
              <TabsTrigger key={s.value} value={s.value}>
                {s.label.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={active} className="space-y-4 pt-5">
            <SectionIntro section={active} />
            {renderPanel(active)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: minimalist side-nav + panel */}
      <div className="hidden gap-10 lg:grid lg:grid-cols-[220px_1fr]">
        <nav className="relative">
          <div className="sticky top-0 space-y-0.5">
            {SECTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActive(value)}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  active === value
                    ? "bg-primary/10 font-semibold text-primary"
                    : "font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {active === value ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-1 left-0 w-0.5 rounded-r-full bg-primary"
                  />
                ) : null}
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="min-w-0 space-y-6">
          <SectionIntro section={active} />
          {renderPanel(active)}
        </div>
      </div>
    </div>
  );
}

function renderPanel(value: SectionValue) {
  switch (value) {
    case "profile":
      return <ProfileForm />;
    case "security":
      return (
        <div className="space-y-4">
          <ChangePasswordCard />
          <TwoFactorCard />
          <TransactionPinCard />
        </div>
      );
    case "sessions":
      return <SessionsList />;
    case "notifications":
      return <NotificationsCard />;
  }
}

function SectionIntro({ section }: { section: SectionValue }) {
  const intro = SECTION_INTRO[section];
  return (
    <div className="border-b border-border pb-4">
      <h2 className="text-xl font-semibold tracking-tight">{intro.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{intro.description}</p>
    </div>
  );
}

function ProfileSummary() {
  const me = useMe();

  if (me.isPending || !me.data) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-60" />
        </div>
      </div>
    );
  }

  const initials = me.data.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const memberSince = new Date(me.data.createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
      <Avatar className="h-14 w-14">
        {me.data.avatarUrl ? (
          <AvatarImage src={me.data.avatarUrl} alt={me.data.fullName} />
        ) : null}
        <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold">{me.data.fullName}</p>
        <p className="truncate text-sm text-muted-foreground">{me.data.email}</p>
      </div>
      <dl className="grid grid-cols-3 gap-4 text-xs sm:gap-6 sm:text-right">
        <SummaryStat label="Member since" value={memberSince} />
        <SummaryStat
          label="2FA"
          value={me.data.twoFactorEnabled ? "Enabled" : "Off"}
          tone={me.data.twoFactorEnabled ? "ok" : "warn"}
        />
        <SummaryStat
          label="Transaction PIN"
          value={me.data.hasTransactionPin ? "Set" : "Not set"}
          tone={me.data.hasTransactionPin ? "ok" : "warn"}
        />
      </dl>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="space-y-0.5">
      <dt className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "text-sm font-semibold",
          tone === "ok" && "text-emerald-600 dark:text-emerald-500",
          tone === "warn" && "text-amber-600 dark:text-amber-500",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/* ────────────────────── Profile ────────────────────── */

function ProfileForm() {
  const me = useMe();
  const update = useUpdateProfile();
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: me.data
      ? { fullName: me.data.fullName, phone: me.data.phone ?? "", country: me.data.country ?? "" }
      : { fullName: "", phone: "", country: "" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal information</CardTitle>
        <CardDescription>Update how Vaultline refers to you.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => update.mutate(v, {
              onError: (err) => {
                if (err instanceof ApiError && err.fieldErrors) {
                  for (const [field, message] of Object.entries(err.fieldErrors)) {
                    form.setError(field as keyof UpdateProfileInput, { message });
                  }
                }
              },
            }))}
            noValidate
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input type="tel" {...field} /></FormControl>
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
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" loading={update.isPending}>Save changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/* ────────────────────── Change password ────────────────────── */

function ChangePasswordCard() {
  const change = useChangePassword();
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" /> Change password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => change.mutate(v, {
              onSuccess: () => form.reset(),
              onError: (err) => {
                if (err instanceof ApiError && err.fieldErrors) {
                  for (const [field, message] of Object.entries(err.fieldErrors)) {
                    form.setError(field as keyof ChangePasswordInput, { message });
                  }
                }
              },
            }))}
            noValidate
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl><PasswordInput autoComplete="current-password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl><PasswordInput autoComplete="new-password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl><PasswordInput autoComplete="new-password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" loading={change.isPending}>Update password</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/* ────────────────────── 2FA ────────────────────── */

type SetupStep = "scan" | "verify" | "recovery";

function TwoFactorCard() {
  const me = useMe();
  const setup = use2FASetup();
  const confirm = use2FAConfirm();
  const disable = use2FADisable();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<SetupStep>("scan");
  const [otpauth, setOtpauth] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [disablePw, setDisablePw] = useState("");

  const enabled = me.data?.twoFactorEnabled ?? false;

  const resetSetup = () => {
    setOpen(false);
    setStep("scan");
    setCode("");
    setOtpauth(null);
    setRecovery([]);
  };

  const onToggle = (next: boolean) => {
    if (next) {
      setup.mutate(undefined, {
        onSuccess: (data) => {
          setOtpauth(data.otpauth);
          setRecovery(data.recoveryCodes);
          setStep("scan");
          setOpen(true);
        },
      });
    } else {
      // Open password prompt
      setOpen(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-4 w-4" /> Two-factor authentication
        </CardTitle>
        <CardDescription>
          Require a code from your authenticator app on every sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm">{enabled ? "2FA is on for this account." : "2FA is currently off."}</p>
          </div>
          <Switch checked={enabled} onCheckedChange={onToggle} disabled={setup.isPending} />
        </div>
      </CardContent>

      <Dialog
        open={open && !enabled}
        onOpenChange={(o) => {
          if (!o) resetSetup();
          else setOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up authenticator</DialogTitle>
            <DialogDescription>
              {step === "scan" && "Step 1 of 3 · Scan the QR code in your authenticator app."}
              {step === "verify" && "Step 2 of 3 · Enter the 6-digit code from your app."}
              {step === "recovery" && "Step 3 of 3 · Save these recovery codes somewhere safe."}
            </DialogDescription>
          </DialogHeader>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            <StepDot done={step !== "scan"} current={step === "scan"} />
            <span className="h-px w-6 bg-border" />
            <StepDot done={step === "recovery"} current={step === "verify"} />
            <span className="h-px w-6 bg-border" />
            <StepDot current={step === "recovery"} />
          </div>

          {step === "scan" ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-xl border border-border bg-white p-4">
                  {otpauth ? (
                    <QRCodeCanvas value={otpauth} size={176} includeMargin />
                  ) : (
                    <Skeleton className="h-44 w-44" />
                  )}
                </div>
              </div>
              <details className="rounded-md border border-border bg-muted/40 p-3 text-xs">
                <summary className="cursor-pointer font-medium text-foreground">
                  Can't scan? Enter manually
                </summary>
                <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">
                  {otpauth}
                </p>
              </details>
            </div>
          ) : null}

          {step === "verify" ? (
            <div className="space-y-4">
              <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Demo</span>: enter{" "}
                <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[0.7rem] text-foreground">
                  123456
                </code>{" "}
                to continue.
              </div>
              <div>
                <Label className="mb-2 block">Confirmation code</Label>
                <OtpInput value={code} onChange={setCode} autoFocus />
              </div>
            </div>
          ) : null}

          {step === "recovery" ? (
            <RecoveryStep recovery={recovery} />
          ) : null}

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            {step === "scan" ? (
              <>
                <Button variant="outline" onClick={resetSetup}>
                  Cancel
                </Button>
                <Button onClick={() => setStep("verify")} disabled={!otpauth}>
                  I've scanned
                  <ArrowRight />
                </Button>
              </>
            ) : null}
            {step === "verify" ? (
              <>
                <Button variant="outline" onClick={() => setStep("scan")}>
                  <ArrowLeft />
                  Back
                </Button>
                <Button
                  loading={confirm.isPending}
                  disabled={code.length !== 6}
                  onClick={() =>
                    confirm.mutate(
                      { code },
                      { onSuccess: () => setStep("recovery") },
                    )
                  }
                >
                  Verify code
                  <ArrowRight />
                </Button>
              </>
            ) : null}
            {step === "recovery" ? (
              <Button className="w-full" onClick={resetSetup}>
                <Check />
                Done
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open && enabled} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable two-factor authentication?</DialogTitle>
            <DialogDescription>Confirm your password to disable 2FA.</DialogDescription>
          </DialogHeader>
          <PasswordInput
            autoFocus
            placeholder="Your password"
            value={disablePw}
            onChange={(e) => setDisablePw(e.target.value)}
          />
          {disable.error instanceof ApiError ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{disable.error.message}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              loading={disable.isPending}
              onClick={() =>
                disable.mutate(disablePw, {
                  onSuccess: () => {
                    setOpen(false);
                    setDisablePw("");
                  },
                })
              }
            >
              Disable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ────────────────────── Transaction PIN ────────────────────── */

function TransactionPinCard() {
  const me = useMe();
  const set = useSetPin();
  const form = useForm<TransactionPinInput>({
    resolver: zodResolver(transactionPinSchema),
    defaultValues: { pin: "", confirmPin: "" },
  });
  const has = me.data?.hasTransactionPin ?? false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction PIN</CardTitle>
        <CardDescription>
          A 4-digit PIN protects every transfer, investment, and crypto send.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm">
          {has ? "You currently have a PIN set." : "You don't have a PIN yet."}
        </p>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((v) =>
              set.mutate(v.pin, { onSuccess: () => form.reset() }),
            )}
            noValidate
          >
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{has ? "New PIN" : "Choose a PIN"}</FormLabel>
                  <FormControl>
                    <PinInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm PIN</FormLabel>
                  <FormControl>
                    <PinInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" loading={set.isPending}>
              {has ? "Update PIN" : "Set PIN"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/* ────────────────────── Sessions ────────────────────── */

function SessionsList() {
  const { data, isPending } = useSessions();
  const revoke = useRevokeSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          Devices currently signed in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground">No active sessions.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {s.device}
                    {s.current ? (
                      <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-success">
                        This device
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.location ?? s.ip ?? "Unknown location"} ·{" "}
                    {new Date(s.lastActiveAt).toLocaleString()}
                  </p>
                </div>
                {!s.current ? (
                  <ConfirmDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        <LogOut />
                        Revoke
                      </Button>
                    }
                    title="Revoke this session?"
                    description="That device will be signed out immediately."
                    confirmLabel="Revoke"
                    onConfirm={() => revoke.mutate(s.id)}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {data?.some((s) => !s.current) ? (
          <ConfirmDialog
            trigger={
              <Button variant="destructive" size="sm">
                Revoke all other sessions
              </Button>
            }
            title="Revoke all other sessions?"
            description="All other devices will be signed out. You'll stay signed in here."
            confirmLabel="Revoke all"
            onConfirm={() => revoke.mutate("all")}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

/* ────────────────────── Notifications ────────────────────── */

function NotificationsCard() {
  const [prefs, setPrefs] = useState({ emailTx: true, emailMarketing: false, smsAlerts: true });
  const toggle = (key: keyof typeof prefs) => {
    setPrefs((p) => {
      const next = { ...p, [key]: !p[key] };
      toast.success("Preferences saved");
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what we email or text you about.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row label="Transaction emails" description="Receipts and status changes." checked={prefs.emailTx} onToggle={() => toggle("emailTx")} />
        <Row label="Product updates" description="New features and tips." checked={prefs.emailMarketing} onToggle={() => toggle("emailMarketing")} />
        <Row label="Security SMS alerts" description="Sign-ins and PIN changes." checked={prefs.smsAlerts} onToggle={() => toggle("smsAlerts")} />
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}

/* ────────────────────── 2FA setup helpers ────────────────────── */

function StepDot({ done, current }: { done?: boolean; current?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-5 w-5 place-items-center rounded-full text-[0.6rem] font-semibold transition-colors",
        done
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : current
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
      )}
    >
      {done ? <Check className="h-3 w-3" /> : null}
    </span>
  );
}

function RecoveryStep({ recovery }: { recovery: string[] }) {
  const copyAll = () => {
    navigator.clipboard.writeText(recovery.join("\n"));
    toast.success("Recovery codes copied");
  };
  return (
    <div className="space-y-3">
      <Alert>
        <ScanLine />
        <AlertDescription>
          Store these in a password manager. Each code can be used once if you lose
          access to your authenticator.
        </AlertDescription>
      </Alert>
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-sm tabular-nums">
          {recovery.map((r) => (
            <span key={r}>{r}</span>
          ))}
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={copyAll}>
        <Copy />
        Copy all codes
      </Button>
    </div>
  );
}
