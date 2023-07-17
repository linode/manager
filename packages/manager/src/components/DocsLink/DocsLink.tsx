import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import DocsIcon from 'src/assets/icons/docs.svg';
import { sendHelpButtonClickEvent } from 'src/utilities/analytics';

import { IconTextLink } from '../IconTextLink/IconTextLink';

const useStyles = makeStyles()((theme: Theme) => ({
  '@supports (-moz-appearance: none)': {
    /* Fix text alignment for Firefox */
    root: {
      '& span': {
        top: 1,
      },
    },
  },
  root: {
    '& svg': {
      marginRight: theme.spacing(),
    },
    '&:hover': {
      color: theme.textColors.linkActiveLight,
      textDecoration: 'underline',
    },
    alignItems: 'center',
    fontFamily: theme.font.normal,
    fontSize: '.875rem',
    lineHeight: 'normal',
    margin: 0,
    minWidth: 'auto',
  },
}));

interface Props {
  analyticsLabel?: string;
  href: string;
  label?: string;
  onClick?: () => void;
}

export const DocsLink = (props: Props) => {
  const { classes } = useStyles();

  const { analyticsLabel, href, label, onClick } = props;

  return (
    <IconTextLink
      onClick={() => {
        if (onClick === undefined) {
          sendHelpButtonClickEvent(href, analyticsLabel);
        } else {
          onClick();
        }
        window.open(href, '_blank', 'noopener');
      }}
      SideIcon={DocsIcon}
      aria-describedby="external-site"
      className={`${classes.root} docsButton`}
      text={label ?? 'Docs'}
      title={label ?? 'Docs'}
    />
  );
};

export default DocsLink;
