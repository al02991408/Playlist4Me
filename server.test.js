const request = require('supertest');
const app = require('./server');

describe('API Auth', () => {
    let token = '';
    it('Registra usuario', async () => {
        const res = await request(app).post('/api/register').send({ username: 'test', password: '123', role: 'usuario' });
        expect(res.statusCode).toEqual(201);
    });
    it('Login devuelve JWT', async () => {
        const res = await request(app).post('/api/login').send({ username: 'test', password: '123' });
        expect(res.statusCode).toEqual(200);
        token = res.body.token;
    });
    it('Bloquea acceso sin token', async () => {
        const res = await request(app).get('/api/conversiones');
        expect(res.statusCode).toEqual(403);
    });
    it('Permite acceso con token', async () => {
        const res = await request(app).get('/api/conversiones').set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});
