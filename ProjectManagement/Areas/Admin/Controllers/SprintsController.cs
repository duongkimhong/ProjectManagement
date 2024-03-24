using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Models;

namespace ProjectManagement.Areas.Admin.Controllers
{
	[Area("Admin")]
	[Authorize]
	public class SprintsController : Controller
	{
		private readonly ApplicationDbContext _context;

		public SprintsController(ApplicationDbContext context)
		{
			_context = context;
		}

		// GET: Admin/Sprints
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
				.Where(tm => tm.Status != MemberStatus.Blocked && tm.Status != MemberStatus.Pending)
				.Select(tm => new
				{
					userId = tm.User.Id,
					UserName = tm.User.UserName,
					Image = tm.User.Image
				})
				.ToListAsync();

			// Gán dữ liệu vào ViewBag
			ViewBag.ProjectSprints = projectSprints;
			ViewBag.ProjectEpics = projectEpics;
			ViewBag.ProjectTeamMembers = teamMembers;

			return View();
		}

		// GET: Admin/Sprints/Create
		public IActionResult Create()
		{
			return View();
		}

		// POST: Admin/Sprints/Create
		// To protect from overposting attacks, enable the specific properties you want to bind to.
		// For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Create([FromForm] Sprints sprints, string projectId)
		{
			Guid id = Guid.Parse(projectId);
			var project = await _context.Projects.FindAsync(id);
			if (ModelState.IsValid)
			{
				sprints.Id = Guid.NewGuid();
				sprints.ProjectID = id;
				sprints.Projects = project;
				_context.Add(sprints);
				await _context.SaveChangesAsync();
				return RedirectToAction("Index", "Sprints", new { area = "Admin", id = projectId });
			}
			return View(sprints);
		}

		// GET: Admin/Sprints/Edit/5
		public async Task<IActionResult> Edit(Guid? id)
		{
			if (id == null || _context.Sprints == null)
			{
				return NotFound();
			}

			var sprints = await _context.Sprints.FindAsync(id);
			if (sprints == null)
			{
				return NotFound();
			}
			return View(sprints);
		}

		// POST: Admin/Sprints/Edit/5
		[HttpPost]
		public async Task<IActionResult> Edit(Guid id, string name, DateTime startDate, DateTime endDate, string SprintGoal)
		{
			var sprint = await _context.Sprints.FindAsync(id);

			try
			{
				sprint.Name = name;
				sprint.StartDate = startDate;
				sprint.EndDate = endDate;
				sprint.SprintGoal = SprintGoal;
				_context.Update(sprint);
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				_context.Update(sprint);
			}
			return Json(new { message = "Thành công" });

		}

		// GET: Admin/Sprints/Delete/5
		public async Task<IActionResult> Delete(Guid? id)
		{
			if (id == null || _context.Sprints == null)
			{
				return NotFound();
			}

			var sprints = await _context.Sprints
				.FirstOrDefaultAsync(m => m.Id == id);
			if (sprints == null)
			{
				return NotFound();
			}

			return View(sprints);
		}

		// POST: Admin/Sprints/Delete/5
		[HttpPost, ActionName("Delete")]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> DeleteConfirmed(Guid id)
		{
			if (_context.Sprints == null)
			{
				return Problem("Entity set 'ApplicationDbContext.Sprints'  is null.");
			}
			var sprints = await _context.Sprints.FindAsync(id);
			if (sprints != null)
			{
				_context.Sprints.Remove(sprints);
			}

			await _context.SaveChangesAsync();
			return RedirectToAction(nameof(Index));
		}

		private bool SprintsExists(Guid id)
		{
			return (_context.Sprints?.Any(e => e.Id == id)).GetValueOrDefault();
		}

		[HttpPost]
		public IActionResult UpdateSprintStatus(Guid sprintId, string status)
		{
			var sprint = _context.Sprints.Include(i => i.Issues).FirstOrDefault(s => s.Id == sprintId);
			if (sprint != null && status == "Start")
			{
				sprint.Status = SprintStatus.Start;
				_context.SaveChanges();
				return Json(new { success = true });
			}
			else if (sprint != null && status == "Complete")
			{
				sprint.Status = SprintStatus.Complete;
				// Lặp qua các issue thuộc sprint
				foreach (var issue in sprint.Issues)
				{
					if (issue.Status != IssueStatus.Completed)
					{
						var backlogSprint = _context.Sprints.FirstOrDefault(s => s.Name == "Backlog");
						if (backlogSprint != null)
						{
							issue.Sprints = backlogSprint;
						}
					}
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			else
			{
				return Json(new { success = false });
			}
		}
	}
}
