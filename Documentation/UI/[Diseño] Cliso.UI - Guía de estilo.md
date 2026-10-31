# Guía de estilo de Cliso

Estilo inspirado en X (antes Twitter): **fondo negro, texto blanco** y poco más. Sin colores de marca: la jerarquía
se consigue con el contraste entre blanco, grises y negro.

## Principios

1. **Negro y blanco.** El negro es el lienzo; el blanco es la acción y el énfasis.
2. **Los grises ordenan.** Lo secundario se atenúa; no se añaden colores para destacar.
3. **Bordes finos en lugar de sombras.** Las superficies se separan con una línea de 1 px.
4. **Esquinas redondeadas** en lo interactivo (botones en píldora, campos en rectángulo de esquinas suaves); moderadas en tarjetas.
5. **Un solo color de acento: el blanco.** Los colores solo existen para estados (error, éxito).

## Paleta

| Token            | Valor     | Uso                                              |
|------------------|-----------|--------------------------------------------------|
| `--color-bg`     | `#000000` | Fondo de la aplicación                           |
| `--color-surface`| `#16181c` | Tarjetas, menús, paneles                         |
| `--color-hover`  | `#1d1f23` | Fondo al pasar el ratón por una superficie       |
| `--color-border` | `#2f3336` | Bordes y separadores                             |
| `--color-text`   | `#e7e9ea` | Texto principal                                  |
| `--color-muted`  | `#71767b` | Texto secundario, placeholders, iconos inactivos |
| `--color-white`  | `#ffffff` | Acento: botón primario, títulos, foco            |
| `--color-danger` | `#f4212e` | Errores y acciones destructivas                  |
| `--color-success`| `#00ba7c` | Confirmaciones                                   |

Contraste: `#e7e9ea` sobre `#000` y sobre `#16181c` supera AA (≥ 4,5:1); `#71767b` sobre `#000` solo se usa para
texto secundario de tamaño normal o mayor.

## Tipografía

- Familia: la del sistema (`system-ui`, `Segoe UI`, `Roboto`, `Helvetica`, `Arial`). Sin fuentes externas.
- Tamaño base **15 px**, interlineado 1,4.

| Nivel     | Tamaño | Peso |
|-----------|--------|------|
| Título 1  | 31 px  | 800  |
| Título 2  | 23 px  | 700  |
| Título 3  | 20 px  | 700  |
| Texto     | 15 px  | 400  |
| Secundario| 13 px  | 400  |

## Espaciado y forma

- Escala de 4 px: `4, 8, 12, 16, 24, 32, 48`.
- Radios: tarjetas `16 px`, botones `9999 px` (píldora), campos y elementos resaltados de listas `8 px` (`--radius-field`, `--radius-item`).
- Borde estándar: `1px solid var(--color-border)`.
- Sin sombras. Las capas flotantes (menús, diálogos) usan fondo `--color-surface` y borde.

## Componentes

- **Botón primario:** fondo blanco, texto negro, píldora, peso 700. Al pasar el ratón baja un poco el blanco.
- **Botón secundario:** transparente, borde gris, texto blanco. Al pasar el ratón, fondo `--color-hover`.
- **Botón peligro:** como el secundario pero con texto y borde `--color-danger`.
- **Campo de texto:** fondo negro, borde gris, rectángulo de esquinas suaves (8 px). En foco el borde pasa a blanco.
- **Tarjeta:** fondo `--color-surface`, borde fino, radio 16 px, relleno 16 px.
- **Enlace:** texto blanco subrayado al pasar el ratón.
- **Insignia:** píldora pequeña con borde gris y texto secundario.
- **Separador:** línea de 1 px en `--color-border`.

## Estados

- **Foco:** contorno blanco de 2 px con separación de 2 px (siempre visible, también con teclado).
- **Deshabilitado:** opacidad 0,5 y cursor `not-allowed`.
- **Error:** texto y borde en `--color-danger`.

## Mobile-first y rejilla

- Se diseña primero para móvil (≈ 360 px) y se amplía hacia arriba: solo media queries `min-width`, con los
  breakpoints de Bootstrap: `sm` 576, `md` 768, `lg` 992, `xl` 1200 y `xxl` 1400 px.
- La maquetación usa la **rejilla de 12 columnas de Bootstrap** (`container`, `row`, `col-*`; solo la rejilla, no el
  resto de Bootstrap), cargada desde `styles/_grid.scss`. Ejemplo: `<div class="row"><div class="col-12 col-md-6">`.
- Todo es redimensionable y ajustable: medidas relativas (`rem`, `%`, `fr`, `var(--space-*)`), sin anchos ni altos
  fijos salvo mínimos y máximos justificados, y sin scroll horizontal.
- Los breakpoints están en `styles/_breakpoints.scss` (`$sm`…`$xxl`) y las media queries los usan en vez de
  píxeles sueltos. Alto de pantalla con `100dvh` (no `100vh`) y objetivos táctiles de al menos `--touch-target`
  (≈ 44 px).
- **Barra lateral en móvil:** por debajo de `md` es una barra superior con un botón que despliega un menú
  (`mat-menu`); desde `md`, la columna fija de la izquierda.
- **Editores en móvil:** por debajo de `md` el modal ocupa toda la pantalla, sin maximizar ni splitter, y el
  selector y el detalle son dos pasos: lista (buscador, *+ Nuevo*, fichas con ›) y, al tocar una ficha, detalle con
  `←` para volver. Pie fijo con *Cancelar* y *Guardar* a ancho completo.
- **Paneles de la barra en móvil:** *Edición* se expande dentro del menú desplegable (acordeón) y *Cerrar sesión* va
  al final, junto al usuario.
- **Home en móvil:** fichas en una columna y paneles de visualización apilados a ancho completo.
- Los diagramas móviles son páginas «(móvil)» de cada `.drawio`, de ≈ 360 px, y sirven de referencia de responsividad.

## Pantallas

Estructura funcional de la aplicación. Los diagramas `.drawio` de esta carpeta la dibujan.

### Estructura de la aplicación (diagrama «Barra de herramientas»)

- Barra lateral con **Home** (el botón se llama «Inicio»), **Edición** y **Configuración**, y el **usuario**
  anclado abajo.
- **Edición** abre un panel a su derecha con *Modelos*, *Visualizaciones* y *Usuarios*; cada uno abre su editor.
- El usuario abre un panel encima con *Cerrar sesión*. Los paneles se cierran al hacer clic fuera.
- El botón activo o con el ratón encima se marca con `--color-hover`.

### Editores (diagrama «Editor», mismo esquema para los tres)

- Modal (`MatDialog`) redimensionable, con maximizar/restaurar y cerrar; el título y las fichas dependen del tipo.
- Izquierda, **selector**: buscador que filtra las fichas, botón *+ Nuevo* (deja el detalle en blanco) y fichas;
  la seleccionada va resaltada. Un **splitter** arrastrable (con ancho mínimo y máximo) cambia su ancho y un botón
  `«` lo pliega a una franja con el nombre del tipo; `»` lo restaura con el ancho anterior.
- Derecha, **detalle** en pestañas (`mat-tab-group`); pie con *Cancelar* (descarta) y *Guardar* (persiste).
- Pestañas: *Usuarios* → General y Permisos; *Modelos* → General (nombre, descripción y carga del fichero `.glb`,
  `.gltf` u `.obj` arrastrando o con clic) y Previsualización (visor 3D); *Visualizaciones* → General (modelo,
  nombre, descripción, observaciones) y Previsualización (visor con marcadores numerados, *+ Marcador* y su lista).

### Home (diagrama «Home»)

Catálogo de modelos en fichas, cada una con sus visualizaciones como etiquetas, y un único buscador de modelos y
visualizaciones. Clic en la ficha abre el modelo con todas sus visualizaciones; clic en una etiqueta (o en un
resultado de visualización del buscador) lo abre mostrando solo esa. Es una misma pantalla con más o menos etiquetas
encendidas: una barra de etiquetas muestra/oculta cada visualización y la ✕ del panel la oculta. Pendiente: la
disposición de los paneles en escritorio (en móvil, apilados).

## Angular Material

La UI usará **Angular Material** (Angular 20, que trae Material 3). El diseño se piensa para que Material se
adapte a este estilo, no al revés. Está instalado y su tema vive en `styles/_material.scss`; este es el criterio que
sigue.

### Principios

- **Una sola fuente de verdad:** los tokens de este documento (`--color-*`, `--space-*`...). Material se configura
  a partir de ellos; no se definen colores propios dentro de los componentes.
- **Solo tema oscuro.** Se fija `color-scheme: dark`; no hay tema claro ni conmutador.
- **Material para los componentes; clases propias solo para lo que Material no ofrece.** No se reimplementa un
  botón, un campo, un diálogo ni un menú.
- **Se personaliza con tokens, no con selectores.** Nada de `::ng-deep` ni de sobrescribir clases internas
  (`.mdc-*`); se usan las variables de sistema (`--mat-sys-*`) y los mixins `*-overrides` de cada componente.

### Correspondencia de tokens

| Token propio      | Variable de sistema de Material                                  |
|-------------------|------------------------------------------------------------------|
| `--color-bg`      | `--mat-sys-surface`, `--mat-sys-background`                      |
| `--color-surface` | `--mat-sys-surface-container` (y las variantes `-low`, `-high`)  |
| `--color-hover`   | `--mat-sys-surface-container-highest`                            |
| `--color-border`  | `--mat-sys-outline-variant`                                      |
| `--color-muted`   | `--mat-sys-on-surface-variant`, `--mat-sys-outline`              |
| `--color-text`    | `--mat-sys-on-surface`                                           |
| `--color-white`   | `--mat-sys-primary` (con `--mat-sys-on-primary` en negro)        |
| `--color-danger`  | `--mat-sys-error`                                                |

El tema de Material 3 genera superficies con un matiz de color; aquí se sobrescriben con los grises neutros de la
paleta para que no aparezca ningún tinte (ni azul ni violeta).

### Componentes

| Necesidad                | Se usa                                  | Ajuste de estilo                                               |
|--------------------------|-----------------------------------------|----------------------------------------------------------------|
| Botón primario           | `mat-flat-button`                       | Blanco con texto negro                                         |
| Botón secundario         | `mat-stroked-button`                    | Borde gris, texto blanco                                       |
| Botón de texto / icono   | `mat-button`, `mat-icon-button`         | Sin fondo; hover en `--color-hover`                            |
| Campo de texto           | `mat-form-field` con `appearance="outline"` | Esquinas de 8 px; borde blanco en foco                    |
| Tarjeta                  | `mat-card` con `appearance="outlined"`  | Borde fino, sin elevación                                      |
| Diálogo, menú, selector  | `MatDialog`, `mat-menu`, `mat-select`   | Fondo `--color-surface`, borde fino, sin sombra                |
| Barra de herramientas    | `mat-toolbar`                           | Negro, con línea inferior de 1 px                              |
| Navegación lateral       | `mat-sidenav` / `mat-nav-list`          | Negro; elemento activo en `--color-hover`                      |
| Tooltip                  | `matTooltip`                            | Superficie con borde de 1 px; en controles solo de icono       |
| Avisos                   | `MatSnackBar`                           | Superficie con borde; texto en blanco                          |
| Insignia, etiqueta       | `mat-chip` (o `.badge` propia)          | Píldora con borde gris                                         |
| Carga                    | `mat-progress-bar`, `mat-progress-spinner` | Blanco sobre gris                                           |

### Criterios de aspecto

- **Elevación:** ninguna. Material 3 sugiere sombras y capas tonales; se sustituyen por bordes de 1 px.
- **Forma:** botones en píldora (radio completo), campos y elementos resaltados de listas con 8 px, tarjetas y
  diálogos con 16 px; el resto de formas de Material se alinean con esos valores.
- **Densidad:** normal en formularios y páginas; **compacta** en el editor de visualizaciones y en la barra de
  herramientas, donde hay muchos controles juntos.
- **Tipografía:** se mantiene la fuente del sistema (no se carga Roboto); Material toma la familia de
  `--font-family`. Se conservan los tamaños de la tabla tipográfica.
- **Capas de estado:** hover, foco y pulsado los dibuja Material (ondas y capas translúcidas). Se mantienen, pero
  sobre fondos neutros, de modo que se vean como un ligero aclarado y no como color.
- **Iconos:** SVG de un solo `<path>` (24×24, blanco) en `src/resources/img/icons/`, sin librería de
  iconos ni fuentes externas. `IconsUtils.GetUrl(IconName.HOME)` da la ruta; el componente la guarda en una
  constante (`public HomeIcon: string = IconsUtils.GetUrl(IconName.HOME);`) y la plantilla la pinta con
  `<img [src]="HomeIcon" alt="" />`. Para añadir uno: el `.svg` en la carpeta y su nombre en `IconName`. Como son
  imágenes, su color va dentro del SVG (blanco); lo atenuado se hace con `opacity`.
- **Bordes de diálogos y menús:** Material no tiene token para ello; la clase `.floating-panel` (en
  `_material.scss`) se asigna por defecto a diálogos y menús desde `app.config.ts`.
- **Foco:** el contorno blanco de 2 px del apartado de estados se respeta también en los componentes de Material.

### Qué ocurre con los estilos actuales

`_variables.scss` y `_base.scss` se conservan: son la base del tema. `_components.scss` (`.btn`, `.input`, `.card`,
`.badge`) es **provisional**: sirve para maquetar mientras se usan los componentes de Material y se irá eliminando a medida que cada
clase se sustituya por su componente. Seguirán las utilidades de texto (`.text-muted`, `.text-danger`...).

## Organización del código

```
Cliso.UI/src/
├── app/                   # core/ (arranque), modules/ (una carpeta por pantalla) y shared/ (lo común)
├── resources/             # img/ (iconos SVG) y languages/ (textos multidioma)
├── styles.scss            # Punto de entrada: solo importa los parciales
└── styles/
    ├── _variables.scss    # Tokens (propiedades CSS en :root)
    ├── _grid.scss         # Rejilla de 12 columnas de Bootstrap (solo la rejilla)
    ├── _material.scss     # Tema de Angular Material: traduce los tokens a las variables --mat-sys-*
    ├── _base.scss         # Reset, tipografía y elementos HTML
    └── _components.scss   # Clases provisionales (.btn, .input, .card, .badge...) y utilidades
```

Los colores y medidas se leen siempre de las variables (`var(--color-bg)`); no se escriben valores sueltos en los
componentes.
