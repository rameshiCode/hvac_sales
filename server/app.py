from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
  pass

db = SQLAlchemy(model_class=Base)
# instantiate the app
app = Flask(__name__)
app.config.from_object(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db.init_app(app)

class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    email = db.Column(db.String(100))
    

# enable CORS
CORS(app, resources={r'/*': {'origins': '*'}})

with app.app_context():
    db.create_all()

# sanity check route
@app.route('/ping', methods=['GET'])
def ping_pong():
    return jsonify('pong!')

@app.route('/add_client', methods=['POST'])
def add_client():
    data = request.json
    new_client = Client(name=data['name'], phone=data['phone'], address=data['address'], email=data['email'])
    db.session.add(new_client)
    db.session.commit()
    return jsonify({"message": "Client added successfully!"})

if __name__ == '__main__':
    app.run(debug=True)
