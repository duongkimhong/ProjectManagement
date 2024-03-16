//Bắt sự kiện nút Create project
// Bắt sự kiện click vào nút "Create"
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
    // Lấy tệp được chọn
    var selectedFile = document.getElementById('fileInput').files[0];

    // Lấy tên của tệp
    var fileName = selectedFile.name;

    // Hiển thị tên tệp trong input text
    document.getElementById('fileName').value = fileName;
}

//Hiển thị modal danh sách account để invite
// Function to show the invite modal
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

// Hàm hiển thị tệp đã chọn
function displaySelectedFile() {
    var selectedFile = $('#fileInput').prop('files')[0];
    var fileName = selectedFile.name;
    $('#fileName').val(fileName);
}

//Tạo link cho nút backlog ở sidebar theo id của project đang được chọn trên dropdown button
document.addEventListener("DOMContentLoaded", function () {
    var backlogLink = document.getElementById('backlogLink');

    backlogLink.addEventListener('click', function (event) {
        event.preventDefault(); // Ngăn chặn hành động mặc định của liên kết

        var projectDropdown = document.getElementById('myProjectTable');
        var selectedProject = projectDropdown.value;

        if (selectedProject !== 'create') {
            var url = '/Admin/Sprints/Index/' + selectedProject;
            window.location.href = url;
        } else {
            
        }
    });
});

//Tạo link cho nút board ở sidebar theo id của project đang được chọn trên dropdown button
document.addEventListener("DOMContentLoaded", function () {
    var boardLink = document.getElementById('boardLink');

    boardLink.addEventListener('click', function (event) {
        event.preventDefault();

        var projectDropdown = document.getElementById('myProjectTable');
        var selectedProject = projectDropdown.value;
        console.log(selectedProject);
        if (selectedProject !== 'create') {
            var url = '/Admin/Board/Index/' + selectedProject;
            window.location.href = url;
        } else {
           
        }
    });
});