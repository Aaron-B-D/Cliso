---
name: cliso-revisar-tarea
description: Revisa la subida de una tarea de Cliso (requisitos de la tarjeta de Trello + cambios de git) contra las directrices del proyecto, con las comprobaciones automáticas incluidas (estilo, esquema, pyright, lint, limpieza). Solo informa: no corrige, no hace commit ni push.
argument-hint: "Revisión de: <tarea> / Requisitos: <texto o JSON de Trello> / Cambios: <sin subir | sin push | último commit | hash o rango | inicio del mensaje>"
disable-model-invocation: true
---

# Revisión de la subida de una tarea

Revisa una tarea como lo haría un revisor senior y comprueba automáticamente todo lo que se puede comprobar antes de
subirla. **Solo lectura:** no corrige nada, no hace `git add`, commit ni push, y deja el repositorio como lo encontró.

Parte de este texto, que sigue siempre el mismo formato:

```
Revisión de: <nombre de la tarea>
Requisitos: <texto de la tarjeta de Trello, o el JSON de la tarjeta adjunto>
Cambios: <qué se revisa: ver el paso 2>
```

$ARGUMENTS

**Si el texto anterior está vacío o le falta algún campo**, no empieces la revisión: pide solo lo que falte, en un único
mensaje:
- **Cambios**: pregúntalo con AskUserQuestion, con las opciones «Cambios sin subir», «Commits sin push», «Último
  commit» y «Hash, rango o inicio del mensaje de commit» (si elijo la última, pídeme el valor concreto).
- **Tarea** y **Requisitos**: pídemelos en texto (los requisitos pueden ser el texto de la tarjeta de Trello o su JSON).
- Muéstrame también la plantilla para la próxima vez:
  `/cliso-revisar-tarea Revisión de: <tarea> / Requisitos: <texto de Trello> / Cambios: <sin subir, sin push, último commit, hash o rango>`

Cuando tengas los tres campos, continúa con normalidad.

## Pasos, en orden

1. **Extrae** los tres campos. Si falta alguno o el formato no se reconoce, pide aclaración en vez de asumir. Si
   «Requisitos» es el JSON de la tarjeta de Trello (pegado o adjunto, tal cual lo exporta Trello), no lo trates como
   texto plano: los requisitos reales son `name` (título), `desc` y los `checklists` con sus `checkItems` (nombre y
   estado). Ignora el resto (ids, fechas, miembros, `actions`, badges...). Guarda `shortUrl` para citar la tarjeta.

2. **Obtén los cambios a revisar** con `git`, desde la raíz del repositorio (la carpeta que contiene `.ai/`,
   `Cliso.API/` y `Cliso.UI/`; compruébala con `git rev-parse --show-toplevel`). Antes de empezar, anota
   `git status --short`: sirve para comprobar al final que la revisión no ha dejado nada.
   - **«Cambios sin subir»** (o «sin commit», «pendiente», «working copy»): `git status --short`, y `git diff HEAD`
     para lo ya existente. Los ficheros nuevos sin seguimiento (`??`) **no salen en el diff**: lístalos con
     `git ls-files --others --exclude-standard` y léelos enteros (salta los binarios y los muy grandes).
   - **«Commits sin push»**: `git log --oneline @{u}..HEAD` y `git diff @{u}...HEAD`. Si la rama no tiene upstream, dilo
     y pregunta contra qué comparar. No hagas `git fetch`: se compara con lo que ya se conoce de `origin`. Menciona
     cuántos commits son.
   - **«Último commit»** o **«últimos N commits»**: `git show --stat HEAD` / `git diff HEAD~N HEAD`.
   - **Un hash**: `git show --stat <hash>` y `git diff <hash>^ <hash>`. **Un rango** `a..b`: `git log --oneline a..b` y
     `git diff a b`.
   - **Cualquier otro texto** se toma como el **comienzo del mensaje de commit**: lista `git log --format="%h %s" -n 100` y
     quédate con los commits cuya primera línea empiece por ese texto (compara tú, sin expresiones regulares). Si hay uno,
     procede como con un hash. Si hay varios, trátalos como la tarea completa (`git diff <el más antiguo>^ <el más
     reciente>`), indica cuántos son y sus hashes. Si no hay ninguno, dilo y pide aclaración.
   - Si el hash, el rango o la búsqueda no existen o `git` da error, dilo y **para**: no revises con un diff vacío o
     parcial.
   - Si el diff de `Cliso.API/settings.json` solo cambia valores de entorno local (modo demo, carpeta de datos,
     servidor MySQL de pruebas), no lo reportes: es configuración temporal del autor. **Sí** es un problema crítico que
     lleve credenciales reales.

3. **Clasifica los ficheros del diff** y guarda la lista (rutas relativas a la raíz, sin los borrados) para el paso 5:
   back (`Cliso.API/`, `Documentation/Database/`), front (`Cliso.UI/`, `Documentation/UI/`), documentación (`README.md`,
   `.ai/`, `Documentation/`) y herramientas (`.claude/`).

4. **Lee las directrices que correspondan** si no están ya en tu contexto: `.ai/directrices.md` siempre;
   `.ai/directrices-back.md` si hay back; `.ai/directrices-front.md` si hay front; y `.ai/directrices-academicas.md`
   para juzgar el alcance y lo que habrá que reflejar en la memoria. Son las normas del proyecto: lo que las incumple es
   un hallazgo, no una opinión.

5. **Pasa el comprobador automático** (desde la raíz del repositorio), con la lista del paso 3:

   ```
   python .claude/skills/cliso-revisar-tarea/comprobar_subida.py <fichero1> <fichero2> ...
   ```

   Comprueba, sin modificar nada: el estilo del back (tabuladores, punto y coma, returns tempranos, `!r`, regiones,
   docstrings, una clase por fichero, imports de máximo 3 capas, dirección de las dependencias, constantes públicas sin
   uso...), que `sqlite_schema.sql`, `mysql_schema.sql` y el diagrama tengan las mismas tablas y columnas, que lo
   importado esté en `requirements.txt`, las normas del front que se detectan con una búsqueda de texto (importes
   relativos, `::ng-deep`, `console.log`, `any`, `HACK`, colores sueltos, sombras, SVG...), los restos de pruebas
   (`data/`, `logs/`, `__pycache__`, `dist/`), el README tocado y las credenciales de `settings.json`.

   Cómo usar su salida:
   - `[ERROR]` sobre código que **añade o cambia el diff** → «Problemas críticos» (incumple una norma acordada).
   - `[AVISO]` → valóralo con el contexto: es una heurística, puede ser un falso positivo.
   - Cualquier aviso o error sobre una línea que el diff **no toca** ya estaba antes de la tarea: no es culpa de la
     tarea; si merece la pena, va en «Mejoras recomendadas», sin más.
   - `README` tocado: el README solo se actualiza desde el panel de Cliso, no durante las sesiones de código. Salvo que
     la tarea sea precisamente esa actualización, es un hallazgo.

6. **Ejecuta las comprobaciones del proyecto** que correspondan (cada una solo si el diff toca esa parte), y anota lo
   que **no** hayas podido ejecutar para decirlo en el veredicto:
   - **Back — tipos:** `python -m pyright` desde `Cliso.API`, con el intérprete de `Cliso.API/.venv` (modo `strict`; debe
     dar 0 errores). Si no existe `.venv`, **no lo crees ni instales nada**: dilo como «no verificado».
   - **Back — arranque:** si el diff toca rutas, servicios, repositorios, el inicializador o `main.py`, y existe `.venv`,
     arranca la API en un puerto libre en segundo plano (`uvicorn app.main:app --port <puerto>` con ese intérprete),
     espera a «Application startup complete» en su salida y prueba con `curl` los endpoints afectados (y al menos
     `GET /openapi.json`). **Solo si `Cliso.API/data/` no existía antes**: si existe, es una base de datos del autor, no
     la uses (di que no se probó). Cuando termines, **para el servidor** (no dejes ninguno en marcha) y borra
     `Cliso.API/data/` y `Cliso.API/logs/`, que creó el arranque.
   - **Front:** `npm run lint` y `npm run build` desde `Cliso.UI` (0 errores y 0 avisos). Si no existe `node_modules`, no
     instales nada: «no verificado». Borra `Cliso.UI/dist/` al terminar.
   - **Limpieza:** borra todo lo que hayas generado (`__pycache__`, `data/`, `logs/`, `dist/`, ficheros temporales).
     Compara `git status --short` con el que anotaste en el paso 2: la revisión no debe haber cambiado nada.

7. **Revisa la implementación actuando como revisor senior, no como quien la hizo.** El objetivo es detectar lo que
   debería corregirse o mejorarse antes de cerrar la tarea; que funcione no basta para aprobarla. Analiza el diff (y
   el código de alrededor cuando haga falta contexto) con, como mínimo, estos puntos:

   1. **Cumplimiento de la tarea:** ¿se implementa todo lo de «Requisitos»? Recorre **uno a uno los elementos de la
      checklist** de la tarjeta y di si cada uno está cubierto (✅), parcial (⚠️) o sin hacer (❌), con la evidencia
      (`fichero:línea`). ¿Hay requisitos mal interpretados o casos de uso sin contemplar? Y al revés: **¿se ha hecho
      algo que la tarjeta no pedía?** Las directrices mandan hacer solo lo pedido; lo añadido por iniciativa propia (y
      no justificado) es un hallazgo.
   2. **Posibles regresiones:** cambios incompatibles, efectos secundarios, comportamiento anterior perdido, otros
      módulos afectados. Si cambia el esquema de la base de datos: ¿se han actualizado **a la vez** `sqlite_schema.sql`,
      `mysql_schema.sql`, el diagrama, los repositorios de los dos motores, `DemoData` y el inicializador? Una base
      de datos ya creada no se migra: dilo si procede. Si cambia un DTO, ¿se ha actualizado su mapper y lo que consume
      el front?
   3. **Calidad y directrices:** ¿es coherente con el resto del proyecto y con las directrices cargadas (nombres,
      islas, una clase por fichero, constantes, regiones; en el front, estado, plantilla sin lógica, estilos con
      tokens, mobile-first)? Señala lo confuso o innecesariamente complejo, y todo lo que **choque con una norma sin
      haberlo consultado** (las directrices piden preguntar antes de saltárselas).
   4. **Diseño e implementación:** ¿hay una alternativa claramente mejor? Código innecesario o duplicado,
      complejidad excesiva, capas mal repartidas (todo debe apuntar hacia el núcleo), SOLID cuando proceda.
   5. **Rendimiento:** consultas repetidas, bucles ineficientes, accesos innecesarios a disco o red, ficheros grandes
      cargados enteros en memoria.
   6. **Seguridad:** contraseñas siempre hasheadas y nunca en un DTO de salida ni en un log; SQL con parámetros (nunca
      valores concatenados); validación de entradas en el servidor; rutas de ficheros construidas sin confiar en el
      cliente; permisos por rol; credenciales o datos sensibles en el repositorio; XSS en el front.
   7. **Manejo de errores:** excepciones granulares en la capa que les corresponde, traducidas a HTTP solo en el
      registro de `main.py` (los routers no llevan `try/except`); en el front, un único `try/catch` en la capa más
      externa. ¿Se silencia algo? ¿Los mensajes son útiles? ¿Se liberan los recursos?
   8. **Casos límite:** nulos, colecciones vacías, textos vacíos o larguísimos, mayúsculas y minúsculas, duplicados,
      fechas, concurrencia, ficheros a medias, idiomas.
   9. **Revisión general:** lo que no entre arriba. Incluye el apartado académico (`directrices-academicas.md`): ¿lo
      hecho aporta a algún criterio de la rúbrica y debería quedar apuntado para la memoria (qué es, por qué se eligió
      así, qué problema resolvió)? ¿se ha ampliado el alcance sin avisar? ¿hay marcadores `HACK` (no se suben) o `TODO`
      sin enlace a su tarjeta de Trello? ¿están al día el diagrama de la base de datos y, en el front, la guía de
      estilo y sus diagramas?

8. **Entrega el informe en el chat** (no generes ficheros ni uses ReportFindings). Empieza con una línea que diga qué
   has revisado (tarea, de dónde salen los cambios y cuántos ficheros) y sigue con exactamente estos cuatro apartados,
   en este orden:

   - **Problemas críticos** — lo que debe corregirse antes de cerrar la tarea.
   - **Mejoras recomendadas** — lo que no impide cerrarla pero convendría mejorar.
   - **Aspectos positivos** — buenas decisiones de diseño o implementación.
   - **Veredicto** — uno de estos tres estados, sin ambigüedad: ✅ Aprobada / ⚠️ Aprobada con mejoras recomendadas /
     ❌ No debería subirse hasta corregir los problemas detectados. Debajo, la lista de lo **comprobado** (comprobador
     automático, pyright, arranque, lint, build) y de lo **no verificado** y por qué (falta `.venv`, falta
     `node_modules`, `data/` del autor, MySQL sin servidor...), y el resumen de la checklist (n de n cubiertos).

   Para cada problema o mejora explica por qué lo es y, cuando se pueda, propón una solución concreta con
   `fichero:línea`. Si en un apartado no hay nada relevante, dilo («he buscado en X y no he encontrado nada»). **No
   apliques ninguna corrección**; solo si lo pido después de ver el informe.

9. **Al final, y solo al final** (para que no lo sobrescriba el título automático de la sesión), pon el nombre de la
   tarea como título de esta sesión con la herramienta de título de sesión, usando **literalmente** el texto que sigue
   a «Revisión de:» (sin resumir ni reformular). Si la herramienta no está disponible, omite el paso. Si el veredicto
   es ✅ o ⚠️, termina recordando que el siguiente paso es `/cliso-mensaje-commit`.

## Reglas

- Español en todo.
- Solo lectura: nada de editar, commitear ni subir; lo único que se crea (arranque de prueba, builds) se borra al final.
- Fiel a lo comprobado: no des por verificado lo que no has podido ejecutar.
- No dejes servidores de prueba en marcha ni ficheros temporales.
