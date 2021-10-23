import json
import requests
from datetime import datetime
from datetime import timezone
from hmacHelper import hmacHelper

def examplePost(secretKey="8a92f9468d494a60bb7c830017a3be65", 
                sharedKey="dd162e750ae14a48960e00c4b55222f4", 
                nepOrganization="test-drive-e605ad46ec584ec5b0f25",
                data = {}):
    
    now = datetime.now(tz=timezone.utc)
    now = datetime(now.year, now.month, now.day, hour=now.hour,
                   minute=now.minute, second=now.second)

    requestURL = "https://api.ncr.com/security/authentication/login"
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
    print(json_formatted)

    return res