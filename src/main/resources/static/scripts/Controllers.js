//CONTROLLERS
app.controller('MainCtrl', ['$rootScope', '$scope', '$localStorage', '$window', '$uibModal', '$route', 'toaster', 'DataService', function ($rootScope, $scope, $localStorage, $window, $uibModal, $route, toaster, DataService) {
    $scope.started = false;
    $rootScope.AppVersion = version;
    $rootScope.userDetails = $localStorage.loggedInUser;
    /*PAGE SIZE SETTINGS*/
    $rootScope.PageSizes = [20, 50, 100, 200, 500];
    $rootScope.selectedSize = $localStorage.pageSize;
    $rootScope.setPageSize = function (pageSize) {
        $localStorage.pageSize = pageSize;
        $route.reload();
    };
    $rootScope.setPage = function (pageNumber) {
        $localStorage.pageNumber = pageNumber;
        $route.reload();
    };
    $rootScope.setPaginationParams = function (data) {
        //Scroll top of page
        $window.scrollTo(0, 0);
        $rootScope.currentPage = data.number;
        $rootScope.first = data.first;
        $rootScope.last = data.last;
        $rootScope.totalElements = data.totalElements;
        $rootScope.maxSize = 5; //Number of pager buttons to show
        $rootScope.totalPages = [];
        for (var i = 0; i < data.totalPages; i++) {
            $rootScope.totalPages.push(i);
        }

        $rootScope.showingStart = $rootScope.totalElements === 0 ? 0 : (data.number * data.size) + 1;
        $rootScope.showingEnd = $rootScope.last ? $rootScope.totalElements : $rootScope.showingStart + data.size - 1;
        //Check no data
        if ($rootScope.totalElements > 0) {
            if (data.numberOfElements === 0) {
                $rootScope.setPage(0);
            }
        }
    };
    function closeModals() {
        if ($scope.warning) {
            $scope.warning.close();
            $scope.warning = null;
        }
        if ($scope.timedout) {
            $scope.timedout.close();
            $scope.timedout = null;
        }
    }

    $scope.$on('IdleStart', function () {
        closeModals();
        $scope.warning = $uibModal.open({
            templateUrl: 'warning-dialog.html'
        });
    });
    $scope.$on('IdleEnd', function () {
        closeModals();
    });
    $scope.$on('IdleTimeout', function () {
        closeModals();
        $scope.timedout = $uibModal.open({
            templateUrl: 'timedout-dialog.html',
            controller: 'MainCtrl',
            animation: true,
            backdrop: 'static',
            keyboard: false // ESC key close enable/disable
        });
    });
    $rootScope.expiredToken = function () {
        $scope.expToken = $uibModal.open({
            templateUrl: 'token-expired-dialog.html',
            controller: 'MainCtrl',
            animation: true,
            backdrop: 'static',
            keyboard: false // ESC key close enable/disable
        });
    };
    $rootScope.showProgress = function () {
        return $scope.progressBar = $uibModal.open({
            templateUrl: 'processing-dialog.html',
            controller: 'MainCtrl',
            animation: true,
            windowClass: 'center-modal',
            backdrop: 'static',
            keyboard: false // ESC key close enable/disable
        });
    };
    $rootScope.alertDialog = function (alertMessage) {
        $rootScope.alertMessage = alertMessage;
        $rootScope.alertDlg = $uibModal.open({
            templateUrl: 'alert-dialog.html',
            controller: 'MainCtrl',
            animation: true,
            backdrop: 'static',
            keyboard: false // ESC key close enable/disable
        });
    };
    $scope.closeAlertDialog = function () {
        $rootScope.alertDlg.close();
    };
    $rootScope.notify = function (type, title, message) {
        toaster.pop({
            type: type,
            title: title,
            body: message,
            showCloseButton: true,
            closeHtml: '<button>Close</button>'
        });
    };
    //Remember to check permissions
    // $scope.$on('$routeChangeStart', function (angularEvent, newUrl) {
    //     if ($localStorage.hasOwnProperty('loggedInUser')) {
    //         if (newUrl.isAuthenticated) {
    //             if (!$localStorage.permissions.some(item => {
    //                 if (typeof item !== 'string') {
    //                     return false;
    //                 }
    //                 return item.trim() === newUrl.permission;
    //             }))
    //             {
    //                 $rootScope.notify('error', 'Error', 'You are not authorized to access that page!');
    //                 $window.location = '#/Error';
    //             }
    //         }
    //     } else {
    //         // User isn’t authenticated
    //         $window.location = 'login.html';
    //     }
    // });
    /* START DATE PICKER FUNCTIONS */
    $scope.today = function () {
        $scope.dt = new Date();
    };
    $scope.today();
    $scope.clear = function () {
        $scope.dt = null;
    };
    $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2050, 5, 22),
        minDate: new Date(2017, 1, 1),
        startingDay: 1
    };
    // Disable weekend selection
    function disabled(data) {
        var date = data.date, mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.setDate = function (year, month, day) {
        $scope.dt = new Date(year, month, day);
    };
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events = [
        {
            date: tomorrow,
            status: 'full'
        },
        {
            date: afterTomorrow,
            status: 'partially'
        }
    ];
    /* END DATE PICKER FUNCTIONS */

    $scope.doLogout = function () {
        // DataService.logout().then(function (response) {
        $window.localStorage.clear();
        $window.localStorage['loggedIn'] = "false";
        $window.location = 'login.html';
        $window.reload();
        // }, function (error) {
        //     $window.localStorage.clear();
        //     $window.location = 'login.html';
        //     $window.reload();
        // });
    };
    $rootScope.exportReport = function (data, format, reportName) {
        var uri, link;
        var now = new Date();
        var filename = reportName + (now.getFullYear() + "" + now.getMonth() + "" + now.getDate() + "" + now.getHours() + "" + now.getMinutes() + "" + now.getSeconds());
        var format = format.toUpperCase();
        if (format.endsWith(".PDF")) {
            uri = 'data:application/pdf;base64,' + data;
            filename = filename + ".pdf";
        } else if (format.endsWith(".XLS")) {
            uri = "data:application/vnd.ms-excel;base64;, " + data;
            filename = filename + ".xls";
        } else if (format.endsWith(".XLSX")) {
            uri = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;, " + data;
            filename = filename + ".xlsx";
        } else if (format.endsWith(".CSV")) {
            uri = 'data:text/csv;charset=utf-8,' + data;
            filename = filename + ".csv";
        }

        var encodedData = encodeURI(uri);
        console.log("encodedData:", encodedData);
        link = document.createElement('a');
        link.setAttribute('href', encodedData);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        //remove the link when done
        document.body.removeChild(link);
    }

}])


    .controller('ProposalListCtrl', ['$rootScope', '$scope', 'DataService', '$localStorage', '$window', '$filter',
        function ($rootScope, $scope, DataService, $localStorage, $window, $filter) {

        $scope.Departments = JSON.parse((localStorage.getItem("departments")))
            console.log("Departments---", $scope.Departments)

            $scope.listUsers = function () {
                $scope.progressBar = $rootScope.showProgress();
                DataService.getProposals().then(function (response) {
                    console.log("Proposals Data:", response);
                    $scope.Proposals = response.data;
                    // $rootScope.setPaginationParams(response.data.data);
                    $scope.progressBar.close();
                    //Scroll top of page
                    // $window.scrollTo(0, 0);
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            };

            $scope.listUsers();


            $scope.chatBox = function (){
                $scope.chat = true;
            }
            $scope.processProposal = function (Proposal){
                $scope.Proposal = Proposal;
                $window.location='#/ProcessProposal'
            }


            $scope.Notifications =
                [
                    {notification: "NO", companyName: "Turubini Limited"},
                    {notification: "NO", companyName: "QWERTY Solutions"},
                    {notification: "YES", companyName: "ATRIA Group Limited"},
                    {notification: "NO", companyName: "Microsoft Solutions"}]

            $scope.ViewTender = function (Tender, editMode){
                $scope.ShowTenderView = true;
            };


            $scope.ShowUserView = false;
            $scope.SystemUserForm = false;
            $scope.CurrentTab = 1;
            $scope.resetUsersFilter = function () {
                $scope.UserFilter = {};
                var startDate = new Date();
                startDate.setDate(1);
                $scope.UserFilter.dateFrom = startDate;
                $scope.UserFilter.dateTo = new Date();
                $scope.listUsers();
            };

            $scope.Tenders =
                [{  TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER",
                    TenderType: "Open Tender",
                    EntityName:"National Irrigation Board",
                    ApplicationFee: "0",
                    PublishDate: "25th-July-2020",
                    CloseDate: "25th-Aug-2020",
                    ReferenceNo:"NIB/T/006/2018-2017",
                    Status: "Published",
                    EntityType:"State Corporation",
                    TenderCategory:"Works",
                    OpeningVenue:"Nile Basin Board Room,NIB,Lenana Road Hurlingham",
                    OpeningDate:"25th-Sep-2020",
                    OpeningTime:"12:00:00",
                    OtherDetails:"TENDER  FOR REHABILITATION WORKS OF MBWALENI WATER PAN  PROJECT IN  KWALE COUNTY",
                    stage: "opening",
                    brief: "Tender Request for rehabilitation works of Mbwaleni Water Pan project in Kwale county, national irrigations board, Nairobi Kenya"

                },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Closed Tender", EntityName:"National Irrigation Board", ApplicationFee: "2000", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Closed", stage:"evaluation", brief: "Tender Request for rehabilitation works of Mbwaleni Water Pan project in Kwale county, national irrigations board, Nairobi Kenya" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Restricted Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published", stage:"awarded", brief: "Tender Request for rehabilitation works of Mbwaleni Water Pan project in Kwale county, national irrigations board, Nairobi Kenya" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Closed", stage:"contract", brief: "Tender Request for rehabilitation works of Mbwaleni Water Pan project in Kwale county, national irrigations board, Nairobi Kenya" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published", stage:"lpo", brief: "Tender Request for rehabilitation works of Mbwaleni Water Pan project in Kwale county, national irrigations board, Nairobi Kenya" }
                ];

            $scope.Notifications =
                [
                    {notification: "NO", companyName: "Turubini Limited"},
                    {notification: "NO", companyName: "QWERTY Solutions"},
                    {notification: "YES", companyName: "ATRIA Group Limited"},
                    {notification: "NO", companyName: "Microsoft Solutions"}]

            $scope.viewTenderRequest = function (Proposal){
                $scope.tenderRequest = Proposal;
                $scope.ShowTenderRequest = true;
            };

            $scope.cancelShowTenderRequest = function (){
                $scope.ShowTenderRequest = false;
            };
        }])

    .controller('CreateProposalCtrl', ['$rootScope', '$scope', 'DataService', '$localStorage', '$window', '$filter',
        function ($rootScope, $scope, DataService, $localStorage, $window, $filter) {
            $scope.tenderRequest={};

            $scope.loadDepartments = function () {
                $scope.progressBar = $rootScope.showProgress();
                DataService.getDepartments(true).then(function (response) {
                    console.log("Departments Data:", response.data);
                    $scope.Departments = response.data;
                    localStorage.setItem("departments", JSON.stringify($scope.Departments));
                    $scope.progressBar.close();
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            };

            $scope.departmentChange = function(departmentId){
                console.log("selected department", departmentId)
                $scope.departmentId = departmentId;
            };

            $scope.saveProposal = function () {
                if (!$scope.TenderRequest.$valid) {
                    return;
                }
                $scope.tenderRequest.departmentId = $scope.departmentId;
                console.log("departmentId", $scope.tenderRequest.departmentId)
                $scope.tenderRequest.tenderRequestDocument = "initial document";
                $scope.tenderRequest.processingStage = "Head of department";
                $scope.tenderRequest.approvalStatus = "Processing";
                $scope.progressBar = $rootScope.showProgress();
                console.log($scope.tenderRequest);
                DataService.saveTenderRequest($scope.tenderRequest).then(function (response) {
                    console.log("Tender request creation resp:", response);
                    $scope.progressBar.close();
                    $rootScope.notify('success', 'Success', "Tender request successfully created.");
                    $window.location = '#/ProposalList';
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        var errors = "";
                        if (error.data.data) {
                            errors = " [";
                            angular.forEach(error.data.data, function (value, key) {
                                errors = errors + value + ",";
                            });
                            errors = errors + "]";
                        }
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
                    }
                });
            };
            $scope.loadDepartments();

        }])

    .controller('SubmittedTenderCtrl', ['$rootScope', '$scope', 'DataService', '$localStorage', '$window', '$filter',
        function ($rootScope, $scope, DataService, $localStorage, $window, $filter) {


            $scope.SubmittedTenders = [
                {ApplicantReferenceNumber:"APPLICANT/T/2017/101", ReferenceNo:"NIB/T/006/2018-2017"},
                {ApplicantReferenceNumber:"APPLICANT/T/2017/102", ReferenceNo:"NIB/T/006/2018-2017"},
                {ApplicantReferenceNumber:"APPLICANT/T/2017/103", ReferenceNo:"NIB/T/006/2018-2017"},
                {ApplicantReferenceNumber:"APPLICANT/T/2017/104", ReferenceNo:"NIB/T/006/2018-2017"},
            ];


        }])

    .controller('OngoingTenderCtrl', ['$rootScope', '$scope', 'DataService', '$localStorage', '$window', '$filter',
        function ($rootScope, $scope, DataService, $localStorage, $window, $filter) {


            $scope.SubmittedTenders = [
                {ApplicantReferenceNumber:"APPLICANT/T/2017/101", ReferenceNo:"NIB/T/006/2018-2017"},
                {ApplicantReferenceNumber:"APPLICANT/T/2017/102", ReferenceNo:"NIB/T/006/2018-2017"},
                {ApplicantReferenceNumber:"APPLICANT/T/2017/103", ReferenceNo:"NIB/T/006/2018-2017"},
                {ApplicantReferenceNumber:"APPLICANT/T/2017/104", ReferenceNo:"NIB/T/006/2018-2017"},
            ]

            $scope.Tenders =
                [{  TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER PAN",
                    TenderType: "Open Tender",
                    EntityName:"National Irrigation Board",
                    ApplicationFee: "0",
                    PublishDate: "25th-July-2020",
                    CloseDate: "25th-Aug-2020",
                    ReferenceNo:"NIB/T/006/2018-2017",
                    Status: "Closed",
                    EntityType:"State Corporation",
                    TenderCategory:"Works",
                    OpeningVenue:"Nile Basin Board Room,NIB,Lenana Road Hurlingham",
                    OpeningDate:"25th-Sep-2020",
                    OpeningTime:"12:00:00",
                    OtherDetails:"TENDER  FOR REHABILITATION WORKS OF MBWALENI WATER PAN  PROJECT IN  KWALE COUNTY"
                },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER PAN", TenderType: "Closed Tender", EntityName:"National Irrigation Board", ApplicationFee: "2000", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER PAN", TenderType: "Restricted Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER PAN", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER PAN", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Closed" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER PAN", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER PAN", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER PAN", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER PAN", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Closed" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER PAN", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                ];

            $scope.ViewTender = function(Tender){
                $scope.Tender = Tender;
                $scope.ShowTenderView=true;
                console.log ("Published Tender")
            }
            $scope.EditTender = function(Tender, editMode){
                Tender.editMode = editMode;
                $scope.Tender = Tender;
                $scope.ShowTenderView=true;
            }
            $scope.OpenTender = function(){
                console.log("button clicked")
                // $scope.ShowOngoingTenderView = true;
                // console.log("button clicked 2");

                $window.location = '#/ProcessTender';
            }
            $scope.add = function(){
                $scope.TenderEdit = true;
            }

        }])

    .controller('ProcessProposalCtrl', ['$rootScope', '$scope', 'DataService', '$localStorage', '$window', '$filter', function ($rootScope, $scope, DataService, $localStorage, $window, $filter) {


        $scope.Tenders =
            [{  TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER PAN",
                TenderType: "Open Tender",
                EntityName:"National Irrigation Board",
                ApplicationFee: "0",
                PublishDate: "25th-July-2020",
                CloseDate: "25th-Aug-2020",
                ReferenceNo:"NIB/T/006/2018-2017",
                Status: "Published",
                EntityType:"State Corporation",
                TenderCategory:"Works",
                OpeningVenue:"Nile Basin Board Room,NIB,Lenana Road Hurlingham",
                OpeningDate:"25th-Sep-2020",
                OpeningTime:"12:00:00",
                OtherDetails:"TENDER  FOR REHABILITATION WORKS OF MBWALENI WATER PAN  PROJECT IN  KWALE COUNTY",
                stage: "opening",
                brief: "Tender Request for rehabilitation works of Mbwaleni Water Pan project in Kwale county, national irrigations board, Nairobi Kenya"

            }];


        $scope.decline = function (){
            $rootScope.notify('warning', 'Declined', 'Tender request has been declined by Head of Department. E-mail notification has been sent to chain managers');
        }



        $scope.SubmittedTenders = [
            {ApplicantReferenceNumber: "APPLICANT/T/2017/101", ReferenceNo: "NIB/T/006/2018-2017"},
            {ApplicantReferenceNumber: "APPLICANT/T/2017/102", ReferenceNo: "NIB/T/006/2018-2017"},
            {ApplicantReferenceNumber: "APPLICANT/T/2017/103", ReferenceNo: "NIB/T/006/2018-2017"},
            {ApplicantReferenceNumber: "APPLICANT/T/2017/104", ReferenceNo: "NIB/T/006/2018-2017"},
        ];

        $scope.Notifications =
            [
                {notification: "NO", companyName: "Turubini Limited", ApplicantReferenceNumber: "APPLICANT/T/2017/101",},
                {notification: "NO", companyName: "QWERTY Solutions", ApplicantReferenceNumber: "APPLICANT/T/2017/102",},
                {notification: "YES", companyName: "ATRIA Group Limited", ApplicantReferenceNumber: "APPLICANT/T/2017/103",},
                {notification: "NO", companyName: "Microsoft Solutions", ApplicantReferenceNumber: "APPLICANT/T/2017/104",}]

        $scope.process = function (){
            $scope.Payment = true;
        }


        $scope.LinkCustAcc = {search: ''};
        $scope.BankCustomer = {search: ''};
        $scope.searchPrincipal = function (clear) {

            if (clear) {
                $dialogConfirm("Please note that all the data captured so far will be cleared. Are you sure that you want to clear?").then(function () {
                    $scope.BankCustomer = {search: ''};
                    $scope.clearCustomer(false);
                }, function () {
                    return;
                });
            } else {
                if (!$scope.BankCustomer.search) {
                    return;
                }
                if ($scope.PrincipalCustomer.CustomerOutlets.length > 0) {
                    $dialogConfirm("Please note that by searching again all the data captured so far will be cleared! Do you want to continue?").then(function () {
                        $scope.searchAccount(true);
                    }, function () {
                        return;
                    });
                } else {
                    $scope.searchAccount(true);
                }
            }
        };

        $scope.searchAccount = function (isPrincipal) {
            var searchInput = '';
            $scope.isPrincipal = isPrincipal;
            if ($scope.isPrincipal) {
                searchInput = $scope.BankCustomer.search;
            } else {
                if (!$scope.LinkAccForm.$valid) {
                    return;
                }
                searchInput = $scope.LinkCustAcc.search;
            }

            $scope.progressBar = $rootScope.showProgress();
            DataService.getSearchCustAccount(searchInput).then(function (response) {
                console.log("Resp:", angular.toJson(response.data.data));
                $scope.progressBar.close();
                /* Remember to check for account not found && Duplicate accounts*/
                if (response.data.data) {
                    $scope.LinkCustAcc = response.data.data;
                    $scope.LinkCustAcc.search = searchInput;
                    if ($scope.isPrincipal) {
                        $scope.ShowLinkAcc = true;
                    }
                } else {
                    $rootScope.notify('info', 'Information', 'Account not found');
                }
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.principalAccountOK = function () {
            if ($scope.LinkCustAcc.hasOwnProperty('accountNumber')) {
                $scope.clearCustomer(false); //Reset principal
                $scope.PrincipalCustomer.customerName = $scope.LinkCustAcc.accountName;
                $scope.PrincipalCustomer.postalAddress = $scope.LinkCustAcc.postalAddress ? $scope.LinkCustAcc.postalAddress : 'N/A';
                $scope.CustomerAccounts.push($scope.LinkCustAcc);
                $scope.closeAndclear();
            }
        };
        $scope.addOutlet = function () {
            if (!$scope.OutletForm.$valid) {
                return;
            }

            $scope.CustOutlet.outletName = $filter('sentenceCase')($scope.CustOutlet.outletName);
            $scope.CustOutlet.physicalAddress = $filter('sentenceCase')($scope.CustOutlet.physicalAddress);
            var outletAccounts = [];
            for (var i = 0; i < $scope.CustomerAccounts.length; i++) {
                if ($scope.CustomerAccounts[i].isChecked) {
                    outletAccounts.push($scope.CustomerAccounts[i]);
                }
            }
            $scope.CustOutlet.accounts = outletAccounts;
            if (outletAccounts.length < 1) {
                $scope.checkAccountError = true;
                return;
            }

            if (!$scope.CustOutlet.hasOwnProperty('outletId')) {
                var OutletContacts = [];
                $scope.CustOutlet.OutletContacts = OutletContacts;
                $scope.CustOutlet.outletId = $scope.CustomerOutlets.length + 1;
                $scope.CustomerOutlets.push($scope.CustOutlet);
            }
            $scope.closeAndclear(true);
        };
        $scope.editOutlet = function (index) {
            $scope.CustOutlet = $scope.CustomerOutlets[index];
            $scope.OrigCustOutlet = angular.copy($scope.CustOutlet);
            $scope.OrigCustOutlet.index = index;
            for (var i = 0; i < $scope.CustomerAccounts.length; i++) {
                console.log("Account Exists:", $scope.CustOutlet.accounts.map(function (e) {
                    return e.accountNumber;
                }).indexOf($scope.CustomerAccounts[i].accountNumber));
                $scope.CustomerAccounts[i].isChecked = $scope.CustOutlet.accounts.map(function (e) {
                    return e.accountNumber;
                }).indexOf($scope.CustomerAccounts[i].accountNumber) > -1 ? true : false;
            }
            $scope.showDlg();
        };
        $scope.addContact = function () {
            if (!$scope.OutletContactForm.$valid) {
                return;
            }

            $scope.OutletContact.fullName = $filter('sentenceCase')($scope.OutletContact.fullName);
            //$scope.OutletContact.msisdn = (/^07/.test($scope.OutletContact.msisdn)) ? "2547"+$scope.OutletContact.msisdn.substring(1) : $scope.OutletContact.msisdn;
            var contactAccounts = [];
            for (var i = 0; i < $scope.CustOutlet.accounts.length; i++) {
                if ($scope.CustOutlet.accounts[i].isChecked) {
                    contactAccounts.push($scope.CustOutlet.accounts[i]);
                }
            }
            if (contactAccounts.length < 1) {
                $scope.checkAccountError = true;
                return;
            }
            $scope.OutletContact.accounts = contactAccounts;
            if (!$scope.OutletContact.hasOwnProperty('contactId')) {
                $scope.OutletContact.contactId = $scope.CustOutlet.OutletContacts.length + 1;
                $scope.CustOutlet.OutletContacts.push($scope.OutletContact);
            }
            $scope.closeAndclear(true);
        };
        $scope.editOutletContact = function (index, parentIndex) {
            $scope.CustOutlet = $scope.CustomerOutlets[parentIndex];
            $scope.OutletContact = $scope.CustOutlet.OutletContacts[index];
            $scope.OrigOutletContact = angular.copy($scope.OutletContact);
            $scope.OrigOutletContact.index = index;
            for (var i = 0; i < $scope.CustOutlet.accounts.length; i++) {
                $scope.CustOutlet.accounts[i].isChecked = $scope.OutletContact.accounts.map(function (e) {
                    return e.accountNumber;
                }).indexOf($scope.CustOutlet.accounts[i].accountNumber) > -1 ? true : false;
            }
            $scope.showDlg($scope.CustOutlet);
        };
        $scope.linkAccount = function () {
            if ($scope.LinkCustAcc.hasOwnProperty('accountNumber')) {
                if ($scope.CustomerAccounts.map(function (e) {
                    return e.accountNumber;
                }).indexOf($scope.LinkCustAcc.accountNumber) > -1) {
                    $rootScope.notify('error', 'Error', 'This account already exists!');
                } else {
                    $scope.CustomerAccounts.push($scope.LinkCustAcc);
                }
                $scope.closeAndclear();
            }
        };
        $scope.removeItem = function (index, parentIndex) {
            switch ($scope.CurrentStep) {
                case 1:
                    if ($scope.CustomerOutlets.length > 0) {//Remove Account on Outlets
                        for (var i = 0; i < $scope.CustomerOutlets.length; i++) {
                            var accIndex = $scope.CustomerOutlets[i].accounts.map(function (e) {
                                return e.accountNumber;
                            }).indexOf($scope.CustomerAccounts[index].accountNumber);
                            if (accIndex > -1) {
                                $scope.CustomerOutlets[i].accounts.splice(accIndex, 1);
                                if ($scope.CustomerOutlets[i].OutletContacts.length > 0) {//Remove Outlet Account on Contacts
                                    for (var j = 0; j < $scope.CustomerOutlets[i].OutletContacts.length; j++) {
                                        var contactAccIndex = $scope.CustomerOutlets[i].OutletContacts[j].accounts.map(function (e) {
                                            return e.accountNumber;
                                        }).indexOf($scope.CustomerAccounts[index].accountNumber);
                                        if (contactAccIndex > -1) {
                                            $scope.CustomerOutlets[i].OutletContacts[j].accounts.splice(contactAccIndex, 1);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    $scope.CustomerAccounts.splice(index, 1);
                    break;
                case 2:
                    $scope.CustomerOutlets.splice(index, 1);
                    break;
                case 3:
                    $scope.CustomerOutlets[parentIndex].OutletContacts.splice(index, 1);
                    break;
            }
        };
        $scope.showDlg = function (CustOutlet) {
            switch ($scope.CurrentStep) {
                case 1:
                    $scope.ShowLinkAcc = true;
                    $scope.isPrincipal = false;
                    break;
                case 2:
                    $scope.ShowOutlet = true;
                    $scope.checkAccountError = false;
                    break;
                case 3:
                    $scope.ShowContact = true;
                    $scope.CustOutlet = CustOutlet;
                    $scope.checkAccountError = false;
                    break;
            }
        };
        $scope.closeAndclear = function (recordSaved) {
            switch ($scope.CurrentStep) {
                case 1:
                    $scope.ShowLinkAcc = false;
                    $scope.LinkCustAcc = {};
                    break;
                case 2:
                    $scope.ShowOutlet = false;
                    if (!recordSaved && $scope.OrigCustOutlet) {
                        var index = $scope.OrigCustOutlet.index;
                        delete $scope.OrigCustOutlet.index;
                        $scope.CustomerOutlets.push($scope.OrigCustOutlet);
                        $scope.CustomerOutlets.splice(index, 1);
                    }
                    delete $scope.OrigCustOutlet;
                    $scope.CustOutlet = {};
                    for (var i = 0; i < $scope.CustomerAccounts.length; i++) {
                        $scope.CustomerAccounts[i].isChecked = false;
                    }
                    break;
                case 3:
                    $scope.ShowContact = false;
                    if (!recordSaved && $scope.OrigOutletContact) {
                        var index = $scope.OrigOutletContact.index;
                        delete $scope.OrigOutletContact.index;
                        $scope.CustOutlet.OutletContacts.push($scope.OrigOutletContact);
                        $scope.CustOutlet.OutletContacts.splice(index, 1);
                    }
                    delete $scope.OrigOutletContact;
                    $scope.OutletContact = {};
                    for (var i = 0; i < $scope.CustOutlet.accounts.length; i++) {
                        $scope.CustOutlet.accounts[i].isChecked = false;
                    }
                    break;
            }
        };
        $scope.proceedNextStep = function () {

            switch ($scope.CurrentStep) {
                case 1:
                    DataService.processTenderRequest($scope.CurrentStep, $scope.approval).then(function (response) {

                        $scope.progressBar.close();
                    }, function (error) {
                        console.log("Error", error);
                        $scope.progressBar.close();
                        if (error.status === -1) {
                            $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                        } else if (error.status === 401) {
                            $rootScope.expiredToken();
                        } else if (error.status === 403) {
                            $rootScope.notify('error', 'Error', error.data.message);
                            $window.location = '#/Error';
                        } else {
                            $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                        }
                    });

                    $rootScope.notify('success', 'Success', 'Tender request has been approved by Head of Department. E-mail notification has been sent to chain managers');

                    break;
                case 2:
                    $rootScope.notify('success', 'Success', 'Tender request has been approved by Finance Office. E-mail notification has been sent to chain managers');

                    break;
                case 3:
                    $rootScope.notify('success', 'Success', 'Tender request has been approved by Head of Department. E-mail notification has been sent to chain managers');

                    break;
                case 4:
                    $rootScope.notify('success', 'Success', 'Tender request has been approved by Accounting Officer. E-mail notification has been sent to chain managers');

                    break;
                case 5:
                    $window.location='#/CreateTender'
                    $rootScope.notify('success', 'Success', 'Tender request approved for tendering. Email notification has been sent to chain managers');

                    break;
            }
            $scope.CurrentStep += 1;
            $scope.HighestLevel = $scope.HighestLevel > $scope.CurrentStep ? $scope.HighestLevel : $scope.CurrentStep;
            $scope.PrincipalCustomer.CurrentStep = $scope.CurrentStep;
            $scope.PrincipalCustomer.HighestLevel = $scope.HighestLevel;
            $localStorage.CustOnboarding = $scope.PrincipalCustomer;
            $window.scrollTo(0, 0);
        };
        $scope.navigatePreviousStep = function () {
            $scope.CurrentStep -= 1;
            $scope.PrincipalCustomer.CurrentStep = $scope.CurrentStep;
            $localStorage.CustOnboarding = $scope.PrincipalCustomer;
            $window.scrollTo(0, 0);
        };
        $scope.navigatetoTab = function (tabId) {
            console.log("Navigate to:", tabId);
            $scope.CurrentStep = tabId;
            $scope.PrincipalCustomer.CurrentStep = $scope.CurrentStep;
            $localStorage.CustOnboarding = $scope.PrincipalCustomer;
            $window.scrollTo(0, 0);
        };
        $scope.saveCustomer = function () {
            $scope.Customer = {};
            $scope.Customer.customerName = $scope.PrincipalCustomer.customerName;
            $scope.Customer.postalAddress = $scope.PrincipalCustomer.postalAddress;
            $scope.Customer.physicalAddress = $scope.PrincipalCustomer.physicalAddress;
            $scope.Customer.custCategoryId = $scope.PrincipalCustomer.custCategoryId;
            $scope.Customer.accountReference = [];
            angular.forEach($scope.PrincipalCustomer.CustomerAccounts, function (value, key) {
                $scope.Customer.accountReference.push(value.accountNumber);
            });
            $scope.Customer.outlets = [];
            angular.forEach($scope.PrincipalCustomer.CustomerOutlets, function (value, key) {
                var outlet = {};
                outlet.outletName = value.outletName;
                outlet.physicalAddress = value.physicalAddress;
                outlet.accountRefs = [];
                angular.forEach(value.accounts, function (value, key) {
                    outlet.accountRefs.push(value.accountNumber);
                });
                outlet.contacts = [];
                angular.forEach(value.OutletContacts, function (value, key) {
                    var outletContact = {};
                    outletContact.contactEmail = value.emailAddress;
                    outletContact.accountRefs = [];
                    angular.forEach(value.accounts, function (value, key) {
                        outletContact.accountRefs.push(value.accountNumber);
                    });
                    outlet.contacts.push(outletContact);
                });
                $scope.Customer.outlets.push(outlet);
            });
            $scope.Customer.contacts = [];
            angular.forEach($scope.PrincipalCustomer.CustomerContacts, function (value, key) {
                var contact = {};
                contact.fullName = value.fullName;
                contact.emailAddress = value.emailAddress;
                contact.msisdn = value.msisdn;
                $scope.Customer.contacts.push(contact);
            });
            console.log("Final Customer:", angular.toJson($scope.Customer));
            $scope.progressBar = $rootScope.showProgress();
            DataService.savePrincipalCustomer($scope.Customer).then(function (response) {
                console.log("Customer Onboarding resp:", response.data.data);
                $scope.progressBar.close();
                $scope.PrincipalCustomer = {};
                delete $localStorage.CustOnboarding;
                $rootScope.notify('success', 'Success', "Customer On-boarding successfully completed.");
                $window.location = '#/Customers';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    var errors = "";
                    if (error.data.data) {
                        errors = " [";
                        angular.forEach(error.data.data, function (value, key) {
                            errors = errors + value + ",";
                        });
                        errors = errors + "]";
                    }
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
                }
            });
        };
        $scope.loadCustomerCategories = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerCategories(true, ["Approved", "Rejected"]).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.CustomerCategories = response.data.data.content;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.clearCustomer = function (reloadCategories) {
            $scope.CustomerAccounts = [];
            $scope.CustomerOutlets = [];
            $scope.CustomerContacts = [];
            $scope.PrincipalCustomer = {};
            $scope.PrincipalCustomer.customerName = null;
            $scope.PrincipalCustomer.postalAddress = null;
            $scope.PrincipalCustomer.physicalAddress = null;
            $scope.PrincipalCustomer.custCategoryId = null;
            $scope.PrincipalCustomer.CustomerAccounts = $scope.CustomerAccounts;
            $scope.PrincipalCustomer.CustomerOutlets = $scope.CustomerOutlets;
            $scope.PrincipalCustomer.CustomerContacts = $scope.CustomerContacts;
            $scope.CurrentStep = 1;
            $scope.HighestLevel = 1;
            $scope.PrincipalCustomer.CurrentStep = $scope.CurrentStep;
            if (reloadCategories) {
                $scope.loadCustomerCategories();
            }
            $scope.PrincipalCustomer.CustomerCategories = $scope.CustomerCategories;
            $localStorage.CustOnboarding = $scope.PrincipalCustomer;
        };
        if (!$localStorage.hasOwnProperty('CustOnboarding')) { //If starting customer onboarding
            $scope.clearCustomer(true);
        } else {
            console.log("$localStorage.CustOnboarding", $localStorage.CustOnboarding);
            $scope.PrincipalCustomer = $localStorage.CustOnboarding;
            $scope.CustomerAccounts = $scope.PrincipalCustomer.CustomerAccounts;
            $scope.CustomerOutlets = $scope.PrincipalCustomer.CustomerOutlets;
            $scope.CustomerContacts = $scope.PrincipalCustomer.CustomerContacts;
            $scope.CurrentStep = $scope.PrincipalCustomer.CurrentStep;
            $scope.HighestLevel = $scope.PrincipalCustomer.HighestLevel;
            $scope.loadCustomerCategories();
        }
    }])

    .controller('ProcessTenderCtrl', ['$rootScope', '$scope', 'DataService', '$localStorage', '$window', '$filter', function ($rootScope, $scope, DataService, $localStorage, $window, $filter) {

        $scope.SubmittedTenders = [
            {ApplicantReferenceNumber: "APPLICANT/T/2017/101", ReferenceNo: "NIB/T/006/2018-2017"},
            {ApplicantReferenceNumber: "APPLICANT/T/2017/102", ReferenceNo: "NIB/T/006/2018-2017"},
            {ApplicantReferenceNumber: "APPLICANT/T/2017/103", ReferenceNo: "NIB/T/006/2018-2017"},
            {ApplicantReferenceNumber: "APPLICANT/T/2017/104", ReferenceNo: "NIB/T/006/2018-2017"},
        ];

        $scope.Notifications =
            [
                {notification: "NO", companyName: "Turubini Limited", ApplicantReferenceNumber: "APPLICANT/T/2017/101",},
                {notification: "NO", companyName: "QWERTY Solutions", ApplicantReferenceNumber: "APPLICANT/T/2017/102",},
                {notification: "YES", companyName: "ATRIA Group Limited", ApplicantReferenceNumber: "APPLICANT/T/2017/103",},
                {notification: "NO", companyName: "Microsoft Solutions", ApplicantReferenceNumber: "APPLICANT/T/2017/104",}]

        $scope.process = function (){
            $scope.Payment = true;
        }


        $scope.LinkCustAcc = {search: ''};
        $scope.BankCustomer = {search: ''};
        $scope.searchPrincipal = function (clear) {

            if (clear) {
                $dialogConfirm("Please note that all the data captured so far will be cleared. Are you sure that you want to clear?").then(function () {
                    $scope.BankCustomer = {search: ''};
                    $scope.clearCustomer(false);
                }, function () {
                    return;
                });
            } else {
                if (!$scope.BankCustomer.search) {
                    return;
                }
                if ($scope.PrincipalCustomer.CustomerOutlets.length > 0) {
                    $dialogConfirm("Please note that by searching again all the data captured so far will be cleared! Do you want to continue?").then(function () {
                        $scope.searchAccount(true);
                    }, function () {
                        return;
                    });
                } else {
                    $scope.searchAccount(true);
                }
            }
        };

        $scope.searchAccount = function (isPrincipal) {
            var searchInput = '';
            $scope.isPrincipal = isPrincipal;
            if ($scope.isPrincipal) {
                searchInput = $scope.BankCustomer.search;
            } else {
                if (!$scope.LinkAccForm.$valid) {
                    return;
                }
                searchInput = $scope.LinkCustAcc.search;
            }

            $scope.progressBar = $rootScope.showProgress();
            DataService.getSearchCustAccount(searchInput).then(function (response) {
                console.log("Resp:", angular.toJson(response.data.data));
                $scope.progressBar.close();
                /* Remember to check for account not found && Duplicate accounts*/
                if (response.data.data) {
                    $scope.LinkCustAcc = response.data.data;
                    $scope.LinkCustAcc.search = searchInput;
                    if ($scope.isPrincipal) {
                        $scope.ShowLinkAcc = true;
                    }
                } else {
                    $rootScope.notify('info', 'Information', 'Account not found');
                }
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.principalAccountOK = function () {
            if ($scope.LinkCustAcc.hasOwnProperty('accountNumber')) {
                $scope.clearCustomer(false); //Reset principal
                $scope.PrincipalCustomer.customerName = $scope.LinkCustAcc.accountName;
                $scope.PrincipalCustomer.postalAddress = $scope.LinkCustAcc.postalAddress ? $scope.LinkCustAcc.postalAddress : 'N/A';
                $scope.CustomerAccounts.push($scope.LinkCustAcc);
                $scope.closeAndclear();
            }
        };
        $scope.addOutlet = function () {
            if (!$scope.OutletForm.$valid) {
                return;
            }

            $scope.CustOutlet.outletName = $filter('sentenceCase')($scope.CustOutlet.outletName);
            $scope.CustOutlet.physicalAddress = $filter('sentenceCase')($scope.CustOutlet.physicalAddress);
            var outletAccounts = [];
            for (var i = 0; i < $scope.CustomerAccounts.length; i++) {
                if ($scope.CustomerAccounts[i].isChecked) {
                    outletAccounts.push($scope.CustomerAccounts[i]);
                }
            }
            $scope.CustOutlet.accounts = outletAccounts;
            if (outletAccounts.length < 1) {
                $scope.checkAccountError = true;
                return;
            }

            if (!$scope.CustOutlet.hasOwnProperty('outletId')) {
                var OutletContacts = [];
                $scope.CustOutlet.OutletContacts = OutletContacts;
                $scope.CustOutlet.outletId = $scope.CustomerOutlets.length + 1;
                $scope.CustomerOutlets.push($scope.CustOutlet);
            }
            $scope.closeAndclear(true);
        };
        $scope.editOutlet = function (index) {
            $scope.CustOutlet = $scope.CustomerOutlets[index];
            $scope.OrigCustOutlet = angular.copy($scope.CustOutlet);
            $scope.OrigCustOutlet.index = index;
            for (var i = 0; i < $scope.CustomerAccounts.length; i++) {
                console.log("Account Exists:", $scope.CustOutlet.accounts.map(function (e) {
                    return e.accountNumber;
                }).indexOf($scope.CustomerAccounts[i].accountNumber));
                $scope.CustomerAccounts[i].isChecked = $scope.CustOutlet.accounts.map(function (e) {
                    return e.accountNumber;
                }).indexOf($scope.CustomerAccounts[i].accountNumber) > -1 ? true : false;
            }
            $scope.showDlg();
        };
        $scope.addContact = function () {
            if (!$scope.OutletContactForm.$valid) {
                return;
            }

            $scope.OutletContact.fullName = $filter('sentenceCase')($scope.OutletContact.fullName);
            //$scope.OutletContact.msisdn = (/^07/.test($scope.OutletContact.msisdn)) ? "2547"+$scope.OutletContact.msisdn.substring(1) : $scope.OutletContact.msisdn;
            var contactAccounts = [];
            for (var i = 0; i < $scope.CustOutlet.accounts.length; i++) {
                if ($scope.CustOutlet.accounts[i].isChecked) {
                    contactAccounts.push($scope.CustOutlet.accounts[i]);
                }
            }
            if (contactAccounts.length < 1) {
                $scope.checkAccountError = true;
                return;
            }
            $scope.OutletContact.accounts = contactAccounts;
            if (!$scope.OutletContact.hasOwnProperty('contactId')) {
                $scope.OutletContact.contactId = $scope.CustOutlet.OutletContacts.length + 1;
                $scope.CustOutlet.OutletContacts.push($scope.OutletContact);
            }
            $scope.closeAndclear(true);
        };
        $scope.editOutletContact = function (index, parentIndex) {
            $scope.CustOutlet = $scope.CustomerOutlets[parentIndex];
            $scope.OutletContact = $scope.CustOutlet.OutletContacts[index];
            $scope.OrigOutletContact = angular.copy($scope.OutletContact);
            $scope.OrigOutletContact.index = index;
            for (var i = 0; i < $scope.CustOutlet.accounts.length; i++) {
                $scope.CustOutlet.accounts[i].isChecked = $scope.OutletContact.accounts.map(function (e) {
                    return e.accountNumber;
                }).indexOf($scope.CustOutlet.accounts[i].accountNumber) > -1 ? true : false;
            }
            $scope.showDlg($scope.CustOutlet);
        };
        $scope.linkAccount = function () {
            if ($scope.LinkCustAcc.hasOwnProperty('accountNumber')) {
                if ($scope.CustomerAccounts.map(function (e) {
                    return e.accountNumber;
                }).indexOf($scope.LinkCustAcc.accountNumber) > -1) {
                    $rootScope.notify('error', 'Error', 'This account already exists!');
                } else {
                    $scope.CustomerAccounts.push($scope.LinkCustAcc);
                }
                $scope.closeAndclear();
            }
        };
        $scope.removeItem = function (index, parentIndex) {
            switch ($scope.CurrentStep) {
                case 1:
                    if ($scope.CustomerOutlets.length > 0) {//Remove Account on Outlets
                        for (var i = 0; i < $scope.CustomerOutlets.length; i++) {
                            var accIndex = $scope.CustomerOutlets[i].accounts.map(function (e) {
                                return e.accountNumber;
                            }).indexOf($scope.CustomerAccounts[index].accountNumber);
                            if (accIndex > -1) {
                                $scope.CustomerOutlets[i].accounts.splice(accIndex, 1);
                                if ($scope.CustomerOutlets[i].OutletContacts.length > 0) {//Remove Outlet Account on Contacts
                                    for (var j = 0; j < $scope.CustomerOutlets[i].OutletContacts.length; j++) {
                                        var contactAccIndex = $scope.CustomerOutlets[i].OutletContacts[j].accounts.map(function (e) {
                                            return e.accountNumber;
                                        }).indexOf($scope.CustomerAccounts[index].accountNumber);
                                        if (contactAccIndex > -1) {
                                            $scope.CustomerOutlets[i].OutletContacts[j].accounts.splice(contactAccIndex, 1);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    $scope.CustomerAccounts.splice(index, 1);
                    break;
                case 2:
                    $scope.CustomerOutlets.splice(index, 1);
                    break;
                case 3:
                    $scope.CustomerOutlets[parentIndex].OutletContacts.splice(index, 1);
                    break;
            }
        };
        $scope.showDlg = function (CustOutlet) {
            switch ($scope.CurrentStep) {
                case 1:
                    $scope.ShowLinkAcc = true;
                    $scope.isPrincipal = false;
                    break;
                case 2:
                    $scope.ShowOutlet = true;
                    $scope.checkAccountError = false;
                    break;
                case 3:
                    $scope.ShowContact = true;
                    $scope.CustOutlet = CustOutlet;
                    $scope.checkAccountError = false;
                    break;
            }
        };
        $scope.closeAndclear = function (recordSaved) {
            switch ($scope.CurrentStep) {
                case 1:
                    $scope.ShowLinkAcc = false;
                    $scope.LinkCustAcc = {};
                    break;
                case 2:
                    $scope.ShowOutlet = false;
                    if (!recordSaved && $scope.OrigCustOutlet) {
                        var index = $scope.OrigCustOutlet.index;
                        delete $scope.OrigCustOutlet.index;
                        $scope.CustomerOutlets.push($scope.OrigCustOutlet);
                        $scope.CustomerOutlets.splice(index, 1);
                    }
                    delete $scope.OrigCustOutlet;
                    $scope.CustOutlet = {};
                    for (var i = 0; i < $scope.CustomerAccounts.length; i++) {
                        $scope.CustomerAccounts[i].isChecked = false;
                    }
                    break;
                case 3:
                    $scope.ShowContact = false;
                    if (!recordSaved && $scope.OrigOutletContact) {
                        var index = $scope.OrigOutletContact.index;
                        delete $scope.OrigOutletContact.index;
                        $scope.CustOutlet.OutletContacts.push($scope.OrigOutletContact);
                        $scope.CustOutlet.OutletContacts.splice(index, 1);
                    }
                    delete $scope.OrigOutletContact;
                    $scope.OutletContact = {};
                    for (var i = 0; i < $scope.CustOutlet.accounts.length; i++) {
                        $scope.CustOutlet.accounts[i].isChecked = false;
                    }
                    break;
            }
        };
        $scope.proceedNextStep = function () {

            switch ($scope.CurrentStep) {
                case 1:
                    // if (!$scope.PrincipalCustomerForm.$valid) {
                    //     $rootScope.notify('warning', 'Warning', 'Enter the physical location')
                    //     return;
                    // }
                    // if ($scope.CustomerAccounts.length > 0) {
                    //     $scope.PrincipalCustomer.CustomerAccounts = $scope.CustomerAccounts;
                    //     $localStorage.CustOnboarding = $scope.PrincipalCustomer;
                    // } else {
                    //     $rootScope.alertDialog('You must add atleast one Account to proceed!');
                    //     return;
                    // }
                    break;
                case 2:
                    // if ($scope.CustomerOutlets.length > 0) {
                    //     $scope.PrincipalCustomer.CustomerOutlets = $scope.CustomerOutlets;
                    //     $localStorage.CustOnboarding = $scope.PrincipalCustomer;
                    // } else {
                    //     $rootScope.alertDialog('You must add atleast one Outlet to proceed!');
                    //     return;
                    // }
                    break;
                case 3:
                    // var CustomerContactsEmail = [];
                    // $scope.CustomerContacts = [];
                    // for (var i = 0; i < $scope.CustomerOutlets.length; i++) {
                    //     var OutletContacts = $scope.CustomerOutlets[i].OutletContacts;
                    //     for (var j = 0; j < OutletContacts.length; j++) {
                    //         if (CustomerContactsEmail.indexOf(OutletContacts[j].emailAddress) === -1) {
                    //             CustomerContactsEmail.push(OutletContacts[j].emailAddress);
                    //             $scope.CustomerContacts.push(OutletContacts[j]);
                    //         }
                    //     }
                    // }
                    // if ($scope.CustomerContacts.length > 0) {
                    //     $scope.PrincipalCustomer.CustomerOutlets = $scope.CustomerOutlets;
                    //     $scope.PrincipalCustomer.CustomerContacts = $scope.CustomerContacts;
                    //     $localStorage.CustOnboarding = $scope.PrincipalCustomer;
                    // } else {
                    //     $rootScope.alertDialog('You must add contacts to Outlets to proceed!');
                    //     return;
                    // }
                    break;
            }
            $scope.CurrentStep += 1;
            $scope.HighestLevel = $scope.HighestLevel > $scope.CurrentStep ? $scope.HighestLevel : $scope.CurrentStep;
            $scope.PrincipalCustomer.CurrentStep = $scope.CurrentStep;
            $scope.PrincipalCustomer.HighestLevel = $scope.HighestLevel;
            $localStorage.CustOnboarding = $scope.PrincipalCustomer;
            $window.scrollTo(0, 0);
        };
        $scope.navigatePreviousStep = function () {
            $scope.CurrentStep -= 1;
            $scope.PrincipalCustomer.CurrentStep = $scope.CurrentStep;
            $localStorage.CustOnboarding = $scope.PrincipalCustomer;
            $window.scrollTo(0, 0);
        };
        $scope.navigatetoTab = function (tabId) {
            console.log("Navigate to:", tabId);
            $scope.CurrentStep = tabId;
            $scope.PrincipalCustomer.CurrentStep = $scope.CurrentStep;
            $localStorage.CustOnboarding = $scope.PrincipalCustomer;
            $window.scrollTo(0, 0);
        };
        $scope.saveCustomer = function () {
            $scope.Customer = {};
            $scope.Customer.customerName = $scope.PrincipalCustomer.customerName;
            $scope.Customer.postalAddress = $scope.PrincipalCustomer.postalAddress;
            $scope.Customer.physicalAddress = $scope.PrincipalCustomer.physicalAddress;
            $scope.Customer.custCategoryId = $scope.PrincipalCustomer.custCategoryId;
            $scope.Customer.accountReference = [];
            angular.forEach($scope.PrincipalCustomer.CustomerAccounts, function (value, key) {
                $scope.Customer.accountReference.push(value.accountNumber);
            });
            $scope.Customer.outlets = [];
            angular.forEach($scope.PrincipalCustomer.CustomerOutlets, function (value, key) {
                var outlet = {};
                outlet.outletName = value.outletName;
                outlet.physicalAddress = value.physicalAddress;
                outlet.accountRefs = [];
                angular.forEach(value.accounts, function (value, key) {
                    outlet.accountRefs.push(value.accountNumber);
                });
                outlet.contacts = [];
                angular.forEach(value.OutletContacts, function (value, key) {
                    var outletContact = {};
                    outletContact.contactEmail = value.emailAddress;
                    outletContact.accountRefs = [];
                    angular.forEach(value.accounts, function (value, key) {
                        outletContact.accountRefs.push(value.accountNumber);
                    });
                    outlet.contacts.push(outletContact);
                });
                $scope.Customer.outlets.push(outlet);
            });
            $scope.Customer.contacts = [];
            angular.forEach($scope.PrincipalCustomer.CustomerContacts, function (value, key) {
                var contact = {};
                contact.fullName = value.fullName;
                contact.emailAddress = value.emailAddress;
                contact.msisdn = value.msisdn;
                $scope.Customer.contacts.push(contact);
            });
            console.log("Final Customer:", angular.toJson($scope.Customer));
            $scope.progressBar = $rootScope.showProgress();
            DataService.savePrincipalCustomer($scope.Customer).then(function (response) {
                console.log("Customer Onboarding resp:", response.data.data);
                $scope.progressBar.close();
                $scope.PrincipalCustomer = {};
                delete $localStorage.CustOnboarding;
                $rootScope.notify('success', 'Success', "Customer On-boarding successfully completed.");
                $window.location = '#/Customers';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    var errors = "";
                    if (error.data.data) {
                        errors = " [";
                        angular.forEach(error.data.data, function (value, key) {
                            errors = errors + value + ",";
                        });
                        errors = errors + "]";
                    }
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
                }
            });
        };
        $scope.loadCustomerCategories = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerCategories(true, ["Approved", "Rejected"]).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.CustomerCategories = response.data.data.content;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.clearCustomer = function (reloadCategories) {
            $scope.CustomerAccounts = [];
            $scope.CustomerOutlets = [];
            $scope.CustomerContacts = [];
            $scope.PrincipalCustomer = {};
            $scope.PrincipalCustomer.customerName = null;
            $scope.PrincipalCustomer.postalAddress = null;
            $scope.PrincipalCustomer.physicalAddress = null;
            $scope.PrincipalCustomer.custCategoryId = null;
            $scope.PrincipalCustomer.CustomerAccounts = $scope.CustomerAccounts;
            $scope.PrincipalCustomer.CustomerOutlets = $scope.CustomerOutlets;
            $scope.PrincipalCustomer.CustomerContacts = $scope.CustomerContacts;
            $scope.CurrentStep = 1;
            $scope.HighestLevel = 1;
            $scope.PrincipalCustomer.CurrentStep = $scope.CurrentStep;
            if (reloadCategories) {
                $scope.loadCustomerCategories();
            }
            $scope.PrincipalCustomer.CustomerCategories = $scope.CustomerCategories;
            $localStorage.CustOnboarding = $scope.PrincipalCustomer;
        };
        if (!$localStorage.hasOwnProperty('CustOnboarding')) { //If starting customer onboarding
            $scope.clearCustomer(true);
        } else {
            console.log("$localStorage.CustOnboarding", $localStorage.CustOnboarding);
            $scope.PrincipalCustomer = $localStorage.CustOnboarding;
            $scope.CustomerAccounts = $scope.PrincipalCustomer.CustomerAccounts;
            $scope.CustomerOutlets = $scope.PrincipalCustomer.CustomerOutlets;
            $scope.CustomerContacts = $scope.PrincipalCustomer.CustomerContacts;
            $scope.CurrentStep = $scope.PrincipalCustomer.CurrentStep;
            $scope.HighestLevel = $scope.PrincipalCustomer.HighestLevel;
            $scope.loadCustomerCategories();
        }
    }])



    .controller('PublishedAuctionCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $timeout, $q) {
        $scope.ShowPublishedAuction=false;


        $scope.Auctions =
            [
                {ItemName: "2014 MERCEDES BENZ S 500", AuctionID:"PSGC56DHC", EntityName:"National Irrigations Board", BasePrice:"KSHS. 4,000,000", PublishDate:"2020-Nov-10", CloseDate:"2020-Dec-01", Status:"Published", SaleConditions:"1. Viewing can be done during normal working hours at the Ministry ware house located in\n" +
                        "industrial area along Likoni road opposite NTSA to verify the details as these are not\n" +
                        "warranted by the Auctioneers or the Ministry of  Water and Irrigation.\n" +
                        "2. A refundable Banker’s Cheque of Kshs. 30,000.00 deposited in favor of the Principal Secretary,\n" +
                        "Ministry of Water and Irrigation at the cash office on 2\n" +
                        "nd Floor Old Treasury Building, Harambee\n" +
                        "Avenue, Nairobi is a requirement for the bidders bidding for Lot 1 and Kshs. 10, 000 for all\n" +
                        "other Motor vehicles and a non-refundable amount of Kshs.5,000.00 for assorted stores which\n" +
                        "will be sold as one lot. Bidders are to obtain a bidding number from Cash office, on second\n" +
                        "(2nd ) floor and should be received on or before Monday 24\n" +
                        "th June, 2019 at 4.00 pm.\n" +
                        "PLEASE NOTE THAT:\n" +
                        "• THERE WILL BE NO BIDDING WHATSOEVER WITHOUT A BIDDING\n" +
                        "NUMBER.\n" +
                        "• THE BIDDING NUMBERS WILL BE ISSUED ON THE DAY OF AUCTION.\n" +
                        "3. The declared purchaser must deposit 25% of the purchase price in cash or banker’s cheque in\n" +
                        "favor of Principal Secretary, Ministry of Foreign Affairs, at the fall of the hammer and the\n" +
                        "balance paid within seven (7) days from the auction date, failure to which the money received\n" +
                        "including the deposit shall be forfeited.\n" +
                        "4. Sales are subject to reserve prices and the duty status (if any)."},

            ];


        $scope.ViewPublishedAuction = function(Auction){
            $scope.ShowPublishedAuction = true;
            $scope.Auction = Auction;
        }
    }])


    .controller('OngoingAuctionCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $timeout, $q) {
        $scope.ShowOngoingAuction=false;
        $scope.ShowBidEvaluation=false;


        $scope.Auctions =
            [
                {ItemName: "2014 MERCEDES BENZ S 500", AuctionID:"PSGC56DHC", EntityName:"National Irrigations Board", BasePrice:"KSHS. 4,000,000", PublishDate:"2020-Nov-10", CloseDate:"2020-Dec-01", Status:"Published", SaleConditions:"1. Viewing can be done during normal working hours at the Ministry ware house located in\n" +
                        "industrial area along Likoni road opposite NTSA to verify the details as these are not\n" +
                        "warranted by the Auctioneers or the Ministry of  Water and Irrigation.\n" +
                        "2. A refundable Banker’s Cheque of Kshs. 30,000.00 deposited in favor of the Principal Secretary,\n" +
                        "Ministry of Water and Irrigation at the cash office on 2\n" +
                        "nd Floor Old Treasury Building, Harambee\n" +
                        "Avenue, Nairobi is a requirement for the bidders bidding for Lot 1 and Kshs. 10, 000 for all\n" +
                        "other Motor vehicles and a non-refundable amount of Kshs.5,000.00 for assorted stores which\n" +
                        "will be sold as one lot. Bidders are to obtain a bidding number from Cash office, on second\n" +
                        "(2nd ) floor and should be received on or before Monday 24\n" +
                        "th June, 2019 at 4.00 pm.\n" +
                        "PLEASE NOTE THAT:\n" +
                        "• THERE WILL BE NO BIDDING WHATSOEVER WITHOUT A BIDDING\n" +
                        "NUMBER.\n" +
                        "• THE BIDDING NUMBERS WILL BE ISSUED ON THE DAY OF AUCTION.\n" +
                        "3. The declared purchaser must deposit 25% of the purchase price in cash or banker’s cheque in\n" +
                        "favor of Principal Secretary, Ministry of Foreign Affairs, at the fall of the hammer and the\n" +
                        "balance paid within seven (7) days from the auction date, failure to which the money received\n" +
                        "including the deposit shall be forfeited.\n" +
                        "4. Sales are subject to reserve prices and the duty status (if any)."},

            ];


        $scope.ViewOngoingAuction = function(Auction){
            $scope.ShowOngoingAuction = true;
            $scope.Auction = Auction;
        }

        $scope.BidEvaluation = function(){
            $scope.ShowBidEvaluation=true;
        }

        $scope.Bids =
            [
                {BidderNumber: "QWEDSCFB/BID/2020", EntityName:"National Irrigations Board", BasePrice:"4,000,000", Bid:"KSHS. 4,700,000", },
                {BidderNumber: "HGBVDFRE/BID/2020", EntityName:"National Irrigations Board", BasePrice:"4,000,000", Bid:"KSHS. 4,400,000", },
                {BidderNumber: "OLJNBF35/BID/2020", EntityName:"National Irrigations Board", BasePrice:"4,000,000", Bid:"KSHS. 4,210,000", },
                {BidderNumber: "BHLK09KH/BID/2020", EntityName:"National Irrigations Board", BasePrice:"4,000,000", Bid:"KSHS. 4,100,000", },
                {BidderNumber: "BYFJKI78/BID/2020", EntityName:"National Irrigations Board", BasePrice:"4,000,000", Bid:"KSHS. 4,000,000", },

            ];


    }])


    .controller('CompletedAuctionCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $timeout, $q) {
        $scope.ShowCompletedAuction=false;


        $scope.Auctions =
            [
                {ItemName: "2014 MERCEDES BENZ S 500", AuctionID:"PSGC56DHC", EntityName:"National Irrigations Board", BasePrice:"KSHS. 4,000,000", PublishDate:"2020-Nov-10", CloseDate:"2020-Dec-01", Status:"Published", SaleConditions:"1. Viewing can be done during normal working hours at the Ministry ware house located in\n" +
                        "industrial area along Likoni road opposite NTSA to verify the details as these are not\n" +
                        "warranted by the Auctioneers or the Ministry of  Water and Irrigation.\n" +
                        "2. A refundable Banker’s Cheque of Kshs. 30,000.00 deposited in favor of the Principal Secretary,\n" +
                        "Ministry of Water and Irrigation at the cash office on 2\n" +
                        "nd Floor Old Treasury Building, Harambee\n" +
                        "Avenue, Nairobi is a requirement for the bidders bidding for Lot 1 and Kshs. 10, 000 for all\n" +
                        "other Motor vehicles and a non-refundable amount of Kshs.5,000.00 for assorted stores which\n" +
                        "will be sold as one lot. Bidders are to obtain a bidding number from Cash office, on second\n" +
                        "(2nd ) floor and should be received on or before Monday 24\n" +
                        "th June, 2019 at 4.00 pm.\n" +
                        "PLEASE NOTE THAT:\n" +
                        "• THERE WILL BE NO BIDDING WHATSOEVER WITHOUT A BIDDING\n" +
                        "NUMBER.\n" +
                        "• THE BIDDING NUMBERS WILL BE ISSUED ON THE DAY OF AUCTION.\n" +
                        "3. The declared purchaser must deposit 25% of the purchase price in cash or banker’s cheque in\n" +
                        "favor of Principal Secretary, Ministry of Foreign Affairs, at the fall of the hammer and the\n" +
                        "balance paid within seven (7) days from the auction date, failure to which the money received\n" +
                        "including the deposit shall be forfeited.\n" +
                        "4. Sales are subject to reserve prices and the duty status (if any)."},

            ];


        $scope.ViewCompletedAuction = function(Auction){
            $scope.ShowCompletedAuction = true;
            $scope.Auction = Auction;
        }

        $scope.BidResults = function(){
            $scope.ShowBidResults = true;
        }

        $scope.BidReport =
            [
                {Result: "WON", BidderNumber: "QWEDSCFB/BID/2020", EntityName:"National Irrigations Board", BasePrice:"4,000,000", Bid:"KSHS. 4,700,000", },
                {Result: "LOST", BidderNumber: "HGBVDFRE/BID/2020", EntityName:"National Irrigations Board", BasePrice:"4,000,000", Bid:"KSHS. 4,400,000", },
                {Result: "LOST", BidderNumber: "OLJNBF35/BID/2020", EntityName:"National Irrigations Board", BasePrice:"4,000,000", Bid:"KSHS. 4,210,000", },
                {Result: "LOST", BidderNumber: "BHLK09KH/BID/2020", EntityName:"National Irrigations Board", BasePrice:"4,000,000", Bid:"KSHS. 4,100,000", },
                {Result: "LOST", BidderNumber: "BYFJKI78/BID/2020", EntityName:"National Irrigations Board", BasePrice:"4,000,000", Bid:"KSHS. 4,000,000", },

            ];


    }])


    .controller('CompletedTenderCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $timeout, $q) {




        $scope.ViewTender = function(Tender){
            $scope.ShowTenderView = true;
            $scope.Tender = Tender;
        }


        $scope.Tenders =
            [{  TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER",
                TenderType: "Open Tender",
                EntityName:"National Irrigation Board",
                ApplicationFee: "0",
                PublishDate: "25th-July-2020",
                CloseDate: "25th-Aug-2020",
                ReferenceNo:"NIB/T/006/2018-2017",
                Status: "Published",
                EntityType:"State Corporation",
                TenderCategory:"Works",
                OpeningVenue:"Nile Basin Board Room,NIB,Lenana Road Hurlingham",
                OpeningDate:"25th-Sep-2020",
                OpeningTime:"12:00:00",
                OtherDetails:"TENDER  FOR REHABILITATION WORKS OF MBWALENI WATER PAN  PROJECT IN  KWALE COUNTY"
            },
                {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Closed Tender", EntityName:"Ministry of Tourism", ApplicationFee: "2000", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Closed" },
                {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Restricted Tender", EntityName:"KURA", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"KURA", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Closed" },
                {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"Ministry of Health", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"Ministry of Health", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"Ministry of Health", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"Ministry of Health", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"Ministry of Health", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"Ministry of Health", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"Ministry of Health", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
            ];

    }])
    .controller('DashboardCtrl', ['$rootScope', '$scope', 'DataService', '$localStorage', '$window', '$filter',
        function ($rootScope, $scope, DataService, $localStorage, $window, $filter) {

            $scope.ViewTender = function(Tender){
                $scope.Tender = Tender;
                $scope.ShowTenderView=true;
                console.log ("Published Tender")
            }
            $scope.OpenTender = function(){
                console.log ("Closed Tender")
            }

            $scope.Tenders =
                [{  TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER",
                    TenderType: "Open Tender",
                    EntityName:"National Irrigation Board",
                    ApplicationFee: "0",
                    PublishDate: "25th-July-2020",
                    CloseDate: "25th-Aug-2020",
                    ReferenceNo:"NIB/T/006/2018-2017",
                    Status: "Published",
                    EntityType:"State Corporation",
                    TenderCategory:"Works",
                    OpeningVenue:"Nile Basin Board Room,NIB,Lenana Road Hurlingham",
                    OpeningDate:"25th-Sep-2020",
                    OpeningTime:"12:00:00",
                    OtherDetails:"TENDER  FOR REHABILITATION WORKS OF MBWALENI WATER PAN  PROJECT IN  KWALE COUNTY"
                },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Closed Tender", EntityName:"National Irrigation Board", ApplicationFee: "2000", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Restricted Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                    {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
                ];

            // DASHBOARD CHARTS
            $scope.donutChart = Morris.Donut({
                element: 'pie-chart',
                data: [
                    {label: "Tenders completed", value: 23},
                    {label: "Ongoing Tenders", value: 6},
                    {label: "Total Tenders", value: 56}
                ]

            });
            // $scope.areaChart = Morris.Area({
            //     element: 'requests-area',
            //     parseTime: false,
            //     data: [],
            //     xkey: 'date',
            //     xLabelAngle: 20,
            //     ykeys: ['numRecords'],
            //     labels: ['Requests']
            // });
            $scope.barChart = Morris.Bar({
                element: 'bar-requests',
                data: [
                    { y: 'KURA', a: 100 },
                    { y: 'KENHA', a: 75 },
                    { y: 'BUSIA COUNTY', a: 50 },
                    { y: 'KILIFI COUNTY', a: 75 },
                    { y: 'NAIROBI COUNTY', a: 75 },
                    { y: 'KENGEN', a: 100 }
                ],
                xkey: 'y',
                ykeys: ['a'],
                xLabelAngle: 20,
                labels: ['Total Number'],
                barColors: function (row, series, type) {
                    // console.log("--> " + row.label, series, type);
                    if (row.label === "KURA")
                        return "#AD1D28";
                    else if (row.label === "KENHA")
                        return "#00AFD0";
                    else if (row.label === "KENGEN")
                        return "#4A9DCA";
                    else if (row.label === "NAIROBI COUNTY")
                        return "#00AD9A";
                    else if (row.label === "KILIFI COUNTY")
                        return "#F19332";
                    else if (row.label === "BUSIA COUNTY")
                        return "#75B749";
                }
            });

            // $scope.loadCurrencies();


            $scope.CashCollection = {};
            $scope.CashCollection.markUp = "";
            $scope.CashCollection.baseRate = "";
            $scope.CashCollection.meanRate = "";
            $scope.CashCollection.newRate = "";
            $scope.CashCollection.buyBeforeMarkUp = "";
            $scope.CashCollection.currencyISOB = "";


            $scope.CashCollection.smarkUp = "";
            $scope.CashCollection.sbaseRate = "";
            $scope.CashCollection.smeanRate = "";
            $scope.CashCollection.snewRate = "";
            $scope.CashCollection.sbuyBeforeMarkUp = "";
            $scope.CashCollection.currencyISOS = "";



            $scope.CollectionEntry = {};
            $scope.resetFilter = function () {
                $scope.CashCollection = {};
            };

            $scope.changedValue = function (selectedCurrency){
                console.log ("selected currency=====>", selectedCurrency)
            }



            $scope.loadCurrencies = function () {
                $scope.progressBar = $rootScope.showProgress();
                DataService.getCurrencies().then(function (response) {
                    console.log("CURRENCIES LOADED:=====>", response);
                    $scope.Currencies = response.data.data.content;
                    // $rootScope.setPaginationParams(response.data.data);
                    $scope.progressBar.close();
                }, function (error) {
                    console.log("Error", error);
                    // $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            };


            $scope.newBuyRate = function () {
                $scope.CashCollection.newRate = "";
                $scope.CashCollection.newRate = $scope.CashCollection.meanRate - ($scope.CashCollection.meanRate * ($scope.CashCollection.markUp / 100))
                console.log("New Rate===>", $scope.CashCollection.newRate);
            }


            $scope.snewBuyRate = function () {
                $scope.CashCollection.snewRate = "";
                $scope.CashCollection.snewRate = ($scope.CashCollection.smeanRate + ($scope.CashCollection.smeanRate * ($scope.CashCollection.smarkUp / 100)))
                console.log("New Rate===>", $scope.CashCollection.snewRate);
            }

            $scope.currencyChange = function () {
                $scope.OutletCurrencyAccounts = [];
                angular.forEach($scope.OutletAccounts, function (value, key) {
                    var currencyCode = value.currency ? value.currency.currencyCode : '';
                    if (currencyCode === $scope.CollectionEntry.Currency.currencyCode) {
                        console.log('OutletCurrencyAccount:', value);
                        $scope.OutletCurrencyAccounts.push(value);
                    }
                });
            };
            $scope.fetchCurrencies = function () {
                var currencies = [];
                angular.forEach($scope.Currencies, function (value, key) {
                    if ($scope.EnteredCurrencyCodes.indexOf(value.currencyCode) === -1) {
                        currencies.push(value);
                    } else if ($scope.CollectionEntry.hasOwnProperty('entryId')) {
                        if ($scope.CollectionEntry.Currency === value) {
                            currencies.push(value);
                        }
                    }
                });
                return currencies;
            };
            $scope.addCollectionEntry = function () {
                if (!$scope.CollectionEntry.amount || !$scope.CollectionEntry.OutletAccount) {
                    $rootScope.alertDialog('Fill in all the required fields!');
                    return;
                }

                if (!$scope.CollectionEntry.hasOwnProperty('entryId')) {
                    $scope.CollectionEntry.entryId = $scope.CashCollectionEntries.length + 1;
                    $scope.CashCollectionEntries.push($scope.CollectionEntry);
                    $scope.EnteredCurrencyCodes.push($scope.CollectionEntry.Currency.currencyCode);
                }
                $scope.closeAndclear(true);
            };
            $scope.editCollectionEntry = function (index) {
                $scope.CollectionEntryIndex = index;
                $scope.CollectionEntry = $scope.CashCollectionEntries[$scope.CollectionEntryIndex];
                $scope.OrigCollectionEntry = angular.copy($scope.CollectionEntry);
                $scope.currencyChange();
                $scope.showDlg();
            };
            $scope.removeCollectionEntry = function (index) {
                $scope.CashCollectionEntries.splice(index, 1);
                $scope.EnteredCurrencyCodes.splice(index, 1);
            };
            $scope.showDlg = function () {
                if (!$scope.CashCollection.CustomerOutlet) {
                    $rootScope.alertDialog('Please select an Outlet first!');
                } else {
                    $scope.ShowEntryDlg = true;
                }
            };
            $scope.closeAndclear = function (recordSaved) {
                if (!recordSaved && $scope.OrigCollectionEntry) {
                    $scope.CashCollectionEntries.push($scope.OrigCollectionEntry);
                    $scope.CashCollectionEntries.splice($scope.CollectionEntryIndex, 1);
                }
                delete $scope.OrigCollectionEntry;
                $scope.CollectionEntry = {};
                $scope.ShowEntryDlg = false;
            };
            $scope.searchCustomer = function (keyword) {
                var deferred = $q.defer();
                $timeout(function () {
                    var results = [];
                    DataService.searchCustomer(keyword, "Approved").then(function (dataArray) {
                        if (dataArray) {
                            results = dataArray.data.data.content;
                            deferred.resolve(results);
                        }
                    });
                }, 100);
                return deferred.promise;
            };
            $scope.loadCustomerOutlets = function (customerId) {
                $scope.progressBar = $rootScope.showProgress();
                DataService.getCustomerOutlets(customerId).then(function (response) {
                    console.log("Customer Outlets Data:", response.data.data);
                    $scope.CustomerOutlets = response.data.data.content;
                    //$scope.progressBar.close();
                    $scope.loadCurrencies();
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            };
            $scope.loadOutletAccounts = function (outletId) {
                $scope.progressBar = $rootScope.showProgress();
                DataService.getOutletAccountsByUser(outletId).then(function (response) {
                    console.log("Customer Accounts Data:", response.data);
                    $scope.OutletAccounts = response.data.data;
                    //$rootScope.setPaginationParams(response.data.data);
                    $scope.progressBar.close();
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            };

            $scope.loadCITAgents = function () {
                $scope.progressBar = $rootScope.showProgress();
                DataService.getCITAgents("Approved", $scope.CashCollection).then(function (response) {
                    console.log("Agents Data:", response.data.data);
                    $scope.CITAgents = response.data.data.content;
                    $rootScope.setPaginationParams(response.data.data);
                    $scope.progressBar.close();
                    $scope.ShowForwardDlg = true;
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            };
            $scope.submitOfflineRequest = function () {
                if (!$scope.OfflineCollectionForm.$valid) {
                    return;
                }

                if ($scope.CashCollectionEntries.length < 1) {
                    $rootScope.alertDialog('You must add atleast one Offline Cash Collection Transaction!');
                    return;
                }

                var OfflineCollectionRequest = {};
                OfflineCollectionRequest.outletId = $scope.CashCollection.CustomerOutlet.outletId;
                OfflineCollectionRequest.citAgentId = $scope.CashCollection.citAgentId;
                OfflineCollectionRequest.transactions = [];
                OfflineCollectionRequest.prefCollectionTime = $scope.CashCollection.prefCollectionTime.date;
                OfflineCollectionRequest.requestTime = $scope.CashCollection.requestTime.date;
                OfflineCollectionRequest.collectionTime = $scope.CashCollection.actCollectionTime.date;
                OfflineCollectionRequest.completionTime = $scope.CashCollection.requestTime.date;
                OfflineCollectionRequest.description = $scope.CashCollection.description ? $scope.CashCollection.description : "Offline Cash Collection Request";
//                    OfflineCollectionRequest.requestById = 1;
                OfflineCollectionRequest.totalValue = $scope.CashCollection.totalValue;
                OfflineCollectionRequest.vehicleQty = $scope.CashCollection.vehicleQty;
                angular.forEach($scope.CashCollectionEntries, function (value, key) {
                    var entry = {};
                    entry.accountNumber = value.OutletAccount.accountNumber;
                    entry.trxValue = value.amount;
                    entry.currencyCode = value.Currency.currencyCode;
                    entry.description = '';
                    OfflineCollectionRequest.transactions.push(entry);
                });
                console.log("Offline CashCollectionRequest:", angular.toJson(OfflineCollectionRequest));
                $scope.progressBar = $rootScope.showProgress();
                DataService.submitOfflineRequest(OfflineCollectionRequest).then(function (response) {
                    console.log("Offline CashCollectionRequest:", response.data.data);
                    $scope.progressBar.close();
                    $rootScope.notify('success', 'Success', "Offline Cash Collection Request successfully saved.");
                    $window.location = '#/CashCollectionRequests';
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        var errors = "";
                        if (error.data.data) {
                            errors = " [";
                            angular.forEach(error.data.data, function (value, key) {
                                errors = errors + value + ",";
                            });
                            errors = errors + "]";
                        }
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
                    }
                });
            };
            $scope.resetFilter();
        }])


    .controller('TenderListCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $timeout, $q) {


        $scope.ShowUserView = false;
        $scope.SystemUserForm = false;
        $scope.CurrentTab = 1;
        $scope.resetUsersFilter = function () {
            $scope.UserFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.UserFilter.dateFrom = startDate;
            $scope.UserFilter.dateTo = new Date();
            $scope.listUsers();
        };

        DataService.getUserTypes().then(function (response) {
            console.log("User Types Data:", response);
            $scope.UserTypes = response.data.data;
            console.log("usertype options", $scope.UserTypes);
            $scope.progressBar.close();
            $window.scrollTo(0, 0);
        }, function (error) {
            console.log("Error", error);
            $scope.progressBar.close();
            if (error.status === -1) {
                $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
            } else if (error.status === 401) {
                $rootScope.expiredToken();
            } else if (error.status === 403) {
                $rootScope.notify('error', 'Error', error.data.message);
                $window.location = '#/Error';
            } else {
                $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
            }
        });

        $scope.Tenders = [
            {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"National Irrigation Board", ApplicationFee: "0", PublishDate: "25th-July-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
            {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Closed Tender", EntityName:"Ministry of Tourism", ApplicationFee: "2000", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Closed" },
            {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Restricted Tender", EntityName:"KURA", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
            {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"KURA", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Closed" },
            {TenderTitle:"REHABILITATION WORKS OF MBWALENI WATER", TenderType: "Open Tender", EntityName:"Ministry of Health", ApplicationFee: "0", PublishDate: "25th-Aug-2020", CloseDate: "25th-Aug-2020", ReferenceNo:"NIB/T/006/2018-2017", Status: "Published" },
        ];


        $scope.listUsers = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getUsers("", $scope.UserFilter).then(function (response) {
                console.log("Users Data:", response.data.data);
                $scope.SystemUsers = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                //Scroll top of page
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.exportUsers = function (format) {
            DataService.exportUsers($scope.UserFilter, format);
        };
        $scope.loadDepartments = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getDepartments(true).then(function (response) {
                console.log("Departments Data:", response.data.data);
                $scope.Departments = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadUserRoles = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getRoles("", $scope.UserFilter).then(function (response) {
                console.log("users assigned roles", response.data.data.content)
                $scope.UserRoles = response.data.data.content;
                $scope.progressBar.close();
                var userRoleIds = [];
                angular.forEach($scope.SystemUser.cmsUserRoleMapList, function (userRole, key) {
                    userRoleIds.push(userRole.roleId.roleId);
                });
                $scope.UnassignedRoles = [];
                angular.forEach($scope.UserRoles, function (userRole, key) {
                    if (userRoleIds.indexOf(userRole.roleId) === -1) {
                        $scope.UnassignedRoles.push(userRole);
                    }
                });
                //console.log("UnassignedRoles:", $scope.UnassignedRoles);
                $scope.ShowAssignRole = true;
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.saveSystemUser = function () {
            if (!$scope.UserViewForm.createUser.$valid) {
                return;
            }
            var roleids = [];
            angular.forEach($scope.Roles, function (role, key) {
                if (role.isChecked) {
                    roleids.push(role.roleId);
                }
            });
            console.log("role length", roleids.length)
            if (roleids.length < 1) {
                $rootScope.notify('warning', 'Warning', "Please select atleast one role");
                return;
            }
            var SystemUserUpdate = {};
            SystemUserUpdate.fullName = $scope.SystemUser.fullName;
            SystemUserUpdate.userType = $scope.SystemUser.userType === 'Bank User' ? 'Bank Operator' : $scope.SystemUser.userType;
            SystemUserUpdate.msisdn = $scope.SystemUser.msisdn;
            SystemUserUpdate.emailAddress = $scope.SystemUser.emailAddress;
            SystemUserUpdate.roleIds = roleids;
            if ($scope.SystemUser.departmentId) {
                SystemUserUpdate.departmentId = $scope.SystemUser.departmentId;
            }
            if ($scope.SystemUser.userId) {
                SystemUserUpdate.userId = $scope.SystemUser.userId;
            }
            if ($scope.SystemUser.citAgentId) {
                SystemUserUpdate.citAgentId = $scope.SystemUser.citAgentId;
            }
            if ($scope.SystemUser.customerId) {
                SystemUserUpdate.customerId = $scope.SystemUser.customerId;
            }
            console.log("SystemUser:", angular.toJson(SystemUserUpdate));
            $scope.progressBar = $rootScope.showProgress();
            DataService.saveUser(SystemUserUpdate).then(function (response) {
                console.log("User creation resp:", response.data.data);
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', $scope.SystemUser.userId !== undefined ? "System User successfully updated." : "System User successfully created.");
                $scope.switchTab('Main');
                $scope.listUsers();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    var errors = "";
                    if (error.data.data) {
                        errors = " [";
                        angular.forEach(error.data.data, function (value, key) {
                            errors = errors + value + ",";
                        });
                        errors = errors + "]";
                    }
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
                }
            });
        };
        $scope.viewUser = function (SystemUser, editMode) {
            if ($localStorage.loggedInUser.userId === SystemUser.userId) {
                $rootScope.notify('error', 'Error', "Unable to edit currently logged in user");
                return;
            } else {
                SystemUser.editMode = editMode;
                $scope.SystemUser = SystemUser;
                $scope.SystemUser.userType = $scope.SystemUser.userType === 'Bank Operator' ? 'Bank User' : $scope.SystemUser.userType;
                $scope.ShowUserView = true;
                if ($scope.SystemUser.editMode && $scope.SystemUser.userType === 'Bank User') {
                    $scope.loadDepartments();
                }
                var assignedRoles = [];
                angular.forEach($scope.SystemUser.cmsUserRoleMapList, function (value, key) {
                    assignedRoles.push(value.role.roleId);
                });
//                    $scope.progressBar = $rootScope.showProgress();
                DataService.getRoles("", "").then(function (response) {
                    console.log("All Roles Data:", response.data.data);
//                        $scope.progressBar.close();
                    $scope.Roles = response.data.data.content;
                    angular.forEach($scope.Roles, function (role, key) {

                        if (assignedRoles.indexOf(role.roleId) > -1) {
                            role.isChecked = true;
                        }

                    });
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            }
        };
//
        $scope.removeRole = function (index, UserRole) {
            var roleIds = [];
            roleIds.push(UserRole.role.roleId);
            $scope.SystemUser.roleIds = roleIds;
//                    $scope.SystemUser.roleIds = $scope.SystemUser.cmsUserRoleMapList.roleId;

            $scope.SystemUser.roleIds.splice(index, 1);
            console.log($scope.SystemUser.roleIds);
        };
        $scope.assignUserRole = function (postData) {
//                    if (postData) {
            var roleIds = [];
            angular.forEach($scope.UnassignedRoles, function (userRole, key) {
                if (userRole.isChecked) {
                    roleIds.push(userRole.roleId);
                }
            });
            $scope.SystemUser.roleIds = roleIds;
//                        $scope.progressBar = $rootScope.showProgress();
//                        DataService.assignUserRoles($scope.SystemUser, $scope.UserFilter).then(function (response) {
//                            console.log("Assgin User Roles resp:", response.data.data);
//                            $scope.progressBar.close();
//                            $scope.ShowAssignRole = false;
//                            $rootScope.notify('success', 'Success', "User Role(s) successfully assigned to user.");
//                            $scope.switchTab('Main');
//                            $scope.listUsers();
//                        }, function (error) {
//                            console.log("Error", error);
//                            $scope.progressBar.close();
//                            if (error.status === -1) {
//                                $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
//                            } else if (error.status === 401) {
//                                $rootScope.expiredToken();
//                            } else if (error.status === 403) {
//                                $rootScope.notify('error', 'Error', error.data.message);
//                                $window.location = '#/Error';
//                            } else {
//                                $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
//                            }
//                        });
//                    } else {
            $scope.loadUserRoles();
//                    }
        };
        $scope.switchTab = function (tabName) {

            if (tabName === 'Main') {
                $scope.ShowUserView = false;
            } else {
                $scope.ShowUserView = true;
            }
        };
        $scope.loadUserAuditLog = function (reset, outputFormat) {
            if (reset) {
                $scope.AuditFilter = {};
                var startDate = new Date();
                startDate.setDate(1);
                $scope.AuditFilter.dateFrom = startDate;
                $scope.AuditFilter.dateTo = new Date();
            }
            $scope.progressBar = $rootScope.showProgress();
            DataService.getAuditTrails($scope.AuditFilter, outputFormat, $scope.SystemUser.userId, "").then(function (response) {
                console.log("Audit trail:", response.data.data.content);
                $scope.progressBar.close();
                $scope.AuditTrail = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        }

        $scope.navigateTab = function (tabId) {
            $scope.CurrentTab = tabId;
            switch ($scope.CurrentTab) {
                case 1:
                    //$scope.loadUserRoles();
                    break;
                case 2:
                    $scope.loadUserAuditLog(true);
                    break;
            }
        };
        $scope.closeDlg = function () {
            $scope.ShowAssignRole = false;
        };
        //delete
        $scope.deleteSystemUser = function (SystemUser) {
            $scope.SystemUserForm = true;
            $scope.SystemUser = SystemUser;
            console.log("SystemUser", SystemUser)
        };
        $scope.closePopup = function () {
            $scope.SystemUserForm = false;
        };
        $scope.regionData = {};
        $scope.deleteSystemUsers = function () {
            if (!$scope.DeleteSystemUserForm.$valid) {
                return;
            }

            var ids = [];
            ids.push($scope.SystemUser.userId);
            var deleteSystemUserData = {};
            deleteSystemUserData.ids = ids;
            deleteSystemUserData.notes = $scope.SystemUser.notes;
            console.log(deleteSystemUserData);
            $scope.progressBar = $rootScope.showProgress();
            DataService.deleteUSER(deleteSystemUserData).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.SystemUser.fullName + ' successfully Deleted');
                $scope.progressBar.close();
                $scope.SystemUserForm = false;
                $scope.listUsers();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        //lock/unlock
        $scope.lockSystemUsers = function (SystemUser) {
            $scope.LockSystemUserForm = true;
            $scope.SystemUser = SystemUser;
            console.log("SystemUser", SystemUser)
        };
        $scope.lockUsers = function () {
            if (!$scope.LockSystemUserForms.$valid) {
                return;
            }

            var ids = [];
            ids.push($scope.SystemUser.userId);
            var lockSystemUserData = {};
            lockSystemUserData.ids = ids;
            lockSystemUserData.notes = $scope.SystemUser.notes;
            console.log(lockSystemUserData);
            $scope.progressBar = $rootScope.showProgress();
            console.log($scope.SystemUser.passwordStatus)
            DataService.lockUSER(lockSystemUserData, $scope.SystemUser.passwordStatus).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.SystemUser.fullName + ' successfully Actioned');
                $scope.progressBar.close();
                $scope.LockSystemUserForm = false;
                $scope.listUsers();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        //deactivate/activate
        $scope.deactivateSystemUser = function (SystemUser) {
            $scope.deactivateSystemUserForm = true;
            $scope.SystemUser = SystemUser;
            console.log("SystemUser", SystemUser)
        };
        $scope.deactivateUsers = function () {
            if (!$scope.deactivateSysUserForms.$valid) {
                return;
            }

            var ids = [];
            ids.push($scope.SystemUser.userId);
            var deactivateSystemUserData = {};
            deactivateSystemUserData.ids = ids;
            deactivateSystemUserData.notes = $scope.SystemUser.notes;
            console.log(deactivateSystemUserData);
            $scope.progressBar = $rootScope.showProgress();
            console.log($scope.SystemUser.status)
            DataService.deactivateUSER(deactivateSystemUserData, $scope.SystemUser.status).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.SystemUser.fullName + ' successfully Actioned');
                $scope.progressBar.close();
                $scope.deactivateSystemUserForm = false;
                $scope.listUsers();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.resetUsersFilter();
    }])


    .controller('MTemplateCtrl', ['$rootScope', '$scope', 'DataService', '$localStorage', '$window', '$dialogConfirm', '$filter', function ($rootScope, $scope, DataService, $localStorage, $window, $dialogConfirm, $filter) {

        $scope.templateView = function () {
            $scope.ShowTemplateView = false;
        };
//
        $scope.loadMessagesTemplate = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getMessageTemplate().then(function (response) {
                console.log("Message Report Data:", response.data.data.content);
                $scope.messageTemplates = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.edit = function (templates) {
            $scope.email = true;
            $scope.sms = true;
            $scope.ShowTemplate = true;
            console.log("here");
            $scope.templates = templates;
            if (templates.emailTemplate === "") {
                $scope.email = false;
            } else if (templates.smsTemplate === "") {
                $scope.sms = false;
            }

        };
        $scope.saveTemplate = function () {
            if (!$scope.TemplateForm.$valid) {
                return;
            }

            $scope.tmp = {};
            $scope.tmp.templateId = $scope.templates.templateId;
            $scope.tmp.emailTemplate = $scope.templates.emailTemplate;
            $scope.tmp.smsTemplate = $scope.templates.smsTemplate;
            $scope.progressBar = $rootScope.showProgress();
            DataService.saveMTemplate($scope.tmp).then(function (response) {
                console.log("Resp:", response.data);
                $scope.tmp = {};
                $scope.progressBar.close();
                $scope.ShowTemplate = false;
                $rootScope.notify('success', 'Success', "Template successfully updated");
                $scope.loadMessagesTemplate();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadMessagesTemplate();
    }])


    .controller('ATemplateCtrl', ['$rootScope', '$scope', 'DataService', '$localStorage', '$window', '$dialogConfirm', '$filter', function ($rootScope, $scope, DataService, $localStorage, $window, $dialogConfirm, $filter) {
        $scope.TemplateApproval = {action: "approved"};
        $scope.ShowChanges = function (template) {
            $scope.ShowChange = true;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getTemplateChanges(template.templateId).then(function (response) {
                console.log("Change Resp:", response.data.data);
                $scope.changes = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadUnapprovedTemplate = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getMessageTemplate('Unapproved').then(function (response) {
                console.log("Message Report Data:", response.data.data.content);
                $scope.messageTemplates = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.approveTemplate = function () {
            if (!$scope.TempaltesApprovalForm.$valid) {
                return;
            }

            var templateId = [];
            for (var i = 0; i < $scope.messageTemplates.length; i++) {
                if ($scope.messageTemplates[i].isChecked) {
                    templateId.push($scope.messageTemplates[i].templateId);
                }
            }

            if (templateId.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.TemplateApproval.ids = templateId;
                var TemplateApprovaldata = {};
                TemplateApprovaldata.ids = templateId;
                TemplateApprovaldata.notes = $scope.TemplateApproval.notes;
                DataService.approveTemplate(TemplateApprovaldata, $scope.TemplateApproval.action).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + templateId.length + ") Template successfully " + $scope.TemplateApproval.action + ".");
                        $scope.TemplateApproval.notes = "";
                        $scope.progressBar.close();
                        $scope.loadUnapprovedTemplate();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.messageTemplates.length; i++) {
                if (!$scope.messageTemplates[i].isChecked) {
                    $scope.messageTemplates.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.messageTemplates.allItemsSelected = true;
        };
        $scope.checkAll = function () {
            for (var i = 0; i < $scope.messageTemplates.length; i++) {
                $scope.messageTemplates[i].isChecked = $scope.messageTemplates.allItemsSelected;
            }
        };
        $scope.loadUnapprovedTemplate();
    }])
    .controller('CustomerCtrl', ['$rootScope', '$scope', 'DataService', '$localStorage', '$window', '$dialogConfirm', '$filter', function ($rootScope, $scope, DataService, $localStorage, $window, $dialogConfirm, $filter) {
        $scope.LinkCustAcc = {search: ''};
        $scope.BankCustomer = {search: ''};
        $scope.searchPrincipal = function (clear) {

            if (clear) {
                $dialogConfirm("Please note that all the data captured so far will be cleared. Are you sure that you want to clear?").then(function () {
                    $scope.BankCustomer = {search: ''};
                    $scope.clearCustomer(false);
                }, function () {
                    return;
                });
            } else {
                if (!$scope.BankCustomer.search) {
                    return;
                }
                if ($scope.PrincipalCustomer.CustomerOutlets.length > 0) {
                    $dialogConfirm("Please note that by searching again all the data captured so far will be cleared! Do you want to continue?").then(function () {
                        $scope.searchAccount(true);
                    }, function () {
                        return;
                    });
                } else {
                    $scope.searchAccount(true);
                }
            }
        };
        $scope.searchAccount = function (isPrincipal) {
            var searchInput = '';
            $scope.isPrincipal = isPrincipal;
            if ($scope.isPrincipal) {
                searchInput = $scope.BankCustomer.search;
            } else {
                if (!$scope.LinkAccForm.$valid) {
                    return;
                }
                searchInput = $scope.LinkCustAcc.search;
            }

            $scope.progressBar = $rootScope.showProgress();
            DataService.getSearchCustAccount(searchInput).then(function (response) {
                console.log("Resp:", angular.toJson(response.data.data));
                $scope.progressBar.close();
                /* Remember to check for account not found && Duplicate accounts*/
                if (response.data.data) {
                    $scope.LinkCustAcc = response.data.data;
                    $scope.LinkCustAcc.search = searchInput;
                    if ($scope.isPrincipal) {
                        $scope.ShowLinkAcc = true;
                    }
                } else {
                    $rootScope.notify('info', 'Information', 'Account not found');
                }
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.principalAccountOK = function () {
            if ($scope.LinkCustAcc.hasOwnProperty('accountNumber')) {
                $scope.clearCustomer(false); //Reset principal
                $scope.PrincipalCustomer.customerName = $scope.LinkCustAcc.accountName;
                $scope.PrincipalCustomer.postalAddress = $scope.LinkCustAcc.postalAddress ? $scope.LinkCustAcc.postalAddress : 'N/A';
                $scope.CustomerAccounts.push($scope.LinkCustAcc);
                $scope.closeAndclear();
            }
        };
        $scope.addOutlet = function () {
            if (!$scope.OutletForm.$valid) {
                return;
            }

            $scope.CustOutlet.outletName = $filter('sentenceCase')($scope.CustOutlet.outletName);
            $scope.CustOutlet.physicalAddress = $filter('sentenceCase')($scope.CustOutlet.physicalAddress);
            var outletAccounts = [];
            for (var i = 0; i < $scope.CustomerAccounts.length; i++) {
                if ($scope.CustomerAccounts[i].isChecked) {
                    outletAccounts.push($scope.CustomerAccounts[i]);
                }
            }
            $scope.CustOutlet.accounts = outletAccounts;
            if (outletAccounts.length < 1) {
                $scope.checkAccountError = true;
                return;
            }

            if (!$scope.CustOutlet.hasOwnProperty('outletId')) {
                var OutletContacts = [];
                $scope.CustOutlet.OutletContacts = OutletContacts;
                $scope.CustOutlet.outletId = $scope.CustomerOutlets.length + 1;
                $scope.CustomerOutlets.push($scope.CustOutlet);
            }
            $scope.closeAndclear(true);
        };
        $scope.editOutlet = function (index) {
            $scope.CustOutlet = $scope.CustomerOutlets[index];
            $scope.OrigCustOutlet = angular.copy($scope.CustOutlet);
            $scope.OrigCustOutlet.index = index;
            for (var i = 0; i < $scope.CustomerAccounts.length; i++) {
                console.log("Account Exists:", $scope.CustOutlet.accounts.map(function (e) {
                    return e.accountNumber;
                }).indexOf($scope.CustomerAccounts[i].accountNumber));
                $scope.CustomerAccounts[i].isChecked = $scope.CustOutlet.accounts.map(function (e) {
                    return e.accountNumber;
                }).indexOf($scope.CustomerAccounts[i].accountNumber) > -1 ? true : false;
            }
            $scope.showDlg();
        };
        $scope.addContact = function () {
            if (!$scope.OutletContactForm.$valid) {
                return;
            }

            $scope.OutletContact.fullName = $filter('sentenceCase')($scope.OutletContact.fullName);
            //$scope.OutletContact.msisdn = (/^07/.test($scope.OutletContact.msisdn)) ? "2547"+$scope.OutletContact.msisdn.substring(1) : $scope.OutletContact.msisdn;
            var contactAccounts = [];
            for (var i = 0; i < $scope.CustOutlet.accounts.length; i++) {
                if ($scope.CustOutlet.accounts[i].isChecked) {
                    contactAccounts.push($scope.CustOutlet.accounts[i]);
                }
            }
            if (contactAccounts.length < 1) {
                $scope.checkAccountError = true;
                return;
            }
            $scope.OutletContact.accounts = contactAccounts;
            if (!$scope.OutletContact.hasOwnProperty('contactId')) {
                $scope.OutletContact.contactId = $scope.CustOutlet.OutletContacts.length + 1;
                $scope.CustOutlet.OutletContacts.push($scope.OutletContact);
            }
            $scope.closeAndclear(true);
        };
        $scope.editOutletContact = function (index, parentIndex) {
            $scope.CustOutlet = $scope.CustomerOutlets[parentIndex];
            $scope.OutletContact = $scope.CustOutlet.OutletContacts[index];
            $scope.OrigOutletContact = angular.copy($scope.OutletContact);
            $scope.OrigOutletContact.index = index;
            for (var i = 0; i < $scope.CustOutlet.accounts.length; i++) {
                $scope.CustOutlet.accounts[i].isChecked = $scope.OutletContact.accounts.map(function (e) {
                    return e.accountNumber;
                }).indexOf($scope.CustOutlet.accounts[i].accountNumber) > -1 ? true : false;
            }
            $scope.showDlg($scope.CustOutlet);
        };
        $scope.linkAccount = function () {
            if ($scope.LinkCustAcc.hasOwnProperty('accountNumber')) {
                if ($scope.CustomerAccounts.map(function (e) {
                    return e.accountNumber;
                }).indexOf($scope.LinkCustAcc.accountNumber) > -1) {
                    $rootScope.notify('error', 'Error', 'This account already exists!');
                } else {
                    $scope.CustomerAccounts.push($scope.LinkCustAcc);
                }
                $scope.closeAndclear();
            }
        };
        $scope.removeItem = function (index, parentIndex) {
            switch ($scope.CurrentStep) {
                case 1:
                    if ($scope.CustomerOutlets.length > 0) {//Remove Account on Outlets
                        for (var i = 0; i < $scope.CustomerOutlets.length; i++) {
                            var accIndex = $scope.CustomerOutlets[i].accounts.map(function (e) {
                                return e.accountNumber;
                            }).indexOf($scope.CustomerAccounts[index].accountNumber);
                            if (accIndex > -1) {
                                $scope.CustomerOutlets[i].accounts.splice(accIndex, 1);
                                if ($scope.CustomerOutlets[i].OutletContacts.length > 0) {//Remove Outlet Account on Contacts
                                    for (var j = 0; j < $scope.CustomerOutlets[i].OutletContacts.length; j++) {
                                        var contactAccIndex = $scope.CustomerOutlets[i].OutletContacts[j].accounts.map(function (e) {
                                            return e.accountNumber;
                                        }).indexOf($scope.CustomerAccounts[index].accountNumber);
                                        if (contactAccIndex > -1) {
                                            $scope.CustomerOutlets[i].OutletContacts[j].accounts.splice(contactAccIndex, 1);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    $scope.CustomerAccounts.splice(index, 1);
                    break;
                case 2:
                    $scope.CustomerOutlets.splice(index, 1);
                    break;
                case 3:
                    $scope.CustomerOutlets[parentIndex].OutletContacts.splice(index, 1);
                    break;
            }
        };
        $scope.showDlg = function (CustOutlet) {
            switch ($scope.CurrentStep) {
                case 1:
                    $scope.ShowLinkAcc = true;
                    $scope.isPrincipal = false;
                    break;
                case 2:
                    $scope.ShowOutlet = true;
                    $scope.checkAccountError = false;
                    break;
                case 3:
                    $scope.ShowContact = true;
                    $scope.CustOutlet = CustOutlet;
                    $scope.checkAccountError = false;
                    break;
            }
        };
        $scope.closeAndclear = function (recordSaved) {
            switch ($scope.CurrentStep) {
                case 1:
                    $scope.ShowLinkAcc = false;
                    $scope.LinkCustAcc = {};
                    break;
                case 2:
                    $scope.ShowOutlet = false;
                    if (!recordSaved && $scope.OrigCustOutlet) {
                        var index = $scope.OrigCustOutlet.index;
                        delete $scope.OrigCustOutlet.index;
                        $scope.CustomerOutlets.push($scope.OrigCustOutlet);
                        $scope.CustomerOutlets.splice(index, 1);
                    }
                    delete $scope.OrigCustOutlet;
                    $scope.CustOutlet = {};
                    for (var i = 0; i < $scope.CustomerAccounts.length; i++) {
                        $scope.CustomerAccounts[i].isChecked = false;
                    }
                    break;
                case 3:
                    $scope.ShowContact = false;
                    if (!recordSaved && $scope.OrigOutletContact) {
                        var index = $scope.OrigOutletContact.index;
                        delete $scope.OrigOutletContact.index;
                        $scope.CustOutlet.OutletContacts.push($scope.OrigOutletContact);
                        $scope.CustOutlet.OutletContacts.splice(index, 1);
                    }
                    delete $scope.OrigOutletContact;
                    $scope.OutletContact = {};
                    for (var i = 0; i < $scope.CustOutlet.accounts.length; i++) {
                        $scope.CustOutlet.accounts[i].isChecked = false;
                    }
                    break;
            }
        };
        $scope.proceedNextStep = function () {

            switch ($scope.CurrentStep) {
                case 1:
                    if (!$scope.PrincipalCustomerForm.$valid) {
                        $rootScope.notify('warning', 'Warning', 'Enter the physical location')
                        return;
                    }
                    if ($scope.CustomerAccounts.length > 0) {
                        $scope.PrincipalCustomer.CustomerAccounts = $scope.CustomerAccounts;
                        $localStorage.CustOnboarding = $scope.PrincipalCustomer;
                    } else {
                        $rootScope.alertDialog('You must add atleast one Account to proceed!');
                        return;
                    }
                    break;
                case 2:
                    if ($scope.CustomerOutlets.length > 0) {
                        $scope.PrincipalCustomer.CustomerOutlets = $scope.CustomerOutlets;
                        $localStorage.CustOnboarding = $scope.PrincipalCustomer;
                    } else {
                        $rootScope.alertDialog('You must add atleast one Outlet to proceed!');
                        return;
                    }
                    break;
                case 3:
                    var CustomerContactsEmail = [];
                    $scope.CustomerContacts = [];
                    for (var i = 0; i < $scope.CustomerOutlets.length; i++) {
                        var OutletContacts = $scope.CustomerOutlets[i].OutletContacts;
                        for (var j = 0; j < OutletContacts.length; j++) {
                            if (CustomerContactsEmail.indexOf(OutletContacts[j].emailAddress) === -1) {
                                CustomerContactsEmail.push(OutletContacts[j].emailAddress);
                                $scope.CustomerContacts.push(OutletContacts[j]);
                            }
                        }
                    }
                    if ($scope.CustomerContacts.length > 0) {
                        $scope.PrincipalCustomer.CustomerOutlets = $scope.CustomerOutlets;
                        $scope.PrincipalCustomer.CustomerContacts = $scope.CustomerContacts;
                        $localStorage.CustOnboarding = $scope.PrincipalCustomer;
                    } else {
                        $rootScope.alertDialog('You must add contacts to Outlets to proceed!');
                        return;
                    }
                    break;
            }
            $scope.CurrentStep += 1;
            $scope.HighestLevel = $scope.HighestLevel > $scope.CurrentStep ? $scope.HighestLevel : $scope.CurrentStep;
            $scope.PrincipalCustomer.CurrentStep = $scope.CurrentStep;
            $scope.PrincipalCustomer.HighestLevel = $scope.HighestLevel;
            $localStorage.CustOnboarding = $scope.PrincipalCustomer;
            $window.scrollTo(0, 0);
        };
        $scope.navigatePreviousStep = function () {
            $scope.CurrentStep -= 1;
            $scope.PrincipalCustomer.CurrentStep = $scope.CurrentStep;
            $localStorage.CustOnboarding = $scope.PrincipalCustomer;
            $window.scrollTo(0, 0);
        };
        $scope.navigatetoTab = function (tabId) {
            console.log("Navigate to:", tabId);
            $scope.CurrentStep = tabId;
            $scope.PrincipalCustomer.CurrentStep = $scope.CurrentStep;
            $localStorage.CustOnboarding = $scope.PrincipalCustomer;
            $window.scrollTo(0, 0);
        };
        $scope.saveCustomer = function () {
            $scope.Customer = {};
            $scope.Customer.customerName = $scope.PrincipalCustomer.customerName;
            $scope.Customer.postalAddress = $scope.PrincipalCustomer.postalAddress;
            $scope.Customer.physicalAddress = $scope.PrincipalCustomer.physicalAddress;
            $scope.Customer.custCategoryId = $scope.PrincipalCustomer.custCategoryId;
            $scope.Customer.accountReference = [];
            angular.forEach($scope.PrincipalCustomer.CustomerAccounts, function (value, key) {
                $scope.Customer.accountReference.push(value.accountNumber);
            });
            $scope.Customer.outlets = [];
            angular.forEach($scope.PrincipalCustomer.CustomerOutlets, function (value, key) {
                var outlet = {};
                outlet.outletName = value.outletName;
                outlet.physicalAddress = value.physicalAddress;
                outlet.accountRefs = [];
                angular.forEach(value.accounts, function (value, key) {
                    outlet.accountRefs.push(value.accountNumber);
                });
                outlet.contacts = [];
                angular.forEach(value.OutletContacts, function (value, key) {
                    var outletContact = {};
                    outletContact.contactEmail = value.emailAddress;
                    outletContact.accountRefs = [];
                    angular.forEach(value.accounts, function (value, key) {
                        outletContact.accountRefs.push(value.accountNumber);
                    });
                    outlet.contacts.push(outletContact);
                });
                $scope.Customer.outlets.push(outlet);
            });
            $scope.Customer.contacts = [];
            angular.forEach($scope.PrincipalCustomer.CustomerContacts, function (value, key) {
                var contact = {};
                contact.fullName = value.fullName;
                contact.emailAddress = value.emailAddress;
                contact.msisdn = value.msisdn;
                $scope.Customer.contacts.push(contact);
            });
            console.log("Final Customer:", angular.toJson($scope.Customer));
            $scope.progressBar = $rootScope.showProgress();
            DataService.savePrincipalCustomer($scope.Customer).then(function (response) {
                console.log("Customer Onboarding resp:", response.data.data);
                $scope.progressBar.close();
                $scope.PrincipalCustomer = {};
                delete $localStorage.CustOnboarding;
                $rootScope.notify('success', 'Success', "Customer On-boarding successfully completed.");
                $window.location = '#/Customers';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    var errors = "";
                    if (error.data.data) {
                        errors = " [";
                        angular.forEach(error.data.data, function (value, key) {
                            errors = errors + value + ",";
                        });
                        errors = errors + "]";
                    }
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
                }
            });
        };
        $scope.loadCustomerCategories = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerCategories(true, ["Approved", "Rejected"]).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.CustomerCategories = response.data.data.content;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.clearCustomer = function (reloadCategories) {
            $scope.CustomerAccounts = [];
            $scope.CustomerOutlets = [];
            $scope.CustomerContacts = [];
            $scope.PrincipalCustomer = {};
            $scope.PrincipalCustomer.customerName = null;
            $scope.PrincipalCustomer.postalAddress = null;
            $scope.PrincipalCustomer.physicalAddress = null;
            $scope.PrincipalCustomer.custCategoryId = null;
            $scope.PrincipalCustomer.CustomerAccounts = $scope.CustomerAccounts;
            $scope.PrincipalCustomer.CustomerOutlets = $scope.CustomerOutlets;
            $scope.PrincipalCustomer.CustomerContacts = $scope.CustomerContacts;
            $scope.CurrentStep = 1;
            $scope.HighestLevel = 1;
            $scope.PrincipalCustomer.CurrentStep = $scope.CurrentStep;
            if (reloadCategories) {
                $scope.loadCustomerCategories();
            }
            $scope.PrincipalCustomer.CustomerCategories = $scope.CustomerCategories;
            $localStorage.CustOnboarding = $scope.PrincipalCustomer;
        };
        if (!$localStorage.hasOwnProperty('CustOnboarding')) { //If starting customer onboarding
            $scope.clearCustomer(true);
        } else {
            console.log("$localStorage.CustOnboarding", $localStorage.CustOnboarding);
            $scope.PrincipalCustomer = $localStorage.CustOnboarding;
            $scope.CustomerAccounts = $scope.PrincipalCustomer.CustomerAccounts;
            $scope.CustomerOutlets = $scope.PrincipalCustomer.CustomerOutlets;
            $scope.CustomerContacts = $scope.PrincipalCustomer.CustomerContacts;
            $scope.CurrentStep = $scope.PrincipalCustomer.CurrentStep;
            $scope.HighestLevel = $scope.PrincipalCustomer.HighestLevel;
            $scope.loadCustomerCategories();
        }

    }])
    .controller('ApproveCustomerCtrl', ['$rootScope', '$scope', 'DataService', '$window', function ($rootScope, $scope, DataService, $window) {
        $scope.CustomerApproval = {action: "approved"};
        $scope.resetCustomerFilter = function () {
            $scope.CustomerFilter = {};
            var startDate = new Date();
            startDate.setYear(2000);
//                    $scope.CustomerFilter.dateFrom = startDate;
//                    $scope.CustomerFilter.dateTo = new Date();
            $scope.CustomerFilter.dateFrom = "";
            $scope.CustomerFilter.dateTo = "";
            $scope.listUnapprovedCustomers();
        }

        $scope.ShowChanges = function (PrincipalCustomer) {
            $scope.ShowChange = true;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerChanges(PrincipalCustomer.customerId).then(function (response) {
                console.log("Change Resp:", response.data.data);
                $scope.changes = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.DownloadReport = function (outputFormat) {
            DataService.getCustomerListDoc("Unapproved", $scope.CustomerFilter, outputFormat);
        }
        $scope.listUnapprovedCustomers = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomers('Unapproved', $scope.CustomerFilter).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.UnapprovedCustomers = response.data.data.content;
                $scope.UnapprovedCustomers.allItemsSelected = false;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.approveCustomers = function () {
            if (!$scope.CustomerApprovalForm.$valid) {
                return;
            }

            var CustomerIds = [];
            for (var i = 0; i < $scope.UnapprovedCustomers.length; i++) {
                if ($scope.UnapprovedCustomers[i].isChecked) {
                    CustomerIds.push($scope.UnapprovedCustomers[i].customerId);
                }
            }

            if (CustomerIds.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.CustomerApproval.ids = CustomerIds;
                var CustomerApprovaldata = {};
                CustomerApprovaldata.ids = CustomerIds;
                CustomerApprovaldata.notes = $scope.CustomerApproval.notes;
                DataService.approveCustomers(CustomerApprovaldata, $scope.CustomerApproval.action).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + CustomerIds.length + ") Customers successfully " + $scope.CustomerApproval.action + ".");
                        $scope.CustomerApproval.notes = "";
                        $scope.progressBar.close();
                        $scope.listUnapprovedCustomers();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnapprovedCustomers.length; i++) {
                if (!$scope.UnapprovedCustomers[i].isChecked) {
                    $scope.UnapprovedCustomers.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnapprovedCustomers.allItemsSelected = true;
        };
        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnapprovedCustomers.length; i++) {
                $scope.UnapprovedCustomers[i].isChecked = $scope.UnapprovedCustomers.allItemsSelected;
            }
        };
        $scope.resetCustomerFilter();
    }])
    .controller('ListCustomerCtrl', ["$filter", '$rootScope', '$scope', 'DataService', '$window', '$localStorage', function ($filter, $rootScope, $scope, DataService, $window, $localStorage) {

        $scope.outletChange = function (outletId) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.fetchOutletAccounts(outletId).then(function (response) {
                $scope.progressBar.close();
                $scope.OutletAccounts = response.data.data.content;
                $scope.viewOutletAccounts = true;
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.ShowCustomerView = false;
        $scope.CurrentTab = 1;
        $scope.ContactApproval = {action: "approved"};
        $scope.DownloadReport = function (outputFormat) {
            DataService.getCustomerListDoc("", $scope.CustomerFilter, outputFormat);
        }

        $scope.loadCustomerList = function () {
            $scope.CustomerFilter = {};
            $scope.CustomerFilter.dateFrom = "";
            $scope.CustomerFilter.dateTo = "";
            $scope.CustomerFilter.custCategoryId = "";
            $scope.CustomerFilter.subscriptionStatus = "";
            $scope.CustomerFilter.approvalStatus = "";
            $scope.listCustomers();
        }

        $scope.resetCustomerFilter = function () {
            $scope.CustomerFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.CustomerFilter.dateFrom = startDate;
            $scope.CustomerFilter.dateTo = new Date();
            $scope.loadCustomerList();
        };
        $scope.loadCustomerAccounts = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerAccounts($scope.PrincipalCustomer.customerId).then(function (response) {
                console.log("Customer Accounts Data:", response.data);
                $scope.CustomerAccounts = response.data.data;
                //$rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.delinkAccount = function () {

        }

        $scope.loadCustomerOutlets = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerOutlets($scope.PrincipalCustomer.customerId).then(function (response) {
                console.log("Customer Outlets Data:", response.data.data.content);
                $scope.CustomerOutlets = response.data.data.content; //.content;
                //$rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.navCustomerOutlet = function () {
            $scope.ShowOutlet = true;
        };
        /**
         * Used to process create new outlet request
         */
        $scope.addOutlet = function (customerId, outletForm, newOutlet) {
            console.debug("Customer outlet : ", outletForm);
            if (!outletForm.$valid) {
                return;
            }
            newOutlet.outletName = $filter('sentenceCase')(newOutlet.outletName);
            newOutlet.physicalAddress = $filter('sentenceCase')(newOutlet.physicalAddress);
            newOutlet.customerId = customerId;
//                    var outletAccounts = [];
//                    for (var i = 0; i < $scope.CustomerAccounts.length; i++) {
//                        if ($scope.CustomerAccounts[i].isChecked) {
//                            outletAccounts.push($scope.CustomerAccounts[i]);
//                        }
//                    }
//                    $scope.CustOutlet.accounts = outletAccounts;
//                    if (outletAccounts.length < 1) {
//                        $scope.checkAccountError = true;
//                        return;
//                    }
//
//                    if (!$scope.CustOutlet.hasOwnProperty('outletId')) {
//                        var OutletContacts = [];
//                        $scope.CustOutlet.OutletContacts = OutletContacts;
//                        $scope.CustOutlet.outletId = $scope.CustomerOutlets.length + 1;
//                        $scope.CustomerOutlets.push($scope.CustOutlet);
//                    }
            $scope.progressBar = $rootScope.showProgress();
            DataService.createOutlet(newOutlet).then(function (response) {
                $scope.notify("success", "Success", response.data.message);
                $scope.progressBar.close();
                $scope.closeAndclear(true);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });

        };
        $scope.loadCustomerContacts = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerContacts($scope.PrincipalCustomer.customerId).then(function (response) {
                console.log("Customer Contacts Data:", response.data.data);
                $scope.CustomerContacts = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadUnapprovedCustomerContacts = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getUnapprovedCustomerContacts($scope.PrincipalCustomer.customerId).then(function (response) {
                console.log("Unapproved Customer Contacts Data:", response.data.data);
                $scope.UnapprovedCustomerContacts = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.approveContact = function () {
//                    if (!$scope.ContactApprovalForm.$valid) {
//                        return;
//                    }

            var ContactIds = [];
            for (var i = 0; i < $scope.UnapprovedCustomerContacts.length; i++) {
                if ($scope.UnapprovedCustomerContacts[i].isChecked) {
                    ContactIds.push($scope.UnapprovedCustomerContacts[i].contactId);
                }
            }
            ;
            if (ContactIds.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.ContactApproval.ids = ContactIds;
                var ContactApprovaldata = {};
                ContactApprovaldata.ids = ContactIds;
                ContactApprovaldata.notes = $scope.ContactApproval.notes;
                console.log(ContactApprovaldata);
                DataService.approveOutletContact(ContactApprovaldata, $scope.ContactApproval.action).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + ContactIds.length + ") CIT Agents successfully " + $scope.ContactApproval.action + ".");
                        $scope.progressBar.close();
                        $scope.ContactApproval.notes = "";
                        $scope.loadUnapprovedCustomerContacts();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    console.log("progressBar2.1");
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnapprovedCustomerContacts.length; i++) {
                if (!$scope.UnapprovedCustomerContacts[i].isChecked) {
                    $scope.UnapprovedCustomerContacts.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnapprovedCustomerContacts.allItemsSelected = true;
        };
        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnapprovedCustomerContacts.length; i++) {
                $scope.UnapprovedCustomerContacts[i].isChecked = $scope.UnapprovedCustomerContacts.allItemsSelected;
            }
        };
        $scope.viewContact = function (CustomerContact, editMode) {
            CustomerContact.editMode = editMode;
            $scope.CustomerContact = CustomerContact;
            $scope.ShowContactView = true;
//                    $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerOutlets($scope.PrincipalCustomer.customerId).then(function (response) {
                console.log("Customer Outlets Data:", response.data.data);
                $scope.CustomerOutlets = response.data.data.content;
                $scope.loadContactAccounts(CustomerContact.contactId);
                //$scope.progressBar.close();
//                        $scope.loadCurrencies();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
            DataService.getContactOutlets(CustomerContact.contactId).then(function (response) {
                console.log("Contact Outlets Data:", response);
                $scope.outlets = response.data.data;
                //$scope.progressBar.close();
//                        $scope.loadCurrencies();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.CustomerAccount = {};
        $scope.outlets = {};
        $scope.saveCustomer = function () {
            console.log("outlet account id:", $scope.CustomerAccount.isChecked);
            console.log("contact id:", $scope.CustomerContact.contactId);
            DataService.linkOutletContact($scope.CustomerAccount.isChecked, $scope.CustomerContact.contactId).then(function (response) {
                console.log("Customer Outlets:", response);
//                        $scope.CustomerOutlets = response.data.data.content;
                //$scope.progressBar.close();
//                        $scope.loadCurrencies();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.switchTabs = function () {
            $scope.ShowContactView = false;
        };
        $scope.viewCustomer = function (PrincipalCustomer, editMode) {
            PrincipalCustomer.editMode = editMode;
            $scope.PrincipalCustomer = PrincipalCustomer;
            $scope.ShowCustomerView = true;
            if (PrincipalCustomer.editMode) {
                $scope.loadCustomerCategories();
            } else {
                $scope.navigateTab(1);
            }

        };
        $scope.deleteCustomerPopup = function (PrincipalCustomer) {
            $scope.removeCustomer = true;
            $scope.PrincipalCustomer = PrincipalCustomer;
        };
        $scope.closePopup = function () {
            $scope.removeCustomer = false;
        };
        $scope.data = {};
        $scope.deleteCust = function () {
//                    if (!$scope.DeleteCustomerForm.$valid) {
//                        return;
//                    }


            var ids = [];
            ids.push($scope.PrincipalCustomer.customerId);
            var deleteCustomerData = {};
            deleteCustomerData.ids = ids;
            deleteCustomerData.notes = $scope.data.notes;
            console.log(deleteCustomerData);
            $scope.progressBar = $rootScope.showProgress();
            DataService.deleteCustomers(deleteCustomerData).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.PrincipalCustomer.customerName + ' successfully Deleted');
                $scope.progressBar.close();
                $scope.removeCustomer = false;
                $scope.listCustomers();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadCustomerCategories = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerCategories(true, ["Approved", "Rejected"]).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.CustomerCategories = response.data.data.content;
                $scope.progressBar.close();
//                        $scope.PrincipalCustomer.editMode = true;
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadCustomerRequests = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCollectionRequests($scope.PrincipalCustomer.customerId, "", $scope.CustomerFilter).then(function (response) {
                console.log("Customer Collection Requests Data:", response.data.data);
                $scope.CollectionRequests = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.listCustomers = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomers("", $scope.CustomerFilter).then(function (response) {
                $scope.PrincipalCustomers = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                $scope.loadCustomerCategories();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
//                $scope.viewCustomer = function (PrincipalCustomer, editMode) {
//                    PrincipalCustomer.editMode = editMode;
//                    $scope.PrincipalCustomer = PrincipalCustomer;
//                    $scope.ShowCustomerView = true;
//                    if(PrincipalCustomer.editMode) {
//                        $scope.loadCustomerCategories();
//                    } else {
//                        $scope.navigateTab(1);
//                    }
//                };

        $scope.viewOutlet = function (CustomerOutlet) {

            DataService.OutletAccounts_(CustomerOutlet.outletId).then(function (response) {
//                        console.log("Outlet Accounts:", response.data.data);
                $scope.outletaccs = response.data.data.content;
                $localStorage.outletaccs = $scope.outletaccs;
                $scope.CustomerOutlet = CustomerOutlet;
                $localStorage.CustomerOutlet = $scope.CustomerOutlet;
//                        console.log("CustomerOutlet:" + $scope.CustomerOutlet);
//                        console.log("outlet accounts:" + $scope.outletaccs);
                $window.location = '#/CustomerOutlet?viewMode=true';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.linkNewAccount = function () {
            $scope.LinkCustAcc.customerId = $scope.PrincipalCustomer.customerId;
            $scope.LinkCustAcc.accountNumber = '1300002702';
            $scope.LinkCustAcc.currency = 'USD';
            console.log("LinkCustAcc:", $scope.LinkCustAcc);
            $scope.progressBar = $rootScope.showProgress();
            DataService.addNewCustomerAccount($scope.LinkCustAcc).then(function (response) {
                $scope.progressBar.close();
                $scope.closeAndclear();
                $rootScope.notify('success', 'Success', "New Customer Account successfully linked.");
                $scope.navigateTab(1);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.addContact = function () {
            $scope.CustomerContact.customerId = $scope.PrincipalCustomer.customerId;
            console.log("CustomerContact:", $scope.CustomerContact);
            $scope.progressBar = $rootScope.showProgress();
            DataService.addNewCustomercontact($scope.CustomerContact).then(function (response) {
                $scope.progressBar.close();
                $scope.closeAndclear();
                $rootScope.notify('success', 'Success', "New Contact successfully added.");
                $scope.navigateTab(4);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.searchAccount = function () {
            if (!$scope.LinkAccForm.$valid) {
                return;
            }

            var searchInput = $scope.LinkCustAcc.search;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getSearchCustAccount(searchInput).then(function (response) {
                console.log("Resp:", response.data.data);
                /* Remember to check for account not found && Duplicate accounts*/
                $scope.LinkCustAcc = response.data.data;
                $scope.LinkCustAcc.search = searchInput;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.updateContact = function () {
//                    var outletAccountIds = [];
//                    angular.forEach($scope.OutletAccounts, function (outletAccount, key) {
//                        console.debug("Found outlet account", outletAccount);
//                        if (outletAccount.isChecked) {
//                            outletAccountIds.push(outletAccount.outletAccMapId);
//                            //roleids.push(role.roleId);
//                        }
//                    });
//                    $scope.CustomerContact.outletAccountIds = outletAccountIds;
            $scope.progressBar = $rootScope.showProgress();
            DataService.updateCustomerContact($scope.CustomerContact).then(function (response) {
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', "Customer contact successfully updated.");
                $scope.switchTab('Main');
                $window.location = '#/Customers';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        }

        /**
         * Used to process link contact to outlet account
         */
        $scope.linkOutletContact = function (outletContactAccount, contactId) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.assignOutletContact(outletContactAccount, contactId).then(function (response) {
                $scope.progressBar.close();
                $scope.loadContactAccounts(contactId);
                $rootScope.notify("success", "Success", "Assigned outlet account successfully");
                $scope.showOuletContact = false;
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        }

        $scope.saveCustomer = function () {
            $scope.Customer = {};
            $scope.Customer.customerId = $scope.PrincipalCustomer.customerId;
            $scope.Customer.customerName = $scope.PrincipalCustomer.customerName;
            $scope.Customer.postalAddress = $scope.PrincipalCustomer.postalAddress;
            $scope.Customer.physicalAddress = $scope.PrincipalCustomer.physicalAddress;
            $scope.Customer.custCategoryId = $scope.PrincipalCustomer.custCategoryId;
            console.log("Final Customer:", angular.toJson($scope.Customer));
            $scope.progressBar = $rootScope.showProgress();
            DataService.savePrincipalCustomer($scope.Customer).then(function (response) {
                console.log("Update customer resp:", response.data.data);
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', "Customer successfully updated.");
                $scope.switchTab('Main');
                $window.location = '#/Customers';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.showDlg = function () {
            switch ($scope.CurrentTab) {
                case 1:
                    $scope.ShowLinkAcc = true;
                    break;
                case 2:
                    $scope.ShowOutlet = true;
//                            $scope.checkAccountError = false;
                    break;
                case 4:
                    $scope.ShowContact = true;
                    break;
            }
        };
        $scope.closeAndclear = function () {
            switch ($scope.CurrentTab) {
                case 1:
                    $scope.ShowLinkAcc = false;
                    $scope.LinkCustAcc = {};
                    break;
                case 2:
                    $scope.ShowOutlet = false;
                    $scope.CustOutlet = {};
                    for (var i = 0; i < $scope.CustomerAccounts.length; i++) {
                        $scope.CustomerAccounts[i].isChecked = false;
                    }
                    break;
                case 4:
                    $scope.ShowContact = false;
                    $scope.CustomerContact = {};
                    break;
            }
        };
        $scope.switchTab = function (tabName) {
            if (tabName === 'Main') {
                $scope.ShowCustomerView = false;
            } else {
                $scope.ShowCustomerView = true;
            }
        };
        $scope.loadCustomersAuditLog = function (reset, outputFormat) {
            if (reset) {
                $scope.AuditFilter = {};
                var startDate = new Date();
                startDate.setDate(1);
                $scope.AuditFilter.dateFrom = startDate;
                $scope.AuditFilter.dateTo = new Date();
            }
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerAuditTrails($scope.AuditFilter, $scope.PrincipalCustomer.customerId).then(function (response) {
                console.log(" Customer Audit trail:", response.data.data.content);
                $scope.progressBar.close();
                $scope.CustomerAuditTrail = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        }

        $scope.navigateTab = function (tabId) {
            $scope.CurrentTab = tabId;
            $localStorage.pageNumber = 0;
            switch ($scope.CurrentTab) {
                case 1:
                    $scope.loadCustomerAccounts();
                    break;
                case 2:
                    $scope.loadCustomerOutlets();
                    break;
                case 3:
                    $scope.loadCustomerRequests();
                    break;
                case 4:
                    $scope.loadCustomerContacts();
                    break;
                case 6:
                    $scope.loadUnapprovedCustomerContacts();
                    break;
                case 5:
                    $scope.loadCustomersAuditLog(true);
                    break;
            }
        };
        //deactivate/activate
        $scope.deactivateCustomer = function (PrincipalCustomer) {
            $scope.deactivateCustomerForm = true;
            $scope.PrincipalCustomer = PrincipalCustomer;
            console.log("PrincipalCustomer", PrincipalCustomer)
        };
        $scope.deactivateCUST = function () {
//                    if (!$scope.deactivatePCustomerForm.$valid) {
//                        return;
//                    }

            var ids = [];
            ids.push($scope.PrincipalCustomer.customerId);
            var deactivateCUSTOMERData = {};
            deactivateCUSTOMERData.ids = ids;
            deactivateCUSTOMERData.notes = $scope.data.notes;
            console.log(deactivateCUSTOMERData);
            $scope.progressBar = $rootScope.showProgress();
            console.log($scope.PrincipalCustomer.status)
            DataService.deactivateCUST(deactivateCUSTOMERData, $scope.PrincipalCustomer.status).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.PrincipalCustomer.customerName + ' successfully Actioned');
                $scope.progressBar.close();
                $scope.deactivateCustomerForm = false;
                $scope.loadCustomerList();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadCustomerList();
        $scope.enableCustomerEdit = function () {
            $scope.PrincipalCustomer.editMode = true;
        };
        $scope.updateCustomer = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.saveCustomer($scope.PrincipalCustomer).then(function (response) {
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', "Customer successfully updated.");
                $scope.switchTab('Main');
                $window.location = '#/Customers';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });

        };
        /**
         * Used to process outlet account request
         */
        $scope.loadContactAccounts = function (contactId) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getContactAccounts(contactId).then(function (response) {
                $scope.ContactAccounts = response.data.data.content;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };

        $scope.delinkContactAccount = function (contactId, outletAccountId) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.delinkContactAccount(outletAccountId).then(function (response) {
                $scope.notify("success", "Success", "Delinked account successfully");
                $scope.progressBar.close();
                $scope.loadContactAccounts(contactId);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        }
    }])
    .controller('CustomerOuletCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$localStorage', '$routeParams', function ($rootScope, $scope, DataService, $window, $localStorage, $routeParams) {

        if ($routeParams.hasOwnProperty("viewMode")) {
            $scope.CustomerOutlet = $localStorage.CustomerOutlet;
            $scope.outletaccs = $localStorage.outletaccs;
            $scope.addNew = $scope.CustomerOutlet.hasOwnProperty('outletId') ? false : true;
            console.log("New Mode:" + $scope.addNew);
            console.log("CustomerOutlet:", $scope.CustomerOutlet);
            console.log("outlet accounts:", $scope.outletaccs);
        }

        $scope.editCustomer = function () {
            $scope.editMode = true;
        };
        $scope.saveCITAgent = function () {
            if (!$scope.CITAgentForm.$valid) {
                return;
            }
            delete $scope.CITAgent.editMode;
            console.debug("Updating/Creating CIT Agents...");
            $scope.progressBar = $rootScope.showProgress();
            DataService.saveCITAgent($scope.CITAgent).then(function (response) {
                console.log("CIT Agent creation resp:", response.data.data);
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', $scope.CITAgent.citAgentId !== undefined ? "CIT Agent successfully updated." : "CIT Agent successfully created.");
                $window.location = '#/CITAgents';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    var errors = "";
                    if (error.data.data) {
                        errors = " [";
                        angular.forEach(error.data.data, function (value, key) {
                            errors = errors + value + ",";
                        });
                        errors = errors + "]";
                    }
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
                }
            });
        };
        $scope.addContact = function () {
            $scope.CustomerContact.customerId = $scope.PrincipalCustomer.customerId;
            console.log("CustomerContact:", $scope.CustomerContact);
            $scope.progressBar = $rootScope.showProgress();
            DataService.addNewCustomercontact($scope.CustomerContact).then(function (response) {
                console.log("Add CustomerContact resp:", response.data.data);
                $scope.progressBar.close();
                $scope.closeAndclear();
                $rootScope.notify('success', 'Success', "New Contact successfully added.");
                $scope.navigateTab(4);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.showDlg = function () {
            switch ($scope.CurrentTab) {
                case 1:
                    $scope.ShowLinkAcc = true;
                    break;
                case 2:
                    $scope.ShowOutlet = true;
                    $scope.checkAccountError = false;
                    break;
                case 4:
                    $scope.ShowContact = true;
                    break;
            }
        };
        $scope.closeAndclear = function () {
            switch ($scope.CurrentTab) {
                case 1:
                    $scope.ShowLinkAcc = false;
                    $scope.LinkCustAcc = {};
                    break;
                case 2:
                    $scope.ShowOutlet = false;
                    $scope.CustOutlet = {};
                    for (var i = 0; i < $scope.CustomerAccounts.length; i++) {
                        $scope.CustomerAccounts[i].isChecked = false;
                    }
                    break;
                case 4:
                    $scope.ShowContact = false;
                    $scope.CustomerContact = {};
                    break;
            }
        };
        $scope.updateOutlet = function () {
            $scope.CustomerOutlet;
            $scope.progressBar = $rootScope.showProgress();
            DataService.updateOutlet($scope.CustomerOutlet).then(function (response) {
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', "Customer outlet successfully updated.");
                $scope.switchTab('Main');
                $window.location = '#/Customers';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });

        };
        /**
         * Used to process link outlet account
         */
        $scope.delinkOutletAccount = function (accountId) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.delinkOutletAccount(accountId).then(function (response) {
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', "Delinked outlet account successfully updated.");
//                        $scope.switchTab('Main');
                $window.location = '#/Customers';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        /**
         * Used to fetch customer accounts and display link account to outlet dialog with the customer accounts
         */
        $scope.showOutletDlg = function (customerId) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerAccounts(customerId).then(function (response) {
                $scope.progressBar.close();
                $scope.ShowLinkOutletAcc = true;
                $scope.customerAccounts = response.data.data;
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        /**
         * Used to send link outlet account request to the api
         */
        $scope.linkOutletAccount = function () {
            $scope.progressBar = $rootScope.showProgress();
            console.debug('Linking outlet account ', $scope.outletAccount);
            DataService.addOutletAccounts($scope.CustomerOutlet.outletId, $scope.outletAccount).then(function (response) {
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', "Linked outlet account successfully updated.");
//                        $scope.switchTab('Main');
                $window.location = '#/Customers';
            }, function (error) {
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
    }])
    .controller('CITAgentCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window) {

        $scope.regions = [];

        if ($routeParams.hasOwnProperty("editMode")) {
            $scope.CITAgent = $localStorage.CITAgent;
            $scope.editMode = $scope.CITAgent.editMode;
        } else {
            $scope.editMode = true;
            $localStorage.CITAgent = null;
        }

        $scope.editCITAgent = function () {
            $scope.editMode = true;
            $scope.CITAgent.editMode = $scope.editMode;
            $localStorage.CITAgent = $scope.CITAgent;
        };
        $scope.viewCit = function (CITAgents) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITAgents("", $scope.CitAgentFilter).then(function (response) {
                console.log("Agents Data:", response.data.data);
                $scope.CITAgents = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadRegions = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getRegions().then(function (response) {
                console.log("Resp:", response.data);
                $scope.Regions = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        //deactivate/activate
        $scope.deactivateCIT = function (CITAgent) {
            $scope.deactivateCITForm = true;
            $scope.CITAgent = CITAgent;
            console.log("CITAgent", CITAgent)
        };
        $scope.deactivateCITAgent = function () {
//                    if (!$scope.deactivateCITAgentForm.$valid) {
//                        return;
//                    }

            var ids = [];
            ids.push($scope.CITAgent.citAgentId);
            var deactivateCITData = {};
            deactivateCITData.ids = ids;
            deactivateCITData.notes = $scope.citagentdata.notes;
            console.log(deactivateCITData);
            $scope.progressBar = $rootScope.showProgress();
            console.log($scope.CITAgent.status)
            DataService.deactivateCIT(deactivateCITData, $scope.CITAgent.status).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.CITAgent.citAgentName + ' successfully Actioned');
                $scope.progressBar.close();
                $scope.deactivateCITForm = false;
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
//                delete cit agent
        $scope.deleteCITPopup = function (CITAgent) {
            console.log("here")
            $scope.removeCIT = true;
            $scope.CITAgent = CITAgent;
        };
        $scope.closePopup = function () {
            $scope.removeCIT = false;
        };
        $scope.citdata = {};
        $scope.deleteCIT = function () {
            if (!$scope.DeleteCITForm.$valid) {
                return;
            }

            var ids = [];
            ids.push($scope.CITAgent.citAgentId);
            var deleteCITData = {};
            deleteCITData.ids = ids;
            deleteCITData.notes = $scope.citdata.notes;
            console.log(deleteCITData);
            $scope.progressBar = $rootScope.showProgress();
            DataService.deleteCIT(deleteCITData).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.CITAgent.citAgentName + ' successfully Deleted');
                $scope.progressBar.close();
                $scope.removeCIT = false;
                $window.location = '#/CITAgents';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        //                delete cit agent

        $scope.saveCITAgent = function () {
            if (!$scope.CITAgentForm.$valid) {
                return;
            }
            delete $scope.CITAgent.editMode;
            console.debug("Updating/Creating CIT AGENT", $scope.CITAgent);
            $scope.progressBar = $rootScope.showProgress();
            DataService.saveCITAgent($scope.CITAgent).then(function (response) {
                console.log("CIT Agent creation resp:", response.data.data);
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', $scope.CITAgent.citAgentId !== undefined ? "CIT Agent successfully updated." : "CIT Agent successfully created.");
                $window.location = '#/CITAgents';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadRegions();
    }])
    .controller('ApproveCITAgentCtrl', ['$rootScope', '$scope', 'DataService', '$window', function ($rootScope, $scope, DataService, $window) {
        $scope.CITAgentApproval = {action: "approved"};
        $scope.resetUnapproveCitAgentFilter = function () {
            $scope.CitAgentFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
//                    $scope.CitAgentFilter.dateFrom = startDate;
//                    $scope.CitAgentFilter.dateTo = new Date();
            $scope.CitAgentFilter.dateFrom = "";
            $scope.CitAgentFilter.dateTo = "";
            $scope.listUnapprovedCITAgents();
        };
        $scope.ShowChanges = function (CITAgent) {
            $scope.ShowChange = true;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCitAgentChanges(CITAgent.citAgentId).then(function (response) {
                console.log("Change Resp:", response.data.data);
                $scope.changes = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.DownloadReport = function (outputFormat) {
            DataService.getCitAgentListDoc("Unapproved", $scope.CitAgentFilter, outputFormat);
        }

        $scope.listUnapprovedCITAgents = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITAgents('Unapproved', $scope.CitAgentFilter).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.UnapprovedCITAgents = response.data.data.content;
                $scope.UnapprovedCITAgents.allItemsSelected = false;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                console.log("progressBar1");
            }, function (error) {
                $scope.progressBar.close();
                console.log("progressBar1.1");
                console.log("Error", error);
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.approveCITAgents = function () {
            if (!$scope.CITAgentApprovalForm.$valid) {
                return;
            }

            var CITAgentIds = [];
            for (var i = 0; i < $scope.UnapprovedCITAgents.length; i++) {
                if ($scope.UnapprovedCITAgents[i].isChecked) {
                    CITAgentIds.push($scope.UnapprovedCITAgents[i].citAgentId);
                }
            }

            if (CITAgentIds.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.CITAgentApproval.ids = CITAgentIds;
                var CITAgentApprovaldata = {};
                CITAgentApprovaldata.ids = CITAgentIds;
                CITAgentApprovaldata.notes = $scope.CITAgentApproval.notes;
                console.log(CITAgentApprovaldata);
                DataService.approveCITAgents(CITAgentApprovaldata, $scope.CITAgentApproval.action).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + CITAgentIds.length + ") CIT Agents successfully " + $scope.CITAgentApproval.action + ".");
                        $scope.progressBar.close();
                        $scope.CITAgentApproval.notes = "";
                        $scope.listUnapprovedCITAgents();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    console.log("progressBar2.1");
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnapprovedCITAgents.length; i++) {
                if (!$scope.UnapprovedCITAgents[i].isChecked) {
                    $scope.UnapprovedCITAgents.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnapprovedCITAgents.allItemsSelected = true;
        };
        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnapprovedCITAgents.length; i++) {
                $scope.UnapprovedCITAgents[i].isChecked = $scope.UnapprovedCITAgents.allItemsSelected;
            }
        };
        $scope.resetUnapproveCitAgentFilter();
    }])
    .controller('ListCITAgentCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$localStorage', function ($rootScope, $scope, DataService, $window, $localStorage) {

        $scope.resetCitAgentFilter = function () {
            $scope.CitAgentFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
//                    $scope.CitAgentFilter.dateFrom = startDate;
//                    $scope.CitAgentFilter.dateTo = new Date();
            $scope.CitAgentFilter.dateFrom = "";
            $scope.CitAgentFilter.dateTo = "";
            $scope.listCITAgents();
        };
        $scope.DownloadReport = function (outputFormat) {
            DataService.getCitAgentListDoc("", $scope.CitAgentFilter, outputFormat);
        }

        $scope.listCITAgents = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITAgents("", $scope.CitAgentFilter).then(function (response) {
                console.log("Agents Data:", response.data.data);
                $scope.CITAgents = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.viewCITAgent = function (CITAgent, editMode) {
            CITAgent.editMode = editMode;
            $localStorage.CITAgent = CITAgent;
            $window.location = '#/CITAgentOnboarding?editMode=true';
        };
        $scope.resetCitAgentFilter();
    }])
    .controller('ListCITCrewCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$window', function ($rootScope, $scope, DataService, $routeParams, $window) {
        $scope.resetCitCrewFilter = function () {
            $scope.CitCrewFilter = {};
            $scope.listCITCrew();
        };
        $scope.DownloadReport = function (outputFormat) {
            DataService.getCITCrewListDoc("", $scope.CitCrewFilter, outputFormat);
        }

        $scope.listCITCrew = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITCrew("", $scope.CitCrewFilter).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.CITCrews = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.listCITCrewByBatchID = function (batchID) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITCrewByBatchID(batchID).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $rootScope.CITCrews = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.viewCITAgentCrew = function (CITAgentCrew, editMode) {
            $scope.CITAgentCrew = CITAgentCrew;
            $scope.editMode = editMode;
            $scope.ShowCITAgentCrewView = true;
            $window.scrollTo(0, 0);
        };
        $scope.switchTab = function (tabName) {
            if (tabName === 'Main') {
                $scope.ShowCITAgentCrewView = false;
            } else {
                $scope.ShowCITAgentCrewView = true;
            }
        };
        // delete cit agent
        $scope.deleteCITCrewPopup = function (CITAgentCrew) {
            $scope.removeCITCrew = true;
            $scope.CITAgentCrew = CITAgentCrew;
        };
        $scope.closePopup = function () {
            $scope.removeCITCrew = false;
        };
        $scope.citdata = {};
        $scope.deleteCIT = function () {
//                    if (!$scope.DeleteCITForm.$valid) {
//                        return;
//                    }


            var ids = [];
            ids.push($scope.CITAgentCrew.crewId);
            var deleteCITData = {};
            deleteCITData.ids = ids;
            deleteCITData.notes = $scope.citdata.notes;
            console.log(deleteCITData);
            $scope.progressBar = $rootScope.showProgress();
            DataService.deleteCITCrew(deleteCITData).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.CITAgentCrew.fullName + ' successfully Deleted');
                $scope.progressBar.close();
                $scope.removeCITCrew = false;
                $scope.listCITCrew();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        //                delete cit agent
//                $scope.citAgentCrewForm = {};
        $scope.saveCITCrew = function () {
            if (!document.getElementsByName("citAgentCrewForm")[0].checkValidity()) {
                $rootScope.notify("warning", "Validation Errors", "Validation errors occured please check your input before trying again");
                return;
            }

            console.log("CIT Crew update:", $scope.CITCrews);
            delete $scope.CITCrews.editMode;
            $scope.progressBar = $rootScope.showProgress();
            DataService.saveCITAgentCrew($scope.CITAgentCrew).then(function (response) {
                console.log("CIT Agent Crew Update resp:", response.data.data);
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', $scope.CITAgentCrew.crewId !== undefined ? "CIT Agent Crew successfully updated." : "CIT Agent successfully created.");
                $window.location = '#/CITCrew';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        if ($routeParams.hasOwnProperty("batchID")) {
            $scope.listCITCrewByBatchID($routeParams.batchID);
        } else {
            $scope.resetCitCrewFilter();
        }
    }])
    .controller('ConfirmCITCrewCtrl', ['$rootScope', '$scope', 'DataService', '$window', function ($rootScope, $scope, DataService, $window) {
        $scope.CITCrewConfirm = {};
        $scope.resetCitCrewFilter = function () {
            $scope.CitCrewFilter = {};
            $scope.listUnconfirmedCITCrew();
        }

        $scope.listUnconfirmedCITCrew = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITCrew('Unconfirmed', $scope.CitCrewFilter).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.UnconfirmedCITCrew = response.data.data.content;
                $scope.UnconfirmedCITCrew.allItemsSelected = false;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.confirmCITCrew = function () {
            if (!$scope.CITCrewConfirmForm.$valid) {
                return;
            }

            var CITCrewIds = [];
            for (var i = 0; i < $scope.UnconfirmedCITCrew.length; i++) {
                if ($scope.UnconfirmedCITCrew[i].isChecked) {
                    CITCrewIds.push($scope.UnconfirmedCITCrew[i].crewId);
                }
            }

            if (CITCrewIds.length > 0) {
//                        $scope.progressBar = $rootScope.showProgress();
                $scope.CITCrewConfirm.ids = CITCrewIds;
                var CITCrewConfirmdata = {};
                CITCrewConfirmdata.ids = CITCrewIds;
                CITCrewConfirmdata.notes = $scope.CITCrewConfirm.notes;
                console.log(CITCrewConfirmdata)
                DataService.confirmCITCrew(CITCrewConfirmdata).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + CITCrewIds.length + ") CIT Agent Crew successfully confirmed.");
                        $scope.CITCrewConfirm.notes = "";
                        $scope.progressBar.close();
                        $scope.listUnconfirmedCITCrew();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to confirm this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnconfirmedCITCrew.length; i++) {
                if (!$scope.UnconfirmedCITCrew[i].isChecked) {
                    $scope.UnconfirmedCITCrew.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnconfirmedCITCrew.allItemsSelected = true;
        }

        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnconfirmedCITCrew.length; i++) {
                $scope.UnconfirmedCITCrew[i].isChecked = $scope.UnconfirmedCITCrew.allItemsSelected;
            }
        };
        $scope.resetCitCrewFilter();
    }])
    .controller('ApproveCITCrewCtrl', ['$rootScope', '$scope', 'DataService', '$window', function ($rootScope, $scope, DataService, $window) {
        $scope.CITCrewApproval = {action: "approved"};
        $scope.resetCitCrewFilter = function () {
            $scope.CitCrewFilter = {};
            $scope.listUnapprovedCITCrew();
        };
        $scope.ShowChanges = function (CITCrew) {
            $scope.ShowChange = true;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCitCrewChanges(CITCrew.crewId).then(function (response) {
                console.log("Change Resp:", response.data.data);
                $scope.changes = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.DownloadReport = function (outputFormat) {
            DataService.getCITCrewListDoc("Unapproved", $scope.CitCrewFilter, outputFormat);
        }

        $scope.listUnapprovedCITCrew = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITCrew('Unapproved', $scope.CitCrewFilter).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.UnapprovedCITCrew = response.data.data.content;
                $scope.UnapprovedCITCrew.allItemsSelected = false;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.approveCITCrew = function () {

            if (!$scope.CITCrewApprovalForm.$valid) {
                return;
            }

            var CITCrewIds = [];
            for (var i = 0; i < $scope.UnapprovedCITCrew.length; i++) {
                if ($scope.UnapprovedCITCrew[i].isChecked) {
                    CITCrewIds.push($scope.UnapprovedCITCrew[i].crewId);
                }
            }

            if (CITCrewIds.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.CITCrewApproval.ids = CITCrewIds;
                var CITCrewApprovaldata = {};
                CITCrewApprovaldata.ids = CITCrewIds;
                CITCrewApprovaldata.notes = $scope.CITCrewApproval.notes;
                DataService.approveCITCrew(CITCrewApprovaldata, $scope.CITCrewApproval.action).then(function (response) {
                    console.log("Resp:", response);
//                            if (response.data.code === 200) {
                    $rootScope.notify('success', 'Success', "(" + CITCrewIds.length + ") CIT Agent Crew successfully " + $scope.CITCrewApproval.action + ".");
                    $scope.CITCrewApproval.notes = "";
                    $scope.progressBar.close();
                    $scope.listUnapprovedCITCrew();
//                            }
//                            else if (response.data.code === 207) {
//                                $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
//                                $scope.progressBar.close();
//                            }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnapprovedCITCrew.length; i++) {
                if (!$scope.UnapprovedCITCrew[i].isChecked) {
                    $scope.UnapprovedCITCrew.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnapprovedCITCrew.allItemsSelected = true;
        }

        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnapprovedCITCrew.length; i++) {
                $scope.UnapprovedCITCrew[i].isChecked = $scope.UnapprovedCITCrew.allItemsSelected;
            }
        };
        $scope.resetCitCrewFilter();
    }])
    .controller('ListCITVehicleCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$window', function ($rootScope, $scope, DataService, $routeParams, $window) {

        $scope.resetCitVehicleListFilter = function () {
            $scope.CitVehicleFilter = {};
            $scope.listCITVehicles();
        }

        $scope.DownloadReport = function (outputFormat) {
            DataService.getCITVehiclesListDoc("", $scope.CitVehicleFilter, outputFormat);
        }

        $scope.listCITVehicles = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITVehicles("", $scope.CitVehicleFilter).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.CITVehicles = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.listCITVehiclesByBatchID = function (batchID) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITVehicleByBatchID(batchID).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $rootScope.CITVehicles = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.viewCITVehicle = function (CITVehicle, editMode) {
            $scope.CITVehicle = CITVehicle;
            CITVehicle.fleetNumber = CITVehicle.fleetNumber === null ? 'N/A' : CITVehicle.fleetNumber;
            $scope.editMode = editMode;
            $scope.ShowCITVehicleView = true;
            $window.scrollTo(0, 0);
        };

        $scope.saveCITVehicle = function () {
            console.debug("Saving cit vehicles...");
            $scope.progressBar = $rootScope.showProgress();
            DataService.saveCITVehicle($scope.CITVehicle).then(function (response) {
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', "Updated cit vehicles successfully");
                $window.location = '#/CITVehicles';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    var errors = "";
                    if (error.data.data) {
                        errors = " [";
                        angular.forEach(error.data.data, function (value, key) {
                            errors = errors + value + ",";
                        });
                        errors = errors + "]";
                    }
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
                }
            });


        }
        //delete
        $scope.deleteVehiclePopup = function (CITVehicle) {
            $scope.removeVehicle = true;
            $scope.CITVehicle = CITVehicle;
            console.log("CITVehicle", CITVehicle)
        };
        $scope.closePopup = function () {
            $scope.removeVehicle = false;
        };
        $scope.VehicleData = {};
        $scope.deleteVehicle = function (CITVehicle) {
//                   if (!$scope.DeleteVehicleForm.$valid) {
//                        return;
//                    }

            var ids = [];
            ids.push($scope.CITVehicle.vehicleId);
            var deleteCITVehicleData = {};
            deleteCITVehicleData.ids = ids;
            deleteCITVehicleData.notes = $scope.VehicleData.notes;
            console.log(deleteCITVehicleData);
            $scope.progressBar = $rootScope.showProgress();
            DataService.deleteCITCrewVehicle(deleteCITVehicleData).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.CITVehicle.regNumber + ' successfully Deleted');
                $scope.progressBar.close();
                $scope.removeVehicle = false;
                $scope.listCITVehicles();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.switchTab = function (tabName) {
            if (tabName === 'Main') {
                console.log('false :'+tabName);
//                        $scope.listCITVehicles();
                $scope.ShowCITVehicleView = false;
            } else {
                console.log('true :'+tabName);
                $scope.ShowCITVehicleView = true;
            }
        };
        $scope.saveCITCrew = function () {
            console.log("CITAgentVehicle update:", $scope.CITVehicle);
        };
        if ($routeParams.hasOwnProperty("batchID")) {
            $scope.listCITVehiclesByBatchID($routeParams.batchID);
        } else {
            $scope.resetCitVehicleListFilter();
        }
    }])
    .controller('ConfirmCITVehicleCtrl', ['$rootScope', '$scope', 'DataService', '$window', function ($rootScope, $scope, DataService, $window) {

        $scope.resetCitVehicleFilter = function () {
            $scope.CitVehicleFilter = {};
            $scope.listUnconfirmedCITVehicles();
        }

        $scope.listUnconfirmedCITVehicles = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITVehicles('Unconfirmed', $scope.CitVehicleFilter).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.UnconfirmedCITVehicles = response.data.data.content;
                $scope.UnconfirmedCITVehicles.allItemsSelected = false;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.confirmCITVehicles = function () {
            if (!$scope.CITVehicleConfirmForm.$valid) {
                return;
            }

            var CITVehicleIds = [];
            for (var i = 0; i < $scope.UnconfirmedCITVehicles.length; i++) {
                if ($scope.UnconfirmedCITVehicles[i].isChecked) {
                    CITVehicleIds.push($scope.UnconfirmedCITVehicles[i].vehicleId);
                }
            }


            if (CITVehicleIds.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.CITVehicleConfirm.ids = CITVehicleIds;
                var CITVehicleConfirmdata = {};
                CITVehicleConfirmdata.ids = CITVehicleIds;
                CITVehicleConfirmdata.notes = $scope.CITVehicleConfirm.notes;
                DataService.confirmCITVehicles(CITVehicleConfirmdata).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + CITVehicleIds.length + ") CIT Vehicles successfully confirmed.");
                        $scope.CITVehicleConfirm.notes = "";
                        $scope.progressBar.close();
                        $scope.listUnconfirmedCITVehicles();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to confirm this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnconfirmedCITVehicles.length; i++) {
                if (!$scope.UnconfirmedCITVehicles[i].isChecked) {
                    $scope.UnconfirmedCITVehicles.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnconfirmedCITVehicles.allItemsSelected = true;
        };
        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnconfirmedCITVehicles.length; i++) {
                $scope.UnconfirmedCITVehicles[i].isChecked = $scope.UnconfirmedCITVehicles.allItemsSelected;
            }
        };
        $scope.resetCitVehicleFilter();
    }])
    .controller('ApproveCITVehicleCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$window', function ($rootScope, $scope, DataService, $routeParams, $window) {
        $scope.CITVehicleApproval = {action: "approved"};
        $scope.resetCitVehicleApproveFilter = function () {
            $scope.CitVehicleFilter = {};
            $scope.listUnapprovedCITVehicles();
        }

        $scope.ShowChanges = function (CITVehicle) {
            $scope.ShowChange = true;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCitVehicleChanges(CITVehicle.vehicleId).then(function (response) {
                console.log("Change Resp:", response.data.data);
                $scope.changes = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.DownloadReport = function (outputFormat) {
            DataService.getCITVehiclesListDoc("Unapproved", $scope.CitVehicleFilter, outputFormat);
        }

        $scope.listUnapprovedCITVehicles = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITVehicles('Unapproved', $scope.CitVehicleFilter).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.UnapprovedCITVehicles = response.data.data.content;
                $scope.UnapprovedCITVehicles.allItemsSelected = false;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.approveCITVehicles = function () {
            if (!$scope.CITVehicleApprovalForm.$valid) {
                return;
            }

            var CITVehicleIds = [];
            for (var i = 0; i < $scope.UnapprovedCITVehicles.length; i++) {
                if ($scope.UnapprovedCITVehicles[i].isChecked) {
                    CITVehicleIds.push($scope.UnapprovedCITVehicles[i].vehicleId);
                }
            }

            if (CITVehicleIds.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.CITVehicleApproval.ids = CITVehicleIds;
                var CITVehicleApprovaldata = {};
                CITVehicleApprovaldata.ids = CITVehicleIds;
                CITVehicleApprovaldata.notes = $scope.CITVehicleApproval.notes;
                DataService.approveCITVehicles(CITVehicleApprovaldata, $scope.CITVehicleApproval.action).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + CITVehicleIds.length + ") CIT Vehicles successfully " + $scope.CITVehicleApproval.action + ".");
                        $scope.CITVehicleApproval.notes = "";
                        $scope.progressBar.close();
                        $scope.listUnapprovedCITVehicles();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnapprovedCITVehicles.length; i++) {
                if (!$scope.UnapprovedCITVehicles[i].isChecked) {
                    $scope.UnapprovedCITVehicles.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnapprovedCITVehicles.allItemsSelected = true;
        };
        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnapprovedCITVehicles.length; i++) {
                $scope.UnapprovedCITVehicles[i].isChecked = $scope.UnapprovedCITVehicles.allItemsSelected;
            }
        };
        $scope.resetCitVehicleApproveFilter();
    }])
    .controller('BatchFileUploadCtrl', ['$rootScope', '$scope', '$window', '$localStorage', 'DataService', '$route', function ($rootScope, $scope, $window, $localStorage, DataService, $route) {
        $scope.FileUpload = {};
        $scope.BatchUploadForms = {}
        $scope.ShowUploadView = false;
        $scope.token = $localStorage.accessToken
        $scope.config = {
            "API_ROOT": urlBase
        };
        $scope.resetbatchFileUploadFilter = function () {
            $scope.BatchFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.BatchFilter.dateFrom = startDate;
            $scope.BatchFilter.dateTo = new Date();
            $scope.batchFileUpload();
        }



        $scope.showUploadView = function (isShowing) {
            $scope.ShowUploadView = isShowing;
            if (isShowing) {
                $scope.loadCITAgents();
            } else {
                $scope.batchFileUpload();
            }
        };
        $scope.fileCategoryChange = function () {
            if ($scope.FileUpload.fileCategory === 'CIT Agent Crew') {
                $scope.loadCrewCategories();
            }
        };
        //listen for the file selected event
        $scope.$on("fileSelected", function (event, args) {
            $scope.$apply(function () {
                $scope.FileUpload.file = args.file;
                $scope.FileUpload.filename = $scope.FileUpload.file.name;
            });
        });
        $scope.uploadBatchFile = function () {
            if (!$scope.BatchUploadForms.BatchUploadForm.$valid) {
                return;
            }
            var formdata = new FormData();
            formdata.append("citAgentId", $scope.FileUpload.citAgentId);
            formdata.append("file", $scope.FileUpload.file);
            if ($scope.FileUpload.fileCategory === 'CIT Agent Crew') {
                formdata.append("crewCategoryId", $scope.FileUpload.crewCategoryId);
            } else {
                formdata.append("carCategory", $scope.FileUpload.vehicleType);
            }
            formdata.append("note", $scope.FileUpload.notes);
            $scope.progressBar = $rootScope.showProgress();
            DataService.uploadFile(formdata, $scope.FileUpload.fileCategory).then(function (response) {
                console.log("Batch File Upload:", response.data.data);
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', "File successfully uploaded.");
                $scope.showUploadView(true);
                $route.reload()
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadCITAgents = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITAgents("Approved", $scope.BatchFilter).then(function (response) {
                console.log("Agents Data:", response.data.data);
                $scope.CITAgents = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadCrewCategories = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCrewCategories($scope.BatchFilter).then(function (response) {
                console.log("Resp:", response.data);
                $scope.CrewCategories = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.batchFileUpload = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getBatchFiles($scope.BatchFilter).then(function (response) {
                console.log("Resp:", response.data.data.content);
                $scope.batchFiles = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.listCITCrewByBatchID = function (batchID, fileCategory) {
            if (fileCategory === 'CIT_VEHICLE') {
                $window.location = '#/CITVehicles?batchID=' + batchID;
            } else {
                $window.location = '#/CITCrew?batchID=' + batchID;
            }
        };
        $scope.resetbatchFileUploadFilter();
    }])
    .controller('CashCollectionCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$localStorage', function ($rootScope, $scope, DataService, $window, $localStorage) {
        $scope.CashCollection = {};
        $scope.CollectionEntry = {};
        $scope.CashCollectionEntries = [];
        $scope.EnteredCurrencyCodes = [];
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        $scope.CashCollection.prefCollectionTime = {date: tomorrow, dateOptions: {minDate: new Date()}, timepickerOptions: {min: null}};
        $scope.setToday = function () {
            $scope.CashCollection.prefCollectionTime.date = new Date();
        };
        $scope.CustomerOutletChange = function () {
            $scope.loadOutletAccounts($scope.CashCollection.CustomerOutlet.outletId);
            $scope.CashCollectionEntries = [];
        };
        $scope.currencyChange = function () {
            $scope.OutletCurrencyAccounts = [];
            angular.forEach($scope.OutletAccounts, function (value, key) {
                var currencyCode = value.currency ? value.currency.currencyCode : '';
                if (currencyCode === $scope.CollectionEntry.Currency.currencyCode) {
                    console.log('OutletCurrencyAccount:', value);
                    $scope.OutletCurrencyAccounts.push(value);
                }
            });
        };
        $scope.fetchCurrencies = function () {
            var currencies = [];
            angular.forEach($scope.Currencies, function (value, key) {
                if ($scope.EnteredCurrencyCodes.indexOf(value.currencyCode) === -1) {
                    currencies.push(value);
                } else if ($scope.CollectionEntry.hasOwnProperty('entryId')) {
                    if ($scope.CollectionEntry.Currency === value) {
                        currencies.push(value);
                    }
                }
            });
            return currencies;
        };
        $scope.addCollectionEntry = function () {
            if (!$scope.CollectionEntry.amount || !$scope.CollectionEntry.OutletAccount) {
                $rootScope.alertDialog('Fill in all the required fields!');
                return;
            }

            if (!$scope.CollectionEntry.hasOwnProperty('entryId')) {
                $scope.CollectionEntry.entryId = $scope.CashCollectionEntries.length + 1;
                $scope.CashCollectionEntries.push($scope.CollectionEntry);
                $scope.EnteredCurrencyCodes.push($scope.CollectionEntry.Currency.currencyCode);
            }
            $scope.closeAndclear(true);
        };
        $scope.editCollectionEntry = function (index) {
            $scope.CollectionEntryIndex = index;
            $scope.CollectionEntry = $scope.CashCollectionEntries[$scope.CollectionEntryIndex];
            $scope.OrigCollectionEntry = angular.copy($scope.CollectionEntry);
            $scope.currencyChange();
            $scope.showDlg();
        };
        $scope.removeCollectionEntry = function (index) {
            $scope.CashCollectionEntries.splice(index, 1);
            $scope.EnteredCurrencyCodes.splice(index, 1);
        };
        $scope.showDlg = function () {
            if (!$scope.CashCollection.CustomerOutlet) {
                $rootScope.alertDialog('Please select an Outlet first!');
            } else {
                $scope.ShowEntryDlg = true;
            }
        };
        $scope.closeAndclear = function (recordSaved) {
            if (!recordSaved && $scope.OrigCollectionEntry) {
                $scope.CashCollectionEntries.push($scope.OrigCollectionEntry);
                $scope.CashCollectionEntries.splice($scope.CollectionEntryIndex, 1);
            }
            delete $scope.OrigCollectionEntry;
            $scope.CollectionEntry = {};
            $scope.ShowEntryDlg = false;
        };
        $scope.loadCustomerOutlets = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerOutlets(null, true).then(function (response) {
                console.log("Customer Outlets Data:", response.data.data);
                $scope.CustomerOutlets = response.data.data;
                //$scope.progressBar.close();
                $scope.loadCurrencies();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadOutletAccounts = function (outletId) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getOutletAccountsByUser(outletId).then(function (response) {
                $scope.OutletAccounts = response.data.data;
                //$rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadCurrencies = function () {
            //$scope.progressBar = $rootScope.showProgress();
            DataService.getCurrencies().then(function (response) {
                console.log("Resp:", response.data);
                $scope.Currencies = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.submitCollectionRequest = function () {
            if (!$scope.CashCollectionForm.$valid) {
                return;
            }

            if ($scope.CashCollectionEntries.length < 1) {
                $rootScope.alertDialog('You must add atleast one Cash Collection Entry!');
                return;
            }

            var CashCollectionRequest = {};
            CashCollectionRequest.outletId = $scope.CashCollection.CustomerOutlet.outletId;
            CashCollectionRequest.accounts = [];
            CashCollectionRequest.prefCollectionTime = $scope.CashCollection.prefCollectionTime.date;
            CashCollectionRequest.description = "Cash Collection Request successfully initiated";
            angular.forEach($scope.CashCollectionEntries, function (value, key) {
                var entry = {};
                entry.accountNumber = value.OutletAccount.accountNumber;
                entry.amount = value.amount;
                CashCollectionRequest.accounts.push(entry);
            });
            console.log("CashCollectionRequest:", angular.toJson(CashCollectionRequest));
            $scope.progressBar = $rootScope.showProgress();
            DataService.submitCollectionRequest(CashCollectionRequest).then(function (response) {
                console.log("CashCollectionRequest:", response.data.data);
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', "Cash Collection Request successfully submitted.");
                $window.location = '#/CashCollectionRequests';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    var errors = "";
                    if (error.data.data) {
                        errors = " [";
                        angular.forEach(error.data.data, function (value, key) {
                            errors = errors + value + ",";
                        });
                        errors = errors + "]";
                    }
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
                }
            });
        };
        $scope.loadCustomerOutlets();
    }])
    .controller('OfflineRequestCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $timeout, $q) {
//                 $scope.CashCollection = {};
//                 $scope.CollectionEntry = {};
//                 $scope.CashCollectionEntries = [];
//                 $scope.EnteredCurrencyCodes = [];
//                 var yesterday = new Date();
//                 yesterday.setDate(yesterday.getDate() - 1);
//                 $scope.CashCollection.vehicleQty = 1;
//                 $scope.CashCollection.requestTime = {date: yesterday, dateOptions: {maxDate: new Date()}, timepickerOptions: {min: null}};
//                 $scope.CashCollection.prefCollectionTime = {date: yesterday, dateOptions: {maxDate: new Date()}, timepickerOptions: {min: null}};
//                 $scope.CashCollection.actCollectionTime = {date: yesterday, dateOptions: {maxDate: new Date()}, timepickerOptions: {min: null}};
//                 $scope.resetFilter = function () {
//                     $scope.CashCollection = {};
//                     var startDate = new Date();
//                     startDate.setDate(1);
//                     $scope.CashCollection.dateFrom = startDate;
//                     $scope.CashCollection.dateTo = new Date();
//                     $scope.loadCITAgents();
//                 };
//                 $scope.setRequestToday = function () {
//                     $scope.CashCollection.requestTime.date = new Date();
//                 };
//                 $scope.setCollectionToday = function () {
//                     $scope.CashCollection.prefCollectionTime.date = new Date();
//                 };
//                 $scope.setActCollectionToday = function () {
//                     $scope.CashCollection.actCollectionTime.date = new Date();
//                 };
//                 $scope.CustomerNameChange = function () {
//                     $scope.loadCustomerOutlets($scope.CashCollection.customerId);
//                 };
//                 $scope.CustomerOutletChange = function () {
//                     if ($scope.CashCollection.CustomerOutlet) {
//                         $scope.loadOutletAccounts($scope.CashCollection.CustomerOutlet.outletId);
//                         $scope.CashCollectionEntries = [];
//                     }
//                 };
//                 $scope.currencyChange = function () {
//                     $scope.OutletCurrencyAccounts = [];
//                     angular.forEach($scope.OutletAccounts, function (value, key) {
//                         var currencyCode = value.currency ? value.currency.currencyCode : '';
//                         if (currencyCode === $scope.CollectionEntry.Currency.currencyCode) {
//                             console.log('OutletCurrencyAccount:', value);
//                             $scope.OutletCurrencyAccounts.push(value);
//                         }
//                     });
//                 };
//                 $scope.fetchCurrencies = function () {
//                     var currencies = [];
//                     angular.forEach($scope.Currencies, function (value, key) {
//                         if ($scope.EnteredCurrencyCodes.indexOf(value.currencyCode) === -1) {
//                             currencies.push(value);
//                         } else if ($scope.CollectionEntry.hasOwnProperty('entryId')) {
//                             if ($scope.CollectionEntry.Currency === value) {
//                                 currencies.push(value);
//                             }
//                         }
//                     });
//                     return currencies;
//                 };
//                 $scope.addCollectionEntry = function () {
//                     if (!$scope.CollectionEntry.amount || !$scope.CollectionEntry.OutletAccount) {
//                         $rootScope.alertDialog('Fill in all the required fields!');
//                         return;
//                     }
//
//                     if (!$scope.CollectionEntry.hasOwnProperty('entryId')) {
//                         $scope.CollectionEntry.entryId = $scope.CashCollectionEntries.length + 1;
//                         $scope.CashCollectionEntries.push($scope.CollectionEntry);
//                         $scope.EnteredCurrencyCodes.push($scope.CollectionEntry.Currency.currencyCode);
//                     }
//                     $scope.closeAndclear(true);
//                 };
//                 $scope.editCollectionEntry = function (index) {
//                     $scope.CollectionEntryIndex = index;
//                     $scope.CollectionEntry = $scope.CashCollectionEntries[$scope.CollectionEntryIndex];
//                     $scope.OrigCollectionEntry = angular.copy($scope.CollectionEntry);
//                     $scope.currencyChange();
//                     $scope.showDlg();
//                 };
//                 $scope.removeCollectionEntry = function (index) {
//                     $scope.CashCollectionEntries.splice(index, 1);
//                     $scope.EnteredCurrencyCodes.splice(index, 1);
//                 };
//                 $scope.showDlg = function () {
//                     if (!$scope.CashCollection.CustomerOutlet) {
//                         $rootScope.alertDialog('Please select an Outlet first!');
//                     } else {
//                         $scope.ShowEntryDlg = true;
//                     }
//                 };
//                 $scope.closeAndclear = function (recordSaved) {
//                     if (!recordSaved && $scope.OrigCollectionEntry) {
//                         $scope.CashCollectionEntries.push($scope.OrigCollectionEntry);
//                         $scope.CashCollectionEntries.splice($scope.CollectionEntryIndex, 1);
//                     }
//                     delete $scope.OrigCollectionEntry;
//                     $scope.CollectionEntry = {};
//                     $scope.ShowEntryDlg = false;
//                 };
//                 $scope.searchCustomer = function (keyword) {
//                     var deferred = $q.defer();
//                     $timeout(function () {
//                         var results = [];
//                         DataService.searchCustomer(keyword, "Approved").then(function (dataArray) {
//                             if (dataArray) {
//                                 results = dataArray.data.data.content;
//                                 deferred.resolve(results);
//                             }
//                         });
//                     }, 100);
//                     return deferred.promise;
//                 };
//                 $scope.loadCustomerOutlets = function (customerId) {
//                     $scope.progressBar = $rootScope.showProgress();
//                     DataService.getCustomerOutlets(customerId).then(function (response) {
//                         console.log("Customer Outlets Data:", response.data.data);
//                         $scope.CustomerOutlets = response.data.data.content;
//                         //$scope.progressBar.close();
//                         $scope.loadCurrencies();
//                     }, function (error) {
//                         console.log("Error", error);
//                         $scope.progressBar.close();
//                         if (error.status === -1) {
//                             $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
//                         } else if (error.status === 401) {
//                             $rootScope.expiredToken();
//                         } else if (error.status === 403) {
//                             $rootScope.notify('error', 'Error', error.data.message);
//                             $window.location = '#/Error';
//                         } else {
//                             $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
//                         }
//                     });
//                 };
//                 $scope.loadOutletAccounts = function (outletId) {
//                     $scope.progressBar = $rootScope.showProgress();
//                     DataService.getOutletAccountsByUser(outletId).then(function (response) {
//                         console.log("Customer Accounts Data:", response.data);
//                         $scope.OutletAccounts = response.data.data;
//                         //$rootScope.setPaginationParams(response.data.data);
//                         $scope.progressBar.close();
//                     }, function (error) {
//                         console.log("Error", error);
//                         $scope.progressBar.close();
//                         if (error.status === -1) {
//                             $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
//                         } else if (error.status === 401) {
//                             $rootScope.expiredToken();
//                         } else if (error.status === 403) {
//                             $rootScope.notify('error', 'Error', error.data.message);
//                             $window.location = '#/Error';
//                         } else {
//                             $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
//                         }
//                     });
//                 };
//                 $scope.loadCurrencies = function () {
//                     //$scope.progressBar = $rootScope.showProgress();
//                     DataService.getCurrencies().then(function (response) {
//                         console.log("Resp:", response.data);
//                         $scope.Currencies = response.data.data.content;
//                         $rootScope.setPaginationParams(response.data.data);
//                         $scope.progressBar.close();
//                     }, function (error) {
//                         console.log("Error", error);
//                         $scope.progressBar.close();
//                         if (error.status === -1) {
//                             $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
//                         } else if (error.status === 401) {
//                             $rootScope.expiredToken();
//                         } else if (error.status === 403) {
//                             $rootScope.notify('error', 'Error', error.data.message);
//                             $window.location = '#/Error';
//                         } else {
//                             $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
//                         }
//                     });
//                 };
//                 $scope.loadCITAgents = function () {
//                     $scope.progressBar = $rootScope.showProgress();
//                     DataService.getCITAgents("Approved", $scope.CashCollection).then(function (response) {
//                         console.log("Agents Data:", response.data.data);
//                         $scope.CITAgents = response.data.data.content;
//                         $rootScope.setPaginationParams(response.data.data);
//                         $scope.progressBar.close();
//                         $scope.ShowForwardDlg = true;
//                     }, function (error) {
//                         console.log("Error", error);
//                         $scope.progressBar.close();
//                         if (error.status === -1) {
//                             $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
//                         } else if (error.status === 401) {
//                             $rootScope.expiredToken();
//                         } else if (error.status === 403) {
//                             $rootScope.notify('error', 'Error', error.data.message);
//                             $window.location = '#/Error';
//                         } else {
//                             $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
//                         }
//                     });
//                 };
//                 $scope.submitOfflineRequest = function () {
//                     if (!$scope.OfflineCollectionForm.$valid) {
//                         return;
//                     }
//
//                     if ($scope.CashCollectionEntries.length < 1) {
//                         $rootScope.alertDialog('You must add atleast one Offline Cash Collection Transaction!');
//                         return;
//                     }
//
//                     var OfflineCollectionRequest = {};
//                     OfflineCollectionRequest.outletId = $scope.CashCollection.CustomerOutlet.outletId;
//                     OfflineCollectionRequest.citAgentId = $scope.CashCollection.citAgentId;
//                     OfflineCollectionRequest.transactions = [];
//                     OfflineCollectionRequest.prefCollectionTime = $scope.CashCollection.prefCollectionTime.date;
//                     OfflineCollectionRequest.requestTime = $scope.CashCollection.requestTime.date;
//                     OfflineCollectionRequest.collectionTime = $scope.CashCollection.actCollectionTime.date;
//                     OfflineCollectionRequest.completionTime = $scope.CashCollection.requestTime.date;
//                     OfflineCollectionRequest.description = $scope.CashCollection.description ? $scope.CashCollection.description : "Offline Cash Collection Request";
// //                    OfflineCollectionRequest.requestById = 1;
//                     OfflineCollectionRequest.totalValue = $scope.CashCollection.totalValue;
//                     OfflineCollectionRequest.vehicleQty = $scope.CashCollection.vehicleQty;
//                     angular.forEach($scope.CashCollectionEntries, function (value, key) {
//                         var entry = {};
//                         entry.accountNumber = value.OutletAccount.accountNumber;
//                         entry.trxValue = value.amount;
//                         entry.currencyCode = value.Currency.currencyCode;
//                         entry.description = '';
//                         OfflineCollectionRequest.transactions.push(entry);
//                     });
//                     console.log("Offline CashCollectionRequest:", angular.toJson(OfflineCollectionRequest));
//                     $scope.progressBar = $rootScope.showProgress();
//                     DataService.submitOfflineRequest(OfflineCollectionRequest).then(function (response) {
//                         console.log("Offline CashCollectionRequest:", response.data.data);
//                         $scope.progressBar.close();
//                         $rootScope.notify('success', 'Success', "Offline Cash Collection Request successfully saved.");
//                         $window.location = '#/CashCollectionRequests';
//                     }, function (error) {
//                         console.log("Error", error);
//                         $scope.progressBar.close();
//                         if (error.status === -1) {
//                             $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
//                         } else if (error.status === 401) {
//                             $rootScope.expiredToken();
//                         } else if (error.status === 403) {
//                             $rootScope.notify('error', 'Error', error.data.message);
//                             $window.location = '#/Error';
//                         } else {
//                             var errors = "";
//                             if (error.data.data) {
//                                 errors = " [";
//                                 angular.forEach(error.data.data, function (value, key) {
//                                     errors = errors + value + ",";
//                                 });
//                                 errors = errors + "]";
//                             }
//                             $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
//                         }
//                     });
//                 };
//                 $scope.resetFilter();
    }])
    .controller('ListCollectionRequestCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$location', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $location, $timeout, $q) {
        $scope.RequestFilter = {};
        $scope.ShowRequestView = false;
        $scope.CollectionRequestForms = {};
        $scope.requestStages = {"Initiated": 1, "Forwarded": 2, "Crew Scheduled": 3, "Crew Confirmed": 4, "Tallied": 5, "Posted": 6};
        $scope.CurrentTab = 1;
        if ($location.$$path === '/OfflineRequests') {
            $scope.PageParams = {title: "Offline Cash Collections", breadCrumb: "Offline Requests", requestStage: null, processRequests: false, requestType: "Offline"};
        } else if ($location.$$path === '/ForwardRequests') {
            $scope.PageParams = {title: "Forward Requests to CIT Agent", breadCrumb: "Forward to CIT", requestStage: "Initiated", processRequests: true};
        } else if ($location.$$path === '/ScheduleCrew') {
            $scope.PageParams = {title: "CIT Crew Scheduling", breadCrumb: "Crew Scheduling", requestStage: "Forwarded", processRequests: true};
        } else if ($location.$$path === '/ConfirmCrewSchedule') {
            $scope.PageParams = {title: "Confirm Crew Scheduling", breadCrumb: "Confirm Crew Scheduling", requestStage: "Crew Scheduled", processRequests: true};
        } else if ($location.$$path === '/InputTally') {
            $scope.PageParams = {title: "Input Counted Cash", breadCrumb: "Counted Cash Entry", requestStage: "Crew Confirmed", processRequests: true};
        } else if ($location.$$path === '/MyRequests') {
            $scope.PageParams = {title: "My Cash Collection Requests", breadCrumb: "My Requests", requestStage: null, processRequests: false};
        } else {
            $scope.PageParams = {title: "Cash Collection Requests", breadCrumb: "All Requests", requestStage: null, processRequests: false};
        }

        $scope.resetFilter = function () {
            $scope.RequestFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
//                    $scope.RequestFilter.dateFrom = startDate;
//                    $scope.RequestFilter.dateTo = new Date();
            $scope.RequestFilter.dateFrom = "";
            $scope.RequestFilter.dateTo = "";
            $scope.listCollectionRequests();
            //$scope.loadCITAgents();
        }

        $scope.loadCITAgents = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITAgents("Approved", {}).then(function (response) {
                console.log("Agents Data:", response.data.data);
                $scope.CITAgents = response.data.data.content;
                $scope.progressBar.close();
                $scope.ShowForwardDlg = true;
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.DownloadReport = function (outputFormat) {
            DataService.getCollectionRequestsListDoc(null, $scope.PageParams.requestStage, $scope.RequestFilter, "", outputFormat);
        };
        $scope.listCollectionRequests = function (outputFormat) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCollectionRequests(null, $scope.PageParams.requestStage, $scope.RequestFilter, "", outputFormat).then(function (response) {
                $scope.progressBar.close();
                if (outputFormat) {
                    $rootScope.exportReport(response.data, outputFormat, 'Collection Requests');
                } else {
                    console.log("Collection Requests Data:", response.data.data);
                    $scope.CollectionRequests = response.data.data.content;
                    $rootScope.setPaginationParams(response.data.data);
                    $scope.switchTab('Main');
                }
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.processRequest = function (postData, object) {
            switch ($scope.requestStage) {
                case 1: //Forward to CIT Agent
                    if ($scope.CollectionRequest.requestStatus === "Cancelled") {
                        $rootScope.notify('error', 'Error', "Request Cancelled. This request cannot be forwarded to CIT");
                    } else {
                        if (postData) {
                            if (!$scope.CollectionRequest.hasOwnProperty("citAgentId")) {
                                $rootScope.notify('warning', 'Warning', "Please select a CIT Agent")
                                return;
                            }
                            $scope.closeDialog();
                            $scope.CollectionRequest.notes = $scope.CollectionRequest.notes === undefined ? "" : $scope.CollectionRequest.notes;
                            $scope.progressBar = $rootScope.showProgress();
                            DataService.forwardRequest($scope.CollectionRequest).then(function (response) {
                                console.log("Forward Request Response:", response.data.data);
                                $scope.progressBar.close();
                                if (response.data.code !== 200) {
                                    $rootScope.notify('info', 'Info', response.data.message);
                                } else {
                                    $rootScope.notify('success', 'Success', "Cash Collection Request successfully forward to CIT Agent.");
                                    $scope.listCollectionRequests();
                                }
                            }, function (error) {
                                console.log("Error", error);
                                $scope.progressBar.close();
                                if (error.status === -1) {
                                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                                } else if (error.status === 401) {
                                    var invalidToken = error.data ? error.data.error : "";
                                    if (invalidToken === "invalid_token") {
                                        $rootScope.expiredToken();
                                    } else {
                                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                                    }
                                } else if (error.status === 403) {
                                    $rootScope.notify('error', 'Error', error.data.message);
                                    $window.location = '#/Error';
                                } else {
                                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                                }
                            });
                        } else {
                            $scope.loadCITAgents();
                        }
                    }
                    break;
                case 2: //Crew Scheduling
                    if (postData) {
                        $scope.CITCrewAllocation = {};
                        if (!$scope.CollectionRequestForms.CrewScheduleForm.$valid) {
                            $rootScope.alertDialog('Please specify all crew!');
                            return;
                        }

                        $scope.CITCrewAllocation.allocations = $scope.CITCrewAllocations;
                        console.log("CITCrewAllocation:", angular.toJson($scope.CITCrewAllocation));
//                                return;
                        $scope.progressBar = $rootScope.showProgress();
                        DataService.scheduleCITCrew($scope.CITCrewAllocation).then(function (response) {
                            console.log("Crew Schedule Request Response:", response.data.data);
                            $scope.progressBar.close();
                            $scope.ShowCrewSchedule = false;
                            if (response.data.code !== 200) {
                                $rootScope.notify('info', 'Info', response.data.message);
                            } else {
                                $rootScope.notify('success', 'Success', "CIT Crew successfully scheduled.");
                                $scope.listCollectionRequests();
                            }
                            $scope.closeDialog();
                        }, function (error) {
                            console.log("Error", error);
                            $scope.progressBar.close();
                            if (error.status === -1) {
                                $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                            } else if (error.status === 401) {
                                var invalidToken = error.data ? error.data.error : "";
                                if (invalidToken === "invalid_token") {
                                    $rootScope.expiredToken();
                                } else {
                                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                                }
                            } else if (error.status === 403) {
                                $rootScope.notify('error', 'Error', error.data.message);
                                $window.location = '#/Error';
                            } else {
                                $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                            }
                        });
                    } else {
                        $scope.CITCrewAllocations = [];
                        for (var i = 0; i < $scope.CollectionRequest.vehicleQty; i++) {
                            var CITCrewAllocation = {requestId: $scope.CollectionRequest.requestId};
                            $scope.CITCrewAllocations.push(CITCrewAllocation);
                        }
                        $scope.ShowCrewSchedule = true;
                    }
                    break;
                case 3: //Crew Schedule confirmation
                    if (postData) {
                        $scope.closeDialog();
                        $scope.CITCrewAllocation = object;
                        $scope.CITCrewAllocation.notes = $scope.CITCrewAllocation.notes === undefined ? "" : $scope.CITCrewAllocation.notes;
                        $scope.progressBar = $rootScope.showProgress();
                        DataService.confirmCITCrewschedule($scope.CITCrewAllocation).then(function (response) {
                            console.log("Confirm Crew Schedule Request Response:", response.data.data);
                            $scope.progressBar.close();
                            $scope.ShowConfirmCrew = false;
                            if (response.data.code !== 200) {
                                $rootScope.notify('info', 'Info', response.data.message);
                            } else {
                                $rootScope.notify('success', 'Success', "CIT Crew Schedule successfully confirmed.");
                                $scope.listCollectionRequests();
                            }
                        }, function (error) {
                            console.log("Error", error);
                            $scope.progressBar.close();
                            if (error.status === -1) {
                                $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                            } else if (error.status === 401) {
                                var invalidToken = error.data ? error.data.error : "";
                                if (invalidToken === "invalid_token") {
                                    $rootScope.expiredToken();
                                } else {
                                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                                }
                            } else if (error.status === 403) {
                                $rootScope.notify('error', 'Error', error.data.message);
                                $window.location = '#/Error';
                            } else {
                                $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                            }
                        });
                    } else {
                        $scope.ShowConfirmCrew = true;
                    }
                    break;
                case 4: //Input counted cash
                    $scope.ShowTallyDlg = false;
                    if (postData) {
                        $scope.CollectionTransaction = object;
                        $scope.TalliedInput = {};
                        console.log("CollectionTransaction", $scope.CollectionTransaction);
                        var coinage = [];
                        angular.forEach($scope.CollectionTransaction.Currency.cmsCurrencyDenominationList, function (value, key) {
                            var denominationInput = {};
                            denominationInput.trxId = $scope.CollectionTransaction.trxId;
                            denominationInput.denomination = value.denomination;
                            if (value.hasOwnProperty('units')) {
                                denominationInput.units = parseInt(value.units);
                                denominationInput.totalValue = parseInt(value.units) * value.denomination;
                            } else if (value.hasOwnProperty('value')) {
                                denominationInput.units = (value.value / value.denomination);
                                denominationInput.totalValue = value.value;
                            } else {
                                denominationInput.units = 0;
                                denominationInput.totalValue = 0;
                            }
                            coinage.push(denominationInput);
                        });
                        $scope.TalliedInput.denominationsCount = coinage;
                        console.log("TalliedInput", angular.toJson($scope.TalliedInput));
                        $scope.progressBar = $rootScope.showProgress();
                        DataService.inputTally($scope.TalliedInput).then(function (response) {
                            console.log("TalliedInput Response:", response.data.data);
                            $scope.progressBar.close();
                            $scope.CollectionTransaction.submitted = true;
                            if (response.data.code !== 200) {
                                $rootScope.notify('info', 'Info', response.data.message);
                            } else {
                                $rootScope.notify('success', 'Success', "Input successfully submitted.");
                            }
                        }, function (error) {
                            console.log("Error", error);
                            $scope.progressBar.close();
                            if (error.status === -1) {
                                $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                            } else if (error.status === 401) {
                                var invalidToken = error.data ? error.data.error : "";
                                if (invalidToken === "invalid_token") {
                                    $rootScope.expiredToken();
                                } else {
                                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                                }
                            } else if (error.status === 403) {
                                $rootScope.notify('error', 'Error', error.data.message);
                                $window.location = '#/Error';
                            } else {
                                $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                            }
                        });
                    } else {
                        $scope.ShowRequestTrx = true;
                        $window.scrollTo(0, 0);
                    }
                    break;
                case 5: //Confirm transaction requests
                    if (postData) {
                        $scope.CollectionTransaction = object;
                        console.log($scope.collectionrequestid)
                        $scope.ShowConfirmDlg = false;
                        $scope.CollectionTransaction.notes = $scope.CollectionTransaction.notes === undefined ? "" : $scope.CollectionTransaction.notes;
                        $scope.CollectionTransaction.confirmed = true;
                        console.log("CollectionTransaction", angular.toJson($scope.CollectionTransaction));
                        $scope.progressBar = $rootScope.showProgress();
                        DataService.confirmCollectionTrx($scope.CollectionTransaction, $scope.collectionrequestid).then(function (response) {
                            console.log("Confirm Collection Trx Response:", response.data.data);
                            $scope.progressBar.close();
                            $scope.CollectionTransaction.confirmed = true;
                            if (response.data.code !== 200) {
                                $rootScope.notify('info', 'Info', response.data.message);
                            } else {
                                $rootScope.notify('success', 'Success', "Cash Collection Transaction successfully confirmed.");
                                $scope.listCollectionRequests();
                            }
                        }, function (error) {
                            console.log("Error", error);
                            $scope.progressBar.close();
                            if (error.status === -1) {
                                $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                            } else if (error.status === 401) {
                                var invalidToken = error.data ? error.data.error : "";
                                if (invalidToken === "invalid_token") {
                                    $rootScope.expiredToken();
                                } else {
                                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                                }
                            } else if (error.status === 403) {
                                $rootScope.notify('error', 'Error', error.data.message);
                                $window.location = '#/Error';
                            } else {
                                $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                            }
                        });
                    } else {
                        $scope.ShowRequestTrx = true;
                        $window.scrollTo(0, 0);
                    }
                    break;
            }
        };
        $scope.showTrxConfirm = function (CollectionTransaction) {
            $scope.CollectionTransaction = CollectionTransaction;
            $scope.ShowConfirmDlg = true;
        };
        $scope.inputTally = function (CollectionTransaction) {
            $scope.CollectionTransaction = CollectionTransaction;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCurrency($scope.CollectionTransaction.currencyCode.currencyCode).then(function (response) {
                console.log("Get Currency Response:", response.data.data);
                $scope.CollectionTransaction.Currency = response.data.data;
                $scope.progressBar.close();
                $scope.ShowTallyDlg = true;
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    var invalidToken = error.data ? error.data.error : "";
                    if (invalidToken === "invalid_token") {
                        $rootScope.expiredToken();
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.amendTrxAmount = function (CollectionTransaction, saveRecord) {
            if (!saveRecord) {
                $scope.CollectionTransaction = CollectionTransaction;
                $scope.ShowAmendDlg = true;
            } else {
                if ($scope.CollectionTransaction.trxValue < 1) {
                    $rootScope.alertDialog('Please enter amount!');
                    return;
                }
                $scope.closeDialog();
                $scope.progressBar = $rootScope.showProgress();
                DataService.amendTrxAmount($scope.CollectionTransaction).then(function (response) {
                    console.log("Amend Amount Response:", response.data.data);
                    $scope.progressBar.close();
                    $rootScope.notify('success', 'Success', "Transaction amount successfully updated.");
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    $scope.viewCollectionRequest($scope.CollectionRequest.requestId);
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        var invalidToken = error.data ? error.data.error : "";
                        if (invalidToken === "invalid_token") {
                            $rootScope.expiredToken();
                        } else {
                            $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                        }
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            }
        };
        $scope.cancelRequest = function (postData) {
            if (!postData) {
                $scope.ShowCancelDlg = true;
            } else {
                if (!$scope.CollectionRequest.reason) {
                    $rootScope.alertDialog('Please specify a reason for request cancellation!');
                    return;
                }
                $scope.closeDialog();
                $scope.progressBar = $rootScope.showProgress();
                DataService.cancelRequest($scope.CollectionRequest).then(function (response) {
                    console.log("Cancel Request Response:", response.data.data);
                    $scope.progressBar.close();
                    $rootScope.notify('success', 'Success', "Cash Collection Request successfully cancelled.");
                    $scope.listCollectionRequests();
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        var invalidToken = error.data ? error.data.error : "";
                        if (invalidToken === "invalid_token") {
                            $rootScope.expiredToken();
                        } else {
                            $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                        }
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            }
        };
        $scope.closeDialog = function () {
            if ($scope.ShowAmendDlg) {
                $scope.ShowAmendDlg = false;
            }
            if ($scope.ShowCancelDlg) {
                $scope.ShowCancelDlg = false;
            }
            if ($scope.ShowForwardDlg) {
                $scope.ShowForwardDlg = false;
            }
            if ($scope.ShowCrewSchedule) {
                $scope.ShowCrewSchedule = false;
            }
            if ($scope.ShowCrewSchedule) {
                $scope.ShowCrewSchedule = false;
            }
            if ($scope.ShowRequestTrx) {
                $scope.ShowRequestTrx = false;
            }
            if ($scope.ShowConfirmDlg) {
                $scope.ShowConfirmDlg = false;
            }
        };
        $scope.getInputTotals = function (CurrencyDenominationList, returnType) {
            if (!CurrencyDenominationList) {
                return 0;
            }
            var units = 0;
            var amount = 0.0;
            angular.forEach(CurrencyDenominationList, function (value, key) {
                if (value.hasOwnProperty('units')) {
                    units = units + parseInt(value.units);
                    amount = amount + (value.denomination * parseInt(value.units));
                } else if (value.hasOwnProperty('value')) {
                    units = units + (value.value / value.denomination);
                    amount = amount + value.value;
                }
            });
            return returnType === 'units' ? units : amount;
        };
        $scope.viewCollectionRequest = function (CollectionRequest) {
            $scope.progressBar = $rootScope.showProgress();
            $scope.collectionrequestid = CollectionRequest.requestId;
            DataService.getCollectionRequestDetails(CollectionRequest.requestId).then(function (response) {
                console.log("Collection Request Data:", response.data.data);
                $scope.CollectionRequest = response.data.data;
                $scope.progressBar.close();
                $scope.requestStage = $scope.requestStages[$scope.CollectionRequest.requestStage];
                console.log("requestStageNo:" + $scope.requestStage, " requestStage:" + $scope.CollectionRequest.requestStage);
                $scope.requestStage = $scope.requestStage === undefined ? 1 : $scope.requestStage;
                $scope.switchTab('View');
                $scope.navigateTab(1);
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    var invalidToken = error.data ? error.data.error : "";
                    if (invalidToken === "invalid_token") {
                        $rootScope.expiredToken();
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.switchTab = function (tabName) {
            if (tabName === 'Main') {
                $scope.ShowRequestView = false;
            } else {
                $scope.ShowRequestView = true;
            }
            $window.scrollTo(0, 0);
        };
        $scope.navigateTab = function (tabId) {
            $scope.CurrentTab = tabId;
        };
        $scope.searchAsyncx = function (keyword, entity) {
            var deferred = $q.defer();
            $timeout(function () {
                var results = [];
                var promise = null;
                switch (entity) {
                    case 'Cashier':
                        promise = DataService.searchCITCrew(keyword, 4);
                        break;
                    case 'Driver':
                        promise = DataService.searchCITCrew(keyword, 3);
                        break;
                    case 'Commander':
                        promise = DataService.searchCITCrew(keyword, 2);
                        break;
                    case 'LeadCar':
                        promise = DataService.searchCITVehicle(keyword, 'Lead Car');
                        break;
                    case 'ChaseCar':
                        promise = DataService.searchCITVehicle(keyword, 'Chase Car');
                        break;
                    default:
                        break;
                }
                promise.then(function (dataArray) {
                    if (dataArray) {
                        results = dataArray.data.data.content;
                        deferred.resolve(results);
                    }
                });
            }, 100);
            return deferred.promise;
        };
        $scope.resetFilter();
    }])
    .controller('RequestReportCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$location', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $location, $timeout, $q) {
        $scope.ShowRequestView = false;
        $scope.requestStages = {"Initiated": 1, "Forwarded": 2, "Crew Scheduled": 3, "Crew Confirmed": 4, "Tallied": 5, "Posted": 6};
        $scope.CurrentTab = 1;
        if ($location.$$path === '/PendingRequests') {
            $scope.PageParams = {title: "Pending Collection Requests", breadCrumb: "Pending Requests", requestStatus: "Pending"};
        } else if ($location.$$path === '/CompletedRequest') {
            $scope.PageParams = {title: "Completed Collection Requests", breadCrumb: "Completed Requests", requestStatus: "Completed"};
        } else if ($location.$$path === '/CancelledRequests') {
            $scope.PageParams = {title: "Cancelled Collection Requests", breadCrumb: "Cancelled Requests", requestStatus: "Cancelled"};
        } else if ($location.$$path === '/OfflineRequests') {
            $scope.PageParams = {title: "Offline Collection Requests", breadCrumb: "Offline Requests", requestStatus: "Offline"};
        } else if ($location.$$path === '/AmendedRequests') {
            $scope.PageParams = {title: "Amended Collection Requests", breadCrumb: "Amended Requests", requestStatus: "Amended"};
        } else {
            $scope.PageParams = {title: "Detailed Collection Requests", breadCrumb: "Detailed Requests", requestStatus: null};
        }


        $scope.resetRequestFilter = function () {
            $scope.RequestFilter = {};
            $scope.RequestFilter.approvalStatus = {};
            $scope.RequestFilter.subscriptionStatus = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.RequestFilter.dateFrom = startDate;
            $scope.RequestFilter.dateTo = new Date();
            $scope.listCollectionRequests();
        };
        $scope.DownloadReport = function (outputFormat) {
            DataService.getRequestReportsListDoc($scope.PageParams.requestStatus, $scope.RequestFilter, outputFormat);
        };
        $scope.listCollectionRequests = function (outputFormat) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getRequestReports($scope.PageParams.requestStatus, $scope.RequestFilter, outputFormat).then(function (response) {
                $scope.progressBar.close();
                if (outputFormat) {
                    $rootScope.exportReport(response.data, outputFormat, 'Collection Requests');
                } else {
                    console.log("Collection Requests Data:", response.data.data);
                    $scope.CollectionRequests = response.data.data.content;
                    $rootScope.setPaginationParams(response.data.data);
                    $scope.switchTab('Main');
                }
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.viewCollectionRequest = function (CollectionRequest) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCollectionRequestDetails(CollectionRequest.requestId, $scope.RequestFilter).then(function (response) {
                console.log("Collection Request Data:", response);
                $scope.CollectionRequest = response.data.data;
                $scope.progressBar.close();
                $scope.requestStage = $scope.requestStages[$scope.CollectionRequest.requestStage];
                console.log("requestStageNo:" + $scope.requestStage, " requestStage:" + $scope.CollectionRequest.requestStage);
                $scope.requestStage = $scope.requestStage === undefined ? 1 : $scope.requestStage;
                $scope.switchTab('View');
                $scope.navigateTab(1);
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    var invalidToken = error.data ? error.data.error : "";
                    if (invalidToken === "invalid_token") {
                        $rootScope.expiredToken();
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.switchTab = function (tabName) {
            if (tabName === 'Main') {
                $scope.ShowRequestView = false;
            } else {
                $scope.ShowRequestView = true;
            }
            $window.scrollTo(0, 0);
        };
        $scope.navigateTab = function (tabId) {
            $scope.CurrentTab = tabId;
        };
        $scope.resetRequestFilter();
    }])
    .controller('TransactionReportCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$location', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $location, $timeout, $q) {
        $scope.ShowTransactionView = false;
        $scope.CurrentTab = 1;
        if ($location.$$path === '/PendingTransactions') {
            $scope.PageParams = {title: "Pending Transactions", breadCrumb: "Pending Transactions", trxStatus: "Pending"};
        } else if ($location.$$path === '/SuccesfulRequest') {
            $scope.PageParams = {title: "Successful Transactions", breadCrumb: "Successful Transactions", trxStatus: "Successful"};
        } else if ($location.$$path === '/CancelledTransactions') {
            $scope.PageParams = {title: "Cancelled Transactions", breadCrumb: "Cancelled Transactions", trxStatus: "Cancelled"};
        } else {
            $scope.PageParams = {title: "Detailed Transactions", breadCrumb: "Detailed Transactions", trxStatus: null};
        }

        $scope.resetTransactionFilter = function () {
            $scope.TransactionFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
//                    $scope.TransactionFilter.dateFrom = startDate;
//                    $scope.TransactionFilter.dateTo = new Date();
            $scope.TransactionFilter.dateFrom = "";
            $scope.TransactionFilter.dateTo = "";
            $scope.listTransactions();
        };
        $scope.DownloadReport = function (outputFormat) {
            DataService.getTransactionReportsListDoc($scope.PageParams.trxStatus, $scope.TransactionFilter, outputFormat);
        };
        $scope.listTransactions = function (outputFormat) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getTransactionReports($scope.PageParams.trxStatus, $scope.TransactionFilter, outputFormat).then(function (response) {
                $scope.progressBar.close();
                if (outputFormat) {
                    $rootScope.exportReport(response.data, outputFormat, 'Collection Requests');
                } else {
                    console.log("Transactions Report Data:", response.data.data);
                    $scope.Transactions = response.data.data.content;
                    $rootScope.setPaginationParams(response.data.data);
                    $scope.switchTab('Main');
                }
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.viewlistTransaction = function (trxId) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCollectionRequestDetails(trxId, $scope.TransactionFilter).then(function (response) {
                console.log("Transaction Data:", response.data.data);
                $scope.Transaction = response.data.data;
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    var invalidToken = error.data ? error.data.error : "";
                    if (invalidToken === "invalid_token") {
                        $rootScope.expiredToken();
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.switchTab = function (tabName) {
            if (tabName === 'Main') {
                $scope.ShowTransactionView = false;
            } else {
                $scope.ShowTransactionView = true;
            }
            $window.scrollTo(0, 0);
        };
        $scope.navigateTab = function (tabId) {
            $scope.CurrentTab = tabId;
        };
        $scope.resetTransactionFilter();
    }])
    .controller('SummaryReportCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$location', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $location, $timeout, $q) {

        $scope.resetSummaryFilter = function () {
            $scope.SummaryFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.SummaryFilter.dateFrom = startDate;
            $scope.SummaryFilter.dateTo = new Date();
            if ($location.$$path === '/CustomerPerformanceReport') {
                $scope.loadCustomerPerformanceReport();
            } else if ($location.$$path === '/CITAgentPerformanceReport') {
                $scope.loadCITAgentPerformanceReport();
            }
        };
        $scope.searchCITA = function (keyword) {
            var deferred = $q.defer();
            $timeout(function () {
                var results = [];
                DataService.searchCITA(keyword).then(function (dataArray) {
                    if (dataArray) {
                        results = dataArray.data.data.content;
                        deferred.resolve(results);
                    }
                });
            }, 100);
            return deferred.promise;
        };
        $scope.searchCustomer = function (keyword) {
            var deferred = $q.defer();
            $timeout(function () {
                var results = [];
                DataService.searchCustomer(keyword, "").then(function (dataArray) {
                    if (dataArray) {
                        results = dataArray.data.data.content;
                        deferred.resolve(results);
                    }
                });
            }, 100);
            return deferred.promise;
        };
        $scope.DownloadReport = function (outputFormat) {
            DataService.getCustomerPerformanceReportListDoc($scope.SummaryFilter, outputFormat);
        };
        $scope.loadCustomerPerformanceReport = function (outputFormat) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerPerformanceReport($scope.SummaryFilter, outputFormat).then(function (response) {
                $scope.progressBar.close();
                if (outputFormat) {
                    $rootScope.exportReport(response.data, outputFormat, 'CustomerPerformance');
                } else {
                    console.log("Customer Performance Report Data:", response.data.data);
                    $scope.CustomerPerformanceReport = response.data.data.customerPerformance.content;
                    $scope.TotalAmount = response.data.data.totalAmount;
                    $rootScope.setPaginationParams(response.data.data.customerPerformance);
                    $window.scrollTo(0, 0);
                }
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.DownloadReportCITPerformance = function (outputFormat) {
            DataService.getCITAgentPerformanceReportListDoc($scope.SummaryFilter, outputFormat);
        };
        $scope.loadCITAgentPerformanceReport = function (outputFormat) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITAgentPerformanceReport($scope.SummaryFilter, outputFormat).then(function (response) {
                $scope.progressBar.close();
                if (outputFormat) {
                    $rootScope.exportReport(response.data, outputFormat, 'CitPerformance');
                } else {
                    console.log("CIT Agent Performance Report Data:", response.data.data);
                    $scope.CITAgentPerformanceReport = response.data.data.content;
                    $rootScope.setPaginationParams(response.data.data);
                    $window.scrollTo(0, 0);
                }
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        if ($location.$$path === '/CustomerPerformanceReport') {
            $scope.resetSummaryFilter();
        } else if ($location.$$path === '/CITAgentPerformanceReport') {
            $scope.resetSummaryFilter();
        }
    }])

    .controller('MessageReportCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$location', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $location, $timeout, $q) {
        $scope.resetMessagesFilter = function () {
            $scope.MessageFilter = {};
//                    var startDate = new Date();
//                    startDate.setDate(1);
//                    $scope.MessageFilter.dateFrom = startDate;
//                    $scope.MessageFilter.dateTo = new Date();
            $scope.loadMessagesReport();
        };
        $scope.loadMessagesReport = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getMessageTemplate($scope.MessageFilter).then(function (response) {
                console.log("Message Report Data:", response.data.data.content);
                $scope.Messages = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.resetMessagesFilter()
    }])
    .controller('SystemUserCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $timeout, $q) {


        DataService.getUserTypes().then(function (response) {
            console.log("User Types Data:", response);
            $scope.UserTypes = response.data.data;
            console.log("usertype options", $scope.UserTypes)
            $scope.progressBar.close();
            $window.scrollTo(0, 0);
        }, function (error) {
            console.log("Error", error);
            $scope.progressBar.close();
            if (error.status === -1) {
                $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
            } else if (error.status === 401) {
                $rootScope.expiredToken();
            } else if (error.status === 403) {
                $rootScope.notify('error', 'Error', error.data.message);
                $window.location = '#/Error';
            } else {
                $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
            }
        });



        $scope.userTypeChange = function (SystemUser) {
            switch (SystemUser) {
                case 2:
                    $scope.loadDepartments();
                    break;
                case 3:
                case 5:
                    $scope.loadCITAgents();
                    break;
                case 4:
                    break;
            }
        };
        $scope.loadUserRoles = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getRoles(["Approved", "Rejected"], "").then(function (response) {
                console.log("User Roles Data:", response.data);
                $scope.UserRoles = response.data.data.content;
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadCITAgents = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCITAgents(["Approved", "Rejected"], "").then(function (response) {
                console.log("Agents Data:", response.data.data);
                $scope.CITAgents = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };

        $scope.searchCustomer = function (keyword) {
            var deferred = $q.defer();
            $timeout(function () {
                var results = [];
                DataService.searchCustomer(keyword, ["Approved", "Rejected"]).then(function (dataArray) {
                    if (dataArray) {
                        results = dataArray.data.data.content;
                        deferred.resolve(results);
                    }
                });
            }, 100);
            return deferred.promise;
        };

        $scope.loadDepartments = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getDepartments(true).then(function (response) {
                console.log("Departments Data:", response.data);
                $scope.Departments = response.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };

        $scope.departmentChange = function(departmentId){
            console.log("selected department", departmentId)
            $scope.departmentId = departmentId;
        };

        $scope.saveSystemUser = function () {
            if (!$scope.CreateNewUser.$valid) {
                console.log($scope.SystemUser.dob)
                return;
            }
            $scope.SystemUser.departmentId = $scope.departmentId;
            $scope.progressBar = $rootScope.showProgress();
            DataService.saveUser($scope.SystemUser).then(function (response) {
                console.log("User creation resp:", response);
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', "System User successfully created.");
                $window.location = '#/SystemUsers';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    var errors = "";
                    if (error.data.data) {
                        errors = " [";
                        angular.forEach(error.data.data, function (value, key) {
                            errors = errors + value + ",";
                        });
                        errors = errors + "]";
                    }
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
                }
            });
        };
        $scope.loadDepartments();
    }])
    .controller('ApproveSystemUserCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$localStorage', function ($rootScope, $scope, DataService, $window, $localStorage) {
//                $scope.UserFilter = {};
        $scope.SystemUserApproval = {action: "approved"};
        $scope.resetUserFilter = function () {
            $scope.UserFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.UserFilter.dateFrom = startDate;
            $scope.UserFilter.dateTo = new Date();
            $scope.listUnapprovedUsers();
        }

        $scope.ShowChanges = function (SystemUser) {
            $scope.ShowChange = true;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getUserChanges(SystemUser.userId).then(function (response) {
                console.log("Change Resp:", response.data.data);
                $scope.changes = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.listUnapprovedUsers = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getUsers('Unapproved', $scope.UserFilter).then(function (response) {
                console.log("Users Data:", response.data.data);
                $scope.UnapprovedSystemUsers = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                //Scroll top of page
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.approveSystemUsers = function () {
            if (!$scope.UserApprovalForm.$valid) {
                return;
            }

            var UserIds = [];
            for (var i = 0; i < $scope.UnapprovedSystemUsers.length; i++) {
                if ($scope.UnapprovedSystemUsers[i].isChecked) {
                    UserIds.push($scope.UnapprovedSystemUsers[i].userId);
                }
            }

            if (UserIds.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.SystemUserApproval.ids = UserIds;
                var SystemUserApprovaldata = {};
                SystemUserApprovaldata.ids = UserIds;
                SystemUserApprovaldata.notes = $scope.SystemUserApproval.notes;
                console.log($scope.SystemUserApproval.action);
                DataService.approveUsers(SystemUserApprovaldata, $scope.SystemUserApproval.action).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + UserIds.length + ") User(s) successfully " + $scope.SystemUserApproval.action + ".");
                        $scope.SystemUserApproval.notes = "";
                        $scope.progressBar.close();
                        $scope.listUnapprovedUsers();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnapprovedSystemUsers.length; i++) {
                if (!$scope.UnapprovedSystemUsers[i].isChecked) {
                    $scope.UnapprovedSystemUsers.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnapprovedSystemUsers.allItemsSelected = true;
        };
        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnapprovedSystemUsers.length; i++) {
                $scope.UnapprovedSystemUsers[i].isChecked = $scope.UnapprovedSystemUsers.allItemsSelected;
            }
        };
        $scope.resetUserFilter();
    }])
    .controller('ListSystemUserCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$localStorage', function ($rootScope, $scope, DataService, $window, $localStorage) {

        $scope.ShowUserView = false;
        $scope.SystemUserForm = false;
        $scope.CurrentTab = 1;
        $scope.resetUsersFilter = function () {
            $scope.UserFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.UserFilter.dateFrom = startDate;
            $scope.UserFilter.dateTo = new Date();
            $scope.listUsers();
        };

        DataService.getUserTypes().then(function (response) {
            console.log("User Types Data:", response);
            $scope.UserTypes = response.data.data;
            console.log("usertype options", $scope.UserTypes);
            $scope.progressBar.close();
            $window.scrollTo(0, 0);
        }, function (error) {
            console.log("Error", error);
            $scope.progressBar.close();
            if (error.status === -1) {
                $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
            } else if (error.status === 401) {
                $rootScope.expiredToken();
            } else if (error.status === 403) {
                $rootScope.notify('error', 'Error', error.data.message);
                $window.location = '#/Error';
            } else {
                $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
            }
        });

        $scope.listUsers = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getUserList().then(function (response) {
                console.log("Users Data:", response.data);
                $scope.SystemUsers = response.data;
                // $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                //Scroll top of page
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.exportUsers = function (format) {
            DataService.exportUsers($scope.UserFilter, format);
        };
        $scope.loadDepartments = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getDepartments(true).then(function (response) {
                console.log("Departments Data:", response.data.data);
                $scope.Departments = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadUserRoles = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getRoles("", $scope.UserFilter).then(function (response) {
                console.log("users assigned roles", response.data.data.content)
                $scope.UserRoles = response.data.data.content;
                $scope.progressBar.close();
                var userRoleIds = [];
                angular.forEach($scope.SystemUser.cmsUserRoleMapList, function (userRole, key) {
                    userRoleIds.push(userRole.roleId.roleId);
                });
                $scope.UnassignedRoles = [];
                angular.forEach($scope.UserRoles, function (userRole, key) {
                    if (userRoleIds.indexOf(userRole.roleId) === -1) {
                        $scope.UnassignedRoles.push(userRole);
                    }
                });
                //console.log("UnassignedRoles:", $scope.UnassignedRoles);
                $scope.ShowAssignRole = true;
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.saveSystemUser = function () {
            if (!$scope.UserViewForm.createUser.$valid) {
                return;
            }
            var roleids = [];
            angular.forEach($scope.Roles, function (role, key) {
                if (role.isChecked) {
                    roleids.push(role.roleId);
                }
            });
            console.log("role length", roleids.length)
            if (roleids.length < 1) {
                $rootScope.notify('warning', 'Warning', "Please select atleast one role");
                return;
            }
            var SystemUserUpdate = {};
            SystemUserUpdate.fullName = $scope.SystemUser.fullName;
            SystemUserUpdate.userType = $scope.SystemUser.userType === 'Bank User' ? 'Bank Operator' : $scope.SystemUser.userType;
            SystemUserUpdate.msisdn = $scope.SystemUser.msisdn;
            SystemUserUpdate.emailAddress = $scope.SystemUser.emailAddress;
            SystemUserUpdate.roleIds = roleids;
            if ($scope.SystemUser.departmentId) {
                SystemUserUpdate.departmentId = $scope.SystemUser.departmentId;
            }
            if ($scope.SystemUser.userId) {
                SystemUserUpdate.userId = $scope.SystemUser.userId;
            }
            if ($scope.SystemUser.citAgentId) {
                SystemUserUpdate.citAgentId = $scope.SystemUser.citAgentId;
            }
            if ($scope.SystemUser.customerId) {
                SystemUserUpdate.customerId = $scope.SystemUser.customerId;
            }
            console.log("SystemUser:", angular.toJson(SystemUserUpdate));
            $scope.progressBar = $rootScope.showProgress();
            DataService.saveUser(SystemUserUpdate).then(function (response) {
                console.log("User creation resp:", response.data.data);
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', $scope.SystemUser.userId !== undefined ? "System User successfully updated." : "System User successfully created.");
                $scope.switchTab('Main');
                $scope.listUsers();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    var errors = "";
                    if (error.data.data) {
                        errors = " [";
                        angular.forEach(error.data.data, function (value, key) {
                            errors = errors + value + ",";
                        });
                        errors = errors + "]";
                    }
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
                }
            });
        };
        $scope.viewUser = function (SystemUser, editMode) {
            if ($localStorage.loggedInUser.userId === SystemUser.userId) {
                $rootScope.notify('error', 'Error', "Unable to edit currently logged in user");
                return;
            } else {
                SystemUser.editMode = editMode;
                $scope.SystemUser = SystemUser;
                $scope.SystemUser.userType = $scope.SystemUser.userType === 'Bank Operator' ? 'Bank User' : $scope.SystemUser.userType;
                $scope.ShowUserView = true;
                if ($scope.SystemUser.editMode && $scope.SystemUser.userType === 'Bank User') {
                    $scope.loadDepartments();
                }
                var assignedRoles = [];
                angular.forEach($scope.SystemUser.cmsUserRoleMapList, function (value, key) {
                    assignedRoles.push(value.role.roleId);
                });
//                    $scope.progressBar = $rootScope.showProgress();
                DataService.getRoles("", "").then(function (response) {
                    console.log("All Roles Data:", response.data.data);
//                        $scope.progressBar.close();
                    $scope.Roles = response.data.data.content;
                    angular.forEach($scope.Roles, function (role, key) {

                        if (assignedRoles.indexOf(role.roleId) > -1) {
                            role.isChecked = true;
                        }

                    });
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            }
        };
//
        $scope.removeRole = function (index, UserRole) {
            var roleIds = [];
            roleIds.push(UserRole.role.roleId);
            $scope.SystemUser.roleIds = roleIds;
//                    $scope.SystemUser.roleIds = $scope.SystemUser.cmsUserRoleMapList.roleId;

            $scope.SystemUser.roleIds.splice(index, 1);
            console.log($scope.SystemUser.roleIds);
        };
        $scope.assignUserRole = function (postData) {
//                    if (postData) {
            var roleIds = [];
            angular.forEach($scope.UnassignedRoles, function (userRole, key) {
                if (userRole.isChecked) {
                    roleIds.push(userRole.roleId);
                }
            });
            $scope.SystemUser.roleIds = roleIds;
//                        $scope.progressBar = $rootScope.showProgress();
//                        DataService.assignUserRoles($scope.SystemUser, $scope.UserFilter).then(function (response) {
//                            console.log("Assgin User Roles resp:", response.data.data);
//                            $scope.progressBar.close();
//                            $scope.ShowAssignRole = false;
//                            $rootScope.notify('success', 'Success', "User Role(s) successfully assigned to user.");
//                            $scope.switchTab('Main');
//                            $scope.listUsers();
//                        }, function (error) {
//                            console.log("Error", error);
//                            $scope.progressBar.close();
//                            if (error.status === -1) {
//                                $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
//                            } else if (error.status === 401) {
//                                $rootScope.expiredToken();
//                            } else if (error.status === 403) {
//                                $rootScope.notify('error', 'Error', error.data.message);
//                                $window.location = '#/Error';
//                            } else {
//                                $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
//                            }
//                        });
//                    } else {
            $scope.loadUserRoles();
//                    }
        };
        $scope.switchTab = function (tabName) {

            if (tabName === 'Main') {
                $scope.ShowUserView = false;
            } else {
                $scope.ShowUserView = true;
            }
        };
        $scope.loadUserAuditLog = function (reset, outputFormat) {
            if (reset) {
                $scope.AuditFilter = {};
                var startDate = new Date();
                startDate.setDate(1);
                $scope.AuditFilter.dateFrom = startDate;
                $scope.AuditFilter.dateTo = new Date();
            }
            $scope.progressBar = $rootScope.showProgress();
            DataService.getAuditTrails($scope.AuditFilter, outputFormat, $scope.SystemUser.userId, "").then(function (response) {
                console.log("Audit trail:", response.data.data.content);
                $scope.progressBar.close();
                $scope.AuditTrail = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        }

        $scope.navigateTab = function (tabId) {
            $scope.CurrentTab = tabId;
            switch ($scope.CurrentTab) {
                case 1:
                    //$scope.loadUserRoles();
                    break;
                case 2:
                    $scope.loadUserAuditLog(true);
                    break;
            }
        };
        $scope.closeDlg = function () {
            $scope.ShowAssignRole = false;
        };
        //delete
        $scope.deleteSystemUser = function (SystemUser) {
            $scope.SystemUserForm = true;
            $scope.SystemUser = SystemUser;
            console.log("SystemUser", SystemUser)
        };
        $scope.closePopup = function () {
            $scope.SystemUserForm = false;
        };
        $scope.regionData = {};
        $scope.deleteSystemUsers = function () {
            if (!$scope.DeleteSystemUserForm.$valid) {
                return;
            }

            var ids = [];
            ids.push($scope.SystemUser.userId);
            var deleteSystemUserData = {};
            deleteSystemUserData.ids = ids;
            deleteSystemUserData.notes = $scope.SystemUser.notes;
            console.log(deleteSystemUserData);
            $scope.progressBar = $rootScope.showProgress();
            DataService.deleteUSER(deleteSystemUserData).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.SystemUser.fullName + ' successfully Deleted');
                $scope.progressBar.close();
                $scope.SystemUserForm = false;
                $scope.listUsers();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        //lock/unlock
        $scope.lockSystemUsers = function (SystemUser) {
            $scope.LockSystemUserForm = true;
            $scope.SystemUser = SystemUser;
            console.log("SystemUser", SystemUser)
        };
        $scope.lockUsers = function () {
            if (!$scope.LockSystemUserForms.$valid) {
                return;
            }

            var ids = [];
            ids.push($scope.SystemUser.userId);
            var lockSystemUserData = {};
            lockSystemUserData.ids = ids;
            lockSystemUserData.notes = $scope.SystemUser.notes;
            console.log(lockSystemUserData);
            $scope.progressBar = $rootScope.showProgress();
            console.log($scope.SystemUser.passwordStatus)
            DataService.lockUSER(lockSystemUserData, $scope.SystemUser.passwordStatus).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.SystemUser.fullName + ' successfully Actioned');
                $scope.progressBar.close();
                $scope.LockSystemUserForm = false;
                $scope.listUsers();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        //deactivate/activate
        $scope.deactivateSystemUser = function (SystemUser) {
            $scope.deactivateSystemUserForm = true;
            $scope.SystemUser = SystemUser;
            console.log("SystemUser", SystemUser)
        };
        $scope.deactivateUsers = function () {
            if (!$scope.deactivateSysUserForms.$valid) {
                return;
            }

            var ids = [];
            ids.push($scope.SystemUser.userId);
            var deactivateSystemUserData = {};
            deactivateSystemUserData.ids = ids;
            deactivateSystemUserData.notes = $scope.SystemUser.notes;
            console.log(deactivateSystemUserData);
            $scope.progressBar = $rootScope.showProgress();
            console.log($scope.SystemUser.status)
            DataService.deactivateUSER(deactivateSystemUserData, $scope.SystemUser.status).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.SystemUser.fullName + ' successfully Actioned');
                $scope.progressBar.close();
                $scope.deactivateSystemUserForm = false;
                $scope.listUsers();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.resetUsersFilter();
    }])
    .controller('UserRoleCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$localStorage', function ($rootScope, $scope, DataService, $window, $localStorage) {

        $scope.UserRoleForms = {};
        $scope.UserRoleApproval = {action: "approved", rejected: "rejected"};
        $scope.ShowRoleView = false;
        $scope.UserRoleForm = false;
        $scope.CurrentTab = 1;
        $scope.resetUsersRoleFilter = function () {
            $scope.RoleFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.RoleFilter.dateFrom = startDate;
            $scope.RoleFilter.dateTo = new Date();
            $scope.listUserRoles();
        }

        $scope.listUserRoles = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getRoles("", $scope.RoleFilter).then(function (response) {
                console.log("User Roles Data:", response.data.data);
                $scope.UserRoles = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                //Scroll top of page
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.exportRoles = function (format) {
            DataService.exportRoles($scope.RoleFilter, format);
        };
        $scope.saveUserRole = function () {
            if (!$scope.UserRoleForms.UserRoleForm.$valid) {
                return;
            }

            var rolePermissions = [];
            angular.forEach($scope.Modules, function (module, key) {
                angular.forEach($scope.RolePermissions[module], function (entity, key) {
                    angular.forEach(entity.cmsEntityPermissionList, function (permission, key) {
                        if (permission.isChecked) {
                            rolePermissions.push(permission.permissionId);
                        }
                    });
                });
            });
            var UserRoleData = {};
            if ($scope.UserRole.roleId) {
                UserRoleData.roleId = $scope.UserRole.roleId;
            }
            UserRoleData.roleName = $scope.UserRole.roleName;
            UserRoleData.description = $scope.UserRole.description;
            UserRoleData.rolePermissions = rolePermissions;
            console.log("UserRole", UserRoleData);
            $scope.progressBar = $rootScope.showProgress();
            DataService.saveRole(UserRoleData).then(function (response) {
                console.log("Role creation resp:", response.data.data);
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', $scope.UserRole.roleId !== undefined ? "User Role successfully updated." : "User Role successfully created.");
                $scope.switchTab('Main');
                $scope.listUserRoles();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    var errors = "";
                    if (error.data.data) {
                        errors = " [";
                        angular.forEach(error.data.data, function (value, key) {
                            errors = errors + value + ",";
                        });
                        errors = errors + "]";
                    }
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message + errors);
                }
            });
        };
        $scope.approveUserRole = function (postData) {
            if (postData) {
                $scope.ShowRoleApproval = false;
                var UserRoleApprovaldata = {};
                UserRoleApprovaldata.ids = [$scope.UserRole.roleId];
                UserRoleApprovaldata.notes = $scope.UserRoleApproval.notes;
                $scope.progressBar = $rootScope.showProgress();
                console.log($scope.UserRoleApproval.action);
                if ($scope.UserRoleApproval.action === "approved") {
                    DataService.approveRoles(UserRoleApprovaldata).then(function (response) {
                        console.log("Role approval resp:", response.data.data);
                        if (response.data.code === 200) {
                            $scope.progressBar.close();
                            $rootScope.notify('success', 'Success', "User Role successfully approved.");
                            $scope.switchTab('Main');
                            $scope.listUserRoles();
                        } else if (response.data.code === 207) {
                            $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
                            $scope.progressBar.close();
                        }
                    }, function (error) {
                        console.log("Error", error);
                        $scope.progressBar.close();
                        if (error.status === -1) {
                            $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                        } else if (error.status === 401) {
                            $rootScope.expiredToken();
                        } else if (error.status === 403) {
                            $rootScope.notify('error', 'Error', error.data.message);
                            $window.location = '#/Error';
                        } else {
                            $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                        }
                    });
                } else if ($scope.UserRoleApproval.rejected === "rejected") {
                    DataService.declineRoles(UserRoleApprovaldata).then(function (response) {
                        console.log("Role approval resp:", response.data.data);
                        $scope.progressBar.close();
                        $rootScope.notify('success', 'Success', "User Role successfully rejected.");
                        $scope.switchTab('Main');
                        $scope.listUserRoles();
                    }, function (error) {
                        console.log("Error", error);
                        $scope.progressBar.close();
                        if (error.status === -1) {
                            $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                        } else if (error.status === 401) {
                            $rootScope.expiredToken();
                        } else if (error.status === 403) {
                            $rootScope.notify('error', 'Error', error.data.message);
                            $window.location = '#/Error';
                        } else {
                            $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                        }
                    });
                }
            } else {
                $scope.ShowRoleApproval = true;
            }
        };
        $scope.viewUserRoleChanges = function (roleId) {
            $scope.progressBar = $rootScope.showProgress();
            $scope.ShowChange = true;
            DataService.getRoleChanges(roleId).then(function (response) {
                $scope.changes = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.viewUserRole = function (UserRole, editMode) {
            $scope.UserRole = UserRole;
            $scope.UserRole.editMode = editMode;
            $scope.Modules = [];
            $scope.RolePermissions = [];
            var assignedPermissions = [];
            angular.forEach($scope.UserRole.cmsRolePermissionMapList, function (value, key) {
                assignedPermissions.push(value.permission.permissionId);
            });
            $scope.progressBar = $rootScope.showProgress();
            DataService.getRolePermissions().then(function (response) {
                console.log("User Role Permissions Data:", response.data.data);
                $scope.progressBar.close();
                $scope.EntityPermissions = response.data.data.content;
                angular.forEach($scope.EntityPermissions, function (value, key) {

                    angular.forEach(value.cmsEntityPermissionList, function (permission, permKey) {
                        if (assignedPermissions.indexOf(permission.permissionId) > -1) {
                            permission.isChecked = true;
                        }
                    });
                    if ($scope.Modules.indexOf(value.module) > -1) { //If module already exists
                        //$scope.Modules.push(value.module);
                        $scope.RolePermissions[value.module].push(value);
                    } else { //If module does not exists
                        $scope.Modules.push(value.module);
                        var entities = [];
                        entities.push(value);
                        $scope.RolePermissions[value.module] = entities;
                    }
                });
                console.log("$scope.RolePermissions", $scope.RolePermissions);
                $scope.ShowRoleView = true;
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.closeAndclear = function () {
            $scope.ShowRoleApproval = false;
            $scope.UserRoleApproval = {action: "approved"};
        };
        $scope.switchTab = function (tabName) {
            if (tabName === 'Main') {
                $scope.ShowRoleView = false;
            } else {
                $scope.ShowRoleView = true;
            }
        };
        //delete
        $scope.deleteUserRole = function (UserRole) {
            $scope.UserRoleForm = true;
            $scope.UserRole = UserRole;
            console.log("UserRole", UserRole)
        };
        $scope.closePopup = function () {
            $scope.UserRoleForm = false;
        };
        $scope.regionData = {};
        $scope.deleteUserRoles = function () {
            if (!$scope.DeleteUserForm.$valid) {
                return;
            }

            var ids = [];
            ids.push($scope.UserRole.roleId);
            var deleteUserRoleData = {};
            deleteUserRoleData.ids = ids;
            deleteUserRoleData.notes = $scope.UserRol.notes;
            console.log(deleteUserRoleData);
            $scope.progressBar = $rootScope.showProgress();
            DataService.deleteUSERROLE(deleteUserRoleData).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.UserRole.roleName + ' successfully Deleted');
                $scope.progressBar.close();
                $scope.UserRoleForm = false;
                $scope.listUserRoles();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.resetUsersRoleFilter();
    }])
    .controller('AuditTrailCtrl', ['$rootScope', '$scope', 'DataService', '$window', '$timeout', '$q', function ($rootScope, $scope, DataService, $window, $timeout, $q) {
        console.debug("Loading auditing controller....");
        $scope.searchUser = function (keyword) {
            var deferred = $q.defer();
            $timeout(function () {
                var results = [];
                DataService.searchUser(keyword).then(function (dataArray) {
                    if (dataArray) {
                        results = dataArray.data.data.content;
                        deferred.resolve(results);
                    }
                });
            }, 100);
            return deferred.promise;
        };
        $scope.resetAuditFilter = function () {
            $scope.AuditFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.AuditFilter.dateFrom = startDate;
            $scope.AuditFilter.dateTo = new Date();
            $scope.listAuditTrail();
        }


        $scope.listAuditTrail = function (outputFormat) {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getAuditTrails($scope.AuditFilter, outputFormat, "", "").then(function (response) {
                $scope.progressBar.close();
                if (outputFormat) {
                    $rootScope.exportReport(response.data, outputFormat, 'Audit Logs');
                } else {
                    console.log("Audit Trail Logs:", response.data.data);
                    $scope.audit_trail = response.data.data.content;
                    $rootScope.setPaginationParams(response.data.data);
//                        Scroll top of page
                    $window.scrollTo(0, 0);
                }
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.exportAuditTrail = function (format) {
            DataService.exportAuditTrail($scope.AuditFilter, format);
        };
        $scope.resetAuditFilter()
    }])
    .controller('CustomerCategoryCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window) {
        $scope.ShowCustCategory = false;
        $scope.DeleteCCategorytDlg = false;
        $scope.showCustCategoryDlg = function (CustomerCategory) {
            $scope.ShowCustCategory = true;
            $scope.CustomerCategory = CustomerCategory;
        };
        $scope.editCustomerCategory = function (CustomerCategory) {
            $scope.showCustCategoryDlg(CustomerCategory);
        };
        $scope.saveCustomerCategory = function () {
            if (!$scope.CustomerCategoryForm.$valid) {
                return;
            }

            $scope.progressBar = $rootScope.showProgress();
            DataService.saveCustomerCategory($scope.CustomerCategory).then(function (response) {
                console.log("Resp:", response.data);
                $scope.CustomerCategory = {};
                $scope.progressBar.close();
                $scope.ShowCustCategory = false;
                if ($scope.CustomerCategory.custCategoryId !== undefined) {
                    $rootScope.notify('success', 'Success', "Customer Category successfully updated");
                } else {
                    $rootScope.notify('success', 'Success', "Customer Category successfully created");
                }
                $scope.loadCustomerCategories();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        //delete
        $scope.deleteCustomerCategory = function (CustomerCategory) {
            $scope.DeleteCCategorytDlg = true;
            $scope.CustomerCategory = CustomerCategory;
        };
        $scope.closePopup = function () {
            $scope.DeleteCCategorytDlg = false;
        };
        $scope.regionData = {};
        $scope.deleteCategory = function () {
            if (!$scope.DeleteCustomerCategoryForm.$valid) {
                return;
            }

            var ids = [];
            ids.push($scope.CustomerCategory.custCategoryId);
            var deleteCategoryData = {};
            deleteCategoryData.ids = ids;
            deleteCategoryData.notes = $scope.CustomerCategoryData.notes;
            console.log(deleteCategoryData);
            $scope.progressBar = $rootScope.showProgress();
            DataService.deleteCCategory(deleteCategoryData).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.CustomerCategory.categoryName + ' successfully Deleted');
                $scope.progressBar.close();
                $scope.DeleteCCategorytDlg = false;
                $scope.loadCustomerCategories();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadCustomerCategories = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerCategories().then(function (response) {
                console.log("Resp:", response.data);
                $scope.CustomerCategories = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadCustomerCategories();
    }])

    .controller('ApproveCustomerCategoryCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window) {


        $scope.CustomerCategoryApproval = {action: "approved"};
        $scope.resetCategoryFilter = function () {
            $scope.UserFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.UserFilter.dateFrom = startDate;
            $scope.UserFilter.dateTo = new Date();
            $scope.listUnapprovedCustomerCategories();
        };
        $scope.ShowChanges = function (CustomerCategory) {
            $scope.ShowChange = true;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCustomerCategoryChanges(CustomerCategory.custCategoryId).then(function (response) {
                console.log("Change Resp:", response.data.data);
                $scope.changes = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.listUnapprovedCustomerCategories = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getUnapprovedCustomerCategories().then(function (response) {
                console.log("Resp:", response.data);
                $scope.UnapprovedCustomerCategories = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.approveCustomerCategory = function () {
            if (!$scope.CustomerCategoryApprovalForm.$valid) {
                return;
            }

            var CustomerCategoryIds = [];
            for (var i = 0; i < $scope.UnapprovedCustomerCategories.length; i++) {
                if ($scope.UnapprovedCustomerCategories[i].isChecked) {
                    CustomerCategoryIds.push($scope.UnapprovedCustomerCategories[i].custCategoryId);
                }
            }

            if (CustomerCategoryIds.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.CustomerCategoryApproval.ids = CustomerCategoryIds;
                var CustomerCategoryApprovaldata = {};
                CustomerCategoryApprovaldata.ids = CustomerCategoryIds;
                CustomerCategoryApprovaldata.notes = $scope.CustomerCategoryApproval.notes;
                console.log($scope.CustomerCategoryApproval.action);
                DataService.approveCustomerCategories(CustomerCategoryApprovaldata, $scope.CustomerCategoryApproval.action).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + CustomerCategoryIds.length + ") User(s) successfully " + $scope.CustomerCategoryApproval.action + ".");
                        $scope.CustomerCategoryApproval.notes = "";
                        $scope.progressBar.close();
                        $scope.listUnapprovedCustomerCategories();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnapprovedCustomerCategories.length; i++) {
                if (!$scope.UnapprovedCustomerCategories[i].isChecked) {
                    $scope.UnapprovedCustomerCategories.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnapprovedCustomerCategories.allItemsSelected = true;
        };
        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnapprovedCustomerCategories.length; i++) {
                $scope.UnapprovedCustomerCategories[i].isChecked = $scope.UnapprovedCustomerCategories.allItemsSelected;
            }
        };
        $scope.resetCategoryFilter();
    }])


    .controller('RegionCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window) {
        $scope.ShowRegionDlg = false;
        $scope.ShowdeleteRegionDlg = false;
        $scope.showRegionDlg = function (Region) {
            $scope.ShowRegionDlg = true;
            $scope.Region = Region;
        };
        $scope.editRegion = function (Region) {
            $scope.showRegionDlg(Region);
        };
        $scope.saveRegion = function () {
            if (!$scope.RegionForm.$valid) {
                return;
            }

            $scope.progressBar = $rootScope.showProgress();
            DataService.saveRegion($scope.Region).then(function (response) {
                console.log("Resp:", response.data);
                $scope.Region = {};
                $scope.progressBar.close();
                $scope.ShowRegionDlg = false;
                if ($scope.Region.regionId !== undefined) {
                    $rootScope.notify('success', 'Success', "Region successfully updated");
                } else {
                    $rootScope.notify('success', 'Success', "Region successfully created");
                }
                $scope.loadRegions();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadRegions = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getRegions().then(function (response) {
                console.log("Resp:", response.data);
                $scope.Regions = response.data.data;
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        //delete
        $scope.deleteRegion = function (Region) {
            $scope.ShowdeleteRegionDlg = true;
            $scope.Region = Region;
            console.log("Region", Region)
        };
        $scope.closePopup = function () {
            $scope.ShowdeleteRegionDlg = false;
        };
        $scope.regionData = {};
        $scope.deleteRegionPlace = function () {
            if (!$scope.DeleteRegionForm.$valid) {
                return;
            }

            var ids = [];
            ids.push($scope.Region.regionId);
            var deleteRegionData = {};
            deleteRegionData.ids = ids;
            deleteRegionData.notes = $scope.regionData.notes;
            console.log(deleteRegionData);
            $scope.progressBar = $rootScope.showProgress();
            DataService.deleteLocation(deleteRegionData).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.Region.regionName + ' successfully Deleted');
                $scope.progressBar.close();
                $scope.ShowdeleteRegionDlg = false;
                $scope.loadRegions();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadRegions();
    }])
    .controller('DepartmentCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window) {
        $scope.ShowDepartmentDlg = false;
        $scope.DeleteDepartmentDlg = false;
        $scope.showDepartmentDlg = function (Department) {
            $scope.ShowDepartmentDlg = true;
            $scope.Department = Department;
        };
        $scope.editDepartment = function (Department) {
            $scope.showDepartmentDlg(Department);
        };
        $scope.saveDepartment = function () {
            if (!$scope.DepartmentForm.$valid) {
                return;
            }

            $scope.progressBar = $rootScope.showProgress();
            DataService.saveDepartment($scope.Department).then(function (response) {
                console.log("Resp:", response.data);
                $scope.Department = {};
                $scope.progressBar.close();
                $scope.ShowDepartmentDlg = false;
                if ($scope.Department.departmentid !== undefined) {
                    $rootScope.notify('success', 'Success', "Department successfully updated");
                } else {
                    $rootScope.notify('success', 'Success', "Department successfully created");
                }
                $scope.loadDepartments();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadDepartments = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getDepartments(true, ["Approved", "Rejected"]).then(function (response) {
                console.log("Resp:", response);
                $scope.Departments = response.data;
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        //delete
        $scope.deleteDep = function (Department) {
            $scope.DeleteDepartmentDlg = true;
            $scope.Department = Department;
            console.log("Department", Department)
        };
        $scope.closePopup = function () {
            $scope.DeleteDepartmentDlg = false;
        };
        // $scope.regionData = {};
        $scope.deleteSystem = function () {
            if (!$scope.DeleteDepartmentForm.$valid) {
                return;
            }

            // var ids = [];
            // ids.push($scope.Department.departmentId);
            // var deleteDepartmentData = {};
            // deleteDepartmentData.ids = ids;
            // deleteDepartmentData.notes = $scope.DepartmentData.notes;
            // console.log(deleteDepartmentData);
            $scope.progressBar = $rootScope.showProgress();
            DataService.deleteDepartment($scope.Department).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.Department.departmentName + ' successfully Deleted');
                $scope.progressBar.close();
                $scope.DeleteDepartmentDlg = false;
                $scope.loadDepartments();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadDepartments();
    }])


    .controller('ApproveDepartmentsCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window) {


        $scope.DepartmentApproval = {action: "approved"};
        $scope.resetDepartmentFilter = function () {
            $scope.UserFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.UserFilter.dateFrom = startDate;
            $scope.UserFilter.dateTo = new Date();
            $scope.listUnapprovedDepartments();
        };
        $scope.ShowChanges = function (Department) {
            $scope.ShowChange = true;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getDepartmentChanges(Department.departmentId).then(function (response) {
                console.log("Change Resp:", response.data.data);
                $scope.change = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.listUnapprovedDepartments = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getUnapprovedDepartments().then(function (response) {
                console.log("Resp:", response);
                $scope.UnapprovedDepartments = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data.content);
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.approveDepartment = function () {
            if (!$scope.DepartmentApprovalForm.$valid) {
                return;
            }

            var DepartmentIds = [];
            for (var i = 0; i < $scope.UnapprovedDepartments.length; i++) {
                if ($scope.UnapprovedDepartments[i].isChecked) {
                    DepartmentIds.push($scope.UnapprovedDepartments[i].departmentId);
                }
            }

            if (DepartmentIds.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.DepartmentApproval.ids = DepartmentIds;
                var DepartmentApprovaldata = {};
                DepartmentApprovaldata.ids = DepartmentIds;
                DepartmentApprovaldata.notes = $scope.DepartmentApproval.notes;
                console.log($scope.DepartmentApproval.action);
                DataService.approveDepartments(DepartmentApprovaldata, $scope.DepartmentApproval.action).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + DepartmentIds.length + ") User(s) successfully " + $scope.DepartmentApproval.action + ".");
                        $scope.DepartmentApproval.notes = "";
                        $scope.progressBar.close();
                        $scope.listUnapprovedDepartments();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnapprovedDepartments.length; i++) {
                if (!$scope.UnapprovedDepartments[i].isChecked) {
                    $scope.UnapprovedDepartments.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnapprovedDepartments.allItemsSelected = true;
        };
        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnapprovedDepartments.length; i++) {
                $scope.UnapprovedDepartments[i].isChecked = $scope.UnapprovedDepartments.allItemsSelected;
            }
        };
        $scope.resetDepartmentFilter();
    }])


    .controller('CurrencyCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window) {
        $scope.ShowCurrency = false;
        $scope.DeleteCurrencyDlg = false;
        $scope.addDenomination = function () {
            $scope.CurrencyDenominations.push({value: 0});
        };
        $scope.removeDenomination = function (index) {
            $scope.CurrencyDenominations.splice(index, 1);
        };
        $scope.showCurrencyDlg = function (Currency) {
            $scope.ShowCurrency = true;
            $scope.Currency = Currency;
            console.log("currency info", $scope.Currency);
            if (!$scope.Currency.currencyCode) {
                $scope.CurrencyDenominations = [];
            } else {
//                        $scope.CurrencyDenominations = [{value: 0}]; //Fetch from API
                $scope.CurrencyDenominations = $scope.Currency.denominations;
            }
        };
        $scope.editCurrency = function (Currency, editMode) {
            $scope.showCurrencyDlg(Currency);
            console.log("currency info", $scope.Currency.currencyCode);
            Currency.editMode = editMode;
        };
        $scope.saveCurrency = function () {
            if (!$scope.CurrencyForm.$valid) {
                return;
            }
            $scope.progressBar = $rootScope.showProgress();
            DataService.saveCurrency($scope.Currency).then(function (response) {
                console.log("Resp:", response.data);
                $scope.Currency = {};
                $scope.progressBar.close();
                $scope.ShowCurrency = false;
                $scope.loadCurrencies();
                $rootScope.notify('success', 'Success', "Currency successfully created");
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.updateCurrency = function () {
            if (!$scope.CurrencyForm.$valid) {
                return;
            }
            console.log("currency update info: ", $scope.Currency)
            $scope.progressBar = $rootScope.showProgress();
            DataService.updateCurrency($scope.Currency).then(function (response) {
                console.log("Resp:", response.data);
                $scope.Currency = {};
                $scope.progressBar.close();
                $scope.ShowCurrency = false;
                $scope.loadCurrencies();
                $rootScope.notify('success', 'Success', "Currency successfully updated");
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadCurrencies = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCurrencies().then(function (response) {
                console.log("Resp:", response.data);
                $scope.Currencies = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        //delete
        $scope.deleteCurrency = function (Currency) {
            $scope.Currency = Currency;
            $scope.DeleteCurrencyDlg = true;
            console.log("Currency", Currency)
        };
        $scope.closePopup = function () {
            $scope.DeleteCurrencyDlg = false;
        };
        $scope.CurrencyInfo = {};
        $scope.deleteCurrencies = function () {
            if (!$scope.DeleteCurrencyForm.$valid) {
                return;
            }

            var ids = [];
            ids.push($scope.Currency.currencyCode);
            var deleteCurrenciesData = {};
            deleteCurrenciesData.ids = ids;
            deleteCurrenciesData.notes = $scope.CurrencyInfo.notes;
            console.log(deleteCurrenciesData);
            $scope.progressBar = $rootScope.showProgress();
            DataService.deleteCurrencyRecord(deleteCurrenciesData).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', $scope.Currency.currencyName + ' successfully Deleted');
                $scope.progressBar.close();
                $scope.DeleteCurrencyDlg = false;
                $scope.loadCurrencies();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadCurrencies();
    }])

    .controller('ApproveCurrenciesCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window) {


        $scope.CurrencyApproval = {action: "approved"};
        $scope.resetCurrencyFilter = function () {
            $scope.UserFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.UserFilter.dateFrom = startDate;
            $scope.UserFilter.dateTo = new Date();
            $scope.listUnapprovedCurrencies();
        };
        $scope.ShowChanges = function (Currency) {
            $scope.ShowChange = true;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getCurrencyChanges(Currency.currencyCode).then(function (response) {
                console.log("Change Resp:", response.data.data);
                $scope.change = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.listUnapprovedCurrencies = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getUnapprovedCurrency().then(function (response) {
                console.log("Resp:", response);
                $scope.UnapprovedCurrency = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data.content);
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.approveCurrency = function () {
            if (!$scope.CurrencyApprovalForm.$valid) {
                return;
            }

            var CurrencyIds = [];
            for (var i = 0; i < $scope.UnapprovedCurrency.length; i++) {
                if ($scope.UnapprovedCurrency[i].isChecked) {
                    CurrencyIds.push($scope.UnapprovedCurrency[i].currencyCode);
                }
            }

            if (CurrencyIds.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.CurrencyApproval.ids = CurrencyIds;
                var CurrencyApprovaldata = {};
                CurrencyApprovaldata.ids = CurrencyIds;
                CurrencyApprovaldata.notes = $scope.CurrencyApproval.notes;
                console.log($scope.CurrencyApproval.action);
                DataService.approveCurrency(CurrencyApprovaldata, $scope.CurrencyApproval.action).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + CurrencyIds.length + ") User(s) successfully " + $scope.CurrencyApproval.action + ".");
                        $scope.CurrencyApproval.notes = "";
                        $scope.progressBar.close();
                        $scope.listUnapprovedCurrencies();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnapprovedCurrency.length; i++) {
                if (!$scope.UnapprovedCurrency[i].isChecked) {
                    $scope.UnapprovedCurrency.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnapprovedCurrency.allItemsSelected = true;
        };
        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnapprovedCurrency.length; i++) {
                $scope.UnapprovedCurrency[i].isChecked = $scope.UnapprovedCurrency.allItemsSelected;
            }
        };
        $scope.resetCurrencyFilter();
    }])

    .controller('UserProfileCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window) {
        $scope.changePassword = function () {
            if (!$scope.PasswordChangeForm.$valid) {
                return;
            }

            if ($scope.PasswordChange.newPassword !== $scope.PasswordChange.confirmPassword) {
                $rootScope.alertDialog("The new password does not match the confirm password!");
                return;
            }

            $scope.PasswordChange.username = $rootScope.userDetails.emailAddress;
            $scope.progressBar = $rootScope.showProgress();
            DataService.changePassword($scope.PasswordChange).then(function (response) {
                console.log("Change Password Resp:", response.data);
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', "Password successfully changed");
                $window.location = '#/MyProfile';
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    var invalidToken = error.data ? error.data.error : "";
                    if (invalidToken === "invalid_token") {
                        $rootScope.expiredToken();
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
    }])
    .controller('PasswordPolicyCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window) {
        $scope.editMode = false;
        $scope.editPasswordPolicy = function () {
            $scope.editMode = true;
        };
        $scope.savePasswordPolicy = function () {
            if (!$scope.PasswordPolicyForm.$valid) {
                return;
            }

            $scope.progressBar = $rootScope.showProgress();
            console.log($scope.PasswordPolicy.otpExpiry);
            DataService.savePasswordPolicy($scope.PasswordPolicy).then(function (response) {
                console.log("Resp:", response.data);
                $scope.editMode = false;
                console.log($scope.PasswordPolicy.otpExpiry);
                $scope.progressBar.close();
                $rootScope.notify('success', 'Success', "Password Policy successfully updated");
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadPasswordPolicy = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getPasswordPolicy().then(function (response) {
                $scope.PasswordPolicy = response.data.data;
                $scope.passExpiryHelper = Math.floor($scope.PasswordPolicy.expiry / (60 * 24));
                $scope.otpExpiryHelper = Math.floor($scope.PasswordPolicy.otpExpiry / (60));
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadPasswordPolicy();
        /**
         * Listen for password change event and update password expiry helper
         * @returns {void}
         */
        $scope.passwordExpiryChange = function () {
            if ($scope.PasswordPolicy.expiry) {
                $scope.passExpiryHelper = Math.floor($scope.PasswordPolicy.expiry / (60 * 24));
            } else {
                $scope.passExpiryHelper = 0;
            }
        };
        /**
         * LIsten for otp expiry change event and update opt expiry helper
         * @returns {void}
         */
        $scope.otpExpiryChange = function () {
            if ($scope.PasswordPolicy.otpExpiry) {
                $scope.otpExpiryHelper = Math.floor($scope.PasswordPolicy.otpExpiry / (60));
            } else {
                $scope.otpExpiryHelper = 0;
            }
        };
    }])
    .controller('OTPConfigurationCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', '$location', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window, $location) {

        $scope.editotpconfig = function (otpconfig, editMode) {
            otpconfig.editMode = editMode;
            console.log(otpconfig);
        };

        $scope.saveotpconfig = function (otpconfig){
            console.log(otpconfig);
            $scope.progressBar = $rootScope.showProgress();
            DataService.saveOTPConfig(otpconfig).then(function (response) {
                console.log("Resp:", response);
                $rootScope.notify('success', 'Success', 'Configuration saved successfully');
                $scope.progressBar.close();
                $scope.loadOTPConfig();
//                        $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadOTPConfig = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getOTPConfig().then(function (response) {
                console.log("Resp:", response);
                $scope.otpconfigs = response.data.data;

//                        $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
//                        $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };


        $scope.loadOTPConfig();

    }])

    .controller('ApproveOTPConfigCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window) {


        $scope.SysConfigApproval = {action: "approved"};
//                $scope.resetConfigFilter = function () {
//                    $scope.UserFilter = {};
//                    var startDate = new Date();
//                    startDate.setDate(1);
//                    $scope.UserFilter.dateFrom = startDate;
//                    $scope.UserFilter.dateTo = new Date();
//                    $scope.listUnapprovedOTPConfigs();
//                };
        $scope.ShowChanges = function (otpconfig) {
            $scope.ShowChange = true;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getOTPConfigChanges(otpconfig.id).then(function (response) {
                console.log("Change Resp:", response.data.data);
                $scope.change = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.listUnapprovedOTPConfigs = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getUnapprovedOTPConfig().then(function (response) {
                console.log("Resp:", response);
                $scope.UnapprovedOTPConfig = response.data.data;
//                        $rootScope.setPaginationParams(response.data.data.content);
                $scope.progressBar.close();
//                        $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.approveOTPConfig = function () {
            if (!$scope.OTPApprovalForm.$valid) {
                return;
            }

            var SysConfigIds = [];
            for (var i = 0; i < $scope.UnapprovedOTPConfig.length; i++) {
                if ($scope.UnapprovedOTPConfig[i].isChecked) {
                    SysConfigIds.push($scope.UnapprovedOTPConfig[i].id);
                }
            }

            if (SysConfigIds.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.SysConfigApproval.ids = SysConfigIds;
                var SysConfigApprovaldata = {};
                SysConfigApprovaldata.ids = SysConfigIds;
                SysConfigApprovaldata.notes = $scope.SysConfigApproval.notes;
                console.log($scope.SysConfigApproval.action);
                DataService.approveOTPConfig(SysConfigApprovaldata, $scope.SysConfigApproval.action).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + SysConfigIds.length + ") User(s) successfully " + $scope.SysConfigApproval.action + ".");
                        $scope.SysConfigApproval.notes = "";
                        $scope.progressBar.close();
                        $scope.listUnapprovedOTPConfigs();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnapprovedOTPConfig.length; i++) {
                if (!$scope.UnapprovedOTPConfig[i].isChecked) {
                    $scope.UnapprovedOTPConfig.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnapprovedOTPConfig.allItemsSelected = true;
        };
        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnapprovedOTPConfig.length; i++) {
                $scope.UnapprovedOTPConfig[i].isChecked = $scope.UnapprovedOTPConfig.allItemsSelected;
            }
        };
        $scope.listUnapprovedOTPConfigs();
    }])
    .controller('SystemConfigCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', '$location', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window, $location) {
        console.log("$location", $location.$$path);
        if ($location.$$path === '/SystemIntegration') {
            $scope.GlobalConfigs = {title: "System Integration Configuration", entity: "integration"};
        } else {
            $scope.GlobalConfigs = {title: "Global Configuration", entity: "system"};
        }

        $scope.editGlobalParam = function (GlobalParam) {
            $scope.ShowParamEdit = true;
            $scope.GlobalParam = GlobalParam;
        };
        $scope.saveGlobalParam = function () {
            if (!$scope.GlobalParam.value) {
                return;
            }

            $scope.progressBar = $rootScope.showProgress();
            DataService.saveGlobalParam($scope.GlobalParam).then(function (response) {
                console.log("Resp:", response.data);
                $scope.GlobalParam = {};
                $scope.progressBar.close();
                $scope.ShowParamEdit = false;
                $rootScope.notify('success', 'Success', $scope.GlobalConfigs.title + " Parameter successfully updated");
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadGlobalParams = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getGlobalParams($scope.GlobalConfigs.entity).then(function (response) {
                console.log("Resp:", response.data);
                $scope.GlobalParams = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data);
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.loadGlobalParams();
    }])


    .controller('ApproveConfigurationsCtrl', ['$rootScope', '$scope', 'DataService', '$routeParams', '$localStorage', '$window', function ($rootScope, $scope, DataService, $routeParams, $localStorage, $window) {


        $scope.SysConfigApproval = {action: "approved"};
        $scope.resetConfigFilter = function () {
            $scope.UserFilter = {};
            var startDate = new Date();
            startDate.setDate(1);
            $scope.UserFilter.dateFrom = startDate;
            $scope.UserFilter.dateTo = new Date();
            $scope.listUnapprovedConfigs();
        };
        $scope.ShowChanges = function (SysConfig) {
            $scope.ShowChange = true;
            $scope.progressBar = $rootScope.showProgress();
            DataService.getConfigChanges(SysConfig.id).then(function (response) {
                console.log("Change Resp:", response.data.data);
                $scope.change = response.data.data;
                $scope.progressBar.close();
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.listUnapprovedConfigs = function () {
            $scope.progressBar = $rootScope.showProgress();
            DataService.getUnapprovedConfig().then(function (response) {
                console.log("Resp:", response);
                $scope.UnapprovedSysConfig = response.data.data.content;
                $rootScope.setPaginationParams(response.data.data.content);
                $scope.progressBar.close();
                $window.scrollTo(0, 0);
            }, function (error) {
                console.log("Error", error);
                $scope.progressBar.close();
                if (error.status === -1) {
                    $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                } else if (error.status === 401) {
                    $rootScope.expiredToken();
                } else if (error.status === 403) {
                    $rootScope.notify('error', 'Error', error.data.message);
                    $window.location = '#/Error';
                } else {
                    $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                }
            });
        };
        $scope.approveSysConfig = function () {
            if (!$scope.SysConfigApprovalForm.$valid) {
                return;
            }

            var SysConfigIds = [];
            for (var i = 0; i < $scope.UnapprovedSysConfig.length; i++) {
                if ($scope.UnapprovedSysConfig[i].isChecked) {
                    SysConfigIds.push($scope.UnapprovedSysConfig[i].id);
                }
            }

            if (SysConfigIds.length > 0) {
                $scope.progressBar = $rootScope.showProgress();
                $scope.SysConfigApproval.ids = SysConfigIds;
                var SysConfigApprovaldata = {};
                SysConfigApprovaldata.ids = SysConfigIds;
                SysConfigApprovaldata.notes = $scope.SysConfigApproval.notes;
                console.log($scope.SysConfigApproval.action);
                DataService.approveSysConfig(SysConfigApprovaldata, $scope.SysConfigApproval.action).then(function (response) {
                    console.log("Resp:", response);
                    if (response.data.code === 200) {
                        $rootScope.notify('success', 'Success', "(" + SysConfigIds.length + ") User(s) successfully " + $scope.SysConfigApproval.action + ".");
                        $scope.SysConfigApproval.notes = "";
                        $scope.progressBar.close();
                        $scope.listUnapprovedConfigs();
                    } else if (response.data.code === 207) {
                        $rootScope.notify('error', 'Error', "You are not authorized to approve this record");
                        $scope.progressBar.close();
                    }
                }, function (error) {
                    console.log("Error", error);
                    $scope.progressBar.close();
                    if (error.status === -1) {
                        $rootScope.notify('warning', 'Warning', 'Network Connectivity Issue Detected');
                    } else if (error.status === 401) {
                        $rootScope.expiredToken();
                    } else if (error.status === 403) {
                        $rootScope.notify('error', 'Error', error.data.message);
                        $window.location = '#/Error';
                    } else {
                        $rootScope.notify('error', 'Error', error.data === "" ? "Unknown error has occured" : error.data.message);
                    }
                });
            } else {
                $rootScope.alertDialog("Please select atleast one record to approve/reject!");
            }
        };
        $scope.checkOne = function () {
            for (var i = 0; i < $scope.UnapprovedSysConfig.length; i++) {
                if (!$scope.UnapprovedSysConfig[i].isChecked) {
                    $scope.UnapprovedSysConfig.allItemsSelected = false;
                    return;
                }
            }
            //If not the check the "allItemsSelected" checkbox
            $scope.UnapprovedSysConfig.allItemsSelected = true;
        };
        $scope.checkAll = function () {
            for (var i = 0; i < $scope.UnapprovedSysConfig.length; i++) {
                $scope.UnapprovedSysConfig[i].isChecked = $scope.UnapprovedSysConfig.allItemsSelected;
            }
        };
        $scope.resetConfigFilter();
    }])
