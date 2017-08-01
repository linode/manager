# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.12.0] 2017-08-01
### Added
- added linode filtering #2271
- added user filtering #2282
- added nodebalancer filtering #2273
- added domains filtering #2272
- added support link to main header #2296
- enabled external source map #2314
- added stackscript list and delete support #2317
- moar contrast #2292
- added subheader for navigation to stackscripts, volumes, lists #2321
- added support for adding and editing stackscripts #2322
### Changed
- switched to webpack 2.6.0 #2278
- fetch api pages asynchronously #2274
- users view is a list #2282
- regrouped tokens and PATs and moved out oauth tokens #2284
- use source-map instead of module-eval-source-map for better errors #2214
- expire token automatically rather than after attempting a request #2295
- refactor and use modal body components more consistently #2189
- default to sort by label #2360
### Fixed
- set min zero requirements on relevant nodebalancer config fields #2313
- render correct tooltip data when switching between units #2315
- allow shutdown from Linode status dropdown #2340

## [0.11.6] 2017-07-21
### Added
- response_type to OAuth flow to conform to RFC 6749

## [0.11.5] 2017-07-18
### Fixed
- no 3rd-party script includes # 2294

## [0.11.4] 2017-07-18
### Fixed
- group by lowercase distribution vendor names #2309

## [0.11.3] 2017-07-18
### Added
- rebuild confirm check #2302

## [0.11.2] 2017-07-12
### Changed
- don't track pageviews on /oauth page #2269

## [0.11.1] 2017-07-12
### Added
- add delete IP support #2270
### Fixed
- add linode_deleteip event formatting #2270

## [0.11.0] 2017-07-11
### Added
- unit selection to graphs #2185
- support for no access tokens #2192
- volumes to oauth scopes #2224
### Changed
- shared vertical nav updates for components, styleguide, docs, #2218
- tone down the miniheader #2229
### Fixed
- input placeholder styles on nodebalancers ssl fields and domains fields #2188
- buttons page in styleguide #2213
### Removed
- NodeBalancer config label field where present #2224

## [0.10.0] 2017-06-27
### Added
- analytics in modals and selects #2083
- sentry for error tracking #2149
### Changed
- prevent graph from re-rendering needlessly #2153
- contributing guidelines to include new git flow #2106
- minor wording updates, beta > early-access #2146
- console.trace is now console.error #2111
### Fixed
- reset RDNS wording and only display when relevant #2140
- other linode in iptransfer must be in same datacenter #2145
- oauth scope formatting # 2139
- redirect to /linodes on delete #2147
- updated srv record target placeholder #2161
- removed details from TTL defaults on domains #2161
- add TTL defaults to dropdowns on domain record edits #2161
- adjust how editing A/AAAA records handles ipv4 and ipv6 #2161
- logout redirection #2177
- user permission page crash #2175
- a duplicate scss import #2172
- component imports that reference manager #2166
- renamed track event to emit event #2166

## [0.9.10] 2017-06-27
### Changed
- rename dnszone grant to domain

## [0.9.9] 2017-06-26
### Fixed
- overflowing text in domains txt record values now gets truncated

## [0.9.8] 2017-06-19
### Changed
- remove ReactGA completely and more detailed errors

## [0.9.7] 2017-06-19
### Changed
- skip ReactGA for sending exceptions

## [0.9.6] 2017-06-19
### Changed
- added ips to oauth scopes constants

## [0.9.5] 2017-06-16
### Fixed
- don't render private ipv4 on Linode list

## [0.9.4] 2017-06-16
### Fixed
- allow saving soa records on slave domains

## [0.9.3] 2017-06-16
### Fixed
- dont crash on no nodebalancer ipv6

## [0.9.2] 2017-06-16
### Fixed
- hide ipv6 when no slaac is available on linode dashboard

## [0.9.1] 2017-06-16
### Fixed
- networking glue code when no slaac and link-local ips are present

## [0.9.0] 2017-06-16
### Added
- object count to the delete modal #2062
- tooltip component, defaults to disabled, included on primary label and link table cells #2007, #2073, #2074
- ability to add additional IPs, links to opening a support ticket #2066
- enable private IP to the networking tab #2066
- delete IP functionality to the networking tab #2066
- global IP pools to networking tab #2066
- beta banner including link to the classic manager #2088
- required overwrite modal to backup restore #800
- missing check_body and check_path fields to NodeBalancer config active health check form section #2089
### Changed
- long text in link and label table cells are now truncated based on the width of the th, 
an ellipsis is shown with a tooltip enabled #2007
- network tab revamped, IP Sharing and IP Transfer split into 2 separate tabs #2066
- network tab now shows proper gateway for all addresses #2066
- API_ROOT and LOGIN_ROOT constants in manager no longer default to alpha, and instead default to cloud.linode.com #2088
### Fixed
- linode list and linode dashboard correctly shows ipv4 addresses #2066
- destroy all disks and configs when checked using backup restore #2084
- ensure Linodes outside of region are not available to backup restore #2084
- breaks in styleguide forms, styles, header etc #2081

## [0.8.3] 2017-06-12
### Changed
- reinstate hover states, collapsed borders on adjacent active tabs

## [0.8.2] 2017-06-12
### Fixed
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
