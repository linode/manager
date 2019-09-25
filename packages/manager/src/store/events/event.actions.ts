import actionCreatorFactory from 'typescript-fsa';
import { ExtendedEvent } from './event.types';

type Event = ExtendedEvent;

export const ADD_EVENTS = `ADD_EVENTS`;

export const UPDATE_EVENTS_AS_SEEN = `UPDATE_EVENTS_AS_SEEN`;

export const actionCreator = actionCreatorFactory(`@@manager/events`);

export const addEvents = actionCreator<Event[]>(ADD_EVENTS);

export const updateEventsAsSeen = actionCreator(UPDATE_EVENTS_AS_SEEN);

export const setPollingInterval = actionCreator<number>('set-polling-interval');

export const setRequestDeadline = actionCreator<number>('set-request-deadline');
