using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Models;

namespace ProjectManagement.Areas.Admin.Controllers
{
    [Area("Admin")]
	[Authorize]
    public class HomeController : Controller
    {
		private readonly ApplicationDbContext _context;
		private readonly UserManager<ApplicationUser> _userManager;

		public HomeController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
		{
			_context = context;
			_userManager = userManager;
		}

		public async Task<IActionResult> Index()
        {
			var currentUser = await _userManager.GetUserAsync(User);
			if (currentUser == null)
			{
				return NotFound();
			}

			var projects = await _context.Projects.Where(p => p.Status != ProjectStatus.Cancelled).ToListAsync();

			var todoIssues = await _context.Issues.Include(a => a.Assignee)
			.Where(i => i.Assignee.Id == currentUser.Id && i.Status == IssueStatus.Todo).ToListAsync();

			var inProgressIssues = await _context.Issues.Include(a => a.Assignee)
				.Where(i => i.Assignee.Id == currentUser.Id && i.Status == IssueStatus.InProgress).ToListAsync();

			var top5Notes = await _context.Notes
			.Where(n => n.UserID == currentUser.Id)
			.OrderByDescending(n => n.Timestamp)
			.Take(5)
			.ToListAsync();

			// Truyền danh sách công việc vào view để hiển thị
			ViewBag.Projects = projects;
			ViewBag.TodoIssues = todoIssues;
			ViewBag.InProgressIssues = inProgressIssues;
			ViewBag.Top5Notes = top5Notes;

			return View();
        }
    }
}
