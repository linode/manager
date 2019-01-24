/**
 * @read https://github.com/Microsoft/TypeScript/issues/13965#issuecomment-278570200
 */
export default class ErrorClass extends Error {
  __proto__: Error;
  constructor(message?: string) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
  }
}
