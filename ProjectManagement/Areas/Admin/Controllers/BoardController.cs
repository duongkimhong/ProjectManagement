using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

		public async Task<IActionResult> Index(Guid id)
		{
			var project = await _context.Projects
					.Include(e => e.Epics)
					.Include(p => p.Sprints)
					.ThenInclude(s => s.Issues)
					.FirstOrDefaultAsync(p => p.Id == id);
			if (project != null)
			{
				var projectSprint = project.Sprints.Where(s => s.Status == SprintStatus.Start).ToList();
				ViewBag.BoardSprints = projectSprint;
			}
			return View();
		}
	}
}
