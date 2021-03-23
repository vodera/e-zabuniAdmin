'use strict';
/**
 * @ngdoc overview
 * @name CMSAdminApp
 * @description
 * # CMSAdminApp
 *
 * Main module of the application.
 */

var app = angular.module('CMSAdminApp', ['ui.bootstrap', 'ngAnimate', 'ngStorage', 'ngRoute', 'ngIdle', 'rw.moneymask', 'toaster', 'ui.bootstrap.datetimepicker', 'AxelSoft']);
app.config(function ($routeProvider, $locationProvider, IdleProvider, KeepaliveProvider) {

//    IdleProvider.idle(idleTimeout);
    IdleProvider.idle(localStorage.expiryTime);
    IdleProvider.timeout(15);
    KeepaliveProvider.interval(10);
    $locationProvider.html5Mode(false);
    $locationProvider.hashPrefix('');
    $routeProvider.when('/dashboard', {
        url: '/dashboard',
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl',
        isAuthenticated: false,
        permission: ''
    })
            .when('/AdminDashboard', {
                url: '/AdminDashboard',
                templateUrl: 'templates/admin-dashboard.html',
//            controller: 'AdminDashboardCtrl',
                isAuthenticated: false,
                permission: ''
            })
            .when('/CustomerOnboarding', {
                url: "/CustomerOnboarding",
                templateUrl: 'templates/create-customer.html',
                controller: 'CustomerCtrl',
                isAuthenticated: true,
                permission: 'ONBOARD_PRINCIPAL_CUSTOMER'
            })
            .when('/CreateProposal', {
                url: "/CreateProposal",
                templateUrl: 'templates/create-proposal.html',
                controller: 'CreateProposalCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/ProcessProposal', {
                url: "/ProcessProposal",
                templateUrl: 'templates/process-proposal.html',
                controller: 'ProcessProposalCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/ProposalList', {
                url: "/ProposalList",
                templateUrl: 'templates/proposal-list.html',
                controller: 'ProposalListCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/CreateAuction', {
                url: "/CreateAuction",
                templateUrl: 'templates/create-eauction.html',
                controller: 'CreateAuctionCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/PublishedAuction', {
                url: "/PublishedAuction",
                templateUrl: 'templates/published-eauction.html',
                controller: 'PublishedAuctionCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/OngoingAuction', {
                url: "/OngoingAuction",
                templateUrl: 'templates/ongoing-eauction.html',
                controller: 'OngoingAuctionCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/CompletedAuction', {
                url: "/CompletedAuction",
                templateUrl: 'templates/completed-eauction.html',
                controller: 'CompletedAuctionCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/TenderList', {
                url: "/TenderList",
                templateUrl: 'templates/tender-list.html',
                controller: 'TenderListCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/ProcessTender', {
                url: "/ProcessTender",
                templateUrl: 'templates/process-tender.html',
                controller: 'ProcessTenderCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/ViewTenderRequest', {
                url: "/ViewTenderRequest",
                templateUrl: 'templates/view-tender-request.html',
                controller: 'ViewTenderRequestCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/OngoingTender', {
                url: "/OngoingTender",
                templateUrl: 'templates/ongoing-tenders.html',
                controller: 'OngoingTenderCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/SubmittedTender', {
                url: "/SubmittedTender",
                templateUrl: 'templates/ongoingtender-view.html',
                controller: 'SubmittedTenderCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/CreateTender', {
                url: "/CreateTender",
                templateUrl: 'templates/create-tender.html',
                controller: 'CreateTenderCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/CompletedTender', {
                url: "/CompletedTender",
                templateUrl: 'templates/completed-tender.html',
                controller: 'CompletedTenderCtrl',
                isAuthenticated: true,
                permission: ''
            })
            .when('/ApproveCustomers', {
                url: "/ApproveCustomers",
                templateUrl: 'templates/approve-customer.html',
                controller: 'ApproveCustomerCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_CUSTOMERS'
            })
            .when('/Customers', {
                url: "/Customers",
                templateUrl: 'templates/customer-list.html',
                controller: 'ListCustomerCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CUSTOMERS'
            })
            .when('/CustomerOutlet', {
                url: "/CustomerOutlet",
                templateUrl: 'templates/outlet-view.html',
                controller: 'CustomerOuletCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CUSTOMERS'
            })
            .when('/CITAgentOnboarding', {
                url: "/CITAgentOnboarding",
                templateUrl: 'templates/create-cit-agent.html',
                controller: 'CITAgentCtrl',
                isAuthenticated: true,
                permission: 'ADD_CIT_AGENT'
            })
            .when('/ApproveCITAgents', {
                url: "/ApproveCITAgents",
                templateUrl: 'templates/approve-cit-agent.html',
                controller: 'ApproveCITAgentCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_CIT_AGENTS'
            })
            .when('/CITAgents', {
                url: "/CITAgents",
                templateUrl: 'templates/cit-agent-list.html',
                controller: 'ListCITAgentCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CIT_AGENTS'
            })
            .when('/CITCrew', {
                url: "/CITCrew",
                templateUrl: 'templates/cit-crew-list.html',
                controller: 'ListCITCrewCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CIT_AGENT_CREW'
            })
            .when('/ConfirmCITCrew', {
                url: "/ConfirmCITCrew",
                templateUrl: 'templates/confirm-cit-crew.html',
                controller: 'ConfirmCITCrewCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_CIT_AGENT_CREW'
            })
            .when('/ApproveCITCrew', {
                url: "/ApproveCITCrew",
                templateUrl: 'templates/approve-cit-crew.html',
                controller: 'ApproveCITCrewCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_CIT_AGENT_CREW'
            })
            .when('/CITVehicles', {
                url: "/CITVehicles",
                templateUrl: 'templates/cit-vehicle-list.html',
                controller: 'ListCITVehicleCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CIT_AGENT_VEHICLES'
            })
            .when('/ConfirmCITVehicles', {
                url: "/ConfirmCITVehicles",
                templateUrl: 'templates/confirm-cit-vehicle.html',
                controller: 'ConfirmCITVehicleCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_CIT_AGENT_VEHICLES'
            })
            .when('/ApproveCITVehicles', {
                url: "/ApproveCITCrew",
                templateUrl: 'templates/approve-cit-vehicle.html',
                controller: 'ApproveCITVehicleCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_CIT_AGENT_VEHICLES'
            })
            .when('/BatchFiles', {
                url: "/BatchFiles",
                templateUrl: 'templates/batch-file-upload.html',
                controller: 'BatchFileUploadCtrl',
                isAuthenticated: true,
                permission: 'VIEW_BATCH_UPLOAD'
            })
            .when('/CashCollection', {
                url: "/CashCollection",
                templateUrl: 'templates/initiate-cash-collection.html',
                controller: 'CashCollectionCtrl',
                isAuthenticated: true,
                permission: 'INTIATE_CASH_COLLECTION'
            })
            .when('/EnterOfflineRequest', {
                url: "/EnterOfflineRequest",
                templateUrl: 'templates/enter-offline-request.html',
                controller: 'OfflineRequestCtrl',
                isAuthenticated: false,
                permission: ''
            })
            .when('/ForwardRequests', {
                url: "/ForwardRequests",
                templateUrl: 'templates/collection-request-list.html',
                controller: 'ListCollectionRequestCtrl',
                isAuthenticated: true,
                permission: 'FORWARD_CASH_COLLECTION_REQUEST'
            })
            .when('/ScheduleCrew', {
                url: "/ScheduleCrew",
                templateUrl: 'templates/collection-request-list.html',
                controller: 'ListCollectionRequestCtrl',
                isAuthenticated: true,
                permission: 'SCHEDULE_CREW'
            })
            .when('/ConfirmCrewSchedule', {
                url: "/ConfirmCrewSchedule",
                templateUrl: 'templates/collection-request-list.html',
                controller: 'ListCollectionRequestCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_SCHEDULED_CREW'
            })
            .when('/InputTally', {
                url: "/InputTally",
                templateUrl: 'templates/collection-request-list.html',
                controller: 'ListCollectionRequestCtrl',
                isAuthenticated: true,
                permission: 'ADD_TRANSACTION_DENOMINATIONS'
            })
            .when('/MyRequests', {
                url: "/MyRequests",
                templateUrl: 'templates/collection-request-list.html',
                controller: 'ListCollectionRequestCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/CashCollectionRequests', {
                url: "/CashCollectionRequests",
                templateUrl: 'templates/collection-request-list.html',
                controller: 'ListCollectionRequestCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/PendingRequests', {
                url: "/PendingRequests",
                templateUrl: 'templates/collection-requests-report.html',
                controller: 'RequestReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/CompletedRequest', {
                url: "/CompletedRequest",
                templateUrl: 'templates/collection-requests-report.html',
                controller: 'RequestReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/CancelledRequests', {
                url: "/CancelledRequests",
                templateUrl: 'templates/collection-requests-report.html',
                controller: 'RequestReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/OfflineRequests', {
                url: "/OfflineRequests",
                templateUrl: 'templates/collection-requests-report.html',
                controller: 'RequestReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/AmendedRequests', {
                url: "/AmendedRequests",
                templateUrl: 'templates/collection-requests-report.html',
                controller: 'RequestReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/DetailedCollectionRequests', {
                url: "/DetailedCollectionRequests",
                templateUrl: 'templates/collection-requests-report.html',
                controller: 'RequestReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/PendingTransactions', {
                url: "/PendingTransactions",
                templateUrl: 'templates/transaction-report.html',
                controller: 'TransactionReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/SuccesfulRequest', {
                url: "/SuccesfulRequest",
                templateUrl: 'templates/transaction-report.html',
                controller: 'TransactionReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/CancelledTransactions', {
                url: "/CancelledTransactions",
                templateUrl: 'templates/transaction-report.html',
                controller: 'TransactionReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/DetailedTransactions', {
                url: "/DetailedTransactions",
                templateUrl: 'templates/transaction-report.html',
                controller: 'TransactionReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/MessageTransactions', {
                url: "/MessageTransactions",
                templateUrl: 'templates/message-report.html',
                controller: 'MessageReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/CustomerPerformanceReport', {
                url: "/CustomerPerformanceReport",
                templateUrl: 'templates/customer-performance.html',
                controller: 'SummaryReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CASH_COLLECTION'
            })
            .when('/CITAgentPerformanceReport', {
                url: "/CITAgentPerformanceReport",
                templateUrl: 'templates/cit-agent-performance.html',
                controller: 'SummaryReportCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CIT_AGENT_PERFORMANCE_REPORT'
            })
            .when('/SystemUser', {
                url: "/SystemUser",
                templateUrl: 'templates/create-user.html',
                controller: 'SystemUserCtrl',
                isAuthenticated: true,
                permission: 'CREATE_USER'
            })
            .when('/ApproveUsers', {
                url: "/ApproveUsers",
                templateUrl: 'templates/approve-user.html',
                controller: 'ApproveSystemUserCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_USERS'
            })
            .when('/SystemUsers', {
                url: "/SystemUsers",
                templateUrl: 'templates/user-list.html',
                controller: 'ListSystemUserCtrl',
                isAuthenticated: true,
                permission: 'VIEW_USERS'
            })
            .when('/UserRoles', {
                url: "/UserRoles",
                templateUrl: 'templates/user-role-list.html',
                controller: 'UserRoleCtrl',
                isAuthenticated: true,
                permission: 'VIEW_USER_ROLES'
            })
            .when('/AuditTrail', {
                url: "/AuditTrail",
                templateUrl: 'templates/audit-trail.html',
                controller: 'AuditTrailCtrl',
                isAuthenticated: true,
                permission: 'VIEW_ALL_AUDIT_LOGS'
            })
            .when('/CustomerCategories', {
                url: "/CustomerCategories",
                templateUrl: 'templates/customer-category.html',
                controller: 'CustomerCategoryCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CUSTOMER_CATEGORIES'
            })
            .when('/ApproveCustomerCategories', {
                url: "/ApproveCustomerCategories",
                templateUrl: 'templates/approve-customer-categories.html',
                controller: 'ApproveCustomerCategoryCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_CUSTOMER_CATEGORY'
            })
            .when('/Regions', {
                url: "/Regions",
                templateUrl: 'templates/region.html',
                controller: 'RegionCtrl',
                isAuthenticated: true,
                permission: 'VIEW_REGIONS'
            })
            .when('/Departments', {
                url: "/Departments",
                templateUrl: 'templates/department.html',
                controller: 'DepartmentCtrl',
                isAuthenticated: true,
                permission: 'VIEW_DEPARTMENTS'
            })
            .when('/ApproveDepartments', {
                url: "/ApproveDepartments",
                templateUrl: 'templates/approve-departments.html',
                controller: 'ApproveDepartmentsCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_DEPARTMENTS'
            })
            .when('/Currencies', {
                url: "/Currencies",
                templateUrl: 'templates/currency.html',
                controller: 'CurrencyCtrl',
                isAuthenticated: true,
                permission: 'VIEW_CURRENCY'
            })
            .when('/ApproveCurrencies', {
                url: "/ApproveCurrencies",
                templateUrl: 'templates/approve-currencies.html',
                controller: 'ApproveCurrenciesCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_CURRENCY'
            })
            .when('/MTemplate', {
                url: "/MTemplate",
                templateUrl: 'templates/template.html',
                controller: 'MTemplateCtrl',
                isAuthenticated: true,
                permission: 'VIEW_MESSAGE_TEMPLATES'
            })
            .when('/ApproveTemplate', {
                url: "/ApproveTemplate",
                templateUrl: 'templates/approve-templates.html',
                controller: 'ATemplateCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_MESSAGE_TEMPLATES'
            })

            .when('/MyProfile', {
                url: "/MyProfile",
                templateUrl: 'templates/user-profile.html',
                controller: 'UserProfileCtrl',
                isAuthenticated: false
            })
            .when('/PasswordChange', {
                url: "/PasswordChange",
                templateUrl: 'templates/password-change.html',
                controller: 'UserProfileCtrl',
                isAuthenticated: false
            })
            .when('/PasswordPolicy', {
                url: "/PasswordPolicy",
                templateUrl: 'templates/password-policy.html',
                controller: 'PasswordPolicyCtrl',
                isAuthenticated: true,
                permission: 'VIEW_PASSWORD_POLICY'
            })
            .when('/SystemIntegration', {
                url: "/SystemIntegration",
                templateUrl: 'templates/system-config.html',
                controller: 'SystemConfigCtrl',
                isAuthenticated: true,
                permission: 'VIEW_SYSTEM_INTEGRATION'
            })
            .when('/SystemConfig', {
                url: "/SystemConfig",
                templateUrl: 'templates/system-config.html',
                controller: 'SystemConfigCtrl',
                isAuthenticated: true,
                permission: 'MANAGE_CONFIGURATION'
            })
            .when('/OTPConfiguration', {
                url: "/OTPConfiguration",
                templateUrl: 'templates/otp-config.html',
                controller: 'OTPConfigurationCtrl',
                isAuthenticated: true,
                permission: 'UPDATE_GLOBAL_INTEGRATION'
            })
            .when('/ApproveOTPConfig', {
                url: "/ApproveOTPConfig",
                templateUrl: 'templates/approve-otpconfig.html',
                controller: 'ApproveOTPConfigCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_CONFIGURATIONS'
            })
            .when('/ApproveConfigurations', {
                url: "/ApproveConfigurations",
                templateUrl: 'templates/approve-configurations.html',
                controller: 'ApproveConfigurationsCtrl',
                isAuthenticated: true,
                permission: 'APPROVE_CONFIGURATIONS'
            })
            .when('/Error', {
                url: "/Error",
                templateUrl: 'templates/page-403-error.html',
                controller: '',
                isAuthenticated: false
            }).otherwise({redirectTo: "/dashboard"});
})
    .run(function ($rootScope, $localStorage, $window, Idle) {
            // console.log($window.localStorage.getItem('token'));
//             console.log('Starting application');
//             $localStorage.loggedInUser = angular.fromJson($window.localStorage.getItem('loggedInUser'));
//             console.log("loggedInUser", $localStorage.loggedInUser);
//             $localStorage.usertype = $window.localStorage.getItem('userType');
//             console.log("type of user: ", $localStorage.usertype);
//             if ($localStorage.usertype === 'Bank Admin') {
//                 var redirect = "AdminDashboard"
// //        $rootScope.redirect = AdminDashboard;
//             } else if ($localStorage.usertype === "Bank Operator") {
//
//                 var redirect = "dashboard";
//             }
//             $localStorage.permissions = angular.fromJson($window.localStorage.getItem('permissions'));
            //console.log("permissions",angular.toJson($localStorage.permissions));
            $rootScope.$broadcast('permissionsChanged');
            //$window.localStorage['access_token'] = 'f37e89ca-95c7-4356-b12c-2f57923a828e';
            $localStorage.accessToken = $window.localStorage.getItem('access_token');
            $localStorage.expiryTime = $window.localStorage.getItem('expiryTime');
            $localStorage.pageSize = $localStorage.pageSize !== undefined ? $localStorage.pageSize : 20;
            $localStorage.pageNumber = $localStorage.pageNumber !== undefined ? $localStorage.pageNumber : 0;
//    }

            // $rootScope.$on("$routeChangeStart", function (event, next, current) {
            //     Idle.watch();
            // });

            // AUTHENTICATOR
            if ($window.localStorage['loggedIn'] === "true") {
                $window.localStorage['redirect'] = "dashboard";
            } else if ($window.localStorage['loggedIn'] === "false") {
                $window.location = "login.html";
            }
        })





