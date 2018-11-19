'use strict'

const got = require('got')

const CE = require('@adonisjs/ally/src/Exceptions')
const OAuth2Scheme = require('@adonisjs/ally/src/Schemes/OAuth2')
const AllyUser = require('@adonisjs/ally/src/AllyUser')
const utils = require('@adonisjs/ally/lib/utils')
const _ = require('lodash')

/**
 * Spotify driver to authenticate a user using
 * OAuth2 scheme.
 *
 * @class Spotify
 * @constructor
 */
class Spotify extends OAuth2Scheme {
  constructor (Config) {
    const config = Config.get('services.ally.spotify')

    utils.validateDriverConfig('spotify', config)
    utils.debug('spotify', config)

    super(config.clientId, config.clientSecret, config.redirectUri)

    /**
     * Oauth specific values to be used when creating the redirect
     * url or fetching user profile.
     */
    this._redirectUri = config.redirectUri
    this._redirectUriOptions = Object.assign({ response_type: 'code' }, config.options)

    /**
     * Public fields to be mutated from outside
     */
    this.scope = _.size(config.scope) ? config.scope : ['user-read-private',' user-read-email']
    this.fields = _.size(config.fields) ? config.fields : ['name', 'email', 'gender', 'verified', 'link']
  }

  /**
   * Injections to be made by the IoC container
   *
   * @attribute inject
   *
   * @return {Array}
   */
  static get inject () {
    return ['Adonis/Src/Config']
  }

  /**
   * Returns a boolean telling if driver supports
   * state
   *
   * @method supportStates
   *
   * @return {Boolean}
   */
  get supportStates () {
    return true
  }

  /**
   * Scope seperator for seperating multiple
   * scopes.
   *
   * @attribute scopeSeperator
   *
   * @return {String}
   */
  get scopeSeperator () {
    return ' '
  }

  /**
   * Base url to be used for constructing
   * spotify oauth urls.
   *
   * @attribute baseUrl
   *
   * @return {String}
   */
  get baseUrl () {
    return 'https://accounts.spotify.com'
  }

  /**
   * Api url to be used for constructing
   * spotify oauth urls.
   *
   * @attribute baseUrl
   *
   * @return {String}
   */
  get apiUrl () {
    return 'https://api.spotify.com/v1'
  }

  /**
   * Relative url to be used for redirecting
   * user.
   *
   * @attribute authorizeUrl
   *
   * @return {String} [description]
   */
  get authorizeUrl () {
    return 'authorize'
  }

  /**
   * Relative url to be used for exchanging
   * access token.
   *
   * @attribute accessTokenUrl
   *
   * @return {String}
   */
  get accessTokenUrl () {
    return 'api/token'
  }

  /**
   * Returns the user profile as an object using the
   * access token.
   *
   * @method _getInitialFields
   *
   * @param   {String} accessToken
   *
   * @return  {Object}
   *
   * @private
   */
  async _getUserProfile (accessToken) {
    const profileUrl = `${this.apiUrl}/me`

    const response = await got(profileUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      json: true
    })

    return response.body
  }

  /**
   * Normalize the user profile response and build an Ally user.
   *
   * @param {object} userProfile
   * @param {object} accessTokenResponse
   *
   * @return {object}
   *
   * @private
   */
  _buildAllyUser (userProfile, accessTokenResponse) {
    const user = new AllyUser()
    const expires = _.get(accessTokenResponse, 'result.expires_in')

    const avatarUrl = userProfile.images[0].url

    user.setOriginal(userProfile)
      .setFields(
        userProfile.id,
        userProfile.display_name,
        userProfile.email,
        userProfile.name,
        userProfile.country,
        avatarUrl
      )
      .setToken(
        accessTokenResponse.accessToken,
        accessTokenResponse.refreshToken,
        null,
        expires ? Number(expires) : null
      )

    return user
  }

  /**
   * Returns the redirect url for a given provider.
   *
   * @method getRedirectUrl
   *
   * @param {String} [state]
   *
   * @return {String}
   */
  async getRedirectUrl (state) {
    const options = state ? Object.assign(this._redirectUriOptions, { state }) : this._redirectUriOptions
    return this.getUrl(this._redirectUri, this.scope, options)
  }

  /**
   * Parses provider error by fetching error message
   * from nested data property.
   *
   * @method parseProviderError
   *
   * @param  {Object} error
   *
   * @return {Error}
   */
  parseProviderError (error) {
    const parsedError = _.isString(error.data) ? JSON.parse(error.data) : null
    const message = _.get(parsedError, 'error.message', error)
    return CE.OAuthException.tokenExchangeException(message, error.statusCode, parsedError)
  }

  /**
   * Parses the redirect errors returned by facebook
   * and returns the error message.
   *
   * @method parseRedirectError
   *
   * @param  {Object} queryParams
   *
   * @return {String}
   */
  parseRedirectError (queryParams) {
    return queryParams.error_message || 'Oauth failed during redirect'
  }

  /**
   * Returns the user profile with it's access token, refresh token
   * and token expiry.
   *
   * @method getUser
   *
   * @param {Object} queryParams
   * @param {String} [originalState]
   *
   * @return {Object}
   */
  async getUser (queryParams, originalState) {
    const code = queryParams.code
    const state = queryParams.state

    /**
     * Throw an exception when query string does not have
     * code.
     */
    if (!code) {
      const errorMessage = this.parseRedirectError(queryParams)
      throw CE.OAuthException.tokenExchangeException(errorMessage, null, errorMessage)
    }

    /**
     * Valid state with original state
     */
    if (state && originalState !== state) {
      throw CE.OAuthException.invalidState()
    }

    const accessTokenResponse = await this.getAccessToken(code, this._redirectUri, {
      grant_type: 'authorization_code'
    })

    const userProfile = await this._getUserProfile(accessTokenResponse.accessToken)
    return this._buildAllyUser(userProfile, accessTokenResponse)
  }

  /**
   *
   * @param {string} accessToken
   * @param {array} fields
   */
  async getUserByToken (accessToken) {
    const userProfile = await this._getUserProfile(accessToken)
    return this._buildAllyUser(userProfile, { accessToken, refreshToken: null })
  }
}

module.exports = Spotify
