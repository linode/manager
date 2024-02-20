import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CombinedProps, FromLinodeContent } from './FromLinodeContent';

const mockProps: CombinedProps = {
  accountBackupsEnabled: false,
  imagesData: {},
  linodesData: [],
  regionsData: [],
  typesData: [],
  updateDiskSize: vi.fn(),
  updateImageID: vi.fn(),
  updateLinodeID: vi.fn(),
  updateRegionID: vi.fn(),
  updateTypeID: vi.fn(),
  userCannotCreateLinode: false,
};

describe('FromLinodeContent', () => {
  it('should render an empty state if the user has no Linodes', () => {
    const { getByText } = renderWithTheme(<FromLinodeContent {...mockProps} />);

    expect(
      getByText(
        'You do not have any existing Linodes to clone from. Please first create a Linode from either an Image or StackScript.'
      )
    ).toBeVisible();
  });

  it("should render a user's linodes", () => {
    const linodes = linodeFactory.buildList(1, {
      label: 'this-linode-should-render',
    });
    const { getByText } = renderWithTheme(
      <FromLinodeContent {...mockProps} linodesData={linodes} />
    );

    expect(getByText('this-linode-should-render')).toBeVisible();
  });
});
