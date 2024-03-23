namespace ProjectManagement.Models
{
    public class IssueDocument
    {
        public Guid Id { get; set; }

        public string? FileName { get; set; }

        public string? FilePath { get; set; }

        public Guid? IssueID { get; set; }
        public virtual Issues? Issues { get; set; }
    }
}
