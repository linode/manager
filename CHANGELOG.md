# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [0.5.6] 2017-05-19
### Fixed
- fixed ipv4 rendering in nodebalancers list

## [0.5.5] 2017-05-19
### Fixed
- fixed region rendering #1823

## [0.5.4] 2017-05-19
### Fixed
- fixed ipv4 rendering #1817

## [0.5.3] 2017-05-18
### Fixed
- fixed miscalculated plan values #1811

## [0.5.2] 2017-05-18
### Fixed
- fixed user restricted radio #1808

## [0.5.1] 2017-05-18
### Fixed
- fixed reset my application secret #1801

## [0.5.0] 2017-05-18
### Fixed
- fix tests and linter errors #1770
- excess profile requests #1793
- static endpoint requests reference error #1800

### Changed
- update TFA forms with success states #1774
- simplify initial api call logic #1770
- now using `npm --no-git-tag-version version patch|minor|major` to bump versions so that shrinkwrap also gets updated
