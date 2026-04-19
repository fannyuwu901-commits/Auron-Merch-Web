using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    // 🔹 LOGIN
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] Usuario user)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u =>
                u.Username == user.Username &&
                u.Password == user.Password);

        if (usuario == null)
            return Unauthorized("Credenciales incorrectas");

        return Ok(usuario);
    }

    // 🔹 REGISTRO (opcional)
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] Usuario user)
    {
        _context.Usuarios.Add(user);
        await _context.SaveChangesAsync();

        return Ok(user);
    }
}