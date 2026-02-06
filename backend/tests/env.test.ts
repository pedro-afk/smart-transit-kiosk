import { env } from '../src/config/env';

describe('Environment Configuration', () => {
  it('should have PORT defined', () => {
    expect(env.PORT).toBeDefined();
    expect(typeof env.PORT).toBe('string');
  });

  it('should have DATABASE_URL defined', () => {
    expect(env.DATABASE_URL).toBeDefined();
    expect(typeof env.DATABASE_URL).toBe('string');
    expect(env.DATABASE_URL).toMatch(/^postgresql:\/\//);
  });
});