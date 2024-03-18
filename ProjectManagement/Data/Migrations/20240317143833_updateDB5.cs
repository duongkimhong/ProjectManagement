using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class updateDB5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notes_NoteCategories_NoteCategoriesId",
                table: "Notes");

            migrationBuilder.DropTable(
                name: "NoteCategories");

            migrationBuilder.DropIndex(
                name: "IX_Notes_NoteCategoriesId",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "NoteCategoriesId",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "NoteCategoryID",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "TypeNote",
                table: "Notes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "NoteCategoriesId",
                table: "Notes",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "NoteCategoryID",
                table: "Notes",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TypeNote",
                table: "Notes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "NoteCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteCategories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notes_NoteCategoriesId",
                table: "Notes",
                column: "NoteCategoriesId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_NoteCategories_NoteCategoriesId",
                table: "Notes",
                column: "NoteCategoriesId",
                principalTable: "NoteCategories",
                principalColumn: "Id");
        }
    }
}
