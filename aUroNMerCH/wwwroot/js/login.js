const API_AUTH = "http://localhost:5130/api/auth";

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const error = document.getElementById("error");

    error.textContent = "";

    if (!username || !password) {
        error.textContent = "Completa los campos";
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
            error.textContent = "Usuario o contraseña incorrectos";
            return;
        }

        const data = await res.json();

        // 🔐 GUARDAR TOKEN JWT
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // 👉 Redirigir
        window.location.href = "index.html";

    } catch (err) {
        console.error(err);
        error.textContent = "Error de conexión";
    }
}