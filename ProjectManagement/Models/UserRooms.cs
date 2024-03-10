using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Models
{
    public class UserRooms
    {
        public Guid Id { get; set; }

        public string UserId { get; set; }
        public virtual ApplicationUser User { get; set; }

        public Guid? RoomId { get; set; }
        public virtual Rooms Rooms { get; set; }

        public int Role { get; set; }
    }
}
