const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const SECRET_KEY = 'clave_secreta_playlist4me';
const usersDB = [];

const verifyToken = (rolesPermitidos) => (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'Token requerido' });
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });
        if (rolesPermitidos && !rolesPermitidos.includes(decoded.role)) return res.status(403).json({ error: 'Sin permisos' });
        req.user = decoded;
        next();
    });
};

app.post('/api/register', (req, res) => {
    const { username, password, role = 'usuario' } = req.body;
    if (usersDB.find(u => u.username === username)) return res.status(400).json({ error: 'Usuario existe' });
    usersDB.push({ username, password, role });
    res.status(201).json({ message: `Registrado como ${role}` });
});

app.post('/api/login', (req, res) => {
    const user = usersDB.find(u => u.username === req.body.username && u.password === req.body.password);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    res.json({ token: jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' }) });
});

app.get('/api/conversiones', verifyToken(['usuario', 'administrador']), (req, res) => res.json({ message: 'Ruta de conversión permitida' }));
app.get('/api/admin/metricas', verifyToken(['administrador']), (req, res) => res.json({ message: 'Métricas permitidas' }));

if (process.env.NODE_ENV !== 'test') app.listen(3000, () => console.log('Servidor en puerto 3000'));
module.exports = app;
