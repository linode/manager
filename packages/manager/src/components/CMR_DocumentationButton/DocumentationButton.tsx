import * as React from 'react';
import TicketIcon from 'src/assets/icons/ticket.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import IconTextLink from '../IconTextLink';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    alignItems: 'center',
    borderLeft: `1px solid ${theme.cmrBorderColors.borderTable}`,
    fontFamily: `${theme.font.normal} !important`,
    height: 50,
    lineHeight: 'normal',
    marginBottom: 0,
    marginRight: theme.spacing(2),
    minWidth: 'auto',
    paddingLeft: theme.spacing(2),
    padding: 0,
    '& svg': {
      marginRight: theme.spacing(1.5),
      width: 24
    },
    '&:hover svg': {
      color: theme.palette.primary.main
    }
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
    <IconTextLink
      className={classes.root}
      SideIcon={TicketIcon}
      hideText={hideText}
      text="Docs"
      title="Docs"
      onClick={() => window.open(href, '_blank', 'noopener')}
      aria-describedby="external-site"
    >
      Docs
    </IconTextLink>
  );
};

export default DocumentationButton;
