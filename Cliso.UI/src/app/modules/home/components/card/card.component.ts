import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';

/** Ficha de un modelo BIM: su imagen, su nombre y su descripción. Avisa cuando se pulsa. */
@Component({
	selector: 'app-home-card',
	imports: [MatCardModule, MatTooltipModule],
	templateUrl: './card.component.html',
	styleUrl: './card.component.scss'
})
export class HomeCardComponent implements OnDestroy {
	//#region DECORATORS

	/** Modelo BIM que representa la ficha. */
	@Input() public Model: BimModel = new BimModel(
		ID_NUMERIC_UNDEFINED,
		STRING_UNDEFINED,
		STRING_UNDEFINED,
		STRING_UNDEFINED,
		STRING_UNDEFINED,
		0
	);

	/** Se emite con el modelo cuando se pulsa la ficha. */
	@Output() public selected: EventEmitter<BimModel> = new EventEmitter<BimModel>();

	//#endregion DECORATORS

	//#region PUBLIC PROPERTIES

	/** Imagen de la ficha mientras el modelo no tenga portada. */
	public ModelIcon: string = IconsUtils.GetUrl(IconName.DEPLOYED_CODE);

	//#endregion PUBLIC PROPERTIES

	//#region EMITTERS

	private emitSelected(): void {
		this.selected.emit(this.Model);
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		this.selected.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnCardClicked(): void {
		this.emitSelected();
	}

	//#endregion SUBSCRIBERS
}
