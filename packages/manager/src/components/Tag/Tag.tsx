import Close from '@material-ui/icons/Close';
import classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Chip, { ChipProps } from 'src/components/core/Chip';
import { makeStyles, Theme } from 'src/components/core/styles';
import { truncateEnd } from 'src/utilities/truncate';

type Variants = 'blue' | 'lightBlue';

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    maxWidth: 350,
  },
  root: {
    height: 30,
    paddingLeft: 0,
    paddingRight: 0,
    // Overrides MUI chip default styles so these appear as separate elements.
    '&:hover': {
      backgroundColor: theme.color.tagButton,
      '& $deleteButton': {
        color: theme.color.tagIcon,
      },
    },
    '&:focus': {
      backgroundColor: theme.color.tagButton,
      '& $deleteButton': {
        color: theme.color.tagIcon,
      },
    },
    // Targets first span (tag label)
    '& > span': {
      borderRadius: 3,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRight: `1px solid ${
        theme.name === 'lightTheme' ? '#fff' : '#2e3238'
      }`,
      color: theme.name === 'lightTheme' ? '#3a3f46' : '#9caec9',
      fontSize: '0.875rem',
      padding: '7px 10px',
    },
  },
  deleteButton: {
    ...theme.applyLinkStyles,
    borderRadius: 0,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    height: 30,
    margin: 0,
    minWidth: 30,
    padding: theme.spacing(),
    '& svg': {
      borderRadius: 0,
      color: theme.color.tagIcon,
      height: 15,
      width: 15,
    },
    '&:hover': {
      backgroundColor: `${theme.palette.primary.main} !important`,
      color: 'white !important',
      '& svg': {
        color: 'white',
      },
    },
    '&:focus': {
      backgroundColor: theme.bg.lightBlue1,
      color: theme.color.black,
    },
  },
  blue: {
    backgroundColor: theme.palette.primary.main,
    '& > span': {
      color: 'white',
    },
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  lightBlue: {
    backgroundColor: theme.color.tagButton,
    '& > span': {
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
      '&:focus': {
        backgroundColor: theme.color.tagButton,
        color: theme.color.black,
      },
    },
  },
}));

export interface Props extends ChipProps {
  label: string;
  colorVariant?: Variants;
  asSuggestion?: boolean;
  closeMenu?: any;
  component?: string;
  maxLength?: number;
}

type CombinedProps = RouteComponentProps<{}> & Props;

export const Tag: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    className,
    colorVariant,
    history,
    label,
    maxLength,
    // Defining `staticContext` here to prevent `...rest` from containing it
    // since it leads to a console warning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    staticContext,
    ...chipProps
  } = props;

  const handleClick = (e: React.MouseEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    if (props.asSuggestion) {
      props.closeMenu();
    }
    history.push(`/search/?query=tag:${label}`);
  };

  // If maxLength is set, truncate display to that length.
  const _label = maxLength ? truncateEnd(label, maxLength) : label;

  return (
    <Chip
      {...chipProps}
      label={_label}
      className={classNames(className, {
        [classes[colorVariant!]]: true,
        [classes.root]: true,
      })}
      deleteIcon={
        chipProps.onDelete ? (
          <button
            data-qa-delete-tag
            className={classes.deleteButton}
            title="Delete tag"
            aria-label={`Delete Tag "${label}"`}
          >
            <Close />
          </button>
        ) : undefined
      }
      classes={{ label: classes.label, deletable: classes[colorVariant!] }}
      onClick={handleClick}
      data-qa-tag={label}
      component="div"
      clickable
      role="button"
      aria-label={`Search for Tag "${label}"`}
    />
  );
};

const enhanced = compose<CombinedProps, Props>(withRouter)(Tag);

export default enhanced;
