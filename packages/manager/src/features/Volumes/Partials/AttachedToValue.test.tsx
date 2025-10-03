import * as React from 'react';

import { volumeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AttachedToValue } from './AttachedToValue';

describe('Volume action menu', () => {
  it('should show Linode label if the volume is attached', () => {
    const volume = volumeFactory.build({
      linode_id: 1,
      linode_label: 'linode_1',
      io_ready: true,
    });

    const { getByText } = renderWithTheme(<AttachedToValue volume={volume} />);

    expect(getByText(volume.linode_label!)).toBeVisible();
  });

  it('should show Detach button if Linode is attached and onDetach function is provided', () => {
    const volume = volumeFactory.build({
      linode_id: 1,
      linode_label: 'linode_1',
      io_ready: true,
    });

    const onDetach = () => {};

    const { getByText } = renderWithTheme(
      <AttachedToValue onDetach={onDetach} volume={volume} />
    );

    expect(getByText(volume.linode_label!)).toBeVisible();
    expect(getByText('Detach')).toBeVisible();
  });

  it('should show Linode (restricted) if the Volume is attached to a restricted Linode', () => {
    const volume = volumeFactory.build({
      linode_id: 1,
      linode_label: null,
      io_ready: true,
    });

    const { getByText } = renderWithTheme(<AttachedToValue volume={volume} />);

    expect(getByText('Linode (restricted)')).toBeVisible();
  });

  it('should show Unattached if the Volume is not attached to a Linode', () => {
    const volume = volumeFactory.build({
      linode_id: null,
      linode_label: null,
      io_ready: false,
    });

    const { getByText } = renderWithTheme(<AttachedToValue volume={volume} />);

    expect(getByText('Unattached')).toBeVisible();
  });
});
