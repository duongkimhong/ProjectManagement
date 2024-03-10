using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectManagement.Models
{
    public class ProjectDocument
    {
        public Guid Id { get; set; }

        [ForeignKey("Project")]
        public Guid? ProjectID { get; set; }
        public virtual Projects? Projects { get; set; }

        [ForeignKey("Document")]
        public Guid? DocumentID { get; set; }
        public virtual Documents? Documents { get; set; }
    }
}
