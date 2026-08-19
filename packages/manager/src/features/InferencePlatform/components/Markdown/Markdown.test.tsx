import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Markdown } from './Markdown';

describe('Markdown', () => {
  it('does not render raw HTML from the markdown source', () => {
    // html: false means inline HTML in the source is escaped, not rendered.
    const { container } = renderWithTheme(
      <Markdown
        colorMode="light"
        textOrMarkdown="<div id='injected'>text</div>"
      />
    );

    expect(container.querySelector('#injected')).not.toBeInTheDocument();
    expect(container.textContent).toContain('<div');
  });

  it('adds target="_blank" and rel="noopener noreferrer" to links when openLinksInNewTab is true', () => {
    const { container } = renderWithTheme(
      <Markdown
        colorMode="light"
        openLinksInNewTab
        textOrMarkdown="[link](https://example.com)"
      />
    );

    const anchor = container.querySelector('a');
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not add target or rel to links when openLinksInNewTab is false', () => {
    const { container } = renderWithTheme(
      <Markdown
        colorMode="light"
        openLinksInNewTab={false}
        textOrMarkdown="[link](https://example.com)"
      />
    );

    const anchor = container.querySelector('a');
    expect(anchor).not.toHaveAttribute('target');
    expect(anchor).not.toHaveAttribute('rel');
  });
});
