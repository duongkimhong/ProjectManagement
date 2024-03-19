
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

            //var documentList = $('#documentList');
            //documentList.empty(); // Xóa nội dung cũ trước khi thêm mới

            //// Lặp qua danh sách tài liệu và tạo thẻ HTML cho mỗi tài liệu
            //response.projectDocuments.forEach(function (document) {
            //    var lastSlashIndex = document.fileName.lastIndexOf('_');
            //    var fileName = document.fileName.substring(lastSlashIndex + 1);

            //    var documentHtml = '<div class="col-12 py-2 d-flex align-items-center">';
            //    documentHtml += '<div class="d-flex ms-3 align-items-center flex-fill">';
            //    documentHtml += '<div class="d-flex flex-column ps-3">';
            //    documentHtml += '<h6 class="fw-bold mb-0 small-14">' + fileName + '</h6>';
            //    documentHtml += '</div>';
            //    documentHtml += '</div>';
            //    documentHtml += '<a href="' + document.fileName + '" download>';
            //    documentHtml += '<button type="button" class="btn light-danger-bg text-end">Download</button>';
            //    documentHtml += '</a>';
            //    documentHtml += '<button type="button" style="margin-left: 5px;" class="btn light-danger-bg text-end delete-document-btn" onclick="showDeleteFileModal(\'' + document.documentId + '\')"><i class="icofont-ui-delete text-danger"></i></button>';
            //    documentHtml += '</div>';

            //    documentList.append(documentHtml);
            //});
            updateDocumentList(response);
            updateDocumentList(response.projectDocuments);

            // Hiển thị modal popup
            $('#editProjectModal').modal('show');
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

function updateDocumentList(projectDocuments) {
    var documentList = $('#documentList');
    documentList.empty(); // Xóa nội dung cũ trước khi thêm mới

    // Lặp qua danh sách tài liệu và tạo thẻ HTML cho mỗi tài liệu
    projectDocuments.forEach(function (document) {
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

// Function to open the invite modal
//function openInviteModal() {
//    // Hiển thị modal
//    $('#editInviteModal').modal('show');

//    // Gọi AJAX để lấy danh sách các người dùng không thuộc dự án
//    $.ajax({
//        url: '/Admin/Projects/GetListAccountsNotInProject',
//        method: 'GET',
//        data: { projectId: projectEditId },
//        success: function (response) {
//            // Xóa hết các dòng đã có trong bảng
//            $('#editInviteModal tbody').empty();

//            // Thêm các dòng mới vào bảng
//            response.forEach(function (account) {
//                var row = $('<tr></tr>');
//                row.append('<td>' + account.userName + '</td>');
//                row.append('<td><input type="checkbox" class="user-checkbox" data-user-id="' + account.id + '" name="selectedUsers"></td>');
//                $('#editInviteModal tbody').append(row);
//            });

//            // Bắt sự kiện khi người dùng chọn các người dùng
//            $('.user-checkbox').change(function () {
//                var userId = $(this).data('user-id');
//                if ($(this).is(':checked')) {
//                    selectedUsers.push(userId);
//                } else {
//                    selectedUsers = selectedUsers.filter(function (id) {
//                        return id !== userId;
//                    });
//                }
//            });
//        },
//        error: function (xhr, status, error) {
//            console.error(error);
//        }
//    });
//}

//Hiển thị modal danh sách account
function showInviteModal() {
    $('#editInviteModal').modal('show'); // Show the invite modal
}

// Add an event listener to the Invite button
document.getElementById('editInviteButton').addEventListener('click', function () {
    openInviteModal(); // Call the function to open the invite modal
});

document.getElementById('selectInvite').addEventListener('click', function () {
    inviteUsers();
});

// Mảng tạm để lưu trữ các người dùng đã chọn
var selectedUsers = [];

//// Function to invite selected users
//function inviteUsers(event) {
//    event.preventDefault();
//    console.log(selectedUsers);
//    $.ajax({
//        url: '/Admin/Projects/AddTeamMember',
//        method: 'POST',
//        data: { projectId: projectEditId, selectedUsers: selectedUsers },
//        success: function (response) {
//            // Đóng modal và làm mới trang hoặc cập nhật dữ liệu cần thiết
//            $('#editInviteModal').modal('hide');
//        },
//        error: function (xhr, status, error) {
//            console.error(error);
//        }
//    });
//}

// Function to open the invite modal
function openInviteModal() {
    // Hiển thị modal
    $('#editInviteModal').modal('show');

    // Gọi AJAX để lấy danh sách các người dùng không thuộc dự án
    $.ajax({
        url: '/Admin/Projects/GetListAccountsNotInProject',
        method: 'GET',
        data: { projectId: projectEditId },
        success: function (response) {
            // Xóa hết các dòng đã có trong bảng
            $('#editInviteModalBody').empty();

            // Thêm các dòng mới vào bảng
            response.forEach(function (account) {
                var row = $('<tr></tr>');
                row.append('<td>' + account.userName + '</td>');
                row.append('<td><input type="checkbox" class="user-checkbox" data-user-id="' + account.id + '" name="selectedUsers"></td>');
                $('#editInviteModalBody').append(row);
            });
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

// Function to invite selected users
function inviteUsers() {
    var selecteddUsers = [];
    // Lặp qua các checkbox để lấy các user đã chọn
    $('.user-checkbox').each(function () {
        if ($(this).is(':checked')) {
            selecteddUsers.push($(this).data('user-id'));
        }
    });
    console.log('click');
    console.log(selecteddUsers);
    // Gọi AJAX để thêm các user đã chọn vào dự án
    $.ajax({
        url: '/Admin/Projects/AddTeamMember',
        method: 'POST',
        data: { projectId: projectEditId, selectedUsers: selecteddUsers },
        success: function (response) {
            $('#editInviteModal').modal('hide');
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

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
    // Gọi đến action trong controller để xóa tài liệu
    console.log('clicked');
    $.ajax({
        url: '/Admin/Projects/DeleteDocument',
        method: 'POST',
        data: { documentId: selectedDocumentId },
        success: function () {
            console.log('success');
            $('#confirmDeleteModal').modal('hide');
            removeDocumentFromUI(selectedDocumentId);
            console.log('done');
        },
        error: function (xhr, status, error) {
            console.log('error');
            console.error(error);
        }
    });
}

function removeDocumentFromUI(documentId) {
    console.log('start remove');
    $('#document_' + documentId).remove();
    console.log('end remove');
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
            console.log('Files uploaded successfully');
            location.reload();
            //$('#documentList').html(response);
        },
        error: function (xhr, status, error) {
            console.error('File upload failed:', error);
        }
    });
}
