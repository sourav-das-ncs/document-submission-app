using { general as my } from '../db/schema';

@path: '/service/general'
// @requires: 'authenticated-user'
service generalService {
 function triggerWorkflow() returns String;
 action handleNotification();
}
