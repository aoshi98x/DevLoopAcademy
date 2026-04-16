## Acerca de este curso

El desarrollo multijugador siempre ha sido uno de los mayores retos en la creación de videojuegos. En este curso, desmitificaremos el proceso utilizando **Unity Netcode for GameObjects (NGO)**, la solución oficial de Unity para crear arquitecturas de red escalables y robustas.

Aprenderás desde los conceptos básicos de servidor/cliente hasta la implementación de un sistema de emparejamiento (Matchmaking) funcional.

### ¿Qué vas a lograr?
* Comprender la diferencia entre **Host, Cliente y Servidor Dedicado**.
* Gestionar el estado del juego en tiempo real utilizando `NetworkVariables`.
* Dominar la comunicación en red a través de **RPCs** (ServerRpc y ClientRpc).
* Crear interfaces dinámicas con **TextMeshPro** para mostrar scores y temporizadores.
* Evitar los dolores de cabeza más comunes: aprenderás la correcta sincronización e instanciación de red, incluyendo la gestión y aplicación de **Overrides en Prefabs** para evitar desincronizaciones entre el servidor y los clientes.

---

## Estructura del Temario

### Módulo 1: Fundamentos de Arquitectura de Red
1. Introducción a Netcode for GameObjects.
2. Configuración del proyecto y NetworkManager.
3. Topologías de red: ¿Por qué usar la arquitectura Host-Client?
4. Tu primer objeto sincronizado: El NetworkTransform.

### Módulo 2: Comunicación y Estado
1. ¿Qué son y cómo usar las `NetworkVariables`?
2. Sincronización de puntajes entre jugadores en tiempo real.
3. Llamadas a Procedimientos Remotos (RPCs): ServerRpc vs ClientRpc.
4. Optimización de tráfico: ¿Qué datos realmente necesitan enviarse?

### Módulo 3: Spawning y Gestión de Entidades
1. Instanciación en red (Network Spawning).
2. Asignación de Ownership: ¿Quién controla qué objeto?
3. **Masterclass:** Sincronización de Prefabs y resolución de Overrides perdidos.
4. Destrucción de objetos y limpieza del servidor.

### Módulo 4: Matchmaking y Lobbies
1. Introducción a Unity Gaming Services (UGS).
2. Creación de un Lobby público y privado.
3. UI del sistema de emparejamiento con temporizadores de 30 segundos.
4. Lógica de desconexión y reconexión de clientes.

---

### Requisitos previos
* Dominio intermedio de **C#** (Eventos, Delegados, Corrutinas).
* Experiencia previa con la interfaz de Unity y creación de interfaces de usuario.
* Unity 2022 LTS o superior instalado.