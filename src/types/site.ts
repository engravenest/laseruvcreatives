export interface SiteSection { id: string; title: string; body: string; enabled: boolean }
export interface SitePage {
  id: string; slug: string; title: string; description: string;
  seo: { title: string; description: string; keywords?: string };
  sections: SiteSection[]; published: boolean; builtIn: boolean; showInFooter: boolean;
}
export interface SiteColors {
  primary: string; lightBackground: string; lightSurface: string; lightText: string;
  darkBackground: string; darkSurface: string; darkText: string;
}
export interface Coupon {
  id: string; code: string; kind: "percent" | "fixed"; amount: number; active: boolean;
  perUserLimit: number; totalLimit: number; minimumSubtotal: number;
  emails: string[]; expiresAt: string; deleted?: boolean; uses?: number;
}
