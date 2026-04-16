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

	// GET: api/productos
	[HttpGet]
	public async Task<IActionResult> Get()
	{
		var productos = await _context.Productos.ToListAsync();
		return Ok(productos);
	}

	// POST: api/productos
	[HttpPost]
	public async Task<IActionResult> Post(Producto producto)
	{
		_context.Productos.Add(producto);
		await _context.SaveChangesAsync();
		return Ok(producto);
	}

	// DELETE: api/productos/{id}
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