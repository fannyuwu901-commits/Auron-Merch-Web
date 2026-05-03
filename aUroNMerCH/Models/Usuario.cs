public class Usuario
{
    public int Id { get; set; }

    public required string Username { get; set; }
    public required string Email { get; set; }

    public required string PasswordHash { get; set; }

    public string Rol { get; set; } = "User";
}