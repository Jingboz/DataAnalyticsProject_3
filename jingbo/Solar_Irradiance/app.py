from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
import json
from bson import json_util
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config["MONGO_URI"] = "mongodb://localhost:27017/Project3"
mongo = PyMongo(app)
db = mongo.db

@app.route("/api/cities")
def city_page():
    online_users = db.solar_city.find({})
    page_sanitized = json.loads(json_util.dumps(online_users))
    return jsonify(page_sanitized)
  
@app.route("/api/forest_area")
def area_page():
    online_users = db.forest_area.find({})
    page_sanitized = json.loads(json_util.dumps(online_users))
    return jsonify(page_sanitized)

@app.route("/api/tree_species")
def species_page():
    online_users = db.tree_sp.find({})
    page_sanitized = json.loads(json_util.dumps(online_users))
    return jsonify(page_sanitized)

if __name__ == "__main__":
    app.run(debug=True)