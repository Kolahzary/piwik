var piwikApp = angular.module('piwikApp', [
    'ngSanitize',
    'piwikApp.config',
    'piwikApp.service',
    'piwikApp.directive',
    'piwikApp.filter'
]);
var customApp = angular.module('app', []);