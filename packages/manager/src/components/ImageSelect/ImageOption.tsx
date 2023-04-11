import classNames from 'classnames';
import * as React from 'react';
import { OptionProps } from 'react-select';
import CloudInitIncompatibleIcon from 'src/assets/icons/cloud-init-incompatible.svg';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Item } from 'src/components/EnhancedSelect';
import Option from 'src/components/EnhancedSelect/components/Option';
import TooltipIcon from 'src/components/TooltipIcon';
import useFlags from 'src/hooks/useFlags';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `2px !important`, // Revisit use of important when we refactor the Select component
    display: 'flex',
    '& g': {
      fill: theme.name === 'dark' ? 'white' : '#888f91',
    },
  },
  focused: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '& g': {
      fill: 'white',
    },
  },
  selected: {
    '& g': {
      fill: theme.palette.primary.main,
    },
  },
  distroIcon: {
    fontSize: '1.8em',
    margin: `0 ${theme.spacing()}`,
    [theme.breakpoints.only('xs')]: {
      fontSize: '1.52em',
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
  const { data, label, isFocused, isSelected } = props;
  const flags = useFlags();

  return (
    <Option
      className={classNames({
        [classes.root]: true,
        [classes.focused]: isFocused,
        [classes.selected]: isSelected,
      })}
      value={data.value}
      attrs={{ ['data-qa-image-select-item']: data.value }}
      {...props}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <span className={`${data.className} ${classes.distroIcon}`} />
        <Box>{label}</Box>
        {flags.metadata && !data.isCloudInitCompatible ? (
          <TooltipIcon
            text="This image is not compatible with cloud-init."
            status="other"
            icon={<CloudInitIncompatibleIcon />}
            sxTooltipIcon={sxCloudInitTooltipIcon}
          />
        ) : null}
      </Box>
    </Option>
  );
};

const sxCloudInitTooltipIcon = {
  marginLeft: 'auto',
  '& svg': {
    width: 20,
    height: 20,
  },
};

export { ImageOption };
