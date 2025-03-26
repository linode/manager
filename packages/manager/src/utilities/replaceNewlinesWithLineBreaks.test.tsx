import React from 'react';

import { replaceNewlinesWithLineBreaks } from './replaceNewlinesWithLineBreaks';

describe('replaceNewlinesWithLineBreaks', () => {
  it('Replaces newlines with line breaks', () => {
    const noBreaks = 'test string with no line breaks';
    expect(replaceNewlinesWithLineBreaks(noBreaks)).toEqual([noBreaks]);

    const oneBreak = 'test string\nwith one break';
    expect(replaceNewlinesWithLineBreaks(oneBreak)).toEqual([
      <React.Fragment key={0}>
        test string
        <br />
      </React.Fragment>,
      'with one break',
    ]);

    const twoBreaks = 'test string\nwith two\nbreaks';
    expect(replaceNewlinesWithLineBreaks(twoBreaks)).toEqual([
      <React.Fragment key={0}>
        test string
        <br />
      </React.Fragment>,
      <React.Fragment key={1}>
        with two
        <br />
      </React.Fragment>,
      'breaks',
    ]);
  });
});
