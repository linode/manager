import { ListItemOption, Stack, Tooltip, Typography } from '@linode/ui';
import React from 'react';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import { useFlags } from 'src/hooks/useFlags';

import { OSIcon } from '../OSIcon';
import { isImageDeprecated } from './utilities';

import type { Image } from '@linode/api-v4';
import type { ListItemOptionProps } from '@linode/ui';

export const ImageOption = ({
  disabledOptions,
  item,
  props,
  selected,
}: ListItemOptionProps<Image>) => {
  const flags = useFlags();

  return (
    <ListItemOption
      disabledOptions={disabledOptions}
      item={item}
      maxHeight={35}
      props={props}
      selected={selected}
    >
      <Stack alignItems="center" direction="row" gap={1} width="100%">
        {item?.id !== 'any/all' && (
          <OSIcon
            fontSize="1.5em"
            height="20px"
            os={item.vendor}
            sx={{
              position: 'relative',
              top: 2,
              '::before': {
                width: '100%',
                height: '100%',
              },
            }}
            width="20px"
          />
        )}
        <Typography color="inherit">
          {item.label} {isImageDeprecated(item) && '(deprecated)'}
        </Typography>
      </Stack>
      {flags.metadata && item.capabilities.includes('cloud-init') && (
        <Tooltip title="This image supports our Metadata service via cloud-init.">
          <span style={{ display: 'flex' }}>
            <CloudInitIcon />
          </span>
        </Tooltip>
      )}
    </ListItemOption>
  );
};
