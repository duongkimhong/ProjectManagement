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
    console.log(issueId);
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
            location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
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
            console.log(url);

            // Sử dụng regex để tìm projectId trong URL
            var regex = /\/([\w-]+)#?$/;
            var match = regex.exec(url);
            if (match) {
                var projectId = match[1];
                console.log(projectId);

                $.ajax({
                    type: "POST",
                    url: "/Admin/Epics/Create",
                    data: { name: epicName, projectId: projectId },
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

var id;

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

        startDate.setDate(startDate.getDate() + 1);
        endDate.setDate(endDate.getDate() + 1);

        $('#sprintIdInput').val(sprintID);
        $('#projectIdInput').val(pj_id);
        $('#sprintNameInput').val(name);
        $('#startDateInput').val(startDate.toISOString().split('T')[0]);
        $('#endDateInput').val(endDate.toISOString().split('T')[0]); // Chuyển đổi về định dạng YYYY-MM-DD
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
        var formData = $('#editSprintForm').serialize();

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

function startSprint(sprintId, status) {
    $.ajax({
        type: "POST",
        url: "/Admin/Sprints/UpdateSprintStatus",
        data: { sprintId: sprintId, status: status },
        success: function (response) {

        },
        error: function () {

        }
    });
}

// Hiện context menu khi nhấp chuột phải vào epic name
function showContextMenu(event) {
    const epicSpan = event.target;
    console.log('unlink');

    // Kiểm tra xem phần tử được nhấp chuột có phải là epic name không
    if (epicSpan.classList.contains('badge') && epicSpan.classList.contains('bg-primary')) {
        event.preventDefault(); // Ngăn chặn hành vi mặc định của trình duyệt
        // Xử lý hiển thị menu context
        const rect = epicSpan.getBoundingClientRect();
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.display = 'block';
        contextMenu.style.left = (rect.left - 350) + 'px';
        contextMenu.style.top = (rect.top + epicSpan.offsetHeight - 230) + 'px';
        // Thêm một event listener để ẩn menu khi click bên ngoài nó
        document.addEventListener('click', hideContextMenu);
    }
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'none';

    // Gỡ bỏ event listener sau khi menu đã ẩn
    document.removeEventListener('click', hideContextMenu);
}

document.addEventListener('DOMContentLoaded', function () {
    const epicName = document.querySelector('.badge.bg-primary');

    epicName.addEventListener('click', function (event) {
        event.preventDefault();
        showContextMenu(event);
    });
});

function handleClick(issueId) {
    console.log("Click event with issueId:", issueId);
    $.ajax({
        url: '/Admin/Issues/UnlinkEpic',
        method: 'POST',
        data: { issueId: issueId },
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
    event.preventDefault(); // Ngăn chặn hành vi mặc định của trình duyệt
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
    // Lấy nội dung của comment từ textarea
    var commentContent = document.getElementById('commentInput').value;

    // Lấy issueId từ URL hoặc từ một nguồn khác nếu có
    var issueId = 'your_issue_id_value';

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
            // Xử lý kết quả nếu cần
            console.log('Comment created successfully');
        },
        error: function (xhr, status, error) {
            // Xử lý lỗi nếu có
            console.error('Error:', error);
        }
    });
}

function cancelComment() {
    // Xử lý hủy comment nếu cần
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

function updateAssignee(userId) {
    $.ajax({
        url: '/Admin/Issues/UpdateIssueAssignee',
        method: 'POST',
        data: { issueId: id, userId: userId },
        success: function (response) {

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
            location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
    $('#confirmDeleteEpicModal').modal('hide');
});