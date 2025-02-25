import { Checkbox, CircleProgress, Paper, Stack, Typography } from '@linode/ui';
import {
  createLazyRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { LandingHeader } from 'src/components/LandingHeader/LandingHeader';
import { Markdown } from 'src/components/Markdown/Markdown';
import { NotFound } from 'src/components/NotFound';
import { useCreateAccountBetaMutation } from 'src/queries/account/betas';
import { useBetaQuery } from 'src/queries/betas';

export const BetaSignup = () => {
  const betaAgreement = `### Early Adopter Testing Program
This Early Adopter Testing Program Service Level Agreement (the “EAP”) is between Linode LLC (“Linode”) and
you, the customer who requests access and participation (the “Participant”) to the Linode Early Access Program
(the “Program”). This EAP is attached to and amends the master services agreement between you and Linode
(the “MSA”), with respect to the subject matter herein, and is effective upon the date in which you are approved
for participation, if ever, in the Program (the “Effective Date”). In the event of any conflict of terms between this
EAP and the MSA, this EAP shall be deemed controlling only with respect to its expressed subject matter discussed.

1. Definitions. Capitalized terms which are used throughout this Agreement are defined in the section in which they are first used or as follows:

   1.1. “Project” the Linode product or service described in the applicable Project Addendum.

   1.2. “Project Service” each Linode product or service in which Tester access or availability is subject to this
            EAP and the applicable Project Addendum.

   1.3. “Project Addendum” the form, hereinafter attached as Annex 1, completed
            by Linode and distributed by Linode to Program Members, which described Project specific benefits, requirements,
            obligations, and privileges.

   1.4. “Project Feedback” all data provided by Program Member to Linode arising from Program Member’s
            participation in any Project.

   1.5. “Program” the Linode Early Access Program.

   1.6. “Program Member” each Tester that is authorized by Linode, at Linode’s sole and absolute discretion, to
            participate in the Program.

   1.7. “Loss” shall refer to any cost, damage, expense, and otherwise liability in connection with any dispute,
             controversy, claim, or action made or brought by Tester or any third party arising from the destruction,
             modification, or termination of Tester’s access, use, storage, maintenance, or inability to distribute,
             process, or transmit, any data or records arising from any Linode services or products, including without
             limitation, any Project Service.

   1.8. “Tester” collectively means Participant and Participant’s Representatives and End Users.

2. Incorporation, Modification. This EAP is attached to and amends the master services agreement by and
       between Linode and Tester  (the “MSA”) with respect to the subject matter herein. In the event
       of any conflict of terms between this EAP and the MSA, this EAP shall be deemed controlling and prevailing without
       exception.

3. Purpose. This EAP sets forth the procedures, qualifications, and limitations for your eligibility and
       participation in the Program. Any capitalized terms used, and not otherwise defined in this EAP, shall have the
       meaning set forth in the MSA. This EAP provides Participant's sole and exclusive remedy for any Loss arising
       from Participant's participation in the Program and all Projects therein.

4. Program Eligibility. For the duration of the Term, Tester must (i) be an Account Holder with an Account that is
       active and in good standing with Linode and (ii) not revoke or rescind Tester’s agreement to any provision of
       this EAP to remain a Program Member.

5. Project Qualification. Linode, at Linode’s sole and absolute discretion, may make Project Services available
       to Program Members, as described in the applicable Project Addendum.

6. Benefits and Compensation. Tester acknowledges and agrees that Tester’s selection by Linode to the
       Program represents good a valid consideration for the subject matter herein and that Tester shall not
       demand any other form of compensation. Linode, at Linode’s sole and absolute discretion, may offer Project specific
       benefits, but is in no event required, in a Project Addendum.

7. Acceptance of Risks. Participant, on behalf of Participant, Participant’s Representatives, and Participant’s End
       Users, acknowledges and voluntarily agrees:

   7.1. Tester is not entitled to any compensation, refund, or service credits for downtime or any other Loss
             arising from a Project Service;

   7.2. Tester should not use any Project Service in a live production environment;

   7.3 Each Project is in an incomplete and/or pre-release state and may function deficiently or fail;

   7.4. Tester’s use of a Project Service may result in an irrevocably total or partial Loss; and

   7.5. Each Project is expressly excluded from [Linode's Compute Service Level Addenda](https://www.linode.com/legal-sla-compute) and [Non-Compute Service Level Addenda.](https://www.linode.com/legal-sla-non-compute)

   7.6. Linode makes no guarantee regarding the uptime of a Project Service.

8. Conditions Precedent. Participant, on behalf of Participant, Participant’s Representatives, and Participant’s End Users, acknowledges and voluntarily agrees:

   8.1. Linode may modify or delete any data stored or processed via a Project Service at any time, with or without notice;

   8.2. Tester shall maintain a backup copy of Tester’s Linode services prior to installation or use of each applicable Project Service;

   8.3. Tester is prohibited from transferring Tester’s access to any Project Services without Linode’s expressed prior written consent;

   8.4. Tester shall irrevocably assign and transfer all rights to any Tester intellectual property, if any, arising from Tester’s participation in the Program, and that all such intellectual property shall be exclusively and universally owned by Linode in continuum, provided that Linode shall (i) not take ownership of any of Tester’s pre-existing intellectual property and (ii) grant Tester a non-exclusive, revocable license to use, solely for non-commercial purposes, such intellectual property upon prior written notice to Linode.

   8.5. Linode shall not be liable for any Loss experienced by Tester arising from any Project Service; and

   8.6. Linode may monitor, collect, and/or record any metrics, data, and / or metadata associated with your use of any Project Service.

9. Termination. Linode may terminate a Project Service at any time, with or without notice, including without limitation, any and all Tester data then processed, stored, or maintained on the applicable Project Service. Tester shall not be compensated or refunded for Linode’s termination of a Project Service, except as expressly provided to the contrary in the applicable Project Addendum.

10. Feedback, Data Analysis. Tester agrees to provide reasonably prompt Project Feedback regarding Tester’s experience with a Project Service in accordance to the appropriate Project Addendum, and that Linode may use and store Tester’s Project Feedback for any purpose relating to the development of Linode services. Linode, with Participant’s consent, may publicize Tester’s Project Feedback for promotional or marketing purposes.
`;

  const navigate = useNavigate();
  const { betaId } = useParams({ from: '/betas/signup/$betaId' });
  const { data: beta, isError, isLoading } = useBetaQuery(betaId, !!betaId);
  const [hasAgreed, setHasAgreed] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const { mutateAsync: createAccountBeta } = useCreateAccountBetaMutation();
  const { enqueueSnackbar } = useSnackbar();

  const enroll = async (betaId: string) => {
    setIsSubmitting(true);
    try {
      await createAccountBeta({ id: betaId });
      navigate({ to: '/betas' });
    } catch (errors) {
      enqueueSnackbar(errors[0]?.reason, {
        autoHideDuration: 10000,
        variant: 'error',
      });
      setIsSubmitting(false);
    }
  };

  if (betaId === undefined || isError || (beta === undefined && !isLoading)) {
    return <NotFound />;
  }

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          pathname: `/betas/${betaId}`,
        }}
        title={beta?.label}
      />
      <Paper>
        {isLoading || !beta ? (
          <CircleProgress />
        ) : (
          <Stack>
            <Typography paddingBottom={2} variant="h2">
              {beta.label}
            </Typography>
            <Typography paddingBottom={2}>{beta.description}</Typography>
            <Markdown textOrMarkdown={betaAgreement} />
            <Checkbox
              onChange={() => {
                setHasAgreed(!hasAgreed);
              }}
              text="I agree to the terms"
              value={hasAgreed}
            />
            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'submit',
                disabled: !hasAgreed,
                label: 'Sign Up',
                loading: isSubmitting,
                onClick: () => {
                  enroll(betaId);
                },
              }}
              secondaryButtonProps={{
                'data-testid': 'cancel',
                label: 'Cancel',
                onClick: () => {
                  navigate({ to: '/betas' });
                },
              }}
            />
          </Stack>
        )}
      </Paper>
    </>
  );
};

export const betaSignupLazyRoute = createLazyRoute('/betas/signup/$betaId')({
  component: BetaSignup,
});
