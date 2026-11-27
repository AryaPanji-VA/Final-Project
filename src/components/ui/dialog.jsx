import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-veil"
      className={cn("fixed inset-0 z-50 bg-ink/45", className)}
      {...props}
    />
  );
}

/**
 * DialogContent — a sheet of paper laid on the page. Square corners, hairline
 * border, no blur or glow. `size` sets the measure: sm 440, default 560, lg 720.
 */
function DialogContent({ className, children, showClose = true, size = "default", ...props }) {
  const widths = {
    sm: "max-w-[440px]",
    default: "max-w-[560px]",
    lg: "max-w-[720px]",
    full: "max-w-[calc(100vw-32px)]",
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-sheet"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 gap-5",
          "max-h-[calc(100dvh-48px)] overflow-y-auto rounded-[4px] border border-ink bg-paper p-6",
          "shadow-[0_1px_0_rgba(0,0,0,0.35),0_24px_60px_-24px_rgba(0,0,0,0.6)]",
          widths[size] ?? widths.default,
          className,
        )}
        {...props}
      >
        {children}

        {showClose ? (
          <DialogPrimitive.Close
            className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-[3px] text-ink-faint transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright sm:size-8"
            aria-label="Close dialog"
          >
            <X className="size-4" aria-hidden="true" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-2 pr-10 text-left", className)} {...props} />;
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn("font-serif text-[22px] leading-[1.2] text-ink", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      className={cn("text-[13.5px] leading-relaxed text-ink-muted", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
