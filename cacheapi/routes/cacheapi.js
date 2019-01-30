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
    res.statusCode = 200;
    if (docs.length == 0) {
      console.log("Cache miss");
      return res.json([]);
    } else {
      return res.json(docs[0]);
    }
   
  });

});

// Return all stored keys in cache
router.get('/action/getallkeys', function (req, res, next) {
  console.log(req.params.key);
  var db = req.db;
  var collection = db.get('cache');
  collection.find({}, {}, function (e, docs) {
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
        res.send("DONE");
      });
    } else {


      // Chaining remove and insert as other functions did not show the data when get key is called

      collection.remove({ key: paramKey }, {}).then(function () {
        var hitCount = docs.hitCount;
        collection.insert({ key: paramKey, value: payload, hitCount: hitCount, ttl : '30s', creationTime: new Date().getTime() }).then(function () {
          res.send("DONE");
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
    res.json(docs);
  });

});

// Remove all the keys from cache db
router.post('/action/removeallkeys', function (req, res, next) {
  var db = req.db;
  var collection = db.get('cache');
  collection.remove({}, {}, function (e, docs) {
    res.json(docs);
  });

});


module.exports = router;
