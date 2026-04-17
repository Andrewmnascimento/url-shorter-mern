import { expect, describe, it, vi } from "vitest";
import { User } from "../models/user.model.js";
import { URL } from "../models/url.model.js";
import { mockMongooseDoc } from "../utils/testUtills.js";
import { Types } from "mongoose";
import { createURL, ping } from "./url.controller.js";

vi.mock('../models/user.model.js', () => ({
  User: {
    findOne: vi.fn(),
  }
}));

vi.mock('../models/url.model.js', () => ({
  URL: {
    findOne: vi.fn(),
    create: vi.fn()
  }
}));

describe("Url Controller", () => {
  it("should return 200 and the correct shortUrl", async () => {
    const userMock = mockMongooseDoc({_id: new Types.ObjectId(), email: 'teste@email.com'});
    vi.mocked(User.findOne).mockResolvedValue(userMock);
    vi.mocked(URL.findOne).mockResolvedValue(null);
    vi.mocked(URL.create).mockResolvedValue({ shortUrl: "abc123"} as any)

    const req = { body: { longUrl: "https://youtube.com" }, user: { email: "teste@email.com" }};
    const res = { json: vi.fn().mockReturnThis(), status: vi.fn().mockReturnThis()};

    await createURL(req as any, res as any);

    expect(res.json).toHaveBeenCalledWith("abc123");
    expect(res.status).toHaveBeenCalledWith(201);

  });
  it("should be able to ping to google", async () => {
    const response = await ping("https://google.com");
    expect(response).toBe(true);
  })
})