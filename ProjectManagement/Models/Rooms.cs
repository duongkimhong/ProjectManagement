namespace ProjectManagement.Models
{
    public class Rooms
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string UserID { get; set; }
        public virtual ApplicationUser UserAccount { get; set; }

        public ICollection<Messages>? Messages { get; set; }
        public ICollection<UserRooms>? UserRoom { get; set; }
    }
}
