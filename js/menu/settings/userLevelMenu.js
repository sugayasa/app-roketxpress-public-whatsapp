if (userLevelMenuFunc == null) {
    var userLevelMenuFunc = function () {
        $(document).ready(function () {
            getDataUserLevel();
        });
    }
}

$('#filter-searchKeyword').off('keypress');
$("#filter-searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        getDataUserLevel();
    }
});

function getDataUserLevel(idUserLevel = false) {
    var $elemList = $('#list-userLevelMenuData'),
        searchKeyword = $('#filter-searchKeyword').val(),
        dataSend = {
            searchKeyword: searchKeyword
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "userLevelMenu/getDataLevel",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + getUserToken(),
        },
        beforeSend: function () {
            NProgress.set(0.4);
            $elemList.html(loaderElem);
            recalculateSimpleBar('simpleBar-list-userLevelMenuData');
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    var dataLevelUser = responseJSON.dataLevelUser;
                    $.each(dataLevelUser, function (index, arrayLevelUser) {
                        rows += '<li class="userLevel-item mb-2 px-3 py-2 mx-2 border-bottom active bg-light" ' +
                            'data-idUserLevel="' + arrayLevelUser.IDUSERADMINLEVEL + '" ' +
                            'data-levelName="' + arrayLevelUser.LEVELNAME + '" ' +
                            'data-description="' + arrayLevelUser.DESCRIPTION + '">' +
                            '<div class="pills-list-item d-flex align-items-center">' +
                            '<div class="flex-grow-1">' +
                            '<h5 class="text-truncate font-size-15 mb-1">' + arrayLevelUser.LEVELNAME + '</h5>' +
                            '<p class="text-muted mb-0">' + arrayLevelUser.DESCRIPTION + '</p>' +
                            '</div>' +
                            '</div>' +
                            '</li>';
                    });
                    break;
                case 404:
                default:
                    rows = '<li class="text-center">' +
                        '<div class="alert alert-warning mb-0 mx-2" role="alert">' +
                        '<i class="ri-error-warning-line me-2"></i>' +
                        'No data found' +
                        '</div>' +
                        '</li>';
                    break;
            }

            $elemList.html(rows);
            activateOnClickLevelUserItem();
            if (!idUserLevel) $('.userLevel-item').first().trigger('click');
            if (idUserLevel) $('.userLevel-item[data-idUserLevel=' + idUserLevel + ']').trigger('click');
            recalculateSimpleBar('simpleBar-list-userLevelMenuData');
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
    });
}

function activateOnClickLevelUserItem() {
    $('.userLevel-item').off('click');
    $('.userLevel-item').on('click', function (e) {
        var idUserLevel = $(this).attr('data-idUserLevel'),
            levelName = $(this).attr('data-levelName'),
            description = $(this).attr('data-description');
        $(".userLevel-item").removeClass('active bg-light');
        $(this).addClass('active bg-light');

        $("#userlevelDetails-levelName").val(levelName);
        $("#userlevelDetails-description").val(description);
        $("#userlevelDetails-idUserLevel").val(idUserLevel);
        getMenuLevelAdmin(idUserLevel);
    });
    activateOnClickPillsItem();
}

function getMenuLevelAdmin(idUserLevel) {
    let dataSend = { idUserLevel: idUserLevel },
        $tableBody = $('#userLevelDetails-tableMenuList > tbody'),
        columnNumber = $('#userLevelDetails-tableMenuList > thead > tr > th').length;

    $.ajax({
        type: 'POST',
        url: baseURL + "userLevelMenu/getMenuLevelAdmin",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: {
            withCredentials: true
        },
        headers: {
            Authorization: 'Bearer ' + getUserToken()
        },
        beforeSend: function () {
            NProgress.set(0.4);
            $tableBody.html("<tr><td colspan='" + columnNumber + "'>" + loaderElem + "</td></tr>");
        },
        complete: function (jqXHR, textStatus) {
            let responseJSON = jqXHR.responseJSON,
                rowMenuLevel = "";

            switch (jqXHR.status) {
                case 200:
                    let dataMenuLevel = responseJSON.dataMenuLevel;

                    $.each(dataMenuLevel, function (index, arrayMenuLevel) {
                        let idMenuAdmin = arrayMenuLevel.IDMENUADMIN,
                            checkBoxPermission = '';
                        for (let i = 1; i <= 3; i++) {
                            if (arrayMenuLevel['PERMISSION' + i] != null && arrayMenuLevel['PERMISSION' + i] != '') {
                                checkBoxPermission += '<div class="form-check">' +
                                    '<input type="checkbox" class="form-check-input solid-checkbox" name="menuLevelPermission-' + idMenuAdmin + '-' + i + '" ' + (arrayMenuLevel['ALLOWPERMISSION' + i] == 1 ? 'checked' : '') + '>' +
                                    '<label class="form-check-label" for="menuLevelCheck-' + idMenuAdmin + '-' + i + '">' + arrayMenuLevel['PERMISSION' + i] + '</label>' +
                                    '</div>';
                            }
                        }

                        rowMenuLevel += '<tr data-idMenu="' + idMenuAdmin + '" data-idMenuLevelAdmin="' + arrayMenuLevel.IDMENULEVELADMIN + '">' +
                            '<td>' +
                            arrayMenuLevel.MENUNAME + '<br>' +
                            '<small class="text-muted">' + arrayMenuLevel.DESCRIPTION + '</small>' +
                            '</td>' +
                            '<td>' +
                            '<div class="form-check form-check-inline">' +
                            '<input type="radio" class="form-check-input solid-radio" value="1" id="menuLevelYes-' + idMenuAdmin + '" name="menuLevelRadio-' + idMenuAdmin + '" ' + (arrayMenuLevel.ISMENUOPEN == 1 ? 'checked' : '') + '>' +
                            '<label class="form-check-label" for="menuLevelYes-' + idMenuAdmin + '">Yes</label>' +
                            '</div>' +
                            '<div class="form-check form-check-inline">' +
                            '<input type="radio" class="form-check-input solid-radio" value="0" id="menuLevelNo-' + idMenuAdmin + '" name="menuLevelRadio-' + idMenuAdmin + '" ' + (arrayMenuLevel.ISMENUOPEN == 0 ? 'checked' : '') + '>' +
                            '<label class="form-check-label" for="menuLevelNo-' + idMenuAdmin + '">No</label>' +
                            '</div>' +
                            '</td>' +
                            '<td>' + checkBoxPermission + '</td>' +
                            '</tr>';
                    });
                    break;
                default:
                    let responseMessage = getMessageResponse(jqXHR);
                    rowMenuLevel = '<td colspan="' + columnNumber + '" class="text-center">' + responseMessage + '</td>';
                    break;
            }

            $tableBody.html(rowMenuLevel);
            refreshSimpleScrollBarListAccessMenu();
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
    });
}

function refreshSimpleScrollBarListAccessMenu() {
    var sideMenuHeight = $(".side-menu").height(),
        sideMenuHeight = sideMenuHeight <= 80 ? $(document).height() : sideMenuHeight,
        userLevelDetailsHeight = $("#wrapper-userlevelDetails").height(),
        listAccessMenuHeight = sideMenuHeight - userLevelDetailsHeight - 20;
    $("#userLevelDetails-containerTableMenuList").css('height', listAccessMenuHeight + 'px');
    $("#userLevelDetails-containerTableMenuList").sScrollBar();
}

$('#modalAddNewUserLevel-form').off('submit');
$('#modalAddNewUserLevel-form').on('submit', function (e) {
    e.preventDefault();
    let userLevelName = $("#modalAddNewUserLevel-userLevelName").val(),
        description = $("#modalAddNewUserLevel-description").val();

    if (userLevelName == '') {
        showWarning('Please enter a valid level name');
    } else if (description == '') {
        showWarning('Please enter a valid description');
    } else {
        let dataSend = {
            userLevelName: userLevelName,
            description: description
        };

        $.ajax({
            type: 'POST',
            url: baseURL + "userLevelMenu/addLevelAdmin",
            contentType: 'application/json',
            dataType: 'json',
            cache: false,
            data: mergeDataSend(dataSend),
            xhrFields: {
                withCredentials: true,
            },
            headers: {
                Authorization: "Bearer " + getUserToken(),
            },
            beforeSend: function () {
                NProgress.set(0.4);
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON = jqXHR.responseJSON;
                switch (jqXHR.status) {
                    case 200:
                        let dataResponse = responseJSON.throwableData,
                            idUserLevel = dataResponse.idUserLevel;
                        getDataUserLevel(idUserLevel);
                        $('#modal-addNewUserLevel').modal('hide');
                        $("#modalAddNewUserLevel-userLevelName, #modalAddNewUserLevel-description").val('');
                        showToast('success', jqXHR)
                        break;
                    default:
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            $("#window-loader").modal("hide");
            NProgress.done();
            setUserToken(jqXHR);
        });
    }
});

$('#userlevelDetails-btnSaveMenuLevelAdmin').off('click');
$('#userlevelDetails-btnSaveMenuLevelAdmin').on('click', function (e) {
    e.preventDefault();
    let idUserLevel = $("#userlevelDetails-idUserLevel").val(),
        userLevelName = $("#userlevelDetails-levelName").val(),
        description = $("#userlevelDetails-description").val(),
        $tableBody = $('#userLevelDetails-tableMenuList > tbody'),
        userLevelMenu = [];

    if (userLevelName == '') {
        showWarning('Please enter a valid level name');
    } else if (description == '') {
        showWarning('Please enter a valid description');
    } else {
        $tableBody.find('tr').each(function () {
            let idMenuAdmin = $(this).attr('data-idMenu'),
                idMenuLevelAdmin = $(this).attr('data-idMenuLevelAdmin'),
                isMenuOpen = $(this).find('input[name="menuLevelRadio-' + idMenuAdmin + '"]:checked').val(),
                allowPermission1 = $(this).find('input[name="menuLevelPermission-' + idMenuAdmin + '-1"]').is(':checked') ? 1 : 0,
                allowPermission2 = $(this).find('input[name="menuLevelPermission-' + idMenuAdmin + '-2"]').is(':checked') ? 1 : 0,
                allowPermission3 = $(this).find('input[name="menuLevelPermission-' + idMenuAdmin + '-3"]').is(':checked') ? 1 : 0;

            userLevelMenu.push({
                idMenuAdmin: idMenuAdmin,
                idMenuLevelAdmin: idMenuLevelAdmin,
                isMenuOpen: isMenuOpen,
                allowPermission1: allowPermission1,
                allowPermission2: allowPermission2,
                allowPermission3: allowPermission3
            });
        });

        let dataSend = {
            idUserLevel: idUserLevel,
            userLevelName: userLevelName,
            description: description,
            userLevelMenu: userLevelMenu
        };

        $.ajax({
            type: 'POST',
            url: baseURL + "userLevelMenu/saveLevelMenu",
            contentType: 'application/json',
            dataType: 'json',
            cache: false,
            data: mergeDataSend(dataSend),
            xhrFields: {
                withCredentials: true,
            },
            headers: {
                Authorization: "Bearer " + getUserToken(),
            },
            beforeSend: function () {
                NProgress.set(0.4);
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON = jqXHR.responseJSON;
                switch (jqXHR.status) {
                    case 200:
                        let dataResponse = responseJSON.throwableData,
                            idUserLevel = dataResponse.idUserLevel;
                        getDataUserLevel(idUserLevel);
                        showToast('success', jqXHR)
                        break;
                    default:
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            $("#window-loader").modal("hide");
            NProgress.done();
            setUserToken(jqXHR);
        });
    }
});

userLevelMenuFunc();