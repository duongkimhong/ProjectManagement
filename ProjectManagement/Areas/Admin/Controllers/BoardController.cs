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

		public class BurndownData
		{
			public List<double> PlannedStoryPoints { get; set; }
			public List<double> ActualStoryPoints { get; set; }
			public List<double> RemainingPlannedPoints { get; set; }
			public List<double> RemainingActualPoints { get; set; }
		}

		public IActionResult BurndownChart(Guid sprintId)
		{
			// Lấy sprint từ ID được cung cấp
			var sprint = _context.Sprints
				.Include(s => s.Issues)
				.FirstOrDefault(s => s.Id == sprintId);

			if (sprint == null)
			{
				return NotFound();
			}

			// Tính toán dữ liệu cho burndown chart dựa trên story points
			var plannedStoryPoints = new List<double>();
			var actualStoryPoints = new List<double>();

			// Lặp qua từng ngày của sprint
			DateTime currentDate = sprint.StartDate ?? DateTime.Now;
			while (currentDate <= (sprint.EndDate ?? DateTime.Now))
			{
				// Đếm tổng số story points dự kiến và thực tế cho ngày hiện tại
				double plannedPoints = sprint.Issues.Where(i => i.EndDate?.Date == currentDate.Date)
												 .Sum(i => i.StoryPoint ?? 0); // Chuyển đổi double? sang double và xử lý trường hợp null
				double actualPoints = sprint.Issues.Where(i => i.Status == IssueStatus.Completed && i.ActualEndDate != null && i.ActualEndDate.Value.Date == currentDate.Date)
													.Sum(i => i.StoryPoint ?? 0); // Chuyển đổi double? sang double và xử lý trường hợp null

				plannedStoryPoints.Add(plannedPoints);
				actualStoryPoints.Add(actualPoints);

				// Di chuyển tới ngày tiếp theo
				currentDate = currentDate.AddDays(1);
			}

			// Tính tổng số story points dự kiến và thực tế
			double totalPlannedStoryPoints = plannedStoryPoints.Sum();
			double totalActualStoryPoints = actualStoryPoints.Sum();

			// Tính toán giá trị cho remainingPlannedPoints và remainingActualPoints
			var remainingPlannedPoints = new List<double>();
			var remainingActualPoints = new List<double>();

			double remainingPlanned = totalPlannedStoryPoints;
			double remainingActual = totalActualStoryPoints;

			for (int i = 0; i < plannedStoryPoints.Count; i++)
			{
				remainingPlanned -= plannedStoryPoints[i];
				remainingActual -= actualStoryPoints[i];

				remainingPlannedPoints.Add(remainingPlanned);
				remainingActualPoints.Add(remainingActual);
			}

			// Gửi dữ liệu dưới dạng JSON về view
			var responseData = new
			{
				PlannedStoryPoints = plannedStoryPoints,
				ActualStoryPoints = actualStoryPoints,
				RemainingPlannedPoints = remainingPlannedPoints,
				RemainingActualPoints = remainingActualPoints
			};

			return Json(responseData);
		}
	}
}



