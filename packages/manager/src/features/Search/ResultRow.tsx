import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Item } from 'src/components/EnhancedSelect/Select';
import { Hidden } from 'src/components/Hidden';
import { Tags } from 'src/components/Tags/Tags';
import { Typography } from 'src/components/Typography';
import { RegionIndicator } from 'src/features/Linodes/LinodesLanding/RegionIndicator';

import {
  StyledCreatedTableCell,
  StyledLabelTableCell,
  StyledLink,
  StyledRegionTableCell,
  StyledTableRow,
  StyledTagTableCell,
} from './ResultRow.styles';

interface ResultRowProps {
  result: Item;
}

export const ResultRow = (props: ResultRowProps) => {
  const { result } = props;

  return (
    <StyledTableRow ariaLabel={result.label} data-qa-result-row={result.label}>
      <StyledLabelTableCell>
        <StyledLink title={result.label} to={result.data.path}>
          {result.label}
        </StyledLink>
        <Typography fontSize={'0.80rem'} variant="body1">
          {result.data.description}
        </Typography>
      </StyledLabelTableCell>
      <StyledRegionTableCell>
        {result.data.region && <RegionIndicator region={result.data.region} />}
      </StyledRegionTableCell>
      <Hidden mdDown>
        <StyledCreatedTableCell>
          {result.data.created && (
            <Typography>
              <DateTimeDisplay value={result.data.created} />
            </Typography>
          )}
        </StyledCreatedTableCell>

        <StyledTagTableCell>
          <Tags data-testid={'result-tags'} tags={result.data.tags} />
        </StyledTagTableCell>
      </Hidden>
    </StyledTableRow>
  );
};
