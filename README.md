# Cliso

**Cliso** es una aplicación web para la gestión integral de modelos 3D BIM, alimentada mediante una API REST.

Permite cargar, almacenar, eliminar y visualizar modelos BIM, y añadir sobre ellos capas de información
independientes del archivo original (cambios de color, marcadores, etiquetas, paneles informativos, valores,
posiciones de cámara...) mediante un editor web, **sin alterar el modelo original**.

> Proyecto de fin de ciclo (DAW). Se desarrolla con fines profesionales, por lo que la versión entregada es una
> versión funcional y básica que demuestra la viabilidad de la arquitectura, no el alcance completo previsto
> para producción.

## Índice

1. [Descripción](#descripción)
2. [Alcance de la versión entregada](#alcance-de-la-versión-entregada)
3. [Arquitectura y tecnología](#arquitectura-y-tecnología)
4. [Estructura del repositorio](#estructura-del-repositorio)
5. [Clases: objetos de dominio y DTO](#clases-objetos-de-dominio-y-dto)
6. [Arquitectura hexagonal del back](#arquitectura-hexagonal-del-back)
7. [Puesta en marcha](#puesta-en-marcha)
8. [Configuración y modo demo](#configuración-y-modo-demo)
9. [Estado del proyecto y hoja de ruta](#estado-del-proyecto-y-hoja-de-ruta)
10. [Convenciones](#convenciones)
11. [Planificación y medios](#planificación-y-medios)
12. [Control de versiones del documento](#control-de-versiones-del-documento)

## Descripción

Los modelos BIM representan digitalmente una infraestructura o instalación mediante modelos tridimensionales con
información sobre sus elementos. Un mismo modelo puede necesitar distintas formas de representación o consulta
según el usuario. Cliso resuelve esto permitiendo que varios usuarios trabajen sobre el mismo modelo y creen sobre
él visualizaciones independientes entre sí.

El sistema gira en torno a tres elementos relacionados:

- **Usuarios**: acceso a la aplicación mediante credenciales.
- **Modelos BIM**: base tridimensional común.
- **Visualizaciones**: configuraciones independientes de cada usuario sobre un modelo.

El modelo BIM es la base común; las visualizaciones son aportaciones independientes de cada usuario sobre esa base.

### Funcionalidades previstas

- Gestión de usuarios y control de acceso mediante credenciales.
- Incorporación y gestión de modelos BIM.
- Creación de una o varias visualizaciones sobre un mismo modelo, cada una con su propia configuración.
- Configuración de visualizaciones: posiciones de cámara, colores, marcadores, etiquetas, paneles y otra
  información gráfica.
- Visor de modelos y visualizaciones.
- Restauración de la última sesión activa no caducada tras recargar la pestaña del navegador.
- Interfaz web responsiva.

## Alcance de la versión entregada

Como mínimo, la versión entregada incluye:

- Sistema de usuarios y acceso mediante credenciales.
- Incorporación y gestión de modelos BIM.
- Creación de visualizaciones sobre los modelos.
- Almacenamiento de datos de sesión en cookie.
- Persistencia de la información en base de datos.
- Gestión de los ficheros asociados a los modelos BIM.
- Interfaz web para gestionar e interactuar con modelos y visualizaciones.
- API para la gestión de usuarios, modelos, visualizaciones y datos asociados.

## Arquitectura y tecnología

| Parte | Tecnología |
|---|---|
| Front (`Cliso.UI`) | Angular 20 (TypeScript) |
| Back (`Cliso.API`) | FastAPI (Python) |
| Base de datos | SQLite (por defecto, un fichero local) o MySQL, a elegir con `database_provider` |
| Ficheros de modelos | Gestionados por la propia aplicación |
| Sesión | Cookie |
| Herramientas | Windows 10, Visual Studio Code, GitHub, Trello |

## Estructura del repositorio

```
Proyecto/
├── Cliso.API/     # API REST (FastAPI)
│   ├── app/       # Código de la aplicación (ver "Arquitectura hexagonal del back")
│   └── test/      # Tests
├── Cliso.UI/      # Front web (Angular)
│   └── src/
└── README.md
```

La documentación del proyecto (memoria y notas) se encuentra en la carpeta `Documentación`, junto a este repositorio.

## Clases: objetos de dominio y DTO

Cada concepto (`BIMModel`, `User`, `Visualization`) tiene dos clases:

| Clase | Ubicación | Qué es |
|---|---|---|
| **Objeto de dominio** (dataclass) | `app/domain/models/` | Representa una fila de la base de datos dentro de la aplicación. Lo usan los casos de uso y lo devuelven los repositorios. |
| **DTO** (Pydantic) | `app/adapters/inbound/rest/dtos/` | Lo que entra y sale por la API (`BIMModelDto`, `UserDto`, `VisualizationDto`), sin la contraseña ni campos internos. |
| **Mapper** (clase estática) | `app/adapters/inbound/rest/mappers/` | Convierte, campo a campo y de forma explícita, entre dominio y DTO (`to_dto`, `to_domain`). Sin conversión automática. |

Se accede a la base de datos con **SQL escrito a mano** (módulo `sqlite3` de la librería estándar), sin ORM: el
esquema está en `app/adapters/outbound/persistence/database_adapter/sqlite/sqlite_schema.sql` (SQLite) y `.../mysql/mysql_schema.sql` (MySQL) y cada repositorio escribirá sus consultas y convertirá las filas en objetos
de dominio.

El código se comprueba con `pyright` en modo estricto (`pyrightconfig.json`): `python -m pyright` desde `Cliso.API`.

Se describen a continuación los objetos de dominio.

### `BIMModel` (implementado: `Cliso.API/app/domain/models/bim_model.py`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `int` | Identificador único. |
| `name` | `str` | Nombre del modelo. |
| `description` | `str` | Descripción del modelo. |
| `file_name` | `str` | Nombre del fichero asociado. |
| `active` | `bool` | `True` activo, `False` borrado (borrado lógico). |
| `creation_date` | `datetime` | Fecha y hora de creación. |

### `User` (implementado: `Cliso.API/app/domain/models/user.py`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `int` | Identificador único. |
| `nick` | `str` | Alias del usuario, **único**. |
| `name` | `str` | Nombre. |
| `surname` | `str` | Apellidos. |
| `password` | `str` | Contraseña ya hasheada (nunca en texto plano). |
| `active` | `bool` | `True` activo, `False` borrado (borrado lógico). |
| `creation_date` | `datetime` | Fecha y hora de creación. |

### `Visualization` (implementado: `Cliso.API/app/domain/models/visualization.py`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `int` | Identificador único. |
| `owner_id` | `int` | Usuario propietario (único que puede modificarla). |
| `model_id` | `int` | Modelo BIM sobre el que trabaja. |
| `name` | `str` | Nombre. |
| `description` | `str` | Descripción. |
| `observations` | `str` | Observaciones. |
| `is_public` | `bool` | Si es `True`, otros usuarios pueden verla pero no modificarla. |
| `active` | `bool` | `True` activa, `False` borrada (borrado lógico). |

> Los `id` son `int` en Python (sin límite de tamaño); el tipo `long` (64 bits, `BIGINT`) se aplicará en la
> base de datos. La unicidad de `nick` se garantizará en base de datos y en los casos de uso.

Relaciones: un usuario tiene muchas visualizaciones; un modelo BIM tiene muchas visualizaciones; cada
visualización pertenece a un único usuario y a un único modelo.

```
User 1 ───< Visualization >─── 1 BIMModel
```

## Arquitectura hexagonal del back

El back sigue una **arquitectura hexagonal (puertos y adaptadores)**: el núcleo del negocio no depende de ninguna
tecnología, y todo lo externo (HTTP, bases de datos) se conecta a él mediante adaptadores.

```
Cliso.API/app/
├── main.py                       # Raíz de composición: elige los adaptadores y los conecta
├── config/                       # Settings, SettingsManager (estático, lee el JSON) y SettingsMapper (parámetros públicos)
├── logger/                       # Logger estático: escribe en fichero (info, warning, error)
│
├── domain/                       # NÚCLEO: conceptos del negocio, sin dependencias externas
│   └── models/                   #   BIMModel, User, Visualization, ApplicationSetting (dataclasses) y su enumerado de parámetros
│
├── application/                  # NÚCLEO: casos de uso y puertos
│   ├── ports/
│   │   ├── inbound/              #   Puertos de entrada: lo que se puede pedir a la aplicación (UserServiceBase)
│   │   └── outbound/             #   Puertos de salida: lo que la aplicación necesita (user_repository/UserRepositoryBase)
│   ├── use_cases/                #   Casos de uso (UserService, SettingsService)
│   └── exceptions/               #   Excepciones del contrato de los puertos (PersistenceError, UserNotFoundError, SettingNotFoundError)
│
└── adapters/                     # EXTERIOR: conectan el núcleo con el mundo
    ├── inbound/rest/             #   Adaptador de entrada: routers FastAPI (UserRouter.create(service)...), dtos/ y mappers/
    └── outbound/persistence/     #   Adaptadores de salida: base de datos
        ├── database_adapter/     #     DatabaseAdapterBase (raíz) + sqlite/ (SQLite) y mysql/ (MySQL)
        ├── database_row/         #     DatabaseRowBase (una fila, leída por nombre de columna)
        ├── database_cursor/      #     DatabaseCursorBase (ejecutar y leer filas)
        ├── database_connection/  #     DatabaseConnectionBase
        ├── database_connection_provider/ # DatabaseConnectionProviderBase (entrega conexiones)
        ├── user_repository/      #     Repositorio de usuarios: sqlite/ (SQLite) y mysql/ (MySQL)
        └── exceptions/           #     Errores de base de datos (DatabaseError y derivadas)
```

Cada capa es dueña de sus excepciones: las guarda en un subdirectorio `exceptions/` de su propio namespace
(`app/config/exceptions/` para los errores de settings), que se reexporta desde el namespace.

Regla de dependencias: **todo apunta hacia el núcleo**. `adapters` depende de `application` y `domain`; `application`
depende de `domain`; `domain` no importa nada de la aplicación. Nunca al revés. Los puertos son las interfaces:
los de entrada los implementan los casos de uso, y los de salida los implementan los adaptadores de salida.

Flujo típico (crear un modelo BIM): endpoint REST (`adapters/inbound`) → puerto de entrada → caso de uso
(`application/use_cases`) → puerto de salida (`application/ports/outbound`) → adaptador de persistencia
(`adapters/outbound/persistence`) → base de datos. El endpoint recibe y devuelve DTOs; el núcleo trabaja con objetos
de dominio.

Cada paquete agrupa y expone sus clases en su `__init__.py` (por ejemplo, `from app.config import
SettingsFileError`).

## Puesta en marcha

### Requisitos

- Python 3.11 o superior
- Node.js y npm (para Angular CLI)

### Back (`Cliso.API`)

```bash
cd Cliso.API
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Documentación interactiva de la API: <http://127.0.0.1:8000/docs>

> `requirements-dev.txt` instala lo mismo que `requirements.txt` y además `pyright`, para comprobar el tipado estricto.

### Front (`Cliso.UI`)

```bash
cd Cliso.UI
npm install
ng serve
```

La aplicación queda disponible en <http://localhost:4200/>.

Otros comandos: `ng build` (compilación de producción en `dist/`) y `ng test` (tests unitarios con Karma).

## Configuración y modo demo

Al arrancar, `SettingsManager.load()` lee `Cliso.API/settings.json` (o el fichero indicado en la variable de entorno
`CLISO_SETTINGS`). Si el fichero no existe se usan los valores por defecto.

```json
{
	"language": "es-ES",
	"is_demo": true,
	"database_provider": "sqlite",
	"sqlite_directory": "data",
	"demo_data_path": "demo_data.json",
	"log_file_path": "logs/cliso.log",
	"mysql_host": "localhost",
	"mysql_port": 3306,
	"mysql_user": "",
	"mysql_password": "",
	"mysql_database": "cliso"
}
```

| Clave | Descripción | Por defecto |
|---|---|---|
| `language` | Idioma de arranque, con código internacional. | `es-ES` |
| `is_demo` | `true`: se usa una base de datos demo, `cliso-demo_<fecha>` (por ejemplo, `cliso-demo_20261010`), con cualquier proveedor. `false`: la base de datos real. | `true` |
| `database_provider` | Proveedor de base de datos: `sqlite` (un fichero local, sin servidor) o `mysql` (en un servidor). | `sqlite` |
| `sqlite_directory` | Carpeta de los ficheros SQLite (relativa a `Cliso.API` si no es absoluta). Se crea si no existe. | `data` |
| `demo_data_path` | JSON con los datos demo (relativo a `Cliso.API` si no es absoluto). | `demo_data.json` |
| `log_file_path` | Fichero de log (relativo a `Cliso.API` si no es absoluto). Se crea la carpeta si no existe. | `logs/cliso.log` |
| `mysql_host`, `mysql_port`, `mysql_user`, `mysql_password`, `mysql_database` | Conexión a MySQL (solo con `database_provider` a `mysql`). | `localhost`, `3306`, vacío, vacío, `cliso` |

El nombre de la base de datos depende del modo: en modo demo es `cliso-demo_<fecha de hoy>` con cualquier proveedor
(en SQLite, el fichero `<sqlite_directory>/cliso-demo_<fecha>.db`); en modo real es `cliso` (fichero `cliso.db`) en
SQLite y `mysql_database` en MySQL.

### Adaptadores de base de datos

Cada concepto abstracto tiene su directorio en `app/adapters/outbound/persistence/`, con el contrato (clase abstracta,
sufijo `Base`) en la raíz y sus implementaciones en subcarpetas: `database_adapter/` (`DatabaseAdapterBase`, con
`sqlite/` y `mysql/`), `database_connection/` (`DatabaseConnectionBase`, cuyo cursor es un `DatabaseCursorBase` que
devuelve filas `DatabaseRowBase`, de modo que los repositorios no dependen de `sqlite3` ni de `pymysql`) y `database_connection_provider/`
(`DatabaseConnectionProviderBase`, que solo sabe entregar conexiones con `connect()`). Los adaptadores implementan
`DatabaseAdapterBase`, que es además un proveedor de conexiones. Los repositorios solo reciben el proveedor (lo
mínimo que necesitan: no pueden borrar ni crear la base de datos). Cada método del repositorio es autosuficiente y
se lee de arriba abajo: pide la conexión, ejecuta su sentencia SQL escrita a mano, cierra la conexión en un
`finally` y traduce los fallos del motor a `PersistenceError`. Es verboso a propósito: cualquiera que empiece con
Python debe poder entenderlo sin conocer nada avanzado. Un pool de conexiones, si hace falta, irá en el proveedor,
sin tocar los repositorios.

Cada operación hace una sola cosa y, si no puede hacerla, **lanza una excepción**
(`app/adapters/outbound/persistence/exceptions/`) en lugar de continuar a medias:

| Operación | `SQLiteAdapter` | `MySQLAdapter` |
|---|---|---|
| `exists()` | ¿Existe el fichero? | ¿Existe la base de datos en el servidor? |
| `delete()` | Borra el fichero. | `DROP DATABASE` (irreversible). |
| `create()` | Crea el fichero (y su carpeta) con las tablas vacías. | `CREATE DATABASE` y sus tablas. Si falla, borra lo creado. |
| `load_basic_data()` | Carga los datos básicos (`sqlite_basic_data.sql`, vacío por ahora). | Carga los datos básicos (`mysql_basic_data.sql`, vacío por ahora). |
| `load_demo_data()` | Carga **todo** `demo_data.json`. | Carga **todo** `demo_data.json`. |
| `connect()` | Abre una conexión `sqlite3`. | Abre una conexión `pymysql`. |

Excepciones: `DatabaseNotFoundError` (la base de datos no existe), `DatabaseAlreadyExistsError` (ya existe al crearla)
y `DatabaseOperationError` (falla el motor: conexión, SQL, permisos). Las cargas son atómicas: si fallan no se
inserta nada.

Arranque (`app/main.py`), con el proveedor y el modo de los settings:

- Si la base de datos **no existe**, se crea y se cargan los datos iniciales: los de `demo_data.json` en modo demo y
  los básicos si no.
- Si **ya existe**, no se toca (en modo demo, se reutiliza la del día). El arranque nunca borra una base de datos.

Cualquier error de base de datos detiene el arranque. Los hashes de contraseña del JSON demo son ficticios y la
carpeta `data/` (ficheros SQLite) no se versiona.

La configuración pública se expone como parámetros: cada uno es un objeto de dominio `ApplicationSetting` (y un
`ApplicationSettingParameterDto` en la API) con su identificador (enumerado `ApplicationSettingParameter`), nombre,
descripción, observaciones y valor, pensado para poder mostrarlos en un editor de parámetros. Solo se exponen el
idioma y si es modo demo; nunca datos sensibles como la contraseña de MySQL.

| Endpoint | Qué hace | Respuestas |
|---|---|---|
| `GET /settings` | Lista todos los parámetros públicos (`ApplicationSettingsDto`). | 200 |
| `GET /settings/{parameter}` | Devuelve un parámetro por su identificador (`LANGUAGE`, `IS_DEMO`). | 200, 404 si no existe, 422 si el identificador no es válido |

```json
{
	"parameter": "LANGUAGE",
	"name": "language",
	"description": "Idioma de arranque de la aplicación, como código internacional (por ejemplo, es-ES).",
	"observations": "Se cambia en el fichero de settings y requiere reiniciar la API.",
	"value": "es-ES"
}
```

El servicio de configuración (`SettingsService`) no conoce `Settings`: `SettingsMapper` (`app/config/`) copia los
parámetros públicos a objetos `ApplicationSetting` y `main.py` se los entrega al servicio. Para hacer público un
parámetro nuevo: un valor en `ApplicationSettingParameter` y una entrada en `SettingsMapper`. Los parámetros solo se
cambian editando el fichero de settings y reiniciando la API.

### Servicio de usuarios

`UserService` (caso de uso, implementa el puerto `UserServiceBase`) usa el puerto de salida `UserRepositoryBase`, que
implementan `SQLiteUserRepository` (SQLite, `?`) y `MySQLUserRepository` (MySQL, `%s`) con SQL escrito a mano; cada
uno lleva sus propias constantes con los nombres de las columnas. Solo
trabaja con usuarios **activos**. `main.py` elige el repositorio según el proveedor y entrega el servicio a
`UserRouter.create(service)`, que crea el router con los endpoints. Cada router recibe solo el servicio (o servicios)
que necesita, por constructor: no hay ningún proveedor global del que cualquiera pueda pedir cualquier servicio. Los
servicios, por debajo, usan el repositorio que les haya dado `main.py`.

| Endpoint | Qué hace | Respuestas |
|---|---|---|
| `GET /users` | Lista los usuarios activos (`UserDto`, sin contraseña). | 200 |
| `GET /users/{nick}` | Devuelve el usuario con ese nick. | 200, 404 si no existe |
| `POST /users/validate-password` | Recibe un `UserCredentialsDto` (`nick` y `password_hash`) y devuelve `true`/`false`. | 200, 404 si el nick no existe |

#### Modelo de contraseñas

- El cliente calcula un hash de la contraseña (`password_hash`) y lo envía: la contraseña real nunca viaja ni se guarda.
- En la base de datos **no** se guarda ese hash, sino un segundo hash calculado por el servidor a partir de él.
- Para validar, el servidor aplica ese segundo hash al valor recibido y lo compara, en tiempo constante, con el guardado.
  Así, quien consiga una copia de la base de datos no obtiene nada que le permita entrar directamente.
- **Estado actual:** la API todavía compara directamente el hash recibido con el guardado (los hashes del JSON demo son
  ficticios). El segundo hash se implementará junto con el login por cookie con token.
- A tener en cuenta al implementarlo: el hash del cliente hace de contraseña para quien lo capture, así que la API solo
  debe servirse por HTTPS; el segundo hash debe llevar una sal por usuario y un algoritmo lento (por ejemplo,
  `hashlib.scrypt`, de la librería estándar); y el login no debería distinguir entre "usuario inexistente" y
  "contraseña incorrecta" (hoy el endpoint responde 404 o `false`, lo que permite averiguar qué nicks existen).

Los repositorios
traducen cualquier fallo de la base de datos a `PersistenceError` (`app/application/exceptions/`), que no depende de la
tecnología. Los routers no capturan errores: las excepciones se escapan y las traducen a HTTP los handlers de
`ExceptionHandlers` (`adapters/inbound/rest`), que `main.py` registra por bloques de código de respuesta en
`register_exception_handlers()`: `UserNotFoundError` → 404 y `PersistenceError` → 500 (se registra en el log y al
cliente no se le da el detalle). Cualquier otra excepción no prevista también responde 500 y se registra en el log.
Un endpoint nuevo no necesita `try/except`; si aparece una excepción nueva, se
añade una línea en `register_exception_handlers()`.

### Log

`Logger` (`app/logger/`) escribe en el fichero de `log_file_path` con el formato `fecha [NIVEL] mensaje` y tres
niveles: `Logger.info()`, `Logger.warning()` y `Logger.error()` (este último puede recibir la excepción y añade su
traza). Se configura una vez al arrancar con `Logger.setup()`. La API registra:

- `INFO` cuando el arranque termina correctamente (proveedor, modo e idioma).
- `INFO` al cerrarse la aplicación (cierre ordenado, por ejemplo con Ctrl+C).
- `ERROR`, con su traza, si falla la preparación de la base de datos; el arranque se aborta.

Los mensajes se añaden al final del fichero (no se borra lo anterior). La carpeta `logs/` no se versiona.

## Estado del proyecto y hoja de ruta

Estado actual: estructura inicial de ambos proyectos y entidades de dominio `BIMModel`, `User` y `Visualization` definidas.

- [x] Entidad `BIMModel` en dominio.
- [x] Entidades `User` y `Visualization`.
- [ ] Elegir base de datos y añadir SQLAlchemy (repositorios en `adapters`).
- [ ] Casos de uso de modelos BIM + endpoints CRUD.
- [ ] Subida/descarga y almacenamiento de ficheros de modelos.
- [ ] Autenticación por credenciales y sesión en cookie.
- [ ] Casos de uso y endpoints de visualizaciones.
- [ ] Front: login, gestión de modelos, visor 3D y editor de visualizaciones.
- [ ] Tests (`Cliso.API/test/`) y diagrama de base de datos para la memoria.

## Convenciones

- Nombres de código en `snake_case` (clases en `PascalCase`).
- Cada campo/clase de dominio documentado con docstring.
- Sangría con tabuladores en el back, como en el resto del proyecto.

## Planificación y medios

- **Recursos humanos**: 1 desarrollador principal (autor), tutor/a de proyecto (seguimiento académico) y
  responsable de departamento (seguimiento técnico).
- **Gestión de tareas**: Trello.
- **Control de versiones**: GitHub.

El detalle de tareas, tiempos y presupuesto se recoge en la memoria del proyecto (carpeta `Documentación`).

## Control de versiones del documento

| Versión | Fecha | Observaciones |
|---|---|---|
| V0 | 23/09/2026 | Se cubren los primeros apartados exigidos para la definición del proyecto. |
