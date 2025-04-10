$(document).ready(function () {
    $("#togglePassword").on("click", function () {
        showPassword(this);
    });

    $("#login-form").submit(function (e) {
        e.preventDefault();
        var username = $("#username").val(),
            password = $("#password").val(),
            captcha = $("#captcha").val(),
            userCredentials = { captcha: captcha, username: username, password: password };

        if (captcha == "") {
            var msg = "Please enter the captcha code shown";
            if ($("#warning-element").length) {
                $("#warning-element")
                    .removeClass("d-none")
                    .find("p")
                    .html(msg)
                    .addClass('animated bounce infinite');
            } else {
                $("#container-warning-element").html(createWarningElement(msg));
            }
            localStorage.setItem("lastMessage", msg);
            return;
        }

        $.ajax({
            type: "POST",
            url: API_URL + "/access/login",
            contentType: "application/json",
            dataType: "json",
            data: mergeDataSend(userCredentials),
            xhrFields: {
                withCredentials: true,
            },
            headers: {
                Authorization: "Bearer " + getUserToken(),
            },
            beforeSend: function () {
                NProgress.start();
                clearWarningElement();
                $("#username, #password, #captcha").prop("readonly", true);
            },
            complete: function (jqXHR, textStatus) {
                var responseJSON = jqXHR.responseJSON;
                switch (jqXHR.status) {
                    case 200:
                        callMainPage();
                        break;
                    default:
                        if ($("#warning-element").length) {
                            $("#warning-element")
                                .removeClass("d-none")
                                .find("p")
                                .html(Object.values(responseJSON.messages)[0]);
                        } else {
                            $("#container-warning-element").html(createWarningElement(Object.values(responseJSON.messages)[0]));
                        }
                        break;
                }
            },
        }).always(function (jqXHR, textStatus) {
            $("#username, #password, #captcha").prop("readonly", false);
            NProgress.done();
            setUserToken(jqXHR, false);
        });
    });

    $('#clearCacheReloadLink').off('click');
    $('#clearCacheReloadLink').on('click', function (e) {
        e.preventDefault();
        var localStorageKeys = Object.keys(localStorage),
            localStorageIdx = localStorageKeys.length;
        for (var i = 0; i < localStorageIdx; i++) {
            var keyName = localStorageKeys[i];
            localStorage.removeItem(keyName);
        }
        location.reload();
    });
});

function clearWarningElement() {
    $("#warning-element").find('button').click();
}

function showPassword(a) {
    var e = $(a).parent().find("input");
    "password" === e.attr("type")
        ? e.attr("type", "text")
        : e.attr("type", "password");

    "password" === e.attr("type")
        ? $(a).removeClass('ri-eye-off-line').addClass('ri-eye-line')
        : $(a).removeClass('ri-eye-line').addClass('ri-eye-off-line');
}
