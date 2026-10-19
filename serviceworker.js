
const CACHE_NAME = "pwa-cache-v5";

const ARCHIVOS = [
    "./",
    "./index.html",
    "/detalle.html",
    "/js/detalle.js"
    "./manifest.json",
    "./serviceworker.js",
    "./css/style.css",
    "./js/app.js",

    "./imagenes/icons/cafee.jpg",
    "./imagenes/icons/gato.jpg",
    "./imagenes/icons/gato1.png",
    "./imagenes/icons/gato2.png",
    "./imagenes/icons/gato3.png",
    "./imagenes/icons/gato4.png",
    "./imagenes/icons/gato5.png",
    "./imagenes/icons/gato6.png",
    "./imagenes/icons/gato7.png",
    "./imagenes/icons/gato8.png",

    "./imagenes/cafe1.jpg",
    "./imagenes/cafe2.jpg",
    "./imagenes/cafe3.jpg",
    "./imagenes/cafe4.jpg",
    "./imagenes/cafe5.jpg",
    "./imagenes/cafe6.jpg",
    "./imagenes/cafe7.jpg",
    "./imagenes/cafe8.jpg"
];


// INSTALAR SERVICE WORKER
self.addEventListener("install", event => {
    console.log("Service Worker instalado");

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ARCHIVOS))
    );

    self.skipWaiting();
});


// ACTIVAR SERVICE WORKER
self.addEventListener("activate", event => {
    console.log("Service Worker activado");

    event.waitUntil(
        caches.keys().then(claves => {
            return Promise.all(
                claves
                    .filter(clave => clave !== CACHE_NAME)
                    .map(clave => caches.delete(clave))
            );
        })
    );

    self.clients.claim();
});


// 1. ESTRATEGIA CACHE FIRST
function cacheFirst(request) {
    return caches.match(request)
        .then(respuesta => {
            if (respuesta) {
                console.log("Recurso obtenido de caché:", request.url);
                return respuesta;
            }

            return fetch(request);
        });
}


// 2. ESTRATEGIA NETWORK FIRST
function networkFirst(request) {
    return fetch(request)
        .then(respuesta => {
            if (!respuesta || !respuesta.ok) {
                throw new Error("Error al obtener el recurso de la red");
            }

            const copia = respuesta.clone();

            caches.open(CACHE_NAME)
                .then(cache => cache.put(request, copia));

            console.log("Recurso obtenido de la red:", request.url);

            return respuesta;
        })
        .catch(() => {
            console.log("Sin conexión. Buscando en caché:", request.url);

            return caches.match(request)
                .then(respuesta => {
                    if (respuesta) {
                        return respuesta;
                    }

                    return new Response(
                        "No hay conexión ni una copia guardada de este recurso.",
                        {
                            status: 503,
                            headers: {
                                "Content-Type": "text/plain; charset=utf-8"
                            }
                        }
                    );
                });
        });
}


// INTERCEPTAR SOLICITUDES
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);

    // Solo manejar solicitudes del mismo origen
    if (url.origin !== self.location.origin) {
        return;
    }

    // Elegir estrategia según el recurso
    if (
        url.pathname.endsWith(".jpg") ||
        url.pathname.endsWith(".png") ||
        url.pathname.endsWith(".jpeg") ||
        url.pathname.endsWith(".webp")
    ) {
        // Primero caché para las imágenes
        event.respondWith(cacheFirst(event.request));
    } else {
        // Primero red para HTML, CSS, JS y otros recursos
        event.respondWith(networkFirst(event.request));
    }
});