using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.Evaluation;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Models;

namespace ProjectManagement.Areas.Admin.Controllers
{
	[Area("Admin")]
	[Authorize]
	public class BoardController : Controller
	{
		private readonly ApplicationDbContext _context;

		public BoardController(ApplicationDbContext context)
		{
			_context = context;
		}

		//[HttpPost]
		public async Task<IActionResult> Index(Guid id)
		{
			var project = await _context.Projects
					.Include(e => e.Epics)
					.Include(p => p.Sprints)
					.ThenInclude(s => s.Issues).ThenInclude(a => a.Assignee)
					.FirstOrDefaultAsync(p => p.Id == id);
			if (project != null)
			{
				var projectSprint = project.Sprints.Where(s => s.Status == SprintStatus.Start).ToList();
				ViewBag.BoardSprints = projectSprint;

				var projectEpics = project.Epics.ToList();
				ViewBag.ProjectEpics = projectEpics;

				var listSprints = project.Sprints.ToList();
				ViewBag.ListSprints = listSprints;
			}
			return View(project);
		}

		[HttpGet]
		public async Task<IActionResult> GetUserImage(string userId)
		{
			try
			{
				var user = await _context.Users.FindAsync(userId);

				if (user != null)
				{
					return Json(new { image = user.Image });
				}

				return NotFound();
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Internal server error: {ex.Message}");
			}
		}
	}
}
