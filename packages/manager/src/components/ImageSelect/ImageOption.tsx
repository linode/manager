import React from 'react';
import { makeStyles } from 'tss-react/mui';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import DistributedRegionIcon from 'src/assets/icons/entityIcons/distributed-region.svg';
import { Box } from 'src/components/Box';
import { Option } from 'src/components/EnhancedSelect/components/Option';
import { useFlags } from 'src/hooks/useFlags';

import { Stack } from '../Stack';
import { Tooltip } from '../Tooltip';

import type { ImageItem } from './ImageSelect';
import type { Theme } from '@mui/material/styles';
import type { OptionProps } from 'react-select';

const useStyles = makeStyles()((theme: Theme) => ({
  distroIcon: {
    fontSize: '1.8em',

    margin: `0 ${theme.spacing()}`,
    [theme.breakpoints.only('xs')]: {
      fontSize: '1.52em',
    },
  },
  focused: {
    '& g': {
      fill: 'white',
    },
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  root: {
    '& *': {
      lineHeight: '1.2em',
    },
    '& g': {
      fill: theme.name === 'dark' ? 'white' : '#888f91',
    },
    display: 'flex !important',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '2px 8px !important', // Revisit use of important when we refactor the Select component
  },
  selected: {
    '& g': {
      fill: theme.palette.primary.main,
    },
  },
}));

interface ImageOptionProps extends OptionProps<any, any> {
  data: ImageItem;
}

export const ImageOption = (props: ImageOptionProps) => {
  const { classes, cx } = useStyles();
  const { data, isFocused, isSelected, label } = props;
  const flags = useFlags();

  return (
    <Option
      className={cx(classes.root, {
        [classes.focused]: isFocused,
        [classes.selected]: isSelected,
      })}
      attrs={{ ['data-qa-image-select-item']: data.value }}
      value={data.value}
      {...props}
    >
      <Stack alignItems="center" direction="row" spacing={1.5}>
        <span className={`${data.className} ${classes.distroIcon}`} />
        <Box>{label}</Box>
      </Stack>
      <Stack alignItems="center" direction="row" spacing={1}>
        {data.isDistributedCompatible && (
          <Tooltip title="This image is compatible with distributed compute regions.">
            <div style={{ display: 'flex' }}>
              <DistributedRegionIcon height="24px" width="24px" />
            </div>
          </Tooltip>
        )}
        {flags.metadata && data.isCloudInitCompatible && (
          <Tooltip title="This image supports our Metadata service via cloud-init.">
            <CloudInitIcon />
          </Tooltip>
        )}
      </Stack>
    </Option>
  );
};
