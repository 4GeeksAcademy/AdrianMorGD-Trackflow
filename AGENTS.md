# AGENTS.md — TrackFlow

## Propósito

Estas instrucciones aplican a cualquier agente que trabaje en este repositorio. El agente debe respetar la estructura del monorepo, documentar sus decisiones y evitar cambios destructivos o de alcance no solicitado.

## Lectura obligatoria al inicio de cada sesión

Antes de inspeccionar o modificar código, el agente debe leer, en este orden:

1. `AGENTS.md` — reglas operativas del repositorio.
2. `memory-bank/project-brief.md` — descripción del negocio, problema, objetivos y restricciones funcionales.
3. `memory-bank/techContext.md` — stack, arquitectura, restricciones y decisiones técnicas.
4. `memory-bank/progress.md` — estado actual, trabajo completado, bloqueos y próximos pasos.
5. El `README.md` de la carpeta que vaya a modificar, si existe.

Si el trabajo cambia el alcance, la arquitectura o el estado del proyecto, el agente debe actualizar el archivo correspondiente del memory bank, especialmente `progress.md`. No debe inventar decisiones técnicas: las decisiones no confirmadas deben marcarse como pendientes o propuestas.

## Flujo obligatorio antes de cada commit

No se debe crear un commit hasta completar estos cuatro pasos como mínimo:

1. **Revisar el alcance:** comprobar `git status`, revisar los cambios y confirmar que solo se modifican archivos relacionados con la tarea.
2. **Validar el código:** ejecutar los tests, type-check, build o lint aplicables a las áreas modificadas. Si no existe una comprobación automatizada, realizar una verificación equivalente y documentarlo.
3. **Revisar la documentación:** actualizar el memory bank y los README/ADRs afectados; verificar que no se incluyan secretos, datos reales o archivos generados accidentalmente.
4. **Inspeccionar el diff:** ejecutar `git diff --check` y revisar `git diff` completo. Corregir errores, archivos no deseados o cambios de formato antes de continuar.
5. **Confirmar el commit:** solo después de los pasos anteriores, preparar el commit con un mensaje claro y descriptivo. No usar `git add .` ni `git commit --all` sin revisar previamente qué archivos entrarán.

Si una validación falla, el agente debe detener el commit, informar del fallo y corregirlo o dejar constancia explícita de por qué no puede corregirlo. No debe usar `--no-verify` ni ignorar tests sin confirmación explícita del desarrollador.

## Archivos y carpetas protegidos

El agente **no debe modificar, borrar, mover ni regenerar** los siguientes archivos o carpetas sin confirmación explícita del desarrollador:

### Contexto y reglas del proyecto

- `AGENTS.md`
- `CONTEXT.md`
- `CONTEXT.es.md`
- `company-choice.md`

### Infraestructura, despliegue y configuración global

- `docker-compose.yml`
- `infra/`
- `.github/`
- `.devcontainer/`
- archivos de configuración de CI/CD, despliegue, Terraform, Kubernetes o cloud
- archivos globales de configuración y lockfiles en la raíz, incluidos `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` y `bun.lockb`

### Seguridad y datos sensibles

- `.env`, `.env.*` y cualquier archivo que contenga credenciales, tokens, claves privadas o secretos
- certificados, llaves SSH y archivos de autenticación
- `data/raw/` si contiene datos reales, PII o exportaciones de sistemas externos
- bases de datos, dumps, backups y archivos de producción

### Historial y contenido generado

- `.git/`
- `node_modules/`, `.next/`, `dist/`, `build/`, `coverage/` y otros artefactos generados
- commits, tags, ramas remotas o historial Git mediante rebase/force-push, salvo instrucción explícita

## Excepciones y cambios permitidos

- El agente puede leer los archivos protegidos para entender el contexto, pero no modificarlos sin confirmación.
- `memory-bank/progress.md` puede actualizarse para registrar el estado real del trabajo. `project-brief.md` y `techContext.md` solo deben actualizarse cuando la tarea cambie esos contenidos y sin contradecir el briefing.
- Los archivos dentro de una aplicación o módulo solicitado pueden modificarse respetando su README y las pruebas existentes.
- Si una tarea requiere modificar un archivo protegido, el agente debe detenerse antes de hacerlo y pedir confirmación específica indicando la ruta y el motivo.

## Reglas generales

- Mantener los cambios pequeños, enfocados y reversibles.
- No introducir dependencias, servicios externos o decisiones de arquitectura sin documentar su motivo.
- No exponer secretos en código, logs, commits o mensajes.
- Preferir pruebas y validaciones reproducibles.
- Informar al final de los archivos modificados, comandos ejecutados, resultados y cualquier bloqueo pendiente.
