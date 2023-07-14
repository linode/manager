import * as React from 'react';
import { styled } from '@mui/material/styles';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Toggle } from 'src/components/Toggle';

interface AutoEnrollProps {
  enabled: boolean;
  error?: string;
  toggle: () => void;
}

export const AutoEnroll = (props: AutoEnrollProps) => {
  const { enabled, error, toggle } = props;

  return (
    <StyledPaper>
      {error && <Notice error text={error} />}
      <StyledFormControlLabel
        control={
          <Toggle checked={enabled} data-qa-enable-toggle onChange={toggle} />
        }
        label={
          <StyledDiv>
            <StyledTypography>
              Auto Enroll All New Linodes in Backups
            </StyledTypography>
            <Typography variant="body1">
              {`Enroll all future Linodes in backups. Your account will be billed
                    the additional hourly rate noted on the `}
              <Link
                data-qa-backups-price
                to="https://www.linode.com/products/backups/"
              >
                Backups pricing page
              </Link>
            </Typography>
          </StyledDiv>
        }
      />
    </StyledPaper>
  );
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.bg.offWhite,
  padding: theme.spacing(1),
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  alignItems: 'flex-start',
  display: 'flex',
  marginBottom: theme.spacing(1),
  marginLeft: 0,
}));

const StyledDiv = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(1) + theme.spacing(0.5),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: 17,
  marginBottom: theme.spacing(1),
}));
