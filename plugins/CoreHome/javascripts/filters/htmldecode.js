/*!
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

angular.module('piwikApp.filter').filter('htmldecode', function() {
    return function(theString) {
        return piwikHelper.htmlDecode(theString);
    }
});
