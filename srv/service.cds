using { testjobscheduler as my } from '../db/schema';

@path: '/service/testjobscheduler'
// @requires: 'authenticated-user'
service testjobschedulerService {
 function triggerWorkflow() returns String;
 action handleNotification();
}
