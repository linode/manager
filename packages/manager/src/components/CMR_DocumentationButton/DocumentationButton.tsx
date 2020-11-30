import * as React from 'react';
import DocsIcon from 'src/assets/icons/docs.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import IconTextLink from '../IconTextLink';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexFlow: 'row nowrap',
    position: 'relative'
  },
  docs: {
    alignItems: 'center',
    height: 50,
    lineHeight: 'normal',
    margin: 0,
    minWidth: 'auto',
    padding: 0,
    '& svg': {
      marginRight: theme.spacing()
    },
    '&:focus': {
      backgroundColor: 'transparent'
    },
    '&:hover': {
      textDecoration: 'underline',
      '& svg': {
        color: theme.palette.primary.light
      }
    }
  },
  externalLinkIcon: {
    color: theme.palette.primary.main,
    marginTop: 3,
    opacity: 0,
    position: 'absolute',
    right: -20
  }
}));

interface Props {
  href: string;
  hideText?: boolean;
}

type CombinedProps = Props;

export const DocumentationButton: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { href, hideText } = props;

  return (
    <Grid item className={classes.root}>
      <IconTextLink
        className={classes.docs}
        SideIcon={DocsIcon}
        hideText={hideText}
        text="Docs"
        title="Docs"
        onClick={() => window.open(href, '_blank', 'noopener')}
        aria-describedby="external-site"
      />
    </Grid>
  );
};

export default DocumentationButton;
