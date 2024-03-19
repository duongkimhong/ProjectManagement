namespace ProjectManagement.Models
{
    public class Documents
    {
        public Guid Id { get; set; }

        public string? File {  get; set; }

        public DocumentType? DocumentType { get; set; }

        public ICollection<ProjectDocument>? ProjectDocument {  get; set; }
        public ICollection<EpicDocument>? EpicDocument {  get; set; }
        public ICollection<IssueDocument>? IssueDocument {  get; set; }
    }

    public enum DocumentType
    {
        Project,
        Epic,
        Issue
    }
}
