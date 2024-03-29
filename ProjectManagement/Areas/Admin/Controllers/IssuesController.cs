﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Build.Evaluation;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using ProjectManagement.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ProjectManagement.Areas.Admin.Controllers
{
	[Area("Admin")]
	[Authorize]
	public class IssuesController : Controller
	{
		private readonly ApplicationDbContext _context;
		private readonly IWebHostEnvironment _environment;

		public IssuesController(ApplicationDbContext context, IWebHostEnvironment environment)
		{
			_context = context;
			_environment = environment;
		}

		// POST: Admin/Issues/Create
		[HttpPost]
		public async Task<IActionResult> Create(string name, string type, string projectId)
		{
			Guid id = Guid.Parse(projectId);
			var project = await _context.Projects.FindAsync(id);
			var backlogSprint = await _context.Sprints.FirstOrDefaultAsync(s => s.Name == "Backlog" && s.ProjectID == id);
			var issues = new Issues
			{
				Id = Guid.NewGuid(),
				Name = name,
				ReporterID = User.Identity.Name,
				Reporter = _context.Users.FirstOrDefault(u => u.UserName == User.Identity.Name),
				Status = IssueStatus.Todo,
				Priority = Priorities.Medium,
				SprintID = backlogSprint.Id,
				Sprints = backlogSprint,
				StoryPoint = 0
			};
			if (type == "Task") { issues.Type = IssueType.Task; }
			else if (type == "Bug") { issues.Type = IssueType.Bug; }
			else { issues.Type = IssueType.UserStory; }

			_context.Add(issues);
			await _context.SaveChangesAsync();
			return RedirectToAction("Index", "Sprints", new { area = "Admin", id = projectId });

		}

		// GET: Admin/Issues/Edit/5
		public async Task<IActionResult> Edit(Guid? issueId)
		{
			if (issueId == null || _context.Issues == null)
			{
				return NotFound();
			}

			var issue = await _context.Issues.Include(i => i.Assignee)
											.Include(i => i.Reporter)
											.Include(i => i.Epics)
											.Include(i => i.Comments)
												.ThenInclude(c => c.User)
											.Include(p => p.IssueDocument)
										.FirstOrDefaultAsync(i => i.Id == issueId);
			if (issue == null)
			{
				return NotFound();
			}
			// Kiểm tra và gán giá trị từ Assignee và Reporter
			var assigneeFullName = issue.Assignee != null ? issue.Assignee.FullName : null;
			var assigneeImage = issue.Assignee != null ? issue.Assignee.Image : null;
			var reporterFullName = issue.Reporter != null ? issue.Reporter.FullName : null;
			var reporterImage = issue.Reporter != null ? issue.Reporter.Image : null;

			var issueDocuments = new List<object>();
			foreach (var document in issue.IssueDocument)
			{
				var documentInfo = new
				{
					Id = document.Id,
					FileName = document.FileName,
					FilePath = document.FilePath
				};
				issueDocuments.Add(documentInfo);
			}

			Guid? epicId = null;
			var epic = await _context.Epics.FirstOrDefaultAsync(e => e.Id == issue.EpicID);
			if (epic != null)
			{
				epicId = epic.Id;
			}
			return Json(new
			{
				Id = issue.Id,
				Name = issue.Name,
				Type = issue.Type,
				StartDate = issue.StartDate,
				EndDate = issue.EndDate,
				Description = issue.Description,
				Status = issue.Status,
				Priority = issue.Priority,
				IsFlag = issue.IsFlag,
				StoryPoint = issue.StoryPoint,
				SprintId = issue.SprintID,
				EpicId = epicId,
				Assignee = new
				{
					FullName = assigneeFullName,
					Image = assigneeImage
				},
				Reporter = new
				{
					FullName = reporterFullName,
					Image = reporterImage
				},
				Comments = issue.Comments.Select(c => new
				{
					Id = c.Id,
					Content = c.Content,
					Timestamp = c.Timestamp,
					UserId = c.UserID,
					UserImage = c.User.Image,
					Username = c.User.UserName
				}),
				IssueDocuments = issueDocuments
			});
		}

		public async Task<IActionResult> updateIssueSprint(Guid issueId, Guid sprintId)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				var sprint = await _context.Sprints.FindAsync(sprintId);
				issue.SprintID = sprintId;
				issue.Sprints = sprint;
				//var projectId = sprint.ProjectID;
				_context.Update(issue);
				await _context.SaveChangesAsync();

				return Json(new { success = true });
				//var projectId = _context.Sprints.Where(e => e.Id == sprintId).Select(e => e.ProjectID).FirstOrDefault();
				//var projectSprints = _context.Sprints
				//		.Include(i => i.Issues)
				//		.ThenInclude(a => a.Assignee)
				//		.Where(s => s.ProjectID == projectId)
				//		.ToList();

				//if (projectSprints == null)
				//{
				//	return PartialView("_SprintsPartial", new List<Sprints>());
				//}
				//else
				//{
				//	return PartialView("_SprintsPartial", projectSprints);
				//}

			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		[HttpPost]
		public async Task<IActionResult> UpdateEpic(Guid issueId, Guid epicId)
		{
			var issue = await _context.Issues.FindAsync(issueId);
			var epic = await _context.Epics.FindAsync(epicId);

			if (issue != null && epic != null)
			{
				// Thực hiện logic cập nhật ở đây, ví dụ:
				issue.EpicID = epicId;
				issue.Epics = epic;
				_context.SaveChanges();

				return Json(new { success = true });
			}
			else
			{
				return Json(new { success = false });
			}
		}

		// POST: Admin/Issues/Delete/5
		[HttpPost]
		public async Task<IActionResult> DeleteConfirmed(Guid id)
		{
			if (_context.Issues == null)
			{
				return Problem("Entity set 'ApplicationDbContext.Issues'  is null.");
			}
			var issues = await _context.Issues.Include(d => d.IssueDocument).FirstOrDefaultAsync(i => i.Id == id);

			// Lấy danh sách các tài liệu thuộc dự án
			var issueDocuments = _context.IssueDocument.Where(pd => pd.IssueID == issues.Id).ToList();

			if (issueDocuments.Any())
			{
				_context.IssueDocument.RemoveRange(issueDocuments);

				foreach (var document in issueDocuments)
				{
					// Xóa tệp vật lý từ hệ thống tệp
					var filePath = Path.Combine(_environment.WebRootPath, document.FilePath.TrimStart('/'));
					if (System.IO.File.Exists(filePath))
					{
						System.IO.File.Delete(filePath);
					}
				}
			}

			if (issues.Comments != null)
			{
				_context.Comments.RemoveRange(issues.Comments);
			}

			if (issues != null)
			{
				_context.Issues.Remove(issues);
			}

			_context.SaveChangesAsync();
			return Json(new { success = true });
		}

		private bool IssuesExists(Guid id)
		{
			return (_context.Issues?.Any(e => e.Id == id)).GetValueOrDefault();
		}

		[HttpPost]
		public async Task<IActionResult> UnlinkEpic(Guid issueId)
		{
			var issue = _context.Issues.Find(issueId);
			if (issue != null)
			{
				issue.EpicID = null;
				issue.Epics = null;
				_context.Update(issue);
				await _context.SaveChangesAsync();
				return Json(new { success = true });
			}
			return Json(new { success = false });
		}

		[HttpPost]
		public async Task<IActionResult> UpdateIssueType(Guid issueId, string type)
		{
			var issue = await _context.Issues.FindAsync(issueId);
			if (issue != null)
			{
				switch (type)
				{
					case "Task":
						issue.Type = IssueType.Task;
						break;
					case "Bug":
						issue.Type = IssueType.Bug;
						break;
					case "User story":
						issue.Type = IssueType.UserStory;
						break;
					default:
						break;
				}
				_context.Update(issue);
				await _context.SaveChangesAsync();
				return Json(new { success = true });
			}
			return Json(new { success = false });
		}

		public async Task<IActionResult> UpdateIssueStatus(string issueId, string status)
		{
			try
			{
				Guid id = Guid.Parse(issueId);
				var issue = await _context.Issues.FindAsync(id);
				if (status == "Todo")
				{
					issue.Status = IssueStatus.Todo;
				}
				else if (status == "In Progress")
				{
					issue.Status = IssueStatus.InProgress;
					issue.ActualStartDate = DateTime.Now;
				}
				else
				{
					issue.Status = IssueStatus.Completed;
					issue.ActualEndDate = DateTime.Now;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				// Trong trường hợp có lỗi xảy ra, bạn có thể trả về một phản hồi lỗi
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> updateIssuePriority(string issueId, string priority)
		{
			try
			{
				Guid id = Guid.Parse(issueId);
				var issue = await _context.Issues.FindAsync(id);
				if (priority == "Lowest")
				{
					issue.Priority = Priorities.Lowest;
				}
				else if (priority == "Low")
				{
					issue.Priority = Priorities.Low;
				}
				else if (priority == "Medium")
				{
					issue.Priority = Priorities.Medium;
				}
				else if (priority == "High")
				{
					issue.Priority = Priorities.High;
				}
				else
				{
					issue.Priority = Priorities.Highest;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				// Trong trường hợp có lỗi xảy ra, bạn có thể trả về một phản hồi lỗi
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueEpic(Guid issueId, Guid epicId)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				var epic = await _context.Epics.FindAsync(epicId);
				if (issue != null && epic != null)
				{
					issue.EpicID = epicId;
					issue.Epics = epic;
				}
				else if (epic == null && issue != null)
				{
					issue.EpicID = null;
					issue.Epics = null;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueName(Guid issueId, string name)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				if (issue != null)
				{
					issue.Name = name;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueDescription(Guid issueId, string description)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				if (issue != null)
				{
					issue.Description = description;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueStartDate(Guid issueId, DateTime date)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				if (issue != null)
				{
					issue.StartDate = date;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueEndDate(Guid issueId, DateTime date)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				if (issue != null)
				{
					issue.EndDate = date;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueStoryPoint(Guid issueId, int storyPoint)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				if (issue != null)
				{
					issue.StoryPoint = storyPoint;
				}
				_context.SaveChanges();
				//return Json(new { success = true });

				//var projectSprints = await _context.Sprints.Include(s => s.Issues).ThenInclude(i => i.Assignee).Where(s => s.ProjectID == _context.Issues
				//									.Where(i => i.Id == issueId).Select(i => i.Sprints.ProjectID).FirstOrDefault()).ToListAsync();
				var issues = await _context.Issues.Include(i => i.Sprints).ThenInclude(s => s.Projects).FirstOrDefaultAsync(i => i.Id == issueId);
				var projectId = issue.Sprints?.Projects?.Id;
				var projectSprints = await _context.Sprints.Include(i => i.Issues).ThenInclude(a => a.Assignee).Where(s => s.ProjectID == projectId).ToListAsync();
				return PartialView("_SprintsPartial", projectSprints);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueAssignee(Guid issueId, string userId)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				if (userId != null)
				{
					var user = await _context.Users.FindAsync(userId);
					issue.AssigneeID = userId;
					issue.Assignee = user;
				}
				else
				{
					issue.AssigneeID = null;
					issue.Assignee = null;
				}

				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueIsFlag(Guid issueId, bool isFlag)
		{
			try
			{
				var issue = await _context.Issues.FindAsync(issueId);
				if (isFlag == true)
				{
					issue.IsFlag = true;
				}
				else
				{
					issue.IsFlag = false;
				}
				_context.SaveChanges();
				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		[HttpPost]
		public async Task<IActionResult> DeleteDocument(Guid documentId)
		{
			try
			{
				var issueDocument = _context.IssueDocument.FirstOrDefault(p => p.Id == documentId);

				if (issueDocument == null)
				{
					return NotFound();
				}

				_context.IssueDocument.Remove(issueDocument);
				_context.SaveChanges();

				// Xóa tệp vật lý từ hệ thống tệp
				var filePath = Path.Combine(_environment.WebRootPath, issueDocument.FilePath.TrimStart('/'));
				if (System.IO.File.Exists(filePath))
				{
					System.IO.File.Delete(filePath);
				}

				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		public async Task<IActionResult> UpdateIssueFiles(Guid issueId)
		{
			var issue = _context.Issues.Find(issueId);
			try
			{
				foreach (var file in Request.Form.Files)
				{
					if (file != null && file.Length > 0)
					{
						if (file.Length <= 10 * 1024 * 1024) // 10MB
						{
							string folder = "Uploads/IssueFile";
							string uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
							string filePath = Path.Combine(_environment.WebRootPath, folder, uniqueFileName);

							Directory.CreateDirectory(Path.Combine(_environment.WebRootPath, folder));

							using (var stream = new FileStream(filePath, FileMode.Create))
							{
								await file.CopyToAsync(stream);
							}

							string documentPath = "/" + folder + "/" + uniqueFileName;

							var issueDocument = new IssueDocument
							{
								Id = Guid.NewGuid(),
								FileName = file.FileName,
								FilePath = documentPath,
								IssueID = issue.Id,
								Issues = issue,
							};
							_context.Add(issueDocument);
							_context.SaveChanges();
						}
						else
						{
							ModelState.AddModelError("Documents", "Dung lượng tệp tải lên quá lớn (tối đa 10MB).");
							return View();
						}
					}
				}

				return Json(new { success = true });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Internal server error: {ex.Message}");
			}
		}

		[HttpGet]
		public IActionResult GetIssueComments(Guid issueId)
		{
			try
			{
				var issue = _context.Issues
				.Include(i => i.Comments)
					.ThenInclude(c => c.User)
				.FirstOrDefault(i => i.Id == issueId);

				var comments = issue.Comments.Select(c => new
				{
					Id = c.Id,
					Content = c.Content,
					Timestamp = c.Timestamp,
					UserId = c.UserID,
					UserImage = c.User.Image, // Lấy avatar của user
					Username = c.User.UserName
				});

				return Json(comments);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"An error occurred: {ex.Message}");
			}
		}

		[HttpGet]
		public IActionResult GetDocuments(Guid issueId)
		{
			var issue = _context.Issues.Include(i => i.IssueDocument).FirstOrDefault(i => i.Id == issueId);
			if (issue != null)
			{
				var issueDocuments = new List<object>();
				foreach (var document in issue.IssueDocument)
				{
					var documentInfo = new
					{
						Id = document.Id,
						FileName = document.FileName,
						FilePath = document.FilePath
					};
					issueDocuments.Add(documentInfo);
				}
				return Json(issueDocuments);
			}
			return Json(new List<object>());
		}
	}
}
