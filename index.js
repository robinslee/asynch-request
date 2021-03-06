/*!
 * async-http-request
 * Copyright(c) 2017 Robin Li
 * MIT Licensed
 */

"use strict";

const request = require("request");
const staticMethods = Object.keys(request);
const staticFactoryMethods = [ "defaults", "forerer" ];
const staticHttpMethods = [ "get", "post", "put", "patch", "del", "delete", "head", "options" ];

const AsyncRequest = _wrapRequest();

for (let method of staticMethods) {
    if (staticHttpMethods.includes(method)) {
        AsyncRequest[method] = _wrapRequest(request[method]);
    } else if (staticFactoryMethods.includes(method)) {
        AsyncRequest[method] = opt => _wrapRequest(request[method](opt));
    } else {
        AsyncRequest[method] = request[method];
    }
}

/**
 * Export a request wrapped with Promise instance
 *
 * @type {Function}
 */
module.exports = AsyncRequest;

/**
 * Wrap request with a Promise instance
 *
 * @param {Function} doRequest
 * @return {Function}
 */
function _wrapRequest(doRequest = request) {
    return (opt, ...args) => new Promise((resolve, reject) => {
        let resolveWithResponse = opt && opt.resolveWithResponse;
        let resolveWithRequest = opt && opt.resolveWithRequest;
        delete opt.resolveWithResponse;
        delete opt.resolveWithRequest;

        if (resolveWithRequest) {
            resolve(doRequest(opt, ...args));
        } else {
            doRequest(opt, ...args.concat((error, response, body) => {
                if (error) {
                    reject(error);
                } else if (resolveWithResponse) {
                    resolve(response);
                } else {
                    resolve(body);
                }
            }));
        }
    });
}
