import * as React from 'react';

import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Country } from 'src/components/EnhancedSelect/variants/RegionSelect/utils';
import { Flag } from 'src/components/Flag';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { useTypeQuery } from 'src/queries/types';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';
import {
  getDCSpecificPrice,
  priceIncreaseMap,
} from 'src/utilities/pricing/dynamicPricing';

import {
  StyledDiv,
  StyledFormLabel,
  StyledMigrationBox,
  StyledMigrationContainer,
  StyledPaper,
} from './ConfigureForm.styles';
import { MigrationPricing } from './MigrationPricing';

import type { MigrationPricingProps } from './MigrationPricing';
import type { Linode } from '@linode/api-v4';

interface Props {
  currentRegion: string;
  errorText?: string;
  handleSelectRegion: (id: string) => void;
  helperText?: string;
  linodeType: Linode['type'];
  selectedRegion: null | string;
}

export const ConfigureForm = React.memo((props: Props) => {
  const {
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
  const { dcSpecificPricing } = flags;
  const currentActualRegion = regions?.find((r) => r.id === currentRegion);
  const country =
    regions?.find((thisRegion) => thisRegion.id == currentRegion)?.country ??
    'us';
  const hasSelectedRegionDynamicPricing = Boolean(
    selectedRegion && priceIncreaseMap[selectedRegion]
  );

  const calculateNewPrice = React.useCallback(
    (
      basePrice: null | number | undefined,
      regionId: null | string
    ): number | undefined => {
      if (basePrice && regionId) {
        return Number(getDCSpecificPrice({ basePrice, flags, regionId }));
      }

      return undefined;
    },
    [flags]
  );

  const currentPrice: MigrationPricingProps = {
    backups: currentLinodeType?.addons?.backups?.price?.monthly,
    hourly: currentLinodeType?.price?.hourly,
    monthly: currentLinodeType?.price?.monthly,
    panelType: 'current',
  };

  const newPrice: MigrationPricingProps = {
    backups: calculateNewPrice(currentPrice.backups, selectedRegion),
    hourly: calculateNewPrice(currentPrice.hourly, selectedRegion),
    monthly: calculateNewPrice(currentPrice.monthly, selectedRegion),
    panelType: 'new',
  };

  return (
    <StyledPaper>
      <Typography variant="h3">Configure Migration</Typography>
      <StyledMigrationContainer>
        <StyledMigrationBox>
          <StyledFormLabel htmlFor={`current-region-${currentRegion}`}>
            Current Region
          </StyledFormLabel>
          <StyledDiv>
            <Flag country={country as Lowercase<Country>} />
            <Typography
              id={`current-region-${currentRegion}`}
            >{`${getRegionCountryGroup(currentActualRegion)}: ${
              currentActualRegion?.label ?? currentRegion
            }`}</Typography>
          </StyledDiv>
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
        </StyledMigrationBox>
      </StyledMigrationContainer>
      {dcSpecificPricing && hasSelectedRegionDynamicPricing && (
        <StyledMigrationContainer>
          <MigrationPricing {...currentPrice} />
          <MigrationPricing {...newPrice} />
        </StyledMigrationContainer>
      )}
    </StyledPaper>
  );
});
