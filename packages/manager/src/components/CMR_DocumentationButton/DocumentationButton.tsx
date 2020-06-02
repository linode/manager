import * as React from 'react';
import TicketIcon from 'src/assets/icons/ticket.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import IconTextLink from '../IconTextLink';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `0 ${theme.spacing(1) + 4}px`,
    marginBottom: 0,
    lineHeight: 'normal',
    '& svg': {
      width: 24,
      height: 22
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
