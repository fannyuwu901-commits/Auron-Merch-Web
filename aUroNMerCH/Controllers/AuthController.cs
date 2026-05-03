using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrEmpty(request.Username) ||
            string.IsNullOrEmpty(request.Email) ||
            string.IsNullOrEmpty(request.Password))
            return BadRequest("Datos inválidos");

        // Validar username único
        if (await _context.Usuarios.AnyAsync(u => u.Username == request.Username))
            return BadRequest("El usuario ya existe");

        // Validar email único
        if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
            return BadRequest("El correo ya está registrado");

        var hash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new Usuario
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = hash,
            Rol = "User"
        };

        _context.Usuarios.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Usuario registrado");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest login)
    {
        var user = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Username == login.Username);

        if (user == null)
            return Unauthorized("Credenciales incorrectas");

        var valid = BCrypt.Net.BCrypt.Verify(login.Password, user.PasswordHash);

        if (!valid)
            return Unauthorized("Credenciales incorrectas");

        var claims = new[]
        {
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.Role, user.Rol)
    };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes("SUPER_SECRET_KEY_123456789_ABCDEFGH_123456")
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new
        {
            token = tokenString,
            user = new
            {
                user.Id,
                user.Username,
                user.Email,
                user.Rol
            }
        });
    }
}