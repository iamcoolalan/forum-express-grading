const restaurantServices = require('../../services/restaurant-service')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.json(data))
  }
}

module.exports = restaurantController
