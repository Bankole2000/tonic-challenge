import { USER_CONNECTED_HANDLER } from '../helpers/socketEventHandlers';

export const socketEventTypes = {
  ACCOUNT_DEBITED: 'ACCOUNT_DEBITED',
  ACCOUNT_CREDITED: 'ACCOUNT_CREDITED',
  USER_CONNECTED: 'USER_CONNECTED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  LOGGED_OUT: 'LOGGED_OUT'
};

export const socketEventHandlers = {
  [socketEventTypes.USER_CONNECTED]: USER_CONNECTED_HANDLER
};
