var MAIN_URL = window.location.origin,
    API_URL = MAIN_URL,
    ASSET_IMG_URL = MAIN_URL + "/img/",
    devStatus = "development",
    urlLogout = "",
    arrMediaSound = [
        "message_sent.mp3",
        "message_received_active.mp3",
        "message_received_background.mp3"
    ];

function clearUserToken() {
    localStorage.removeItem("userToken");
}

function getUserToken(logout = false) {
    if (logout) return "";
    if (
        localStorage.getItem("userToken") === null ||
        localStorage.getItem("userToken") === undefined
    ) {
        return "";
    }

    return localStorage.getItem("userToken");
}

function getHardwareID() {
    let hardwareID = localStorage.getItem("hardwareID");
    if (hardwareID !== null && hardwareID !== undefined) {
        return hardwareID.replaceAll(/[^a-zA-Z0-9]/g, "");
    }

    var ubid = require('ubid');
    ubid.get(function (error, signatureData) {
        if (error) return hardwareID;
        hardwareID = signatureData.canvas.signature.toString() + "" + moment().unix();
        localStorage.setItem("hardwareID", hardwareID);
    });

    return hardwareID.replaceAll(/[^a-zA-Z0-9]/g, "");
}

function getUserTimeZoneOffset() {
    let timezoneOffset = moment.tz.guess();
    if (timezoneOffset === "UTC") {
        timezoneOffset = moment.tz.names()[0];
    }
    return timezoneOffset;
}

function mergeDataSend(dataMerge = null) {
    var hardwareID = getHardwareID(),
        userTimeZoneOffset = getUserTimeZoneOffset(),
        defaultDataSend = { hardwareID: hardwareID, userTimeZoneOffset: userTimeZoneOffset },
        dataSend =
            dataMerge == null
                ? $.extend({}, defaultDataSend)
                : $.extend({}, dataMerge, defaultDataSend);
    return JSON.stringify(dataSend);
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split("&"),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split("=");

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined
                ? true
                : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};
