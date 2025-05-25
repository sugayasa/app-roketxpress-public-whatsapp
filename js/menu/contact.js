var defaultListOfQuestionsPlaceholder = '<span id="messagePreview-listOfQuestions">|| List of questions ||</span>',
    listTemplateMessageReservation = [],
    elemEmptyTemplateList =
        '<li class="list-group-item text-muted text-center" id="listTemplateMessage-emptyTemplateList">\
            <div role="alert" class="alert alert-warning text-center py-2 mb-0"><span class="text-muted">No template available for this reservation</span></div>\
        </li>';

if (contactFunc == null) {
    var contactFunc = function () {
        $(document).ready(function () {
            let askQuestionTemplateData, listDetailReservation, reservationProperty;
            setOptionHelper('editorContact-nameTitle', 'dataNameTitle');
            setOptionHelper('editorContact-country', 'dataCountryPhoneCode', defaultCountryCode, function () {
                $("#editorContact-country").select2({
                    dropdownParent: $("#modal-editorContact"),
                    theme: 'bootstrap-5'
                });
            });
            getDataContact();
        });
    }
}

$("#modal-editorContact").off('show.bs.modal');
$("#modal-editorContact").on('show.bs.modal', function (e) {
    let elemTrigger = e.relatedTarget,
        idContact = elemTrigger.getAttribute('data-idContact');

    if (typeof idContact !== 'undefined' && idContact != '' && idContact != null) {
        $('#editorContact-nameTitle').val(elemTrigger.getAttribute('data-idNameTitle'));
        $('#editorContact-name').val($("#detailContact-fullname").html());
        $('#editorContact-country').val(elemTrigger.getAttribute('data-idCountry')).trigger('change');
        $('#editorContact-phoneNumber').val(elemTrigger.getAttribute('data-phoneNumberBase'));
        $('#editorContact-email').val($("#detailContact-email").html().replace('| ', ''));
        $('#editorContact-idContact').val(idContact);
    } else {
        $('#editorContact-name, #editorContact-phoneNumber, #editorContact-email, #editorContact-idContact').val("");
        $("#editorContact-country").val(defaultCountryCode).trigger('change');
    }
});

$('#filter-optionContactType').off('change');
$('#filter-optionContactType').on('change', function (e) {
    getDataContact();
});

$('#filter-searchKeyword').off('keypress');
$("#filter-searchKeyword").on('keypress', function (e) {
    if (e.which == 13) {
        getDataContact();
    }
});

function getDataContact(page = 1) {
    var $elemList = $('#list-contactData'),
        contactType = $('#filter-optionContactType').val(),
        searchKeyword = $('#filter-searchKeyword').val(),
        dataSend = {
            page: page,
            contactType: contactType,
            searchKeyword: searchKeyword
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "contact/getDataContact",
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
            if (contactType != 1 && contactType != 5) $elemList.html(loaderElem);
            $("#btnLoadMoreData").replaceWith(loaderElem);
            recalculateSimpleBar('simpleBar-list-contactData');
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON,
                rows = "";

            switch (jqXHR.status) {
                case 200:
                    var dataContact = responseJSON.dataContact,
                        nextPage = page + 1;

                    askQuestionTemplateData = responseJSON.askQuestionTemplate;
                    $.each(dataContact, function (index, arrayContact) {
                        rows += generateRowContactList(arrayContact);
                    });
                    break;
                case 404:
                default:
                    break;
            }

            var btnLoadMoreData = '';
            if (rows != '') {
                if ((contactType == 1 || contactType == 5) && searchKeyword == '') {
                    var nextPage = page + 1;
                    btnLoadMoreData = '<li>' +
                        '<button id="btnLoadMoreData" class="btn btn-primary my-3 w-100" onclick="getDataContact(' + nextPage + ')">Load More</button>' +
                        '</li>';
                }
            } else {
                if (contactType != 1 && contactType != 5) rows = "<center>" + getMessageResponse(jqXHR) + "</center>";
            }

            if (contactType == 1 || contactType == 5) {
                if (page == 1) $elemList.html(rows);
                if (page > 1) $elemList.append(rows);
                if (btnLoadMoreData != '') $elemList.append(btnLoadMoreData);
                $("#loaderElem").remove();
            } else {
                $elemList.html(rows);
            }

            activateOnClickContactItem();
            if (page == 1) $('.contact-item').first().trigger('click');
            recalculateSimpleBar('simpleBar-list-contactData');
        }
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
    });
}

function generateRowContactList(dataContact) {
    var emailAddress = dataContact.EMAILS == '' || dataContact.EMAILS == '-' ? '' : ' | ' + dataContact.EMAILS;
    return '<li class="contact-item" data-idContact="' + dataContact.IDCONTACT + '" data-idChatList="' + dataContact.IDCHATLIST + '" data-timeStampLastReply="' + dataContact.DATETIMELASTREPLY + '">\
            <a href="#">\
                <div class="d-flex">\
                    <div class="chat-user-img align-self-center me-3 ms-0">\
                        <div class="avatar-xs">\
                            <span class="avatar-title rounded-circle bg-primary-subtle text-primary">' + dataContact.NAMEALPHASEPARATOR + '</span >\
                        </div>\
                        <span class="user-status"></span>\
                    </div>\
                    <div class="flex-grow-1 overflow-hidden">\
                        <h5 class="text-truncate font-size-15 mb-1">' + dataContact.NAMEFULL + '</h5>\
                        <p class="chat-user-message text-truncate mb-0">+' + dataContact.PHONENUMBER + emailAddress + '</p>\
                    </div>\
                </div>\
            </a>\
        </li>';
}

function activateOnClickContactItem() {
    $('.contact-item').off('click');
    $('.contact-item').on('click', function (e) {
        var idContact = $(this).attr('data-idContact');
        $(".contact-item").removeClass('active');
        $(this).addClass('active');
        getDetailContact(idContact);
    });
    activateOnClickPillsItem();
}

function getDetailContact(idContact) {
    var dataSend = { idContact: idContact };
    $.ajax({
        type: 'POST',
        url: baseURL + "contact/getDetailContact",
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
            setInactiveSession();
            $("#wrapper-contactDetails").attr("data-idChatList", "");
            $("#detailContact-fullname").html("-");
            $("#detailContact-phoneNumberCountry, #detailContact-email").html("| -");
            $("#detailContact-invalidWhatsAppAcountAlert").addClass('d-none');
            $("#detailContact-totalReservation").html("0 Total reservation(s)");
            $(".detailContact-badgeSource").remove();
            $(".listReservationCard").remove();
            $("#simpleScrollBar-listReservation").html(loaderElem);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;

            switch (jqXHR.status) {
                case 200:
                    var detailContact = responseJSON.detailContact,
                        idChatList = detailContact.IDCHATLIST,
                        arrSource = JSON.parse(detailContact.ARRAYSOURCE),
                        isChatSessionActive = responseJSON.isChatSessionActive,
                        isValidWhatsAppAccount = detailContact.ISVALIDWHATSAPP,
                        timeStampLastReply = detailContact.TIMESTAMPLASTREPLY,
                        badgeSource = rowDetailReservation = '';
                    listDetailReservation = responseJSON.listDetailReservation;

                    $("#wrapper-contactDetails").attr("data-idChatList", idChatList);
                    $("#detailContact-fullname").html(detailContact.NAMEFULL);
                    $("#detailContact-phoneNumberCountry").html("| +" + detailContact.PHONENUMBER + " (" + detailContact.COUNTRYNAME + ", " + detailContact.CONTINENTNAME + ")");
                    $("#detailContact-email").html("| " + detailContact.EMAILS);
                    $("#detailContact-btnEditContact").attr("data-idContact", idContact).attr("data-idCountry", detailContact.IDCOUNTRY).attr("data-idNameTitle", detailContact.IDNAMETITLE).attr("data-phoneNumberBase", detailContact.PHONENUMBERBASE);
                    $("#detailContact-iconSession").attr('data-timeStampLastReply', timeStampLastReply);
                    $("#detailContact-totalReservation").html(detailContact.TOTALRESERVATION + " Total reservation(s)");
                    if (isValidWhatsAppAccount == -1) $("#detailContact-invalidWhatsAppAcountAlert").removeClass('d-none');

                    if (arrSource.length > 0) {
                        var arrCheckSource = [];
                        $.each(arrSource, function (index, arraySource) {
                            var sourceName = arraySource.sourceName,
                                badgeClass = arraySource.badgeClass;

                            if ($.inArray(sourceName, arrCheckSource) === -1) {
                                badgeSource += '<span class="font-size-15 badge rounded-pill bg-' + badgeClass + ' ms-auto detailContact-badgeSource">' + sourceName + '</span>&nbsp;';
                                arrCheckSource.push(sourceName);
                            }
                        });
                    }
                    if (badgeSource != '') $("#detailContact-badgeSources").html(badgeSource);

                    if (isChatSessionActive && isValidWhatsAppAccount == 1) {
                        $("#detailContact-btnSendMessage").removeClass('d-none').attr('data-idContact', idContact).off('click');
                        $('#detailContact-btnSendMessage').on('click', function (e) {
                            openMenuSetCallBack('menuCHT', function () {
                                openChatContact({ idContact: idContact, phoneNumber: detailContact.PHONENUMBER });
                            });
                        });
                    }

                    $.each(listDetailReservation, function (index, arrayReservation) {
                        var reservationDateTimeStr = arrayReservation.RESERVATIONDATESTARTSTR + " " + arrayReservation.RESERVATIONTIMESTARTSTR,
                            areaName = arrayReservation.AREANAME.toLowerCase() == "without transfer" ? "<b class='text-danger'>" + arrayReservation.AREANAME + "</b>" : arrayReservation.AREANAME,
                            allowAskQuestion = arrayReservation.ALLOWASKQUESTION,
                            listTemplateMessage = arrayReservation.LISTTEMPLATEMESSAGE,
                            idReservation = arrayReservation.IDRESERVATION,
                            btnAskQuestion = btnSendTemplateMessage = '';

                        if (arrayReservation.DURATIONOFDAY > 1) {
                            reservationDateTimeStr = reservationDateTimeStr + " - " + arrayReservation.RESERVATIONDATEENDSTR + " " + arrayReservation.RESERVATIONTIMEENDSTR;
                        }

                        if (allowAskQuestion) {
                            btnAskQuestion = '<button type="button" class="btn btn-sm btn-warning me-1 detailContact-btnAskQuestion" data-idReservation="' + idReservation + '">' +
                                '<span><i class="ri-chat-quote-line"></i> Ask About ' + arrayReservation.BOOKINGCODE + '</span>' +
                                '</button>';
                        }

                        if (listTemplateMessage && listTemplateMessage !== '' && listTemplateMessage !== null && typeof listTemplateMessage !== undefined) {
                            try {
                                let listTemplateMessageParse = JSON.parse(listTemplateMessage);
                                btnSendTemplateMessage = '<button type="button" class="btn btn-sm btn-primary detailContact-btnSendTemplateMessage" data-idReservation="' + idReservation + '"><span><i class="ri-file-list-3-line"></i> Send Template Message</span></button>';
                                listTemplateMessageReservation.push({ idReservation: idReservation, listTemplateMessage: listTemplateMessageParse });
                            } catch (error) {
                                btnSendTemplateMessage = '';
                            }
                        }

                        let classMarginTop = index == 0 ? '' : 'mt-2';
                        rowDetailReservation +=
                            '<div class="card bg-light2 ' + classMarginTop + ' mb-2 w-100 rounded-3 listReservationCard" data-idReservation="' + idReservation + '">\
                                <div class="card-body p-4" >\
                                    <div class="row">\
                                        <div class="col-lg-8 col-sm-6 border-bottom pb-3 mb-3"><h6 class="mb-0 listReservationCard-reservationTitle">' + arrayReservation.RESERVATIONTITLE + '</h6></div>\
                                            <div class="col-lg-4 col-sm-6 border-bottom pb-3 mb-3 text-end">\
                                                <h6 class="mb-0 listReservationCard-sourceName">' + arrayReservation.SOURCENAME + '</h6>\
                                            </div>\
                                            <div class="col-lg-4 col-sm-12">\
                                                <div class="row">\
                                                    <b class="text-muted mb-3 listReservationCard-dateTimeStr">' + reservationDateTimeStr + '</b><br />\
                                                    <span class="d-none listReservationCard-pickupTime">' + arrayReservation.RESERVATIONTIMESTARTSTR + '</span>\
                                                    <h6 class="mb-0">Duration</h6>\
                                                    <p class="text-muted listReservationCard-durationOfDay">' + arrayReservation.DURATIONOFDAY + ' Day(s)</p>\
                                                    <h6 class="mb-0">Pax</h6>\
                                                    <ul class="list-unstyled text-muted">\
                                                        <li class="list-item listReservationCard-numberOfAdult"> ' + arrayReservation.NUMBEROFADULT + ' Adult</li>\
                                                        <li class="list-item listReservationCard-numberOfChild"> ' + arrayReservation.NUMBEROFCHILD + ' Child</li>\
                                                        <li class="list-item listReservationCard-numberOfInfant"> ' + arrayReservation.NUMBEROFINFANT + ' Infant</li>\
                                                    </ul>\
                                                    <h6 class="mb-0">Area</h6>\
                                                    <p class="text-muted listReservationCard-areaName">' + areaName + '</p>\
                                                </div>\
                                            </div>\
                                            <div class="col-lg-4 col-sm-12">\
                                                <div class="row" >\
                                                    <h6 class="mb-0">Hotel</h6>\
                                                    <p class="text-muted listReservationCard-hotelName">' + arrayReservation.HOTELNAME + '</p>\
                                                    <h6 class="mb-0">Pick Up</h6>\
                                                    <p class="text-muted listReservationCard-pickUpLocation">' + arrayReservation.PICKUPLOCATION + '</p>\
                                                    <h6 class="mb-0">Drop Off</h6>\
                                                    <p class="text-muted listReservationCard-dropOffLocation">' + arrayReservation.DROPOFFLOCATION + '</p>\
                                                    <h6 class="mb-0">Tour Plan</h6>\
                                                    <p class="text-muted listReservationCard-tourPlan">' + arrayReservation.TOURPLAN + '</p>\
                                                </div>\
                                            </div>\
                                            <div class="col-lg-4 col-sm-12">\
                                                <div class="row">\
                                                <h6 class="mb-0">Booking Code</h6>\
                                                <p class="text-muted listReservationCard-bookingCode">' + arrayReservation.BOOKINGCODE + '</p>\
                                                <h6 class="mb-0">Remark</h6>\
                                                <p class="text-muted listReservationCard-remark">' + arrayReservation.REMARK + '</p>\
                                                <h6 class="mb-0">Special Request</h6>\
                                                <p class="text-muted listReservationCard-specialRequest">' + arrayReservation.SPECIALREQUEST + '</p>\
                                            </div>\
                                        </div>\
                                        <div class="col-sm-12 border-top pt-3 mt-3 text-end">' + btnAskQuestion + btnSendTemplateMessage + '</div > \
                                    </div > \
                                </div >\
                            </div > ';
                    });

                    $("#simpleScrollBar-listReservation").html(rowDetailReservation);
                    refreshSimpleScrollBarListReservation();
                    activateCounterChatSession();
                    activateOnClickBtnAskQuestion(idContact, detailContact.PHONENUMBER);
                    activateOnClickBtnTemplateMessage(idContact, detailContact.PHONENUMBER);
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

function refreshSimpleScrollBarListReservation() {
    var sideMenuHeight = $(".side-menu").height(),
        sideMenuHeight = sideMenuHeight <= 80 ? $(document).height() : sideMenuHeight,
        contactDetailsHeight = $("#wrapper-contactDetails").height(),
        reservationListHeight = sideMenuHeight - contactDetailsHeight - 40;
    $("#simpleScrollBar-listReservation").css('height', reservationListHeight + 'px');
    $('#simpleScrollBar-listReservation').sScrollBar();
}

function activateCounterChatSession() {
    clearInterval(intervalId);
    intervalId = setInterval(function () {
        let timeStampLastReply = $("#detailContact-iconSession").attr('data-timeStampLastReply');
        if (timeStampLastReply > 0) {
            let countdownTime = moment.unix(timeStampLastReply).add(24, 'hours').utc(),
                timeRemaining = countdownTime.diff(moment.utc(), 'seconds');

            if (timeRemaining > 0) {
                let hours = Math.floor(timeRemaining / 3600),
                    minutes = Math.floor((timeRemaining % 3600) / 60),
                    seconds = timeRemaining % 60;

                $('#detailContact-badgeSession').html(
                    '| <span class="badge text-white font-size-12 align-middle bg-success">\
                    ' + `${("00" + hours).slice(-2)}:${("00" + minutes).slice(-2)}:${("00" + seconds).slice(-2)}` + '\
                    </span>');
                $("#detailContact-iconSession").removeClass('text-danger').addClass('text-success');
            } else {
                setInactiveSession();
            }
        } else {
            setInactiveSession();
        }

        let elemContactItem = $('.contact-item'),
            timeStampNow = moment.utc();
        elemContactItem.each(function (index, value) {
            let timeStampLastReply = $(this).attr('data-timeStampLastReply');
            if (timeStampLastReply > 0) {
                if (Math.abs(timeStampNow.diff(moment.unix(timeStampLastReply), 'seconds')) < (60 * 60 * 24)) {
                    $(this).find('div.chat-user-img').addClass('online');
                } else {
                    $(this).find('div.chat-user-img').removeClass('online');
                }
            }
        });
    }, 1000);
}

function setInactiveSession() {
    $('#detailContact-badgeSession').html('| <span id="chat-topbar-badgeSession" class="badge text-white font-size-12 align-middle bg-danger">Inactive Session</span>');
    $("#detailContact-iconSession").removeClass('text-success').addClass('text-danger');
    $("#detailContact-btnSendMessage").addClass('d-none').off('click');
}

function activateOnClickBtnAskQuestion(idContact, phoneNumber) {
    $('.detailContact-btnAskQuestion').off('click');
    $('.detailContact-btnAskQuestion').on('click', function (e) {
        let idReservation = $(this).attr('data-idReservation');
        reservationProperty = getAllDetailReservationProperty(idReservation);

        $('#modal-askQuestion').off('show.bs.modal');
        $('#modal-askQuestion').on('show.bs.modal', function () {
            generateDetailReservationInDialog(reservationProperty, 'askQuestion');
            $('#askQuestion-emptyQuestionText').removeClass('d-none');
            $('.askQuestion-questionItem').remove();
            generateMessagePreviewTemplate(askQuestionTemplateData, 'askQuestion-messagePreview');
            $('#askQuestion-insertQuestionWarning').addClass('d-none');
        });
        $('#modal-askQuestion').modal('show');

        $('#askQuestion-formAddQuestion').off('submit');
        $('#askQuestion-formAddQuestion').on('submit', function (e) {
            e.preventDefault();
            let question = $("#askQuestion-inputQuestion").val(),
                questionClean = question.replace(/\s+/g, ''),
                questionLength = questionClean.length;

            if (question != '' && questionLength > 10) {
                questionItem = '<li class="list-group-item d-flex justify-content-between align-items-center askQuestion-questionItem">' + question + '\
                                    <button type="button" class="btn btn-danger btn-sm askQuestion-btnDeleteQuestionItem">\
                                        <i class="ri-delete-bin-line"></i>\
                                    </button>\
                                </li> ';
                $('#askQuestion-questionList').append(questionItem);
                $('#askQuestion-emptyQuestionText').addClass('d-none');
                $('#askQuestion-inputQuestion').val('');
                activateOnDeleteQuestion();
                generateQuestionInMessagePreview();
            } else {
                showWarning('Please enter a valid question');
            }
        });

        $('#askQuestion-btnSendMessage').off('click');
        $('#askQuestion-btnSendMessage').on('click', function (e) {
            e.preventDefault();
            $('#askQuestion-insertQuestionWarning').addClass('d-none');
            if ($('.askQuestion-questionItem').length > 0) {
                let questions = ['-', '\b', '\b'];
                $('.askQuestion-questionItem').each(function (index, elem) {
                    let question = $(this).clone().children().remove().end().text().trim();
                    questions[index] = '- ' + question;
                });

                sendMessageTemplateReservation(idContact, phoneNumber, askQuestionTemplateData, { body: questions });
            } else {
                $('#askQuestion-insertQuestionWarning').removeClass('d-none');
            }
        });
    });
}

function activateOnDeleteQuestion() {
    $('.askQuestion-btnDeleteQuestionItem').off('click');
    $('.askQuestion-btnDeleteQuestionItem').on('click', function (e) {
        e.preventDefault();
        $(this).closest('.askQuestion-questionItem').remove();

        let totalQuestion = $('.askQuestion-questionItem').length;
        if (totalQuestion <= 0) $('#askQuestion-emptyQuestionText').removeClass('d-none');
        generateQuestionInMessagePreview();
    });
}

function generateQuestionInMessagePreview() {
    let questions = '';
    if ($('.askQuestion-questionItem').length > 0) {
        $('.askQuestion-questionItem').each(function () {
            let question = $(this).clone().children().remove().end().text().trim();
            questions += '- ' + question + '<br>';
        });

        $("#messagePreview-listOfQuestions").html(questions);
    } else {
        $("#messagePreview-listOfQuestions").replaceWith(defaultListOfQuestionsPlaceholder);
    }
}

function activateOnClickBtnTemplateMessage(idContact, phoneNumber) {
    $('.detailContact-btnSendTemplateMessage').off('click');
    $('.detailContact-btnSendTemplateMessage').on('click', function (e) {
        let idReservation = $(this).attr('data-idReservation'),
            listTemplateMessage = listTemplateMessageReservation.find(x => x.idReservation == idReservation);
        reservationProperty = getAllDetailReservationProperty(idReservation);
        listTemplateMessage = listTemplateMessage.listTemplateMessage;

        $('#modal-listTemplateMessage').off('show.bs.modal');
        $('#modal-listTemplateMessage').on('show.bs.modal', function () {
            resetDialogListTemplateMessage();
            generateDetailReservationInDialog(reservationProperty, 'listTemplateMessage');
            generateListTemplateMessage(listTemplateMessage);
            $('#listTemplateMessage-selectTemplateOptionWarning').addClass('d-none');
        });

        $('#listTemplateMessage-btnSendTemplateMessage').off('click');
        $('#listTemplateMessage-btnSendTemplateMessage').on('click', function (e) {
            e.preventDefault();
            let templateCode = $(".listTemplateMessage-templateOption.active").attr('data-templateCode');
            $('#listTemplateMessage-selectTemplateOptionWarning').removeClass('d-none');

            if (typeof templateCode === 'undefined' || templateCode == '') {
                $('#listTemplateMessage-selectTemplateOptionWarning').removeClass('d-none');
            } else {
                let templateData = listTemplateMessage.find(x => x.TEMPLATECODE == templateCode);

                if (typeof templateData !== 'undefined' && templateData !== null) {
                    $('#listTemplateMessage-selectTemplateOptionWarning').addClass('d-none');
                    sendMessageTemplateReservation(idContact, phoneNumber, templateData);
                } else {
                    $('#listTemplateMessage-selectTemplateOptionWarning').removeClass('d-none');
                }
            }
        });

        $('#modal-listTemplateMessage').modal('show');
    });
}

function resetDialogListTemplateMessage() {
    $('.listTemplateMessage-templateOption').remove();
    $("#listTemplateMessage-templateList").html(elemEmptyTemplateList);
    generateMessagePreviewTemplate(false, 'listTemplateMessage-messagePreview', 'Select template to see message preview');
}

function generateListTemplateMessage(listTemplateMessage) {
    $('.listTemplateMessage-templateOption').remove();
    if (typeof listTemplateMessage !== 'undefined' && listTemplateMessage !== null && listTemplateMessage.length > 0) {
        let elemListTemplateMessage = '';
        $.each(listTemplateMessage, function (index, arrayTemplateMessage) {
            let statusTemplate = arrayTemplateMessage.STATUS,
                statusTemplateBadge = '';

            switch (parseInt(statusTemplate)) {
                case 0: statusTemplateBadge = '<span class="badge bg-warning text-dark">Scheduled</span>'; break;
                case 1: statusTemplateBadge = '<span class="badge bg-success">Sent</span>'; break;
                case -1: statusTemplateBadge = '<span class="badge bg-danger">Failed</span>'; break;
                case -2: statusTemplateBadge = '<span class="badge bg-info">Not Set</span>'; break;
            }

            elemListTemplateMessage +=
                '<li class="list-group-item list-group-item-action listTemplateMessage-templateOption" data-templateCode="' + arrayTemplateMessage.TEMPLATECODE + '">\
                    <div class="d-flex justify-content-between align-items-center">\
                        <h6 class="mb-1">' + arrayTemplateMessage.TEMPLATENAME + '</h6>\
                        '+ statusTemplateBadge + '\
                    </div>\
                    <div class="d-flex small listTemplateMessage-templateOption-dateTime"> \
                        <span class="me-3" > <i class="ri-calendar-line me-1"></i>Schedule: <strong>' + arrayTemplateMessage.DATETIMESCHEDULE + '</strong></span>\
                        <span> <i class="ri-time-line me-1"></i>Sent: <strong>' + arrayTemplateMessage.DATETIMESENT + '</strong></span>\
                    </div >\
                </li > ';
        });

        $("#listTemplateMessage-emptyTemplateList").remove();
        $("#listTemplateMessage-templateList").html(elemListTemplateMessage);
        activateOnClickOptionTemplateMessage(listTemplateMessage);
    } else {
        $("#listTemplateMessage-templateList").html(elemEmptyTemplateList);
    }
}

function activateOnClickOptionTemplateMessage(listTemplateMessage) {
    $('.listTemplateMessage-templateOption').off('click');
    $('.listTemplateMessage-templateOption').on('click', function (e) {
        let elemSelectedOptionTemplateMessage = $(this),
            templateCode = elemSelectedOptionTemplateMessage.attr('data-templateCode'),
            templateData = listTemplateMessage.find(x => x.TEMPLATECODE == templateCode);
        removeActiveClassInOptionTemplateMessage();
        addActiveClassInOptionTemplateMessage(elemSelectedOptionTemplateMessage);

        generateMessagePreviewTemplate(templateData, 'listTemplateMessage-messagePreview');
    });
}

function removeActiveClassInOptionTemplateMessage() {
    $('.listTemplateMessage-templateOption').each(function () {
        $(this).removeClass('active text-light');
        $(this).find('.text-light').removeClass('text-light');
    });
}

function addActiveClassInOptionTemplateMessage(elemSelectedOptionTemplateMessage) {
    elemSelectedOptionTemplateMessage.addClass('active text-light');
    elemSelectedOptionTemplateMessage.find('h6').addClass('text-light');
    elemSelectedOptionTemplateMessage.find('listTemplateMessage-templateOption-dateTime').addClass('text-light');
}

function generateDetailReservationInDialog(reservationProperty, dialogElemPrefix) {
    $('#' + dialogElemPrefix + '-bookingCode').html(typeof reservationProperty.bookingCode === 'undefined' ? '-' : reservationProperty.bookingCode);
    $('#' + dialogElemPrefix + '-customerName').html(typeof reservationProperty.customerName === 'undefined' ? '-' : reservationProperty.customerName);
    $('#' + dialogElemPrefix + '-reservationTitle').html(typeof reservationProperty.reservationTitle === 'undefined' ? '-' : reservationProperty.reservationTitle);
    $('#' + dialogElemPrefix + '-reservationDateDuration').html((typeof reservationProperty.dateTimeStr === 'undefined' ? '-' : reservationProperty.dateTimeStr) + ' | ' + (typeof reservationProperty.durationOfDay === 'undefined' ? '-' : reservationProperty.durationOfDay));
    $('#' + dialogElemPrefix + '-remark').html(typeof reservationProperty.remark === 'undefined' ? '-' : reservationProperty.remark);
}

function getAllDetailReservationProperty(idReservation) {
    let elemListReservationCard = $('.listReservationCard[data-idReservation=' + idReservation + ']'),
        arrPropertyName = ['reservationTitle', 'sourceName', 'dateTimeStr', 'pickupTime', 'durationOfDay', 'numberOfAdult', 'numberOfChild', 'numberOfInfant', 'areaName', 'hotelName', 'pickUpLocation', 'dropOffLocation', 'tourPlan', 'bookingCode', 'remark', 'specialRequest'],
        customerName = $("#detailContact-fullname").html(),
        arrReturnProperty = { customerName: customerName };

    $.each(arrPropertyName, function (index, propertyName) {
        if (elemListReservationCard.find('.listReservationCard-' + propertyName).length > 0) {
            let propertyValue = elemListReservationCard.find('.listReservationCard-' + propertyName).html();
            arrReturnProperty[propertyName] = propertyValue;
        }
    });

    return arrReturnProperty;
}

function generateMessagePreviewTemplate(chatTemplateData, elemContainer, emptyWarningMessage = '- Select template to see message preview -') {
    let elemMessagePreview;
    if (chatTemplateData && typeof chatTemplateData !== 'undefined') {
        let elemContentHeader = generateChatElemContentHeader(chatTemplateData.CONTENTHEADER, chatTemplateData.PARAMETERSHEADER),
            elemContentBody = generateChatElemContentBody(chatTemplateData.CONTENTBODY, chatTemplateData.PARAMETERSBODY),
            elemContentFooter = generateChatElemContentFooter(chatTemplateData.CONTENTFOOTER),
            elemContentButton = generateChatElemContentButton(chatTemplateData.CONTENTBUTTONS);
        elemMessagePreview =
            '<div class="ctext-wrap">\
                <div class="ctext-wrap-content text-start"> \
                    '+ elemContentHeader + elemContentBody + elemContentFooter + elemContentButton + '\
                </div >\
            </div > ';
    } else {
        elemMessagePreview =
            '<div class="alert alert-warning text-center py-2 mb-0" role="alert">\
                <i class="ri-error-warning-line me-2 d-block text-center text-muted" style="font-size: 2rem;"></i>\
                <span class="text-muted">' + emptyWarningMessage + '</span>\
            </div>';
    }

    $("#" + elemContainer).html(elemMessagePreview);
}

function generateChatElemContentHeader(contentHeader, parametersHeader) {
    let elemContentHeader = '';
    parametersHeader = JSON.parse(parametersHeader);

    if (contentHeader != '') {
        if (parametersHeader.length > 0) parametersHeader = generateParametersChatTemplate(parametersHeader);
        elemContentHeader = '<p class="mb-0 fw-bold border-bottom border-primary pb-2 mb-2">' + generateChatTextContent(contentHeader, parametersHeader) + '</p>';
    }

    return elemContentHeader;
}

function generateChatElemContentBody(contentBody, parametersBody) {
    let elemContentBody = '';
    parametersBody = JSON.parse(parametersBody);

    if (contentBody != '') {
        if (typeof parametersBody === 'object' && parametersBody !== null && !Array.isArray(parametersBody)) parametersBody = generateParametersChatTemplate(parametersBody, [defaultListOfQuestionsPlaceholder]);
        elemContentBody = '<p class="mb-0">' + generateChatTextContent(contentBody, parametersBody) + '</p>';
    }

    return elemContentBody;
}

function generateChatElemContentFooter(contentFooter) {
    return '<p class="mb-4 small text-muted border-top border-primary pt-2 mt-3">' + contentFooter + '</p>';
}

function generateChatElemContentButton(contentButton) {
    let elemContentButton = '';

    try {
        let contentButtonParse = JSON.parse(contentButton);
        if (contentButtonParse.length > 0) {
            $.each(contentButtonParse, function (index, arrayButton) {
                let buttonType = arrayButton.type,
                    buttonText = arrayButton.text;
                switch (buttonType) {
                    case 'QUICK_REPLY': elemContentButton += '<span class="d-block p-2 mb-2 border border-secondary text-muted text-center rounded">' + buttonText + '</span>'; break;
                    default: break;
                }
            });
        }
    } catch (error) {
        return elemContentButton;
    }

    return elemContentButton;
}

function generateParametersChatTemplate(parametersTemplate, arrAdditional = []) {
    let arrReturnParameters = [];
    $.each(parametersTemplate, function (paramKey, value) {
        switch (paramKey) {
            case "SOURCENAME": arrReturnParameters.push(typeof reservationProperty.sourceName === 'undefined' || reservationProperty.sourceName == '' ? '-' : reservationProperty.sourceName); break;
            case "CUSTOMERNAME": arrReturnParameters.push(typeof reservationProperty.customerName === 'undefined' || reservationProperty.customerName == '' ? '-' : reservationProperty.customerName); break;
            case "BOOKINGCODE": arrReturnParameters.push(typeof reservationProperty.bookingCode === 'undefined' || reservationProperty.bookingCode == '' ? '-' : reservationProperty.bookingCode); break;
            case "RESERVATIONTITLE": arrReturnParameters.push(typeof reservationProperty.reservationTitle === 'undefined' || reservationProperty.reservationTitle == '' ? '-' : reservationProperty.reservationTitle); break;
            case "RESERVATIONDATE": arrReturnParameters.push(typeof reservationProperty.dateTimeStr === 'undefined' || reservationProperty.dateTimeStr == '' ? '-' : reservationProperty.dateTimeStr); break;
            case "DETAILPAX":
                let adultPax = typeof reservationProperty.numberOfAdult === 'undefined' ? 0 : reservationProperty.numberOfAdult,
                    childPax = typeof reservationProperty.numberOfChild === 'undefined' ? 0 : reservationProperty.numberOfChild,
                    infantPax = typeof reservationProperty.numberOfInfant === 'undefined' ? 0 : reservationProperty.numberOfInfant,
                    detailPax = ((parseInt(adultPax) > 0 ? adultPax : '') + (parseInt(childPax) > 0 ? ', ' + childPax : '') + (parseInt(infantPax) > 0 ? ', ' + infantPax : '')).replace(/,\s*$/, '');
                arrReturnParameters.push(detailPax); break;
            case "PICKUPTIME": arrReturnParameters.push(typeof reservationProperty.pickupTime === 'undefined' || reservationProperty.pickupTime == '' ? '-' : reservationProperty.pickupTime); break;
            case "PICKUPLOCATION": arrReturnParameters.push(typeof reservationProperty.pickUpLocation === 'undefined' || reservationProperty.pickUpLocation == '' ? '-' : reservationProperty.pickUpLocation); break;
            case "HOTELNAME": arrReturnParameters.push(typeof reservationProperty.hotelName === 'undefined' || reservationProperty.hotelName == '' ? '-' : reservationProperty.hotelName); break;
            case "REMARK": arrReturnParameters.push(typeof reservationProperty.remark === 'undefined' || reservationProperty.remark == '' ? '-' : reservationProperty.remark); break;
            case "SPECIALREQUEST": arrReturnParameters.push(typeof reservationProperty.specialRequest === 'undefined' || reservationProperty.specialRequest == '' ? '-' : reservationProperty.specialRequest); break;
            default: break;
        }
    });

    if (arrAdditional.length > 0) {
        $.each(arrAdditional, function (additionalKey, additionalValue) {
            arrReturnParameters.push(additionalValue);
        });
    }

    return arrReturnParameters;
}

function generateChatTextContent(contentTemplate, parametersTemplate) {
    let lastIndex = 0;
    $.each(parametersTemplate, function (index, value) {
        let placeholder = "{{" + (index + 1) + "}}";
        contentTemplate = contentTemplate.replace(placeholder, value);
        lastIndex = index + 1;
    });

    for (let i = lastIndex; i < lastIndex + 10; i++) {
        let placeholder = "{{" + i + "}}";
        contentTemplate = contentTemplate.replace(placeholder, '');
    }

    return generateChatContentBody(contentTemplate);
}

function sendMessageTemplateReservation(idContact, phoneNumber, templateData, templateParametersAdditional = []) {
    let templateParametersHeader = JSON.parse(templateData.PARAMETERSHEADER),
        templateParametersBody = JSON.parse(templateData.PARAMETERSBODY),
        parametersHeader = [],
        parametersBody = [];

    if (typeof templateParametersHeader === 'object' && templateParametersHeader !== null && !Array.isArray(templateParametersHeader)) {
        let paramtersAdditionalHeader = typeof templateParametersAdditional === 'object' && templateParametersAdditional !== null && Array.isArray(templateParametersAdditional.header) ? templateParametersAdditional.header : [];
        parametersHeader = generateParametersChatTemplate(templateParametersHeader, paramtersAdditionalHeader);
    }

    if (typeof templateParametersBody === 'object' && templateParametersBody !== null && !Array.isArray(templateParametersBody)) {
        let paramtersAdditionalBody = typeof templateParametersAdditional === 'object' && templateParametersAdditional !== null && Array.isArray(templateParametersAdditional.body) ? templateParametersAdditional.body : [];
        parametersBody = generateParametersChatTemplate(templateParametersBody, paramtersAdditionalBody);
    }

    let templateParameters = {
        parametersHeader: parametersHeader,
        parametersBody: parametersBody
    },
        dataSend = {
            idContact: idContact,
            phoneNumber: phoneNumber,
            templateData: templateData,
            templateParameters: templateParameters
        };
    $.ajax({
        type: 'POST',
        url: baseURL + "contact/sendTemplateMessage",
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
                    showToast('success', jqXHR)
                    break;
                default:
                    generateWarningMessageResponse(jqXHR);
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        $('#modal-askQuestion').modal('hide');
        $('#modal-listTemplateMessage').modal('hide');
        $("#window-loader").modal("hide");
        NProgress.done();
        setUserToken(jqXHR);
        getDetailContact(idContact);
    });
}

$('#modalEditorContact-form').off('submit');
$('#modalEditorContact-form').on('submit', function (e) {
    e.preventDefault();
    let dataForm = $("#modalEditorContact-form :input").serializeArray(),
        dataSend = {};

    $.each(dataForm, function () {
        dataSend[this.name] = this.value;
    });

    $.ajax({
        type: 'POST',
        url: baseURL + "contact/saveContact",
        contentType: 'application/json',
        dataType: 'json',
        cache: false,
        data: mergeDataSend(dataSend),
        xhrFields: { withCredentials: true },
        headers: { Authorization: "Bearer " + getUserToken() },
        beforeSend: function () {
            NProgress.set(0.4);
            $('#window-loader').modal('show');
            $("#modalEditorContact-form :input").attr("disabled", true);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;
            switch (jqXHR.status) {
                case 200:
                    showToast('success', jqXHR);
                    let detailContact = responseJSON.detailContact,
                        idContact = detailContact.IDCONTACT,
                        rowContact = generateRowContactList(detailContact);

                    if ($(".contact-item[data-idContact=" + idContact + "]").length > 0) $(".contact-item[data-idContact=" + idContact + "]").replaceWith(rowContact);
                    else $("#list-contactData").prepend(rowContact);

                    activateOnClickContactItem();
                    $(".contact-item[data-idContact=" + idContact + "]").trigger('click');
                    $('#modal-editorContact').modal('hide');
                    break;
                default:
                    generateWarningMessageResponse(jqXHR);
                    break;
            }
        }
    }).always(function (jqXHR, textStatus) {
        setUserToken(jqXHR);
        $("#modalEditorContact-form :input").attr("disabled", false);
        $('#window-loader').modal('hide');
        NProgress.done();
    });
});

contactFunc();