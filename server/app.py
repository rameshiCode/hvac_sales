import io
import json
import os
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from flask import (
    Flask,
    Response,
    jsonify,
    make_response,
    render_template,
    render_template_string,
    request,
    send_file,
)
from flask_cors import CORS
from flask_mail import Mail, Message

from models.models import Client, Offer, Product, CategoryOffer, db
from sqlalchemy import func
from werkzeug.utils import secure_filename
from flask_migrate import Migrate


load_dotenv()
app = Flask(__name__)
migrate = Migrate(app, db)
CORS(app)
mail = Mail(app)

# mail conf
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.getenv('SECRET_KEY')
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

# db conf
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'instance', 'clients.db')
app.config['UPLOAD_FOLDER'] = Path(__file__).resolve().parent / 'uploads'
app.config['UPLOAD_FOLDER'].mkdir(parents=True, exist_ok=True)
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/ping', methods=['GET'])
def ping_pong():
    return jsonify('pong!')

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
    return jsonify({'message': 'Client and related data deleted'}), 204


@app.route('/import', methods=['POST'])
def import_products():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        df = pd.read_csv(filepath)
        df['price'] = df['price'].replace(r'[^\d.]', '', regex=True).astype(float)
        for _, row in df.iterrows():
            product = Product(
                name=row['name'],
                price=row['price'],
                category=row.get('category', None),
                subcategory=row.get('subcategory', None),
                area=row.get('area', None)
            )
            db.session.add(product)
        db.session.commit()
        os.remove(filepath)
        return jsonify({'message': 'File imported successfully'}), 200

    return jsonify({'error': 'Invalid file'}), 400

@app.route('/export', methods=['GET'])
def export_products():
    products = Product.query.all()
    product_list = [product.to_dict() for product in products]

    df = pd.DataFrame(product_list)
    csv = df.to_csv(index=False)

    return Response(
        csv,
        mimetype="text/csv",
        headers={"Content-disposition":"attachment; filename=products.csv"}
    )

@app.route('/products', methods=['POST'])
def add_product():
    data = request.json
    print(f"Received data: {data}")
    new_product = Product(
        name=data['name'],
        price=data['price'],
        category=data.get('category', ''),
        area=data.get('area', 0)
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({
        'id': new_product.id,
        'name': new_product.name,
        'price': new_product.price,
        'category': new_product.category,
        'subcategory': new_product.subcategory,
        'area': new_product.area
    }), 201

@app.route('/products', methods=['GET'])
def get_products():
    try:
        page = request.args.get('page', 1, type=int)
        items_per_page = request.args.get('itemsPerPage', 10, type=int)
        search = request.args.get('search', '')
        area_filter = request.args.get('area', type=int)
        category_filter = request.args.get('category', '')
        sort_by = request.args.get('sortBy', 'name')
        sort_order = request.args.get('sortOrder', 'asc')

        query = Product.query

        if search:
            query = query.filter(Product.name.ilike(f'%{search}%'))
        if area_filter:
            query = query.filter(Product.area == area_filter)
        if category_filter:
            query = query.filter(Product.category.ilike(f'%{category_filter}%'))
        if sort_order == 'asc':
            query = query.order_by(func.lower(getattr(Product, sort_by)).asc())
        else:
            query = query.order_by(func.lower(getattr(Product, sort_by)).desc())

        paginated_result = query.paginate(page=page, per_page=items_per_page, error_out=False)
        products = paginated_result.items
        total = paginated_result.total
        response = {
            'items': [p.to_dict() for p in products if p is not None],
            'total': total
        }
        return jsonify(response)
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
    try:
        # Get action type, default is 'download'
        action = request.args.get('action', 'download')
        data = request.get_json()
        client_id = data['clientId']
        recipient_email = data.get('clientEmail')  # Only used if action is 'email'

        # Handle empty or invalid overallDiscount
        overall_discount = data.get('overallDiscount', '')
        try:
            overall_discount = float(overall_discount) if overall_discount else 0
        except ValueError:
            return jsonify({"error": "Invalid overall discount value"}), 400

        selected_products = data['products']

        # Fetch client details
        client = Client.query.get_or_404(client_id)

        # Calculate final price for each product and the total price
        total_price = 0
        for product in selected_products:
            try:
                discount = float(product.get('discount', ''))
            except ValueError:
                discount = 0

            product['pretTotal'] = round(product['price'] * product['quantity'], 2)
            product['pretRedus'] = round(product['pretTotal'] * (1 - (discount / 100)), 2)
            total_price += product['pretRedus']

        final_price_after_overall_discount = total_price * (1 - (overall_discount / 100))

        # Render the HTML template with data
        rendered = render_template(
            'offer_template.html',
            client=client,
            products=selected_products,
            total_price=total_price,
            final_price_after_overall_discount=final_price_after_overall_discount,
            overall_discount=overall_discount
        )

        # Convert HTML to PDF
        try:
            pdf = pdfkit.from_string(rendered, False, configuration=pdfkit_config)
        except Exception as e:
            print(f"PDF generation error: {e}")
            return jsonify({"error": "Failed to generate PDF: " + str(e)}), 500

        if action == 'email':
            if not recipient_email:
                return jsonify({"error": "Recipient email is required for sending"}), 400
            subject = f"Offer for {client.name}"
            recipients = [recipient_email]
            message = Message(subject, sender=app.config['MAIL_USERNAME'], recipients=recipients, body="Please find attached the offer.")
            message.attach("offer.pdf", "application/pdf", pdf)
            try:
                mail.send(message)
                return jsonify({"message": "Offer sent successfully!"}), 200
            except Exception as e:
                print(f"Email sending error: {e}")
                return jsonify({"error": "Failed to send email: " + str(e)}), 500
        else:
            response = make_response(pdf)
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'attachment; filename=offer.pdf'
            return response
    except Exception as e:
        print(f"General error: {e}")
        return jsonify({"error": "An unexpected error occurred: " + str(e)}), 500

@app.route('/clients/<int:client_id>/offers', methods=['GET'])
def get_client_offers(client_id):
    offers = Offer.query.filter_by(client_id=client_id).all()
    return jsonify([offer.to_dict() for offer in offers]), 200 

@app.route('/clients/<int:client_id>/category-offers', methods=['GET'])
def get_client_category_offers(client_id):
    client = Client.query.get_or_404(client_id)
    category_offers = CategoryOffer.query.filter_by(client_id=client.id).all()
    return jsonify([category_offer.to_dict() for category_offer in category_offers]), 200

@app.route('/offers/<int:offer_id>', methods=['GET'])
def get_offer(offer_id):
    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({'error': 'Offer not found'}), 404

    offer_details = offer.to_dict()

    # Ensure products_details is a JSON array string
    try:
        products_details = json.loads(offer.products_details)
        if not isinstance(products_details, list):
            raise ValueError('products_details is not a list')
        offer_details['products_details'] = products_details
    except Exception as e:
        return jsonify({'error': 'Failed to parse products_details', 'details': str(e)}), 500

    selected_category = request.args.get('category')
    if selected_category:
        products = Product.query.filter_by(category=selected_category).all()
        products_list = [product.to_dict() for product in products]
        offer_details['category_products'] = products_list

    return jsonify(offer_details), 200

@app.route('/clients/<int:client_id>', methods=['GET'])
def get_client(client_id):
    client = Client.query.get_or_404(client_id)
    return jsonify({
        'id': client.id,
        'name': client.name,
        'email': client.email,
        'phone': client.phone,
        'address': client.address
    }), 200

@app.route('/offers/<int:offer_id>/download', methods=['GET'])
def download_offer(offer_id):
    offer = Offer.query.get_or_404(offer_id)
    details = json.loads(offer.details)

    rendered = render_template(
        'offer_template.html',
        client=Client.query.get_or_404(details['client']),
        products=details['products'],
        total_price=details['total_price'],
        final_price_after_overall_discount=details['final_price_after_overall_discount'],
        overall_discount=details['overall_discount']
    )

    pdf = pdfkit.from_string(rendered, False, configuration=pdfkit_config)

    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=offer_{offer_id}.pdf'
    return response

@app.route('/offers', methods=['POST'])
def create_offer():
    data = request.get_json()
    print("Received offer data:", data)

    # Check if the CategoryOffer exists
    category_offer = CategoryOffer.query.filter_by(client_id=data['clientId'], category_name=data['categoryName']).first()
    if not category_offer:
        category_offer = CategoryOffer(
            client_id=data['clientId'],
            category_name=data['categoryName']
        )
        db.session.add(category_offer)
        db.session.commit()

    try:
        new_offer = Offer(
            client_id=data['clientId'],
            offer_type=data['offerType'], 
            products_details=json.dumps(data['products']),
            total_price=data['totalPrice'],
            final_price=data['finalPrice'],
            category_offer_id=category_offer.id  # Link to the new CategoryOffer
        )
        db.session.add(new_offer)
        db.session.commit()
        print("Offer created successfully:", new_offer)
        return jsonify(new_offer.to_dict()), 201
    except KeyError as e:
        print(f"Missing key: {str(e)}")
        return jsonify({'error': f'Missing key: {str(e)}'}), 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/offers/<int:offer_id>', methods=['PUT'])
def update_offer(offer_id):
    data = request.get_json()
    offer = Offer.query.get_or_404(offer_id)
    
    # Fetch or create the CategoryOffer object
    category_offer = CategoryOffer.query.filter_by(client_id=data['clientId'], category_name=data['categoryName']).first()
    if not category_offer:
        category_offer = CategoryOffer(client_id=data['clientId'], category_name=data['categoryName'])
        db.session.add(category_offer)
        db.session.commit()

    try:
        offer.offer_type = data['offerType']
        offer.products_details = json.dumps(data['products'])
        offer.total_price = data['totalPrice']
        offer.final_price = data['finalPrice']
        offer.category_offer_id = category_offer.id  # Link to the CategoryOffer
        db.session.commit()
        return jsonify(offer.to_dict()), 200
    except KeyError as e:
        print(f"Missing key: {str(e)}")
        return jsonify({'error': f'Missing key: {str(e)}'}), 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# handle offer list for big offer to small offer

@app.route('/category-offers/<int:category_offer_id>/offers', methods=['GET'])
def get_category_offers(category_offer_id):
    category_offer = CategoryOffer.query.get_or_404(category_offer_id)
    offers = Offer.query.filter_by(category_offer_id=category_offer.id).all()
    return jsonify([offer.to_dict() for offer in offers]), 200

@app.route('/category-offers', methods=['POST'])
def create_category_offer():
    data = request.get_json()
    final_price = data.get('finalPrice', 0)  # Provide a default value if finalPrice is not provided

    new_category_offer = CategoryOffer(
        client_id=data['clientId'],
        category_name=data['categoryName'],
        final_price=final_price  # Set the final price
    )
    db.session.add(new_category_offer)
    db.session.commit()
    
    for offer_data in data['offers']:
        new_offer = Offer(
            client_id=new_category_offer.client_id,
            offer_type=offer_data['offerType'],
            products_details=json.dumps(offer_data['products']),
            total_price=offer_data['totalPrice'],
            final_price=offer_data['finalPrice'],
            category_offer_id=new_category_offer.id  # Add this line to link offers
        )
        db.session.add(new_offer)
    db.session.commit()
    
    return jsonify(new_category_offer.to_dict()), 201

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
