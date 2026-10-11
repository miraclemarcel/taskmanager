"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "./icon";

type ModalProps = {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** The delete dialog uses a narrower close glyph in the design. */
  closeIcon?: { name: string; size: number; width?: number };
};

export function Modal({ title, description, onClose, children, closeIcon }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const restoreTo = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Prefer the first field so typing can start straight away; dialogs without
    // one (delete) fall back to the close button rather than a destructive action.
    const focusTarget =
      panelRef.current?.querySelector<HTMLElement>("input, textarea") ??
      panelRef.current?.querySelector<HTMLElement>("button");
    focusTarget?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreTo?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center lg:items-center">
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-navy/40 backdrop-blur-[8px]"
      />
      {/* Bottom sheet on a phone, centred dialog once there is room. */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative w-full max-w-md rounded-t-sheet bg-surface p-6 shadow-sheet lg:rounded-sheet"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-xl leading-7 font-extrabold tracking-[-0.5px] text-ink"
            >
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="pt-1.5 text-sm leading-6 text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-field transition-colors hover:bg-tint-blue"
          >
            <Icon
              name={closeIcon?.name ?? "close"}
              size={closeIcon?.size ?? 20}
              width={closeIcon?.width}
            />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
