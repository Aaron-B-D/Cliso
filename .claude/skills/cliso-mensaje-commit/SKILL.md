---
name: cliso-mensaje-commit
description: Redacta el mensaje de commit de la tarea actual (título, resumen general de los cambios y enlace de Trello) a partir del JSON de la tarjeta. No hace commit ni push.
disable-model-invocation: true
---

# Mensaje de commit de la tarea

Genera el texto del commit de una tarea, para que el autor lo pegue al subirla. Solo escribe el mensaje: **no hace
`git add`, commit ni push**, ni modifica ningún fichero.

Formato (el de las subidas anteriores):

```
Cliso.API - Diseño de base de datos

 -Se diseñan las bases de datos que se usarán en la aplicación mediante diagrama UML (sujetas a posibles cambios)
 -Se actualizan directrices y readmes

https://trello.com/c/HLAUEpkX
```

## Pasos

1. **Consigue el JSON de la tarjeta de Trello.** Si se invoca con argumentos, pueden ser el propio JSON o una ruta a un
   fichero que lo contenga. Si no, búscalo en la sesión (un objeto con `name`, `shortUrl` y `checklists`). Si no lo
   encuentras, **pídeselo al autor** antes de seguir (que lo pegue) y espera su respuesta; no inventes el título ni el
   enlace.
2. **Saca del JSON:**
   - Título: `name` (ya lleva el prefijo del proyecto, por ejemplo `Cliso.API - Creación CRUD modelos BIM`).
   - Enlace: `shortUrl`.
   - El alcance previsto: `desc` y los elementos de las `checklists`. Sirven de guion para el resumen, no hay que
     copiarlos.
3. **Reúne los cambios hechos.** De esta conversación (ficheros creados, editados, movidos o borrados y lo que se ha
   decidido por el camino). Si la conversación se ha resumido, usa el resumen. Para confirmar qué hay realmente
   preparado, mira `git status --short` desde la raíz del repositorio (solo lectura; los ficheros nuevos sin seguimiento
   salen con `??`). Si no tienes claro qué cambios son de esta tarea, pregunta.
4. **Redacta el resumen general**, no el detalle:
   - De 3 a 8 viñetas, cada una una idea completa de lo que ha cambiado, agrupando ficheros por tema (por ejemplo,
     «se añade el servicio de modelos BIM con subida y descarga del IFC por stream», no una línea por fichero).
   - Impersonal y en presente, como en las subidas anteriores: «Se añade…», «Se elimina…», «Se actualiza…».
   - Ordénalas de lo principal (lo que pedía la tarjeta) a lo secundario (limpieza, directrices, documentación).
   - Si se han tocado directrices, README o documentación, una viñeta final lo dice («Se actualizan directrices y
     readmes»).
   - Lo que quedó fuera de la tarea o sin probar solo se menciona si cambia lo que el commit promete (por ejemplo,
     «sin probar con MySQL»). No incluyas nombres de ficheros ni de clases salvo que aclaren mucho.
5. **Entrega** el mensaje en un único bloque de código para copiarlo, con este orden: título, línea en blanco,
   viñetas (cada una empieza por un espacio y un guion, sin espacio tras el guion: ` -Se añade…`), línea en blanco y
   el enlace.

## Reglas

- Español en todo.
- Fiel a lo hecho: no cuentes como hecho lo que no lo está. Los elementos de la checklist que no se hayan cubierto no
  van en el resumen.
- Breve: el mensaje debe leerse de un vistazo.
- Solo lectura sobre el repositorio; no dejes ficheros temporales.
