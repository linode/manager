import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Markdown } from './Markdown';

const sampleMarkdown =
  '# Some markdown \n ```javascript\n const x = function() { return true; }\n```';

describe('Markdown component', () => {
  it('should highlight text consistently', () => {
    const { asFragment } = renderWithTheme(
      <Markdown textOrMarkdown={sampleMarkdown} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
