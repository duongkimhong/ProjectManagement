using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDB10 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EpicDocument_Documents_DocumentsId",
                table: "EpicDocument");

            migrationBuilder.DropForeignKey(
                name: "FK_IssueDocument_Documents_DocumentsId",
                table: "IssueDocument");

            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_IssueDocument_DocumentsId",
                table: "IssueDocument");

            migrationBuilder.DropIndex(
                name: "IX_EpicDocument_DocumentsId",
                table: "EpicDocument");

            migrationBuilder.DropColumn(
                name: "DocumentID",
                table: "IssueDocument");

            migrationBuilder.DropColumn(
                name: "DocumentsId",
                table: "IssueDocument");

            migrationBuilder.DropColumn(
                name: "DocumentID",
                table: "EpicDocument");

            migrationBuilder.DropColumn(
                name: "DocumentsId",
                table: "EpicDocument");

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "IssueDocument",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "IssueDocument",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "EpicDocument",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "EpicDocument",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileName",
                table: "IssueDocument");

            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "IssueDocument");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "EpicDocument");

            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "EpicDocument");

            migrationBuilder.AddColumn<Guid>(
                name: "DocumentID",
                table: "IssueDocument",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DocumentsId",
                table: "IssueDocument",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DocumentID",
                table: "EpicDocument",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DocumentsId",
                table: "EpicDocument",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DocumentType = table.Column<int>(type: "int", nullable: true),
                    File = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IssueDocument_DocumentsId",
                table: "IssueDocument",
                column: "DocumentsId");

            migrationBuilder.CreateIndex(
                name: "IX_EpicDocument_DocumentsId",
                table: "EpicDocument",
                column: "DocumentsId");

            migrationBuilder.AddForeignKey(
                name: "FK_EpicDocument_Documents_DocumentsId",
                table: "EpicDocument",
                column: "DocumentsId",
                principalTable: "Documents",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_IssueDocument_Documents_DocumentsId",
                table: "IssueDocument",
                column: "DocumentsId",
                principalTable: "Documents",
                principalColumn: "Id");
        }
    }
}
