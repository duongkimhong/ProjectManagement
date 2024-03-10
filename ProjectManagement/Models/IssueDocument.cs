namespace ProjectManagement.Models
{
    public class IssueDocument
    {
        public Guid Id { get; set; }

        public Guid? IssueID { get; set; }
        public virtual Issues? Issues { get; set; }

        public Guid? DocumentID { get; set; }
        public virtual Documents? Documents { get; set; }
    }
}
