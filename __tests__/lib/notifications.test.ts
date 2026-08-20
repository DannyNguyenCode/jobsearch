import { describe, expect, it } from "vitest";
import {
  addedApplicationLine,
  applicationStatusLine,
  commentAddedLine,
  connectedProfileLine,
  contactUpdatedLine,
  documentUploadedLine,
  relationshipEndedLine,
  updatedApplicationLine,
} from "@/lib/notifications";

describe("notification copy", () => {
  it("uses the same short activity lines recruiters already see", () => {
    expect(connectedProfileLine()).toBe("Connected their profile");
    expect(addedApplicationLine()).toBe("Added an application");
    expect(updatedApplicationLine()).toBe("Updated application");
    expect(applicationStatusLine("interview")).toBe("Interview");
    expect(commentAddedLine()).toBe("Comment added");
    expect(documentUploadedLine("jobPosting")).toBe("Job description uploaded");
    expect(documentUploadedLine("resume")).toBe("Resume uploaded");
    expect(relationshipEndedLine()).toBe("Ended the coaching relationship");
  });

  it("describes profile edits in one line", () => {
    expect(contactUpdatedLine({ contact: true, preferences: false })).toBe("Updated contact information");
    expect(contactUpdatedLine({ contact: false, preferences: true })).toBe("Updated job preferences");
    expect(contactUpdatedLine({ contact: true, preferences: true })).toBe("Updated their profile");
  });
});
