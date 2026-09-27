---
title: Reglas generales de desarrollo
description: Estándares generales de calidad, seguridad, validación y mantenimiento para el repositorio TrackFlow.
globs:
	- "**/*"
alwaysApply: true
---

# Reglas generales de desarrollo

Estas reglas aplican a cualquier agente o desarrollador que modifique el repositorio TrackFlow.

## Calidad y alcance

- Mantener los cambios pequeños, enfocados y reversibles.
- Resolver una sola tarea por cambio siempre que sea posible.
- Leer `AGENTS.md`, el memory bank y el `README.md` correspondiente antes de modificar código.
- Respetar la estructura del monorepo y colocar cada cambio en la carpeta que corresponda.
- No introducir abstracciones prematuras ni complejidad que no resuelva una necesidad concreta.
- Usar nombres descriptivos para variables, funciones, clases, componentes, tipos y archivos.
- Preferir funciones pequeñas con una única responsabilidad.
- Evitar código duplicado; reutilizar tipos, utilidades y componentes existentes cuando corresponda.

## TypeScript y React

- Mantener TypeScript en modo `strict`.
- Evitar `any`; preferir tipos explícitos o `unknown` cuando el tipo no pueda conocerse con seguridad.
- Reutilizar los tipos de dominio existentes en lugar de redefinirlos.
- Separar la lógica de negocio de la presentación.
- Crear componentes pequeños, reutilizables y con responsabilidades claras.
- Gestionar explícitamente estados de carga, error, datos vacíos y éxito.
- Validar los datos externos antes de utilizarlos en la aplicación.
- No ejecutar efectos secundarios innecesarios durante el renderizado.
- Usar el alias `@/*` cuando simplifique los imports dentro de las aplicaciones configuradas para usarlo.

## Python

- Seguir PEP 8.
- Usar type hints en funciones públicas y estructuras de datos importantes.
- Mantener funciones pequeñas y con una única responsabilidad.
- Gestionar excepciones específicas; no ocultar errores con `except` genéricos.
- Separar configuración, lógica de negocio, acceso a datos e integraciones externas.
- No ejecutar efectos secundarios al importar un módulo.

## Validación, errores e integraciones

- Validar entradas en los límites del sistema: APIs, formularios, archivos, emails y respuestas de proveedores externos.
- Normalizar los datos externos antes de incorporarlos al dominio interno.
- Devolver errores consistentes y útiles sin exponer información sensible.
- No ignorar errores silenciosamente.
- Usar logs estructurados con contexto suficiente para diagnosticar problemas.
- Hacer idempotentes las operaciones de integración que puedan reintentarse.
- Añadir pruebas para reglas de negocio, casos límite y errores esperados.
- Toda decisión automatizada debe ser auditable y permitir revisión humana o fallback manual cuando corresponda.
- Las recomendaciones de IA deben conservar una explicación de los factores utilizados.

## Dominio TrackFlow

- Usar los tipos y valores de dominio definidos para almacenes, países, estados y prioridades.
- No inventar estados, transportistas o reglas operativas sin documentarlos.
- Representar el almacén de origen cuando una operación afecte a inventario o envíos.
- Mantener unidades explícitas en los nombres, por ejemplo `weightKg`, `distanceKm` y `unitCostUSD`.
- Considerar país, idioma, zona horaria y moneda en operaciones binacionales.

## Seguridad y datos

- No incluir secretos, credenciales, tokens, claves privadas ni datos personales reales en el código, logs o commits.
- No registrar direcciones, tokens u otra información sensible salvo que sea estrictamente necesario y esté anonimizada.
- Validar y restringir datos recibidos de usuarios y sistemas externos.
- Aplicar el principio de mínimo privilegio en accesos y permisos.
- No modificar archivos protegidos ni infraestructura crítica sin la confirmación requerida en `AGENTS.md`.

## Verificación antes de entregar cambios

- Ejecutar el formatter, linter, type-check, tests o build aplicables a las áreas modificadas.
- Revisar `git status` para confirmar el alcance de los cambios.
- Ejecutar `git diff --check`.
- Revisar el diff completo y eliminar archivos generados o cambios accidentales.
- Actualizar la documentación y `memory-bank/progress.md` cuando el estado del proyecto cambie.
- Informar de los comandos ejecutados, resultados y bloqueos pendientes.
