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

			var projects = await _context.Projects.Include(s => s.Sprints).ThenInclude(i => i.Issues)
				.Where(p => p.Status != ProjectStatus.Cancelled).ToListAsync();

			await CalculateProjectCompletionAsync(projects);

			var todoIssues = await _context.Issues.Include(a => a.Assignee)
				.Where(i => i.Assignee.Id == currentUser.Id && i.Status == IssueStatus.Todo).ToListAsync();

			var inProgressIssues = await _context.Issues.Include(a => a.Assignee)
				.Where(i => i.Assignee.Id == currentUser.Id && i.Status == IssueStatus.InProgress).ToListAsync();

			var top5Notes = await _context.Notes
				.Where(n => n.UserID == currentUser.Id)
				.OrderByDescending(n => n.Timestamp)
				.Take(5)
				.ToListAsync();

			ViewBag.Projects = projects;
			ViewBag.TodoIssues = todoIssues;
			ViewBag.InProgressIssues = inProgressIssues;
			ViewBag.Top5Notes = top5Notes;

			return View();
		}

		private async Task CalculateProjectCompletionAsync(List<Projects> projects)
		{
			foreach (var project in projects)
			{
				//int totalIssues = 0;
				//int completedIssues = 0;
				double? totalStoryPoints = 0;
				double? completeStoryPoint = 0;

				foreach (var sprint in project.Sprints)
				{
					foreach (var issue in sprint.Issues)
					{
						//totalIssues++;
						totalStoryPoints = totalStoryPoints + issue.StoryPoint;
						if (issue.Status == IssueStatus.Completed)
						{
							//completedIssues++;
							completeStoryPoint = completeStoryPoint + issue.StoryPoint;
						}
					}
				}

				if (totalStoryPoints == 0)
				{
					project.Completion = 0;
				}
				else
				{
					project.Completion = (int)((double)completeStoryPoint / totalStoryPoints * 100);
				}
			}
		}
	}
}
