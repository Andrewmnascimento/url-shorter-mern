import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import { User } from "../models/user.model.js";
import { mockMongooseDoc } from "../utils/testUtills.js";
import { Types } from "mongoose";

const secret = nanoid();
const originalJwtSecret = process.env.JWT_SECRET;
const originalAdminSecret = process.env.ADMIN_SECRET;
const originalRefreshSecret = process.env.REFRESH_SECRET;
let loginRoute: typeof import("./auth.controller.js").loginRoute;

vi.mock('../models/user.model.js', () => ({
  User: {
    findOne: vi.fn(),
  }
}));

describe("Auth Controller", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = secret;
    process.env.ADMIN_SECRET = secret;
    process.env.REFRESH_SECRET = secret;
    ({ loginRoute } = await import("./auth.controller.js"));
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
    process.env.ADMIN_SECRET = originalAdminSecret;
    process.env.REFRESH_SECRET = originalRefreshSecret;
  });

  it("should return 200, a json message in loginRoute with jwt token", async () => {
    const email = "teste@email.com";
    const userMock = mockMongooseDoc({email});
    vi.mocked(User.findOne).mockResolvedValue(userMock);

    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(await new TextEncoder().encode(secret))
    const req = getMockReq({ headers: { authorization: `Bearer ${token}`}});
    const {res, next} = getMockRes();
    await loginRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Login bem-sucedido!"})
  });

  it("should return 200 and a json message in loginRoute with email and password", async () => {
    const email = "teste@email.com";
    const password = nanoid(8);
    const user = mockMongooseDoc({ _id: new Types.ObjectId(),email , password});
    vi.mocked(User.findOne).mockResolvedValue(user);
    vi.mocked(user?.comparePassword).mockResolvedValue(true);
    const req = getMockReq({ body: { email, password }});
    const { res, next } = getMockRes();
    await loginRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Login bem-sucedido!"});
    expect(res.cookie).toHaveBeenCalledTimes(2);
  });
})
