import { createBrowserHistory } from 'history';
import moment from 'moment-timezone';

export const history = createBrowserHistory({forceRefresh: true});

export const timeZoneNames = moment.tz.names().filter(tz => tz !== 'Asia/Qostanay').map(tz => tz.replace('_', ' ')); // TODO Asia/Qostanay isn't in pytz timezones

export const gradeMappings = new Map([
  [-1, '未就学'],
  [0, '幼稚園'],
  [1, '小１'],
  [2, '小２'],
  [3, '小３'],
  [4, '小４'],
  [5, '小５'],
  [6, '中１'],
  [7, '中２'],
  [8, '中３'],
  [9, '高１'],
  [10, '高２'],
  [11, '高３'],
  [12, '高４'],
]);

// TODO redirect to login if no token
export function getUserIdFromToken() {
  const token = localStorage.getItem('refresh_token');
  const encodedPayLoad = token.split('.')[1];
  const payloadObject = JSON.parse(atob(encodedPayLoad));
  const userId = payloadObject.user_id;
  return userId;
}

function getUserTypeFromToken() {
  const token = localStorage.getItem('refresh_token');
  const encodedPayLoad = token.split('.')[1];
  const payloadObject = JSON.parse(atob(encodedPayLoad));
  const userType = payloadObject.user_type;
  return userType;
}

export function isTeacher() {
  return getUserTypeFromToken() === 'TEACHER';
}

export function isStudent() {
  return getUserTypeFromToken() === 'STUDENT';
}

export function isAdmin() {
  return getUserTypeFromToken() === 'ADMIN';
}

export class AccountRegistrationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AccountRegistrationError';
  }
}

export class CardError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CardError';
  }
}

export class SetupIntentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SetupIntentError';
  }
}

// export function getDateFromISODateTime(dateTime) {
//  return dateTime.slice(0, 10);
// }

// export function getTimeFromISODateTime(dateTime) {
//  return dateTime.slice(11);
// }