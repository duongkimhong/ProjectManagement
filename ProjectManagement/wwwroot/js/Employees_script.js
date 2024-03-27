function viewDetail(event, employeeId) {
	event.preventDefault();
	$.ajax({
		type: 'GET',
		url: '/Admin/Employees/Detail',
		data: { id: employeeId },
		success: function (response) {
			window.location.href = response.redirectUrl;
		},
		error: function (xhr, status, error) {
			console.error(error);
		}
	});
}

function updateEmployeeActive(employeeId, status) {
	$.ajax({
		type: 'POST',
		url: '/Admin/Employees/updateEmployeeActive',
		data: { employeeId: employeeId, status: status },
		success: function (response) {
			$('#employeesContainer').html(response);
		},
		error: function (xhr, status, error) {
			console.error(error);
		}
	});
}

$('.form-check-input').change(function () {
	var employeeId = $(this).closest('tr').attr('data-employee-id'); // Lấy employeeId từ tr cùng với checkbox
	var status = $(this).prop('checked') ? 'Active' : 'Block'; // Xác định trạng thái mới dựa trên checkbox

	// Mở modal popup khi checkbox được chọn
	$('#confirmationModal').modal('show');

	// Xử lý sự kiện khi nút xác nhận trong modal được click
	$('#confirmBtn').off('click').on('click', function () {
		updateEmployeeActive(employeeId, status); // Gọi phương thức updateEmployeeActive nếu người dùng đồng ý
		$('#confirmationModal').modal('hide'); // Đóng modal popup sau khi xác nhận
	});

	// Xử lý sự kiện khi modal được ẩn đi mà không có hành động nào được thực hiện
	$('#confirmationModal').off('hidden.bs.modal').on('hidden.bs.modal', function () {
		// Nếu modal được ẩn mà không có hành động nào được thực hiện, đảo lại trạng thái của checkbox
		$(this).find('.form-check-input').prop('checked', !$(this).find('.form-check-input').prop('checked'));
	});
});

function updateUserRole(userId, roleId) {
	console.log("UserId: " + userId + ", RoleId: " + roleId);
	$.ajax({
		type: 'POST',
		url: '/Admin/Employees/updateUserRole',
		data: { userId: userId, roleId: roleId },
		success: function (response) {
			$('#employeesContainer').html(response);
		},
		error: function (xhr, status, error) {
			console.error(error);
		}
	});
}

