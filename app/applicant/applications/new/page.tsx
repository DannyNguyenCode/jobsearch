import type { Metadata } from "next";
import { ApplicationForm } from "@/components/applications/ApplicationForm";

export const metadata: Metadata = { title: "Log an application" };

export default function NewApplicationPage() {
  return <ApplicationForm cancelHref="/applicant/dashboard" />;
}