from flask import Flask, render_template, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
import psycopg2
from flask_cors import CORS
from sqlalchemy import text,inspect
from sqlalchemy.exc import IntegrityError
from datetime import datetime


app = Flask(__name__)
CORS(app)

# Configure the PostgreSQL database
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Admin@localhost:5432/DueDeligenceDb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Function to create the database if it doesn't exist
def create_database():
    conn = psycopg2.connect(dbname='postgres', user='postgres',port=5432, password='Admin', host='localhost')
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'DueDeligenceDb'")
    exists = cursor.fetchone()
    
    # cursor.execute('DROP DATABASE "DueDeligenceDb"') 
    if not exists:
        cursor.execute('CREATE DATABASE "DueDeligenceDb"')
        print("Database 'DueDeligenceDb' created!")
    
    cursor.close()
    conn.close()

create_database()

global_table_data=None
@app.route('/')
def indexPage():
    return render_template('revised_due_deligence.html')

app.secret_key = 'your_secret_key' 
from flask import session

@app.route('/submit-table-data', methods=['POST'])
def submit_table_data():
    data = request.json
    table_data = data.get('tableData')
    
    # Store the table data in the session
    session['table_data'] = table_data

    # Print received table data for debugging
    print('Received table data:', session['table_data'])

    # Return a JSON response with the redirect URL
    return jsonify({'redirect': url_for('due_deligence')})

@app.route('/due-deligence')
def due_deligence():
    return render_template( 'due-deligence.html')

@app.route('/get-table-data', methods=['GET'])
def get_table_data():
    table_data = session.get('table_data', [])
    return jsonify(table_data)

if __name__ == '__main__':
    app.run(debug=True)