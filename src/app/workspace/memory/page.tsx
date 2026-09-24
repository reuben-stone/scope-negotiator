"use client";

import { WorkspaceContextList } from "@/components/workspace/WorkspaceContextList";

export default function MemoryPage() {
  return (
    <WorkspaceContextList
      type="memory"
      heading="Memory"
      description="Human-approved memories that carry across scoping sessions. Every memory here was explicitly approved by you. Memories are proposed after locking scope."
      emptyText="No approved memories"
      addLabel="+ Add Memory →"
      titleLabel="Memory"
      titlePlaceholder="e.g. Customer data modifications require confirmation"
      contentLabel="Detail"
      contentPlaceholder="The constraint, preference or decision to remember for future scopes..."
      deleteLabel="Forget"
    />
  );
}
