const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");
const userController = require("../controllers/userController");
const bookModel = require("../models/bookModel");

const authentication = function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        if (!token) return res.status(401).send({ status: false, msg: " token must be present for authentication " })

        jwt.verify(token, "SecretKey", function (err, decodedToken) {
            if (err) {
                return res.status(400).send({ status: false, msg: "token invalid" });
            } 
        
                req.decodedToken = decodedToken
                next() 
        })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


//============================Authorization====================================
const authorisation = async (req, res, next) => {
    try {
        
            let token = req.headers["x-api-key"];
            let decodedtoken = jwt.verify(token, "SecretKey")
    
            let bookId = req.params.bookId
            if (bookId) {
    
                let checkUserId = await bookModel.find({ _id: bookId }).select({ userId: 1, _id: 0 })
                let userId = checkUserId.map(x => x.userId)  // this is the userId of the book to be updated
    
                let id = decodedtoken.id
                if (id != userId) return res.status(403).send({ status: false, msg: "You are not authorised to perform this task" })
                
                next()
            }
            else {
                bookId = req.body.userId
                let id = decodedtoken.id
                
    
                if (id != bookId) return res.status(403).send({ status: false, msg: 'You are not authorised to perform this task' })
            }
    
            next();
    }

    catch (err) {
        res.status(500).send({ status: false, error: err.message }) 
    }

}
module.exports.authentication = authentication;
module.exports.authorisation = authorisation;
