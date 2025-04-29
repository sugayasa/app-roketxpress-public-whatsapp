if (loginRedirectFunc == null) {
    var loginRedirectFunc = function () {
        let dataSend = { username: username };
        $(document).ready(function () {
            let token = getUserToken();
            $.ajax({
                type: "POST",
                url: API_URL + "/access/check",
                contentType: "application/json",
                dataType: "json",
                data: mergeDataSend(dataSend),
                xhrFields: { withCredentials: true },
                headers: { Authorization: "Bearer " + token },
                complete: function (jqXHR, textStatus) {
                    switch (jqXHR.status) {
                        case 200:
                            localStorage.setItem("redirectDestinationMenu", destinationMenu);
                            localStorage.setItem("redirectParameters", parameters);
                            window.location.replace(MAIN_URL);
                            break;
                        default:
                            window.location.replace(MAIN_URL + "/logoutPage");
                            break;
                    }
                }
            });
        });
    }
}

loginRedirectFunc();