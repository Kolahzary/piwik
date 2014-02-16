/*!
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */
var piwikAppFilters = angular.module('piwikApp.filter', []);

piwikAppFilters.filter('translate', function() {
    return function(key) {
        return _pk_translate(key);
    }
});

piwikAppFilters.filter('htmldecode', function() {
    return function(theString) {
        return piwikHelper.htmlDecode(theString);
    }
});