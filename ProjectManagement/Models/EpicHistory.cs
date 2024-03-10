namespace ProjectManagement.Models
{
    public class EpicHistory
    {
        public Guid Id { get; set; }

        public string? Title { get; set; }

        public string? Detail {  get; set; }

        public DateTime? Timestamp { get; set;}

        public Guid? EpicID { get; set; }
        public virtual Epics? Epics { get; set; }
    }
}
