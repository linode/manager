import * as React from 'react';
import DocsIcon from 'src/assets/icons/docs.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import { sendHelpButtonClickEvent } from 'src/utilities/ga';
import IconTextLink from '../IconTextLink';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    alignItems: 'center',
    fontFamily: theme.font.normal,
    fontSize: '.875rem',
    lineHeight: 'normal',
    margin: 0,
    marginTop: 2,
    minWidth: 'auto',
    padding: 0,
    '& svg': {
      marginRight: theme.spacing(),
    },
    '&:hover': {
      textDecoration: 'underline',
      '& svg': {
        color: theme.palette.primary.light,
      },
    },
  },
}));

interface Props {
  href: string;
  label?: string;
}

type CombinedProps = Props;

export const DocumentationButton: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { href, label } = props;

  return (
    <IconTextLink
      className={`${classes.root} docsButton`}
      SideIcon={DocsIcon}
      text={label ?? 'Docs'}
      title={label ?? 'Docs'}
      onClick={() => {
        sendHelpButtonClickEvent(href);
        window.open(href, '_blank', 'noopener');
      }}
      aria-describedby="external-site"
    />
  );
};

export default DocumentationButton;
