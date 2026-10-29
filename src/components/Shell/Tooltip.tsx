import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.scss";

interface TooltipProps {
  /** Empty means the wrapper does nothing and stays transparent to layout. */
  title?: ReactNode;
  children: ReactNode;
  /** The collapsed sidebar opens it to the right, where nothing else sits. */
  placement?: "top" | "right";
}

const GAP = 8;
const EDGE = 8;

/** The platform's hover tooltip (promobile-ads src/sandbox/components/Tooltip), ported as is. */
export function Tooltip({ title, children, placement = "top" }: TooltipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);

  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => {
    setOpen(false);
    setBox(null);
  }, []);

  // Measured after the panel renders: before that it has no size to centre or clamp.
  useLayoutEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    const bubble = bubbleRef.current;
    if (!anchor || !bubble) return;

    const target = anchor.getBoundingClientRect();
    const self = bubble.getBoundingClientRect();
    if (placement === "right") {
      const maxTop = window.innerHeight - self.height - EDGE;
      setBox({
        top: Math.min(Math.max(target.top + target.height / 2 - self.height / 2, EDGE), Math.max(maxTop, EDGE)),
        left: target.right + GAP,
      });
      return;
    }
    const maxLeft = window.innerWidth - self.width - EDGE;
    const above = target.top - self.height - GAP;
    setBox({
      top: above >= EDGE ? above : target.bottom + GAP,
      left: Math.min(Math.max(target.left + target.width / 2 - self.width / 2, EDGE), Math.max(maxLeft, EDGE)),
    });
  }, [open, placement]);

  if (!title) return <>{children}</>;

  return (
    <span
      ref={anchorRef}
      className={styles.anchor}
      onPointerEnter={(event) => event.pointerType === "mouse" && show()}
      onPointerLeave={(event) => event.pointerType === "mouse" && hide()}
      onPointerDown={(event) => event.pointerType !== "mouse" && show()}
      onPointerUp={(event) => event.pointerType !== "mouse" && hide()}
      onPointerCancel={hide}
    >
      {children}
      {open &&
        createPortal(
          <span
            ref={bubbleRef}
            role="tooltip"
            className={styles.bubble}
            // Kept invisible until measured, or it would flash in the top-left corner.
            style={box ? { top: box.top, left: box.left } : { top: 0, left: 0, visibility: "hidden" }}
          >
            {title}
          </span>,
          document.body,
        )}
    </span>
  );
}

export default Tooltip;
