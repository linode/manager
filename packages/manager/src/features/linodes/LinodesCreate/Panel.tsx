import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

interface Props {
  error?: string;
  title?: string;
  className?: string;
}

type CombinedProps = Props;

const Panel: React.FC<CombinedProps> = (props) => {
  const { children, error, title } = props;

  return (
    <Paper className={props.className} data-qa-tp="Select Image">
      {error && <Notice text={error} error />}
      <Typography variant="h2" data-qa-tp="Select Image">
        {title || 'Select an Image'}
      </Typography>
      {children}
    </Paper>
  );
};

export default Panel;
