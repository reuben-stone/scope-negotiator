import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Scope Negotiator",
  description:
    "Sign in to save scopes, products, and team context across negotiations.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
