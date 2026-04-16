const apiUrl = "http://localhost:5130/api/productos";

// Cargar productos
function cargarProductos() {
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            const lista = document.getElementById("lista");
            lista.innerHTML = "";

            data.forEach(p => {
                const li = document.createElement("li");

                li.innerHTML = `
                    ${p.nombre}
                    <button onclick="eliminarProducto(${p.id})">❌</button>
                `;

                lista.appendChild(li);
            });
        });
}

// Crear producto
function crearProducto() {
    const nombre = document.getElementById("nombre").value;

    if (!nombre) return;

    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre: nombre })
    }).then(() => {
        document.getElementById("nombre").value = "";
        cargarProductos();
    });
}

// Eliminar producto
function eliminarProducto(id) {
    fetch(`${apiUrl}/${id}`, {
        method: "DELETE"
    }).then(() => cargarProductos());
}

// iniciar
cargarProductos();