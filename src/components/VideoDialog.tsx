"use client";

import { useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * Opens a film in a native modal <dialog>: focus moves into it, Escape and the
 * close button (or a click on the backdrop) close it, and focus returns to the
 * button that opened it. The <video> exists only while the dialog is open, so
 * nothing is downloaded before the visitor asks and closing tears it down.
 */
export function VideoDialog({ src, poster, title, closeLabel, className, children }: {
  src: string;
  poster: string;
  title: string;
  closeLabel: string;
  className?: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const show = () => {
    setOpen(true);
    dialog.current?.showModal();
  };

  return (
    <>
      <button type="button" className={className} onClick={show} aria-haspopup="dialog">
        {children}
      </button>
      <dialog
        ref={dialog}
        className="video-dialog"
        aria-label={title}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="video-dialog__body">
          <button type="button" className="video-dialog__close" onClick={() => dialog.current?.close()} aria-label={closeLabel}>
            <Icon name="close" size={22} />
          </button>
          {open && <video className="video-dialog__video" src={src} poster={poster} controls autoPlay playsInline />}
        </div>
      </dialog>
    </>
  );
}
