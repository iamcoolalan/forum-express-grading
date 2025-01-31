const { Restaurant, Category, Comment, User } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    Promise.all([
      Restaurant.findByPk(req.params.id, {
        include: [
          Category,
          { model: User, as: 'FavoritedUsers' },
          { model: User, as: 'LikedUsers' }
        ]
      }),
      Comment.findAll({
        where: { restaurantId: req.params.id },
        order: [['createdAt', 'DESC']],
        include: User,
        raw: true,
        nest: true
      })
    ])
      .then(([restaurant, comments]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        return Promise.all([restaurant.increment('viewCounts', { by: 1 }), comments])
      })
      .then(([restaurant, comments]) => {
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUsers.some(l => l.id === req.user.id)

        res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked,
          comments
        })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category],
      raw: true,
      nest: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        res.render('dashboard', { restaurant })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', {
          restaurants,
          comments
        })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      include: [
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurants => {
        if (!restaurants) throw new Error("Can't not get restaurants data!")

        const results = restaurants.map(r => ({
          ...r.toJSON(),
          description: r.description.substring(0, 50),
          favoritedCount: r.FavoritedUsers.length,
          isFavorited: req.user && req.user.FavoritedRestaurants.some(fr => fr.id === r.id)
        }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount)
          .slice(0, 10)

        res.render('top-restaurants', { restaurants: results })
      })
      .catch(err => next(err))
  }
}

module.exports = restaurantController

/*
    return Restaurant.findAll({
      attributes: {
        include: [
          [sequelize.literal('( SELECT COUNT(*) FROM Favorites WHERE Favorites.restaurant_id = Restaurant.id)'), 'favoritedCount'],
          [sequelize.literal(`( SELECT COUNT(*) FROM Favorites WHERE Favorites.restaurant_id = Restaurant.id AND Favorites.user_id = ${req.user.id})`), 'isFavorited']
        ]
      },
      order: [[sequelize.literal('favoritedCount'), 'DESC']],
      limit: 10,
      raw: true
    })
      .then(restaurants => {
        if (!restaurants) throw new Error("Can't read Restaurants data")

        const results = restaurants.map(r => r.dataValues)

        res.render('top-restaurants', { restaurants: results })
      })
      .catch(err => next(err))
*/
