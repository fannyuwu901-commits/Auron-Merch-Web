const API_URL = "http://localhost:5130/api/productos";
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
    window.location.href = "login.html";
}

let editandoId = null;
let todosLosProductos = [];
let categoriaActiva = "Todos";
let textoBusqueda = "";

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
    construirNavAuth();
    obtenerProductos();

    // Mostrar form SOLO si es Admin
    if (user.rol !== "Admin") {
        document.getElementById("formPanel").style.display = "none";
    }

    // Preview imagen
    document.getElementById("imagen").addEventListener("change", mostrarPreview);

    // Mostrar nombre del archivo en el label
    document.getElementById("imagen").addEventListener("change", (e) => {
        const file = e.target.files[0];
        const labelText = document.getElementById("fileLabelText");
        if (file) {
            labelText.textContent = "✔ " + file.name;
        } else {
            labelText.textContent = "📁 Subir imagen";
        }
    });
});

/* ══════════════════════════════════════
   NAV AUTH
══════════════════════════════════════ */
function construirNavAuth() {
    const navAuth = document.getElementById("navAuth");
    navAuth.innerHTML = "";

    const salir = document.createElement("button");
    salir.textContent = "Salir";
    salir.onclick = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "login.html";
    };
    navAuth.appendChild(salir);

    if (user.rol === "Admin") {
        const adminBtn = document.createElement("button");
        adminBtn.textContent = "+ Admin";
        adminBtn.className = "btn-admin";
        adminBtn.onclick = () => {
            document.getElementById("formPanel").scrollIntoView({ behavior: "smooth" });
        };
        navAuth.appendChild(adminBtn);
    }
}

/* ══════════════════════════════════════
   OBTENER PRODUCTOS
══════════════════════════════════════ */
async function obtenerProductos() {
    try {
        const res = await fetch(API_URL, {
            headers: { "Authorization": "Bearer " + token }
        });
        todosLosProductos = await res.json();
        renderProductos();
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

/* ══════════════════════════════════════
   RENDER CON FILTROS
══════════════════════════════════════ */
function renderProductos() {
    const contenedor = document.getElementById("contenedorProductos");
    contenedor.innerHTML = "";

    const filtrados = todosLosProductos.filter(p => {
        const matchCat = categoriaActiva === "Todos" || p.categoria === categoriaActiva;
        const matchText = p.nombre.toLowerCase().includes(textoBusqueda.toLowerCase());
        return matchCat && matchText;
    });

    document.getElementById("contadorResultados").textContent =
        `${filtrados.length} producto${filtrados.length !== 1 ? "s" : ""}`;

    if (filtrados.length === 0) {
        contenedor.innerHTML = `<div class="no-results">No se encontraron productos 🔍</div>`;
        return;
    }

    filtrados.forEach((p, i) => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.animationDelay = `${i * 0.05}s`;

        const mediaHTML = p.imagenUrl
            ? `<img src="http://localhost:5130${p.imagenUrl}" alt="${p.nombre}">`
            : `<div class="img-placeholder" style="height:210px;"><span class="ph-x"></span></div>`;

        card.innerHTML = `
            ${mediaHTML}
            <div class="card-body">
                <h3>${p.nombre}</h3>
                <p class="precio">$${(p.precio ?? 0).toFixed(2)}</p>
                <p class="categoria">${p.categoria ?? "Sin categoría"}</p>
            </div>
        `;

        if (user.rol === "Admin") {
            const actions = document.createElement("div");
            actions.className = "card-actions";
            actions.style.padding = "0 14px 14px";

            const btnEdit = document.createElement("button");
            btnEdit.textContent = "Editar";
            btnEdit.className = "btn-edit";
            btnEdit.onclick = () => cargarEdicion(p);

            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Eliminar";
            btnDelete.className = "btn-delete";
            btnDelete.onclick = () => eliminarProducto(p.id);

            actions.appendChild(btnEdit);
            actions.appendChild(btnDelete);
            card.appendChild(actions);
        }

        contenedor.appendChild(card);
    });
}

/* ══════════════════════════════════════
   FILTROS
══════════════════════════════════════ */
function filtrarCategoria(btn) {
    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    categoriaActiva = btn.dataset.cat;
    renderProductos();
}

function filtrar() {
    textoBusqueda = document.getElementById("buscador").value;
    renderProductos();
}

function verTodo() {
    categoriaActiva = "Todos";
    textoBusqueda = "";
    document.getElementById("buscador").value = "";
    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
    document.querySelector('.filtro-btn[data-cat="Todos"]').classList.add("active");
    renderProductos();
}

/* ══════════════════════════════════════
   GUARDAR (CREAR o EDITAR)
══════════════════════════════════════ */
async function guardarProducto() {
    const nombre = document.getElementById("nombre").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);
    const categoria = document.getElementById("categoria").value;
    const imagen = document.getElementById("imagen").files[0];

    if (!nombre || isNaN(precio) || !categoria) {
        alert("Completa todos los campos obligatorios");
        return;
    }

    const formData = new FormData();
    formData.append("Nombre", nombre);
    formData.append("Precio", precio);
    formData.append("Categoria", categoria);
    if (imagen) formData.append("imagen", imagen);

    try {
        let res;

        if (editandoId === null) {
            res = await fetch(API_URL, {
                method: "POST",
                headers: { "Authorization": "Bearer " + token },
                body: formData
            });
        } else {
            res = await fetch(`${API_URL}/${editandoId}`, {
                method: "PUT",
                headers: { "Authorization": "Bearer " + token },
                body: formData
            });
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

/* ══════════════════════════════════════
   CARGAR EDICIÓN
══════════════════════════════════════ */
function cargarEdicion(producto) {
    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("precio").value = producto.precio;
    document.getElementById("categoria").value = producto.categoria;
    document.getElementById("tituloForm").textContent = "✏ Editando: " + producto.nombre;

    if (producto.imagenUrl) {
        const preview = document.getElementById("preview");
        preview.src = "http://localhost:5130" + producto.imagenUrl;
        preview.style.display = "block";
    }

    // Mostrar botón Cancelar al editar
    document.getElementById("btnCancelar").style.display = "block";

    editandoId = producto.id;
    document.getElementById("formPanel").scrollIntoView({ behavior: "smooth" });
}

/* ══════════════════════════════════════
   ELIMINAR
══════════════════════════════════════ */
async function eliminarProducto(id) {
    if (!confirm("¿Eliminar este producto?")) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });

        if (!res.ok) { alert("Error al eliminar"); return; }
        obtenerProductos();

    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

/* ══════════════════════════════════════
   PREVIEW IMAGEN
══════════════════════════════════════ */
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

/* ══════════════════════════════════════
   LIMPIAR FORM
══════════════════════════════════════ */
function limpiarInputs() {
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("imagen").value = "";
    document.getElementById("fileLabelText").textContent = "📁 Subir imagen";

    const preview = document.getElementById("preview");
    preview.src = "";
    preview.style.display = "none";

    document.getElementById("tituloForm").textContent = "Agregar Producto";
    document.getElementById("btnCancelar").style.display = "none";

    editandoId = null;
}