import type { ReactNode } from "react";

/** Renders JSON-LD for Google rich results. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}

export function SeoIntro({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}
