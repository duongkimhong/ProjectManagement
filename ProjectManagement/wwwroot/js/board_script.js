
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

//function allowDrop(event) {
//    event.preventDefault();
//}

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

            $.each(response.comments, function (index, comment) {
                // Tạo HTML cho mỗi comment và thêm vào phần tử có id là 'commentsContent'
                var commentHtml = '<div class="col-md-12 comment-item">' +
                    '    <div class="row align-items-center">' +
                    '        <div class="col-md-1">' +
                    '            <img class="rounded-circle user-avatar" alt="Avatar" width="30" height="30">' +
                    '        </div>' +
                    '        <div class="col-md-10">' +
                    '            <p class="mb-1">' + comment.content + '</p>' +
                    '            <p class="text-muted mb-1">Posted on: ' + new Date(comment.timestamp).toLocaleString() + '</p>' +
                    '        </div>' +
                    '    </div>' +
                    '</div>';

                // Thêm commentHtml vào phần tử có id là 'commentsContent'
                $('#commentsContent').append(commentHtml);

                $.ajax({
                    url: '/Admin/Board/GetUserImage',
                    method: 'GET',
                    data: { userId: comment.userId },
                    success: function (userData) {
                        var userImage = userData.image ? userData.image : '/defaultuser.png';
                        $('#commentsContent .comment-item:last .user-avatar').attr('src', userImage);
                    },
                    error: function (xhr, status, error) {
                        console.error(error);
                    }
                });
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

//function updateNewButton(type) {
//	var issueId = id;
//	console.log('update new button');
//	//console.log(issueId);
//	$.ajax({
//		url: '/Admin/Issues/Edit',
//		method: 'POST',
//		data: { id: issueId },
//		//data: { issueId: issueId, type: type },
//		success: function (response) {
//		},
//		error: function (xhr, status, error) {
//			// Xử lý lỗi nếu có
//			console.error(error);
//		}
//	});
//}

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
