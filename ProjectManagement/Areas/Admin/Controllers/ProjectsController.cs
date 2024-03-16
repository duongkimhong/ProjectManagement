using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Build.Evaluation;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using ProjectManagement.Models;

namespace ProjectManagement.Areas.Admin.Controllers
{
    [Area("Admin")]
	[Authorize]
	public class ProjectsController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ProjectsController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: Admin/Projects
        public async Task<IActionResult> Index()
        {
            return _context.Projects != null ?
                        View(await _context.Projects.ToListAsync()) :
                        Problem("Entity set 'ApplicationDbContext.Projects'  is null.");
        }

        // GET: Admin/Projects/Details/5
        public async Task<IActionResult> Details(Guid? id)
        {
            if (id == null || _context.Projects == null)
            {
                return NotFound();
            }

            var projects = await _context.Projects
                .FirstOrDefaultAsync(m => m.Id == id);
            if (projects == null)
            {
                return NotFound();
            }

            return View(projects);
        }

        // GET: Admin/Projects/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Admin/Projects/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([FromForm] Projects projects, [FromForm] IFormFile CoverImage, [FromForm] string selectedUsers, [FromForm] List<IFormFile> documents)
        {
            List<string> selectedUser = JsonConvert.DeserializeObject<List<string>>(selectedUsers);
            if (ModelState.IsValid)
            {
                // Tạo mới project và lưu vào cơ sở dữ liệu
                projects.Id = Guid.NewGuid();
                if (projects.CoverImage != null && projects.CoverImage.Length > 0)
                {
                    // Kiểm tra dung lượng tệp tải lên
                    if (projects.CoverImage.Length <= 10 * 1024 * 1024) // 10MB
                    {
                        string folder = "Uploads/ProjectIcon";
                        string uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(projects.CoverImage.FileName);
                        string filePath = Path.Combine(_environment.WebRootPath, folder, uniqueFileName);

                        // Tạo thư mục nếu không tồn tại
                        Directory.CreateDirectory(Path.Combine(_environment.WebRootPath, folder));

                        // Lưu tệp tải lên vào máy chủ
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await projects.CoverImage.CopyToAsync(stream);
                        }

                        // Cập nhật đường dẫn đến tệp tải lên
                        projects.Image = "/" + folder + "/" + uniqueFileName;
                    }
                    else
                    {
                        ModelState.AddModelError("CoverImage", "Dung lượng tệp tải lên quá lớn (tối đa 10MB).");
                        return View(projects);
                    }
                }
                _context.Add(projects);
                await _context.SaveChangesAsync();

                // Tạo mới team và liên kết với project vừa tạo
                var team = new Teams
                {
                    Id = Guid.NewGuid(),
                    Name = "Team " + projects.Name,
                    ProjectID = projects.Id, 
                    Projects = projects
                };
                _context.Add(team);

                // Thêm các thành viên vào team và lưu vào cơ sở dữ liệu
                foreach (var userId in selectedUser)
                {
                    var teamMember = new TeamMembers
                    {
                        Id = Guid.NewGuid(),
                        Role = "Member", // Đặt vai trò cho thành viên
                        TeamID = team.Id,
                        Teams = team,
                        UserID = userId // Liên kết thành viên với user
                    };
                    _context.Add(teamMember);
                }

                // Thêm các tài liệu vào project và lưu vào cơ sở dữ liệu
                foreach (var file in documents)
                {
                    if (file != null && file.Length > 0)
                    {
                        // Kiểm tra dung lượng tệp tải lên
                        if (file.Length <= 10 * 1024 * 1024) // 10MB
                        {
                            string folder = "Uploads/ProjectFile";
                            string uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
                            string filePath = Path.Combine(_environment.WebRootPath, folder, uniqueFileName);

                            // Tạo thư mục nếu không tồn tại
                            Directory.CreateDirectory(Path.Combine(_environment.WebRootPath, folder));

                            // Lưu tệp tải lên vào máy chủ
                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                await file.CopyToAsync(stream);
                            }

                            // Cập nhật đường dẫn đến tệp tải lên
                            string documentPath = "/" + folder + "/" + uniqueFileName;

                            // Lưu thông tin về tài liệu vào bảng Documents
                            var document = new Documents
                            {
                                Id = Guid.NewGuid(),
                                File = documentPath, // Lưu đường dẫn của tệp tài liệu
                                DocumentType = DocumentType.Project // Đặt loại tài liệu là của project
                            };

                            _context.Add(document);

                            // Tạo liên kết giữa project và document
                            var projectDocument = new ProjectDocument
                            {
                                Id = Guid.NewGuid(),
                                ProjectID = projects.Id,
                                Projects = projects,
                                DocumentID = document.Id,
                                Documents = document
                            };
                            _context.Add(projectDocument);
                        }
                        else
                        {
                            ModelState.AddModelError("Documents", "Dung lượng tệp tải lên quá lớn (tối đa 10MB).");
                            return View(projects);
                        }
                    }
                }

                // tạo Sprint mặc định tên Backlog
                var sprint = new Sprints
                {
                    Id = Guid.NewGuid(),
                    Name = "Backlog",
                    ProjectID = projects.Id, // Liên kết team với project
                    Projects = projects
                };
                _context.Add(sprint);

                await _context.SaveChangesAsync();
                return RedirectToAction("Index", "Home", new { area = "Admin" });
            }
            return RedirectToAction("Index", "Home", new { area = "Admin" });
        }

        // GET: Admin/Projects/Edit/5
        public async Task<IActionResult> Edit(Guid? projectId)
        {
            if (projectId == null || _context.Projects == null)
            {
                return NotFound();
            }

            var projects = await _context.Projects.FindAsync(projectId);

            if (projects == null)
            {
                return NotFound();
            }
            return Json(projects);
        }


        // POST: Admin/Projects/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(Guid id)
        {
            if (_context.Projects == null)
            {
                return Problem("Entity set 'AppContext.Projects' is null.");
            }

            // Truy vấn dự án cần xóa, bao gồm cả các liên kết với bảng ProjectDocument
            var project = await _context.Projects
                .Include(p => p.ProjectDocument).ThenInclude(t => t.Documents)
                .Include(p => p.Teams)
                    .ThenInclude(t => t.TeamMembers)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            try
            {
                // Xóa tệp tin hình ảnh nếu có
                if (!string.IsNullOrEmpty(project.Image))
                {
                    string fullPath = Path.Combine(_environment.WebRootPath, project.Image.TrimStart('/'));
                    if (System.IO.File.Exists(fullPath))
                    {
                        System.IO.File.Delete(fullPath);
                    }
                }

                // Xóa dữ liệu liên quan trong các bảng

                // Lấy danh sách các tài liệu thuộc dự án
                var projectDocuments = _context.ProjectDocument.Where(pd => pd.ProjectID == project.Id).ToList();

                if (projectDocuments.Any())
                {
                    // Xóa liên kết từ bảng ProjectDocument
                    _context.ProjectDocument.RemoveRange(projectDocuments);

                    // Lấy danh sách các tài liệu từ bảng Documents
                    var documents = _context.Documents.Where(d => projectDocuments.Select(pd => pd.DocumentID).Contains(d.Id)).ToList();

                    if (documents.Any())
                    {
                        // Xóa các tài liệu từ bảng Documents
                        _context.Documents.RemoveRange(documents);

                        // Lặp qua từng tài liệu để xóa tệp vật lý
                        foreach (var document in documents)
                        {
                            // Xóa tệp vật lý từ hệ thống tệp
                            var filePath = Path.Combine(_environment.WebRootPath, document.File.TrimStart('/'));
                            if (System.IO.File.Exists(filePath))
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }
                    }
                }

                // Xóa các thành viên trong các nhóm dự án
                if (project.Teams != null)
                {
                    foreach (var team in project.Teams)
                    {
                        if (team.TeamMembers != null)
                        {
                            _context.TeamMembers.RemoveRange(team.TeamMembers);
                        }
                    }
                }

                // Xóa các nhóm dự án
                if (project.Teams != null)
                {
                    _context.Teams.RemoveRange(project.Teams);
                }

                // Xóa các sprints
                if(project.Sprints != null)
                {
                    _context.Sprints.RemoveRange(project.Sprints);
                }

                //Xóa các epic
                if(project.Epics != null)
                {
                    _context.Epics.RemoveRange(project.Epics);
                }

                // Xóa dự án chính thức
                _context.Projects.Remove(project);

                // Thực hiện lưu thay đổi vào cơ sở dữ liệu
                await _context.SaveChangesAsync();

                // Chuyển hướng đến trang chính sau khi xóa thành công
                return RedirectToAction("Index", "Home", new { area = "Admin" });
            }
            catch (Exception ex)
            {
                // Xử lý ngoại lệ nếu có
                return Problem($"Error deleting project: {ex.Message}");
            }

        }



		// hành động xóa nhưng chỉ thay đổi trạng thái của dự án thành Cancelled, và không xóa các dữ liệu và tài liệu liên quan
		//public async Task<IActionResult> DeleteConfirmed(Guid id)
		//{
		//    var project = await _context.Projects.FindAsync(id);

		//    if (project == null)
		//    {
		//        return NotFound();
		//    }

		//    // Cập nhật trạng thái của dự án thành "Cancelled"
		//    project.Status = ProjectStatus.Cancelled;

		//    // Lưu thay đổi vào cơ sở dữ liệu
		//    _context.Projects.Update(project);
		//    await _context.SaveChangesAsync();

		//    return RedirectToAction(nameof(Index));
		//}

		

		private bool ProjectsExists(Guid id)
        {
            return (_context.Projects?.Any(e => e.Id == id)).GetValueOrDefault();
        }

		public async Task<IActionResult> UpdateProjectName(Guid projectId, string name)
		{
			try
			{
				var project = await _context.Projects.FindAsync(projectId);
				if (project != null)
				{
					project.Name = name;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateProjectDescription(Guid projectId, string description)
		{
			try
			{
				var project = await _context.Projects.FindAsync(projectId);
				if (project != null)
				{
					project.Description = description;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateProjectStartDate(Guid projectId, DateTime date)
		{
			try
			{
				var project = await _context.Projects.FindAsync(projectId);
				if (project != null)
				{
					project.StartDate = date;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateProjectEndDate(Guid projectId, DateTime date)
		{
			try
			{
				var project = await _context.Projects.FindAsync(projectId);
				if (project != null)
				{
					project.EndDate = date;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}
	}
}
