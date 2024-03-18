using Microsoft.AspNetCore.Mvc;

namespace ProjectManagement.Areas.Admin.Controllers
{
	public class ChatController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
	}
}
