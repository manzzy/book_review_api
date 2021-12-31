const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const db = require('../db');
// CRUD
// Authorization [ isLoggedin ]
const isLoggedIn = async (req,res,next)=>{
    const token = req.cookies.auth;

    if(token == null || token == ""){
        return res.status(401).json({msg: "User hasnt logged in"});
    }

    const decode = await jwt.verify(token, "SECRET");
    req.user = decode;

    next();
}
// CREATE CREATE
router.post('/', isLoggedIn, (req, res)=> {
    const {book_title, review} = req.body;

    if(!(book_title && review)){
        return res.status(400).json({msg: "All fields are required"});
    }

    const userID = req.user.uid;
    let sql = 'INSERT INTO reviews(created_by, book_title, review) values (?,?,?)';
    db.query(sql, [userID, book_title, review], (err, rows) => {
        if (err) throw err;
        res.status(201).json({msg: "Review is Saved"});
    })
})
// GET ALL
router.get('/', isLoggedIn, (req, res) => {

    let sql = 'SELECT rid, book_title, review, name  FROM reviews JOIN users ON created_by = uid';
    db.query(sql, (err, rows) => {
        if (err) throw err
        res.json(rows);
    })
})
// GET ONE
router.get('/:id', isLoggedIn, (req, res) => {
    let rid = Number(req.params.id)
    let sql = 'SELECT rid, book_title, review, name  FROM reviews JOIN users ON created_by = uid WHERE rid = ?';
    db.query(sql,[rid], (err, rows) => {
        if (err) throw err
        if(Object.keys(rows).length == 0){
            return res.status(404).json({msg: "review not found"});
        }
        res.json(rows);
    })
})
// EDIT
router.patch('/:id', isLoggedIn, (req, res) => {
    let rid = Number(req.params.id)
    const {book_title, review} = req.body;
    let sql = 'SELECT rid, book_title, review, name  FROM reviews JOIN users ON created_by = uid WHERE rid = ?';
    db.query(sql,[rid], (err, rows) => {
        if (err) throw err
        if(Object.keys(rows).length == 0){
            return res.status(404).json({msg: "review not found"});
        }
        const reviews = rows[0]

        sql= "UPDATE reviews SET book_title = ?, review = ? WHERE rid = ?";
        db.query(sql, [book_title || reviews.book_title, review || reviews.review, rid], (err, rows) =>{
            if(err) throw err;
            res.json({msg: "Updated"})
        })
       
    })
})
// DELETE
router.delete('/:id', isLoggedIn, (req, res) => {
    let rid = Number(req.params.id)
    let sql = 'SELECT rid, book_title, review, name  FROM reviews JOIN users ON created_by = uid WHERE rid = ?';
    db.query(sql,[rid], (err, rows) => {
        if (err) throw err
        if(Object.keys(rows).length == 0){
            return res.status(404).json({msg: "review not found"});
        }

        sql = "DELETE from reviews WHERE rid = ?"
        db.query(sql, [rid], (err, rows) => {
            if(err) throw err
            res.json({msg: "Review Deleted"});
        })
        
    })
})

// middle ware



module.exports = router