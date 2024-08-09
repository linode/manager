import React from 'react';

import { replaceNewlinesWithLineBreaks } from './replaceNewlinesWithLineBreaks';

describe('replaceNewlinesWithLineBreaks', () => {
  it('Replaces newlines with line breaks', () => {
    const noBreaks = 'test string with no line breaks';
    expect(replaceNewlinesWithLineBreaks(noBreaks)).toEqual([noBreaks]);

    const oneBreak = 'test string\nwith one break';
    expect(replaceNewlinesWithLineBreaks(oneBreak)).toEqual([
      <>
        test string
        <br />
      </>,
      'with one break',
    ]);

    const twoBreaks = 'test string\nwith two\nbreaks';
    expect(replaceNewlinesWithLineBreaks(twoBreaks)).toEqual([
      <>
        test string
        <br />
      </>,
      <>
        with two
        <br />
      </>,
      'breaks',
    ]);
  });
});
