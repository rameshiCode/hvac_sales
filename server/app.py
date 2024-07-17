import csv
import io
import os
import sqlite3

import pandas as pd
import pdfkit
from dotenv import load_dotenv
from flask import (Flask, Request, jsonify, make_response, redirect,
                   render_template, render_template_string, request, send_file,
                   session, url_for)
from flask_cors import CORS
from flask_mail import Mail, Message
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from models.models import Client, Product, db
from sqlalchemy import func

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

load_dotenv()  # This loads the environment variables from .env file

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')  # Load secret key from environment variable

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'instance', 'clients.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

with app.app_context():
    db.create_all()

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
mail = Mail(app)

SCOPES = ['https://www.googleapis.com/auth/gmail.send']
CLIENT_SECRETS_FILE = 'client_secret_410792550420-qet9eepo4ih2quir69palk19kc3mutgh.apps.googleusercontent.com.json'


@app.route('/send_offer', methods=['POST'])
def send_offer():
    data = request.json
    recipient_email = data.get('clientEmail')
    products = data.get('products')
    discount = data.get('overallDiscount', 0)    
    discount = 0 if discount == '' else float(discount)
    # client
    client_id = data.get('clientId')
    client_name = Client.query.get_or_404(client_id)
    client = {'id': client_id, 'name': str(client_name.name).title()}
    print('8============D')
    print(f"{discount=} {client_name=}")
    print('8============D')
    
    for product in products:
        product_discount = product["discount"]
        product_discount = 0.0 if product_discount == '' else float(product_discount)
        product["price"] = float(product["price"])
        product['discount'] = product_discount
        product['total_price'] = round(product["quantity"] * product["price"], 2)
        product['final_price'] = round(product['total_price'] * (1 - (float(product_discount) / 100)), 2)
    
    total_price, final_price = calculate_final_price(products, discount)

    # Render the HTML template with data
    html = render_template(
        'offer_template.html', 
        client=client, 
        products=products, 
        total_price=total_price,
        final_price=final_price,
        overall_discount=discount,
    )

    msg = Message("Your Special Offer", sender=app.config['MAIL_USERNAME'], recipients=[recipient_email])
    msg.html = html  # Set the email content to the rendered HTML
    mail.send(msg)
    
    return jsonify({"status": "Email sent successfully!"})

def calculate_final_price(products, overall_discount):
    # Implement your logic to calculate the final price after applying the overall discount
    total_price = sum(p['price'] for p in products)
    final_price = total_price * (1 - float(overall_discount) / 100)
    return round(total_price, 2), round(final_price, 2)

# with app.open_resource("image.png") as fp:
#     msg.attach("image.png", "image/png", fp.read())

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
    sort_by = request.args.getlist('sortBy[0][key]', type=str)
    sort_order = request.args.getlist('sortBy[0][order]', type=str)
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
    total = paginated_result.total

    return jsonify({
        'items': [{'id': c.id, 'name': c.name, 'phone': c.phone, 'address': c.address, 'email': c.email} for c in clients],
        'total': total
    })

@app.route('/clients', methods=['POST'])
def add_client():
    data = request.json
    new_client = Client(name=data['name'], phone=data['phone'], address=data['address'], email=data['email'])
    print(new_client)
    db.session.add(new_client)
    db.session.commit()
    return jsonify({'id': new_client.id, 'name': new_client.name, 'email': new_client.email}), 201

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

@app.route('/import', methods=['POST'])
def import_products():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
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

@app.route('/products', methods=['GET'])
def get_products():
    try:
        # Retrieve query parameters
        page = request.args.get('page', 1, type=int)
        items_per_page = request.args.get('itemsPerPage', 10, type=int)
        search = request.args.get('search', '')
        sort_by = request.args.getlist('sortBy[0][key]', type=str)
        sort_order = request.args.getlist('sortBy[0][order]', type=str)

        # Build the initial query
        query = Product.query

        # Filter based on search term
        if search:
            query = query.filter(Product.name.ilike(f'%{search}%'))

        # Handle sorting
        if sort_by and sort_order:
            if sort_order[0] == 'asc':
                query = query.order_by(func.lower(getattr(Product, sort_by[0])).asc())
            else:
                query = query.order_by(func.lower(getattr(Product, sort_by[0])).desc())

        # Pagination
        paginated_result = query.paginate(page=page, per_page=items_per_page, error_out=False)
        products = paginated_result.items
        total = paginated_result.total

        # Prepare response
        response = {
            'items': [{'id': p.id, 'name': p.name, 'price': p.price} for p in products],
            'total': total
        }

        return jsonify(response)  # Ensure this line is included to return the JSON response
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'An error occurred'}), 500

@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted'}), 204

@app.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.json
    product.name = data.get('name', product.name)
    product.price = data.get('price', product.price)
    db.session.commit()
    return jsonify({'id': product.id, 'name': product.name, 'price': product.price}), 200



# Generate PDF
config = pdfkit.configuration(wkhtmltopdf='/usr/bin/wkhtmltopdf')
@app.route('/create-pdf')
def create_pdf():
    # HTML content
    html_content = render_template_string('<h1>Welcome to PDF Generation</h1>')
    # Generate PDF
    pdf = pdfkit.from_string(html_content, False, configuration=config)
    # Send the generated PDF as a response
    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=generated.pdf'
    return response

@app.route('/generate-offer', methods=['POST'])
def generate_offer():
    action = request.args.get('action', 'download')  # Get action type, default is 'download'
    data = request.get_json()
    client_id = data['clientId']
    overall_discount = float(data.get('overallDiscount', 0))
    selected_products = data['products']

    # Fetch client details
    client = Client.query.get_or_404(client_id)

    # Calculate final price for each product and the total price
    for product in selected_products:
        product['final_price'] = (product['price'] * (1 - (float(product['discount']) / 100))) * product['quantity']
    total_price = sum(p['final_price'] for p in selected_products)
    final_price_after_overall_discount = total_price * (1 - (overall_discount / 100))

    # Render the HTML template with data
    rendered = render_template('offer_template.html', client=client, products=selected_products, total_price=total_price, overall_discount=overall_discount, final_price_after_overall_discount=final_price_after_overall_discount)
    
    # Convert HTML to PDF
    pdf = pdfkit.from_string(rendered, False)

    if action == 'email':
        subject = f"Offer for {client.name}"
        recipients = [client.email]
        message = Message(subject, recipients=recipients, body="Please find attached the offer.")
        message.attach("offer.pdf", "application/pdf", pdf)
        mail.send(message)
        return jsonify({"message": "Offer sent successfully!"}), 200
    else:
        response = make_response(pdf)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = 'attachment; filename=offer.pdf'
        return response


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)