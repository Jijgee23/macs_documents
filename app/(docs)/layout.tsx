import { getNavTree } from "@/lib/content";
import { DocsShell } from "@/components/DocsShell";
import { PasswordGate } from "@/components/PasswordGate";

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const modules = await getNavTree();

  return (
    <PasswordGate>
      <DocsShell modules={modules}>{children}</DocsShell>
    </PasswordGate>
  );
}
