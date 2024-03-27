using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace ProjectManagement.Models;

// Add profile data for application users by adding properties to the ApplicationUser class
public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }

    public DateTime? Birthday { get; set; }

    public string? Address { get; set; }

    public string? Image { get; set; }
    [NotMapped]
    public IFormFile? CoverImage { get; set; }

    public bool IsActive { get; set; }

    public DateTime? LastLogin {  get; set; }

    public ICollection<Epics>? Epics { get; set; }
    public ICollection<TeamMembers>? TeamMembers { get; set; }
    public ICollection<Comments>? Comments { get; set; }
    public ICollection<Notifications>? Notifications { get; set; }
    public virtual ICollection<Rooms> Rooms { get; set; }
    [InverseProperty("FromUser")]
    public virtual ICollection<Messages>? FromUser { get; set; }
    [InverseProperty("ToUser")]
    public virtual ICollection<Messages>? ToUser { get; set; }
    [InverseProperty("Reporter")]
    public virtual ICollection<Issues>? Reporter { get; set; }
    [InverseProperty("Assignee")]
    public virtual ICollection<Issues>? Assignee { get; set; }
    public virtual ICollection<UserRooms> UserRoom { get; set; }
    public ICollection<Notes> Notes { get; set; }
    public ICollection<CalendarEvent>? CalendarEvents { get; set; }
    public ICollection<Activities>? Activities { get; set; }
}

