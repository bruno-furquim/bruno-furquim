// @ts-check
import { test as base } from '@playwright/test';

// Função utilitária para obter o token de autenticação
export async function getToken(request) {
  const response = await request.post('/auth', {
    data: {
      username: 'admin',
      password: 'password123'
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const body = await response.json();
  return body.token;
}

const test = base;

// Exemplo de uso do token em uma chamada autenticada:
// test('Exemplo de requisição autenticada', async ({ request, token }) => {
//   const response = await request.post('/booking', {
//     data: { ... },
//     headers: {
//       Cookie: `token=${token}`
//     }
//   });
//   // ...asserts
// });

export default test;
