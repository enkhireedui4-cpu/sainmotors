"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type Feature = { id: string; label: string; content: ReactNode; align?: "start" | "end" };

/** A small interactive shell; photography and editorial content remain server-rendered. */
export function FeatureTabs({ label, items }: { label: string; items: Feature[] }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const panels = useRef<(HTMLDivElement | null)[]>([]);

  function prepareImage(index: number) {
    const image = panels.current[index]?.querySelector("img");
    // Start loading when a person approaches a tab, rather than eagerly fetching all photos.
    if (image) image.loading = "eager";
    return image;
  }

  function select(index: number) {
    prepareImage(index);
    // Activate synchronously so the next Tab always reaches the newly selected panel.
    // Native image loading, reserved geometry and the source colour handle slower connections.
    setActive(index);
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % items.length; break;
      case "ArrowLeft": next = (index - 1 + items.length) % items.length; break;
      case "Home": next = 0; break;
      case "End": next = items.length - 1; break;
      default: return;
    }
    event.preventDefault();
    tabs.current[next]?.focus({ preventScroll: true });
    // Reveal only inside the tab strip; never move the document or its vertical scroll.
    const tab = tabs.current[next];
    const strip = tab?.parentElement;
    if (tab && strip) {
      const offset = tab.offsetLeft - strip.offsetLeft;
      if (offset < strip.scrollLeft) strip.scrollLeft = offset;
      else if (offset + tab.offsetWidth > strip.scrollLeft + strip.clientWidth) {
        strip.scrollLeft = offset + tab.offsetWidth - strip.clientWidth;
      }
    }
  }

  return (
    <div className="feature-tabs">
      <div className="feature-tabs__nav" role="tablist" aria-label={label}>
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={element => { tabs.current[index] = element; }}
            id={`${id}-tab-${item.id}`}
            className="feature-tabs__tab"
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls={`${id}-panel-${item.id}`}
            tabIndex={active === index ? 0 : -1}
            onPointerEnter={() => prepareImage(index)}
            onFocus={() => prepareImage(index)}
            onClick={() => select(index)}
            onKeyDown={event => navigate(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="feature-tabs__panels">
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={element => { panels.current[index] = element; }}
            id={`${id}-panel-${item.id}`}
            className="feature-tabs__panel"
            data-align={item.align ?? "end"}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${item.id}`}
            aria-hidden={active !== index}
            inert={active !== index}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
