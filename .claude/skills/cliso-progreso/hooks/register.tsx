import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Block, ReadmeState, Report, Task } from '../types'
// Los cambios del README se calculan con git, sin guardar nada por usuario: así valen en cualquier clon del repositorio.

const PANE = 'cliso-progreso'
const HOUR = 60 * 60 * 1000
// Se recalcula si el último informe tiene 23 h o más; con un tic cada hora, nunca pasan más de 24 h.
const MAX_AGE = 23 * HOUR
// Cambia la etiqueta si cambian los campos: descarta lo guardado por una versión anterior.
const report = atom({ plugin: 'cliso-progreso', key: 'report' } as const, null, { shape: 'report-1' })
const open = atom({ plugin: 'cliso-progreso', key: 'open' } as const, {}, { shape: 'open-1' })

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
const shown = atom({ plugin: 'cliso-progreso', key: 'shown' } as const, true, { shape: 'shown-1' })

// Estado del README: cuándo se actualizó por última vez y los cambios pendientes de pasarle (calculados con git).
const readme = atom({ plugin: 'cliso-progreso', key: 'readme' } as const, null, { shape: 'readme-2' })

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
    blocks.push({ id, title: TITLES[id], tasks })
  }
  return { report: { checkedAt: now, blocks }, modified }
}

/** Cada cuánto se recuerda al usuario, mientras haya cambios sin pasar al README. */
const REMIND_EVERY = 3 * HOUR
let lastRemindAt = 0

/** Si un cambio cuenta para el README: no el propio README, ni dependencias, cachés o ficheros de herramientas. */
const isTracked = (path: string): boolean => {
  const parts = path.split('/')
  const name = parts[parts.length - 1]

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

  const added = new Set<string>()
  const changed = new Set<string>()
  const removed = new Set<string>()
  if (syncedCommit === '') {
    lines(await git($, base, ['ls-files'])).forEach(path => added.add(path))
  } else {
    // Árbol de trabajo frente al commit del README: incluye lo commiteado y lo que aún no.
    for (const line of lines(await git($, base, ['diff', '--name-status', '-M', syncedCommit]))) {
      const parts = line.split('\t')
      const status = parts[0].charAt(0)
      if (status === 'A') {
        added.add(parts[1])
      } else if (status === 'D') {
        removed.add(parts[1])
      } else if (status === 'R') {
        removed.add(parts[1])
        added.add(parts[2])
      } else if (status === 'C') {
        added.add(parts[2])
      } else {
        changed.add(parts[1])
      }
    }
  }
  lines(await git($, base, ['ls-files', '--others', '--exclude-standard'])).forEach(path => added.add(path))

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
  const pending = pendingCount(state)
  if (pending > 0 && now - lastRemindAt >= REMIND_EVERY) {
    lastRemindAt = now
    $.ui.toast(`README: ${pending} ficheros cambiados desde su última actualización. Abre /cliso-progreso para pedir que se actualice.`, {
      timeoutMs: 8000,
    })
  }
}

const pendingCount = (s: ReadmeState): number => s.added.length + s.changed.length + s.removed.length

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
      name: 'cliso-progreso',
      description: 'Abre el panel de progreso de Cliso (back, front y requisitos académicos)',
    })
    const saved = (await $.store.get('report')) as Report | undefined
    if (saved !== undefined && saved.root === base) {
      await update($, report, () => saved)
    }
    // Respeta la última elección del usuario: si lo ocultó, no se vuelve a abrir solo.
    if (await read($, shown)) {
      void $.ui.open({ id: PANE, title: 'Progreso Cliso' })
    }
    await runIfStale($)
    cancel?.()
    cancel = $.clock.every(HOUR, () => {
      void runIfStale($)
    })
  } finally {
    isStarting = false
  }
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

  on('command.run', { command: 'cliso-progreso' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Progreso Cliso' })
    await update($, shown, () => true)

    return { text: 'Panel de progreso de Cliso abierto.' }
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
    const pending = readmeNow !== null && readmeNow.isGit ? pendingCount(readmeNow) : 0
    // El logo se dibuja donde hay vectores (escritorio, VS Code, móvil); en terminal se usa un rombo.
    const hasLogo = Svg !== undefined

    return (
      <Box>
        {hasLogo && <Svg key="logo" source={LOGO} alt="Logo de Cliso" width={18} height={18} />}
        <Button
          key="toggle-progress"
          label={`${hasLogo ? ' ' : '◆ '}${isShown ? 'Ocultar progreso' : 'Mostrar progreso'}`}
          onPress={async () => {
            if (isShown) {
              await $.ui.close({ id: PANE })
            } else {
              await $.ui.open({ id: PANE, title: 'Progreso Cliso' })
            }
            await update($, shown, () => !isShown)
          }}
        />
        {pending > 0 && <Text color="yellow"> · README: {pending} cambios pendientes</Text>}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const current = await read($, report)
    const expanded = await read($, open)
    const readmeState = await read($, readme)

    if (current === null) {
      return <Text dimColor>Calculando el progreso del proyecto…</Text>
    }

    return (
      <Box flexDirection="column">
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
