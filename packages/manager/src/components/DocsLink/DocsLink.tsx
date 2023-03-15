import * as React from 'react';
import DocsIcon from 'src/assets/icons/docs.svg';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { sendHelpButtonClickEvent } from 'src/utilities/ga';
import IconTextLink from '../IconTextLink';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    alignItems: 'center',
    fontFamily: theme.font.normal,
    fontSize: '.875rem',
    lineHeight: 'normal',
    margin: 0,
    minWidth: 'auto',
    '& svg': {
      marginRight: theme.spacing(),
    },
    '&:hover': {
      color: theme.textColors.linkActiveLight,
      textDecoration: 'underline',
    },
  },
  '@supports (-moz-appearance: none)': {
    /* Fix text alignment for Firefox */
    root: {
      '& span': {
        top: 1,
      },
    },
  },
}));

interface Props {
  href: string;
  label?: string;
  analyticsLabel?: string;
  onClick?: () => void;
}

export const DocsLink: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { href, label, analyticsLabel, onClick } = props;

  return (
    <IconTextLink
      className={`${classes.root} docsButton`}
      SideIcon={DocsIcon}
      text={label ?? 'Docs'}
      title={label ?? 'Docs'}
      onClick={() => {
        if (onClick === undefined) {
          sendHelpButtonClickEvent(href, analyticsLabel);
        } else {
          onClick();
        }
        window.open(href, '_blank', 'noopener');
      }}
      aria-describedby="external-site"
    />
  );
};

export default DocsLink;
