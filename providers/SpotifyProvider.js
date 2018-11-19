'use strict'

const { ServiceProvider } = require('@adonisjs/fold')
const Spotify = require('../drivers/Spotify')

class SpotifyProvider extends ServiceProvider {
  register () {

    this.app.extend('Adonis/Addons/Ally', 'spotify', () => {
      return this.app.make(Spotify)
    })

  }

}

module.exports = SpotifyProvider
