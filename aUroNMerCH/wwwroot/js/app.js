const API_URL = "http://localhost:5130/api/productos";

let editandoId = null;

document.addEventListener("DOMContentLoaded", () => {
    obtenerProductos();

    // Preview de imagen
    document.getElementById("imagen").addEventListener("change", mostrarPreview);
});

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
                media = `<img src="http://localhost:5130${p.imagenUrl}" alt="${p.nombre}">`;
            }

            card.innerHTML = `
                ${media}
                <h3>${p.nombre}</h3>
                <p>Precio: $${p.precio ?? 0}</p>
                <p class="categoria">${p.categoria ?? "Sin categoría"}</p>

                <button class="btn-edit">Editar</button>
                <button class="btn-delete">Eliminar</button>
            `;

            card.querySelector(".btn-edit").onclick = () => {
                cargarEdicion(p);
            };

            card.querySelector(".btn-delete").onclick = () => {
                eliminarProducto(p.id);
            };

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
    const categoria = document.getElementById("categoria").value;
    const imagen = document.getElementById("imagen").files[0];

    if (!nombre || isNaN(precio) || !categoria) {
        alert("Completa todos los campos");
        return;
    }

    const formData = new FormData();
    formData.append("Nombre", nombre);
    formData.append("Precio", precio);
    formData.append("Categoria", categoria);

    if (imagen) {
        formData.append("imagen", imagen);
    }

    try {
        let res;

        if (editandoId === null) {
            // CREATE
            res = await fetch(API_URL, {
                method: "POST",
                body: formData
            });
        } else {
            // UPDATE
            res = await fetch(`${API_URL}/${editandoId}`, {
                method: "PUT",
                body: formData
            });

            editandoId = null;
        }

        if (!res.ok) {
            const error = await res.text();
            console.error("ERROR:", error);
            alert("Error en el servidor");
            return;
        }

        limpiarInputs();
        obtenerProductos();

    } catch (error) {
        console.error("Error al guardar:", error);
    }
}

// 🔹 CARGAR PARA EDITAR
function cargarEdicion(producto) {
    console.log("EDITANDO:", producto.id);

    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("precio").value = producto.precio;
    document.getElementById("categoria").value = producto.categoria;

    document.getElementById("tituloForm").textContent = "Editando producto";
    document.getElementById("btnGuardar").textContent = "Actualizar";
    document.getElementById("btnCancelar").style.display = "inline-block";

    if (producto.imagenUrl) {
        const preview = document.getElementById("preview");
        preview.src = "http://localhost:5130" + producto.imagenUrl;
        preview.style.display = "block";
    }

    editandoId = producto.id;
}

// 🔹 ELIMINAR
async function eliminarProducto(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            alert("Error al eliminar");
            return;
        }

        obtenerProductos();

    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

// 🔹 PREVIEW IMAGEN
function mostrarPreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("preview");

    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
}

// 🔹 LIMPIAR INPUTS
function limpiarInputs() {
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("imagen").value = "";

    document.getElementById("tituloForm").textContent = "Agregar Producto";
    document.getElementById("btnGuardar").textContent = "Guardar";
    document.getElementById("btnCancelar").style.display = "none";

    const preview = document.getElementById("preview");
    preview.src = "";
    preview.style.display = "none";

    editandoId = null;
}