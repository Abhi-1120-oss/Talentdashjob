import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[20px] bg-gradient-to-r from-[#F7F7F7] via-[#EBEBEB]/50 to-[#F7F7F7]", className)}
      {...props}
    />
  );
}
