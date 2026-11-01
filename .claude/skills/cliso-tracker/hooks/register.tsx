import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Block, ContainersState, DockerState, ReadmeState, Report, ServiceInfo, Task } from '../types'
// Los cambios del README se calculan con git, sin guardar nada por usuario: así valen en cualquier clon del repositorio.

const PANE = 'cliso-tracker'
const HOUR = 60 * 60 * 1000
// Se recalcula si el último informe tiene 23 h o más; con un tic cada hora, nunca pasan más de 24 h.
const MAX_AGE = 23 * HOUR
// Cambia la etiqueta si cambian los campos: descarta lo guardado por una versión anterior.
const report = atom({ plugin: 'cliso-tracker', key: 'report' } as const, null, { shape: 'report-1' })
const open = atom({ plugin: 'cliso-tracker', key: 'open' } as const, {}, { shape: 'open-1' })

// Logo de Cliso: un cubo isométrico (el modelo BIM común) con tres caras en tonos de azul
// (las visualizaciones independientes que cada usuario crea sobre él).
const LOGO =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
  '<path d="M12 2 21 7 12 12 3 7Z" fill="#9dbcff"/>' +
  '<path d="M3 7 12 12V22L3 17Z" fill="#4f8cff"/>' +
  '<path d="M21 7 12 12V22L21 17Z" fill="#2c5fcf"/>' +
  '<path d="M12 12 3 7M12 12 21 7M12 12V22" stroke="#0b1220" stroke-width="0.8" stroke-linejoin="round" fill="none" opacity="0.55"/>' +
  '</svg>'

// Si el panel se supone visible; lo cambia el botón discreto sobre el prompt.
const shown = atom({ plugin: 'cliso-tracker', key: 'shown' } as const, true, { shape: 'shown-1' })

// Estado del README: cuándo se actualizó por última vez y los cambios pendientes de pasarle (calculados con git).
const readme = atom({ plugin: 'cliso-tracker', key: 'readme' } as const, null, { shape: 'readme-2' })

// Si las imágenes de Docker necesitan reconstruirse: lo calcula el botón del panel, no se guarda por usuario.
const docker = atom({ plugin: 'cliso-tracker', key: 'docker' } as const, null, { shape: 'docker-2' })

// Servicios de Docker en marcha, IP local y operación en curso: se consultan con el script Cliso.Docker/cliso-docker.bat.
const EMPTY_CONTAINERS: ContainersState = {
  checkedAt: 0,
  ip: '',
  services: [],
  busy: '',
  message: '',
  isMessageError: false,
  error: '',
}
const containers = atom({ plugin: 'cliso-tracker', key: 'containers' } as const, EMPTY_CONTAINERS, { shape: 'containers-1' })

// Pestaña del panel ('progress' o 'docker') y subpestaña de Docker ('services' o 'images').
const tab = atom({ plugin: 'cliso-tracker', key: 'tab' } as const, 'progress', { shape: 'tab-1' })
const dockerTab = atom({ plugin: 'cliso-tracker', key: 'dockerTab' } as const, 'services', { shape: 'dockerTab-1' })

type Entry = { name: string; kind: string; mtimeMs: number }

// '.claude' es de las herramientas de Claude, no del proyecto: sus cambios no afectan al README.
const SKIP_DIRS = new Set([
  'node_modules', '.venv', '__pycache__', '.git', '.idea', '.angular', '.claude', 'dist', 'data', 'logs', '.pytest_cache',
])
// Máximo de ficheros que se listan por categoría en la petición a Claude.
const MAX_LISTED = 40
const TEXT_FILE = /\.(py|ts|html|scss|json|md|sql|txt|drawio)$/i
const SKIP_FILES = new Set(['package-lock.json'])

/** Lo que una tarea puede preguntar sobre el repositorio. */
type Ctx = {
  has: (path: string) => boolean
  count: (re: RegExp) => number
  any: (re: RegExp) => boolean
  grep: (pathRe: RegExp, contentRe: RegExp) => Promise<boolean>
  isGit: boolean
}

type Def = { block: string; label: string; test: (c: Ctx) => boolean | Promise<boolean> }

const API_PY = /^Cliso\.API\/app\/.*\.py$/
const UI_SRC = /^Cliso\.UI\/src\/.*\.(ts|html)$/
const HASH = /hashlib|bcrypt|argon2|pbkdf2|passlib|scrypt/i

const DEFS: Def[] = [
  // ----- Back -----
  { block: 'back', label: 'Entidades de dominio (BIMModel, User, Visualization)', test: c =>
    ['bim_model', 'user', 'visualization'].every(n => c.has(`Cliso.API/app/domain/models/${n}.py`)) },
  { block: 'back', label: 'Arquitectura hexagonal (dominio, aplicación, adaptadores)', test: c =>
    c.any(/^Cliso\.API\/app\/application\/ports\//) && c.any(/^Cliso\.API\/app\/adapters\//) && c.any(/^Cliso\.API\/app\/domain\//) },
  { block: 'back', label: 'Configuración (settings.json y SettingsManager)', test: c =>
    c.has('Cliso.API/settings.json') && c.has('Cliso.API/app/config/settings_manager.py') },
  { block: 'back', label: 'Log de la aplicación', test: c => c.has('Cliso.API/app/logger/logger.py') },
  { block: 'back', label: 'Adaptadores de base de datos SQLite y MySQL', test: c =>
    c.has('Cliso.API/app/adapters/outbound/persistence/database_adapter/sqlite/sqlite_adapter.py') &&
    c.has('Cliso.API/app/adapters/outbound/persistence/database_adapter/mysql/mysql_adapter.py') },
  { block: 'back', label: 'Autoinstalación de la BD (esquema, datos básicos y demo)', test: c =>
    c.has('Cliso.API/app/adapters/outbound/persistence/database_adapter/sqlite/sqlite_schema.sql') &&
    c.has('Cliso.API/app/adapters/outbound/persistence/database_adapter/sqlite/sqlite_basic_data.sql') &&
    c.has('Cliso.API/demo_data.json') },
  { block: 'back', label: 'Servicio y endpoints de usuarios', test: c =>
    c.has('Cliso.API/app/adapters/inbound/rest/user_router.py') && c.has('Cliso.API/app/application/use_cases/user_service.py') },
  { block: 'back', label: 'Hash de contraseñas', test: c => c.grep(API_PY, HASH) },
  { block: 'back', label: 'Repositorio y casos de uso de modelos BIM', test: c =>
    c.any(/bim_model_repository/) && c.any(/bim_model_service/) },
  { block: 'back', label: 'Endpoints CRUD de modelos BIM', test: c => c.any(/^Cliso\.API\/.*bim_model_router\.py$/) },
  { block: 'back', label: 'Subida/descarga y almacenamiento de ficheros de modelos', test: c =>
    c.grep(API_PY, /UploadFile|FileResponse/) },
  { block: 'back', label: 'Autenticación por credenciales y sesión en cookie', test: c =>
    c.grep(API_PY, /set_cookie|SessionMiddleware/) },
  { block: 'back', label: 'Repositorio, casos de uso y endpoints de visualizaciones', test: c =>
    c.any(/visualization_repository/) && c.any(/visualization_service/) && c.any(/visualization_router\.py$/) },
  { block: 'back', label: 'Tests del back (Cliso.API/test)', test: c => c.any(/^Cliso\.API\/test\/.*\.py$/) && c.count(/^Cliso\.API\/test\/.*test.*\.py$/i) > 0 },

  // ----- Front -----
  { block: 'front', label: 'Proyecto Angular configurado', test: c => c.has('Cliso.UI/angular.json') && c.has('Cliso.UI/package.json') },
  { block: 'front', label: 'Guía de estilo y variables SCSS', test: c =>
    c.any(/^Documentation\/UI\/.*Gu[ií]a de estilo\.md$/i) && c.has('Cliso.UI/src/styles/_variables.scss') },
  { block: 'front', label: 'Diseño de pantallas (Home, Editor, Barra de herramientas)', test: c => c.count(/^Documentation\/UI\/.*\.drawio$/) >= 3 },
  { block: 'front', label: 'Rutas de la aplicación definidas', test: c => c.grep(/^Cliso\.UI\/src\/app\/app\.routes\.ts$/, /path\s*:/) },
  { block: 'front', label: 'Acceso a la API (HttpClient)', test: c => c.grep(UI_SRC, /provideHttpClient|HttpClient/) },
  { block: 'front', label: 'Pantalla de inicio de sesión', test: c => c.any(/^Cliso\.UI\/src\/app\/.*login/i) },
  // Una pantalla de modelos: una carpeta de 'modules' con 'model', 'modelo' o 'bim' en el nombre (no vale el sufijo '.models.ts').
  { block: 'front', label: 'Gestión de modelos BIM', test: c => c.any(/^Cliso\.UI\/src\/app\/modules\/[^/]*(model|modelo|bim)/i) },
  { block: 'front', label: 'Visor 3D', test: c => c.grep(/^Cliso\.UI\/package\.json$/, /three|xeokit|babylon|web-ifc|thatopen/i) },
  { block: 'front', label: 'Editor de visualizaciones', test: c => c.any(/^Cliso\.UI\/src\/app\/.*(editor|visualiz)/i) },
  { block: 'front', label: 'Barra de herramientas', test: c => c.any(/^Cliso\.UI\/src\/app\/.*(toolbar|barra|sidebar)/i) },
  { block: 'front', label: 'Formularios con validación', test: c => c.grep(UI_SRC, /Validators|FormGroup|ngModel/) },
  { block: 'front', label: 'Tests del front (además de app.spec)', test: c => c.count(/^Cliso\.UI\/src\/.*\.spec\.ts$/) >= 2 },

  // ----- Requisitos académicos (MP0374) -----
  { block: 'acad', label: 'Memoria redactada (documento en Documentation)', test: c => c.any(/^Documentation\/.*Memoria.*\.(odt|docx)$/i) },
  { block: 'acad', label: 'Memoria completa: planificación, presupuesto y ejecución', test: async c => !(await c.grep(/^README\.md$/, /por completar/i)) },
  { block: 'acad', label: 'Memoria exportada a PDF (Apellidos_Nombre_Memoria)', test: c => c.any(/^Documentation\/.*\.pdf$/i) },
  { block: 'acad', label: 'Diagrama de Gantt', test: c => c.any(/gantt/i) },
  { block: 'acad', label: 'Diagrama de la base de datos / modelo relacional', test: c =>
    c.any(/^Documentation\/.*(base.?de.?datos|relacional|database|diagrama.?bd|\bER\b|entidad)/i) },
  { block: 'acad', label: 'Wireframes / diseño previo', test: c => c.count(/^Documentation\/.*\.drawio$/) >= 1 },
  { block: 'acad', label: 'Apartado de alcance documentado', test: c => c.grep(/^README\.md$/, /^## Alcance/m) },
  { block: 'acad', label: 'Presentación con diapositivas para la defensa', test: c => c.any(/^Documentation\/.*\.(pptx|odp|key)$/i) },
  { block: 'acad', label: 'Uso de Git (repositorio inicializado)', test: c => c.isGit },
  { block: 'acad', label: 'Aplicación dinámica con base de datos', test: c =>
    c.has('Cliso.API/app/adapters/inbound/rest/user_router.py') && c.any(/sqlite_adapter\.py$/) },
  { block: 'acad', label: 'Alta, baja, modificación y consulta en BD', test: async c =>
    (await c.grep(API_PY, /INSERT/)) && (await c.grep(API_PY, /UPDATE/)) && (await c.grep(API_PY, /DELETE/)) && (await c.grep(API_PY, /SELECT/)) },
  { block: 'acad', label: 'Código en capas / patrón de diseño', test: c =>
    c.any(/^Cliso\.API\/app\/application\//) && c.any(/^Cliso\.API\/app\/adapters\//) && c.any(/^Cliso\.API\/app\/domain\//) },
  { block: 'acad', label: 'Programación orientada a objetos', test: c => c.count(API_PY) > 5 },
  { block: 'acad', label: 'Herencia aplicada en clases', test: c => c.grep(API_PY, /^class\s+\w+\(\w+Base\)/m) },
  { block: 'acad', label: 'Inicio de sesión', test: async c =>
    (await c.grep(API_PY, /login/i)) || (await c.grep(UI_SRC, /login/i)) },
  { block: 'acad', label: 'Cookies', test: async c =>
    (await c.grep(API_PY, /set_cookie|Cookie\(/)) || (await c.grep(UI_SRC, /document\.cookie|CookieService/)) },
  { block: 'acad', label: 'Sesiones', test: c => c.grep(API_PY, /SessionMiddleware|session_id|jwt|Authorization/i) },
  { block: 'acad', label: 'Cifrado/hash de contraseñas', test: c => c.grep(API_PY, HASH) },
  { block: 'acad', label: 'Validación de datos en el servidor', test: c =>
    c.grep(/^Cliso\.API\/app\/.*dto.*\.py$/i, /BaseModel|Field\(|field_validator/) },
  { block: 'acad', label: 'Formularios con validación en el cliente', test: c => c.grep(UI_SRC, /Validators/) },
  { block: 'acad', label: 'Perfiles de usuario o roles distintos', test: c => c.grep(/^Cliso\.API\/app\/domain\/models\/user\.py$/, /role|rol\b|perfil/i) },
  { block: 'acad', label: 'Uso o gestión de información en ficheros', test: c => c.grep(API_PY, /UploadFile|FileResponse|open\(|read_text|write_text/) },
  { block: 'acad', label: 'Librerías de JavaScript y de CSS', test: c =>
    c.grep(/^Cliso\.UI\/package\.json$/, /bootstrap|primeng|@angular\/material|tailwind|three|chart\.js|bulma/i) },
]

const TITLES: Record<string, string> = {
  back: 'Back (Cliso.API)',
  front: 'Front (Cliso.UI)',
  acad: 'Adecuación a los estándares académicos (MP0374)',
}

/** Recorre el proyecto (sin dependencias ni cachés) y anota la fecha de modificación de cada fichero por su ruta relativa. */
async function walk($: any, base: string, rel: string, out: Map<string, number>, depth: number): Promise<void> {
  if (depth > 9) {
    return
  }
  let entries: Entry[] = []
  try {
    entries = await $.fs.list(rel === '' ? base : `${base}/${rel}`)
  } catch {
    return
  }
  for (const entry of entries) {
    const path = rel === '' ? entry.name : `${rel}/${entry.name}`
    if (entry.kind === 'dir') {
      if (!SKIP_DIRS.has(entry.name)) {
        await walk($, base, path, out, depth + 1)
      }
    } else if (entry.kind === 'file') {
      out.set(path, entry.mtimeMs)
    }
  }
}

/** Ejecuta todas las comprobaciones y devuelve el informe y los ficheros del proyecto con su fecha de modificación. */
async function check($: any, base: string, now: number): Promise<{ report: Report; modified: Map<string, number> }> {
  const modified = new Map<string, number>()
  await walk($, base, '', modified, 0)
  const files = [...modified.keys()]
  const cache = new Map<string, string>()
  const text = async (path: string): Promise<string> => {
    const hit = cache.get(path)
    if (hit !== undefined) {
      return hit
    }
    let content = ''
    try {
      content = await $.fs.read(`${base}/${path}`)
    } catch {
      content = ''
    }
    cache.set(path, content)
    return content
  }
  const ctx: Ctx = {
    has: path => modified.has(path),
    count: re => files.filter(f => re.test(f)).length,
    any: re => files.some(f => re.test(f)),
    grep: async (pathRe, contentRe) => {
      for (const path of files) {
        const name = path.slice(path.lastIndexOf('/') + 1)
        if (pathRe.test(path) && TEXT_FILE.test(path) && !SKIP_FILES.has(name) && contentRe.test(await text(path))) {
          return true
        }
      }
      return false
    },
    isGit: await $.fs.exists(`${base}/.git`),
  }
  const blocks: Block[] = []
  for (const id of Object.keys(TITLES)) {
    const tasks: Task[] = []
    for (const def of DEFS.filter(d => d.block === id)) {
      let isDone = false
      try {
        isDone = await def.test(ctx)
      } catch {
        isDone = false
      }
      tasks.push({ label: def.label, isDone })
    }
    blocks.push({ id, title: TITLES[id] ?? id, tasks })
  }
  return { report: { checkedAt: now, blocks }, modified }
}

/** Cada cuánto se recuerda al usuario, mientras haya cambios sin pasar al README. */
const REMIND_EVERY = 3 * HOUR
let lastRemindAt = 0

/** Si un cambio cuenta para el README: no el propio README, ni dependencias, cachés o ficheros de herramientas. */
const isTracked = (path: string): boolean => {
  const parts = path.split('/')
  const name = parts[parts.length - 1] ?? ''

  return path !== 'README.md' && !SKIP_FILES.has(name) && !parts.slice(0, -1).some(dir => SKIP_DIRS.has(dir))
}

const lines = (text: string | null): string[] => (text ?? '').split('\n').filter(line => line !== '')

/** Ejecuta git en el repositorio; null si falla. Rutas sin escapar (`core.quotepath=off`). */
async function git($: any, base: string, args: string[]): Promise<string | null> {
  try {
    const result = await $.process.run(['git', '-c', 'core.quotepath=off', ...args], { cwd: base })

    return result.exitCode === 0 ? String(result.stdout) : null
  } catch {
    return null
  }
}

/**
 * Ficheros nuevos, modificados y eliminados del árbol de trabajo frente a un commit (incluye lo commiteado, lo que
 * aún no y lo no seguido por git). Sin commit de referencia, todos los ficheros de git cuentan como nuevos.
 */
async function changesSince($: any, base: string, commit: string): Promise<{ added: Set<string>; changed: Set<string>; removed: Set<string> }> {
  const added = new Set<string>()
  const changed = new Set<string>()
  const removed = new Set<string>()
  if (commit === '') {
    lines(await git($, base, ['ls-files'])).forEach(path => added.add(path))
  } else {
    for (const line of lines(await git($, base, ['diff', '--name-status', '-M', commit]))) {
      const [code = '', first = '', second = ''] = line.split('\t')
      const status = code.charAt(0)
      if (status === 'A') {
        added.add(first)
      } else if (status === 'D') {
        removed.add(first)
      } else if (status === 'R') {
        removed.add(first)
        added.add(second)
      } else if (status === 'C') {
        added.add(second)
      } else {
        changed.add(first)
      }
    }
  }
  lines(await git($, base, ['ls-files', '--others', '--exclude-standard'])).forEach(path => added.add(path))

  return { added, changed, removed }
}

/**
 * Calcula con git qué ha cambiado en el proyecto desde el último commit que tocó el README, sin guardar nada: así
 * vale en cualquier clon del repositorio. Si el README tiene cambios sin commitear, solo cuentan los ficheros
 * modificados después de editarlo (lo anterior se supone ya aplicado). Cuesta unas pocas llamadas a git.
 */
async function scanReadme($: any, base: string, now: number): Promise<void> {
  if ((await git($, base, ['rev-parse', '--is-inside-work-tree'])) === null) {
    await update($, readme, () => ({ isGit: false, syncedAt: 0, syncedCommit: '', added: [], changed: [], removed: [] }))

    return
  }
  const last = ((await git($, base, ['log', '-1', '--format=%H %ct', '--', 'README.md'])) ?? '').trim().split(' ')
  const syncedCommit = last[0] ?? ''
  const syncedAt = syncedCommit === '' ? 0 : Number(last[1]) * 1000

  const { added, changed, removed } = await changesSince($, base, syncedCommit)

  const isReadmeDirty = added.has('README.md') || changed.has('README.md')
  let readmeAt = 0
  if (isReadmeDirty) {
    try {
      readmeAt = (await $.fs.stat(`${base}/README.md`)).mtimeMs
    } catch {
      readmeAt = 0
    }
  }
  const pick = async (paths: Set<string>): Promise<string[]> => {
    const out: string[] = []
    for (const path of [...paths].filter(isTracked)) {
      if (!isReadmeDirty) {
        out.push(path)
      } else {
        try {
          if ((await $.fs.stat(`${base}/${path}`)).mtimeMs > readmeAt) {
            out.push(path)
          }
        } catch {
          // Sin fecha: no se puede saber si es posterior al README, así que no se anota.
        }
      }
    }

    return out.sort()
  }
  const state: ReadmeState = {
    isGit: true,
    syncedAt,
    syncedCommit,
    added: await pick(added),
    changed: await pick(changed),
    removed: isReadmeDirty ? [] : [...removed].filter(isTracked).sort(),
  }
  await update($, readme, () => state)

  // Recordatorio sin gasto de tokens: un aviso en pantalla cada pocas horas mientras haya algo pendiente.
  if (needsReadme(state) && now - lastRemindAt >= REMIND_EVERY) {
    lastRemindAt = now
    $.ui.toast(`README: ${pendingCount(state)} ficheros cambiados (${relevantPaths(state).length} relevantes) desde su última actualización. Abre /cliso-tracker para pedir que se actualice.`, {
      timeoutMs: 8000,
    })
  }
}

const pendingCount = (s: ReadmeState): number => s.added.length + s.changed.length + s.removed.length

// Ficheros que, al modificarse, suelen cambiar lo que cuenta el README (dependencias, configuración, esquema, diseños, documentos).
const README_RELEVANT = /(^|\/)(package\.json|angular\.json|settings\.json|requirements[^/]*\.txt|[^/]*schema[^/]*\.sql|[^/]*\.drawio|[^/]*\.md)$/i
// Si se modifican tantos ficheros de código, se aconseja revisar el README aunque ninguno sea de los anteriores.
const MINOR_LIMIT = 10

/** Cambios con probabilidad de afectar al README: ficheros nuevos, borrados o renombrados, y modificados de configuración o documentación. */
const relevantPaths = (s: ReadmeState): string[] => [
  ...s.added,
  ...s.removed,
  ...s.changed.filter(path => README_RELEVANT.test(path)),
]

/** Si conviene actualizar el README según lo cambiado: hay cambios relevantes o se han tocado muchos ficheros. */
const needsReadme = (s: ReadmeState): boolean => s.isGit && (relevantPaths(s).length > 0 || s.changed.length >= MINOR_LIMIT)

const listFiles = (label: string, paths: string[]): string =>
  paths.length === 0
    ? ''
    : ` ${label}: ${paths.slice(0, MAX_LISTED).join(', ')}${paths.length > MAX_LISTED ? ` (y ${paths.length - MAX_LISTED} más)` : ''}.`

/** Petición a Claude para que actualice el README con lo cambiado y con lo que hay en el proyecto. */
function readmePrompt(state: ReadmeState): string {
  const changes =
    pendingCount(state) === 0
      ? 'Git no muestra cambios desde la última actualización; revisa igualmente que el README coincida con el proyecto.'
      : `Cambios desde entonces según git:${listFiles('nuevos', state.added)}${listFiles('modificados', state.changed)}${listFiles('eliminados', state.removed)}`

  return [
    'Actualiza el README del proyecto para que refleje todo lo que existe ahora en el proyecto.',
    'Revisa el código y la documentación reales, no te limites a las notas. Sigue las directrices de .ai/directrices.md.',
    state.syncedCommit === ''
      ? 'El README nunca se ha commiteado.'
      : `README actualizado por última vez: ${stamp(state.syncedAt)} (commit ${state.syncedCommit.slice(0, 7)}).`,
    changes,
    'Primero decide si esos cambios obligan a tocar el README (estructura de carpetas, funcionalidades, tecnologías, ejecución). Si no hace falta, dilo y no cambies nada.',
  ].join('\n')
}

/** Calcula los cambios pendientes al momento y le pide a Claude que actualice el README. */
async function requestReadme($: any): Promise<void> {
  if (base === null) {
    return
  }
  await scanReadme($, base, await $.clock.now())
  const state = await read($, readme)
  if (state !== null && state.isGit) {
    void $.prompt.submit({ text: readmePrompt(state) })
  }
}

// Lo que entra en cada imagen o en la configuración de Docker: al cambiar, hay que reconstruir o revisar.
const DOCKER_API = /^Cliso\.API\/(app\/.*|requirements\.txt)$/
const DOCKER_UI = /^Cliso\.UI\/(src\/.*|public\/.*|package(-lock)?\.json|angular\.json|tsconfig[^/]*\.json)$/
// Parámetros de arranque: si cambian, puede que haya que reflejarlos en los settings.docker*.json.
const DOCKER_CONFIG = /^Cliso\.API\/(settings\.json|app\/config\/.*)$/
// Máximo de ficheros que se nombran por categoría en el panel.
const MAX_SHOWN = 5

/** Si un cambio puede afectar a Docker: no dependencias ni cachés, ni tests ni documentación (no entran en las imágenes). */
const isDockerTracked = (path: string): boolean =>
  !path.split('/').slice(0, -1).some(dir => SKIP_DIRS.has(dir)) && !/\.(spec\.ts|md)$/i.test(path)

// Script que lanza docker compose con los argumentos de cada acción (se puede usar también a mano).
const DOCKER_SCRIPT = 'Cliso.Docker\\cliso-docker.bat'
const DOCKER_TIMEOUT = 10 * 60 * 1000
// Cada cuánto se consulta el estado de los servicios mientras el panel de Docker se ha usado.
const DOCKER_REFRESH = 20 * 1000
const SETTINGS_DOCKER = /^Cliso\.Docker\/api\/settings\.docker[^/]*\.json$/

/** Ejecuta una acción de `cliso-docker.bat`; lanza el error si el script no se puede ejecutar. */
async function dockerScript($: any, action: string): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const script = `${String(base).replace(/\//g, '\\')}\\${DOCKER_SCRIPT}`
  const result = await $.process.run(['cmd.exe', '/c', script, action], { timeoutMs: DOCKER_TIMEOUT })

  return { exitCode: result.exitCode, stdout: String(result.stdout), stderr: String(result.stderr) }
}

/** Fecha (ms) de la última construcción de las imágenes de la API y la web; 0 si la imagen no existe. */
async function imageDates($: any): Promise<{ api: number; ui: number }> {
  const dates = { api: 0, ui: 0 }
  const { stdout } = await dockerScript($, 'images')
  for (const line of lines(stdout)) {
    const match = /\[([^\]]*)\]\s+(\S+)/.exec(line)
    const name = match?.[1] ?? ''
    const time = Number(match?.[2]) * 1000
    if (!Number.isNaN(time)) {
      if (/-api:/.test(name)) {
        dates.api = time
      } else if (/-ui:/.test(name)) {
        dates.ui = time
      }
    }
  }

  return dates
}

/**
 * Comprueba si las imágenes de la API y la web necesitan reconstruirse: los ficheros que entran en cada una y se han
 * modificado después de crearla. La configuración de arranque cuenta si cambió después de editar los
 * `settings.docker*.json`.
 */
async function scanDocker($: any, base: string, now: number): Promise<void> {
  const empty: DockerState = { hasDocker: true, checkedAt: now, apiBuiltAt: 0, uiBuiltAt: 0, api: [], ui: [], config: [] }
  if (!(await $.fs.exists(`${base}/Cliso.Docker`))) {
    await update($, docker, () => ({ ...empty, hasDocker: false }))

    return
  }
  const built = await imageDates($)
  const modified = new Map<string, number>()
  await walk($, base, '', modified, 0)
  let settingsAt = 0
  for (const [path, mtime] of modified) {
    if (SETTINGS_DOCKER.test(path)) {
      settingsAt = Math.max(settingsAt, mtime)
    }
  }
  const pick = (re: RegExp, since: number): string[] =>
    [...modified]
      .filter(([path, mtime]) => re.test(path) && isDockerTracked(path) && mtime > since)
      .map(([path]) => path)
      .sort()
  const state: DockerState = {
    ...empty,
    apiBuiltAt: built.api,
    uiBuiltAt: built.ui,
    api: built.api === 0 ? [] : pick(DOCKER_API, built.api),
    ui: built.ui === 0 ? [] : pick(DOCKER_UI, built.ui),
    config: pick(DOCKER_CONFIG, settingsAt),
  }
  await update($, docker, () => state)
}

/** Ficheros nombrados de una categoría, con cuántos más hay si pasan del máximo. */
const shownFiles = (paths: string[]): string =>
  paths.slice(0, MAX_SHOWN).join(', ') + (paths.length > MAX_SHOWN ? ` (y ${paths.length - MAX_SHOWN} más)` : '')

/** Si hay que reconstruir alguna imagen, construir las que faltan o revisar la configuración de Docker. */
const needsDocker = (s: DockerState): boolean =>
  s.hasDocker && (s.apiBuiltAt === 0 || s.uiBuiltAt === 0 || s.api.length + s.ui.length + s.config.length > 0)

/** Calcula al momento si las imágenes necesitan reconstruirse. */
async function checkDocker($: any): Promise<void> {
  if (base !== null) {
    try {
      await scanDocker($, base, await $.clock.now())
    } catch (error) {
      await setContainers($, { message: `No se pudo comprobar las imágenes: ${String(error)}`, isMessageError: true })
    }
  }
}

// Servicios de Docker Compose, en el orden en que se muestran.
const SERVICES = [
  { id: 'api', name: 'API' },
  { id: 'ui', name: 'Web' },
  { id: 'db', name: 'MySQL' },
]

type PsRow = { Service?: string; State?: string; Health?: string; Labels?: string; Publishers?: { PublishedPort?: number }[] }

/** Servicios que devuelve `docker compose ps --format json` (un JSON por línea, o una lista según la versión). */
function parseServices(output: string): ServiceInfo[] {
  const text = output.trim()
  const rows: PsRow[] = []
  if (text.startsWith('[')) {
    try {
      rows.push(...(JSON.parse(text) as PsRow[]))
    } catch {
      // No es un JSON válido: se muestran los servicios como parados.
    }
  } else {
    for (const line of lines(text)) {
      try {
        rows.push(JSON.parse(line) as PsRow)
      } catch {
        // Línea que no es JSON (aviso de docker): se ignora.
      }
    }
  }

  return rows.map(row => {
    const labels = row.Labels ?? ''
    const ports = (row.Publishers ?? []).map(p => p.PublishedPort ?? 0).filter(port => port > 0)

    return {
      service: row.Service ?? '',
      state: row.State ?? '',
      health: row.Health ?? '',
      ports: [...new Set(ports)],
      // Docker Desktop anota en las etiquetas el fichero de configuración montado: dice la base de datos de la API.
      database: labels.includes('settings.docker.mysql.json') ? 'mysql' : labels.includes('settings.docker.json') ? 'sqlite' : '',
    }
  })
}

/** Cambia parte del estado de los servicios del panel. */
async function setContainers($: any, patch: Partial<ContainersState>): Promise<void> {
  await update($, containers, (c: ContainersState) => ({ ...c, ...patch }))
}

let isRefreshing = false
// Se activa al usar el panel de Docker: desde entonces el estado se refresca solo.
let isWatchingDocker = false

/** Consulta qué servicios de Docker existen y la IP local del equipo. */
async function refreshContainers($: any): Promise<void> {
  if (base === null || isRefreshing) {
    return
  }
  isRefreshing = true
  isWatchingDocker = true
  try {
    const ps = await dockerScript($, 'ps')
    if (ps.exitCode !== 0) {
      const reason = lines(ps.stderr).slice(-2).join(' ')
      await setContainers($, { error: `Docker no responde: ¿está abierto Docker Desktop? ${reason}`, services: [], checkedAt: await $.clock.now() })

      return
    }
    const ip = (await dockerScript($, 'ip')).stdout.trim()
    await setContainers($, { error: '', ip, services: parseServices(ps.stdout), checkedAt: await $.clock.now() })
  } catch (error) {
    await setContainers($, { error: `No se pudo ejecutar el script de Docker: ${String(error)}`, services: [] })
  } finally {
    isRefreshing = false
  }
}

/** Lanza una acción de `cliso-docker.bat` (arrancar, detener, reconstruir) y refresca el estado al terminar. */
async function runDockerAction($: any, action: string, label: string): Promise<void> {
  if (base === null || (await read($, containers)).busy !== '') {
    return
  }
  await setContainers($, { busy: label, message: '', isMessageError: false })
  try {
    const result = await dockerScript($, action)
    // Compose escribe su progreso en la salida de error: solo se muestra si la acción falla.
    const detail = lines(result.stderr).slice(-3).join(' ').slice(0, 300)
    await setContainers($, {
      message: result.exitCode === 0 ? `✓ ${label}` : `✗ ${label}: ${detail}`,
      isMessageError: result.exitCode !== 0,
    })
  } catch (error) {
    await setContainers($, { message: `✗ ${label}: ${String(error)}`, isMessageError: true })
  } finally {
    await setContainers($, { busy: '' })
  }
  await refreshContainers($)
}

const percent = (b: Block): number =>
  b.tasks.length === 0 ? 0 : Math.round((b.tasks.filter(t => t.isDone).length / b.tasks.length) * 100)

const bar = (pct: number): string => {
  const full = Math.round(pct / 5)
  return '█'.repeat(full) + '░'.repeat(20 - full)
}

const tone = (pct: number): string => (pct < 40 ? 'red' : pct < 75 ? 'yellow' : 'green')

const stamp = (ms: number): string => new Date(ms).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'

// Raíz del proyecto Cliso; null si la sesión no está dentro de este repositorio.
let base: string | null = null
let cancel: (() => void) | undefined
let cancelDocker: (() => void) | undefined
let isStarting = false

async function findBase($: any): Promise<string | null> {
  const candidates: string[] = [await $.session.root(), await $.session.cwd()]
  for (const dir of candidates) {
    const clean = String(dir).replace(/[\\/]+$/, '')
    if (
      (await $.fs.exists(`${clean}/Cliso.API`)) &&
      (await $.fs.exists(`${clean}/Cliso.UI`)) &&
      (await $.fs.exists(`${clean}/.ai/directrices-academicas.md`))
    ) {
      return clean
    }
  }
  return null
}

async function run($: any): Promise<void> {
  if (base === null) {
    return
  }
  const now = await $.clock.now()
  const { report: fresh } = await check($, base, now)
  const stored: Report = { ...fresh, root: base }
  await $.store.set('report', stored)
  await update($, report, () => stored)
}

/** Cada hora: el progreso solo si tiene 23 h o más (o es de otro repositorio); los cambios del README, siempre (es barato). */
async function runIfStale($: any, isForced = false): Promise<void> {
  if (base === null) {
    return
  }
  const saved = (await $.store.get('report')) as Report | undefined
  const now = await $.clock.now()
  if (isForced || saved === undefined || saved.root !== base || now - saved.checkedAt >= MAX_AGE) {
    await run($)
  }
  await scanReadme($, base, now)
}

/** Arranque idempotente: lo lanzan session.start, el primer prompt y el primer dibujado del botón. */
async function start($: any): Promise<void> {
  if (base !== null || isStarting) {
    return
  }
  isStarting = true
  try {
    const found = await findBase($)
    if (found === null) {
      return
    }
    base = found
    await $.command.register({
      name: 'cliso-tracker',
      description: 'Abre el panel de Cliso (progreso del proyecto, cambios pendientes del README y control de Docker)',
    })
    const saved = (await $.store.get('report')) as Report | undefined
    if (saved !== undefined && saved.root === base) {
      await update($, report, () => saved)
    }
    // Respeta la última elección del usuario: si lo ocultó, no se vuelve a abrir solo.
    if (await read($, shown)) {
      void $.ui.open({ id: PANE, title: 'Tracker Cliso' })
    }
    await runIfStale($)
    cancel?.()
    cancel = $.clock.every(HOUR, () => {
      void runIfStale($)
    })
    cancelDocker?.()
    cancelDocker = $.clock.every(DOCKER_REFRESH, () => {
      if (isWatchingDocker) {
        void refreshContainers($)
      }
    })
  } finally {
    isStarting = false
  }
}

type Elements = { Box: any; Text: any; Button: any }

/** Fila de pestañas: la elegida se marca con el botón principal (de color) y las demás van atenuadas. */
function tabBar(el: Elements, prefix: string, items: { id: string; label: string }[], current: string, onSelect: (id: string) => void) {
  const { Box, Button } = el

  return (
    <Box gap="sm" marginBottom={1}>
      {items.map(item => (
        <Button
          key={`${prefix}-${item.id}`}
          label={item.label}
          variant={item.id === current ? 'primary' : 'secondary'}
          dimColor={item.id !== current}
          onPress={() => onSelect(item.id)}
        />
      ))}
    </Box>
  )
}

// Ancho (en celdas) del texto de un tooltip; el cuadro mide 4 más por el borde y el relleno.
const TIP_WIDTH = 34

/** Tooltip: un cuadro con la explicación que aparece sobre el botón al pasar el puntero (`offset`: celdas a la izquierda del botón). */
function withTip(el: Elements, id: string, text: string, offset: number, button: any) {
  const { Box, Text } = el
  const textLines = Math.ceil(text.length / TIP_WIDTH)

  return (
    <Box key={`tip-${id}`}>
      {button}
      <Box
        position="absolute"
        top={-(textLines + 2)}
        left={-offset}
        display="none"
        hover={{ display: 'flex' }}
        width={TIP_WIDTH + 4}
        borderStyle="round"
        borderColor="gray"
        backgroundColor="#1f2328"
        paddingX={1}
      >
        <Text>{text}</Text>
      </Box>
    </Box>
  )
}

// Botones de la pestaña de servicios: cada grupo arranca (según la base de datos) o detiene lo suyo.
type DockerButton = { action: string; label: string; what: string; tip: string }
type DockerGroup = { name: string; starts: DockerButton[]; stop: DockerButton }
const GROUPS: DockerGroup[] = [
  {
    name: 'Todo',
    starts: [
      { action: 'up-all-sqlite', label: '▶ SQLite', what: 'Arrancar web y API con SQLite', tip: 'Arranca la web y la API con SQLite (la base de datos es un fichero en un volumen).' },
      { action: 'up-all-mysql', label: '▶ MySQL', what: 'Arrancar web, API y MySQL', tip: 'Arranca la web, la API y MySQL. La API espera a que la base de datos esté lista.' },
    ],
    stop: { action: 'stop-all', label: '■ Detener', what: 'Detener todo', tip: 'Detiene la web, la API y MySQL. Los datos se conservan.' },
  },
  {
    name: 'API',
    starts: [
      { action: 'up-api-sqlite', label: '▶ SQLite', what: 'Arrancar la API con SQLite', tip: 'Solo la API, con SQLite. Para apuntarle una web local.' },
      { action: 'up-api-mysql', label: '▶ MySQL', what: 'Arrancar la API con MySQL', tip: 'Solo la API, con MySQL. Arranca antes la base de datos y espera a que esté lista.' },
    ],
    stop: { action: 'stop-api', label: '■ Detener', what: 'Detener la API', tip: 'Detiene solo la API.' },
  },
  {
    name: 'Web',
    starts: [{ action: 'up-ui', label: '▶ Arrancar', what: 'Arrancar la web', tip: 'Solo la web (nginx). Reenvía /api a la API cuando esté arrancada.' }],
    stop: { action: 'stop-ui', label: '■ Detener', what: 'Detener la web', tip: 'Detiene solo la web.' },
  },
  {
    name: 'MySQL',
    starts: [{ action: 'up-db', label: '▶ Arrancar', what: 'Arrancar MySQL', tip: 'Solo la base de datos MySQL, accesible desde este equipo en el puerto 3307.' }],
    stop: { action: 'stop-db', label: '■ Detener', what: 'Detener MySQL', tip: 'Detiene solo MySQL. Los datos se conservan en su volumen.' },
  },
]

/** Estado de un servicio: parado o arrancado, con la dirección a la que apuntar (la IP local, no localhost). */
function serviceLine(el: Elements, service: { id: string; name: string }, c: ContainersState) {
  const { Box, Text } = el
  const found = c.services.find(s => s.service === service.id)
  const isUp = found !== undefined && found.state !== 'exited' && found.state !== 'created' && found.state !== 'dead'
  let status = '○ parada'
  let color = 'gray'
  if (isUp && found !== undefined) {
    if (found.state === 'restarting' || found.health === 'starting') {
      status = '◐ arrancando'
      color = 'yellow'
    } else if (found.health === 'unhealthy') {
      status = '● no sana'
      color = 'red'
    } else {
      status = found.health === 'healthy' ? '● arrancada · sana' : '● arrancada'
      color = 'green'
    }
  }
  const database = isUp && service.id === 'api' ? found?.database : ''
  const port = found?.ports[0]
  let address = ''
  if (isUp && port !== undefined) {
    address = service.id === 'db' ? `127.0.0.1:${port} (solo este equipo)` : `http://${c.ip === '' ? 'localhost' : c.ip}:${port}`
  }

  return (
    <Box key={`service-${service.id}`} borderStyle="round" borderColor={color} paddingX="sm" flexDirection="column">
      <Box gap="sm">
        <Box width={7}>
          <Text bold>{service.name}</Text>
        </Box>
        <Text color={color}>{status}</Text>
        {database !== undefined && database !== '' && <Text dimColor>· {database === 'mysql' ? 'MySQL' : 'SQLite'}</Text>}
      </Box>
      {address !== '' && <Text color="cyan">{address}</Text>}
    </Box>
  )
}

/** Subpanel de arrancar y detener: una fila por grupo, con sus botones. */
function servicesPanel($: any, el: Elements) {
  const { Box, Text, Button } = el
  // Columna del nombre del grupo y ancho de cada botón, en celdas: sirven para alinear el tooltip con el borde del panel.
  const NAME_WIDTH = 8
  const BUTTON_WIDTH = 13
  const button = (item: DockerButton, variant: string, index: number) =>
    withTip(
      el,
      item.action,
      item.tip,
      NAME_WIDTH + index * BUTTON_WIDTH,
      <Button key={item.action} label={item.label} variant={variant} onPress={() => runDockerAction($, item.action, item.what)} />
    )

  return (
    <Box flexDirection="column" gap="sm">
      {GROUPS.map(group => (
        <Box key={`group-${group.name}`} gap="sm" alignItems="center">
          <Box width={NAME_WIDTH}>
            <Text bold>{group.name}</Text>
          </Box>
          {group.starts.map((start, index) => button(start, 'primary', index))}
          {button(group.stop, 'secondary', group.starts.length)}
        </Box>
      ))}
    </Box>
  )
}

/** Subpanel de imágenes: si hay que reconstruirlas y el botón para hacerlo. */
function imagesPanel($: any, el: Elements, state: DockerState | null) {
  const { Box, Text, Button } = el
  const imageLine = (name: string, builtAt: number, files: string[]) => (
    <Text color={builtAt === 0 || files.length > 0 ? 'yellow' : 'green'}>
      {builtAt === 0
        ? `Imagen de ${name}: sin construir (se construye al arrancarla)`
        : files.length === 0
          ? `Imagen de ${name}: al día (construida ${stamp(builtAt)})`
          : `Imagen de ${name}: reconstruir (${files.length}): ${shownFiles(files)}`}
    </Text>
  )

  return (
    <Box flexDirection="column">
      {state === null ? (
        <Text dimColor>Sin comprobar todavía.</Text>
      ) : !state.hasDocker ? (
        <Text color="yellow">No existe la carpeta Cliso.Docker.</Text>
      ) : (
        <Box flexDirection="column">
          <Text dimColor>Comprobado: {stamp(state.checkedAt)}</Text>
          {imageLine('la API', state.apiBuiltAt, state.api)}
          {imageLine('la web', state.uiBuiltAt, state.ui)}
          <Text color={state.config.length === 0 ? 'green' : 'yellow'}>
            {state.config.length === 0
              ? 'Configuración de arranque: sin cambios'
              : `Configuración de arranque: revisa los settings.docker*.json (${state.config.length}): ${shownFiles(state.config)}`}
          </Text>
          <Text color={needsDocker(state) ? 'yellow' : 'green'}>
            {needsDocker(state) ? 'Las imágenes necesitan actualizarse: reconstruye y arranca de nuevo.' : 'Las imágenes están al día.'}
          </Text>
        </Box>
      )}
      <Box gap="sm" marginTop={1}>
        {withTip(
          el,
          'check-docker',
          'Mira si hay ficheros modificados después de construir cada imagen.',
          0,
          <Button key="check-docker" label="Comprobar" variant="primary" onPress={() => checkDocker($)} />
        )}
        {withTip(
          el,
          'build-docker',
          'Reconstruye las imágenes de la API y la web. Después, arranca de nuevo los servicios para usarlas.',
          14,
          <Button key="build-docker" label="Reconstruir imágenes" variant="secondary" onPress={() => runDockerAction($, 'build', 'Reconstruir las imágenes')} />
        )}
      </Box>
    </Box>
  )
}

/** Pestaña de Docker: estado de los servicios arriba y, debajo, las subpestañas Servicios e Imágenes. */
function dockerPane($: any, el: Elements, c: ContainersState, state: DockerState | null, sub: string) {
  const { Box, Text, Button } = el
  const checked = c.checkedAt === 0 ? 'sin comprobar' : new Date(c.checkedAt).toTimeString().slice(0, 8)

  return (
    <Box flexDirection="column" gap="xs">
      <Box gap="sm" alignItems="center" justifyContent="space-between">
        <Box flexDirection="column">
          <Text bold>Docker</Text>
          <Box gap="xs">
            <Text dimColor>IP local</Text>
            <Text bold color="cyan">{c.ip === '' ? 'sin red' : c.ip}</Text>
            <Text dimColor>· {checked}</Text>
          </Box>
        </Box>
        <Button key="refresh-docker" label="Actualizar" variant="secondary" onPress={() => refreshContainers($)} />
      </Box>
      {c.error !== '' && <Text color="red">{c.error}</Text>}
      {SERVICES.map(service => serviceLine(el, service, c))}
      {c.busy !== '' && <Text color="yellow">… {c.busy} (puede tardar unos minutos)</Text>}
      {c.message !== '' && <Text color={c.isMessageError ? 'red' : 'green'}>{c.message}</Text>}
      <Box marginTop={1} flexDirection="column">
        {tabBar(
          el,
          'docker-tab',
          [
            { id: 'services', label: 'Servicios' },
            { id: 'images', label: 'Imágenes' },
          ],
          sub,
          id => update($, dockerTab, () => id)
        )}
        {sub === 'images' ? imagesPanel($, el, state) : servicesPanel($, el)}
      </Box>
    </Box>
  )
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await start($)

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    await start($)

    return next(e)
  })

  on('command.run', { command: 'cliso-tracker' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Tracker Cliso' })
    await update($, shown, () => true)

    return { text: 'Panel de Cliso abierto.' }
  })

  // Botón discreto sobre el prompt para mostrar/ocultar el panel.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // Leer el informe suscribe este dibujado: cuando el arranque termina, el botón aparece.
    await read($, report)
    if (base === null) {
      void start($)
    }
    if (base === null || e.props.hasSurvey) {
      return next(e)
    }
    const { Box, Button, Svg, Text } = $.ui.resolve(e) as any
    const isShown = await read($, shown)
    const readmeNow = await read($, readme)
    const isReadmeDue = readmeNow !== null && needsReadme(readmeNow)
    // El logo se dibuja donde hay vectores (escritorio, VS Code, móvil); en terminal se usa un rombo.
    const hasLogo = Svg !== undefined

    return (
      <Box>
        {hasLogo && <Svg key="logo" source={LOGO} alt="Logo de Cliso" width={18} height={18} />}
        <Button
          key="toggle-progress"
          label={`${hasLogo ? ' ' : '◆ '}${isShown ? 'Ocultar tracker' : 'Mostrar tracker'}`}
          onPress={async () => {
            if (isShown) {
              await $.ui.close({ id: PANE })
            } else {
              await $.ui.open({ id: PANE, title: 'Tracker Cliso' })
            }
            await update($, shown, () => !isShown)
          }}
        />
        {isReadmeDue && <Text color="yellow"> · README: conviene actualizarlo</Text>}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const current = await read($, report)
    const expanded = await read($, open)
    const readmeState = await read($, readme)
    const dockerState = await read($, docker)
    const containersState = await read($, containers)
    const currentTab = await read($, tab)
    const currentDockerTab = await read($, dockerTab)
    const isProgress = currentTab !== 'docker'

    if (isProgress && current === null) {
      return <Text dimColor>Calculando el progreso del proyecto…</Text>
    }
    // La primera vez que se abre la pestaña de Docker se consultan los servicios.
    if (!isProgress && containersState.checkedAt === 0 && containersState.error === '') {
      void refreshContainers($)
    }
    const tabs = tabBar(
      { Box, Text, Button },
      'tab',
      [
        { id: 'progress', label: 'Progreso' },
        { id: 'docker', label: 'Docker' },
      ],
      currentTab,
      id => update($, tab, () => id)
    )

    if (!isProgress || current === null) {
      return (
        <Box flexDirection="column">
          {tabs}
          {dockerPane($, { Box, Text, Button }, containersState, dockerState, currentDockerTab)}
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        {tabs}
        <Text dimColor>
          Última comprobación: {stamp(current.checkedAt)} · siguiente antes de {stamp(current.checkedAt + 24 * HOUR)}
        </Text>
        <Button key="refresh" label="Comprobar ahora" onPress={() => runIfStale($, true)} />
        <Box flexDirection="column" marginTop={1}>
          <Text bold>README</Text>
          {readmeState === null ? (
            <Text dimColor>Calculando los cambios pendientes…</Text>
          ) : !readmeState.isGit ? (
            <Text color="yellow">La carpeta no es un repositorio git: no se pueden calcular los cambios pendientes.</Text>
          ) : (
            <Box flexDirection="column">
              <Text dimColor>
                README actualizado: {readmeState.syncedAt === 0 ? 'nunca' : stamp(readmeState.syncedAt)}
              </Text>
              <Text color={pendingCount(readmeState) === 0 ? 'green' : 'yellow'}>
                Ficheros cambiados desde entonces: {pendingCount(readmeState)} ({readmeState.added.length} nuevos,{' '}
                {readmeState.changed.length} modificados, {readmeState.removed.length} eliminados)
              </Text>
              <Text color={needsReadme(readmeState) ? 'yellow' : 'green'}>
                {needsReadme(readmeState)
                  ? `Conviene actualizar el README: ${relevantPaths(readmeState).length} cambios relevantes`
                  : 'No hace falta actualizar el README por ahora'}
              </Text>
            </Box>
          )}
          <Button key="update-readme" label="Pedir a Claude que actualice el README" onPress={() => requestReadme($)} />
        </Box>
        {current.blocks.map(block => {
          const pct = percent(block)
          const done = block.tasks.filter(t => t.isDone)
          const pending = block.tasks.filter(t => !t.isDone)
          const isOpen = expanded[block.id] === true

          return (
            <Box key={block.id} flexDirection="column" marginTop={1}>
              <Button
                key={`toggle-${block.id}`}
                label={`${isOpen ? '▾' : '▸'} ${block.title}`}
                onPress={() => update($, open, o => ({ ...o, [block.id]: !(o[block.id] === true) }))}
              />
              <Text color={tone(pct)}>
                {bar(pct)} {pct}% ({done.length}/{block.tasks.length})
              </Text>
              {isOpen && (
                <Box flexDirection="column" marginLeft={2}>
                  <Text bold>Pendientes ({pending.length})</Text>
                  {pending.length === 0 && <Text dimColor>Nada pendiente.</Text>}
                  {pending.map(t => (
                    <Text key={t.label} color="red">○ {t.label}</Text>
                  ))}
                  <Text bold>Completadas ({done.length})</Text>
                  {done.length === 0 && <Text dimColor>Nada completado todavía.</Text>}
                  {done.map(t => (
                    <Text key={t.label} color="green">✓ {t.label}</Text>
                  ))}
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    )
  })
}
