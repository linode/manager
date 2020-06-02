import * as React from 'react';
import TicketIcon from 'src/assets/icons/ticket.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import IconTextLink from '../IconTextLink';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    alignItems: 'center',
    borderLeft: '1px solid #f4f5f6',
    height: 50,
    lineHeight: 'normal',
    marginBottom: 0,
    marginRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    minWidth: 'auto',
    padding: 0,
    '& svg': {
      width: 24,
      height: 22,
      marginRight: theme.spacing(1.5)
    },
    '& .insidePath': {
      fill: 'none',
      fillRule: 'evenodd',
      stroke: '#3683DC',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '1.5'
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
      SideIcon={TicketIcon}
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
