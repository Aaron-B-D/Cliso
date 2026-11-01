# Cliso.Docker

Levanta Cliso en local con Docker Compose: la UI (nginx), la API y, de forma opcional, MySQL.

## Cómo funciona

- **UI:** `ng build` y nginx sirve los estáticos, como en producción. La recarga en caliente se hace fuera de Docker con `ng serve`.
- **Proxy inverso:** nginx reenvía `/api` a `api:8000` quitando el prefijo. El navegador solo habla con un origen, así que la web
  servida por nginx no necesita CORS. El único cambio en los proyectos es que `Environment.API_URL` vale `/api` en el build de producción.
  nginx resuelve la API en cada petición, así que la web arranca aunque la API esté parada.
- **API publicada:** también se publica en el equipo (`API_PORT`, 8000 por defecto), solo en `127.0.0.1`, para poder
  apuntar a ella desde fuera, por ejemplo una web local con `ng serve`. No se puede alcanzar desde otros equipos de la
  red. Si esa web está en otro origen, la API tendría que admitir CORS (en modo demo, con los ficheros de `api/`, ya
  admite todos).
- **IP real del cliente:** nginx reenvía la IP en `X-Forwarded-For` y uvicorn arranca con `--proxy-headers`, pero solo se
  fía de esa cabecera si viene de las redes de Docker (`FORWARDED_ALLOW_IPS: 172.16.0.0/12` en `docker-compose.yml`).
  Así la sesión, que va ligada a la IP, y el límite de intentos de acceso distinguen a unos clientes de otros.
- **API:** lee su configuración del fichero que indica `CLISO_SETTINGS` (montado desde `api/`). Los volúmenes guardan
  `/app/data` (base de datos SQLite y ficheros IFC en `data/models`) y `/app/logs`.
- **IFC grandes:** nginx no limita el tamaño del cuerpo (`client_max_body_size 0`) ni lo guarda antes de reenviarlo
  (`proxy_request_buffering off`).

## Modo simple (por defecto): UI + API con SQLite

```bash
docker compose up --build
```

Se abre en <http://localhost:8080>.

## Modo MySQL (opcional): UI + API + MySQL

Copia `.env.example` a `.env`, cambia `CLISO_SETTINGS_FILE` a `settings.docker.mysql.json` y arranca con el perfil:

```bash
docker compose --profile mysql up --build
```

- El usuario de MySQL necesita permiso de `CREATE DATABASE` (aquí, `root`).
- La contraseña de `settings.docker.mysql.json` (`mysql_password`) debe coincidir con `MYSQL_ROOT_PASSWORD` de `.env`.
  Es una credencial de desarrollo local: no la uses fuera de tu equipo.
- La API espera a que MySQL esté sano (`healthcheck`) antes de arrancar. Esto exige Docker Compose 2.20 o superior.
- Usa MySQL 8.0: la autenticación clásica (`mysql_native_password`) que necesita el conector de la API se eliminó en 8.4.

## Arrancar servicios sueltos: `cliso-docker.bat` y el panel de Cliso

`cliso-docker.bat <acción>` encapsula los comandos de Compose para arrancar solo lo que haga falta (por ejemplo, la API
con MySQL y apuntar una web local a ella). El panel de Cliso (`/cliso-tracker`, pestaña **Docker**) lo usa: muestra el
estado de cada servicio con la IP local del equipo y tiene los botones de arrancar y detener, y una subpestaña
**Imágenes** que comprueba si hay que reconstruirlas.

| Acción | Qué hace |
|---|---|
| `up-all-sqlite` / `up-all-mysql` | Web + API con SQLite / web + API + MySQL |
| `up-api-sqlite` / `up-api-mysql` | Solo la API con SQLite / con MySQL (arranca antes la base de datos) |
| `up-ui` | Solo la web |
| `up-db` | Solo MySQL |
| `stop-all`, `stop-api`, `stop-ui`, `stop-db` | Detienen lo que dice el nombre (conservan los datos) |
| `restart-api` | Reinicia la API sin reconstruir su imagen; en modo demo la base de datos queda limpia (botón *↺ Reiniciar* del panel) |
| `build` | Reconstruye las imágenes de la API y la web |
| `images`, `ps`, `ip` | Consultas: fecha de las imágenes, servicios existentes y IP local |

- El modo de la API lo fija el script con `CLISO_SETTINGS_FILE`, así que no depende del `.env`.
- MySQL solo se publica en `127.0.0.1` (`MYSQL_PORT`, 3307 por defecto): su contraseña es de desarrollo.
- El script usa solo ASCII y no lleva etiquetas: `cmd` lee mal los `.bat` con acentos o con saltos de línea LF.

## Datos demo

Los dos ficheros de configuración llevan `is_demo: true`: la API usa la base de datos `cliso-demo` y la borra y la rehace
en cada arranque (con SQLite o con MySQL), así que empieza siempre limpia, con sus valores por defecto. Para dejarla
limpia sin reconstruir la imagen basta reiniciar la API (`cliso-docker.bat restart-api` o el botón *↺ Reiniciar* del
panel). Los ficheros IFC del volumen no se borran.
Para una base de datos permanente, pon `is_demo` a `false` en el JSON que uses.

En modo real una base de datos que ya existe no se migra. Si el volumen `cliso-data` (o el de MySQL) tiene una base de
datos real creada por una versión anterior, puede faltarle algún parámetro nuevo (por ejemplo,
`SESSION_TIMEOUT_MILLISECONDS`) y la API no arrancará, con el error «no existe el parámetro de la aplicación»: hay que
insertar la fila a mano o borrar el volumen (`docker compose down -v`, que borra también los datos). Las bases de datos
`cliso-demo_<fecha>` que dejaron versiones anteriores en un volumen de MySQL se eliminan igual, con
`docker compose --profile mysql down -v`.

## Parar y limpiar

```bash
docker compose down
```

Conserva los datos (volúmenes). Para borrar también los volúmenes, añade `-v`; hay que incluir el perfil si se usó MySQL:

```bash
docker compose --profile mysql down -v
```

## Ampliar

Cada servicio es un bloque de `docker-compose.yml` con sus ajustes en `.env`: añadir otro es añadir un bloque, sin tocar el resto.
Las versiones de Python, Node, nginx y MySQL son `ARG` o variables, no están fijadas en el código.
