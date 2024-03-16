
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
    console.log(startDateValue); // Kiểm tra xem giá trị ngày đã được lấy đúng chưa

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
