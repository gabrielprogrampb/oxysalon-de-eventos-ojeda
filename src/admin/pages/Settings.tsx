/**
 * Configuración: cuenta, seguridad, preferencias, equipo y estado del sistema.
 * Nada aquí es decorativo: cada control ejecuta una acción real o explica por
 * qué no está disponible en el entorno actual.
 */
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../AdminLayout';
import { supabase } from '../../lib/supabase';
import { isDemo } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { useTheme, type ThemeMode } from '../../lib/theme';
import { getSystemHealth, listTeam } from '../../lib/admin';
import { useAsyncData } from '../../lib/useAsync';
import { formatDateTime } from '../../lib/format';
import { SITE, hasEmail, hasPhone, hasWhatsApp, socialLinks } from '../../config/site';
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Glyph,
  Input,
  LoadingBlock,
  Progress,
  Segmented,
  Skeleton,
  Tabs,
  useToast,
} from '../../ui';

const TABS = [
  { id: 'cuenta', label: 'Cuenta' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'preferencias', label: 'Preferencias' },
  { id: 'equipo', label: 'Equipo' },
  { id: 'sistema', label: 'Sistema' },
];

const GB = 1024 * 1024 * 1024;
const MB = 1024 * 1024;

const fmtBytes = (n: number) => (n >= GB ? `${(n / GB).toFixed(2)} GB` : `${(n / MB).toFixed(1)} MB`);

export const Settings: React.FC = () => {
  const [tab, setTab] = useState('cuenta');

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Cuenta, seguridad y estado del sistema. Los datos del negocio viven en src/config/site.ts."
        breadcrumb={['Panel', 'Configuración']}
      />

      <Tabs label="Secciones de configuración" tabs={TABS} value={tab} onChange={setTab} />

      <div className="mt-4">
        {tab === 'cuenta' && <AccountTab />}
        {tab === 'seguridad' && <SecurityTab />}
        {tab === 'preferencias' && <PreferencesTab />}
        {tab === 'equipo' && <TeamTab />}
        {tab === 'sistema' && <SystemTab />}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Cuenta
// -----------------------------------------------------------------------------
const AccountTab: React.FC = () => {
  const { email, fullName, updateProfile } = useAuth();
  const { push } = useToast();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // El último término del nombre guardado se interpreta como apellido.
  useEffect(() => {
    const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      setFirst(parts.slice(0, -1).join(' '));
      setLast(parts[parts.length - 1]);
    } else {
      setFirst(parts[0] ?? '');
      setLast('');
    }
  }, [fullName]);

  const composed = [first.trim(), last.trim()].filter(Boolean).join(' ');
  const canSave = composed.length >= 2 && composed !== (fullName ?? '') && !saving;

  const save = async () => {
    setError('');
    if (composed.length < 2) {
      setError('Escribe al menos tu nombre.');
      return;
    }
    setSaving(true);
    const ok = await updateProfile({ firstName: first, lastName: last });
    setSaving(false);
    if (ok) {
      push({
        tone: 'ok',
        title: 'Perfil actualizado',
        description: isDemo ? 'Guardado en este navegador (modo demostración).' : 'El nombre ya aparece en el panel y en la lista del equipo.',
      });
    } else {
      setError('No se pudo guardar. Revisa el nombre e inténtalo otra vez.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Datos de la cuenta</h2>
          {fullName && <Badge tone="ok">{fullName}</Badge>}
        </div>
        <div className="space-y-3 p-4">
          <Field label="Correo de acceso" htmlFor="acc-email" hint="El correo se cambia desde Supabase Auth.">
            <Input id="acc-email" value={email ?? ''} readOnly disabled />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="acc-first" hint="Aparece en la bitácora de actividad.">
              <Input
                id="acc-first"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                placeholder="María"
                maxLength={40}
                autoComplete="given-name"
              />
            </Field>
            <Field label="Apellido" htmlFor="acc-last">
              <Input
                id="acc-last"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                placeholder="Ojeda"
                maxLength={40}
                autoComplete="family-name"
              />
            </Field>
          </div>

          {error && (
            <p role="alert" className="text-2xs font-medium text-danger">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button variant="primary" loading={saving} onClick={save} disabled={!canSave}>
              Guardar
            </Button>
            {!canSave && composed.length < 2 && (
              <span className="text-2xs text-muted">Escribe tu nombre para habilitar el botón.</span>
            )}
          </div>

          {isDemo && (
            <p className="text-2xs text-warn">
              Modo demostración: el nombre se guarda solo en este navegador. Al conectar Supabase
              se guarda en la base y aparece para todo el equipo.
            </p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Datos del negocio</h2>
          <Badge tone="neutral">src/config/site.ts</Badge>
        </div>
        <div className="p-4">
          <p className="mb-3 text-2xs leading-relaxed text-muted">
            Estos datos alimentan el sitio público y los botones de contacto. Se editan en el código para que queden
            versionados y nunca se publiquen datos inventados.
          </p>
          <ul className="space-y-1.5 text-xs">
            {[
              ['Teléfono', hasPhone() ? SITE.phone : 'Sin configurar'],
              ['WhatsApp', hasWhatsApp() ? `+${SITE.whatsapp}` : 'Sin configurar'],
              ['Correo', hasEmail() ? SITE.email : 'Sin configurar'],
              ['Redes', socialLinks().length > 0 ? socialLinks().map((s) => s.name).join(', ') : 'Sin configurar'],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between gap-3 border-b border-line/60 py-1.5">
                <span className="text-muted">{k}</span>
                <span className="flex items-center gap-1.5 text-right font-medium">
                  {v === 'Sin configurar' ? (
                    <Badge tone="warn">Pendiente</Badge>
                  ) : (
                    <Badge tone="ok">{v}</Badge>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Seguridad
// -----------------------------------------------------------------------------
const SecurityTab: React.FC = () => {
  const { push } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSignIn, setLastSignIn] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setLastSignIn(data.user?.last_sign_in_at ?? null));
  }, []);

  // Regla mínima alineada con Supabase (8+ caracteres). Se valida en cliente
  // para dar feedback inmediato; el servidor aplica su propia política.
  const strength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      push({ tone: 'danger', title: 'Contraseña muy corta', description: 'Usa al menos 8 caracteres.' });
      return;
    }
    if (password !== confirm) {
      push({ tone: 'danger', title: 'Las contraseñas no coinciden' });
      return;
    }
    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      push({ tone: 'danger', title: 'No se pudo cambiar', description: error.message });
      return;
    }
    setPassword('');
    setConfirm('');
    push({ tone: 'ok', title: 'Contraseña actualizada', description: 'Usa la nueva en tu próximo inicio de sesión.' });
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Cambiar contraseña</h2>
        </div>
        <form onSubmit={submit} className="space-y-3 p-4">
          <Field label="Nueva contraseña" htmlFor="new-pass" hint="Mínimo 8 caracteres.">
            <Input
              id="new-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isDemo}
            />
          </Field>

          {password.length > 0 && (
            <Progress
              value={(strength / 5) * 100}
              tone={strength <= 2 ? 'danger' : strength <= 3 ? 'warn' : 'ok'}
              label="Fortaleza"
            />
          )}

          <Field label="Repetir contraseña" htmlFor="rep-pass">
            <Input
              id="rep-pass"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              invalid={confirm.length > 0 && confirm !== password}
              disabled={isDemo}
            />
          </Field>

          <Button type="submit" variant="primary" loading={saving} disabled={isDemo}>
            Actualizar contraseña
          </Button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Sesión</h2>
        </div>
        <div className="space-y-3 p-4">
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between gap-3 border-b border-line/60 pb-1.5">
              <dt className="text-muted">Último acceso</dt>
              <dd>{lastSignIn ? formatDateTime(lastSignIn) : '—'}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-line/60 pb-1.5">
              <dt className="text-muted">Proveedor</dt>
              <dd>Correo y contraseña</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Doble verificación</dt>
              <dd>
                <Badge tone="warn">Recomendado</Badge>
              </dd>
            </div>
          </dl>

          <p className="text-2xs leading-relaxed text-muted">
            Activa la verificación en dos pasos desde Supabase → Authentication → Providers para proteger el acceso al
            panel. Es la medida con mejor relación esfuerzo/impacto.
          </p>

          <Button
            variant="secondary"
            icon={<Glyph name="logout" />}
            disabled={isDemo}
            onClick={async () => {
              if (!supabase) return;
              await supabase.auth.signOut({ scope: 'global' });
              window.location.href = '/login';
            }}
          >
            Cerrar sesión en todos los dispositivos
          </Button>
        </div>
      </section>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Preferencias
// -----------------------------------------------------------------------------
const PreferencesTab: React.FC = () => {
  const { mode, setMode } = useTheme();
  const [rows, setRows] = useState(() => localStorage.getItem('oxy-page-size') ?? '25');

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Apariencia</h2>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <p className="text-xs font-semibold text-fg">Tema</p>
            <p className="mb-2 text-2xs text-muted">Se guarda en este dispositivo y se aplica al instante.</p>
            <Segmented
              label="Tema de la interfaz"
              value={mode}
              onChange={(v) => setMode(v as ThemeMode)}
              options={[
                { id: 'dark', label: 'Oscuro' },
                { id: 'light', label: 'Claro' },
                { id: 'system', label: 'Sistema' },
              ]}
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-fg">Filas por página</p>
            <p className="mb-2 text-2xs text-muted">Valor inicial de las tablas del panel.</p>
            <Segmented
              label="Filas por página"
              value={rows}
              onChange={(v) => {
                setRows(v);
                localStorage.setItem('oxy-page-size', v);
              }}
              options={[
                { id: '10', label: '10' },
                { id: '25', label: '25' },
                { id: '50', label: '50' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Accesibilidad</h2>
        </div>
        <div className="space-y-2 p-4 text-2xs leading-relaxed text-muted">
          <p>
            El panel sigue las pautas WCAG 2.2 AA: contraste mínimo 4.5:1, foco visible en todos los controles,
            navegación completa por teclado, etiquetas accesibles en iconos y respeto por
            <code className="mx-1 rounded bg-elevated px-1">prefers-reduced-motion</code>.
          </p>
          <p>
            Si usas lector de pantalla, la tecla <kbd className="rounded bg-elevated px-1">Tab</kbd> recorre primero el
            enlace «Saltar al contenido principal» y los avisos se anuncian sin mover el foco.
          </p>
        </div>
      </section>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Equipo
// -----------------------------------------------------------------------------
const TeamTab: React.FC = () => {
  const { data, initial, error } = useAsyncData(() => listTeam(), []);

  if (error) return <p className="panel p-4 text-xs text-danger">No se pudo cargar el equipo.</p>;

  return (
    <section className="panel overflow-hidden">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Personas con acceso</h2>
          <p className="panel-sub">Solo los usuarios de esta lista pueden abrir el panel</p>
        </div>
        <Badge tone="accent">{data?.length ?? 0}</Badge>
      </div>

      {initial ? (
        <LoadingBlock rows={3} />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState icon="group" title="Sin administradores" />
      ) : (
        <ul className="divide-y divide-line/60">
          {data?.map((m) => (
            <li key={m.userId} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-accent/15 text-2xs font-bold text-accent">
                {(m.fullName || m.email).slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-fg">{m.fullName || m.email}</span>
                <span className="block truncate text-2xs text-muted">{m.email}</span>
              </span>
              <Badge tone={m.role === 'owner' ? 'accent' : 'neutral'}>
                {m.role === 'owner' ? 'Propietario' : m.role === 'admin' ? 'Administrador' : 'Solo lectura'}
              </Badge>
              <span className="hidden text-2xs text-muted sm:block">
                {m.lastSeenAt ? `Visto ${formatDateTime(m.lastSeenAt)}` : 'Sin actividad'}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-line bg-elevated/40 px-4 py-3">
        <p className="text-2xs leading-relaxed text-muted">
          Para dar acceso a otra persona: crea el usuario en Supabase → Authentication y luego inserta su UUID en la
          tabla <code className="rounded bg-bg px-1">admins</code>. Sin ese segundo paso, la sesión se cierra sola.
        </p>
      </div>
    </section>
  );
};

// -----------------------------------------------------------------------------
// Sistema
// -----------------------------------------------------------------------------
const SystemTab: React.FC = () => {
  const { data, initial, error, reload } = useAsyncData(() => getSystemHealth(), []);

  const checks = [
    {
      label: 'Supabase conectado',
      ok: !isDemo,
      detail: isDemo ? 'Sin variables de entorno: el panel funciona en modo local.' : 'Credenciales cargadas.',
    },
    {
      label: 'Migraciones aplicadas',
      ok: !isDemo && !error,
      detail: isDemo ? 'No verificable sin conexión.' : 'Las funciones de auditoría y métricas responden.',
    },
    {
      label: 'Datos de contacto del sitio',
      ok: hasPhone() && hasWhatsApp() && hasEmail(),
      detail: 'Teléfono, WhatsApp y correo en src/config/site.ts.',
    },
    {
      label: 'Limpieza automática programada',
      ok: Boolean(data?.purgeScheduled),
      detail: data?.purgeScheduled ? 'pg_cron activo (04:15 UTC).' : 'Ejecutar purge_old_data() manualmente cada mes.',
    },
    {
      label: 'Bitácora activa',
      ok: (data?.counts.auditLogs ?? 0) > 0,
      detail: `${data?.counts.auditLogs ?? 0} registros de auditoría.`,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {initial ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <div className="panel p-4">
              <p className="text-2xs uppercase tracking-wide text-muted">Base de datos</p>
              <p className="tabular mt-1 text-xl font-bold">{fmtBytes(data?.databaseBytes ?? 0)}</p>
              <p className="mt-1 text-2xs text-muted">Límite del plan gratuito: 500 MB</p>
              <div className="mt-2">
                <Progress value={data?.databaseBytes ?? 0} max={500 * MB} />
              </div>
            </div>
            <div className="panel p-4">
              <p className="text-2xs uppercase tracking-wide text-muted">Almacenamiento</p>
              <p className="tabular mt-1 text-xl font-bold">{fmtBytes(data?.storageBytes ?? 0)}</p>
              <p className="mt-1 text-2xs text-muted">{data?.storageFiles ?? 0} archivos · límite 1 GB</p>
              <div className="mt-2">
                <Progress value={data?.storageBytes ?? 0} max={GB} tone="ok" />
              </div>
            </div>
            <div className="panel p-4">
              <p className="text-2xs uppercase tracking-wide text-muted">Registros</p>
              <dl className="mt-1 space-y-1 text-2xs">
                <div className="flex justify-between">
                  <dt className="text-muted">Solicitudes</dt>
                  <dd className="tabular font-semibold">{data?.counts.inquiries ?? 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Movimientos</dt>
                  <dd className="tabular font-semibold">{data?.counts.transactions ?? 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Visitas</dt>
                  <dd className="tabular font-semibold">{data?.counts.pageViews ?? 0}</dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Lista de verificación</h2>
            <p className="panel-sub">Estado real del entorno, no una promesa</p>
          </div>
          <Button size="sm" variant="ghost" icon={<Glyph name="refresh" />} onClick={reload}>
            Revisar
          </Button>
        </div>
        <ul className="divide-y divide-line/60">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-2.5 px-4 py-2.5">
              <span
                aria-hidden="true"
                className={`material-symbols-outlined text-[18px] ${c.ok ? 'text-ok' : 'text-warn'}`}
              >
                {c.ok ? 'check_circle' : 'pending'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-fg">{c.label}</span>
                <span className="block text-2xs text-muted">{c.detail}</span>
              </span>
              <Badge tone={c.ok ? 'ok' : 'warn'}>{c.ok ? 'OK' : 'Pendiente'}</Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
