# 🛡️ Reporte técnico de seguridad — ApparcaCUC

> Principio rector: **“Todo lo que esté en el navegador puede ser visto; nada que deba mantenerse secreto debe
> llegar al navegador.”** Y: **“El frontend solicita; el backend decide.”**

---

## 1. Qué información queda pública (frontend)

El bundle del navegador es inspeccionable por diseño. Contiene únicamente:

- Lógica de presentación, rutas y componentes.
- Llamadas a la API (URLs de endpoints públicos).
- La variable pública `VITE_API_URL` (URL base de la API).
- Credenciales **demo** (públicas a propósito, mostradas en la pantalla de login).

**No** contiene: secretos, `JWT_SECRET`, cadena de conexión de MongoDB, contraseñas, ni lógica de
autorización confiable.

## 2. Qué permanece solo en el backend

- `MONGODB_URI` (cadena de conexión a la base de datos).
- `JWT_SECRET` (firma/verificación de tokens).
- Hashing de contraseñas y verificación de credenciales.
- Reglas de autorización (roles, _ownership_) y toda la lógica de negocio.

Se cargan mediante variables de entorno (`apps/api/.env`, git-ignored). El `.env.example` solo contiene
**nombres** de variables, nunca valores reales.

## 3. Autenticación

- **JWT** firmado en el servidor con `JWT_SECRET`, con **expiración** (`JWT_EXPIRES_IN`).
- Se envía en el header `Authorization: Bearer <token>` (no en cookies) → **sin superficie CSRF**.
- Contraseñas hasheadas con **bcrypt** (`bcryptjs`, 10 rounds); el campo `passwordHash` tiene `select: false`
  y nunca se serializa en las respuestas.
- Login/registro con **rate-limiting** dedicado. El login no revela si el correo existe; “recuperar contraseña”
  tampoco (evita enumeración de cuentas).
- En producción el servidor **se niega a arrancar** con un `JWT_SECRET` débil o de marcador de posición.

## 4. Rutas administrativas

- Toda ruta `/api/admin/*` pasa por `requireAuth` **y** `requireAdmin` en el servidor.
- El cambio de estado de un espacio (`PATCH /api/parking/spaces/:id/status`) exige rol admin.
- **Ocultar la opción en la interfaz no es la protección**: aunque un usuario llame directamente al endpoint
  desde DevTools, el backend responde `403`.

**Verificado** (ver `smoke test`): usuario→endpoint admin = `403`; sin token = `401`.

## 5. Ownership (recursos propios)

- Un usuario solo puede ver/cancelar **sus** reservas; el backend compara el `owner`/`user` del recurso con
  el `sub` del token. Un admin puede gestionar cualquiera.
- Los vehículos se consultan/editan/eliminan siempre filtrando por `owner`.

## 6. Protección de la base de datos

```
Navegador ─▶ API (Express) ─▶ MongoDB        ✅   (arquitectura usada)
Navegador ─▶ MongoDB                          ❌   (nunca)
```

MongoDB **no** está expuesto al navegador. La cadena de conexión vive solo en el backend. En producción se
usa MongoDB Atlas con acceso restringido.

## 7. Validación y saneamiento de entradas

- **Zod** valida `body`, `query` y `params` en cada endpoint relevante.
- Los esquemas usan `.strict()` → se **rechazan campos extra** (protección contra _mass-assignment_).
  **Verificado:** enviar `{ role: 'admin', isAdmin: true }` al crear un vehículo devuelve `400`.
- Middleware propio que elimina claves con `$` o `.` → **protección contra NoSQL-injection**.
- Límite de tamaño de request (`100kb`).

## 8. Endurecimiento HTTP

- **Helmet** (cabeceras de seguridad).
- **CORS** restringido a los orígenes de `CLIENT_URL`.
- **Rate-limiting** general y específico para autenticación.
- `trust proxy` en producción (para IPs reales tras el proxy de Render/Railway).

## 9. Manejo de errores

- Manejador de errores centralizado. Respuestas JSON limpias `{ error: { code, message } }`.
- **Nunca** se devuelven _stack traces_ ni detalles internos en producción.
- Errores comunes de Mongo (duplicados, `CastError`) se traducen a mensajes de usuario.

## 10. Auditoría simulada de atacante (resultados)

| Intento                                                   | Resultado esperado | Estado |
| -------------------------------------------------------- | ------------------ | ------ |
| Acceso a `/api/admin/*` sin JWT                           | `401`              | ✅     |
| Acceso a `/api/admin/*` con cuenta de usuario            | `403`              | ✅     |
| Cambiar estado de un espacio como usuario                | `403`              | ✅     |
| Enviar campos no permitidos (mass-assignment)            | `400`              | ✅     |
| IDs inválidos / `CastError`                              | `400` sin fuga     | ✅     |

## 11. Higiene de secretos

- `.gitignore` excluye `.env`, `.env.*` (excepto `.env.example`), claves y binarios.
- No hay secretos, tokens ni cadenas de conexión en el código ni en `console.log`.
- Datos demo claramente ficticios (sin información real de personas).

## 12. Limitaciones de seguridad (por ser DEMO)

- Las **credenciales demo son públicas** a propósito (para facilitar la evaluación del portafolio).
- **Sin logout del lado servidor / revocación de tokens** (JWT _stateless_): al cerrar sesión el cliente
  descarta el token; un token robado sería válido hasta expirar. En un producto real se añadirían
  _refresh tokens_ con rotación y una lista de revocación.
- Sin verificación de correo, MFA ni política avanzada de contraseñas.
- La “validación de acceso” (QR) es **simulada**: no hay barrera física ni control de acceso real.
