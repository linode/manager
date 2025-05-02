import { Chip, Tooltip } from '@linode/ui';
import * as React from 'react';

import { StyledItemWithPlusChip } from 'src/components/RemovableSelectionsList/RemovableSelectionsList.style';

export const remainingDataLengthChip = 'remaining-data-length-chip';

export const determineNoneSingleOrMultipleWithChip = (
  dataArray: string[]
): JSX.Element | string => {
  if (dataArray.length === 0) {
    return 'None';
  }

  if (dataArray.length === 1) {
    return dataArray[0];
  }

  const allDataExceptFirstElement = dataArray.slice(1);

  const remainingData = allDataExceptFirstElement.map((datum) => (
    <>
      <span key={datum}>{datum}</span>
      <br />
    </>
  ));

  return (
    <StyledItemWithPlusChip>
      {dataArray[0]}{' '}
      <Tooltip placement="bottom" title={remainingData}>
        <Chip
          clickable
          data-testid={remainingDataLengthChip}
          label={`+${remainingData.length}`}
          sx={{ mx: 2 }}
        />
      </Tooltip>
    </StyledItemWithPlusChip>
  );
};
