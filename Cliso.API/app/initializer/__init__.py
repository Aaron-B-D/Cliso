"""Preparación de la base de datos al arrancar, con sus datos básicos y los de demostración."""

from app.initializer.demo_data import DemoData;
from app.initializer.database_initializer import DatabaseInitializer;

__all__ = ["DatabaseInitializer", "DemoData"];
