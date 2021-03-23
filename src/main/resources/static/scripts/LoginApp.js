'use strict';
/**
 * @ngdoc overview
 * @name CMSLoginApp
 * @description
 * # CMSLoginApp
 *
 * Login module of the application.
 */
var loginAppp = angular.module('CMSLoginApp', ['ngRoute']);

loginAppp.config(function ($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(false);
    $locationProvider.hashPrefix('');
    $routeProvider.when("/login", {
        url: '/login',
        controller: 'LoginCtrl',
        templateUrl: 'templates/login-box.html'
    })
            .when("/changepassword", {
                url: '/changepassword',
                controller: 'ChangePasswordCtrl',
                templateUrl: 'templates/changepassword-box.html'
            })
            .when("/otp", {
                url: '/otp',
                controller: 'OTPCtrl',
                templateUrl: 'templates/otp-box.html'
            })
            .when("/ForgotPassword", {
                url: '/ForgotPassword',
                controller: 'ForgotPasswordCtrl',
                templateUrl: 'templates/forgot-password.html'
            }).otherwise({redirectTo: "/login"});
}).
        run(function ($rootScope, $window) {
            console.log('Starting login application');



//    if ($window.localStorage.getItem('loggedInUser') != null) {
//        $window.location = 'index.html';
//    }
        })




//CONFIG

var version = "1.0.0.0";

/* DEV ENV URL */
// var urlBase = '/';

/* DEV ENV PUBLIC URL*/

// var urlBase = 'api/';

/* SYSTEM IDLE TIMEOUT */
var idleTimeout = 15 * 60; //In Seconds

//HEADER VALUE
var hValue = document.head.querySelector("[name=_csrf]").content;

//HEADER NAME
var hName = document.head.querySelector("[name=_csrf_header]").content;



