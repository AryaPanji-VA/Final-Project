import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge — boxed archival label (§6.2). Square corners, hairline border,
 * uppercase micro-caps. The printed catalogue tag, not a pill.
 *
 * Colour carries meaning: positive = canon/published, caution = draft,
 * outline = legend/archived, alert = destructive.
 */
const badgeVariants = cva(
  "inline-flex h-[21px] items-center gap-1.5 whitespace-nowrap border px-2 text-[10.5px] font-semibold uppercase leading-none tracking-[0.09em]",
  {
    variants: {
      variant: {
        outline: "border-border-strong text-ink-muted",
        ink: "border-ink text-ink",
        // Fills pair with onaccent — never paper.
        crimson: "border-crimson bg-crimson text-onaccent",
        arcane: "border-arcane bg-arcane text-onaccent",
        arcaneQuiet: "border-arcane-bright/40 bg-arcane/40 text-arcane-bright",
        brass: "border-brass/50 bg-brass/10 text-brass",
        moss: "border-brass-quiet/40 bg-brass-quiet/10 text-brass-quiet",
        positive: "border-positive/40 bg-positive/10 text-positive",
        caution: "border-caution/40 bg-caution/10 text-caution",
        alert: "border-alert/40 bg-alert/10 text-alert",
        parchment: "border-brass/50 bg-parchment text-ink",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

function Badge({ className, variant, as: Comp = "span", ...props }) {
  return <Comp className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Publication status → badge variant. Drafts are caution, not an error. */
const statusVariants = {
  published: "positive",
  draft: "caution",
  scheduled: "arcaneQuiet",
  archived: "outline",
};

function StatusBadge({ status = "draft", className, ...props }) {
  return (
    <Badge variant={statusVariants[status] ?? "outline"} className={className} {...props}>
      {status}
    </Badge>
  );
}

/** Canon status: legend is deliberately non-canonical. */
const canonVariants = {
  canon: "positive",
  draft: "caution",
  legend: "outline",
};

function CanonBadge({ status = "draft", className }) {
  return (
    <Badge variant={canonVariants[status] ?? "outline"} className={className}>
      {status}
    </Badge>
  );
}

/** Genre tag — the small boxed tag used under story and universe titles. */
function GenreTag({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex h-[21px] items-center border border-border-strong px-2 text-[10.5px] font-semibold uppercase leading-none tracking-[0.09em] text-ink-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export { Badge, badgeVariants, StatusBadge, CanonBadge, GenreTag };
