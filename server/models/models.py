from . import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __bind_key__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Product(db.Model):
    __bind_key__ = 'products'  # This model will use the 'products' database
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f"<Product {self.name}>"
    

class Client(db.Model):
    __bind_key__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    address = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<Client {self.name}>'
    
class Offer(db.Model):
    __bind_key__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    details = db.Column(db.Text, nullable=False)

    client = db.relationship('Client', backref=db.backref('offers', lazy=True))

    def __repr__(self):
        return f'<Offer for {self.client.name}>'