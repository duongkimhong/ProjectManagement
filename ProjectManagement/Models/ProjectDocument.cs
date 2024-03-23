using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectManagement.Models
{
    public class ProjectDocument
    {
        public Guid Id { get; set; }

        public string? FileName { get; set; }

        public string? FilePath { get; set; }

        [ForeignKey("Project")]
        public Guid? ProjectID { get; set; }
        public virtual Projects? Projects { get; set; }
    }
}
