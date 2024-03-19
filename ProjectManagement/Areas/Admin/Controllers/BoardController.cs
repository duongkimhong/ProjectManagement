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
			//var project = await _context.Projects
			//		.Include(e => e.Epics)
			//		.Include(p => p.Sprints)
			//		.ThenInclude(s => s.Issues).ThenInclude(a => a.Assignee)
			//		.FirstOrDefaultAsync(p => p.Id == id);
			//if (project != null)
			//{
			//	var projectSprint = project.Sprints.Where(s => s.Status == SprintStatus.Start).ToList();
			//	ViewBag.BoardSprints = projectSprint;

			//	var projectEpics = project.Epics.ToList();
			//	ViewBag.ProjectEpics = projectEpics;

			//	var listSprints = project.Sprints.ToList();
			//	ViewBag.ListSprints = listSprints;
			//}

			var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id);

			if (project == null)
			{
				return NotFound();
			}

			// Lấy danh sách Sprint của dự án
			var projectSprints = await _context.Sprints.Include(i => i.Issues).ThenInclude(a => a.Assignee)
				.Where(s => s.ProjectID == id)
				.ToListAsync();

			// Lấy danh sách Epics của dự án
			var projectEpics = await _context.Epics
				.Where(e => e.ProjectID == id)
				.ToListAsync();

			// lấy dánh sách các thành viên thuộc dự án
			var teamMembers = await _context.Teams
				.Where(t => t.ProjectID == id)
				.SelectMany(t => t.TeamMembers)
				.Select(tm => new
				{
					userId = tm.User.Id,
					UserName = tm.User.UserName,
					Image = tm.User.Image
				})
				.ToListAsync();

			// Gán dữ liệu vào ViewBag
			var boardSprint = project.Sprints.Where(s => s.Status == SprintStatus.Start).ToList();
			ViewBag.BoardSprints = boardSprint;
			ViewBag.ListSprints = projectSprints;
			ViewBag.ProjectEpics = projectEpics;
			ViewBag.ProjectTeamMembers = teamMembers;
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
