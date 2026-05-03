const API_LOGIN = "http://localhost:5130/api/auth/login";

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
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

        const text = await res.text(); // 👈 capturamos TODO

        console.log("STATUS:", res.status);
        console.log("RESPUESTA:", text);

        if (!res.ok) {
            alert("Error: " + text);
            return;
        }

        const data = JSON.parse(text);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "index.html";

    } catch (error) {
        console.error("ERROR TOTAL:", error);
        alert("Error de conexión");
    }
}