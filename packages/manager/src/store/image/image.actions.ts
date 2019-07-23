import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/images`);

export const getImagesRequest = actionCreator(`request`);

export const getImagesSuccess = actionCreator<Linode.Image[]>(`success`);

export const getImagesFailure = actionCreator<Linode.ApiFieldError[]>(`fail`);

export const removeImage = actionCreator<number | string>(`remove`);

export const addOrUpdateImage = actionCreator<Linode.Image>('add_or_update');
