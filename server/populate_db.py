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

def generate_dates():
    now = datetime.now()
    past_date = now - timedelta(days=random.randint(10, 720))
    return past_date, now

def generate_client(n):
    clients = []
    for _ in range(n):
        full_name = generate_name()
        created, modified = generate_dates()
        agent_id = random.randint(1, 100)  # Assuming agent IDs range from 1 to 10
        agent_name = "Agent " + generate_name()
        agent_email = generate_email(agent_name.split()[1])
        email = generate_email(full_name)
        phone = generate_phone()

        client = Client(
            created=created,
            modified=modified,
            agent_name=agent_name,
            agent_email=agent_email,
            full_name=full_name,
            email=email,
            phone=phone,
            agent_id=agent_id,
            notes="Random notes here",
            cif="Random CIF",
            intermediate_id=None,
            type=random.randint(1, 5),
            created_by=agent_id
        )
        clients.append(client)
    return clients

def add_clients_to_db():
    with app.app_context():
        db.session.add_all(generate_client(100))  # Generate and add 100 clients
        db.session.commit()

if __name__ == '__main__':
    add_clients_to_db()
    print('100 Clients added to database successfully!')
