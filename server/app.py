import os 
import io
import csv
import sqlite3
import pandas as pd
from flask_cors import CORS
from models.models import Product, User, db, Client # Import User from models.models
from flask import Flask, request, jsonify, send_file

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

# handle clients
@app.route('/clients', methods=['GET'])
def get_clients():
    page = request.args.get('page', 1, type=int)
    items_per_page = request.args.get('itemsPerPage', 10, type=int)
    search = request.args.get('search', '')
    # sort_by = request.args.get('sortBy', 'name')
    # sort_order = request.args.get('sortOrder', 'asc')
    sort_by = request.args.getlist('sortBy[0][key]', type=str)
    sort_order = request.args.getlist('sortBy[0][order]', type=str)
    print("8=============D")
    print(f"{search=} {sort_by=} {sort_order=}")
    print("8=============D") 
    # print(sort_order)
    # print(f"{page=}{items_per_page=}{sort_by=}{sort_order=}{search=}")
    # Query filtering based on search input
    query = Client.query
    if search:
        query = query.filter(Client.name.ilike(f'%{search}%') | Client.email.ilike(f'%{search}%'))
    
    # Handle sorting
    if sort_by and sort_order:
        if sort_order[0] == 'asc':
            query = query.order_by(getattr(Client, sort_by[0]).asc())
        else:
            query = query.order_by(getattr(Client, sort_by[0]).desc())
    paginated_result = query.paginate(page=page, per_page=items_per_page, error_out=False)
    clients = paginated_result.items
    print(clients)
    for client in clients:
        print(client)
    total = paginated_result.total

    return jsonify({
        'items': [{'id': c.id, 'name': c.name, 'phone': c.phone, 'address': c.address, 'email': c.email} for c in clients],
        'total': total
    })

@app.route('/clients', methods=['POST'])
def add_client():
    data = request.json
    new_client = Client(name=data['name'], phone=data['phone'], address=data['address'], email=data['email'])
    db.session.add(new_client)
    db.session.commit()
    return jsonify({'id': new_client.id, 'name': new_client.name}), 201

@app.route('/clients/<int:id>', methods=['PUT'])
def update_client(id):
    client = Client.query.get_or_404(id)
    data = request.json
    client.name = data.get('name', client.name)
    client.phone = data.get('phone', client.phone)
    client.email = data.get('email', client.email)
    client.address = data.get('address', client.address)
    db.session.commit()
    return jsonify({'id': client.id, 'name': client.name}), 200

@app.route('/clients/<int:id>', methods=['DELETE'])
def delete_client(id):
    client = Client.query.get_or_404(id)
    db.session.delete(client)
    db.session.commit()
    return jsonify({'message': 'Client deleted'}), 204

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

@app.route('/export-products', methods=['GET'])
def export_products():
    try:
        # Connect to the database
        conn = sqlite3.connect('instance/products.db')
        print(conn)
        query = "SELECT * FROM product"
        df = pd.read_sql_query(query, conn)
        conn.close()

        # Convert DataFrame to CSV
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)

        # Send the CSV file as a response
        return send_file(
            io.BytesIO(csv_buffer.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name='products.csv'
        )
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    
@app.route('/products', methods=['POST'])
def add_product():
    data = request.json
    new_product = Product(name=data['name'], price=data['price'])
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'id': new_product.id, 'name': new_product.name, 'price': new_product.price}), 201

@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted'}), 204

@app.route('/products', methods=['GET'])
def get_products():
    page = request.args.get('page', 1, type=int)
    items_per_page = request.args.get('itemsPerPage', 10, type=int)
    search = request.args.get('search', '')
    sort_by = request.args.getlist('sortBy[0][key]', type=str)
    sort_order = request.args.getlist('sortBy[0][order]', type=str)
    print(f"{search=}{sort_by=}{sort_order=}")
    # Build the initial query
    query = Product.query

    # Filter based on search term
    if search:
        query = query.filter((Product.name.like(f'%{search}%')) | (Product.description.like(f'%{search}%')))
    from sqlalchemy import func
    # Handle sorting
    if sort_by and sort_order:
        if sort_order[0] == 'asc':
            query = query.order_by(func.lower(getattr(Product, sort_by[0])).asc())
        else:
            query = query.order_by(func.lower(getattr(Product, sort_by[0])).desc())
    # Pagination
    paginated_result = query.paginate(page=page, per_page=items_per_page, error_out=False)
    # print(paginated_result)
    products = paginated_result.items
    for product in products:
        print(product)
    total = paginated_result.total

    # Prepare response
    return jsonify({
        'items': [{'id': p.id, 'name': p.name, 'price': p.price} for p in products],
        'total': total
    })

@app.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.json
    product.name = data.get('name', product.name)
    product.price = data.get('price', product.price)
    db.session.commit()
    return jsonify({'id': product.id, 'name': product.name, 'price': product.price}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)