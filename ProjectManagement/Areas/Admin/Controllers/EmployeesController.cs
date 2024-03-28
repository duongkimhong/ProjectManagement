using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Utilities.IO;
using ProjectManagement.Models;
using System.Data;
using System.Security.Claims;
using X.PagedList;

namespace ProjectManagement.Areas.Admin.Controllers
{
	[Area("Admin")]
	public class EmployeesController : Controller
	{
		private readonly ApplicationDbContext _context;
		private readonly UserManager<ApplicationUser> _userManager;

		public EmployeesController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
		{
			_context = context;
			_userManager = userManager;
		}

		[HttpGet]
		public async Task<IActionResult> Index(int? page)
		{
			int pageSize = 10;
			int pageNumber = page ?? 1;
			IEnumerable<ApplicationUser> employees = _context.Users.ToList();
			var pagedListNews = await employees.ToPagedListAsync(pageNumber, pageSize);
			return View(pagedListNews);
		}

		[HttpGet]
		public async Task<IActionResult> EmployeeDetails(string id)
		{
			try
			{
				var employee = await _context.Users.FindAsync(id);
				if (employee == null)
				{
					return NotFound();
				}

                // Tìm tất cả các nhóm mà người dùng tham gia
                var teamMemberships = await _context.TeamMembers
                    .Include(t => t.Teams) 
                    .ThenInclude(p => p.Projects) 
                    .Where(u => u.UserID == id && u.Status == MemberStatus.Active)
                    .ToListAsync();

                // Tạo danh sách các dự án mà người dùng tham gia
                var projects = new List<Projects>();
                foreach (var teamMembership in teamMemberships)
                {
                    var team = teamMembership.Teams;
                    if (team != null)
                    {
                        var project = team.Projects;
                        if (project != null)
                        {
                            projects.Add(project);
                        }
                    }
                }

				var inProgressIssues = await _context.Issues.Include(a => a.Assignee)
				.Where(i => i.Assignee.Id == id && i.Status == IssueStatus.InProgress).ToListAsync();

				// Gửi danh sách dự án vào ViewBag để sử dụng trong View
				ViewBag.EmployeeProjects = projects;
                ViewBag.EmployeeInfo = employee;
				ViewBag.InProgressIssues = inProgressIssues;
				return View(employee);
			} catch(Exception ex)
			{
				return View("Error");
			}
		}

		public async Task<IActionResult> updateEmployeeActive(string employeeId, string status, int? page)
		{
			try
			{
				var employee = await _context.Users.FindAsync(employeeId);
				if (employee == null)
				{
					return NotFound();
				}

				if(status == "Block")
				{
					employee.IsActive = false;
				}
				else
				{
					employee.IsActive = true;
				}
				await _context.SaveChangesAsync();
				//return Json(new { success = true });
				int pageSize = 10;
				int pageNumber = page ?? 1;
				IEnumerable<ApplicationUser> employees = _context.Users.ToList();
				var pagedListNews = await employees.ToPagedListAsync(pageNumber, pageSize);
				return PartialView("_EmployeesPartial", pagedListNews);
			}
			catch (Exception ex)
			{
				ViewBag.ErrorMessage = "Có lỗi xảy ra khi truy vấn dữ liệu.";
				return View("Error");
			}
		}

		public async Task<IActionResult> updateUserRole(string userId, string roleId, int? page)
		{
			// Kiểm tra xem userId và roleId có tồn tại trong cơ sở dữ liệu không
			var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
			var role = await _context.Roles.FirstOrDefaultAsync(r => r.Id == roleId);

			if (user == null || role == null)
			{
				return NotFound();
			}

			try
			{
				// Xóa dòng dữ liệu hiện tại trong bảng UserRoles có UserId tương ứng
				var userRole = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.UserId == userId);
				if (userRole != null)
				{
					_context.UserRoles.Remove(userRole);
					await _context.SaveChangesAsync();
				}

				// Tạo một dòng dữ liệu mới với roleId mới và userId giữ nguyên
				var newUserRole = new IdentityUserRole<string> { UserId = userId, RoleId = roleId };
				_context.UserRoles.Add(newUserRole);
				await _context.SaveChangesAsync();

				int pageSize = 10;
				int pageNumber = page ?? 1;
				IEnumerable<ApplicationUser> employees = _context.Users.ToList();
				var pagedListNews = await employees.ToPagedListAsync(pageNumber, pageSize);
				return PartialView("_EmployeesPartial", pagedListNews);
			}
			catch (Exception ex)
			{
				// Xử lý lỗi
				return StatusCode(500, "Internal server error: " + ex.Message);
			}
		}
	}
}
