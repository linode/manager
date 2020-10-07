import * as React from 'react';
import { truncateAndJoinJSXList } from './VlanTableRow';
import { Link } from 'react-router-dom';

describe('truncateAndJoinJSXList utility function', () => {
  const list = [0, 1, 2, 3];
  const jsxList = list.map(item => {
    return (
      <Link key={item} to={`/test`}>
        {item}
      </Link>
    );
  });

  const truncatedList = truncateAndJoinJSXList(jsxList, 3);
  const truncatedText = [' ', 'plus ', 1, ' more'];

  it('should have truncated text that reads " plus 1 more"', () => {
    expect(truncatedList.props.children[1].props['children']).toEqual(
      expect.arrayContaining(truncatedText)
    );
  });
});
