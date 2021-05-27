export let imageUploadInProgress = false;

export const setImageUploadInProgress = (newValue: boolean) =>
  (imageUploadInProgress = newValue);
