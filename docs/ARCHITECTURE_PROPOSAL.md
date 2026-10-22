# Propuesta de arquitectura del backend

## Arquitectura propuesta

Se propone una **aplicación backend centralizada y modular**, organizada con arquitectura hexagonal. Inicialmente será una sola aplicación; sus módulos se separarán por dominios del negocio y dentro de cada uno se distinguirán las reglas de negocio de los detalles técnicos. Esto evita crear servicios independientes antes de que el tamaño del equipo, el volumen o la disponibilidad lo justifiquen.

La aplicación expondrá una interfaz de programación de aplicaciones común y actuará como capa de integración con los sistemas de almacén, el sistema de planificación de recursos empresariales, los transportistas y otros sistemas. Las tecnologías concretas de almacenamiento y procesamiento en segundo plano quedan pendientes de definición.

## Estructura propuesta

```text
services/
└── trackflow-api/                    # Aplicación backend centralizada
    ├── app/
    │   ├── main.py                   # Inicio y composición de la aplicación
    │   ├── api/                      # Routers y contratos HTTP de FastAPI
    │   │   ├── dependencies.py       # Dependencias compartidas de los routers
    │   │   └── v1/                   # Primera versión de la interfaz HTTP
    │   │       ├── router.py         # Agrupa e incluye los routers de dominio
    │   │       ├── inventory.py      # Endpoints de inventario
    │   │       ├── shipments.py      # Endpoints de envíos y seguimiento
    │   │       └── returns.py        # Endpoints de devoluciones
    │   ├── domains/                  # Módulos agrupados por capacidad de negocio
    │   │   ├── inventory/
    │   │   │   ├── domain/           # Entidades y reglas de inventario
    │   │   │   ├── application/      # Casos de uso, por ejemplo consultar existencias
    │   │   │   ├── ports/            # Contratos que necesita el dominio
    │   │   │   └── adapters/         # Conexiones con los sistemas de almacén
    │   │   ├── shipments/
    │   │   │   ├── domain/           # Envíos y reglas de selección de transportista
    │   │   │   ├── application/      # Casos de uso de creación y seguimiento
    │   │   │   ├── ports/            # Contratos de cotización y seguimiento
    │   │   │   └── adapters/         # Adaptadores de cada transportista
    │   │   └── returns/
    │   │       ├── domain/           # Reglas de aprobación e inspección
    │   │       ├── application/      # Casos de uso de devolución
    │   │       ├── ports/            # Contratos para etiqueta y recogida
    │   │       └── adapters/         # Integraciones externas necesarias
    │   ├── shared/                   # Elementos técnicos realmente transversales
    │   │   ├── configuration/
    │   │   ├── observability/
    │   │   └── security/
    │   └── workers/                  # Tareas en segundo plano, si se necesitan
    └── tests/
        ├── unit/
        └── integration/
```

Los nombres y archivos son una propuesta, no reflejan módulos backend ya implementados. Los dominios iniciales se basan en las capacidades descritas para TrackFlow; se incorporarán otros, como clientes o atención al cliente, cuando formen parte del alcance de implementación.

## Organización de routers y endpoints con FastAPI

Los routers se organizarán por recurso o dominio de negocio, no en un único archivo con todos los endpoints. Cada router de la versión correspondiente define las rutas HTTP y valida la entrada y salida; después delega el trabajo a un caso de uso del módulo correspondiente. No debe contener reglas de negocio ni comunicarse directamente con una base de datos o con la interfaz de un transportista.

`app/main.py` crea la aplicación y monta el router principal de la versión. `app/api/v1/router.py` agrupa los routers de inventario, envíos y devoluciones bajo el prefijo `/api/v1`. Se recomienda mantener los nombres de recursos en plural y usar los métodos HTTP según la operación. Por ejemplo:

```text
GET    /api/v1/inventory/{sku}            Consultar inventario de un producto
GET    /api/v1/shipments/{shipment_id}    Consultar un envío
GET    /api/v1/shipments/{shipment_id}/tracking
                                           Consultar los eventos de seguimiento
POST   /api/v1/returns                    Crear una solicitud de devolución
```

Un endpoint de seguimiento, por ejemplo, recibe el identificador, invoca el caso de uso de consulta de seguimiento y devuelve el resultado con el esquema público de respuesta. El caso de uso utiliza el contrato definido para seguimiento; el adaptador del transportista traduce entre ese contrato y la interfaz externa. Así, FastAPI gestiona la comunicación HTTP, mientras la lógica de negocio y los detalles del proveedor permanecen separados.

La versión forma parte de la ruta para permitir cambios incompatibles de contrato sin romper inmediatamente a los consumidores existentes. Los modelos de solicitud y respuesta HTTP deben representar el contrato de la interfaz y no reutilizar automáticamente las entidades internas del dominio o los modelos de persistencia.

## Organización del frontend y el backend como sistemas separados

El frontend y el backend se ejecutarán como aplicaciones independientes: el frontend presenta la interfaz y el backend ofrece las operaciones y reglas de negocio mediante una interfaz de programación de aplicaciones. Que sean sistemas separados no obliga a mantenerlos en repositorios distintos.

### Repositorio único o repositorios separados

Se recomienda inicialmente mantener ambos proyectos en el repositorio único existente, cada uno en su propia carpeta y con dependencias, pruebas, configuración y proceso de publicación independientes:

```text
uis/
└── backoffice/          # Aplicación de interfaz existente
services/
└── trackflow-api/       # Aplicación FastAPI propuesta
packages/
└── shared/              # Solo contratos o tipos compartidos si aportan valor
```

Esta opción facilita revisar cambios coordinados y compartir documentación, sin obligar a desplegar ambos sistemas juntos. Los repositorios separados serían razonables si los equipos, permisos, ciclos de publicación o requisitos de seguridad necesitasen independencia adicional. En cualquiera de las dos opciones, frontend y backend deben conservar sus propios entornos, dependencias, pruebas y versiones; los tipos compartidos no deben convertirse en una dependencia que impida cambiar o publicar cada aplicación por separado.

### Comunicación mediante la interfaz de programación de aplicaciones

El frontend se comunicará con el backend mediante solicitudes HTTP seguras y contratos documentados. El backend de FastAPI publica el contrato de la interfaz, que puede utilizarse para generar documentación y ayudar a mantener alineado al cliente. La dirección base del backend se configura para cada entorno, de modo que la interfaz de desarrollo, pruebas y producción no tenga direcciones de servicios escritas directamente en el código.

```text
Navegador → aplicación de interfaz → interfaz de programación de aplicaciones de FastAPI
                                      → caso de uso del dominio
                                      → adaptador o almacenamiento necesario
```

La interfaz debe tratar las respuestas del backend como fuente de datos y manejar estados de carga y error. La autenticación y autorización se implementan en el backend; ocultar controles en la interfaz no protege una operación.

### Variables de entorno y secretos

- La dirección base del backend y otras opciones públicas se configuran por entorno en la aplicación de interfaz. Si una variable de Next.js lleva el prefijo `NEXT_PUBLIC_`, su valor puede quedar visible para quien use la aplicación: no debe contener claves secretas.
- Las credenciales de transportistas, bases de datos, firma de sesiones y otros secretos se configuran únicamente en el entorno del backend o en un gestor de secretos. Nunca se incluyen en el código del navegador ni en el repositorio.
- Se puede mantener un archivo de ejemplo con nombres de variables y valores ficticios, pero los archivos con valores reales deben quedar excluidos del control de versiones.
- Se deben validar las variables obligatorias al iniciar cada aplicación para detectar configuraciones incompletas antes de atender solicitudes.

### Acceso desde el navegador y CORS

Si la interfaz y la interfaz de programación de aplicaciones usan distintos orígenes —por ejemplo, nombres de dominio o puertos diferentes—, el navegador aplica el mecanismo de intercambio de recursos de distinto origen (CORS). FastAPI debe permitir únicamente los orígenes conocidos de la interfaz para cada entorno. En producción no se recomienda aceptar cualquier origen; si se usan credenciales en las solicitudes, el origen permitido debe declararse explícitamente. Este mecanismo controla qué páginas pueden realizar solicitudes desde el navegador, pero no sustituye la autenticación ni la autorización.

## Criterio de separación

La separación principal es **por dominio de negocio**: inventario, envíos y devoluciones agrupan las reglas y los casos de uso de cada capacidad. Dentro de cada dominio, la separación es **por responsabilidad**:

- `domain`: reglas y conceptos propios del negocio, sin depender de herramientas externas.
- `application`: coordina los casos de uso y utiliza los contratos necesarios.
- `ports`: define las operaciones que el dominio requiere de sistemas externos, almacenamiento u otros módulos.
- `adapters`: implementa esos contratos para una tecnología concreta, como la interfaz de un transportista o un sistema de almacén.
- `api`: convierte las solicitudes de las aplicaciones consumidoras en llamadas a casos de uso; no contiene reglas de negocio.
- `shared`: contiene únicamente capacidades técnicas comunes, no reglas específicas de un dominio.

Por ejemplo, la selección de un transportista recibe opciones en un formato común mediante un contrato. Cada adaptador convierte la respuesta particular de su transportista a ese formato. Cambiar una integración no debería cambiar la regla de selección, siempre que se conserven los datos y significados que esta necesita.

## Motivo de la elección

TrackFlow debe integrar dos sistemas de almacén diferentes, un sistema de planificación de recursos empresariales antiguo y ocho transportistas con interfaces heterogéneas. Separar las reglas del negocio de esas integraciones reduce el impacto de sus cambios y facilita probar las decisiones sin depender de servicios externos. Mantener los dominios dentro de una sola aplicación reduce la complejidad operativa inicial, y sus límites permiten separar un módulo en un servicio independiente más adelante si existe una necesidad comprobada.

## Riesgos y puntos de atención

- **Integraciones externas inestables o distintas:** los sistemas de almacén, el sistema de planificación de recursos empresariales y los transportistas pueden tener formatos, límites de uso y disponibilidad diferentes. Los adaptadores deben normalizar sus respuestas y contemplar tiempos de espera, reintentos controlados, duplicados y fallos parciales. No se debe asumir que repetir una operación es seguro sin definir idempotencia.
- **Dependencias entre dominios:** al inicio los módulos comparten una aplicación, pero las llamadas directas y el acceso a datos internos de otros dominios pueden crear acoplamiento. Las interacciones deben realizarse mediante casos de uso o contratos explícitos; la extracción futura a servicios no es automática y requerirá diseñar comunicación, datos y operación distribuida.
- **Contrato de la interfaz y cambios incompatibles:** cambios en rutas, campos o significados pueden romper aplicaciones consumidoras. Mantener una versión explícita, documentar el contrato y probar la compatibilidad antes de publicar cambios.
- **Seguridad entre interfaz y backend:** CORS no autentica usuarios ni protege datos. Se deben definir autenticación, autorización por rol, validación de entrada, control de acceso a información sensible y protección de credenciales antes de exponer operaciones reales.
- **Configuración y secretos por entorno:** una dirección o credencial incorrecta puede filtrar datos o conectar con el sistema equivocado. Separar la configuración de desarrollo, pruebas y producción; no incluir secretos en el código ni en variables públicas del navegador; validar la configuración al iniciar.
- **Disponibilidad y procesamiento en segundo plano:** los procesos de ingesta y seguimiento pueden tardar o depender de terceros. Los objetivos de disponibilidad, latencia, reintentos, colas y recuperación deben definirse antes de comprometer niveles de servicio. Un trabajador separado solo se añade cuando el flujo lo requiera.
- **Datos inconsistentes y fuente de verdad:** hasta reconciliar los dos sistemas de almacén y el sistema de planificación de recursos empresariales, una consulta consolidada puede contener discrepancias. Se debe registrar el origen y momento de actualización y definir cómo se resuelven conflictos antes de automatizar decisiones.
- **Crecimiento de la aplicación modular:** una aplicación única reduce el coste inicial, pero puede volverse difícil de mantener si no se respetan los límites entre módulos. Revisar dependencias y métricas de carga; separar un módulo solo cuando haya una necesidad demostrada de escalado, aislamiento o despliegue independiente.
- **Decisiones automatizadas y explicabilidad:** la selección de transportistas y la aprobación de devoluciones deben conservar los factores utilizados, permitir auditoría y disponer de revisión humana o alternativa manual para casos excepcionales.

Estos riesgos no implican que la arquitectura propuesta los resuelva automáticamente. Requieren decisiones de diseño, pruebas, controles operativos y revisión conforme se implementen los módulos.

La propuesta describe una dirección arquitectónica, no una implementación existente. La aplicación backend, sus integraciones reales, el almacenamiento y el procesamiento en segundo plano aún están pendientes.
