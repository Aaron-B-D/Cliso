"""Adaptador REST (FastAPI): endpoints HTTP, DTOs y mappers. Todo se importa desde este namespace.

El orden de los imports importa: primero los DTOs, luego los mappers (que usan los DTOs), luego los handlers de
excepciones y por último los routers (que usan los DTOs y los mappers).
"""

from app.adapters.inbound.rest.dtos import (
	ApplicationSettingParameterDto,
	ApplicationSettingsDto,
	BIMModelDto,
	UserCredentialsDto,
	UserDto,
	VisualizationDto,
);
from app.adapters.inbound.rest.mappers import (
	ApplicationSettingsMapper,
	BIMModelMapper,
	UserMapper,
	VisualizationMapper,
);
from app.adapters.inbound.rest.exception_handlers import ExceptionHandlers;
from app.adapters.inbound.rest.system_router import SystemRouter;
from app.adapters.inbound.rest.user_router import UserRouter;

__all__ = [
	"ApplicationSettingParameterDto",
	"ApplicationSettingsDto",
	"ApplicationSettingsMapper",
	"BIMModelDto",
	"BIMModelMapper",
	"ExceptionHandlers",
	"SystemRouter",
	"UserCredentialsDto",
	"UserDto",
	"UserMapper",
	"UserRouter",
	"VisualizationDto",
	"VisualizationMapper",
];
