import { getPage } from "@/lib/siteStore";
import { pageMetadata } from "@/lib/pageMetadata";
import PageSections from "@/components/site/PageSections";
import View from "./ContactView";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return pageMetadata(getPage("contact")!); }
export default function Page() { const page = getPage("contact")!; return <><View page={page} /><PageSections sections={page.sections} /></>; }
