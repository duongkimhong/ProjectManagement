namespace ProjectManagement.Models
{
    public class Epics
    {
        public Guid Id { get; set; }

        public string? Name { get; set; }

        public string? Color { get; set; }

        public string? Description { get; set; }

        public Priorities Priority { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set;}

        public string? ReporterID { get; set; }
        public virtual ApplicationUser? Reporter { get; set; }

        public Guid? ProjectID { get; set; }
        public virtual Projects? Projects { get; set; }

        public ICollection<Issues>? Issues { get; set; }
        public ICollection<EpicDocument>? EpicDocument { get; set; }
        public ICollection<EpicHistory>? EpicHistory { get; set;}
    }
}
