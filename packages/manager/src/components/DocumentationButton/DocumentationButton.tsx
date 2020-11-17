import * as React from 'react';
import BookIcon from 'src/assets/icons/book.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import useFlags from 'src/hooks/useFlags';
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
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '1.5'
    }
  },
  cmrSpacing: {
    [theme.breakpoints.down(1100)]: {
      marginRight: -4
    }
  }
}));

interface Props {
  href: string;
}

type CombinedProps = Props;

export const DocumentationButton: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const flags = useFlags();

  const { href } = props;

  return (
    <IconTextLink
      className={`${classes.root} ${flags.cmr && classes.cmrSpacing}`}
      SideIcon={BookIcon}
      text="Documentation"
      title="Documentation"
      onClick={() => window.open(href, '_blank', 'noopener')}
      aria-describedby="external-site"
    >
      Documentation
    </IconTextLink>
  );
};

export default DocumentationButton;
