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
			var project = await _context.Projects
                    .Include(e => e.Epics)
					.Include(p => p.Sprints)
					.ThenInclude(s => s.Issues)
					.FirstOrDefaultAsync(p => p.Id == id);

			if (project == null)
			{
				return NotFound(); // Trả về lỗi 404 nếu không tìm thấy dự án
			}

			// Lấy sprint có tên "Backlog"
			var backlogSprint = project.Sprints.FirstOrDefault(s => s.Name == "Backlog");
            if(backlogSprint != null)
            {
                ViewBag.BacklogSprintId = backlogSprint.Id;
            }

			if (backlogSprint != null)
			{
				// Lấy danh sách các issue của sprint "Backlog"
				var backlogIssues = backlogSprint.Issues.ToList();

				// Đặt danh sách các issue vào ViewBag để sử dụng trong View
				ViewBag.BacklogIssues = backlogIssues;
			}

            var projectSprint = project.Sprints.Where(s => s.Name != "Backlog").ToList();

            ViewBag.ProjectSprints = projectSprint;

			var projectEpics = project.Epics.ToList();

			ViewBag.ProjectEpics = projectEpics;

			return View(project.Sprints); // Trả về danh sách Sprint của dự án
		}

        // GET: Admin/Sprints/Details/5
        public async Task<IActionResult> Details(Guid? id)
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
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name,Status,StartDate,EndDate,ProjectID")] Sprints sprints)
        {
			if (id != sprints.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(sprints);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!SprintsExists(sprints.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
				return Json(new { message = "Thành công" });
			}
            return View(sprints);
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
			// Cập nhật trạng thái của Sprint ở đây
			// Ví dụ:
			var sprint = _context.Sprints.FirstOrDefault(s => s.Id == sprintId);
			if (sprint != null && status == "Start")
			{
				sprint.Status = SprintStatus.Start;
				_context.SaveChanges();
				return Json(new { success = true });
			} else if(sprint != null && status == "Complete")
            {
				sprint.Status = SprintStatus.Complete;
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
