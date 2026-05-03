const API_LOGIN = "http://localhost:5130/api/auth/login";

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(API_LOGIN, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            Username: username,
            Password: password
        })
    });

    if (!res.ok) {
        const error = await res.text();
        console.error("ERROR:", error);
        alert("Usuario o contraseña incorrectos");
        return;
    }

    const data = await res.json();

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "index.html";
}