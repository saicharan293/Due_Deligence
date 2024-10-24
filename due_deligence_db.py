from flask import Flask, render_template, request, jsonify
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


# Define Category Model
class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False)

    # Define a relationship to subcategories
    subcategories = db.relationship('Subcategory', backref='category', lazy=True)

# Define Subcategory Model
class Subcategory(db.Model):
    __tablename__ = 'subcategories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)

class Asset(db.Model):
    __tablename__ = 'assets'  # Table name in the database

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False)
    type = db.Column(db.String(100), nullable=True)

# Create the tables
with app.app_context():
    db.create_all()
    print("All tables created successfully!")

@app.route('/')
def indexPage():
    # Fetch categories
    categories = Category.query.all()
    category_names = {category.name: category.subcategories for category in categories}
    
    # Prepare subcategories for rendering
    subcategory_data = {category.name: [sub.name for sub in category.subcategories] for category in categories}

    # Fetch all assets common to all categories
    # all_assets = Asset.query.all()
    return render_template('due-deligence.html', categories=category_names, subcategories=subcategory_data)


@app.route('/get_subcategories', methods=['POST'])
def get_subcategories():
    category_name = request.json['category']
    category = Category.query.filter_by(name=category_name).first()
    subcategories = [sub.name for sub in category.subcategories] if category else []
    return jsonify(subcategories)

@app.route('/get_assets', methods=['GET','POST'])
def get_assets():
    # Asset names to check and insert if they don't exist
    asset_names = [
        'Location',
        'Snag Report',
        'Photo',
        'Action',
        'Remarks'
    ]

    # Check if assets already exist
    existing_assets = Asset.query.filter(Asset.name.in_(asset_names)).all()
    existing_asset_names = {asset.name for asset in existing_assets}

    # Insert default asset names if they don't exist
    for name in asset_names:
        if name not in existing_asset_names:
            new_asset = Asset(name=name)  
            db.session.add(new_asset)

    db.session.commit()  
    # Commit the changes to the database

    # Fetch all assets after insertion
    assets = Asset.query.all()
    # print('get_assets',assets)
    assets_data = []

    for asset in assets:
        assets_data.append({
            'id': asset.id,
            'name': asset.name,
            'type': asset.type,
        })
    # print('asset_Data',assets_data)

    return jsonify(assets_data)  # Return the asset data


from flask import jsonify, request
from sqlalchemy.exc import IntegrityError  # Import for catching integrity errors


@app.route('/add_category', methods=['POST'])
def add_category():
    data = request.json
    new_category_name = data.get('category', '').strip()  # Use .get() to avoid KeyError

    # Check if the category already exists
    existing_category = Category.query.filter_by(name=new_category_name).first()
    
    if existing_category:
        return jsonify({"message": "Category already exists!"}), 400

    # Create a new category
    new_category = Category(name=new_category_name)
    
    try:
        db.session.add(new_category)
        db.session.commit()
        return jsonify({"message": "New category added successfully!"}), 201
    except IntegrityError:
        db.session.rollback()  # Rollback the session in case of an integrity error
        return jsonify({"message": "Failed to add category due to integrity error."}), 400
    except Exception as e:
        db.session.rollback()  # Rollback the session in case of an error
        print(f"Error adding category: {str(e)}")  # Log the error for debugging
        return jsonify({"message": "Failed to add category", "error": str(e)}), 500


@app.route('/add_subcategory', methods=['POST'])
def add_subcategory():
    data = request.json
    new_subcategory_name = data['subcategory'].strip()
    category_name = data['category'].strip()

    # Check if the subcategory already exists
    existing_subcategory = Subcategory.query.filter_by(name=new_subcategory_name).first()
    
    if existing_subcategory:
        return jsonify({"message": "Subcategory already exists!"}), 400

    # Find the category id by name
    category = Category.query.filter_by(name=category_name).first()
    
    if not category:
        return jsonify({"message": "Category does not exist!"}), 404

    # Create a new subcategory
    new_subcategory = Subcategory(name=new_subcategory_name, category_id=category.id)
    db.session.add(new_subcategory)
    db.session.commit()
    
    return jsonify({"message": "New subcategory added successfully!"}), 201

@app.route('/add_asset', methods=['POST'])
def add_asset():
    data = request.json
    new_asset_name = data.get('asset', '').strip()  # Use .get() to avoid KeyError
    subcategory_name = data.get('subcategory', '').strip()

    # Check if the asset already exists
    existing_asset = Asset.query.filter_by(name=new_asset_name).first()
    
    if existing_asset:
        return jsonify({"message": "Asset already exists!"}), 400

    # Find the subcategory id by name
    subcategory = Subcategory.query.filter_by(name=subcategory_name).first()
    
    if not subcategory:
        return jsonify({"message": "Subcategory does not exist!"}), 404

    # Create a new asset
    new_asset = Asset(name=new_asset_name, subcategory_id=subcategory.id)
    
    try:
        db.session.add(new_asset)
        db.session.commit()
        return jsonify({"message": "New asset added successfully!"}), 201
    except IntegrityError:
        db.session.rollback()  # Rollback the session in case of an error
        return jsonify({"message": "Failed to save custom asset. Integrity error."}), 400
    except Exception as e:
        db.session.rollback()  # Rollback the session in case of an error
        print(f"Error saving custom asset: {str(e)}")  # Log the error for debugging
        return jsonify({"message": "Failed to save custom asset", "error": str(e)}), 500


from sqlalchemy.orm import sessionmaker

@app.route('/submit_form', methods=['POST'])
def submit_form():
    category = request.json.get('category', '').strip()
    subcategory = request.json.get('subcategory', '').strip()
    selected_assets = request.json.get('selectedAssets', [])
    print('seleceted_assets',selected_assets)
    # Create a new table name dynamically
    current_time = datetime.now().strftime("%H%M%S")  # Format: "HHMMSS"
    table_name = f"{category.replace(' ', '_')}_{subcategory.replace(' ', '_')}_{current_time}"
    # Check if the table already exists
    # Use session to ensure rollback in case of errors
    session = sessionmaker(bind=db.engine)()
    inspector = inspect(db.engine)
    if table_name in inspector.get_table_names():
        return jsonify({"message": "Table already exists!"}), 400
    else:
        try:
            # Create the new table
            column_definitions = ", ".join([f'"{asset}" VARCHAR(255)' if ' ' in asset else f"{asset} VARCHAR(255)" for asset in selected_assets])
            create_table_sql = f"""
                CREATE TABLE {table_name} (
                    id SERIAL PRIMARY KEY,
                    {column_definitions}
                )
            """
            session.execute(text(create_table_sql))
            print(f"Creating table: {table_name} and columns are {column_definitions}")

            
            session.commit()

            # Insert assets into the newly created table
            # for asset in selected_assets:
            #     session.execute(text(f"INSERT INTO {table_name} (asset_name) VALUES (:asset_name)"), {"asset_name": asset})
            # Fetch assets from the existing assets table
            return jsonify(selected_assets,table_name), 201

        except IntegrityError:
            session.rollback()  # Rollback in case of an error
            return jsonify({"message": "Failed to create table or insert assets due to integrity error."}), 400
        except Exception as e:
            session.rollback()  # Rollback in case of an error
            print(f"Error creating table or inserting assets: {str(e)}")  # Log the error for debugging
            return jsonify({"message": "Failed to create table or insert assets", "error": str(e)}), 500
        finally:
            session.close()  # Ensure session is closed

def create_table(table_name, category, subcategory):
    # Create the new table
    session = sessionmaker(bind=db.engine)()
    try:
        session.execute(text(f"""
            CREATE TABLE IF NOT EXISTS "{table_name}" (
                id SERIAL PRIMARY KEY,
                category VARCHAR(255),
                subcategory VARCHAR(255),
                asset_name VARCHAR(255) NOT NULL
            )
        """))
        print('Table created:', table_name)

        # Fetch assets from the existing assets table
        assets_query = session.execute(text("SELECT name FROM assets"))
        assets = [asset[0] for asset in assets_query]

        # print('assets are',assets)
        # Insert assets into the newly created table
        for asset in assets:
            session.execute(text(f"""
                INSERT INTO "{table_name}" (asset_name) VALUES (:asset_name)
            """), {"asset_name": asset})
        print('assets are',assets)

        # Insert the category and subcategory into the first row
        session.execute(text(f"""
            UPDATE "{table_name}" 
            SET category = :category, subcategory = :subcategory
            WHERE id = (SELECT MIN(id) FROM "{table_name}")
        """), {"category": category, "subcategory": subcategory})

        print('2 assets are',assets)

        session.commit()
        return jsonify(assets), 201

    except IntegrityError:
        session.rollback()  # Rollback in case of an error
        return jsonify({"message": "Failed to create table or insert assets due to integrity error."}), 400
    except Exception as e:
        session.rollback()  # Rollback in case of an error
        print(f"Error creating table or inserting assets: {str(e)}")  # Log the error for debugging
        return jsonify({"message": "Failed to create table or insert assets", "error": str(e)}), 500
    finally:
        session.close()  # Ensure session is closed

@app.route('/save_row_data', methods=['POST'])
def save_row_data():
    data = request.json
    table_name = data.get('tableName')
    row_data = data.get('rowData')
    print('table name is ', table_name, 'and row data is ', row_data)

    # Construct the SQL insert statement
    # Use double quotes for column names to handle spaces
    columns = ', '.join([f'{key}' for key in row_data.keys()])  # Double quotes for column names
    values = ', '.join([f"'{value}'" for value in row_data.values()])  # Use single quotes for string values
    print('columns are', columns, 'values are', values)

    # Create the insert SQL query
    insert_sql = f"INSERT INTO {table_name} ({columns}) VALUES ({values})"

    # Execute the insert statement
    session = sessionmaker(bind=db.engine)()
    try:
        session.execute(text(insert_sql))
        session.commit()
        print('success message')
        return jsonify({"success": True}), 201
    except Exception as e:
        session.rollback()
        print('failed insert:', e)  # Log the error message
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        session.close()

@app.route('/delete_row', methods=['DELETE'])
def delete_row():
    data = request.json
    row_id = data.get('id')  # Get the row ID from the request

    if not row_id:
        return jsonify({"success": False, "message": "Row ID is required"}), 400

    # Replace 'your_table_name' with the actual table name you want to delete from
    table_name = data.get('tableName')
    
    # Construct the SQL delete statement
    delete_sql = f"DELETE FROM {table_name} WHERE id = :id"

    # Execute the delete statement
    session = sessionmaker(bind=db.engine)()
    try:
        session.execute(text(delete_sql), {"id": row_id})
        session.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        session.close()


if __name__ == '__main__':
    app.run(debug=True)