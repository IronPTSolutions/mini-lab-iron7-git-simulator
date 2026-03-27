<!-- Mini LAB | Git Basics — IRON-7 Git Mission Control -->

:::info

  :computer: **Tipo de actividad:** Practica en clase (live coding con instructor)

  <br>

  :clock3: **Duracion estimada**: 30-40 minutos

:::

<br>

# Mini Lab | IRON-7 Git Mission Control

## Introduccion

La estacion espacial **IRON-7** necesita que gestiones su repositorio de codigo. En este lab vas a aprender los comandos basicos de git escribiendolos en un **terminal simulado** directamente en el navegador.

El dashboard te muestra en tiempo real como los archivos se mueven entre el **Working Directory**, el **Staging Area** y el **Commit History** mientras ejecutas comandos.

---

## Setup

1. Abre el dashboard: **[https://ironptsolutions.github.io/mini-lab-iron7-git-simulator/](https://ironptsolutions.github.io/mini-lab-iron7-git-simulator/)**
2. Lee la mision activa en la barra superior
3. Escribe los comandos en el terminal de la parte inferior
4. Observa como los paneles visuales se actualizan con cada comando

Escribe `help` en el terminal para ver todos los comandos disponibles.

---

## Misiones

### Mision 1 — Clonar el Repositorio

El repositorio de la estacion esta en un servidor remoto. Clonalo para empezar a trabajar.

<details>
<summary>Solucion</summary>

```
git clone https://github.com/iron-7/station-systems.git
```

</details>

---

### Mision 2 — Comprobar el Estado

Comprueba que archivos hay en el repositorio y si alguno ha cambiado.

<details>
<summary>Solucion</summary>

```
git status
```

</details>

---

### Mision 3 — Anadir Cambios al Staging

El sistema de auto-reparacion ha modificado archivos. Anadilos al staging area.

<details>
<summary>Solucion</summary>

```
git add shields.config
git add comms.js
```

O anade todos a la vez:

```
git add .
```

</details>

---

### Mision 4 — Ver las Diferencias

Revisa que ha cambiado exactamente en los archivos antes de hacer commit.

<details>
<summary>Solucion</summary>

```
git diff
```

</details>

---

### Mision 5 — Hacer Commit

Confirma los cambios con un mensaje descriptivo.

<details>
<summary>Solucion</summary>

```
git commit -m "Fix shield configuration and add comms module"
```

</details>

---

### Mision 6 — Deshacer Cambios con Restore

El ordenador ha anadido `debug.log` al staging por error (un archivo temporal que no debe estar en el repo). Sacalo del staging y descartalo.

<details>
<summary>Solucion</summary>

```
git restore --staged debug.log
git restore debug.log
```

</details>

---

### Mision 7 — Commit de Navegacion

navigation.js sigue en staging con los cambios de navegacion. Haz commit.

<details>
<summary>Solucion</summary>

```
git commit -m "Update navigation system"
```

</details>

---

### Mision 8 — Ver el Historial

Revisa el log de commits del repositorio.

<details>
<summary>Solucion</summary>

```
git log
```

</details>

---

### Mision 9 — Eliminar Archivo y Commit

El archivo `shields.config` esta obsoleto. Eliminalo, anade el nuevo `shields.js`, y haz commit.

<details>
<summary>Solucion</summary>

```
git rm shields.config
git add shields.js
git commit -m "Migrate shields to JS module"
```

</details>

---

### Mision 10 — Push al Remoto

Sube todos los cambios al servidor central.

<details>
<summary>Solucion</summary>

```
git push origin main
```

</details>

---

## Comandos disponibles

| Comando | Descripcion |
|---------|-------------|
| `git clone <url>` | Clonar un repositorio |
| `git status` | Ver el estado de los archivos |
| `git add <file>` | Anadir un archivo al staging |
| `git add .` | Anadir todos los archivos modificados |
| `git rm <file>` | Eliminar un archivo |
| `git restore <file>` | Descartar cambios en working directory |
| `git restore --staged <file>` | Sacar un archivo del staging |
| `git diff` | Ver las diferencias |
| `git commit -m "msg"` | Hacer un commit |
| `git log` | Ver el historial de commits |
| `git push origin main` | Subir los commits al remoto |
| `help` | Ver la ayuda |
| `clear` | Limpiar el terminal |

---

Happy coding! :heart:
