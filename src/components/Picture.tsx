import { getPhoto } from "@/content";
import type { Photo } from "@/content/types";
import type { Locale } from "@/lib/i18n";

interface PictureProps {
  photo: Photo;
  locale: Locale;
  /** The rendered width, e.g. "(min-width: 60rem) 58vw, 100vw". */
  sizes: string;
  className?: string;
  /** Above-the-fold images load eagerly with high priority; everything else is lazy. */
  priority?: boolean;
}

export function srcSetOf(key: Photo["key"]): string {
  return getPhoto(key)
    .srcset.map(([w, src]) => `${src} ${w}w`)
    .join(", ");
}

export function fallbackSrc(key: Photo["key"]): string {
  const { srcset } = getPhoto(key);
  return (srcset.find(([w]) => w >= 1080) ?? srcset[srcset.length - 1])[1];
}

/**
 * Responsive image from the pre-built variants. Width/height come from the
 * source so the browser reserves space before the file arrives (no layout shift);
 * the average colour fills that space while it loads.
 */
export function Picture({ photo, locale, sizes, className, priority = false }: PictureProps) {
  const asset = getPhoto(photo.key);
  return (
    <img
      className={className}
      src={fallbackSrc(photo.key)}
      srcSet={srcSetOf(photo.key)}
      sizes={sizes}
      width={asset.width}
      height={asset.height}
      alt={photo.alt[locale]}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      style={{ backgroundColor: asset.color, objectPosition: photo.focus }}
      data-status={photo.status === "draft" ? "draft" : undefined}
    />
  );
}
