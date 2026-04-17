using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aUroNMerCH.Migrations
{
    /// <inheritdoc />
    public partial class AddPrecio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Precio",
                table: "Productos",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Precio",
                table: "Productos");
        }
    }
}
