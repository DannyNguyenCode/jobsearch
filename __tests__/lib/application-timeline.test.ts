import { describe, expect, it } from "vitest";
import {
  eventMatchesStatus,
  latestStatusEventDate,
  recordStatusDate,
  statusTimelineEvent,
} from "@/lib/application-timeline";

describe("application journey dates", () => {
  it("builds a status event with the selected date", () => {
    const date = new Date(2026, 7, 18);
    const event = statusTimelineEvent("applied", "Intact Insurance", date);
    expect(event.status).toBe("applied");
    expect(event.title).toBe("Applied");
    expect(event.timestamp).toEqual(date);
    expect(event.description).toBe("Intact Insurance");
  });

  it("appends a journey entry when status changes", () => {
    const timeline = [
      statusTimelineEvent("applied", "Intact Insurance", new Date(2026, 7, 18)),
    ];
    recordStatusDate(timeline, {
      previousStatus: "applied",
      nextStatus: "interview",
      date: new Date(2026, 8, 2),
      organization: "Intact Insurance",
    });
    expect(timeline).toHaveLength(2);
    expect(timeline[1]).toMatchObject({
      status: "interview",
      title: "Interview",
      timestamp: new Date(2026, 8, 2),
    });
  });

  it("updates the current status date when status is unchanged", () => {
    const timeline = [
      statusTimelineEvent("applied", "Intact Insurance", new Date(2026, 7, 18)),
    ];
    recordStatusDate(timeline, {
      previousStatus: "applied",
      nextStatus: "applied",
      date: new Date(2026, 7, 20),
      organization: "Intact Insurance",
    });
    expect(timeline).toHaveLength(1);
    expect(timeline[0].timestamp).toEqual(new Date(2026, 7, 20));
  });

  it("reads the latest date for the current status", () => {
    const timeline = [
      statusTimelineEvent("applied", "Intact Insurance", new Date(2026, 7, 18)),
      statusTimelineEvent("interview", "Intact Insurance", new Date(2026, 8, 2)),
    ];
    expect(latestStatusEventDate(timeline, "interview", new Date(2026, 0, 1))).toEqual(new Date(2026, 8, 2));
    expect(eventMatchesStatus(timeline[0], "applied")).toBe(true);
  });
});
