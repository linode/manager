import * as React from 'react';

import { volumeFactory } from 'src/factories';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { VolumeTableRow } from './VolumeTableRow';
import userEvent from '@testing-library/user-event';

const attachedVolume = volumeFactory.build({
  linode_id: 0,
  linode_label: 'thisLinode',
  region: 'us-east',
});

const unattachedVolume = volumeFactory.build({
  linode_id: null,
  linode_label: null,
});

const handlers = {
  handleAttach: jest.fn(),
  handleDelete: jest.fn(),
  handleDetach: jest.fn(),
  openForClone: jest.fn(),
  openForConfig: jest.fn(),
  openForEdit: jest.fn(),
  openForResize: jest.fn(),
};

describe('Volume table row', () => {
  it("should show the attached Linode's label if present", () => {
    const { getByTestId, getByText, getByLabelText } = renderWithTheme(
      wrapWithTableBody(<VolumeTableRow {...handlers} {...attachedVolume} />)
    );

    // Check row for basic values
    expect(getByText(attachedVolume.label));
    expect(getByText(attachedVolume.size, { exact: false }));
    expect(getByTestId('region'));
    expect(getByText(attachedVolume.linode_label!));

    userEvent.click(getByLabelText(/^Action menu for/));

    // Make sure there is a detach button
    expect(getByText('Detach'));
  });

  it('should show Unattached if the Volume is not attached to a Linode', () => {
    const { getByText, getByLabelText } = renderWithTheme(
      wrapWithTableBody(<VolumeTableRow {...handlers} {...unattachedVolume} />)
    );
    expect(getByText('Unattached'));

    userEvent.click(getByLabelText(/^Action menu for/));

    // Make sure there is an attach button
    expect(getByText('Attach'));
  });
});

describe('Volume table row - for linodes detail page', () => {
  it("should show the attached Linode's label if present", () => {
    const {
      getByLabelText,
      getByText,
      queryByTestId,
      queryByText,
    } = renderWithTheme(
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

    userEvent.click(getByLabelText(/^Action menu for/));

    // Make sure there is a detach button
    expect(getByText('Detach'));
  });
});
