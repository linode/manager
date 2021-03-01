// This pattern courtesy of: https://blog.hackages.io/conditionally-wrap-an-element-in-react-a8b9a47fab2
//
// ConditionalWrapper evaluates a given condition and passes its children
// through the given `wrapper` function only if the condition is true.
//
// Example usage:
//
// <ConditionalWrapper
//   condition={shouldWrapWithLink}
//   wrapper={children => <a href="example.com">{children}</a>}
// >
//   <h1>Maybe wrapped in a link</h1>
// </ConditionalWrapper>

import * as React from 'react';

interface Props {
  condition: boolean;
  wrapper: (children: React.ReactNode) => React.ReactElement;
}

export const ConditionalWrapper: React.FC<Props> = (props) => {
  const { condition, wrapper, children } = props;
  return condition ? wrapper(children) : <>{children}</>;
};

export default ConditionalWrapper;
