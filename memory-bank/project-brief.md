# Project Brief — TrackFlow

## Descripción del negocio

TrackFlow es una empresa de logística de última milla y gestión de almacenes fundada en 2009 en Los Ángeles. Opera en Estados Unidos y España, con almacenes en Los Ángeles y Zaragoza, aproximadamente 130 empleados y unos 9 millones de euros de ingresos anuales.

La empresa almacena inventario de marcas de comercio electrónico, recibe y prepara pedidos, selecciona transportistas, realiza envíos y gestiona devoluciones. Su propuesta de valor es resolver para sus clientes toda la operación logística desde la recepción del pedido hasta la entrega o devolución.

La unidad interna **TrackFlow Tech**, liderada técnicamente desde Zaragoza, tiene el mandato de modernizar los sistemas, integraciones y automatizaciones inteligentes de la compañía.

## Problema que resuelve el proyecto

TrackFlow ha crecido con sistemas desconectados y procesos manuales:

- Los dos almacenes utilizan sistemas distintos y no existe una visión global y actualizada del inventario.
- Los pedidos entran por correo electrónico en formatos diferentes y se transcriben manualmente.
- La asignación de transportistas y el seguimiento de paquetes se realizan portal por portal.
- No hay datos históricos estructurados sobre entregas a tiempo, incidencias, rutas ni costes.
- Las devoluciones se revisan una a una y la inspección de productos es subjetiva.
- Las consultas de clientes se responden manualmente consultando un documento de Google Drive.
- Los account managers trabajan con hojas de cálculo y cadenas de correo, sin CRM ni indicadores de riesgo de renovación.
- La arquitectura combina dos WMS, un ERP antiguo, scripts Python sin documentar y bases de datos en dos proveedores cloud.
- La dirección recibe informes semanales preparados manualmente, con datos desactualizados.
- No existe telemetría centralizada ni alertas operativas; los fallos se comunican informalmente por WhatsApp.

Estas limitaciones provocan lentitud, errores, poca visibilidad operativa y menor rentabilidad, especialmente al gestionar dos países, dos idiomas y múltiples transportistas.

## Objetivos del proyecto

### Objetivo general

Construir progresivamente la infraestructura digital de TrackFlow para operar con información unificada, procesos automatizados, observabilidad centralizada y asistentes inteligentes, manteniendo una arquitectura modular que pueda crecer con la compañía.

### Objetivos funcionales

1. **Operaciones de almacén**
   - Crear una API unificada de inventario por SKU y almacén.
   - Automatizar la ingesta de pedidos recibidos por correo.
   - Proporcionar un dashboard operativo y alertas de bajo stock.

2. **Envíos y última milla**
   - Recomendar el transportista óptimo según destino, peso, urgencia y restricciones.
   - Unificar el tracking de los ocho transportistas.
   - Ofrecer un portal público de seguimiento y métricas de rendimiento.

3. **Devoluciones**
   - Automatizar la aprobación según reglas configurables por cliente.
   - Orquestar etiqueta, recogida y programación con el transportista.
   - Asistir la inspección mediante clasificación de imágenes y analizar patrones de devolución.

4. **Customer Experience**
   - Automatizar consultas frecuentes de tracking y devoluciones.
   - Crear una base de conocimiento semántica para RAG.
   - Unificar tickets de email, WhatsApp y teléfono, con soporte español-inglés como evolución recomendada.
   - Medir volumen, resolución y sentimiento.

5. **Comercial y clientes**
   - Centralizar perfiles de clientes mediante integración CRM.
   - Generar informes periódicos automáticamente.
   - Calcular salud de cuenta, riesgo de renovación y alertas a 90 y 30 días.

6. **Tecnología y dirección**
   - Centralizar logs, métricas y alertas de los dos países.
   - Construir un pipeline de datos para los dashboards.
   - Automatizar backups, health checks y notificaciones de incidentes.
   - Ofrecer un dashboard ejecutivo con KPIs, comparativa por país, alertas y asistente en lenguaje natural.

## Indicadores de éxito propuestos

- Inventario consultable por SKU y almacén desde una única interfaz.
- Reducción de transcripción y revisión manual de pedidos y devoluciones.
- Seguimiento unificado de envíos y medición de entregas a tiempo por transportista.
- Mayor proporción de consultas CX resueltas automáticamente sin perder escalado humano.
- Informes ejecutivos y de clientes generados con datos recientes, sin preparación manual dominical.
- Detección automática de fallos técnicos y disponibilidad de trazas para diagnóstico.

## Alcance actual y fuera de alcance inmediato

El repositorio es todavía una base de trabajo de un proyecto transversal de AI Engineering. En el estado actual existe una UI de **Talent Pipeline Tracker** y modelos TypeScript iniciales para productos, inventario, envíos, transportistas y movimientos. Las APIs productivas, integraciones reales con WMS/ERP/transportistas, agentes de IA, pipelines de datos, observabilidad y dashboards ejecutivos todavía deben implementarse.

## Restricciones de negocio

- Operación binacional: Estados Unidos y España.
- Dos almacenes con sistemas de origen diferentes.
- Ocho transportistas y portales/APIs heterogéneos.
- Necesidad de operación continua 24/7.
- Datos potencialmente sensibles de clientes, destinatarios, pedidos y operaciones.
- Requisito de explicabilidad para recomendaciones de transportista y decisiones automatizadas.
- Soporte eventual para español e inglés.
