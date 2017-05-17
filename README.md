# Medis

![Medis](http://getmedis.com/screen.png)

Medis is a beautiful, easy-to-use Redis management application built on the modern web with [Electron](https://github.com/atom/electron), [React](https://facebook.github.io/react/), and [Redux](https://github.com/rackt/redux). It's powered by many awesome Node.js modules, especially [ioredis](https://github.com/luin/ioredis) and [ssh2](https://github.com/mscdex/ssh2).

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Join the chat at https://gitter.im/luin/medis](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/luin/medis?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Medis starts with all the basic features you need:

* Keys viewing/editing
* SSH Tunnel for connecting with remote servers
* Terminal for executing custom commands
* Config viewing/editing

It also supports many advanced features:

* JSON/MessagePack format viewing/editing and built-in highlighting/validator
* Working with millions keys and key members without blocking the redis server
* Pattern manager for easy selecting a sub group of keys.

**Note**: Medis only supports Redis >= 2.8 version because `SCAN` command was introduced since 2.8. `SCAN` is very useful to get key list without blocking the server, which is crucial to the production environment. Because the latest stable is 3.0 and 2.6 is a very old version, Medis doesn't support it.

## Download Medis

You can download compiled versions of Medis for Mac OS X from [the release page](https://github.com/luin/medis/releases). Support for Windows and Linux is coming soon.

## Running Locally

1. Install dependencies

    $ npm install

2. Compile assets:

    $ npm run build

3. Run with Electron:

    $ npm run electron

## Connect to Heroku
Medis can connect to Heroku Redis addon to manage your data. You just need to call `heroku redis:credentials --app APP` to get your redis credential:

```shell
$ heroku redis:credentials --app YOUR_APP
redis://x:PASSWORD@HOST:PORT
```

And then input `HOST`, `PORT` and `PASSWORD` to the connection tab.

## I Love This. How do I Help?

* Simply star this repository :-)
* Help us spread the world on Facebook and Twitter
* Contribute Code! We're developers! (See Roadmap below)
* Medis is available on the Mac App Store as a paid software. I'll be very grateful if you'd like to buy it to encourage me to continue maintaining Medis. There are no additional features comparing with the open-sourced version, except the fact that you can enjoy auto updating that brought by the Mac App Store. <br> [![Download on the App Store](http://getmedis.com/download.svg)](https://itunes.apple.com/app/medis-gui-for-redis/id1063631769)

## Roadmap

* Windows and Linux version (with electron-packager)
* Support for SaaS Redis services
* Lua script editor
* Cluster management
* GEO keys supporting

## License

MIT
