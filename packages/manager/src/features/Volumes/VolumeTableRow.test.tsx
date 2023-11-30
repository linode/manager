import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { volumeFactory } from 'src/factories';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { VolumeTableRow } from './VolumeTableRow';
import { ActionHandlers } from './VolumesActionMenu';

const attachedVolume = volumeFactory.build({
  linode_id: 0,
  linode_label: 'thisLinode',
  region: 'us-east',
});

const unattachedVolume = volumeFactory.build({
  linode_id: null,
  linode_label: null,
});

const handlers: ActionHandlers = {
  handleAttach: vi.fn(),
  handleClone: vi.fn(),
  handleDelete: vi.fn(),
  handleDetach: vi.fn(),
  handleDetails: vi.fn(),
  handleEdit: vi.fn(),
  handleResize: vi.fn(),
};

describe('Volume table row', () => {
  it("should show the attached Linode's label if present", () => {
    const { getByLabelText, getByTestId, getByText } = renderWithTheme(
      wrapWithTableBody(
        <VolumeTableRow handlers={handlers} volume={attachedVolume} />
      )
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
    const { getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(
        <VolumeTableRow handlers={handlers} volume={unattachedVolume} />
      )
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
        <VolumeTableRow
          handlers={handlers}
          isDetailsPageRow
          volume={attachedVolume}
        />
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
