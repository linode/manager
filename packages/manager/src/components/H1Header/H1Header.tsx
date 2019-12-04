import { compose } from 'ramda';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import RenderGuard from 'src/components/RenderGuard';

interface Props {
  title: string;
  className?: string;
}

// Accessibility Feature:
// The role of this component is to implement focus to the main content when navigating the application
// Since it is a one page APP, we need to help users focus on the main content when switching views
// It should serve as the only source for all H1s

const H1Header: React.FC<Props> = props => {
  const h1Header = React.useRef<HTMLDivElement>(null);
  const { className, title } = props;

  React.useEffect(() => {
    if (h1Header.current !== null) {
      h1Header.current.focus();
    }
  }, []);

  return (
    <Typography variant="h1" className={className} ref={h1Header} tabIndex={-1}>
      {title}
    </Typography>
  );
};

export default compose<any, any>(RenderGuard)(H1Header);
