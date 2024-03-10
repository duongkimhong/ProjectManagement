namespace ProjectManagement.Models
{
    public class Notes
    {
        public Guid Id { get; set; }

        public string? Title { get; set; }

        public DateTime? Timestamp { get; set; }

        public string? NoteContent { get; set; }

        public string? TypeNote {  get; set; }

        public Guid? NoteCategoryID { get; set; }
        public virtual NoteCategories? NoteCategories { get; set; }

        public string? UserID { get; set; }
        public virtual ApplicationUser? User { get; set; }
    }
}
