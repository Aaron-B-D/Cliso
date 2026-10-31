# Revisión por fases — Cliso.UI

Documento temporal para revisar el código por fases. Se puede borrar al terminar la revisión. Todas las rutas son
relativas a `Cliso.UI/src/app` salvo que se indique otra cosa.

**Cómo comprobarlo** (desde `Cliso.UI`): `npm run lint` (0 errores y 0 avisos), `npx ng build`, `npx ng test
--watch=false --browsers=ChromeHeadless` (1 test) y `npx ng serve` (abre `/home`).

---

## Fase 2 — Shell y navegación

Qué hace: la aplicación arranca en `/home`, con la barra lateral a la izquierda y el buscador a la derecha.

| Fichero | Estado | Qué mirar |
|---|---|---|
| `core/guards/authGuard.guard.ts` | nuevo | Guard de clase que devuelve siempre `true`. |
| `app.routes.ts` | modificado | `''` → `home`; `home` con `canActivate: [AuthGuard]`; `**` → `home`. |
| `app.ts`, `app.html`, `app.scss` | modificados | Layout: `.appDir` (flex) con `<app-sidebar />` y `<main>` con el `router-outlet`. |
| `modules/sidebar/components/sidebar.component.{ts,html,scss}` | nuevos | `mat-nav-list` con el botón Home activo según la ruta; en móvil solo icono (`d-none d-md-inline` en el texto). |
| `modules/home/components/home.component.{ts,html,scss}` | modificados | Buscador (`mat-form-field` en rejilla `col-12 col-md-8 col-lg-6`), sin lógica. |
| `styles/_variables.scss`, `styles/_material.scss` | modificados | Tokens `--radius-field` y `--radius-item` de 8 px (rectángulo de esquinas suaves, no cápsula) y `list-item-container-shape` de Material. |

## Fase 3 — Datos y parámetros

Qué hace: el acceso al API queda preparado y los parámetros de la aplicación tienen valores por defecto.

| Fichero | Estado | Qué mirar |
|---|---|---|
| `shared/services/dataAccess.service.ts` | nuevo (antes) | Solo `HttpClient`, URL base provisional y `buildUrl`; sin endpoints. |
| `shared/utils/request.utils.ts` | nuevo (antes) | `AwaitRequest<T>(request$, canceller)`: único sitio con genéricos junto a `TryGetResult`. |
| `shared/utils/httpRequestCanceller.utils.ts` | nuevo (antes) | `Cancel()`, `Destroy()` y `GetToken()`. |
| `shared/models/common/tryGetResult.models.ts` | nuevo (antes) | `Success` y `Result` (`Result` admite `null`). |
| `shared/definitions/applicationSettings.definitions.ts` | nuevo | Enumerado y tipo de los parámetros (antes en dos ficheros de `utils/`). `BIM_MODELS_DIRECTORY` y `LANGUAGE`, con los mismos identificadores que usa el API (`ApplicationParameterKey`). `IS_DEMO` ya no es un parámetro: ahora es de arranque del back y no se expone. |
| `ApplicationSettingsDefault` (en `applicationSettings.definitions.ts`) | nuevo | Solo `Parameter` y `Value`. Del API llegan únicamente tipo, valor por defecto y valor; el nombre, la descripción y las observaciones los pone el front en cada clase de parámetro (`GetName()`, `GetDescription()`, `GetObservations()`, claves `AS_*` de los idiomas). |
| `shared/utils/applicationSettings/applicationSettings.utils.ts` | nuevo | Constante `DEFAULTS` (BIM_MODELS_DIRECTORY `data/models`, LANGUAGE `es-ES`), con los mismos nombres y textos que los datos básicos del back. |
| `shared/utils/applicationSettings/applicationSettingsManager.utils.ts` | nuevo | `GetParameter`, `GetLanguage`, `GetBimModelsDirectory`, `SetValue`; crea las clases con un `switch` completo. |
| `shared/models/applicationSettings/applicationSettingsParameterBase.models.ts` | nuevo | Clase abstracta; `GetValue(): unknown`. |
| `shared/models/applicationSettings/languageSettingsParameter.models.ts`, `isDemoSettingsParameter.models.ts` | nuevos | Una clase por parámetro; `GetValue()` devuelve `string` y `boolean`. |

## Fase 4 — Usuario y arranque

Qué hace: antes de pintar, se fija el idioma con el parámetro `LANGUAGE` y se establece el usuario; la barra lateral
muestra su nombre.

| Fichero | Estado | Qué mirar |
|---|---|---|
| `shared/models/user/user.models.ts` | nuevo | `Id`, `Nick`, `Name` y `Surname` (sin campos de auditoría). |
| `shared/utils/user/userManager.utils.ts` | nuevo | `GetCurrentUser`, `GetFullName`, `SetCurrentUser`. |
| `core/utils/appBootstrap.utils.ts` | nuevo | `Start()`: idioma + usuario por defecto (`Admin Demo Cliso`). |
| `app.config.ts` | modificado | `provideAppInitializer(() => AppBootstrapUtils.Start())`. |
| `modules/sidebar/components/sidebar.component.{ts,html,scss}` | modificados | Bloque de usuario anclado abajo (`.sid_user`). |
| `app.spec.ts` | modificado | `provideRouter([])` para poder crear la aplicación en el test. |

---

## Decisiones que he tomado por mi cuenta

1. **Barra lateral en móvil** (decidido contigo): por debajo de `md` (768 px) es una barra superior con un botón
   que despliega un menú (Inicio y usuario); desde `md`, la columna fija de la izquierda. Los paneles y el editor
   siguen pendientes.
2. **Guard de clase** (`implements CanActivate`): es el que usa el proyecto de referencia y respeta «sin funciones
   sueltas». Esa interfaz está marcada como obsoleta en Angular, pero sigue funcionando.
3. **Parámetros alineados con el back**: se quita `IS_DEMO` (ahora es de arranque y la API no lo expone) y se añade
   `BIM_MODELS_DIRECTORY`; además cada parámetro guarda `DefaultValue` (`default_value` del API).
4. **Usuario por defecto `admin`** escrito en `appBootstrap.utils.ts` mientras no hay inicio de sesión ni llamadas.
5. **Prefijos CSS** de tres letras para componentes de una palabra: `hom_` (Home) y `sid_` (Sidebar).
6. **Campos y elemento activo en rectángulo redondeado (8 px)**, no cápsula. Un radio enorme (9999 px) hacía que
   Material ensanchara las piezas del borde y la página tuviera scroll horizontal; con 8 px no ocurre.
7. **Rutas sin carga diferida**: componentes importados directamente (más sencillo; con pocas pantallas no pesa).
8. **`GetValue(): unknown` en la clase base** de los parámetros; las subclases lo estrechan a `string` o `boolean`. Para
   leer el valor con su tipo, el manager ofrece `GetLanguage()` y `GetBimModelsDirectory()`.
9. **`console.error` de `main.ts` cambiado a `console.warn`** (único `console` que permite el linter).
10. **Nuevo concepto `Definitions`** (`shared/definitions/*.definitions.ts`): enumerados, tipos y constantes por tema
    (`icons`, `routes`, `language`, `applicationSettings`). El nombre lo elegí yo; cámbialo si prefieres otro.
11. **`environment`**: `src/environments/environment.ts` y `environment.development.ts` (clase `Environment` con
    `API_URL`, `http://localhost:8000` en ambos de momento). `DataAccessService` la usa.

## Qué no hace todavía

- **Sin llamadas al API**: el arranque usa solo valores por defecto. Faltan endpoints en `DataAccessService`, CORS en
  el API y el mapeo de los campos en `snake_case`.
- **El buscador no filtra nada** y el bloque de usuario no abre ningún panel (ni «Cerrar sesión»).
- **El idioma se fija solo al arrancar**: los componentes ya creados no se actualizan si cambia después.
- **Sin tests propios** de los managers ni de `AwaitRequest`; solo el test de creación de la aplicación.
- **Los diagramas `.drawio`** siguen siendo de escritorio y no se han tocado.
- **Sin comprobar**: el aspecto del resto de componentes de Material (diálogos, menús abiertos) y navegadores distintos
  de Chrome.
