import {
  createDomainRecord,
  updateDomainRecord,
} from '@linode/api-v4/lib/domains';
import { Notice } from '@linode/ui';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import { isValidCNAME, isValidDomainRecord } from '../../domainUtils';
import {
  castFormValuesToNumeric,
  defaultFieldsState,
  filterDataByType,
  modeMap,
  noARecordsNoticeText,
  resolveAlias,
  typeMap,
} from './DomainRecordDrawerUtils';
import { generateDrawerTypes } from './generateDrawerTypes';

import type {
  Domain,
  DomainRecord,
  DomainType,
  RecordType,
  UpdateDomainPayload,
} from '@linode/api-v4/lib/domains';
import type { APIError } from '@linode/api-v4/lib/types';

interface UpdateDomainDataProps extends UpdateDomainPayload {
  id: number;
}

export interface DomainRecordDrawerProps
  extends Partial<Omit<DomainRecord, 'type'>>,
    Partial<Omit<Domain, 'type'>> {
  domain: string;
  domainId: number;
  /**
   * Used to populate fields on edits.
   */
  id?: number;
  mode: 'create' | 'edit';
  onClose: () => void;
  open: boolean;
  records: DomainRecord[];
  type: DomainType | RecordType;

  updateDomain: (data: UpdateDomainDataProps) => Promise<Domain>;
  updateRecords: () => void;
}

interface EditableSharedFields {
  ttl_sec?: number;
}
export interface EditableRecordFields extends EditableSharedFields {
  name?: string;
  port?: string;
  priority?: string;
  protocol?: null | string;
  service?: null | string;
  tag?: null | string;
  target?: string;
  weight?: string;
}

export interface EditableDomainFields extends EditableSharedFields {
  axfr_ips?: string[];
  description?: string;
  domain?: string;
  expire_sec?: number;
  refresh_sec?: number;
  retry_sec?: number;
  soa_email?: string;
}

type ErrorFields =
  | '_unknown'
  | 'none'
  | keyof EditableDomainFields
  | keyof EditableRecordFields
  | undefined;

export const DomainRecordDrawer = (props: DomainRecordDrawerProps) => {
  const { mode, open, records, type } = props;

  const formContainerRef = React.useRef<HTMLFormElement>(null);

  const defaultValues = defaultFieldsState(props);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = useForm<EditableDomainFields | EditableRecordFields>({
    defaultValues,
    mode: 'onBlur',
    values: defaultValues,
  });

  const types = generateDrawerTypes(props, control);

  const { fields } = types[type];
  const isCreating = mode === 'create';
  const isDomain = type === 'master' || type === 'slave';

  // If there are no A/AAAA records and a user tries to add an NS record,
  // they'll see a warning message asking them to add an A/AAAA record.
  const hasARecords = records.find((thisRecord) =>
    ['A', 'AAAA'].includes(thisRecord.type)
  );

  const otherErrors = [
    errors?.root?._unknown,
    errors?.root?.none,
    errors?.root?.root,
  ];

  const handleRecordSubmissionSuccess = () => {
    props.updateRecords();
    handleClose();
  };

  const handleSubmissionErrors = (errorResponse: APIError[]) => {
    const errors = getAPIErrorOrDefault(errorResponse);

    for (const error of errors) {
      const errorField = error.field as ErrorFields;

      if (errorField === '_unknown' || errorField === 'none') {
        setError(`root.${errorField}`, {
          message: error.reason,
        });
      } else if (errorField) {
        setError(errorField, {
          message: error.reason,
        });
      } else {
        setError('root.root', {
          message: error.reason,
        });
      }
    }

    scrollErrorIntoViewV2(formContainerRef);
  };

  const onDomainEdit = async (formData: EditableDomainFields) => {
    const { domainId, type, updateDomain } = props;

    const data = {
      ...filterDataByType(formData, type),
    } as Partial<EditableDomainFields>;

    if (data.axfr_ips) {
      /**
       * Don't submit blank strings to the API.
       * Also trim the resulting array, since '192.0.2.0, 192.0.2.1'
       * will submit ' 192.0.2.1', which is an invalid value.
       */
      data.axfr_ips = data.axfr_ips
        .filter((ip) => ip !== '')
        .map((ip) => ip.trim());
    }

    await updateDomain({ id: domainId, ...data, status: 'active' })
      .then(() => {
        handleClose();
      })
      .catch(handleSubmissionErrors);
  };

  const onRecordCreate = async (formData: EditableRecordFields) => {
    const { domain, records, type } = props;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave') {
      return;
    }

    const _data = {
      type,
      ...filterDataByType(formData, type),
    };

    // Expand @ to the Domain in appropriate fields
    let data = resolveAlias(_data, domain, type);
    // Convert string values to numeric, replacing '' with undefined
    data = castFormValuesToNumeric(data);

    /**
     * Validation
     *
     * This should be done on the API side, but several breaking
     * configurations will currently succeed on their end.
     */
    const _domain = (data?.name ?? '') as string;
    const invalidCNAME =
      data.type === 'CNAME' && !isValidCNAME(_domain, records);

    if (!isValidDomainRecord(_domain, records) || invalidCNAME) {
      const error = {
        field: 'name',
        reason: 'Record conflict - CNAMES must be unique',
      };
      handleSubmissionErrors([error]);
      return;
    }

    await createDomainRecord(props.domainId, data)
      .then(handleRecordSubmissionSuccess)
      .catch(handleSubmissionErrors);
  };

  const onRecordEdit = async (formData: EditableRecordFields) => {
    const { domain, domainId, id, type } = props;
    const fields = formData;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave' || !id) {
      return;
    }

    const _data = {
      ...filterDataByType(fields, type),
    };

    // Expand @ to the Domain in appropriate fields
    let data = resolveAlias(_data, domain, type);
    // Convert string values to numeric, replacing '' with undefined
    data = castFormValuesToNumeric(data);
    await updateDomainRecord(domainId, id, data)
      .then(handleRecordSubmissionSuccess)
      .catch(handleSubmissionErrors);
  };

  const handleClose = () => {
    reset();
    props.onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    if (isDomain) {
      await onDomainEdit(data);
    } else if (isCreating) {
      await onRecordCreate(data);
    } else {
      await onRecordEdit(data);
    }
  });

  return (
    <Drawer
      onClose={handleClose}
      open={open}
      title={`${modeMap[mode]} ${typeMap[type]} Record`}
    >
      <form onSubmit={onSubmit} ref={formContainerRef}>
        {otherErrors.map((error, idx) =>
          error ? (
            <Notice key={`error-${idx}`} text={error.message} variant="error" />
          ) : null
        )}
        {!hasARecords && type === 'NS' && (
          <Notice
            spacingTop={8}
            text={noARecordsNoticeText}
            variant="warning"
          />
        )}
        {fields.map((field, idx) =>
          field && typeof field === 'function' ? field(idx) : null
        )}
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'save',
            disabled: isSubmitting,
            label: 'Save',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
      </form>
    </Drawer>
  );
};
