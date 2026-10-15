import { useEffect, type ReactNode } from "react";
import { DEMO_MODE } from "@/lib/supabase";
import { useManagedPage } from "@/data/live";
import { Enquiry } from "./Enquiry";

type ManagedSection = {
  id?: string | number;
  heading?: string;
  content?: string;
};

export function ManagedPage({
  slug,
  children,
  secondary = false,
}: {
  slug: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  const q = useManagedPage(slug);

  useEffect(() => {
    if (!q.data?.published || !q.data.title) return;

    const previousTitle = document.title;
    document.title = `${q.data.title} | Avrasya Properties`;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const existed = !!meta;
    const previous = meta?.content || "";

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    meta.content = q.data.meta_description || "";

    return () => {
      document.title = previousTitle;
      if (existed) meta!.content = previous;
      else meta!.remove();
    };
  }, [q.data?.published, q.data?.title, q.data?.meta_description]);

  if (DEMO_MODE) return <>{children}</>;

  if (q.isError) {
    return (
      <div role="alert" className="container-site my-6 rounded border p-4 text-sm">
        This page&apos;s saved content is temporarily unavailable. {" "}
        <button className="underline" onClick={() => window.location.reload()}>
          Refresh now
        </button>
      </div>
    );
  }

  if (!q.data || !q.data.published) return <>{children}</>;

  const sections = Array.isArray(q.data.sections) ? q.data.sections : [];

  return (
    <article className="container-site max-w-4xl py-16">
      {secondary ? (
        <h2 className="headline text-3xl">{q.data.title}</h2>
      ) : (
        <h1 className="headline text-4xl">{q.data.title}</h1>
      )}

      {sections.map((section: ManagedSection, i: number) => (
        <div key={section?.id ?? `section-${i}`} className="mt-8">
          {section?.heading && <h3 className="headline text-2xl">{section.heading}</h3>}
          {section?.content && <p className="mt-3 text-base leading-7">{section.content}</p>}
        </div>
      ))}

      <Enquiry slug={slug} />
    </article>
  );
}
