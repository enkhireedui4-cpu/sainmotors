import { collectStatuses, getBrands, getLogo } from "@/content";

/**
 * Problems that must be fixed before a release build. Everything shown on the
 * site has to be approved by the content team, and every published brand needs
 * its supplied logo.
 */
export function releaseProblems(): string[] {
  const problems = collectStatuses()
    .filter((item) => item.status !== "approved")
    .map((item) => `${item.path}: ${item.status}`);
  for (const brand of getBrands()) {
    if (!getLogo(brand.slug)) problems.push(`brands.${brand.slug}: logo missing`);
  }
  return problems;
}

export function assertReleasable(): void {
  const problems = releaseProblems();
  if (problems.length) {
    throw new Error(
      `Release build blocked: ${problems.length} item(s) are not approved.\n` +
        problems.map((p) => `  - ${p}`).join("\n") +
        "\nBuild without SITE_RELEASE=1 for a preview, or approve the content first.",
    );
  }
}
