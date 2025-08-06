
import { cn } from "@/lib/utils";

export function DiscordLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-bot", className)}
    >
      <title>Discord Logo</title>
      <path d="M5.88 16.14a8.13 8.13 0 0 1-1.14-3.56c0-4.52 3.66-8.18 8.18-8.18s8.18 3.66 8.18 8.18c0 1.3-.31 2.52-.86 3.62" />
      <path d="M9.81 12.86a2.12 2.12 0 0 0-2.12 2.12v.06a2.12 2.12 0 0 0 2.12 2.12 2.12 2.12 0 0 0 2.12-2.12v-.06a2.12 2.12 0 0 0-2.12-2.12zm4.38 0a2.12 2.12 0 0 0-2.12 2.12v.06a2.12 2.12 0 0 0 2.12 2.12 2.12 2.12 0 0 0 2.12-2.12v-.06a2.12 2.12 0 0 0-2.12-2.12z" />
      <path d="M17.14 18.23c-1.28.6-2.73.95-4.24.95-1.51 0-2.96-.35-4.24-.95" />
      <path d="M6.34 19.34a10.93 10.93 0 0 1-2.4-4.82 10.5 10.5 0 0 1 .4-5.4A11.08 11.08 0 0 1 8.7 4.1a10.94 10.94 0 0 1 6.6 0 11.08 11.08 0 0 1 4.36 5.02c.42 1.9.3 3.8-.4 5.4a10.93 10.93 0 0 1-2.4 4.82" />
    </svg>
  );
}
