//Bắt sự kiện nút Create project
document.getElementById('myProjectTable').addEventListener('change', function () {
    var selectedValue = this.value;
    if (selectedValue === 'create') {
        // Hiển thị modal khi nút "Create" được chọn
        $('#createProjectModal').modal('show');
    }
});

//Chuyển hướng khi chọn trong dropdown danh sách project
var projectDropdown = document.getElementById('myProjectTable');

// Lấy giá trị đã chọn từ local storage (nếu có)
var selectedProjectId = localStorage.getItem('selectedProjectId');
if (selectedProjectId) {
    // Thiết lập giá trị đã chọn là mặc định
    projectDropdown.value = selectedProjectId;
}

projectDropdown.addEventListener('change', function () {
    var selectedProject = this.value;
    if (selectedProject !== 'create') {
        // Lưu giá trị đã chọn vào local storage
        localStorage.setItem('selectedProjectId', selectedProject);
        window.location.href = '/Admin/Sprints/Index/' + selectedProject;
    } else {
        // Xử lý tạo dự án mới
    }
});

//Hiển thị tên file hình ảnh
function displaySelectedFile() {
    var selectedFile = document.getElementById('fileInput').files[0];
    var fileName = selectedFile.name;
    document.getElementById('fileName').value = fileName;
}

//Hiển thị modal danh sách account để invite
function showInviteModal() {
    $('#inviteModal').modal('show'); // Show the invite modal
}

// Add an event listener to the Invite button
document.getElementById('inviteButton').addEventListener('click', function () {
    showInviteModal(); // Call the function to show the invite modal
});

//Xử lý mảng danh sách account được chọn
// Update selected users input when the invite button is clicked
$('#inviteButton').on('click', function () {
    updateSelectedUsersInput();
    $('#inviteModal').modal('show');
});

// Function to update selected users input
function updateSelectedUsersInput() {
    var selectedUsers = getSelectedUsers();
    $('#selectedUsersInput').val(JSON.stringify(selectedUsers));
}

// Function to get selected users
function getSelectedUsers() {
    var selectedUsers = [];
    $('.user-checkbox:checked').each(function () {
        selectedUsers.push($(this).data('user-id'));
    });
    return selectedUsers;
}

// Function to handle invite users action
function inviteUsers() {
    updateSelectedUsersInput();
}


$(document).ready(function () {
    // Xử lý sự kiện khi thay đổi giá trị của dropdown
    $('#myProjectTable').on('change', function () {
        var selectedValue = $(this).val();
        if (selectedValue === 'create') {
            $('#createProjectModal').modal('show');
        }
    });

    // Xử lý sự kiện khi click nút "Invite"
    $('#inviteButton').on('click', function () {
        $('#inviteModal').modal('show');
    });

    // Xử lý sự kiện khi checkbox thay đổi trạng thái
    $('.user-checkbox').on('change', function () {
        updateSelectedUsersInput();
    });

    // Xử lý sự kiện submit của form
    $('#createProjectForm').on('submit', function (event) {
        updateSelectedUsersInput();
    });
});

// Hàm cập nhật trường input ẩn với danh sách các user được chọn
function updateSelectedUsersInput() {
    var selectedUsers = [];
    $('.user-checkbox:checked').each(function () {
        selectedUsers.push($(this).data('user-id'));
    });
    $('#selectedUsersInput').val(JSON.stringify(selectedUsers));
}

document.addEventListener("DOMContentLoaded", function () {
    var rows = document.querySelectorAll(".modal-body table tbody tr");

    var searchInput = document.getElementById("searchInput");
    var searchButton = document.getElementById("searchButton");

    searchButton.addEventListener("click", function () {
        var keyword = searchInput.value.toLowerCase().trim();

        // Lặp qua từng hàng trong bảng
        rows.forEach(function (row) {
            var username = row.querySelector("td").textContent.toLowerCase();

            if (username.includes(keyword)) {
                row.style.display = "table-row";
            } else {
                row.style.display = "none";
            }
        });
    });
});

// Hàm hiển thị tệp đã chọn
function displaySelectedFile() {
    var selectedFile = $('#imgFileInput').prop('files')[0];
    var fileName = selectedFile.name;
    $('#fileName').val(fileName);
}

document.addEventListener("DOMContentLoaded", function () {
    var backlogLink = document.getElementById('backlogLink');
    var projectDropdown = document.getElementById('myProjectTable');

    // Lấy giá trị đã chọn từ dropdown và cập nhật vào thuộc tính asp-route-id của link
    function updateBacklogLink() {
        var selectedProject = projectDropdown.value;
        backlogLink.href = '/Admin/Sprints/Index/' + selectedProject;
    }

    // Gọi hàm cập nhật khi trang được tải và khi giá trị của dropdown thay đổi
    updateBacklogLink();
    projectDropdown.addEventListener('change', updateBacklogLink);
});

document.addEventListener("DOMContentLoaded", function () {
    var boardLink = document.getElementById('boardLink');
    var projectDropdown = document.getElementById('myProjectTable');

    function updateBoardLink() {
        var selectedProject = projectDropdown.value;
        boardLink.href = '/Admin/Board/Index/' + selectedProject;
    }

    updateBoardLink();
    projectDropdown.addEventListener('change', updateBoardLink);
});

jQuery(function ($) {
    var path = window.location.href;

    $('ul a').each(function () {
        if (this.href === path) {
            $(this).addClass('active');
        }
    });
});




