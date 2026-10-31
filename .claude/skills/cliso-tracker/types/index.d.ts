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

declare module 'claude-code' {
  interface PluginState {
    'cliso-tracker': {
      report: Shaped<Report | null>;
      open: Shaped<Record<string, boolean>>;
      shown: Shaped<boolean>;
      readme: Shaped<ReadmeState | null>;
    };
  }
}
