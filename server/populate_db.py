# import sys
# from pathlib import Path

# sys.path.append(str(Path(__file__).resolve().parent.parent))
from app import app, db
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from models.models import Client, Offer, Product


def add_products():
    products = [
        Product(name="Laptop", price=999.99),
        Product(name="Smartphone", price=299.99),
        Product(name="Tablet", price=199.99),
        Product(name="Monitor", price=149.99),
        Product(name="Keyboard", price=29.99),
        Product(name="Mouse", price=19.99),
        Product(name="Printer", price=89.99),
        Product(name="Headphones", price=59.99),
        Product(name="Webcam", price=39.99),
        Product(name="Desk Lamp", price=49.99)
    ]
    for product in products:
        db.session.add(product)

def add_clients():
    clients = [
        Client(name="Alice Johnson", phone="123-456-7890", email="alice@example.com", address="123 Maple Street"),
        Client(name="Bob Smith", phone="234-567-8901", email="bob@example.com", address="456 Oak Street"),
        Client(name="Carol White", phone="345-678-9012", email="carol@example.com", address="789 Pine Street"),
        Client(name="David Brown", phone="456-789-0123", email="david@example.com", address="321 Birch Street"),
        Client(name="Eve Davis", phone="567-890-1234", email="eve@example.com", address="654 Palm Street"),
        Client(name="Frank Miller", phone="678-901-2345", email="frank@example.com", address="987 Cedar Street"),
        Client(name="Grace Lee", phone="789-012-3456", email="grace@example.com", address="210 Elm Street"),
        Client(name="Henry Wilson", phone="890-123-4567", email="henry@example.com", address="321 Spruce Street"),
        Client(name="Irene Taylor", phone="901-234-5678", email="irene@example.com", address="432 Willow Street"),
        Client(name="Jake Scott", phone="012-345-6789", email="jake@example.com", address="543 Fir Street")
    ]
    for client in clients:
        db.session.add(client)

def add_offers():
    for i in range(1, 11):
        offer = Offer(client_id=i, details=f"Special offer {i * 5}% off!")
        db.session.add(offer)

def populate_database():
    add_products()
    add_clients()
    add_offers()
    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.drop_all()  # Drop all tables first
        db.create_all()  # Create fresh tables
        populate_database()
        print("Database populated with hardcoded dummy data!")

