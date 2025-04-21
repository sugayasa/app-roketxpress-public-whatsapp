if (chatFunc == null) {
    var chatFunc = function () {
        $(document).ready(function () {
            $("#user-profile-hide").click(function () {
                $(".user-profile-sidebar").hide()
            }), $(".user-profile-show").click(function () {
                $(".user-profile-sidebar").show()
            });
            setVerticalCenterContentContainer('content-chat-landing', 150);
            getDataChatList();
        });
    }
}

$('#filter-searchKeyword').off('keypress');
$("#filter-searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        getDataChatList();
    }
});

function getDataChatList(page = 1) {
    var $elemList = $('#list-chatListData'),
        idContact = $('#filter-idContact').val(),
        searchKeyword = $('#filter-searchKeyword').val(),
        dataSend = {
            page: page,
            searchKeyword: searchKeyword,
            idContact: idContact
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "chat/getDataChatList",
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
            $("#btnLoadMoreData").replaceWith(loaderElem);
            recalculateSimpleBar('simpleBar-list-chatList');
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                loadMoreData = false,
                firstIdChatList = null,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    var dataChatList = responseJSON.dataChatList,
                        nextPage = page + 1;
                    loadMoreData = responseJSON.loadMoreData;
                    $.each(dataChatList, function (index, arrayChat) {
                        var totalUnreadMsg = arrayChat.TOTALUNREADMESSAGE;
                        totalUnreadMsgElem = totalUnreadMsg > 0 ? '<div class="unread-message"><span class="badge badge-soft-danger rounded-pill">' + totalUnreadMsg + '</span></div>' : '';
                        rows += '<li class="unread chatList-item" data-idChatList="' + arrayChat.IDCHATLIST + '" data-timestamp="' + arrayChat.DATETIMELASTMESSAGE + '">' +
                            '<a href="#" >' +
                            '<div class="d-flex">' +
                            '<div class="chat-user-img align-self-center me-3 ms-0">' +
                            '<div class="avatar-xs">' +
                            '<span class="avatar-title rounded-circle bg-primary-subtle text-primary">' + arrayChat.NAMEALPHASEPARATOR + '</span>' +
                            '</div>' +
                            '</div>' +
                            '<div class="flex-grow-1 overflow-hidden">' +
                            '<h5 class="text-truncate font-size-15 mb-1">' + arrayChat.NAMEFULL + '</h5>' +
                            '<p class="chat-user-message text-truncate mb-0">' + arrayChat.LASTMESSAGE + '</p>' +
                            '</div>' +
                            '<div class="chatList-item-time font-size-11">' + arrayChat.DATETIMELASTMESSAGESTR + '</div>' + totalUnreadMsgElem +
                            '</div>' +
                            '</a>' +
                            '</li>';
                        if (index == 0 && idContact != '') firstIdChatList = arrayChat.IDCHATLIST;
                    });
                    break;
                case 404:
                default:
                    break;
            }

            var btnLoadMoreData = '';
            if (rows != '' && loadMoreData) {
                var nextPage = page + 1;
                btnLoadMoreData = '<li><button id="btnLoadMoreData" class="btn btn-primary my-3 w-100" onclick="getDataChatList(' + nextPage + ')">Load More</button></li>';
            }

            if (page == 1) $elemList.html(rows);
            if (page > 1) $elemList.append(rows);
            if (btnLoadMoreData != '') $elemList.append(btnLoadMoreData);
            $("#loaderElem").remove();

            activateOnClickChatListItem(firstIdChatList);
            recalculateSimpleBar('simpleBar-list-chatList');
            counterTimeChatList();
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
        $('#filter-idContact').val('');
    });
}

function activateOnClickChatListItem(firstIdChatList) {
    $('.chatList-item').off('click');
    $('.chatList-item').on('click', function (e) {
        var idChatList = $(this).attr('data-idChatList');
        $(".chatList-item").removeClass('active');
        $(this).addClass('active');

        setChatContentStarterElement();
        generateChatThread(idChatList);
        resetFocusChatInputTextMessage();
    });

    if (firstIdChatList != null) {
        setChatContentStarterElement();
        generateChatThread(firstIdChatList);
    }
    activateOnClickPillsItem();
}

function setChatContentStarterElement() {
    if ($("#content-chat-landing").length > 0) {
        $("#content-chat-landing").remove();
        $("#chat-topbar, #chat-conversation, #chat-input-section").removeClass('d-none');
    }
}

function generateChatThread(idChatList) {
    var dataSend = { idChatList: idChatList, page: 1 };
    $.ajax({
        type: 'POST',
        url: baseURL + "chat/getDetailChat",
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
            $("#chat-topbar-initial, #chat-topbar-fullName").html("-");
            $("#profile-sidebar-initial, #profile-sidebar-fullName").html("-");
            $("#profile-sidebar-phoneNumber, #profile-sidebar-countryContinent, #profile-sidebar-email").html("-");
            $(".chatThread, .chat-day-title, .reservationListElem").remove();
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    var detailContact = responseJSON.detailContact,
                        listChatThread = responseJSON.listChatThread,
                        listActiveReservation = responseJSON.listActiveReservation,
                        rowChatThread = chatContentWrap = '';

                    $("#chat-topbar-initial, #profile-sidebar-initial").html(detailContact.NAMEALPHASEPARATOR);
                    $("#chat-topbar-fullName, #profile-sidebar-fullName").html(detailContact.NAMEFULL);
                    $("#profile-sidebar-phoneNumber").html('+' + detailContact.PHONENUMBER);
                    $("#profile-sidebar-countryContinent").html(detailContact.COUNTRYNAME + ", " + detailContact.CONTINENTNAME);
                    $("#profile-sidebar-email").html(detailContact.EMAILS);
                    $("#chat-idContact").val(detailContact.IDCONTACT);

                    $.each(listChatThread, function (index, arrayChatThread) {
                        var chatThreadPosition = arrayChatThread.CHATTHREADPOSITION,
                            userNameChat = arrayChatThread.USERNAMECHAT,
                            dayTitle = arrayChatThread.DAYTITLE,
                            chatContent = generateChatContent(arrayChatThread),
                            classRight = chatThreadPosition == 'L' ? '' : 'right';
                        var arrayChatThreadNext = (index + 1 < listChatThread.length) ? listChatThread[index + 1] : false,
                            chatThreadPositionNext = arrayChatThreadNext.CHATTHREADPOSITION,
                            userNameChatNext = arrayChatThreadNext.USERNAMECHAT,
                            dayTitleNext = arrayChatThreadNext.DAYTITLE,
                            textStartClass = arrayChatThread.ISTEMPLATE ? 'text-start' : '';

                        chatContentWrap += generateChatContentWrap(chatThreadPosition, arrayChatThread, chatContent, arrayChatThread.CHATTIME, textStartClass);

                        var $elemRowChatThread = $(rowChatThread),
                            isDayTitleElemExist = $elemRowChatThread.find('.chat-day-title[data-dayTitle="' + dayTitle + '"]').length > 0;

                        if (chatThreadPosition != chatThreadPositionNext || userNameChat != userNameChatNext || (dayTitle != dayTitleNext && !isDayTitleElemExist)) {
                            if (!isDayTitleElemExist) rowChatThread += '<li><div class="chat-day-title" data-dayTitle="' + dayTitle + '"><span class="title">' + dayTitle + '</span></div></li>';
                            rowChatThread += generateRowChatThread(classRight, arrayChatThread.INITIALNAME, chatContentWrap, userNameChat);
                            chatContentWrap = '';
                        }
                    });
                    $("#chat-conversation-ul").html(rowChatThread);
                    recalculateSimpleBar('chat-conversation', true);

                    if (listActiveReservation) {
                        var reservationListElem = '';
                        $.each(listActiveReservation, function (index, arrayActiveReservation) {
                            var reservationDateTimeStr = arrayActiveReservation.RESERVATIONDATESTARTSTR + " " + arrayActiveReservation.RESERVATIONTIMESTARTSTR,
                                areaName = arrayActiveReservation.AREANAME.toLowerCase() == "without transfer" ? "<b class='text-danger'>" + arrayActiveReservation.AREANAME + "</b>" : arrayActiveReservation.AREANAME,
                                paxDetails = arrayActiveReservation.NUMBEROFADULT + ' Adult, ' + arrayActiveReservation.NUMBEROFCHILD + ' Child, ' + arrayActiveReservation.NUMBEROFINFANT + ' Infant';
                            if (arrayActiveReservation.DURATIONOFDAY > 1) {
                                reservationDateTimeStr = reservationDateTimeStr + " - " + arrayActiveReservation.RESERVATIONDATEENDSTR + " " + arrayActiveReservation.RESERVATIONTIMEENDSTR;
                            }
                            reservationListElem += '<div class="accordion-item card border reservationListElem mb-2">' +
                                '<div class="accordion-header" id = "header-' + arrayActiveReservation.BOOKINGCODE + '" >' +
                                '<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#reservation-' + arrayActiveReservation.BOOKINGCODE + '" aria-expanded="true" aria-controls="reservation-' + arrayActiveReservation.BOOKINGCODE + '">' +
                                '<h5 class="font-size-14 m-0"><i class="ri-coupon-fill me-2 ms-0 align-middle d-inline-block"></i> ' + arrayActiveReservation.SOURCENAME + ' - ' + arrayActiveReservation.BOOKINGCODE + '</h5>' +
                                '</button>' +
                                '</div>' +
                                '<div id = "reservation-' + arrayActiveReservation.BOOKINGCODE + '" class="accordion-collapse collapse show" aria-labelledby="header-' + arrayActiveReservation.BOOKINGCODE + '" data-bs-parent="#profile-sidebar-reservationList"> ' +
                                '<div class="accordion-body"> ' +
                                '<div>' +
                                '<h5 class="font-size-14">' + arrayActiveReservation.RESERVATIONTITLE + '</h5>' +
                                '</div>' +
                                '<div class="mt-4">' +
                                '<p class="text-muted mb-1"> Date</p>' +
                                '<h5 class="font-size-14">' + reservationDateTimeStr + '</h5>' +
                                '</div>' +
                                '<div class="mt-4">' +
                                '<p class="text-muted mb-1"> Pax</p>' +
                                '<h5 class="font-size-14"> ' + paxDetails + '</h5>' +
                                '</div>' +
                                '<div class="mt-4"> ' +
                                '<p class="text-muted mb-1"> Area</p> ' +
                                '<h5 class="font-size-14"> ' + areaName + '</h5> ' +
                                '</div>' +
                                '<div class="mt-4">' +
                                '<p class="text-muted mb-1"> Hotel</p>' +
                                '<h5 class="font-size-14"> ' + arrayActiveReservation.HOTELNAME + '</h5>' +
                                '</div>' +
                                '<div class="mt-4">' +
                                '<p class="text-muted mb-1"> Pick Up</p>' +
                                '<h5 class="font-size-14"> ' + arrayActiveReservation.PICKUPLOCATION + '</h5>' +
                                '</div>' +
                                '<div class="mt-4">' +
                                '<p class="text-muted mb-1"> Drop Off</p>' +
                                '<h5 class="font-size-14 mb-0"> ' + arrayActiveReservation.DROPOFFLOCATION + '</h5>' +
                                '</div> ' +
                                '<div class="mt-4" > ' +
                                '<p class="text-muted mb-1" > Tour Plan</p > ' +
                                '<h5 class="font-size-14 mb-0"> ' + arrayActiveReservation.TOURPLAN + ' </h5 > ' +
                                '</div> ' +
                                '<div class="mt-4"> ' +
                                '<p class="text-muted mb-1"> Remark</p> ' +
                                '<h5 class="font-size-14 mb-0"> ' + arrayActiveReservation.REMARK + '</h5> ' +
                                '</div> ' +
                                '<div class="mt-4"> ' +
                                '<p class="text-muted mb-1" > Special Request</p> ' +
                                '<h5 class="font-size-14 mb-0" > ' + arrayActiveReservation.SPECIALREQUEST + '</h5> ' +
                                '</div> ' +
                                '</div> ' +
                                '</div> ' +
                                '</div> ';
                        });
                        $("#profile-sidebar-reservationList").html(reservationListElem);
                    }
                    break;
                default:
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
    });
}

function generateRowChatThread(classRight, initialName, chatContentWrap, userNameChat) {
    return '<li class="chatThread ' + classRight + '">' +
        '<div class="conversation-list pb-3">' +
        '<div class="chat-avatar">' +
        '<span class="rounded-circle avatar-xs bg-primary-subtle text-primary mx-auto font-size-19 px-2 py-1">' + initialName + '</span>' +
        '</div>' +
        '<div class="user-chat-content">' + chatContentWrap +
        '<div class="conversation-name">' + userNameChat + '</div>' +
        '</div>' +
        '</div>' +
        '</li> ';
}

function openChatContact(parameters) {
    let idContact = parameters.idContact,
        phoneNumber = parameters.phoneNumber;

    $("#filter-idContact").val(idContact);
    $("#filter-searchKeyword").val(phoneNumber);
}

$('#chat-inputTextMessage').off('keydown');
$('#chat-inputTextMessage').on('keydown', function (e) {
    if ((e.key === 'Enter' || e.which == 13) && e.shiftKey) {
        e.preventDefault();
        $(this).val($(this).val() + "\n");
    } else if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

$('#chat-inputTextMessage').off('input');
$('#chat-inputTextMessage').on('input', function () {
    let currentRowsNumber = (this.value.match(/\n/g) || []).length,
        updatedRowsNumber = currentRowsNumber + 1;
    $(this).attr('rows', updatedRowsNumber > 2 ? 2 : updatedRowsNumber);
});

$('#chat-formMessage').off('submit');
$('#chat-formMessage').on('submit', function (e) {
    e.preventDefault();
    sendMessage();
});

function sendMessage() {
    let idContact = $('#chat-idContact').val(),
        phoneNumber = $('#profile-sidebar-phoneNumber').html(),
        message = $('#chat-inputTextMessage').val(),
        dataSend = {
            idContact: idContact,
            message: message,
            phoneNumber: phoneNumber
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "chat/sendMessage",
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
            $('#chat-inputTextMessage, #chat-btnSendMessage').prop('disabled', true);
        },
        complete: function (jqXHR, textStatus) {
            switch (jqXHR.status) {
                case 200:
                    resetFocusChatInputTextMessage();
                    break;
                default:
                    generateWarningMessageResponse(jqXHR);
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
        $('#chat-inputTextMessage, #chat-btnSendMessage').prop('disabled', false);
    });
}

function resetFocusChatInputTextMessage() {
    $('#chat-inputTextMessage').focus().attr('rows', 1).val('');
}

$('#modal-messageACKDetails').off('show.bs.modal');
$('#modal-messageACKDetails').on('show.bs.modal', function (e) {
    let button = $(e.relatedTarget),
        idChatThread = button.data('idchatthread'),
        dateTimeSent = button.data('ack-sent'),
        dateTimeDelivered = button.data('ack-delivered'),
        dateTimeRead = button.data('ack-read');

    if (typeof idChatThread === 'undefined' || idChatThread == '') {
        let messageACKDetails = '<dt class="col-5 mb-2">Sent</dt>' +
            '<dd class="col-7 mb-2 text-muted">' + dateTimeSent + '</dd>' +
            '<dt class="col-5 mb-2">Delivered</dt>' +
            '<dd class="col-7 mb-2 text-muted">' + dateTimeDelivered + '</dd>' +
            '<dt class="col-5 mb-2">Read</dt>' +
            '<dd class="col-7 mb-2 text-muted">' + dateTimeRead + '</dd>';
        $('#messageACKDetails-rowData').html(messageACKDetails);
    } else {
        let dataSend = { idChatThread: idChatThread };
        $.ajax({
            type: 'POST',
            url: baseURL + "chat/getDetailThreadACK",
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
                $("#messageACKDetails-rowData").html(loaderElem);
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON = jqXHR.responseJSON,
                    messageACKDetails = '';
                switch (jqXHR.status) {
                    case 200:
                        let dataThreadACK = responseJSON.dataThreadACK;
                        messageACKDetails = '<h6 class="mb-2 text-muted">Read By :</h6>';
                        $.each(dataThreadACK, function (index, arrayThreadACK) {
                            messageACKDetails += '<dt class="col-6 mb-2 text-muted">' + formatDateTimeZoneString(arrayThreadACK.DATETIMEREAD) + '</dt>' +
                                '<dd class="col-6 mb-2">' + arrayThreadACK.NAME + '</dd>';
                        });
                        break;
                    default:
                        messageACKDetails = '<dt class="col-12">' + getMessageResponse(jqXHR) + '</dt>';
                        break;
                }

                $("#messageACKDetails-rowData").html(messageACKDetails);
            }
        }).always(function (jqXHR, textStatus) {
            NProgress.done();
            setUserToken(jqXHR);
        });
    }
});

chatFunc();