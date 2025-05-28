// @ts-check
import test, { getToken } from './test-fixtures.js';
import { expect } from '@playwright/test';

// Utilitário para criar reserva (evita repetição de código)
async function criarReserva(request, dados = reservaPadrao) {
  const response = await request.post('/booking', { data: dados });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return body.bookingid;
}

// Dados padrão para reserva
const reservaPadrao = {
  firstname: 'John',
  lastname: 'Doe',
  totalprice: 150,
  depositpaid: true,
  bookingdates: {
    checkin: '2023-10-01',
    checkout: '2023-10-10'
  },
  additionalneeds: 'Breakfast'
};

const ID_INEXISTENTE = 999999;

// Testes de reservas

test.describe('Reserva', () => {
  test('deve retornar reservas cadastradas', async ({ request }) => {
    const response = await request.get('/booking');
    const bookings = await response.json();
    expect(Array.isArray(bookings)).toBeTruthy();
    expect(bookings.length).toBeGreaterThan(0);
    bookings.forEach(item => {
      expect(item).toHaveProperty('bookingid');
    });
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });
});

test.describe('Reserva por ID', () => {
  test('deve consultar reserva existente', async ({ request }) => {
    const bookingid = await criarReserva(request, {
      firstname: 'Maria',
      lastname: 'Silva',
      totalprice: 200,
      depositpaid: false,
      bookingdates: {
        checkin: '2024-06-01',
        checkout: '2024-06-05'
      },
      additionalneeds: 'Lunch'
    });
    const response = await request.get(`/booking/${bookingid}`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const responseJson = await response.json();
    expect(responseJson).toMatchObject({
      firstname: 'Maria',
      lastname: 'Silva',
      totalprice: 200,
      depositpaid: false,
      additionalneeds: 'Lunch',
      bookingdates: {
        checkin: '2024-06-01',
        checkout: '2024-06-05'
      }
    });
    expect(new Date(responseJson.bookingdates.checkin).toString()).not.toBe('Invalid Date');
    expect(new Date(responseJson.bookingdates.checkout).toString()).not.toBe('Invalid Date');
  });

  test('deve retornar 404 para reserva inexistente', async ({ request }) => {
    const response = await request.get(`/booking/${ID_INEXISTENTE}`);
    expect(response.status()).toBe(404);
  });
});

test.describe('Reserva - Criação de Reserva', () => {
  test('deve criar reserva com dados válidos', async ({ request }) => {
    const bookingid = await criarReserva(request);
    expect(typeof bookingid).toBe('number');
  });
});

test.describe('Reserva - Exclusão de Reserva', () => {
  test('deve excluir uma reserva existente com autenticação', async ({ request }) => {
    // Cria uma reserva para garantir que existe
    const bookingid = await criarReserva(request);
    // Obtém o token de autenticação
    const token = await getToken(request);
    // Faz a exclusão autenticada
    const response = await request.delete(`/booking/${bookingid}`, {
      headers: {
        Cookie: `token=${token}`
      }
    });
    expect(response.status()).toBe(201); // 201 = Deleted
  });
});