var defaultNoLinkedAccountName;
if (userAdminFunc == null) {
    var userAdminFunc = function () {
        $(document).ready(function () {
            let dataUserAdminUnlinked, dataLevelMenu, lastIdUserAdmin;
            defaultNoLinkedAccountName = '<i class="ri-error-warning-line me-2"></i>No linked account';
            setOptionHelper('filterUserAdmin-optionLevelUserAdmin', 'dataUserAdminLevel');
            setOptionHelper('editorUserAdmin-optionLevelUserAdmin', 'dataUserAdminLevel');
            activatePasswordVisibility();
            getDataUserAdmin();
        });
    }
}

$('#filterUserAdmin-optionLevelUserAdmin').off('change');
$('#filterUserAdmin-optionLevelUserAdmin').on('change', function (e) {
    getDataUserAdmin();
});

$('#filterUserAdmin-searchKeyword').off('keypress');
$("#filterUserAdmin-searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        getDataUserAdmin();
    }
});

function getDataUserAdmin(idUserAdmin = false) {
    var $elemList = $('#list-userAdminData'),
        idLevelUserAdmin = $('#filterUserAdmin-optionLevelUserAdmin').val(),
        searchKeyword = $('#filterUserAdmin-searchKeyword').val(),
        dataSend = {
            idLevelUserAdmin: idLevelUserAdmin,
            searchKeyword: searchKeyword
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "userAdmin/getDataUserAdmin",
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
            recalculateSimpleBar('simpleBar-list-userAdminData');
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    let dataUserAdmin = responseJSON.dataUserAdmin,
                        dataMenu = responseJSON.dataMenu;
                    dataUserAdminUnlinked = responseJSON.dataUserAdminUnlinked;
                    dataLevelMenu = responseJSON.dataLevelMenu;

                    $.each(dataUserAdmin, function (index, arrayUserAdmin) {
                        rows += '<li class="userAdmin-item mb-2 px-3 py-2 mx-2 border-bottom rounded-2 active bg-light" ' +
                            'data-idUserAdmin="' + arrayUserAdmin.IDUSERADMIN + '" ' +
                            'data-idUserAdminLevel="' + arrayUserAdmin.IDUSERADMINLEVEL + '" ' +
                            'data-idUserAdminInternal="' + arrayUserAdmin.IDUSERADMININTERNAL + '" ' +
                            'data-name="' + arrayUserAdmin.NAME + '" ' +
                            'data-username="' + arrayUserAdmin.USERNAME + '" ' +
                            'data-email="' + arrayUserAdmin.EMAIL + '" ' +
                            'data-linkedAccountName="' + arrayUserAdmin.LINKEDACCOUNTNAME + '" ' +
                            'data-dateTimeLogin="' + arrayUserAdmin.DATETIMELOGIN + '" ' +
                            'data-dateTimeActivity="' + arrayUserAdmin.DATETIMEACTIVITY + '">' +
                            '<div class="pills-list-item d-flex align-items-center">' +
                            '<div class="flex-grow-1">' +
                            '<h5 class="text-truncate font-size-15 mb-1">' + arrayUserAdmin.NAME + '</h5>' +
                            '<p class="text-muted text-truncate mb-0">' + arrayUserAdmin.LEVELNAME + '</p>' +
                            '<p class="text-muted text-truncate mb-0">' + arrayUserAdmin.USERNAME + ' - ' + arrayUserAdmin.EMAIL + '</p>' +
                            '</div>' +
                            '</div>' +
                            '</li>';
                    });
                    generateMenuList(dataMenu);
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
            activateOnClickUserAdminItem();
            generateListAccountUnlinked(dataUserAdminUnlinked);
            if (!idUserAdmin) $('.userAdmin-item').first().trigger('click');
            if (idUserAdmin) $('.userAdmin-item[data-idUserAdmin=' + idUserAdmin + ']').trigger('click');
            recalculateSimpleBar('simpleBar-list-userAdminData');
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
    });
}

function refreshSimpleScrollBarDetailUserAdmin() {
    var sideMenuHeight = $(".side-menu").height(),
        sideMenuHeight = sideMenuHeight <= 80 ? $(document).height() : sideMenuHeight,
        userAdminListHeight = sideMenuHeight - 160;
    $("#simpleScrollBar-detailUserAdmin").css('height', userAdminListHeight + 'px');
    $('#simpleScrollBar-detailUserAdmin').sScrollBar();
}

function activateOnClickUserAdminItem() {
    $('.userAdmin-item').off('click');
    $('.userAdmin-item').on('click', function (e) {
        var idUserAdmin = $(this).attr('data-idUserAdmin'),
            idUserAdminLevel = $(this).attr('data-idUserAdminLevel'),
            idUserAdminInternal = $(this).attr('data-idUserAdminInternal'),
            name = $(this).attr('data-name'),
            username = $(this).attr('data-username'),
            email = $(this).attr('data-email'),
            linkedAccountName = $(this).attr('data-linkedAccountName'),
            linkedAccountNameElem = idUserAdminInternal == "" || idUserAdminInternal == "-" ? defaultNoLinkedAccountName : '<i class="ri-account-circle-line me-2"></i>' + linkedAccountName,
            dateTimeLogin = $(this).attr('data-dateTimeLogin'),
            dateTimeActivity = $(this).attr('data-dateTimeActivity');
        lastIdUserAdmin = idUserAdmin;
        resetFormEditorUserAdmin();
        $(".userAdmin-item").removeClass('active bg-light');
        $(this).addClass('active bg-light');

        $("#editorUserAdmin-name").val(name);
        $("#editorUserAdmin-username").val(username);
        $("#editorUserAdmin-email").val(email);
        $("#editorUserAdmin-linkedAccountName").html(linkedAccountNameElem);

        if (linkedAccountName == "" || linkedAccountName == "-") {
            $("#editorUserAdmin-linkedAccountName").closest('.alert').removeClass('alert-success').addClass('alert-danger');
        } else {
            $("#editorUserAdmin-linkedAccountName").closest('.alert').removeClass('alert-danger').addClass('alert-success');
        }

        $("#editorUserAdmin-optionLevelUserAdmin").val(idUserAdminLevel).trigger('change');
        $("#editorUserAdmin-idUserAdminInternal").val(idUserAdminInternal);
        $("#editorUserAdmin-idUserAdmin").val(idUserAdmin);

        $("#userAdminDetails-lastLogin").html(dateTimeLogin);
        $("#userAdminDetails-lastActivity").html(dateTimeActivity);
        $("#userAdmin-btnAddNewUserAdmin, #editorUserAdmin-containerCurrentPassword, #editorUserAdmin-containerDateTimeDetails").removeClass('d-none');
        $("#editorUserAdmin-form input, #editorUserAdmin-form option, #editorUserAdmin-form button").prop("disabled", false);
        $("#editorUserAdmin-password, #editorUserAdmin-repeatPassword").attr('required', false);
        $("#editorUserAdmin-btnCancel").addClass('d-none');
        refreshSimpleScrollBarDetailUserAdmin();
    });
    activateOnClickPillsItem();
}

function generateListAccountUnlinked(dataUserAdminUnlinked = []) {
    let listAccountUnlinked = '';
    if (dataUserAdminUnlinked.length > 0) {
        $.each(dataUserAdminUnlinked, function (index, arrayUserAdminUnlinked) {
            listAccountUnlinked += '<li class="list-group-item d-flex justify-content-between align-items-center">' +
                '<div class="form-check">' +
                '<input class="form-check-input" type="radio" name="modalChooseLinkedAccount-linkedAccount" id="modalChooseLinkedAccount-linkedAccount' + arrayUserAdminUnlinked.IDUSERADMIN + '" value="' + arrayUserAdminUnlinked.IDUSERADMIN + '">' +
                '<label class="form-check-label" for="modalChooseLinkedAccount-linkedAccount' + arrayUserAdminUnlinked.IDUSERADMIN + '">' + arrayUserAdminUnlinked.NAME + ' - ' + arrayUserAdminUnlinked.LEVELNAME + '</label>' +
                '</div>' +
                '</li>';
        });
        listAccountUnlinked += '<li class="list-group-item d-flex justify-content-between align-items-center">' +
            '<div class="form-check">' +
            '<input class="form-check-input" type="radio" name="modalChooseLinkedAccount-linkedAccount" id="modalChooseLinkedAccount-linkedAccount" value="">' +
            '<label class="form-check-label" for="modalChooseLinkedAccount-linkedAccount"> None</label>' +
            '</div>' +
            '</li>';
        $("#modalChooseLinkedAccount-btnSelectAccount").prop("disabled", false);
    } else {
        listAccountUnlinked = '<li class="list-group-item alert alert-danger d-flex align-items-center mb-0"><i class="ri-error-warning-line text-danger font-size-20 me-2"></i> No unlinked account</li>';
        $("#modalChooseLinkedAccount-btnSelectAccount").prop("disabled", true);
    }
    $('#modalChooseLinkedAccount-listAccount').html(listAccountUnlinked);
};

function generateMenuList(dataMenu) {
    let menuList = '';
    if (dataMenu.length > 0) {
        $.each(dataMenu, function (index, arrayMenu) {
            menuList += '<li class="list-group-item d-flex justify-content-between align-items-center" data-idMenu="' + arrayMenu.IDMENUADMIN + '">' + arrayMenu.MENUNAME + ' <i class="editorUserAdmin-menuListAvailableIcon ri-check-line text-success font-size-20"></i></li>';
        });
    } else {
        menuList = '<li class="list-group-item d-flex justify-content-between align-items-center">No menu assigned <i class="ri-close-line text-danger font-size-20"></i></li>';
    }
    $('#editorUserAdmin-menuListAvailable').html(menuList);
    $('#editorUserAdmin-optionLevelUserAdmin').trigger('change');
}

$('#userAdmin-btnAddNewUserAdmin').off('click');
$('#userAdmin-btnAddNewUserAdmin').on('click', function (e) {
    $("#filterUserAdmin-optionLevelUserAdmin, #filterUserAdmin-searchKeyword").prop("disabled", true);
    $('.userAdmin-item').off('click').removeClass('active bg-light');
    $("#userAdmin-btnAddNewUserAdmin, #editorUserAdmin-containerCurrentPassword, #editorUserAdmin-containerDateTimeDetails").addClass('d-none');
    $("#editorUserAdmin-form input, #editorUserAdmin-form option, #editorUserAdmin-form button").prop("disabled", false);
    $("#editorUserAdmin-btnCancel").removeClass('d-none');
    $("#editorUserAdmin-password, #editorUserAdmin-repeatPassword").attr('required', true);
    resetFormEditorUserAdmin();
});

function resetFormEditorUserAdmin() {
    $('#editorUserAdmin-linkedAccountName').html(defaultNoLinkedAccountName).closest('.alert').removeClass('alert-success').addClass('alert-danger');
    $('#editorUserAdmin-name, #editorUserAdmin-username, #editorUserAdmin-email').val("");
    $('#editorUserAdmin-optionLevelUserAdmin, #editorUserAdmin-idUserAdminInternal, #editorUserAdmin-idUserAdmin').val("");
    $('.editorUserAdmin-menuListAvailableIcon').removeClass('ri-check-line text-success').addClass('ri-close-line text-danger');
    $("#editorUserAdmin-currentPassword, #editorUserAdmin-password, #editorUserAdmin-repeatPassword").val("");
    $('#editorUserAdmin-optionLevelUserAdmin').trigger('change');
}

$('#editorUserAdmin-btnChooseLinkedAccount').off('click');
$('#editorUserAdmin-btnChooseLinkedAccount').on('click', function (e) {
    const idUserAdminInternal = $('#editorUserAdmin-idUserAdminInternal').val(),
        linkedAccountName = $('#editorUserAdmin-linkedAccountName').text();
    $('.modalChooseLinkedAccount-temporaryLinkedAccount').remove();
    if (idUserAdminInternal != "") {
        let temporaryLinkedAccount = '<li class="list-group-item d-flex justify-content-between align-items-center modalChooseLinkedAccount-temporaryLinkedAccount">' +
            '<div class="form-check">' +
            '<input class="form-check-input" type="radio" name="modalChooseLinkedAccount-linkedAccount" id="modalChooseLinkedAccount-linkedAccount' + idUserAdminInternal + '" value="' + idUserAdminInternal + '">' +
            '<label class="form-check-label" for="modalChooseLinkedAccount-linkedAccount' + idUserAdminInternal + '">' + linkedAccountName + '</label>' +
            '</div>' +
            '</li>';
        $("#modalChooseLinkedAccount-listAccount").prepend(temporaryLinkedAccount);
    } else {
        $("#modalChooseLinkedAccount-linkedAccount").prop("checked", true);
    }
    $("#modal-chooseLinkedAccount").modal("show");
});

$('#modalChooseLinkedAccount-form').off('submit');
$('#modalChooseLinkedAccount-form').on('submit', function (e) {
    e.preventDefault();
    let idUserAdminInternal = $("input[name='modalChooseLinkedAccount-linkedAccount']:checked").val(),
        userAdminInternalName = idUserAdminInternal == "" ? "No linked account" : $("input[name='modalChooseLinkedAccount-linkedAccount']:checked").next('label').text(),
        linkedAccountNameElem = idUserAdminInternal != '' && idUserAdminInternal != '-' ? '<i class="ri-account-circle-line me-2"></i>' + userAdminInternalName : defaultNoLinkedAccountName;
    $("#editorUserAdmin-linkedAccountName").html(linkedAccountNameElem);
    $("#editorUserAdmin-idUserAdminInternal").val(idUserAdminInternal);

    if (idUserAdminInternal == "" || idUserAdminInternal == "-") {
        $("#editorUserAdmin-linkedAccountName").closest('.alert').removeClass('alert-success').addClass('alert-danger');
    } else {
        $("#editorUserAdmin-linkedAccountName").closest('.alert').removeClass('alert-danger').addClass('alert-success');
    }

    $("#modal-chooseLinkedAccount").modal("hide");
});

$('#editorUserAdmin-optionLevelUserAdmin').off('change');
$('#editorUserAdmin-optionLevelUserAdmin').on('change', function (e) {
    $(".editorUserAdmin-menuListAvailableIcon").removeClass('ri-check-line text-success').addClass('ri-close-line text-danger');
    if (typeof dataLevelMenu !== 'undefined' && dataLevelMenu.length > 0) {
        let idLevelUserAdmin = $(this).val();
        $.each(dataLevelMenu, function (index, arrayLevel) {
            if (arrayLevel.IDUSERADMINLEVEL == idLevelUserAdmin) {
                let idMenuLevel = arrayLevel.IDMENUADMIN,
                    elemListMenu = $('#editorUserAdmin-menuListAvailable').find('li[data-idMenu=' + idMenuLevel + ']');
                elemListMenu.find('.editorUserAdmin-menuListAvailableIcon').removeClass('ri-close-line text-danger').addClass('ri-check-line text-success');
            }
        });
    }
});

$('#editorUserAdmin-btnCancel').off('click');
$('#editorUserAdmin-btnCancel').on('click', function (e) {
    const elemUserAdminItem = $('.userAdmin-item[data-idUserAdmin=' + lastIdUserAdmin + ']');
    $("#filterUserAdmin-optionLevelUserAdmin, #filterUserAdmin-searchKeyword").prop("disabled", false);
    $("#editorUserAdmin-password, #editorUserAdmin-repeatPassword").attr('required', false);
    activateOnClickUserAdminItem();

    if (elemUserAdminItem.length > 0) {
        elemUserAdminItem.trigger('click');
    } else {
        $("#userAdmin-btnAddNewUserAdmin, #editorUserAdmin-containerCurrentPassword, #editorUserAdmin-containerDateTimeDetails").removeClass('d-none');
        $("#editorUserAdmin-btnCancel").addClass('d-none');
        $("#editorUserAdmin-form input, #editorUserAdmin-form option, #editorUserAdmin-form button").prop("disabled", true);
        resetFormEditorUserAdmin();
    }
});

$('#editorUserAdmin-form').off('submit');
$('#editorUserAdmin-form').on('submit', function (e) {
    e.preventDefault();
    const idUserAdmin = $('#editorUserAdmin-idUserAdmin').val(),
        idUserAdminInternal = $('#editorUserAdmin-idUserAdminInternal').val(),
        idLevelUserAdmin = $('#editorUserAdmin-optionLevelUserAdmin').val(),
        name = $('#editorUserAdmin-name').val(),
        username = $('#editorUserAdmin-username').val(),
        email = $('#editorUserAdmin-email').val(),
        currentPassword = $('#editorUserAdmin-currentPassword').val(),
        newPassword = $('#editorUserAdmin-password').val(),
        repeatPassword = $('#editorUserAdmin-repeatPassword').val();
    let dataSend = {
        idUserAdmin: idUserAdmin,
        idUserAdminInternal: idUserAdminInternal,
        idLevelUserAdmin: idLevelUserAdmin,
        name: name,
        username: username,
        email: email,
        currentPassword: currentPassword,
        newPassword: newPassword,
        repeatPassword: repeatPassword
    };

    if (idUserAdmin == "" && newPassword != repeatPassword) {
        showWarning("Password and Repeat Password do not match");
    } else {
        $.ajax({
            type: 'POST',
            url: baseURL + "userAdmin/saveUserAdmin",
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
                            idUserAdmin = dataResponse.idUserAdmin;
                        getDataUserAdmin(idUserAdmin);
                        showToast('success', jqXHR)
                        break;
                    case 400:
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

userAdminFunc();