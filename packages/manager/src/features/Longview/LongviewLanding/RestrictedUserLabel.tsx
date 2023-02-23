import * as React from 'react';
import Typography from 'src/components/core/Typography';

interface Props {
  label: string;
  subtext: string;
}

type CombinedProps = Props;

const RestrictedUserLabel: React.FC<React.PropsWithChildren<CombinedProps>> = (props) => {
  return (
    <React.Fragment>
      <Typography>
        <strong>{props.label}</strong>
      </Typography>
      <Typography>{props.subtext}</Typography>
    </React.Fragment>
  );
};

export default React.memo(RestrictedUserLabel);
