# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [0.8.2] 2017-06-12
### fixed
- retain tab active border color

## [0.8.1] 2017-06-12
### Changed
- reduced padding and margin on tabs

## [0.8.0] 2017-06-08
### Changed
- added Linode Employee identifier to ticket reply #2038
- confirmation added to revoke token button #2033
- uses classic Manager graph colors #2002
- confirmation added to reboot and power off #1987
- delete added to Linode dropdown #1987

### Fixed
- fixed support ticket layout and clearing text field on reply submission #2038
- fixed notification text not granular enough #2032
- fixed page title changes when the user triggers a change on the page #2016
- fixed error handling to display a modal on error except for 401s and 404s #2009
- launch lish is available from any Linode state #1987
- rebuild and bulk actions trigger power progress bar #1987
- fixed page source link 404 #2044

## [0.7.2] 2017-06-02
### Fixed
- two_factor_auth on profile is a boolean #1997

## [0.7.1] 2017-05-31
### Fixed
- fixed nodebalancer config create #1981

## [0.7.0] 2017-05-31
### Changed
- added delete nodebalancer config #1879
- added delete nodebalancer config node #1880
- added missing fields to soa record #1768
- dropped help buttons #1897
- scroll to top of page in docs on page change #1918
- reworded docs error section #1917
- added app loader #1859
- redirect /reference to home #1958
- added referral page #1914
- increased docs endpoint column width #1978
- replaced docs warning html #1966
- delayed preload calls #1962
- remove built docs files #1970
- graphs start y access at zero #1969
- optimized networking requests #1923
### Fixed
- updated oauth docs to link to new location #1896
- render nodebalancer config events correctly #1895
- format graph tooltip data correctly #1837
- fixed echoed docs snippet to prevent shell interpretation #1898
- fixed array rendering in docs #1899
- fixed tabs bug #1892
- fixed UK flag rendering and stop displaying tokyo1 #1893
- fixed weblish connection #1925
- fixed ipv4 rendering on dashboard #1919
- fixed slave create bug #1957
- fixed bad reference in docs breadcrumbs #1963
- fixed PAT creation #1924
- fixed disk password reset #1961
- misc css fixes #1922
- fixed docs linode types #1964
- fixed rescue mode disk mapping #1959
- fixed domain record deletion messages #1960

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
