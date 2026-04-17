const API_URL = "http://localhost:5130/api/productos";

let editandoId = null;

document.addEventListener("DOMContentLoaded", obtenerProductos);

// 🔹 OBTENER PRODUCTOS
async function obtenerProductos() {
    try {
        const res = await fetch(API_URL);
        const productos = await res.json();

        const contenedor = document.getElementById("contenedorProductos");
        contenedor.innerHTML = "";

        productos.forEach(p => {
            const card = document.createElement("div");
            card.className = "card";

            let media = "";

            if (p.imagenUrl) {
                media = `<img src="${p.imagenUrl}" alt="${p.nombre}">`;
            }

            card.innerHTML = `
                ${media}
                <h3>${p.nombre}</h3>
                <p>Precio: $${p.precio ?? 0}</p>

                <button onclick="cargarEdicion(${p.id}, '${p.nombre}', ${p.precio})">
                    Editar
                </button>

                <button class="btn-delete" onclick="eliminarProducto(${p.id})">
                    Eliminar
                </button>
            `;

            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// 🔹 CREAR / ACTUALIZAR
async function guardarProducto() {
    const nombre = document.getElementById("nombre").value;
    const precio = parseFloat(document.getElementById("precio").value);
    const imagen = document.getElementById("imagen").files[0];

    if (!nombre || isNaN(precio)) {
        alert("Completa los campos correctamente");
        return;
    }

    const formData = new FormData();
    formData.append("Nombre", nombre);
    formData.append("Precio", precio);

    if (imagen) {
        formData.append("imagen", imagen);
    }

    try {
        if (editandoId === null) {
            // CREATE
            await fetch(API_URL, {
                method: "POST",
                body: formData
            });
        } else {
            // UPDATE (sin cambiar imagen por ahora)
            await fetch(`${API_URL}/${editandoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre,
                    precio,
                    imagenUrl: null
                })
            });

            editandoId = null;
        }

        limpiarInputs();
        obtenerProductos();

    } catch (error) {
        console.error("Error al guardar:", error);
    }
}

// 🔹 CARGAR PARA EDITAR
function cargarEdicion(id, nombre, precio) {
    document.getElementById("nombre").value = nombre;
    document.getElementById("precio").value = precio;

    editandoId = id;
}

// 🔹 ELIMINAR
async function eliminarProducto(id) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        obtenerProductos();

    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

// 🔹 LIMPIAR INPUTS
function limpiarInputs() {
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("imagen").value = "";
}