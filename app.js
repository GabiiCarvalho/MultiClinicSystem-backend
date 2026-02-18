require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Configuração CORS correta
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization']
}));

// Importante: middleware para OPTIONS preflight
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log detalhado de todas as requisições
app.use((req, res, next) => {
    console.log('🌐', new Date().toLocaleString(), req.method, req.originalUrl);
    console.log('📦 Headers:', {
        origin: req.headers.origin,
        'content-type': req.headers['content-type'],
        authorization: req.headers.authorization ? 'Presente' : 'Ausente'
    });
    if (Object.keys(req.body).length > 0) {
        console.log('📦 Body:', req.body);
    }
    next();
});

// Importar e usar rotas
try {
    const routes = require('./routes');
    app.use('/api', routes);
    console.log('✅ Rotas carregadas com sucesso');
} catch (error) {
    console.error('❌ Erro ao carregar rotas:', error.message);
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor Rodando',
        timestamp: new Date().toISOString(),
        cors: {
            origin: req.headers.origin || 'unknown',
            method: req.method
        },
        endpoints: {
            pacientes: 'GET /api/pacientes',
            dentistas: 'GET /api/dentistas',
            procedimentos: 'GET /api/procedimentos',
            categorias: 'GET /api/categorias',
            auth: {
                login: 'POST /api/auth/login',
                cadastro: 'POST /api/auth/cadastrar-usuario'
            }
        }
    });
});

// Rota padrão
app.get('/', (req, res) => {
    res.json({ 
        message: 'Bem-vindo à API da MultiClinic',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            pacientes: '/api/pacientes',
            dentistas: '/api/dentistas',
            procedimentos: '/api/procedimentos',
            categorias: '/api/categorias',
            auth: {
                login: 'POST /api/auth/login',
                cadastro: 'POST /api/auth/cadastrar-usuario'
            }
        }
    });
});

// Middleware de erros
app.use((err, req, res, next) => {
    console.error('💥 Erro:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: err.message 
    });
});

// Rota não encontrada
app.use('*', (req, res) => {
    console.log('🔍 Rota não encontrada:', req.method, req.originalUrl);
    res.status(404).json({ 
        error: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: [
            'GET /api/health',
            'GET /api/pacientes',
            'GET /api/dentistas',
            'GET /api/procedimentos',
            'GET /api/categorias',
            'POST /api/auth/login',
            'POST /api/auth/cadastrar-usuario'
        ]
    });
});

module.exports = app;