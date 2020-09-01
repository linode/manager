import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';
import HighlightedMarkdown from './HighlightedMarkdown';

const sampleMarkdown =
  '# Some markdown \n ```\n const x = function() { return true; }\n```';

describe('HighlightedMarkdown component', () => {
  it('should highlight text consistently', () => {
    const { asFragment } = renderWithTheme(
      <HighlightedMarkdown textOrMarkdown={sampleMarkdown} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
