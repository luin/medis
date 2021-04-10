const packager = require('electron-packager')
const { makeUniversalApp } = require('@electron/universal')
const path = require('path')
const pkg = require('../package')
const { signAsync, flatAsync } = require('electron-osx-sign')

const resourcesPath = path.join(__dirname, '..', 'resources')

async function pack () {
  const opts = {
    dir: path.join(__dirname, '..'),
    appCopyright: '© 2019, Zihua Li',
    asar: true,
    overwrite: true,
    electronVersion: pkg.electronVersion,
    icon: path.join(resourcesPath, 'icns', 'MyIcon'),
    out: path.join(__dirname, '..', 'dist', 'out'),
    platform: 'darwin',
    appBundleId: `li.zihua.${pkg.name}`,
    appCategoryType: 'public.app-category.developer-tools',
  }

  // x86_64 build
  const x64Res = await packager(Object.assign(opts, { arch: 'x64' }))
  // arm64 (Apple Silicon) build
  const armRes = await packager(Object.assign(opts, { arch: 'arm64' }))

  // create universal app
  const universalAppPath = path.join(path.dirname(x64Res[0]),
    `${pkg.productName}-${opts.platform}-universal/${pkg.productName}.app`)
  await makeUniversalApp({
    x64AppPath: path.join(x64Res[0], `${pkg.productName}.app`),
    arm64AppPath: path.join(armRes[0], `${pkg.productName}.app`),
    outAppPath: universalAppPath,
    force: true
  })

  console.log('signing...', universalAppPath)
  await signAsync({
    app: universalAppPath,
    type: process.env.NODE_ENV === 'production'
      ? 'distribution'
      : 'development',
    entitlements: path.join(resourcesPath, 'parent.plist'),
    'entitlements-inherit': path.join(resourcesPath, 'child.plist'),
  })

  console.log('flating...', universalAppPath)
  await flatAsync({ app: universalAppPath })
}

pack().catch(function (err) {
  console.error(err)
  process.exit(1)
})
