import type { SiteSection } from "@/types/site";
export default function PageSections({ sections }: { sections: SiteSection[] }) {
  return <>{sections.filter(section => section.enabled).map(section => <section key={section.id} className="mx-auto w-full max-w-5xl px-5 py-10 text-zinc-900 dark:text-zinc-100">
    {section.title && <h2 className="mb-4 text-2xl font-bold">{section.title}</h2>}
    <div className="whitespace-pre-wrap break-words leading-8">{section.body}</div>
  </section>)}</>;
}
