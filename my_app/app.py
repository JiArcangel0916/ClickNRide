from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_mysqldb import MySQL
from datetime import date
import MySQLdb.cursors

app = Flask(__name__)

# Secret key for session handling
app.secret_key = "CNRdbts_appDev"

# MySQL Database configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'jian'
app.config['MYSQL_DB'] = 'cnr'

mysql = MySQL(app)

# LOGIN ROUTES
@app.route('/')
def index():
    # Loads the login page
    session.clear()
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    # Takes data sent by JS
    data = request.get_json()
    username = data.get('username')
    userPass = data.get('password')

    # Checks if the credentials matches the admin's credentials
    if username == 'admin' and userPass == 'appdevCNRIoT':
        session['loggedIn'] = True
        session['username'] = 'admin'
        session['role'] = 'admin'

        return jsonify({'success':True, 
                        'redirect': '/admin',
                        'role': 'admin'}) 

    # Cursor - object that allows connection to database
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # Uses a querry if the user and pass is in the database
    cursor.execute('SELECT * FROM user WHERE username = %s AND userPass = %s', (username, userPass))

    # Stores data retrieved to cursor
    account = cursor.fetchone()

    # If there exist such user, login to dashboard and create a session
    if account:   
        session['loggedIn'] = True
        session['userId'] = account['userId']
        session['username'] = account['username']   
        session['role'] = 'user'      
        return jsonify({'success':True})
    else:
        return jsonify({'success':False, 
                        'message':'Incorrect username or password',
                        'role': 'user'})

@app.route('/signup', methods=['POST'])
def signup():
    # Takes data from JS
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    contactNo = data.get('contactNo')
    userPass = data.get('userPass')

    # Cursor - object that allows connection to database
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # Uses a querry if the user is already in the database and store it in account
    cursor.execute('SELECT * FROM user WHERE username = %s AND email = %s AND contactNo = %s', (username, email, contactNo))
    account = cursor.fetchone()

    # If user already exists, prompt the user
    if account:
        return jsonify({'success': False, 
                        'message':'User already exists!'})
    else:
        cursor.execute('INSERT INTO user (username, email, contactNo, userPass) VALUES (%s, %s, %s, %s)', (username, email, contactNo, userPass))
        mysql.connection.commit()
        return jsonify({'success': True})


# ADMIN ROUTES
@app.route('/admin')
def admin():
    if session.get('role') == 'admin':
        return render_template('admin.html')
    else:
        session.clear()
        return redirect('/')

@app.route('/admin-data')
def loadAdminData():
    # Cursor - object that allows connection to database
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # Checks the database for total users
    cursor.execute('SELECT COUNT(*) AS totalUsers FROM user')
    totalUsers = cursor.fetchone()['totalUsers']

    # Checks the database for total number of active tickets
    cursor.execute('SELECT COUNT(*) AS activeTickets FROM ticket where isActive = %s', (1,))
    activeTickets = cursor.fetchone()['activeTickets']

    # Checks the databse for sum of today's bought tickets
    today = date.today()
    cursor.execute('SELECT SUM(totalFare) AS dailyRevenue FROM ticket WHERE DATE(purchaseDate) = %s', (today,))
    dailyRevenue = cursor.fetchone()['dailyRevenue']
    if dailyRevenue is None:
        dailyRevenue = 0

    # Checks the database for total users
    cursor.execute('SELECT userId, username, email, contactNo, dateCreated FROM user')
    users = cursor.fetchall()

    # Checks the database for total tickets
    cursor.execute('SELECT qrUniqueId, dropOffLoc, numOfPass, typeOfPass, purchaseDate, isActive FROM ticket ORDER BY purchaseDate DESC')
    tickets = cursor.fetchall()

    return jsonify({'totalUsers': totalUsers, 
                    'activeTickets': activeTickets, 
                    'dailyRevenue': dailyRevenue,
                    'users': users,
                    'tickets': tickets})

@app.route('/search-user')
def searchUser():
    # Prepares the query
    query = request.args.get('q', '')
    wildcard = f"%{query}%"
    
    # Cursor - object that allows connection to database
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # Selects specific users from the database
    cursor.execute('SELECT username, email, contactNo, dateCreated FROM user WHERE username LIKE %s OR email LIKE %s OR contactNO LIKE %s', (wildcard, wildcard, wildcard))
    users = cursor.fetchall()

    return jsonify({'users': users})

@app.route('/filter-ticket')
def filterTicket():
    # Sets defualt to show all tickets
    status = request.args.get('status', 'all')
    
    # Cursor - object that allows connection to database
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    if status == 'active':
        cursor.execute("SELECT qrUniqueId, dropOffLoc, numOfPass, typeOfPass, purchaseDate, isActive FROM ticket WHERE isActive = %s ORDER BY purchaseDate DESC", (1, ))
    elif status == 'used':
        cursor.execute("SELECT qrUniqueId, dropOffLoc, numOfPass, typeOfPass, purchaseDate, isActive FROM ticket WHERE isActive = %s ORDER BY purchaseDate DESC", (0, ))
    else:
        cursor.execute("SELECT qrUniqueId, dropOffLoc, numOfPass, typeOfPass, purchaseDate, isActive FROM ticket ORDER BY purchaseDate DESC")
    tickets = cursor.fetchall()

    return jsonify({'tickets': tickets})

@app.route('/search-ticket')
def searchTicket():
    # Prepares the query
    query = request.args.get('q', '')
    wildcard = f"%{query}%"

    # Cursor - object that allows connection to database
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # Selects specific users from the database
    cursor.execute('SELECT qrUniqueId, dropOffLoc, numOfPass, typeOfPass, purchaseDate, isActive FROM ticket WHERE qrUniqueId LIKE %s OR dropOffLoc LIKE %s OR typeOfPass LIKE %s ORDER BY purchaseDate DESC', (wildcard, wildcard, wildcard))
    tickets = cursor.fetchall()

    return jsonify({'tickets': tickets})

@app.route('/delete-ticket/<string:qrUniqueId>', methods=['DELETE'])
def deleteTicket(qrUniqueId):
    try:
        # Cursor - object that allows connection to database
        cursor = mysql.connection.cursor()

        # Delete specific user
        cursor.execute('DELETE FROM ticket WHERE qrUniqueId = %s', (qrUniqueId,))
        mysql.connection.commit()
        return jsonify({'message': 'Ticket deleted successfully'})
    except Exception as e:
        return jsonify({'Error': str(e)}), 500

@app.route('/delete-user/<int:userId>', methods=['DELETE'])
def deleteUser(userId):
    try:
        # Cursor - object that allows connection to database
        cursor = mysql.connection.cursor()

        # Delete specific user
        cursor.execute('DELETE FROM user WHERE userId = %s', (userId,))
        mysql.connection.commit()
        return jsonify({'message': 'User deleted successfully'})
    except Exception as e:
        return jsonify({'Error': str(e)}), 500

@app.route('/edit-user/<int:userId>', methods=['POST'])
def editUser(userId):
    data = request.get_json()
    currentPass = data.get('currentPassword')
    newPass = data.get('newPassword')

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT userPass FROM user WHERE userId = %s', (userId, ))
    userPass = cursor.fetchone()

    if not userPass or userPass['userPass'] != currentPass:
        return jsonify({'success': False})
    
    cursor.execute('UPDATE user SET userPass = %s WHERE userId = %s', (newPass, userId))
    mysql.connection.commit()
    return jsonify({'success': True})


# USER ROUTES
@app.route('/dashboard')
def dashboard():
    if not session.get('loggedIn'):
        return redirect('/')
    
    return render_template('dashboard.html')

@app.route('/save-ticket', methods=['POST'])
def saveTicket():
    # Retrieves data from JS
    data = request.get_json()

    qrUniqueId = data.get('qrCode')
    userId = session.get('userId')
    dropOffLoc = data.get('dropoff')
    numOfPass = data.get('passengers')
    typeOfPass = data.get('category')
    baseFare = data.get('fare')
    discount = data.get('discount')
    totalFare = data.get('total')
    paymentMethod = data.get('paymentMethod')

    try:
        # Cursor - object that allows connection to database
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

        # Insert new ticket to the databsae
        cursor.execute('INSERT INTO ticket (qrUniqueId, userId, dropOffLoc, numOfPass, typeOfPass, baseFare, discount, totalFare, paymentMethod) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)', (qrUniqueId, userId, dropOffLoc, numOfPass, typeOfPass, baseFare, discount, totalFare, paymentMethod))
        mysql.connection.commit()
        cursor.close()

        return jsonify({'success': True,
                    'message': 'Ticket saved successfully'})
    
    except Exception as e:
        return jsonify({'success': False,
                        'message': 'Failed to save ticket. Database error',
                        'error' : str(e)})

@app.route('/load-tickets')
def loadTickets():
    # Cursor - object that allows connection to database
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    userId = session.get('userId')

    # Selects tickets that a specific user bought
    cursor.execute('SELECT * FROM ticket WHERE userId = %s ORDER BY purchaseDate DESC', (userId, ))
    tickets = cursor.fetchall()

    for ticket in tickets:
        ticket['status'] = 'active' if ticket.get('isActive') else 'used'
        ticket['dropOffName'] = ticket.get('dropoffName') or ticket.get('dropOffLoc')
        ticket['totalFare'] = float(ticket['totalFare'])
        ticket['qrCode'] = ticket['qrUniqueId']
        

    return jsonify(tickets)

@app.route('/profile-settings')
def profileSettings():
    if not session.get('loggedIn'):
        return jsonify({'error': 'Not logged in'}), 401
    
    userId = session.get('userId')

    # Cursor - object that allows connection to database
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # Selects information about current logged in user
    cursor.execute('SELECT username, email, contactNo FROM user WHERE userId = %s', (userId, ))
    userData = cursor.fetchone()

    if userData:
        return jsonify(userData)
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/change-password', methods=['POST'])
def changePass():
    data = request.get_json()
    currentPass = data.get('currentPassword')
    newPass = data.get('newPassword')

    userId = session.get('userId')
    
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT userPass FROM user WHERE userId = %s', (userId, ))
    userPass = cursor.fetchone()

    if not userPass or userPass['userPass'] != currentPass:
        return jsonify({'success': False,
                        'message': 'Current password is incorrect'})
    
    cursor.execute('UPDATE user SET userPass = %s WHERE userId = %s', (newPass, userId))
    mysql.connection.commit()

    return jsonify({'success': True,
                    'message': 'Password changed successfully'})

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/delete-account', methods=['DELETE'])
def deleteAccount():
    userId = session.get('userId')
    
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('DELETE FROM user WHERE userId = %s', (userId, ))
        mysql.connection.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False})

# TICKET PUNCHING 
@app.route('/punch-ticket/', methods=['POST'])
def punchTicket():
    data = request.get_json()
    qrUniqueId = data.get('ticketId')

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT isActive FROM ticket WHERE qrUniqueId = %s', (qrUniqueId, ))
    result = cursor.fetchone()

    if result:
        ticketStatus = result[0]
        if ticketStatus == 1:
            cursor.execute('UPDATE ticket SET isActive = 0 WHERE qrUniqueId = %s', (qrUniqueId, ))
            mysql.connection.commit()
            cursor.close()
            return jsonify({'status': 'Ticket punched'})
        else:
            cursor.close()
            return jsonify({'status': 'Invalid: Ticket already used!'})
    else:
        cursor.close()
        return jsonify({'status': 'Ticket not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)