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

vi.mock('../models/user.model.js', () => {
  const mockFindOne = vi.fn();
  const MockUser: any = function (this: any, doc: any) {
    Object.assign(this, doc);
    // ensure an _id exists and has toString()
    this._id = this._id ?? new (require('mongoose').Types.ObjectId)();
    this.save = vi.fn().mockResolvedValue(this);
    this.comparePassword = vi.fn();
  };
  MockUser.findOne = mockFindOne;
  return { User: MockUser };
});

describe("Auth Controller", () => {
  let loginRoute: typeof import("./auth.controller.js").loginRoute;
  let registerRoute: typeof import("./auth.controller.js").registerRoute;
  let logoutRoute: typeof import("./auth.controller.js").logoutRoute;
  let refreshRoute: typeof import("./auth.controller.js").refreshRoute;

  beforeAll(async () => {
    process.env.JWT_SECRET = secret;
    process.env.ADMIN_SECRET = secret;
    process.env.REFRESH_SECRET = secret;
    ({ loginRoute, registerRoute, logoutRoute, refreshRoute } = await import("./auth.controller.js"));
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
    process.env.ADMIN_SECRET = originalAdminSecret;
    process.env.REFRESH_SECRET = originalRefreshSecret;
  });

  describe("loginRoute", () => {
    it("should return 200 with valid Bearer token", async () => {
      const email = "teste@email.com";
      const userMock = mockMongooseDoc({ email });
      vi.mocked((User as any).findOne).mockResolvedValue(userMock);

      const token = await new SignJWT({ email })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(await new TextEncoder().encode(secret));

      const req = getMockReq({ headers: { authorization: `Bearer ${token}` } });
      const { res, next } = getMockRes();
      await loginRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Login bem-sucedido!" });
    });

    it("should return 200 and set cookies when using email and password", async () => {
      const email = "teste@email.com";
      const password = "Aa1!abcd";
      const user = mockMongooseDoc({ _id: new Types.ObjectId(), email, password });
      vi.mocked((User as any).findOne).mockResolvedValue(user);
      vi.mocked(user.comparePassword).mockResolvedValue(true);

      const req = getMockReq({ body: { email, password } });
      const { res, next } = getMockRes();
      await loginRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Login bem-sucedido!" });
      expect(res.cookie).toHaveBeenCalledTimes(2);
    });
  });

  describe("registerRoute", () => {
    it("should return 401 when email or password missing or invalid", async () => {
      const req = getMockReq({ body: {} });
      const { res, next } = getMockRes();
      await registerRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Insira um nome, email e senha" });
    });

    it("should return 400 when password doesn't meet requirements", async () => {
      vi.mocked((User as any).findOne).mockResolvedValue(null);
      const req = getMockReq({ body: { email: "user@test.com", password: "short" } });
      const { res, next } = getMockRes();
      await registerRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it("should return 400 when email already exists", async () => {
      const email = "exist@test.com";
      vi.mocked((User as any).findOne).mockResolvedValue(mockMongooseDoc({ email }));
      const req = getMockReq({ body: { email, password: "Aa1!abcd" } });
      const { res, next } = getMockRes();
      await registerRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email já cadastrado!" });
    });

    it("should create user, set cookies and return 201 on success", async () => {
      vi.mocked((User as any).findOne).mockResolvedValue(null);
      const req = getMockReq({ body: { email: "new@test.com", password: "Aa1!abcd" }, cookies: {} });
      const { res, next } = getMockRes();
      await registerRoute(req, res, next);

      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Usuario criado com sucesso!" });
    });
  });

  describe("logoutRoute", () => {
    it("should return 400 when no refresh token provided", async () => {
      const req = getMockReq({ cookies: {} });
      const { res, next } = getMockRes();
      await logoutRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Nenhum token de atualização encontrado!" });
    });

    it("should return 400 when refresh token invalid", async () => {
      vi.mocked((User as any).findOne).mockResolvedValue(null);
      const req = getMockReq({ cookies: { refreshToken: 'invalid' } });
      const { res, next } = getMockRes();
      await logoutRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Token de atualização inválido!" });
    });

    it("should clear cookies and return 200 on successful logout", async () => {
      const user = mockMongooseDoc({ _id: new Types.ObjectId(), refreshToken: 'tok' });
      vi.mocked((User as any).findOne).mockResolvedValue(user);
      const req = getMockReq({ cookies: { refreshToken: 'tok' } });
      const { res, next } = getMockRes();
      await logoutRoute(req, res, next);

      expect(res.clearCookie).toHaveBeenCalledWith("accessToken", { path: "/" });
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", { path: "/" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Logout bem-sucedido!" });
    });
  });

  describe("refreshRoute", () => {
    it("should return 400 when no refresh token cookie", async () => {
      const req = getMockReq({ cookies: {} });
      const { res, next } = getMockRes();
      await refreshRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Nenhum token de atualização fornecido!" });
    });

    it("should return 400 when refresh token not linked to any user", async () => {
      vi.mocked((User as any).findOne).mockResolvedValue(null);
      const req = getMockReq({ cookies: { refreshToken: 'tok' } });
      const { res, next } = getMockRes();
      await refreshRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Token de atualização inválido!" });
    });

    it("should return 400 when provided refresh token is invalid", async () => {
      const user = mockMongooseDoc({ _id: new Types.ObjectId(), refreshToken: 'tok' });
      vi.mocked((User as any).findOne).mockResolvedValue(user);
      const req = getMockReq({ cookies: { refreshToken: 'invalid-token' } });
      const { res, next } = getMockRes();
      await refreshRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Token de atualização inválido!" });
    });

    it("should set new cookies and return 200 on successful refresh", async () => {
      const user = mockMongooseDoc({ _id: new Types.ObjectId(), email: 'r@test.com' });
      const refreshToken = await new SignJWT({ id: user._id.toString() })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(await new TextEncoder().encode(secret));
      vi.mocked((User as any).findOne).mockResolvedValue(user);

      const req = getMockReq({ cookies: { refreshToken } });
      const { res, next } = getMockRes();
      await refreshRoute(req, res, next);

      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Refresh enviado com sucesso" });
    });
  });
});
