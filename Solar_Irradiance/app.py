from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
import json
from bson import json_util, ObjectId

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/city_db"
mongo = PyMongo(app)
db = mongo.db

@app.route("/")
def home_page():
    online_users = db.solar_c.find({"city": "Perth"})
    page_sanitized = json.loads(json_util.dumps(online_users))
    # return render_template("index.html",
    #     online_users=online_users)
    return jsonify(page_sanitized)
    # return jsonify([todo for todo in online_users])

# app = Flask(__name__)
# app.config['MONGODB_SETTINGS'] = {
#     'db': 'Project3',
#     'host': 'localhost',
#     'port': 27017
# }
# db = MongoEngine()
# db.init_app(app)

# class User(db.solar_city):
#     city = db.StringField()
#     def to_json(self):
#         return {"city": self.city}

# @app.route('/', methods=['GET'])
# def query_records():
#     city = request.args.get('city')
#     user = User.objects(city=city).first()
#     if not user:
#         return jsonify({'error': 'data not found'})
#     else:
#         return jsonify(user.to_json())

# @app.route('/', methods=['PUT'])
# def create_record():
#     record = json.loads(request.data)
#     user = User(name=record['name'],
#                 email=record['email'])
#     user.save()
#     return jsonify(user.to_json())

# @app.route('/', methods=['POST'])
# def update_record():
#     record = json.loads(request.data)
#     user = User.objects(name=record['name']).first()
#     if not user:
#         return jsonify({'error': 'data not found'})
#     else:
#         user.update(email=record['email'])
#     return jsonify(user.to_json())

# @app.route('/', methods=['DELETE'])
# def delete_record():
#     record = json.loads(request.data)
#     user = User.objects(name=record['name']).first()
#     if not user:
#         return jsonify({'error': 'data not found'})
#     else:
#         user.delete()
#     return jsonify(user.to_json())

if __name__ == "__main__":
    app.run(debug=True)