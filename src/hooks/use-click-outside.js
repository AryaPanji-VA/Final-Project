import { useEffect, useRef } from "react";

/**
 * Closes a floating panel on outside pointer-down or Escape.
 * Returns a ref to attach to the wrapper element.
 */
export function useClickOutside(handler, enabled = true) {
  const ref = useRef(null);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    function onPointerDown(event) {
      if (!ref.current || ref.current.contains(event.target)) return;
      handlerRef.current?.(event);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") handlerRef.current?.(event);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled]);

  return ref;
}
