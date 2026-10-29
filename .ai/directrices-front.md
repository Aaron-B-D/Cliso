# Directrices del front (`Cliso.UI`)

Normas del front (Angular 20, TypeScript), además de las comunes de `directrices.md`. Si una norma choca con lo que
se pide, pregunta antes de saltártela.

Solo está decidido lo que sigue; lo demás (estructura de componentes, rutas, estado, cliente HTTP...) **no se decide
por iniciativa propia**: se propone y se pregunta. Las normas de Python del back (tabuladores, punto y coma,
regiones, una clase por fichero...) **no se aplican aquí**.

## Cómo trabajar en el front

- **Formato:** manda el `.editorconfig` y la configuración de Prettier de `Cliso.UI/package.json` (2 espacios,
  comillas simples).
- **Estilos:** todo color, medida y forma sale de los tokens de `src/styles/_variables.scss` (`var(--color-bg)`...).
  Nada de valores sueltos en los componentes. `styles.scss` solo importa parciales; los parciales viven en
  `src/styles/`.
- **Componentes: Angular Material** (aún sin instalar; se instalará cuando se pida). No se reimplementa lo que
  Material ya ofrece (botón, campo, diálogo, menú, pestañas, tarjeta, chip...). Se personaliza con los tokens
  `--mat-sys-*` y los mixins `*-overrides`; **nunca con `::ng-deep` ni sobrescribiendo clases internas (`.mdc-*`)**.
  La tabla "Componentes" de la guía de estilo dice qué componente usar para cada necesidad.
- **`_components.scss` es provisional** (`.btn`, `.input`, `.card`, `.badge`): no se le añaden clases nuevas; cada
  una se elimina cuando se sustituye por su componente de Material. Solo se mantienen las utilidades de texto.
- **Dependencias mínimas:** no se añade ninguna librería de UI, CSS ni iconos distinta de Angular Material sin
  consultarlo. Los iconos (Material Symbols *outlined*) tienen pendiente cómo se sirven (Google Fonts o alojados
  en la app): no lo resuelvas tú.
- **Tras probar, limpia:** borra `dist/` y los ficheros temporales que hayas generado (la caché `.angular/cache` y
  `node_modules` ya están fuera de git).

## Diseño de la interfaz (decidido)

La guía de estilo (`Documentation/UI/[Diseño] Cliso.UI - Guía de estilo.md`) y los diagramas `.drawio` de
`Documentation/UI/` son la fuente de verdad. Si lo que se pide choca con ellos, pregunta antes.

**Prohibido** en cualquier pantalla o componente:

- Colores de marca o de acento (el azul, por ejemplo). El único acento es el blanco; el rojo (`--color-danger`) y el
  verde (`--color-success`) solo existen para estados de error y éxito.
- Sombras y elevación (se sustituyen por un borde de 1 px en `--color-border`), tema claro o conmutador de tema,
  fuentes externas (se usa la del sistema; no se carga Roboto).
- Formas distintas de las fijadas: botones y campos en píldora, tarjetas y diálogos con 16 px.
- Anular el contorno de foco (blanco, 2 px, siempre visible) o dejar el estado deshabilitado sin opacidad 0,5.

**Estructura de la aplicación** (diagrama "Barra de herramientas"):

- Barra lateral con **Home**, **Edición** y **Configuración**, y el **usuario** anclado abajo.
- **Edición** abre un panel a su derecha con *Modelos*, *Visualizaciones* y *Usuarios*; cada uno abre su editor.
- El usuario abre un panel encima con *Cerrar sesión*. Los paneles se cierran al hacer clic fuera.
- El botón activo o con el ratón encima se marca con `--color-hover`.

**Editores** (diagrama "Editor", mismo esquema para los tres):

- Modal (`MatDialog`) redimensionable, con maximizar/restaurar y cerrar; el título y las fichas dependen del tipo.
- Izquierda, **selector**: buscador que filtra las fichas, botón *+ Nuevo* (deja el detalle en blanco) y fichas;
  la seleccionada va resaltada. Un **splitter** arrastrable (con ancho mínimo y máximo) cambia su ancho y un botón
  `«` lo pliega a una franja con el nombre del tipo; `»` lo restaura con el ancho anterior.
- Derecha, **detalle** en pestañas (`mat-tab-group`); pie con *Cancelar* (descarta) y *Guardar* (persiste).
- Pestañas: *Usuarios* → General y Permisos; *Modelos* → General (nombre, descripción y carga del fichero `.glb`,
  `.gltf` u `.obj` arrastrando o con clic) y Previsualización (visor 3D); *Visualizaciones* → General (modelo,
  nombre, descripción, observaciones) y Previsualización (visor con marcadores numerados, *+ Marcador* y su lista).

**Home** (diagrama "Home"): catálogo de modelos en fichas, cada una con sus visualizaciones como etiquetas, y un
único buscador de modelos y visualizaciones. Clic en la ficha abre el modelo con todas sus visualizaciones; clic en
una etiqueta (o en un resultado de visualización del buscador) lo abre mostrando solo esa. Es una misma pantalla con
más o menos etiquetas encendidas: una barra de etiquetas muestra/oculta cada visualización y la ✕ del panel la
oculta. Pendientes, **no los decidas tú**: el nombre definitivo de "Home" y la disposición de los paneles.

**Diagramas:** se mantienen al día cuando cambia el diseño, junto con la guía y el README. Siguen la propia guía
(lienzo negro, superficie `#16181C`, borde `#2F3336`, texto `#E7E9EA`/`#71767B`, acento blanco, sin sombras). Se
editan con `Edit` / `Write` (son XML); nombre `[Diseño] Cliso.UI - <pantalla>.drawio`.

## Comprobaciones antes de dar algo por hecho

1. `ng build` desde `Cliso.UI` → sin errores.
2. Si hay cambios visuales, comprueba en el navegador que se respeta la guía de estilo (sin colores ni sombras
   ajenos, foco visible).
3. Di con claridad lo que **no** has podido probar.
