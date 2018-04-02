export default (
  errorMap: { [index: string]: string },
  arr: Linode.ApiFieldError[] = [],
) => (field: string): undefined | string => {

  const err = arr.find(e => e.field === field);
  if (!err) {
    return;
  }

  return err.reason.replace(err.field, errorMap[err.field]);
};
