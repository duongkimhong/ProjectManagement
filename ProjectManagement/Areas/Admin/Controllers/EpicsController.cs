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

		// GET: Admin/Epics
		public async Task<IActionResult> Index()
		{
			var applicationDbContext = _context.Epics.Include(e => e.Reporter);
			return View(await applicationDbContext.ToListAsync());
		}

		// GET: Admin/Epics/Details/5
		public async Task<IActionResult> Details(Guid? id)
		{
			if (id == null || _context.Epics == null)
			{
				return NotFound();
			}

			var epics = await _context.Epics
				.Include(e => e.Reporter)
				.FirstOrDefaultAsync(m => m.Id == id);
			if (epics == null)
			{
				return NotFound();
			}

			return View(epics);
		}

		// GET: Admin/Epics/Create
		public IActionResult Create()
		{
			ViewData["ReporterID"] = new SelectList(_context.Users, "Id", "Id");
			return View();
		}

		// POST: Admin/Epics/Create
		// To protect from overposting attacks, enable the specific properties you want to bind to.
		// For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
		[HttpPost]
		//[ValidateAntiForgeryToken]
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
			return RedirectToAction("Index", "Sprints", new { area = "Admin", id = projectId });
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
								.FirstOrDefaultAsync(e => e.Id == epicId);
			
			if (epic == null)
			{
				return NotFound();
			}
			var reporterFullName = epic.Reporter != null ? epic.Reporter.FullName : null;
			var reporterImage = epic.Reporter != null ? epic.Reporter.Image : null;
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
				}
			});
		}

		// POST: Admin/Epics/Edit/5
		// To protect from overposting attacks, enable the specific properties you want to bind to.
		// For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name,Color,Description,Priority,StartDate,EndDate,ReporterID,SprintID")] Epics epics)
		{
			if (id != epics.Id)
			{
				return NotFound();
			}

			if (ModelState.IsValid)
			{
				try
				{
					_context.Update(epics);
					await _context.SaveChangesAsync();
				}
				catch (DbUpdateConcurrencyException)
				{
					if (!EpicsExists(epics.Id))
					{
						return NotFound();
					}
					else
					{
						throw;
					}
				}
				return RedirectToAction(nameof(Index));
			}
			ViewData["ReporterID"] = new SelectList(_context.Users, "Id", "Id", epics.ReporterID);
			return View(epics);
		}

		// GET: Admin/Epics/Delete/5
		public async Task<IActionResult> Delete(Guid? id)
		{
			if (id == null || _context.Epics == null)
			{
				return NotFound();
			}

			var epics = await _context.Epics
				.Include(e => e.Reporter)
				.FirstOrDefaultAsync(m => m.Id == id);
			if (epics == null)
			{
				return NotFound();
			}

			return View(epics);
		}

		// POST: Admin/Epics/Delete/5
		[HttpPost]
		//[ValidateAntiForgeryToken]
		public async Task<IActionResult> DeleteConfirmed(Guid id)
		{
			if (_context.Epics == null)
			{
				return Problem("Entity set 'ApplicationDbContext.Epics'  is null.");
			}
			var epics = await _context.Epics.FindAsync(id);

			// Lấy danh sách các tài liệu thuộc epic
			var epicDocuments = _context.EpicDocument.Where(ed => ed.EpicID == epics.Id).ToList();
			if (epicDocuments.Any())
			{
				_context.EpicDocument.RemoveRange(epicDocuments);

				var documents = _context.Documents.Where(d => epicDocuments.Select(ed => ed.DocumentID).Contains(d.Id)).ToList();

				if (documents.Any())
				{
					_context.Documents.RemoveRange(documents);

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

			// Lấy danh sách các issue thuộc epic
			var issues = await _context.Issues.Where(issue => issue.EpicID == id).ToListAsync();

			// Unlink các issue có liên kết với epic này
			foreach (var issue in issues)
			{
				issue.EpicID = null;
				issue.Epics = null;
				_context.Update(issue);
			}

			if (epics != null)
			{
				_context.Epics.Remove(epics);
			}

			await _context.SaveChangesAsync();
			return Json(new { success = true });
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
	}
}
