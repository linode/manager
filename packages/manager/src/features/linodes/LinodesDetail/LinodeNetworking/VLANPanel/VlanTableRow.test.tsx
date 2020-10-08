import * as React from 'react';
import { truncateAndJoinJSXList } from './VlanTableRow';

describe('truncateAndJoinJSXList utility function', () => {
  const shortList = [1, 2, 3];
  const longList = [1, 2, 3, 4, 5, 6, 7, 8, 8, 10, 11, 12];
  const max = longList.length;

  const shortJSXList = shortList.map(item => {
    return <span key={item}>{item}</span>;
  });
  const longJSXList = longList.map(item => {
    return <span key={item}>{item}</span>;
  });

  it('should not have truncated text if the list count is less than or equal to the max', () => {
    const noTruncatedTextListLessThanMax = truncateAndJoinJSXList(
      shortJSXList,
      max
    );
    expect(noTruncatedTextListLessThanMax.props.children.length).toEqual(
      shortList.length
    );

    const noTruncatedTextListEqualsMax = truncateAndJoinJSXList(
      longJSXList,
      max
    );
    expect(noTruncatedTextListEqualsMax.props.children.length).toEqual(max);
  });

  it('should have truncated text that reads " plus [X] more" if the max is 5', () => {
    const truncatedListOfFive = truncateAndJoinJSXList(longJSXList, 5);
    const remainingItemCount = longJSXList.length - 5;
    expect(truncatedListOfFive.props.children[1].props['children']).toEqual(
      expect.arrayContaining([' ', 'plus ', remainingItemCount, ' more'])
    );
  });
});
