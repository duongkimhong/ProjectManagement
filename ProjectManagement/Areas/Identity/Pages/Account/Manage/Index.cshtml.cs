// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.
#nullable disable

using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ProjectManagement.Models;

namespace ProjectManagement.Areas.Identity.Pages.Account.Manage
{
    public class IndexModel : PageModel
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
		private readonly IWebHostEnvironment _environment;

		public IndexModel(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
			IWebHostEnvironment environment)
        {
            _userManager = userManager;
            _signInManager = signInManager;
			_environment = environment;
		}

        /// <summary>
        ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        [TempData]
        public string StatusMessage { get; set; }

        /// <summary>
        ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        [BindProperty]
        public InputModel Input { get; set; }

		/// <summary>
		///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
		///     directly from your code. This API may change or be removed in future releases.
		/// </summary>
		public string UploadedImageUrl { get; set; }
		public class InputModel
        {
            /// <summary>
            ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
            ///     directly from your code. This API may change or be removed in future releases.
            /// </summary>
            [Phone]
            [Display(Name = "Phone number")]
            public string PhoneNumber { get; set; }
            public string? FullName { get; set; }
            public string? Address { get; set; }
            public DateTime? DateOfBirth { get; set; }
            public string? ProfileImage { get; set; }
			[Display(Name = "Profile Image")]
			public IFormFile ProfileImageFile { get; set; }
		}

        private async Task LoadAsync(ApplicationUser user)
        {
            var userName = await _userManager.GetUserNameAsync(user);
            var phoneNumber = await _userManager.GetPhoneNumberAsync(user);
			var fullName = user.FullName;
			var address = user.Address;
			var dateOfBirth = user.Birthday; 
			var profileImage = user.Image;

			Username = userName;

            Input = new InputModel
            {
				PhoneNumber = phoneNumber,
				FullName = fullName,
				Address = address,
				DateOfBirth = dateOfBirth,
				ProfileImage = profileImage
			};
			if (!string.IsNullOrEmpty(profileImage))
			{
				UploadedImageUrl = profileImage;
			}
		}

        public async Task<IActionResult> OnGetAsync()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound($"Unable to load user with ID '{_userManager.GetUserId(User)}'.");
            }

            await LoadAsync(user);
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
			var user = await _userManager.GetUserAsync(User);
			if (user == null)
			{
				return NotFound($"Unable to load user with ID '{_userManager.GetUserId(User)}'.");
			}

			if (!ModelState.IsValid)
			{
				await LoadAsync(user);
				return Page();
			}

			var phoneNumber = await _userManager.GetPhoneNumberAsync(user);
			if (Input.PhoneNumber != phoneNumber)
			{
				var setPhoneResult = await _userManager.SetPhoneNumberAsync(user, Input.PhoneNumber);
				if (!setPhoneResult.Succeeded)
				{
					StatusMessage = "Unexpected error when trying to set phone number.";
					return RedirectToPage();
				}
			}

			// Handle profile image upload
			if (Input.ProfileImageFile != null)
			{
				var uploadsDirectory = Path.Combine(_environment.WebRootPath, "Uploads", "UserImage");
				if (!Directory.Exists(uploadsDirectory))
				{
					Directory.CreateDirectory(uploadsDirectory);
				}

				var fileName = $"{Guid.NewGuid().ToString()}_{Input.ProfileImageFile.FileName}";
				var filePath = Path.Combine(uploadsDirectory, fileName);

				using (var stream = new FileStream(filePath, FileMode.Create))
				{
					await Input.ProfileImageFile.CopyToAsync(stream);
				}

				// Update the Image field of the user model
				user.Image = $"/Uploads/UserImage/{fileName}";
			}
			user.Birthday = Input.DateOfBirth;
			user.Address = Input.Address;
			user.FullName = Input.FullName;
			await _userManager.UpdateAsync(user);

			await _signInManager.RefreshSignInAsync(user);
			StatusMessage = "Your profile has been updated";
			return RedirectToPage();
		}
    }
}
