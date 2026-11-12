import { createFileRoute } from "@tanstack/react-router";
import { MediaLibrary } from "@/admin/media";

export const Route = createFileRoute("/admin/media")({
  component: AdminMediaPage,
});

export function AdminMediaPage() {
  return <MediaLibrary />;
}
