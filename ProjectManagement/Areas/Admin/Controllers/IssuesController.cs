using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Build.Evaluation;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ProjectManagement.Areas.Admin.Controllers
{
	[Area("Admin")]
	[Authorize]
	public class IssuesController : Controller
	{
		private readonly ApplicationDbContext _context;

		public IssuesController(ApplicationDbContext context)
		{
			_context = context;
		}

		// GET: Admin/Issues
		public async Task<IActionResult> Index()
		{
			var applicationDbContext = _context.Issues.Include(i => i.Assignee).Include(i => i.Reporter);
			return View(await applicationDbContext.ToListAsync());
		}

		// GET: Admin/Issues/Details/5
		public async Task<IActionResult> Details(Guid? id)
		{
			if (id == null || _context.Issues == null)
			{
				return NotFound();
			}

			var issues = await _context.Issues
				.Include(i => i.Assignee)
				.Include(i => i.Reporter)
				.FirstOrDefaultAsync(m => m.Id == id);
			if (issues == null)
			{
				return NotFound();
			}

			return View(issues);
		}

		// GET: Admin/Issues/Create
		public IActionResult Create()
		{
			ViewData["AssigneeID"] = new SelectList(_context.Users, "Id", "Id");
			ViewData["ReporterID"] = new SelectList(_context.Users, "Id", "Id");
			return View();
		}

		// POST: Admin/Issues/Create
		// To protect from overposting attacks, enable the specific properties you want to bind to.
		// For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Create([FromForm] Issues issues, [FromForm] string projectId)
		{
			Guid id = Guid.Parse(projectId);
			var project = await _context.Projects.FindAsync(id);
			var backlogSprint = await _context.Sprints.FirstOrDefaultAsync(s => s.Name == "Backlog" && s.ProjectID == id);

			issues.Id = Guid.NewGuid();
			issues.ReporterID = User.Identity.Name;
			issues.Reporter = _context.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
			issues.Status = IssueStatus.Todo;
			issues.Priority = Priorities.Medium;
			issues.SprintID = backlogSprint.Id;
			issues.Sprints = backlogSprint;
			issues.StoryPoint = 0;
			_context.Add(issues);
			await _context.SaveChangesAsync();
			return RedirectToAction("Index", "Sprints", new { area = "Admin", id = projectId });

		}

		// GET: Admin/Issues/Edit/5
		public async Task<IActionResult> Edit(Guid? issueId)
		{
			if (issueId == null || _context.Issues == null)
			{
				return NotFound();
			}

			var issue = await _context.Issues
				.Include(i => i.Assignee)
				.Include(i => i.Reporter) 
				.Include(i => i.Epics)
				//.Include(i => i.Sprints)
				.FirstOrDefaultAsync(i => i.Id == issueId);
			if (issue == null)
			{
				return NotFound();
			}
			// Kiểm tra và gán giá trị từ Assignee và Reporter
			var assigneeFullName = issue.Assignee != null ? issue.Assignee.FullName : null;
			var assigneeImage = issue.Assignee != null ? issue.Assignee.Image : null;
			var reporterFullName = issue.Reporter != null ? issue.Reporter.FullName : null;
			var reporterImage = issue.Reporter != null ? issue.Reporter.Image : null;

			Guid? epicId = null;
			var epic = await _context.Epics.FirstOrDefaultAsync(e => e.Id == issue.EpicID);
			if (epic != null)
			{
				epicId = epic.Id;
			}
			return Json(new
			{
				Id = issue.Id,
				Name = issue.Name,
				Type = issue.Type,
				StartDate = issue.StartDate,
				EndDate = issue.EndDate,
				Description = issue.Description,
				Status = issue.Status,
				Priority = issue.Priority,
				IsFlag = issue.IsFlag,
				StoryPoint = issue.StoryPoint,
				SprintId = issue.SprintID,
				EpicId = epicId,
				Assignee = new
				{
					FullName = assigneeFullName,
					Image = assigneeImage
				},
				Reporter = new
				{
					FullName = reporterFullName,
					Image = reporterImage
				}
			});
		}

		// POST: Admin/Issues/Edit/5
		// To protect from overposting attacks, enable the specific properties you want to bind to.
		// For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name,Type,StartDate,EndDate,Description,Status,Priority,IsFlag,StoryPoint,ReporterID,AssigneeID,SprintID,EpicID")] Issues issues)
		{
			if (id != issues.Id)
			{
				return NotFound();
			}

			if (ModelState.IsValid)
			{
				try
				{
					_context.Update(issues);
					await _context.SaveChangesAsync();
				}
				catch (DbUpdateConcurrencyException)
				{
					if (!IssuesExists(issues.Id))
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
			ViewData["AssigneeID"] = new SelectList(_context.Users, "Id", "Id", issues.AssigneeID);
			ViewData["ReporterID"] = new SelectList(_context.Users, "Id", "Id", issues.ReporterID);
			return View(issues);
		}

		public async Task<IActionResult> updateIssueSprint(Guid issueId, Guid sprintId)
		{
			try
			{
				//Guid id = Guid.Parse(issueId);
				var issue = await _context.Issues.FindAsync(issueId);
				var sprint = await _context.Sprints.FindAsync(sprintId);
				issue.SprintID = sprintId;
				issue.Sprints = sprint;
				//var projectId = sprint.ProjectID;
				_context.Update(issue);
				await _context.SaveChangesAsync();


				//return RedirectToAction("Index", "Sprints", new { area = "Admin", id = projectId });
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		[HttpPost]
		public async Task<IActionResult> UpdateEpic(Guid issueId, Guid epicId)
		{
			var issue = await _context.Issues.FindAsync(issueId);
			var epic = await _context.Epics.FindAsync(epicId);

			if (issue != null && epic != null)
			{
				// Thực hiện logic cập nhật ở đây, ví dụ:
				issue.EpicID = epicId;
				_context.SaveChanges();

				return Json(new { success = true });
			}
			else
			{
				return Json(new { success = false });
			}
		}

		// GET: Admin/Issues/Delete/5
		public async Task<IActionResult> Delete(Guid? id)
		{
			if (id == null || _context.Issues == null)
			{
				return NotFound();
			}

			var issues = await _context.Issues
				.Include(i => i.Assignee)
				.Include(i => i.Reporter)
				.FirstOrDefaultAsync(m => m.Id == id);
			if (issues == null)
			{
				return NotFound();
			}

			return View(issues);
		}

		// POST: Admin/Issues/Delete/5
		[HttpPost, ActionName("Delete")]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> DeleteConfirmed(Guid id)
		{
			if (_context.Issues == null)
			{
				return Problem("Entity set 'ApplicationDbContext.Issues'  is null.");
			}
			var issues = await _context.Issues.FindAsync(id);
			if (issues != null)
			{
				_context.Issues.Remove(issues);
			}

			await _context.SaveChangesAsync();
			return RedirectToAction(nameof(Index));
		}

		private bool IssuesExists(Guid id)
		{
			return (_context.Issues?.Any(e => e.Id == id)).GetValueOrDefault();
		}

		[HttpPost]
		// BUG: không lấy đúng id của issue cần unlink epic
		public async Task<IActionResult> UnlinkEpic(Guid issueId)
		{
			var issue = _context.Issues.Find(issueId);
			if (issue != null)
			{
				issue.EpicID = null;
				issue.Epics = null;
				_context.Update(issue);
				await _context.SaveChangesAsync();
				return Json(new { success = true });
			}
			return Json(new { success = false });
		}

		[HttpPost]
		public async Task<IActionResult> UpdateIssueType(Guid issueId, string type)
		{
			var issue = await _context.Issues.FindAsync(issueId);
			if (issue != null)
			{
				switch (type)
				{
					case "Task":
						issue.Type = IssueType.Task;
						break;
					case "Bug":
						issue.Type = IssueType.Bug;
						break;
					case "User story":
						issue.Type = IssueType.UserStory;
						break;
					default:
						break;
				}
				_context.Update(issue);
				await _context.SaveChangesAsync();
				return Json(new { success = true });
			}
			return Json(new { success = false });
		}

		public async Task<IActionResult> UpdateIssueStatus(string issueId, string status)
		{
			try
			{
				Guid id = Guid.Parse(issueId);
				var issue = await _context.Issues.FindAsync(id);
				if (status == "Todo")
				{
					issue.Status = IssueStatus.Todo;
				}
				else if (status == "In Progress")
				{
					issue.Status = IssueStatus.InProgress;
				}
				else
				{
					issue.Status = IssueStatus.Done;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				// Trong trường hợp có lỗi xảy ra, bạn có thể trả về một phản hồi lỗi
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> updateIssuePriority(string issueId, string priority)
		{
			try
			{
				Guid id = Guid.Parse(issueId);
				var issue = await _context.Issues.FindAsync(id);
				if (priority == "Lowest")
				{
					issue.Priority = Priorities.Lowest;
				}
				else if (priority == "Low")
				{
					issue.Priority = Priorities.Low;
				} else if (priority == "Medium")
				{
					issue.Priority = Priorities.Medium;
				} else if (priority == "High")
				{
					issue.Priority = Priorities.High;
				}
				else
				{
					issue.Priority = Priorities.Highest;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				// Trong trường hợp có lỗi xảy ra, bạn có thể trả về một phản hồi lỗi
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueEpic(Guid issueId, Guid epicId)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				var epic = await _context.Epics.FindAsync(epicId);
				if(issue != null && epic != null)
				{
					issue.EpicID = epicId;
					issue.Epics = epic;
				} else if(epic == null && issue != null)
				{
					issue.EpicID = null;
					issue.Epics = null;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueName(Guid issueId, string name)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				if (issue != null)
				{
					issue.Name = name;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueDescription(Guid issueId, string description)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				if (issue != null)
				{
					issue.Description = description;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueStartDate(Guid issueId, DateTime date)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				if (issue != null)
				{
					issue.StartDate = date;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueEndDate(Guid issueId, DateTime date)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				if (issue != null)
				{
					issue.EndDate = date;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueStoryPoint(Guid issueId, int storyPoint)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				if (issue != null)
				{
					issue.StoryPoint = storyPoint;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueAssignee(Guid issueId, string userId)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				var user = await _context.Users.FindAsync(userId);
				if (issue != null)
				{
					issue.AssigneeID = userId;
					issue.Assignee = user;
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
