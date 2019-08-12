import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { generateHTMLFromString, wrapStringInLink } from './TaxBanner';

afterEach(cleanup);

describe('Utility Functions', () => {
  it('Wrapping Strings in Links', () => {
    const { queryByTestId } = render(
      <MemoryRouter>
        <div data-testid="hello">
          {wrapStringInLink(
            'hello world I am Marty',
            'I AM',
            'internal',
            '/account/billing'
          )}
        </div>
      </MemoryRouter>
    );

    const container = queryByTestId('hello');
    expect(container).toContainHTML(
      '<div data-testid="hello">hello world <a href="/account/billing">I am</a> Marty</div>'
    );
  });

  it('should generate the HTML from a string', () => {
    const { queryByTestId } = render(
      <MemoryRouter>
        <div data-testid="hello">
          {generateHTMLFromString(
            'Please see docs at this location. And change your account.',
            {
              account: {
                link: '/account/billing',
                text_to_replace: 'your account',
                type: 'internal'
              },
              docs: {
                link: 'https://linode.com',
                text_to_replace: 'this location',
                type: 'external'
              }
            }
          )}
        </div>
      </MemoryRouter>
    );

    const container = queryByTestId('hello');
    expect(container).toContainHTML(
      '<div data-testid="hello">Please see docs at <a href="https://linode.com" target="_blank">this location</a>. And change <a href="/account/billing">your account</a>.</div>'
    );
  });
});
