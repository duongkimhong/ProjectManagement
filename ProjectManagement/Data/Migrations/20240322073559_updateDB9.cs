using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class updateDB9 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectDocument_Documents_DocumentsId",
                table: "ProjectDocument");

            migrationBuilder.DropIndex(
                name: "IX_ProjectDocument_DocumentsId",
                table: "ProjectDocument");

            migrationBuilder.DropColumn(
                name: "DocumentID",
                table: "ProjectDocument");

            migrationBuilder.DropColumn(
                name: "DocumentsId",
                table: "ProjectDocument");

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "ProjectDocument",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "ProjectDocument",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileName",
                table: "ProjectDocument");

            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "ProjectDocument");

            migrationBuilder.AddColumn<Guid>(
                name: "DocumentID",
                table: "ProjectDocument",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DocumentsId",
                table: "ProjectDocument",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectDocument_DocumentsId",
                table: "ProjectDocument",
                column: "DocumentsId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectDocument_Documents_DocumentsId",
                table: "ProjectDocument",
                column: "DocumentsId",
                principalTable: "Documents",
                principalColumn: "Id");
        }
    }
}
