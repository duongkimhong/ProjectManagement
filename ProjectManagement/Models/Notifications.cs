namespace ProjectManagement.Models
{
    public class Notifications
    {
        public Guid Id { get; set; }

        public string? Title { get; set; }

        public string? Content { get; set; }

        public DateTime? Timestamp { get; set; }

        public NotiStatus? NotiStatus { get; set; }

        public string? UserID { get; set; }
        public virtual ApplicationUser? User { get; set; }
    }

    public enum NotiStatus
    {
        UnRead,
        Read
    }
}
