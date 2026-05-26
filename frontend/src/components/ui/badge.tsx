import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#FFF1F2] text-[#FF385C]",
        secondary: "border-[#EBEBEB] bg-[#F7F7F7] text-[#717171]",
        success: "border-transparent bg-[#00A699]/10 text-[#00A699]",
        warning: "border-transparent bg-[#FFB400]/15 text-[#B8860B]",
        outline: "border-[#EBEBEB] bg-white text-[#222222]",
      },
    },
    defaultVariants: { variant: "secondary" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
