const express = require('express')
const router = express.Router()

const passport = require('../../config/passport')

const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')

const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')

const { apiErrorHandler } = require('../../middleware/error-handler')

const admin = require('./modules/admin')

router.use('/admin', authenticatedAdmin, admin)

router.post('/signin', passport.authenticate('local', {
  session: false
}), userController.signIn)

router.get('/restaurants', authenticated, restController.getRestaurants)

router.use('/', apiErrorHandler)

module.exports = router
