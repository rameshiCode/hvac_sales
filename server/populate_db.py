import random
from models.models import Product, db
from app import app  # Make sure to import the Flask app

# Function to populate the database with dummy products
def populate_db(num_entries=100):
    with app.app_context():
        # Clear existing products
        db.session.query(Product).delete()
        
        # Sample data
        categories = ['Pompe de Caldura', 'Instalatii Sanitare', 'Ventilatie']
        subcategories = ['Main', 'Complementary']
        
        # Generate dummy products
        for i in range(num_entries):
            product = Product(
                name=f'Product_{i+1}',
                price=round(random.uniform(10, 1000), 2),
                category=random.choice(categories),
                subcategory=random.choice(subcategories),
                area=random.randint(1, 100)
            )
            db.session.add(product)
        
        # Commit the changes to the database
        db.session.commit()
        print(f"Added {num_entries} dummy products to the database.")

if __name__ == "__main__":
    populate_db()
