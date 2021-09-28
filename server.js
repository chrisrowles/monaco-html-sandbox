const path = require('path')
const express = require('express')

const app = express()

const db = require('./backend/models')
db.connection.sync()

app.set('views', path.join(__dirname, 'public'))
app.set('view engine', 'pug')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')))

// Frontend routes
app.get('/', (req, res) => {
    return res.render('index')
})

app.get('/:name', (req, res) => {
    return res.render('index', {
        existing: true,
        identifier: req.params.name
    })
})

// Backend routes
require('./backend/routes/code.routes')(app)

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Server is up...\nhttp://localhost:8080\n\n`))