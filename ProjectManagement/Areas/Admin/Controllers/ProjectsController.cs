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
using static System.Runtime.InteropServices.JavaScript.JSType;

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

        // GET: Admin/Projects/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Admin/Projects/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([FromForm] Projects projects, [FromForm] IFormFile? CoverImage, [FromForm] string? selectedUsers, [FromForm] List<IFormFile>? documents)
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
                        Role = "Member",
                        TeamID = team.Id,
                        Teams = team,
                        UserID = userId,
						Status = MemberStatus.Pending
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

                            // Tạo liên kết giữa project và document
                            var projectDocument = new ProjectDocument
                            {
                                Id = Guid.NewGuid(),
								FileName = file.FileName,
								FilePath = documentPath,
                                ProjectID = projects.Id,
                                Projects = projects
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

			// Lấy thông tin dự án và các team của nó
			var project = await _context.Projects
				.Include(p => p.Teams)
					.ThenInclude(t => t.TeamMembers)
						.ThenInclude(tm => tm.User)
					.Include(p => p.ProjectDocument)
				.FirstOrDefaultAsync(p => p.Id == projectId);

			if (project == null)
			{
				return NotFound();
			}

			// Lấy danh sách thành viên của các team và đưa vào danh sách JSON
			var teamMembers = new List<object>();
			foreach (var team in project.Teams)
			{
				foreach (var member in team.TeamMembers)
				{
					var memberInfo = new
					{
						UserId = member.UserID,
						UserName = member.User?.UserName,
						Role = member.Role,
                        Image = member.User.Image,
						Status = member.Status
					};
					teamMembers.Add(memberInfo);
				}
			}
			var projectDocuments = new List<object>();
			foreach(var document in project.ProjectDocument)
			{
				var documentInfo = new
				{
					Id = document.Id,
					FileName = document.FileName,
					FilePath = document.FilePath
				};
				projectDocuments.Add(documentInfo);
			}

			// Xây dựng object JSON chứa thông tin cần thiết từ dữ liệu lấy được
			var responseData = new
			{
				Id = project.Id,
				Name = project.Name,
				Description = project.Description,
				StartDate = project.StartDate,
				EndDate = project.EndDate,
				Image = project.Image,
				TeamMembers = teamMembers,
				ProjectDocuments = projectDocuments
			};

			return Json(responseData);
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
				.Include(s => s.Sprints)
				.Include(e => e.Epics)
                .Include(p => p.ProjectDocument)
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

					// Lặp qua từng tài liệu để xóa tệp vật lý
					foreach (var document in projectDocuments)
					{
						// Xóa tệp vật lý từ hệ thống tệp
						var filePath = Path.Combine(_environment.WebRootPath, document.FilePath.TrimStart('/'));
						if (System.IO.File.Exists(filePath))
						{
							System.IO.File.Delete(filePath);
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
                _context.SaveChanges();

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
		#region
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
		#endregion

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

		public async Task<IActionResult> UpdateProjectImage(Guid projectId, IFormFile image)
		{
			if (image == null || image.Length == 0)
			{
				// Trả về BadRequest nếu không có hình ảnh được gửi lên
				return BadRequest("No image uploaded.");
			}

			// Kiểm tra dung lượng tệp tải lên
			if (image.Length > 10 * 1024 * 1024) // 10MB
			{
				// Trả về BadRequest nếu dung lượng vượt quá 10MB
				return BadRequest("Image file size exceeds the limit (10MB).");
			}

			try
			{
				// Tạo thư mục để lưu hình ảnh nếu chưa tồn tại
				string folder = "Uploads/ProjectIcon";
				Directory.CreateDirectory(Path.Combine(_environment.WebRootPath, folder));

				// Tạo tên file duy nhất cho hình ảnh
				string uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(image.FileName);

				// Tạo đường dẫn đến tệp hình ảnh trên máy chủ
				string filePath = Path.Combine(_environment.WebRootPath, folder, uniqueFileName);

				// Lưu hình ảnh vào thư mục trên máy chủ
				using (var stream = new FileStream(filePath, FileMode.Create))
				{
					await image.CopyToAsync(stream);
				}

				// Cập nhật đường dẫn hình ảnh trong đối tượng Projects
				var project = await _context.Projects.FindAsync(projectId);
				if (project != null)
				{
					project.Image = "/" + folder + "/" + uniqueFileName;
					_context.Update(project);
					await _context.SaveChangesAsync();

					// Trả về success nếu cập nhật thành công
					return Json(new { success = true, image = project.Image });
				}
				else
				{
					// Trả về NotFound nếu không tìm thấy project
					return NotFound("Project not found.");
				}
			}
			catch (Exception ex)
			{
				// Trả về StatusCode 500 nếu có lỗi xảy ra trong quá trình xử lý
				return StatusCode(500, $"An error occurred while updating image: {ex.Message}");
			}
		}

		[HttpGet]
		public async Task<IActionResult> GetListAccountsNotInProject(Guid projectId)
		{
			// Lấy danh sách các người dùng không thuộc dự án
			var usersNotInProject = await _context.Users
				.Where(u => !_context.TeamMembers
					.Any(tm => tm.UserID == u.Id && tm.Teams.ProjectID == projectId))
				.Select(u => new
				{
					UserId = u.Id,
					UserName = u.UserName,
					UserImage = u.Image
				})
				.ToListAsync();

			// Trả về danh sách các người dùng
			return Json(usersNotInProject);
		}

		[HttpPost]
		public async Task<IActionResult> DeleteDocument(Guid documentId)
		{
            try
            {
				var projectDocument = _context.ProjectDocument.FirstOrDefault(p => p.Id == documentId);

				if (projectDocument == null)
				{
					return NotFound();
				}

				_context.ProjectDocument.Remove(projectDocument);;
                _context.SaveChanges();

                // Xóa tệp vật lý từ hệ thống tệp
                var filePath = Path.Combine(_environment.WebRootPath, projectDocument.FilePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateProjectFile(Guid projectId)
		{
			var project = _context.Projects.Find(projectId);
			try
			{
				foreach (var file in Request.Form.Files)
				{
					if (file != null && file.Length > 0)
					{
						if (file.Length <= 10 * 1024 * 1024) // 10MB
						{
							string folder = "Uploads/ProjectFile";
							string uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
							string filePath = Path.Combine(_environment.WebRootPath, folder, uniqueFileName);

							Directory.CreateDirectory(Path.Combine(_environment.WebRootPath, folder));

							using (var stream = new FileStream(filePath, FileMode.Create))
							{
								await file.CopyToAsync(stream);
							}

							string documentPath = "/" + folder + "/" + uniqueFileName;

							var projectDocument = new ProjectDocument
							{
								Id = Guid.NewGuid(),
								FileName = file.FileName,
								FilePath = documentPath,
								ProjectID = project.Id,
								Projects = project,
							};
							_context.Add(projectDocument);
							_context.SaveChanges();
						}
						else
						{
							ModelState.AddModelError("Documents", "Dung lượng tệp tải lên quá lớn (tối đa 10MB).");
							return View();
						}
					}
				}

				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Internal server error: {ex.Message}"); // Trả về lỗi nếu có exception
			}
		}

		public async Task<IActionResult> AddTeamMember(Guid projectId, string selectedUsers)
		{
			return View();
		}

		public IActionResult BurndownChart(int projectId)
		{
			try
			{
				// Truy vấn cơ sở dữ liệu để lấy dữ liệu cần thiết cho burndown chart
				var burndownData = _context.Issues
					//.Where(issue => issue.Sprints.ProjectID == projectId)
					.Select(issue => new
					{
						issue.Name,
						issue.StartDate,
						issue.EndDate
					})
					.ToList();

				// Trả về partial view chứa burndown chart và dữ liệu
				return PartialView("_BurndownChartPartial", burndownData);
			}
			catch (Exception ex)
			{
				// Xử lý nếu có lỗi xảy ra trong quá trình truy vấn dữ liệu
				ViewBag.ErrorMessage = "Error occurred while loading burndown chart data: " + ex.Message;
				return PartialView("_ErrorPartial");
			}
		}
	}
}
