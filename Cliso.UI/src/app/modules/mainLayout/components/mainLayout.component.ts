import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from 'src/app/modules/sidebar/components/sidebar.component';

/** Estructura de las pantallas con sesión: la barra lateral y, a su lado, la pantalla de cada ruta. */
@Component({
	selector: 'app-main-layout',
	imports: [RouterOutlet, SidebarComponent],
	templateUrl: './mainLayout.component.html',
	styleUrl: './mainLayout.component.scss'
})
export class MainLayoutComponent {}
