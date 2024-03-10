namespace ProjectManagement.Models
{
    public class IssueHistory
    {
        public Guid Id { get; set; }

        public string? Title { get; set; }

        public string? Detail { get; set; }

        public DateTime? Timestamp { get; set; }

        public Guid? IssueID { get; set; }
        public virtual Issues? Issues { get; set; }
    }
}
