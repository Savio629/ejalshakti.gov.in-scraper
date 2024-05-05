function numberWithCommas(number) {
    x = number;
    if ((x == "") || (x == "0")) {
        return number;
    }
    x = x.toString();
    var afterPoint = '';
    if (x.indexOf('.') > 0)
        afterPoint = x.substring(x.indexOf('.'), x.length);
    if (!isNaN(x) && x < 0) {
        return number;
    }
    x = Math.floor(x);
    x = x.toString();

    if (x == "NaN") {
        return number;
    }
    else {
        var lastThree = x.substring(x.length - 3);
        var otherNumbers = x.substring(0, x.length - 3);
        if (otherNumbers != '')
            lastThree = ',' + lastThree;
        var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
        return res;
    }
};