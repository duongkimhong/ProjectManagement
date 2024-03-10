using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class updateDB4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Epics_Sprints_SprintsId",
                table: "Epics");

            migrationBuilder.RenameColumn(
                name: "SprintsId",
                table: "Epics",
                newName: "ProjectsId");

            migrationBuilder.RenameColumn(
                name: "SprintID",
                table: "Epics",
                newName: "ProjectID");

            migrationBuilder.RenameIndex(
                name: "IX_Epics_SprintsId",
                table: "Epics",
                newName: "IX_Epics_ProjectsId");

            migrationBuilder.AddForeignKey(
                name: "FK_Epics_Projects_ProjectsId",
                table: "Epics",
                column: "ProjectsId",
                principalTable: "Projects",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Epics_Projects_ProjectsId",
                table: "Epics");

            migrationBuilder.RenameColumn(
                name: "ProjectsId",
                table: "Epics",
                newName: "SprintsId");

            migrationBuilder.RenameColumn(
                name: "ProjectID",
                table: "Epics",
                newName: "SprintID");

            migrationBuilder.RenameIndex(
                name: "IX_Epics_ProjectsId",
                table: "Epics",
                newName: "IX_Epics_SprintsId");

            migrationBuilder.AddForeignKey(
                name: "FK_Epics_Sprints_SprintsId",
                table: "Epics",
                column: "SprintsId",
                principalTable: "Sprints",
                principalColumn: "Id");
        }
    }
}
