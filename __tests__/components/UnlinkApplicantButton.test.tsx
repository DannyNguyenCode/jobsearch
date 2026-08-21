import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnlinkApplicantButton } from "@/components/applicants/UnlinkApplicantButton";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

describe("UnlinkApplicantButton", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("asks the recruiter to confirm before removing the applicant", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ unlinked: true, emailSent: true }),
    } as Response);

    render(<UnlinkApplicantButton applicantId="aaaaaaaaaaaaaaaaaaaaaaaa" applicantName="Danny Nguyen" />);
    await user.click(screen.getByRole("button", { name: /remove applicant/i }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Remove Applicant" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/applicants/aaaaaaaaaaaaaaaaaaaaaaaa/link",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(push).toHaveBeenCalledWith("/recruiter/applicants");
  });
});
