namespace ProjectManagement.Models
{
    public class Notes
    {
        public Guid Id { get; set; }

        public string? Title { get; set; }

        public string? NoteContent { get; set; }

        public DateTime? Timestamp { get; set; }

        public string? Color { get; set; }

        public bool IsStick { get; set; }

        public string UserID { get; set; }
        public virtual ApplicationUser User { get; set; }
    }
}
