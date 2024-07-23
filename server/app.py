from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
# from flask_jwt_extended import (
#     JWTManager,
#     create_access_token,
#     get_jwt_identity,
#     jwt_required,
# )
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
  pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
# app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this in production!
# jwt = JWTManager(app)
app.config.from_object(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db.init_app(app)

class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime)
    modified = db.Column(db.DateTime)
    agent_name = db.Column(db.String(120))
    agent_email = db.Column(db.String(120))
    full_name = db.Column(db.String(120))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    agent_id = db.Column(db.Integer)
    notes = db.Column(db.Text)
    cif = db.Column(db.String(50))
    intermediate_id = db.Column(db.Integer, nullable=True)
    type = db.Column(db.Integer)
    created_by = db.Column(db.Integer)

    def __repr__(self):
        return f'<Client {self.full_name}>'
        
    def to_dict(self):
        return {
            "id": self.id,
            "created": self.created.isoformat(),
            "modified": self.modified.isoformat(),
            "agent_name": self.agent_name,
            "agent_email": self.agent_email,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "agent_id": self.agent_id,
            "notes": self.notes,
            "cif": self.cif,
            "intermediate_id": self.intermediate_id,
            "type": self.type,
            "created_by": self.created_by
        }

# enable CORS
CORS(app, resources={r'/*': {'origins': '*'}})

with app.app_context():
    db.create_all()

# sanity check route
@app.route('/ping', methods=['GET'])
def ping_pong():
    return jsonify('Pong!')

@app.route('/clients/')
def get_clients():
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 25, type=int)
    query = Client.query

    # Implement basic filtering if needed
    # filters = request.args.get('filters')  # Example: filters could be used here

    pagination = query.paginate(page=page, per_page=page_size, error_out=False)
    clients = [client.to_dict() for client in pagination.items]

    next_url = None
    if pagination.has_next:
        next_url = f'/api/clients/?page={page + 1}&page_size={page_size}'

    previous_url = None
    if pagination.has_prev:
        previous_url = f'/api/clients/?page={page - 1}&page_size={page_size}'

    return jsonify({
        'count': pagination.total,
        'next': next_url,
        'previous': previous_url,
        'results': clients
    })


# @app.route('/clientsaa/')
# def get_clients():
#     print(request.args)
#     page = request.args.get('page', 1, type=int)
#     page_size = request.args.get('page_size', 25, type=int)
#     query = Client.query

#     # Example of simple sorting (extend it as per your frontend requirements)
#     sort = request.args.get('sort', 'id')
#     direction = request.args.get('direction', 'asc')
#     if direction == 'desc':
#         query = query.order_by(db.desc(getattr(Client, sort)))
#     else:
#         query = query.order_by(getattr(Client, sort))

#     # Pagination
#     pagination = query.paginate(page=page, per_page=page_size, error_out=False)
#     clients = pagination.items
#     total = pagination.total

#     return jsonify({
#         'count': total,
#         'results': [client.to_dict() for client in clients],
#     })

@app.route('/api/clients/', methods=['POST'])
def add_client():
    data = request.json
    new_client = Client(
        name=data['name'],
        agent_id=data['agent_id'],
        email=data.get('email'),
        phone=data.get('phone'),
        type=data['type'],
        modified=datetime.now()
    )
    db.session.add(new_client)
    db.session.commit()
    return jsonify(new_client.to_dict()), 201


# @app.route('/login', methods=['POST'])
# def login():
#     username = request.json.get('username', None)
#     password = request.json.get('password', None)
    
#     # This should check credentials against your user database
#     if username == "admin" and password == "secret":
#         # Create token
#         access_token = create_access_token(identity=username)
#         return jsonify(access_token=access_token), 200
#     return jsonify({"msg": "Bad username or password"}), 401

# @app.route('/protected', methods=['GET'])
# @jwt_required()
# def protected():
#     # Access the identity of the current user with get_jwt_identity
#     current_user = get_jwt_identity()
#     return jsonify(logged_in_as=current_user), 200


# @app.route('/add_client', methods=['POST'])
# def add_client():
#     data = request.json
#     new_client = Client(name=data['name'], phone=data['phone'], address=data['address'], email=data['email'])
#     db.session.add(new_client)
#     db.session.commit()
#     return jsonify({"message": "Client added successfully!"})


# # Dummy data for demonstration
# offers = [
#     {"id": 1, "name": "Offer One", "detail": "Details of Offer One"},
#     {"id": 2, "name": "Offer Two", "detail": "Details of Offer Two"}
# ]

# @app.route('/offers', methods=['GET'])
# def get_offers():
#     return jsonify(offers)

# @app.route('/offers', methods=['POST'])
# def create_offer():
#     new_offer = request.json
#     offers.append(new_offer)
#     return jsonify(new_offer), 201

# @app.route('/offers/<int:offer_id>', methods=['PUT'])
# def update_offer(offer_id):
#     offer = next((o for o in offers if o['id'] == offer_id), None)
#     if not offer:
#         return jsonify({'message': 'Offer not found'}), 404
#     offer.update(request.json)
#     return jsonify(offer)

# @app.route('/offers/<int:offer_id>', methods=['DELETE'])
# def delete_offer(offer_id):
#     global offers
#     offers = [o for o in offers if o['id'] != offer_id]
#     return jsonify({'message': 'Offer deleted'})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

