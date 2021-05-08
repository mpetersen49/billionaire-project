# Import the functions we need from flask
from flask import Flask
from flask import render_template 
from flask import jsonify

# Import the functions we need from SQL Alchemy
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from config import username, password

connection_string = f"{username}:{password}@localhost:5432/billionaires_db"
engine = create_engine(f"postgresql://{connection_string}")
base = automap_base()
base.prepare(engine, reflect=True)

table = base.classes.billionaires

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route("/")
def IndexRoute():
    website = render_template("index.html")
    return website

@app.route("/data")
def APIrequest():
    session = Session(engine)
    results = session.query(table.name, 
                            table.networth, 
                            table.country, 
                            table.source, 
                            table.rank, 
                            table.latitude, 
                            table.longitude).all()
    
    session.close()

    api_data = []
    for name, networth, country, source, rank, latitude, longitude in results:
        dict = {}
        dict["Name"] = name
        dict["NetWorth"] = networth
        dict["Country"] = country
        dict["Source"] = source
        dict["Rank"] = rank
        dict["latitude"] = latitude
        dict["longitude"] = longitude
        api_data.append(dict)

    return jsonify(api_data)

if __name__ == '__main__':
    app.run(debug=True)