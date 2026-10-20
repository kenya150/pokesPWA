
let deferredPrompt = null;

// Botón para instalar la Pokédex
const botonInstalar = document.getElementById("btnInstalar");

// Detectar si la PWA puede instalarse
window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();

    deferredPrompt = event;

    if (botonInstalar) {
        botonInstalar.style.display = "block";
    }

    console.log("La Pokédex está disponible para instalar");
});

// Instalar PWA
async function instalarApp() {
    if (!deferredPrompt) {
        alert("La aplicación todavía no está disponible para instalar.");
        return;
    }

    deferredPrompt.prompt();

    const resultado = await deferredPrompt.userChoice;

    console.log("Resultado:", resultado.outcome);

    deferredPrompt = null;

    if (botonInstalar) {
        botonInstalar.style.display = "none";
    }
}

// Detectar cuando la PWA se instala
window.addEventListener("appinstalled", () => {
    console.log("La Pokédex se instaló correctamente");

    deferredPrompt = null;

    if (botonInstalar) {
        botonInstalar.style.display = "none";
    }
});

// Registrar Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./serviceworker.js")
            .then(registro => {
                console.log("Service Worker registrado", registro);
            })
            .catch(error => {
                console.error("Error al registrar:", error);
            });
    });
}

// Consultar Pokémon
async function cargarPokemones() {
    const catalogo = document.getElementById("catalogo");
    const mensaje = document.getElementById("mensaje");

    try {
        const respuesta = await fetch(
            "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0"
        );

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los Pokémon");
        }

        const datos = await respuesta.json();

        catalogo.innerHTML = "";

        for (const pokemon of datos.results) {
            const respuestaPokemon = await fetch(pokemon.url);

            if (!respuestaPokemon.ok) {
                continue;
            }

            const detalle = await respuestaPokemon.json();

            const tarjeta = document.createElement("article");
            tarjeta.className = "card";

            const imagen = document.createElement("img");

            imagen.src =
                detalle.sprites.other["official-artwork"].front_default
                || detalle.sprites.front_default;

            imagen.alt = detalle.name;
            imagen.loading = "lazy";

            const nombre = document.createElement("h2");
            nombre.textContent = detalle.name.toUpperCase();

            const numero = document.createElement("p");

            numero.textContent =
                "N.º " + String(detalle.id).padStart(3, "0");

            const boton = document.createElement("button");
            boton.textContent = "Ver más";

            boton.addEventListener("click", () => {
                location.href = `detalle.html?pokemon=${detalle.id}`;
            });

            tarjeta.append(imagen, numero, nombre, boton);
            catalogo.appendChild(tarjeta);
        }

    } catch (error) {
        console.error(error);

        mensaje.textContent =
            "No se pudieron cargar los Pokémon. Revisa tu conexión.";
    }
}

// Iniciar catálogo
cargarPokemones();
