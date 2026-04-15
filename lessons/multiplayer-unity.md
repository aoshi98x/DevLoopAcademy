# Creación de Lobbies y Temporizadores
Bienvenido a esta lección oficial cargada desde un archivo `.md`.

## El problema del emparejamiento
Cuando los jugadores se conectan, no queremos lanzarlos directamente al juego. Necesitamos una sala de espera o *Lobby*. Si el contador llega a cero y la partida no se llena, debemos darle al jugador la opción de cancelar.

### Requisitos del sistema
* Un estado de jugador (Buscando, En Lobby, Listo).
* Un contador de **30 segundos** sincronizado.
* Un botón de "Salir del emparejamiento".

---
> **Nota del instructor:** Este texto ya no está quemado en el código de React. ¡Lo estamos leyendo desde un archivo externo!