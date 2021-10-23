import json
import requests
from datetime import datetime
from datetime import timezone
from hmacHelper import hmacHelper

def exampleGet(secretKey="0a0bf40d942b4fe4a5ed82417a3799cf", 
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
    print(json_formatted)

    return res
