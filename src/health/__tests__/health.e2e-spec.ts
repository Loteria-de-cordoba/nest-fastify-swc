import request from 'supertest';
import { app } from '../../../test/setup-e2e';

describe('HealthController (e2e)', () => {
  it('/api/health (GET) → should return 200', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
  });
});
