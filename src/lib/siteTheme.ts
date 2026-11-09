import type { SiteColors } from "@/types/site";
export function siteThemeStyle(colors: SiteColors): Record<string, string> {
  const vars: Record<string, string> = {
    "--site-light-bg": colors.lightBackground, "--site-light-surface": colors.lightSurface, "--site-light-text": colors.lightText,
    "--site-dark-bg": colors.darkBackground, "--site-dark-surface": colors.darkSurface, "--site-dark-text": colors.darkText,
    "--color-zinc-50": colors.lightBackground, "--color-zinc-950": colors.darkBackground,
    "--color-white": colors.lightSurface, "--color-zinc-900": colors.darkSurface,
  };
  for (const [shade, percent] of [[50, 95], [100, 90], [200, 75], [300, 55], [400, 25], [500, 0], [600, -15], [700, -30], [800, -45], [900, -60], [950, -75]]) {
    vars[`--color-amber-${shade}`] = percent === 0 ? colors.primary : `color-mix(in srgb, ${colors.primary}, ${percent > 0 ? "white" : "black"} ${Math.abs(percent)}%)`;
  }
  return vars;
}
