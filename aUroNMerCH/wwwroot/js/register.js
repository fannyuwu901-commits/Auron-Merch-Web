const API_REGISTER = "http://localhost:5130/api/auth/register";

async function register() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const mensaje = document.getElementById("mensaje");

    mensaje.innerHTML = "";

    // 🔎 Validación básica
    if (!username || !email || !password) {
        mensaje.innerHTML = `<p class="error">Completa todos los campos</p>`;
        return;
    }

    try {
        const res = await fetch(API_REGISTER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Username: username,
                Email: email,
                Password: password
            })
        });

        if (!res.ok) {
            const error = await res.text();
            mensaje.innerHTML = `<p class="error">${error}</p>`;
            return;
        }

        mensaje.innerHTML = `<p class="success">Usuario registrado correctamente</p>`;

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (error) {
        console.error("Error:", error);
        mensaje.innerHTML = `<p class="error">Error de conexión</p>`;
    }
}