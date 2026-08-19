/** @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { ping, config } = vi.hoisted(() => ({
  ping: vi.fn(),
  config: vi.fn(),
}));

vi.mock("cloudinary", () => ({
  v2: {
    config,
    api: { ping },
    uploader: { upload_stream: vi.fn(), destroy: vi.fn() },
  },
}));

import { pingCloudinary } from "@/lib/cloudinary";

describe("Cloudinary connection", () => {
  const previous = {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLOUDINARY_CLOUD_NAME = "demo-cloud";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";
  });

  afterEach(() => {
    process.env.CLOUDINARY_CLOUD_NAME = previous.name;
    process.env.CLOUDINARY_API_KEY = previous.key;
    process.env.CLOUDINARY_API_SECRET = previous.secret;
  });

  it("pings Cloudinary when credentials are configured", async () => {
    ping.mockResolvedValue({ status: "ok" });
    await expect(pingCloudinary()).resolves.toEqual({ ok: true });
    expect(config).toHaveBeenCalledWith(
      expect.objectContaining({ cloud_name: "demo-cloud", api_key: "key", api_secret: "secret", secure: true }),
    );
    expect(ping).toHaveBeenCalled();
  });

  it("fails when Cloudinary is not configured", async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    await expect(pingCloudinary()).rejects.toThrow(/not configured/i);
    expect(ping).not.toHaveBeenCalled();
  });
});
