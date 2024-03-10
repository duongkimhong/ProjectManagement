using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectManagement.Models
{
    public class Messages
    {
        public Guid Id { get; set; }

        public string Content { get; set; }

        public DateTime Timestamp { get; set; }

        public int Stick { get; set; }

        [ForeignKey("FromUser")]
        public string FromUserId { get; set; }
        public virtual ApplicationUser? FromUser { get; set; }

        [ForeignKey("ToUser")]
        public string ToUserId { get; set; }
        public virtual ApplicationUser? ToUser { get; set; }

        public Guid? RoomID { get; set; }
        public virtual Rooms Rooms { get; set; }

    }
}
