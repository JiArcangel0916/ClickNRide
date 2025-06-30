// SWITCH TO SIGNUP
function toggleSignup() {
    document.querySelector('.auth-box').classList.toggle('show-signup');
}

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert('Please enter your credentials.');
        return;
    }
    
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({username:username, password:password})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success){
            if (data.redirect){
                alert(`Welcome, admin!`)
                window.location.href = data.redirect;
            }
            else{
                alert(`Welcome, ${username}!`)
                window.location.href = '/dashboard'
            }
        }
        else{
            alert(data.message);
        }
    })
    .catch(error =>{
        console.error('Error', error)
        alert('Something went wrong. Could not process credentials')
    })
}

function signup() {
    const newUser = document.getElementById('new-username').value.trim();
    const newEmail = document.getElementById('new-email').value.trim();
    const newNumber = document.getElementById('new-number').value.trim();
    const newPass = document.getElementById('new-password').value.trim();

    if (!newUser || !newEmail || !newNumber || !newPass) {
        alert('Please fill out all fields');
        return;
    }

    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: newUser, email: newEmail, contactNo: newNumber, userPass: newPass})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success){
            alert('User created!')
            toggleSignup()
        }
        else{
            alert(data.message)
        }
    })
    .catch(error => {
        console.error('Error', error)
        alert('Something went wrong. Could not create new user')
    })
}