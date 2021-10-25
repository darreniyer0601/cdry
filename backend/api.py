from flask import Flask
from flask import request
from flask_cors import CORS
import json
import requests
from datetime import datetime
from datetime import timezone
from hmacHelper import hmacHelper
#from ncrPost import *
#from ncrGet import ncrGet

app = Flask(__name__)
CORS(app)

nepOrganization = "nepOrganization"

serviceURL = "https://gateway-staging.ncrcloud.com"

uniqueID = "HACKCDRYNFTID"

@app.route('/get-whale-tokens', methods = ['GET'])
def nftAPIGet():
    endpoint = "/get-whale-tokens"
    url="http://localhost:8080"
    # url = "https://cdry-go.ue.r.appspot.com/"
    return (requests.get(url + endpoint, headers = {})).json()

@app.route('/purchase-tokens', methods = ['POST'])
def transferNFT():
    endpoint = "/purchase-tokens"
    url = "http://cdry-go.ue.r.appspot.com"
    data = request.get_json()
    return (requests.post(url + endpoint, data, headers = {}))

def ncrGet(secretKey="secret-key", 
                sharedKey="secret-key", 
                nepOrganization=nepOrganization,
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

def ncrPost(secretKey="secret-key", 
                sharedKey="shared-key", 
                nepOrganization=nepOrganization,
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
    print(requestURL)
    print(data)
    print(headers)
    request = requests.post(requestURL, data=payload, headers=headers)

    res = dict()
    res['status'] = request.status_code
    res['data'] = request.json()

    json_formatted = json.dumps(res, indent=2)

    return res

def ncrPut(secretKey="secret-key", 
                sharedKey="shared-key", 
                nepOrganization=nepOrganization,
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

@app.route('/createCatalogItem', methods = ['GET'])
def createCatalogItem():
    if request.method == 'GET':
        data = nftAPIGet()
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
                    }
                    ]
                },
                'departmentId': '1',
                'nonMerchandise': False,
                'merchandiseCategory': {
                    'nodeId': 'nodeId'
                }, 
                'status': 'ACTIVE',
            }
            ncrPut(data=payload, requestURL=serviceURL + "/catalog/v2/items/" + data[i]['tokenID'] + uniqueID)
        return data

@app.route('/getItems', methods = ['GET'])
def getItems():
    if request.method == 'GET':
        data = []
        for i in range(1, 3):
            res = ncrGet(requestURL = serviceURL + "/catalog/v2/items/" + str(i) + uniqueID)
            values = {}
            if res['status'] == 200:
                if res['data']['status'] == 'ACTIVE':
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
        token = data['ID']
        res = ncrGet(requestURL=serviceURL + "/catalog/v2/items/" + token + uniqueID)
        if res['status'] == 200:
            return res
        else:
            return "Failed to retrieve catalog item"

@app.route('/removeItem', methods = ['POST'])
def removeItem():
    if request.method == 'POST':
        data = request.get_json()
        token = data['ID']
        getRes = ncrGet(requestURL=serviceURL + "/catalog/v2/items/" + token)
        version = getRes['data']['version']
        payload = {
            'version': int(version) + 1,
            'shortDescription': getRes['data']['shortDescription'],
            'departmentId': '1',
            'nonMerchandise': False,
            'merchandiseCategory': {
                'nodeId': 'nodeId'
                }, 
            'status': 'INACTIVE'
        }
        ncrPut(data=payload, requestURL=serviceURL + "/catalog/v2/items/" + token)
        res = ncrGet(requestURL=serviceURL + "/catalog/v2/items/" + token)
        print(res)
    return "Success"

def removeItemHelper(version, shortDescription, token):
    print(version)
    print("\n\n")
    print(token)
    print("\n\n")
    payload = {
        'version': int(version) + 1,
        'shortDescription': shortDescription,
        'departmentId': '1',
        'nonMerchandise': False,
        'merchandiseCategory': {
            'nodeId': 'nodeId'
            }, 
        'status': 'INACTIVE'
        }
    ncrPut(data=payload, requestURL=serviceURL + "/catalog/v2/items/" + token)
    res = ncrGet(requestURL=serviceURL + "/catalog/v2/items/" + token)
    print(res)

@app.route('/createOrder', methods=['POST'])
def createOrder():
    if request.method == 'POST':
        data = request.get_json()
        address = data['MetaMaskAddress']
        ids = data['tokenIDS']
        transactionHash = data['hash']
        orderLines = []
        for id in ids:
            orderLines.append({"tokenID": id})
        payload = {
            "additionalReferenceIds": {
                "MetaMaskAddress": address
            },
            "orderLines": orderLines, 
            "comments": transactionHash
        }
        res = ncrPost(data=payload, requestURL='https://gateway-staging.ncrcloud.com/order/v2/orders/')
        return res
    return "Failure to create order"

def setAllToActive():
    res = ncrGet(requestURL=serviceURL + "/catalog/v2/items/")
    for nft in res['data']['pageContent']:
        data = ncrGet(requestURL=serviceURL + "/catalog/v2/items/" + nft['itemId']['itemCode'])
        d = data['data']
        payload = {
        'version': int(d['version']) + 1,
        'shortDescription': d['shortDescription'],
        'departmentId': '1',
        'nonMerchandise': False,
        'merchandiseCategory': {
            'nodeId': 'nodeId'
            }, 
        'status': 'ACTIVE'
        }
        ncrPut(data=payload, requestURL=serviceURL + "/catalog/v2/items/" + nft['itemId']['itemCode'])

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

def addNFTS():
    data = nftAPIGet()
    for i in range(0, len(data)):
        d = data[i]
        payload = {
            'version': 0,
            'shortDescription': {
                'values': [{
                    'locale': 'en-US',
                    'value': d['name']
                }, {
                    'locale': 'af-ZA',
                    'value': d['image']
                }, {
                    'locale': 'am-ET',
                    'value': d['description']
                }
                ]
            },
            'departmentId': '1',
            'nonMerchandise': False,
            'merchandiseCategory': {
                'nodeId': 'nodeId'
            }, 
            'status': 'ACTIVE'
        }
        token = data[i]['tokenID']
        ncrPut(data=payload, requestURL=serviceURL + "/catalog/v2/items/" + token + uniqueID)
        res = ncrGet(requestURL=serviceURL + "/catalog/v2/items/" + token + uniqueID)

def makeItemsInactive():
    items = ncrGet(requestURL=serviceURL + "/catalog/v2/items/")
    for item in items['data']['pageContent']:
        if not item['itemId']['itemCode'][0].isdigit() and item['status'] == 'ACTIVE':
            removeItemHelper(item['version'], 
                            item['shortDescription'],
                            item['itemId']['itemCode'])
    print(ncrGet(requestURL=serviceURL + "/catalog/v2/items/"))

# addNFTS()
# makeItemsInactive()
setAllToActive()
print(ncrGet(requestURL=serviceURL + "/catalog/v2/items/"))