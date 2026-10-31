# Directrices del front (`Cliso.UI`)

Normas del front (Angular 20, TypeScript), además de las comunes de `directrices.md`. Si una norma choca con lo que
se pide, pregunta antes de saltártela.

Solo está decidido lo que sigue; lo demás (estructura de carpetas, rutas...) **no se decide
por iniciativa propia**: se propone y se pregunta. Las normas de Python del back (tabuladores, punto y coma,
regiones, una clase por fichero...) **no se aplican aquí**.

## Cómo trabajar en el front

- **Formato:** manda el `.editorconfig` y la configuración de Prettier de `Cliso.UI/package.json`: tabuladores (como
  el back), 130 columnas, comillas simples y sin comas finales. El HTML no se formatea automáticamente
  (`.prettierignore`), para no desordenar los atributos. Los ficheros de configuración de VS Code están en
  `.vscode/` (al guardar: Prettier en TS/SCSS/CSS y ordenación alfabética de las propiedades CSS).
- **Linter:** `npm run lint` (ESLint, `eslint.config.js`) debe dar 0 errores y 0 avisos antes de dar algo por
  hecho. Comprueba, entre otras, las normas de tipado y visibilidad, `curly`, `eqeqeq`, variables inicializadas, que
  no haya `console` salvo `warn` y que las plantillas no llamen a funciones. El formato lo resuelve Prettier.
- **Estilos:** todo color, medida y forma sale de los tokens de `src/styles/_variables.scss` (`var(--color-bg)`...).
  Nada de valores sueltos en los componentes. `styles.scss` solo importa parciales; los parciales viven en
  `src/styles/`.
- **Componentes: Angular Material** (instalado; tema en `src/styles/_material.scss`). No se reimplementa lo que
  Material ya ofrece (botón, campo, diálogo, menú, pestañas, tarjeta, chip...). Se personaliza con los tokens
  `--mat-sys-*` y los mixins `*-overrides`; **nunca con `::ng-deep` ni sobrescribiendo clases internas (`.mdc-*`)**.
  La tabla "Componentes" de la guía de estilo dice qué componente usar para cada necesidad.
- **`_components.scss` es provisional** (`.btn`, `.input`, `.card`, `.badge`): no se le añaden clases nuevas; cada
  una se elimina cuando se sustituye por su componente de Material. Solo se mantienen las utilidades de texto.
- **Dependencias mínimas:** no se añade ninguna librería de UI, CSS ni iconos distinta de Angular Material sin
  consultarlo. Los iconos son SVG en `src/resources/img/icons/` (`IconsUtils.GetUrl(IconName.X)` da la
  ruta; el componente la guarda en una propiedad y la plantilla la pinta con `<img>`); sin librería de iconos ni Google Fonts.
- **Formato de los SVG:** ligeros, minificados y con **un único `<path fill="#ffffff">`**; nunca `style`, ni
  atributos o espacios de nombres de editor, comentarios o metadatos. Otros elementos (`<g>`, `transform`,
  opacidad...) solo si el resultado no se puede conseguir aplanándolo a paths. Cabecera:
  `<svg viewBox="0 0 960 960" width="24" height="24" xmlns="http://www.w3.org/2000/svg">`. Los iconos actuales
  proceden de Material Symbols (variante *outlined*, peso 400, licencia Apache 2.0), con el origen del `viewBox`
  trasladado a `0 0`.
- **Tras probar, limpia:** borra `dist/` y los ficheros temporales que hayas generado (la caché `.angular/cache` y
  `node_modules` ya están fuera de git).

## Mobile-first y rejilla (decidido)

- **Se diseña primero para móvil** (≈ 360 px) y se amplía hacia arriba: solo media queries `min-width`, con los
  breakpoints de Bootstrap (`sm` 576, `md` 768, `lg` 992, `xl` 1200, `xxl` 1400 px).
- **Maquetación con las columnas de Bootstrap, solo su rejilla** (`bootstrap-grid`, cargada desde
  `src/styles/_grid.scss`): `container`, `row`, `col-*`. No se instala Bootstrap entero ni sus componentes.
- **Todo redimensionable y ajustable:** medidas relativas (`rem`, `%`, `fr`, `var(--space-*)`), sin anchos ni altos
  fijos en píxeles salvo mínimos y máximos justificados (por ejemplo, el splitter del editor). Sin scroll horizontal.
- **Barra lateral en móvil (decidido):** por debajo de `md` es una barra superior con un botón que despliega un menú
  (`mat-menu`); desde `md`, la columna fija de la izquierda. Pendiente, **no lo decidas tú**: cómo se muestran en
  móvil los paneles y el editor.

## Estilo de código (TypeScript)

- **Sencillísimo:** el código debe entenderlo quien sabe poco TypeScript. Nada avanzado sin permiso expreso:
  genéricos, tipos condicionales o mapeados, utilidades de tipos (`Partial`, `Record`...), `as const`, `typeof` en
  tipos, decoradores propios, `any`. Sí: clases, interfaces, tipos de estructura, enumerados, `if`/`for`,
  `async`/`await`. Excepciones permitidas: genéricos en `RequestUtils.AwaitRequest` y `TryGetResult`, y `keyof` en
  `LanguageManager.GetText`.
- **Interfaces y tipos:** una interfaz (`INombre`) solo define un contrato de métodos o funciones comunes, nunca
  propiedades. Para describir una estructura de propiedades se usa un `type` (`type Nombre = { ... };`), sin
  uniones ni combinaciones de tipos (salvo `| null` para «sin valor»).
- **Todo tipado de forma explícita:** variables, parámetros, retornos y propiedades. Sin `any`. `ng build` sin
  errores.
- **Nombres:**

  | Elemento | Convención | Ejemplo |
  |---|---|---|
  | Método público | `public` + PascalCase | `public Open(): void` |
  | Método privado | `private` + camelCase | `private loadData(): void` |
  | Constante pública | `public static readonly` + ALL_CAPS (en un componente, `public readonly`: la plantilla no lee `static`) | `PATH` |
  | Constante privada | `private static readonly` + `_ALL_CAPS` | `_DEFAULT_SIZE` |
  | Propiedad pública | `public` + PascalCase | `Title` |
  | Propiedad privada | `private` + `_PascalCase` | `_Http` |
  | Parámetros y variables locales | camelCase | `iconName` |
  | Clases, enumerados y tipos | PascalCase (campos de tipos, PascalCase; miembros de enumerados, ALL_CAPS) | `IconName`, `HOME` |
  | Interfaces | `I` + PascalCase | `IRepository` |

  Siempre se escribe `public` o `private` (sin modificador implícito) y no se usan propiedades en parámetros del
  constructor: se declaran y se asignan a mano. Excepción: los nombres que Angular impone (`ngOnInit`,
  `ngOnDestroy`...) se escriben como él los exige.
- **Regiones:** cada clase organiza sus miembros en regiones, solo las que tengan miembros, con el nombre en inglés y
  en MAYÚSCULAS y el cierre repitiéndolo (`//#region PUBLIC METHODS` ... `//#endregion PUBLIC METHODS`), en este
  orden: `PUBLIC CONSTANTS`, `PRIVATE CONSTANTS`, `PUBLIC STATIC PROPERTIES`, `PRIVATE STATIC PROPERTIES`,
  `PUBLIC PROPERTIES`, `PROTECTED PROPERTIES`, `PRIVATE PROPERTIES`, `EMITTERS`, `CONSTRUCTOR`, `ANGULAR LIFECYCLE`,
  `PUBLIC METHODS`, `PUBLIC STATIC METHODS`, `SUBSCRIBERS`, `PROTECTED METHODS`, `PRIVATE METHODS`,
  `PRIVATE STATIC METHODS`. Lo `protected` (solo en clases base) sigue la nomenclatura de lo privado. En
  `ANGULAR LIFECYCLE` van también los métodos que Angular impone por contrato, como `canActivate` de un guard.
  Primero los datos, luego el comportamiento; lo público antes que lo privado; cada método privado después de quienes lo usan. Dentro de cada
  región, en orden alfabético por nombre (incluido el `_` inicial), salvo que el orden tenga significado o una
  declaración use otra al inicializarse (entonces, un comentario `//` lo explica). Las declaraciones de un mismo
  grupo van seguidas, sin líneas en blanco entre ellas; los métodos se separan con una línea en blanco.
- **Una clase por fichero** (y un enumerado, tipo o interfaz, salvo en `shared/definitions/`, que agrupa por tema; ver
  «Utils y Services»), con el formato `nombreClase.tipoContenido.ts`: el nombre de
  la clase en camelCase y el sufijo de su tipo (`home.component.ts`, `dataAccess.service.ts`,
  `applicationSettings.utils.ts`, `icons.definitions.ts`, `languageBase.type.ts`, `tryGetResult.models.ts`,
  `iRepository.interface.ts`). Las hojas de idioma, sin sufijo (`languageEs.ts`). Los `*.utils.ts` son clases
  estáticas o con estado sin Angular; los `*.models.ts`, clases de datos (DTO u objetos comunes con su
  comportamiento). Excepción: los ficheros de configuración de Angular (`main.ts`, `app.config.ts`, `app.routes.ts`).
- **Rutas absolutas en los imports:** los ficheros propios se importan siempre con la ruta absoluta desde `src/`
  (`import { IconName } from 'src/app/shared/definitions/icons.definitions';`), nunca con `./` ni `../`, para no
  tener problemas al mover ficheros. Funciona con `baseUrl: "./"` en `tsconfig.json`. Excepción: `templateUrl` y
  `styleUrl` de un componente, que Angular exige relativos (`./home.component.html`).
- **Inicializa al declarar:** toda variable o propiedad lleva valor en su declaración; «sin valor» es `null`.
- **Usa las constantes y enumerados existentes** en vez de literales sueltos (rutas, claves, códigos de idioma...).
- **Sin funciones sueltas:** la lógica de los Utils va en clases estáticas. Única excepción: los guards, que Angular
  exige como función (`CanActivateFn`, en `core/guards/`).
- **Inyección explícita:** por parámetros del constructor, asignados a una propiedad privada. `inject()` solo en
  `app.config.ts`.

## Estado, llamadas al API y componentes

- **Estado con propiedades normales y `async`/`await`.** Sin signals ni RxJS (con `zone.js`, Angular refresca la
  pantalla tras un `await`). RxJS solo aparece en la capa HTTP: `DataAccessService` (devuelve los `Observable` de
  `HttpClient`), `RequestUtils.AwaitRequest` y `HttpRequestCanceller`.
- **Llamadas al API:** solo a través de `DataAccessService`, y cada una se espera con
  `RequestUtils.AwaitRequest(llamada$, canceller)`. Devuelve un `TryGetResult` (`Success` es `false` si la petición
  se canceló; si no, `Result` trae la respuesta) y lanza el error si la petición falla. Se comprueba siempre
  `.Success` (nunca el valor de `Result`) y el `try/catch/finally` va en la capa externa de la operación:

  ```ts
  try {
    const result: TryGetResult<UserDto> = await RequestUtils.AwaitRequest(
      this._DataAccess.GetUserByNick(nick),
      this._HttpRequestCanceller
    );

    if (result.Success) {
      // usar result.Result
    } else {
      // Petición cancelada: no hay nada que hacer
    }
  } catch (error) {
    // avisar del fallo, una sola vez, aquí
  } finally {
    this.IsLoading = false;
  }
  ```

  El `HttpRequestCanceller` es obligatorio: el componente crea uno, lo pasa en cada llamada y llama a `Destroy()`
  en `ngOnDestroy`, para que ninguna llamada quede colgada. Pollings y refrescos continuos, no: solo los que el
  usuario pide. Varias llamadas a la vez: `forkJoin` dentro de una sola llamada a `AwaitRequest` (todo o nada).
  Si hay que tolerar fallos parciales, se consulta antes.
- **Plantilla sin lógica:** ni funciones, ni getters, ni expresiones calculadas (`{{ f() }}`, `@if (a && b)`):
  se reevalúan en cada detección de cambios y devuelven referencias nuevas. La plantilla solo lee propiedades y
  constantes ya calculadas. Textos (del i18n), nombres de icono, URLs y medidas salen siempre de variables o
  constantes del componente, nunca escritos a mano en el HTML. La estructura y las clases CSS sí.
- **Manejadores y emisores:** los manejadores que llama la plantilla se llaman `OnNombreEvento()` y van en
  `SUBSCRIBERS`. Los `@Output()` van en `EMITTERS`, y el método privado que emite es `emitNombreEvento()`.

## Normas específicas de un componente

Las normas o comportamientos no evidentes que solo afectan a un componente o carpeta concretos no van aquí, sino en
un `CLAUDE.md` dentro de esa carpeta (el nombre debe ser exactamente ese: se carga solo al tocar sus ficheros). Se
proponen al usuario antes de crearlos o cambiarlos, y se actualizan en el mismo cambio que modifica lo que describen.
Si una norma cita un símbolo, clase CSS o fichero concretos, se comprueba que sigue vigente antes de aplicarla.

## Estructura de carpetas

```
Cliso.UI/src/
├── app/
│   ├── app.ts, app.config.ts, app.routes.ts   # Componente raíz, configuración y rutas
│   ├── core/        # Lo que se carga una vez al arrancar: interceptores, servicios de arranque
│   ├── modules/     # Una carpeta por pantalla o función: <módulo>/components/ (y interfaces/, events/...)
│   └── shared/      # Lo que usan varios módulos: components/, definitions/, directives/, models/, pipes/, services/, utils/
├── resources/       # img/ (estáticos) y languages/ (textos)
└── styles/          # Parciales SCSS
```

- **Ubicación por reutilización:** en cuanto algo se use desde más de un módulo, vive en el subdirectorio de `shared`
  que le corresponda, no junto al primer consumidor. Lo que solo usa un componente se queda en su carpeta (los
  `type`, enumerados y clases de apoyo van en el propio componente); lo que usan varios componentes del mismo
  módulo, en la carpeta del módulo.
- **`shared/models`:** solo los objetos que van o vienen del API (DTO) y los objetos comunes complejos.
- **Nombre del fichero según su carpeta:** el componente raíz del módulo lleva el nombre del módulo
  (`modules/home/components/home.component.ts`); los hijos no repiten el contexto que ya da la ruta
  (`modules/home/components/card/card.component.ts`) y su carpeta va dentro de la del componente que lo usa. La clase
  y el selector, en cambio, son globales y llevan el nombre completo (`HomeCardComponent`, `app-home-card`).
## Control de flujo

- **Sin `return` anticipado**, tampoco en métodos que devuelven valor: se asigna a una variable `result` y hay un
  único `return` al final.
- **Todo `if` lleva `else`.** Si el `else` es el flujo esperado, un comentario lo dice (`// No hay nada que
  hacer`); si es un caso erróneo, `throw` cuando lo inició el usuario o `console.warn` en otro caso.
- **`switch` sobre un enumerado:** un `case` por cada valor (los que compartan comportamiento se agrupan), y el
  `default` solo para lo imprevisto, avisando siempre con `console.warn` o `throw`.
- El tipo de retorno se declara siempre.

```ts
private getName(item: Item | null): string | null {
  let result: string | null = null;

  if (!CheckUtils.IsNull(item)) {
    result = item.Name;
  } else {
    console.warn('Home.getName() => item no definido');
  }

  return result;
}
```

## Comentarios

- El código se lee solo; los comentarios aclaran lo que no es evidente o hace algo distinto de lo esperable.
- **`/** */` solo en la declaración** de una clase, propiedad, constante o método (para que el editor lo muestre al
  pasar el cursor) y nunca `//` ahí; para explicar una línea o un bloque, `//` con un espacio tras las barras.
- **Resumen de una línea que dice qué hace**, no cómo ni dónde se usa; con `@param` y `@returns` cada uno en su
  línea cuando la firma no baste. Sin JSDoc si el nombre y los parámetros ya lo dicen todo. Breves: orientativamente,
  lo que cabe en un tuit.
- **Cada clase es una isla:** los comentarios no nombran a otros componentes concretos.
- **Nada de comportamiento antiguo ni de planes sin implementar** en un comentario, y **no se deja código
  comentado** (el historial de git lo conserva).
- **Marcadores de trabajo pendiente:** `HACK <nombre>: <descripción>` para algo provisional de desarrollo (no se sube
  al repositorio) y `TODO <nombre> <URL de la tarjeta de Trello>: <descripción concreta>` para un pendiente real. La
  tarjeta debe existir; si no se conoce, se pregunta antes de escribirlo.

## Componentes, rendimiento y eventos

- **Entradas y salidas:** los `@Input()` en PascalCase y los `@Output()` en camelCase (`valueChanged`), como los
  eventos nativos. Un evento genérico de cambio mejor que uno por campo.
- **Un componente es una isla autónoma:** no se acopla a otro concreto. Un hijo no se manipula con `@ViewChild`: se
  comunica con eventos o `@Input()`. `@ViewChild` solo sobre elementos fijos de la propia plantilla, con
  `{ static: true }`, y se usa desde `ngAfterViewInit` o un manejador, nunca desde el constructor.
- **Evita `.subscribe()` para propagar cambios entre componentes:** usa un emisor (`emitNombreEvento`).
- **`ngOnDestroy`** (en `ANGULAR LIFECYCLE`; todo componente con algo que liberar lo implementa) **limpia todo lo
  que el componente creó:** `complete()` de los emisores, cancelar las llamadas con
  el `HttpRequestCanceller` (`Destroy()`), cualquier `setInterval`/`setTimeout` (`clearInterval`/`clearTimeout`) y
  las referencias a otros objetos (a `null`).
- **Rendimiento:** `track` en todo `@for`; sin funciones ni ternarios en la plantilla (ver «Plantilla sin lógica»);
  una propiedad que se reasigna en muchos puntos usa un método privado que centraliza la asignación y sus efectos;
  `NgZone.runOutsideAngular` y `markForCheck`/`detectChanges` solo cuando haga falta de verdad.
- **Cadenas con valores:** el texto lleva marcadores (`'Mostrar {0}'`) y se sustituyen, sin concatenar a mano.

## Errores y registro

- La capa más externa de cada operación envuelve la ejecución en `try/catch` y avisa del fallo. Las capas
  intermedias no repiten el `try/catch`: propagan el error (`throw` o `TryGetResult.Failed()`) y, si hace falta,
  lo relanzan con un mensaje más descriptivo. **Un aviso por fallo.**
- Formato de los avisos de consola y de las excepciones: `NombreClase.método() => información del error`.

## HTML y CSS

- **Plantilla:** interpolaciones entre espacios (`{{ Title }}`). Atributos de una etiqueta: en la primera línea lo
  fijo (`class`, atributos estáticos, enlaces a constantes); en líneas propias, por este orden, la referencia
  (`#ref`), la directiva estructural, los enlaces del DOM que cambian (`[class.x]`, `[src]`...), los `@Input()` y los
  eventos, estos tres últimos grupos en orden alfabético. El cierre `></tag>` va en su línea si hay varias. Para un
  atributo de texto, interpolación (`title="{{ TITLE }}"`); para un valor que no sea texto, `[atributo]`. El HTML
  no se formatea automáticamente, para no desordenar los atributos.
- **Etiquetas semánticas, por accesibilidad:** se usan las etiquetas HTML con significado en vez de `div`/`span`
  genéricos: `header`, `nav`, `main`, `section`, `aside`, `footer`, `h1`-`h6`, `button`, `a`, `ul`/`li`, `label`...
  En `index.html`, `lang` en `<html>` y un `<title>` descriptivo; cada pantalla, un único `h1` (visible o con una
  clase que solo lo oculte visualmente) y sin saltar niveles de encabezado. Los iconos decorativos llevan
  `alt=""`; los botones o enlaces que solo tienen icono, un nombre accesible (`aria-label`). Un `div` solo se usa
  cuando no hay una etiqueta con el significado adecuado.
- **Clases CSS:** la capa principal de un componente se llama `{nombre}Dir` (`homeDir`) y todo lo de dentro lleva el
  prefijo derivado del componente: `[prefijo]_[tipo]_[descripción]` (`hom_search_input`). El prefijo son las
  iniciales de su nombre o, si es una sola palabra, las dos o tres primeras letras (el mismo criterio que los
  textos multidioma, con la clave en MAYÚSCULAS y la clase en minúsculas). Los estados de una clase, con guion medio:
  `hom_search_input-disabled`. Si un hijo se independiza, se reformulan sus clases y pasa a `shared`.
- **Separaciones con `gap` o `padding`, no con `margin`** (salvo `margin: auto` para centrar, márgenes negativos sin
  alternativa o hijos de un contenedor que no sea flex ni grid).
- **Propiedades de cada regla en orden alfabético**; los selectores anidados, después de las propiedades.
- **`overflow` solo donde el contenido deba desplazarse o recortarse**, lo más abajo posible y con un comentario si
  no es evidente; para que un elemento flex no crezca con su contenido, `min-width: 0` o `min-height: 0`.
- **Interfaz táctil y estrecha:** al tocar estilos o estructura se piensa cómo se comporta en anchos reducidos
  (`flex`/`grid` con `wrap` antes que anchos fijos), sin introducir regresiones de responsividad.

## Textos multidioma (i18n)

- `src/resources/` guarda el contenido que no es lógica: `img/` (ficheros estáticos, servidos desde `angular.json`) y
  `languages/` (TypeScript que se compila).
- Los textos son **un objeto grande por idioma** con claves en MAYÚSCULAS (excepción a la norma de PascalCase de
  los campos de tipos). `languages/languageBase.type.ts` define todas las claves; `LanguageEs`,
  `LanguageGl` y `LanguageEn` tienen cada una su objeto `TEXTS` tipado con ella, así que una clave nueva sin
  traducir **no compila**. Toda clave nueva va primero en la base y luego en las tres hojas.
- **Prefijo de la clave:** `WEB_` si el texto se usa en más de un sitio (`WEB_EXIT: 'Salir'`); si lo usa un solo
  componente, el prefijo del componente: las iniciales de su nombre (`BME_ADD_MODEL` para BimModelEditor) o, si tiene
  una sola palabra, la palabra entera (`SIDEBAR_MENU`). Un texto repetido en dos sitios no se duplica: se junta en
  una sola clave `WEB_` (`WEB_HOME`). Si un texto pasa a usarse en otro sitio, se renombra con `WEB_`.
- `LanguageManager` (`shared/utils/language/`, estático) guarda el idioma actual: `SetLanguage(código)`, `GetCode()` y
  `GetText(clave)`, donde la clave es de tipo `keyof LanguageBase` (único uso permitido de `keyof`: una clave
  inexistente no compila). El componente copia el texto a una constante y la plantilla la lee. Castellano de
  reserva.
- **Región `LANGUAGE TEXTS`:** los textos van en una región `//#region LANGUAGE TEXTS` anidada dentro de la región de
  constantes (`PUBLIC CONSTANTS`), al final de ella y separada del resto por una línea en blanco. Son constantes de
  instancia (`public readonly`, para que la plantilla las lea) en ALL_CAPS, ordenadas alfabéticamente:
  `public readonly EXIT_TEXT: string = LanguageManager.GetText('WEB_EXIT');`. Si otra constante se inicializa con
  esos textos, va detrás del bloque, con un comentario `//` que lo explique.

## Utils y Services

El proyecto debe poder cambiar de framework sin reescribir la lógica, así que **lo que se pueda no depende de
Angular**:

- **Utils** (`*.utils.ts`): clases auxiliares con la lógica (métodos y las constantes propias de esa lógica),
  siempre dentro de clases estáticas, sin imports de `@angular/*`. Los *managers* (parámetros de la aplicación,
  usuario actual...) son **clases con miembros `static`** (≈ `static class` de C#), no servicios inyectables.
- **Services** (`*.service.ts`): lo que sí necesita Angular (inyección de dependencias, `HttpClient`...). Se usan
  para `DataAccessService` (todas las llamadas al API) y para sacar operaciones de los componentes y que no se
  sobrecarguen.
- **Definitions** (`*.definitions.ts`, en `shared/definitions/`): los enumerados, tipos, constantes sueltas y
  las interfaces muy ligeras que usan los Utils y los Services, para no mezclarlos con las clases. Se agrupan **por
  tema**: un fichero por tema (`icons.definitions.ts`, `routes.definitions.ts`, `language.definitions.ts`,
  `applicationSettings.definitions.ts`, `constants.definitions.ts`), que puede traer varios elementos relacionados. Es
  la única excepción a «una cosa por fichero»; las clases (Utils, Services, models, componentes) siguen siendo una
  por fichero. Un enumerado o tipo que solo usa un componente sigue en el propio componente.
  - **Estructura:** nada se exporta en su declaración. El fichero se divide en regiones, solo las que tengan
    contenido y en este orden: `ENUMS`, `TYPES`, `INTERFACES`, `CONSTANTS`; y al final, un único
    `export { A, B, C };` con todo, en orden alfabético.
  - **Constantes comunes** (`constants.definitions.ts`): los valores que se repiten por todas partes (`STRING_UNDEFINED`
    = `''`, `ID_NUMERIC_UNDEFINED` = `-1`, `ID_STRING_UNDEFINED` = `'-1'`...) se definen ahí y se usan en vez de
    escribir el literal. Se van añadiendo según hagan falta.
  - **DTOs y mappers (aún sin crear; se harán con las llamadas al API):** los DTO irán en
    `dtos.definitions.ts` como `type` con los campos **tal y como los envía el API** (`snake_case`: única excepción a
    la nomenclatura PascalCase de los campos) y no se usarán fuera de la capa de acceso a datos. Cada clase del back
    con DTO tendrá su **mapper** (`shared/utils/mappers/`, clase estática `NombreMapper` en `nombreMapper.utils.ts`,
    como los del back) que convierte campo a campo entre el DTO y la clase equivalente del front, que irá en
    `shared/models/<nombre>/` (`ToModel(dto)` y, si el API recibe esa clase, `ToDto(clase)`). Un identificador sin
    asignar (`null` en el API) pasa a `ID_NUMERIC_UNDEFINED`; un texto sin asignar, a `STRING_UNDEFINED`.
- **Comprobaciones habituales** (`CheckUtils`, `shared/utils/check.utils.ts`): `IsNull`, `IsUndefined`,
  `IsNullOrUndefined`, `IsEmptyString`, `IsNumber`, `IsValidNumericId`... Se usan en vez de repetir la comparación
  (`if (!CheckUtils.IsNull(item))`, no `item !== null`). `IsNull`, `IsUndefined`, `IsNullOrUndefined` e `IsNumber`
  son *type guards* (`value is null`): excepción permitida a «sin tipos avanzados», para que TypeScript estreche el
  tipo después de la comprobación.
- Si dudas entre Utils y Services: Utils, salvo que necesite la inyección de Angular.

## Tests

- **Por defecto no se crean tests (`*.spec.ts`)**: ni al escribir código nuevo ni al generar con `ng generate` (se
  usa `--skip-tests`). Solo se prueban comportamientos delicados (por ejemplo, los managers).
- Cuando un comportamiento lo merezca, **se sugiere al usuario** y solo se escribe el test si lo confirma.

## Diseño de la interfaz (decidido)

La guía de estilo (`Documentation/UI/[Diseño] Cliso.UI - Guía de estilo.md`) y los diagramas `.drawio` de
`Documentation/UI/` son la fuente de verdad. Si lo que se pide choca con ellos, pregunta antes.

**Prohibido** en cualquier pantalla o componente:

- Colores de marca o de acento (el azul, por ejemplo). El único acento es el blanco; el rojo (`--color-danger`) y el
  verde (`--color-success`) solo existen para estados de error y éxito.
- Sombras y elevación (se sustituyen por un borde de 1 px en `--color-border`), tema claro o conmutador de tema,
  fuentes externas (se usa la del sistema; no se carga Roboto).
- Formas distintas de las fijadas: botones en píldora, campos y elementos resaltados de listas con 8 px, tarjetas y
  diálogos con 16 px.
- Anular el contorno de foco (blanco, 2 px, siempre visible) o dejar el estado deshabilitado sin opacidad 0,5.

**Pantallas:** su estructura (barra lateral, paneles, editores, Home) está en el apartado «Pantallas» de la guía de
estilo. Lo no decidido (el diseño móvil de los paneles y el editor, la disposición de los paneles del Home) **no lo
decidas tú**: pregunta. El botón de Home se llama «Inicio» (`WEB_HOME`).

**Diagramas:** se mantienen al día cuando cambia el diseño, junto con la guía y el README. Siguen la propia guía
(lienzo negro, superficie `#16181C`, borde `#2F3336`, texto `#E7E9EA`/`#71767B`, acento blanco, sin sombras). Se
editan con `Edit` / `Write` (son XML); nombre `[Diseño] Cliso.UI - <pantalla>.drawio`.

## Comprobaciones antes de dar algo por hecho

1. `ng build` y `npm run lint` desde `Cliso.UI` → sin errores ni avisos.
2. Si hay cambios visuales, comprueba en el navegador que se respeta la guía de estilo (sin colores ni sombras
   ajenos, foco visible).
3. Di con claridad lo que **no** has podido probar.
