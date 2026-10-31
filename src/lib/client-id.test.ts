import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `client-id` lee localStorage dentro de la función, así que podemos
 * sustituirlo sin necesidad de jsdom ni de un navegador real.
 */
function installStorage(impl?: Pick<Storage, 'getItem' | 'setItem'>) {
  const store = new Map<string, string>();
  const storage = impl ?? {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
  });
  return store;
}

describe('getSessionId', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    // @ts-expect-error limpieza del stub entre pruebas
    delete globalThis.localStorage;
  });

  it('genera un identificador la primera vez y lo reutiliza después', async () => {
    installStorage();
    const { getSessionId } = await import('./client-id');

    const first = getSessionId();
    const second = getSessionId();

    expect(first.length).toBeGreaterThanOrEqual(8);
    expect(second).toBe(first);
  });

  it('descarta identificadores guardados demasiado cortos', async () => {
    const store = installStorage();
    store.set('oxy-session-id', 'corto');
    const { getSessionId } = await import('./client-id');

    const id = getSessionId();

    expect(id).not.toBe('corto');
    expect(id.length).toBeGreaterThanOrEqual(8);
  });

  it('no rompe la página si el almacenamiento está bloqueado', async () => {
    installStorage({
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('bloqueado');
      },
    });
    const { getSessionId } = await import('./client-id');

    expect(() => getSessionId()).not.toThrow();
    expect(getSessionId()).toBe('');
  });
});
