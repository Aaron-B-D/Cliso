# Guía de estilo de Cliso

Estilo inspirado en X (antes Twitter): **fondo negro, texto blanco** y poco más. Sin colores de marca: la jerarquía
se consigue con el contraste entre blanco, grises y negro.

## Principios

1. **Negro y blanco.** El negro es el lienzo; el blanco es la acción y el énfasis.
2. **Los grises ordenan.** Lo secundario se atenúa; no se añaden colores para destacar.
3. **Bordes finos en lugar de sombras.** Las superficies se separan con una línea de 1 px.
4. **Esquinas muy redondeadas** en lo interactivo (botones y campos en píldora); moderadas en tarjetas.
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
- Radios: tarjetas `16 px`, botones y campos `9999 px` (píldora).
- Borde estándar: `1px solid var(--color-border)`.
- Sin sombras. Las capas flotantes (menús, diálogos) usan fondo `--color-surface` y borde.

## Componentes

- **Botón primario:** fondo blanco, texto negro, píldora, peso 700. Al pasar el ratón baja un poco el blanco.
- **Botón secundario:** transparente, borde gris, texto blanco. Al pasar el ratón, fondo `--color-hover`.
- **Botón peligro:** como el secundario pero con texto y borde `--color-danger`.
- **Campo de texto:** fondo negro, borde gris, píldora. En foco el borde pasa a blanco.
- **Tarjeta:** fondo `--color-surface`, borde fino, radio 16 px, relleno 16 px.
- **Enlace:** texto blanco subrayado al pasar el ratón.
- **Insignia:** píldora pequeña con borde gris y texto secundario.
- **Separador:** línea de 1 px en `--color-border`.

## Estados

- **Foco:** contorno blanco de 2 px con separación de 2 px (siempre visible, también con teclado).
- **Deshabilitado:** opacidad 0,5 y cursor `not-allowed`.
- **Error:** texto y borde en `--color-danger`.

## Angular Material

La UI usará **Angular Material** (Angular 20, que trae Material 3). El diseño se piensa para que Material se
adapte a este estilo, no al revés. Aún no está instalado: esto es el criterio que se aplicará al incorporarlo.

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
| Campo de texto           | `mat-form-field` con `appearance="outline"` | Forma de píldora; borde blanco en foco                    |
| Tarjeta                  | `mat-card` con `appearance="outlined"`  | Borde fino, sin elevación                                      |
| Diálogo, menú, selector  | `MatDialog`, `mat-menu`, `mat-select`   | Fondo `--color-surface`, borde fino, sin sombra                |
| Barra de herramientas    | `mat-toolbar`                           | Negro, con línea inferior de 1 px                              |
| Navegación lateral       | `mat-sidenav` / `mat-nav-list`          | Negro; elemento activo en `--color-hover`                      |
| Avisos                   | `MatSnackBar`                           | Superficie con borde; texto en blanco                          |
| Insignia, etiqueta       | `mat-chip` (o `.badge` propia)          | Píldora con borde gris                                         |
| Carga                    | `mat-progress-bar`, `mat-progress-spinner` | Blanco sobre gris                                           |

### Criterios de aspecto

- **Elevación:** ninguna. Material 3 sugiere sombras y capas tonales; se sustituyen por bordes de 1 px.
- **Forma:** botones y campos en píldora (radio completo), tarjetas y diálogos con 16 px; el resto de formas de
  Material se alinean con esos dos valores.
- **Densidad:** normal en formularios y páginas; **compacta** en el editor de visualizaciones y en la barra de
  herramientas, donde hay muchos controles juntos.
- **Tipografía:** se mantiene la fuente del sistema (no se carga Roboto); Material toma la familia de
  `--font-family`. Se conservan los tamaños de la tabla tipográfica.
- **Capas de estado:** hover, foco y pulsado los dibuja Material (ondas y capas translúcidas). Se mantienen, pero
  sobre fondos neutros, de modo que se vean como un ligero aclarado y no como color.
- **Iconos:** Material Symbols en variante *outlined*. Decisión pendiente: servirlos desde Google Fonts o alojarlos
  en la propia aplicación.
- **Foco:** el contorno blanco de 2 px del apartado de estados se respeta también en los componentes de Material.

### Qué ocurre con los estilos actuales

`_variables.scss` y `_base.scss` se conservan: son la base del tema. `_components.scss` (`.btn`, `.input`, `.card`,
`.badge`) es **provisional**: sirve para maquetar hasta instalar Material y se irá eliminando a medida que cada
clase se sustituya por su componente. Seguirán las utilidades de texto (`.text-muted`, `.text-danger`...).

## Organización del código

```
Cliso.UI/src/
├── styles.scss            # Punto de entrada: solo importa los parciales
└── styles/
    ├── _variables.scss    # Tokens (propiedades CSS en :root)
    ├── _base.scss         # Reset, tipografía y elementos HTML
    └── _components.scss   # Clases provisionales (.btn, .input, .card, .badge...) y utilidades
```

Al instalar Angular Material se añadirá un parcial con el tema (`_material.scss`) que traduce los tokens a las
variables de Material.

Los colores y medidas se leen siempre de las variables (`var(--color-bg)`); no se escriben valores sueltos en los
componentes.
