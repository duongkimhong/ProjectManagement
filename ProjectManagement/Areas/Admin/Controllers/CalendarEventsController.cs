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
    public class CalendarEventsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CalendarEventsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Admin/CalendarEvents
        public async Task<IActionResult> Index()
        {
            var applicationDbContext = _context.CalendarEvent.Include(c => c.User);
            return View(await applicationDbContext.ToListAsync());
        }

        // GET: Admin/CalendarEvents/Details/5
        public async Task<IActionResult> Details(Guid? id)
        {
            if (id == null || _context.CalendarEvent == null)
            {
                return NotFound();
            }

            var calendarEvent = await _context.CalendarEvent
                .Include(c => c.User)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (calendarEvent == null)
            {
                return NotFound();
            }

            return View(calendarEvent);
        }

        // GET: Admin/CalendarEvents/Create
        public IActionResult Create()
        {
            ViewData["UserID"] = new SelectList(_context.Users, "Id", "Id");
            return View();
        }

        // POST: Admin/CalendarEvents/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,Subject,Description,StartTime,EndTime,IsFullday,UserID")] CalendarEvent calendarEvent)
        {
            if (ModelState.IsValid)
            {
                calendarEvent.Id = Guid.NewGuid();
                _context.Add(calendarEvent);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["UserID"] = new SelectList(_context.Users, "Id", "Id", calendarEvent.UserID);
            return View(calendarEvent);
        }

        // GET: Admin/CalendarEvents/Edit/5
        public async Task<IActionResult> Edit(Guid? id)
        {
            if (id == null || _context.CalendarEvent == null)
            {
                return NotFound();
            }

            var calendarEvent = await _context.CalendarEvent.FindAsync(id);
            if (calendarEvent == null)
            {
                return NotFound();
            }
            ViewData["UserID"] = new SelectList(_context.Users, "Id", "Id", calendarEvent.UserID);
            return View(calendarEvent);
        }

        // POST: Admin/CalendarEvents/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, [Bind("Id,Subject,Description,StartTime,EndTime,IsFullday,UserID")] CalendarEvent calendarEvent)
        {
            if (id != calendarEvent.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(calendarEvent);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!CalendarEventExists(calendarEvent.Id))
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
            ViewData["UserID"] = new SelectList(_context.Users, "Id", "Id", calendarEvent.UserID);
            return View(calendarEvent);
        }

        // GET: Admin/CalendarEvents/Delete/5
        public async Task<IActionResult> Delete(Guid? id)
        {
            if (id == null || _context.CalendarEvent == null)
            {
                return NotFound();
            }

            var calendarEvent = await _context.CalendarEvent
                .Include(c => c.User)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (calendarEvent == null)
            {
                return NotFound();
            }

            return View(calendarEvent);
        }

        // POST: Admin/CalendarEvents/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(Guid id)
        {
            if (_context.CalendarEvent == null)
            {
                return Problem("Entity set 'ApplicationDbContext.CalendarEvent'  is null.");
            }
            var calendarEvent = await _context.CalendarEvent.FindAsync(id);
            if (calendarEvent != null)
            {
                _context.CalendarEvent.Remove(calendarEvent);
            }
            
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool CalendarEventExists(Guid id)
        {
          return (_context.CalendarEvent?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
