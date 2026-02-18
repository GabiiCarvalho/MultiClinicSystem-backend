const express = require('express');
const app = require('./app');

console.log('🔍 Testando rotas registradas...\n');

// Função para listar todas as rotas registradas
function listRoutes(stack, basePath = '') {
  const routes = [];
  
  stack.forEach(layer => {
    if (layer.route) {
      // Rotas regulares
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      const path = basePath + layer.route.path;
      routes.push({ method: methods, path });
    } else if (layer.name === 'router' && layer.handle.stack) {
      // Rotas de router
      const routerPath = layer.regexp.source
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/')
        .replace(/\^/g, '')
        .replace(/\?/g, '')
        .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':param');
      
      listRoutes(layer.handle.stack, basePath + routerPath).forEach(route => {
        routes.push(route);
      });
    }
  });
  
  return routes;
}

// Listar todas as rotas
const routes = listRoutes(app._router.stack);

console.log('📋 Rotas registradas:');
routes.sort((a, b) => a.path.localeCompare(b.path)).forEach(route => {
  console.log(`  ${route.method.padEnd(6)} ${route.path}`);
});

console.log('\n🔍 Verificando rota de login:');
const loginRoute = routes.find(r => r.path.includes('/api/auth/login'));
if (loginRoute) {
  console.log('✅ Rota /api/auth/login encontrada!');
  console.log('   Método:', loginRoute.method);
  console.log('   Path:', loginRoute.path);
} else {
  console.log('❌ Rota /api/auth/login NÃO encontrada!');
}

console.log('\n📝 Para testar a rota de login:');
console.log('curl -X POST http://localhost:3001/api/auth/login \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"email":"teste@teste.com","senha":"123456"}\'');