using System;
using System.Collections.Generic;
using System.Drawing;
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
        public async Task<IActionResult> Index()
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

        // POST: Admin/Notes/Edit/5
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

        public async Task<IActionResult> PinNote(Guid noteId)
        {
			var note = _context.Notes.Find(noteId);

			if (note == null)
			{
				return NotFound();
			}

			note.IsStick = true;
			_context.Update(note);
			_context.SaveChanges();

			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
			var notes = await _context.Notes.Where(u => u.UserID == userId)
										 .OrderByDescending(n => n.Timestamp)
										 .ToListAsync();
			return PartialView("_NotesPartial", notes);
		}

		public async Task<IActionResult> UnPinNote(Guid noteId)
		{
			var note = _context.Notes.Find(noteId);

			if (note == null)
			{
				return NotFound();
			}

			note.IsStick = false;
			_context.Update(note);
			_context.SaveChanges();

			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
			var notes = await _context.Notes.Where(u => u.UserID == userId)
										 .OrderByDescending(n => n.Timestamp)
										 .ToListAsync();
			return PartialView("_NotesPartial", notes);
		}
	}
}
