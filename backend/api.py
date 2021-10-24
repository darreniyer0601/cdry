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


def nftAPIGet():
    endpoint = "/get-whale-tokens"
    url = "https://cdry-go.ue.r.appspot.com/"
    return (requests.get(url + endpoint, headers = {})).json()

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

    return res

def ncrPut(secretKey="0a0bf40d942b4fe4a5ed82417a3799cf", 
                sharedKey="9f33fd5e7e3f40608efc96c47275e94a", 
                nepOrganization="test-drive-e605ad46ec584ec5b0f25",
                data = {},
                requestURL="https://api.ncr.com/security/authentication/login"):
    
    now = datetime.now(tz=timezone.utc)
    now = datetime(now.year, now.month, now.day, hour=now.hour,
                   minute=now.minute, second=now.second)
    httpMethod = 'PUT'
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
    requests.put(requestURL, data=payload, headers=headers)
    # res = dict()
    # res['status'] = request.status_code
    # res['data'] = request.json()

    # json_formatted = json.dumps(res, indent=2)
    # # print(json_formatted)

    # return res

@app.route('/login', methods = ['POST'])
def login():
    if request.method == 'POST':
        data = request.get_json() # Has username and password
        payload = {"searchCriteria": {'profileUsername': data['username'], 
                    "identity": data['password']}, "operator": "AND", 
                    "pageStart": 0, "pageSize": 10}
        res = ncrPost(data=payload, requestURL="https://gateway-staging.ncrcloud.com/cdm/consumers/find")
        if res['status'] == 200:
            data = res['data']
            if (data['numberFound']) == 1:
                # Log them in
                return res
        else:
            return "Error contacting NCR customer API"

@app.route('/register', methods = ['POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
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

@app.route('/getCatalog', methods = ['GET'])
def getCatalog():
    if request.method == 'GET':
        data = nftAPIGet()
        uniqueID = "HACKCDRYNFTID"
        for i in range(0, len(data)):
            d = data[i]
            payload = {
                'version': 0,
                'shortDescription': {
                    'values': [{
                        'locale': 'en-US',
                        'value': d['name']
                    }, {
                        'locale': 'en-US',
                        'value': d['image']
                    }, {
                        'locale': 'en-US',
                        'value': d['description']
                    }]
                },
                'departmentId': '1',
                'nonMerchandise': False,
                'merchandiseCategory': {
                    'nodeId': 'nodeId'
                }, 
                'status': 'ACTIVE',
            }
            ncrPut(data=payload, requestURL=serviceURL + "/catalog/v2/items/" + uniqueID + data[i]['tokenID'])
        return data

@app.route('/createCatalog', methods = ['POST'])
def createCatalog():
    if request.method == 'POST':
        data = request.get_json()
        uniqueID = "HACKCDRYNFTID"
        for i in range(0, len(data)):
            d = data[i]
            payload = {
                'version': 0,
                'shortDescription': {
                    'values': [{
                        'locale': 'en-US',
                        'value': d['name']
                    }, {
                        'locale': 'en-US',
                        'value': d['image']
                    }, {
                        'locale': 'en-US',
                        'value': d['description']
                    }]
                },
                'departmentId': '1',
                'nonMerchandise': False,
                'merchandiseCategory': {
                    'nodeId': 'nodeId'
                }, 
                'status': 'ACTIVE',
            }
            ncrPut(data=payload, requestURL=serviceURL + "/catalog/v2/items/" + uniqueID + data[i]['tokenID'])
        return data

@app.route('/getItems', methods = ['GET'])
def getItems():
    if request.method == 'GET':
        data = []
        uniqueID = "HACKCDRYNFTID"
        for i in range(1, 3):
            res = ncrGet(requestURL=serviceURL + "/catalog/v2/items/" + str(i) + uniqueID)
            values = {}
            if res['status'] == 200:
                values['tokenID'] = str(i) + uniqueID
                for value in res['data']['shortDescription']['values']:
                    if value['locale'] == 'en-US':
                        values['name'] = value['value']
                    elif value['locale'] == 'af-ZA':
                        values['image'] = value['value']
                    else:
                        values['description'] = value['value']
                data.append(values)
            else:
                return "Failed to retrieve catalog item"
        return {'data': data}

@app.route('/selectItem', methods = ['POST'])
def selectItem():
    if request.method == 'POST':
        data = request.get_json()
        uniqueID = "HACKCDRYNFTID"
        token = data['ID']
        res = ncrGet(requestURL=serviceURL + "/catalog/v2/items/" + uniqueID + token)
        if res['status'] == 200:
            return res
        else:
            return "Failed to retrieve catalog item"

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
# data = nftAPIGet()
# uniqueID = "HACKCDRYNFTID"
# for i in range(0, len(data)):
#     d = data[i]
#     payload = {
#         'version': 0,
#         'shortDescription': {
#             'values': [{
#                 'locale': 'en-US',
#                 'value': d['name']
#             }, {
#                 'locale': 'en-US',
#                 'value': d['image']
#             }, {
#                 'locale': 'en-US',
#                 'value': d['description']
#             }
#             ]
#         },
#         'departmentId': '1',
#         'nonMerchandise': False,
#         'merchandiseCategory': {
#             'nodeId': 'nodeId'
#         }, 
#         'status': 'ACTIVE',
#     }
#     token = data[i]['tokenID']
#     ncrPut(data=payload, requestURL=serviceURL + "/catalog/v2/items/" + token + uniqueID)
#     res = ncrGet(requestURL=serviceURL + "/catalog/v2/items/" + token + uniqueID)
#     print(res)