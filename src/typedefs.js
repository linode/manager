/* eslint-disable */

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
 * @typedef {function(Array<number|string>, Object.<string, Object>): Array<number|string>} SortFunction
 *
 *
 * @typedef {Object} ReduxConfig
 * @prop {string} name
 * @prop {number|string} primaryKey
 * @prop {Object.<string, ReduxConfig>} subresources
 * @prop {Array<Feature>} supports
 * @prop {SortFunction} [sortFn]
 *
 *
 * @typedef {Object<string, Object>} Resource
 *
 *
 * @typedef {Object} OneAction
 * @prop {Array<number|string>} ids
 * @prop {Resource} [resource]
 * @prop {Function} [dispatch]
 *
 *
 * @typedef {Object} ManyAction
 * @prop {Array<number|string>} ids
 * @prop {Array<Object>} [page]
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
 *
 *
 **/
