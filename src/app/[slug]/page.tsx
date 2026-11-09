import { notFound } from "next/navigation";
import { getPage } from "@/lib/siteStore";
import { pageMetadata } from "@/lib/pageMetadata";
import PageSections from "@/components/site/PageSections";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
function published(slug: string) { const page = getPage(slug); if (!page || !page.published || page.builtIn) notFound(); return page; }
export async function generateMetadata({ params }: Props) { return pageMetadata(published((await params).slug)); }
export default async function ContentPage({ params }: Props) {
  const page = published((await params).slug);
  return <article className="py-12"><header className="mx-auto max-w-5xl px-5 text-zinc-900 dark:text-zinc-100"><h1 className="text-4xl font-black">{page.title}</h1><p className="mt-5 whitespace-pre-wrap text-lg">{page.description}</p></header><PageSections sections={page.sections} /></article>;
}
