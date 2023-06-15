/**
 * Rules: Apply sorting.
 * 1. add class on Table: sorting-apply
 * 2. add Class on header TR (Row): sorting-header
 * 3. add class on header TH (column): sorting-th
 * 4. If SrNo column is not on the first index(Column) of row add class on td sorting-sr-td
 * 5. add hidden field on page <input type="hidden" id="TableIstoggleTr" value="yes" />
 */

/**
 * Shorting all the table header data.
 */
$(function () {
    applySorting();
});
function applySorting() {
    var thIdCounter = 0;
    var tableIdCounter = 0;
    $(".sorting-apply").each(function () {
        var tempTableId = '';
        if ($(this).attr('id') === null || $(this).attr('id') === undefined || $(this).attr('id') === '') {
            tempTableId = 'generated-sorting-table-id-' + ++tableIdCounter;
            $(this).attr('id', tempTableId);
        } else {
            tempTableId = $(this).attr('id');
        }

        $('#' + tempTableId).find('.sorting-header .sorting-th').each(function () {
            var thText = $(this).text();
            var thId = $(this).attr('id');
            if (thId === null || thId === undefined || thId === '') {
                // Generate New th ID
                thId = 'generated-sorting-th-id-' + ++thIdCounter;
                $(this).attr('id', thId);
            }
            $(this).html(thText + '<span id="' + thId + 'Arrow" class="arrow "></span>');

            $(this).click(function () {
                sortTableHeader(tempTableId, this);
            });
        });
    });
}
/**
 * This function is sortTableHeader, shorting all type value like 
 * String,number and date as well as float value
 * @param {type} tableId means tableId
 * @param {type} $thisTH pass this
 * @returns {undefined}
 */
function sortTableHeader(tableId, $thisTH) {
    headerCount *= -1;
    var length = $($thisTH).prevAll().length;
    updateOrderArrow($thisTH);
    sortTable(headerCount, length, tableId);
    updateAllSrNo(tableId);
}

// if table have divrow then add a input field hidden TableIstoggleTr OR add in skipTableTr
var headerCount = 1;
function sortTable(f, length, tableId) {
    var rows = $('#' + tableId + ' tbody tr:not(.sorting-header)').get();
    var isToggleTr = false;
    if ($("#TableIstoggleTr").val() !== null && $("#TableIstoggleTr").val() !== undefined && $("#TableIstoggleTr").val() !== '') {
        rows = $('#' + tableId + ' tbody tr:not(.skipTableTr):not(.sorting-header)').get();
        isToggleTr = true;
    }
    try {
        var colspancount = 1;
        if ($('#' + tableId).get(0).hasAttribute("colspancount")) {
            colspancount = $('#' + tableId).attr("colspancount");
            if (isNotEmpty(colspancount)) {
                colspancount = parseInt(colspancount);
                colspancount = colspancount - 1;
            }
            length = length + (colspancount)
        }
    } catch (error) {
        console.log(error)
    }


    rows.sort(function (first, second) {
        var firstIndex = getValue(first, length);
        var secondIndex = getValue(second, length);
        if (firstIndex < secondIndex) {
            return -1 * f;
        }
        if (firstIndex > secondIndex) {
            return 1 * f;
        }
        return 0;
    });

    $.each(rows, function (index, row) {
        $('#' + tableId).children('tbody').append(row);
        if (isToggleTr) {
            var divRowId = row.id;
            divRowId = divRowId.replace("innerRow", 'divRow');
            $("#" + row.id).after($("#" + divRowId));
        }
    });
}

/**
 * get value of td
 * @param {type} elm
 * @param {type} length
 * @returns {Number}
 */
function getValue(elm, length) {
    // get Text, remove spaces and to lowercase
    var textNumDate = $(elm).children('td').eq(length).text().replace(/ /g, '').replace("N/A", '').replace("-", '-1').toLowerCase();
    if (isNumeric(textNumDate)) {
        textNumDate = textNumDate.replace(/%+/gm, "");
        textNumDate = textNumDate.replace(/[,\s]+|[,\s]+/g, "");
        textNumDate = parseInt(textNumDate);
    } else if (isDateTime(textNumDate)) {
        textNumDate = parseDateTime(textNumDate);
    }
    return textNumDate;
}

/**
 * 
 * @param {type} textNumDate
 * @returns {Boolean}
 */
function isNumeric(textNumDate) {
    textNumDate = textNumDate.replace(/%+/gm, "");
    textNumDate = textNumDate.replace(/[,\s]+|[,\s]+/g, "");
    return !isNaN(parseFloat(textNumDate)) && isFinite(textNumDate);
}


/**
 * this function will check all the data is dateformat.
 * @param {type} dateString
 * @returns {Boolean}
 * By Nitesh
 */
function isDateTime(dateString) {
    var d = new Date(dateString);
    if (isNaN(d.valueOf())) {
        var tempDate = dateString;
        // if found time in am pm formate 
        tempDate = tempDate.replace(/((2[0-9]|1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))+/g, "");
        // if time contains only hh:mm
        tempDate = tempDate.replace(/((2[0-9]|1[0-2]|0?[0-9]):([0-5][0-9]))+/g, "");
        var regex = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/gm;
        if (isNotEmpty(tempDate.match(regex))) {
            return true;
        }
    }
    return !isNaN(d.valueOf());
}

/**
 * Parese date or datetime
 * @param {type} dateString
 * @returns {Number}
 */
function parseDateTime(dateString) {
    //dd/mm/yyyy, or dd/mm/yy
    var dateArr = dateString.split("/");
    if (dateArr.length === 1) {
        return null;    //wrong format
    }
    //parse time after the year - separated by space
    var spacePos = dateArr[2].indexOf(" ");
    if (spacePos > 1) {
        var timeString = convertTimeformat(dateArr[2].substr(spacePos + 1));
        var timeArr = timeString.split(":");
        dateArr[2] = dateArr[2].substr(0, spacePos);
        if (timeArr.length === 2) {
            //minutes only
            return new Date(parseInt(dateArr[2]), parseInt(dateArr[1] - 1), parseInt(dateArr[0]), parseInt(timeArr[0]), parseInt(timeArr[1])).getTime();
        } else {
            //including seconds
            return new Date(parseInt(dateArr[2]), parseInt(dateArr[1] - 1), parseInt(dateArr[0]), parseInt(timeArr[0]), parseInt(timeArr[1]), parseInt(timeArr[2])).getTime();
        }
    } else {
        return new Date(parseInt(dateArr[2]), parseInt(dateArr[1] - 1), parseInt(dateArr[0])).getTime();
    }
}


/**
 * Convert time if exist.
 * @param {type} strTime
 * @returns {String}
 */
function convertTimeformat(strTime) {
    var hours = Number(strTime.match(/^(\d+)/)[1]);
    var minutes = Number(strTime.match(/:(\d+)/)[1]);
    var AMPM = strTime.match(/\s(.*)$/)[1];
    if (isNotEmpty(AMPM)) {
        if (AMPM.toLowerCase() === "pm" && hours < 12) {
            hours = hours + 12;
        }
        if (AMPM.toLowerCase() === "pm" && hours === 12) {
            hours = hours - 12;
        }
    }
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if (hours < 10) {
        sHours = "0" + sHours;
    }
    if (minutes < 10) {
        sMinutes = "0" + sMinutes;
    }
    return sHours + ":" + sMinutes + ":00";
}

/**
 * 
 * @param {type} $thisTH
 * @returns {undefined}
 */
function updateOrderArrow($thisTH) {
    var spanId = $thisTH.id + "Arrow";
    var valueClass;
    var title;
    // if sorting header is exist.
    if ($("#" + spanId).length > 0) {
        if ($('#' + spanId).hasClass('up')) {
            valueClass = 'down';
        } else if ($('#' + spanId).hasClass('down')) {
            valueClass = 'up';
        } else {
            valueClass = 'down';
        }
        $('.arrow').removeClass("up");
        $('.arrow').removeClass("down");
        $('#' + spanId).removeAttr("title");
        $('#' + spanId).addClass(valueClass);
        if (valueClass === 'down') {
            title = "Descending order";
        } else {
            title = "Ascending order";
        }
        $('#' + spanId).attr("title", title);
    }
}

function updateAllSrNo(tableId) {   
    var tableCountStart = 0;
    

    var srUpdated = false;
    $("#" + tableId + " tbody").find("tr").find("td:first").each(function (i) {
        var intVal = parseInt($(this).html());
        if (!isNaN(intVal)) {
            tableCountStart = tableCountStart + 1;
            $(this).html(tableCountStart);
            srUpdated = true;
        }
    });

    if (!srUpdated) {
        $("#" + tableId + " tbody").find(".sorting-sr-td").each(function (i) {
            tableCountStart = tableCountStart + 1;
            $(this).html(tableCountStart);
        });
    }
}
function isNotEmpty(txt) {
    if (txt === undefined) {
        return false;
    }
    if (txt === null || txt === 'null' || txt.toString().trim() === '') {
        return false;
    }
    return  true;
}
