import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildShareUrl } from "@/lib/compare-utils";

export function CompareShare({ ids }: { ids: string[] }) {
  const [copied, setCopied] = useState(false);

  if (ids.length === 0) return null;

  const handleCopy = async () => {
    const url = buildShareUrl(ids);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {copied ? "Copied!" : "Copy share link"}
    </Button>
  );
}
