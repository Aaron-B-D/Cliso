# Directrices del proyecto Cliso

Normas ya acordadas con el autor. Aplícalas sin que haya que repetirlas. Si una norma choca con lo que se pide,
pregunta antes de saltártela.

## Cómo trabajar

- **Idioma:** español, tanto en la conversación como en comentarios, docstrings, README y mensajes de excepciones
  y de log. Los nombres de código van en inglés.
- **Haz solo lo pedido.** No añadas funcionalidades, ajustes ni ficheros extra por iniciativa propia. Si crees que
  hace falta algo más, propónlo y pregunta.
- **Edita con las herramientas del editor (`Edit` / `Write`), nunca con scripts de shell (`sed`, `python -`,
  heredocs...).** Así el autor ve los cambios. El shell solo para ejecutar, comprobar y limpiar.
- **Hoja de ruta del README:** no la toques (ni la sección "Estado del proyecto y hoja de ruta") hasta que se pida.
  El resto del README sí se mantiene al día cuando cambia algo técnico.
- **Explicaciones:** el autor viene de C#. Explica los conceptos de Python comparándolos con su equivalente en C#
  (`with` ≈ `using`, `ClassVar` ≈ `static`, `__init__.py` ≈ namespace...), sin jerga innecesaria y con ejemplos.
- **Prefiere lo explícito a lo abstracto.** Sin ORM (SQL escrito a mano), sin `**` para repartir diccionarios
  (asigna campo a campo), sin magia que oculte lo que ocurre.
- **Código que entienda un novato de Python:** se prefiere verboso y claro a corto y avanzado. Nada de `yield`,
  `@contextmanager`, `*args` variádicos, decoradores propios ni utilidades que oculten lo que ocurre; cada método se
  lee de arriba abajo (por ejemplo, abrir, consultar y cerrar la conexión se escribe en cada método, aunque se
  repita). La única excepción es el `lifespan` de FastAPI, que lo exige el propio framework.
- **Entorno ligero:** pocas dependencias, `requirements.txt` al día. No se sube nada a git.
- **Tras probar, limpia:** borra `__pycache__`, `data/`, `logs/` y ficheros temporales que hayas generado.
- No dejes servidores de prueba en marcha.

## Estilo de código (Python)

- **Sangría con tabuladores.** Nombres en `snake_case`; clases en `PascalCase`.
- **Punto y coma al final de cada sentencia** (aunque Python no lo exija): imports, asignaciones, llamadas,
  `return`, `raise`, `yield`, `...`, atributos de clase y de dataclass, `__all__`. En sentencias de varias líneas va
  tras el cierre (`);`); si hay comentario al final de la línea, va antes del comentario. No llevan `;`: las
  cabeceras que acaban en `:` (`def`, `class`, `if`, `try`, `for`, `with`...), los decoradores, los comentarios, las
  regiones y los docstrings.
- **Tipado estricto.** El código debe dar 0 errores con `python -m pyright` (modo `strict`, ver
  `Cliso.API/pyrightconfig.json`). Nada de tipos desconocidos: anota todo, incluidas las listas y diccionarios.
- **Documenta todo con docstring** (el equivalente al `<summary>` de C#): clases, métodos, funciones y cada
  atributo (el docstring va justo debajo del atributo). En métodos con argumentos o excepciones, usa las secciones
  `Args:`, `Returns:` y `Raises:`.
- **Constantes:** privadas, con guion bajo delante (`_SCHEMA_PATH`), salvo que se consulten desde fuera de su clase.
  En MAYÚSCULAS y anotadas con `ClassVar`. Van dentro de la clase, no sueltas en el módulo.
- **Nada de funciones sueltas para lógica con estado o con vocación de servicio:** agrúpalas en una clase estática
  (como `SettingsManager` o `Logger`): `@staticmethod`, estado en `ClassVar`, sin instanciar.
- **Privacidad:** lo que no se usa fuera lleva `_` (atributos, métodos auxiliares, constantes).
- **Cada parte es una isla: no referencies otras clases.** Ni en el código ni en docstrings o comentarios: un DTO no
  menciona a su mapper ni al dominio; el dominio no menciona tablas ni DTOs; una clase no nombra a quien la usa.
  Solo se referencian las dependencias que el código necesita de verdad (imports, tipos de argumentos, excepciones en
  `Raises:`), y la unión entre islas se hace en un punto aparte: un mapper entre dominio y DTO, o `main.py` entre
  núcleo y adaptadores.
- **Una clase por fichero**, con el nombre de la clase en `snake_case` (`DatabaseNotFoundError` →
  `database_not_found_error.py`), para editarlas una a una. Todas las de un directorio se agrupan bajo un namespace
  (su `__init__.py`). Esto incluye las excepciones y los enumerados: cada enumerado en su fichero, con el nombre del
  enumerado como nombre del fichero (`ApplicationSettingParameter` → `application_setting_parameter.py`).
- **Imports de máximo 3 capas tras `app`** (`app.adapters.outbound.persistence`). Ese namespace debe bastar para
  importar todo lo que haya por debajo, así que su `__init__.py` reexporta también las subcarpetas. Desde fuera del
  namespace se importa siempre así, nunca de un módulo ni de una subcarpeta más profunda. Si en algún caso hay que ir
  más profundo, **consúltalo antes**. Dentro de un `__init__.py` el orden de los imports importa (primero lo que
  usan los demás).
- **Clases abstractas:** llevan siempre el sufijo `Base` (`DatabaseAdapterBase`, `DatabaseConnectionBase`) y viven en
  la **raíz** de su directorio. Sus especializaciones van en **subcarpetas** de ese directorio (`persistence/sqlite/`,
  `persistence/mysql/`), de modo que de un vistazo se ve qué es el contrato y qué son sus implementaciones. Cada
  concepto abstracto tiene su propio directorio (`persistence/database_adapter/`, `persistence/database_connection/`),
  con su `*Base` en la raíz de ese directorio y sus implementaciones en subdirectorios, para saber dónde buscar.
- **Paquetes:** cada `__init__.py` lleva un docstring que explica el directorio y, si el paquete tiene clases
  públicas, las reexporta con `__all__` para poder importar desde el paquete
  (`from app.config import SettingsFileError`). Dentro del mismo paquete se importa el módulo
  concreto, para evitar ciclos.
- **Excepciones:** granulares. Cada operación hace una sola cosa y lanza una excepción propia si no puede hacerla,
  en lugar de seguir a medias. **Cada capa es dueña de las suyas**, en un subdirectorio `exceptions/` de su propio
  namespace, que este reexporta: las del contrato de los puertos (`PersistenceError`, `UserNotFoundError`) en
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
  `load_basic_data`, `load_demo_data`, `connect`).

## Arquitectura (hexagonal)

```
Cliso.API/app/
├── main.py            # Raíz de composición: elige adaptadores y los conecta (lifespan)
├── config/            # Settings + SettingsManager (estático) + exceptions/
├── logger/            # Logger estático (info, warning, error) en fichero
├── domain/models/     # Núcleo: objetos de dominio (dataclasses, kw_only=True)
├── application/       # Núcleo: ports/{inbound,outbound}/, use_cases/ y exceptions/
├── adapters/
│   ├── inbound/rest/  # FastAPI: routers, dtos/ (Pydantic) y mappers/ (dominio <-> DTO)
│   └── outbound/persistence/
│       ├── database_adapter/    # DatabaseAdapterBase + sqlite/ y mysql/ (implementaciones)
│       ├── database_connection/ # DatabaseConnectionBase
│       ├── database_connection_provider/ # DatabaseConnectionProviderBase (connect)
│       ├── user_repository/     # UserRepositoryBase vive en application; aquí sqlite/ y mysql/
│       └── exceptions/          # Errores de base de datos
```

- **Todo apunta hacia el núcleo:** `adapters` → `application` → `domain`. El dominio no importa nada de la
  aplicación; los casos de uso no importan adaptadores.
- Cada concepto tiene dos clases: **objeto de dominio** (dataclass) y **DTO** (Pydantic, lo que entra y sale por la
  API; `UserDto` nunca lleva la contraseña). No hay clases "entity" de ORM.
- **Conversión dominio <-> DTO explícita**, en mappers estáticos (`UserMapper.to_dto` / `to_domain`), campo a campo.
  Nada de conversión automática (`from_attributes`, `model_config`, AutoMapper-style): lo que el sistema asigna
  (`id`, `creation_date`, propietario, contraseña hasheada) llega a `to_domain` como argumento, no del cliente.
- **Base de datos:** SQL escrito a mano con parámetros (`?` en SQLite, `%s` en MySQL), nunca concatenados los valores.
  Dos proveedores, SQLite (por defecto, un fichero local) y MySQL, a elegir con el setting `database_provider`. Un
  adaptador por motor, con el contrato `DatabaseAdapterBase` (`exists`, `delete`, `create`, `load_basic_data`,
  `load_demo_data`), que además es un `DatabaseConnectionProviderBase` (`connect`). Los repositorios solo reciben
  este último (lo mínimo que necesitan) y escriben en cada método su SQL, su `try/except/finally` y el cierre de la conexión, a la vista (sin utilidades que lo oculten). Hay un repositorio por
  concepto y motor, cada uno con sus propias constantes de columnas.
- **Modo demo** (`is_demo`): con cualquier proveedor, se usa una base de datos `cliso-demo_<fecha>` que, si no existe, se
  crea con los datos de `demo_data.json`; si existe, se reutiliza sin tocarla. **Real**: `cliso` (SQLite) o
  `mysql_database` (MySQL), creada con los datos básicos si no existe. El arranque nunca borra una base de datos.
- **Routers:** una clase estática por router con `create(service)` (`UserRouter.create(...)`), que recibe solo los
  servicios que sus endpoints necesitan. No hay proveedor global de servicios: `main.py` crea los servicios (con el
  repositorio que toque) y se los entrega a cada router.
- **Errores en los endpoints:** los routers no llevan `try/except`. Las excepciones se traducen a HTTP en
  `ExceptionHandlers` (`adapters/inbound/rest`) y se registran en `register_exception_handlers()` de `main.py`, en
  bloques por código de respuesta. Excepción nueva = un handler (si hace falta) y una línea ahí.
- Los settings se leen una vez con `SettingsManager.load()`, y `main.py` los reparte (no hay acceso global a ellos).

## Comprobaciones antes de dar algo por hecho

1. `python -m pyright` desde `Cliso.API` → 0 errores.
2. Arranca la API (o su `lifespan`) y comprueba el comportamiento nuevo.
3. Di con claridad lo que **no** has podido probar (por ejemplo, MySQL sin servidor).
