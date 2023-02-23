import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import {registerValidation} from './validation/auth.js'
import {validationResult} from 'express-validator'
import bcrypt from 'bcrypt'
import UserModel from './models/User.js'
import checkAuth from './utils/checkAuth.js'


mongoose
    .connect(`mongodb+srv://admin:admin@cluster0.nywzjzo.mongodb.net/blog?retryWrites=true&w=majority`)
    .then(() => console.log('DB ok'))
    .catch((err) => console.log('DB error', err))

const app = express()

app.use(express.json())

app.post('/auth/login', async (req, res) => {
  try {
    const user = await UserModel.findOne({email: req.body.email})

    if (!user) {
        return res.status(404).json({
            massage: 'Не удалось найти пользователя'
        })
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)

    if(!isValidPass)   
    if (!user) {
      return res.status(404).json({
          massage: 'Не верный логин или пароль'

      })
  }

  const token = jwt.sign(
  {
    _id: user._id
  },
  'secret123',
  {
    expiresIn: '30d'
  },
)

const {passwordHash, ...userData} = user.doc;

    res.json({
      ...userData,
      token,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
        massage: 'Не удалось авторизоваться'
    })
  }
})

app.post('/auth/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400),json(errors.array())
    } 

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const doc = new UserModel({
        email: req.body.email,
        fullName: req.body.fullName,
        avatarURL: req.body.avatarURL,
        passwordHash: hash
    })
    const user = await doc.save()

    const token = jwt.sign(
    {
      _id: user._id
    },
    'secret123',
    {
      expiresIn: '30d'
    }
)

    const {passwordHash, ...userData} = user.doc;

    res.json({
      ...userData,
      token,
    })
    } catch (error) {
    console.log(err)
    res.status(500).json({
        massage: 'Не удалось зарегистрироваться'
    })
  }  
})

app.get('/auth/me', checkAuth, (req, res) => {
  try {
    res.json({
      success: true,
    })
  } catch (error) {}
})
  
app.listen(4444, (err) => {
    if (err) {
        return console.log(err)
    }

    console.log('vse ok')
})