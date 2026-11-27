import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button — editorial, near-square (3px), no shadows (§6.1).
 * Heights: 32 / 40 / 48. Mobile controls sit at 44px for touch.
 *
 * Fills pair with `onaccent`, never `paper`: ivory-on-ink inverts the theme.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[3px] font-medium",
    "transition-[color,background-color,border-color,transform] duration-[130ms] ease-[var(--ease-editorial)]",
    "active:scale-[0.985]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Crimson: the single primary action on a view.
        primary: "bg-crimson text-onaccent hover:bg-crimson-deep",
        // Ink outline: secondary editorial action.
        outline: "border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
        // Quiet border, used in toolbars.
        quiet: "border border-border-strong bg-surface text-ink hover:border-ink",
        ghost: "bg-transparent text-ink-muted hover:bg-paper-muted hover:text-ink",
        // Arcane is reserved for reference actions: links, selected controls.
        accent: "border border-arcane-bright bg-transparent text-arcane-bright hover:bg-arcane hover:text-onaccent",
        destructive: "border border-alert bg-transparent text-alert hover:bg-alert hover:text-paper",
        link: "h-auto bg-transparent p-0 text-arcane-bright underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-11 px-3 text-[13px] sm:h-8",
        default: "h-11 px-4 text-[14px] sm:h-10",
        lg: "h-12 px-6 text-[15px]",
        icon: "size-11 sm:size-9",
        "icon-sm": "size-11 sm:size-8",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

function Button({ className, variant, size, asChild = false, type, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
