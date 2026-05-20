"use client";

import { Copy } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CryptoWallet } from "@/types";

interface Props {
  wallet: CryptoWallet | null;
  onClose: () => void;
}

export function ReceiveCryptoModal({ wallet, onClose }: Props) {
  return (
    <Dialog open={!!wallet} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {wallet ? (
          <>
            <DialogHeader>
              <DialogTitle>Receive {wallet.asset}</DialogTitle>
              <DialogDescription>
                Scan the QR code or copy your address. Only send {wallet.asset} via {wallet.network}.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-3">
              <div className="rounded-xl border border-border bg-white p-3">
                <QRCodeCanvas value={wallet.address} size={192} includeMargin />
              </div>
              <div className="w-full break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">
                {wallet.address}
              </div>
            </div>

            <Alert variant="warning">
              <AlertDescription>
                Sending other tokens or the wrong network may result in permanent loss.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(wallet.address);
                  toast.success("Address copied");
                }}
              >
                <Copy />
                Copy address
              </Button>
              <Button onClick={onClose}>Done</Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
