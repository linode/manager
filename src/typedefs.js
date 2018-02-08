/**
 * @typedef {'ONE'} ONE
 * @typedef {'MANY'} MANY
 * @typedef {'PUT'} PUT
 * @typedef {'POST'} POST
 * @typedef {'DELETE'} DELETE
 *
 *
 * @typedef {ONE|MANY|PUT|POST|DELETE} Feature
 *
 *
 * @typedef {Object} ReduxConfig
 * @prop {string} name
 * @prop {number|string} primaryKey
 * @prop {Object.<string, ReduxConfig>} subresources
 * @prop {Array<Feature>} supports
 *
 *
 * @typedef {Object<string, Object>} Resource
 *
 *
 * @typedef {Object} Action
 * @prop {Resource} [resource]
 * @prop {Array<number|string>} ids
 *
 *
 * @typedef {Object} State
 *
 *
 * @typedef {Object} ActionCreator
 * @prop {Function} [one]
 * @prop {Function} [page]
 * @prop {Function} [all]
 * @prop {Function} [delete]
 * @prop {Function} [put]
 * @prop {Function} [post]
 **/
