String.prototype.contains = function(compare) {
    return this.toLowerCase().indexOf(compare.toLowerCase()) != -1;
}


var Flowsheet = function(tableId) {
    this.tableId = tableId;

    hideColumnHeaders = function() {
        jQuery('.ui-jqgrid-hdiv').hide();
        jQuery('.jqgroup td').attr('colspan', 3);
    }

    createSearchToolBar = function () {
        jQuery("#" + tableId).jqGrid('filterToolbar', {autosearch:true,searchOnEnter:true,multipleSearch:true });
    }

    this.render = function(entries) {
        if (!entries || entries.length == 0) {
            jQuery("#" + tableId).append(jQuery('<tr>')
                    .append(jQuery('<td>')
                    .text('There are currently no observations for this patient')));

            return;
        }

        jQuery("#" + tableId).jqGrid({
            data: entries,
            datatype: "local",
            height: 'auto',
            //            rowNum: -1,
            //            colNames:['Date','Name', 'Value','Range'],
            colModel:[
                {name:'date', width:150, sorttype:'date', formatter:'date', datefmt:'d/m/Y'},
                {name:'name', width:290},
                {name:'value',width:100,formatter:valueFormatter},
                {name:'low',width:100,formatter:rangeFormatter}
            ],
            sortname: 'date',
            altRows:true,
            altclass:'row_odd',
            grouping:true,
            width:700,
            groupingView : { groupField : ['date'], groupColumnShow : [false], groupText : ['<b>{0}</b>'], groupCollapse : true, groupOrder: ['desc'], groupCollapse : false },
            hoverrows:false,
            viewrecords: false, sortorder: "desc"


        });

        hideColumnHeaders();
        createSearchToolBar();

    }

    this.reload = function(entries) {
        jQuery("#" + tableId).clearGridData(false);
        jQuery("#" + tableId).jqGrid('setGridParam', {data:entries, rowNum:entries.length}).trigger("reloadGrid");
    }

    var rangeFormatter = function(cellvalue, options, rowObject) {
        if (rowObject.numeric && rowObject.numeric.hi && rowObject.numeric.low) {
            return "(" + rowObject.numeric.low + "-" + rowObject.numeric.hi + ")";
        }
        return " ";
    }

    var valueFormatter = function(cellvalue, options, rowObject) {
        if (rowObject.value) {
            if (rowObject.numeric) {
                return  rowObject.value + " " + rowObject.numeric.unit;
            }
            else {
                return rowObject.value;
            }
        }
        return " ";

    };
}

var FlowsheetData = function(data) {
    this.entries = data.flowsheet.entries;


    function createDateArray(entries) {
        var datearr = [];
        if (datearr.length == 0) {
            jQuery(entries).each(function(key, value) {
                datearr.push(value.date);
            })
        }
        return datearr;
    }

    function sortDateArray(dates) {
        dates.sort();
        return dates;
    }

    this.getDateRange = function() {
        var dates = createDateArray(this.entries);
        return sortDateArray(jQuery.unique(dates));
    };

    this.filterEntries = function(dateObj, classTypes) {
        var filteredEntries = [];
        var entries = this.entries;
        jQuery(entries).each(function(index, entry) {
            if ((entry.date >= dateObj.from) && (entry.date <= dateObj.to) && (jQuery.inArray(entry.classType, classTypes)) >= 0) {
                filteredEntries.push(entry);
            }
        });
        return filteredEntries;
    }

    this.search = function(query) {
        var filteredData = new Array();
        jQuery(this.entries).each(function(index, entry) {
            if (entry.name.contains(query) || entry.value.contains(query)) {
                filteredData.push(entry);
            }
        });

        return filteredData;
    }

    this.getUniqueClassTypes = function() {
        var uniqueClassTypes = [];
        var entries = this.entries;
        jQuery.each(entries, function() {
            if ((jQuery.inArray(this.classType, uniqueClassTypes)) < 0) {
                uniqueClassTypes.push(this.classType);
            }
        })
        return uniqueClassTypes;
    }
}

var DateRangeSlider = function(slider, filterHandler) {
    this.slider = slider;
    this.render = function(dateRange, dateFilterId) {
        if (!dateRange || dateRange.length <= 1) {
            jQuery(".layout-slider").html("No sufficient date to filter");
            return;
        }

        var dateRangeLength = (dateRange.length - 1);
        jQuery(this.slider).attr("value", "0;" + dateRangeLength);
        jQuery(this.slider).slider(
        {
            range : true,
            from : 0,
            to :dateRangeLength ,
            scale : [dateRange[0],dateRange[dateRangeLength]],
            onstatechange : function(value) {
                var from = value.split(";")[0];
                var to = value.split(";")[1];
                jQuery("#sliderInfoFrom").html(dateRange[from]);
                jQuery("#sliderInfoTo").html(dateRange[to]);
                filterHandler.call(null);
            },
            smooth: false,
            limits :false,
            step : 1,
            skin: "plastic"
        });

        jQuery('.jslider-value span').remove();
        jQuery("#sliderInfoFrom").html(dateRange[0]);
        jQuery("#sliderInfoTo").html(dateRange[dateRangeLength]);
    };

}

var ConceptClassTypeFilter = function(classTypes, classTypeListId,filterHandler) {
    this.classTypes = classTypes;
    this.classTypeListId = classTypeListId;

    this.render = function() {
        jQuery(this.classTypes).each(function(index, classType) {
            var classTypeContainer = jQuery("#"+classTypeListId);

            var inputElement = jQuery('<input>', {
                id: classType,
                name: 'classTypeCB',
                type: 'checkbox',
                value: classType,
                checked:true
            }).appendTo(classTypeContainer);

            classTypeContainer.append(classType);
        })

        jQuery("input[name='classTypeCB']").change(filterHandler);
    }

}

var DateObject = function(from, to) {
    this.from = from;
    this.to = to;
}

