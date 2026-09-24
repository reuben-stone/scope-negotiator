"use client";

import { WorkspaceContextList } from "@/components/workspace/WorkspaceContextList";

export default function TeamPage() {
  return (
    <WorkspaceContextList
      type="team"
      heading="Team"
      description="Default team capacity and delivery constraints. When starting a new scope, saved team context is available as a starting point — editable per-scope."
      emptyText="No team defaults configured"
      addLabel="+ Add Team →"
      titleLabel="Team Name"
      titlePlaceholder="e.g. Product Team"
      contentLabel="Team / Capacity"
      contentPlaceholder="Who can work on this, availability, capabilities, constraints..."
    />
  );
}
