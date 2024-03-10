using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectManagement.Models
{
    public class Projects
    {
        public Guid Id { get; set; }

        public string? Name { get; set; }

        public string? Image {  get; set; }
        [NotMapped]
        public IFormFile? CoverImage { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? Description { get; set; }

        public ProjectStatus? Status { get; set; }

		public ICollection<Epics>? Epics { get; set; }
		public ICollection<Sprints>? Sprints { get; set; }
        public ICollection<ProjectDocument>? ProjectDocument { get; set; }
        public ICollection<Teams>? Teams { get; set; }
    }

    public enum ProjectStatus
    {
        InProgress,
        Completed,
        Cancelled,
        PendingApproval
    }
}
