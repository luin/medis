const packager = require('electron-packager')
const path = require('path')
const pkg = require('../package')
const flat = require('electron-osx-sign').flat

packager({
  dir: path.join(__dirname, '..'),
  appCopyright: '© 2017, Zihua Li',
  asar: true,
  overwrite: true,
  electronVersion: pkg.electronVersion,
  icon: path.join(__dirname, '..', 'icns', 'MyIcon'),
  out: path.join(__dirname, '..', 'out'),
  platform: 'mas',
  appBundleId: `li.zihua.${pkg.name}`,
  appCategoryType: 'public.app-category.developer-tools',
  osxSign: {
    type: process.env.NODE_ENV === 'production' ? 'distribution' : 'development',
    entitlements: path.join(__dirname, '..', 'parent.plist'),
    'entitlements-inherit': path.join(__dirname, '..', 'child.plist')
  }
}, function (err, res) {
  if (err) {
    throw err;
  }

  const app = path.join(res[0], `${pkg.productName}.app`)
  console.log('flating...', app)
  flat({ app }, function done (err) {
    if (err) {
      throw err
    }
    process.exit(0);
  })
})
