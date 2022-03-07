import * as React from 'react';
import Paper from '../core/Paper';
import { makeStyles, Theme } from '../core/styles';
import Typography from '../core/Typography';

interface Props {
  heading: string;
  children?: JSX.Element | null;
  agreement?: JSX.Element;
  displaySections: { title?: string; details?: string | number }[];
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
}));

export const CheckoutSummary: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { heading, agreement, displaySections } = props;

  return (
    <Paper className={classes.paper}>
      <Typography
        variant="h2"
        data-qa-order-summary
        style={{ marginBottom: 4 }}
      >
        {heading}
      </Typography>
      {displaySections.map(({ title, details }, idx) => (
        <>
          {title ? (
            <>
              <Typography
                style={{ fontWeight: 'bolder' }}
                key={`${title}-${idx}`}
                component="span"
              >
                {title}
              </Typography>{' '}
            </>
          ) : null}
          <Typography
            key={`${details}-${idx}`}
            component="span"
            data-qa-details={details}
          >
            {details}
          </Typography>
          {idx !== displaySections.length - 1 ? <span> | </span> : null}
        </>
      ))}
      {props.children}
      {agreement ? agreement : null}
    </Paper>
  );
};
