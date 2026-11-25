import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 h-[22px] text-[11px] font-semibold tracking-[0.04em]",
  {
    variants: {
      variant: {
        sage: "bg-secondary-muted text-secondary",
        gold: "bg-primary-muted text-primary",
        outline: "border border-border text-muted-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
      },
    },
    defaultVariants: {
      variant: "sage",
    },
  },
);
function Badge({ children, variant, className }) {
  return (
    <span className={cn(badgeVariants({ variant, className }))}>
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
