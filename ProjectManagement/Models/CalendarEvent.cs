namespace ProjectManagement.Models
{
    public class CalendarEvent
    {
        public Guid Id { get; set; }

        public string? Subject { get; set; }

        public string? Description { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set;}

        public bool IsFullday { get; set; }

        public string? UserID { get; set; }
        public virtual ApplicationUser? User { get; set; }
    }
}
