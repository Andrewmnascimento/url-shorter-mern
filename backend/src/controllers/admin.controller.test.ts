import { describe, it, expect, vi } from "vitest";
import { statsRoute } from "./admin.controller.js";

describe('Admin Controller', () => {
  it('returns stats from req.stats', async () => {
    const fakeStats = { users: 10, urls: 5 };
    const req: any = { stats: { getMetrics: vi.fn().mockReturnValue(fakeStats) }, user: { email: 'a@b'} };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await statsRoute(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeStats);
  });
});
