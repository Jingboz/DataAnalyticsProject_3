from flask_pymongo import PyMongo
from flask import Flask, request, jsonify
import json
from bson import json_util, ObjectId
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI_tREE_SPECIES"] = "mongodb://localhost:27017/Project3"
mongo_tree_species = PyMongo(app, uri=app.config["MONGO_URI_tREE_SPECIES"] )

app.config["MONGO_URI_AUSTRALIA_FOREST_AREA"] = "mongodb://localhost:27017/Project3"
mongo_australia_forest = PyMongo(app, uri=app.config["MONGO_URI_AUSTRALIA_FOREST_AREA"])

app.config["MONGO_URI_SOLAR_CITY"] = "mongodb://localhost:27017/Project3"
mongo_soalr_city= PyMongo(app, uri=app.config["MONGO_URI_SOLAR_CITY"])

app.config["MONGO_URI_GEO_DATA"] = "mongodb://localhost:27017/geo_data"
mongo_geo_data = PyMongo(app, uri=app.config["MONGO_URI_GEO_DATA"])

@app.route('/')
def hello():
    return '''
    <h1>Welcome to the API!</h1>
    <p>Please use the following endpoints to access the databases:</p>
    <ul>
        <li><a href="/api/tree_species">/api/tree_species</a></li>
        <li><a href="/api/australia_forest_data">/api/australia_forest_data</a></li>
        <li><a href="/api/solar_city">/api/solar_city</a></li>        
        <li><a href="/api/geo_data">/api/geo_data</a></li>
    </ul>
    '''
    
@app.route('/api/tree_species')
def tree_species(): 
    tree_species = mongo_tree_species.db.tree_sp.find({})
    page_sanitized = json.loads(json_util.dumps(tree_species))
    return jsonify(page_sanitized)


@app.route('/api/australia_forest_data')
def australia_forest_data():
    forest_data = mongo_australia_forest.db.forest_area.find({})
    page_sanitized = json.loads(json_util.dumps(forest_data))
    return jsonify(page_sanitized)

@app.route('/api/solar_city')
def australia_solar_data():
    solar_city_data = mongo_soalr_city.db.solar_city.find({})
    page_sanitized = json.loads(json_util.dumps(solar_city_data))
    return jsonify(page_sanitized)

@app.route('/api/geo_data')
def geo_data():
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 10))
    skip = (page - 1) * page_size

    geo_data = mongo_geo_data.db.geojson_data.find({}).skip(skip).limit(page_size)
    page_sanitized = json.loads(json_util.dumps(geo_data))
    return jsonify(page_sanitized)

if __name__ == '__main__':
    app.run(debug=True)