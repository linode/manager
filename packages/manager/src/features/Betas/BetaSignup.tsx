import { Stack } from '@mui/system';
import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Checkbox } from 'src/components/Checkbox';

import { LandingHeader } from 'src/components/LandingHeader/LandingHeader';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { useBetaQuery } from 'src/queries/betas';
import { useCreateAccountBetaMutation } from 'src/queries/accountBetas';
import { useSnackbar } from 'notistack';
import { NotFound } from 'src/components/NotFound';
import { CircleProgress } from 'src/components/CircleProgress';

const BetaSignup = () => {
  const betaAgreement =
    'Pellentesque dapibus suscipit ligula.  Donec posuere augue in quam.  Etiam vel tortor sodales tellus ultricies commodo.  Suspendisse potenti.  Aenean in sem ac leo mollis blandit.  Donec neque quam, dignissim in, mollis nec, sagittis eu, wisi.  Phasellus lacus.  Etiam laoreet quam sed arcu.  Phasellus at dui in ligula mollis ultricies.  Integer placerat tristique nisl.  Praesent augue.  Fusce commodo.  Vestibulum convallis, lorem a tempus semper, dui dui euismod elit, vitae placerat urna tortor vitae lacus.  Nullam libero mauris, consequat quis, varius et, dictum id, arcu.  Mauris mollis tincidunt felis.  Aliquam feugiat tellus ut neque.  Nulla facilisis, risus a rhoncus fermentum, tellus tellus lacinia purus, et dictum nunc justo sit amet elit. Aliquam erat volutpat.  Nunc eleifend leo vitae magna.  In id erat non orci commodo lobortis.  Proin neque massa, cursus ut, gravida ut, lobortis eget, lacus.  Sed diam.  Praesent fermentum tempor tellus.  Nullam tempus.  Mauris ac felis vel velit tristique imperdiet.  Donec at pede.  Etiam vel neque nec dui dignissim bibendum.  Vivamus id enim.  Phasellus neque orci, porta a, aliquet quis, semper a, massa.  Phasellus purus.  Pellentesque tristique imperdiet tortor.  Nam euismod tellus id erat.';

  const history = useHistory();
  const { betaId } = useParams<{ betaId: string }>();
  const { data: beta, isLoading, isError } = useBetaQuery(betaId);
  const [hasAgreed, setHasAgreed] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const { mutateAsync: createAccountBeta } = useCreateAccountBetaMutation();
  const { enqueueSnackbar } = useSnackbar();

  const enroll = async (betaId: string) => {
    setIsSubmitting(true);
    try {
      await createAccountBeta({ id: betaId });
      history.push('/betas');
    } catch (errors) {
      enqueueSnackbar(errors[0]?.reason, {
        autoHideDuration: 10000,
        variant: 'error',
      });
      setIsSubmitting(false);
    }
  };

  if (isError || (beta === undefined && !isLoading)) {
    return <NotFound />;
  }

  return (
    <>
      <LandingHeader title="Sign Up" />
      <Paper>
        {isLoading ? (
          <CircleProgress />
        ) : (
          <Stack>
            <Typography variant="h2" paddingBottom={2}>
              {beta.label}
            </Typography>
            <Typography paddingBottom={2}>{beta.description}</Typography>
            <Typography paddingBottom={2}>{betaAgreement}</Typography>
            <Checkbox
              value={hasAgreed}
              text="I agree to the terms"
              onChange={() => {
                setHasAgreed(!hasAgreed);
              }}
            />
            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'submit',
                label: 'Sign Up',
                disabled: !hasAgreed,
                onClick: () => {
                  enroll(betaId);
                },
                loading: isSubmitting,
              }}
              secondaryButtonProps={{
                'data-testid': 'cancel',
                label: 'Cancel',
                onClick: () => {
                  history.push('/betas');
                },
              }}
            />
          </Stack>
        )}
      </Paper>
    </>
  );
};

export default BetaSignup;
