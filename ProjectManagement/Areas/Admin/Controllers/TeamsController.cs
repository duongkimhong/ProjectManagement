using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Models;
using X.PagedList;

namespace ProjectManagement.Areas.Admin.Controllers
{
	[Area("Admin")]
	public class TeamsController : Controller
	{
		private readonly ApplicationDbContext _context;

		public TeamsController(ApplicationDbContext context)
		{
			_context = context;
		}

		// GET: Admin/Teams
		public async Task<IActionResult> Index(int? page)
		{
			int pageSize = 10;
			int pageNumber = page ?? 1;
			IEnumerable<Teams> teams = await _context.Teams.Include(p => p.Projects)
											.Include(tm => tm.TeamMembers).ThenInclude(u => u.User).ToListAsync();

			var pagedListNews = await teams.ToPagedListAsync(pageNumber, pageSize);
			return View(pagedListNews);
			//var teams = await _context.Teams.Include(p => p.Projects)
			//								.Include(tm => tm.TeamMembers).ThenInclude(u => u.User).ToListAsync();
			//return View(teams);
		}

		// GET: Admin/Teams/Create
		public IActionResult Create()
		{
			return View();
		}

		// POST: Admin/Teams/Create
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Create([Bind("Id,Name,ProjectID")] Teams teams)
		{
			if (ModelState.IsValid)
			{
				teams.Id = Guid.NewGuid();
				_context.Add(teams);
				await _context.SaveChangesAsync();
				return RedirectToAction(nameof(Index));
			}
			return View(teams);
		}

		// POST: Admin/Teams/Delete/5
		[HttpPost, ActionName("Delete")]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> DeleteConfirmed(Guid id)
		{
			if (_context.Teams == null)
			{
				return Problem("Entity set 'ApplicationDbContext.Teams'  is null.");
			}
			var teams = await _context.Teams.FindAsync(id);
			if (teams != null)
			{
				_context.Teams.Remove(teams);
			}

			await _context.SaveChangesAsync();
			return RedirectToAction(nameof(Index));
		}

		public async Task<IActionResult> UpdateTeamName(Guid teamId, string newName)
		{
			try
			{
				var team = await _context.Teams.FindAsync(teamId);
				if (team != null)
				{
					team.Name = newName;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		[HttpGet]
		public async Task<IActionResult> GetTeamMembers(Guid teamId)
		{
			var teamMembers = _context.TeamMembers
				.Where(tm => tm.TeamID == teamId)
				.Select(tm => new
				{
					Id = tm.Id,
					UserName = tm.User.UserName,
					Image = tm.User.Image,
					Role = tm.Role,
					Status = tm.Status
				})
				.ToList();

			return Json(teamMembers);
		}

		public async Task<IActionResult> UpdateMemberRole(Guid teamMemberId, string roleName)
		{
			var member = _context.TeamMembers.Where(m => m.Id == teamMemberId).FirstOrDefault();
			if (roleName == "Member")
			{
				member.Role = roleName;
			}
			else if (roleName == "Product Owner")
			{
				member.Role = roleName;
			}
			else if (roleName == "Scrum Master")
			{
				member.Role = roleName;
			}
			_context.SaveChanges();
			return Json(new { success = true });
		}

		public async Task<IActionResult> UpdateMemberStatus(Guid teamMemberId, string status)
		{
			var member = _context.TeamMembers.Where(m => m.Id == teamMemberId).FirstOrDefault();
			if (status == "Block")
			{
				member.Status = MemberStatus.Blocked;
			}
			else if (status == "Activate")
			{
				member.Status = MemberStatus.Active;
			}
			else if (status == "Delete")
			{
				_context.Remove(member);
			}
			_context.SaveChanges();
			return Json(new { success = true, teamId = member.TeamID });
		}

		public async Task<IActionResult> GetAccountsToInvite(Guid teamId)
		{
			var teamMemberIds = _context.TeamMembers
								.Where(tm => tm.TeamID == teamId)
								.Select(tm => tm.UserID)
								.ToList();

			var accountsToInvite = await _context.Users.Where(u => !teamMemberIds.Contains(u.Id))
												.Select(u => new
												{
													userId = u.Id,
													userName = u.UserName,
													image = u.Image
												}).ToListAsync();

			return Json(accountsToInvite);
		}

		[HttpPost]
		public async Task<IActionResult> AddMembers(Guid teamId, string[] selectedAccounts)
		{
			try
			{
				// Tìm team dựa trên teamId
				var team = await _context.Teams
					.Include(t => t.TeamMembers)
					.FirstOrDefaultAsync(t => t.Id == teamId);

				if (team == null)
				{
					return NotFound();
				}

				// Lặp qua mỗi tài khoản đã chọn và thêm vào team
				foreach (var accountId in selectedAccounts)
				{
					// Kiểm tra xem tài khoản đã tồn tại trong team chưa
					if (!team.TeamMembers.Any(tm => tm.UserID == accountId))
					{
						// Thêm tài khoản vào team với trạng thái mặc định
						var teamMember = new TeamMembers
						{
							Id = new Guid(),
							TeamID = teamId,
							Teams = team,
							UserID = accountId,
							Status = MemberStatus.Pending,
							Role = "Member"
						};
						_context.TeamMembers.Add(teamMember);
					}
				}

				// Lưu thay đổi vào cơ sở dữ liệu
				await _context.SaveChangesAsync();

				// Trả về kết quả thành công
				return Ok();
			}
			catch (Exception ex)
			{
				// Xử lý lỗi và trả về một trạng thái lỗi nếu có lỗi xảy ra
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		[HttpGet]
		public async Task<IActionResult> GetProjects()
		{
			var projects = _context.Projects.ToList();
			return Json(projects);
		}

		public async Task<IActionResult> CreateTeam(string teamName, Guid projectId)
		{
			var project = _context.Projects.Find(projectId);
			var newTeam = new Teams
			{
				Id = new Guid(),
				Name = teamName,
				ProjectID = projectId,
				Projects = project
			};
			_context.Add(newTeam);
			_context.SaveChanges();
			return Json(new { success = true });
		}
	}
}
