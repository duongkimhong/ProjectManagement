namespace ProjectManagement.Models
{
    public class Comments
    {
        public Guid Id { get; set; }

        public string? Content { get; set; }

        public DateTime? Timestamp { get; set; }

        public string? UserID { get; set; }
        public virtual ApplicationUser? User { get; set; }

        public Guid? IssueID { get; set; }
        public virtual Issues? Issues { get; set; }
    }
}
