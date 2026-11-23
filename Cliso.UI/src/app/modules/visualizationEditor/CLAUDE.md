# Editor de visualizaciones (`visualizationEditor`)

Normas de esta carpeta, además de las de `.ai/directrices-front.md` (vocabulario, piezas polimórficas, `ngModel`...).

## Pieza y elemento

- **Pieza** (`Piece`): lo que el usuario añade sobre el modelo y forma parte de la visualización. Hoy solo hay marcadores.
- **Elemento** (`Element`, `BimViewerElement`): una parte del modelo IFC. Una pieza anclada guarda el `AnchorId` de un elemento.
- No se mezclan ni en el código ni en los textos al usuario.

## Cómo está organizado

- `visualizationEditor.component`: la lista de visualizaciones, la pestaña General, el guardado y la carga de las piezas. No
  trabaja con las piezas una a una: en la pestaña Piezas le pasa el `Draft.Pieces` al espacio de trabajo y se entera de que
  han cambiado.
- `pieceWorkspace`: el espacio de trabajo con las piezas (visor 3D con sus marcadores y panel lateral, plegado por defecto).
  Coloca, mueve, ancla, cambia y quita piezas sobre la lista que recibe y emite `changed`. Es el dueño del visor y de su
  `Access`: viven y mueren juntos, así que el acceso nunca apunta a un visor ya destruido.
- `pieceList`: la lista de piezas de la visualización abierta y el botón de añadir, que abre un panel flotante anclado a él.
- `piecePicker`: el panel flotante con una ficha por tipo de pieza (sale del catálogo `VisualizationPieceTypes`).
- `pieceDetail`: el detalle de la pieza seleccionada. **No conoce los datos de ningún tipo**: pone la cabecera común (tipo,
  «ir a la pieza», quitar) y, con un `@switch` sobre el tipo, el subpanel de ese tipo.
- `markerPanel`: el subpanel del tipo marcador. Es el único que conoce `BimModelVisualizationMarkerPiece`.

## Añadir un tipo de pieza nuevo

1. **Back:** su clase de dominio (hereda de `VisualizationPiece`), su DTO, su mapper y su lectura/escritura del JSON de `content`
   (ver `directrices-back.md`). No hay cambios de esquema.
2. **Front, modelo:** una clase que herede de `VisualizationPiece` (`shared/models/visualization/`) e implemente `Clone`,
   `GetFocusPoint`, `GetLabel`, `Move`, `GetViewerMarkers` y `ToDto`; su mapper (`shared/utils/mappers/`) y una rama en
   `VisualizationPieceMapper.ToModel`.
3. **Catálogo:** el valor en `VisualizationPieceType` (`shared/definitions/visualization.definitions.ts`) y su registro en
   `VisualizationPieceTypes.GetAll()` con nombre, descripción, icono y cómo se crea. Los textos, en las tres hojas de idioma
   (`WEB_PIECE_<TIPO>_NAME` y `_DESCRIPTION`).
4. **Detalle:** un subpanel nuevo (`<tipo>Panel`) y su `@case` en `pieceDetail.component.html`. Ese es el único sitio donde
   se distingue el tipo de la pieza.
5. Nada más: la lista, el selector y el visor no cambian. Si el tipo no se pinta en el visor, `GetViewerMarkers` devuelve vacío.

## Reglas propias

- Quien trabaja con piezas no usa `instanceof` ni propiedades de un solo tipo: se añade un método al contrato de la base.
- La lista y el visor identifican una pieza por su posición en `Draft.Pieces`; por eso borrar o añadir piezas vuelve a calcular
  todo con `refreshPieces()` (en `pieceWorkspace`).
- Los elementos del modelo (para el desplegable de anclaje) se piden al visor solo cuando hacen falta, una vez por modelo; si el
  modelo cambia mientras llegan, se descartan.
- El panel lateral de piezas arranca plegado al abrir otra visualización; al plegarlo se cierra el selector de tipos.
- Las piezas no se pueden cambiar (`CanEditPieces`) mientras no estén cargadas: si la carga falla, `Draft.Pieces` es `null`.
- Los números de las llamadas al API (profundidad de la consulta, borrado lógico) salen de las constantes de
  `visualization.definitions.ts`, no se escriben a mano.
