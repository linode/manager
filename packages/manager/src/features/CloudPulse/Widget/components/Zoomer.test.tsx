import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ZoomIcon } from './Zoomer';

import type { ZoomIconProperties } from './Zoomer';

describe('Cloud Pulse Zoomer', () => {
  it('Should render zoomer with zoom-out button', () => {
    const props: ZoomIconProperties = {
      handleZoomToggle: (_zoomInValue: boolean) => {},
      zoomIn: false,
    };
    const { getByTestId } = renderWithTheme(<ZoomIcon {...props} />);

    expect(getByTestId('zoom-out')).toBeInTheDocument();
  }),
    it('Should render zoomer with zoom-in button', () => {
      const props: ZoomIconProperties = {
        handleZoomToggle: (_zoomInValue: boolean) => {},
        zoomIn: true,
      };
      const { getByTestId } = renderWithTheme(<ZoomIcon {...props} />);

      expect(getByTestId('zoom-in')).toBeInTheDocument();
    });
});
