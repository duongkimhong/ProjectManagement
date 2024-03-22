
var id;
var projectEditId;
$(document).ready(function () {
    $('.deleterow').on('click', function () {
        id = $(this).data('id');
        console.log(id);
        $('#confirmDelete').data('id', id);
    });

    // Xóa nhà hàng khi nhấn nút "Xóa" trên modal
    $('#confirmDelete').click(function () {
        var url = '/Admin/Projects/Delete/' + id;

        $.ajax({
            type: "POST",
            url: url,
            headers: {
                RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val()
            },
            success: function (data) {
                alert("Đã xóa thành công");
                location.reload();
            },
            error: function (data) {
                alert("Xóa thất bại");
            }
        });
    });
});

$(document).ready(function () {
    $('.close').click(function () {
        $('#editProjectModal').modal('hide');
        location.reload();
    });
});

function openEditModal(projectId) {
    $.ajax({
        url: '/Admin/Projects/Edit',
        method: 'GET',
        data: { projectId: projectId },
        success: function (response) {
            console.log(response);
            projectEditId = response.id;
            $('#projectId').val(response.id);
            $('#projectName').val(response.name);
            $('#projectDescrtiption').val(response.description);
            $('#projectImagePreview').attr('src', response.image);

            var startDateValue = new Date(response.startDate);
            startDateValue.setDate(startDateValue.getDate() + 1);
            if (!isNaN(startDateValue.getTime())) {
                var inputValue = startDateValue.toISOString().split('T')[0];
                $('#projectStartDate').val(inputValue);
            } else {
                console.error('Invalid start date:', response.startDate);
            }
            if (response.startDate === null) {
                $('#projectStartDate').val('');
            }

            var endDateValue = new Date(response.endDate);
            endDateValue.setDate(endDateValue.getDate() + 1);
            if (!isNaN(endDateValue.getTime())) {
                var inputValue = endDateValue.toISOString().split('T')[0];
                $('#projectEndDate').val(inputValue);
            } else {
                console.error('Invalid end date:', response.endDate);
            }
            if (response.endDate === null) {
                $('#projectEndDate').val('');
            }

            // Tạo một bảng để chứa thông tin của các thành viên
            var table = $('<table class="table"></table>');

            // Tạo dòng tiêu đề của bảng
            var headerRow = $('<tr></tr>');
            headerRow.append('<th>Hình ảnh</th>');
            headerRow.append('<th>Tên</th>');
            headerRow.append('<th>Vai trò</th>');
            headerRow.append('<th>#</th>');
            table.append(headerRow);

            // Hiển thị thông tin của các thành viên
            response.teamMembers.forEach(function (member) {
                // Tạo một dòng mới cho mỗi thành viên
                var row = $('<tr></tr>');

                // Tạo một thẻ div để chứa hình ảnh và đặt class là 'avatar-container'
                var imageCell = $('<td><div class="avatar-container"><img src="' + member.image + '" alt="' + member.userName + '" class="avatar"></div></td>');

                row.append(imageCell);

                var nameCell = $('<td>' + member.userName + '</td>');
                row.append(nameCell);

                var roleCell = $('<td>' + member.role + '</td>');
                row.append(roleCell);

                table.append(row);
            });

            // Thêm bảng vào phần tử có id là 'teamMembersContainer'
            $('#teamMembersContainer').append(table);

            var documentList = $('#documentList');
            documentList.empty(); // Xóa nội dung cũ trước khi thêm mới

            // Lặp qua danh sách tài liệu và tạo thẻ HTML cho mỗi tài liệu
            response.projectDocuments.forEach(function (document) {
                var lastSlashIndex = document.fileName.lastIndexOf('_');
                var fileName = document.fileName.substring(lastSlashIndex + 1);

                var documentHtml = '<div class="col-12 py-2 d-flex align-items-center">';
                documentHtml += '<div class="d-flex ms-3 align-items-center flex-fill">';
                documentHtml += '<div class="d-flex flex-column ps-3">';
                documentHtml += '<h6 class="fw-bold mb-0 small-14">' + fileName + '</h6>';
                documentHtml += '</div>';
                documentHtml += '</div>';
                documentHtml += '<a href="' + document.fileName + '" download>';
                documentHtml += '<button type="button" class="btn light-danger-bg text-end">Download</button>';
                documentHtml += '</a>';
                documentHtml += '<button type="button" style="margin-left: 5px;" class="btn light-danger-bg text-end delete-document-btn" onclick="showDeleteFileModal(\'' + document.documentId + '\')"><i class="icofont-ui-delete text-danger"></i></button>';
                documentHtml += '</div>';

                documentList.append(documentHtml);
            });

            // Hiển thị modal popup
            $('#editProjectModal').modal('show');
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

// update project name
function handleKeyPress(event) {
    if (event.keyCode === 13) {
        // Lấy giá trị của trường input
        var inputValue = document.getElementById("projectName").value;
        if (inputValue == '') {
            //alert('Issue name cannot be NULL');
        } else {
            $.ajax({
                url: '/Admin/Projects/UpdateProjectName',
                method: 'POST',
                data: { projectId: projectEditId, name: inputValue },
                success: function (response) {
                    //location.reload();
                },
                error: function (xhr, status, error) {
                    console.error(error);
                }
            });
        }
    }
}

// update project description
var originalDescription = ''; // Biến tạm để lưu trữ nội dung ban đầu
function updateProjectDescription() {
    var description = document.getElementById("projectDescrtiption").value;

    $.ajax({
        url: '/Admin/Projects/UpdateProjectDescription',
        method: 'POST',
        data: { projectId: projectEditId, description: description },
        success: function (response) {
            originalDescription = description;
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}
// Hàm gọi khi click nút "Cancel"
function cancelUpdate() {
    // Thiết lập lại nội dung của textarea bằng giá trị ban đầu
    document.getElementById("projectDescrtiption").value = originalDescription;
}
// update project startDate
var startDateInput = document.getElementById("projectStartDate");
startDateInput.addEventListener("blur", function () {
    var startDateValue = startDateInput.value;
    $.ajax({
        url: '/Admin/Projects/UpdateProjectStartDate',
        method: 'POST',
        data: { projectId: projectEditId, date: startDateValue },
        success: function (response) {
            //location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
});

// update project endDate
var endDateInput = document.getElementById("projectEndDate");
endDateInput.addEventListener("blur", function () {
    var endDateValue = endDateInput.value;
    $.ajax({
        url: '/Admin/Projects/UpdateProjectEndDate',
        method: 'POST',
        data: { projectId: projectEditId, date: endDateValue },
        success: function (response) {
            //location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
});

// update project image
function updateProjectImage(event) {
    var file = event.target.files[0];
    var formData = new FormData();
    formData.append('projectId', projectEditId);
    formData.append('image', file);

    $.ajax({
        url: '/Admin/Projects/UpdateProjectImage',
        method: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            // Cập nhật đường dẫn hình ảnh mới
            $('#projectImagePreview').attr('src', response.image);
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

//Hiển thị tên file hình ảnh
document.getElementById('editFileInput').addEventListener('change', function () {
    // Lấy tên của file được chọn
    var fileName = this.files[0].name;

    // Đặt tên file vào ô input
    document.getElementById('editCurrentImagePath').value = fileName;
});

//Hiển thị modal danh sách account
function showInviteModal() {
    $('#editInviteModal').modal('show'); // Show the invite modal
}





// Global variable to store selected users
var selectedUsers = [];

// Function to open the invite modal and assign click event to the "Invite" button
function openInviteModal() {
    // Show the invite modal
    $('#editInviteModal').modal('show');

    // Call AJAX to get the list of users not in the project
    $.ajax({
        url: '/Admin/Projects/GetListAccountsNotInProject',
        method: 'GET',
        data: { projectId: projectEditId },
        success: function (response) {
            // Clear the existing rows in the table
            $('#editInviteModalBody').empty();

            // Add new rows to the table
            response.forEach(function (account) {
                var row = $('<tr></tr>');
                row.append('<td>' + account.userName + '</td>');
                row.append('<td><input type="checkbox" class="user-checkbox" data-user-id="' + account.userId + '" name="selectedUsers"></td>');
                $('#editInviteModalBody').append(row);
            });

            // Handle the event when users change the selection
            $('.user-checkbox').change(function () {
                var userId = $(this).data('user-id');
                if ($(this).is(':checked')) {
                    selectedUsers.push(userId);
                } else {
                    selectedUsers = selectedUsers.filter(function (id) {
                        return id !== userId;
                    });
                }
            });
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });

    // Add event listener to the invite button in the modal
    $('#inviteButtonInModal').off('click').on('click', function () {
        inviteUsers(); // Gọi hàm inviteUsers khi nhấn nút "Invite" trong modal
    });
}

// Function to handle invite users action
function inviteUsers() {
    console.log('1');
    console.log(selectedUsers);
    // Gửi danh sách người dùng đã chọn đến controller
    $.ajax({
        url: '/Admin/Projects/AddTeamMember',
        method: 'POST',
        data: { projectId: projectEditId, selectedUsers: selectedUsers },
        success: function (response) {
            $('#editInviteModal').modal('hide');
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

// Add event listener to the invite button in the modal
$('#inviteButtonInModal').on('click', function () {
    inviteUsers(); // Gọi hàm inviteUsers khi nhấn nút "Invite" trong modal
});

// Add event listener to the invite button
$('#editInviteButton').on('click', function () {
    openInviteModal();
});












var selectedDocumentId;
function showDeleteFileModal(documentId) {
    // Hiển thị modal xác nhận xóa
    $('#confirmDeleteModal').modal('show');

    // Gán documentId cho biến selectedDocumentId để sử dụng trong hàm confirmDeleteBtn
    selectedDocumentId = documentId;
    console.log(documentId);
    console.log(selectedDocumentId);
}

function confirmDeleteBtn() {
    console.log('clicked');
    $.ajax({
        url: '/Admin/Projects/DeleteDocument',
        method: 'POST',
        data: { documentId: selectedDocumentId },
        success: function () {
            console.log('success');
            $('#confirmDeleteModal').modal('hide');
            updateDocumentList();
            console.log(selectedDocumentId);
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

function updateDocumentList() {
    $.ajax({
        url: '/Admin/Projects/Edit',
        method: 'GET',
        data: { projectId: projectEditId },
        success: function (response) {
            var documentList = $('#documentList');
            documentList.empty();
            response.projectDocuments.forEach(function (document) {
                var lastSlashIndex = document.fileName.lastIndexOf('_');
                var fileName = document.fileName.substring(lastSlashIndex + 1);

                var documentHtml = '<div class="col-12 py-2 d-flex align-items-center">';
                documentHtml += '<div class="d-flex ms-3 align-items-center flex-fill">';
                documentHtml += '<div class="d-flex flex-column ps-3">';
                documentHtml += '<h6 class="fw-bold mb-0 small-14">' + fileName + '</h6>';
                documentHtml += '</div>';
                documentHtml += '</div>';
                documentHtml += '<a href="' + document.fileName + '" download>';
                documentHtml += '<button type="button" class="btn light-danger-bg text-end">Download</button>';
                documentHtml += '</a>';
                documentHtml += '<button type="button" style="margin-left: 5px;" class="btn light-danger-bg text-end delete-document-btn" onclick="showDeleteFileModal(\'' + document.documentId + '\')"><i class="icofont-ui-delete text-danger"></i></button>';
                documentHtml += '</div>';

                documentList.append(documentHtml);
            });
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

function uploadFiles(files) {
    var formData = new FormData();
    var projectId = projectEditId;

    formData.append("projectId", projectId);

    for (var i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

    $.ajax({
        url: '/Admin/Projects/UpdateProjectFile',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            updateDocumentList()
        },
        error: function (xhr, status, error) {
            console.error('File upload failed:', error);
        }
    });
}
