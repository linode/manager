import { Box } from '@linode/ui';
import { regionFactory } from '@linode/utilities';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

// @todo: modularization - Replace 'testHelpers' with 'testHelpers' from the shared package once available.
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RegionMultiSelect } from './RegionMultiSelect';

import type { FlagComponentProps } from './RegionSelect.types';
import type { Region } from '@linode/api-v4';

const regionNewark = regionFactory.build({
  id: 'us-east',
  label: 'Newark, NJ',
});

const regionAtlanta = regionFactory.build({
  id: 'us-southeast',
  label: 'Atlanta, GA',
});

interface SelectedRegionsProps {
  onRemove: (region: string) => void;
  selectedRegions: Region[];
}
const SelectedRegionsList = ({
  onRemove,
  selectedRegions,
}: SelectedRegionsProps) => (
  <ul>
    {selectedRegions.map((region, index) => (
      <li aria-label={region.label} key={index}>
        {region.label} ({region.id})
        <button onClick={() => onRemove(region.id)}>Remove</button>
      </li>
    ))}
  </ul>
);

// Pretend this is a Flag Component.
// This is just to avoid importing the actual Flag component from 'manager/src/components/Flag' in RegionSelect.
const mockFlagComponent = (
  props: React.PropsWithChildren<FlagComponentProps>
) => {
  return <Box {...props} />;
};

const mockHandleSelection = vi.fn();

describe('RegionMultiSelect', () => {
  it('renders correctly with initial props', () => {
    renderWithTheme(
      <RegionMultiSelect
        FlagComponent={mockFlagComponent}
        accountAvailabilityData={[]}
        accountAvailabilityLoading={false}
        currentCapability="Block Storage"
        flags={{}}
        onChange={mockHandleSelection}
        regions={[regionNewark, regionAtlanta]}
        selectedIds={[]}
      />
    );

    screen.getByRole('combobox', { name: 'Regions' });
  });

  it('should be able to select all the regions correctly', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <RegionMultiSelect
        FlagComponent={mockFlagComponent}
        accountAvailabilityData={[]}
        accountAvailabilityLoading={false}
        currentCapability="Block Storage"
        flags={{}}
        onChange={onChange}
        regions={[regionNewark, regionAtlanta]}
        selectedIds={[]}
      />
    );

    // Open the dropdown
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    fireEvent.click(screen.getByRole('option', { name: 'Select All' }));

    expect(onChange).toHaveBeenCalledWith([regionAtlanta.id, regionNewark.id]);
  });

  it('should be able to deselect all the regions', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <RegionMultiSelect
        FlagComponent={mockFlagComponent}
        accountAvailabilityData={[]}
        accountAvailabilityLoading={false}
        currentCapability="Block Storage"
        flags={{}}
        onChange={onChange}
        regions={[regionNewark, regionAtlanta]}
        selectedIds={[regionAtlanta.id, regionNewark.id]}
      />
    );

    // Open the dropdown
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    fireEvent.click(screen.getByRole('option', { name: 'Deselect All' }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('should render selected regions correctly', () => {
    renderWithTheme(
      <RegionMultiSelect
        SelectedRegionsList={({ onRemove, selectedRegions }) => (
          <SelectedRegionsList
            onRemove={onRemove}
            selectedRegions={selectedRegions}
          />
        )}
        FlagComponent={mockFlagComponent}
        accountAvailabilityData={[]}
        accountAvailabilityLoading={false}
        currentCapability="Block Storage"
        flags={{}}
        onChange={mockHandleSelection}
        regions={[regionNewark, regionAtlanta]}
        selectedIds={[regionNewark.id]}
      />
    );

    // Open the dropdown
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    // Check Newark chip shows becaused it is selected
    expect(
      screen.getByRole('listitem', {
        name: 'Newark, NJ',
      })
    ).toBeInTheDocument();

    // Newark is selected
    expect(
      screen.getByRole('option', {
        name: 'Newark, NJ (us-east)',
      })
    ).toHaveAttribute('aria-selected', 'true');

    // Atlanta is not selected
    expect(
      screen.getByRole('option', {
        name: 'Atlanta, GA (us-southeast)',
      })
    ).toHaveAttribute('aria-selected', 'false');
  });
});
