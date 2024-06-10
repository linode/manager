import { Region } from '@linode/api-v4';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { regionFactory } from 'src/factories/regions';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RegionMultiSelect } from './RegionMultiSelect';

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

const mockHandleSelection = vi.fn();

describe('RegionMultiSelect', () => {
  it('renders correctly with initial props', () => {
    renderWithTheme(
      <RegionMultiSelect
        currentCapability="Block Storage"
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
        currentCapability="Block Storage"
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
        currentCapability="Block Storage"
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
        currentCapability="Block Storage"
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
