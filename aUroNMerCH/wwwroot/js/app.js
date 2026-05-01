const API_URL = "http://localhost:5130/api/productos";
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");


if (!user || !token) {
    window.location.href = "login.html";
}

let editandoId = null;

document.addEventListener("DOMContentLoaded", () => {
    obtenerProductos();
    document.getElementById("imagen").addEventListener("change", mostrarPreview);
});

async function obtenerProductos() {
    try {
        const res = await fetch(API_URL, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

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
            `;

            if (user.rol === "Admin") {
                const btnEdit = document.createElement("button");
                btnEdit.textContent = "Editar";
                btnEdit.className = "btn-edit";
                btnEdit.onclick = () => cargarEdicion(p);

                const btnDelete = document.createElement("button");
                btnDelete.textContent = "Eliminar";
                btnDelete.className = "btn-delete";
                btnDelete.onclick = () => eliminarProducto(p.id);

                card.appendChild(btnEdit);
                card.appendChild(btnDelete);
            }

            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}


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
            res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                },
                body: formData
            });
        } else {
            res = await fetch(`${API_URL}/${editandoId}`, {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + token
                },
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


function cargarEdicion(producto) {
    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("precio").value = producto.precio;
    document.getElementById("categoria").value = producto.categoria;

    document.getElementById("tituloForm").textContent = "Editando producto";

    if (producto.imagenUrl) {
        const preview = document.getElementById("preview");
        preview.src = "http://localhost:5130" + producto.imagenUrl;
        preview.style.display = "block";
    }

    editandoId = producto.id;
}

async function eliminarProducto(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
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

function limpiarInputs() {
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("imagen").value = "";

    const preview = document.getElementById("preview");
    preview.src = "";
    preview.style.display = "none";

    document.getElementById("tituloForm").textContent = "Agregar Producto";

    editandoId = null;
}