
var id;

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    event.target.appendChild(document.getElementById(data));
}

function drag(event) {
    event.dataTransfer.setData("issueId", event.target.id);
}

function drop(event, status) {
    var issueId = event.dataTransfer.getData("issueId");
    updateSprint(issueId, status);
}

function updateSprint(issueId, status) {
    $.ajax({
        url: '/Admin/Issues/UpdateIssueStatus',
        method: 'POST',
        data: { issueId: issueId, status: status },
        success: function (response) {
            location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

$(document).ready(function () {
    $('.close').click(function () {
        $('#editIssueModal').modal('hide');
        location.reload();
    });
});

function openEditModal(issueId) {
    $.ajax({
        url: '/Admin/Issues/Edit',
        method: 'GET',
        data: { issueId: issueId },
        success: function (response) {
            originalDescription = response.Description;
            id = response.id;

            console.log(response);

            $('#issueId').val(response.id);
            $('#issueName').val(response.name);
            $('#issueType').val(response.type);
            $('#issueDescrtiption').val(response.description);
            $('#issueStatus').val(response.status);
            $('#priority').val(response.priority);
            $('#issueIsFlag').val(response.isFlag);
            $('#issueStoryPoint').val(response.storyPoint);

            // Function để cập nhật kiểu issue
            function IssueTypeDropdownBtn(type, backgroundColor, iconClass) {
                // Cập nhật kiểu issue trên giao diện
                document.getElementById('selectedIcon').innerHTML = '<i class="' + iconClass + ' text-white" style="vertical-align: middle;"></i>';
                document.getElementById('newSelectedItemButton').style.backgroundColor = backgroundColor;
            }
            // Xử lý phản hồi từ máy chủ và cập nhật kiểu issue tương ứng
            switch (response.type) {
                case 0:
                    IssueTypeDropdownBtn('User story', '#ffc107', 'icofont-ui-messaging');
                    break;
                case 1:
                    IssueTypeDropdownBtn('Task', '#1a73e8', 'icofont-book-mark');
                    break;
                case 2:
                    IssueTypeDropdownBtn('Bug', '#dc3545', 'icofont-bug');
                    break;
                default:
                    break;
            }

            var startDateValue = new Date(response.startDate);
            startDateValue.setDate(startDateValue.getDate() + 1);

            // Kiểm tra nếu startDateValue là một đối tượng Date hợp lệ
            if (!isNaN(startDateValue.getTime())) {
                // Nếu hợp lệ, gán giá trị vào ô input
                var inputValue = startDateValue.toISOString().split('T')[0];
                $('#issueStartDate').val(inputValue);
            } else {
                console.error('Invalid start date:', response.startDate);
            }

            // Kiểm tra nếu response.endDate là null, thì gán giá trị mặc định cho ô input
            if (response.startDate === null) {
                $('#issueStartDate').val('');
            }

            var endDateValue = new Date(response.endDate);
            endDateValue.setDate(endDateValue.getDate() + 1);

            // Kiểm tra nếu startDateValue là một đối tượng Date hợp lệ
            if (!isNaN(endDateValue.getTime())) {
                // Nếu hợp lệ, gán giá trị vào ô input
                var inputValue = endDateValue.toISOString().split('T')[0];
                $('#issueEndDate').val(inputValue);
            } else {
                console.error('Invalid end date:', response.endDate);
            }
            if (response.endDate === null) {
                $('#issueEndDate').val('');
            }

            // Lấy đường dẫn hình ảnh của assignee từ response
            var assigneeImageSrc = response.assignee !== null && response.assignee.image !== null
                ? response.assignee.image // Nếu có giá trị, sử dụng giá trị đó
                : '/defaultuser.png';

            var assigneeImageElement = document.getElementById('assigneeImage');
            if (assigneeImageElement) {
                assigneeImageElement.src = assigneeImageSrc;
            } else {
                console.error("Assignee image element not found");
            }

            // Lấy đường dẫn hình ảnh của reporter từ response
            var reporterImageSrc = response.reporter !== null && response.reporter.image !== null
                ? response.reporter.image // Nếu có giá trị, sử dụng giá trị đó
                : '/defaultuser.png';

            var reporterImageElement = document.getElementById('reporterImage');
            if (reporterImageElement) {
                reporterImageElement.src = reporterImageSrc;
            } else {
                console.error("Reporter image element not found");
            }

            function selectElement(id, valueToSelect) {
                let element = document.getElementById(id);
                element.value = valueToSelect;
            }
            selectElement('sprintDropdown', response.sprintId);
            selectElement('epicDropdown', response.epicId === null ? 'None' : response.epicId);
            switch (response.status) {
                case 0:
                    document.getElementById("statusSelect").value = "Todo";
                    break;
                case 1:
                    document.getElementById("statusSelect").value = "In Progress";
                    break;
                case 4:
                    document.getElementById("statusSelect").value = "Completed";
                    break;
                default:
                    break;
            }

            switch (response.priority) {
                case 0:
                    document.getElementById("prioritySelect").value = "Lowest";
                    break;
                case 1:
                    document.getElementById("prioritySelect").value = "Low";
                    break;
                case 2:
                    document.getElementById("prioritySelect").value = "Medium";
                    break;
                case 3:
                    document.getElementById("prioritySelect").value = "High";
                    break;
                case 4:
                    document.getElementById("prioritySelect").value = "Highest";
                    break;
                default:
                    break;
            }

            // Sắp xếp các comment theo thời gian
            response.comments.sort(function (a, b) {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });

            // Lặp qua các comment đã được sắp xếp
            $.each(response.comments, function (index, comment) {
                var userImage = comment.userImage ? comment.userImage : '/defaultuser.png';
                var commentHtml = '<div class="col-md-12 comment-item">' +
                    '    <div class="row align-items-center">' +
                    '        <div class="col-md-1">' +
                    '            <img class="rounded-circle user-avatar" alt="Avatar" width="30" height="30" src="' + userImage + '">' +
                    '        </div>' +
                    '        <div class="col-md-11">' +
                    '            <p class="mb-1">' + comment.content + '</p>' +
                    '            <p class="text-muted mb-1">' + comment.username + ' - Posted on: ' + new Date(comment.timestamp).toLocaleString() + '</p>' +
                    '        </div>' +
                    '    </div>' +
                    '</div>';

                // Thêm commentHtml vào phần tử có id là 'commentsContent'
                $('#commentsContainer').append(commentHtml);
                $('#commentCount').text(response.comments.length);
            });

            var documentList = $('#IssueDocumentList');
            documentList.empty();

            // Lặp qua danh sách tài liệu và tạo thẻ HTML cho mỗi tài liệu
            response.issueDocuments.forEach(function (document) {
                var documentHtml = '<div class="col-12 py-2 d-flex align-items-center">';
                documentHtml += '<div class="d-flex ms-3 align-items-center flex-fill">';
                documentHtml += '<div class="d-flex flex-column ps-3">';
                documentHtml += '<h6 class="fw-bold mb-0 small-14">' + document.fileName + '</h6>';
                documentHtml += '</div>';
                documentHtml += '</div>';
                documentHtml += '<a href="' + document.filePath + '" download>';
                documentHtml += '<button type="button" class="btn light-danger-bg text-end">Download</button>';
                documentHtml += '</a>';
                documentHtml += '<button type="button" style="margin-left: 5px;" class="btn light-danger-bg text-end delete-document-btn" onclick="showIssueDeleteFileModal(\'' + document.id + '\')"><i class="icofont-ui-delete text-danger"></i></button>';
                documentHtml += '</div>';

                documentList.append(documentHtml);
            });

            // Hiển thị modal popup
            $('#editIssueModal').modal('show');
            $('#commentCount').text(response.length);
        },
        error: function (xhr, status, error) {
            // Xử lý lỗi nếu có
            console.error(error);
        }
    });
}

function openCommentModal(issueId) {
    $.ajax({
        url: '/Admin/Issues/GetIssueComments',
        method: 'GET',
        data: { issueId: issueId },
        success: function (response) {
            $('#commentModalBody').empty();
            response.sort(function (a, b) {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
            response.forEach(function (comment) {
                var userImage = comment.userImage ? comment.userImage : '/defaultuser.png';
                var commentHtml = '<div class="comment-item">' +
                    '    <img class="user-avatar" width="30" height="30" src="' + userImage + '" alt="User Avatar">' +
                    '    <div class="comment-content">' +
                    '        <p class="mb-1">' + comment.content + '</p>' +
                    '        <p class="text-muted mb-0">' + comment.username + ' - ' + new Date(comment.timestamp).toLocaleString() + '</p>' +
                    '    </div>' +
                    '</div>';
                $('#commentModalBody').append(commentHtml);
            });

            $('#commentModal').modal('show');

        },
        error: function () {
            console.error('Failed to fetch comments.');
        }
    });
}

function openDocumentModal(issueId) {
    // Call AJAX to get the list of documents for the issue
    $.ajax({
        url: '/Admin/Issues/GetDocuments',
        method: 'GET',
        data: { issueId: issueId },
        success: function (response) {
            // Clear existing documents in the modal
            $('#documentList').empty();

            // Populate the modal with documents
            response.forEach(function (document) {
                var documentHtml = '<div class="col-12 py-2 d-flex align-items-center">';
                documentHtml += '<div class="d-flex ms-3 align-items-center flex-fill">';
                documentHtml += '<div class="d-flex flex-column ps-3">';
                documentHtml += '<h6 class="fw-bold mb-0 small-14">' + document.fileName + '</h6>';
                documentHtml += '</div>';
                documentHtml += '</div>';
                documentHtml += '<a href="' + document.filePath + '" download>';
                documentHtml += '<button type="button" class="btn light-danger-bg text-end">Download</button>';
                documentHtml += '</a>';
                documentHtml += '</div>';

                $('#documentList').append(documentHtml);
            });

            // Show the document modal
            $('#documentModal').modal('show');
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

function showAssigneeList() {
    // Mở modal
    $('#assigneeModal').modal('show');
}

function saveIssueChanges() {
    // Xử lý lưu các thay đổi của issue

    // Sau khi lưu, đóng modal popup
    $('#editIssueModal').modal('hide');
}

// Hàm trả về class của icon dựa trên loại được chọn
function getIconClass(value) {
    switch (value) {
        case 'Task':
            return 'icofont-book-mark text-white';
        case 'Bug':
            return 'icofont-bug text-white';
        case 'User story':
            return 'icofont-ui-messaging text-white';
        default:
            return 'icofont-ui-messaging text-white';
    }
}

// Hàm trả về màu nền dựa trên loại được chọn
function getBackgroundColor(value) {
    switch (value) {
        case 'Task':
            return '#1a73e8';
        case 'Bug':
            return '#dc3545';
        case 'User story':
            return '#ffc107';
        default:
            return '#ffffff';
    }
}

function setStatus() {
    var selectElement = document.getElementById('statusSelect');
    var selectedStatus = selectElement.options[selectElement.selectedIndex].value;
}

// Hàm JavaScript để cập nhật nút dropdown
function updateNewButton(value) {
    // Lấy icon tương ứng với loại được chọn
    var iconClass = getIconClass(value);
    var backgroundColor = getBackgroundColor(value);

    // Cập nhật icon và màu nền trên nút dropdown
    document.getElementById('selectedIcon').className = iconClass;
    document.getElementById('newSelectedItemButton').style.backgroundColor = backgroundColor;
}

// update issue type
function updateIssueType(type, color, iconClass) {
    var issueId = id;
    console.log("id = " + id)

    $.ajax({
        url: '/Admin/Issues/UpdateIssueType',
        method: 'POST',
        data: { issueId: issueId, type: type },
        success: function (response) {
            //location.reload();
            updateButton2(type, color, iconClass);
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}
function updateButton2(type, backgroundColor, iconClass) {
    // Cập nhật màu nền của nút
    document.getElementById('newSelectedItemButton').style.backgroundColor = backgroundColor;

    // Cập nhật icon
    var iconElement = document.getElementById('selectedIcon');
    iconElement.innerHTML = ''; // Xóa nội dung cũ
    var icon = document.createElement('i');
    icon.classList.add(iconClass, 'text-white');
    icon.style.verticalAlign = 'middle';
    iconElement.appendChild(icon);
}

// update issue status
function updateIssueStatus() {
    var selectedStatus = document.getElementById("statusSelect").value;
    $.ajax({
        url: '/Admin/Issues/UpdateIssueStatus',
        method: 'POST',
        data: { issueId: id, status: selectedStatus },
        success: function (response) {
            //location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

// update issue epic
function updateIssueEpic() {
    var selectedEpicId = document.getElementById("epicDropdown").value;

    // Gửi request đến action updateIssueEpic với issueId và selectedEpicId
    fetch('/Admin/Issues/UpdateIssueEpic?issueId=' + encodeURIComponent(id) + '&epicId=' + encodeURIComponent(selectedEpicId), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // Các header khác nếu cần
        },
    })
        .then(response => {
            // Xử lý response nếu cần
            console.log(response);
        })
        .catch(error => {
            // Xử lý lỗi nếu có
            console.error('Error:', error);
        });
}

// update issue sprint
function updateIssueSprint() {
    var selectedSprintId = document.getElementById("sprintDropdown").value;

    // Gửi request đến action updateIssueSprint với issueId và selectedSprintId
    fetch('/Admin/Issues/updateIssueSprint?issueId=' + encodeURIComponent(id) + '&sprintId=' + encodeURIComponent(selectedSprintId), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // Các header khác nếu cần
        },
    })
        .then(response => {
            // Xử lý response nếu cần
            console.log(response);
        })
        .catch(error => {
            // Xử lý lỗi nếu có
            console.error('Error:', error);
        });
}

// update issue priority
function updateIssuePriority() {
    var selectedPrority = document.getElementById("prioritySelect").value;

    // Gửi request đến action updateIssueSprint với issueId và selectedSprintId
    fetch('/Admin/Issues/updateIssuePriority?issueId=' + encodeURIComponent(id) + '&priority=' + encodeURIComponent(selectedPrority), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // Các header khác nếu cần
        },
    })
        .then(response => {
            // Xử lý response nếu cần
            console.log(response);
        })
        .catch(error => {
            // Xử lý lỗi nếu có
            console.error('Error:', error);
        });
}

// update issue name
function handleKeyPress(event) {
    if (event.keyCode === 13) {
        // Lấy giá trị của trường input
        var inputValue = document.getElementById("issueName").value;
        if (inputValue == '') {
            //alert('Issue name cannot be NULL');
        } else {
            $.ajax({
                url: '/Admin/Issues/UpdateIssueName',
                method: 'POST',
                data: { issueId: id, name: inputValue },
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

// update issue description
var originalDescription = ''; // Biến tạm để lưu trữ nội dung ban đầu
function updateIssueDescription() {
    var description = document.getElementById("issueDescrtiption").value;

    $.ajax({
        url: '/Admin/Issues/UpdateIssueDescription',
        method: 'POST',
        data: { issueId: id, description: description },
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
    document.getElementById("issueDescrtiption").value = originalDescription;
}

// update issue startDate
var startDateInput = document.getElementById("issueStartDate");
startDateInput.addEventListener("blur", function () {
    var startDateValue = startDateInput.value;
    console.log(startDateValue); // Kiểm tra xem giá trị ngày đã được lấy đúng chưa

    $.ajax({
        url: '/Admin/Issues/UpdateIssueStartDate',
        method: 'POST',
        data: { issueId: id, date: startDateValue },
        success: function (response) {
            //location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
});

// update issue endDate
var endDateInput = document.getElementById("issueEndDate");
endDateInput.addEventListener("blur", function () {
    var endDateValue = endDateInput.value;
    console.log(endDateValue);

    $.ajax({
        url: '/Admin/Issues/UpdateIssueEndDate',
        method: 'POST',
        data: { issueId: id, date: endDateValue },
        success: function (response) {
            //location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
});

// update issue story point
$('#issueStoryPoint').blur(function () {
    var storyPoint = $(this).val();

    $.ajax({
        url: '/Admin/Issues/UpdateIssueStoryPoint',
        method: 'POST',
        data: { issueId: id, storyPoint: storyPoint },
        success: function (response) {
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
});

// update issue assignee
function updateAssignee(userId) {
    $.ajax({
        url: '/Admin/Issues/UpdateIssueAssignee',
        method: 'POST',
        data: { issueId: id, userId: userId },
        success: function (response) {
            updateIssueAssigneeImage(id);
            $('#assigneeModal').modal('hide');
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}
function updateIssueAssigneeImage(issueId) {
    $.ajax({
        url: '/Admin/Issues/Edit',
        method: 'GET',
        data: { issueId: issueId },
        success: function (response) {
            console.log('success');
            var assigneeImageSrc = response.assignee !== null && response.assignee.image !== null
                ? response.assignee.image
                : '/defaultuser.png';

            var assigneeImageElement = document.getElementById('assigneeImage');
            if (assigneeImageElement) {
                assigneeImageElement.src = assigneeImageSrc;
            } else {
                console.error("Assignee image element not found");
            }
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

// update issue isFlag
function updateIssueIsFlag(issueId, isFlag) {
    $.ajax({
        url: '/Admin/Issues/UpdateIssueIsFlag',
        method: 'POST',
        data: { issueId: issueId, isFlag: isFlag },
        success: function (response) {
            location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

function toggleContent(content) {
    var commentsContent = document.getElementById('commentsContent');
    var historyContent = document.getElementById('historyContent');
    var commentsToggle = document.getElementById('commentsToggle');
    var historyToggle = document.getElementById('historyToggle');

    if (content === 'comments') {
        commentsContent.style.display = 'block';
        historyContent.style.display = 'none';
        commentsToggle.classList.add('active');
        historyToggle.classList.remove('active');
    } else if (content === 'history') {
        commentsContent.style.display = 'none';
        historyContent.style.display = 'block';
        commentsToggle.classList.remove('active');
        historyToggle.classList.add('active');
    }
}

function saveComment() {
    // Lấy nội dung của comment từ textarea
    var commentContent = document.getElementById('commentInput').value;

    // Tạo đối tượng dữ liệu để gửi qua AJAX
    var data = {
        issueId: id,
        content: commentContent
    };

    // Gửi yêu cầu AJAX
    $.ajax({
        url: '/Admin/Comments/Create',
        method: 'POST',
        data: data,
        success: function (response) {
            GetComments(id);
        },
        error: function (xhr, status, error) {
            // Xử lý lỗi nếu có
            console.error('Error:', error);
        }
    });
}

function GetComments(issueId) {
    $.ajax({
        url: '/Admin/Issues/GetIssueComments',
        method: 'GET',
        data: { issueId: issueId },
        success: function (response) {
            $('#commentsContainer').empty();
            response.sort(function (a, b) {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });

            // Lặp qua các comment đã được sắp xếp
            $.each(response, function (index, comment) {
                var userImage = comment.userImage ? comment.userImage : '/defaultuser.png';
                var commentHtml = '<div class="col-md-12 comment-item">' +
                    '    <div class="row align-items-center">' +
                    '        <div class="col-md-1">' +
                    '            <img class="rounded-circle user-avatar" alt="Avatar" width="30" height="30" src="' + userImage + '">' +
                    '        </div>' +
                    '        <div class="col-md-11">' +
                    '            <p class="mb-1">' + comment.content + '</p>' +
                    '            <p class="text-muted mb-1">' + comment.username + ' - Posted on: ' + new Date(comment.timestamp).toLocaleString() + '</p>' +
                    '        </div>' +
                    '    </div>' +
                    '</div>';

                $('#commentsContainer').append(commentHtml);
                $('#commentCount').text(response.length);
            });
            document.getElementById('commentInput').value = '';

        },
        error: function () {
            console.error('Failed to fetch comments.');
        }
    });
}

function cancelComment() {
    document.getElementById('commentInput').value = '';
}

// update issue document
var selectedIssueDocumentId;
function showIssueDeleteFileModal(issueDocumentId) {
    // Hiển thị modal xác nhận xóa
    $('#confirmIssueDeleteModal').modal('show');

    // Gán documentId cho biến selectedDocumentId để sử dụng trong hàm confirmDeleteBtn
    selectedIssueDocumentId = issueDocumentId;
    console.log(issueDocumentId);
    console.log(selectedIssueDocumentId);
}

function confirmIssueDeleteBtn() {
    $.ajax({
        url: '/Admin/Issues/DeleteDocument',
        method: 'POST',
        data: { documentId: selectedIssueDocumentId },
        success: function () {
            $('#confirmIssueDeleteModal').modal('hide');
            updateIssueDocumentList();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

function updateIssueDocumentList() {
    $.ajax({
        url: '/Admin/Issues/Edit',
        method: 'GET',
        data: { issueId: id },
        success: function (response) {
            var issueDocumentList = $('#IssueDocumentList');
            issueDocumentList.empty();
            response.issueDocuments.forEach(function (document) {
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
                documentHtml += '<button type="button" style="margin-left: 5px;" class="btn light-danger-bg text-end delete-document-btn" onclick="showIssueDeleteFileModal(\'' + document.documentId + '\')"><i class="icofont-ui-delete text-danger"></i></button>';
                documentHtml += '</div>';

                issueDocumentList.append(documentHtml);
            });
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

function uploadIssueFiles(files) {
    var formData = new FormData();
    var issueId = id;

    formData.append("issueId", issueId);

    for (var i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

    $.ajax({
        url: '/Admin/Issues/UpdateIssueFiles',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            updateIssueDocumentList()
        },
        error: function (xhr, status, error) {
            console.error('File upload failed:', error);
        }
    });
}

var burndownChart; // Biến lưu trữ biểu đồ

function openBurndownModal(sprintId) {
    console.log('hello');
    $.ajax({
        url: '/Admin/Board/GetData',
        method: 'Get',
        data: { sprintId: sprintId },
        success: function (data) {
            // Hủy biểu đồ cũ nếu tồn tại
            if (burndownChart != null) {
                burndownChart.destroy();
            }
            // Vẽ biểu đồ mới
            drawBurndownChart(data);
            $('#burndownModal').modal('show');
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

function drawBurndownChart(sprintId) {
    $.ajax({
        url: '/Admin/Board/BurndownChart',
        method: 'GET',
        data: { sprintId: sprintId },
        success: function (response) {
            console.log(response);
            // Vẽ biểu đồ burndown chart bằng Chart.js
            var ctx = document.getElementById('burndownChart').getContext('2d');
            var burndownChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [...Array(response.remainingPlannedPoints.length).keys()].map(i => i + 1),
                    datasets: [{
                        label: 'Planned Tasks',
                        data: response.remainingPlannedPoints,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }, {
                        label: 'Actual Tasks',
                        data: response.remainingActualPoints,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

            $('#burndownModal').modal('show');
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}
