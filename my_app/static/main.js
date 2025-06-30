// Fare matrix data (fare matrix with boarding loc)
// const fareMatrix = {
//     "main-terminal": {
//         "downtown": 15,
//         "university": 20,
//         "shopping-mall": 25,
//         "suburb-east": 30
//     },
//     "downtown": {
//         "main-terminal": 2.50,
//         "downtown": 0,
//         "university": 1.50,
//         "shopping-mall": 2.00,
//         "suburb-east": 2.50
//     },
//     "university": {
//         "main-terminal": 3.00,
//         "downtown": 1.50,
//         "university": 0,
//         "shopping-mall": 1.00,
//         "suburb-east": 1.50
//     },
//     "shopping-mall": {
//         "main-terminal": 3.50,
//         "downtown": 2.00,
//         "university": 1.00,
//         "shopping-mall": 0,
//         "suburb-east": 1.00
//     },
//     "suburb-east": {
//         "main-terminal": 4.00,
//         "downtown": 2.50,
//         "university": 1.50,
//         "shopping-mall": 1.00,
//         "suburb-east": 0
//     }
// };

const fareMatrix = {
    "SM Southmall": 15,
    "Las Piñas Commercial Complex": 17.75,
    "Perpetual College/MedCenter": 20.25,
    "Vista Mall Las Piñas": 23,
    "Petron Gas Station": 25,
    "Diego Cera Avenue corner": 28.25,
    "CAVITEX corner": 31,
    "CAVITEX": 33.50,
    "PITX": 52.00,
    "Roxas Boulevard corner": 54.75,
    "EDSA corner": 60,
    "Buendia Avenue corner": 65.25,
    "La Verti Residence": 68,
    "De La Salle University Manila": 70,
    "Remedios Street corner": 73,
    "Manila Science High School": 76,
    "Manila City Hall": 78,
    "Plaza Lawton": 81.25
}

const discounts = {
    "Regular": 0,
    "Student": 0.20,
    "Senior Citizen": 0.20,
    "PWD": 0.20
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadCredentials()
    loadTickets();
});

// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
   
    // Show the selected section
    document.getElementById(sectionId).classList.add('active');
}

var flagMatrix = 0;
// Buy Ticket functions
function toggleFareMatrix() {
    const fareMatrix = document.getElementById('fare-matrix')
    if (flagMatrix == 0){
        fareMatrix.style.display = 'block';
        flagMatrix = 1
    }
    else{
        fareMatrix.style.display = 'none';
        flagMatrix = 0;
    }
}

function proceedToSummary() {
    const dropoff = document.getElementById('drop-off-location').value;
    const passengers = document.getElementById('passengers').value;
    const category = document.querySelector('input[name="category"]:checked').value;

    if (!dropoff) {
        alert('Please select a drop-off location');
        return;
    }
   
    if (passengers < 1 || passengers > 60) {
        alert('Number of passengers must be between 1 and 60');
        return;
    }
   
    // Calculate fare
    const baseFare = fareMatrix[dropoff];
    const discountRate = discounts[category];
    const discountAmount = baseFare * discountRate;
    const totalFare = (baseFare - discountAmount) * passengers;
    console.log(baseFare);
    console.log(discountRate);
    console.log(discountAmount);
    console.log(totalFare);
   
    // Display summary
    document.getElementById('summary-dropoff').textContent = document.getElementById('drop-off-location').options[document.getElementById('drop-off-location').selectedIndex].text;
    document.getElementById('summary-passengers').textContent = passengers;
    document.getElementById('summary-category').textContent = category;
    document.getElementById('summary-fare').textContent = `₱${baseFare.toFixed(2)}`;
    document.getElementById('summary-discount').textContent = `${(discountRate * 100)}% (₱${discountAmount.toFixed(2)})`;
    document.getElementById('summary-total').textContent = `₱${totalFare.toFixed(2)}`;
   
    document.getElementById('ticket-summary').style.display = 'block';
}

function updateSummary(){
    const dropoff = document.getElementById('drop-off-location').value;
    const passengers = document.getElementById('passengers').value;
    const category = document.querySelector('input[name="category"]:checked').value;

    const baseFare = fareMatrix[dropoff];
    const discountRate = discounts[category];
    const discountAmount = baseFare * discountRate;
    const totalFare = (baseFare - discountAmount) * passengers;

    document.getElementById('summary-dropoff').textContent = document.getElementById('drop-off-location').options[document.getElementById('drop-off-location').selectedIndex].text;
    document.getElementById('summary-passengers').textContent = passengers;
    document.getElementById('summary-category').textContent = category;
    document.getElementById('summary-fare').textContent = `₱${baseFare.toFixed(2)}`;
    document.getElementById('summary-discount').textContent = `${(discountRate * 100)}% (₱${discountAmount.toFixed(2)})`;
    document.getElementById('summary-total').textContent = `₱${totalFare.toFixed(2)}`;
}

function selectPayment(method) {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
   
    document.querySelector(`.payment-option[onclick="selectPayment('${method}')"]`).classList.add('selected');
    document.querySelector(`input[value="${method}"]`).checked = true;
}

function processPayment() {   
    // Simulate payment processing
    setTimeout(() => {
        document.getElementById('ticket-summary').style.display = 'none';
        document.getElementById('payment-success').style.display = 'block';
       
        // Generate ticket
        generateTicket();
    }, 1500);
}

function generateTicket() {
    const dropoff = document.getElementById('drop-off-location').value;
    const passengers = document.getElementById('passengers').value;
    const category = document.querySelector('input[name="category"]:checked').value;
    const baseFare = fareMatrix[dropoff];
    const discountRate = discounts[category];
    const discountAmount = baseFare * discountRate;
    const totalFare = (baseFare - discountAmount) * passengers;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    // Generate ticket ID (timestamp + random number for uniqueness)
    const ticketId = Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    // Create ticket object
    const ticket = {
        // boardingName: document.getElementById('boarding-location').options[document.getElementById('boarding-location').selectedIndex].text,
        dropoff: dropoff,
        dropoffName: document.getElementById('drop-off-location').options[document.getElementById('drop-off-location').selectedIndex].text,
        passengers: passengers,
        category: category,
        categoryName: document.querySelector(`label[for="${category}"]`).textContent.trim(),
        fare: baseFare,
        discount: discountRate,
        total: totalFare,
        qrCode: ticketId,
        paymentMethod: paymentMethod,
    };
    
    fetch('/save-ticket', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticket)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('ticket-qr').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketId}`;
            document.getElementById('ticket-id').textContent = `Ticket ID: ${ticketId}`;
            document.getElementById('ticket-id').style.color = '#1f2937';
            document.getElementById('ticket-title').style.color = '#1f2937';
            alert(data.message)
            loadTickets();
        }
        else {
            alert(data.message)
            console.error(data.e)
        }
    })
    .catch(error => {
        console.error('Error: ', error)
        alert('An error occurred while saving the ticket');
    });
}

// My Tickets functions MODIFY AFTER MYSQL
function loadTickets() {
    const activeTicketsList = document.getElementById('active-tickets-list');
    const closedTicketsList = document.getElementById('closed-tickets-list');
    activeTicketsList.innerHTML = '';
    closedTicketsList.innerHTML = '';
   
    fetch('load-tickets')
    .then(response => response.json())
    .then(tickets => {
        if (!tickets || tickets.length === 0){
            activeTicketsList.innerHTML = '<p>No active tickets found</p>';
            closedTicketsList.innerHTML = '<p>No closed tickets found</p>';
            return;
        }
        tickets.forEach(ticket => {
            const status = ticket.status || (ticket.isActive ? 'active' : 'used')

            const ticketElement = document.createElement('div');
            ticketElement.className = `ticket-card ${ticket.status === 'used' ? 'used' : ''}`;

            let statusBadge = status === 'active'
            ? '<span class="ticket-status status-active">Active</span>'
            : '<span class="ticket-status status-used">Used</span>';

            ticketElement.innerHTML = `
            ${statusBadge}
            <div class="ticket-content">
                <div class="ticket-info">
                    <p><strong>From:</strong> ${ticket.boardingLoc}</p>
                    <p><strong>To:</strong> ${ticket.dropOffLoc}</p>
                    <p><strong>Passengers:</strong> ${ticket.numOfPass} (${ticket.typeOfPass})</p>
                    <p><strong>Total:</strong> ₱${ticket.totalFare.toFixed(2)}</p>
                    <p><strong>Purchase Date:</strong> ${new Date(ticket.purchaseDate).toLocaleDateString()}</p>
                    <p><strong>Ticket ID:</strong> ${ticket.qrUniqueId}</p>
                </div>
                ${ticket.status === 'active' ? `
                <div class="ticket-qr">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qrUniqueId}" alt="QR Code">
                </div>` : ''}
            </div>
            `;

            if (status === 'active'){
                activeTicketsList.appendChild(ticketElement);
            }
            else {
                closedTicketsList.appendChild(ticketElement);
            }
        });
    })
    .catch(error => {
        console.error('Error loading tickets: ', error)
        activeTicketsList.innerHTML = '<p>Error loading active tickets</p>';
        closedTicketsList.innerHTML = '<p>Error loading closed tickets</p>';
    })
}

// Profile functions
function changePassword() {
    const current = document.getElementById('current-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;
    const message = document.getElementById('password-message');

    // Check if all fields are filled up
    if (!current || !newPass || !confirm){
        message.textContent = 'Please fill up all fields when changing password'
        message.style.color = 'red';
        return;
    }

    // Check if new password and confirmed password are identical
    if (newPass != confirm){
        message.textContent = 'Passwords do not match!'
        message.style.color = 'red';
        return;
    }

    // Check if the new password is longer than 6 characters
    if (newPass.length < 6) {
        message.textContent = 'New password must be at least 6 characters';
        message.style.color = 'red';
        return;
    }

    // Check if current password is correct
    fetch('/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            currentPassword: current,
            newPassword: newPass
        })
    })
    .then(response => response.json())
    .then(data => {
        message.textContent = data.message;
        if (data.success){
            message.style.color = 'green';
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        }
    })
    .catch(error => {
        console.error('Error: ', error)
        message.textContent = 'An error occurred'
        message.style.color = 'red';
    });

    // Clear fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

function deleteAccount() {
    const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone. ')

    if (!confirmDelete){
        alert('Action cancelled');
        return;
    }

    fetch('/delete-account', {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success){
            alert('Account deleted successfully')
            window.location.href = '/';
        }
        else{
            alert('An error occurred while deleting your account')
        }
    })
    .catch(error => {
        console.error("Error:", error)
        alert('Something went wrong while deleting your account')
    });
}

// Load username, email, and contactNo in profile
function loadCredentials(){
    fetch('/profile-settings')
    .then(response => response.json())
    .then(data => {
        if (data.error){
            alert(data.error)
            return;
        }
        
        document.getElementById('profile-username').textContent = data.username;
        document.getElementById('profile-email').textContent = data.email;
        document.getElementById('profile-contactNo').textContent = data.contactNo;
    })
    .catch(error =>{
        console.error('Error retreieving profile data ', error);
    })
}

function logout() {
    alert('You have been logged out.');
    window.location.href = '/logout';
}

// Help functions
function toggleHelp() {
    const helpPopup = document.getElementById('help-popup');
    helpPopup.style.display = helpPopup.style.display === 'block' ? 'none' : 'block';
}