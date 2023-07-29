const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const admin = require('./modules/admin')

const { generalErrorHandler } = require('../middleware/error-handler')

const restController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')

router.use('/admin', admin)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', {
  failureRedirect: '/signin',
  failureFlash: true
}), userController.singIn)
router.get('/logout', userController.logout)

router.get('/restaurants', restController.getRestaurants)
router.get('/', (req, res) => {
  res.redirect('/restaurants')
})

router.use('/', generalErrorHandler)

module.exports = router
