public class Producto
{
    public int Id { get; set; }

    public required string Nombre { get; set; }
    public decimal Precio { get; set; }

    public required string Categoria { get; set; }

    public string? ImagenUrl { get; set; }
}