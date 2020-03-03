exports.find = async(word) => {
    const handleDB = require('./handleDB.mjs')
    const result = await handleDB.findDocuments(word)
    console.log(result)
    return result
}

