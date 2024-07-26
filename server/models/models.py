from . import db
# from werkzeug.security import generate_password_hash, check_password_hash

# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(80), unique=True, nullable=False)
#     email = db.Column(db.String(120), unique=True, nullable=False)
#     password_hash = db.Column(db.String(128))

#     def set_password(self, password):
#         self.password_hash = generate_password_hash(password)

#     def check_password(self, password):
#         return check_password_hash(self.password_hash, password)

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(255), nullable=True)
    subcategory = db.Column(db.String(255), nullable=True)
    area = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return f"<Product {self.name}>"

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'category': self.category,
            'subcategory': self.subcategory,
            'area': self.area
        }


class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    address = db.Column(db.String(200), nullable=False)
    offers = db.relationship('Offer', back_populates='client')

    def __repr__(self):
        return f'<Client {self.name}>'

class Offer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    offer_type = db.Column(db.String(50), nullable=False)  # Add this line
    products_details = db.Column(db.Text, nullable=False)  # JSON storing product details
    total_price = db.Column(db.Float, nullable=False)
    final_price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    client = db.relationship('Client', back_populates='offers')

    def __repr__(self):
        return f'<Offer for {self.client.name}>'

    def to_dict(self):
        """Return a dictionary representation of an Offer."""
        return {
            'id': self.id,
            'client_id': self.client_id,
            'offer_type': self.offer_type,
            'products_details': self.products_details,
            'total_price': self.total_price,
            'final_price': self.final_price,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'client_name': self.client.name  # Assuming client is always present; adjust if nullable
        }


Client.offers = db.relationship('Offer', order_by=Offer.id, back_populates='client')
