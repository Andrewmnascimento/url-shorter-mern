import { describe, it, expect, vi } from "vitest";

vi.mock('prom-client', () => ({
  default: {
    collectDefaultMetrics: vi.fn(),
    register: {
      contentType: 'text/plain',
      metrics: vi.fn().mockResolvedValue('metric-data')
    }
  }
}));

import { metricsController } from './metrics.controller.js';

describe('Metrics Controller', () => {
  it('sets content-type and returns metrics', async () => {
    const req: any = {};
    const res: any = { set: vi.fn().mockReturnThis(), end: vi.fn() };

    await metricsController(req, res);

    expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/plain');
    expect(res.end).toHaveBeenCalledWith('metric-data');
  });
});
