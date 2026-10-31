import { expect, test, type Page } from '@playwright/test';

/**
 * Comprobaciones de accesibilidad que se pueden automatizar sin ambigüedad:
 * idioma, texto alternativo, nombre accesible en controles, jerarquía de
 * encabezados y orden de tabulación.
 *
 * No sustituye una auditoría WCAG 2.2 AA completa (contraste medido, lector de
 * pantalla real), pero atrapa las regresiones más comunes.
 */

interface Issue {
  rule: string;
  detail: string;
}

async function auditPage(page: Page): Promise<Issue[]> {
  return page.evaluate(() => {
    const issues: { rule: string; detail: string }[] = [];

    // 1. Imágenes sin texto alternativo
    document.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('alt')) {
        issues.push({ rule: 'img-alt', detail: img.getAttribute('src') ?? '(sin src)' });
      }
    });

    // 2. Controles de formulario sin nombre accesible
    const controls = document.querySelectorAll<HTMLElement>(
      'input:not([type="hidden"]), select, textarea'
    );
    controls.forEach((el) => {
      const input = el as HTMLInputElement;
      const hasLabel =
        (input.labels && input.labels.length > 0) ||
        el.hasAttribute('aria-label') ||
        el.hasAttribute('aria-labelledby') ||
        el.hasAttribute('title') ||
        el.getAttribute('placeholder') !== null;
      if (!hasLabel) {
        issues.push({
          rule: 'control-name',
          detail: `${el.tagName.toLowerCase()}#${el.id || '(sin id)'}`,
        });
      }
    });

    // 3. Botones sin nombre accesible
    document.querySelectorAll('button').forEach((btn) => {
      const name =
        btn.textContent?.trim() ||
        btn.getAttribute('aria-label') ||
        btn.getAttribute('title');
      if (!name) {
        issues.push({ rule: 'button-name', detail: btn.className.slice(0, 60) });
      }
    });

    // 4. Enlaces sin texto ni nombre accesible
    document.querySelectorAll('a').forEach((a) => {
      const name =
        a.textContent?.trim() ||
        a.getAttribute('aria-label') ||
        a.getAttribute('title');
      if (!name) {
        issues.push({ rule: 'link-name', detail: a.getAttribute('href') ?? '(sin href)' });
      }
    });

    // 5. tabindex positivo: rompe el orden natural del teclado
    document.querySelectorAll('[tabindex]').forEach((el) => {
      const value = Number(el.getAttribute('tabindex'));
      if (value > 0) {
        issues.push({ rule: 'tabindex-positive', detail: `${el.tagName.toLowerCase()} tabindex=${value}` });
      }
    });

    // 6. Saltos en la jerarquía de encabezados (h1 → h3 sin h2)
    const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) =>
      Number(h.tagName[1])
    );
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) {
        issues.push({ rule: 'heading-order', detail: `h${levels[i - 1]} → h${levels[i]}` });
      }
    }

    return issues;
  });
}

const PAGES = ['/', '/gallery', '/services', '/spaces', '/booking', '/calendar'];

test.describe('Accesibilidad — sitio público', () => {
  for (const path of PAGES) {
    test(`${path} no tiene problemas automáticos de accesibilidad`, async ({ page }) => {
      await page.goto(path);
      // `getByRole` ignora lo oculto: en móvil algunos h2 decorativos no se muestran.
      await expect(page.getByRole('heading').first()).toBeVisible();

      const issues = await auditPage(page);
      expect(issues, `Problemas en ${path}: ${JSON.stringify(issues, null, 2)}`).toEqual([]);
    });
  }

  test('cada página pública tiene exactamente un h1', async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      // `toHaveCount` reintenta: evita medir antes de que React monte.
      await expect(page.locator('h1'), `${path} debe tener un solo h1`).toHaveCount(1);
    }
  });

  test('el foco del teclado es visible en el primer control', async ({ page }) => {
    await page.goto('/booking');
    await expect(page.locator('#name')).toBeVisible();

    // El primer Tab puede caer en el documento; se avanza hasta tocar un control.
    let focused = null;
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          outlineWidth: style.outlineWidth,
          outlineStyle: style.outlineStyle,
          boxShadow: style.boxShadow,
        };
      });
      if (focused) break;
    }

    expect(focused).not.toBeNull();
    const hasVisibleFocus =
      (focused!.outlineStyle !== 'none' && focused!.outlineWidth !== '0px') ||
      (focused!.boxShadow && focused!.boxShadow !== 'none');
    expect(hasVisibleFocus, `Foco no visible en ${JSON.stringify(focused)}`).toBe(true);
  });
});

test.describe('Accesibilidad — panel', () => {
  test.beforeEach(async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 1024, 'El panel se prueba en escritorio');
    await page.goto('/login');
    await page.fill('#login-email', 'demo@ejemplo.com');
    await page.fill('#login-password', 'demo1234');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/admin$/);
  });

  for (const path of ['/admin', '/admin/solicitudes', '/admin/finanzas', '/admin/configuracion']) {
    test(`${path} no tiene problemas automáticos`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('main, section, .panel').first()).toBeVisible();
      // Deja que los datos de demostración terminen de pintar.
      await page.waitForTimeout(400);

      const issues = await auditPage(page);
      expect(issues, `Problemas en ${path}: ${JSON.stringify(issues, null, 2)}`).toEqual([]);
    });
  }
});
