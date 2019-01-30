import os
import time

from flask import Flask,jsonify, request, Response   
app = Flask(__name__)
from pymongo import MongoClient
from bson import json_util
import json
client = MongoClient(port=27017)
db = client.cachedb

    
@app.route("/cacheapi/action/createupdatedata/<key>",methods=['POST'])
def createupdatedata(key):
    payload = request.json   
    # if count is greater than 5 than evict least used key
    if db.cache.count() == 5:
        docs = db.cache.find({}).sort("hitCount",1).limit(1)
        for doc in docs:
            if doc is not None:
                db.cache.delete_one({'key':doc['key']})

    if db.cache.find_one({'key':key}) is not None:
        db.cache.update({'key':key},{
                'key' : key,
                'value' : payload,
                'ttl' : '30s',
                'creationTime' : time.time(),
                'hitCount' : 0
        })    
    else:
        db.cache.insert_one({
            'key' : key,
            'value' : payload,
            'ttl' : '30s',
            'creationTime' : time.time(),
            'hitCount' : 0
        })    
    response = Response('',status=200, mimetype='application/json')    
    response.headers['Content-Type'] = "application/json"
    return response

@app.route("/cacheapi/action/get/<key>",methods=['GET'])
def get_keyval(key):
    doc = db.cache.find_one({'key':key})   
    if doc is None:
        response = Response(json.dumps([], indent=4, default=json_util.default))
        response.headers['Content-Type'] = "application/json"
        return response   
    else:
        # check for TTL
        print(doc)
        ttl = doc['ttl']
        ttl_sec = 0
        if ttl[-1:] == 's':
            ttl_sec = int(ttl[:-1])
        elif ttl[-1:] == 'm':
            ttl_sec = int(ttl[:-1])*60
        elif  ttl[-1:] == 'h':
            ttl_sec = int(ttl[:-1])*3600
        # if TTL has expired return immediately
        if time.time() > ttl_sec + doc['creationTime']:
            response = Response(json.dumps([], indent=4, default=json_util.default))
            response.headers['Content-Type'] = "application/json"
            return response   

        doc['hitCount'] += 1
        doc['creationTime'] = time.time()
        doc['ttl'] = '30s'
        db.cache.update({'key':doc['key']},doc)

        response = Response(json.dumps(doc, indent=4, default=json_util.default))
        response.headers['Content-Type'] = "application/json"
        return response 
    

@app.route("/cacheapi/action/getallkeys",methods=['GET'])
def getallkeys():
    docs = db.cache.find({})   
    arr = [doc['key'] for doc in docs]
    response = Response(json.dumps(arr, indent=4, default=json_util.default))
    response.headers['Content-Type'] = "application/json"
    return response

@app.route("/cacheapi/action/removeallkeys",methods=['DELETE'])
def removeallkeys():    
    response = Response(json.dumps(db.cache.remove({}), indent=4, default=json_util.default))
    response.headers['Content-Type'] = "application/json"
    return response

@app.route("/cacheapi/action/removekey/<key>",methods=['DELETE'])
def removeKey(key):
    response = Response(json.dumps(db.cache.remove({'key':key}), indent=4, default=json_util.default))
    response.headers['Content-Type'] = "application/json"
    return response
  


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))    
    app.run(host='0.0.0.0',port=port,debug=True)
