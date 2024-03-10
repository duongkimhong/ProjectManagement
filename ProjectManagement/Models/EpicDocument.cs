namespace ProjectManagement.Models
{
    public class EpicDocument
    {
        public Guid Id { get; set; }

        public Guid? EpicID { get; set; }
        public virtual Epics? Epics { get; set; }

        public Guid? DocumentID { get; set; }
        public virtual Documents? Documents { get; set; }
    }
}
