// // import { handleEmbeddedHTML } from './RenderNotification';
// import * as React from 'react';
// import { sanitizeHTML } from 'src/utilities/sanitize-html';
// import Typography from 'src/components/core/Typography';

// const plainString =
//   'You have a notification consisting of a plain string with no embedded HTML.';
// const plainStringMessage = (
//   <Typography
//     dangerouslySetInnerHTML={{
//       __html: sanitizeHTML(plainString)
//     }}
//   />
// );

// // eslint-disable-next-line xss/no-mixed-html
// const embeddedHTMLString =
//   "We've updated our policies. See <a href='https://manager.linode.com/account/policy'>https://manager.linode.com/account/policy</a> for more information.";

// const messageWithEmbeddedHTML = (
//   <Typography
//     dangerouslySetInnerHTML={{
//       __html: sanitizeHTML(embeddedHTMLString)
//     }}
//   />
// );

// describe('Rendering notifications', () => {
//   describe('handling HTML embedded in notification messages as returned from the API', () => {
//     it('should return the plain string notification message as-is if no embedded HTML is present', () => {
//       // TODO: add assertions
//     });

//     it('should return JSX if embedded HTML is present', () => {
//       // TODO: add assertions
//     });
//   });
// });
