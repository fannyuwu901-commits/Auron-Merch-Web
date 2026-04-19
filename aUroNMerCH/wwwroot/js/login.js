const API_AUTH = "http://localhost:5130/api/auth";

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Completa los campos");
        return;
    }

    try {
        const res = await fetch(`${API_AUTH}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            alert("Usuario o contraseña incorrectos");
            return;
        }

        const user = await res.json();

        // Guardar sesión simple
        localStorage.setItem("user", JSON.stringify(user));

        // Redirigir a tienda
        window.location.href = "index.html";

    } catch (error) {
        console.error("Error:", error);
    }
}