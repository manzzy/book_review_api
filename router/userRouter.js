const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const res = require('express/lib/response');

router.use(cookieParser());

// CRUD
// CREATE READ UPDATE DELETE 
// USER CREATE 
router.post('/',  async (req, res)=> {
    const { name, phone, email, password, role } = req.body
    
    // check whether sent data is null 
    if( ! (name && phone && email && password && role)){
        return res.status(400).json({msg: "Bad data, check if you are not missing a value"});
    }
    let hashPWD = await bcrypt.hash(password, 10);
    let SQL = 'INSERT INTO users(name, phone, email, password, role) values(?,?,?,?,?)'
    db.query(SQL,[name, phone, email,hashPWD, role], (err, rows) => {
        if(err) throw err;
        res.status(201).json({msg: "Successfuly added a user", rows})
    })
})
// READ USER 
// GET ALL
router.get('/', (req, res) =>{
    let sql = 'SELECT * from users';
    db.query(sql, (err, rows)=>{
        if(err) throw err
        res.json({msg: "Successfuly retrieved", user: rows})
    })
})

// GET ONE USER
router.get('/:id', (req, res) =>{
    const id = Number(req.params.id)
    let sql = 'SELECT * from users WHERE uid = ?';
    db.query(sql, [id], (err, rows)=>{
        if(err) throw err

        // 404 
        if(Object.keys(rows).length == 0){
            return res.status(404).json({msg: "User with the specified id is not found"});
        }
        res.json({msg: "Successfuly retrieved", user: rows[0]})
    })
})

// UPDATE
router.patch('/:id',  async (req, res)=> {
    const id = Number(req.params.id)
    const { name, phone, password } = req.body
    let hashPWD = null;
    if(password){
        hashPWD = await bcrypt.hash(password, 10);    
    }
    
    let sql = 'SELECT * from users WHERE uid = ?';
    db.query(sql, [id], (err, rows)=>{
        if(err) throw err

        // 404 
        if(Object.keys(rows).length == 0){
            return res.status(404).json({msg: "User with the specified id is not found"});
        }
        
        let user = {
            name: name || rows[0].name,
            phone: phone || rows[0].phone,
            password: hashPWD || rows[0].password
        }

        sql = ' UPDATE users SET name = ?, phone = ?, password = ? WHERE uid = ?';
        db.query(sql, [user.name, user.phone, user.password, id], (err, rows) => {
            if(err) throw err
            res.status(200).json({msg: 'User updated'})
        })
    })
     
})
// DELETE
router.delete('/:id', (req, res) =>{
    const id = Number(req.params.id)
    let sql = 'DELETE  from users WHERE uid = ?';
    db.query(sql, [id], (err, rows)=>{
        if(err) throw err

        
        res.json({msg: "Successfuly Deleted", rows})
    })
})
// LOGIN

router.post('/login', (req, res)=> {
    // authentication
    const {email, password } = req.body;
    if(!(email && password)){
        return res.status(400).json({msg: "BAD data"});
    }

    let sql = 'SELECT * FROM users where email = ?';
    db.query(sql, [email],  async(err, rows)=> {
        if(err) throw err
        const user = rows[0];
        const isMatch = await bcrypt.compare(password ,user.password);
        if(!isMatch){
            return res.json({msg: "Password didnt match"});

        }
        // jwt.sign(payload, seceret)
        const token = await jwt.sign(JSON.stringify(user), "SECRET");
        res.cookie("auth", token)
        res.json({msg: "Successfully looged in", token})
    })
    // token JWT 
})



module.exports = router;