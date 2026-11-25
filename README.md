# Backend API de productos

API REST desarrollada como proyecto final de curso para administrar productos con Node.js, Express y Firebase Firestore. Incluye inicio de sesión con JWT, contraseñas almacenadas mediante hash y autorización por roles para las operaciones que modifican productos.

## Tecnologías

- **Node.js** y **JavaScript ES Modules** para ejecutar la aplicación.
- **Express** para el servidor HTTP y las rutas REST.
- **Firebase Admin SDK** para acceder a Firestore desde el backend.
- **jsonwebtoken** para emitir y validar tokens JWT.
- **bcryptjs** para comparar contraseñas con hash.
- **CORS**, **body-parser** y **dotenv** para peticiones HTTP y configuración local.

## Organización

El proyecto separa las responsabilidades por capas:

- `routes/`: definición de endpoints.
- `controllers/`: recepción de solicitudes y respuestas HTTP.
- `services/`: validaciones y lógica de negocio.
- `models/`: consultas a Firestore.
- `middlewares/`: autenticación, autorización y gestión de errores.
- `config/`: inicialización de Firebase.
- `utils/`: errores y funciones auxiliares.
- `scripts/`: carga de datos de prueba en Firestore.

## Requisitos

- Node.js y npm instalados.
- Un proyecto de Firebase con Firestore habilitado.
- Una cuenta de servicio de Firebase para el backend. Guarda el archivo JSON **fuera del repositorio**.
- Git para clonar el proyecto.

## Clonar e instalar

Desde una terminal, reemplaza `<URL_DEL_REPOSITORIO>` con la dirección Git del proyecto:

```bash
git clone <URL_DEL_REPOSITORIO>
cd backend-node-firebase
npm install
```

## Configuración local

1. Copia `.env.example` a `.env`.
2. Completa las variables de entorno:

```dotenv
PORT=3000
FIREBASE_PROJECT_ID=tu-id-de-proyecto-firebase
GOOGLE_APPLICATION_CREDENTIALS=C:\ruta\fuera\del\repositorio\service-account.json
JWT_SECRET=reemplaza-por-un-secreto-aleatorio-largo
JWT_EXPIRES_IN=1h
```

En Windows, usa la ruta absoluta al archivo JSON de la cuenta de servicio. No pegues el contenido del archivo en `.env` ni lo subas a Git. El `.gitignore` excluye `.env` y archivos comunes de credenciales de Firebase.

`JWT_SECRET` debe ser un secreto aleatorio y privado. `JWT_EXPIRES_IN` define la vigencia del token (por ejemplo, `1h`).

## Cargar datos de prueba

Los siguientes comandos escriben documentos en Firestore, por lo que requieren credenciales válidas y acceso al proyecto configurado:

```bash
npm run seed:users
npm run seed:products
```

Las cuentas de prueba incluyen:

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@example.com` | `AdminPassword123!` |
| Usuario | `user1@example.com` | `UserPassword123!` |
| Editor | `editor@example.com` | `EditorPassword123!` |

El script de usuarios guarda las cuentas en `users` y el hash de la contraseña en `passwordHash`. El script de productos agrega 100 productos a `products`.

> Estas credenciales son solo para desarrollo. No las uses en producción. Los scripts aceptan `--clean` para eliminar los documentos marcados como datos de prueba (`isSeed: true`) de la colección correspondiente antes de volver a cargarlos; úsalo con cuidado.

## Iniciar el servidor

```bash
npm run start
```

El servidor escucha en el puerto definido por `PORT` (por defecto, `3000`). Para desarrollo con reinicio automático:

```bash
npm run dev
```

## Probar con Postman

Se incluyen una colección y un entorno de Postman para las pruebas:

- `backend-node-firebase.postman_collection.json`
- `backend-node-firebase.postman_environment.json`

En Postman, importa ambos archivos y selecciona el entorno **Backend Node Firebase - Local**. Confirma que `baseUrl` sea `http://localhost:3000`.

### Flujo recomendado

1. Inicia el servidor y carga los usuarios de prueba.
2. Ejecuta **Login Exitoso (Admin) - Guarda Token**. La prueba guarda el JWT en `jwtToken`.
3. Usa el token de administrador para crear y eliminar productos.
4. Ejecuta **Login Exitoso (Usuario estándar)** si quieres probar acceso de solo lectura. Este token se guarda por separado en `userJwtToken`.
5. Ejecuta las solicitudes dentro de las carpetas de productos y de validación.

Las solicitudes protegidas heredan la autenticación Bearer configurada en la colección. Para configurarla manualmente en una solicitud, selecciona **Authorization → Bearer Token** y usa el valor de `jwtToken`. No escribas la palabra `Bearer` en el campo del token.

### Endpoints

| Método | Endpoint | Autenticación | Respuesta esperada |
|---|---|---|---|
| `POST` | `/auth/login` | No | `200` con JWT si las credenciales son correctas; `400` si faltan campos; `401` si las credenciales no son válidas. |
| `GET` | `/api/products` | Bearer JWT | `200` con la lista de productos. |
| `GET` | `/api/products/:id` | Bearer JWT | `200` con el producto; `404` si no existe. |
| `POST` | `/api/products/create` | Bearer JWT de `admin` | `201` con el producto creado; `400` si los datos no son válidos; `401` sin token; `403` si el rol no es `admin`. |
| `DELETE` | `/api/products/:id` | Bearer JWT de `admin` | `200` si se elimina; `404` si no existe; `401` sin token; `403` si el rol no es `admin`. |

Para crear un producto, envía **Body → raw → JSON**:

```json
{
  "name": "Laptop",
  "description": "Laptop para desarrollo",
  "price": 850000,
  "stock": 10,
  "category": "Electronics"
}
```

`name`, `description` y `category` deben ser textos no vacíos; `price` debe ser un número no negativo y `stock` un entero no negativo.

La colección también incluye pruebas para token ausente o inválido (`401`), datos de producto inválidos (`400`), producto inexistente (`404`) y ruta inexistente (`404`). Los errores usan una respuesta JSON con `success: false` y `message`.

## Resumen del login

`POST /auth/login` recibe `email` y `password`:

```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123!"
}
```

La respuesta correcta incluye `tokenType: "Bearer"`, `token` y los datos básicos del usuario. En las siguientes solicitudes protegidas, envía el token en el encabezado:

```http
Authorization: Bearer <JWT>
```

