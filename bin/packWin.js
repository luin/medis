const packager = require('electron-packager')
const path = require('path')
const pkg = require('../package')

const resourcesPath = path.join(__dirname, '..', 'resources')
console.log(resourcesPath);
console.log(path.join(resourcesPath, 'parent.plist'));
packager({
  dir: path.join(__dirname, '..'),
  appCopyright: '© 2019, Zihua Li',
  asar: true,
  overwrite: true,
  electronVersion: pkg.electronVersion,
  icon: path.join(resourcesPath, 'icns', 'WinIcon'),
  out: path.join(__dirname, '..', 'dist', 'out'),
  platform: 'win32',
  arch: 'ia32',
  prune: true,
}).then((res) => {
  console.log("Build Complete : " + res[0]);
})
