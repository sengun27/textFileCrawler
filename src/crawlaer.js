const dir = require('./settings.mjs').dir
const fs = require('fs')
const util = require('util')
const readDirAsync = util.promisify(fs.readdir)
const readFileAsync = util.promisify(fs.readFile)
const stat = util.promisify(fs.stat)

const parseByMecab = (data) => new Promise((resolve,reject) => {
    const Mecab = new require('mecab-async')
    const mecab = new Mecab()
    mecab.parse(data, (err,result) => {
        if(err) reject(err)
        resolve(result)
    })
})

const getFiles = (pattern) => new Promise((resolve,reject) => {
    const glob = require('glob')
    glob(pattern,(err,files) => {
        if(err) reject(err)
        resolve(files)
    })
})

const checkIfProper = (item) => {
   if(item[1] == '名詞')　return true
   else return false
}

const makeObject = (file,words,update_time) => {
   var object = {
        filename : file,
        words : [],
        update_time : update_time,
        dir_path : file
   }
   for(var i = 0 ; i < words.length ; i++){
        object.words.push(words[i][0])
   }
   console.log(object)
   return object
}

const getWordsOfEachFile = async(file) => {
    var data = await readFileAsync(file, 'utf-8')
    var result = await parseByMecab(data)
    var words = []
    result.forEach( item => {
        if(checkIfProper(item))  words.push(item)
    })
    return words
}

const getArraysDiff = (array01, array02) => {
  const arr01 = [...new Set(array01)],
        arr02 = [...new Set(array02)];
  return [...arr01, ...arr02].filter(value => !arr01.includes(value) || !arr02.includes(value));
}

const getUptodateFiles = async (files) => {
    const handleDB = require('./handleDB.mjs')
    var tmp = []
    var filenames = []
    var result = []
    for(var i = 0 ; i < files.length ; i++) {
        var stats = await stat(files[i])
        tmp.push({filename : files[i], update_time : stats.mtime})
        filenames.push({filename :files[i]})
    }
    const info = await handleDB.getFiles(filenames)
    for(var i = 0 ; i < tmp.length ; i++) {
        for( var j = 0 ; j < info.length ; j++){
            if(tmp[i].filename == info[j].filename && tmp[i].update_time.getTime() === info[j].update_time.getTime()){
                result.push(tmp[i].filename)
            }
        }
    }
    return result
}

const crawl = async() => {
    const handleDB = require('./handleDB.mjs')
    const files = await getFiles(dir + '**/*.txt')
    console.log(files)
    var object = []
    const uptodateFiles = await getUptodateFiles(files)
    const targetfiles = getArraysDiff(files,uptodateFiles)
    for(var i = 0 ; i < targetfiles.length ; i++){
        var stats = await stat(targetfiles[i])
        object.push(makeObject(targetfiles[i],await getWordsOfEachFile(targetfiles[i]),stats.mtime))
    }
    if(object.length > 0){
        handleDB.upsertDocuments(object)
    }
}

crawl()