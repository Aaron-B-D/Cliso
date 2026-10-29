# Directrices académicas del proyecto (MP0374)

Resumen de todo lo que exige el centro para el proyecto. Sustituye a los documentos originales (plantillas de memoria,
indicaciones, requisitos de DWCS y ejemplo de redacción), que se han eliminado. Tenlo en cuenta al decidir qué
implementar, cómo documentarlo y qué entregar. Si algo del trabajo choca con esto, avisa.

## Datos fijos

- Centro: I.E.S. Fernando Wirtz Suárez (código 15005397), A Coruña. Curso 2026-2027.
- Ciclo: Desenvolvemento de Aplicacións Web (IFC, SIFC01), grado superior, régimen a distancia.
- Módulo: **MP0374 Proxecto de Desenvolvemento de Aplicacións Web** (equivale a 5 créditos ECTS).
- Tutores: Eva Naveira Domínguez y Fernando Prado Espiñeira.
- La plantilla de memoria está en gallego, pero la memoria puede escribirse en el idioma que se use en el proyecto
  (español, según las directrices comunes); respeta la estructura y los títulos de apartado de la plantilla.

## Qué se entrega

Tres elementos en la entrega final del aula virtual:

1. **Memoria en PDF**, nombre `Apellidos_Nombre_Memoria`.
2. **Código**: un `.txt` con el enlace a GitHub, o el código en `.zip`. Nombre `Apellidos_Nombre_Código`.
3. **Defensa** (cita posterior): presentación con **diapositivas obligatorias**, **10 minutos** de exposición y hasta
   **5 minutos** de preguntas del profesorado. Debe verse qué hace la aplicación, cómo funciona y cómo se implementa:
   APIs, lenguajes, bases de datos, diseño y todo lo que se considere oportuno.

## Requisitos de la aplicación

La aplicación **no puede ser estática**. Se pide demostrar, como mínimo, varios de estos recursos:

- Formularios con validación de datos.
- Alta, modificación, baja y consulta de datos en una base de datos.
- Inicio de sesión.
- Gestión de alguna cookie.
- Código organizado en carpetas (capas o patrón de diseño).
- Uso de Git.
- Librerías de JavaScript y de CSS.
- Cualquier otra indicación dada por el profesorado durante el curso.

Antes de programar: elegir temática, objetivos, finalidad y usuarios; documentarse e inspirarse en webs similares;
hacer una pequeña planificación (wireframes para la estructura), decidir qué se implementa y con qué tecnologías, y
una temporalización (**se valora positivamente un diagrama de Gantt**).

## Criterios de DWCS (Desarrollo Web en Entorno Servidor)

Se valora todo lo siguiente. Los cinco últimos son los **marcados en verde** en el documento original (extra
valorado); no son opcionales en la práctica:

- Programación orientada a objetos: definir clases y métodos.
- Acceso a base de datos seguro con la librería del lenguaje o un ORM.
- Inserción, actualización, eliminación y consulta de datos.
- **Modelo relacional de la base de datos** (en la memoria o en un documento aparte).
- Separación en capas (MVC) o uso de patrones.
- Cookies.
- Sesiones.
- Inicio de sesión.
- Cifrado/hash de contraseñas y, opcionalmente, de otros datos sensibles.
- Código bien estructurado, sangrado y comentado.
- **Validación de datos en servidor.** (verde)
- **Herencia aplicada correctamente en algunas clases.** (verde)
- **Perfiles de usuario o roles distintos.** (verde)
- **Autoinstalación y configuración de la base de datos.** (verde)
- **Ficheros: uso o gestión de información en ficheros.** (verde)

Aplicado a Cliso: la API es Python/FastAPI y la UI Angular, no PHP; los criterios se cumplen igual con las
herramientas del proyecto (ORM, capas, hash de contraseñas, validación en el servidor, roles...). Al diseñar una
funcionalidad, comprueba que alguna parte cubre cada criterio, en especial los verdes, y deja claro en la memoria
dónde está cada uno.

## Estructura de la memoria

Respetar los apartados de la plantilla, en este orden. Todas las secciones llevan los criterios de evaluación (CA) que
cubren; el texto en rojo de la plantilla se borra antes de entregar.

0. **Portada**: datos del centro, ciclo y módulo, profesorado, nombre del alumno, título del proyecto. Control de
   versiones (versión, fecha, observaciones: V0, V1, V2...). Índice con números de página correctos.
1. **Objetivo** (CA 2.4, 5.1): finalidad principal, concepto y contexto, **sin detalles técnicos**. Claro, preciso y
   concreto, de forma que permita decidir si el proyecto tuvo éxito o fracasó. Mejor un objetivo general más una
   lista de objetivos concretos.
2. **Descripción** (CA 5.2, 5.3): motivación o justificación de la idea; cómo se identificaron las necesidades del
   sector; **aplicaciones similares del mercado** y qué aporta esta frente a ellas (citar ejemplos reales); solución
   adoptada a partir de la documentación de diseño; funcionalidades principales; tecnologías usadas; roles; y las
   **dificultades técnicas relevantes** y cómo se resolvieron. Destacar innovaciones, soluciones a problemas
   tecnológicos y partes especialmente difíciles.
3. **Alcance** (CA 2.3, 2.4): qué se puede y qué no se puede hacer en la aplicación, con las funcionalidades
   concretas. Se puede limitar a lo realizable en el plazo; hay que explicar **qué queda fuera y su impacto**. La
   limitación **no puede condicionar** el éxito ni una conclusión aceptable del proyecto.
4. **Planificación** (CA 3.1, 3.2, 3.3, 3.4, 3.6, 5.4, 5.5): tareas con sus tiempos y secuencia, recursos y logística
   por actividad, permisos y autorizaciones necesarios, procedimientos de ejecución, asignación de recursos
   materiales y humanos, actividades en que se divide la ejecución y justificación de las decisiones de
   planificación. Incluir diagrama de Gantt.
5. **Medios a emplear** (CA 2.5, 3.6): subapartados **Hardware**, **Software** y **Tecnologías**.
6. **Presupuesto** (CA 2.6, 3.7): valoración económica acorde con las condiciones de ejecución.
7. **Título**: título del proyecto.
8. **Ejecución**: **diagrama de la base de datos**, resumen del desarrollo del proyecto y capturas de alguna
   funcionalidad clave (por ejemplo, dar de alta un usuario). No es un manual de uso, solo una muestra del
   funcionamiento. Se hará además una demostración en la defensa.

Se pueden añadir apartados al final si hace falta.

## Normas de formato de la memoria

- Una única fuente (tipo de letra) en todos los apartados.
- Imágenes bien colocadas.
- Borrar el texto rojo de orientación de cada apartado.
- Actualizar el índice para que las páginas sean correctas.
- Entrega en PDF.

## Cómo usar esto al trabajar

- Las decisiones técnicas, de alcance y de planificación deben poder justificarse en la memoria. Si implementas algo
  relevante, apunta (en el README o donde corresponda) lo necesario para redactar luego la memoria: qué es, por qué
  se eligió así y qué problema resolvió.
- El modelo relacional/diagrama de BD tiene que estar siempre actualizado (`Documentation/Database`).
- No amplíes el alcance sin avisar: todo lo que se añada o se quite debe reflejarse en el apartado de alcance.
- Para la defensa conviene tener a mano una demo estable y datos de ejemplo cargados por la autoinstalación.
