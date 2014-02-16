/*!
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

piwikAppServices.factory('piwikApi', function ($http, $q, $rootScope, piwik, $window) {

    var url = 'index.php';
    var format = 'json';
    var getParams  = {};
    var postParams = {};
    var requestHandle = null;

    var piwikApi = {};

    /**
     * Adds params to the request.
     * If params are given more then once, the latest given value is used for the request
     *
     * @param {object}  params
     * @return {void}
     */
    function addParams (params) {
        if (typeof params == 'string') {
            params = piwik.broadcast.getValuesFromUrl(params);
        }

        for (var key in params) {
            getParams[key] = params[key];
        }
    };

    /**
     * Send the request
     * @param {boolean}  cacheResult   TODO Note: caching does currently not work because we have to make POST requests
     *                                 instead of GET
     * @return $promise
     */
    function send (cacheResult) {

        var deferred = requestHandle = $q.defer();

        var onError = function (message) {
            deferred.reject(message);
            requestHandle = null;
        };

        var onSuccess = function (response) {
            if (response && response.result == 'error') {

                if (response.message) {
                    onError(response.message);

                    var UI = require('piwik/UI');
                    var notification = new UI.Notification();
                    notification.show(response.message, {
                        context: 'error',
                        type: 'toast',
                        id: 'ajaxHelper'
                    });
                    notification.scrollToNotification();
                } else {
                    onError(null);
                }

            } else {
                deferred.resolve(response);
            }
            requestHandle = null;
        };

        var headers = {'Content-Type': 'application/x-www-form-urlencoded'};

        if (!cacheResult) {
            // ie 8,9,10 caches ajax requests, prevent this
            headers['cache-control'] = 'no-cache';
        }

        var ajaxCall = {
            method: 'POST',
            url: url,
            responseType: format,
            params: _mixinDefaultGetParams(getParams),
            data: $.param(getPostParams(postParams)),
            cache: cacheResult,
            timeout: deferred.promise,
            headers: headers
        };

        $http(ajaxCall).success(onSuccess).error(onError);

        return deferred.promise;
    };

    /**
     * Get the parameters to send as POST
     *
     * @param {object}   params   parameter object
     * @return {object}
     * @private
     */
     function getPostParams () {
        return {
            token_auth: piwik.token_auth
        };
    };

    /**
     * Mixin the default parameters to send as GET
     *
     * @param {object}   getParamsToMixin   parameter object
     * @return {object}
     * @private
     */
    function _mixinDefaultGetParams (getParamsToMixin) {

        var defaultParams = {
            idSite:  piwik.idSite || piwik.broadcast.getValueFromUrl('idSite'),
            period:  piwik.period || piwik.broadcast.getValueFromUrl('period'),
            segment: piwik.broadcast.getValueFromHash('segment', $window.location.href.split('#')[1])
        };

        // never append token_auth to url
        if (getParamsToMixin.token_auth) {
            getParamsToMixin.token_auth = null;
            delete getParamsToMixin.token_auth;
        }

        for (var key in defaultParams) {
            if (!getParamsToMixin[key] && !postParams[key] && defaultParams[key]) {
                getParamsToMixin[key] = defaultParams[key];
            }
        }

        // handle default date & period if not already set
        if (!getParamsToMixin.date && !postParams.date) {
            getParamsToMixin.date = piwik.currentDateString || piwik.broadcast.getValueFromUrl('date');
            if (getParamsToMixin.period == 'range' && piwik.currentDateString) {
                getParamsToMixin.date = piwik.startDateString + ',' + getParamsToMixin.date;
            }
        }

        return getParamsToMixin;
    };

    piwikApi.abort = function () {
        getParams  = {};
        postParams = {};

        if (requestHandle) {
            requestHandle.resolve();
            requestHandle = null;
        }
    };

    /**
     * Make a reading API request. Response is cached for fast future requests
     * @param getParams
     */
    piwikApi.fetch = function (getParams) {

        getParams.module = 'API';
        getParams.format = 'JSON';

        addParams(getParams, 'GET');

        return send(true);
    };

    return piwikApi;
});