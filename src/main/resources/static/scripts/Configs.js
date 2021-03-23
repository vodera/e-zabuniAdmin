/**
 * @ngdoc overview
 * @name Configs
 * @description
 * # CMSAdminApp Configs
 *
 * Configurations of the application.
 */
/* APP VERSION NUMBER */
var version = "1.0.0.0";

/* DEV ENV URL */
// var urlBase = '/';

/* DEV ENV PUBLIC URL*/
var urlBase = 'http://localhost:8080/api/';

/* SYSTEM IDLE TIMEOUT */
var idleTimeout = 15*60; //In Seconds

// var token = $window.localStorage.getItem('token');

//HEADER VALUE
var hValue = document.head.querySelector("[name=_csrf]").content;

//HEADER NAME
var hName = document.head.querySelector("[name=_csrf_header]").content;
