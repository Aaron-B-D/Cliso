# Directrices del back (`Cliso.API`)

Normas del back (Python, FastAPI), además de las comunes de `directrices.md`. Si una norma choca con lo que se pide,
pregunta antes de saltártela.

## Cómo trabajar en el back

- **Prefiere lo explícito a lo abstracto.** Sin ORM (SQL escrito a mano), sin `**` para repartir diccionarios
  (asigna campo a campo), sin magia que oculte lo que ocurre.
- **Código que entienda un novato de Python:** se prefiere verboso y claro a corto y avanzado. Nada de `yield`,
  `@contextmanager`, `*args` variádicos, decoradores propios ni utilidades que oculten lo que ocurre; cada método se
  lee de arriba abajo (por ejemplo, abrir, consultar y cerrar la conexión se escribe en cada método, aunque se
  repita). La única excepción es el `lifespan` de FastAPI, que lo exige el propio framework.
- **Entorno ligero:** pocas dependencias, `requirements.txt` al día.
- **Tras probar, limpia:** borra `__pycache__`, `data/`, `logs/` y ficheros temporales que hayas generado.

## Estilo de código (Python)

- **Sangría con tabuladores.** Nombres en `snake_case`; clases en `PascalCase`.
- **Punto y coma al final de cada sentencia** (aunque Python no lo exija): imports, asignaciones, llamadas,
  `return`, `raise`, `yield`, `...`, atributos de clase y de dataclass, `__all__`. En sentencias de varias líneas va
  tras el cierre (`);`); si hay comentario al final de la línea, va antes del comentario. No llevan `;`: las
  cabeceras que acaban en `:` (`def`, `class`, `if`, `try`, `for`, `with`...), los decoradores, los comentarios, las
  regiones y los docstrings.
- **Sin returns tempranos.** Una función solo termina por su final: nada de `if condición: ...; return;` para saltarse
  el resto. Se escribe con `if ... else`, y si una rama no tiene nada que hacer, lleva su `else:` con `pass` o con un
  comentario que explique por qué no hace nada. Solo hay `return` al final de la función (o al final del `try` que la
  ocupa entera). Lanzar una excepción como cláusula de guarda (`if no_valido: raise ...`) sí vale.
- **Sin `!r` en los mensajes.** En f-strings de mensajes (excepciones, log) no se usa el sufijo `!r` (`{valor!r}`): las
  comillas se escriben directamente en el texto (`'{valor}'`).
- **Utilidades de rutas y ficheros:** el cálculo de rutas (`PathUtils`) y las operaciones sobre carpetas y ficheros
  (`FileUtils`) viven en `app/utils/`. No se repiten en cada clase: se usan desde ahí.
- **Dos tipos de parámetros, con nombres distintos:** los de arranque, del fichero de configuración
  (`StartupParameters`, `StartupParametersManager`), solo lo imprescindible para abrir la base de datos y
  escribir el log; y los de la aplicación, de la tabla `application_parameter` (`ApplicationParameter`,
  `ApplicationParameterType`, `ApplicationParameterService`), que se pueden editar en caliente. La tabla solo guarda
  el tipo y los valores (por defecto y actual): los nombres y descripciones los pone el front, en cada idioma, y no se
  guardan en la base de datos. Todo lo que no sea imprescindible para arrancar va a la tabla, nunca al fichero de
  configuración.
- **Tipado estricto.** El código debe dar 0 errores con `python -m pyright` (modo `strict`, ver
  `Cliso.API/pyrightconfig.json`). Nada de tipos desconocidos: anota todo, incluidas las listas y diccionarios.
- **Documenta todo con docstring** (el equivalente al `<summary>` de C#): clases, métodos, funciones y cada
  atributo (el docstring va justo debajo del atributo). En métodos con argumentos o excepciones, usa las secciones
  `Args:`, `Returns:` y `Raises:`.
- **Constantes:** privadas, con guion bajo delante (`_SCHEMA_PATH`), salvo que se consulten desde fuera de su clase.
  En MAYÚSCULAS y anotadas con `ClassVar`. Van dentro de la clase, no sueltas en el módulo.
- **Nada de funciones sueltas para lógica con estado o con vocación de servicio:** agrúpalas en una clase estática
  (como `StartupParametersManager` o `Logger`): `@staticmethod`, estado en `ClassVar`, sin instanciar.
- **Privacidad:** lo que no se usa fuera lleva `_` (atributos, métodos auxiliares, constantes).
- **Cada parte es una isla: no referencies otras clases.** Ni en el código ni en docstrings o comentarios: un DTO no
  menciona a su mapper ni al dominio; el dominio no menciona tablas ni DTOs; una clase no nombra a quien la usa.
  Solo se referencian las dependencias que el código necesita de verdad (imports, tipos de argumentos, excepciones en
  `Raises:`), y la unión entre islas se hace en un punto aparte: un mapper entre dominio y DTO, o `main.py` entre
  núcleo y adaptadores.
- **Una clase por fichero**, con el nombre de la clase en `snake_case` (`DatabaseNotFoundError` →
  `database_not_found_error.py`), para editarlas una a una. Todas las de un directorio se agrupan bajo un namespace
  (su `__init__.py`). Esto incluye las excepciones y los enumerados: cada enumerado en su fichero, con el nombre del
  enumerado como nombre del fichero (`ApplicationParameterType` → `application_parameter_type.py`).
- **Imports de máximo 3 capas tras `app`** (`app.adapters.outbound.persistence`). Ese namespace debe bastar para
  importar todo lo que haya por debajo, así que su `__init__.py` reexporta también las subcarpetas. Desde fuera del
  namespace se importa siempre así, nunca de un módulo ni de una subcarpeta más profunda. Si en algún caso hay que ir
  más profundo, **consúltalo antes**. Dentro de un `__init__.py` el orden de los imports importa (primero lo que
  usan los demás).
- **Clases abstractas:** llevan siempre el sufijo `Base` (`DatabaseAdapterBase`, `DatabaseConnectionBase`) y viven en
  la **raíz** del namespace al que pertenecen (`persistence/`). Sus implementaciones se agrupan por tecnología en
  **subcarpetas** de ese namespace (`persistence/sqlite/`, `persistence/mysql/`), de modo que de un vistazo se ve qué
  es el contrato y qué son sus implementaciones.
- **Sin carpetas para una sola clase.** Una carpeta (con su `__init__.py`) solo se justifica si reúne varias clases de
  un mismo tema. Si una carpeta tendría un único fichero de clase, esa clase sube al namespace padre y se reexporta
  desde su `__init__.py` (por ejemplo, todas las clases base de persistencia están en `persistence/`, no una carpeta
  por cada una). Lo mismo con un módulo suelto de una sola clase: no necesita carpeta (`app/logger.py`). La única
  excepción acordada es `domain/wrappers/`, que el autor quiere separada de `domain/models/` para diferenciarlas.
- **Paquetes:** cada `__init__.py` lleva un docstring que explica el directorio y, si el paquete tiene clases
  públicas, las reexporta con `__all__` para poder importar desde el paquete
  (`from app.config import StartupParametersFileError`). Dentro del mismo paquete se importa el módulo
  concreto, para evitar ciclos.
- **Docstring de `__init__.py`: una línea, temática.** Basta con decir qué reúne el paquete (por ejemplo, «Excepciones
  de base de datos.»). No se enumeran sus clases ni sus subcarpetas, ni se repite que todo se importa desde el
  namespace ni el orden de los imports: eso ya lo dicen estas directrices y el propio código.
- **Excepciones:** granulares. Cada operación hace una sola cosa y lanza una excepción propia si no puede hacerla,
  en lugar de seguir a medias. **Cada capa es dueña de las suyas**, en un subdirectorio `exceptions/` de su propio
  namespace, que este reexporta: las del contrato de los puertos (`PersistenceError`, `BIMModelNotFoundError`) en
  `app/application/exceptions/`; las de un adaptador en el de ese adaptador
  (`app/adapters/outbound/persistence/exceptions/`, errores de base de datos); las de configuración en
  `app/config/exceptions/`. Nadie importa excepciones de una capa a la que no pertenece salvo que sea su dependencia
  natural (adaptadores → aplicación, nunca al revés).

## Estructura de cada clase (regiones)

Cada clase organiza sus miembros en regiones, en **este orden**. El nombre de la región va **en inglés y en
MAYÚSCULAS**, y el cierre repite el nombre: `# region PUBLIC METHODS` ... `# endregion PUBLIC METHODS`. Una región
solo existe si tiene al menos un miembro; en cuanto se añade uno de ese tipo, debe ir en su región.

1. `PUBLIC CONSTANTS`
2. `PRIVATE CONSTANTS`
3. `PUBLIC STATIC PROPERTIES`
4. `PRIVATE STATIC PROPERTIES`
5. `PUBLIC PROPERTIES`
6. `PRIVATE PROPERTIES`
7. `CONSTRUCTOR`
8. `PUBLIC METHODS`
9. `PUBLIC STATIC METHODS`
10. `PRIVATE METHODS`
11. `PRIVATE STATIC METHODS`

Criterio (clean code): primero los datos y luego el comportamiento; lo público (la API de la clase) antes que lo
privado (los auxiliares); y cada método privado después de quienes lo usan.

- **Constantes:** `ClassVar` en MAYÚSCULAS. **Propiedades estáticas:** estado de clase que cambia (`ClassVar`).
  **Propiedades:** campos declarados en la clase (dataclasses, DTOs) y métodos `@property`, con los campos primero.
  Los atributos que se asignan dentro de `__init__` (`self._x = ...`) van, con su docstring, dentro del constructor.
- Las clases sin miembros (por ejemplo, las excepciones) no llevan regiones.
- Dentro de una región, ordena por lógica de uso (por ejemplo, el ciclo de vida: `exists`, `delete`, `create`,
  `load_basic_data`, `connect`).

## Arquitectura (hexagonal)

```
Cliso.API/app/
├── main.py            # Raíz de composición: elige adaptadores y los conecta (lifespan)
├── app_startup_configurator.py  # AppStartupConfigurator (estático): CORS y respuestas HTTP a las excepciones, que solo se registran al crear la app
├── config/            # StartupParameters + StartupParametersManager (estático) + exceptions/
├── logger.py          # Logger estático (info, warning, error) en fichero
├── utils/             # PathUtils y FileUtils (estáticas): rutas y operaciones sobre carpetas y ficheros
├── initializer/       # DatabaseInitializer (prepara la base de datos al arrancar) y DemoData (objetos de dominio)
├── domain/            # Núcleo: models/ (objetos de dominio, dataclasses kw_only=True) y wrappers/ (los amplían con datos calculados)
├── application/       # Núcleo: ports/{inbound,outbound}/, use_cases/ y exceptions/
├── adapters/
│   ├── inbound/rest/  # FastAPI: routers, dtos/ (Pydantic) y mappers/ (dominio <-> DTO)
│   └── outbound/
│       ├── persistence/       # Clases base (DatabaseAdapterBase, DatabaseConnectionBase...) en la raíz
│       │   ├── sqlite/        #   Adaptador, repositorios y esquema SQL de SQLite
│       │   ├── mysql/         #   Adaptador, repositorios y esquema SQL de MySQL
│       │   └── exceptions/    #   Errores de base de datos
│       └── storage/           # Almacenamiento de ficheros (LocalBIMModelFileStorage)
```

Los repositorios y el almacenamiento tienen su contrato (`*Base`) en `application/ports/outbound/` y sus
implementaciones en los adaptadores.

- **Todo apunta hacia el núcleo:** `adapters` → `application` → `domain`. El dominio no importa nada de la
  aplicación; los casos de uso no importan adaptadores.
- Cada concepto tiene dos clases: **objeto de dominio** (dataclass) y **DTO** (Pydantic, lo que entra y sale por la
  API; un DTO nunca lleva datos internos como una contraseña). No hay clases "entity" de ORM.
- **Conversión dominio <-> DTO explícita**, en mappers estáticos (`BIMModelMapper.to_dto` / `to_domain`), campo a campo.
  Nada de conversión automática (`from_attributes`, `model_config`, AutoMapper-style): lo que el sistema asigna
  (`id`, `creation_date`, propietario, contraseña hasheada) llega a `to_domain` como argumento, no del cliente.
- **Base de datos:** SQL escrito a mano con parámetros (`?` en SQLite, `%s` en MySQL), nunca concatenados los valores.
  Dos proveedores, SQLite (por defecto, un fichero local) y MySQL, a elegir con el parámetro de arranque
  `database_provider`. Un adaptador por motor, con el contrato `DatabaseAdapterBase` (`exists`, `delete`, `create`,
  `load_basic_data`), que además es un `DatabaseConnectionProviderBase` (`connect`). Los repositorios solo reciben este
  último (lo mínimo que necesitan) y escriben en cada método su SQL, su `try/except/finally` y el cierre de la
  conexión, a la vista (sin utilidades que lo oculten). Hay un repositorio por concepto y motor, cada uno con sus
  propias constantes de columnas.
- **Modo demo** (`is_demo`): con cualquier proveedor, se usa una base de datos `cliso-demo_<fecha>`. **Real**: `cliso`
  (SQLite) o `mysql_database` (MySQL). En ambos casos, si la base de datos no existe, el `DatabaseInitializer` la crea
  con sus tablas y los datos básicos (los parámetros de la aplicación) y, en modo demo, con los datos de `DemoData`,
  que son objetos de dominio guardados con los repositorios. Si existe, se reutiliza sin tocarla. El arranque nunca
  borra una base de datos que ya existía (solo la que acaba de crear, si falla su carga inicial).
- **Routers:** una clase estática por router con `create(service)` (`BIMModelRouter.create(...)`), que recibe solo los
  servicios que sus endpoints necesitan. No hay proveedor global de servicios: `main.py` crea los servicios (con el
  repositorio que toque) y se los entrega a cada router.
- **Errores en los endpoints:** los routers no llevan `try/except`. Las excepciones se traducen a HTTP en
  `ExceptionHandlers` (`adapters/inbound/rest`) y se registran en `AppStartupConfigurator.register_exception_handlers()`
  (`app/app_startup_configurator.py`), en bloques por código de respuesta. Excepción nueva = un handler (si hace falta) y una línea ahí.
- Los parámetros de arranque se leen con `StartupParametersManager.load()` y se reparten sin acceso global: el
  `lifespan` de `main.py` los lee para elegir los adaptadores, y `AppStartupConfigurator.register_cors()` los lee aparte
  porque el CORS se configura antes de que arranque el `lifespan`. Los parámetros de la aplicación se leen de la tabla, con su servicio, tras preparar la
  base de datos.

## Diseño de la base de datos

El diagrama UML está en `Documentation/Database/[Diseño] Cliso.API - Base de datos.drawio` y es la fuente del
esquema. Si cambia el esquema (`sqlite_schema.sql`, `mysql_schema.sql`) o el diseño, se actualizan a la vez ambos
esquemas y el diagrama. El README se actualiza aparte, según lo que dice `directrices.md`. Normas del diseño:

- Tablas y columnas en `snake_case` y en singular. `id` de tipo `long` (`BIGINT`) autoincremental.
- Borrado lógico con `active` en las tablas principales; las tablas hijas de una composición (las piezas) se borran
  en cascada.
- `creation_date` obligatoria y `update_date` opcional (`NULL` hasta la primera modificación).
- Las claves foráneas se nombran `<tabla>_id` (`user_id`, `bim_model_id`).
- Los textos con valor opcional usan cadena vacía por defecto (`DEFAULT ''`), no `NULL`.
- Las sesiones no se guardan en base de datos: viven en memoria de la API.

## Comprobaciones antes de dar algo por hecho

1. `python -m pyright` desde `Cliso.API` (con el entorno virtual `.venv`) → 0 errores.
2. Arranca la API (o su `lifespan`) y comprueba el comportamiento nuevo.
3. Di con claridad lo que **no** has podido probar (por ejemplo, MySQL sin servidor).
