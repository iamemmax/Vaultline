"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/types";

interface Props {
  user?: User;
  loading?: boolean;
}

export function AccountInfo({ user, loading }: Props) {
  if (loading || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    );
  }

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Account details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-sm">
          <Row label="Full name" value={user.fullName} />
          <Row label="Email" value={user.email} onCopy={() => copy(user.email, "Email")} />
          <Row
            label="Account number"
            value={user.accountNumber}
            mono
            onCopy={() => copy(user.accountNumber, "Account number")}
          />
          <Row label="Currency" value={user.currency} />
        </dl>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  mono,
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`flex items-center gap-2 ${mono ? "font-mono tabular-nums" : "font-medium"}`}>
        <span>{value}</span>
        {onCopy ? (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCopy} aria-label={`Copy ${label.toLowerCase()}`}>
            <Copy className="h-3 w-3" />
          </Button>
        ) : null}
      </dd>
    </div>
  );
}
