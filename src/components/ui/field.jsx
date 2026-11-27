import { Children, cloneElement, isValidElement, useId } from "react";

import { cn } from "@/lib/utils";

/**
 * Form field: label → control (6px) → hint/error (4px).
 * Clones a single child element to wire `aria-describedby`, so the message is
 * announced with the control. Errors get role="alert".
 */
function Field({
  label,
  htmlFor,
  hint,
  error,
  hintTone = "faint",
  optional,
  className,
  children,
}) {
  const generatedId = useId();
  const controlId = htmlFor ?? `${generatedId}-control`;
  const messageId = `${controlId}-message`;
  const hasMessage = Boolean(error || hint);

  const child =
    Children.count(children) === 1 && isValidElement(children)
      ? cloneElement(children, {
          id: children.props.id ?? controlId,
          "aria-describedby": hasMessage
            ? [children.props["aria-describedby"], messageId].filter(Boolean).join(" ")
            : children.props["aria-describedby"],
        })
      : children;

  return (
    <div className={cn("flex flex-col", className)}>
      {label ? (
        <label
          htmlFor={controlId}
          className="mb-1.5 flex items-baseline gap-2 text-[12.5px] font-medium text-ink"
        >
          {label}
          {optional ? (
            <span className="text-[11px] font-normal text-ink-faint">optional</span>
          ) : null}
        </label>
      ) : null}

      {child}

      {error ? (
        <p id={messageId} role="alert" className="mt-1 text-[12px] text-alert">
          {error}
        </p>
      ) : hint ? (
        <p
          id={messageId}
          className={cn(
            "mt-1 text-[12px]",
            hintTone === "success" ? "text-positive" : "text-ink-faint",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export { Field };
