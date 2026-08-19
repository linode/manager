import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useObjectStorageSelection } from 'src/features/ObjectStorage/ObjectStorageContext';
import { useFlags } from 'src/hooks/useFlags';

import { EndpointMultiSelect } from '../shared/components/EndpointSelect/EndpointMultiSelect';
import { Link } from '../shared/components/Link/Link';
import { EndpointSummaryTable } from './EndpointSummaryTable';

export const EndpointSummaryPanel = () => {
  const { objectStorageSummaryPageLinks } = useFlags();

  const {
    selectedSummaryEndpoints: selectedEndpoints,
    setSelectedSummaryEndpoints: setSelectedEndpoints,
  } = useObjectStorageSelection();

  return (
    <>
      <DocumentTitleSegment segment="Summary" />

      <div
        style={{
          backgroundColor: 'var(--token-component-content-panel-background)',
          padding: 'var(--token-global-spacing-s20)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--token-global-spacing-s24)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--token-global-spacing-s8)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h5>Endpoint Summary</h5>

            {objectStorageSummaryPageLinks && (
              <Link to="/object-storage/access-keys">Manage access keys</Link>
            )}
          </div>

          <p
            style={{
              color: 'var(--token-alias-content-text-primary-default)',
            }}
          >
            Select one or more endpoints in the dropdown list to view usage
            summaries for those endpoints. You can view quotas and request
            increases on the {''}
            <Link to="/quotas?service=object-storage">Quotas</Link> page.
          </p>
        </div>

        <div style={{ maxWidth: '630px' }}>
          <EndpointMultiSelect
            onChange={setSelectedEndpoints}
            values={selectedEndpoints}
          />
        </div>

        {!!selectedEndpoints.length && (
          <EndpointSummaryTable
            endpoints={selectedEndpoints.map((selected) => selected.endpoint)}
          />
        )}
      </div>
    </>
  );
};
