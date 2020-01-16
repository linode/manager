import * as React from 'react';

// Function component that simply renders its children. Useful when you may want
// to wrap other components based on some condition. Example:
//
// const Wrapper = myCondition ? RealComponent : RenderChildren;
// return (
//   <Wrapper>
//     {/* ... */}
//   </Wrapper>
// );
export const RenderChildren: React.FC<{}> = props => {
  return <>{props.children}</>;
};
