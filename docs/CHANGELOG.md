# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased] 
### Changed
- json removed and yaml added in it's place
- docsConvert.js renamed to prebuild.js and prebuld defined as an npm script
- api /objects read and conversion moved from objectsConvert.js (deleted) to prebuild.js
### Fixed
- broken /linode/types and /linode/types/:id endpoints
### Removed
- transform.sh no longer needed after yaml move

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
