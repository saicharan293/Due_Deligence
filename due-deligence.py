from flask import Flask, render_template, request, jsonify;
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Configure the PostgreSQL database
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Admin@localhost:5432/DueDeligenceDb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
class Compliance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    Category = db.Column(db.String(500), nullable=False)

# Define your categories and subcategories
categories = {
    'Electrical System': ['Electrical System', 'Transformer', 'Diesel Generator', 'Panels'],
    'Mechanical System': ['Booster pumps', 'Plumbing system'],
    'Water and Waste System': ['Storm water system', 'Sewage treatment plant', 'Water Treatment plant'],
    'Fire Protection System':['Fire Protect System', 'Chute system'],
    'Building Services and Amenities': [ 'Swimming pool'],
    'Security System': ['CCTV', 'Intercom systems']
}

# Define your options for each subcategory
options = {
    'Electrical System': ['Wiring', 'Circuit Breakers', 'Outlets'],
    'Transformer': ['Step-up', 'Step-down'],
    'Diesel Generator': ['Backup', 'Prime Power'],
    'Panels': ['Control Panel', 'Distribution Panel'],
    'Booster pumps': ['Single-Stage', 'Multistage'],
    'Plumbing system': ['Pipes', 'Fittings'],
    'Storm water system': ['Drains', 'Sump Pumps'],
    'Sewage treatment plant': ['Aeration', 'Clarifiers'],
    'Water Treatment plant': ['Filtration', 'Chlorination'],
    'Fire Protect System': ['Sprinklers', 'Fire Alarms'],
    'Chute system': ['Garbage Chute', 'Laundry Chute'],
    'Swimming pool': ['Chemical Control', 'Filtration System'],
    'CCTV': ['Surveillance Cameras', 'DVR/NVR'],
    'Intercom systems': ['Audio Intercom', 'Video Intercom']
}

@app.route('/')
def indexPage():
    return render_template('due-deligence.html')

@app.route('/get_subcategories', methods=['POST'])
def get_subcategories():
    category = request.json['category']
    subcategories = categories.get(category, [])
    return jsonify(subcategories)

@app.route('/get_options', methods=['POST'])
def get_options():
    subcategory = request.json['subcategory']
    options_list = options.get(subcategory, [])
    return jsonify(options_list)

if __name__ == '__main__':
    app.run(debug=True)
