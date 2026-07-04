import { createFileRoute, redirect } from "@tanstack/react-router";

// Root URL: bounce to the admin (which itself gates auth).
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
