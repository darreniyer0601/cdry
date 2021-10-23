from flask import Flask
from flask import request
import json
import datetime
from examplePost import examplePost
from exampleGet import exampleGet

app = Flask(__name__)

nepOrganization = "test-drive-e605ad46ec584ec5b0f25"

@app.route('/login', methods = ['POST'])
def login():
    data = request.get_json() # Has username and password
    payload = {"searchCriteria": {"profileUsername": data.username, 
                "socialSecurityNumber": data.password}, "operator": "AND", 
                "pageStart": 0, "pageSize": 10}
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "nep-organization": nepOrganization
    }

data = {'username':'username', 'password': 'password'} # Has username and password
payload = {"searchCriteria": {"profileUsername": data['username'], 
            "socialSecurityNumber": data['password']}, "operator": "AND", 
            "pageStart": 0, "pageSize": 10}
print(examplePost(data=payload))

    