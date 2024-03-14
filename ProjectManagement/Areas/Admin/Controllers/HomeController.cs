using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagement.Models;

namespace ProjectManagement.Areas.Admin.Controllers
{
    [Area("Admin")]
	[Authorize]
    public class HomeController : Controller
    {
		private readonly ApplicationDbContext _context;
		private readonly IWebHostEnvironment _environment;

		public HomeController(ApplicationDbContext context, IWebHostEnvironment environment)
		{
			_context = context;
			_environment = environment;
		}

		public IActionResult Index()
        {

            return View();
        }
    }
}
