import { redirect } from "next/navigation";

export default function KnowledgePageRedirect() {
  redirect("/dashboard/recommendations");
}
