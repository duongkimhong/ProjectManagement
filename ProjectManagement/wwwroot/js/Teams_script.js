function editTeamName(teamId, currentName) {
    // Tạo một input và thiết lập giá trị ban đầu là tên hiện tại
    var input = document.createElement("input");
    input.type = "text";
    input.value = currentName;

    // Thay thế nội dung của td bằng input
    var td = event.target;
    td.innerHTML = "";
    td.appendChild(input);

    input.focus();

    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            // Kiểm tra nếu ô input không trống
            if (input.value.trim() !== "") {
                updateTeamName(teamId, input.value);
            } else {
                alert("Tên không được để trống!");
            }
        }
    });
}

function updateTeamName(teamId, newName) {
    $.ajax({
        url: '/Admin/Teams/UpdateTeamName',
        method: 'POST',
        data: { teamId: teamId, newName: newName },
        success: function (response) {
            location.reload();
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

function openTeamMembersModal(teamId) {
    $.ajax({
        type: 'GET',
        url: '/Admin/Teams/GetTeamMembers',
        data: { teamId: teamId },
        success: function (members) {
            console.log(members);

            var modalContent = document.getElementById('memberModalBody');
            modalContent.innerHTML = '';

            var table = document.createElement('table');
            table.classList.add('table');

            // Tạo header cho bảng
            var headerRow = table.insertRow();
            var headerNames = ['Avatar', 'Name', 'Role', 'Status', 'Actions'];
            headerNames.forEach(function (name) {
                var headerCell = document.createElement('th');
                headerCell.textContent = name;
                headerRow.appendChild(headerCell);
            });

            // Thêm thông tin thành viên vào bảng
            members.forEach(function (member) {
                var row = table.insertRow();

                var avatarCell = row.insertCell();
                avatarCell.classList.add('avatar-cell'); // Thêm class để áp dụng CSS

                var avatarImg = document.createElement('img');
                avatarImg.src = member.image;
                avatarImg.alt = 'Avatar';
                avatarImg.classList.add('avatar-image');
                avatarImg.style.padding = '0px';
                avatarCell.appendChild(avatarImg);

                var nameCell = row.insertCell();
                nameCell.textContent = member.userName;

                var roleCell = row.insertCell();
                var selectRole = document.createElement('select');
                selectRole.classList.add('form-select', 'mt-1', 'mb-1', 'p-1');

                var roleOptions = ['Member', 'Product Owner', 'Scrum Master'];
                roleOptions.forEach(function (optionText) {
                    var option = document.createElement('option');
                    option.value = optionText;
                    option.textContent = optionText;
                    selectRole.appendChild(option);
                });

                selectRole.value = member.role;
                roleCell.appendChild(selectRole);

                selectRole.addEventListener('change', function () {
                    var newRole = this.value;
                    $.ajax({
                        type: 'POST',
                        url: '/Admin/Teams/UpdateMemberRole',
                        data: { teamMemberId: member.id, roleName: newRole },
                        success: function (response) {
                        },
                        error: function (xhr, status, error) {
                            console.error('Error updating role:', error);
                        }
                    });
                });

                var statusCell = row.insertCell();
                var statusBadge = document.createElement('span');

                var statusMap = {
                    0: { text: 'Pending', class: 'badge bg-warning p-2 text-white' },
                    1: { text: 'Active', class: 'badge bg-success p-2 text-white' },
                    2: { text: 'Blocked', class: 'badge bg-danger p-2 text-white' }
                };

                if (member.status in statusMap) {
                    statusBadge.textContent = statusMap[member.status].text;
                    var classes = statusMap[member.status].class.split(' ').map(function (className) {
                        return className.trim();
                    });
                    statusBadge.classList.add(...classes);
                } else {
                    statusBadge.textContent = 'Unknown';
                    statusBadge.classList.add('badge', 'p-2', 'bg-secondary');
                }

                statusCell.appendChild(statusBadge);

                // Tạo cell cho cột "Actions"
                var actionCell = row.insertCell();
                var actionButton = document.createElement('button');
                if (member.status === 0) {
                    actionButton.textContent = 'Delete';
                    actionButton.classList.add('btn', 'btn-danger', 'p-1');
                    actionButton.onclick = function () {
                        updateMemberStatus(member.id, 'Delete');
                    };
                } else if (member.status === 1) {
                    actionButton.textContent = 'Block';
                    actionButton.classList.add('btn', 'btn-warning', 'p-1');
                    actionButton.onclick = function () {
                        updateMemberStatus(member.id, 'Block');
                    };
                } else if (member.status === 2) {
                    actionButton.textContent = 'Activate';
                    actionButton.classList.add('btn', 'btn-success', 'p-1');
                    actionButton.onclick = function () {
                        updateMemberStatus(member.id, 'Activate');
                    };
                } else {
                    actionButton.textContent = 'Unknown';
                    actionButton.classList.add('btn', 'btn-secondary', 'p-1');
                    actionButton.disabled = true;
                }

                // Thêm nút vào cell của cột "Actions"
                actionCell.appendChild(actionButton);

                table.appendChild(row);
            });

            modalContent.appendChild(table);
            $('#memberModal').modal('show');


        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

function updateMemberStatus(memberId, status) {
    $.ajax({
        type: 'POST',
        url: '/Admin/Teams/UpdateMemberStatus',
        data: { teamMemberId: memberId, status: status },
        success: function (response) {
            console.log(response);
            reloadMembers(response.teamId);
        },
        error: function (xhr, status, error) {
            console.error('Error updating status:', error);
        }
    });
}

function reloadMembers(teamId) {
    $.ajax({
        type: 'GET',
        url: '/Admin/Teams/GetTeamMembers',
        data: { teamId: teamId },
        success: function (members) {
            console.log(members);

            var modalContent = document.getElementById('memberModalBody');
            modalContent.innerHTML = '';

            var table = document.createElement('table');
            table.classList.add('table');

            // Tạo header cho bảng
            var headerRow = table.insertRow();
            var headerNames = ['Avatar', 'Name', 'Role', 'Status', 'Actions'];
            headerNames.forEach(function (name) {
                var headerCell = document.createElement('th');
                headerCell.textContent = name;
                headerRow.appendChild(headerCell);
            });

            // Thêm thông tin thành viên vào bảng
            members.forEach(function (member) {
                var row = table.insertRow();

                var avatarCell = row.insertCell();
                avatarCell.classList.add('avatar-cell'); // Thêm class để áp dụng CSS

                var avatarImg = document.createElement('img');
                avatarImg.src = member.image;
                avatarImg.alt = 'Avatar';
                avatarImg.classList.add('avatar-image');
                avatarImg.style.padding = '0px';
                avatarCell.appendChild(avatarImg);

                var nameCell = row.insertCell();
                nameCell.textContent = member.userName;

                var roleCell = row.insertCell();
                var selectRole = document.createElement('select');
                selectRole.classList.add('form-select', 'mt-1', 'mb-1', 'p-1');

                var roleOptions = ['Member', 'Product Owner', 'Scrum Master'];
                roleOptions.forEach(function (optionText) {
                    var option = document.createElement('option');
                    option.value = optionText;
                    option.textContent = optionText;
                    selectRole.appendChild(option);
                });

                selectRole.value = member.role;
                roleCell.appendChild(selectRole);

                selectRole.addEventListener('change', function () {
                    var newRole = this.value;
                    $.ajax({
                        type: 'POST',
                        url: '/Admin/Teams/UpdateMemberRole',
                        data: { teamMemberId: member.id, roleName: newRole },
                        success: function (response) {
                        },
                        error: function (xhr, status, error) {
                            console.error('Error updating role:', error);
                        }
                    });
                });

                var statusCell = row.insertCell();
                var statusBadge = document.createElement('span');

                var statusMap = {
                    0: { text: 'Pending', class: 'badge bg-warning p-2 text-white' },
                    1: { text: 'Active', class: 'badge bg-success p-2 text-white' },
                    2: { text: 'Blocked', class: 'badge bg-danger p-2 text-white' }
                };

                if (member.status in statusMap) {
                    statusBadge.textContent = statusMap[member.status].text;
                    var classes = statusMap[member.status].class.split(' ').map(function (className) {
                        return className.trim();
                    });
                    statusBadge.classList.add(...classes);
                } else {
                    statusBadge.textContent = 'Unknown';
                    statusBadge.classList.add('badge', 'p-2', 'bg-secondary');
                }

                statusCell.appendChild(statusBadge);

                // Tạo cell cho cột "Actions"
                var actionCell = row.insertCell();
                var actionButton = document.createElement('button');
                if (member.status === 0) {
                    actionButton.textContent = 'Delete';
                    actionButton.classList.add('btn', 'btn-danger', 'p-1');
                    actionButton.onclick = function () {
                        updateMemberStatus(member.id, 'Delete');
                    };
                } else if (member.status === 1) {
                    actionButton.textContent = 'Block';
                    actionButton.classList.add('btn', 'btn-warning', 'p-1');
                    actionButton.onclick = function () {
                        updateMemberStatus(member.id, 'Block');
                    };
                } else if (member.status === 2) {
                    actionButton.textContent = 'Activate';
                    actionButton.classList.add('btn', 'btn-success', 'p-1');
                    actionButton.onclick = function () {
                        updateMemberStatus(member.id, 'Activate');
                    };
                } else {
                    actionButton.textContent = 'Unknown';
                    actionButton.classList.add('btn', 'btn-secondary', 'p-1');
                    actionButton.disabled = true;
                }

                // Thêm nút vào cell của cột "Actions"
                actionCell.appendChild(actionButton);

                table.appendChild(row);
            });

            modalContent.appendChild(table);
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

var addMemberTeamId;
function populateAccountsList(teamId) {
    addMemberTeamId = teamId;
    $.ajax({
        type: 'GET',
        url: '/Admin/Teams/GetAccountsToInvite',
        data: { teamId: teamId },
        success: function (accounts) {
            var accountsList = document.getElementById('accountsList');
            accountsList.innerHTML = '';
            accounts.forEach(function (account) {
                var row = document.createElement('div');
                row.classList.add('row', 'align-items-center');

                // First column: Avatar
                var avatarCol = document.createElement('div');
                avatarCol.classList.add('col-auto');
                var avatarImg = document.createElement('img');
                avatarImg.src = account.image;
                avatarImg.alt = 'Avatar';
                avatarImg.classList.add('avatar-image');
                avatarImg.style.width = '30px';
                avatarImg.style.height = '30px';
                avatarCol.appendChild(avatarImg);
                row.appendChild(avatarCol);

                // Second column: Username
                var usernameCol = document.createElement('div');
                usernameCol.classList.add('col');
                var label = document.createElement('label');
                label.htmlFor = 'account_' + account.userId;
                label.appendChild(document.createTextNode(account.userName));
                usernameCol.appendChild(label);
                row.appendChild(usernameCol);

                // Third column: Checkbox
                var checkboxCol = document.createElement('div');
                checkboxCol.classList.add('col-auto');
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = account.userId;
                checkbox.id = 'account_' + account.userId;
                checkboxCol.appendChild(checkbox);
                row.appendChild(checkboxCol);

                // Append the row to the accounts list
                accountsList.appendChild(row);
            });

            // Show the modal after all accounts are populated
            $('#inviteModal').modal('show');
        },
        error: function (xhr, status, error) {
            console.error('Error fetching accounts:', error);
        }
    });
}

function inviteMembers() {
    var selectedAccounts = [];
    var checkboxes = document.querySelectorAll('#accountsList input[type="checkbox"]:checked');
    checkboxes.forEach(function (checkbox) {
        selectedAccounts.push(checkbox.value);
    });

    var table = document.createElement('table');
    table.classList.add('table');

    var headerRow = table.insertRow();
    var headerNames = ['Avatar', 'Username'];
    headerNames.forEach(function (name) {
        var headerCell = document.createElement('th');
        headerCell.textContent = name;
        headerRow.appendChild(headerCell);
    });

    selectedAccounts.forEach(function (accountId) {
        var account = document.getElementById('account_' + accountId);
        var accountRow = table.insertRow();

        var avatarCell = accountRow.insertCell();
        var avatarImg = document.createElement('img');
        var avatarSrc = account.querySelector('img') ? account.querySelector('img').src : '';
        avatarImg.src = avatarSrc; 
        avatarImg.alt = 'Avatar';
        avatarImg.style.width = '30px';
        avatarImg.style.height = '30px';
        avatarCell.appendChild(avatarImg);

        var usernameCell = accountRow.insertCell();
        var usernameText = account.querySelector('label') ? account.querySelector('label').textContent : '';
        usernameCell.textContent = usernameText;
    });

    var modalBody = document.querySelector('#inviteModal .modal-body');
    modalBody.innerHTML = '';
    modalBody.appendChild(table);

    var teamId = '@team.Id';

    $.ajax({
        type: 'POST',
        url: '/Admin/Teams/AddMembers',
        data: { teamId: addMemberTeamId, selectedAccounts: selectedAccounts },
        success: function (response) {
            console.log('Invitations sent successfully.');
            $('#inviteModal').modal('hide');
            location.reload();
        },
        error: function (xhr, status, error) {
            console.error('Error inviting members:', error);
        }
    });
}

function populateProjectSelect() {
    var projectSelect = document.getElementById('projectSelect');
    $.ajax({
        type: 'GET',
        url: '/Admin/Teams/GetProjects',
        success: function (projects) {
            console.log(projects);
            projectSelect.innerHTML = '';
            projects.forEach(function (project) {
                var option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                projectSelect.appendChild(option);
            });
        },
        error: function (xhr, status, error) {
            console.error('Error fetching projects:', error);
        }
    });
}

function openCreateTeamModal() {
    populateProjectSelect();
    $('#createTeamModal').modal('show');
}

function createTeam() {
    var teamName = document.getElementById('teamName').value;
    var projectId = document.getElementById('projectSelect').value;
    $.ajax({
        type: 'POST',
        url: '/Admin/Teams/CreateTeam',
        data: { teamName: teamName, projectId: projectId },
        success: function (response) {
            console.log('Team created successfully.');
            $('#createTeamModal').modal('hide');
            location.reload();
        },
        error: function (xhr, status, error) {
            console.error('Error creating team:', error);
        }
    });
}






