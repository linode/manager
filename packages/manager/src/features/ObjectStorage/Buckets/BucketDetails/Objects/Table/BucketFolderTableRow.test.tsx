import * as React from 'react';

import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { BucketFolderTableRow } from './BucketFolderTableRow';

import type { FolderTableRowProps } from './BucketFolderTableRow';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    Link: ({
      to,
      children,
      ...props
    }: {
      children: React.ReactNode;
      to: string;
    }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe('BucketFolderTableRow', () => {
  it('renders a link with URI-encoded special characters', async () => {
    const specialCharsProps: FolderTableRowProps = {
      displayName: 'folder-with-special-chars...',
      folderName: 'folder-with-special-chars <>#%+{}|^[]`;?:@=&$',
      handleClickDelete: () => {},
    };

    const { getByRole } = renderWithTheme(
      wrapWithTableBody(<BucketFolderTableRow {...specialCharsProps} />)
    );

    const link = getByRole('link');

    expect(link).toHaveAttribute(
      'href',
      '?prefix=folder-with-special-chars%20%3C%3E%23%25%2B%7B%7D%7C%5E%5B%5D%60%3B%3F%3A%40%3D%26%24'
    );
  });
});
