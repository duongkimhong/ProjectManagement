using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectManagement.Models
{
    public class Issues
    {
		public Issues()
		{
			Assignee = null; // Khởi tạo Assignee là null
		}

		public Guid Id { get; set; }

        public string Name { get; set; }

        public IssueType Type { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set;}

        public string? Description { get; set; }

        public IssueStatus? Status { get; set; }

        public Priorities? Priority { get; set; }

        public bool IsFlag {  get; set; }

        public double? StoryPoint {  get; set; }

        [ForeignKey("Reporter")]
        public string? ReporterID { get; set; }
        public virtual ApplicationUser? Reporter { get; set; }

        [ForeignKey("Assignee")]
        public string? AssigneeID { get; set; }
        public virtual ApplicationUser? Assignee { get; set; }

        public Guid? SprintID { get; set; }
        public virtual Sprints? Sprints { get; set; }

        public Guid? EpicID { get; set; }
        public virtual Epics? Epics { get; set; }

        public ICollection<IssueDocument>? IssueDocument { get; set; }
        public ICollection<Comments>? Comments { get; set; }
    }

    public enum IssueType
    {
        UserStory,
        Task,
        Bug
    }

    public enum IssueStatus
    {
        Todo,
        InProgress,
        NeedReview,
        Test,
        Done,
        Cancelled
    }
}
