
import { cn } from "@/lib/utils";
import Image from 'next/image';

export function DiscordLogoIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
       <Image
            src="/discord-logo.png"
            alt="Discord Logo"
            width={48}
            height={48}
            className="h-full w-full"
        />
    </div>
  );
}
