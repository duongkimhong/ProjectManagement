using Microsoft.AspNetCore.Mvc;

namespace ProjectManagement.Areas.Admin.Controllers
{
	[Area("Admin")]
	public class ChatController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
	}
}
