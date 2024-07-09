import os 
import pandas as pd
from models import db  # Import db from the models package
from flask_cors import CORS
from models.models import Product, User  # Import User from models.models
from flask import Flask, request, jsonify

app = Flask(__name__)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'instance', 'database.db')
app.config['SQLALCHEMY_BINDS'] = {
    'users': 'sqlite:///users.db',
    'products': 'sqlite:///products.db',
    'clients': 'sqlite:///clients.db'
}

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app, resources={r'/*': {'origins': '*'}})

with app.app_context():
    db.create_all()

# Routes
@app.route('/ping', methods=['GET'])
def ping_pong():
    return jsonify('pong!')

@app.route('/add_client', methods=['POST'])
def add_client():
    data = request.json
    new_client = User(name=data['name'], phone=data['phone'], address=data['address'], email=data['email'])
    db.session.add(new_client)
    db.session.commit()
    return jsonify({"message": "Client added successfully!"})

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if User.query.filter_by(username=username).first() is not None:
        return jsonify({'message': 'Username already taken'}), 400
    if User.query.filter_by(email=email).first() is not None:
        return jsonify({'message': 'Email already registered'}), 400

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': f'User {username} registered successfully!'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()

    if user and user.check_password(data.get('password')):
        return jsonify({'message': 'Login successful', 'user': user.username}), 200
    return jsonify({'message': 'Invalid username or password'}), 401


@app.route('/import', methods=['POST'])
def import_products():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        # Assuming the CSV has columns 'name' and 'price'
        # can you ignore erro in case of any
        df = pd.read_excel(file)
        df['price'] = df['price'].astype(dtype=float, errors='ignore')
        df['name'] = df['name'].astype(dtype=str, errors='ignore')
        df.dropna(inplace=True)
        df.drop_duplicates(subset=['name', 'price'], inplace=True)
        for index, row in df.iterrows():
            new_product = Product(name=row['name'], price=row['price'])
            db.session.add(new_product)
        db.session.commit()
        return jsonify({'message': 'Products imported successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/export', methods=['GET'])
def export_products():
    try:
        products_query = Product.query.all()
        # Convert query results to a pandas DataFrame
        df = pd.DataFrame([(d.name, d.price) for d in products_query], columns=['name', 'price'])
        # Convert DataFrame to CSV
        csv = df.to_csv(index=False)
        return csv, 200, {'Content-Type': 'text/csv'}
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)