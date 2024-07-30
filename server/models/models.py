import json
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
    email = db.Column(db.String(100), nullable=False, unique=True)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.String(200), nullable=True)
    offers = db.relationship('Offer', back_populates='client', cascade="all, delete-orphan")
    notes = db.Column(db.Text, nullable=True)  # Add this line
    category_offers = db.relationship('CategoryOffer', back_populates='client', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Client {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'notes': self.notes  # Add this line
        }

class Offer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    category_offer_id = db.Column(db.Integer, db.ForeignKey('category_offer.id'), nullable=False)  # Foreign key for the CategoryOffer
    offer_type = db.Column(db.String(50), nullable=False)
    products_details = db.Column(db.Text, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    final_price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    client = db.relationship('Client', back_populates='offers')
    category_offer = db.relationship('CategoryOffer', back_populates='offers')

    def __repr__(self):
        return f'<Offer for {self.client.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'category_offer_id': self.category_offer_id,  # Include the category_offer_id in the dict
            'offer_type': self.offer_type,
            'products_details': self.products_details,
            'total_price': self.total_price,
            'final_price': self.final_price,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'client_name': self.client.name
        }

class CategoryOffer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    category_name = db.Column(db.String(100), nullable=False)
    final_price = db.Column(db.Float, nullable=True, default=0)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    client = db.relationship('Client', back_populates='category_offers')
    offers = db.relationship('Offer', back_populates='category_offer', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'category_name': self.category_name,
            'final_price': self.final_price,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }



Client.offers = db.relationship('Offer', order_by=Offer.id, back_populates='client')
