using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Models
{
    public class Sprints
    {
        public Guid Id { get; set; }

        public string? Name { get; set; }

        public SprintStatus? Status { get; set; }

		public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? SprintGoal { get; set; }

        public Guid? ProjectID { get; set; }
        public virtual Projects? Projects { get; set; }

        public ICollection<Issues>? Issues { get; set; }
    }

    public enum SprintStatus
    {
        Start,
        Complete,
        Cancelled
    }
}
