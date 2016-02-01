'use strict';

const conventionalGithubReleaser = require('conventional-github-releaser');
const path = require('path');
// const Github = require('github');
const pkg = require('../package.json');

// const github = new Github({
//   version: '3.0.0'
// });

const AUTH = {
  type: 'oauth',
  token: process.env.CONVENTIONAL_GITHUB_RELEASER_TOKEN
};

conventionalGithubReleaser(AUTH, {
  preset: 'angular',
  pkg: {
    path: path.join(__dirname, '..', 'package.json')
  }
}, function (err, res) {
  process.exit(0);
  // console.log(err, res);
  // const id = res[0].value.id;
  // github.authenticate(AUTH);
  // github.releases.uploadAsset({
  //   id,
  //   owner: 'luin',
  //   repo: 'medis',
  //   name: `medis-v${pkg.version}-mac-x64.zip`,
  //   filePath: path.join(__dirname, '..', 'medis.zip')
  // }, function (err, res) {
  //   console.log(err, res);
  //   process.exit(0);
  // });
});
