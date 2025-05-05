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

  return (
    <Box
      data-qa-applied-filter-id="applied-filter"
      data-testid="applied-filter"
      display="flex"
      flexDirection={{ sm: 'row', xs: 'column' }}
      flexWrap={{ sm: 'wrap' }}
      maxHeight="78px"
      mb={2}
      mx={3}
      pb={2}
      rowGap={1.5}
      sx={{
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      {Object.entries(filters).map((data, index) => {
        const label = data[0];
        const filterValue = data[1];
        return (
          <React.Fragment key={index}>
            <Typography
              fontSize="14px"
              key={label}
              mr={1}
              variant="h3"
            >{`${label}:`}</Typography>
            {filterValue.map((value, index) => {
              return (
                <Chip
                  data-qa-value={`${label} ${value}`}
                  key={`${label} ${value}`}
                  label={value}
                  sx={(theme) => ({
                    backgroundColor: theme.tokens.color.Ultramarine[10],
                    color: theme.tokens.color.Neutrals.Black,
                    fontSize: '14px',
                    mr: index === filterValue.length - 1 ? 4 : 1,
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
