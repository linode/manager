import { actionCreatorFactory } from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/linode`);

export const addLinodeToStore = actionCreator<Linode.Linode>('add-linode-to-store');

export const updateLinodeInStore = actionCreator<{ id: number, update: (l: Linode.Linode) => Linode.Linode }>('update-linode-in-store');

export const updateLinodesInStore = actionCreator<Linode.Linode[]>('update-linodes-in-stire')

export const removeLinodeFromStore = actionCreator<number>('remove-from-store');
