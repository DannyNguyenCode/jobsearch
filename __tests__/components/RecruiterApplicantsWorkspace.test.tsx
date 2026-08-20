import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecruiterApplicantsWorkspace } from "@/components/applicants/RecruiterApplicantsWorkspace";
import { NoManagedApplicantsEmptyState } from "@/components/applicants/NoManagedApplicantsEmptyState";
import type { ManagedApplicantSummary } from "@/lib/managed-applicants";
import type { JobApplication } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const danny: ManagedApplicantSummary = {
  id: "aaaaaaaaaaaaaaaaaaaaaaaa",
  name: "Danny Nguyen",
  email: "giabnguyen1@gmail.com",
  initials: "DN",
  jobField: "Web Developer",
  activeCount: 2,
  interviewCount: 1,
  offerCount: 0,
  lastActivityAt: "2026-08-18T00:00:00.000Z",
};

const jane: ManagedApplicantSummary = {
  id: "bbbbbbbbbbbbbbbbbbbbbbbb",
  name: "Jane Smith",
  email: "jane@example.com",
  initials: "JS",
  jobField: "Customer Service",
  activeCount: 1,
  interviewCount: 0,
  offerCount: 0,
  lastActivityAt: "2026-08-10T00:00:00.000Z",
};

function application(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: "cccccccccccccccccccccccc",
    dateApplied: "2026-08-01",
    organization: "TechCorp",
    location: "Remote",
    phone: "",
    contactName: "",
    contactEmail: "",
    position: "Frontend Engineer",
    notes: "",
    status: "applied",
    postingUrl: "",
    source: "jobBoard",
    applicantId: danny.id,
    applicantName: danny.name,
    applicantEmail: danny.email,
    documents: [],
    comments: [],
    timeline: [],
    ...overrides,
  };
}

function renderWorkspace(
  overrides: {
    selectedApplicant?: ManagedApplicantSummary;
    applications?: JobApplication[];
    applicants?: ManagedApplicantSummary[];
  } = {},
) {
  return render(
    <RecruiterApplicantsWorkspace
      applicants={overrides.applicants ?? [danny, jane]}
      applications={overrides.applications ?? [application()]}
      selectedApplicant={overrides.selectedApplicant ?? danny}
    />,
  );
}

describe("RecruiterApplicantsWorkspace", () => {
  it("shows the managed applicants sidebar and lists applicants", () => {
    renderWorkspace();

    expect(screen.getByRole("heading", { name: "Managed Applicants" })).toBeTruthy();
    expect(screen.getByText("2 applicants")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Managed applicants" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Danny Nguyen/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Jane Smith/ })).toBeTruthy();
  });

  it("highlights the selected applicant", () => {
    renderWorkspace();

    expect(screen.getByRole("link", { name: /Danny Nguyen/ }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: /Jane Smith/ }).getAttribute("aria-current")).toBeNull();
  });

  it("navigates to another applicant and only shows that applicant's applications", () => {
    const { rerender } = renderWorkspace({
      applications: [
        application({ organization: "TechCorp", position: "Frontend Engineer" }),
        application({
          id: "dddddddddddddddddddddddd",
          organization: "Northwind",
          position: "Support Lead",
        }),
      ],
    });

    expect(screen.getByRole("link", { name: /Jane Smith/ }).getAttribute("href")).toBe(
      `/recruiter/applicants/${jane.id}`,
    );
    expect(screen.getAllByText("TechCorp").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Northwind").length).toBeGreaterThan(0);

    rerender(
      <RecruiterApplicantsWorkspace
        applicants={[danny, jane]}
        applications={[
          application({
            id: "eeeeeeeeeeeeeeeeeeeeeeee",
            applicantId: jane.id,
            applicantName: jane.name,
            organization: "Acme Health",
            position: "Coordinator",
          }),
        ]}
        selectedApplicant={jane}
      />,
    );

    expect(screen.getByRole("link", { name: /Jane Smith/ }).getAttribute("aria-current")).toBe("page");
    expect(screen.getAllByText("Acme Health").length).toBeGreaterThan(0);
    expect(screen.queryByText("TechCorp")).toBeNull();
    expect(screen.queryByText("Northwind")).toBeNull();
  });

  it("does not show an Applicant column in the selected-applicant table", () => {
    renderWorkspace();

    expect(screen.queryByRole("columnheader", { name: "Applicant" })).toBeNull();
    expect(screen.getByRole("columnheader", { name: "Date Applied" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Organization" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Position" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Source" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Location" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeTruthy();
  });

  it("keeps the existing View application action", () => {
    renderWorkspace({
      applications: [application({ id: "cccccccccccccccccccccccc", position: "Frontend Engineer", organization: "TechCorp" })],
    });

    const view = screen.getByRole("link", { name: "View Frontend Engineer at TechCorp" });
    expect(view.getAttribute("href")).toBe(
      `/recruiter/applicants/${danny.id}/applications/cccccccccccccccccccccccc`,
    );
  });

  it("shows an empty state when the selected applicant has no applications", () => {
    renderWorkspace({ applications: [] });

    expect(screen.getByRole("heading", { name: "No applications yet" })).toBeTruthy();
    expect(screen.getByText("This applicant has not added any job applications.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Managed Applicants" })).toBeTruthy();
  });

  it("filters sidebar applicants from search", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.type(screen.getByRole("searchbox", { name: "Search applicants" }), "jane");

    const list = screen.getByRole("navigation", { name: "Managed applicants" });
    expect(within(list).getByRole("link", { name: /Jane Smith/ })).toBeTruthy();
    expect(within(list).queryByRole("link", { name: /Danny Nguyen/ })).toBeNull();
  });

  it("renders mobile drawer controls", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    expect(screen.getByText("Selected applicant")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Open managed applicants" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("NoManagedApplicantsEmptyState", () => {
  it("shows the recruiter code empty state", () => {
    render(<NoManagedApplicantsEmptyState recruiterCode="REC-7K4P2M" />);

    expect(screen.getByRole("heading", { name: "No managed applicants yet" })).toBeTruthy();
    expect(screen.getByText("REC-7K4P2M")).toBeTruthy();
    expect(
      screen.getByText("Applicants can use this code to connect their Job Tracker account with you."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copy recruiter code" })).toBeTruthy();
  });
});
