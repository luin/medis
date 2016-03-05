'use strict';

const path = require('path');
const packager = require('electron-packager')
const pkg = require('../package');

packager({
  arch: 'x64',
  platform: 'linux,win32,mas',
  dir: path.join(__dirname, '..'),
  'app-bundle-id': 'li.zihua.medis',
  'app-category-type': 'public.app-category.developer-tools',
  'app-version': pkg.version,
  'build-version': pkg.version,
  asar: true,
  icon: path.join(__dirname, '..', 'resources', 'icon'),
  name: 'Medis',
  out: path.join(__dirname, 'dist'),
  overwrite: true,
  prune: true,
}, function done (err, appPath) {
  console.log(arguments);
})

