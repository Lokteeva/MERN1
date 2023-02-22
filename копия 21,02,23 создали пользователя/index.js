import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import {registerValidation} from './validation/auth.js'
import {validationResult} from 'express-validator'
import UserModel from './models/User.js'
import bcrypt from 'bcrypt'

mongoose
    .connect(`mongodb+srv://admin:admin@cluster0.nywzjzo.mongodb.net/blog?retryWrites=true&w=majority`)
    .then(() => console.log('DB ok'))
    .catch((err) => console.log('DB error', err))

const app = express()

app.use(express.json())

app.post('/auth/register', registerValidation, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400),json(errors.array())
    } 

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const doc = new UserModel({
        email: req.body.email,
        fullName: req.body.fullName,
        avatarURL: req.body.avatarURL,
        passwordHash
    })

    const user = await doc.save()

    res.json(user)
})

  
app.listen(4444, (err) => {
    if (err) {
        return console.log(err)
    }

    console.log('vse ok')
})