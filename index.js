const express = require('express')
const bodyParser = require('body-parser')
// corsポリシーに抵触するため、その対策としてcorsを利用する
const cors = require('cors')
const api = require('./src/find.mjs')

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send("ok")
})

app.get('/search', async (req, res) => {
    const query = req.query.q
    const result = await api.find(query)
    res.send(result)
})

app.listen(process.env.PORT || 3000)
