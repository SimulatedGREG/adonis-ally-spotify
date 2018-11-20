# Adonis Ally Spotify <img src="https://reps.ams3.cdn.digitaloceanspaces.com/spotify_logo.png" width="25px" height="25px">

This service provider adds Spotify as a driver to Adonis Ally.

<img src="http://res.cloudinary.com/adonisjs/image/upload/q_100/v1497112678/adonis-purple_pzkmzt.svg" width="200px" align="right" hspace="30px" vspace="140px">

## Setup

Make sure to read [instructions.md](instructions.md) on how to set up.

## Node/OS Target

This repo/branch is supposed to run fine on all major OS platforms and targets `Node.js >=7.0`

### General Practices

Since Es6 is in, you should strive to use latest features. For example:

1. Use `Spread` over `arguments` keyword.
2. Never use `bind` or `call`. After calling these methods, we cannot guarantee the scope of any methods and in AdonisJs codebase we do not override the methods scope.
3. Make sure to write proper docblock.

## Issues & PR

It is always helpful if we try to follow certain practices when creating issues or PR's, since it will save everyone's time.

1. Always try creating regression tests when you find a bug (if possible).
2. Share some context on what you are trying to do, with enough code to reproduce the issue.
3. For general questions, please create a forum thread.
4. When creating a PR for a feature, make sure to create a parallel PR for docs too.
