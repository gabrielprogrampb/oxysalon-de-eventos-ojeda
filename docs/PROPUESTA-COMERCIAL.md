# Propuesta comercial — Oxysalon de Eventos Ojeda

Material listo para enviar. Tres piezas: **mensaje**, **capturas** y **presentación**.

> Para el precio, la forma de pago y las respuestas a "está caro", ver
> **[`PRECIOS-Y-CIERRE.md`](PRECIOS-Y-CIERRE.md)**.

---

## 1. El mensaje principal (WhatsApp)

> Hola Dulce, ¿cómo estás? Soy Gabriel Polanco, ingeniero informático.
>
> Vi el trabajo de Oxysalon en Instagram y armé una propuesta: un sitio web propio para el salón,
> donde la gente ve los espacios, revisa qué fechas están libres y pide su cotización ahí mismo.
>
> Te resumo qué resuelve:
>
> **1. Presencia propia.** Una página con la cara del salón: portada, espacios, servicios y galería.
> Se ve profesional en el teléfono, que es donde entra el 90 % de tus clientes.
>
> **2. Menos preguntas repetidas.** El calendario público muestra qué días están ocupados, cuáles en
> pre-reserva y cuáles libres. Se acaba el “¿tienes disponible el 15?”.
>
> **3. Ninguna solicitud perdida.** Cada consulta llega a un panel con nombre, teléfono, fecha, tipo
> de evento e invitados. Tú marcas si ya la contactaste, si la cotizaste o si quedó reservada.
>
> **4. Control del negocio.** Agenda, galería y un resumen de ingresos y gastos en el mismo lugar.
>
> **5. Seguridad.** El panel es privado: solo entra quien tú autorices. Los datos de tus clientes no
> quedan a la vista de nadie.
>
> **6. Sin mensualidad de servidor.** El sitio corre en planes gratuitos: 0 USD al mes de
> infraestructura. Lo único opcional es un dominio propio (~10 USD al año).
>
> Te mando tres capturas para que veas cómo quedó. Si te gusta, te muestro cómo funciona en
> 10 minutos y vemos qué falta para publicarlo.

---

## 2. Versión correo (formal, con asunto)

> **Asunto:** Propuesta de sitio web con reservas para Oxysalon de Eventos Ojeda
>
> Estimada Dulce:
>
> Mi nombre es Gabriel Polanco, ingeniero informático. Le escribo porque preparé una propuesta de
> sitio web para Oxysalon de Eventos Ojeda, orientada a dos objetivos concretos: dar al salón una
> presencia digital a la altura de su trabajo y reducir el trabajo manual de atender consultas.
>
> **Qué incluye**
>
> - Presentación del salón: portada, espacios con capacidad y características, servicios detallados
>   (diseño y decoración, producción técnica, barra premium) y galería de eventos.
> - Calendario público de disponibilidad, con distinción entre fechas ocupadas, en pre-reserva y libres.
> - Formulario de cotización que registra automáticamente los datos del interesado.
> - Panel administrativo privado: solicitudes con seguimiento por estado, agenda, galería y control
>   básico de ingresos y gastos.
> - Diseño adaptable a teléfono, tableta y computadora.
>
> **Tecnología**
>
> Construido sobre React 19, Vite 6 y Supabase. Es la misma base técnica que usan plataformas de
> reservas de escala internacional: rápida, estable y con actualizaciones de seguridad continuas.
>
> **Seguridad**
>
> El acceso administrativo está protegido con autenticación y verificación de rol. La base de datos
> aplica permisos a nivel de fila: el público solo puede enviar su solicitud y leer el contenido
> publicado; nunca acceder a información de otros clientes ni modificar la agenda.
>
> **Costos de operación**
>
> El sitio se aloja en planes gratuitos de Vercel y Supabase, suficientes para el volumen de un salón
> de eventos. El costo mensual de infraestructura es de 0 USD. Un dominio propio es opcional
> (aproximadamente 10 a 12 USD anuales).
>
> Adjunto tres capturas del resultado. Quedo atento a su disponibilidad para una demostración de
> 10 minutos, sin compromiso.
>
> Cordialmente,
> **Gabriel Polanco** — Ingeniero Informático
> +58 412-6933615 · gabrielpexchange@gmail.com

---

## 3. Cómo presentar las capturas

Están en `docs/capturas/` (31 imágenes, JPG optimizados). **No envíes 31.** Enviar tres y dejar el
resto para la conversación es lo que genera la pregunta “¿y cómo funciona?”.

### Las tres del primer mensaje

| Orden | Archivo | Por qué esa |
|---|---|---|
| 1 | `01-home-portada.jpg` | Es la que genera el “wow”. Muestra el salón grande, elegante, con llamada a la acción. |
| 2 | `28-movil-galeria.jpg` | Demuestra que se ve bien en teléfono. Elimina la objeción “¿y en el celular?” antes de que aparezca. |
| 3 | `18-panel-resumen.jpg` | Cierra la venta: entiende que no es una página bonita, es una herramienta que él maneja. |

### Si responde con interés, manda estas cuatro

| Archivo | Qué demuestra |
|---|---|
| `13b-agenda-mes.jpg` | El calendario con fechas ocupadas, en pre-reserva y libres. Es el argumento más fuerte. |
| `20-panel-buzon.jpg` | Las solicitudes ordenadas por estado. |
| `21-panel-solicitud.jpg` | El detalle: valor cotizado, notas internas, botones de contacto. |
| `22-panel-finanzas.jpg` | Que también lleva el control del dinero. |

### Qué NO mostrar todavía

- `16-login.jpg` y `17-reset-password.jpg`: son pantallas técnicas; al cliente no le dicen nada y
  pueden confundirlo.
- `04-home-testimonios.jpg`: los testimonios son de ejemplo. Muéstralo solo si puedes decir
  “estos los reemplazamos por los tuyos reales”.
- `25-panel-subir-imagen.jpg`: útil en la capacitación, no en la venta.

### Reglas de presentación

1. **Siempre en este orden**: emoción (portada) → confianza (móvil) → control (panel).
2. **Una imagen por mensaje**, no un álbum de golpe: en WhatsApp las galerías se ven pequeñas y se
   pierde el detalle.
3. **Nombra lo que se ve**, no lo que es: “aquí el cliente ve qué días están libres” funciona mejor
   que “aquí está el módulo de agenda”.
4. **Nunca envíes el enlace antes de la llamada.** El enlace es la concesión, no la apertura.

---

## 4. La presentación (portafolio)

Archivo: **`docs/presentacion.html`** — una página navegable que combina las capturas con los
beneficios, la ficha técnica y la tabla de costos.

Cómo usarla:

1. Abrir con doble clic en el navegador (no necesita internet ni servidor).
2. `Ctrl + P` → *Guardar como PDF* para enviarla por correo o WhatsApp como documento.
3. Funciona también como guion de la llamada: cada sección es un punto de conversación.

Si más adelante quiere publicarla como portafolio en línea, cualquier hosting estático gratuito
sirve (la misma cuenta de Vercel que ya se usa).

---

## 5. Cómo argumentar cada beneficio (con su prueba)

| Beneficio | Qué decir | Captura que lo prueba |
|---|---|---|
| Presencia profesional | “Su salón se ve como un salón de lujo, no como un perfil más.” | `01-home-portada.jpg` |
| Menos consultas repetidas | “El cliente ya sabe qué días están ocupados antes de escribirle.” | `13b-agenda-mes.jpg` |
| Ninguna solicitud perdida | “Todo lo que entra queda registrado, con estado y seguimiento.” | `20-panel-buzon.jpg` |
| Control del negocio | “Agenda, fotos y dinero en el mismo panel.” | `22-panel-finanzas.jpg` |
| Seguridad | “Solo entra quien usted autorice; los datos de sus clientes quedan privados.” | (se explica, no se muestra) |
| Costo cero | “No hay mensualidad de servidor. Lo único opcional es el dominio.” | Tabla de la presentación |
| Tecnología | “React y Supabase: lo mismo que usan plataformas grandes.” | Sección “Por dentro” |

---

## 6. Objeciones y respuestas

| Objeción | Respuesta |
|---|---|
| “Ya tengo Instagram.” | “Instagram sirve para mostrar; no sirve para saber quién quiere el 15 ni cuántos invitados lleva. Esto sí, y el que entra ya viene con intención de reservar.” |
| “¿Quién lo mantiene?” | “Usted mismo. Subir una foto o bloquear una fecha son dos toques desde el teléfono.” |
| “¿Cuánto cuesta al mes?” | “De infraestructura, cero. Hosting y base de datos van en planes gratuitos. Lo que se cobra es el desarrollo.” |
| “¿Y si se cae?” | “Está sobre Vercel y Supabase, la misma infraestructura de miles de empresas. Y el sitio es estático: aunque la base se pause, la página sigue visible.” |
| “Déjame pensarlo.” | “Claro. Le dejo el enlace de prueba unos días para que lo vea con calma.” (aquí sí el enlace) |
| “¿Puedo cambiar los textos?” | “Sí, y le enseño cómo. Si prefiere, me dice y lo ajusto yo.” |

---

## 7. Sobre decir “100% listo para producción”

Es cierto en el código: compila sin errores, no tiene credenciales expuestas, tiene permisos por
fila, respaldo en la nube y pruebas funcionales pasadas. Pero **no lo digas como “ya está
terminado”**. Di:

> “El sistema está listo. Falta cargar sus datos: teléfono, WhatsApp, redes y las fotos reales del
> salón. Con eso, en una sesión de trabajo queda publicado.”

Eso es honesto, y además convierte la entrega en un trabajo conjunto donde los ajustes que pida
tienen valor.

---

## 8. Antes de enviar

- [ ] Completar `src/config/site.ts` con teléfono, WhatsApp, correo y redes **reales**.
      Si están vacíos, el botón flotante de WhatsApp y la tarjeta de contacto **no aparecen**.
- [ ] Regenerar capturas después de completar los datos: `npm run build && npm run preview` y, en
      otra terminal, `npm run capturas`.
- [ ] Revisar que no se vea el aviso “Modo demostración” en ninguna captura.
- [ ] Revisar que no aparezcan nombres de ejemplo (María González, Carlos Pérez) en las capturas
      que envíes.
- [ ] Verificar el nombre: **Dulce**.
- [ ] Enviar tres capturas, no treinta.
