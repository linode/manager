import * as React from 'react';
import { linodes } from 'src/__data__/linodes';
import { light } from 'src/themes';
import { LinodeSummary } from './LinodeSummary';
import { renderWithTheme } from 'src/utilities/testHelpers';

describe('LinodeSummary', () => {
  const render = renderWithTheme(
    <LinodeSummary
      isBareMetalInstance={false}
      mostRecentEventTime=""
      events={[]}
      inProgressEvents={[]}
      linodeCreated="2018-11-01T00:00:00"
      linodeId={1234}
      linodeData={linodes[0]}
      timezone={'America/Los_Angeles'}
      classes={{
        root: '',
        graphControls: '',
        graphGrids: '',
        grid: '',
        chartSelect: '',
        labelRangeSelect: '',
      }}
      theme={light()}
      linodeVolumes={[]}
      typesData={[]}
      imagesData={{}}
      imagesError={{}}
      imagesLoading={false}
      imagesLastUpdated={0}
    />
  );

  it('should have a select menu for the graphs', () => {
    expect(render.findByTestId('[data-qa-item="chartRange"]')).not.toBeNull();
  });
});
