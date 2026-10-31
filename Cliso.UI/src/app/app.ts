import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from 'src/app/modules/sidebar/components/sidebar.component';

/** Componente raíz de la aplicación: la barra lateral y, a su lado, la pantalla de cada ruta. */
@Component({
	selector: 'app-root',
	imports: [RouterOutlet, SidebarComponent],
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App {}
