require('dotenv').config();
const express = require('express');
const cors = require('cors');
const subdomainMiddleware = require('./middleware/subdomainMiddleware');
const tenantMiddleware = require('./middleware/tenantMiddleware');

const app = express();

app.use(subdomainMiddleware);
app.use(tenantMiddleware);

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log('🌐', new Date().toLocaleString(), req.method, req.originalUrl);
    next();
});

app.use(subdomainMiddleware);
app.use(tenantMiddleware);

try {
    const routes = require('./routes');
    app.use('/api', routes);
    console.log('✅ Rotas carregadas com sucesso');
} catch (error) {
    console.error('❌ Erro ao carregar rotas:', error.message);
}

app.get('/', (req, res) => {
    res.json({ 
        message: 'Bem-vindo à API da MultiClinic',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: {
                login: 'POST /api/auth/login',
                cadastro: 'POST /api/auth/cadastrar-usuario'
            }
        }
    });
});

app.use((err, req, res, next) => {
    console.error('💥 Erro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

module.exports = app;