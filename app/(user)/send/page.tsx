"use client";

import { ArrowRight, Bitcoin, Building2, Zap } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const options = [
  {
    href: "/transfer",
    title: "To a Vaultline account",
    description:
      "Instantly transfer funds to another user by account number or email.",
    icon: Building2,
    badge: "Instant · free",
    accent: "bg-primary/10 text-primary",
  },
  {
    href: "/crypto",
    title: "Send cryptocurrency",
    description:
      "Send BTC, ETH, USDT, BNB or SOL to any wallet address on-chain.",
    icon: Bitcoin,
    badge: "Network fees apply",
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

export default function SendPage() {
  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="Outgoing"
        title="Send money"
        description="Choose where the funds are going. Internal transfers settle instantly; crypto sends are subject to network fees."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {options.map(({ href, title, description, icon: Icon, badge, accent }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-all hover:border-primary/40 hover:shadow-md">
              <CardHeader>
                <div className="mb-3 flex items-start justify-between">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${accent}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="leading-relaxed">{description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  {badge}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Need to receive funds instead?</CardTitle>
          <CardDescription>
            Share your Vaultline account number or a crypto wallet address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/receive"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Go to Receive
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
