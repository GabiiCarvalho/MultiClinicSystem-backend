const app = require('../app');

function checkRoutes() {
  console.log('🔍 Verificando rotas registradas para Clínica Odontológica...\n');
  
  // Lista de rotas que deveriam existir no novo sistema
  const expectedRoutes = [
    // Auth
    'POST /api/auth/login',
    'POST /api/auth/cadastrar-usuario',
    
    // Usuários
    'GET /api/usuarios',
    'GET /api/usuarios/dentistas',
    'POST /api/usuarios',
    'GET /api/usuarios/:usuarioId',
    'PUT /api/usuarios/:usuarioId',
    'DELETE /api/usuarios/:usuarioId',
    
    // Lojas
    'GET /api/lojas',
    'GET /api/lojas/estatisticas',
    'GET /api/lojas/:lojaId',
    'PUT /api/lojas/:lojaId',
    
    // Pacientes
    'GET /api/pacientes',
    'POST /api/pacientes',
    'GET /api/pacientes/buscar/:termo',
    'GET /api/pacientes/:pacienteId',
    'PUT /api/pacientes/:pacienteId',
    'GET /api/pacientes/:pacienteId/agendamentos',
    
    // Dentistas
    'GET /api/dentistas',
    'POST /api/dentistas',
    'GET /api/dentistas/:dentistaId',
    'PUT /api/dentistas/:dentistaId',
    'GET /api/dentistas/:dentistaId/agendamentos',
    
    // Categorias
    'GET /api/categorias',
    'POST /api/categorias',
    'GET /api/categorias/:categoriaId',
    'PUT /api/categorias/:categoriaId',
    'GET /api/categorias/:categoriaId/procedimentos',
    
    // Procedimentos
    'GET /api/procedimentos',
    'POST /api/procedimentos',
    'GET /api/procedimentos/:procedimentoId',
    'PUT /api/procedimentos/:procedimentoId',
    'PATCH /api/procedimentos/:procedimentoId/status',
    
    // Agendamentos
    'GET /api/agendamentos',
    'POST /api/agendamentos',
    'GET /api/agendamentos/:agendamentoId',
    'PUT /api/agendamentos/:agendamentoId/status',
    
    // Vendas
    'GET /api/vendas',
    'POST /api/vendas',
    'GET /api/vendas/:vendaId',
    'DELETE /api/vendas/:vendaId',
    'GET /api/vendas/relatorio/periodo',
    'GET /api/vendas/relatorio/procedimentos',
    'GET /api/vendas/relatorio/dentista/:dentistaId',
    'GET /api/vendas/relatorio/pagamentos',
    
    // Dashboard
    'GET /api/dashboard',
    'GET /api/dashboard/financeiro',
    'GET /api/dashboard/procedimentos/:procedimentoId',
    'GET /api/dashboard/fluxo-pacientes',
    'GET /api/dashboard/dentistas/:dentistaId',
    
    // Materiais
    'GET /api/materiais',
    'POST /api/materiais',
    'GET /api/materiais/:materialId',
    'PUT /api/materiais/:materialId',
    'DELETE /api/materiais/:materialId',
    'GET /api/materiais/estoque/baixo',
    
    // Orçamentos
    'GET /api/orcamentos',
    'POST /api/orcamentos',
    'GET /api/orcamentos/:orcamentoId',
    'PUT /api/orcamentos/:orcamentoId/status',
    'GET /api/orcamentos/paciente/:pacienteId',
  ];

  console.log('📋 Rotas esperadas no sistema:');
  expectedRoutes.forEach(route => console.log('  -', route));
  
  console.log('\n🔧 Para testar as rotas:');
  console.log('  1. Execute as migrations: npx sequelize-cli db:migrate');
  console.log('  2. Popule o banco: node scripts/populate-database.js');
  console.log('  3. Gere um token: node scripts/generate-token.js admin@clinica.com');
  console.log('  4. Teste com curl ou Postman\n');
  
  console.log('📊 Exemplo de requisição:');
  console.log('  curl -X GET http://localhost:3001/api/health \\');
  console.log('    -H "Content-Type: application/json"\n');
  
  console.log('🔐 Para rotas protegidas, inclua o token:');
  console.log('  curl -X GET http://localhost:3001/api/pacientes \\');
  console.log('    -H "Authorization: Bearer SEU_TOKEN_AQUI" \\');
  console.log('    -H "Content-Type: application/json"');
}

checkRoutes();