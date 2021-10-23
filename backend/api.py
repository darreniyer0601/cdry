from flask import Flask
from flask import request
import json
import requests
from datetime import datetime
from datetime import timezone
from hmacHelper import hmacHelper
#from ncrPost import *
#from ncrGet import ncrGet

app = Flask(__name__)

nepOrganization = "test-drive-e605ad46ec584ec5b0f25"

serviceURL = "https://gateway-staging.ncrcloud.com"

def ncrGet(secretKey="0a0bf40d942b4fe4a5ed82417a3799cf", 
                sharedKey="9f33fd5e7e3f40608efc96c47275e94a", 
                nepOrganization="test-drive-e605ad46ec584ec5b0f25",
                requestURL="https://api.ncr.com/security/role-grants/user-grants/self/effective-roles"):
    
    now = datetime.now(tz=timezone.utc)
    now = datetime(now.year, now.month, now.day, hour=now.hour,
                   minute=now.minute, second=now.second)

    httpMethod = 'GET'
    contentType = 'application/json'

    hmacAccessKey = hmacHelper(sharedKey, secretKey, now, httpMethod,
                               requestURL, contentType, None, None, None, nepOrganization, None)

    utcDate = now.strftime('%a, %d %b %Y %H:%M:%S GMT')
    headers = {
        "Date": utcDate,
        "Content-Type": contentType,
        "Authorization": "AccessKey " + hmacAccessKey,
        "nep-organization": nepOrganization
    }

    request = requests.get(requestURL, headers=headers)

    res = dict()
    res['status'] = request.status_code
    res['data'] = request.json()

    json_formatted = json.dumps(res, indent=2)
    # print(json_formatted)

    return res

def ncrPost(secretKey="0a0bf40d942b4fe4a5ed82417a3799cf", 
                sharedKey="9f33fd5e7e3f40608efc96c47275e94a", 
                nepOrganization="test-drive-e605ad46ec584ec5b0f25",
                data = {},
                requestURL="https://api.ncr.com/security/authentication/login"):
    
    now = datetime.now(tz=timezone.utc)
    now = datetime(now.year, now.month, now.day, hour=now.hour,
                   minute=now.minute, second=now.second)
    httpMethod = 'POST'
    contentType = 'application/json'

    hmacAccessKey = hmacHelper(sharedKey, secretKey, now, httpMethod,
                               requestURL, contentType, None, None, None, nepOrganization, None)

    utcDate = now.strftime('%a, %d %b %Y %H:%M:%S GMT')
    headers = {
        "Date": utcDate,
        "Content-Type": contentType,
        "Authorization": "AccessKey " + hmacAccessKey,
        "nep-organization": nepOrganization
    }

    payload = json.dumps(data)

    request = requests.post(requestURL, data=payload, headers=headers)

    res = dict()
    res['status'] = request.status_code
    res['data'] = request.json()

    json_formatted = json.dumps(res, indent=2)
    # print(json_formatted)

    return res

@app.route('/login', methods = ['POST'])
def login():
    if request.method == 'POST':
        data = request.get_json() # Has username and password
        payload = {"searchCriteria": {'profileUsername': data['username'], 
                    "identity": data['password']}, "operator": "AND", 
                    "pageStart": 0, "pageSize": 10}
        res = ncrPost(data=payload, requestURL="https://gateway-staging.ncrcloud.com/cdm/consumers/find")
        print("\n")
        print("\n")
        print(res)
        print("\n")
        print("\n")
        if res['status'] == 200:
            data = res['data']
            if (data['numberFound']) == 1: # One consumer per username and password
                consumer = data['consumers'][0]
                CAN = consumer['consumerAccountNumber']
                consumerData = {'firstName': consumer['firstName'],
                                'lastName': consumer['lastName']
                }
                # Log them in
            return res
        else:
            return "Error contacting NCR customer API"

@app.route('/register', methods = ['POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        payload = {
            'profileUsername': data['username'],
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'identity': data['password']
        }
        res = ncrPost(data=payload, requestURL=serviceURL + "/cdm/consumers")
        if res['status'] == 200:
            # Log them in
            return res
        else:
            return 'There was an error registering with those credentials'

@app.route('/createCatalogItem', methods = ['POST'])
def createCatalogItem():
    if request.method == 'POST':
        data = request.get_data()
        payload = {
            'version': 0,
            'shortDescription': {
                'values': [{
                    'locale': 'en-US',
                    'value': data['NFTData']
                }]
            }
        }
        uniqueID = "HACKCDRYNFTID"
        res = ncrPost(data=payload, requestURL=serviceURL + "/catalog/v2/items/" + uniqueID)
        if res['status'] == 200:
            return "Successful"
        else:
            return "Failed to upload catalog item"

@app.route('/selectItem', methods = ['GET'])
def selectItem():
    if request.method == 'GET':
        return
        

# data = {'username':'username', 'password': 'password'} # Has username and password
# payload = {
#             'profileUsername': data['username'],
#             'firstName': 'firstName',
#             'lastName': 'lastName',
#             'identity': data['password']
#         }
# res = ncrPost(data=payload, requestURL=serviceURL + "/cdm/consumers")
# print(res)
# payload1 = {"searchCriteria": {"profileUsername": data['username'], 
#             "identity": data['password']}, "operator": "AND", 
#             "pageStart": 0, "pageSize": 10}
# res = ncrPost(data=payload1, requestURL=serviceURL + "/cdm/consumers/find")
# print(res)
    