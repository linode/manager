import { Box, Chip, Typography } from '@linode/ui';
import React from 'react';

export interface CloudPulseAppliedFilterProps {
  filters: {
    [label: string]: string[];
  };
}
export const CloudPulseAppliedFilter = (
  props: CloudPulseAppliedFilterProps
) => {
  const { filters } = props;
  const entries = Object.entries(filters);

  return (
    <Box
      alignItems="center"
      data-qa-applied-filter-id="applied-filter"
      data-testid="applied-filter"
      display="flex"
      flexDirection={{ sm: 'row', xs: 'column' }}
      flexWrap={{ sm: 'wrap' }}
      mb={0}
      mx={0}
      pb={0}
      rowGap={0.75}
    >
      {entries.map(([label, filterValue], filterIndex) => {
        const isLastFilter = filterIndex === entries.length - 1;
        return (
          <React.Fragment key={filterIndex}>
            <Typography
              fontSize="14px"
              sx={{ flexShrink: 0, mr: 1 }}
              variant="h3"
            >
              {`${label}:`}
            </Typography>
            {filterValue.map((value, chipIndex) => {
              const isLastChip = chipIndex === filterValue.length - 1;
              const chipMarginRight =
                isLastChip && isLastFilter ? 0 : isLastChip ? 2 : 1;

              return (
                <Chip
                  data-qa-value={`${label} ${value}`}
                  key={`${label} ${value}`}
                  label={value}
                  sx={(theme) => ({
                    backgroundColor:
                      theme.tokens.alias.Background.Neutralsubtle,
                    color: theme.tokens.color.Neutrals.Black,
                    flexShrink: 0,
                    fontSize: '14px',
                    mr: chipMarginRight,
                    px: 1,
                    py: 0.5,
                    width: { sm: 'fit-content', xs: '98%' },
                  })}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </Box>
  );
};
