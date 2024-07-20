import random
from datetime import datetime, timedelta

from app import Client, app, db


def generate_name():
    first_names = ["Alice", "Bob", "Charlie", "David", "Eve", "Fiona", "George", "Hannah", "Ian", "Jenny"]
    last_names = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor"]
    return random.choice(first_names) + " " + random.choice(last_names)

def generate_email(name):
    domains = ["example.com", "demo.net", "sample.org", "test.edu"]
    name_parts = name.lower().replace(" ", ".")
    return f"{name_parts}@{random.choice(domains)}"

def generate_phone():
    return f"+1{random.randint(1000000000, 9999999999)}"

def generate_type():
    types = ["Regular", "VIP", "Enterprise", "Non-Profit", "Government"]
    return random.choice(types)

def generate_modified_date():
    start_date = datetime.now() - timedelta(days=365)
    end_date = datetime.now()
    return start_date + (end_date - start_date) * random.random()

def generate_clients(n):
    clients = []
    for _ in range(n):
        name = generate_name()
        client_type = generate_type()
        agent_id = random.randint(1, 5)  # Assuming agent IDs range from 1 to 5
        email = generate_email(name)
        phone = generate_phone()
        modified = generate_modified_date()

        client = Client(
            name=name,
            agent_id=agent_id,
            email=email,
            phone=phone,
            type=client_type,
            modified=modified
        )
        clients.append(client)
    return clients

def add_clients_to_db():
    with app.app_context():
        db.session.add_all(generate_clients(100))  # Generate and add 100 clients
        db.session.commit()

if __name__ == '__main__':
    add_clients_to_db()
    print('100 Clients added to database successfully!')
