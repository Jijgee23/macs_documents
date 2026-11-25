import { getNavTree } from "@/lib/content";
import { DocsShell } from "@/components/DocsShell";
import { PasswordPrompt } from "@/components/PasswordGate";
import { hasDocsAccess } from "@/lib/docs-access";

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  // Check access on the server before touching any docs data or rendering children.
  if (!(await hasDocsAccess())) {
    return <PasswordPrompt />;
  }

  const modules = await getNavTree();

  return <DocsShell modules={modules}>{children}</DocsShell>;
}
