'use strict';

/**
 * @ngdoc function
 * @name CMSLoginApp:Services
 * @description
 * # Services
 * Services of the CMSLoginApp
 */

//        SERVICES

loginAppp.service('DataService', ['$http', '$window', function ($http, $window) {

    this.login = function (data) {
        return $http.post('http://localhost:8080/api/users/login2', data,
            {
                headers: {'X-CSRF-TOKEN': hValue, 'Content-Type': 'Application/json'}
            });
    };

    this.changePassword = function (formdata) {
        return $http.post(urlBase + 'users/password', formdata,
            {
                headers: {'X-CSRF-TOKEN': hValue, 'Content-Type': undefined}
            });
    };

    this.sendOTP = function (otp) {
//        console.log("OTP:", otp);
//        console.log("access_token:", $window.localStorage.getItem('access_token'));

        return $http.post(urlBase + 'otp/verification?&userIp=192.168.8.675&userAgent=Browser/Application&otp=' + otp, {},
            {
                headers: {'X-CSRF-TOKEN': hValue}
            });
    };

    this.resendOTP = function () {
        return $http.get(urlBase + 'otp/resend',
            {
                headers: {'X-CSRF-TOKEN': hValue, 'Content-Type': undefined}
            });
    };
    this.forgotPassword = function (formdata) {
        console.log("email", formdata);
        console.log("access_token:", $window.localStorage.getItem('access_token'));
        return $http.post(urlBase + 'users/forgot-password', formdata,
            {
                headers: {'X-CSRF-TOKEN': hValue, 'Content-Type': undefined}
            });
    };

    this.getPasswordPolicy = function () {
        return $http.get(urlBase + 'sys-config/password',
            {
                headers: {'X-CSRF-TOKEN': hValue, 'Content-Type': undefined}
            });
    };

    this.logout = function () {
        return $http.post('/logout', {},
            {
                headers: {'X-CSRF-TOKEN': hValue}
            });
    };
}])
