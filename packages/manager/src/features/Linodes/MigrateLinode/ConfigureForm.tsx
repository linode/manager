import * as React from 'react';

import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Country } from 'src/components/EnhancedSelect/variants/RegionSelect/utils';
import { Flag } from 'src/components/Flag';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { useTypeQuery } from 'src/queries/types';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';
import { getLinodeBackupPrice } from 'src/utilities/pricing/backups';
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
import type { Linode, PriceObject } from '@linode/api-v4';

interface Props {
  backupEnabled: Linode['backups']['enabled'];
  currentRegion: string;
  errorText?: string;
  handleSelectRegion: (id: string) => void;
  helperText?: string;
  linodeType: Linode['type'];
  selectedRegion: null | string;
}

export type MigratePricePanelType = 'current' | 'new';

export const ConfigureForm = React.memo((props: Props) => {
  const {
    backupEnabled,
    currentRegion,
    errorText,
    handleSelectRegion,
    helperText,
    linodeType,
    selectedRegion,
  } = props;

  const { data: regions } = useRegionsQuery();
  const { data: currentLinodeType } = useTypeQuery(
    linodeType || '',
    Boolean(linodeType)
  );
  const flags = useFlags();
  const currentActualRegion = regions?.find((r) => r.id === currentRegion);
  const country =
    regions?.find((thisRegion) => thisRegion.id == currentRegion)?.country ??
    'us';
  const shouldDisplayPriceComparison = Boolean(
    flags.dcSpecificPricing &&
      selectedRegion &&
      isLinodeTypeDifferentPriceInSelectedRegion({
        regionA: currentRegion,
        regionB: selectedRegion,
        type: currentLinodeType,
      })
  );

  const currentRegionPrice =
    currentLinodeType && getLinodeRegionPrice(currentLinodeType, currentRegion);

  // TODO: M3-7063 (defaults)
  const selectedRegionPrice: PriceObject | undefined =
    (currentLinodeType &&
      selectedRegion &&
      getLinodeRegionPrice(currentLinodeType, selectedRegion)) ||
    currentRegionPrice;

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

  return (
    <StyledPaper>
      <Typography variant="h3">Configure Migration</Typography>
      <StyledMigrationContainer>
        <StyledMigrationBox>
          <StyledSpan>Current Region</StyledSpan>
          <StyledDiv>
            <Flag country={country as Lowercase<Country>} />
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
            regions={
              regions?.filter(
                (eachRegion) => eachRegion.id !== currentRegion
              ) ?? []
            }
            styles={{
              menuList: (base: any) => ({
                ...base,
                maxHeight: `30vh !important`,
              }),
            }}
            textFieldProps={{
              helperText,
            }}
            errorText={errorText}
            handleSelection={handleSelectRegion}
            label="New Region"
            menuPlacement="top"
            selectedID={selectedRegion}
          />
          {shouldDisplayPriceComparison && selectedRegion && (
            <MigrationPricing
              {...panelPrice(selectedRegion, selectedRegionPrice, 'new')}
            />
          )}
        </StyledMigrationBox>
      </StyledMigrationContainer>
    </StyledPaper>
  );
});
