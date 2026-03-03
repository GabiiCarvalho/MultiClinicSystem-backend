const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('../../config/database');

/**
 *  POST /auth/clinica/login
 *  Login da CLÍNICA (com CNPJ + email + senha)
 */

const loginClinica = async (req, res) => {
    const { email, cnpj, senha } = req.body;

    if (!email || !cnpj || !senha) {
        return res.status(400).json({ error: 'Email, CNPJ e senha obrigatórios' });
    }

    try {
        // Normaliza CNPJ (remove . / - )
        const cnpjLimpo = cnpj.replace(/\D/g, '');

        const { rows } = await database.query(
            `SELECT id, nome, email, cnpj, senha_hash, ativo
             FROM clinicas
             WHERE email = $1 AND cnpj = $2`,
             [email.toLowerCase().trim(), `%${cnpjLimpo}%`]
        );

        const clinica = rows[0];
        if (!clinica) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        if (!clinica.ativo) {
            return res.status(403).json({ error: 'Clínica inativa.' });
        }

        const senhaOk = await bcrypt.compare(senha, clinica.senha_hash);
        if (!senhaOk) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            {
                id: clinica.id,
                clinica_id: clinica.id,
                cargo: 'gestor',
                nome: clinica.nome,
                email: clinica.email,
                tipo: 'clinica',
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                id: clinica.id,
                clinica_id: clinica.id,
                nome: clinica.nome,
                email: clinica.email,
                cargo: 'gestor',
                tipo: 'clinica',
            }
        });
    } catch (error) {
        console.error('Erro login clínica: ', error);
        res.status(500).json({ error: 'Erro interno '});
    }
};

/**
 *  POST /auth/login
 *  Login de USUÁRIO (dentista, atendente, gestor, financeiro, etc.)
 *  Usar email + senha - a clínica é identificada pelo cadastro
 */

const loginUsuario = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha obrigatórios' });
    }

    try {
        const {rows} = await database.query(
            `SELECT u.id, u.clinica_id, u.nome, u.email, u.cargo,
            u.especialidade, u.senha_hash, u.ativo,
            c.nome AS clinica_nome
            FROM usuarios u
            JOIN clinicas c ON c.id = u.clinica_id
            WHERE u.email = $1`,
            [email.toLowerCase().trim()]
        );

        const usuario = rows[0];
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        if (!usuario.ativo) {
            return res.status(403).json({ error: 'Usuário inativo. Contate o gestor.' });
        }

        const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaOk) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                clinica_id: usuario.clinica_id,
                cargo: usuario.cargo,
                nome: usuario.nome,
                email: usuario.email,
                especialidade: usuario.especialidade,
                tipo: 'usuario',
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                id: usuario.id,
                clinica_id: usuario.clinica_id,
                nome: usuario.nome,
                email: usuario.email,
                cargo: usuario.cargo,
                especialidade: usuario.especialidade,
                clinica_nome: usuario.clinica_nome,
                tipo: 'usuario',
            }
        });
    } catch (error) {
        console.error('Erro login usuário: ', error);
    }
};

/**
 *  GET /auth/me
 *  Retorna dados do usuário logado (usado no frontend ao recarregar)
 */

const getMe = async (req, res) => {
    try {
        const { id, tipo, clinica_id } = req.user;

        if (tipo === 'clinica') {
            const { rows } = await database.query(
                'SELECT id, nome, email, cnpj, telefone, endereco FROM clinicas WHERE id = $1',
                [id]
            );
            return res.json({ ...rows[0], cargo: 'gestor', tipo: 'clinica', clinica_id: id});
        }

        const { rows } = await database.query(
            `SELECT u.id, u.clinica_id, u.nome, u.email, u.cargo, u.especialidade,
            c.nome AS clinica_nome
            FROM usuarios u
            JOIN clinicas c ON c.id = u.clinica_id
            WHERE u.id = $1 AND u.clinica_id = $2`,
            [id, clinica_id]
        );

        if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json({ ...rows[0], tipo: 'Usuario' });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno' });
    }
};

module.exports = { loginClinica, loginUsuario, getMe };