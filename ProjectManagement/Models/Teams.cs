namespace ProjectManagement.Models
{
    public class Teams
    {
        public Guid Id { get; set; }

        public string? Name { get; set; }

        public Guid? ProjectID { get; set; }
        public virtual Projects? Projects { get; set; }

        public ICollection<TeamMembers>? TeamMembers { get; set; }
    }
}
