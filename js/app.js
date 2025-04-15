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
            o.hasAttribute("data-bs-theme") && "dark" == o.getAttribute("data-bs-theme") ? document.body.setAttribute("data-bs-theme", "light") : document.body.setAttribute("data-bs-theme", "dark")
        })
    }), Waves.init()
}(jQuery);

$(document).ready(function () {
    const liveToast = document.getElementById('liveToast');
    elemToast = new bootstrap.Toast(liveToast);

    $(".popup-img").magnificPopup({
        type: "image",
        closeOnContentClick: !0,
        mainClass: "mfp-img-mobile",
        image: {
            verticalFit: !0
        }
    }), $("#user-status-carousel").owlCarousel({
        items: 4,
        loop: !1,
        margin: 16,
        nav: !1,
        dots: !1
    }), $("#chatinputmorelink-carousel").owlCarousel({
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
    }), $(".menu-item").on("click", function () {
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
    });

    $('.menu-item').first().click();
});

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
        var responseJSON = jqXHR.responseJSON;
        responseMessage = Object.values(responseJSON.messages)[0];
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

function showToast(toastClass, jqXHR) {
    let toastMessage = getMessageResponse(jqXHR);
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

function generateChatContentBody(contentBody) {
    contentBody = String(contentBody);
    contentBody = contentBody.replace(/\n/g, "<br>");
    contentBody = contentBody.replace(/\\n/g, "<br>");
    contentBody = contentBody.replace(/\*(.*?)\*/g, "<b>$1</b>");
    contentBody = contentBody.replace(/\_(.*?)\_/g, "<u>$1</u>");
    contentBody = contentBody.replace(/\~(.*?)\~/g, "<del>$1</del>");

    return contentBody;
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

window.onload = function () {
    history.pushState(null, null, window.location.href);

    window.onpopstate = function () {
        history.pushState(null, null, window.location.href);
    };
};