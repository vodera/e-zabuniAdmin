'use strict';
/**
 * @ngdoc function
 * @name CMSLoginApp:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the CMSLoginApp
 */

//CONTROLLERS

loginAppp.controller('LoginCtrl', ['$scope', '$rootScope', 'DataService', '$filter', '$window', function ($scope, $rootScope, DataService, $filter, $window) {

    $rootScope.AppVersion = version;
    $scope.hName = hName;
    $scope.LoginButtonText = "Log In";
//        grecaptcha.reset();
    $scope.initCaptcha = function () {
        try {
            grecaptcha.render('g-recaptcha', {
                'sitekey': '6Lf5e1UUAAAAAA374n3L-2ZJM64d9qgIGaxvg5c9'
            });
        } catch (ex) {
            //captcha exception
        }
    };
    $scope.doLogin = function () {
        // $window.location = "#/otp";
        if (!$scope.LoginForm.$valid) {
            return;
        }
        $scope.showLoginErrorMsg = false;
        $rootScope.showLoading = true;
        var data = {};
        data.email = $scope.vm.username;
        data.password = $scope.vm.password;
        console.log ("data: "+ $scope.vm.username);
        // + "&g-recaptcha-response=" + grecaptcha.getResponse();
        $window.localStorage['username'] = $scope.vm.username;
        console.log("im here 1")
        DataService.login(data).then(function (response) {
            console.log("login response", response)
            // console.debug("Login response:", response.data.data);
            // $scope.loginSuccessMsg = response.message;
            $window.localStorage['token'] = response.data.token;
            // $scope.showLoginSuccessMsg = true;
            $window.localStorage['flag'] = "isAuthenticated";
            $window.localStorage['token'] = response.data.token;
//                var expires_in = (new Date().getTime() / 1000) + response.data.data.timeout;
//                $window.localStorage['expiryTime'] = (expires_in * 1000);
//                 $window.localStorage['expiryTime'] = response.data.data.timeout;
//                 $rootScope.showLoading = false;
//                 $window.location = "#/otp";
            $window.localStorage['loggedInUser'] = "true"
            $window.localStorage['permissions'] = [];
            $window.localStorage['userType'] = "Bank Admin";
            $window.location = '/';
            $window.localStorage['redirect'] = "dashboard";
            $window.localStorage['loggedIn'] = "true";

        }, function (error) {
            console.log("error......", error.data);
            if (error.data === null) {
                $scope.loginErrorMsg = 'Please check your internet connection';
            } else if (error.status === 400) {
                $scope.loginErrorMsg = error.data.message;
            } else if (error.status == 410) {
                $scope.loginErrorMsg = 'Sorry password expired please change your passoword before you proceed';
                $window.location = '#/changepassword';
            } else {
                $scope.loginErrorMsg = error.data.message;
            }
            grecaptcha.reset();
            $scope.showLoginErrorMsg = true;
            $rootScope.showLoading = false;
        });
    };
}])
    .controller('ChangePasswordCtrl', ['$scope', '$rootScope', 'DataService', '$window', function ($scope, $rootScope, DataService, $window) {
        $scope.username = $window.localStorage.getItem('username');
        console.log($scope.username);

        DataService.getPasswordPolicy().then(function (response) {
            console.log("Password Policy Resp:", response.data.data);
            $scope.PasswordPolicy = response.data.data;
            $window.scrollTo(0, 0);
        }, function (error) {
            console.log("error......", error.data);
            if (error.data === null) {
                $scope.ErrorMsg = 'Please check your internet connection';
            } else if (error.status === 400) {
                $scope.ErrorMsg = error.data.message;
            } else {
                $scope.ErrorMsg = error.data.message;
            }
            $scope.showErrorMsg = true;
        });


        $scope.changePassword = function () {
            if (!$scope.ChangePasswordForm.$valid) {
                return;
            }
            var formdata = new FormData();
            formdata.append("username", $window.localStorage.getItem('username'));
            formdata.append("currentPassword", $scope.vm.currentpassword);
            formdata.append("newPassword", $scope.vm.newpassword);

            $rootScope.showLoading = true;
            $scope.showErrorMsg = false;
            DataService.changePassword(formdata).then(function (response) {
                console.log("password change......", response.data.data);
                $rootScope.showLoading = false;
//                $window.localStorage['loggedInUser'] = angular.toJson(response.data.data.userDetails);
//                $window.localStorage['permissions'] = angular.toJson(response.data.data.permissions);

                window.location = 'login.html#/login';
                $window.reload();
            }, function (error) {
                console.log("error......", error.data);
                $rootScope.showLoading = false;
                if (error.data === null) {
                    $scope.ErrorMsg = 'Please check your internet connection';
                } else if (error.status === 400) {
                    $scope.ErrorMsg = error.data.message;
                } else {
                    $scope.ErrorMsg = error.data.message;
                }
                $scope.showErrorMsg = true;
            });
        };
        var newpassword = document.getElementById("newpassword")
            , confirmpassword = document.getElementById("confirmpassword");

        function validatePassword() {
            if (newpassword.value !== confirmpassword.value) {
                confirmpassword.setCustomValidity("Passwords Don't Match");
            } else {
                confirmpassword.setCustomValidity('');
            }
        }

        newpassword.onchange = validatePassword;
        confirmpassword.onkeyup = validatePassword;
    }])
    .controller('OTPCtrl', ['$scope', '$rootScope', 'DataService', '$window', function ($scope, $rootScope, DataService, $window) {
        $scope.fullName = $window.localStorage.getItem('fullName');
        $scope.sendOTP = function () {



            $window.localStorage['loggedInUser'] = "true"
            $window.localStorage['permissions'] = [];
            $window.localStorage['userType'] = "Bank Admin";
            $window.location = '/';
            $window.localStorage['redirect'] = "dashboard";
            $window.localStorage['loggedIn'] = "true";


//                     if (!$scope.OTPForm.$valid) {
//                         return;
//                     }
//
//                     $rootScope.showLoading = true;
//                     DataService.sendOTP($scope.vm.otp).then(function (response) {
//                         console.log("OTP......", response.data.data);
//                         $rootScope.showLoading = false;
//                         $window.localStorage['loggedInUser'] = angular.toJson(response.data.data.userDetails);
//                         $window.localStorage['permissions'] = angular.toJson(response.data.data.permissions);
//                         $window.localStorage['userType'] = angular.toJson(response.data.data.userDetails.userType);
//                         $scope.userType = response.data.data.userDetails.userType.userType;
//                         console.log($scope.userType);
//                         if ($scope.userType === "Bank Operator") {
//                             $window.location = 'index.html';
//                             $window.localStorage['redirect'] = "dashboard";
//                         } else if ($scope.userType === "Bank Admin") {
//                             $window.location = 'index.html#/AdminDashboard';
// //                            $window.location = 'index2.html';
//                             $window.localStorage['redirect'] = "AdminDashboard"
//                         } else {
// //                $rootScope.notify('error', 'Error', 'You are not allowed to access this portal. Please contact your administrator.!');
// //                $scope.showLoginErrorMsg = true;
//
//                             DataService.logout().then(function (response) {
//                                 $window.localStorage.clear();
//                                 $window.location = 'login.html';
//                             }, function (error) {
//                                 $window.localStorage.clear();
//                                 $window.location = 'login.html';
//                             });
//
//                         }
//
//                     }, function (error) {
//                         console.log("Login error......", error.data);
//                         $rootScope.showLoading = false;
//                         if (error.data === null) {
//                             $scope.loginErrorMsg = 'Please check your internet connection';
//                         } else {
//                             $scope.loginErrorMsg = error.data.message;
//                         }
//                         $scope.showLoginErrorMsg = true;
//                     });
        };

        // $scope.resendOTP = function () {
        //     $rootScope.showLoading = true;
        //     DataService.resendOTP().then(function (response) {
        //         $rootScope.showLoading = false;
        //         $scope.loginSuccessMsg = "Resend OTP successfully";
        //         $scope.showLoginSuccessMsg = true;
        //
        //     }, function (error, res) {
        //         $rootScope.showLoading = false;
        //         if (error.status === 401) {
        //             $scope.loginErrorMsg = error.data.message;
        //             $window.location = 'login.html#/login'
        //         } else if (error.data === null) {
        //             $scope.loginErrorMsg = 'Please check your internet connection';
        //         } else {
        //             $scope.loginErrorMsg = error.data.message;
        //         }
        //         $scope.showLoginErrorMsg = true;
        //     });
        // };
    }])
    .controller('ForgotPasswordCtrl', ['$scope', '$rootScope', 'DataService', '$window', function ($scope, $rootScope, DataService, $window) {
        $rootScope.AppVersion = version;
        $scope.showLoginErrorMsg = false;

        $scope.resetPassword = function () {
            if (!$scope.ForgotPasswordForm.$valid) {
                return;
            }
            $rootScope.showLoading = true;

            var formdata = new FormData();
            formdata.append("email", $scope.vm.email);

            DataService.forgotPassword(formdata).then(function (response) {
                console.log("forgot password response......", response.data.data);
                $rootScope.showLoading = false;
                $window.location = 'login.html#/login';
            }, function (error) {
                console.log("change password error......", error.data);
                $rootScope.showLoading = false;
                if (error.data === null) {
                    $scope.loginErrorMsg = 'Please check your internet connection';
                } else {
                    $scope.loginErrorMsg = error.data.message;
                }
                $scope.showLoginErrorMsg = true;
            });
        };
    }])
