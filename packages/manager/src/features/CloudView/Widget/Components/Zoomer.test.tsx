import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ZoomIcon } from './Zoomer';

describe('Zoomer Component', () => {
  it('renders zoom in icon when zoomin prop is true', () => {
    const handleZoomToggle = (zoomIn: boolean) => {};

    const { getByTestId } = renderWithTheme(
      <ZoomIcon handleZoomToggle={handleZoomToggle} zoomIn={true} />
    );
    expect(getByTestId('ZoomInMapIcon')).toBeInTheDocument();
  });
  it('renders zoom out icon when zoomin prop is false', () => {
    const handleZoomToggle = (zoomIn: boolean) => {};

    const { getByTestId } = renderWithTheme(
      <ZoomIcon handleZoomToggle={handleZoomToggle} zoomIn={false} />
    );
    expect(getByTestId('ZoomOutMapIcon')).toBeInTheDocument();
  });

  it('changes from zoomin to zoomout on click when zoom in is present', () => {
    const handleZoomToggle = (zoomIn: boolean) => {};

    const { getByTestId } = renderWithTheme(
      <ZoomIcon handleZoomToggle={handleZoomToggle} zoomIn={true} />
    );

    let icon = getByTestId('ZoomInMapIcon');

    expect(icon).toBeInTheDocument();

    fireEvent.click(icon);

    // now it should be changed to ZoomOut
    icon = getByTestId('ZoomOutMapIcon');

    expect(icon).toBeInTheDocument();
  });

  it('changes from zoomout to zoomin on click when zoom out is present', () => {
    const handleZoomToggle = (zoomIn: boolean) => {};

    const { getByTestId } = renderWithTheme(
      <ZoomIcon handleZoomToggle={handleZoomToggle} zoomIn={false} />
    );

    let icon = getByTestId('ZoomOutMapIcon');

    expect(icon).toBeInTheDocument();

    fireEvent.click(icon);

    // now it should be changed to ZoomOut
    icon = getByTestId('ZoomInMapIcon');

    expect(icon).toBeInTheDocument();
  });
});
