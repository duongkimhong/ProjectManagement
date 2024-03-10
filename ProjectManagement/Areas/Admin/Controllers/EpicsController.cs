using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Models;

namespace ProjectManagement.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class EpicsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public EpicsController(ApplicationDbContext context)
        {
            _context = context;
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
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([FromForm] Epics epics, string projectId)
        {
			Guid id = Guid.Parse(projectId);
			var project = await _context.Projects.FindAsync(id);
			if (ModelState.IsValid)
            {
                epics.Id = Guid.NewGuid();
                epics.Priority = Priorities.Medium;
				epics.ProjectID = id;
				epics.Projects = project;
                epics.Color = "#8E7AB5";
				epics.ReporterID = User.Identity.Name;
				epics.Reporter = _context.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
				_context.Add(epics);
                await _context.SaveChangesAsync();
				return RedirectToAction("Index", "Sprints", new { area = "Admin", id = projectId });
			}
            ViewData["ReporterID"] = new SelectList(_context.Users, "Id", "Id", epics.ReporterID);
            return View(epics);
        }

        // GET: Admin/Epics/Edit/5
        public async Task<IActionResult> Edit(Guid? id)
        {
            if (id == null || _context.Epics == null)
            {
                return NotFound();
            }

            var epics = await _context.Epics.FindAsync(id);
            if (epics == null)
            {
                return NotFound();
            }
            ViewData["ReporterID"] = new SelectList(_context.Users, "Id", "Id", epics.ReporterID);
            return View(epics);
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
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(Guid id)
        {
            if (_context.Epics == null)
            {
                return Problem("Entity set 'ApplicationDbContext.Epics'  is null.");
            }
            var epics = await _context.Epics.FindAsync(id);
            if (epics != null)
            {
                _context.Epics.Remove(epics);
            }
            
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool EpicsExists(Guid id)
        {
          return (_context.Epics?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
