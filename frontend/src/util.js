import { createBrowserHistory } from 'history';

export const history = createBrowserHistory({forceRefresh: true});

export const gradeMappings = new Map([
  [-1, 'Preschool'],
  [0, 'Kindergarten'],
  [1, 'First Grade'],
  [2, 'Second Grade'],
  [3, 'Third Grade'],
  [4, 'Fourth Grade'],
  [5, 'Fifth Grade'],
  [6, 'Sixth Grade'],
  [7, 'Seventh Grade'],
  [8, 'Eighth Grade'],
  [9, 'Ninth Grade'],
  [10, 'Tenth Grade'],
  [11, 'Eleventh Grade'],
  [12, 'Twelfth Grade'],
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

//export function getDateFromISODateTime(dateTime) {
//  return dateTime.slice(0, 10);
//}
//
//export function getTimeFromISODateTime(dateTime) {
//  return dateTime.slice(11);
//}