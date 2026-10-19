
const parametros = new URLSearchParams(window.location.search);
const id = parametros.get("pokemon");

const nombre = document.getElementById("nombreProducto");
const imagen = document.getElementById("imagenProducto");
const descripcion = document.getElementById("descripcionProducto");
const precio = document.getElementById("precioProducto");

async function cargarDetalle() {
    if (!id || !/^\d+$/.test(id)) {
        nombre.textContent = "Pokémon no válido";
        return;
    }

    try {
        const respuesta = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${id}`
        );

        if (!respuesta.ok) {
            throw new Error("Pokémon no encontrado");
        }

        const pokemon = await respuesta.json();

        nombre.textContent = pokemon.name.toUpperCase();

        imagen.src =
            pokemon.sprites.other["official-artwork"].front_default
            || pokemon.sprites.front_default;

        descripcion.textContent =
            "Tipo: " +
            pokemon.types.map(t => t.type.name).join(", ");

        precio.textContent =
            `Altura: ${pokemon.height / 10} m | ` +
            `Peso: ${pokemon.weight / 10} kg`;

    } catch (error) {
        nombre.textContent = "No se pudo cargar el Pokémon";
        console.error(error);
    }
}

cargarDetalle();
