import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

interface Props {
  title: string;
  className?: string;
  dataQaEl?: string;
  renderAsSecondary?: boolean;
}

const useStyles = makeStyles({
  root: {
    '&:focus': {
      outline: 'none',
    },
  },
});

// Accessibility Feature:
// The role of this component is to implement focus to the main content when navigating the application
// Since it is a one page APP, we need to help users focus on the main content when switching views
// It should serve as the only source for all H1s
const H1Header: React.FC<Props> = props => {
  const h1Header = React.useRef<HTMLDivElement>(null);
  const { className, title, dataQaEl, renderAsSecondary } = props;
  const classes = useStyles();

  // React.useEffect(() => {
  //   if (h1Header.current !== null) {
  //     h1Header.current.focus();
  //   }
  // }, []);

  return (
    <Typography
      variant="h1"
      component={renderAsSecondary ? 'h2' : 'h1'}
      className={`${classes.root} ${className}`}
      // If we're rendering as an h2, we want to remove the autofocus functionality
      ref={renderAsSecondary ? null : h1Header}
      tabIndex={0}
      data-qa-header={dataQaEl ? dataQaEl : ''}
    >
      {title}
    </Typography>
  );
};

export default H1Header;
