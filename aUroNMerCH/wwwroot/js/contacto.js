// ══════════════════════════════════════
//   contacto.js — Auron
//   Carrito + Nav + Drawer + Formulario
// ══════════════════════════════════════

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
    window.location.href = "login.html";
}

// ══════════════════════════════════════
//   CARRITO — Estado
// ══════════════════════════════════════
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(i => i.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
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
    badge.textContent = total;
    badge.style.display = total > 0 ? "flex" : "none";
}

// ══════════════════════════════════════
//   CARRITO — Panel UI
// ══════════════════════════════════════
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

    lista.querySelectorAll(".cart-item").forEach(el => el.remove());

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

    const subtotalEl = document.getElementById("cartSubtotal");
    const totalEl = document.getElementById("cartTotal");
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

// ══════════════════════════════════════
//   TOAST
// ══════════════════════════════════════
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

// ══════════════════════════════════════
//   DRAWER
// ══════════════════════════════════════
function toggleDrawer() {
    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("drawerOverlay");
    const btn = document.getElementById("hamburgerBtn");
    if (!drawer || !overlay || !btn) return;
    const abierto = drawer.classList.toggle("open");
    overlay.classList.toggle("open", abierto);
    btn.classList.toggle("open", abierto);
}

// ══════════════════════════════════════
//   NAV AUTH
// ══════════════════════════════════════
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

    if (user && user.rol === "Admin") {
        const adminBtn = document.createElement("button");
        adminBtn.textContent = esDrawer ? "Panel Admin" : "+ Admin";
        adminBtn.className = "btn-admin";
        adminBtn.onclick = () => {
            if (esDrawer) toggleDrawer();
            window.location.href = "productos.html";
        };
        nav.appendChild(adminBtn);
    }
}

// ══════════════════════════════════════
//   FORMULARIO DE CONTACTO
// ══════════════════════════════════════
function enviarFormulario() {
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const asunto = document.getElementById("asunto").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();

    // Validación básica
    if (!nombre || !email || !asunto || !mensaje) {
        resaltarCamposVacios({ nombre, email, asunto, mensaje });
        return;
    }
    if (!validarEmail(email)) {
        const campo = document.getElementById("email");
        campo.style.borderColor = "var(--accent2)";
        campo.focus();
        return;
    }

    const btn = document.getElementById("btnEnviar");
    btn.classList.add("loading");
    btn.querySelector(".btn-text").textContent = "ENVIANDO...";

    // Simulación de envío (2 segundos)
    setTimeout(() => {
        btn.classList.remove("loading");
        btn.style.display = "none";

        // Limpiar campos
        ["nombre", "email", "asunto", "mensaje"].forEach(id => {
            document.getElementById(id).value = "";
        });

        // Mostrar éxito
        const success = document.getElementById("formSuccess");
        success.classList.add("show");

        // Restaurar botón tras 5 segundos
        setTimeout(() => {
            success.classList.remove("show");
            btn.style.display = "flex";
            btn.querySelector(".btn-text").textContent = "ENVIAR MENSAJE";
        }, 5000);
    }, 2000);
}

function resaltarCamposVacios(campos) {
    Object.entries(campos).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!val) {
            el.style.borderColor = "var(--accent2)";
            el.addEventListener("input", () => {
                el.style.borderColor = "";
            }, { once: true });
        }
    });
    // Scroll al primer campo vacío
    const primerVacio = Object.entries(campos).find(([, v]) => !v);
    if (primerVacio) document.getElementById(primerVacio[0]).focus();
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Limpiar borde rojo al escribir
document.addEventListener("DOMContentLoaded", () => {
    ["nombre", "email", "asunto", "mensaje"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => { el.style.borderColor = ""; });
        }
    });
});

// ══════════════════════════════════════
//   INIT
// ══════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    construirNavAuth();
    actualizarBadge();
    renderCarritoPanel();
});