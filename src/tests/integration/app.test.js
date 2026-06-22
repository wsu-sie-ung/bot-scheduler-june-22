import request from 'supertest'
import app from '../../app'

describe('App Integration Tests', () => {
  describe('GET /api/v1', () => {
    it('should return 200 and ok', async () => {
      const res = await request(app).get('/api/v1')
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ message: 'ok' })
    })
  })

  describe('GET /not-found', () => {
    it('should return 404', async () => {
      const res = await request(app).get('/not-found')
      expect(res.status).toBe(404)
      expect(res.body).toMatchObject({
        success: false,
        message: 'Not Found',
      })
    })
  })
})
