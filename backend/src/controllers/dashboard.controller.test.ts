import { describe, it, expect, vi } from "vitest";
import { URL } from "../models/url.model.js";
import { User } from "../models/user.model.js";
import { dashboardRoute } from "./dashboard.controller.js";
import { Types } from 'mongoose';

vi.mock('../models/user.model.js', () => ({
  User: {
    findOne: vi.fn(),
  }
}));

vi.mock('../models/url.model.js', () => ({
  URL: {
    aggregate: vi.fn()
  }
}));

describe('Dashboard Controller', () => {
  it('returns 401 when no authenticated user', async () => {
    const req: any = {};
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next: any = vi.fn();

    await dashboardRoute(req, res,next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Usuário não autenticado" });
  });

  it('returns 400 when user not found', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null as any);
    const req: any = { user: { email: 'no@one.test' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next:any  = vi.fn();

    await dashboardRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Este usuario não existe no banco de dados" });
  });

  it('returns dashboard data on success', async () => {
    const fakeAggregateResult = [{ summary: [{ totalUrls: 2, totalClicks: 5 }], timeseries: [], countries: [], devices: [], urls: [] }];
    vi.mocked(User.findOne).mockResolvedValue({ _id: new Types.ObjectId() } as any);
    vi.mocked((URL as any).aggregate).mockResolvedValue(fakeAggregateResult as any);

    const req: any = { user: { email: 'user@test' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next: any = vi.fn();

    await dashboardRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    const sent = vi.mocked(res.json).mock.calls[0][0];
    expect(sent).toHaveProperty('meta');
    expect(sent).toHaveProperty('summary');
  });
});
