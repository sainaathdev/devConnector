const express = require("express");
const connectDb = require("./config/db");


const app = express()

connectDb()

const PORT = process.env.PORT || 5000


//middleware 
app.use(express.json({extended: false})) 


app.get('/', (req,res)=> res.send("Api Running"))

//definig routes

app.use('/api/users', require('./routes/apis/users'))
app.use('/api/auth', require('./routes/apis/auth'))
app.use('/api/profile', require('./routes/apis/profile'))
app.use('/api/posts', require('./routes/apis/posts'))



app.listen(PORT, ()=> console.log(`Server is running on ${PORT}`)

)