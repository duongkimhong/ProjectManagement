namespace ProjectManagement.Models
{
    public class Activities
    {
        public Guid Id { get; set; }

        public string? Action { get; set; }

        public DateTime Timestamp { get; set; }

        public string? UserID { get; set; }
        public virtual ApplicationUser? User { get; set; }
    }
}
