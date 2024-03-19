namespace ProjectManagement.Models
{
    public class TeamMembers
    {
        public Guid Id { get; set; }

        public string? Role {  get; set; }

        public Guid? TeamID { get; set; }
        public virtual Teams? Teams { get; set; }

        public MembetStatus Status { get; set; }

        public string? UserID { get; set; }
        public virtual ApplicationUser? User { get; set; }
    }

    public enum MembetStatus
    {
        Pending,
        Active,
        Blocked
    }
}
