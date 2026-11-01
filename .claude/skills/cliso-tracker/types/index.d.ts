/** Una tarea comprobada: su texto y si se cumple. */
export type Task = { label: string; isDone: boolean };

/** Un bloque del panel (back, front o requisitos académicos). */
export type Block = { id: string; title: string; tasks: Task[] };

/** Resultado de una comprobación completa del proyecto (`root`: el repositorio al que corresponde). */
export type Report = { checkedAt: number; blocks: Block[]; root?: string };

/**
 * Cambios del proyecto pendientes de pasar al README, calculados con git desde el último commit que tocó el README
 * (rutas relativas). `isGit` es false si la carpeta no es un repositorio: entonces no se puede anotar nada.
 */
export type ReadmeState = {
  isGit: boolean;
  syncedAt: number;
  syncedCommit: string;
  added: string[];
  changed: string[];
  removed: string[];
};

/**
 * Resultado de comprobar si las imágenes de Docker necesitan reconstruirse (rutas relativas): `api` y `ui` son los
 * ficheros modificados después de construir cada imagen (`apiBuiltAt` y `uiBuiltAt`, 0 si la imagen no existe) y
 * `config` los de configuración de arranque cambiados después de editar los `settings.docker*.json`. `hasDocker` es
 * false si no existe la carpeta `Cliso.Docker`.
 */
export type DockerState = {
  hasDocker: boolean;
  checkedAt: number;
  apiBuiltAt: number;
  uiBuiltAt: number;
  api: string[];
  ui: string[];
  config: string[];
};

/**
 * Un servicio de Docker Compose tal y como lo ve `docker compose ps`: `state` (running, exited...), `health`
 * (healthy, unhealthy, starting o vacío), los puertos publicados en el equipo y, solo para la API, la base de datos
 * que usa (`sqlite`, `mysql` o vacío si no se sabe) y si el contenedor se creó con una imagen que ya no es la actual
 * (`isOutdated`: se reconstruyó la imagen después de crearlo y hay que recrearlo para usar la nueva).
 */
export type ServiceInfo = { service: string; state: string; health: string; ports: number[]; database: string; isOutdated: boolean };

/**
 * Estado de los servicios de Docker del panel: los que existen, la IP local del equipo, la operación en curso
 * (`busy`, vacío si no hay ninguna, y cuándo empezó, `busySince`), el reloj que la barra de espera usa para avanzar
 * (`now`), el resultado de la última operación (`message`) y el error al consultar Docker (`error`).
 */
export type ContainersState = {
  checkedAt: number;
  ip: string;
  services: ServiceInfo[];
  busy: string;
  busySince: number;
  now: number;
  message: string;
  isMessageError: boolean;
  error: string;
};

declare module 'claude-code' {
  interface PluginState {
    'cliso-tracker': {
      report: Shaped<Report | null>;
      open: Shaped<Record<string, boolean>>;
      shown: Shaped<boolean>;
      readme: Shaped<ReadmeState | null>;
      docker: Shaped<DockerState | null>;
      containers: Shaped<ContainersState>;
      tab: Shaped<string>;
      dockerTab: Shaped<string>;
    };
  }
}
