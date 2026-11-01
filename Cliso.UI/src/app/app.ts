import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Componente raíz de la aplicación: muestra la pantalla de la ruta actual. */
@Component({
	selector: 'app-root',
	imports: [RouterOutlet],
	templateUrl: './app.html'
})
export class App {}
