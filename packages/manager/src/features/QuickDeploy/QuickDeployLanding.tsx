import { CreateLinodeRequest } from '@linode/api-v4';
import { Typography } from '@mui/material';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { Dialog } from 'src/components/Dialog/Dialog';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { LandingHeader } from 'src/components/LandingHeader';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { Paper } from 'src/components/Paper';
import PasswordInput from 'src/components/PasswordInput/PasswordInput';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { useCreateLinodeMutation } from 'src/queries/linodes/linodes';
import { usePreferences } from 'src/queries/preferences';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { StyledTextTooltip } from '../Linodes/LinodesCreate/PlansAvailabilityNotice.styles';

const QuickDeployLanding = () => {
  const { data: preferences, error, isLoading } = usePreferences();
  const [password, setPassword] = React.useState('');
  // const [createError, setCreateError] = React.useState<string | undefined>();
  const [isDeployModalOpen, setIsDeployModalOpen] = React.useState(false);
  const [selectedPayload, setSelectedPayload] = React.useState<
    CreateLinodeRequest | undefined
  >();
  const { isLoading: isCreating, mutateAsync } = useCreateLinodeMutation();
  const history = useHistory();

  const handleCreateLinode = () => {
    if (!selectedPayload || !password) {
      return;
    }

    const newPayload: CreateLinodeRequest = {
      ...selectedPayload,
      label: `${Math.floor(Date.now() / 1000)}-${selectedPayload.label}`,
      root_pass: password,
    };

    mutateAsync(newPayload)
      .then((linode) => {
        history.push(`/linodes/${linode.id}`);
      })
      .catch(() => {
        // TODO: Error handling
        // setCreateError('There was an error creating your Linode');
      });
  };

  const quickDeployOptions = preferences?.quick_deploy_options;

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(
            error,
            'Error loading your Quick Deploy options.'
          )[0].reason
        }
      />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  const quickDeployOptionsLinodes = quickDeployOptions?.linodes ?? [];

  return (
    <>
      <LandingHeader title="Quick Deploy" />
      <Paper>
        <Typography variant="h3">Linodes</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {quickDeployOptionsLinodes.map((option) => {
              const { quickDeployLabel, ...payload } = option;
              return (
                <QuickDeployLinodeRow
                  handleClick={(payload: CreateLinodeRequest) => {
                    setIsDeployModalOpen(true);
                    setSelectedPayload(payload);
                  }}
                  key={quickDeployLabel}
                  payload={payload}
                  quickDeployLabel={quickDeployLabel}
                />
              );
            })}
          </TableBody>
        </Table>
      </Paper>
      <Dialog
        sx={{
          overflowX: 'hidden',
          paddingBottom: '0px',
        }}
        fullWidth
        maxWidth="sm"
        onClose={() => setIsDeployModalOpen(false)}
        open={isDeployModalOpen}
        title="Deploy Linode"
      >
        <PasswordInput
          expand={true}
          fullWidth={true}
          label="Linode Root Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <Button
          buttonType="primary"
          disabled={password === ''}
          loading={isCreating}
          onClick={handleCreateLinode}
          style={{ marginTop: 16 }}
        >
          Deploy
        </Button>
      </Dialog>
    </>
  );
};

export default QuickDeployLanding;

type QuickDeployLinodeRowProps = {
  handleClick: (payload: CreateLinodeRequest) => void;
  payload: CreateLinodeRequest;
  quickDeployLabel: string;
};

const QuickDeployLinodeRow = (props: QuickDeployLinodeRowProps) => {
  const { payload, quickDeployLabel } = props;

  const items = [
    { label: 'Label', value: payload.label },
    { label: 'Image', value: payload.image },
    { label: 'Region', value: payload.region },
    { label: 'Tags', value: JSON.stringify(payload.tags) },
    { label: 'SSH Keys', value: JSON.stringify(payload.authorized_keys) },
    { label: 'Firewall', value: String(payload.firewall_id) },
    { label: 'Backups Enabled', value: payload.backups_enabled ? 'Yes' : 'No' },
    { label: 'Private IP', value: payload.private_ip ? 'Yes' : 'No' },
  ];

  return (
    <TableRow>
      <TableCell>
        <StyledTextTooltip
          tooltipText={
            <List>
              {items.map((item) => {
                if (!item.value) {
                  return null;
                }
                return (
                  <QuickDeployItem
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                );
              })}
            </List>
          }
          displayText={quickDeployLabel}
        />
      </TableCell>
      <TableCell>{payload.region}</TableCell>
      <TableCell>{payload.type}</TableCell>
      <TableCell actionCell>
        <InlineMenuAction
          actionText="Deploy"
          onClick={() => props.handleClick(payload)}
        />
      </TableCell>
    </TableRow>
  );
};

const QuickDeployItem = (props: { label: string; value: string }) => {
  return (
    <ListItem>
      <b>{props.label}: </b>
      <span style={{ marginLeft: 4 }}>{props.value}</span>
    </ListItem>
  );
};
