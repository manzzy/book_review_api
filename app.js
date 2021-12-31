const express = require('express');
const app = express();
const userRouter = require('./router/userRouter');
const reviewRouter = require('./router/reviewRouter');

app.use(express.json());
app.get('/', (req, res) =>{
    res.send("Hello ");
})

app.use('/users', userRouter);
app.use('/reviews', reviewRouter);
// LOGOUT
app.get('/logout', (req, res) => {
    res.cookie("auth", "");
    res.json({msg: 'User is logged out'});
})

// GET POST PATCH DELETE

app.listen(5000, ()=> console.log("Server started at port 5000"));