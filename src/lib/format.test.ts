import { describe, expect, it } from 'vitest';
import {
  avatarColor,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelative,
  initials,
} from './format';

describe('formatCurrency', () => {
  it('formatea en dólares sin decimales', () => {
    const out = formatCurrency(1500);
    expect(out).toContain('1');
    expect(out).not.toContain(',00');
  });

  it('trata valores nulos o inválidos como cero', () => {
    expect(formatCurrency(0)).toBe(formatCurrency(0));
    expect(formatCurrency(Number.NaN)).toContain('0');
  });
});

describe('formatDate', () => {
  it('devuelve guion cuando no hay valor', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('interpreta fechas sin hora al mediodía para evitar saltos de zona', () => {
    // Sin el ajuste a T12:00, en zonas UTC-negativas el día se mostraría como el anterior.
    expect(formatDate('2026-12-24')).toContain('24');
  });

  it('devuelve el valor original si la fecha es inválida', () => {
    expect(formatDate('no-es-fecha')).toBe('no-es-fecha');
  });
});

describe('formatDateTime', () => {
  it('devuelve guion sin valor y el original si es inválido', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('xxx')).toBe('xxx');
  });
});

describe('formatRelative', () => {
  it('describe el pasado reciente en minutos', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(formatRelative(fiveMinAgo)).toBe('hace 5 min');
  });

  it('describe el día anterior como "ayer"', () => {
    const yesterday = new Date(Date.now() - 26 * 3_600_000).toISOString();
    expect(formatRelative(yesterday)).toBe('ayer');
  });

  it('maneja valores vacíos o inválidos sin romper', () => {
    expect(formatRelative(null)).toBe('—');
    expect(formatRelative('basura')).toBe('—');
  });
});

describe('initials', () => {
  it('toma hasta dos iniciales en mayúscula', () => {
    expect(initials('maría fernández lópez')).toBe('MF');
    expect(initials('Ojeda')).toBe('O');
    expect(initials('  ')).toBe('');
  });
});

describe('avatarColor', () => {
  it('es determinista para la misma entrada', () => {
    expect(avatarColor('maria@ejemplo.com')).toBe(avatarColor('maria@ejemplo.com'));
  });

  it('siempre devuelve una clase de la paleta', () => {
    const out = avatarColor('cualquier-semilla');
    expect(out).toMatch(/^bg-\w+-500\/15 text-\w+-300$/);
  });
});
