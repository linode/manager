import { Notice, Typography } from '@linode/ui';
import * as React from 'react';

import { Flag } from 'src/components/Flag';
import { PlacementGroupsSelect } from 'src/components/PlacementGroupsSelect/PlacementGroupsSelect';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { NO_PLACEMENT_GROUPS_IN_SELECTED_REGION_MESSAGE } from 'src/features/PlacementGroups/constants';
import { useIsPlacementGroupsEnabled } from 'src/features/PlacementGroups/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from '@linode/queries';
import { useTypeQuery } from 'src/queries/types';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';
import { getLinodeBackupPrice } from 'src/utilities/pricing/backups';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';
import {
  getLinodeRegionPrice,
  isLinodeTypeDifferentPriceInSelectedRegion,
} from 'src/utilities/pricing/linodes';

import {
  StyledDiv,
  StyledMigrationBox,
  StyledMigrationContainer,
  StyledPaper,
  StyledSpan,
} from './ConfigureForm.styles';
import { MigrationPricing } from './MigrationPricing';

import type { MigrationPricingProps } from './MigrationPricing';
import type { Linode, PlacementGroup, PriceObject } from '@linode/api-v4';

interface Props {
  backupEnabled: Linode['backups']['enabled'];
  currentRegion: string;
  errorText?: string;
  handlePlacementGroupChange: (selected: PlacementGroup | null) => void;
  handleSelectRegion: (id: string) => void;
  helperText?: string;
  linodeType: Linode['type'];
  selectedRegion: string | undefined;
}

export type MigratePricePanelType = 'current' | 'new';

export const ConfigureForm = React.memo((props: Props) => {
  const {
    backupEnabled,
    currentRegion,
    errorText,
    handlePlacementGroupChange,
    handleSelectRegion,
    helperText,
    linodeType,
    selectedRegion,
  } = props;

  const flags = useFlags();
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { data: regions } = useRegionsQuery();

  const { data: currentLinodeType } = useTypeQuery(
    linodeType || '',
    Boolean(linodeType)
  );

  const [
    selectedPlacementGroup,
    setSelectedPlacementGroup,
  ] = React.useState<PlacementGroup | null>(null);

  React.useEffect(() => {
    handlePlacementGroupSelection(null);
  }, [selectedRegion]);

  const currentActualRegion = regions?.find((r) => r.id === currentRegion);

  const newRegion = regions?.find(
    (thisRegion) => thisRegion.id === selectedRegion
  );

  const placementGroupSelectLabel = selectedRegion
    ? `Placement Groups in ${newRegion?.label} (${newRegion?.id}) (optional)`
    : 'Placement Group';

  const hasRegionPlacementGroupCapability = Boolean(
    newRegion?.capabilities.includes('Placement Group')
  );

  const isPlacementGroupSelectDisabled =
    !newRegion || !hasRegionPlacementGroupCapability;

  const handlePlacementGroupSelection = (
    placementGroup: PlacementGroup | null
  ) => {
    setSelectedPlacementGroup(placementGroup);
    handlePlacementGroupChange(placementGroup);
  };

  const country =
    regions?.find((thisRegion) => thisRegion.id == currentRegion)?.country ??
    'us';

  const shouldDisplayPriceComparison = Boolean(
    selectedRegion &&
      isLinodeTypeDifferentPriceInSelectedRegion({
        regionA: currentRegion,
        regionB: selectedRegion,
        type: currentLinodeType,
      })
  );

  const currentRegionPrice: PriceObject | undefined = getLinodeRegionPrice(
    currentLinodeType,
    currentRegion
  );

  const selectedRegionPrice: PriceObject | undefined = getLinodeRegionPrice(
    currentLinodeType,
    selectedRegion
  );

  const panelPrice = React.useCallback(
    (
      region: string,
      regionPrice: PriceObject | undefined,
      panelType: MigratePricePanelType
    ): MigrationPricingProps => {
      const backupPriceDisplay = (region: string) =>
        currentLinodeType && backupEnabled
          ? getLinodeBackupPrice(currentLinodeType, region)
          : 'disabled';

      return {
        backups: backupPriceDisplay(region),
        hourly: regionPrice?.hourly,
        monthly: regionPrice?.monthly,
        panelType,
      };
    },
    [backupEnabled, currentLinodeType]
  );

  const linodeIsInDistributedRegion =
    currentActualRegion?.site_type === 'distributed';

  return (
    <StyledPaper>
      <Typography variant="h3">Configure Migration</Typography>
      <StyledMigrationContainer>
        <StyledMigrationBox>
          <StyledSpan>Current Region</StyledSpan>
          <StyledDiv>
            <Flag country={country} />
            <Typography>{`${getRegionCountryGroup(currentActualRegion)}: ${
              currentActualRegion?.label ?? currentRegion
            }`}</Typography>
          </StyledDiv>
          {shouldDisplayPriceComparison && (
            <MigrationPricing
              {...panelPrice(currentRegion, currentRegionPrice, 'current')}
            />
          )}
        </StyledMigrationBox>
        <StyledMigrationBox>
          <RegionSelect
            regionFilter={
              flags.gecko2?.enabled && linodeIsInDistributedRegion
                ? 'distributed'
                : 'core'
            }
            regions={
              regions?.filter(
                (eachRegion) => eachRegion.id !== currentRegion
              ) ?? []
            }
            textFieldProps={{
              helperText,
            }}
            currentCapability="Linodes"
            disableClearable
            errorText={errorText}
            label="New Region"
            onChange={(e, region) => handleSelectRegion(region.id)}
            value={selectedRegion}
          />
          {shouldDisplayPriceComparison && selectedRegion && (
            <MigrationPricing
              {...panelPrice(selectedRegion, selectedRegionPrice, 'new')}
            />
          )}
          {isPlacementGroupsEnabled && (
            <PlacementGroupsSelect
              handlePlacementGroupChange={(placementGroup) => {
                handlePlacementGroupSelection(placementGroup);
              }}
              textFieldProps={{
                helperText:
                  'If your Linode already belongs to a placement group, it will be automatically unassigned during the migration. You can choose to move it to a new placement group in the same region here.',
                tooltipText: hasRegionPlacementGroupCapability
                  ? ''
                  : 'Placement Groups are not available in this region.',
              }}
              disabled={isPlacementGroupSelectDisabled}
              key={selectedRegion}
              label={placementGroupSelectLabel}
              noOptionsMessage={NO_PLACEMENT_GROUPS_IN_SELECTED_REGION_MESSAGE}
              selectedPlacementGroupId={selectedPlacementGroup?.id ?? null}
              selectedRegion={newRegion}
            />
          )}
        </StyledMigrationBox>
      </StyledMigrationContainer>
      {!currentRegionPrice && selectedRegion && (
        <Notice
          spacingBottom={16}
          spacingTop={8}
          text={PRICES_RELOAD_ERROR_NOTICE_TEXT}
          variant="error"
        />
      )}
    </StyledPaper>
  );
});
