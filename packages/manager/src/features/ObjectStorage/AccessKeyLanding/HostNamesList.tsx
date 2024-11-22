import { Box, List, omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React, { useRef } from 'react';

import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { getRegionsByRegionId } from 'src/utilities/regions';

import type { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';

const maxHeight = 200;

interface Props {
  objectStorageKey: ObjectStorageKey;
}

export const HostNamesList = ({ objectStorageKey }: Props) => {
  const { data: regionsData } = useRegionsQuery();
  const regionsLookup = regionsData && getRegionsByRegionId(regionsData);

  const listRef = useRef<HTMLUListElement>(null);
  const currentListHeight = listRef?.current?.clientHeight || 0;

  return (
    <Box>
      <StyledBoxShadowWrapper
        sx={(theme) => ({
          backgroundColor: theme.bg.main,
          border: `1px solid ${
            theme.name === 'light'
              ? theme.tokens.color.Neutrals[40]
              : theme.tokens.color.Neutrals.Black
          }`,
          minHeight: '34px',
        })}
        displayShadow={currentListHeight > maxHeight}
      >
        <StyledScrollBox maxHeight={`${maxHeight}px`}>
          <StyledHostNamesList ref={listRef}>
            {objectStorageKey?.regions.map((region, index) => (
              <CopyableTextField
                value={`${regionsLookup?.[region.id]?.label}: ${
                  region.s3_endpoint
                }`}
                hideLabel
                key={index}
                label="Create a Filesystem"
                sx={{ border: 'none', maxWidth: '100%' }}
              />
            ))}
          </StyledHostNamesList>
        </StyledScrollBox>
      </StyledBoxShadowWrapper>
    </Box>
  );
};

export const StyledScrollBox = styled(Box, {
  label: 'StyledScrollBox',
})<{ maxHeight: string }>(({ maxHeight }) => ({
  maxHeight: `${maxHeight}px`,
  overflow: 'auto',
}));

export const StyledBoxShadowWrapper = styled(Box, {
  label: 'StyledBoxShadowWrapper',
  shouldForwardProp: omittedProps(['displayShadow']),
})<{ displayShadow: boolean }>(({ displayShadow, theme }) => ({
  '&:after': {
    bottom: 0,
    content: '""',
    height: '15px',
    position: 'absolute',
    width: '100%',
    ...(displayShadow && {
      boxShadow: `${theme.color.boxShadow} 0px -15px 10px -10px inset`,
    }),
  },
  position: 'relative',
}));

export const StyledHostNamesList = styled(List, {
  label: 'RegionsList',
})(({ theme }) => ({
  background: theme.name === 'light' ? theme.bg.main : theme.bg.app,
}));
