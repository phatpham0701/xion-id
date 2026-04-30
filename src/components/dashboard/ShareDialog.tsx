import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profileUrl: string;
  username: string;
};

export const ShareDialog = ({ open, onOpenChange, profileUrl, username }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    setBusy(true);
    QRCode.toCanvas(canvasRef.current, profileUrl, {
      width: 240,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).catch((e) => toast.error("Couldn't render QR", { description: String(e) }))
      .finally(() => setBusy(false));
  }, [open, profileUrl]);

  const downloadPng = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(profileUrl, {
        width: 1024, margin: 2, errorCorrectionLevel: "H",
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `xionid-${username}-qr.png`;
      a.click();
    } catch (e) {
      toast.error("Download failed", { description: String(e) });
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    toast.success("Link copied");
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Check out my XionID profile`);
    const u = encodeURIComponent(profileUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${u}`, "_blank");
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${profileUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(`Check out my XionID profile`);
    const u = encodeURIComponent(profileUrl);
    window.open(`https://t.me/share/url?url=${u}&text=${text}`, "_blank");
  };

  const nativeShare = async () => {
    if (!navigator.share) return copyLink();
    try {
      await navigator.share({ title: "My XionID", url: profileUrl });
    } catch { /* cancelled */ }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your profile</DialogTitle>
          <DialogDescription className="font-mono text-xs">{profileUrl}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-2">
          <div className="rounded-2xl bg-white p-3 shadow-glow-primary/20">
            <canvas ref={canvasRef} className="block" />
            {busy && <div className="absolute"><Loader2 className="h-4 w-4 animate-spin" /></div>}
          </div>
          <Button variant="ghost" size="sm" onClick={downloadPng} className="mt-3">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download QR (PNG)
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="glass border-glass-border" onClick={copyLink}>
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy link
          </Button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button variant="outline" className="glass border-glass-border" onClick={nativeShare}>
              Share…
            </Button>
          )}
          <Button variant="outline" className="glass border-glass-border" onClick={shareTwitter}>
            Twitter / X
          </Button>
          <Button variant="outline" className="glass border-glass-border" onClick={shareWhatsApp}>
            WhatsApp
          </Button>
          <Button variant="outline" className="glass border-glass-border col-span-2" onClick={shareTelegram}>
            Telegram
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
