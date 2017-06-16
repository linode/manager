# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [0.8.0] 2017-06-16
### Added
- info block to the docs intro which points to testing with cURL and how to get started with a PAT #2072
- OAuth scope denotation to endpoint methods throughout the docs #2075
- introductory python guides #2085
- python wrapper API documentation #2085
### Changed
- reorganized guides into guides and libraries, cURL and python guides now exist on the same index #2085
### Fixed
- missing method response field and method request param types denotations #2070

## [0.7.3] 2017-06-09
### Added
- added linode_kvmify to account/events action enums
### Changed
- account/events action enums renamed from dns > domain
- renamed domains display_group to group

## [0.7.2] 2017-06-09
### Changed
- reorganized routes and added index redirect from /v4/ to /v4/introduction

## [0.7.1] 2017-06-09
### Changed
- distribution "recommended" renamed to "deprecated"

## [0.7.0] 2017-06-08
### Added
- required and optional denotation to method params
- collapsed by default and toggle for response examples

## [0.6.0] 2017-06-07
### Added
- Syntax highlighting for code examples
- Copy to clipboard icons for examples
### Fixed
- added missing cost indicators to methods

## [0.5.2] 2017-06-07
### Fixed
- added missing Authenticated denotations with icons to endpoints

## [0.5.1] 2017-06-07
### Fixed
- Made the $api_root and $version variables from yaml render to the constants in the prebuild step

## [0.5.0] 2017-06-06
### Added
- cURL guide #1878
### Fixed
- updated duplicate base version vars to use API_VERSION, prebuild script uses environment var if present
- include original /reference redirect to the new /v4/introduction #2019
### Changed
- updated Introduction section #2008

## [0.4.0] 2017-06-05
### Added
- /v4 to the base of all urls

## [0.3.2] 2017-06-02
### Fixed
- examples typo in linode/instances/:id/ips/sharing, which caused a page break

## [0.3.1] 2017-06-01
### Fixed
- temporary fix for `npm run prebuild` incorrect reference

## [0.3.0] 2017-05-31
### Added
- .gitignore file #1970
- /reference default redirect to /introduction #1958
### Changed
- json removed and yaml added in it's place #1909
- docsConvert.js renamed to prebuild.js and prebuld defined as an npm script #1909
- api /objects read and conversion moved from objectsConvert.js (deleted) to prebuild.js #1909
- src/api.js, which is now ignored since it's built #1970
- increased with on endpoint index table headers for longer urls #1968
### Fixed
- broken /reference crumbs #1963
- broken /linode/types and /linode/types/:id endpoints #1964
### Removed
- transform.sh no longer needed after yaml move #1909

## [0.2.1] 2017-05-26
### Fixed
- subtle tabs bug which caused tab content to not be rendered, python examples now show
- example formatting for arrays, some additional schema definitions in tables for the same arrays

## [0.2.0] 2017-05-23
### Added
- Nested object schemas and examples for method params and responses
- Nested enumerations for method responses
- Python guide section intro

### Fixed
- Missing response examples for GETs

## [0.1.1] 2017-05-17
### Fixed
- de-duped protocols in some urls since env vars provide the protocol with base urls at build time

## [0.1.0] 2017-05-17
### Added
- changelog file
