import * as React from 'react';
import DocsIcon from 'src/assets/icons/docs.svg';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
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
  href: string;
  label?: string;
  analyticsLabel?: string;
  onClick?: () => void;
}

export const DocsLink = (props: Props) => {
  const { classes } = useStyles();

  const { analyticsLabel, href, label, onClick } = props;

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
