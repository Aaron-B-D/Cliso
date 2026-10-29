# Directrices del proyecto Cliso

Normas ya acordadas con el autor. Aplícalas sin que haya que repetirlas. Si una norma choca con lo que se pide,
pregunta antes de saltártela.

Este fichero tiene lo **común** a todo el repositorio. Cada proyecto tiene además el suyo, y solo se aplica a lo suyo:

| Fichero | Se aplica a | Se carga desde |
|---|---|---|
| `.ai/directrices-back.md` | `Cliso.API` (Python, FastAPI) | `Cliso.API/CLAUDE.md` |
| `.ai/directrices-front.md` | `Cliso.UI` (Angular) y `Documentation/UI` (guía de estilo y diagramas) | `Cliso.UI/CLAUDE.md` |

Además, `.ai/directrices-academicas.md` resume los requisitos académicos del proyecto (entrega, criterios de
evaluación, estructura de la memoria, defensa). Aplica a todo el repositorio: consúltalo al decidir alcance,
funcionalidades y documentación.

Antes de tocar algo de un proyecto, lee su fichero si no está ya cargado (por ejemplo, al editar `Documentation/UI`
desde la raíz). Las normas de un proyecto **no se aplican al otro**: el back usa tabuladores, punto y coma y regiones;
el front se rige por su `.editorconfig`.

## Cómo trabajar

- **Idioma:** español, tanto en la conversación como en comentarios, docstrings, README y mensajes de excepciones
  y de log. Los nombres de código van en inglés.
- **Haz solo lo pedido.** No añadas funcionalidades, ajustes ni ficheros extra por iniciativa propia. Si crees que
  hace falta algo más, propónlo y pregunta.
- **Edita con las herramientas del editor (`Edit` / `Write`), nunca con scripts de shell (`sed`, `python -`,
  heredocs, PowerShell: `Set-Content`, `Out-File`, `-replace`...).** Todo cambio de código o de documentación se
  hace en el editor para que el autor vea lo que cambia. El shell solo para ejecutar, comprobar y limpiar (y, como
  mucho, mover o borrar ficheros).
- **Hoja de ruta del README:** no la toques (ni la sección "Estado del proyecto y hoja de ruta") hasta que se pida.
  El resto del README sí se mantiene al día cuando cambia algo técnico.
- **Explicaciones:** el autor viene de C#. Explica los conceptos de Python o TypeScript comparándolos con su
  equivalente en C# (`with` ≈ `using`, `ClassVar` ≈ `static`, `__init__.py` ≈ namespace...), sin jerga innecesaria
  y con ejemplos.
- **Prefiere lo explícito a lo abstracto:** sin magia que oculte lo que ocurre.
- **Entorno ligero:** pocas dependencias, y sus ficheros de dependencias al día. No se sube nada a git.
- **Tras probar, limpia:** borra los ficheros temporales y de caché que hayas generado (cada proyecto detalla cuáles).
- No dejes servidores de prueba en marcha.
