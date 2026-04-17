using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var productos = await _context.Productos.ToListAsync();
        return Ok(productos);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromForm] Producto producto, IFormFile? imagen)
    {
        if (imagen != null && imagen.Length > 0)
        {
            var ruta = Path.Combine("wwwroot/images");

            if (!Directory.Exists(ruta))
                Directory.CreateDirectory(ruta);

            var nombreArchivo = Guid.NewGuid().ToString() + Path.GetExtension(imagen.FileName);
            var rutaCompleta = Path.Combine(ruta, nombreArchivo);

            using (var stream = new FileStream(rutaCompleta, FileMode.Create))
            {
                await imagen.CopyToAsync(stream);
            }

            producto.ImagenUrl = "/images/" + nombreArchivo;
        }

        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();

        return Ok(producto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto == null) return NotFound();

        _context.Productos.Remove(producto);
        await _context.SaveChangesAsync();

        return Ok();
    }
}