# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [0.6.2] 2017-05-26
### Fixed
- fixed weblish to use correct wss domain

## [0.6.1] 2017-05-26
### Fixed
- fixed domain event rendering

## [0.6.0] 2017-05-24
### Changed
- lookup lish domains based on datacenter #1795
- delay fetching kernels until config pages #1846
- increase timeout between event requests #1856
- border-right on docs layout #1843
- added indicator to elements with title attribute #1840
- added nested response objects #1755
- removed referrals page #1838
- added docs python guide #1763
- lish not hard-coded to alpha #1795
- added nodebalancer graphs #1805

### Fixed
- domain groups displayed correctly #1844
- fixed mass delete #1845
- fixed missing response examples #1849
- fixed plan style #1783
- fixed node up down display #1780
- fixed backup price calculation #1783
- fixed plan price calculation #1814

## [0.5.6] 2017-05-19
### Fixed
- fixed ipv4 rendering in nodebalancers list #1826

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
