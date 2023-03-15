import * as React from 'react';
import { volumeFactory } from 'src/factories';
import { VolumeTableRow } from './VolumeTableRow';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

const attachedVolume = volumeFactory.build({
  region: 'us-east',
  linode_id: 0,
  linode_label: 'thisLinode',
});

const unattachedVolume = volumeFactory.build({
  linode_label: null,
  linode_id: null,
});

const handlers = {
  openForEdit: jest.fn(),
  openForResize: jest.fn(),
  openForClone: jest.fn(),
  openForConfig: jest.fn(),
  handleAttach: jest.fn(),
  handleDetach: jest.fn(),
  handleDelete: jest.fn(),
};

describe('Volume table row', () => {
  it("should show the attached Linode's label if present", () => {
    const { getByText, getByTestId } = renderWithTheme(
      wrapWithTableBody(<VolumeTableRow {...handlers} {...attachedVolume} />)
    );

    // Check row for basic values
    expect(getByText(attachedVolume.label));
    expect(getByText(attachedVolume.size, { exact: false }));
    expect(getByTestId('region'));
    expect(getByText(attachedVolume.linode_label!));

    // Make sure there is a detach button
    expect(getByText('Detach'));
  });

  it('should show Unattached if the Volume is not attached to a Linode', () => {
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<VolumeTableRow {...handlers} {...unattachedVolume} />)
    );
    expect(getByText('Unattached'));
    // Make sure there is an attach button
    expect(getByText('Attach'));
  });
});

describe('Volume table row - for linodes detail page', () => {
  it("should show the attached Linode's label if present", () => {
    const { getByText, queryByText, queryByTestId } = renderWithTheme(
      wrapWithTableBody(
        <VolumeTableRow {...handlers} {...attachedVolume} isDetailsPageRow />
      )
    );

    // Check row for basic values
    expect(getByText(attachedVolume.label));
    expect(getByText(attachedVolume.size, { exact: false }));

    // Because we are on a Linode details page that has the region, we don't need to show
    // the volume's region. A Volume attached to a Linode must be in the same region.
    expect(queryByTestId('region')).toBeNull();

    // Because we are on a Linode details page, we don't need to show the Linode label
    expect(queryByText(attachedVolume.linode_label!)).toBeNull();

    // Make sure there is a detach button
    expect(getByText('Detach'));
  });
});
