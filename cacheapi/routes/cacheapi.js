var express = require('express');
var router = express.Router();

router.get('/test', function (req, res) {
  res.send('Birds home page')
})

// Find value for key from cache
router.get('/action/get/:key', function (req, res, next) {
  var paramKey = req.params.key;
  var db = req.db;
  var collection = db.get('cache');
  collection.find({ key: paramKey }, {}, function (e, docs) {
    if(e){
      res.statusMessage = "Could not find document"; 
      res.status(400).end();
    }
    res.statusCode = 200;
    if (docs.length == 0) {
      console.log("Cache miss");
      return res.json([]);
    } else {
      // check TTL, if expired don't use it

      var ttl = docs[0].ttl;
      var ttlInMS = 0;
      if(ttl.substring(ttl.length-1,ttl.length) == "s"){
          var ttlSec = parseInt(ttl.substring(0,ttl.length-1));
          ttlInMS = ttlSec*1000;
      }else  if(ttl.substring(ttl.length-1,ttl.length) == "m"){
        var ttlMin = parseInt(ttl.substring(0,ttl.length-1));
        ttlInMS = ttlMin*60*1000;
      }else  if(ttl.substring(ttl.length-1,ttl.length) == "h"){
        var ttlHr = parseInt(ttl.substring(0,ttl.length-1));
        ttlInMS = ttlHr*60*60*1000;
      }

      // If within TTL update the ttl in the document
      if(new Date().getTime() < docs[0].creationTime + ttlInMS){
          // update the hit count 
          docs[0].hitCount = docs[0].hitCount + 1;
          docs[0].creationTime = new Date().getTime();
          console.log(docs);
          collection.update({ key: paramKey }, docs[0], function (e, docs) {
            if(e){
              res.statusMessage = "Could not find document"; 
              res.status(400).end();
            }
          });
          console.log("Cache hit");
          res.json(docs[0]);
      }else{
        res.json([]);
      }
     
    }
   
  });

});

// Return all stored keys in cache
router.get('/action/getallkeys', function (req, res, next) {
  console.log(req.params.key);
  var db = req.db;
  var collection = db.get('cache');
  collection.find({}, {}, function (e, docs) {
    if(e){
      res.statusMessage = "Could not find document"; 
      res.status(400).end();
    }
    var keysArr = [];
    var doc;
    for (doc in docs) {
      if (docs[doc].key != null) {
        keysArr.push(docs[doc].key);
      }

    }
    res.json(keysArr);
  });

});

// create data for given key
router.post('/action/createupdatedata/:key', function (req, res, next) {
  var paramKey = req.params.key;
  var payload = req.body;
  var db = req.db;
  var collection = db.get('cache');
  // if key already exists
  // console.log(collection.find({},{sort:{hitcount:1}}).then((doc)=>{console.log(doc[0])}));
  collection.find({ key: paramKey }, {}, function (e, docs) {
    if(e){
      res.statusMessage = "Could not find document"; 
      res.status(400).end();
    }
    res.statusCode = 200;
    if (docs.length == 0) {
      // Check whether the number of entries is 5
      // if yes then delete the entry with least hitCount as it is being accessed infrequently
      collection.count().then((cnt) => {
        if (cnt == 5) {
          console.log('---')
          // console.log(collection.find({},{sort:{hitcount:1}}).then((doc)=>{console.log(doc)}));
          collection.find({},{sort:{hitcount:1}}).then((doc)=>{
            // console.log(doc);
            collection.remove({ key: doc[0].key }, {}).then(function () { });
          });
        }
      })
      collection.insert({ key: paramKey, value: payload, hitCount: 0 , ttl : '30s', creationTime: new Date().getTime() }).then(function () {
        if(e){
          res.statusMessage = "Could not find document"; 
          res.status(400).end();
        }
        res.status(200).end();
      });
    } else {


      // Chaining remove and insert as other functions did not show the data when get key is called

      collection.remove({ key: paramKey }, {}).then(function () {
        var hitCount = docs.hitCount;
        collection.insert({ key: paramKey, value: payload, hitCount: hitCount, ttl : '30s', creationTime: new Date().getTime() }).then(function () {
          res.status(200).end();
        });
      });
    }

  });

});


// Remove specified keys from cache db
router.post('/action/removekey/:key', function (req, res, next) {
  var paramKey = req.params.key;
  var db = req.db;
  var collection = db.get('cache');
  collection.remove({ key: paramKey }, {}, function (e, docs) {
    if(e){
      res.statusMessage = "Could not find document"; 
      res.status(400).end();
    }
    res.json(docs);
  });

});

// Remove all the keys from cache db
router.post('/action/removeallkeys', function (req, res, next) {
  var db = req.db;
  var collection = db.get('cache');
  collection.remove({}, {}, function (e, docs) {
    if(e){
      res.statusMessage = "Could not find document"; 
      res.status(400).end();
    }
    res.json(docs);
  });

});


module.exports = router;
