const path = require('path')
const express = require('express')

const app = express()

const db = require('./backend/models')
db.sequelize.sync()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

require('./backend/routes/code.routes')(app)

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Server is up...\nhttp://localhost:8080\n\n`))