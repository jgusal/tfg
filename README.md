# Documentación Técnica TFG
## Introducción
El proyecto ha consistido en el desarrollo de una plataforma de recolección de datos procedentes de sensores inteligentes en explotaciones agrícolas, con el objetivo de permitir la visualización de un histórico al usuario, así como la generación de nueva información útil a partir de los datos recolectados, más concretamente, un sistema de recomendación de riego.
Para ello, tras el estudio de los requisitos y el diseño del sistema, el producto final se encuentra estructurado en cuatro capas.


La primera, la capa de ingesta, sirve como punto de entrada a la plataforma, y cumple la función de unificar los múltiples flujos de datos procedentes de los sensores en uno solo y distribuirlo a los distintos módulos de la plataforma. Para este fin se ha hecho uso de Apache Kafka.

La segunda capa es la capa de persistencia, la cual deberá de almacenar la información recolectada por los sensores, así como otra información necesaria para el funcionamiento de la plataforma como los nombres de usuario y contraseñas, los terrenos registrados y los sensores asociados a cada terreno. Se ha escogido la base de datos NoSQL orientada a documentos MongoDB para cumplir este fin. Más concretamente, se hará un despliegue distribuido de forma que se puedan aprovechar las posibilidades de fragmentación y replicación que la herramienta nos ofrece. Gracias a la fragmentación, podremos mejorar el ancho de banda tanto de escritura como de lectura de datos de los sensores para poder hacer frente a la alta demanda requerida para este tipo de plataforma. Mediante la replicación, se podrá garantizar que en caso de accidente, la información almacenada en un nodo no se perderá.

La tercera capa consiste en la capa de procesado, encargada de generar información útil a partir de los datos recolectados por los sensores. Se ha desarrollado un sistema de recomendación de riego basado en tres modelos. El primero consiste en el uso de la ecuación de Hargreaves para realizar las recomendaciones, es el considerado modelo tradicional. Además, se han entrenado otros dos modelos de inteligencia artificial basándose en el primero, haciendo uso de las técnicas Random Forest y Gradient Boosting.

Por último, está la capa de visualización, compuesta por un Dashboard presentado como aplicación web a través de la cual el usuario podrá interactuar con la plataforma. Más concretamente, podrá registrar terrenos, visualizar datos de los sensores y solicitar la realización de recomendaciones.

Toda esta plataforma se ha diseñado para desplegarse en un entorno distribuido haciendo uso de la tecnología de contenedores de Docker y la herramienta de orquestación de despliegues Kubernetes.

## Descripción del repositorio
En este repositorio se almacena el código fuente utilizado para el desarrollo de la plataforma. Por una parte están las especificaciones de despliegue de Kubernetes, junto a sus scripts de despliegue automático y sus rutinas de tests unitarios.
Por otro lado, se encuentra el código fuente de las imágenes de los distintos módulos que conforman la plataforma, que incluyen el código fuente del módulo, el Dockerfile para construir la imagen y un script para ejecutar la construcción y la subida de la imagen a la plataforma DockerHub.

## Estructura del repositorio
### Consumidor
Contiene el código fuente utilizado para el microservicio consumidor, el cual recoge los datos que llegan a la capa de ingesta y los almacena directamente en la base de datos.
### Dashboard
Contiene el código de la aplicación web Dashboard para la interacción del usuario final con la plataforma. En el fichero `app.js` se encuentra todo el código de despliegue del back-end NodeJS, mientras que en la carpeta `src` se encuentran todos los recursos utilizados para servir la aplicación web.
### Recomendador
En él se encuentra el código del recomendador de riego junto a los ficheros que codifican los modelos entrenados. Además, se incluye el código fuente de la API REST con Flask que actúa como endpoint para que otros módulos de la plataforma puedan interactuar con el recomendador.
### Kubernetes
En esta carpeta se encuentran una serie de subcarpetas correspondientes al código de despliegue de cada módulo individual. En la carpeta de cada módulo se encuentra el script de despliegue de ese módulo concreto. En la raíz se encuentra un script de despliegue que a su vez llamará al resto de scripts de despliegues para desplegar una versión preconfigurada de la plataforma.

## Instalación de Kubernetes
Para instalar Kubernetes en los distintos nodos del clúster, se han incluido dos scripts en la carpeta `Kubernetes`. El primero, `InstallKuber.sh`, instalará Kubernetes en el nodo que lo ejecuta. Es importante destacar que están escritos para la instalación de Kubernetes en la distribución de Linux Debian, con lo que su uso en otra distribución puede requerir la modificación del script. Por último, se incluye el script `InitKuber.sh`, el cual debe de ser ejecutado en la máquina que servirá como Maestro de Kubernetes. Este script ejecutará todas las rutinas necesarias para inicializar el clúster.

Por último, es importante destacar que en caso de existir un firewall en las máquinas utilizadas, debe de permitir la enrutación de paquetes (tabla FORWARD en iptables debe de tener la acción ACCEPT), ya que esta funcionalidad es necesaria para el correcto funcionamiento de la red superpuesta de Kubernetes. Para configurar el firewall iptables, el cual viene incluido por defecto en Debian, se debe de ejecutar el comando `iptables -P FORWARD ACCEPT`.
