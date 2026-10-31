import { CanActivateFn } from '@angular/router';

/**
 * Decide si se puede entrar en una ruta protegida. Mientras no haya inicio de sesión, deja pasar siempre.
 * Es una función porque así lo exige `CanActivateFn`: es la única función suelta permitida del proyecto.
 */
export const AuthGuard: CanActivateFn = (): boolean => true;
