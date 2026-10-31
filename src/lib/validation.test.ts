import { describe, expect, it } from 'vitest';
import {
  isHoneypotTripped,
  isSubmissionTooFast,
  isValid,
  phoneDigits,
  validateInquiry,
  type InquiryFormValues,
} from './validation';

const TODAY = '2026-10-29';

const valid: InquiryFormValues = {
  name: 'María Fernández',
  email: 'maria@ejemplo.com',
  phone: '+58 424-1234567',
  eventDate: '2026-12-24',
  consent: true,
};

describe('validateInquiry', () => {
  it('acepta un formulario completo y correcto', () => {
    const errors = validateInquiry(valid, TODAY);
    expect(errors).toEqual({});
    expect(isValid(errors)).toBe(true);
  });

  it('rechaza nombres demasiado cortos', () => {
    expect(validateInquiry({ ...valid, name: ' Al ' }, TODAY).name).toBeDefined();
  });

  it('acepta nombres con acentos y espacios internos', () => {
    expect(validateInquiry({ ...valid, name: 'José Ángel' }, TODAY).name).toBeUndefined();
  });

  it.each([
    ['sin arroba', 'correo.com'],
    ['sin dominio', 'correo@'],
    ['sin extensión', 'correo@dominio'],
    ['con espacio', 'co rreo@dominio.com'],
    ['vacío', ''],
  ])('rechaza correo %s', (_label, email) => {
    expect(validateInquiry({ ...valid, email }, TODAY).email).toBeDefined();
  });

  it('rechaza teléfonos con menos de 7 dígitos', () => {
    expect(validateInquiry({ ...valid, phone: '12345' }, TODAY).phone).toBeDefined();
  });

  it('cuenta solo dígitos, ignorando espacios, guiones y paréntesis', () => {
    expect(phoneDigits('(+58) 424-123.45.67')).toBe('584241234567');
    expect(validateInquiry({ ...valid, phone: '(0424) 123.45.67' }, TODAY).phone).toBeUndefined();
  });

  it('rechaza fechas pasadas', () => {
    expect(validateInquiry({ ...valid, eventDate: '2026-10-28' }, TODAY).eventDate).toBeDefined();
  });

  it('acepta la fecha de hoy y fechas futuras', () => {
    expect(validateInquiry({ ...valid, eventDate: TODAY }, TODAY).eventDate).toBeUndefined();
    expect(validateInquiry({ ...valid, eventDate: '2027-01-15' }, TODAY).eventDate).toBeUndefined();
  });

  it('permite dejar la fecha vacía (es opcional)', () => {
    expect(validateInquiry({ ...valid, eventDate: '' }, TODAY).eventDate).toBeUndefined();
  });

  it('exige autorización de contacto', () => {
    expect(validateInquiry({ ...valid, consent: false }, TODAY).consent).toBeDefined();
  });

  it('acumula todos los errores de una vez, no solo el primero', () => {
    const errors = validateInquiry(
      { name: 'a', email: 'x', phone: '1', eventDate: '2020-01-01', consent: false },
      TODAY
    );
    expect(Object.keys(errors).sort()).toEqual(['consent', 'email', 'eventDate', 'name', 'phone']);
  });
});

describe('anti-bot', () => {
  it('detecta el campo trampa lleno', () => {
    expect(isHoneypotTripped('http://spam.example')).toBe(true);
    expect(isHoneypotTripped('   ')).toBe(false);
    expect(isHoneypotTripped('')).toBe(false);
  });

  it('marca como sospechoso un envío instantáneo', () => {
    expect(isSubmissionTooFast(1_000, 1_100)).toBe(true);
    expect(isSubmissionTooFast(1_000, 1_000 + 2_500)).toBe(false);
    expect(isSubmissionTooFast(1_000, 9_000)).toBe(false);
  });
});
