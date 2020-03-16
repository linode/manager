import { cleanup, render } from '@testing-library/react';
import * as React from 'react';

import HighlightedMarkdown from './HighlightedMarkdown';

const sampleMarkdown =
  '# Some markdown \n ```\n const x = function() { return true; }\n```';

afterEach(cleanup);

describe('HighlightedMarkdown component', () => {
  it('should highlight text consistently', () => {
    const { asFragment } = render(
      <HighlightedMarkdown textOrMarkdown={sampleMarkdown} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
