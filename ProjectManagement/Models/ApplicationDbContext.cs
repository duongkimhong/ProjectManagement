using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ProjectManagement.Models
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                var tableName = entityType.GetTableName();
                if (tableName.StartsWith("AspNet"))
                {
                    entityType.SetTableName(tableName.Substring(6));
                }
            }

            builder.Entity<Issues>()
           .HasOne(m => m.Assignee)
           .WithMany(u => u.Assignee)
           .HasForeignKey(m => m.AssigneeID)
           .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Issues>()
            .HasOne(m => m.Reporter)
            .WithMany(u => u.Reporter)
            .HasForeignKey(m => m.ReporterID)
            .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Messages>()
            .HasOne(m => m.FromUser)
            .WithMany(u => u.FromUser)
            .HasForeignKey(m => m.FromUserId)
            .OnDelete(DeleteBehavior.Restrict); // Hoặc NO ACTION

            builder.Entity<Messages>()
                .HasOne(m => m.ToUser)
                .WithMany(u => u.ToUser)
                .HasForeignKey(m => m.ToUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public DbSet<ProjectManagement.Models.Activities> Activities { get; set; } = default!;
        public DbSet<ProjectManagement.Models.CalendarEvent> CalendarEvent { get; set; } = default!;
        public DbSet<ProjectManagement.Models.Comments> Comments { get; set; } = default!;
        public DbSet<ProjectManagement.Models.Documents> Documents { get; set; } = default!;
        public DbSet<ProjectManagement.Models.EpicDocument> EpicDocument { get; set; } = default!;
        public DbSet<ProjectManagement.Models.EpicHistory> EpicHistory { get; set; } = default!;
        public DbSet<ProjectManagement.Models.Epics> Epics { get; set; } = default!;
        public DbSet<ProjectManagement.Models.IssueDocument> IssueDocument { get; set; } = default!;
        public DbSet<ProjectManagement.Models.IssueHistory> IssueHistory { get; set; } = default!;
        public DbSet<ProjectManagement.Models.Issues> Issues { get; set; } = default!;
        public DbSet<ProjectManagement.Models.Messages> Messages { get; set; } = default!;
        public DbSet<ProjectManagement.Models.NoteCategories> NoteCategories { get; set; } = default!;
        public DbSet<ProjectManagement.Models.Notes> Notes { get; set; } = default!;
        public DbSet<ProjectManagement.Models.Notifications> Notifications { get; set; } = default!;
        public DbSet<ProjectManagement.Models.ProjectDocument> ProjectDocument { get; set; } = default!;
        public DbSet<ProjectManagement.Models.Projects> Projects { get; set; } = default!;
        public DbSet<ProjectManagement.Models.Rooms> Rooms { get; set; } = default!;
        public DbSet<ProjectManagement.Models.Sprints> Sprints { get; set; } = default!;
        public DbSet<ProjectManagement.Models.TeamMembers> TeamMembers { get; set; } = default!;
        public DbSet<ProjectManagement.Models.Teams> Teams { get; set; } = default!;
        public DbSet<ProjectManagement.Models.UserRooms> UserRooms { get; set; } = default!;
    }
}
