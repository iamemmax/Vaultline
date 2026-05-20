"use client";

import { Copy } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMe } from "@/hooks/useAuth";
import { useCryptoWallets } from "@/hooks/useData";
import { truncateMiddle } from "@/lib/utils/format";

export default function ReceivePage() {
  const me = useMe();
  const wallets = useCryptoWallets();

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="Incoming"
        title="Receive money"
        description="Share your account details to receive funds in fiat or any supported cryptocurrency."
      />

      <Tabs defaultValue="bank" className="mx-auto w-full max-w-3xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bank">Vaultline account</TabsTrigger>
          <TabsTrigger value="crypto">Crypto wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="bank" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your account number</CardTitle>
              <CardDescription>
                Anyone with a Vaultline account can send funds using this number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {me.isPending || !me.data ? (
                <Skeleton className="mx-auto h-48 w-48" />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-xl border border-border bg-white p-4">
                    <QRCodeCanvas
                      value={`vaultline:account?number=${me.data.accountNumber}&name=${encodeURIComponent(me.data.fullName)}`}
                      size={192}
                      includeMargin
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                    <span className="font-mono text-lg tabular-nums">{me.data.accountNumber}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copy(me.data!.accountNumber, "Account number")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Account holder: <span className="font-medium text-foreground">{me.data.fullName}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto" className="pt-4">
          <div className="grid grid-cols-1 gap-4">
            {wallets.isPending
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
              : wallets.data?.map((w) => (
                  <Card key={w.asset}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-base">{w.name} <span className="text-muted-foreground">({w.asset})</span></CardTitle>
                        <CardDescription>{w.network}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => copy(w.address, "Address")}>
                        <Copy />
                        Copy
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="rounded-md border border-border bg-white p-2">
                          <QRCodeCanvas value={w.address} size={96} includeMargin />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="break-all font-mono text-xs">{truncateMiddle(w.address, 32)}</p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Only send {w.asset} via the {w.network} network. Funds sent on other networks may be lost.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
