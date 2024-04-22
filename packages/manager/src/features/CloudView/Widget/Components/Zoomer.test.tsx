import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ZoomIcon } from './Zoomer';

describe('Zoomer Component', () => {
  it('renders zoom in icon when zoomin prop is true', () => {
    let zoomIn = true;

    const handleZoomToggle = (zoomInParameter: boolean) => {
      zoomIn = zoomInParameter;
    };

    const { getByTestId } = renderWithTheme(
      <ZoomIcon handleZoomToggle={handleZoomToggle} zoomIn={zoomIn} />
    );
    expect(getByTestId('ZoomInMapIcon')).toBeInTheDocument();
  });

  it('renders zoom out icon when zoomin prop is false', () => {
    let zoomIn = false;

    const handleZoomToggle = (zoomInParameter: boolean) => {
      zoomIn = zoomInParameter;
    };

    const { getByTestId } = renderWithTheme(
      <ZoomIcon handleZoomToggle={handleZoomToggle} zoomIn={zoomIn} />
    );
    expect(getByTestId('ZoomOutMapIcon')).toBeInTheDocument();
  });
});
