/** @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { command, connect } = vi.hoisted(() => ({
  command: vi.fn(),
  connect: vi.fn(),
}));

vi.mock("mongoose", () => ({
  default: {
    connect,
  },
}));

import { pingMongoAtlas, resetDbCache } from "@/lib/db";

describe("MongoDB Atlas connection", () => {
  const previousUri = process.env.MONGODB_URI;
  const previousDb = process.env.MONGODB_DB;

  beforeEach(() => {
    vi.clearAllMocks();
    resetDbCache();
    process.env.MONGODB_URI = "mongodb+srv://user:pass@cluster.mongodb.net/jobtrackerhub";
    process.env.MONGODB_DB = "jobtrackerhub";
    connect.mockResolvedValue({
      connection: {
        readyState: 1,
        name: "jobtrackerhub",
        db: { admin: () => ({ command }) },
      },
    });
    command.mockResolvedValue({ ok: 1 });
  });

  afterEach(() => {
    process.env.MONGODB_URI = previousUri;
    process.env.MONGODB_DB = previousDb;
    resetDbCache();
  });

  it("connects to MongoDB Atlas and pings the database", async () => {
    await expect(pingMongoAtlas()).resolves.toEqual({ ok: true, database: "jobtrackerhub" });
    expect(connect).toHaveBeenCalledWith(
      "mongodb+srv://user:pass@cluster.mongodb.net/jobtrackerhub",
      expect.objectContaining({ dbName: "jobtrackerhub" }),
    );
    expect(command).toHaveBeenCalledWith({ ping: 1 });
  });

  it("fails when MONGODB_URI is missing", async () => {
    delete process.env.MONGODB_URI;
    await expect(pingMongoAtlas()).rejects.toThrow(/MONGODB_URI is not set/);
    expect(connect).not.toHaveBeenCalled();
  });
});
