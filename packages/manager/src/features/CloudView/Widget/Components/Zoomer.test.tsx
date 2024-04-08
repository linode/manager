import { fireEvent } from '@testing-library/react';
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

  it('changes from zoomin to zoomout on click when zoom in is present', () => {
    let zoomIn = true;

    const handleZoomToggle = (zoomInParameter: boolean) => {
      zoomIn = zoomInParameter;
    };

    const { getByTestId } = renderWithTheme(
      <ZoomIcon handleZoomToggle={handleZoomToggle} zoomIn={zoomIn} />
    );

    let icon = getByTestId('ZoomInMapIcon');

    expect(icon).toBeInTheDocument();

    fireEvent.click(icon);

    // now it should be changed to ZoomOut
    icon = getByTestId('ZoomOutMapIcon');

    expect(icon).toBeInTheDocument();
  });

  it('changes from zoomout to zoomin on click when zoom out is present', () => {
    let zoomIn = false;

    const handleZoomToggle = (zoomInParameter: boolean) => {
      zoomIn = zoomInParameter;
    };

    const { getByTestId } = renderWithTheme(
      <ZoomIcon handleZoomToggle={handleZoomToggle} zoomIn={zoomIn} />
    );

    let icon = getByTestId('ZoomOutMapIcon');

    expect(icon).toBeInTheDocument();

    fireEvent.click(icon);

    // now it should be changed to ZoomOut
    icon = getByTestId('ZoomInMapIcon');

    expect(icon).toBeInTheDocument();
  });
});
