import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Card — a hairline-framed sheet (§6.4). Near-square (4px), no shadow.
 * §1.2 warns against excessive containers, so `plain` (no frame) and `frame`
 * (hairline only) exist for editorial sections that should not read as boxes.
 */
const cardVariants = cva("rounded-[4px] text-ink", {
  variants: {
    variant: {
      static: "border border-border bg-surface",
      frame: "border border-border",
      plain: "",
      sunken: "border border-border bg-paper-muted",
      // The wine panel: the one lit surface in an editorial composition.
      wine: "border border-crimson/35 bg-parchment",
      ink: "border border-ink bg-ink text-paper",
      dashed: "border border-dashed border-border-strong",
    },
  },
  defaultVariants: { variant: "static" },
});

function Card({ className, variant = "static", as: Comp = "div", ...props }) {
  return <Comp className={cn(cardVariants({ variant }), className)} {...props} />;
}

function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />;
}

function CardTitle({ className, as: Comp = "h3", ...props }) {
  return (
    <Comp
      className={cn("font-serif text-[18px] leading-[1.3] text-ink", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return <div className={cn("text-[13px] leading-relaxed text-ink-muted", className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <div className={cn("flex items-center gap-3 p-5 pt-0", className)} {...props} />;
}

/** Uppercase micro-caps label: section overlines, metadata keys, folios. */
function Overline({ className, as: Comp = "p", ...props }) {
  return (
    <Comp
      className={cn(
        "text-[10.5px] font-semibold uppercase leading-none tracking-[0.12em] text-ink-faint",
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, Overline };
