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
    public class CommentsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CommentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Admin/Comments
        public async Task<IActionResult> Index()
        {
            var applicationDbContext = _context.Comments.Include(c => c.User);
            return View(await applicationDbContext.ToListAsync());
        }

        // GET: Admin/Comments/Details/5
        public async Task<IActionResult> Details(Guid? id)
        {
            if (id == null || _context.Comments == null)
            {
                return NotFound();
            }

            var comments = await _context.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (comments == null)
            {
                return NotFound();
            }

            return View(comments);
        }

        // GET: Admin/Comments/Create
        public IActionResult Create()
        {
            ViewData["UserID"] = new SelectList(_context.Users, "Id", "Id");
            return View();
        }

        // POST: Admin/Comments/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        //[ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Guid issueId, string content)
        {
            if (ModelState.IsValid)
            {
				var issue = await _context.Issues.FindAsync(issueId);
				var comment = new Comments
				{
					Id = Guid.NewGuid(),
					Content = content,
					Timestamp = DateTime.Now,
					IssueID = issueId,
                    Issues = issue,
                    User = _context.Users.FirstOrDefault(u => u.UserName == User.Identity.Name)
			};
				_context.Comments.Add(comment);
				await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            //ViewData["UserID"] = new SelectList(_context.Users, "Id", "Id", comments.UserID);
            return View();
        }

        // GET: Admin/Comments/Edit/5
        public async Task<IActionResult> Edit(Guid? id)
        {
            if (id == null || _context.Comments == null)
            {
                return NotFound();
            }

            var comments = await _context.Comments.FindAsync(id);
            if (comments == null)
            {
                return NotFound();
            }
            ViewData["UserID"] = new SelectList(_context.Users, "Id", "Id", comments.UserID);
            return View(comments);
        }

        // POST: Admin/Comments/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, [Bind("Id,Content,Timestamp,UserID,IssueID")] Comments comments)
        {
            if (id != comments.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(comments);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!CommentsExists(comments.Id))
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
            ViewData["UserID"] = new SelectList(_context.Users, "Id", "Id", comments.UserID);
            return View(comments);
        }

        // GET: Admin/Comments/Delete/5
        public async Task<IActionResult> Delete(Guid? id)
        {
            if (id == null || _context.Comments == null)
            {
                return NotFound();
            }

            var comments = await _context.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (comments == null)
            {
                return NotFound();
            }

            return View(comments);
        }

        // POST: Admin/Comments/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(Guid id)
        {
            if (_context.Comments == null)
            {
                return Problem("Entity set 'ApplicationDbContext.Comments'  is null.");
            }
            var comments = await _context.Comments.FindAsync(id);
            if (comments != null)
            {
                _context.Comments.Remove(comments);
            }
            
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool CommentsExists(Guid id)
        {
          return (_context.Comments?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
