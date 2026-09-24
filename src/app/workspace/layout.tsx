import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import styles from "./workspace.module.css";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className={styles.layout}>
      <WorkspaceSidebar />
      <main id="main-content" className={styles.main}>{children}</main>
    </div>
  );
}
