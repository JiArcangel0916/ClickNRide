document.addEventListener('DOMContentLoaded', function() {
    loadAdminData();
});

function loadAdminData() {
    fetch('/admin-data')
    .then(response => response.json())
    .then(data => {
        // Loads the info on admin dashboard
        document.getElementById('totalUsers').textContent = data.totalUsers;
        document.getElementById('activeTickets').textContent = data.activeTickets;
        document.getElementById('dailyRevenue').textContent = `₱${data.dailyRevenue}`;
        
        // Loads the user management
        const userList = document.getElementById('userList')
        userList.innerHTML = '';
        data.users.forEach(user => {
            const userRow = document.createElement('tr')
            const date = new Date(user.dateCreated);
            const formattedDate = date.toLocaleDateString()
            userRow.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.contactNo}</td>
            <td>${formattedDate}</td>
            <td class="editField" id="editFields-${user.userId}">
                <button class="button" id="editUser" onclick="showEditInline(${user.userId})">Edit</button>
                <button class="button" id="deleteUser" onclick="deleteUser(${user.userId})">Delete</button>
            </td>`;
            userList.appendChild(userRow);
        });

        // Loads the ticket monitoring
        const ticketList = document.getElementById('ticketList')
        ticketList.innerHTML = '';
        data.tickets.forEach(ticket =>{
            const ticketRow = document.createElement('tr')

            const date = new Date(ticket.purchaseDate);
            const formattedDate = date.toLocaleDateString()

            const isActive = ticket.isActive === 1 || ticket.isActive === true;
            const statusBadge = isActive
            ? '<span class="ticket-status status-active">Active</span>'
            : '<span class="ticket-status status-used">Used</span>';

            ticketRow.innerHTML = `
            <td>${ticket.qrUniqueId}</td>
            <td>${ticket.dropOffLoc}</td>
            <td>${ticket.numOfPass}</td>
            <td>${ticket.typeOfPass}</td>
            <td>${formattedDate}</td>
            <td>${statusBadge}</td>
            <td><button class="button" id="deleteTicket" onclick="deleteTicket('${ticket.qrUniqueId}')">Delete Ticket</button></td>`
            ticketList.appendChild(ticketRow);
        })
    })
    .catch(error => {
        console.error('Error loading admin data: ', error)
        alert('Could not load admin data')
    })     
}

function searchUser(){
    const query = document.getElementById('userSearch').value;

    fetch(`/search-user?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        const userList = document.getElementById('userList');
        userList.innerHTML = '';

        data.users.forEach(user =>{
            const userRow = document.createElement('tr');
            const date = new Date(user.dateCreated);
            const formattedDate = date.toLocaleDateString()
            userRow.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.contactNo}</td>
            <td>${formattedDate}</td>
            <td class="editField" id="editFields-${user.userId}">
                <button class="button" id="editUser" onclick="showEditInline(${user.userId})">Edit</button>
                <button class="button" id="deleteUser" onclick="deleteUser(${user.userId})">Delete</button>
            </td>`;
            userList.appendChild(userRow);
        })
    })
    .catch(error => {
        console.error('Error searching user: ', error)
    })
}

function deleteUser(userId){
    let adminPass = prompt('Enter password to confirm deletion')
    if(adminPass === 'appdevCNRIoT'){
        fetch(`/delete-user/${userId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
               alert(data.message);
            loadAdminData();
        })
        .catch(error => {
            console.error('Deletion error:', error)
        })
    }
    else{
        alert('Incorrect password. Action cancelled.');
    }
}

function showEditInline(userId){
    const container = document.getElementById(`editFields-${userId}`);
    container.innerHTML = `
        <input class="inline-input" type="password" id="currentPass-${userId}" placeholder="Current Pass">
        <input class="inline-input" type="password" id="newPass-${userId}" placeholder="New Pass">
        <input class="inline-input" type="password" id="confirmPass-${userId}" placeholder="Confirm Pass">
        <button class="button" id="submitInLineEdit" onclick="submitInlineEdit(${userId})">Save</button>
        <button class="button" id="cancelInlineEdit" onclick="loadAdminData()">Cancel</button>
        `;
}
function submitInlineEdit(userId) {
    const currentPass = document.getElementById(`currentPass-${userId}`).value;
    const newPass = document.getElementById(`newPass-${userId}`).value;
    const confirmPass = document.getElementById(`confirmPass-${userId}`).value;

    if (newPass !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }

    const adminPass = prompt("Enter admin password to confirm");
    if (adminPass !== "appdevCNRIoT") {
        alert("Incorrect admin password");
        return;
    }

    fetch(`/edit-user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            currentPassword: currentPass,
            newPassword: newPass
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Password updated successfully!");
            loadAdminData();
        } else {
            alert("Incorrect current password.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Something went wrong.");
    });
}

  
function filterTicket(){
   const status = document.getElementById('ticketFilter').value;
   
   fetch(`/filter-ticket?status=${encodeURIComponent(status)}`)
   .then(response => response.json())
   .then(data => {
        const ticketList = document.getElementById('ticketList');
        ticketList.innerHTML = ''

        data.tickets.forEach(ticket => {
            const ticketRow = document.createElement('tr');

            const date = new Date(ticket.purchaseDate);
            const formattedDate = date.toLocaleDateString()

            const isActive = ticket.isActive === 1 || ticket.isActive === true;
            const statusBadge = isActive
            ? '<span class="ticket-status status-active">Active</span>'
            : '<span class="ticket-status status-used">Used</span>';

            ticketRow.innerHTML = `
            <td>${ticket.qrUniqueId}</td>
            <td>${ticket.dropOffLoc}</td>
            <td>${ticket.numOfPass}</td>
            <td>${ticket.typeOfPass}</td>
            <td>${formattedDate}</td>
            <td>${statusBadge}</td>
            <td><button class="button" id="deleteTicket" onclick="deleteTicket('${ticket.qrUniqueId}')">Delete Ticket</button></td>`;
            ticketList.appendChild(ticketRow);
        });
    })
    .catch(error => {
        console.error('Error loading tickets: ', error)
    });
}

function searchTicket(){
    const query = document.getElementById('ticketSearch').value;

    fetch(`/search-ticket?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        const ticketList = document.getElementById('ticketList');
        ticketList.innerHTML = ''

        data.tickets.forEach(ticket => {
            const ticketRow = document.createElement('tr');

            const date = new Date(ticket.purchaseDate);
            const formattedDate = date.toLocaleDateString()

            const isActive = ticket.isActive === 1 || ticket.isActive === true;
            const statusBadge = isActive
            ? '<span class="ticket-status status-active">Active</span>'
            : '<span class="ticket-status status-used">Used</span>';

            ticketRow.innerHTML = `
            <td>${ticket.qrUniqueId}</td>
            <td>${ticket.dropOffLoc}</td>
            <td>${ticket.numOfPass}</td>
            <td>${ticket.typeOfPass}</td>
            <td>${formattedDate}</td>
            <td>${statusBadge}</td>
            <td><button class="button" id="deleteTicket" onclick="deleteTicket('${ticket.qrUniqueId}')">Delete Ticket</button></td>`;
            ticketList.appendChild(ticketRow);
        });
    })
    .catch(error => {
        console.error('Error loading tickets: ', error)
    });
}

function deleteTicket(qrUniqueId){
    let adminPass = prompt('Enter password to confirm deletion')
    if(adminPass === 'appdevCNRIoT'){
        fetch(`/delete-ticket/${qrUniqueId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
               alert(data.message);
            loadAdminData();
        })
        .catch(error => {
            console.error('Deletion error:', error)
        })
    }
    else{
        alert('Incorrect password. Action cancelled.');
    }
}

function logout() {
    alert('Successfully logged out from admin panel');
    window.location.href = '/logout';
}