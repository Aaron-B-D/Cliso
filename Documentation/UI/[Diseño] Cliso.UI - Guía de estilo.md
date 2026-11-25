# Guía de estilo de Cliso

Estilo inspirado en X (antes Twitter): **fondo negro, texto blanco** y poco más. Sin colores de marca: la jerarquía
se consigue con el contraste entre blanco, grises y negro.

## Principios

1. **Negro y blanco.** El negro es el lienzo; el blanco es la acción y el énfasis.
2. **Los grises ordenan.** Lo secundario se atenúa; no se añaden colores para destacar.
3. **Bordes finos en lugar de sombras.** Las superficies se separan con una línea de 1 px. Única excepción: las
   fichas de las listas de los selectores de los editores (ver «Sombra de las fichas»).
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
- **Sombra de las fichas (única excepción):** las fichas de las listas de los selectores de los editores llevan,
  además del borde de 1 px, una sombra sólida y sin desenfoque (`--shadow-item`, `0.25rem 0.25rem 0` en negro). Sin
  ella no se distingue dónde empieza y acaba cada ficha. No se aplica a ningún otro elemento: la barra lateral, por
  ejemplo, se distingue sin sombra.

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
- **Deshabilitado:** opacidad 0,5 y cursor `not-allowed`. Solo para lo que no se puede usar (un botón sin acción
  posible).
- **Solo lectura:** los campos del detalle de un editor fuera de la edición se ven como al editar, sin atenuar, y solo
  cambia el cursor a `not-allowed`; un selector en solo lectura no se abre ni con el ratón ni con el teclado.
- **Error:** texto y borde en `--color-danger`.

## Validación de formularios (diagrama «Validación»)

Los formularios de los editores (usuarios, modelos, visualizaciones...) se comprueban con su validador antes de guardar.
Si se rompe alguna regla, no se guarda y se muestra:

- **Campos marcados:** borde y etiqueta en `--color-danger` (estado «Error»). Los campos no llevan texto de error
  propio: lo dice el panel. El marcado de un campo se quita al editarlo.
- **Botón de alerta** en el pie, a la izquierda de *Guardar*, solo mientras hay errores: icono de aviso con una
  insignia en `--color-danger` con el número de errores y un tooltip («3 errores»).
- **Panel de errores:** panel flotante (`floating-panel`) anclado al botón de alerta y abierto hacia arriba
  (`cdkConnectedOverlay`). **Se abre solo cuando falla el guardado**; después se abre y se cierra con el botón, y
  también se cierra con un clic fuera o con Escape. Borde en `--color-danger`, un título con el número de errores
  («No se puede guardar: hay 3 errores») y una línea por regla rota con el formato «Campo: qué se ha roto». Los
  mensajes están en el idioma actual y, si la regla lo necesita, dicen qué se esperaba y qué se ha introducido. Es un
  `role="alert"`, así que los lectores de pantalla lo anuncian al abrirse. Es único para todo el editor y recoge los errores de todas las
  pestañas.
- **Lo que no se puede aceptar ni siquiera se carga:** un fichero que no es del tipo esperado (un modelo que no es
  `.ifc`) se descarta al elegirlo o soltarlo y se avisa con un toast de nivel «aviso» (qué fichero era y qué se
  esperaba). Nunca llega al formulario, así que no marca campos ni entra en el panel.
- El botón y el panel desaparecen al volver a validar con todo correcto, al descartar o al cambiar de ficha.
- **Excepción, el submodal de contraseña de usuarios:** no tiene botón de alerta ni panel. Pinta los campos en rojo y
  lista los errores justo debajo de ellos, dentro del propio submodal.

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
  selector y el detalle son dos pasos: lista (buscador y fichas con ›) y, al tocar una ficha, detalle con
  `←` para volver. El pie sigue fijo abajo, con los mismos iconos que en escritorio.
- **Paneles de la barra en móvil:** *Edición* se expande dentro del menú desplegable (acordeón) y *Cerrar sesión* va
  al final, junto al usuario.
- **Home en móvil:** fichas en una columna y paneles de visualización apilados a ancho completo.
- Los diagramas móviles son páginas «(móvil)» de cada `.drawio`, de ≈ 360 px, y sirven de referencia de responsividad.

## Pantallas

Estructura funcional de la aplicación. Los diagramas `.drawio` de esta carpeta la dibujan.

### Estructura de la aplicación (diagrama «Barra de herramientas»)

- Barra lateral con **Home** (el botón se llama «Inicio»), **Edición** y **Configuración**, y el **usuario**
  anclado abajo.
- **Edición** abre un panel a la derecha de su botón (para dar a entender que es un nivel inferior) con *Modelos*,
  *Parámetros*, *Visualizaciones* y *Usuarios*; cada uno abre su editor. Mientras está abierto, el botón queda
  resaltado a todo el ancho de la barra. Un botón que el usuario no puede usar, o que aún no existe, no se muestra.
- El usuario abre un panel encima con *Cerrar sesión*. Los paneles se cierran al hacer clic fuera.
- El botón activo o con el ratón encima se marca con `--color-hover`.

### Inicio de sesión

- Pantalla aparte, sin barra lateral: una tarjeta (16 px, borde de 1 px en `--color-border`) centrada, de ancho máximo
  25 rem, con el título, un selector de *Idioma*, los campos *Nombre de usuario* (el nick) y *Contraseña* y el botón *Entrar* a ancho completo.
- **Idioma:** el selector parte del último idioma elegido en él (guardado en el almacenamiento local) o, si no hay
  ninguno, del idioma del navegador; si no está admitido, inglés. Cambia al momento los textos de esta pantalla y solo
  vale para ella: al entrar manda el parámetro de la aplicación `LANGUAGE`.
- El motivo de un fallo (datos incorrectos, demasiados intentos, sesión caducada por inactividad) se muestra en
  `--color-danger` bajo los campos, en un hueco que se reserva para que el formulario no se mueva.
- Sin sesión, cualquier otra pantalla lleva aquí. Al caducar la sesión se cierran los diálogos abiertos y se vuelve
  a esta pantalla.

### Editores (diagrama «Editor», mismo esquema para los tres)

- Modal (`MatDialog`) redimensionable, con maximizar/restaurar y cerrar; el título y las fichas dependen del tipo.
- Izquierda, **selector**: buscador que filtra las fichas y fichas; la seleccionada va resaltada. Todas las fichas son
  el mismo componente (`EditorCardComponent`): icono a la izquierda, título, subtítulo y, en móvil, la flecha `›` a la
  derecha. En *Modelos* el icono es el del modelo; en *Visualizaciones* distingue las propias (icono de usuario) de las
  de otro usuario (globo). Un **splitter**
  arrastrable (con ancho mínimo y máximo, también con las flechas del teclado) cambia su ancho y un botón
  `«` lo pliega a una franja con el nombre del tipo; `»` lo restaura con el ancho anterior.
- Derecha, **detalle** en pestañas (`mat-tab-group`) si tiene más de una, de solo lectura mientras no se edita.
- **Pie** del modal, sin botones de aceptar ni cancelar, solo con iconos pequeños:
  - Sin editar: *Añadir* (deja el detalle en blanco y entra en edición), *Editar* y *Borrar* (estos dos solo valen
    con un elemento seleccionado; borrar pide confirmación).
  - En edición (también al añadir): *Guardar* y *Descartar* sustituyen a los otros tres.
- **Cambios sin guardar:** cada editor lleva la marca de «sucio». Si la hay, cerrar el modal, cambiar de ficha,
  añadir, volver a la lista o descartar piden confirmación antes de perder los cambios.
- Pestañas: *Usuarios* → General y Permisos (hoy solo General, sin pestañas: los permisos están pendientes); *Modelos* → General (nombre, descripción, observaciones y carga del fichero IFC
  (`.ifc`) arrastrando o con clic, que se sube al guardar) y Previsualización (visor 3D del IFC); *Visualizaciones* → General (modelo
  BIM, que solo se elige al añadir; nombre, descripción, observaciones y casilla «Visible para otros usuarios») y
  Piezas (diseño «Editor de visualizaciones v2»: el visor 3D ocupa todo el espacio y, a su derecha, hay un panel lateral
  con la lista de piezas y, debajo, el detalle de la pieza seleccionada; el panel arranca plegado y se pliega y despliega
  con un botón sobre la esquina del visor; en móvil, el visor arriba y el panel debajo).
  - **Pieza y elemento:** una *pieza* es lo que se añade sobre el modelo y forma parte de la visualización (hoy solo
    marcadores); un *elemento* es una parte del propio modelo IFC (un muro, una puerta...) a la que se ancla una pieza.
  - **Las piezas son de cualquier tipo.** Cada tipo se declara en `VisualizationPieceTypes` (nombre, descripción e icono) y
    tiene su propio panel de detalle: `VisualizationPieceDetailComponent` pone como título el nombre del tipo de la pieza
    seleccionada (nunca un texto fijo) y delega en el panel del tipo (`VisualizationMarkerPanelComponent` para el
    marcador). Un tipo nuevo se añade con su declaración, su panel y una rama en el detalle.
  - *Añadir pieza* abre un panel flotante anclado al botón (a su izquierda, sobre el visor) con una ficha común (icono,
    tipo, qué es y para qué sirve) por tipo; elegir uno cierra el panel y, si la pieza se coloca en el modelo, el
    siguiente clic la crea.
  - La cabecera común del detalle lleva el botón *Ir a la pieza* (una diana) que centra la vista en la pieza
    seleccionada, y *Quitar pieza*.
  - **Marcador:** su panel tiene cuatro secciones: *Contenido* (título, descripción, enlace y dónde se abre: pestaña
    actual o ventana nueva), *Aspecto* (icono, tamaño en número, color, opacidad, color y posición del título,
    visible a través del modelo), *Comportamiento* (atenuar si el ratón no está encima y resaltar el elemento anclado al
    pulsar) y *Posición y anclaje* (coordenadas X/Y/Z y anclaje). En el visor, al pasar el ratón aparece una
    información emergente con el título, la descripción y el enlace, y los marcadores muy cercanos en pantalla se
    agrupan en un círculo con su número (pulsarlo acerca la cámara). Se selecciona
    en el visor o en la lista y, en edición, se arrastra sobre el modelo (uno anclado se reancla al elemento donde se
    suelta; uno libre sigue libre). El anclaje es un desplegable con buscador de los elementos del modelo (nombre · id);
    elegir uno ancla el marcador y *Liberar* quita el ancla. Un marcador nuevo nace anclado al elemento donde se coloca.
- **Tamaño de los editores:** el modal se abre con un ancho de `min(80rem, 95vw)` desde `md` y se puede
  redimensionar o maximizar. El de visualizaciones se abre más alto (`--es-height`).

### Parámetros (diagrama «Parámetros»)

Editor de los parámetros de la aplicación, con la estructura de los editores (modal, lista a la izquierda, detalle a la
derecha, pie), con estas diferencias:

- Entrada *Parámetros* del panel de Edición, solo para quien puede modificarlos. Las entradas que el usuario no puede
  usar, o que aún no existen, no se muestran.
- Sin *Añadir* ni *Borrar* (los parámetros son fijos): el pie solo tiene *Editar* y, al editar, *Guardar* y *Descartar*.
  Su alto inicial es menor que el de los demás (26 rem).
- La lista tiene una ficha por parámetro (nombre y valor actual). El detalle muestra su descripción, sus observaciones y
  su valor por defecto, y un **panel propio según el tipo**: texto libre (carpeta de modelos), número (intervalo de
  refresco y caducidad de la sesión, un único panel compartido, con los límites del parámetro: al salir del campo, un
  número fuera de ellos se lleva al más cercano) o lista de idiomas.
- El campo del valor ocupa todo el ancho que deja el botón de icono *Restaurar el valor por defecto* (↻, con tooltip),
  que solo vale al editar.
- Al guardar se avisa con un diálogo informativo (solo *Aceptar*): los cambios se aplican cuando se recarga la página,
  y la carpeta de modelos y la caducidad de la sesión además requieren reiniciar la API. El front no aplica el valor
  nuevo hasta recargar.

### Usuarios (diagrama «Usuarios»)

Editor de los usuarios, con la estructura de los editores, con estas diferencias:

- Entrada *Usuarios* del panel de Edición, solo para quien puede gestionarlos.
- La lista tiene una ficha por usuario (nick y, debajo, nombre completo), ordenadas por nick; el buscador filtra por
  nick, nombre y apellidos.
- El detalle, sin pestañas, tiene *Nombre de usuario*, *Nombre*, *Apellidos* y *Rol*. El nombre de usuario solo se
  escribe al añadir; después es intocable.
- **Contraseña:** al añadir se piden *Contraseña* y *Repetir contraseña*. Al editar, un botón secundario *Cambiar
  contraseña* abre un submodal que la pide dos veces; la nueva se guarda con el resto de datos y, mientras tanto, un
  texto secundario lo recuerda. Cada campo de contraseña tiene su botón de icono para verla u ocultarla (con tooltip).
  Si el API la rechaza, se listan en `--color-danger` los requisitos que no cumple.
- *Borrar* (con confirmación) se muestra desactivado con el usuario de la sesión y con `admin`, y el rol de ambos
  no se puede cambiar.

### Home (diagrama «Home»)

Catálogo de modelos en fichas, cada una con sus visualizaciones como etiquetas, y un único buscador de modelos y
visualizaciones. Clic en la ficha abre el modelo con todas sus visualizaciones; clic en una etiqueta (o en un
resultado de visualización del buscador) lo abre mostrando solo esa. Es una misma pantalla con más o menos etiquetas
encendidas: una barra de etiquetas muestra/oculta cada visualización y la ✕ del panel la oculta. Pendiente: la
disposición de los paneles en escritorio (en móvil, apilados).

**Abrir un modelo (decidido):** al pulsar una ficha se pide confirmación («¿Abrir el modelo…?»); al aceptar, el visor 3D
del modelo **sustituye al catálogo en la misma pantalla**, con el nombre del modelo y un botón «← Volver a la lista»
(en escritorio y en móvil). El fichero IFC se descarga con barra de progreso y el motor 3D se carga solo en ese momento.
Un modelo sin fichero IFC avisa y no se abre.
Mientras se descarga, un **panel de carga** (componente aparte) muestra los datos del modelo, la barra de progreso y los
botones «Cancelar» y «Reintentar» (estados: descargando, cancelada y error); el visor solo aparece cuando el fichero está
descargado. El visor lleva encima una **barra de herramientas** (componente que envuelve al visor, que por sí solo no lleva
ninguna, y que opera sobre él con el `Access` que el visor emite) con iconos: volver a la vista inicial, fijar la vista actual como inicial, activar o desactivar el resaltado de piezas al hacer
clic, mostrar u ocultar la rejilla y un menú flotante de **estilos** (`mat-menu`) con los colores de fondo, resaltado y
rejilla, y el tamaño de las cuadrículas primaria y secundaria (`mat-slider`). La configuración (aspecto, vista inicial y
última posición de la cámara) se guarda en el navegador mientras el modelo está abierto: si se recarga la página, Home
pregunta si se recupera; al volver a la lista se borra. El catálogo se actualiza solo cada cierto tiempo (parámetro de la
aplicación `BIM_MODELS_REFRESH_INTERVAL`) para mostrar los modelos que otro usuario añada.

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
| Avisos (toast)           | `MatSnackBar` vía `NotificationService` | Arriba al centro, 3 s. Borde según el nivel: rojo (peligro), verde (éxito), blanco (aviso) o normal (info) |
| Insignia, etiqueta       | `mat-chip` (o `.badge` propia)          | Píldora con borde gris                                         |
| Carga                    | `mat-progress-bar`, `mat-progress-spinner` | Blanco sobre gris                                           |

### Criterios de aspecto

- **Elevación:** ninguna. Material 3 sugiere sombras y capas tonales; se sustituyen por bordes de 1 px. Única
  excepción: la sombra sólida de las fichas de los selectores de los editores (ver «Sombra de las fichas»).
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
