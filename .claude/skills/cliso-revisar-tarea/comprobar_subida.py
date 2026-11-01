"""Comprobaciones automáticas de la subida de una tarea de Cliso. Solo lectura: no modifica ni crea nada.

Uso, desde la raíz del repositorio:

	python .claude/skills/cliso-revisar-tarea/comprobar_subida.py <fichero> [<fichero> ...]
	python .claude/skills/cliso-revisar-tarea/comprobar_subida.py --todo

Los ficheros se dan con ruta relativa a la raíz del repositorio (los del diff y los nuevos sin seguimiento).
Con `--todo` se comprueban todos. Solo se informa de lo que afecte a esos ficheros.

Qué comprueba (según el tipo de fichero):
	- Back (Cliso.API/app/*.py): las normas de estilo de .ai/directrices-back.md que se pueden comprobar sin ejecutar
	  nada (tabuladores, punto y coma, returns tempranos, !r, regiones, docstrings, una clase por fichero, imports de
	  máximo 3 capas, dirección de las dependencias, constantes públicas sin uso, etc.).
	- Esquema de la base de datos: que sqlite_schema.sql, mysql_schema.sql y el diagrama tengan las mismas tablas y columnas.
	- Dependencias del back: que todo lo que se importa de fuera esté en requirements.txt.
	- Front (Cliso.UI/src): las normas de .ai/directrices-front.md que se pueden detectar con una búsqueda de texto
	  (importes relativos, ::ng-deep, console.log, any, HACK, colores sueltos, sombras, max-width, SVG...).
	  Es una ayuda: lo que no puede ver (ng build, npm run lint) lo ejecuta quien revisa.
	- Limpieza: restos de pruebas (data/, logs/, __pycache__, dist/...), README tocado y credenciales en settings.json.

Cada línea de la salida es `[ERROR]` (incumple una norma) o `[AVISO]` (heurística o información, a valorar).
"""

import ast
import io
import json
import re
import sys
import tokenize
import xml.etree.ElementTree as ElementTree
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
API = ROOT / "Cliso.API"
APP = API / "app"
UI = ROOT / "Cliso.UI"
DATABASE_DIAGRAM = ROOT / "Documentation" / "Database" / "[Diseño] Cliso.API - Base de datos.drawio"
SQLITE_SCHEMA = APP / "adapters" / "outbound" / "persistence" / "sqlite" / "sqlite_schema.sql"
MYSQL_SCHEMA = APP / "adapters" / "outbound" / "persistence" / "mysql" / "mysql_schema.sql"

REGION_ORDER = [
	"PUBLIC CONSTANTS",
	"PRIVATE CONSTANTS",
	"PUBLIC STATIC PROPERTIES",
	"PRIVATE STATIC PROPERTIES",
	"PUBLIC PROPERTIES",
	"PRIVATE PROPERTIES",
	"CONSTRUCTOR",
	"PUBLIC METHODS",
	"PUBLIC STATIC METHODS",
	"PRIVATE METHODS",
	"PRIVATE STATIC METHODS",
]

# Lo que las propias directrices aceptan expresamente y no debe salir como incumplimiento.
ACCEPTED = {
	("Cliso.API/app/main.py", "yield"): "el lifespan de FastAPI lo exige",
	("Cliso.API/app/domain/wrappers/__init__.py", "carpeta con una sola clase"): "excepción acordada: wrappers/",
}

findings: list[tuple[str, str, str, int, str]] = []  # (nivel, regla, ruta, línea, mensaje)


def add(level: str, rule: str, path: Path | str, line: int, message: str) -> None:
	relative = path if isinstance(path, str) else path.relative_to(ROOT).as_posix()
	if (relative, rule) in ACCEPTED:
		return
	findings.append((level, rule, relative, line, message))


# ----------------------------------------------------------------------------------------------------------------
# Selección de ficheros
# ----------------------------------------------------------------------------------------------------------------

def select_files(arguments: list[str]) -> list[Path]:
	"""Devuelve los ficheros a comprobar: los indicados, o todos los del proyecto con `--todo`."""
	files: list[Path] = []
	if "--todo" in arguments:
		for folder in (APP, UI / "src", ROOT / "Documentation"):
			if folder.exists():
				files.extend(p for p in folder.rglob("*") if p.is_file() and not is_generated(p))
		files.extend(p for p in (API / "settings.json", API / "requirements.txt") if p.exists())
	else:
		for argument in arguments:
			path = (ROOT / argument).resolve()
			if path.is_file():
				files.append(path)
			elif not path.exists():
				print(f"(se ignora {argument}: no existe; ¿es un fichero borrado?)")
			else:
				files.extend(p for p in path.rglob("*") if p.is_file() and not is_generated(p))
	return sorted(set(files))


def is_generated(path: Path) -> bool:
	"""True si es un fichero generado que no se revisa."""
	return any(part in ("__pycache__", "node_modules", ".venv", "dist", ".angular") for part in path.parts)


def relative(path: Path) -> str:
	return path.relative_to(ROOT).as_posix()


# ----------------------------------------------------------------------------------------------------------------
# Back: normas de estilo de Python
# ----------------------------------------------------------------------------------------------------------------

def snake(name: str) -> str:
	"""Nombre de clase en PascalCase -> nombre de fichero en snake_case (SQLite, MySQL y BIM cuentan como una palabra)."""
	for original, replacement in (("SQLite", "Sqlite"), ("MySQL", "Mysql"), ("BIM", "Bim")):
		name = name.replace(original, replacement)
	return re.sub(r"(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])", "_", name).lower()


def module_name(path: Path) -> str:
	parts = list(path.relative_to(API).with_suffix("").parts)
	if parts[-1] == "__init__":
		parts = parts[:-1]
	return ".".join(parts)


def has_docstring_after(body: list[ast.stmt], index: int) -> bool:
	following = body[index + 1] if index + 1 < len(body) else None
	return (
		isinstance(following, ast.Expr)
		and isinstance(following.value, ast.Constant)
		and isinstance(following.value.value, str)
	)


def check_python(path: Path, source: str, tree: ast.Module) -> None:
	lines = source.splitlines()
	is_init = path.name == "__init__.py"
	module = module_name(path)

	# Sangría con tabuladores y comentarios por línea (para el punto y coma).
	comments: dict[int, int] = {}
	for token in tokenize.generate_tokens(io.StringIO(source).readline):
		if token.type == tokenize.INDENT and " " in token.string:
			add("ERROR", "sangría", path, token.start[0], "sangría con espacios (debe ser con tabuladores)")
		if token.type == tokenize.COMMENT:
			comments[token.start[0]] = token.start[1]

	simple = (
		ast.Expr, ast.Assign, ast.AnnAssign, ast.AugAssign, ast.Return, ast.Raise, ast.Pass, ast.Import,
		ast.ImportFrom, ast.Delete, ast.Assert, ast.Break, ast.Continue,
	)
	for node in ast.walk(tree):
		if isinstance(node, simple):
			is_docstring = (
				isinstance(node, ast.Expr)
				and isinstance(node.value, ast.Constant)
				and isinstance(node.value.value, str)
			)
			if not is_docstring:
				end = node.end_lineno or node.lineno
				text = lines[end - 1]
				if end in comments:
					text = text[: comments[end]]
				if not text.rstrip().endswith(";"):
					add("ERROR", "punto y coma", path, end, f"falta el punto y coma: {text.strip()[:60]}")

		if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
			check_function(path, node)

		if isinstance(node, (ast.Yield, ast.YieldFrom)):
			add("ERROR", "yield", path, node.lineno, "uso de yield (solo el lifespan de FastAPI)")
		if isinstance(node, ast.JoinedStr):
			for value in node.values:
				if isinstance(value, ast.FormattedValue) and value.conversion == ord("r"):
					add("ERROR", "!r", path, node.lineno, "sufijo !r en un f-string: las comillas van en el texto")
		if isinstance(node, ast.Call):
			for keyword in node.keywords:
				if keyword.arg is None:
					add("ERROR", "desempaquetado **", path, node.lineno, "** en una llamada: asigna campo a campo")
		if isinstance(node, ast.ClassDef) and not ast.get_docstring(node):
			add("ERROR", "docstring", path, node.lineno, f"la clase {node.name} no tiene docstring")

	# __init__.py: docstring de una línea y __all__.
	if is_init:
		docstring = ast.get_docstring(tree)
		if not docstring:
			add("ERROR", "__init__", path, 1, "el __init__.py no tiene docstring")
		elif "\n" in docstring.strip():
			add("ERROR", "__init__", path, 1, "el docstring del __init__.py debe ser de una línea, temática")
		has_imports = any(isinstance(n, ast.ImportFrom) for n in tree.body)
		has_all = any(
			isinstance(n, ast.Assign) and any(getattr(t, "id", "") == "__all__" for t in n.targets) for n in tree.body
		)
		if has_imports and not has_all:
			add("ERROR", "__init__", path, 1, "el __init__.py reexporta clases pero no define __all__")

	classes = [n for n in tree.body if isinstance(n, ast.ClassDef)]
	if not is_init:
		if len(classes) > 1:
			add("ERROR", "una clase por fichero", path, classes[1].lineno, ", ".join(c.name for c in classes))
		if len(classes) == 1 and snake(classes[0].name) != path.stem:
			add("ERROR", "nombre de fichero", path, 1, f"{classes[0].name} debería estar en {snake(classes[0].name)}.py")

	for node in tree.body:
		if isinstance(node, (ast.Assign, ast.AnnAssign)):
			targets = node.targets if isinstance(node, ast.Assign) else [node.target]
			names = [getattr(t, "id", "") for t in targets]
			if not any(name in ("__all__", "app") for name in names):
				add("ERROR", "variable suelta", path, node.lineno, f"{','.join(names)}: las constantes van dentro de una clase")
		if isinstance(node, ast.FunctionDef):
			add("AVISO", "función suelta", path, node.lineno, f"{node.name}(): la lógica con vocación de servicio va en una clase estática")

	for cls in classes:
		bases = [ast.unparse(b) for b in cls.bases]
		if "ABC" in bases and not cls.name.endswith("Base"):
			add("ERROR", "sufijo Base", path, cls.lineno, f"{cls.name} es abstracta y debe acabar en Base")
		if cls.name.endswith("Base") and path.parent.name in ("sqlite", "mysql"):
			add("ERROR", "Base en subcarpeta", path, cls.lineno, f"{cls.name} debe estar en la raíz del namespace")

	# Imports: profundidad y dirección.
	for node in ast.walk(tree):
		if isinstance(node, ast.ImportFrom) and node.module and node.module.startswith("app."):
			parts = node.module.split(".")[1:]
			if len(parts) > 3 and not module.startswith("app." + ".".join(parts[:3])):
				add("ERROR", "imports", path, node.lineno, f"import a más de 3 capas desde fuera: {node.module}")
			layer = module.split(".")[1] if "." in module else ""
			forbidden = {
				"domain": {"application", "adapters", "config", "initializer", "utils", "logger", "main"},
				"application": {"adapters", "config", "initializer", "main"},
				"utils": {"application", "adapters", "config", "initializer", "main"},
			}.get(layer, set())
			if parts[0] in forbidden:
				add("ERROR", "capas", path, node.lineno, f"{layer} no puede importar {parts[0]} (todo apunta hacia el núcleo)")

	for cls in classes:
		check_class(path, source, tree, cls)


def check_function(path: Path, function: ast.FunctionDef | ast.AsyncFunctionDef) -> None:
	"""Returns tempranos, *args, decoradores y docstring de una función o método."""
	allowed: set[int] = set()
	last = function.body[-1] if function.body else None
	if isinstance(last, ast.Return):
		allowed.add(id(last))
	if isinstance(last, ast.Try):
		if last.body and isinstance(last.body[-1], ast.Return):
			allowed.add(id(last.body[-1]))
		for handler in last.handlers:
			if handler.body and isinstance(handler.body[-1], ast.Return):
				allowed.add(id(handler.body[-1]))
	inner = [
		n for n in ast.walk(function)
		if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n is not function
	]
	inner_nodes = {id(x) for f in inner for x in ast.walk(f)}
	for node in ast.walk(function):
		if isinstance(node, ast.Return) and id(node) not in allowed and id(node) not in inner_nodes:
			add("ERROR", "return temprano", path, node.lineno, f"return que no está al final de {function.name}()")
	if function.args.vararg or function.args.kwarg:
		add("ERROR", "*args/**kwargs", path, function.lineno, f"{function.name}() usa argumentos variádicos")
	for decorator in function.decorator_list:
		text = ast.unparse(decorator)
		known = text in ("staticmethod", "property", "abstractmethod", "classmethod", "asynccontextmanager")
		if not (known or text.startswith("router.")):
			add("AVISO", "decorador", path, function.lineno, f"@{text}: ¿decorador propio?")
	if not ast.get_docstring(function):
		add("ERROR", "docstring", path, function.lineno, f"{function.name}() no tiene docstring")


def check_class(path: Path, source: str, tree: ast.Module, cls: ast.ClassDef) -> None:
	"""Regiones, orden y docstrings de los atributos de una clase."""
	lines = source.splitlines()
	members = [
		(index, member)
		for index, member in enumerate(cls.body)
		if isinstance(member, (ast.FunctionDef, ast.AsyncFunctionDef, ast.AnnAssign, ast.Assign))
	]
	if not members:
		return

	# end_lineno no incluye los comentarios finales (# endregion): se llega hasta el siguiente nodo del módulo.
	position = tree.body.index(cls)
	class_end = tree.body[position + 1].lineno - 1 if position + 1 < len(tree.body) else len(lines)
	regions: list[tuple[str, int, int]] = []
	stack: list[tuple[str, int]] = []
	for number in range(cls.lineno, class_end + 1):
		text = lines[number - 1].strip()
		opening = re.fullmatch(r"# region (.+)", text)
		closing = re.fullmatch(r"# endregion (.+)", text)
		if opening:
			stack.append((opening.group(1), number))
		if closing:
			if not stack or stack[-1][0] != closing.group(1):
				add("ERROR", "regiones", path, number, f"el cierre {closing.group(1)} no coincide con su apertura")
			else:
				name, start = stack.pop()
				regions.append((name, start, number))
	if stack:
		add("ERROR", "regiones", path, stack[-1][1], f"región sin cerrar: {stack[-1][0]}")

	order: list[int] = []
	for name, start, end in regions:
		if name not in REGION_ORDER:
			add("ERROR", "regiones", path, start, f"nombre de región no válido: {name}")
		else:
			order.append(REGION_ORDER.index(name))
		if not any(start < m.lineno < end for _, m in members):
			add("ERROR", "regiones", path, start, f"región vacía: {name}")
	if order != sorted(order):
		add("ERROR", "regiones", path, cls.lineno, f"{cls.name}: regiones en orden incorrecto")

	is_enum = any("Enum" in ast.unparse(b) for b in cls.bases)
	for index, member in members:
		if isinstance(member, (ast.FunctionDef, ast.AsyncFunctionDef)):
			decorators = [ast.unparse(d) for d in member.decorator_list]
			private = member.name.startswith("_") and not member.name.startswith("__")
			if member.name == "__init__":
				expected = "CONSTRUCTOR"
			elif member.name.startswith("__"):
				expected = ""  # método especial (__getitem__...): vale la región de métodos públicos
			elif "property" in decorators:
				expected = "PRIVATE PROPERTIES" if private else "PUBLIC PROPERTIES"
			elif "staticmethod" in decorators or "classmethod" in decorators:
				expected = "PRIVATE STATIC METHODS" if private else "PUBLIC STATIC METHODS"
			else:
				expected = "PRIVATE METHODS" if private else "PUBLIC METHODS"
			label = member.name
		else:
			target = member.target if isinstance(member, ast.AnnAssign) else member.targets[0]
			name = getattr(target, "id", "")
			private = name.startswith("_")
			annotation = ast.unparse(member.annotation) if isinstance(member, ast.AnnAssign) else ""
			if name.lstrip("_").isupper() or is_enum:
				expected = "PRIVATE CONSTANTS" if private else "PUBLIC CONSTANTS"
			elif annotation.startswith("ClassVar"):
				expected = "PRIVATE STATIC PROPERTIES" if private else "PUBLIC STATIC PROPERTIES"
			else:
				expected = "PRIVATE PROPERTIES" if private else "PUBLIC PROPERTIES"
			label = name
			if not has_docstring_after(cls.body, index):
				add("ERROR", "docstring", path, member.lineno, f"el atributo {name} no tiene docstring debajo")
		inside = [name for name, start, end in regions if start < member.lineno < end]
		if not inside:
			add("ERROR", "regiones", path, member.lineno, f"{label} está fuera de toda región")
		elif expected and inside[0] != expected:
			add("ERROR", "regiones", path, member.lineno, f"{label} está en {inside[0]} y debería estar en {expected}")
		if isinstance(member, ast.FunctionDef) and member.name == "__init__":
			for position_in_body, statement in enumerate(member.body):
				is_self = isinstance(statement, ast.Assign) and any(
					isinstance(t, ast.Attribute) and getattr(t.value, "id", "") == "self" for t in statement.targets
				)
				if is_self and not has_docstring_after(member.body, position_in_body):
					add("ERROR", "docstring", path, statement.lineno, f"{ast.unparse(statement.targets[0])} sin docstring debajo")

	# Args / Raises en los métodos de clases que no implementan un contrato (*Base): ahí el contrato ya los documenta.
	if not any(ast.unparse(b).endswith("Base") for b in cls.bases):
		for member in cls.body:
			if isinstance(member, (ast.FunctionDef, ast.AsyncFunctionDef)) and member.name != "__init__":
				docstring = ast.get_docstring(member) or ""
				parameters = [a.arg for a in member.args.args if a.arg not in ("self", "cls")]
				if parameters and "Args:" not in docstring:
					add("AVISO", "docstring", path, member.lineno, f"{cls.name}.{member.name}: falta la sección Args")
				raises = any(isinstance(x, ast.Raise) for x in ast.walk(member))
				if raises and "Raises:" not in docstring:
					add("AVISO", "docstring", path, member.lineno, f"{cls.name}.{member.name}: falta la sección Raises")


def check_back_cross_file(selected: set[Path]) -> None:
	"""Normas que necesitan ver todo el back: carpetas de una sola clase, constantes sin uso, islas, privados ajenos."""
	python_files = sorted(p for p in APP.rglob("*.py") if not is_generated(p))
	sources = {p: p.read_text(encoding="utf-8") for p in python_files}
	trees: dict[Path, ast.Module] = {}
	for path, source in sources.items():
		try:
			trees[path] = ast.parse(source)
		except SyntaxError as error:
			if path in selected:
				add("ERROR", "sintaxis", path, error.lineno or 1, f"no se puede analizar: {error.msg}")
	all_classes = {n.name: p for p, t in trees.items() for n in t.body if isinstance(n, ast.ClassDef)}

	for folder in sorted(p for p in APP.rglob("*") if p.is_dir() and (p / "__init__.py").exists() and not is_generated(p)):
		modules = [m for m in folder.glob("*.py") if m.name != "__init__.py"]
		if len(modules) == 1 and (folder / "__init__.py") in selected:
			add("AVISO", "carpeta con una sola clase", folder / "__init__.py", 1, f"{relative(folder)} solo contiene {modules[0].name}")

	for path, tree in trees.items():
		if path not in selected:
			continue
		for cls in [n for n in tree.body if isinstance(n, ast.ClassDef)]:
			for member in cls.body:
				if isinstance(member, ast.AnnAssign) and isinstance(member.target, ast.Name):
					name = member.target.id
					if name.isupper() and not name.startswith("_"):
						used = any(re.search(rf"\b{cls.name}\.{name}\b", s) for q, s in sources.items() if q != path)
						if not used:
							add("ERROR", "constante pública", path, member.lineno, f"{cls.name}.{name} no se usa fuera de su clase: debe ser privada (_{name})")
		for number, line in enumerate(sources[path].splitlines(), 1):
			for match in re.finditer(r"\b([A-Z][A-Za-z0-9]+)\._[a-zA-Z]\w*", line):
				owner = match.group(1)
				if owner in all_classes and all_classes[owner] != path:
					add("ERROR", "privado ajeno", path, number, f"acceso a un miembro privado de otra clase: {match.group(0)}")

	# Referencias a otras clases en docstrings y comentarios (heurística: «cada parte es una isla»).
	names = set(all_classes)
	for path, tree in trees.items():
		if path not in selected:
			continue
		own = {n.name for n in tree.body if isinstance(n, ast.ClassDef)}
		texts: list[tuple[int, str]] = []
		for node in ast.walk(tree):
			if isinstance(node, (ast.Module, ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)) and node.body:
				docstring = ast.get_docstring(node, clean=False)
				if docstring:
					texts.append((node.body[0].lineno, docstring))
		for number, line in enumerate(sources[path].splitlines(), 1):
			stripped = line.strip()
			if stripped.startswith("#") and not stripped.startswith(("# region", "# endregion")):
				texts.append((number, stripped))
		for number, text in texts:
			for row in text.splitlines():
				if re.match(r"\s+\w+Error:", row) or re.match(r"\s*(Raises|Args|Returns):", row):
					continue
				for word in set(re.findall(r"\b[A-Z][A-Za-z0-9]{3,}\b", row)):
					if word in names and word not in own:
						add("AVISO", "isla", path, number, f"menciona a {word}: «{row.strip()[:70]}»")


def check_requirements(selected: set[Path]) -> None:
	"""Todo lo que el back importa de fuera de la librería estándar debe estar en requirements.txt."""
	if not any(p.suffix == ".py" and APP in p.parents for p in selected):
		return
	requirements_file = API / "requirements.txt"
	declared = set()
	for line in requirements_file.read_text(encoding="utf-8").splitlines():
		match = re.match(r"\s*([A-Za-z0-9_.\-]+)", line)
		if match and not line.strip().startswith("#"):
			declared.add(match.group(1).lower().replace("-", "_").replace(".", "_"))
	for path in sorted(p for p in selected if p.suffix == ".py" and APP in p.parents):
		try:
			tree = ast.parse(path.read_text(encoding="utf-8"))
		except SyntaxError:
			continue
		for node in ast.walk(tree):
			names: list[str] = []
			if isinstance(node, ast.Import):
				names = [a.name.split(".")[0] for a in node.names]
			elif isinstance(node, ast.ImportFrom) and node.module and node.level == 0:
				names = [node.module.split(".")[0]]
			for name in names:
				if name != "app" and name not in sys.stdlib_module_names and name.lower() not in declared:
					add("ERROR", "requirements.txt", path, node.lineno, f"se importa {name}, que no está en requirements.txt")


# ----------------------------------------------------------------------------------------------------------------
# Esquema de la base de datos: SQLite, MySQL y diagrama
# ----------------------------------------------------------------------------------------------------------------

def schema_from_sql(path: Path) -> dict[str, set[str]]:
	text = path.read_text(encoding="utf-8")
	tables: dict[str, set[str]] = {}
	for match in re.finditer(r"CREATE TABLE (\w+) \((.*?)\n\);", text, re.S):
		columns: set[str] = set()
		for line in match.group(2).splitlines():
			line = line.strip()
			if line and not line.upper().startswith(("FOREIGN KEY", "PRIMARY KEY", "UNIQUE", "--")):
				columns.add(line.split()[0])
		tables[match.group(1)] = columns
	return tables


def schema_from_diagram(path: Path) -> dict[str, set[str]]:
	cells = list(ElementTree.parse(path).getroot().iter("mxCell"))

	# 1. Cada tabla es un swimlane cuyo título acaba en «<br>nombre».
	table_names: dict[str, str] = {}
	for cell in cells:
		cell_id = cell.get("id") or ""
		if cell_id.startswith("t_") and "swimlane" in (cell.get("style") or ""):
			table_names[cell_id] = (cell.get("value") or "").split("<br>")[-1].strip()

	# 2. Cada columna es una celda hija de la tabla, con el texto «PK  id : long», «FK  user_id : long»...
	result: dict[str, set[str]] = {name: set() for name in table_names.values()}
	for cell in cells:
		parent = cell.get("parent") or ""
		if parent in table_names:
			value = re.sub(r"^(PK|FK)\s+", "", (cell.get("value") or "").strip())
			if " :" in value:
				result[table_names[parent]].add(value.split(" :")[0].strip())
	return result


def check_schema(selected: set[Path]) -> None:
	"""sqlite_schema.sql, mysql_schema.sql y el diagrama deben tener las mismas tablas y columnas."""
	watched = {SQLITE_SCHEMA, MYSQL_SCHEMA, DATABASE_DIAGRAM}
	if not (watched & selected):
		return
	try:
		sqlite = schema_from_sql(SQLITE_SCHEMA)
		mysql = schema_from_sql(MYSQL_SCHEMA)
		diagram = schema_from_diagram(DATABASE_DIAGRAM)
	except (OSError, ElementTree.ParseError) as error:
		add("ERROR", "esquema", "Cliso.API", 1, f"no se pudo leer un esquema o el diagrama: {error}")
		return
	sources = {"SQLite": (sqlite, SQLITE_SCHEMA), "MySQL": (mysql, MYSQL_SCHEMA), "diagrama": (diagram, DATABASE_DIAGRAM)}
	reference_name, (reference, _) = "SQLite", sources["SQLite"]
	for name, (schema, file) in sources.items():
		if name == reference_name:
			continue
		for table in sorted(set(reference) | set(schema)):
			if table not in schema:
				add("ERROR", "esquema", file, 1, f"{name} no tiene la tabla {table}, que sí está en SQLite")
			elif table not in reference:
				add("ERROR", "esquema", file, 1, f"{name} tiene la tabla {table}, que no está en SQLite")
			else:
				for column in sorted(reference[table] - schema[table]):
					add("ERROR", "esquema", file, 1, f"{name}: a la tabla {table} le falta la columna {column} (está en SQLite)")
				for column in sorted(schema[table] - reference[table]):
					add("ERROR", "esquema", file, 1, f"{name}: la tabla {table} tiene la columna {column}, que no está en SQLite")


# ----------------------------------------------------------------------------------------------------------------
# Front: búsquedas de texto sobre las normas que se pueden detectar así
# ----------------------------------------------------------------------------------------------------------------

def grep(path: Path, text: str, pattern: str, level: str, rule: str, message: str, skip_comments: bool = True) -> None:
	for number, line in enumerate(text.splitlines(), 1):
		if skip_comments and line.strip().startswith(("//", "*", "/*")):
			continue
		if re.search(pattern, line):
			add(level, rule, path, number, f"{message}: {line.strip()[:70]}")


def check_front(path: Path) -> None:
	text = path.read_text(encoding="utf-8")
	relative_path = relative(path)
	if path.suffix == ".ts":
		if path.name.endswith(".spec.ts"):
			add("AVISO", "tests", path, 1, "fichero de test: por defecto no se crean tests (hay que haberlo confirmado)")
		grep(path, text, r"from\s+'\.{1,2}/", "ERROR", "imports", "import relativo (deben ser rutas absolutas desde src/)")
		grep(path, text, r"console\.(log|debug|info|error)\b", "ERROR", "console", "solo se permite console.warn")
		grep(path, text, r":\s*any\b|<any>|\bas any\b|\bany\[\]", "ERROR", "any", "uso de any")
		grep(path, text, r"\bHACK\b", "ERROR", "HACK", "los HACK no se suben al repositorio", skip_comments=False)
		grep(path, text, r"@ViewChild\((?![^)]*static:\s*true)", "AVISO", "ViewChild", "@ViewChild sin static: true")
		grep(path, text, r"\bsignal\(|\bcomputed\(|\beffect\(|\binject\(", "AVISO", "signals", "signals/inject fuera de lo permitido")
		grep(path, text, r"^\s*//\s*(const|let|if|for|return|this\.|import|await)\b", "AVISO", "código comentado", "posible código comentado", skip_comments=False)
		for number, line in enumerate(text.splitlines(), 1):
			if re.search(r"\bTODO\b", line) and "trello.com" not in line:
				add("ERROR", "TODO", path, number, "un TODO debe llevar la URL de la tarjeta de Trello")
			if re.search(r"from\s+'rxjs", line) and not re.search(r"dataaccess|request|canceller|forkjoin", relative_path.lower()):
				add("AVISO", "rxjs", path, number, "rxjs fuera de la capa HTTP")
	elif path.suffix == ".html":
		grep(path, text, r"\{\{[^}]*\(", "ERROR", "plantilla", "llamada a una función en la plantilla")
		grep(path, text, r"@for\s*\((?![^)]*track )", "ERROR", "track", "@for sin track")
		grep(path, text, r'style="', "AVISO", "estilos", "estilo en línea")
	elif path.suffix in (".scss", ".css"):
		grep(path, text, r"::ng-deep|\.mdc-", "ERROR", "estilos", "prohibido ::ng-deep y las clases .mdc-")
		grep(path, text, r"box-shadow|text-shadow", "ERROR", "estilos", "prohibidas las sombras (usa un borde de 1 px)")
		grep(path, text, r"@media\s*\(\s*max-width", "ERROR", "estilos", "solo media queries min-width (mobile-first)")
		grep(path, text, r"!important", "AVISO", "estilos", "!important")
		grep(path, text, r"(?<![\w-])margin(-[a-z]+)?\s*:", "AVISO", "estilos", "margin (las separaciones van con gap o padding)")
		grep(path, text, r"(?<![\w-])(width|height)\s*:\s*\d+px", "AVISO", "estilos", "medida fija en píxeles")
		if path.name != "_variables.scss":
			grep(path, text, r"#[0-9a-fA-F]{3,8}\b", "ERROR", "estilos", "color suelto (sale de los tokens de _variables.scss)")
	elif path.suffix == ".svg":
		if not text.startswith('<svg viewBox="0 0 960 960" width="24" height="24" xmlns="http://www.w3.org/2000/svg">'):
			add("ERROR", "svg", path, 1, "cabecera distinta de <svg viewBox=\"0 0 960 960\" width=\"24\" height=\"24\" xmlns=\"http://www.w3.org/2000/svg\">")
		if len(re.findall(r"<path\b", text)) != 1:
			add("ERROR", "svg", path, 1, "debe tener un único <path>")
		for forbidden in ("style=", "<g", "transform", "inkscape", "sodipodi", "<!--", "<metadata"):
			if forbidden in text:
				add("ERROR", "svg", path, 1, f"contiene {forbidden}")
		if 'fill="#ffffff"' not in text:
			add("AVISO", "svg", path, 1, 'el path no lleva fill="#ffffff"')


# ----------------------------------------------------------------------------------------------------------------
# Limpieza, README y credenciales
# ----------------------------------------------------------------------------------------------------------------

def check_cleanliness(selected: set[Path]) -> None:
	for leftover in (API / "data", API / "logs", UI / "dist", UI / ".angular" / "cache"):
		if leftover.exists():
			add("ERROR", "limpieza", leftover, 1, f"{relative(leftover)} es un resto de pruebas: bórralo")
	for cache in sorted(APP.rglob("__pycache__")):
		add("ERROR", "limpieza", cache, 1, "__pycache__ es un resto de pruebas: bórralo")
	for path in selected:
		suffix_bad = path.suffix in (".db", ".log", ".pyc", ".tmp", ".bak", ".orig")
		if suffix_bad or any(part in ("node_modules", ".venv") for part in path.parts):
			add("ERROR", "limpieza", path, 1, "fichero que no debe subirse")
	if ROOT / "README.md" in selected:
		add("AVISO", "README", ROOT / "README.md", 1, "el README solo se actualiza desde el panel de Cliso, no en sesiones de código")
	for path in selected:
		if ROOT / ".ai" in path.parents:
			add("AVISO", "directrices", path, 1, "se tocan las directrices: ¿está acordado el cambio?")
	settings = API / "settings.json"
	if settings in selected:
		try:
			data = json.loads(settings.read_text(encoding="utf-8"))
		except (OSError, ValueError) as error:
			add("ERROR", "settings.json", settings, 1, f"no es un JSON válido: {error}")
			return
		for key in ("mysql_user", "mysql_password"):
			if data.get(key):
				add("ERROR", "credenciales", settings, 1, f"{key} tiene un valor: no se suben credenciales")


# ----------------------------------------------------------------------------------------------------------------

def main() -> None:
	if hasattr(sys.stdout, "reconfigure"):
		sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[union-attr]
	arguments = sys.argv[1:]
	if not arguments:
		print(__doc__)
		return
	files = select_files(arguments)
	selected = set(files)
	back_python = [p for p in files if p.suffix == ".py" and APP in p.parents]
	front = [p for p in files if UI / "src" in p.parents and p.suffix in (".ts", ".html", ".scss", ".css", ".svg")]

	for path in back_python:
		source = path.read_text(encoding="utf-8")
		try:
			check_python(path, source, ast.parse(source))
		except SyntaxError as error:
			add("ERROR", "sintaxis", path, error.lineno or 1, f"no se puede analizar: {error.msg}")
	if back_python or any(p.suffix == ".py" for p in files):
		check_back_cross_file(selected)
	check_requirements(selected)
	check_schema(selected)
	for path in front:
		check_front(path)
	check_cleanliness(selected)

	print(f"Ficheros comprobados: {len(files)} (back: {len(back_python)}, front: {len(front)})")
	by_rule: dict[str, list[tuple[str, str, int, str]]] = defaultdict(list)
	for level, rule, path, line, message in sorted(findings, key=lambda f: (f[2], f[3], f[1])):
		by_rule[rule].append((level, path, line, message))
	errors = sum(1 for f in findings if f[0] == "ERROR")
	warnings = len(findings) - errors
	for rule in sorted(by_rule):
		print(f"\n## {rule} ({len(by_rule[rule])})")
		for level, path, line, message in by_rule[rule]:
			print(f"[{level}] {path}:{line}  {message}")
	print(f"\nResumen: {errors} errores, {warnings} avisos.")


if __name__ == "__main__":
	main()
