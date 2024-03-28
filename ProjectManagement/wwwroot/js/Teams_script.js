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
            var inviteAccountsList = document.getElementById('accountsInvite');
            inviteAccountsList.innerHTML = '';

            // Input group for search
            var searchInputGroup = document.createElement('div');
            searchInputGroup.classList.add('input-group', 'mb-3');

            var inviteSearchInput = document.createElement('input');
            inviteSearchInput.type = 'text';
            inviteSearchInput.classList.add('form-control');
            inviteSearchInput.id = 'inviteSearchInput_' + teamId;
            inviteSearchInput.placeholder = 'Search by username';

            var inviteSearchButton = document.createElement('button');
            inviteSearchButton.classList.add('btn', 'btn-outline-secondary');
            inviteSearchButton.type = 'button';
            inviteSearchButton.id = 'inviteSearchButton_' + teamId;
            inviteSearchButton.textContent = 'Search';

            searchInputGroup.appendChild(inviteSearchInput);
            searchInputGroup.appendChild(inviteSearchButton);
            inviteAccountsList.appendChild(searchInputGroup);

            // Table
            var table = document.createElement('table');
            table.classList.add('table');

            var thead = document.createElement('thead');
            var tr = document.createElement('tr');
            ['Avatar', 'Username', 'Select'].forEach(function (columnName) {
                var th = document.createElement('th');
                th.scope = 'col';
                th.textContent = columnName;
                tr.appendChild(th);
            });
            thead.appendChild(tr);
            table.appendChild(thead);

            var tbody = document.createElement('tbody');
            accounts.forEach(function (account) {
                var tr = document.createElement('tr');

                // Avatar cell
                var avatarCell = document.createElement('td');
                var avatarImg = document.createElement('img');
                avatarImg.src = account.image;
                avatarImg.alt = 'Avatar';
                avatarImg.classList.add('avatar-image');
                avatarImg.style.width = '30px';
                avatarImg.style.height = '30px';
                avatarCell.appendChild(avatarImg);
                tr.appendChild(avatarCell);

                // Username cell
                var usernameCell = document.createElement('td');
                usernameCell.textContent = account.userName;
                tr.appendChild(usernameCell);

                // Select cell
                var selectCell = document.createElement('td');
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('user-checkbox');
                checkbox.dataset.userId = account.userId;
                checkbox.name = 'selectedUsers';
                checkbox.value = account.userId;
                selectCell.appendChild(checkbox);
                tr.appendChild(selectCell);

                tbody.appendChild(tr);
            });
            table.appendChild(tbody);

            inviteAccountsList.appendChild(table);

            // Gán sự kiện click cho nút tìm kiếm
            inviteSearchButton.addEventListener("click", function () {
                var keyword = inviteSearchInput.value.toLowerCase().trim();
                var rows = tbody.querySelectorAll('tr');

                rows.forEach(function (row) {
                    var username = row.querySelector("td:nth-child(2)").textContent.toLowerCase().trim();

                    if (username.includes(keyword)) {
                        row.style.display = "table-row";
                    } else {
                        row.style.display = "none";
                    }
                });
            });

            // Show the modal after all accounts are populated
            $('#inviteMemberModal').modal('show');
        },
        error: function (xhr, status, error) {
            console.error('Error fetching accounts:', error);
        }
    });
}

function inviteMembers() {
    var selectedAccounts = [];
    var checkboxes = document.querySelectorAll('#accountsInvite input[type="checkbox"]:checked');
    checkboxes.forEach(function (checkbox) {
        selectedAccounts.push(checkbox.value);
    });
    console.log(selectedAccounts);
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






