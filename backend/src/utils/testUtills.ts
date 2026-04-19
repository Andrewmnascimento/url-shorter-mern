import { vi } from "vitest";

export const mockMongooseDoc = <T>(data: T) => {
  return {
    ...data,
    toObject: vi.fn().mockReturnValue(data),
    toJSON: vi.fn().mockReturnValue(data),
    save: vi.fn().mockResolvedValue(data),
    comparePassword: vi.fn().mockReturnValue(data)
  } as any
};