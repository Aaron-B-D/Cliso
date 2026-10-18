"""Cliso.API: API REST de la aplicación Cliso, organizada con arquitectura hexagonal (puertos y adaptadores).

El núcleo (`domain` y `application`) no depende de nada externo; los `adapters` conectan ese núcleo con el exterior.
`main.py` es la raíz de composición: elige los adaptadores y los conecta.
"""
