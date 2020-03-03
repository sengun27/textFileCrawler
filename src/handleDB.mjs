exports.insertDocuments = async function (documents) {
    const MongoClient = require('mongodb').MongoClient
    const assert = require('assert')
    const params = require('./settings.mjs')
    const client = await MongoClient.connect(params.url,params.connectOption)
    var result = null
    var err = null
    try{
        const db = client.db(params.db)
        result = await db.collection(params.table).insertMany(documents)
    }catch(err){
        console.log(err)
    }finally{
        client.close()
    }
    assert.equal(err,null)
    assert.equal(documents.length,result.ops.length)
    assert.equal(documents.length,result.result.n)
}

exports.findDocuments = async function (word) {
    const MongoClient = require('mongodb').MongoClient
    const assert = require('assert')
    const params = require('./settings.mjs')
    const client = await MongoClient.connect(params.url,params.connectOption)
    var result = null
    var err = null
    try{
        const db = client.db(params.db)
        result = await db.collection(params.table).find({ words : word }).project({filename : 1, update_time : 1, dir_path: 1}).toArray()
    }catch(err){
       console.log(err)
    }finally{
        client.close()
    }
    assert.equal(err,null)
    return result
}

exports.getFiles = async function(files) {
    const MongoClient = require('mongodb').MongoClient
    const assert = require('assert')
    const params = require('./settings.mjs')
    const client = await MongoClient.connect(params.url,params.connectOption)
    var result = null
    var err = null
    try{
        const db = client.db(params.db)
        result = await db.collection(params.table).find({$or : files}).project({filename : 1, update_time : 1}).toArray()
    }catch(err){
       console.log(err)
    }finally{
        client.close()
    }
    assert.equal(err,null)
    return result
}

exports.upsertDocuments = async function(documents){
    const MongoClient = require('mongodb').MongoClient
    const assert = require('assert')
    const params = require('./settings.mjs')
    const client = await MongoClient.connect(params.url,params.connectOption)
    var result = null
    var err = null
    try{
        const db = client.db(params.db)
        for(var i = 0 ; i < documents.length ; i++){
           var result = await db.collection(params.table)
            .updateOne({filename : documents[i].filename}, {$set : { words : documents[i].words, update_time : documents[i].update_time, dir_path : documents[i].dir_path} }, {upsert : true})
           assert.equal(err,null)
           assert.equal(1,result.result.n)
           console.log(documents[i].filename + "をupsertしました")
        }
    }catch(err){
       console.log(err)
    }finally{
        client.close()
    }
}
