const { Restaurant, User, Category } = require('../models')

const adminServices = {
  getRestaurants: cb => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => {
        return cb(null, { restaurants })
      })
      .catch(err => cb(err))
  }
}

module.exports = adminServices
