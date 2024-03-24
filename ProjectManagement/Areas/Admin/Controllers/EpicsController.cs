using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using ProjectManagement.Models;

namespace ProjectManagement.Areas.Admin.Controllers
{
	[Area("Admin")]
	[Authorize]
	public class EpicsController : Controller
	{
		private readonly ApplicationDbContext _context;
		private readonly IWebHostEnvironment _environment;

		public EpicsController(ApplicationDbContext context, IWebHostEnvironment environment)
		{
			_context = context;
			_environment = environment;
		}

		// POST: Admin/Epics/Create
		[HttpPost]
		public async Task<IActionResult> Create(string name, string projectId)
		{
			Guid id = Guid.Parse(projectId);
			var project = await _context.Projects.FindAsync(id);
			var epic = new Epics
			{
				Id = Guid.NewGuid(),
				Name = name,
				Priority = Priorities.Medium,
				ProjectID = id,
				Projects = project,
				Color = "#8E7AB5",
				ReporterID = User.Identity.Name,
				Reporter = _context.Users.FirstOrDefault(u => u.UserName == User.Identity.Name)
			};

			_context.Add(epic);
			await _context.SaveChangesAsync();

			var epics = _context.Epics.Where(e => e.ProjectID == id).ToList();
			return PartialView("_EpicsPartial", epics);
		}

		// GET: Admin/Epics/Edit/5
		public async Task<IActionResult> Edit(Guid? epicId)
		{
			if (epicId == null || _context.Epics == null)
			{
				return NotFound();
			}

			var epic = await _context.Epics
								.Include(e => e.Reporter)
								.Include(p => p.EpicDocument)
								.FirstOrDefaultAsync(e => e.Id == epicId);
			
			if (epic == null)
			{
				return NotFound();
			}
			var reporterFullName = epic.Reporter != null ? epic.Reporter.FullName : null;
			var reporterImage = epic.Reporter != null ? epic.Reporter.Image : null;

			var epicDocuments = new List<object>();
			foreach (var document in epic.EpicDocument)
			{
				var documentInfo = new
				{
					Id = document.Id,
					FileName = document.FileName,
					FilePath = document.FilePath
				};
				epicDocuments.Add(documentInfo);
			}

			return Json(new
			{
				Id = epic.Id,
				Name = epic.Name,
				Color = epic.Color,
				StartDate = epic.StartDate,
				EndDate = epic.EndDate,
				Description = epic.Description,
				Reporter = new
				{
					FullName = reporterFullName,
					Image = reporterImage
				},
				EpicDocument = epicDocuments
			});
		}
		
		// POST: Admin/Epics/Delete/5
		[HttpPost]
		public async Task<IActionResult> DeleteConfirmed(Guid id)
		{
            var projectId = _context.Epics.Where(e => e.Id == id).Select(e => e.ProjectID).FirstOrDefault();
            if (_context.Epics == null)
			{
				return Problem("Entity set 'ApplicationDbContext.Epics'  is null.");
			}
			var epic = await _context.Epics.Include(d => d.EpicDocument).FirstOrDefaultAsync(i => i.Id == id);

			// Lấy danh sách các tài liệu thuộc epic
			var epicDocuments = _context.EpicDocument.Where(ed => ed.EpicID == epic.Id).ToList();
			if (epicDocuments.Any())
			{
				_context.EpicDocument.RemoveRange(epicDocuments);

				if (epicDocuments.Any())
				{
					foreach (var document in epicDocuments)
					{
						// Xóa tệp vật lý từ hệ thống tệp
						var filePath = Path.Combine(_environment.WebRootPath, document.FilePath.TrimStart('/'));
						if (System.IO.File.Exists(filePath))
						{
							System.IO.File.Delete(filePath);
						}
					}
				}
			}

			// Lấy danh sách các issue thuộc epic
			var issues = await _context.Issues.Where(issue => issue.EpicID == id).ToListAsync();

			// Unlink các issue có liên kết với epic này
			foreach (var issue in issues)
			{
				issue.EpicID = null;
				issue.Epics = null;
				_context.Update(issue);
			}

			if (epic != null)
			{
				_context.Epics.Remove(epic);
			}

			await _context.SaveChangesAsync();
            
            var epics = _context.Epics.Where(e => e.ProjectID == projectId).ToList();
            return PartialView("_EpicsPartial", epics);
        }

		private bool EpicsExists(Guid id)
		{
			return (_context.Epics?.Any(e => e.Id == id)).GetValueOrDefault();
		}

		public async Task<IActionResult> UpdateEpicName(Guid epicId, string name)
		{
			try
			{
				var epic = await _context.Epics.FindAsync(epicId);
				if (epic != null)
				{
					epic.Name = name;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateEpicColor(Guid epicId, string color)
		{
			try
			{
				var epic = await _context.Epics.FindAsync(epicId);
				if (epic != null)
				{
					epic.Color = color;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateEpicDescription(Guid epicId, string description)
		{
			try
			{
				var epic = await _context.Epics.FindAsync(epicId);
				if (epic != null)
				{
					epic.Description = description;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateEpicStartDate(Guid epicId, DateTime date)
		{
			try
			{
				var epic = await _context.Epics.FindAsync(epicId);
				if (epic != null)
				{
					epic.StartDate = date;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateEpicEndDate(Guid epicId, DateTime date)
		{
			try
			{
				var epic = await _context.Epics.FindAsync(epicId);
				if (epic != null)
				{
					epic.EndDate = date;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		[HttpPost]
		public async Task<IActionResult> DeleteDocument(Guid documentId)
		{
			try
			{
				var epicDocument = _context.EpicDocument.FirstOrDefault(p => p.Id == documentId);

				if (epicDocument == null)
				{
					return NotFound();
				}

				_context.EpicDocument.Remove(epicDocument);

				_context.SaveChanges();

				// Xóa tệp vật lý từ hệ thống tệp
				var filePath = Path.Combine(_environment.WebRootPath, epicDocument.FilePath.TrimStart('/'));
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

		public async Task<IActionResult> UpdateEpicFiles(Guid epicId)
		{
			var epic = _context.Epics.Find(epicId);
			try
			{
				foreach (var file in Request.Form.Files)
				{
					if (file != null && file.Length > 0)
					{
						if (file.Length <= 10 * 1024 * 1024) // 10MB
						{
							string folder = "Uploads/EpicFile";
							string uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
							string filePath = Path.Combine(_environment.WebRootPath, folder, uniqueFileName);

							Directory.CreateDirectory(Path.Combine(_environment.WebRootPath, folder));

							using (var stream = new FileStream(filePath, FileMode.Create))
							{
								await file.CopyToAsync(stream);
							}

							string documentPath = "/" + folder + "/" + uniqueFileName;

							var epicDocument = new EpicDocument
							{
								Id = Guid.NewGuid(),
								FileName = file.FileName,
								FilePath = documentPath,
								EpicID = epic.Id,
								Epics = epic
							};
							_context.Add(epicDocument);
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
	}
}
