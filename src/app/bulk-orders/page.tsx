import { getPage } from "@/lib/siteStore";
import { pageMetadata } from "@/lib/pageMetadata";
import PageSections from "@/components/site/PageSections";
import View from "./BulkOrdersView";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return pageMetadata(getPage("bulk-orders")!); }
export default function Page() { const page = getPage("bulk-orders")!; return <><View page={page} /><PageSections sections={page.sections} /></>; }
