import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Markdown } from './Markdown';

const sampleMarkdown =
  '# Some markdown \n ```javascript\n const x = function() { return true; }\n```';

describe('Markdown component', () => {
  it('should render markdown content', () => {
    const { container } = renderWithTheme(
      <Markdown textOrMarkdown={sampleMarkdown} />
    );

    // Test for the presence of key elements rather than exact rendering
    expect(container.querySelector('h1')).toBeInTheDocument();
    expect(container.querySelector('code')).toBeInTheDocument();
    expect(container.textContent).toContain('Some markdown');
    expect(container.textContent).toContain('const x = function()');
  });
});
