namespace ProjectManagement.Models
{
    public class EpicDocument
    {
        public Guid Id { get; set; }

        public string? FileName { get; set; }

        public string? FilePath { get; set; }

        public Guid? EpicID { get; set; }
        public virtual Epics? Epics { get; set; }
    }
}
