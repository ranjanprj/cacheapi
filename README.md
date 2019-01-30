# cacheapi

A simple Cache Implementation with hitCount and TTL in Nodejs(ExpressJS) and Python(Flask)
Using MongoDB as backend

Steps:
- Setup Mongo
` docker pull mongo
 docker run -d -p 27017:27017 --name mongodb mongo:latest
 `
 
- Download the project
`git pull https://github.com/ranjanprj/cacheapi.git && cd cacheapi && npm install && npm start`


- Create or Update Cache Key-Val
```
POST /cacheapi/action/createupdatedata/name HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Cache-Control: no-cache
Postman-Token: 57bedcf7-d26a-4cdc-97a7-c2dba97042a7

{
	"name" : "ranjan"
}
```

- Get Value from Key
```
GET /cacheapi/action/get/name HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Cache-Control: no-cache
Postman-Token: 922748bf-a2d8-4d8b-9140-20f24ad0142b

{
    "_id": "5c51f09d7f2dd455c8318235",
    "key": "name",
    "value": {
        "name": "ranjan"
    },
    "hitCount": 1,
    "ttl": "30s",
    "creationTime": 1548873888805
}
```

- Get all keys

```
GET /cacheapi/action/getallkeys HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Cache-Control: no-cache
Postman-Token: c3169969-f60f-4c77-bd91-bdd618941a43


[
    "name"
]
```

- Remove all keys
```
POST /cacheapi/action/removeallkeys HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Cache-Control: no-cache
Postman-Token: c3c6e779-d3a0-4906-9cef-2205e11f8779

{
    "n": 1,
    "ok": 1
}
```

- Remove single key
```
POST /cacheapi/action/removekey/name HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Cache-Control: no-cache
Postman-Token: e8900cae-1c77-457c-90be-9a264eca3ccb

{
    "n": 0,
    "ok": 1
}
```


