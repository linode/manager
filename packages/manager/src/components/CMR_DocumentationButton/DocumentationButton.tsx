import * as React from 'react';
import DocsIcon from 'src/assets/icons/docs.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import IconTextLink from '../IconTextLink';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    alignItems: 'center',
    fontFamily: theme.font.normal,
    lineHeight: 'normal',
    margin: 0,
    minWidth: 'auto',
    padding: 0,
    '& svg': {
      marginRight: theme.spacing()
    },
    '&:hover': {
      textDecoration: 'underline',
      '& svg': {
        color: theme.palette.primary.light
      }
    }
  }
}));

interface Props {
  href: string;
}

type CombinedProps = Props;

export const DocumentationButton: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { href } = props;

  return (
    <IconTextLink
      className={classes.root}
      SideIcon={DocsIcon}
      text="Docs"
      title="Docs"
      onClick={() => window.open(href, '_blank', 'noopener')}
      aria-describedby="external-site"
    />
  );
};

export default DocumentationButton;
