import { handleEmbeddedHTML } from './RenderNotification';

const plainStringMessage =
  'You have a notification consisting of a plain string with no embedded HTML.';
// eslint-disable-next-line xss/no-mixed-html
const messageWithEmbeddedHTML =
  "We've updated our policies. See <a href='https://manager.linode.com/account/policy'>https://manager.linode.com/account/policy</a> for more information.";

describe('Rendering notifications', () => {
  describe('handleEmbeddedHTML function', () => {
    it('should return the plain string notification message as-is if no embedded HTML is present', () => {
      expect(handleEmbeddedHTML(plainStringMessage)).toMatch(
        plainStringMessage
      );
    });

    it('should return JSX if embedded HTML is present', () => {
      const returnedJSX = handleEmbeddedHTML(
        messageWithEmbeddedHTML
      ) as JSX.Element;

      expect(returnedJSX.props.children[0]).toBe(
        "We've updated our policies. See "
      );
    });
  });
});
