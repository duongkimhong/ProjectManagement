using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Models;

namespace ProjectManagement.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class NotesController : Controller
    {
        private readonly ApplicationDbContext _context;

        public NotesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Admin/Notes
        public async Task<IActionResult> Index(string id)
        {
            // Kiểm tra xem người dùng đã đăng nhập chưa
            if (User.Identity.IsAuthenticated)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
				var notes = await _context.Notes.Where(u => u.UserID == userId)
										 .OrderByDescending(n => n.Timestamp)
										 .ToListAsync();
				return View(notes);
            }
            else
            {
                return RedirectToAction("Login", "Account");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(string title, string content, string color)
        {
            var note = new Notes
            {
                Id = Guid.NewGuid(),
                Title = title,
                NoteContent = content,
                Color = color,
                UserID = User.Identity.Name,
                User = _context.Users.FirstOrDefault(u => u.UserName == User.Identity.Name),
                Timestamp = DateTime.Now
            };
            _context.Notes.Add(note);
            await _context.SaveChangesAsync();
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
			var notes = await _context.Notes.Where(u => u.UserID == userId)
										 .OrderByDescending(n => n.Timestamp)
										 .ToListAsync();
			return PartialView("_NotesPartial", notes);
        }

        // GET: Admin/Notes/Edit/5
        public async Task<IActionResult> Edit(Guid? id)
        {
            if (id == null || _context.Notes == null)
            {
                return NotFound();
            }

            var notes = await _context.Notes.FindAsync(id);
            if (notes == null)
            {
                return NotFound();
            }
            ViewData["UserID"] = new SelectList(_context.Users, "Id", "Id", notes.UserID);
            return View(notes);
        }

        // POST: Admin/Notes/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        public async Task<IActionResult> Edit(Guid id, string title, string content, string color)
        {
            var note = _context.Notes.Find(id);

            if (note == null)
            {
                return NotFound();
            }

            note.Title = title;
            note.NoteContent = content;
            note.Color = color;
            _context.Update(note);
            _context.SaveChanges();

			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
			var notes = await _context.Notes.Where(u => u.UserID == userId)
										 .OrderByDescending(n => n.Timestamp)
										 .ToListAsync();
			return PartialView("_NotesPartial", notes);
		}

        // POST: Admin/Notes/Delete/5
        [HttpPost, ActionName("Delete")]
        public async Task<IActionResult> DeleteConfirmed(Guid id)
        {
            if (_context.Notes == null)
            {
                return Problem("Entity set 'ApplicationDbContext.Notes'  is null.");
            }
            var note = await _context.Notes.FindAsync(id);
            if (note != null)
            {
                _context.Notes.Remove(note);
            }
            
            await _context.SaveChangesAsync();
			//return Json(new { success = true });
			
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
			var notes = await _context.Notes.Where(u => u.UserID == userId)
										 .OrderByDescending(n => n.Timestamp)
										 .ToListAsync();
			return PartialView("_NotesPartial", notes);
        }

        private bool NotesExists(Guid id)
        {
          return (_context.Notes?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
