from flask import Flask
from flask import request
import json
import datetime
from ncrPost import ncrPost
from ncrGet import ncrGet

app = Flask(__name__)

nepOrganization = "test-drive-e605ad46ec584ec5b0f25"

serviceURL = "gateway-staging.ncrcloud.com"

@app.route('/login', methods = ['POST'])
def login():
    if request.method == 'POST':
        data = request.get_json() # Has username and password
        payload = {"searchCriteria": {"profileUsername": data.username, 
                    "socialSecurityNumber": data.password}, "operator": "AND", 
                    "pageStart": 0, "pageSize": 10}
        res = ncrPost(data=payload, requestURL="https://gateway-staging.ncrcloud.com/cdm/consumers/find")
        if res['status'] == 200:
            if len(res['consumers']) == 1: # One consumer per username and password
                consumer = res['consumers'][0]
                CAN = consumer['consumerAccountNumber']
                consumerData = {'firstName': consumer['firstName'],
                                'lastName': consumer['lastName']
                }
                # Log them in
        else:
            return "Error contacting NCR customer API"

@app.route('/register', methods = ['POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        payload = {
            'profileUsername': data.username,
            'firstName': data.firstName,
            'lastName': data.lastName,
            'socialSecurityNumber': data.password
        }
        res = ncrPost(data=payload, requestURL=serviceURL + "/cdm/consumers")
        if res['status'] == 200:
            # Log them in
            return
        else:
            return 'There was an error registering with those credentials'

@app.route('/createCatalogItem', methods = ['POST'])
def createCatalogItem():
    if request.method == 'POST':
        data = request.get_data()
        payload = {
            'version': 0,
            'shortDescription': {
                'values': {
                    'locale': 'en-US',
                    'value': data.NFTData
                }
            }
        }
        uniqueID = "HACKCDRYNFTID"
        res = ncrPost(data=payload, requestURL=serviceURL + "/catalog/v2/items/" + uniqueID)
        if res['status'] == 200:
            return "Successful"
        else:
            return "Failed to upload catalog item"
            
data = {'username':'username', 'password': 'password'} # Has username and password
payload = {"searchCriteria": {"profileUsername": data['username'], 
            "socialSecurityNumber": data['password']}, "operator": "AND", 
            "pageStart": 0, "pageSize": 10}
res = ncrPost(data=payload, requestURL=serviceURL + "/cdm/consumers/find")
print(res['status'])
