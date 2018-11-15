'use strict'

const { ServiceProvider } = require('@adonisjs/fold')
const Spotify = require('../drivers/Spotify')

class SpotifyProvider extends ServiceProvider {
  register () {

    this.app.extend('Adonis/Src/Logger', 'spotify', () => {
      return new Spotify()
    })

  }

}

module.exports = SpotifyProvider
