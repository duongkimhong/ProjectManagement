namespace ProjectManagement.Models
{
    public class NoteCategories
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public ICollection<Notes>? Notes { get; set; }
    }
}
