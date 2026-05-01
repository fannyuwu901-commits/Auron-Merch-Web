const API_LOGIN = "http://localhost:5130/api/auth/login";

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(API_LOGIN, {
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

    const data = await res.json();

    
    localStorage.setItem("token", data.token);

    
    window.location.href = "index.html";
}