import Grid from '@mui/material/Unstable_Grid2';
import { isEmpty, splitAt } from 'ramda';
import * as React from 'react';

import { Item } from 'src/components/EnhancedSelect/Select';
import { Hidden } from 'src/components/Hidden';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { capitalize } from 'src/utilities/capitalize';

import { StyledButton, StyledTypography } from './ResultGroup.styles';
import { ResultRow } from './ResultRow';

interface ResultGroupProps {
  entity: string;
  groupSize: number;
  results: Item[];
}

export const ResultGroup = (props: ResultGroupProps) => {
  const { entity, groupSize, results } = props;

  const [showMore, setShowMore] = React.useState<boolean>(false);

  const toggle = () => {
    setShowMore((showMore) => !showMore);
  };

  if (isEmpty(results)) {
    return null;
  }

  const [initial, hidden] =
    results.length > groupSize ? splitAt(groupSize, results) : [results, []];

  return (
    <Grid>
      <StyledTypography data-qa-entity-header={entity} variant="h2">
        {capitalize(entity)}
      </StyledTypography>
      <Table aria-label="Search Results">
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell>Region</TableCell>
            <Hidden mdDown>
              <TableCell>Created</TableCell>
              <TableCell>Tags</TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {initial.map((result, idx: number) => (
            <ResultRow data-qa-result-row-component key={idx} result={result} />
          ))}
          {showMore &&
            hidden.map((result, idx: number) => (
              <ResultRow
                data-qa-result-row-component
                key={idx}
                result={result}
              />
            ))}
        </TableBody>
      </Table>
      {!isEmpty(hidden) && (
        <StyledButton
          buttonType="primary"
          data-qa-show-more-toggle
          onClick={toggle}
        >
          {showMore ? 'Show Less' : 'Show All'}
        </StyledButton>
      )}
    </Grid>
  );
};
