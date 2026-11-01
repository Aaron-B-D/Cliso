@echo off
rem Control de los servicios de Cliso.Docker. Lo usa el panel de Cliso (/cliso-tracker) y se puede lanzar a mano:
rem   cliso-docker.bat [accion]
rem Servicios: api, ui (web) y db (MySQL, solo con el perfil mysql).
rem Solo ASCII y sin etiquetas ni goto: cmd lee mal los .bat con acentos (chcp) o con saltos de linea LF.
cd /d "%~dp0"

if /i "%~1"=="up-all-sqlite" (
	set "CLISO_SETTINGS_FILE=settings.docker.json"
	docker compose up -d api ui || exit /b 1
	exit /b 0
)
if /i "%~1"=="up-all-mysql" (
	set "CLISO_SETTINGS_FILE=settings.docker.mysql.json"
	docker compose --profile mysql up -d api ui || exit /b 1
	exit /b 0
)
if /i "%~1"=="up-api-sqlite" (
	set "CLISO_SETTINGS_FILE=settings.docker.json"
	docker compose up -d api || exit /b 1
	exit /b 0
)
if /i "%~1"=="up-api-mysql" (
	set "CLISO_SETTINGS_FILE=settings.docker.mysql.json"
	docker compose --profile mysql up -d api || exit /b 1
	exit /b 0
)
if /i "%~1"=="up-ui" (
	docker compose up -d ui || exit /b 1
	exit /b 0
)
if /i "%~1"=="up-db" (
	docker compose --profile mysql up -d db --wait || exit /b 1
	exit /b 0
)
if /i "%~1"=="stop-all" (
	docker compose --profile mysql stop || exit /b 1
	exit /b 0
)
if /i "%~1"=="stop-api" (
	docker compose --profile mysql stop api || exit /b 1
	exit /b 0
)
if /i "%~1"=="stop-ui" (
	docker compose --profile mysql stop ui || exit /b 1
	exit /b 0
)
if /i "%~1"=="stop-db" (
	docker compose --profile mysql stop db || exit /b 1
	exit /b 0
)
rem Reinicia la API sin reconstruir su imagen. En modo demo la API borra y rehace su base de datos al arrancar, asi que
rem queda limpia, con sus valores por defecto (con SQLite o MySQL). Los ficheros IFC del volumen se conservan.
if /i "%~1"=="restart-api" (
	docker compose --profile mysql restart api || exit /b 1
	exit /b 0
)
rem Reconstruye las imagenes de la API y la web. Para usarlas hay que arrancar de nuevo los servicios (se recrean).
if /i "%~1"=="build" (
	docker compose build api ui || exit /b 1
	exit /b 0
)
rem Imagenes de la API y la web con la fecha de su ultima construccion en segundos: "[nombre:etiqueta] fecha".
rem Se usa la fecha de etiquetado, no la de creacion: con la cache de la construccion esta ultima no cambia. Las que no existen no salen.
if /i "%~1"=="images" (
	for /f %%i in ('docker compose config --images') do docker image inspect %%i --format "{{.RepoTags}} {{.Metadata.LastTagTime.Unix}}" 2>nul
	exit /b 0
)
rem Servicios existentes (tambien los parados), uno por linea en JSON.
if /i "%~1"=="ps" (
	docker compose --profile mysql ps -a --format json || exit /b 1
	exit /b 0
)
rem IP local del equipo en la red (la del adaptador con puerta de enlace), no localhost.
if /i "%~1"=="ip" (
	powershell -NoProfile -Command "$c = Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -eq 'Up' } | Select-Object -First 1; if ($c) { $c.IPv4Address.IPAddress }" || exit /b 1
	exit /b 0
)

echo Uso: cliso-docker.bat ^<accion^>
echo   up-all-sqlite, up-all-mysql, up-api-sqlite, up-api-mysql, up-ui, up-db
echo   stop-all, stop-api, stop-ui, stop-db, restart-api
echo   build, images, ps, ip
exit /b 2
