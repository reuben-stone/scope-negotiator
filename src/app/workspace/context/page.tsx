"use client";

import { WorkspaceContextList } from "@/components/workspace/WorkspaceContextList";

export default function ProductContextPage() {
  return (
    <WorkspaceContextList
      type="product_context"
      heading="Product Context"
      description="Persistent product information that carries across scoping sessions. When you start a New Feature scope, you can select a saved product instead of re-entering context."
      emptyText="No products saved"
      addLabel="+ Add Product →"
      titleLabel="Product Name"
      titlePlaceholder="e.g. Scope Negotiator"
      contentLabel="Product Context"
      contentPlaceholder="What this product is, who uses it, key technical details, existing architecture..."
    />
  );
}
