import * as React from 'react';

export interface DialogState {
  isOpen: boolean;
  isLoading: boolean;
  entityID: number;
  entityLabel?: string;
  error?: string;
}

export const useDialog = <T>(
  request: (params?: T) => Promise<any>
): {
  dialog: DialogState;
  openDialog: (id: number, label?: string) => void;
  closeDialog: () => void;
  submitDialog: (params: T) => Promise<any>;
  handleError: (e: string) => void;
} => {
  const [error, setErrors] = React.useState<string | undefined>();
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const [entityID, setEntityID] = React.useState<number>(-1);
  const [entityLabel, setEntityLabel] = React.useState<string>('');

  const submitDialog = (params: T) => {
    setErrors(undefined);
    setLoading(true);
    return request(params)
      .then(response => {
        handleSuccess();
        return response;
      })
      .catch((e: Linode.ApiFieldError[]) => {
        handleError(e[0].reason);
        return Promise.reject(e);
      });
  };

  const openDialog = (id: number, label: string = '') => {
    setEntityLabel(label);
    setEntityID(id);
    setErrors(undefined);
    setLoading(false);
    setOpen(true);
  };

  const handleSuccess = () => {
    setErrors(undefined);
    setLoading(false);
    setOpen(false);
  };

  const handleError = (e: string) => {
    setErrors(e);
    setLoading(false);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return {
    dialog: { isOpen, isLoading, error, entityLabel, entityID },
    openDialog,
    closeDialog,
    submitDialog,
    handleError
  };
};
