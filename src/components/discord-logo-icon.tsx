
import { cn } from "@/lib/utils";
import Image from 'next/image';

export function DiscordLogoIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
       <Image
            src="https://assets-global.website-files.com/f535446218c547536a44a155/62fb76f65a19363063068a7a_7c625c8b5563df2b45e69312154c4a2a.png"
            alt="Discord Logo"
            width={48}
            height={48}
            className="h-full w-full"
        />
    </div>
  );
}
