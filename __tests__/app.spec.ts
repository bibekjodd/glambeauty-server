import app from '@/app';
import supertest from 'supertest';

describe('app', () => {
  describe('given the server has started', () => {
    it('index route should return 200', async () => {
      await supertest(app).get('/').expect(200);
    });
  });

  describe('given the route does not exist', () => {
    it('should return 404', async () => {
      await supertest(app).get('/unknown').expect(404);
    });
  });
});
