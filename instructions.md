
## Registering provider

Make sure to register the provider inside `start/app.js` file in `providers` group after `Ally` provider.

```js
const providers = [
  'adonis-ally-spotify/providers/SpotifyProvider'
]
```

Add additional field to `config/services.js` file in `ally` group.

```js
...
/*
 |--------------------------------------------------------------------------
 | Spotify Configuration
 |--------------------------------------------------------------------------
 |
 | You can access your application credentials from spotify developers
 | portal. https://developer.spotify.com
 |
 */
spotify: {
  clientId: Env.get('SPOTIFY_CLIENT_ID'),
  clientSecret: Env.get('SPOTIFY_CLIENT_SECRET'),
  redirectUri: `${Env.get('APP_URL')}/auth/spotify`
}
...
```
## Env variables

`Spotify` All driver relies on two main Env variables: `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
