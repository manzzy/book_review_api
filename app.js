const express = require('express');
const app = express();
const userRouter = require('./router/userRouter');

app.use(express.json());
app.get('/', (req, res) =>{
    res.send("Hello ");
})

app.use('/users', userRouter);

// GET POST PATCH DELETE

app.listen(5000, ()=> console.log("Server started at port 5000"));