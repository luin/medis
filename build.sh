#!/bin/bash

#dev
#npm run watch
#electron .
npm run build
electron-packager . ElectronRedisUtil --out ../medis-release -all --icon=./resources/icns/Myicon.icns --overwrite
open ../medis-release
