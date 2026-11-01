# Cliso

**Cliso** es una aplicación web para la gestión integral de modelos 3D BIM, alimentada mediante una API REST.

Permite cargar, almacenar, eliminar y visualizar modelos BIM, y añadir sobre ellos capas de información
independientes del archivo original (cambios de color, marcadores, etiquetas, paneles informativos, valores,
posiciones de cámara...) mediante un editor web, **sin alterar el modelo original**.

> Proyecto de fin de ciclo (DAW). Se desarrolla con fines profesionales, por lo que la versión entregada es una
> versión funcional y básica que demuestra la viabilidad de la arquitectura, no el alcance completo previsto
> para producción.

| Dato | Valor |
|---|---|
| Autor | Aarón Barreira Diz |
| Ciclo | Desarrollo de Aplicaciones Web (grado superior, régimen a distancia) |
| Módulo | MP0374 · Proyecto de Desarrollo de Aplicaciones Web |
| Centro | I.E.S. Fernando Wirtz Suárez (A Coruña) |
| Curso | 2026-2027 |
| Tutores | Eva Naveira Domínguez y Fernando Prado Espiñeira |

## Índice

1. [Descripción](#descripción)
2. [Alcance de la versión entregada](#alcance-de-la-versión-entregada)
3. [Arquitectura y tecnología](#arquitectura-y-tecnología)
4. [Estructura del repositorio](#estructura-del-repositorio)
5. [Diseño de la interfaz (front)](#diseño-de-la-interfaz-front)
6. [Clases: objetos de dominio y DTO](#clases-objetos-de-dominio-y-dto)
7. [Arquitectura hexagonal del back](#arquitectura-hexagonal-del-back)
8. [Puesta en marcha](#puesta-en-marcha)
9. [Configuración y modo demo](#configuración-y-modo-demo)
10. [Estado del proyecto y hoja de ruta](#estado-del-proyecto-y-hoja-de-ruta)
11. [Convenciones](#convenciones)
12. [Planificación y medios](#planificación-y-medios)
13. [Control de versiones del documento](#control-de-versiones-del-documento)

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
| Front (`Cliso.UI`) | Angular 20 (TypeScript) con Angular Material |
| Visor 3D (front) | ThatOpen Components, sobre three.js y web-ifc: carga y muestra modelos IFC |
| Fechas (front) | Temporal, con `temporal-polyfill` (hasta que los navegadores y TypeScript lo traigan de serie) |
| Back (`Cliso.API`) | FastAPI (Python) |
| Base de datos | SQLite (por defecto, un fichero local) o MySQL, a elegir con `database_provider` |
| Ficheros de modelos | Gestionados por la propia aplicación |
| Sesión | Cookie |
| Entorno local | Docker Compose (`Cliso.Docker`): nginx sirve la UI y reenvía `/api` a la API; MySQL opcional |
| Herramientas | Windows 10, Visual Studio Code, GitHub, Trello |

## Estructura del repositorio

```
Proyecto/
├── .ai/           # Directrices de trabajo con el asistente (comunes, back, front y académicas)
├── .claude/       # Skills del asistente (cliso-mensaje-commit y cliso-revisar-tarea) y plugin cliso-tracker (panel de progreso, cambios pendientes del README y control de Docker)
├── .claude-plugin/  # marketplace.json: registra el plugin cliso-tracker
├── Cliso.API/     # API REST (FastAPI)
│   ├── app/       # Código de la aplicación (ver "Arquitectura hexagonal del back")
│   └── settings.json  # Parámetros de arranque (ver "Configuración y modo demo")
├── Cliso.UI/      # Front web (Angular)
│   └── src/
│       ├── app/          # core/ (arranque), modules/ (una carpeta por pantalla) y shared/ (lo común)
│       ├── resources/    # img/icons (iconos SVG) y languages (textos multidioma)
│       ├── styles.scss   # Estilos globales (importa src/styles/)
│       └── styles/       # Tokens de diseño, breakpoints, rejilla, tema de Material, base y clases provisionales
├── Cliso.Docker/  # Entorno local con Docker Compose (ver "Con Docker")
│   ├── api/       # Dockerfile de la API y sus settings (SQLite y MySQL)
│   ├── ui/        # Dockerfile de la UI (Node compila, nginx sirve) y nginx.conf
│   ├── docker-compose.yml  # Servicios api, ui y db (MySQL, con perfil opcional)
│   ├── .env.example        # Puertos y contraseña de MySQL (se copia a .env, que no se sube a git)
│   ├── cliso-docker.bat    # Arranca y detiene servicios sueltos (lo usa el panel de Cliso)
│   └── README.md           # Detalle de uso
├── Documentation/ # Documentación del proyecto
│   ├── Database/  # Diseño de la base de datos: diagrama UML .drawio
│   └── UI/        # Diseño de la interfaz: guía de estilo y diagramas .drawio
└── README.md
```

El back todavía no tiene tests. El front tiene los suyos como ficheros `*.spec.ts` junto al código (conversión de
fechas y modelo BIM, además del test que genera Angular); por defecto no se escriben, solo para comportamientos delicados.

La memoria del proyecto (formato `.odt`) se encuentra en la carpeta `Documentation`.

## Diseño de la interfaz (front)

La guía completa está en [`Documentation/UI/[Diseño] Cliso.UI - Guía de estilo.md`](<Documentation/UI/[Diseño] Cliso.UI - Guía de estilo.md>). Lo esencial:

- **Estilo inspirado en X:** fondo negro, texto blanco y grises; el blanco es el único acento y los colores solo se
  usan para estados (error, éxito). Bordes finos en lugar de sombras, botones y campos en píldora. Única excepción:
  las fichas de las listas de los editores llevan un borde y una sombra sólida y sin desenfoque (`--shadow-item`),
  para que se distingan unas de otras.
- **Solo tema oscuro.** Tipografía del sistema, tamaño base de 15 px.
- **Mobile-first y rejilla de Bootstrap** (solo las columnas, `Cliso.UI/src/styles/_grid.scss`): se diseña primero
  para móvil y todo es redimensionable. Los breakpoints están en `Cliso.UI/src/styles/_breakpoints.scss`, el alto de
  pantalla usa `100dvh` y lo que se pulsa respeta un tamaño táctil mínimo (`--touch-target`, ≈ 44 px). Toda
  comprobación visual incluye una prueba a 360 px.
- **Angular Material** es la librería de componentes. Se adapta al estilo anterior mediante los tokens
  `--mat-sys-*` (tema en `Cliso.UI/src/styles/_material.scss`), sin elevaciones, con densidad compacta en el editor.
  Los iconos son SVG propios (trazo, 24×24) en `Cliso.UI/src/resources/img/icons/`, sin librería de iconos. Los textos multidioma (gallego, castellano e inglés)
  viven en `Cliso.UI/src/resources/languages/` y los gestiona `LanguageManager`.
- **Estructura del código del front** (`Cliso.UI/src`): `app/core` (arranque y guard de rutas), `app/modules` (una
  carpeta por pantalla), `app/shared` (lo común: definiciones, modelos, servicios, utilidades), `resources` (imágenes
  y textos multidioma) y `styles`. Las llamadas al API pasan por `DataAccessService`, agrupadas por concepto
  (`BimModels`...), y se esperan con `RequestUtils.AwaitRequest` (o `AwaitRequestWithProgress`, para subir y descargar
  ficheros con su porcentaje). Las normas
  de código (nombres, regiones, control de flujo, comentarios, HTML y CSS) están en `.ai/directrices-front.md`. El
  formato lo fija Prettier (tabuladores, 130 columnas) y `npm run lint` pasa ESLint sobre `src`.
- **Tokens de diseño** (colores, espaciado, formas) como propiedades CSS en `Cliso.UI/src/styles/_variables.scss`;
  los componentes los leen con `var(--color-...)` y no llevan valores sueltos.
- **Editores** (modelos, y después visualizaciones y usuarios): modal redimensionable con lista y buscador a la
  izquierda (con un splitter siempre visible, plegable), detalle en pestañas a la derecha y un pie solo con iconos
  pequeños: añadir, editar y borrar y, mientras se edita, guardar y descartar. El detalle es de solo lectura hasta
  pulsar editar, y con cambios sin guardar se pide confirmación antes de cerrar, cambiar de ficha o descartar.
  Comparten el esqueleto `EditorShell` (en `shared/components`), que da al detalle su alto como contenedor (`cqh`)
  para que lo aprovechen los elementos de dentro (por ejemplo, la previsualización).
- **Avisos y confirmaciones:** `NotificationService` muestra un toast arriba al centro (3 s) con el color de su nivel
  (peligro en rojo, éxito en verde, aviso con borde blanco, informativo con el borde normal) y
  `ConfirmDialogService` hace preguntas de aceptar o cancelar. En un borrado, el botón de aceptar (en rojo) va a la
  izquierda del de cancelar.
- **Fechas:** el API manda texto ISO 8601 y el front trabaja con fechas con las que se puede operar. El constructor
  de cada model acepta cualquier `DateInput` (texto, número, `Date` o un tipo de Temporal) y `DateUtils.Parse` lo
  convierte en un `Temporal.ZonedDateTime`. El texto sin zona (como lo manda hoy el back) se entiende como hora local
  del navegador.
- El diseño de pantallas está en los diagramas `.drawio` de `Documentation/UI/` (barra de herramientas, editor y home).
  Cada uno incluye páginas «(móvil)» de ≈ 360 px que sirven de referencia de responsividad: la barra lateral pasa a
  barra superior con menú desplegable, el Home muestra las fichas en una columna con los paneles apilados, y los
  editores ocupan la pantalla completa con lista y detalle en dos pasos.

### Estado del front

Implementado hasta ahora (`Cliso.UI/src/app`):

- **Shell y navegación:** la aplicación arranca en `/home`, con la barra lateral (botón de inicio, botón *Edición* y
  usuario actual abajo; en móvil, barra superior con menú desplegable en el que *Edición* se despliega como un
  acordeón) y el buscador de modelos y visualizaciones a la derecha, aún sin lógica. *Edición* abre un panel a la
  derecha de su botón con *Modelos* (activo) y *Visualizaciones* y *Usuarios* (deshabilitados hasta que existan). Rutas en `app.routes.ts` (`AppRoute`); las pantallas protegidas llevan `AuthGuard`, que por ahora deja
  pasar siempre.
- **Arranque** (`AppBootstrapUtils`): fija el idioma con el parámetro de la aplicación y establece un usuario por
  defecto, porque aún no hay inicio de sesión. Pendiente: ejecutarlo tras el login y recuperar del API los
  parámetros, los modelos y las visualizaciones.
- **Parámetros de la aplicación** (`ApplicationSettingsManager`): guarda un parámetro por cada valor de
  `ApplicationSettingsParameter` (`LANGUAGE`, `BIM_MODELS_DIRECTORY`), con valores por defecto hasta que se
  recuperen del API. Sus nombres, descripciones y observaciones están en los textos multidioma (`AS_*`).
- **Editor de modelos BIM** (`modules/bimModelEditor`, se abre desde *Edición → Modelos*): lista de modelos con
  buscador (con una barra de carga mientras llegan, y vacía si no se pueden recuperar), detalle con las pestañas
  *General* (nombre, descripción, observaciones y carga del fichero IFC, que se sube al guardar con su porcentaje) y
  *Previsualización* (visor 3D, que ocupa casi todo el alto de la pestaña y muestra también el fichero elegido
  aunque aún no se haya subido, por ejemplo al añadir un modelo). Añadir (que abre la pestaña *General*), editar y
  borrar (borrado lógico, con confirmación), con un aviso de éxito en cada caso. Mientras se guarda o se borra, el
  diálogo no se puede cerrar (ni con Escape ni pulsando fuera), para no cancelar la operación a medias. Las fichas de la lista llevan borde
  y sombra sólida; la lista tiene su propio scroll vertical. El editor
  se descarga aparte al mostrarse la barra lateral, y el visor 3D, que es lo pesado, solo al abrir *Previsualización*
  (`@defer`), para que el modal abra sin esperas.
- **Visor 3D reutilizable** (`shared/components/bimViewer`, motor en `BimViewerManager`): carga un IFC (`Blob`) con
  ThatOpen, lo encuadra, permite orbitar y acercar y emite el punto del modelo (en coordenadas del mundo) sobre el
  que se hace clic, que servirá para los marcadores de las visualizaciones. Muestra la descarga con su porcentaje, el
  procesado, el estado vacío y el error. El fondo y la rejilla salen de los tokens (`--color-bg`, `--color-border`) y
  se pueden cambiar con el parámetro `Style`. El `.wasm` de `web-ifc` y el worker de ThatOpen se sirven como assets
  (`angular.json`, carpeta `thatopen/`).
- **Componentes compartidos** (`shared/components`): `EditorShell` (esqueleto de los editores), `ConfirmDialog` y el
  visor 3D.
- **Acceso al API:** `DataAccessService` agrupa las llamadas por concepto; hoy `BimModels` (listar, obtener, crear,
  modificar, borrar, y subir y descargar el IFC, con progreso). La URL base, `Environment.API_URL`, es
  `http://localhost:8000` en desarrollo y la ruta relativa `/api` en el build de producción, que el servidor web
  reenvía a la API. Cada concepto tiene su DTO (`dtos.definitions.ts`, campos como los manda el API), su model
  (`shared/models`) y su mapper (`shared/utils/mappers`). También `RequestUtils` (`AwaitRequest` y
  `AwaitRequestWithProgress`) y `HttpRequestCanceller`.
- **Fechas:** `DateUtils` y el tipo `DateInput`, con tests.
- **Avisos y confirmaciones:** `NotificationService` y `ConfirmDialogService` (ver «Diseño de la interfaz»).
- **Textos multidioma:** gallego, castellano e inglés (`LanguageGl`, `LanguageEs`, `LanguageEn`), con `LanguageManager`.
- **Pendiente** (según los diagramas): login, editores de visualizaciones (con los marcadores) y de usuarios,
  Configuración, y el catálogo de modelos y el visor en el Home. Con `ng serve` (front en `localhost:4200`, API en
  `localhost:8000`) el navegador solo deja pasar las llamadas si el API autoriza ese origen (CORS): en modo demo
  acepta todos y, si no, solo los de `allowed_origins` (ver «Configuración y modo demo»). Con Docker no hace falta,
  porque nginx sirve la UI y reenvía `/api`.

### Decisiones técnicas del front (para la memoria)

- **Visor 3D con ThatOpen** (sobre three.js y web-ifc): es lo que carga IFC directamente en el navegador, sin
  convertirlo antes. Pesa mucho (el chunk del visor ronda los 5 MB), así que el motor está aislado del resto: un
  manager sin Angular (`BimViewerManager`), un componente fino que lo envuelve y una carga diferida (`@defer`) que
  solo lo descarga al abrir la previsualización. El editor abre sin esperarlo.
- **`web-ifc` fijado a la 0.0.77:** la 0.0.78 publicada es inconsistente (su JS llama a `StreamMeshes` con 4
  argumentos y su `.wasm` espera 3) y la carga del IFC falla. Todas las versiones de las librerías del visor van sin
  rango (exactas) en `package.json`.
- **Temporal en vez de moment, luxon o `Date`:** es la API nueva del lenguaje (fechas inmutables y con aritmética),
  aún sin soporte en todos los navegadores ni tipos en TypeScript 5.9, y Angular 20 impide subir a TypeScript 6; por
  eso se usa su polyfill, que se retirará sin tocar el resto del código.
- **Avisos con `MatSnackBar`** en lugar de una librería de toasts (Notyf, que se usó en otro proyecto): Material ya
  está instalado y las directrices piden pocas dependencias.
- **Tests solo donde hay lógica delicada:** la conversión de fechas y el model BIM. El resto del comportamiento de
  la interfaz se comprobó a mano, en escritorio y a 360 px.
- **Tamaño del bundle:** el inicial (≈ 750 kB) lo forman Angular, Material y el CDK, no el visor; el aviso del
  presupuesto está en 800 kB.

## Clases: objetos de dominio y DTO

Cada concepto (`BIMModel`, `User`, `Visualization`, `ApplicationParameter`) tiene dos clases:

| Clase | Ubicación | Qué es |
|---|---|---|
| **Objeto de dominio** (dataclass) | `app/domain/models/` | Representa una fila de la base de datos dentro de la aplicación. Lo usan los casos de uso y lo devuelven los repositorios. |
| **DTO** (Pydantic) | `app/adapters/inbound/rest/dtos/` | Lo que entra y sale por la API (`BIMModelDto`, `UserDto`, `UserCreationDto`, `UserModificationDto`, `VisualizationDto`, `ApplicationParameterDto`, `ApplicationParametersDto`), sin campos internos: el de usuario nunca lleva la contraseña, ni siquiera hasheada. |
| **Mapper** (clase estática) | `app/adapters/inbound/rest/mappers/` | Convierte, campo a campo y de forma explícita, entre dominio y DTO (`to_dto`, `to_domain`). Sin conversión automática. |

Además, un **wrapper** (`app/domain/wrappers/`) es un objeto de dominio con datos extra calculados al consultarlo:
`BIMModelWrapper` extiende `BIMModel` con `file_size`, el tamaño en bytes del fichero IFC guardado (0 si aún no
tiene). El servicio de modelos BIM devuelve wrappers y `BIMModelDto` expone `file_size`.

Se accede a la base de datos con **SQL escrito a mano** (módulo `sqlite3` de la librería estándar y `PyMySQL`), sin
ORM: el esquema está en `app/adapters/outbound/persistence/sqlite/sqlite_schema.sql` (SQLite) y
`.../mysql/mysql_schema.sql` (MySQL) y cada repositorio escribe sus consultas y convierte las filas en objetos de
dominio.

El código se comprueba con `pyright` en modo estricto (`pyrightconfig.json`): `python -m pyright` desde `Cliso.API`.

Se describen a continuación los objetos de dominio.

### `BIMModel` (implementado: `Cliso.API/app/domain/models/bim_model.py`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `int` | Identificador único. |
| `name` | `str` | Nombre del modelo. |
| `description` | `str` | Descripción del modelo. |
| `observations` | `str` | Observaciones adicionales. |
| `file_name` | `str` | Nombre original del fichero asociado (vacío hasta que se sube uno). |
| `stored_file_name` | `str` | Nombre aleatorio y único (`<uuid>.ifc`) con el que se guarda el fichero en disco. Se genera al crear el modelo y no cambia nunca. |
| `active` | `bool` | `True` activo, `False` borrado (borrado lógico). |
| `creation_date` | `datetime` | Fecha y hora de creación. |
| `update_date` | `datetime \| None` | Fecha y hora de la última modificación (`None` si nunca se ha modificado). |

### `User` (implementado: `Cliso.API/app/domain/models/user.py`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `int` | Identificador único. |
| `nick` | `str` | Alias del usuario, **único**, siempre en minúsculas y que no se puede cambiar. |
| `name` | `str` | Nombre. |
| `surname` | `str` | Apellidos. |
| `password` | `str` | Contraseña ya hasheada (nunca en texto plano). |
| `role` | `UserRole` | Rol del usuario: `ADMIN`, `OPERATOR` o `VIEWER`. |
| `active` | `bool` | `True` activo, `False` borrado (borrado lógico). |
| `creation_date` | `datetime` | Fecha y hora de creación. |
| `update_date` | `datetime \| None` | Fecha y hora de la última modificación (`None` si nunca se ha modificado). |

### `Visualization` (implementado: `Cliso.API/app/domain/models/visualization.py`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `int` | Identificador único. |
| `user_id` | `int` | Usuario propietario (único que puede modificarla). |
| `bim_model_id` | `int` | Modelo BIM sobre el que trabaja. |
| `name` | `str` | Nombre. |
| `description` | `str` | Descripción. |
| `observations` | `str` | Observaciones. |
| `is_public` | `bool` | Si es `True`, otros usuarios pueden verla pero no modificarla. |
| `active` | `bool` | `True` activa, `False` borrada (borrado lógico). |
| `creation_date` | `datetime` | Fecha y hora de creación. |
| `update_date` | `datetime \| None` | Fecha y hora de la última modificación (`None` si nunca se ha modificado). |

### `ApplicationParameter` (implementado: `Cliso.API/app/domain/models/application_parameter.py`)

| Campo | Tipo | Descripción |
|---|---|---|
| `type` | `ApplicationParameterType` | Enumerado que identifica el parámetro (`LANGUAGE`, `BIM_MODELS_DIRECTORY`). |
| `default_value` | `str` | Valor con el que se creó el parámetro. |
| `value` | `str` | Valor actual (en la tabla, `current_value`). |

### Enumerados de usuario

Son enumerados de texto (`StrEnum`), cada uno en su fichero de `Cliso.API/app/domain/models/`.

| Enumerado | Valores | Para qué sirve |
|---|---|---|
| `UserRole` | `ADMIN`, `OPERATOR`, `VIEWER` | Rol de un usuario; se guarda como texto en `user.role`. Hay solo tres, para que los permisos sean sencillos. `ADMIN` ve y gestiona todo (modelos, usuarios, parámetros de la aplicación...); `OPERATOR` hace todo lo operativo con los modelos BIM y edita sus propias visualizaciones, pero no gestiona usuarios ni parámetros; `VIEWER` solo ve las visualizaciones públicas a las que se le da acceso. Los permisos todavía no se aplican: dependen del inicio de sesión. |
| `PasswordRequirement` | `MIN_LENGTH`, `UPPERCASE`, `LOWERCASE`, `DIGIT`, `SYMBOL` | Requisito mínimo que debe cumplir una contraseña. Su valor es el código que recibe el cliente cuando la contraseña se rechaza, para que el front ponga el texto en cada idioma. |

> Los `id` son `int` en Python (sin límite de tamaño); el tipo `long` (64 bits, `BIGINT`) se aplica en la
> base de datos. La unicidad de `nick` la garantiza un `UNIQUE` en la base de datos (`UserAlreadyExistsError`).

Relaciones: un usuario tiene muchas visualizaciones; un modelo BIM tiene muchas visualizaciones; cada
visualización pertenece a un único usuario y a un único modelo.

```
User 1 ───< Visualization >─── 1 BIMModel
```

### Diseño de la base de datos

El diagrama UML está en [`Documentation/Database/[Diseño] Cliso.API - Base de datos.drawio`](<Documentation/Database/[Diseño] Cliso.API - Base de datos.drawio>)
(se abre con drawio). Distingue las tablas obligatorias de las opcionales (en esta versión todas son obligatorias) y
marca en cursiva gris las columnas que admiten `NULL`.

> Los esquemas SQL (`sqlite_schema.sql` y `mysql_schema.sql`) reflejan por completo este diseño: mismas tablas y
> columnas. Los repositorios y servicios ya existen para `application_parameter`, `user` y `bim_model`;
> `visualization` y `visualization_piece` están en el esquema, pero todavía sin repositorios ni endpoints. Los
> esquemas solo se aplican al **crear** la base de datos: una base de datos creada con un esquema anterior no se
> migra, hay que borrarla y dejar que se cree de nuevo.

| Tabla | Qué guarda |
|---|---|
| `user` | Usuarios, con su rol (`role`: `ADMIN`, `OPERATOR` o `VIEWER`). |
| `bim_model` | Modelos BIM y el fichero asociado. |
| `visualization` | Visualización de un usuario (`user_id`) sobre un modelo (`bim_model_id`). |
| `visualization_piece` | Piezas de una visualización (marcadores, colores, cámaras...), en JSON. |
| `application_parameter` | Parámetros propios de la aplicación, editables en caliente. |

Decisiones de diseño (para la memoria):

- Nombres en `snake_case` y singular. Todos los `id` son `long` (`BIGINT`) autoincrementales. Las fechas son ISO en
  texto en SQLite y `DATETIME` en MySQL; `update_date` es opcional (`NULL` hasta la primera modificación).
- **Borrado lógico** con `active` en `user`, `bim_model` y `visualization`. Las piezas se borran
  físicamente, en cascada, al borrar su visualización. Un usuario borrado lógicamente no se puede recuperar desde
  la aplicación: habría que contactar con el técnico.
- `user.nick` es único **entre todos los usuarios, activos o no** (un `UNIQUE` normal), se guarda siempre en
  minúsculas (`Admin` y `admin` son el mismo) y **no se puede cambiar** una vez guardado.
- `user.password` guarda el hash con su sal dentro del mismo texto, sin columna aparte: `scrypt$n$r$p$sal$hash`
  (algoritmo `scrypt` de la librería estándar de Python, sin dependencias nuevas).
- `user.role` es un enumerado guardado como texto, no una tabla: son solo tres roles fijos. Cubre el criterio
  académico de perfiles o roles de usuario.
- `update_date` (en `user`, `bim_model` y `visualization`) es `NULL` hasta la primera modificación; se rellena al
  modificar y al borrar lógicamente. `creation_date` no cambia nunca.
- **Visualizaciones compartidas:** `visualization.is_public` indica si la ven todos. Solo su propietario
  (`user_id`) puede modificarla; los demás, si es pública, solo pueden verla.
- `bim_model.file_name` es el nombre original del fichero (el que verá el usuario) y `stored_file_name` el nombre
  aleatorio único (`<uuid>.ifc`) con el que se guarda en disco, para evitar colisiones y rutas adivinables. Se genera
  al crear el modelo, aunque todavía no tenga fichero.
- `visualization_piece.content` es un JSON cuya clase base indica el tipo de pieza; el tipo no es una columna.
- `application_parameter` guarda `type` (único), `default_value` y `current_value` como texto, sin tipo: la
  aplicación los parsea según el parámetro. No guarda nombres ni descripciones: los pone el front, en cada idioma
  (textos `AS_*`). Los parámetros de arranque (`is_demo`, `database_provider`, MySQL...) siguen en `settings.json`
  porque deciden qué base de datos se abre; todo lo demás va a la tabla.
- **Las sesiones no se guardan en base de datos:** viven en memoria de la API, en un gestor. Si la API se reinicia,
  todos los usuarios se desconectan; tampoco funcionaría con varios procesos (`--workers`), porque cada uno tendría
  su propia memoria. El tiempo de caducidad sale de `application_parameter`.

Parámetros iniciales de `application_parameter` (los que carga la autoinstalación, en `sqlite_basic_data.sql` y
`mysql_basic_data.sql`):

| Parámetro (`type`) | Qué es | Valor por defecto |
|---|---|---|
| `LANGUAGE` | Idioma de la aplicación, con código internacional (por ejemplo, `es-ES`). | `es-ES` |
| `BIM_MODELS_DIRECTORY` | Ruta, relativa o absoluta, de la carpeta donde se guardan los ficheros `.ifc` de los modelos BIM. Si es relativa, lo es a `Cliso.API`, como `data/` y `logs/`. | `data/models` |

Pendiente de añadir cuando haya sesiones: el tiempo de inactividad tras el que caduca una sesión.

## Arquitectura hexagonal del back

El back sigue una **arquitectura hexagonal (puertos y adaptadores)**: el núcleo del negocio no depende de ninguna
tecnología, y todo lo externo (HTTP, bases de datos) se conecta a él mediante adaptadores.

```
Cliso.API/app/
├── main.py                       # Raíz de composición: elige los adaptadores y los conecta
├── app_startup_configurator.py   # AppStartupConfigurator (estático): CORS y respuestas HTTP a las excepciones, que solo se registran al crear la aplicación
├── config/                       # StartupParameters (parámetros de arranque), StartupParametersManager (estático, lee el JSON) y DatabaseProvider
├── logger.py                     # Logger estático: escribe en fichero (info, warning, error)
├── utils/                        # PathUtils (rutas), FileUtils (carpetas y ficheros) y PasswordUtils (hash y requisitos de contraseña), estáticas
├── initializer/                  # DatabaseInitializer (prepara la base de datos al arrancar) y DemoData (datos demo como objetos de dominio)
│
├── domain/                       # NÚCLEO: conceptos del negocio, sin dependencias externas
│   ├── models/                   #   BIMModel, User, Visualization, ApplicationParameter (dataclasses) y los enumerados ApplicationParameterType, UserRole y PasswordRequirement
│   └── wrappers/                 #   Objetos de dominio con datos calculados (BIMModelWrapper)
│
├── application/                  # NÚCLEO: casos de uso y puertos
│   ├── ports/
│   │   ├── inbound/              #   Puertos de entrada: lo que se puede pedir a la aplicación (BIMModelServiceBase, UserServiceBase, ApplicationParameterServiceBase)
│   │   └── outbound/             #   Puertos de salida: lo que la aplicación necesita (BIMModelRepositoryBase, BIMModelFileStorageBase, UserRepositoryBase, ApplicationParameterRepositoryBase)
│   ├── use_cases/                #   Casos de uso (BIMModelService, UserService, ApplicationParameterService)
│   └── exceptions/               #   Excepciones del contrato de los puertos, agrupadas por tema: application_parameter/, bim_model/ y user/ (más PersistenceError y FileStorageError)
│
└── adapters/                     # EXTERIOR: conectan el núcleo con el mundo
    ├── inbound/rest/             #   Adaptador de entrada: routers FastAPI (BIMModelRouter.create(service), UserRouter...), ExceptionHandlers, dtos/ y mappers/
    └── outbound/                 #   Adaptadores de salida
        ├── storage/              #     Ficheros: LocalBIMModelFileStorage (carpeta del disco)
        └── persistence/          #     Base de datos
            ├── database_*_base.py    #       Contratos: DatabaseAdapterBase (raíz), DatabaseConnectionProviderBase, DatabaseConnectionBase, DatabaseCursorBase y DatabaseRowBase
            ├── sqlite/               #       SQLite: SQLiteAdapter, repositorios, sqlite_schema.sql y sqlite_basic_data.sql
            ├── mysql/                #       MySQL: MySQLAdapter, repositorios, mysql_schema.sql y mysql_basic_data.sql
            └── exceptions/           #       Errores de base de datos (DatabaseError y derivadas)
```

Cada capa es dueña de sus excepciones: las guarda en un subdirectorio `exceptions/` de su propio namespace
(`app/config/exceptions/` para los errores de los parámetros de arranque), que se reexporta desde el namespace. En la
capa de aplicación, que tiene muchas, se agrupan además en subcarpetas por tema (`application_parameter/`,
`bim_model/` y `user/`); aun así, desde fuera se importan todas de `app.application.exceptions`.

Regla de dependencias: **todo apunta hacia el núcleo**. `adapters` depende de `application` y `domain`; `application`
depende de `domain`; `domain` no importa nada de la aplicación. Nunca al revés. Los puertos son las interfaces:
los de entrada los implementan los casos de uso, y los de salida los implementan los adaptadores de salida.

Flujo típico (crear un modelo BIM): endpoint REST (`adapters/inbound`) → puerto de entrada → caso de uso
(`application/use_cases`) → puerto de salida (`application/ports/outbound`) → adaptador de persistencia
(`adapters/outbound/persistence`) → base de datos. El endpoint recibe y devuelve DTOs; el núcleo trabaja con objetos
de dominio.

Cada paquete agrupa y expone sus clases en su `__init__.py` (por ejemplo, `from app.config import
StartupParametersFileError`). Una clase por fichero y, como mucho, tres capas de paquete tras `app` en los imports.

## Puesta en marcha

### Requisitos

- Python 3.12 o superior (el código usa los genéricos con la sintaxis nativa, `def _read[T](...)`)
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

> Al crear la base de datos se crea el usuario `admin` (contraseña inicial `admin`); en modo demo, además, `operator` y
> `viewer`. Una base de datos creada con una versión anterior del esquema no se migra: se borra y se vuelve a crear.

### Front (`Cliso.UI`)

```bash
cd Cliso.UI
npm install
ng serve
```

La aplicación queda disponible en <http://localhost:4200/> y llama al API en la URL de `Cliso.UI/src/environments/`
(`http://localhost:8000`). El API debe autorizar el origen de `ng serve` (CORS): en modo demo, que es el de
`settings.json` por defecto, acepta todos; con `is_demo` a `false` hay que añadir `http://localhost:4200` a
`allowed_origins`. Para probar la aplicación completa en local también se puede usar Docker (abajo). Con la caché vacía, la primera vez el servidor de desarrollo recarga la página unas veces
mientras prepara las dependencias: conviene esperar a que termine antes de usarla. El servidor de desarrollo
trabaja sin HMR (`"hmr": false` en `angular.json`): con HMR, Angular carga de golpe todos los `@defer` y el visor 3D
dejaría de cargarse aparte.

Otros comandos: `ng build` (compilación de producción en `dist/`; el motor 3D queda en un chunk aparte, y el aviso de
tamaño del bundle inicial está en 800 kB), `ng test` (tests unitarios con Karma; necesita Chrome, y para una sola
pasada sin interfaz, `ng test --watch=false --browsers=ChromeHeadless`) y `npm run lint` (ESLint, que debe dar 0 avisos).

### Con Docker (`Cliso.Docker`)

Levanta la UI y la API sin instalar Python ni Node (hace falta Docker con Compose). Desde la carpeta `Cliso.Docker`:

```bash
docker compose up --build
```

La aplicación queda en <http://localhost:8080>. La UI se compila con `ng build` y la sirve nginx, que reenvía `/api` a
la API (quitando el prefijo): el navegador solo habla con un origen y no hace falta CORS. La documentación interactiva
de la API está en <http://localhost:8080/docs>. La API también se publica en el equipo (<http://localhost:8000>, puerto
`API_PORT`) para poder apuntar a ella desde una web local con `ng serve`.

- **Modo simple (por defecto):** UI + API con SQLite. La base de datos y los ficheros IFC se guardan en el volumen
  `cliso-data` (`/app/data`) y el log en `cliso-logs`.
- **Modo MySQL (opcional):** UI + API + MySQL. Se copia `.env.example` a `.env`, se pone
  `CLISO_SETTINGS_FILE=settings.docker.mysql.json` y se arranca con `docker compose --profile mysql up --build`. La
  contraseña de `settings.docker.mysql.json` debe coincidir con `MYSQL_ROOT_PASSWORD` de `.env`; el usuario necesita
  permiso de `CREATE DATABASE`. Es una credencial de desarrollo local: no se usa fuera del equipo.
- La API lee su configuración del fichero que indica `CLISO_SETTINGS` (`api/settings.docker.json` o
  `api/settings.docker.mysql.json`, ambos con `is_demo` a `true`). nginx no limita el tamaño de los ficheros IFC.
- `cliso-docker.bat <acción>` (y la pestaña **Docker** del panel de Cliso) arranca o detiene solo lo que haga falta,
  por ejemplo la API con MySQL, y muestra el estado de los servicios y si las imágenes deben reconstruirse. En modo
  MySQL, la base de datos solo se publica en `127.0.0.1` (`MYSQL_PORT`).
- `docker compose down` conserva los datos; con `-v` también borra los volúmenes.

El detalle de uso está en `Cliso.Docker/README.md`.

## Configuración y modo demo

Al arrancar, `StartupParametersManager.load()` lee `Cliso.API/settings.json` (o el fichero indicado en la variable de
entorno `CLISO_SETTINGS`) y devuelve los `StartupParameters`. Si el fichero no existe se usan los valores por defecto;
las claves que faltan toman su valor por defecto y las desconocidas se ignoran. Son solo los parámetros imprescindibles
para arrancar (abrir la base de datos, escribir el log y decidir qué webs pueden llamar a la API); el resto de la
configuración (idioma, carpeta de los modelos BIM...) vive en la tabla `application_parameter`. Como el CORS se
configura al crear la aplicación, antes del `lifespan`, `AppStartupConfigurator.register_cors()` (en
`app/app_startup_configurator.py`) lee estos parámetros por su cuenta y registra el middleware; el `lifespan` los
vuelve a leer para elegir los adaptadores.

```json
{
	"is_demo": true,
	"database_provider": "sqlite",
	"sqlite_directory": "data",
	"log_file_path": "logs/cliso.log",
	"mysql_host": "localhost",
	"mysql_port": 3306,
	"mysql_user": "",
	"mysql_password": "",
	"mysql_database": "cliso",
	"allowed_origins": []
}
```

| Clave | Descripción | Por defecto |
|---|---|---|
| `is_demo` | `true`: se usa una base de datos demo, `cliso-demo_<fecha>` (por ejemplo, `cliso-demo_20261010`), con cualquier proveedor. `false`: la base de datos real. | `true` |
| `database_provider` | Proveedor de base de datos: `sqlite` (un fichero local, sin servidor) o `mysql` (en un servidor). | `sqlite` |
| `sqlite_directory` | Carpeta de los ficheros SQLite (relativa a `Cliso.API` si no es absoluta). Se crea si no existe. | `data` |
| `log_file_path` | Fichero de log (relativo a `Cliso.API` si no es absoluto). Se crea la carpeta si no existe. | `logs/cliso.log` |
| `mysql_host`, `mysql_port`, `mysql_user`, `mysql_password`, `mysql_database` | Conexión a MySQL (solo con `database_provider` a `mysql`). | `localhost`, `3306`, vacío, vacío, `cliso` |
| `allowed_origins` | Lista de orígenes completos (`http://host:puerto`) de las webs que pueden llamar a la API desde el navegador (CORS). Con `is_demo` a `true` se aceptan todos y se ignora. Con la lista vacía no se autoriza ninguno, que es lo correcto cuando la web se sirve desde el mismo origen (como detrás de nginx). Debe ser una lista de textos. | `[]` |

El nombre de la base de datos depende del modo: en modo demo es `cliso-demo_<fecha de hoy>` con cualquier proveedor
(en SQLite, el fichero `<sqlite_directory>/cliso-demo_<fecha>.db`); en modo real es `cliso` (fichero `cliso.db`) en
SQLite y `mysql_database` en MySQL.

### Adaptadores de base de datos

Los contratos (clases abstractas, sufijo `Base`) están en la raíz de `app/adapters/outbound/persistence/` y sus
implementaciones en las subcarpetas `sqlite/` y `mysql/`: `DatabaseAdapterBase`, `DatabaseConnectionBase` (su cursor es
un `DatabaseCursorBase` que devuelve filas `DatabaseRowBase`, de modo que los repositorios no dependen de `sqlite3` ni
de `pymysql`) y `DatabaseConnectionProviderBase` (que solo sabe entregar conexiones con `connect()`). Los adaptadores implementan
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
| `load_basic_data()` | Carga los datos básicos (`sqlite_basic_data.sql`: los parámetros de la aplicación). | Carga los datos básicos (`mysql_basic_data.sql`: los parámetros de la aplicación). |
| `connect()` | Abre una conexión `sqlite3`. | Abre una conexión `pymysql`. |

Excepciones: `DatabaseNotFoundError` (la base de datos no existe), `DatabaseAlreadyExistsError` (ya existe al crearla)
y `DatabaseOperationError` (falla el motor: conexión, SQL, permisos). Las cargas son atómicas: si fallan no se
inserta nada.

### Inicializador de la base de datos

Al arrancar (en el `lifespan` de `main.py`), se crea el adaptador y los repositorios según el proveedor y el modo de
los parámetros de arranque, y se llama a `DatabaseInitializer` (`app/initializer/`):

- Si la base de datos **ya existe**, no se toca (en modo demo, se reutiliza la del día).
- Si **no existe**, la crea con sus tablas y carga siempre los datos básicos: los parámetros de la aplicación (desde
  los `.sql`) y el usuario `admin` (con rol `ADMIN` y contraseña inicial `admin`, cámbiala), que se guarda desde
  Python con el repositorio porque su contraseña va hasheada. En modo demo carga además los datos de `DemoData`, que
  son objetos de dominio (`BIMModel` y `User`) guardados con los repositorios de la API, sin ficheros ni sentencias
  SQL aparte: dos modelos (con su fichero IFC, que se copia desde `app/initializer/demo_models/` a la carpeta de modelos
del parámetro `BIM_MODELS_DIRECTORY`, con nombre fijo) y dos usuarios, `operator` (rol `OPERATOR`) y `viewer` (rol `VIEWER`), cuya contraseña es
  su propio nick. Estos usuarios iniciales no pasan por las reglas de contraseña del servicio.
- Si algo falla después de crearla, **la borra**, para no dejar una base de datos a medias que el siguiente arranque
  daría por buena. Es la única vez que el arranque borra una base de datos, y siempre una que acaba de crear.

Cualquier error de base de datos
detiene el arranque. La carpeta `data/` (ficheros SQLite) no se versiona.

### Parámetros de la aplicación

Los parámetros de la tabla `application_parameter` los sirve `ApplicationParameterService` (puerto de entrada
`ApplicationParameterServiceBase`) con `ApplicationParameterRepositoryBase` (`SQLiteApplicationParameterRepository` y
`MySQLApplicationParameterRepository`). Cada parámetro es un objeto de dominio `ApplicationParameter` (y un
`ApplicationParameterDto` en la API) con su tipo (enumerado `ApplicationParameterType`) y sus valores por defecto y
actual. La API no envía nombres ni descripciones: los pone el front en cada idioma. Al arrancar, `main.py` lee de aquí
el idioma y la carpeta de los modelos BIM.

| Endpoint | Qué hace | Respuestas |
|---|---|---|
| `GET /application-parameters` | Lista todos los parámetros (`ApplicationParametersDto`). | 200 |
| `GET /application-parameters/{parameter_type}` | Devuelve un parámetro por su tipo (`LANGUAGE`, `BIM_MODELS_DIRECTORY`). | 200, 404 si no existe, 422 si el tipo no es válido |

```json
{
	"type": "LANGUAGE",
	"default_value": "es-ES",
	"value": "es-ES"
}
```

Para añadir un parámetro nuevo: un valor en `ApplicationParameterType` y una fila en los dos ficheros de datos básicos
(`sqlite_basic_data.sql` y `mysql_basic_data.sql`). Por ahora solo se pueden leer: la edición en caliente aún no está
implementada, así que se cambian en la base de datos.

### Servicios y errores

Cada router recibe solo el servicio (o servicios) que necesita, por constructor: no hay ningún proveedor global del
que cualquiera pueda pedir cualquier servicio. Los servicios usan el repositorio que les haya dado `main.py`.

Los repositorios
traducen cualquier fallo de la base de datos a `PersistenceError` (`app/application/exceptions/`), que no depende de la
tecnología. Los routers no capturan errores: las excepciones se escapan y las traducen a HTTP los handlers de
`ExceptionHandlers` (`adapters/inbound/rest`), que se registran por bloques de código de respuesta en
`AppStartupConfigurator.register_exception_handlers()`: las de «no encontrado» (`BIMModelNotFoundError`, `BIMModelContentNotFoundError`,
`UserNotFoundError`, `ApplicationParameterNotFoundError`) → 404; los datos no válidos (`BIMModelValidationError`,
`UserValidationError`) → 400, y `UserPasswordValidationError` → 400 también, con los códigos de los requisitos que
falla; `UserProtectedError` → 403; `UserAlreadyExistsError` → 409; y `PersistenceError` y `FileStorageError` → 500 (se
registra en el log y al cliente no se le da el detalle). Cualquier otra excepción no prevista también responde 500 y
se registra en el log.
Un endpoint nuevo no necesita `try/except`; si aparece una excepción nueva, se
añade una línea en `register_exception_handlers()` de `AppStartupConfigurator`.

### Servicio de usuarios

`UserService` (implementa el puerto `UserServiceBase`) usa el puerto de salida `UserRepositoryBase`
(`SQLiteUserRepository` y `MySQLUserRepository`, con SQL escrito a mano) y `PasswordUtils` (`app/utils/`).
`main.py` entrega el servicio a `UserRouter.create(service)`. El servicio trabaja con objetos de dominio `User`;
`UserMapper` los convierte en `UserDto`, que nunca lleva la contraseña.

| Endpoint | Qué hace | Respuestas |
|---|---|---|
| `GET /users` | Lista los usuarios activos (`UserDto`: `id`, `nick`, `name`, `surname`, `role`, `active`). | 200 |
| `GET /users/{id}` | Devuelve un usuario activo. | 200, 404 (también si está desactivado) |
| `POST /users` | Crea un usuario (`UserCreationDto`: `nick`, `name`, `surname`, `role`, `password` en texto plano). | 201, 400, 409 si el nick ya existe |
| `PUT /users/{id}` | Modifica `name`, `surname` y `role`, y opcionalmente `password` (`UserModificationDto`; el `nick` debe ser el que ya tiene). Sin `password`, conserva la suya. | 200, 400, 403, 404 |
| `DELETE /users/{id}?force=false` | Borrado lógico (`active = 0`): se conservan los datos y las visualizaciones. Con `force=true` se borran de verdad el usuario y sus visualizaciones. | 204, 403 si es `admin`, 404 |

Reglas:

- **Datos:** el `nick`, el nombre y los apellidos no pueden estar vacíos ni superar 50, 100 y 150 caracteres
  (`UserValidationError` → 400). El nick se guarda sin espacios sobrantes y siempre en minúsculas, y no se puede
  cambiar: un `PUT` con otro nick responde 400.
- **Contraseña:** como mínimo 8 caracteres, con una mayúscula, una minúscula, un número y un símbolo. Se valida en el
  servidor, al crear y al modificar, y se guarda hasheada con `scrypt` y una sal aleatoria (`PasswordUtils`). Si no
  cumple, la respuesta 400 incluye los códigos de los requisitos incumplidos (`PasswordRequirement`), para que el
  front muestre el texto en cada idioma:

  ```json
  {
  	"detail": "La contraseña no cumple los requisitos: MIN_LENGTH, UPPERCASE",
  	"requirements": ["MIN_LENGTH", "UPPERCASE"]
  }
  ```

- **Usuario `admin`:** es el único punto de entrada garantizado, así que está protegido (`UserService.PROTECTED_NICK`):
  no se puede borrar, ni lógica ni físicamente, ni cambiarle el rol (`UserProtectedError` → 403). Sí se pueden
  cambiar su nombre, sus apellidos y su contraseña.
- **Borrado:** la aplicación web solo hará borrado lógico. Un usuario desactivado no se puede recuperar desde la
  aplicación (habría que contactar con el técnico); `force=true` queda para uso excepcional directo sobre la API.
- **Pendiente para el login:** que un usuario no pueda borrarse a sí mismo, que uno desactivado no pueda entrar, que
  la búsqueda por nick use minúsculas y la aplicación de los permisos de cada rol.

### Servicio de modelos BIM

`BIMModelService` (implementa el puerto `BIMModelServiceBase`) usa dos puertos de salida: `BIMModelRepositoryBase`
(los datos básicos, con `SQLiteBIMModelRepository` y `MySQLBIMModelRepository`, con SQL escrito a mano y sus propias constantes de columnas) y
`BIMModelFileStorageBase` (el fichero IFC, con `LocalBIMModelFileStorage`, que lo guarda en la carpeta del parámetro `BIM_MODELS_DIRECTORY`). El servicio devuelve `BIMModelWrapper`, es decir,
el modelo con el tamaño de su fichero (`file_size`).
`main.py` los crea y entrega el servicio a `BIMModelRouter.create(service)`.

| Endpoint | Qué hace | Respuestas |
|---|---|---|
| `GET /bim-models` | Lista los modelos activos (`BIMModelDto`, con `file_size`). | 200 |
| `GET /bim-models/{id}` | Devuelve un modelo activo. | 200, 404 |
| `POST /bim-models` | Añade un modelo con sus datos básicos (`name`, `description`, `observations`). `id`, `file_name` y `creation_date` los asigna el sistema. | 201, 400 si el nombre está vacío o supera 200 caracteres |
| `PUT /bim-models/{id}` | Modifica `name`, `description` y `observations`; no toca el fichero. | 200, 400, 404 |
| `PUT /bim-models/{id}/content?file_name=x.ifc` | Sube el fichero IFC como cuerpo binario (`application/octet-stream`), recibido por trozos. Si ya había fichero, lo sustituye. | 200, 400 si el nombre no acaba en `.ifc` o lleva ruta, 404 |
| `GET /bim-models/{id}/content` | Descarga el fichero IFC por trozos, con su nombre original. | 200, 404 si no existe el modelo o no tiene fichero |
| `DELETE /bim-models/{id}?force=false` | Borrado lógico (`active = 0`): se conservan datos, visualizaciones y fichero. Con `force=true` se borran de verdad el modelo, sus visualizaciones y su fichero. | 204, 404 |

Notas de diseño:

- Los `id` de la URL deben estar entre 1 y 2^63-1 (el rango de un `BIGINT`); fuera de ese rango la API responde 422.
- El fichero se guarda con el nombre aleatorio único del modelo (`stored_file_name`, del tipo `<uuid>.ifc`): el nombre
  que envía el cliente solo se anota en `file_name`, así que nunca decide dónde se escribe en disco. El almacenamiento
  (`BIMModelFileStorageBase`) identifica cada fichero por ese nombre, no por el `id` del modelo. Se escribe primero en un `.tmp` y solo cuando está completo sustituye al anterior, de modo
  que una subida interrumpida no estropea el fichero que ya había.
- Un modelo recién creado tiene `file_name` vacío hasta que se sube su fichero.
- Con `force=true` se borra primero la base de datos (modelo y visualizaciones, en una sola transacción) y después el
  fichero. Los modelos borrados lógicamente solo se pueden purgar con `force=true`.
- La conexión MySQL usa la opción `FOUND_ROWS`, para que `rowcount` cuente las filas que cumplen el `WHERE` aunque el
  `UPDATE` no cambie nada (como en SQLite); sin ella, volver a subir un fichero con el mismo nombre daría un 404 falso.

### Log

`Logger` (`app/logger.py`) escribe en el fichero de `log_file_path` con el formato `fecha [NIVEL] mensaje` y tres
niveles: `Logger.info()`, `Logger.warning()` y `Logger.error()` (este último puede recibir la excepción y añade su
traza). Se configura una vez al arrancar con `Logger.setup()`. La API registra:

- `INFO` cuando el arranque termina correctamente (proveedor, modo e idioma) y si la base de datos ya existía o se ha
  creado.
- `INFO` al cerrarse la aplicación (cierre ordenado, por ejemplo con Ctrl+C).
- `ERROR`, con su traza, si falla la preparación de la base de datos o la lectura de sus parámetros; el arranque se
  aborta.

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

Las normas completas están en `.ai/` (`directrices.md` común, `directrices-back.md`, `directrices-front.md` y
`directrices-academicas.md`). Lo esencial:

- Idioma: español en comentarios, docstrings, README y mensajes; los nombres de código, en inglés.
- Back: `snake_case` (clases en `PascalCase`), sangría con tabuladores, punto y coma al final de cada sentencia,
  regiones, sin returns tempranos, una clase por fichero y tipado estricto con `pyright`.
- Front: lo fija su `.editorconfig` (Prettier con tabuladores y 130 columnas; ESLint con `npm run lint`), con regiones
  en cada clase (los decoradores de Angular, `@Input` y `@Output` entre ellos, en una región `DECORATORS` arriba del
  todo), fechas con Temporal y sin RxJS ni signals fuera de la capa HTTP.
- Cada campo/clase documentado con docstring (back) o comentario de documentación (front).
- Antes de subir una tarea, `/cliso-revisar-tarea` la revisa contra la tarjeta de Trello y las directrices (con un
  comprobador automático de estilo, esquemas, dependencias y limpieza); `/cliso-mensaje-commit` redacta el mensaje
  del commit.

## Planificación y medios

- **Recursos humanos**: 1 desarrollador principal (autor), tutor/a de proyecto (seguimiento académico) y
  responsable de departamento (seguimiento técnico).
- **Gestión de tareas**: Trello.
- **Control de versiones**: GitHub.

El detalle de tareas, tiempos y presupuesto se recoge en la memoria del proyecto (carpeta `Documentation`). En la memoria actual (V1) los apartados de planificación,
presupuesto y ejecución aún están por completar.

## Control de versiones del documento

| Versión | Fecha | Observaciones |
|---|---|---|
| V0 | 23/09/2026 | Se cubren los primeros apartados exigidos para la definición del proyecto. |
