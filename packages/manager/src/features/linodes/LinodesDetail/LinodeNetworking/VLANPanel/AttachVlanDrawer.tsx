import * as React from 'react';

import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import ActionsPanel from 'src/components/ActionsPanel';
import Notice from 'src/components/Notice';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import EnhancedSelect from 'src/components/EnhancedSelect/Select';
import Button from 'src/components/Button';
import { getLinodeConfigs } from 'src/store/linodes/config/config.requests';
import { useDispatch } from 'react-redux';
import { attachVlan } from '@linode/api-v4/lib/vlans';
import { VlanData } from './LinodeVLANs';

const useStyles = makeStyles(() => ({
  actionsPanel: {
    marginTop: 8
  }
}));

interface Props {
  open: boolean;
  closeDrawer: () => void;
  error: string | null;
  linodeLabel: string;
  linodeId: number;
  vlans: any;
  readOnly: boolean;
  refreshInterfaces: () => void;
}

export type CombinedProps = Props;

export const AttachVlanDrawer: React.FC<CombinedProps> = props => {
  const {
    error,
    closeDrawer,
    open,
    linodeLabel,
    linodeId,
    vlans,
    readOnly,
    refreshInterfaces
  } = props;

  const classes = useStyles();
  const dispatch = useDispatch();

  const [selected, setSelected] = React.useState<number>(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(error);

  React.useEffect(() => {
    if (open) {
      setSelected(0);
      setErrorMessage('');
    }
  }, [open]);

  const vlanOptions = Object.values(vlans).map((thisVlan: VlanData) => ({
    value: thisVlan.id,
    label:
      thisVlan.description.length > 0
        ? thisVlan.description
        : `vlan-${thisVlan.id}`
  }));

  const disabled = !selected || readOnly;

  const handleAttach = () => {
    setSubmitting(true);

    attachVlan(selected, [linodeId])
      .then(_ => {
        setSubmitting(false);
        dispatch(getLinodeConfigs({ linodeId }));
        refreshInterfaces();
        closeDrawer();
      })
      .catch(errResponse => {
        setSubmitting(false);
        setErrorMessage(getErrorStringOrDefault(errResponse));
      });
  };

  return (
    <Drawer title={'Attach a VLAN'} open={open} onClose={closeDrawer}>
      <Typography variant="h2">{linodeLabel}</Typography>
      {errorMessage && <Notice error text={errorMessage} spacingTop={8} />}
      <EnhancedSelect
        name={'VLAN'}
        label="VLAN"
        placeholder="Select a VLAN"
        value={vlanOptions.find(thisOption => thisOption.value === selected)}
        options={vlanOptions}
        onChange={(_selected: { value: number; label: string }) =>
          setSelected(_selected.value)
        }
        isClearable={false}
      />
      <ActionsPanel className={classes.actionsPanel}>
        <Button
          buttonType="primary"
          onClick={handleAttach}
          disabled={disabled}
          style={{ marginBottom: 8 }}
          loading={submitting}
        >
          Attach
        </Button>
        <Button buttonType="secondary" onClick={closeDrawer} data-qa-cancel>
          Close
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

export default AttachVlanDrawer;
