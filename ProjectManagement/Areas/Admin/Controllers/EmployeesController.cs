using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Models;
using System.Data;
using System.Security.Claims;

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
		public IActionResult Index()
		{
			var employees = _context.Users.ToList();

			return View(employees);
		}

		public async Task<IActionResult> Detail(string id)
		{
			try
			{
				var employee = await _context.Users.FindAsync(id);
				if (employee == null)
				{
					return NotFound();
				}
				ViewBag.EmployeeInfo = employee;
				return View(employee);
			}
			catch (Exception ex)
			{
				// Ghi lại chi tiết lỗi vào log hoặc hiển thị thông báo lỗi
				ViewBag.ErrorMessage = "Có lỗi xảy ra khi truy vấn dữ liệu.";
				return View("Error");
			}
		}

		public async Task<IActionResult> updateEmployeeActive(string employeeId, string status)
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
				var employees = _context.Users.ToList();
				return PartialView("_EmployeesPartial", employees);
			}
			catch (Exception ex)
			{
				ViewBag.ErrorMessage = "Có lỗi xảy ra khi truy vấn dữ liệu.";
				return View("Error");
			}
		}

		public async Task<IActionResult> updateUserRole(string userId, string roleId)
		{
			//var user = await _context.UserRoles.FirstOrDefaultAsync(u => u.UserId == userId);
			//if (user == null)
			//{
			//	return NotFound();
			//}
			//user.RoleId = roleId;
			//await _context.SaveChangesAsync();

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

				// Trả về kết quả thành công
				var employees = await _context.Users.ToListAsync();
				return PartialView("_EmployeesPartial", employees);
			}
			catch (Exception ex)
			{
				// Xử lý lỗi
				return StatusCode(500, "Internal server error: " + ex.Message);
			}
		}
	}
}
