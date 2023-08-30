import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import * as React from 'react';
import { OptionProps } from 'react-select';

import { Box } from 'src/components/Box';
import { Item } from 'src/components/EnhancedSelect';
import Option from 'src/components/EnhancedSelect/components/Option';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useFlags } from 'src/hooks/useFlags';

const useStyles = makeStyles((theme: Theme) => ({
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
    '& g': {
      fill: theme.name === 'dark' ? 'white' : '#888f91',
    },
    display: 'flex',
    padding: `2px !important`, // Revisit use of important when we refactor the Select component
  },
  selected: {
    '& g': {
      fill: theme.palette.primary.main,
    },
  },
}));

interface ImageItem extends Item<string> {
  className?: string;
  isCloudInitCompatible: boolean;
}

interface ImageOptionProps extends OptionProps<any, any> {
  data: ImageItem;
}

const ImageOption = (props: ImageOptionProps) => {
  const classes = useStyles();
  const { data, isFocused, isSelected, label } = props;
  const flags = useFlags();

  return (
    <Option
      className={classNames({
        [classes.focused]: isFocused,
        [classes.root]: true,
        [classes.selected]: isSelected,
      })}
      attrs={{ ['data-qa-image-select-item']: data.value }}
      value={data.value}
      {...props}
    >
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
        }}
      >
        <span className={`${data.className} ${classes.distroIcon}`} />
        <Box>{label}</Box>
        {flags.metadata && data.isCloudInitCompatible ? (
          <TooltipIcon
            icon={<DescriptionOutlinedIcon />}
            status="other"
            sxTooltipIcon={sxCloudInitTooltipIcon}
            text="This image is compatible with cloud-init."
          />
        ) : null}
      </Box>
    </Option>
  );
};

const sxCloudInitTooltipIcon = {
  '& svg': {
    height: 20,
    width: 20,
  },
  '&:hover': {
    color: 'inherit',
  },
  color: 'inherit',
  marginLeft: 'auto',
  padding: 0,
  paddingRight: 1,
};

export { ImageOption };
