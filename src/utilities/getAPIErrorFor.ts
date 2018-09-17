import { mapAPIErrorsToObject } from "src/utilities/apiErrorHandling";

/** This is basically a bridge function to bridge between the old implementation and the new. */
const getAPIErrorFor: (_: any, errors?: Linode.ApiFieldError[]) => (key: string) => undefined | string
  = (_, errors = []) => {
    /**
     * If there are no errors we can return a function which will return
     * undefined every time. This prevents calling mapAPIErrorsToObject.
     */
    if (errors.length === 0) { return () => undefined; }

    const errorMap = mapAPIErrorsToObject(errors);

    return (key) => errorMap[key];
  };

export default getAPIErrorFor;
