const API_URL = "http://localhost:5130/api/productos";
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
    window.location.href = "login.html";
}

let todosLosProductos = [];
let categoriaActiva = "Todos";
let textoBusqueda = "";

/* ══════════════════════════════════════
   CARRITO — Estado
══════════════════════════════════════ */
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function agregarAlCarrito(producto) {
    const existente = carrito.find(item => item.id === producto.id);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    guardarCarrito();
    actualizarBadge();
    renderCarritoPanel();
    mostrarToast(`${producto.nombre} añadido al carrito`);
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(i => i.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
        carrito = carrito.filter(i => i.id !== id);
    }
    guardarCarrito();
    actualizarBadge();
    renderCarritoPanel();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(i => i.id !== id);
    guardarCarrito();
    actualizarBadge();
    renderCarritoPanel();
}

function vaciarCarrito() {
    if (!confirm("¿Vaciar el carrito?")) return;
    carrito = [];
    guardarCarrito();
    actualizarBadge();
    renderCarritoPanel();
}

function checkout() {
    if (carrito.length === 0) return;
    alert("¡Gracias por tu compra! Esta función estará disponible próximamente.");
}

function actualizarBadge() {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;
    const total = carrito.reduce((acc, i) => acc + i.cantidad, 0);
    if (total > 0) {
        badge.textContent = total;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }
}

/* ══════════════════════════════════════
   CARRITO — Panel UI
══════════════════════════════════════ */
function toggleCart() {
    const panel = document.getElementById("cartPanel");
    const overlay = document.getElementById("cartOverlay");
    if (!panel || !overlay) return;
    const abierto = panel.classList.toggle("open");
    overlay.classList.toggle("open", abierto);
}

function renderCarritoPanel() {
    const lista = document.getElementById("cartItemsList");
    const footer = document.getElementById("cartFooter");
    const emptyEl = document.getElementById("cartEmpty");
    if (!lista) return;

    // Limpiar items (mantener el empty div)
    const items = lista.querySelectorAll(".cart-item");
    items.forEach(el => el.remove());

    if (carrito.length === 0) {
        if (emptyEl) emptyEl.style.display = "flex";
        if (footer) footer.style.display = "none";
        return;
    }

    if (emptyEl) emptyEl.style.display = "none";
    if (footer) footer.style.display = "flex";

    let subtotal = 0;

    carrito.forEach(item => {
        subtotal += (item.precio ?? 0) * item.cantidad;

        const el = document.createElement("div");
        el.className = "cart-item";

        const imgHtml = item.imagenUrl
            ? `<img class="cart-item-img" src="http://localhost:5130${item.imagenUrl}" alt="${item.nombre}">`
            : `<div class="cart-item-img-placeholder"><span class="ph-x"></span></div>`;

        el.innerHTML = `
            ${imgHtml}
            <div class="cart-item-info">
                <p class="cart-item-name">${item.nombre}</p>
                <p class="cart-item-cat">${item.categoria ?? ""}</p>
                <p class="cart-item-price">$${((item.precio ?? 0) * item.cantidad).toFixed(2)}</p>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="cambiarCantidad(${item.id}, -1)">−</button>
                    <span class="qty-value">${item.cantidad}</span>
                    <button class="qty-btn" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="eliminarDelCarrito(${item.id})" title="Eliminar">✕</button>
        `;
        lista.appendChild(el);
    });

    // Totales
    const subtotalEl = document.getElementById("cartSubtotal");
    const totalEl = document.getElementById("cartTotal");
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
let toastTimeout;
function mostrarToast(mensaje) {
    let toast = document.getElementById("cartToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "cartToast";
        toast.className = "cart-toast";
        toast.innerHTML = `<span class="cart-toast-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
        </span><span id="cartToastMsg">${mensaje}</span>`;
        document.body.appendChild(toast);
    } else {
        document.getElementById("cartToastMsg").textContent = mensaje;
    }

    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2400);
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
    construirNavAuth();
    obtenerProductos();
    actualizarBadge();
    renderCarritoPanel();

    // Carrito util sidebar
    const cartUtil = document.getElementById("cartUtil");
    if (cartUtil) cartUtil.onclick = toggleCart;

    // Imagen field
    const imgInput = document.getElementById("imagen");
    if (imgInput) {
        imgInput.addEventListener("change", (e) => {
            mostrarPreview(e);
            const file = e.target.files[0];
            document.getElementById("fileLabelText").textContent = file
                ? "✔ " + file.name
                : "📁 Subir imagen";
        });
    }

    // Cerrar search results si se hace click fuera
    document.addEventListener("click", (e) => {
        const wrap = document.querySelector(".search-wrap");
        if (wrap && !wrap.contains(e.target)) {
            cerrarSearchResults();
        }
    });
});

/* ══════════════════════════════════════
   DRAWER
══════════════════════════════════════ */
function toggleDrawer() {
    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("drawerOverlay");
    const btn = document.getElementById("hamburgerBtn");
    const abierto = drawer.classList.toggle("open");
    overlay.classList.toggle("open", abierto);
    btn.classList.toggle("open", abierto);
}

/* ══════════════════════════════════════
   NAV AUTH
══════════════════════════════════════ */
function construirNavAuth() {
    construirAuthEn("navAuth", false);
    construirAuthEn("drawerAuth", true);
}

function construirAuthEn(contenedorId, esDrawer) {
    const nav = document.getElementById(contenedorId);
    if (!nav) return;
    nav.innerHTML = "";

    const salir = document.createElement("button");
    salir.textContent = "Salir";
    salir.onclick = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "login.html";
    };
    nav.appendChild(salir);

    if (user.rol === "Admin") {
        const adminBtn = document.createElement("button");
        adminBtn.textContent = esDrawer ? "Panel Admin" : "+ Admin";
        adminBtn.className = "btn-admin";
        adminBtn.onclick = () => {
            if (esDrawer) toggleDrawer();
            const fp = document.getElementById("formPanel");
            if (fp) fp.scrollIntoView({ behavior: "smooth" });
            else window.location.href = "productos.html";
        };
        nav.appendChild(adminBtn);
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

        const recientesGrid = document.getElementById("recientesGrid");
        if (recientesGrid) {
            renderRecientes();
            renderSidebar();
        }

        const contenedor = document.getElementById("contenedorProductos");
        if (contenedor) {
            if (user.rol !== "Admin") {
                const fp = document.getElementById("formPanel");
                if (fp) fp.style.display = "none";
            }
            renderProductos();
        }

    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

/* ══════════════════════════════════════
   HOMEPAGE — RECIENTES (últimos 6)
══════════════════════════════════════ */
function renderRecientes() {
    const grid = document.getElementById("recientesGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const recientes = [...todosLosProductos].reverse().slice(0, 6);

    if (recientes.length === 0) {
        grid.innerHTML = `<div class="no-results">No hay productos aún 🔍</div>`;
        return;
    }

    recientes.forEach((p, i) => {
        const card = crearCard(p, i, false);
        grid.appendChild(card);
    });
}

/* ══════════════════════════════════════
   HOMEPAGE — SIDEBAR DESTACADOS
══════════════════════════════════════ */
function renderSidebar() {
    const container = document.getElementById("sidebarFeatured");
    if (!container) return;
    container.innerHTML = "";

    const destacados = todosLosProductos.slice(0, 3);

    destacados.forEach(p => {
        const card = document.createElement("div");
        card.className = "sidebar-card";
        card.onclick = () => window.location.href = "productos.html";

        const imgHtml = p.imagenUrl
            ? `<img src="http://localhost:5130${p.imagenUrl}" alt="${p.nombre}" style="width:100%;height:72px;object-fit:cover;display:block;">`
            : `<div class="sb-img-wrap"><span class="ph-x"></span></div>`;

        card.innerHTML = `
            ${p.imagenUrl ? `<div class="sb-img-wrap" style="height:72px;overflow:hidden;">${imgHtml}</div>` : `<div class="sb-img-wrap"><span class="ph-x"></span></div>`}
            <p class="sb-label">${p.nombre}</p>
        `;
        container.appendChild(card);
    });

    for (let i = destacados.length; i < 3; i++) {
        const card = document.createElement("div");
        card.className = "sidebar-card";
        card.innerHTML = `<div class="sb-img-wrap"><span class="ph-x"></span></div><p class="sb-label">—</p>`;
        container.appendChild(card);
    }
}

/* ══════════════════════════════════════
   BÚSQUEDA EN TIEMPO REAL
══════════════════════════════════════ */
function buscarProductos() {
    const query = document.getElementById("buscador").value.trim().toLowerCase();
    const results = document.getElementById("searchResults");
    if (!results) return;

    if (query.length < 2) {
        cerrarSearchResults();
        return;
    }

    const filtrados = todosLosProductos.filter(p =>
        p.nombre.toLowerCase().includes(query) ||
        (p.categoria && p.categoria.toLowerCase().includes(query))
    ).slice(0, 6);

    results.innerHTML = "";

    if (filtrados.length === 0) {
        results.innerHTML = `<div class="search-result-item"><span style="color:var(--muted);font-size:0.85rem;">Sin resultados para "${query}"</span></div>`;
    } else {
        filtrados.forEach(p => {
            const item = document.createElement("div");
            item.className = "search-result-item";
            item.onclick = () => window.location.href = "productos.html";

            const imgHtml = p.imagenUrl
                ? `<img class="sri-img" src="http://localhost:5130${p.imagenUrl}" alt="${p.nombre}">`
                : `<div class="sri-img" style="display:flex;align-items:center;justify-content:center;color:var(--border);font-size:1.2rem;">✕</div>`;

            item.innerHTML = `
                ${imgHtml}
                <div class="sri-info">
                    <p class="sri-name">${p.nombre}</p>
                    <p class="sri-price">$${(p.precio ?? 0).toFixed(2)}</p>
                </div>
                <span style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;">${p.categoria ?? ""}</span>
            `;
            results.appendChild(item);
        });
    }

    results.classList.add("open");
}

function cerrarSearchResults() {
    const results = document.getElementById("searchResults");
    if (results) results.classList.remove("open");
}

/* ══════════════════════════════════════
   PÁGINA PRODUCTOS — RENDER COMPLETO
══════════════════════════════════════ */
function renderProductos() {
    const contenedor = document.getElementById("contenedorProductos");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const filtrados = todosLosProductos.filter(p => {
        const matchCat = categoriaActiva === "Todos" || p.categoria === categoriaActiva;
        const matchText = p.nombre.toLowerCase().includes(textoBusqueda.toLowerCase());
        return matchCat && matchText;
    });

    const contador = document.getElementById("contadorResultados");
    if (contador) {
        contador.textContent = `${filtrados.length} producto${filtrados.length !== 1 ? "s" : ""}`;
    }

    if (filtrados.length === 0) {
        contenedor.innerHTML = `<div class="no-results">No se encontraron productos 🔍</div>`;
        return;
    }

    filtrados.forEach((p, i) => {
        const card = crearCard(p, i, user.rol === "Admin");
        contenedor.appendChild(card);
    });
}

/* ══════════════════════════════════════
   CREAR CARD (reutilizable)
══════════════════════════════════════ */
function crearCard(p, i, conAcciones) {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${i * 0.05}s`;

    const mediaHTML = p.imagenUrl
        ? `<img src="http://localhost:5130${p.imagenUrl}" alt="${p.nombre}">`
        : `<div class="img-placeholder"><span class="ph-x"></span></div>`;

    card.innerHTML = `
        ${mediaHTML}
        <div class="card-body">
            <h3>${p.nombre}</h3>
            <p class="precio">$${(p.precio ?? 0).toFixed(2)}</p>
            <p class="categoria">${p.categoria ?? "Sin categoría"}</p>
        </div>
    `;

    // Botón añadir al carrito (siempre visible para usuarios)
    const btnCart = document.createElement("button");
    btnCart.className = "btn-add-cart";
    btnCart.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        Añadir al carrito
    `;
    btnCart.onclick = (e) => {
        e.stopPropagation();
        agregarAlCarrito(p);
        btnCart.classList.add("added");
        btnCart.innerHTML = `✓ Añadido`;
        setTimeout(() => {
            btnCart.classList.remove("added");
            btnCart.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Añadir al carrito
            `;
        }, 1200);
    };
    card.appendChild(btnCart);

    if (conAcciones) {
        const actions = document.createElement("div");
        actions.className = "card-actions";

        const btnEdit = document.createElement("button");
        btnEdit.textContent = "Editar";
        btnEdit.className = "btn-edit";
        btnEdit.onclick = (e) => { e.stopPropagation(); cargarEdicion(p); };

        const btnDelete = document.createElement("button");
        btnDelete.textContent = "Eliminar";
        btnDelete.className = "btn-delete";
        btnDelete.onclick = (e) => { e.stopPropagation(); eliminarProducto(p.id); };

        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);
        card.appendChild(actions);
    }

    return card;
}

/* ══════════════════════════════════════
   FILTROS
══════════════════════════════════════ */
function filtrarCategoria(btn) {
    document.querySelectorAll(".filtro-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.cat === btn.dataset.cat);
    });
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
    const buscador = document.getElementById("buscador");
    if (buscador) buscador.value = "";
    document.querySelectorAll(".filtro-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.cat === "Todos");
    });
    renderProductos();
}

/* ══════════════════════════════════════
   CRUD
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
        const url = editandoId === null ? API_URL : `${API_URL}/${editandoId}`;
        const method = editandoId === null ? "POST" : "PUT";

        const res = await fetch(url, {
            method,
            headers: { "Authorization": "Bearer " + token },
            body: formData
        });

        if (!res.ok) {
            console.error("ERROR:", await res.text());
            alert("Error en el servidor");
            return;
        }

        limpiarInputs();
        obtenerProductos();

    } catch (error) {
        console.error("Error al guardar:", error);
    }
}

let editandoId = null;

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

    document.getElementById("btnCancelar").style.display = "block";
    editandoId = producto.id;
    document.getElementById("formPanel").scrollIntoView({ behavior: "smooth" });
}

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

function mostrarPreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("preview");
    if (file) {
        const reader = new FileReader();
        reader.onload = e => { preview.src = e.target.result; preview.style.display = "block"; };
        reader.readAsDataURL(file);
    }
}

function limpiarInputs() {
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("imagen").value = "";
    document.getElementById("fileLabelText").textContent = "📁 Subir imagen";
    const preview = document.getElementById("preview");
    preview.src = ""; preview.style.display = "none";
    document.getElementById("tituloForm").textContent = "Agregar Producto";
    document.getElementById("btnCancelar").style.display = "none";
    editandoId = null;
}