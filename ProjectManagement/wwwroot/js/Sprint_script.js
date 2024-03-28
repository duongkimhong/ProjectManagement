// Hàm để xử lý sự kiện kéo và thả cập nhật sprint và epic của issue
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
    event.dataTransfer.setData("text", event.target.id);
    // Lưu trữ ID của Issue
    event.dataTransfer.setData("issueId", event.target.getAttribute("data-issue-id"));
}

function drop(event, targetType, id) {
    var issueId = event.dataTransfer.getData("issueId");
    var epicId = event.target.getAttribute('data-epic-id');

    if (targetType === 'sprint') {
        console.log('update issue sprint');
        updateSprint(issueId, id);
    } else if (targetType === 'epic') {
        console.log('update epic sprint');
        updateEpic(issueId, epicId);
    }
}

function updateSprint(issueId, sId) {
    $.ajax({
        url: '/Admin/Issues/updateIssueSprint',
        method: 'POST',
        data: { issueId: issueId, sprintId: sId },
        success: function (response) {
            console.log(response);
            location.reload();
            $('#sprintsContainer').html(response);
        },
        error: function (xhr, status, error) {
            console.error(error);
            console.log('lỗi');
        }
    });
}

function updateEpic(issueId, epicId) {
    $.ajax({
        url: '/Admin/Issues/UpdateEpic',
        method: 'POST',
        data: { issueId: issueId, epicId: epicId },
        success: function (response) {
            location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

// hiển thị type vừa chọn lên nút dropdown ở ô texbox tạo mới issue
function updateButton(type) {
    document.getElementById('selectedItemButton').textContent = type;
    document.getElementById('typeInput').value = type;
    // Cập nhật giá trị hiển thị trên nút chọn
    document.getElementById('selectedItem').innerText = value;
    document.getElementById('selectedItem').setAttribute('data-value', value);
}

//Xử lí nhấn enter để tạo issue
function handleKeyPressCreate(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        var issueName = document.getElementById('issueInputWrapper').value;
        var issueType = document.getElementById('typeInput').value;
        if (issueName == '') {
            alert("Issue name cannot be null");
        } else {
            var url = window.location.href;
            console.log(url);

            // Sử dụng regex để tìm projectId trong URL
            var regex = /\/([\w-]+)#?$/;
            var match = regex.exec(url);
            if (match) {
                var projectId = match[1];
                console.log(projectId);

                $.ajax({
                    type: "POST",
                    url: "/Admin/Issues/Create",
                    data: { name: issueName, type: issueType, projectId: projectId },
                    success: function (response) {
                        location.reload();
                    },
                    error: function (error) {
                        console.error("Error creating issue:", error);
                    }
                });

            } else {
                console.error("No projectId found in URL");
            }
        }
    }
}

// xử lý tạo mới 1 epic
function handleEpicKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        var epicName = document.getElementById('epicInputWrapper').value;
        if (epicName == '') {
            alert("Epic name cannot be null");
        } else {
            var url = window.location.href;
            
            // Sử dụng regex để tìm projectId trong URL
            var regex = /\/([\w-]+)#?$/;
            var match = regex.exec(url);
            if (match) {
                var projectId = match[1];
                $.ajax({
                    type: "POST",
                    url: "/Admin/Epics/Create",
                    data: { name: epicName, projectId: projectId },
                    success: function (response) {
                        console.log(response);
                        //location.reload();
                        $('#epicsContainer').html(response);
                        document.getElementById('epicInputWrapper').value = '';
                    },
                    error: function (error) {
                        console.error("Error creating epic:", error);
                    }
                });

            } else {
                console.error("No projectId found in URL");
            }
        }
    }
}

var id;
//var editIssueId;
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

            // Xử lý phản hồi từ máy chủ và điền thông tin vào form chỉnh sửa
            // id, name, type, epic, status, documents, description, startDate, endDate, assignee.image, assignee.fullName,
            // reporter.image, reporter.fullName, storyPoint, sprint, priority, comment, history
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
            });

            var documentList = $('#IssueDocumentList');
            documentList.empty(); // Xóa nội dung cũ trước khi thêm mới

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
        },
        error: function (xhr, status, error) {
            // Xử lý lỗi nếu có
            console.error(error);
        }
    });
}

function showAssigneeList() {
    // Mở modal
    $('#assigneeModal').modal('show');
}

function saveIssueChanges() {
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
            return '#ffffff'; // Mặc định là trắng
    }
}

function setStatus() {
    var selectElement = document.getElementById('statusSelect');
    var selectedStatus = selectElement.options[selectElement.selectedIndex].value;
}

// Hàm JavaScript để cập nhật nút dropdown
function updateNewButton(value) {
    var iconClass = getIconClass(value);
    var backgroundColor = getBackgroundColor(value);

    document.getElementById('selectedIcon').className = iconClass;
    document.getElementById('newSelectedItemButton').style.backgroundColor = backgroundColor;
}

function updateNewButton(type) {
    var issueId = id;
    console.log('update new button');
    //console.log(issueId);
    $.ajax({
        url: '/Admin/Issues/Edit',
        method: 'POST',
        data: { id: issueId },
        //data: { issueId: issueId, type: type },
        success: function (response) {
        },
        error: function (xhr, status, error) {
            // Xử lý lỗi nếu có
            console.error(error);
        }
    });
}

//Lấy id của project từ URL(issue form)
// Function to extract project ID from URL
function extractProjectIdFromUrl() {
    var url = window.location.href;
    var segments = url.split('/');
    var projectId = segments.pop() || segments.pop(); // Extract the last segment
    return projectId;
}

// Function to add hidden input for project ID to a form
function addProjectIdInputToForm(formId) {
    // Get the form element
    var form = document.getElementById(formId);

    // Create a hidden input element for project ID
    var projectIdInput = document.createElement("input");
    projectIdInput.setAttribute("type", "hidden");
    projectIdInput.setAttribute("name", "projectId");
    projectIdInput.setAttribute("id", "projectId");

    // Set the value of the hidden input element to the project ID extracted from the URL
    projectIdInput.value = extractProjectIdFromUrl();

    // Append the hidden input element to the form
    form.appendChild(projectIdInput);
}

// Wait for the document to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Add hidden input for project ID to the issue form
    addProjectIdInputToForm("issueForm");

    // Add hidden input for project ID to the sprint form
    addProjectIdInputToForm("createSprintForm");
});

//Hiển thị modal tạo sprint
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('createSprintButton').addEventListener('click', function () {
        var myModal = new bootstrap.Modal(document.getElementById('createSprintModal'));
        myModal.show();
    });
});

//Xử lý sự kiện chọn thời gian của sprint
function handleWeekSelect() {
    var weekSelect = document.getElementById('weekSelect');
    var endDateInput = document.getElementById('endDate');

    if (weekSelect.value === 'custom') {
        endDateInput.disabled = false;
    } else {
        var startDateValue = document.getElementById('startDate').value;
        var startDate = new Date(startDateValue);
        var endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (7 * parseInt(weekSelect.value)));

        endDateInput.value = endDate.toISOString().split('T')[0];
        endDateInput.disabled = true;
    }
}

//Load ngày hiện tại khi hiện ngày
document.addEventListener("DOMContentLoaded", function () {
    // Get current date
    var today = new Date();

    // Format the date as "YYYY-MM-DD" for the date input
    var formattedDate = today.toISOString().split('T')[0];

    // Set the default value for the start date and end date input fields
    document.getElementById('startDate').value = formattedDate;
    document.getElementById('endDate').value = formattedDate;
});

//Mở trường endate khi submit
function enableEndDateBeforeSubmit() {
    // Enable trường EndDate
    document.getElementById('endDate').disabled = false;
}

document.getElementById('createSprintForm').addEventListener('submit', enableEndDateBeforeSubmit);

function getProjectIdFromUrl() {
    var url = window.location.href;
    var segments = url.split('/');
    var projectId = segments.pop() || segments.pop(); // Extract the last segment
    return projectId;
}

//update sprint
$(document).ready(function () {
    $('.edit-sprint').on('click', function () {
        var sprintID = $(this).data('id');
        var pj_id = extractProjectIdFromUrl().toString();
        var name = $(this).data('name');
        var startDate = new Date($(this).data('start-date'));
        var endDate = new Date($(this).data('end-date'));
        var sprintGoal = $(this).data('sprint-goal');

        startDate.setDate(startDate.getDate() + 1);
        endDate.setDate(endDate.getDate() + 1);

        $('#sprintIdInput').val(sprintID);
        $('#projectIdInput').val(pj_id);
        $('#sprintNameInput').val(name);
        $('#startDateInput').val(startDate.toISOString().split('T')[0]);
        $('#endDateInput').val(endDate.toISOString().split('T')[0]); // Chuyển đổi về định dạng YYYY-MM-DD
        $('#sprintGoalInput').val(sprintGoal);
        //console.log(pj_id);
        // Show modal
        $('#editSprintModal').modal('show');
    });

    $('#saveChangesBtn').on('click', function () {
        $('#editSprintModal').modal('hide');
    });
});

$(document).ready(function () {
    $('#saveChangesBtn').click(function () {
        var sprintId = $('#sprintIdInput').val();
        var sprintName = $('#sprintNameInput').val();
        var startDate = $('#startDateInput').val();
        var endDate = $('#endDateInput').val();
        var sprintGoal = $('#sprintGoalInput').val();

        // Tạo object JSON chứa các giá trị
        var formData = {
            Id: sprintId,
            Name: sprintName,
            StartDate: startDate,
            EndDate: endDate,
            SprintGoal: sprintGoal
        };

        // Gửi dữ liệu form qua Ajax
        $.ajax({
            url: '/Admin/Sprints/Edit',
            method: 'POST',
            data: formData,
            success: function (response) {
                window.location.reload();
            },
            error: function (xhr, status, error) {
                console.log(error);
            }
        });
    });
});

function showConfirmationModal(sprintId) {
    $('#confirmModal').modal('show');

    $('#confirmButton').off('click').on('click', function () {
        updateSprintStatus(sprintId, "Complete");
    });
}

function updateSprintStatus(sprintId, status) {
    $.ajax({
        type: "POST",
        url: "/Admin/Sprints/UpdateSprintStatus",
        data: { sprintId: sprintId, status: status },
        success: function (response) {
            location.reload();
        },
        error: function () {

        }
    });
}

// Hiện context menu khi nhấp chuột phải vào epic name
var unlinkIssueId;
function showContextMenu(event, issueId) {
    event.preventDefault();
    const menu = document.querySelector('#contextMenu');
    const rect = event.target.getBoundingClientRect();
    menu.style.setProperty('--mouse-x', rect.left + 'px');
    menu.style.setProperty('--mouse-y', rect.top + 'px');
    menu.style.display = 'block';
    unlinkIssueId = issueId;
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'none';

    // Gỡ bỏ event listener sau khi menu đã ẩn
    document.removeEventListener('click', hideContextMenu);
}

document.addEventListener("click", function (event) {
    const contextMenu = document.getElementById("contextMenu");
    if (!contextMenu.contains(event.target)) {
        contextMenu.style.display = "none";
    }
});

function handleClick() {
    console.log("Click event with issueId:", unlinkIssueId);
    $.ajax({
        url: '/Admin/Issues/UnlinkEpic',
        method: 'POST',
        data: { issueId: unlinkIssueId },
        success: function (response) {
            location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });

    xhr.send(JSON.stringify({ issueId: issueId }));
}

//hiển thị context delete 
var deleteIssueId;
function showContextDelete(event, issueId) {
    event.preventDefault(); 
    const menu = document.querySelector('#contextDelete');
    const rect = event.target.getBoundingClientRect();
    menu.style.setProperty('--mouse-x', rect.left + 'px');
    menu.style.setProperty('--mouse-y', rect.top + 'px');
    menu.style.display = 'block';
    console.log(issueId);
    deleteIssueId = issueId;
}

document.addEventListener("click", function (event) {
    const contextMenu = document.getElementById("contextDelete");
    if (!contextMenu.contains(event.target)) {
        contextMenu.style.display = "none";
    }
});

function confirmDeleteIssue() {
    $('#confirmDeleteModal').modal('show');
}

$('#deleteIssueButton').on('click', function () {
    console.log(deleteIssueId);
    $.ajax({
        url: '/Admin/Issues/DeleteConfirmed',
        method: 'POST',
        data: { id: deleteIssueId },
        success: function (response) {
            location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
    $('#confirmDeleteModal').modal('hide');
});

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
    var commentContent = document.getElementById('commentInput').value;

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
            console.log(response);
            $('#commentsContainer').empty();
            // Sắp xếp các comment theo thời gian
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

// update issue startDate
var issueStartDateInput = document.getElementById("issueStartDate");
issueStartDateInput.addEventListener("blur", function () {
    var issueStartDateValue = issueStartDateInput.value;
    console.log(issueStartDateValue);

    $.ajax({
        url: '/Admin/Issues/UpdateIssueStartDate',
        method: 'POST',
        data: { issueId: id, date: issueStartDateValue },
        success: function (response) {
            //location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
});

// update issue endDate
var issueEndDateInput = document.getElementById("issueEndDate");
issueEndDateInput.addEventListener("blur", function () {
    var issueEndDateValue = issueEndDateInput.value;
    console.log(issueEndDateInput);

    $.ajax({
        url: '/Admin/Issues/UpdateIssueEndDate',
        method: 'POST',
        data: { issueId: id, date: issueEndDateValue },
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
            $('#sprintsContainer').html(response);
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
});

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

// Hàm gọi khi click nút "Cancel"
function cancelUpdate() {
    // Thiết lập lại nội dung của textarea bằng giá trị ban đầu
    document.getElementById("issueDescrtiption").value = originalDescription;
}

// Edit epic
var epicEditId;
// Function to open the edit modal with epic details
function openEditEpicModal(epicId) {
    $.ajax({
        url: '/Admin/Epics/Edit',
        method: 'GET',
        data: { epicId: epicId },
        success: function (response) {
            console.log(response);
            epicEditId = response.id;
            originalDescription = response.Description;
            $('#epicId').val(response.id);
            $('#epicName').val(response.name);
            $('#epicColor').val(response.color);
            $('#epicDescription').val(response.description);

            var epicStartDateValue = new Date(response.startDate);
            epicStartDateValue.setDate(epicStartDateValue.getDate() + 1);
            
            if (!isNaN(epicStartDateValue.getTime())) {
                var epicInputValue = epicStartDateValue.toISOString().split('T')[0];
                $('#epicStartDate').val(epicInputValue);
            } else {
                console.error('Invalid start date:', response.startDate);
            }
            
            if (response.startDate === null) {
                $('#epicStartDate').val('');
            }

            var epicEndDateValue = new Date(response.endDate);
            epicEndDateValue.setDate(epicEndDateValue.getDate() + 1);
            
            if (!isNaN(epicEndDateValue.getTime())) {
                var epicInputValue = epicEndDateValue.toISOString().split('T')[0];
                $('#epicEndDate').val(epicInputValue);
            } else {
                console.error('Invalid end date:', response.endDate);
            }
            if (response.endDate === null) {
                $('#epicEndDate').val('');
            }

            // Lấy đường dẫn hình ảnh của reporter từ response
            var epicReporterImageSrc = response.reporter !== null && response.reporter.image !== null
                ? response.reporter.image // Nếu có giá trị, sử dụng giá trị đó
                : '/defaultuser.png';

            var epicReporterImageElement = document.getElementById('epicReporterImage');
            if (epicReporterImageElement) {
                epicReporterImageElement.src = epicReporterImageSrc;
            } else {
                console.error("Reporter image element not found");
            }

            var epicDocumentList = $('#EpicDocumentList');
            epicDocumentList.empty(); // Xóa nội dung cũ trước khi thêm mới

            // Lặp qua danh sách tài liệu và tạo thẻ HTML cho mỗi tài liệu
            response.epicDocument.forEach(function (document) {
                var documentHtml = '<div class="col-12 py-2 d-flex align-items-center">';
                documentHtml += '<div class="d-flex ms-3 align-items-center flex-fill">';
                documentHtml += '<div class="d-flex flex-column ps-3">';
                documentHtml += '<h6 class="fw-bold mb-0 small-14">' + document.fileName + '</h6>';
                documentHtml += '</div>';
                documentHtml += '</div>';
                documentHtml += '<a href="' + document.filePath + '" download>';
                documentHtml += '<button type="button" class="btn light-danger-bg text-end">Download</button>';
                documentHtml += '</a>';
                documentHtml += '<button type="button" style="margin-left: 5px;" class="btn light-danger-bg text-end delete-document-btn" onclick="showEpicDeleteFileModal(\'' + document.id + '\')"><i class="icofont-ui-delete text-danger"></i></button>';
                documentHtml += '</div>';

                epicDocumentList.append(documentHtml);
            });
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });

    // Display the edit modal
    var modal = document.getElementById("editEpicModal");
    modal.style.display = "block";
}

function epicToggleContent(content) {
    var historyContent = document.getElementById('epicHistoryContent');
    var historyToggle = document.getElementById('epicHistoryToggle');

    if (content === 'comments') {

    } else if (content === 'history') {
        historyContent.style.display = 'block';
        historyToggle.classList.add('active');
    }
}

// update epic name
function epicHandleKeyPress(event) {
    if (event.keyCode === 13) {
        var inputValue = document.getElementById("epicName").value;
        if (inputValue == '') {
            //alert('Issue name cannot be NULL');
        } else {
            $.ajax({
                url: '/Admin/Epics/UpdateEpicName',
                method: 'POST',
                data: { epicId: epicEditId, name: inputValue },
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

// update epic color
function epicHandleColorKeyPress(event) {
    if (event.keyCode === 13) {
        var inputValue = document.getElementById("epicColor").value;
        if (inputValue == '') {
            //alert('Issue name cannot be NULL');
        } else {
            $.ajax({
                url: '/Admin/Epics/UpdateEpicColor',
                method: 'POST',
                data: { epicId: epicEditId, color: inputValue },
                success: function (response) {
                    $('#epicColorDisplay').css('background-color', inputValue);
                },
                error: function (xhr, status, error) {
                    console.error(error);
                }
            });
        }
    }
}

// update epic description
var epicOriginalDescription = ''; // Biến tạm để lưu trữ nội dung ban đầu
function updateEpicDescription() {
    var description = document.getElementById("epicDescrtiption").value;

    $.ajax({
        url: '/Admin/Epics/UpdateEpicDescription',
        method: 'POST',
        data: { epicId: epicEditId, description: description },
        success: function (response) {
            epicOriginalDescription = description;
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

// Hàm gọi khi click nút "Cancel"
function cancelEpicUpdate() {
    document.getElementById("epicDescrtiption").value = epicOriginalDescription;
}

// update epic startDate
var startDateInput = document.getElementById("epicStartDate");
startDateInput.addEventListener("blur", function () {
    var startDateValue = startDateInput.value;

    $.ajax({
        url: '/Admin/Epics/UpdateEpicStartDate',
        method: 'POST',
        data: { epicId: epicEditId, date: startDateValue },
        success: function (response) {
            //location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
});

// update epic endDate
var endDateInput = document.getElementById("epicEndDate");
endDateInput.addEventListener("blur", function () {
    var endDateValue = endDateInput.value;

    $.ajax({
        url: '/Admin/Epics/UpdateEpicEndDate',
        method: 'POST',
        data: { epicId: epicEditId, date: endDateValue },
        success: function (response) {
            //location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
});

// Function to close the edit modal
function closeEditModal() {
    var modal = document.getElementById("editEpicModal");
    modal.style.display = "none";
    location.reload();
}

//hiển thị context delete epic
var deleteEpicId;
function showContextDeleteEpic(event, epicId) {
    event.preventDefault(); 
    const menu = document.querySelector('#contextDeleteEpic');
    const rect = event.target.getBoundingClientRect();
    menu.style.setProperty('--mouse-x', rect.left + 'px');
    menu.style.setProperty('--mouse-y', rect.top + 'px');
    menu.style.display = 'block';
    console.log(epicId);
    deleteEpicId = epicId;
}

document.addEventListener("click", function (event) {
    const contextMenu = document.getElementById("contextDeleteEpic");
    if (!contextMenu.contains(event.target)) {
        contextMenu.style.display = "none";
    }
});

function confirmDeleteEpic() {
    $('#confirmDeleteEpicModal').modal('show');
}

$('#deleteEpicButton').on('click', function () {
    console.log('a'+deleteEpicId);
    $.ajax({
        url: '/Admin/Epics/DeleteConfirmed',
        method: 'POST',
        data: { id: deleteEpicId },
        success: function (response) {
            //location.reload();
            $('#epicsContainer').html(response);
            document.getElementById('epicInputWrapper').value = '';
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
    $('#confirmDeleteEpicModal').modal('hide');
});

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

// update epic document
var selectedEpicDocumentId;
function showEpicDeleteFileModal(epicDocumentId) {
    // Hiển thị modal xác nhận xóa
    $('#confirmEpicDeleteModal').modal('show');
    
    selectedEpicDocumentId = epicDocumentId;
    console.log(epicDocumentId);
    console.log(selectedEpicDocumentId);
}

function confirmEpicDeleteBtn() {
    console.log('clicked');
    $.ajax({
        url: '/Admin/Epics/DeleteDocument',
        method: 'POST',
        data: { documentId: selectedEpicDocumentId },
        success: function () {
            console.log('success');
            $('#confirmEpicDeleteModal').modal('hide');
            updateEpicDocumentList();
            console.log(selectedEpicDocumentId);
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

function updateEpicDocumentList() {
    $.ajax({
        url: '/Admin/Epics/Edit',
        method: 'GET',
        data: { epicId: epicEditId },
        success: function (response) {
            var documentList = $('#EpicDocumentList');
            documentList.empty();
            response.epicDocument.forEach(function (document) {
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
                documentHtml += '<button type="button" style="margin-left: 5px;" class="btn light-danger-bg text-end delete-document-btn" onclick="showEpicDeleteFileModal(\'' + document.documentId + '\')"><i class="icofont-ui-delete text-danger"></i></button>';
                documentHtml += '</div>';

                documentList.append(documentHtml);
            });
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

function uploadEpicFiles(files) {
    var formData = new FormData();
    var epicId = epicEditId;

    formData.append("epicId", epicId);

    for (var i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

    $.ajax({
        url: '/Admin/Epics/UpdateEpicFiles',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            updateEpicDocumentList()
        },
        error: function (xhr, status, error) {
            console.error('File upload failed:', error);
        }
    });
}

