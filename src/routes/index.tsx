import { createFileRoute } from "@tanstack/react-router";
import { CurrentRecruitments } from "@/components/pages/current-recruitments";

export const Route = createFileRoute("/")({
  component: CurrentRecruitments,
});
