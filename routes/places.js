const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const uploader = require('../configs/cloudinary-setup')

// include the model:
const Place = require('../models/place')

router.get('/', (req, res, next) => {
  Place.find()
    .then(resp => res.status(200).json(resp))
    .catch(err => next(err))
})

router.get('/highlights', (req, res, next) => {

  const quantity = req.query.quantity

  console.log(quantity)

  Place.find().limit(3)
    .then(resp => res.status(200).json(resp))
    .catch(err => next(err))

  

})

router.get("/search", (req, res, next) => {

  const miles = req.query.miles
  const lat = req.query.lat
  const lng = req.query.lng
  console.log("Recibiendo query params miles, lat, lng: ", miles, lat, lng)

  const milesToRadian = function (miles) {
    var earthRadiusInMiles = 3959;
    return miles / earthRadiusInMiles;
  }

  const query = {
    "loc": {
      $geoWithin: {
        $centerSphere: [[lat, lng], milesToRadian(miles)]
      }
    }
  }

  Place.find(query)
    .then(resp => res.status(200).json(resp))
    .catch(err => next(err))

})

router.get('/:id', (req, res, next) => {
  Place.findById(req.params.id)
    .then(place => {
      res.json(place)
    })
    .catch(err => {
      res.json(err)
    })
})

router.post('/', uploader.single("imageUrl"), (req, res, next) => {
  if (!req.file) {
    next(new Error('No file uploaded!'));
    return;
  }

  const coordinates= []
  coordinates.push(req.body.lat)
  coordinates.push(req.body.lng)

  Place.create( {
    name: req.body.name,
    description: req.body.description,
    imageUrl: req.file.path,
    loc:{
      coordinates:coordinates
    }
  })
    .then(place => {
      console.log('Created new thing: ', place);
      res.status(200).json(place)
      return res.redirect('/list');
    })
    .catch(err => next(err))
})

router.delete('/:id', (req, res, next) => {
  // to do
  //req.params.id
  res.status(200).json({ message: "DELETE aguardando implementacion. " })

})

router.patch('/:id', (req, res, next) => {
  // to do
  //req.params.id
  res.status(200).json({ message: "PATCH aguardando implementacion. " })

})

router.put('/:id',  uploader.single("imageUrl"), (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' })
    return
  }
  
  Place.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    description: req.body.description,
    imageUrl: req.file.path
  })
    .then(() => {
      res.json({ message: `Place id ${req.params.id} updated successfully.` })
    })
    .catch(error => {
      res.json(error)
    })
})

module.exports = router