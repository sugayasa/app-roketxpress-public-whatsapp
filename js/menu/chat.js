var dataReservationTypeClass = {};
if (chatFunc == null) {
    var chatFunc = function () {
        $(document).ready(function () {
            let dataOptionHelper = JSON.parse(localStorage.getItem("optionHelper")),
                dataReservationType = dataOptionHelper['dataReservationType'];

            if (typeof dataReservationType != 'undefined' && dataReservationType != null && dataReservationType.length > 0) {
                let checkBoxReservationType = '';
                $.each(dataReservationType, function (index, arrayReservationType) {
                    let checked = idReservationType == arrayReservationType.ID ? 'checked' : '';
                    if (idReservationType == 0) checked = 'checked';

                    checkBoxReservationType += '<div class="form-check form-check-inline">\
                                                    <input '+ checked + ' class="form-check-input reservationTypeCheckbox" type="checkbox" id="reservationType-' + arrayReservationType.ID + '" value="' + arrayReservationType.ID + '">\
                                                    <label \
                                                        for="reservationType-'+ arrayReservationType.ID + '" \
                                                        class="form-check-label font-size-12 pe-1 border-end border-5 border-' + arrClassColor[index] + '">\
                                                            ' + arrayReservationType.VALUE + '\
                                                    </label>\
                                                </div>';
                    dataReservationTypeClass[arrayReservationType.ID] = arrClassColor[index];
                });

                $("#filter-reservationTypeContainer").append(checkBoxReservationType);
                $('.reservationTypeCheckbox').off('click');
                $('.reservationTypeCheckbox').on('click', function (e) {
                    getDataChatList();
                });
            }

            $("#user-profile-hide").click(function () {
                $(".user-profile-sidebar").hide()
            }), $(".user-profile-show").click(function () {
                $(".user-profile-sidebar").show()
            });
            setVerticalCenterContentContainer('content-chat-landing', 150);
            setOptionHelper('modalEditReservation-timeHour', 'optionHours');
            setOptionHelper('modalEditReservation-timeMinute', 'optionMinutes');
            setOptionHelper('modalEditReservation-pickUpArea', 'dataAllAreaType');
            getDataChatList();
            activateCounterFieldEvent();
            generateDatePickerElem('.modal');
        });
    }
}

$('#filter-searchKeyword').off('keypress');
$("#filter-searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        if ($(this).val() == '') {
            $('#filter-isSearchActive').val(false);
        } else {
            $('#filter-isSearchActive').val(true);
            $('#filter-idContact').val("");
        }
        getDataChatList();
    }
});

$('#filter-searchKeyword').off('input');
$("#filter-searchKeyword").on('input', function (e) {
    let inputValue = $(this).val();
    if (inputValue != '') {
        $('.chat-search-box .input-group-append').off('click');
        $('.chat-search-box .input-group-append').removeClass('d-none').on('click', function (e) {
            $(this).addClass('d-none')
            $('#filter-searchKeyword').val('');
            $('#filter-isSearchActive').val(false);
            getDataChatList();
        });
    } else {
        $('.chat-search-box .input-group-append').addClass('d-none').off('click');
    }
});

$('#chatStatusNav li button').off('click');
$('#chatStatusNav li button').on('click', function (e) {
    getDataChatList();
});

function getDataChatList(page = 1) {
    var $elemList = $('#list-chatListData'),
        idContact = $('#filter-idContact').val(),
        searchKeyword = $('#filter-searchKeyword').val(),
        arrReservationType = $('.reservationTypeCheckbox:checked').map(function () {
            return this.value;
        }).get(),
        chatType = $('#chatStatusNav li button.nav-link.active').attr('data-chatType'),
        dataSend = {
            page: page,
            searchKeyword: searchKeyword,
            arrReservationType: arrReservationType,
            chatType: chatType,
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
            if (page == 1) $elemList.html(loaderElem);
            if (page > 1) $("#btnLoadMoreData").replaceWith(loaderElem);
            recalculateSimpleBar('simpleBar-list-chatList');
            $('#chatStatusNav li button, #filter-searchKeyword').prop('disabled', true);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                loadMoreData = false,
                firstIdChatList = null,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    var dataChatList = responseJSON.dataChatList,
                        nextPage = page + 1,
                        loadMoreData = responseJSON.loadMoreData;
                    $.each(dataChatList, function (index, arrayChat) {
                        var totalUnreadMsg = arrayChat.TOTALUNREADMESSAGE,
                            arrIdReservationType = arrayChat.ARRIDRESERVATIONTYPE,
                            elemReservatioTypeTag = '';
                        totalUnreadMsgElem = totalUnreadMsg > 0 ? '<div class="unread-message"><span class="badge badge-soft-danger rounded-pill py-0">' + totalUnreadMsg + '</span></div>' : '';

                        if (arrIdReservationType.length > 0) {
                            for (var i = 0; i < arrIdReservationType.length; i++) {
                                let tagClass = dataReservationTypeClass[arrIdReservationType[i]];
                                if (typeof tagClass != 'undefined' && tagClass != null) elemReservatioTypeTag += '<div class="bg-' + tagClass + ' width-5px">&nbsp;</div>';
                            }
                        } else {
                            elemReservatioTypeTag += '<div class="width-5px">&nbsp;</div>';
                        }

                        rows += '<li class="unread chatList-item" data-idChatList="' + arrayChat.IDCHATLIST + '" data-timestamp="' + arrayChat.DATETIMELASTMESSAGE + '" data-datetimelastreply="' + arrayChat.DATETIMELASTREPLY + '">\
                                    <a href="#" class="px-2"> \
                                        <div class="d-flex">\
                                            <div class="chat-user-img align-self-center me-3 ms-0">\
                                                <div class="avatar-xs">\
                                                    <span class="avatar-title rounded-circle bg-primary-subtle text-primary">'+ arrayChat.NAMEALPHASEPARATOR + '</span>\
                                                </div>\
                                                <span class="user-status"></span>\
                                            </div>\
                                            <div class="flex-grow-1 overflow-hidden">\
                                                <h5 class="text-truncate font-size-15 mb-1">'+ arrayChat.NAMEFULL + '</h5>\
                                                <p class="chat-user-message text-truncate mb-0">' + arrayChat.LASTSENDERFIRSTNAME + ': ' + arrayChat.LASTMESSAGE + '</p>\
                                            </div>\
                                            <div class="chatList-item-time font-size-11">' + arrayChat.DATETIMELASTMESSAGESTR + '</div>\
                                            ' + totalUnreadMsgElem + '\
                                            <div class="chatList-item ps-1"> ' + elemReservatioTypeTag + '</div>\
                                        </div>\
                                    </a>\
                                </li> ';
                        if (index == 0 && idContact != '') firstIdChatList = arrayChat.IDCHATLIST;
                    });
                    break;
                case 404:
                    let responseMsg = getMessageResponse(jqXHR);
                    rows = '<li class="text-center text-muted py-3">\
                                <i class="ri-chat-off-line font-size-24"></i>\
                                <p class="mt-2">'+ responseMsg + '</p>\
                            </li>';
                    break;
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
        $('#chatStatusNav li button, #filter-searchKeyword').prop('disabled', false);
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
        $('.chatList-item[data-idchatlist=' + firstIdChatList + ']').addClass('active');
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
            $("#chat-threadPage").val(1);
            $("#chat-isMaximumChatThreadContent").val(false);
            $('.simplebar-content-wrapper').has('#chat-conversation-ul').off('scroll');
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    var detailContact = responseJSON.detailContact,
                        listChatThread = responseJSON.listChatThread,
                        listActiveReservation = responseJSON.listActiveReservation;

                    $("#chat-topbar-initial, #profile-sidebar-initial").html(detailContact.NAMEALPHASEPARATOR);
                    $("#chat-topbar-fullName, #profile-sidebar-fullName").html(detailContact.NAMEFULL);
                    $("#profile-sidebar-phoneNumber").html('+' + detailContact.PHONENUMBER);
                    $("#profile-sidebar-countryContinent").html(detailContact.COUNTRYNAME + ", " + detailContact.CONTINENTNAME);
                    $("#profile-sidebar-email").html(detailContact.EMAILS);
                    $("#chat-idChatList").val(idChatList);
                    $("#chat-timeStampLastReply").val(detailContact.DATETIMELASTREPLY);
                    $("#chat-idContact").val(detailContact.IDCONTACT);
                    generateChatThreadBody(listChatThread);
                    counterTimeChatList();

                    if (listActiveReservation) {
                        var reservationListElem = '';
                        $.each(listActiveReservation, function (index, arrayActiveReservation) {
                            let classCollapsed = index == 0 ? '' : 'collapsed',
                                classShow = index == 0 ? 'show' : '',
                                reservationDateTimeStr = arrayActiveReservation.RESERVATIONDATESTARTSTR + " " + arrayActiveReservation.RESERVATIONTIMESTARTSTR,
                                areaName = arrayActiveReservation.AREANAME.toLowerCase() == "without transfer" ? "<b class='text-danger'>" + arrayActiveReservation.AREANAME + "</b>" : arrayActiveReservation.AREANAME,
                                paxDetails = arrayActiveReservation.NUMBEROFADULT + ' Adult, ' + arrayActiveReservation.NUMBEROFCHILD + ' Child, ' + arrayActiveReservation.NUMBEROFINFANT + ' Infant',
                                bookingCode = arrayActiveReservation.BOOKINGCODE;
                            if (arrayActiveReservation.DURATIONOFDAY > 1) {
                                reservationDateTimeStr = reservationDateTimeStr + " - " + arrayActiveReservation.RESERVATIONDATEENDSTR + " " + arrayActiveReservation.RESERVATIONTIMEENDSTR;
                            }
                            reservationListElem +=
                                '<div class="accordion-item card border reservationListElem mb-2">\
                                    <div class="accordion-header" id = "header-' + bookingCode + '" >\
                                        <button class="accordion-button '+ classCollapsed + '" type="button" data-bs-toggle="collapse" data-bs-target="#reservation-' + bookingCode + '" aria-expanded="true" aria-controls="reservation-' + bookingCode + '">\
                                            <h5 class="font-size-14 m-0"><i class="ri-coupon-fill me-2 ms-0 align-middle d-inline-block"></i> ' + arrayActiveReservation.SOURCENAME + ' - ' + bookingCode + '</h5>\
                                        </button>\
                                    </div>\
                                    <div id="reservation-' + bookingCode + '" class="accordion-collapse collapse ' + classShow + '" aria-labelledby="header-' + bookingCode + '" data-bs-parent="#profile-sidebar-reservationList">\
                                        <div class="accordion-body">\
                                            <div><h5 class="font-size-14 reservationAccordion-title">' + arrayActiveReservation.RESERVATIONTITLE + '</h5></div>\
                                            <div class="mt-4">\
                                                <p class="text-muted mb-1"> Date</p>\
                                                <h5 class="font-size-14 reservationAccordion-reservationDateTime">' + reservationDateTimeStr + '</h5>\
                                            </div>\
                                            <div class="mt-4">\
                                                <p class="text-muted mb-1" > Pax</p>\
                                                <h5 class="font-size-14 reservationAccordion-paxDetails"> ' + paxDetails + '</h5>\
                                            </div>\
                                            <div class="mt-4">\
                                                <p class="text-muted mb-1" > Area</p>\
                                                <h5 class="font-size-14 reservationAccordion-areaName"> ' + areaName + '</h5>\
                                            </div>\
                                            <div class="mt-4">\
                                                <p class="text-muted mb-1" > Hotel</p>\
                                                <h5 class="font-size-14 reservationAccordion-hotelName"> ' + arrayActiveReservation.HOTELNAME + '</h5>\
                                            </div>\
                                            <div class="mt-4">\
                                                <p class="text-muted mb-1" > Pick Up</p>\
                                                <h5 class="font-size-14 reservationAccordion-pickUpLocation"> ' + arrayActiveReservation.PICKUPLOCATION + '</h5>\
                                            </div>\
                                            <div class="mt-4">\
                                                <p class="text-muted mb-1" > Drop Off</p>\
                                                <h5 class="font-size-14 mb-0 reservationAccordion-dropOffLocation"> ' + arrayActiveReservation.DROPOFFLOCATION + '</h5>\
                                            </div>\
                                            <div class="mt-4">\
                                                <p class="text-muted mb-1" > Tour Plan</p>\
                                                <h5 class="font-size-14 mb-0 reservationAccordion-tourPlan"> ' + arrayActiveReservation.TOURPLAN + ' </h5>\
                                            </div>\
                                            <div class="mt-4">\
                                                <p class="text-muted mb-1" > Remark</p>\
                                                <h5 class="font-size-14 mb-0 reservationAccordion-remark"> ' + arrayActiveReservation.REMARK + '</h5>\
                                            </div >\
                                            <div class="mt-4">\
                                                <p class="text-muted mb-1" > Special Request</p>\
                                                <h5 class="font-size-14 mb-0 reservationAccordion-specialRequest" > ' + arrayActiveReservation.SPECIALREQUEST + '</h5>\
                                            </div>\
                                            <div class="d-grid mt-4">\
                                                <button type="button" class="btn btn-primary btn-sm btnShowDetailReservation" data-idReservation="'+ arrayActiveReservation.IDRESERVATION + '" data-bookingCode="' + bookingCode + '">\
                                                    <i class="ri-edit-line me-1"></i> Edit Reservation\
                                                </button>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div> ';
                        });
                        $("#profile-sidebar-reservationList").html(reservationListElem);
                        activateBtnShowDetailReservation();
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

function generateChatThreadBody(listChatThread, prepend = false, callback = false) {
    let rowChatThread = chatContentWrap = '';
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

    if (!prepend) $("#chat-conversation-ul").html(rowChatThread);
    if (prepend) $("#chat-conversation-ul").prepend(rowChatThread);
    activateChatContentOptionButton();
    activateScrollToTopChatThread();
    activateQuotedMessageClick();
    recalculateSimpleBar('chat-conversation', prepend ? false : true);
    activateMagnificPopup();

    if (typeof callback === 'function') callback();
}

function activateScrollToTopChatThread() {
    let simpleBarContentWrapper = $('.simplebar-content-wrapper').has('#chat-conversation-ul'),
        oldScrollHeight = simpleBarContentWrapper.prop('scrollHeight');

    simpleBarContentWrapper.off('scroll');
    simpleBarContentWrapper.on('scroll', function () {
        if ($(this).scrollTop() === 0) {
            if ($("#chat-isMaximumChatThreadContent").val() == 'false') {
                var idChatList = $("#chat-idChatList").val(),
                    page = parseInt($("#chat-threadPage").val()) + 1,
                    dataSend = { idChatList: idChatList, page: page };
                $.ajax({
                    type: 'POST',
                    url: baseURL + "chat/getMoreChatThread",
                    contentType: 'application/json',
                    dataType: 'json',
                    cache: false,
                    data: mergeDataSend(dataSend),
                    xhrFields: { withCredentials: true },
                    headers: { Authorization: 'Bearer ' + getUserToken() },
                    beforeSend: function () {
                        $("#chat-conversation-ul").prepend('<li id="chat-conversation-ul-loader"><div class="chat-day-title no-before" data-daytitle="Loading previous conversation.."><span class="title">Loading previous conversation..</span></div></li>');
                        simpleBarContentWrapper.off('scroll');
                        NProgress.set(0.4);
                    },
                    complete: function (jqXHR, textStatus) {
                        var responseJSON = jqXHR.responseJSON;

                        switch (jqXHR.status) {
                            case 200:
                                var listChatThread = responseJSON.listChatThread;
                                generateChatThreadBody(listChatThread, true, function () {
                                    let newScrollHeight = simpleBarContentWrapper.prop('scrollHeight');
                                    simpleBarContentWrapper.scrollTop(newScrollHeight - oldScrollHeight);
                                });
                                $("#chat-threadPage").val(page);
                                break;
                            case 404:
                                $("#chat-isMaximumChatThreadContent").val(true);
                                break;
                            default:
                                break;
                        }
                    }
                }).always(function (jqXHR, textStatus) {
                    $("#chat-conversation-ul-loader").remove();
                    NProgress.done();
                    setUserToken(jqXHR);
                });
            }
        }
    });
}

function activateQuotedMessageClick() {
    $('.chatContentWrap-idMessageQuoted').off('click');
    $('.chatContentWrap-idMessageQuoted').on('click', function (e) {
        let idMessage = $(this).attr('data-idMessageQuoted'),
            elemCtextWrapContent = $('.ctext-wrap[data-idMessage=' + idMessage + ']').find('.ctext-wrap-content');
        if (elemCtextWrapContent.length > 0) {
            elemCtextWrapContent.attr('tabindex', -1);
            $('html, body').animate({
                scrollTop: elemCtextWrapContent.offset().top
            }, 500, function () {
                elemCtextWrapContent.focus().addClass('splashed-border active');
                setTimeout(() => {
                    elemCtextWrapContent.removeClass('splashed-border active');
                }, 400);
            });
        }
    });
}

function generateRowChatThread(classRight, initialName, chatContentWrap, userNameChat) {
    return '<li class="chatThread ' + classRight + '">\
                <div class="conversation-list pb-3">\
                    <div class="chat-avatar">\
                        <span class="rounded-circle avatar-xs bg-primary-subtle text-primary mx-auto font-size-19 px-2 py-1">' + initialName + '</span>\
                    </div>\
                    <div class="user-chat-content">' + chatContentWrap + '<div class="conversation-name">' + userNameChat + '</div></div>\
                </div>\
            </li>';
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
    recalculateChatConversationHeight();
});

function recalculateChatConversationHeight() {
    let vhReducerQuotedMessage = $('#chat-quotedMessage').outerHeight(),
        inputTextMessageRowsNumber = ($('#chat-inputTextMessage').val().match(/\n/g) || []).length,
        updatedTextMessageRowsNumber = inputTextMessageRowsNumber + 1,
        vhReducerTextMessage = 164;
    $('#chat-inputTextMessage').attr('rows', updatedTextMessageRowsNumber > 5 ? 5 : updatedTextMessageRowsNumber);

    switch (updatedTextMessageRowsNumber) {
        case 1: break;
        case 2: vhReducerTextMessage = 182; break;
        case 3: vhReducerTextMessage = 203; break;
        case 4: vhReducerTextMessage = 224; break;
        default: vhReducerTextMessage = 245; break;
    }

    $('.chat-conversation').css('height', 'calc(100vh - ' + vhReducerTextMessage + 'px  - ' + vhReducerQuotedMessage + 'px)');
}

$('#chat-formMessage').off('submit');
$('#chat-formMessage').on('submit', function (e) {
    e.preventDefault();
    sendMessage();
});

function sendMessage() {
    let idContact = $('#chat-idContact').val(),
        idMessageQuoted = $('#chat-idMessageQuoted').val(),
        phoneNumber = $('#profile-sidebar-phoneNumber').html(),
        message = $('#chat-inputTextMessage').val(),
        dataSend = {
            idContact: idContact,
            idMessageQuoted: idMessageQuoted,
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
            var responseJSON = jqXHR.responseJSON;
            switch (jqXHR.status) {
                case 200:
                    let currentTimeStamp = responseJSON.currentTimeStamp;
                    playStoredAudio("message_sent");
                    localStorage.setItem('lastNotifTimeStamp', currentTimeStamp);
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

function resetQuotedMessage(recalculateHeight = false) {
    $('#chat-idMessageQuoted').val('');
    $('#chat-quotedMessageText').html('');
    $('#chat-quotedMessage').addClass('d-none');
    if (recalculateHeight) recalculateChatConversationHeight();
}

function resetFocusChatInputTextMessage() {
    resetQuotedMessage();
    $('#chat-inputTextMessage').focus().attr('rows', 1).val('');
    $('.chat-conversation').css('height', 'calc(100vh - 164px)');
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

function activateBtnShowDetailReservation() {
    $('.btnShowDetailReservation').off('click');
    $('.btnShowDetailReservation').on('click', function (e) {
        let idReservation = $(this).attr('data-idReservation'),
            bookingCode = $(this).attr('data-bookingCode'),
            dataSend = { idReservation: idReservation };
        $.ajax({
            type: 'POST',
            url: baseURL + "chat/getDetailReservation",
            contentType: 'application/json',
            dataType: 'json',
            cache: false,
            data: mergeDataSend(dataSend),
            xhrFields: { withCredentials: true },
            headers: { Authorization: "Bearer " + getUserToken() },
            beforeSend: function () {
                NProgress.set(0.4);
                resetFormReservation();
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON = jqXHR.responseJSON;
                switch (jqXHR.status) {
                    case 200:
                        let detailReservation = responseJSON.detailReservation,
                            dataCurrencyExchange = responseJSON.dataCurrencyExchange;
                        $("#modalEditReservation-title").val(detailReservation.RESERVATIONTITLE);
                        $("#modalEditReservation-durationDay").val(detailReservation.DURATIONOFDAY);
                        $("#modalEditReservation-date").val(detailReservation.RESERVATIONDATESTART);
                        $("#modalEditReservation-timeHour").val(detailReservation.RESERVATIONHOUR);
                        $("#modalEditReservation-timeMinute").val(detailReservation.RESERVATIONMINUTE);
                        if (detailReservation.IDAREA !== '') $("#modalEditReservation-pickUpArea").val(detailReservation.IDAREA);
                        $("#modalEditReservation-hotelName").val(detailReservation.HOTELNAME);
                        $("#modalEditReservation-pickupLocation").val(detailReservation.PICKUPLOCATION);
                        $("#modalEditReservation-pickupLocationLinkUrl").val(detailReservation.URLPICKUPLOCATION);
                        $("#modalEditReservation-dropOffLocation").val(detailReservation.DROPOFFLOCATION);
                        $("#modalEditReservation-paxAdult").val(detailReservation.NUMBEROFADULT);
                        $("#modalEditReservation-paxChild").val(detailReservation.NUMBEROFCHILD);
                        $("#modalEditReservation-paxInfant").val(detailReservation.NUMBEROFINFANT);
                        $("#modalEditReservation-incomeCurrency").val(detailReservation.INCOMEAMOUNTCURRENCY);
                        $("#modalEditReservation-incomeInteger").val(numberFormat(detailReservation.INCOMEAMOUNTINTEGER));
                        $("#modalEditReservation-incomeComma").val(detailReservation.INCOMEAMOUNTDECIMAL);
                        $("#modalEditReservation-incomeCurrencyExchange").val(numberFormat(detailReservation.INCOMEEXCHANGECURRENCY));
                        $("#modalEditReservation-incomeTotalIDR").val(numberFormat(detailReservation.INCOMEAMOUNTIDR));
                        $("#modalEditReservation-tourPlan").val(detailReservation.TOURPLAN);
                        $("#modalEditReservation-remark").val(detailReservation.REMARK);
                        $("#modalEditReservation-specialRequest").val(detailReservation.SPECIALREQUEST);
                        $('#modalEditReservation-idReservation').val(idReservation);
                        $('#modalEditReservation-bookingCode').val(bookingCode);
                        $('#modal-editReservation').modal('show');
                        activateIncomeCurrencyChange(dataCurrencyExchange);
                        break;
                    default:
                        e.preventDefault();
                        generateWarningMessageResponse(jqXHR);
                        break;
                }
            }
        }).always(function (jqXHR, textStatus) {
            NProgress.done();
            setUserToken(jqXHR);
            $("#window-loader").modal("hide");
        });
    });
}

function resetFormReservation() {
    $("#modalEditReservation-title, #modalEditReservation-hotelName, #modalEditReservation-pickupLocation, #modalEditReservation-pickupLocationLinkUrl, #modalEditReservation-dropOffLocation").val('');
    $("#modalEditReservation-durationDay, #modalEditReservation-paxAdult, #modalEditReservation-incomeInteger, #modalEditReservation-incomeCurrencyExchange").val(1);
    $("#modalEditReservation-paxChild, #modalEditReservation-paxInfant, #modalEditReservation-incomeComma, #modalEditReservation-incomeTotalIDR").val(0);
    resetSelectedOptionFirstValue(['modalEditReservation-timeHour', 'modalEditReservation-timeMinute', 'modalEditReservation-pickUpArea', 'modalEditReservation-incomeCurrency']);
    $("#modalEditReservation-tourPlan, #modalEditReservation-remark, #modalEditReservation-specialRequest").val('-');
    $("#modalEditReservation-date").val(moment().format("DD-MM-YYYY"));
    $("#modalEditReservation-idReservation").val('');
    calculateReservationIncomeIDR();
}

function activateIncomeCurrencyChange(dataCurrencyExchange) {
    $('#modalEditReservation-incomeCurrency').off('change');
    $('#modalEditReservation-incomeCurrency').on('change', function (e) {
        var currencyType = $(this).val();

        if (currencyType != 'IDR') {
            $.each(dataCurrencyExchange, function (index, array) {
                if (array.CURRENCY == currencyType) {
                    $("#modalEditReservation-incomeCurrencyExchange").val(numberFormat(array.EXCHANGETOIDR));
                }
            });
            $("#modalEditReservation-incomeComma").prop('readonly', false);
            $("#modalEditReservation-incomeCurrencyExchange").prop('readonly', false);
        } else {
            $("#modalEditReservation-incomeComma").val(0).prop('readonly', true);
            $("#modalEditReservation-incomeCurrencyExchange").val(1).prop('readonly', true);
        }

        calculateReservationIncomeIDR();
    });
}

$('#modalEditReservation-incomeInteger, #modalEditReservation-incomeComma').off('change');
$('#modalEditReservation-incomeInteger, #modalEditReservation-incomeComma').on('change', function (e) {
    calculateReservationIncomeIDR();
});

function calculateReservationIncomeIDR() {
    var reservationIncomeInteger = $('#modalEditReservation-incomeInteger').val().replace(/[^0-9\.]+/g, '');
    reservationIncomeDecimal = $('#modalEditReservation-incomeComma').val().replace(/[^0-9\.]+/g, '');
    reservationIncome = (reservationIncomeInteger + "." + reservationIncomeDecimal) * 1,
        currencyExchange = $("#modalEditReservation-incomeCurrencyExchange").val().replace(/[^0-9\.]+/g, '') * 1,
        reservationIncomeIDR = reservationIncome * currencyExchange;

    $("#modalEditReservation-incomeTotalIDR").val(numberFormat(reservationIncomeIDR));
}

$('#modalEditReservation-form').off('submit');
$('#modalEditReservation-form').on('submit', function (e) {
    e.preventDefault();
    let dataForm = $("#modalEditReservation-form :input").serializeArray(),
        dataSend = {};

    $.each(dataForm, function () {
        dataSend[this.name] = this.value;
    });

    $.ajax({
        type: 'POST',
        url: baseURL + "chat/saveReservation",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: { withCredentials: true },
        headers: { Authorization: "Bearer " + getUserToken() },
        beforeSend: function () {
            $("#modalEditReservation-form :input").attr("disabled", true);
            NProgress.set(0.4);
            $('#window-loader').modal('show');
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;
            generateWarningMessageResponse(jqXHR);
            switch (jqXHR.status) {
                case 200:
                    let dataUpdate = responseJSON.dataUpdate,
                        bookingCode = $('#modalEditReservation-bookingCode').val(),
                        elemAccordionReservation = $('#reservation-' + bookingCode);
                    elemAccordionReservation.find('.reservationAccordion-title').html(dataUpdate.reservationTitle);
                    elemAccordionReservation.find('.reservationAccordion-reservationDateTime').html(dataUpdate.reservationDateStr + " " + dataUpdate.reservationTimeStr);
                    elemAccordionReservation.find('.reservationAccordion-paxDetails').html(dataUpdate.paxDetailStr);
                    elemAccordionReservation.find('.reservationAccordion-areaName').html($("#modalEditReservation-pickUpArea option:selected").text());
                    elemAccordionReservation.find('.reservationAccordion-hotelName').html(dataUpdate.hotelName);
                    elemAccordionReservation.find('.reservationAccordion-pickUpLocation').html(dataUpdate.pickUpLocation);
                    elemAccordionReservation.find('.reservationAccordion-dropOffLocation').html(dataUpdate.dropOffLocation);
                    elemAccordionReservation.find('.reservationAccordion-tourPlan').html(dataUpdate.tourPlan);
                    elemAccordionReservation.find('.reservationAccordion-remark').html(dataUpdate.remark);
                    elemAccordionReservation.find('.reservationAccordion-specialRequest').html(dataUpdate.specialRequest);

                    $('#modal-editReservation').modal('hide');
                    break;
                default:
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        setUserToken(jqXHR);
        $('#window-loader').modal('hide');
        NProgress.done();
        $("#modalEditReservation-form :input").attr("disabled", false);
    });
});

chatFunc();