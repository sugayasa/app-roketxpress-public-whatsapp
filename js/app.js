let elemToast;
! function (e) {
    "use strict";
    var o, t;
    e(".dropdown-menu a.dropdown-toggle").on("click", function (t) {
        return e(this).next().hasClass("show") || e(this).parents(".dropdown-menu").first().find(".show").removeClass("show"), e(this).next(".dropdown-menu").toggleClass("show"), !1
    }), [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function (t) {
        return new bootstrap.Tooltip(t)
    }), [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]')).map(function (t) {
        return new bootstrap.Popover(t)
    }), o = document.getElementsByTagName("body")[0], (t = document.querySelectorAll(".light-dark-mode")) && t.length && t.forEach(function (t) {
        t.addEventListener("click", function (t) {
            o.hasAttribute("data-bs-theme") && "dark" == o.getAttribute("data-bs-theme") ? document.body.setAttribute("data-bs-theme", "light") : document.body.setAttribute("data-bs-theme", "dark");
            $(".card").each(function () {
                if (o.getAttribute("data-bs-theme") === "dark") $(this).removeClass('bg-light2').addClass('bg-light');
                else $(this).removeClass('bg-light').addClass('bg-light2');
            });
        })
    }), Waves.init()
}(jQuery);

$(document).ready(function () {
    const liveToast = document.getElementById('liveToast');
    elemToast = new bootstrap.Toast(liveToast);

    activateMagnificPopup(),
        $("#user-status-carousel").owlCarousel({
            items: 4,
            loop: !1,
            margin: 16,
            nav: !1,
            dots: !1
        }),
        $("#chatinputmorelink-carousel").owlCarousel({
            items: 2,
            loop: !1,
            margin: 16,
            nav: !1,
            dots: !1,
            responsive: {
                0: {
                    items: 2
                },
                600: {
                    items: 5,
                    nav: !1
                },
                992: {
                    items: 8
                }
            }
        }),
        $(".menu-item").on("click", function () {
            hideModalResetActiveMenuLinkSetLoader();

            var alias = $(this).attr("data-alias"),
                url = $(this).attr("data-url");

            setLocalStorageMenuItem(url, alias);
            $(this).find('a.nav-link').addClass('active');

            if (localStorage.getItem("form_" + alias) === null) {
                getViewURL(url, alias);
            } else {
                var responseJSON = localStorage.getItem("form_" + alias);
                renderMainView(JSON.parse(responseJSON));
            }

            if (typeof intervalId !== 'undefined') clearInterval(intervalId);
            if (typeof intervalIdForceHandleChatList !== 'undefined') clearInterval(intervalIdForceHandleChatList);
            if (typeof intervalIdForceHandleChatMenu !== 'undefined') clearInterval(intervalIdForceHandleChatMenu);
        }),
        $(document).on("visibilitychange", function () {
            if (document.visibilityState === "visible") {
                const activeMenu = $(".nav-link.active").closest('li').attr('id');

                switch (activeMenu) {
                    case 'menuCHT':
                        counterTimeChatList();
                        updateUnreadMessageCountOnActiveVisibilityWindow();
                        break;
                    case 'menuCNCT':
                        activateCounterChatSession();
                        break;
                    default:
                        break;
                }
                localStorage.setItem('appVisibility', true);
            } else {
                clearInterval(intervalId);
                localStorage.setItem('appVisibility', false);
            }
        }),
        $('#modal-userProfile').off('show.bs.modal'),
        $('#modal-userProfile').on('show.bs.modal', function () {
            $.ajax({
                type: 'POST',
                url: baseURL + "access/detailProfileSetting",
                contentType: 'application/json',
                dataType: 'json',
                cache: false,
                data: mergeDataSend(),
                xhrFields: { withCredentials: true },
                headers: { Authorization: "Bearer " + getUserToken() },
                beforeSend: function () {
                    NProgress.set(0.4);
                    $("#window-loader").modal("show");
                },
                complete: function (jqXHR, textStatus) {
                    var responseJSON = jqXHR.responseJSON;
                    switch (jqXHR.status) {
                        case 200:
                            let detailUserAdmin = responseJSON.detailUserAdmin;
                            $("#userProfile-name").val(detailUserAdmin.NAME);
                            $("#userProfile-username").val(detailUserAdmin.USERNAME);
                            activatePasswordVisibility();
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
        }),
        $('#form-userProfile').off('submit'),
        $('#form-userProfile').on('submit', function (e) {
            e.preventDefault();
            const name = $('#userProfile-name').val(),
                username = $('#userProfile-username').val(),
                currentPassword = $('#userProfile-oldPassword').val(),
                newPassword = $('#userProfile-newPassword').val(),
                repeatPassword = $('#userProfile-repeatNewPassword').val();
            let dataSend = {
                name: name,
                username: username,
                currentPassword: currentPassword,
                newPassword: newPassword,
                repeatPassword: repeatPassword
            };

            if (name == "" || username == "") {
                showWarning("Name and username is required!");
            } else if ((currentPassword != "" || newPassword != "" || repeatPassword != "") && (currentPassword == "" || newPassword == "" || repeatPassword == "")) {
                showWarning("To change your password, please ensure to complete the fields for the current password, new password, and new password repeat");
            } else {
                $.ajax({
                    type: 'POST',
                    url: baseURL + "access/saveDetailProfileSetting",
                    contentType: 'application/json',
                    dataType: 'json',
                    cache: false,
                    data: mergeDataSend(dataSend),
                    xhrFields: { withCredentials: true },
                    headers: { Authorization: "Bearer " + getUserToken() },
                    beforeSend: function () {
                        NProgress.set(0.4);
                        $("#window-loader").modal("show");
                    },
                    complete: function (jqXHR, textStatus) {
                        var responseJSON = jqXHR.responseJSON;
                        switch (jqXHR.status) {
                            case 200:
                                let relogin = responseJSON.relogin,
                                    token = '';

                                try {
                                    token = responseJSON.token;
                                } catch (err) {
                                    token = jqXHR.token;
                                }

                                $("#modal-userProfile").modal("hide");
                                showToast('success', jqXHR);
                                if (relogin) window.location.replace(MAIN_URL + "/access/logout/" + token);
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

    let redirectDestinationMenu = localStorage.getItem('redirectDestinationMenu');
    if (typeof arrMediaSound !== 'undefined' && arrMediaSound.length > 0) {
        arrMediaSound.forEach(function (value) {
            let key = value.replace(/\.[^/.]+$/, "");
            if (localStorage.getItem(key) === null) {
                downloadAndStoreMedia(baseURLAssetsSound + value, key);
            }
        });
    }

    if (typeof redirectDestinationMenu != 'undefined' && redirectDestinationMenu != null && redirectDestinationMenu != '') {
        let redirectParameters = localStorage.getItem('redirectParameters');
        redirectParameters = (typeof redirectDestinationMenu != 'undefined' && redirectDestinationMenu != null && redirectDestinationMenu != '') ? JSON.parse(redirectParameters) : [];

        let phoneNumber = redirectParameters.phoneNumber;
        switch (redirectDestinationMenu) {
            case "CHT":
                openMenuSetCallBack('menuCHT', function () {
                    $("#filter-searchKeyword").val(phoneNumber);
                });
                break;
            case "CNCT":
                openMenuSetCallBack('menuCNCT', function () {
                    $("#filter-searchKeyword").val(phoneNumber);
                });
                break;
            default:
                $('.menu-item').first().click();
        }
        localStorage.removeItem("redirectDestinationMenu");
        localStorage.removeItem("redirectParameters");
    } else {
        $('.menu-item').first().click();
    }
});

function activateMagnificPopup() {
    $(".popup-img").magnificPopup({
        type: "image",
        closeOnContentClick: !0,
        mainClass: "mfp-img-mobile",
        image: {
            verticalFit: !0
        }
    })
}

function downloadAndStoreMedia(url, key) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            let reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
                localStorage.setItem(key, reader.result);
            };
        })
        .catch(error => console.error("Download failed : " + url, error));
}

function playStoredAudio(key) {
    let audioData = localStorage.getItem(key);
    if (audioData) {
        let audio = new Audio(audioData);
        audio.play();
    } else {
        console.error("Media file not found! :: " + key);
    }
}

function updateUnreadMessageCountOnActiveVisibilityWindow() {
    const containerConversation = $("#chat-conversation-ul");
    if (containerConversation.length > 0) {
        const activeChatListItem = $("#list-chatListData").find('li.chatList-item.active'),
            unreadMessageCount = activeChatListItem.find('div.unread-message').find('span').text();

        if (parseInt(unreadMessageCount) > 0) {
            const idChatList = activeChatListItem.attr('data-idchatlist'),
                dataSend = { idChatList: idChatList };
            $.ajax({
                type: 'POST',
                url: baseURL + "chat/updateUnreadMessageCount",
                contentType: 'application/json',
                dataType: 'json',
                cache: false,
                data: mergeDataSend(dataSend),
                xhrFields: { withCredentials: true },
                headers: { Authorization: "Bearer " + getUserToken() }
            }).always(function (jqXHR, textStatus) {
                setUserToken(jqXHR);
            });
        }
    }
}

function hideModalResetActiveMenuLinkSetLoader() {
    $(".modal").modal("hide");
    $('li.menu-item').find('a.nav-link').removeClass('active');
    setLoaderPillsContainerContent();
}

function setLocalStorageMenuItem(url, alias) {
    localStorage.setItem("lastUrl", url);
    localStorage.setItem("lastAlias", alias);
}

function setLoaderPillsContainerContent() {
    $("#tab-content-pills, #content-container").html(loaderElem);
}

function getViewURL(url, alias, callback) {
    $.ajax({
        type: "POST",
        url: baseURL + "view/" + url,
        contentType: "application/json",
        dataType: "json",
        cache: true,
        data: mergeDataSend(),
        xhrFields: {
            withCredentials: true,
        },
        headers: {
            Authorization: "Bearer " + getUserToken(),
        },
        beforeSend: function () {
            NProgress.start(0.4);
        },
        complete: function (jqXHR, textStatus) {
            var responseJSON = jqXHR.responseJSON;
            switch (jqXHR.status) {
                case 200:
                    localStorage.setItem("form_" + alias, JSON.stringify(responseJSON));
                    renderMainView(responseJSON);
                    if (typeof callback == "function") callback();
                    break;
                default:
                    $("#tab-content-pills, #content-container").html("<center>" + Object.values(responseJSON.messages)[0] + "</center>");
                    NProgress.done();
                    break;
            }
        },
    }).always(function (jqXHR, textStatus) {
        NProgress.done();
        setUserToken(jqXHR);
    });
}

function renderMainView(responseJSON, callback) {
    $("#modalWarning").off("hidden.bs.modal");
    $("#tab-content-pills").html(responseJSON.contentPills);
    $("#content-container").html(responseJSON.contentMain);

    // if (responseJSON.isChatContent) $("#content-container").addClass('user-chat');
    // if (!responseJSON.isChatContent) $("#content-container").removeClass('user-chat');
    let themeType = document.getElementsByTagName("body")[0].getAttribute("data-bs-theme");

    $(".card").each(function () {
        if (themeType === "dark") $(this).removeClass('bg-light2').addClass('bg-light');
        else $(this).removeClass('bg-light').addClass('bg-light2');
    });

    if ($(".input-date-single").length) generateDatePickerElem();
    NProgress.done();

    if (typeof callback == "function") callback();
}

function activateOnClickPillsItem() {
    $(".chat-user-list li a, .chat-user-list li .pills-list-item").off("click");
    $(".chat-user-list li a, .chat-user-list li .pills-list-item").on('click', function (e) {
        $(".user-chat").addClass("user-chat-show")
    });

    $(".user-chat-remove").off("click");
    $(".user-chat-remove").on('click', function (e) {
        $(".user-chat").removeClass("user-chat-show")
    });
}

function setOptionHelper(
    elementIDArr,
    table,
    iddata = false,
    callback = false,
    parentValue = false,
    parentValue2 = false
) {
    var arrID = Array.isArray(elementIDArr) ? elementIDArr : [elementIDArr];
    arrID.forEach(function (elementID) {
        if ($("#" + elementID).length) {
            var dataOpt = JSON.parse(localStorage.getItem("optionHelper")),
                options = dataOpt[table];
            $("#" + elementID).empty();

            var options = parentValue2 != false ? options.filter(options => [parentValue2].includes(options.PARENTVALUE2)) : options,
                optionAll = $("#" + elementID).attr("option-all"),
                optionAllVal = $("#" + elementID).attr("option-all-value"),
                optionAllVal = typeof optionAllVal !== typeof undefined && optionAllVal !== false ? optionAllVal : "",
                firstValue = false,
                isOptGroup = typeof options[0] !== 'undefined' ? options[0].hasOwnProperty('IDGROUP') : false,
                arrIdGroup = [],
                lastIndex = parentValue !== false &&
                    parentValue !== 0 &&
                    parentValue !== '' &&
                    typeof parentValue !== 'undefined' &&
                    isOptGroup ? options.filter((obj) => obj.IDGROUP === parentValue).length - 1 : options.length - 1,
                indexElem = 0,
                optGroupElem;

            if (typeof optionAll !== typeof undefined && optionAll !== false) {
                $("#" + elementID).prepend($("<option></option>").val(optionAllVal).html(optionAll)).prop('selected', true);
            }

            var foundIdData = false;
            $("#" + elementID).each(function (i, obj) {
                $.each(options, function (index, array) {
                    var selected = "";
                    if (table == "optionYear") {
                        var thisYear = moment().year();
                        if (array.ID == thisYear) selected = "selected";
                    }

                    if (
                        parentValue === false ||
                        parentValue === '' ||
                        (parentValue !== false &&
                            parentValue !== 0 &&
                            (array.PARENTVALUE == parentValue || array.IDGROUP == parentValue)) ||
                        (parentValue2 !== false &&
                            parentValue2 !== 0 &&
                            (array.PARENTVALUE2 == parentValue2 || array.IDGROUP == parentValue2))
                    ) {
                        var optElem = $("<option " + selected + "></option>").val(array.ID).html(array.VALUE);
                        firstValue = !firstValue ? array.ID : firstValue;
                        if (isOptGroup) {
                            var idGroup = array.IDGROUP,
                                isIdGroupExist = arrIdGroup.includes(idGroup);
                            if (!isIdGroupExist) {
                                if (optGroupElem && optGroupElem != '' && typeof optGroupElem !== 'undefined') $("#" + elementID).append(optGroupElem);
                                optGroupElem = $("<optgroup label='" + array.VALUEGROUP + "'>");
                                arrIdGroup.push(idGroup);
                            }
                            optGroupElem.append(optElem);
                            if (indexElem == lastIndex) $("#" + elementID).append(optGroupElem);
                        } else {
                            $("#" + elementID).append(optElem);
                        }
                        if (iddata && array.ID === iddata) foundIdData = true;
                        indexElem++;
                    }
                });
                if (iddata != false && foundIdData) {
                    $("#" + elementID).val(iddata);
                }
            });
        }

        if (typeof callback == "function") callback(firstValue);
    });
}

function updateDataOptionHelper(arrayName, arrayValue) {
    var dataOptionHelper = JSON.parse(localStorage.getItem("optionHelper"));
    dataOptionHelper[arrayName] = arrayValue;

    localStorage.setItem("optionHelper", JSON.stringify(dataOptionHelper));
}

function getMessageResponse(jqXHR) {
    var responseMessage;
    try {
        var responseJSON = jqXHR.responseJSON,
            responseMessage = responseJSON.message;
        if (typeof responseMessage == 'undefined' && responseMessage == null) responseMessage = Object.values(responseJSON.messages)[0];
    } catch (err) {
        responseMessage =
            jqXHR.messages != "" &&
                jqXHR.messages !== null &&
                jqXHR.messages !== undefined
                ? Object.values(jqXHR.messages)[0]
                : "";
    }
    return responseMessage;
}

function generateWarningMessageResponse(jqXHR) {
    var responseMessage = getMessageResponse(jqXHR);
    showWarning(responseMessage);
}

function showWarning(message) {
    $("#modalWarning").on("show.bs.modal", function () {
        $("#modalWarningBody").html(message);
    });
    $("#modalWarning").modal("show");
}

function showToast(toastClass, jqXHROrStringMessage) {
    let toastMessage = typeof jqXHROrStringMessage == 'string' ? jqXHROrStringMessage : getMessageResponse(jqXHROrStringMessage);
    let iconClass;

    $("#liveToast").removeClass("bg-success bg-danger bg-warning bg-info");
    $("#liveToast").addClass('bg-' + toastClass);
    $("#liveToast-body").html(toastMessage);

    switch (toastClass) {
        case 'success':
            iconClass = 'ri-check-line';
            break;
        case 'warning':
            iconClass = 'ri-alert-line';
            break;
        case 'info':
            iconClass = 'ri-information-line';
            break;
        default:
            iconClass = 'ri-error-warning-line';
            break;
    }
    $("#liveToast-icon").removeClass(function (index, className) {
        return (className.match(/(^|\s)ri-\S+/g) || []).join(' ');
    }).addClass(iconClass);

    if (typeof elemToast !== 'undefined') elemToast.show();
}

function recalculateSimpleBar(elementId, scrollToBottom = false) {
    var simpleBarInstance = new SimpleBar(document.getElementById(elementId));
    simpleBarInstance.recalculate();

    if (scrollToBottom) {
        scrollToBottomSimpleBar(elementId);
    }
}

function scrollToBottomSimpleBar(elementId) {
    $("#" + elementId + " .simplebar-content-wrapper").scrollTop($("#" + elementId + " .simplebar-content-wrapper").prop("scrollHeight"));
}

function setVerticalCenterContentContainer(elemId, contentHeight) {
    var contentContainerHeight = $("#content-container").height(),
        marginTop = (contentContainerHeight - contentHeight) / 2;
    $("#" + elemId).css('margin-top', marginTop + 'px');
}

function generateChatContent(arrayChatThread) {
    let idChatThreadType = arrayChatThread.IDCHATTHREADTYPE,
        contentHeader = arrayChatThread.CHATCONTENTHEADER,
        contentBody = arrayChatThread.CHATCONTENTBODY,
        contentFooter = arrayChatThread.CHATCONTENTFOOTER,
        elemContentReturn = '';

    switch (parseInt(idChatThreadType)) {
        case 1:
            if (contentHeader != '') elemContentReturn += '<p class="mb-0 fw-bold border-bottom border-primary pb-2 mb-2">' + contentHeader + '</p>';
            if (contentBody != '') elemContentReturn += '<p class="mb-0">' + generateChatContentBody(contentBody) + '</p>';
            if (contentFooter != '') elemContentReturn += '<p class="mb-0 small text-muted border-top border-primary pt-2 mt-3">' + contentFooter + '</p>';
            break;
        case 2:
            let chatCaption = arrayChatThread.CHATCAPTION,
                elemCaption = chatCaption != '' && chatCaption != null ? '<div class="ps-1"><p>' + chatCaption + '</p></div>' : '';
            elemContentReturn = '<ul class="list-inline message-img mb-0">\
                                    <li class="list-inline-item message-img-list mt-1 ms-0">\
                                        <div>\
                                            <a class="popup-img d-inline-block m-1" href="'+ arrayChatThread.CHATCONTENTBODY + '">\
                                                <img src="'+ arrayChatThread.CHATCONTENTBODY + '" alt="" class="rounded border">\
                                            </a>\
                                            '+ elemCaption + '\
                                        </div>\
                                    </li>\
                                </ul >';
            break;
        case 6:
            elemContentReturn += '<p class="mb-0">' + generateChatContentLocationLink(contentBody) + '</p>';
            break;
    }

    return elemContentReturn;
}

function generateChatContentBody(contentBody) {
    contentBody = String(contentBody);
    contentBody = contentBody.replace(/\n/g, "<br>");
    contentBody = contentBody.replace(/\\n/g, "<br>");
    contentBody = contentBody.replace(/\*(.*?)\*/g, "<b>$1</b>");
    contentBody = contentBody.replace(/\_(.*?)\_/g, "<u>$1</u>");
    contentBody = contentBody.replace(/\~(.*?)\~/g, "<del>$1</del>");

    return contentBody;
}

function generateChatContentLocationLink(contentBody) {
    let coordinateParts = contentBody.split(';');

    if (coordinateParts.length === 2) {
        let lat = coordinateParts[0].trim();
        let lng = coordinateParts[1].trim();
        let mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        contentBody = `<a href="${mapUrl}" target="_blank" class="text-decoration-none bg-info py-1 px-2 rounded-2" style="color: inherit;"><i class="ri-map-pin-line"></i> Show Location On Map</a>`;
    } else {
        contentBody = '<span class="bg-info py-1 px-2 rounded-2">Invalid location format</span>';
    }

    return contentBody;
}

function generateChatContentWrap(chatThreadPosition, arrayChatThread, chatContent, chatTime, textStartClass = '') {
    let idChatThread = arrayChatThread.IDCHATTHREAD,
        idMessage = arrayChatThread.IDMESSAGE,
        classContentLongText = generateClassContentLongText(arrayChatThread),
        dateTimeSent = arrayChatThread.DATETIMESENT,
        dateTimeSentStr = dateTimeSent !== null ? formatDateTimeZoneString(dateTimeSent) : '-',
        dateTimeDelivered = arrayChatThread.DATETIMEDELIVERED,
        dateTimeDeliveredStr = dateTimeDelivered !== null ? formatDateTimeZoneString(dateTimeDelivered) : '-',
        dateTimeRead = arrayChatThread.DATETIMEREAD,
        dateTimeReadStr = dateTimeRead !== null ? formatDateTimeZoneString(dateTimeRead) : '-',
        dataIdChatThreadAttr = chatThreadPosition == 'L' ? 'data-idchatthread="' + idChatThread + '"' : '',
        dropdownOptionElem = chatThreadPosition == 'L' ?
            '<div class="dropdown align-self-start">\
                <a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
                    <i class="ri-more-2-fill"></i>\
                </a>\
                <div class="dropdown-menu">\
                    <a class="dropdown-item chatContentWrap-optionButtonCopy" href="#" data-idMessage="' + idMessage + '">Copy <i class="ri-file-copy-line float-end text-muted"></i></a>\
                </div>\
            </div>' : '',
        // inactive feature for reply/qoute message
        // <a class="dropdown-item chatContentWrap-optionButtonReply" href="#" data-idMessage="' + idMessage + '">Reply <i class="ri-reply-line float-end text-muted"></i></a>\
        quotedMessageElement = classIconACK = '';

    if (arrayChatThread.IDMESSAGEQUOTED !== undefined && arrayChatThread.IDMESSAGEQUOTED !== null && arrayChatThread.IDMESSAGEQUOTED != '') {
        quotedMessageElement = '<div class="border rounded bg-info chatContentWrap-idMessageQuoted px-2 py-1 mb-2" style="border-left: 6px solid var(--bs-border-color) !important;" data-idMessageQuoted="' + arrayChatThread.IDMESSAGEQUOTED + '">\
                                    <div class="text-truncate fw-bold">'+ arrayChatThread.MESSAGEQUOTEDSENDER + '</div>\
                                    <div class="text-truncate">'+ arrayChatThread.MESSAGEQUOTED + '..</div>\
                                </div>';
    }

    switch (true) {
        case (dateTimeRead !== null && chatThreadPosition == 'R'): classIconACK = 'ri-check-double-line text-primary'; break;
        case (dateTimeDelivered !== null && chatThreadPosition == 'R'): classIconACK = 'ri-check-double-line text-muted'; break;
        case (dateTimeSent !== null && chatThreadPosition == 'R'): classIconACK = 'ri-check-line text-muted'; break;
        case (chatThreadPosition == 'L'): classIconACK = 'ri-information-2-line'; break;
        default: classIconACK = 'ri-hourglass-2-fill text-muted'; break;
    }

    return '<div class="ctext-wrap" data-idMessage="' + idMessage + '">\
                <div class="ctext-wrap-content ' + textStartClass + ' ' + classContentLongText + '">\
                    '+ quotedMessageElement + chatContent + '\
                    <p class="chat-time mb-0 d-flex justify-content-between font-size-13">\
                        <span class="me-2" ><i class="ri-time-line align-middle"></i> <span class="align-middle">' + chatTime + '</span></span>\
                        <span class="ms-2" data-bs-toggle="modal" data-bs-target="#modal-messageACKDetails" ' + dataIdChatThreadAttr + ' data-ack-sent="' + dateTimeSentStr + '" data-ack-delivered="' + dateTimeDeliveredStr + '" data-ack-read="' + dateTimeReadStr + '">\
                            <i class="fw-bold chatContentWrap-iconACK ' + classIconACK + '" data - idMessage="' + idMessage + '" ></i>\
                        </span>\
                    </p>\
                </div>\
                '+ dropdownOptionElem + '\
            </div>';
}

function generateClassContentLongText(arrayChatThread) {
    let classReturn = '';

    switch (parseInt(arrayChatThread.IDCHATTHREADTYPE)) {
        case 1:
            let contentBody = arrayChatThread.CHATCONTENTBODY,
                contentBodyHtml = generateChatContentBody(contentBody),
                isContainsLongText = false,
                arrContentBodyHtml = contentBodyHtml.split('<br>');
            $.each(arrContentBodyHtml, function (index, value) {
                if (value.length > 100) {
                    isContainsLongText = true;
                }
            });
            classReturn = isContainsLongText ? 'w-75 mw-100' : '';
            break;
        case 2:
            classReturn = 'mw-75';
    }

    return classReturn;
}

function activateChatContentOptionButton() {
    $('.chatContentWrap-optionButtonCopy').off('click');
    $('.chatContentWrap-optionButtonCopy').on('click', function (e) {
        let idMessage = $(this).attr('data-idMessage'),
            elemCtextWrap = $('.ctext-wrap[data-idMessage=' + idMessage + ']');
        if (elemCtextWrap.length > 0) {
            let textMessage = elemCtextWrap.find('p').first().text();
            navigator.clipboard.writeText(textMessage).then(function () {
                showToast('success', 'Message copied to clipboard!');
            }).catch(function (err) {
                console.error("Failed to copy text: ", err);
            });
        }
    });

    $('.chatContentWrap-optionButtonReply').off('click');
    $('.chatContentWrap-optionButtonReply').on('click', function (e) {
        let idMessage = $(this).attr('data-idMessage'),
            elemCtextWrap = $('.ctext-wrap[data-idMessage=' + idMessage + ']');

        if (elemCtextWrap.length > 0) {
            let textMessage = elemCtextWrap.find('p').first().html().split('<br>', 1)[0];
            $('#chat-idMessageQuoted').val(idMessage);
            $('#chat-quotedMessageText').html(textMessage.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;/g, ' ').trim());
            $('#chat-quotedMessage').removeClass('d-none');
            $('#chat-inputTextMessage').focus();

            $('#chat-quotedMessageRemove').off('click');
            $('#chat-quotedMessageRemove').on('click', function (e) {
                resetQuotedMessage(true);
            });
            recalculateChatConversationHeight();
        }
    });
}

function openMenuSetCallBack(menuId, callback, parameters) {
    hideModalResetActiveMenuLinkSetLoader();

    let elemMenuList = $("#" + menuId);

    if (elemMenuList.length === 0) {
        showWarning("You can't perform this action. This feature is not available for your account!");
        return;
    } else {
        let alias = elemMenuList.attr("data-alias"),
            url = elemMenuList.attr("data-url");

        setLocalStorageMenuItem(url, alias);
        elemMenuList.find('a.nav-link').addClass('active');

        if (localStorage.getItem("form_" + alias) === null) {
            getViewURL(url, alias, function () {
                if (typeof callback == "function") {
                    callback(parameters);
                }
            });
        } else {
            var responseJSON = localStorage.getItem("form_" + alias);
            renderMainView(JSON.parse(responseJSON), function () {
                if (typeof callback == "function") {
                    callback(parameters);
                }
            });
        }
    }
}

function activateBootstrapTooltip() {
    $('[data-bs-toggle="tooltip"]').each(function () {
        let title = $(this).attr('data-bs-title');
        if (typeof title !== 'undefined' && title !== null) $(this).attr('data-bs-title', title.replace(/\n/g, '<br>'));
        new bootstrap.Tooltip(this);
    });
}

function formatDateTimeZoneString(timeStamp) {
    return moment.unix(timeStamp).tz(timezoneOffset).format('DD MMM YY HH:mm');
}

function counterTimeChatList() {
    let elemChatListItem = $('.chatList-item'),
        timeStampNow = moment.utc(),
        arrTimeStampChatList = [];

    elemChatListItem.each(function (index, value) {
        let timestampChatList = $(this).attr('data-timestamp');
        if (Math.abs(timeStampNow.diff(moment.unix(timestampChatList), 'minutes')) <= 60) arrTimeStampChatList.push(parseInt(timestampChatList));
    });

    clearInterval(intervalId);
    intervalId = setInterval(function () {
        let timeStampNow = moment.utc();
        elemChatListItem.each(function (index, value) {
            let timeStampLastReply = $(this).attr('data-datetimelastreply');
            if (Math.abs(timeStampNow.diff(moment.unix(timeStampLastReply), 'seconds')) < (60 * 60 * 24)) {
                $(this).find('div.chat-user-img').addClass('online');
            } else {
                $(this).find('div.chat-user-img').removeClass('online');
            }
        });

        arrTimeStampChatList.forEach(function (timestampChatList) {
            let differenceInMinutes = timeStampNow.diff(moment.unix(timestampChatList), 'minutes'),
                elemChatListItem = $('.chatList-item[data-timestamp="' + timestampChatList + '"]'),
                elemTimestampChatListItem = elemChatListItem.find('div.chatList-item-time'),
                dateTimeChatListItemStr = elemTimestampChatListItem.html(),
                dateTimeChatListItemUpdateStr = '-';

            if (differenceInMinutes < 60) {
                if (differenceInMinutes == 0) dateTimeChatListItemUpdateStr = "Now";
                if (differenceInMinutes == 1) dateTimeChatListItemUpdateStr = "1 min";
                if (differenceInMinutes > 1) dateTimeChatListItemUpdateStr = differenceInMinutes + " mins";

                if (dateTimeChatListItemStr != dateTimeChatListItemUpdateStr) elemTimestampChatListItem.html(dateTimeChatListItemUpdateStr);
            } else {
                let timestampChatListMoment = moment.unix(timestampChatList).tz(timezoneOffset),
                    timeStampNowLocal = moment.tz(timezoneOffset);

                if (!timestampChatListMoment.isSame(timeStampNowLocal, 'day')) {
                    elemTimestampChatListItem.html(moment.unix(timestampChatList).tz(timezoneOffset).format('DD MMM YYYY'));
                } else {
                    elemTimestampChatListItem.html(moment.unix(timestampChatList).tz(timezoneOffset).format('HH:mm'));
                }
            }
        });

        let containerConversation = $("#chat-conversation-ul");
        if (containerConversation.length > 0) {
            let dateTimeLastReplyActiveChat = $('#chat-timeStampLastReply').val();
            if (dateTimeLastReplyActiveChat > 0) {
                let countdownTime = moment.unix(dateTimeLastReplyActiveChat).add(24, 'hours').utc(),
                    timeRemaining = countdownTime.diff(moment.utc(), 'seconds');

                if (timeRemaining > 0) {
                    let chatHandleStatus = $('#chat-handleStatus').val(),
                        chatHandleForce = $('#chat-handleForce').val(),
                        hours = Math.floor(timeRemaining / 3600),
                        minutes = Math.floor((timeRemaining % 3600) / 60),
                        seconds = timeRemaining % 60;

                    $('#chat-topbar-badgeSession').html(`${("00" + hours).slice(-2)}:${("00" + minutes).slice(-2)}:${("00" + seconds).slice(-2)}`).removeClass('bg-danger').addClass('bg-success');
                    setStatusHandleElement(chatHandleStatus, chatHandleForce);
                } else {
                    setInactiveSessionDisableChatInput();
                }
            } else {
                setInactiveSessionDisableChatInput();
            }
        }
    }, 1000);
}

function setStatusHandleElement(chatHandleStatus, chatHandleForce) {
    let badgeHandleStatus = '';
    chatHandleStatus = parseInt(chatHandleStatus);
    chatHandleForce = parseInt(chatHandleForce);

    if (chatHandleStatus == 2) {
        $('#chat-inputTextMessage, #chat-btnSendMessage').prop('disabled', false);
    } else {
        $('#chat-inputTextMessage, #chat-btnSendMessage').prop('disabled', true);
    }

    switch (chatHandleStatus) {
        case 1:
            badgeHandleStatus = '<span class="badge bg-primary font-size-13"><i class="font-size-15 ri-robot-2-line"></i> Handle by BOT</span>';
            $('#chat-actionButton-activateHuman').prop('disabled', false).removeClass('d-none');
            $('#chat-actionButton-activateBOT').prop('disabled', true).addClass('d-none');
            break;
        case 2:
            badgeHandleStatus = '<span class="badge bg-success font-size-13"><i class="font-size-15 ri-user-voice-line"></i> Handle by Human</span>';
            $('#chat-actionButton-activateHuman').prop('disabled', true).addClass('d-none');
            if (chatHandleForce == 0) $('#chat-actionButton-activateBOT').prop('disabled', false).removeClass('d-none');
            break;
    }

    $("#chat-topbar-badgeHandleStatus").html(badgeHandleStatus);
    recalculateChatConversationHeight();
    activateActionButtonHandleStatus();
}

function activateActionButtonHandleStatus() {
    $('#chat-actionButton-activateHuman, #chat-actionButton-activateBOT').off('click');
    $('#chat-actionButton-activateHuman, #chat-actionButton-activateBOT').on('click', function (e) {
        e.preventDefault();
        let idChatList = $("#chat-idChatList").val(),
            idContact = $("#chat-idContact").val(),
            handleStatus = $(this).attr('data-handleStatus'),
            dataSend = { idChatList: idChatList, idContact: idContact, handleStatus: handleStatus };
        $.ajax({
            type: 'POST',
            url: baseURL + "chat/setActiveHandleStatus",
            contentType: 'application/json',
            dataType: 'json',
            cache: false,
            data: mergeDataSend(dataSend),
            xhrFields: { withCredentials: true },
            headers: { Authorization: "Bearer " + getUserToken() },
            beforeSend: function () {
                NProgress.set(0.4);
                $("#window-loader").modal("show");
            },
            complete: function (jqXHR, textStatus) {
                switch (jqXHR.status) {
                    case 200: break;
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

function setInactiveSessionDisableChatInput() {
    $('#chat-topbar-badgeSession').html('Inactive Session').removeClass('bg-success').addClass('bg-danger');
    $('#chat-inputTextMessage, #chat-btnSendMessage').prop('disabled', true);
}

function activatePasswordVisibility() {
    $('.inputPassword-toggleVisibility').off('click');
    $('.inputPassword-toggleVisibility').on('click', function (e) {
        const passwordInput = $(this).closest('.input-group').find('input.form-control'),
            passwordIcon = $(this).find('.ri-eye-line, .ri-eye-off-line'),
            passwordInputType = passwordInput.attr('type');

        if (passwordInputType === 'password') {
            passwordInput.attr('type', 'text');
            passwordIcon.removeClass('ri-eye-off-line').addClass('ri-eye-line');
        } else {
            passwordInput.attr('type', 'password');
            passwordIcon.removeClass('ri-eye-line').addClass('ri-eye-off-line');
        }
    });
}

function numberFormat(number) {
    if (number % 1 == 0) {
        number = number ? parseInt(number, 10) : 0;
    }
    return (number === 0 || number === undefined || number === null) ? "0" : number.toLocaleString("en-US");
}

function maskNumberInput(
    minValue = 0,
    maxValue = false,
    elemID = false,
    callback = false
) {
    var $input;

    if (elemID === false) {
        $input = $(".maskNumber");
    } else {
        $input = $("#" + elemID);
    }

    if ($input.val() === "") {
        $input.val(0);
    }
    $input.on("keyup", function (event) {
        var selection = window.getSelection().toString();
        if (selection !== '') return;
        if ($.inArray(event.keyCode, [38, 40, 37, 39]) !== -1) return;

        var $this = $(this);
        var originalVal = $this.val();
        var caretPos = this.selectionStart;

        var rawBeforeCaret = originalVal.substring(0, caretPos).replace(/[^0-9.]/g, "");
        var rawCaretPos = rawBeforeCaret.length;

        var decimalInput = $this.hasClass("decimalInput");
        var showcomma = $this.hasClass("nocomma") ? false : true;
        var showzero = $this.hasClass("nozero") ? false : true;
        var padzeroleft = $this.hasClass("padzeroleft") ? true : false;

        var input = originalVal.replace(/[^0-9.]/g, "");

        if (!decimalInput) {
            var num = parseInt(input, 10);
            if (isNaN(num)) num = minValue;
            num = num < minValue ? minValue : num;
            num = maxValue !== false && num > maxValue ? maxValue : num;
            input = num.toString();
        }

        var formatted;
        if (!decimalInput) {
            if (showcomma) {
                var num = input ? parseInt(input, 10) : 0;
                formatted = showzero ? (num === 0 ? "0" : num.toLocaleString("en-US")) : (num === 0 ? "" : num.toLocaleString("en-US"));
            } else {
                formatted = input;
            }
        } else {
            formatted = input;
        }

        $this.val(formatted);

        var newCaretPos = 0;
        var digitCount = 0;
        for (var i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) {
                digitCount++;
            }
            if (digitCount >= rawCaretPos) {
                newCaretPos = i + 1;
                break;
            }
        }

        if (newCaretPos === 0) {
            newCaretPos = formatted.length;
        }

        this.setSelectionRange(newCaretPos, newCaretPos);

        if (typeof callback === "function") {
            callback(input);
        }
    });
}

function activateCounterFieldEvent() {
    $('.btn-number').off('click');
    $('.input-number').off('focusin change keydown');

    $('.btn-number').click(function (e) {
        e.preventDefault();
        var fieldName = $(this).attr('data-field'),
            type = $(this).attr('data-type'),
            input = $("input[name='" + fieldName + "']"),
            currentVal = parseInt(input.val());

        if (!isNaN(currentVal)) {
            if (type == 'minus') {
                if (currentVal > input.attr('min')) {
                    input.val(currentVal - 1).change();
                }
                if (parseInt(input.val()) == input.attr('min')) {
                    $(this).attr('disabled', true);
                }
            } else if (type == 'plus') {
                if (currentVal < input.attr('max')) {
                    input.val(currentVal + 1).change();
                }
                if (parseInt(input.val()) == input.attr('max')) {
                    $(this).attr('disabled', true);
                }
            }
        } else {
            input.val(0);
        }
    });

    $('.input-number').focusin(function () {
        $(this).data('oldValue', $(this).val());
    });

    $('.input-number').change(function () {
        var minValue = parseInt($(this).attr('min')),
            maxValue = parseInt($(this).attr('max')),
            valueCurrent = parseInt($(this).val()),
            name = $(this).attr('name');

        if (valueCurrent >= minValue) {
            $(".btn-number[data-type='minus'][data-field='" + name + "']").removeAttr('disabled')
        } else {
            $(this).val($(this).data('oldValue'));
        }
        if (valueCurrent <= maxValue) {
            $(".btn-number[data-type='plus'][data-field='" + name + "']").removeAttr('disabled')
        } else {
            $(this).val($(this).data('oldValue'));
        }
    });

    $(".input-number").keydown(function (e) {
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
            (e.keyCode == 65 && e.ctrlKey === true) ||
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }

        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
}

function generateDatePickerElem(parentEl = 'body') {
    parentEl = typeof parentEl !== 'undefined' && parentEl != null ? parentEl : 'body';
    $('.input-date-single').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoApply: true,
        parentEl: parentEl,
        minYear: 2024,
        maxYear: parseInt(moment().format('YYYY')) + 2,
        locale: {
            format: 'DD-MM-YYYY',
            separator: ' - ',
            daysOfWeek: [
                'Sun',
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat'
            ],
            monthNames: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ],
            firstDay: 1
        }
    });
}

function resetSelectedOptionFirstValue(elemID) {
    if (typeof elemID === 'undefined' || elemID == null || elemID == '') return;

    let arrElemID = Array.isArray(elemID) ? elemID : [elemID];

    for (let i = 0; i < arrElemID.length; i++) {
        let $input = $("#" + arrElemID[i]);
        if ($input.length > 0) {
            let firstValue = $input.find('option').first().val();
            if (firstValue !== undefined && firstValue !== null) {
                $input.val(firstValue).change();
            }
        }
    }
}

function isValidArray(variable) {
    return Array.isArray(variable) && variable !== undefined && variable !== null && variable.length > 0;
}

window.onload = function () {
    history.pushState(null, null, window.location.href);

    window.onpopstate = function () {
        history.pushState(null, null, window.location.href);
    };
};