module.exports = {
  directories:{
    app: '.',
  },
  files:[
    "./.webpack/**/*",
    "./package.json",
  ],
  appId: 'li.zihua.medis',
  productName: 'Medis',
  artifactName: '${name}-${os}-${arch}-${version}.${ext}',
  copyright: '© 2019, Zihua Li',
  // npmRebuild: 'false',
  // afterSign: "./appSign.js",
  mac: {
    icon: 'resources/icns/MyIcon.icns',
    // background: 'assets/DMGBG.png',
    // backgroundColor: '#6186ff',
    //entitlements: "sign/entitlements.plist",
    category: 'public.app-category.developer-tools',
    target: [
      'dmg',
      'zip',
      // 'mas'
    ],
    publish: [ 'github' ],
  },
  win: {
    target: 'nsis',
    icon: 'resources/icns/MyIcon.icns',
    publish: [ 'github' ]
  },
  linux: {
    target: 'AppImage',
    icon: 'resources/icns/Icon1024.png',
    publish: [ 'github' ]
  },
  nsis: {
    deleteAppDataOnUninstall: true,
    createDesktopShortcut: 'always'
    // include: 'nsis.nsh'
  },
  publish: null
}