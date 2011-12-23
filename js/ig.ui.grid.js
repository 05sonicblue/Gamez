/*
 * Infragistics.Web.ClientUI Util functions  11.1.20111.1000
 *
 * Copyright (c) 2011 Infragistics Inc.
 * <Licensing info>
 * util functions that extend the jQuery  namespace 
 * if something is not already available in jQuery, please add it here. 
 *
 * http://www.infragistics.com/
 *
 * Depends on:
 *  jquery-1.4.4.js
 *
 */
  
 /* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed. 
 */
// Inspired by base2 and Prototype
/*global xyz */
/*global Class */
(function () {

    var initializing = false, fnTest = /xyz/.test(function () { xyz(); }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    this.Class = function () {};
	  
	// Create a new Class that inherits from this class
	Class.extend = function (prop) {
		var _super = this.prototype,
			prototype,
			name;
		
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		prototype = new this();
		initializing = false;
		
		function makeFn(name, fn) {
			return function () {
				var tmp = this._super,
					ret;
				
				// Add a new ._super() method that is the same method
				// but on the super-class
				this._super = _super[name];
				
				// The method only need to be bound temporarily, so we
				// remove it when we're done executing
				ret = fn.apply(this, arguments);        
				this._super = tmp;
				
				return ret;
			};
		}
		
		// Copy the properties over onto the new prototype
		for (name in prop) {
			if (prop.hasOwnProperty(name)) {
				// Check if we're overwriting an existing function
				prototype[name] = typeof prop[name] === "function" && 
					typeof _super[name] === "function" && fnTest.test(prop[name]) ?
					makeFn(name, prop[name]) : prop[name];
			}
		}
		
		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if (!initializing && this.init) {
				this.init.apply(this, arguments);
			}
		}
		
		// Populate our constructed prototype object
		Class.prototype = prototype;
		
		// Enforce the constructor to be what we expect
		Class.constructor = Class;

		// And make this class extendable
		Class.extend = arguments.callee;
		
		return Class;
    };	
}());

/*global jQuery*/
(function ($) {
	$.fn.startsWith = function (str) {
		return !this[0].innerHTML.indexOf(str);
	};

	$.ig = $.ig || {};

    $.ajaxQueue = function (queueName, options) {
        var callback;
//        var s = $('#status');
//        s.html(options.url + '<br />' + s.html());

        if (typeof document.ajaxQueue === "undefined") {
            document.ajaxQueue = { queue: {} };
		}
        if (typeof document.ajaxQueue.queue[queueName] === "undefined") {
            document.ajaxQueue.queue[queueName] = [];
		}

        if (typeof options === "undefined") {
            return;
		}

        callback = options.complete; //original callback

        //overwrite complete
        options.complete = function (request, status) {
            document.ajaxQueue.queue[queueName].shift(); //remove the first element from the array
            //we should check if original callbak is defined in options
            if (typeof callback !== "undefined") {
                callback(request, status);
			}

            if (document.ajaxQueue.queue[queueName].length > 0) {
                $.ajax(document.ajaxQueue.queue[queueName][0]);
			}
        };

        document.ajaxQueue.queue[queueName].push(options);
        if (document.ajaxQueue.queue[queueName].length === 1) {
            $.ajax(document.ajaxQueue.queue[queueName][0]);
		}
    };

	$.ig.formatter = function (val, type, format) {
		var min, y, h, m, s, ms, am, e, pattern, len, n, dot, gr, gr0, grps, curS, percS, cur, perc, prefix, i, d = val && val.getTime, reg = $.ig.regional.defaults;
		if (format === 'bool') {
			return val ? 'ui-icon-check' : 'ui-iggrid-checkboxempty';
		}
		if (!val && val !== 0 && val !== false) {
			return '&nbsp;';
		}
		if (type === 'date' || d) {
			if (!val) {
				return '&nbsp;';
			}
			if (!d) {
				return val;
			}
			if (!(pattern = reg[(format && format !== 'null' && format !== 'undefined') ? format + 'Pattern' : 'datePattern'])) {
				pattern = format;
			}
			y = val.getFullYear();
			m = val.getMonth() + 1;
			d = val.getDate();
			h = val.getHours();
			min = val.getMinutes();
			s = val.getSeconds();
			ms = val.getMilliseconds();
			// remove MMMM, MMM, dddd, ddd, tt, t
			pattern = pattern.replace('MMMM', '\x01').replace('MMM', '\x02').replace('dddd', '\x03').replace('ddd', '\x04');
			if (pattern.indexOf('t') >= 0) {
				if (!(am = (h >= 12) ? reg.pm : reg.am)) {
					am = ' ';
				}
				if (pattern.indexOf('tt') >= 0) {
					pattern = pattern.replace('tt', 't');
				} else if (am.length > 1) {
					am = am.substring(0, 1);
				}
				pattern = pattern.replace('t', '\x05');
			}
			if (pattern.indexOf('h') >= 0 && h > 12) {
				h -= 12;
			}
			pattern = pattern.replace(/H/g, 'h');
			pattern = pattern.replace('yyyy', y).replace('yy', ((y = y % 100) < 10) ? '0' + y : y).replace('y', y % 100).replace('MM', (m < 10) ? '0' + m : m).replace('M', m);
			pattern = pattern.replace('dd', (d < 10) ? '0' + d : d).replace('d', d);
			pattern = pattern.replace('hh', (h < 10) ? '0' + h : h).replace('h', h).replace('mm', (min < 10) ? '0' + min : min).replace('m', min).replace('ss', (s < 10) ? '0' + s : s).replace('s', s);
			pattern = pattern.replace('fff', (ms < 10) ? '00' + ms : ((ms < 100) ? '0' + ms : ms)).replace('ff', ((ms = Math.round(ms / 10)) < 10) ? '0' + ms : ms).replace('f', Math.round(ms / 100));
			pattern = pattern.replace('\x01', reg.monthNames[m - 1]).replace('\x02', reg.monthNamesShort[m - 1]).replace('\x05', am);
			pattern = pattern.replace('\x03', reg.dayNames[val.getDay()]).replace('\x04', reg.dayNamesShort[val.getDay()]);
			return pattern;
		}
		if (!(d = format === 'double')) {
			if (!(cur = format === (curS = 'currency'))) {
				if (!(perc = format === (percS = 'percent'))) {
					i = format === 'int';
				}
			}
		}
		n = typeof val === 'number';
		if (d || n || i || cur || perc || type === 'number') {
			if (!n) {
				// keep only e, E, -, +, . and digits
				val = parseFloat(val.replace('(', '-').replace(/[^0-9\-eE\.\+]/gm, ''));
			}
			if (isNaN(val)) {
				return '&nbsp;';
			}
			prefix = cur ? curS : (perc ? percS : 'numeric');
			if (!(pattern = reg[prefix + ((val < 0) ? 'Negative' : 'Positive') + 'Pattern'])) {
				pattern = 'n';
			}
			len = format ? format.length : 0;
			// calculate maximum number of decimals
			if (len > 0 && ((s = format.charAt(0)) === '0' || s === '#')) {
				min = m = 0;
				dot = format.indexOf('.');
				if (dot > 0) {
					m = len - 1 - dot;
					while (++dot < len) {
						if (format.charAt(dot) !== '0') {
							break;
						}
						min++;
					}
				}
			} else {
				if (!(min = reg[prefix + 'MinDecimals'])) {
					min = 0;
				}
				if (d) {
					m = 999;
				} else {
					m = reg[prefix + 'MaxDecimals'];
					m = (m && !i) ? m : 0;
				}
			}
			if (val < 0) {
				val = -val;
			}
			val = (m === 999) ? val.toString(10) : val.toFixed(m);
			if ((i = val.indexOf('E')) < 0) {
				i = val.indexOf('e');
			}
			// cut-off E-power (e)
			e = '';
			if (i > 0) {
				e = val.substring(i);
				val = val.substring(0, i);
			}
			dot = val.indexOf('.');
			len = val.length;
			i = 0;
			// remove trailing 0s
			while (dot > 0 && m > min + i && val.charAt(len - 1 - i) === '0') {
				i++;
			}
			if (i > 0) {
				val = val.substring(0, len -= i);
			}
			// remove trailing .
			if (dot === len - 1) {
				val = val.substring(0, dot);
			}
			if (dot > 0) {
				len = dot;
			}
			// replace decimal separator
			s = reg[prefix + 'DecimalSeparator'];
			if (s) {
				val = val.replace('.', s);
			}
			// insert group separators
			s = reg[prefix + 'GroupSeparator'];
			grps = s ? reg[prefix + 'Groups'] : '';
			gr = gr0 = (grps.length > 0) ? grps[i = 0] : 0;
			while (gr > 0 && --len > 0) {
				if (--gr === 0) {
					val = val.substring(0, len) + s + val.substring(len);
					if (!(gr = grps[++i]) || gr < 1) {
						gr = gr0;
					} else {
						gr0 = gr;
					}
				}
			}
			// replace 'n' by number, '$' by symbol and '-' by negative sign
			if (!(s = reg[prefix + 'Symbol'])) {
				s = '';
			}
			return pattern.replace('-', reg.negativeSign).replace('n', val + e).replace('$', s);
		}
		if (format) {
			if (format.indexOf(s = '{0}') >= 0) {
				return format.replace(s, val);
			}
			if (format.indexOf(s = '[0]') >= 0) {
				return format.replace(s, val);
			}
		}
		return (val || val === 0) ? val : '&nbsp;';
	};
	$.ig._regional = {
		monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		am: 'AM',
		pm: 'PM',
		datePattern: 'M/d/yyyy',
		dateLongPattern: 'dddd, MMMM dd, yyyy',
		dateTimePattern: 'M/d/yyyy h:mm tt',
		timePattern: 'h:mm tt',
		timeLongPattern: 'h:mm:ss tt',
		negativeSign: '-',
		numericNegativePattern: '-$n',
		numericDecimalSeparator: '.',
		numericGroupSeparator: ',',
		numericGroups: [3],
		numericMaxDecimals: 2,
		numericMinDecimals: 0,
		currencyPositivePattern: '$n',
		currencyNegativePattern: '$(n)',
		currencySymbol: '$',
		currencyDecimalSeparator: '.',
		currencyGroupSeparator: ',',
		currencyGroups: [3],
		currencyMaxDecimals: 2,
		currencyMinDecimals: 2,
		percentPositivePattern: 'n$',
		percentNegativePattern: '-n$',
		percentSymbol: '%',
		percentDecimalSeparator: '.',
		percentGroupSeparator: ',',
		percentGroups: [3],
		percentDisplayFactor: 100,
		percentMaxDecimals: 2,
		percentMinDecimals: 2
	};
	$.ig.regional = {
		defaults: $.ig._regional
	};
	$.ig.setRegionalDefault = function (regional) {
		if ($.ui.igEditor) {
			$.ui.igEditor.setDefaultCulture(regional);
		} else {
			$.ig.regional.defaults = $.extend($.ig._regional, (typeof regional === 'string') ? $.ig.regional[regional] : regional);
		}
	};
}(jQuery));

String.prototype.startsWith = function (s) {
	return this.indexOf(s) === 0;
};

String.prototype.endsWith = function (s) {
	var offset = this.length - s.length;
	return offset >= 0 && this.lastIndexOf(s) === offset;
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
/* English, US */
(function ($) {
	$.ig.regional['en-US'] = {
		monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		am: 'AM',
		pm: 'PM',
		datePattern: 'M/d/yyyy',
		dateLongPattern: 'dddd, MMMM dd, yyyy',
		dateTimePattern: 'M/d/yyyy h:mm tt',
		timePattern: 'h:mm tt',
		timeLongPattern: 'h:mm:ss tt',
		negativeSign: '-',
		numericNegativePattern: '-$n',
		numericDecimalSeparator: '.',
		numericGroupSeparator: ',',
		numericGroups: [3],
		numericMaxDecimals: 2,
		numericMinDecimals: 0,
		currencyPositivePattern: '$n',
		currencyNegativePattern: '$(n)',
		currencySymbol: '$',
		currencyDecimalSeparator: '.',
		currencyGroupSeparator: ',',
		currencyGroups: [3],
		currencyMaxDecimals: 2,
		currencyMinDecimals: 2,
		percentPositivePattern: 'n$',
		percentNegativePattern: '-n$',
		percentSymbol: '%',
		percentDecimalSeparator: '.',
		percentGroupSeparator: ',',
		percentGroups: [3],
		percentDisplayFactor: 100,
		percentMaxDecimals: 2,
		percentMinDecimals: 2
	};
	$.ig.setRegionalDefault('en-US');
}(jQuery));

(function ($) {

	$.ig = $.ig || {};
	$.ig.Grid = $.ig.Grid || {};
	
	$.extend( $.ig.Grid , {
	
		locale : {
			noSuchWidget: "No such widget loaded: ",
			autoGenerateColumnsNoRecords: "autoGenerateColumns is enabled, but there are no records in the data source in order to determine the columns",
			optionChangeNotSupported: "Changing the following option after the igGrid has been created is not supported:",
			optionChangeNotScrollingGrid: "The following option cannot be changed after the grid is created because your initial grid is not scrolling and full re-rendering is required:",
			noPrimaryKeyDefined: "There is no primary key defined for the grid. In order to use features such as Grid Editing, you will need to define a primary key.",
			indexOutOfRange: "The row index you have specified is out of range.",
			noSuchColumnDefined: "The specified column key does not match any of the defined grid columns.",
			columnIndexOutOfRange: "The specified column index is out of range.",
			recordNotFound: "The record with the specified id could not be found in the data view:",
			columnNotFound: "No column was found matching key:",
			colPrefix: "Column ",
            columnVirtualizationRequiresWidth: "You have virtualization / columnVirtualization set to true, but no width could be inferred for grid columns. You should set one of a) grid width, b) defaultColumnWidth, c) define width for each column",
			noColumnsButAutoGenerateTrue: "You have autoGenerateColumns set to false, but there are no columns defined in the grid. Please set autoGenerateColumns to true, or specify columns manually"
		}
	});

}(jQuery));
(function ($) {

	$.ig = $.ig || {};
	$.ig.GridFiltering = $.ig.GridFiltering || {};
	
	$.extend( $.ig.GridFiltering , {
	
		locale : { 
			startsWithNullText: "Starts with...",
			endsWithNullText: "Ends with...",
			containsNullText: "Contains...",
			doesNotContainNullText: "Does not contain...",
			equalsNullText: "Equals...",
			doesNotEqualNullText: "Does not equal...",
			greaterThanNullText: "Greater than...",
			lessThanNullText: "Less than...",
			greaterThanOrEqualToNullText: "Greater than or equal to...",
			lessThanOrEqualToNullText: "Less than or equal to...",
			onNullText: "On...",
			notOnNullText: "Not on...",
			emptyNullText: "Empty",
			notEmptyNullText: "Not empty",
			nullNullText: "Null",
			notNullNullText: "Not null",
			startsWithLabel: "Starts with",
			endsWithLabel: "Ends with",
			containsLabel: "Contains",
			doesNotContainLabel: "Does not contain",
			equalsLabel: "Equals",
			doesNotEqualLabel: "Does not equal",
			greaterThanLabel: "Greater than",
			lessThanLabel: "Less than",
			greaterThanOrEqualToLabel: "Greater than or equal to",
			lessThanOrEqualToLabel: "Less than or equal to",
			trueLabel: "True",
			falseLabel: "False",
			afterLabel: "After",
			beforeLabel: "Before",
			todayLabel: "Today",
			yesterdayLabel: "Yesterday",
			thisMonthLabel: "This month",
			lastMonthLabel: "Last month",
			nextMonthLabel: "Next month",
			thisYearLabel: "This year",
			lastYearLabel: "Last year",
			nextYearLabel: "Next year",
			clearLabel: "Clear Filter",
			noFilterLabel: "No",
			onLabel: "On",
			notOnLabel: "Not on",
			advancedButtonLabel: "Advanced",
			filterDialogCaptionLabel: "ADVANCED SEARCH",
			filterDialogConditionLabel1: "Show records matching ",
			filterDialogConditionLabel2: " of the following criteria",
			filterDialogOkLabel: "Search",
			filterDialogCancelLabel: "Cancel",
			filterDialogAnyLabel: "ANY",
			filterDialogAllLabel: "ALL",
			filterDialogAddLabel: "Add",
			filterDialogErrorLabel: "Maximum filters count exceeded.",
			filterSummaryTitleLabel: "Search results",
			filterSummaryTemplate: "${matches} matching records",
			filterDialogClearAllLabel: "Clear ALL",
			tooltipTemplate: "${condition} filter applied",
			virtualizationSimpleFilteringNotAllowed: "When horizontal virtualization is enabled, simple filtering (filter row) is not supported. Please set mode to 'advanced' and/or do not enable advancedModeEditorsVisible"
		}
	});

}(jQuery));
(function ($) {

	$.ig = $.ig || {};
	$.ig.GridPaging = $.ig.GridPaging || {};
	
	$.extend( $.ig.GridPaging , {
	
		locale : {
			pageSizeDropDownLabel: "Show ",
			pageSizeDropDownTrailingLabel: "records",
			//pageSizeDropDownTemplate: "Show ${dropdown} records",
			nextPageLabelText: "next",
			prevPageLabelText: "prev",
			firstPageLabelText: "",
			lastPageLabelText: "",
			currentPageDropDownLeadingLabel: "Pg",
			currentPageDropDownTrailingLabel: "of ${count}",
			//currentPageDropDownTemplate: "Pg ${dropdown} of ${count}",
			currentPageDropDownTooltip: "Choose page index",
			pageSizeDropDownTooltip: "Choose number of records per page",
			pagerRecordsLabelTooltip: "Current records range",
			prevPageTooltip: "go to the previous page",
			nextPageTooltip: "go to the next page",
			firstPageTooltip: "go to the first page",
			lastPageTooltip: "go to the last page",
			pageTooltipFormat: "page ${index}",
			pagerRecordsLabelTemplate: "${startRecord} - ${endRecord} of ${recordCount} records"
		}
	});

}(jQuery));
(function ($) {

	$.ig = $.ig || {};
	$.ig.GridSelection = $.ig.GridSelection || {};
	
	$.extend( $.ig.GridSelection , {
	
		locale : {
		
		}
	});

}(jQuery));
(function ($) {

	$.ig = $.ig || {};
	$.ig.GridSorting = $.ig.GridSorting || {};
	
	$.extend( $.ig.GridSorting , {
	
		locale : {
			sortedColumnTooltipFormat: 'sorted ${direction}',
			unsortedColumnTooltip: 'click to sort column',
			ascending: 'ascending',
			descending: 'descending'
		}
	});

}(jQuery));
/*
 * Infragistics.Web.ClientUI Data Binding Plugin 11.1.20111.1014
 *
 * Copyright (c) 2011 Infragistics Inc.
 * <Licensing info>
 * igDataSource provides the following functionality:
 * - read and parse local XML , JSON , and HTML data
 * - normalize / transform the above data according to a schema
 * - data type conversion (date, string, number, etc.)
 * - define relationships between two and more flat data sources - with primary/foreign keys, etc
 * - build URL params for requests that get remote data 
 * - in case of scenarios such as paging, understand and prase the response - expect that it's in a predefined format that can be additionall configured by the developer
 * - get data from WCF services  
 * - ability to combine local with remote functionality  
 * - queueing AJAX requests
 *	paging,filtering (searching), and sorting functionality that are control-independent are also implemented here
 *	the idea of this code is to serve as a data-source abstraction layer (client-side data source control)
 *	that may well be used by all other client-side controls , such as dropdown, tree, menu, etc. 
 *
 * http://www.infragistics.com/ 
 *
 * Depends on:
 *  jquery-1.4.4.js
 *	ig.util.js
 *
 */
/*global jQuery, Class, window, ActiveXObject, DOMParser, XPathResult */
(function ($) {

	$.ig = $.ig || {};
	
	/* A.T. 7 Feb 2011 - Usability review changes */
	/*
	$.ig.Constants = $.ig.Constants || {};
	
	$.ig.Constants.SortDirection = {
		None: 'none',
		Ascending: 'asc',
		Descending: 'desc'
	};

	$.ig.Constants.OpType = {
		Remote: 0,
		Local: 1
	};

	$.ig.Constants.SortMode = {
		Single: 0,
		Multi: 1
	};
	
	$.ig.Constants.FilterCondition = {
		StartsWith: "StartsWith",
		EndsWith: "EndsWith",
		Contains: "Contains",
		DoesNotContain: "DoesNotContain",
		Equals: "Equals",
		DoesNotEqual: "DoesNotEqual",
		GreaterThan: "GreaterThan",
		LessThan: "LessThan",
		GreaterThanOrEqualTo: "GreaterThanOrEqualTo",
		LessThanOrEqualTo: "LessThanOrEqualTo",
		True: "True",
		False: "False",
		After: "After",
		Before: "Before",
		Today: "Today",
		Yesterday: "Yesterday",
		ThisMonth: "ThisMonth",
		LastMonth: "LastMonth",
		NextMonth: "NextMonth",
		ThisYear: "ThisYear",
		LastYear: "LastYear",
		NextYear: "NextYear",
		On: "On",
		NotOn: "NotOn",
		Null: "Null",
		NotNull: "NotNull",
		Empty: "Empty",
		NotEmpty: "NotEmpty"
		//ThisQuarter: "ThisQuarter",
		//LastQuarter: "LastQuarter",
		//NextQuarter: "NextQuarter"
	};

	$.ig.Constants.DataSourceType = {
		Function : 0,
		Array : 1,
		HtmlTableString: 2, // the data source could be either the id of the element, a string starting with <table>, or a DOM object that is of nodeType== "TABLE" 
		HtmlTableId: 3,
		HtmlTableDOM: 4,
		JSON : 5, // json data, could be string or object 
		XML : 6, // xml data - could be string or object 
		Invalid: 7, // when data source is se to a boolean, number or date
		Unknown: 8, // when data source is a string or object 
		RemoteUrl: 9,
		Empty: 10
	};
	*/
	$.ig.DataSource = $.ig.DataSource || Class.extend({
		/* The Infragistics Data Source client-side component is implemented as a class, and has support for paging, sorting, and filtering
			it supports binding to various types of data sources including JSON, XML, HTML Table, WCF/REST services, JSONP, JSONP and OData combined, etc. 
		*/
		settings: {
			/* type="string" setting this is only necessary when the data source is set to a table in string format. we need to create an invisible dummy data container in the body and append the table data to it */
			id: 'ds',
			/* type="string" this is the property in the dataView where actual resulting records will be put. (So the dataView will not be array but an object if this is defined), after the potential data source transformation */
			outputResultsName: null,
			/* type="function" callback function to call when data binding is complete */
			callback: null,
			/* type="object" object on which to invoke the callback function */
			callee: null,
			/* type="object" this is the normalized (transformed) resulting data, after it's fetched from the data source */
			data: [], 
			/* type="object" this is the source of data - non normalized. Can be an array, can be reference to some JSON object, can be a DOM element for a HTML TABLE, or a function */
			dataSource: null,
			//dataSourceUrl: null, // we don't even need the dataSourceUrl, it can be set in the dataSource
			/* type="object" client-side dataBinding event. Can be a string pointing to a function name, or an object pointing to a function */
			dataBinding: null,
			/* type="object" client-side dataBound event. Can be a string pointing to a function name, or an object pointing to a function */
			dataBound: null,
			/* type="json|xml|unknown|array|function|htmlTableString|htmlTableId|htmlTableDom|invalid|remoteUrl|empty" Type of the data source 
				json type="string" Specifies that the data source is an already evaluated JSON (JavaScript object/array) or a string that can be evaluated to JSON \r\n
				xml type="string" Specifies that the data source is a XML Document object or a string that can be evaluated to XML \r\n
				unknown type="string" Specifies that the data source is of unknown type. In that case it will be analyzed and automatically detected if possible \r\n
				array type="string" Specifies that the data source is a simple array of objects. \r\n
				function type="string" Specifies that the data source points to a function. During data binding the function will be called and the result will be assumed to be an array of objects \r\n
				htmlTableString type="string" Specifies that the data source points to a string that represents a HTML table \r\n
				htmlTableId type="string" Specifies that the data source points to an ID of a HTML Table element that's loaded on the page \r\n
				htmlTableDom type="string" the data source points to a DOM object that is of TABLE type \r\n
				invalid type="string" set whenever data source is analyzed (in case its type is unknown) and the type cannot be detected \r\n
				remoteUrl type="string" specifies that the data source points to a remote URL, from which data will be retrieved using an AJAX call ($.ajax) \r\n
				empty type="string"
			*/
			type: "unknown",
			/* type="object" a schema object that defines which fields from the data to bind to */
			schema: null,
			/* type="string" primary key */
			primaryKey: null,
			/* type="string" property in the response which specifies the total number of records in the backend (this is needed for paging) */
			responseTotalRecCountKey: null,
			/* type="string" property in the response which specifies where the data records array will be held (if the response is wrapped) */
			responseDataKey: null,
			/* type="json|xml|html|script|jsonp|text" response type when a URL is set as the data source (can be json, xml, text, etc.). See http://api.jquery.com/jQuery.ajax/ => dataType */
			responseDataType: null,
			/* type="string" content type of the response. See http://api.jquery.com/jQuery.ajax/ => contentType */
			responseContentType: null,
			/* type="bool" if set to false will disable transformations on schema, even if it is defined locally in the javascript code */
			localSchemaTransform: true,
			/* type="object" event that is fired before URL parameters are encoded. Can point to a function name or the function object itself */
			urlParamsEncoding: null,
			/* type="object" event that is fired after URL parameters are encoded (When a remote request is done). Can point to a function name or the function object itself */
			urlParamsEncoded: null,
			/* Settings related to built-in paging functionality */
			paging: {
				/* type="bool" paging is not enabled by default */
				enabled: false,
				/* type="remote|local" type for the paging operation - if local, data is paged locally, if remote - a remote request is done and URL params encoded */
				type: "remote",
				/* type="number" number of records on each page */
				pageSize: 5,
				/* type="string" denotes the name of the encoded URL parameter that will state what is the currently requested page size */
				pageSizeUrlKey: null, 
				/* type="string" denotes the name of the encoded URL parameter that will state what is the currently requested page index */
				pageIndexUrlKey: null,
				/* type="number" current page index */
				pageIndex: 0
			},
			/* Settings related to built-in filtering functionality */
			filtering: {
				/* type="remote|local" filtering type. if set to local the data will be filtered automatically locally. If remote, parameters will be encoded and it's up to the backend to interpred them from the response.\r\n */
				type: "remote",
				/* type="bool" enables or disables case sensitive filtering on the data. Works only for local filtering */
				caseSensitive: false,
				/* type="bool" if the type of paging/sorting/filtering is local and applyToAllData is true, filtering will be performed on the whole data source that's present locally, otherwise only on the current dataView. if type is remote, this setting doesn't have any effect. */
				applyToAllData: true,
				/* type="object" Can point to either a string or a function object. The parameters that are passed are 1) the data array to be filtered, 2) the filtering expression definitions. should return an array of the filtered data */
				customFunc: null,
				/* type="string" url key that will be encoded in the request if remote filtering is performed. Default value of null implies OData-style URL encoding. Please see http://www.odata.org/developers/protocols/uri-conventions for details */
				filterExprUrlKey: null,
				/* type="string" url key that will be encoded in the request, specifying if the filtering logic will be AND or OR */
				filterLogicUrlKey: "filterLogic",
				/* type="object" a list of expression objects, containing the following key-value pairs: fieldName, expression (search string), condition , and logic (AND/OR) */
				expressions: [],
				/* type="string" an "SQL-like' encoded expressions string. takes precedence over "expressions". Example: col2 > 100; col2 LIKE %test% */
				exprString: ''
			},
			/* Settings related to built-in sorting functionality */
			sorting: {
				/* type="none|asc|desc" Sorting direction */
				defaultDirection: "none", 
				/* type="object" when defaultDirection is different than "none", and defaultFields is specified, data will be initially sorted accordingly, directly after dataBind() */
				defaultFields: [],
				/* type="bool" if the sorting type is local and applyToAllData is true, sorting will be performed on the whole data source that's present locally, otherwise only on the current dataView. if sorting type is remote, this setting doesn't have any effect. */
				applyToAllData: true,
				/* type="object"  custom sorting function that can point to either a string or a function object. When the function is called, the following arguments are passed: data array, fields (array of field definitions) , direction ("asc" or "desc"). The function should return a sorted data array */
				customFunc: null,
				/* type="object" custom comparison sorting function. Accepts two values and returns a value 0 indicating that values are equal, 1 indicating that val1 > val2 and -1 indicating that val1 < val2 */
				compareFunc: null,
				/* type="object" custom data value conversion function. Accepts a value and should return the converted value */
				customConvertFunc: null,
				/* type="remote|local" specifies whether sorting will be applied locally or remotely (via a remote request) */
				type: "remote",
				/* type="bool" Specifies if sorting will be case sentsitive or not */
				caseSensitive: false,
				/* type="string" URL param name which specifies how sorting expressions will be encoded in the URL. Default is null and uses OData conventions */
				sortUrlKey: null,
				/* type="string" URL param value for ascending type of sorting. Default is null and uses OData conventions */
				sortUrlAscValueKey: null,
				/* type="string" URL param value for descending type of sorting. Default is null and uses OData conventions */
				sortUrlDescValueKey: null,
				/* type="object" a list of sorting expressions , consisting of the following keys (and their respective values): fieldName and direction */
				expressions: [],
				/* type="string" takes precedence over experssions, an "SQL-like" encoded expressions string  : see sort(). Example col2 > 100 ORDER BY asc */
				exprString: ''
			},
			/* type="object" a list of field definitions specifying the schema of the data source. */
			fields: [],
			/* type="bool" if true, will serialize the transaction log of updated values - if any - whenever commit is performed via a remote request. */
			serializeTransactionLog: true,
			/* type="bool" if auto commit is true, data will be automatically commited to the data source, once a value or a batch of values are updated via saveChanges() */
			autoCommit: false,
			/* type="string" specifies an update remote URL, to which an AJAX request will be made as soon as saveChages() is called. */
			updateUrl: null 
		},
		init: function (options) {
			// merge defaults with passed-in values 
			if (options) { 
				this.settings = $.extend(true, {}, $.ig.DataSource.prototype.settings, options);
			}		
			// initialize local vars
			//this._pageIndex = 0;
			this.settings.paging.pageIndex = 0;
			this._isBound = false;
			this._url = null;
			this._dsCallback = null;
			this._data = []; // _data may be different than _dataView only when the whole data source is present locally, but we are performing sorting or filtering or paging on it, 
			this._dataView = []; // therefore the dataView will contain only a subset of the *local* data. 
									// Same applies when data is parsed from a table. With remote fetching, everything is in _data
			if (this.settings.type === "unknown") {
				this._runtimeType = this.analyzeDataSource();
			} else {
				this._runtimeType = this.settings.type;
			}
			
			this._parser = new $.ig.TypeParser();
			this._schema = null;
			// used only when doing remote paging, sorting and filtering, 
			// to determine the request type in order to know whether to parse metadata fields
			// such as total record count - from the response
			this._isSortingReq = false;
			this._isFilteringReq = false;
			this._isPagingReq = false;
			this._recCount = 0;
			this._hasCount = false;
			this._initSchema();
			this._filteredDataView = [];
			this._transactionLog = []; // transactions support & batch updating 
			this._accumulatedTransactionLog = []; // this is the transaction log that will be serialized and posted to the server, if the option "serializeTransactionLog" is true (MVC scenarios!)
			return this;
		},
		_initSchema: function () {
			// performance optimization
			//if (this.settings.schema && this.settings.localSchemaTransform) {
			if (this.settings.schema) {
				if (this.settings.schema instanceof $.ig.DataSchema) {
					this._schema = this.settings.schema;
				} else {
					// two cases: the developer has explicitly set a type, and 2) he didn't - which means we need to analyze the data source at runtime 
					if (this.settings.type !== "unknown") {
						this._schema = new $.ig.DataSchema(this.settings.type, this.settings.schema);
					} else {
						this._schema = new $.ig.DataSchema(this._runtimeType, this.settings.schema);
					}
				}
			}
		},
		fields: function (fields) {
			/* Sets a list of fields to the data source. If no parameter is specified, just returns the already existing list of fields
				paramType="object" optional="true" a field has the following format: {key: 'fieldKey', dataType: 'string/number/date' }
				returnType="object" if no parameters are specified, returns the existing list of fields
			*/
			if (fields === undefined || fields === null) {
				return this.settings.fields;
			} else {
				this.settings.fields = fields;
				return this;
			}
		},
		analyzeDataSource: function () {
			/* analyzes the dataSource setting to automatically determine the type of the data source. Returns the data source type. See settings.type 
				returnType="string"
			*/
			var ds = this.dataSource(), $ds, dc;
			if (ds === undefined || ds === null) {
				return "empty";
			} else if ($.type(ds) === "function") {
				// function
				return "function";
			} else if ($.type(ds) === "array") {
				// string, assume JSON by default and eval it
				return "array";
				
			} else if ($.type(ds) === "number" || $.type(ds) === "boolean" || $.type(ds) === "date") {
				// data source is either boolean, number date, etc. 
				return "invalid";
				
			} else if ($.type(ds) === "string") { //string or object
			
				ds = $.trim(ds);
				if (ds.startsWith("/")) {
					return "remoteUrl";
				}
				$ds = $(ds);	
				// already passed through this code, we don't need to do the same thing again 
				if ($('#' + this.settings.id).length > 0 && ds.toLowerCase().startsWith("<table")) {
					return "htmlTableString";
				}
				// was: $(ds.toLowerCase())

				if (ds.toLowerCase().startsWith("<table")) {		
					// store the contents in this._data:
					// for that purpose we create a dummy div "data container", append it to the body, set display none and visibility hidden, and append our table there.
					dc = "<div id='" + this.settings.id + "' style='display:none;visibility:hidden;'>" + ds + "</div>";
					//this._data = $(dc).appendTo($("body"));
					$(dc).appendTo($("body"));
					return "htmlTableString";
				}
				if (!ds.startsWith("[") && !ds.startsWith("{") && !ds.startsWith("<")) { // object, array or xml
					// try to see if it's not a table:
					if (!ds.startsWith("http://") && $('#' + ds).length > 0 && $('#' + ds)[0].nodeName.toLowerCase() === "table") {	
						return "htmlTableId";
					}	
					this._url = ds;
					return "remoteUrl";
				}
				return "unknown";
			} else if (ds.nodeName && ds.nodeName.toLowerCase() === "table") {
				return "htmlTableDom";
			} else {
				return "unknown";
			}
		},
		dataView: function () {
			/* returns the current normalized/transformed and paged/filtered/sorted data, i.e. the dataView
				returnType="object"
			*/
			return this._dataView;
		},
		data: function () {
			/* returns all of the bound data, without taking into account local paging, sorting, filtering, etc. 
				returnType="object"
			*/
			return this._data;
		},
		schema: function (s, t) {
			/* Gets/sets the schema definition. 
				paramType="object" optional="true" a schema object 
				paramType="string" optional="true" type of the data source. See settings.type
			*/
			// data source schema definition 
			if (s === undefined || s === null) {
				return this._schema;
			} else {
				if (s instanceof $.ig.DataSchema) {
					this._schema = s;
				} else {		
					if (t === null || t === undefined) {
					
						this._schema = new $.ig.DataSchema(s.type, s);
					} else {
						this._schema = new $.ig.DataSchema(t, s);
					}
				}
				return this;
			}
		},
		pagingSettings: function (p) {
			/* gets/sets a list of paging settings 
				paramType="object" optional="true" object holding all paging settings. See settings.paging
			*/
			if (p === undefined || p === null) {
				return this.settings.paging;
			} else {
				this.settings.paging = p;
				return this;
			}
		},
		filterSettings: function (f) {
			/* gets/sets a list of filtering settings 
				paramType="object" optional="true" object holding all filtering settings. See settings.filtering
			*/
			if (f === undefined || f === null) {
				return this.settings.filtering;
			} else {
				this.settings.filtering = f;
				return this;
			}
		}, 
		sortSettings: function (s) {
			/* gets/sets a list of paging settings 
				paramType="object" optional="true" object holding all sorting settings. See settings.sorting
			*/
			if (s === undefined || s === null) {
				return this.settings.sorting;
			} else {
				this.settings.sorting = s;
				return this;
			}
		},
		dataSource: function (ds) {
			/* gets/sets the dataSource setting. if no parameter is specified, returns settings.dataSource
				paramType="object" optional="true"
				returnType="object"
			*/
			if (ds === undefined || ds === null) {
				return this.settings.dataSource;
			} else {
				this.settings.dataSource = ds;
				this.analyzeDataSource();
				return this;
			}
		},
		type: function (t) {
			/* gets/sets the type of the dataSource. if no parameter is specified, returns settings.type
				paramType="json|xml|unknown|array|function|htmlTableString|htmlTableId|htmlTableDom|invalid|remoteUrl|empty" optional="true"
				returnType="json|xml|unknown|array|function|htmlTableString|htmlTableId|htmlTableDom|invalid|remoteUrl|empty"
			*/
			if (t === undefined || t === null) {
				//return this.settings.dataSourceType;
				return this._runtimeType;
			} else {
				this.settings.type = t;
				return this;
			}
		},
		findRecordByKey: function (key) {
			/* returns a record by a specified key (requires that primaryKey is set in the settings)
				paramType="string" Primary key of the record
				returnType="object" a JavaScript object specifying the found record, or null if no record is found
			*/
			//A.T 2 Feb 2011 for now i am going to traverse all records until the one specified by key is found. 
			// additional great optimization is to index all records so that they are in the form <key>: { <javascript object> } 
			var i;
			for (i = 0; i < this._data.length; i++) {
				if (this._data[i][this.settings.primaryKey] === key) {
					return this._data[i];
				}
			}
			return null;
		},
		removeRecordByKey: function (key) {
			/* removes a specific record denoted by the primaryKey of the passed key parameter from the data source 
				paramType="string" primary key of the record 
			*/
			var i;
			for (i = 0; i < this._data.length; i++) {
				if (this._data[i][this.settings.primaryKey] === key) {
					this._data.remove(i);
					return;
				}
			}
		},
		setCellValue: function (rowId, colId, val, autoCommit) {
			/*  sets a cell value for the cell denoted by rowId and colId. Creates a transaction for the update operation and returns it
				paramType="object" the rowId - row key (string) or index (number)
				paramType="object" the column id - column key (string) or index (number)
				paramType="object" The new value 
				paramType="bool" if autoCommit is true, it updates the datasource automatically and the transaction is still stored in the accumulated transaction log
				returnType="object". The transaction object that was created 
			*/
			// create transaction
			var t = this._createCellTransaction(rowId, colId, val);
			this._addTransaction(t);
			// commit
			if (autoCommit === true) {
				this.commit(rowId);
			}
			return t;
		},
		updateRow: function (rowId, rowObject, autoCommit) {
			/* updates a record in the datasource. Creates a transaction that can be committed / rolled back 
				paramType="object" the record key - primaryKey (string) or index (number)
				paramType="object" the record object containing the key/value pairs we want to update. It doesn't have to include key/value pairs for all fields defined in the schema or in the data source (if no schema is defined)
				paramType="bool" if autoCommit is true, the datasource will be updated automatically and the transaction is still stored in the accumulated transaction log
				returnType="object". The transaction object that was created  
			*/
			// create transaction
			var t = this._createRowTransaction(rowId, rowObject);
			this._addTransaction(t);
			// commit
			if (autoCommit === true) {
				this.commit(rowId);
			}
			return t;
		},
		addRow: function (rowId, rowObject, autoCommit) {
			/* adds a new row to the data source. Creates a transaction that can be committed / rolled back 
				paramType="object" the record key - primaryKey (string) or index (number)
				paramType="object" the new record data. 
				paramType="bool" if autoCommit is true, the datasource will be updated automatically and the transaction is still stored in the accumulated transaction log
				returnType="object". The transaction object that was created 
			*/
			var t = this._createNewRowTransaction(rowId, rowObject);
			this._addTransaction(t);
			// commit
			if (autoCommit === true) {
				this.commit(rowId);
			}
			return t;
		},
		deleteRow: function (rowId, autoCommit) {
			/* deletes a row from the data source.
				paramType="object" the record key - primaryKey (string) or index (number)
				paramType="bool" if autoCommit is true, the datasource will be updated automatically and the transaction is still stored in the accumulated transaction log
				returnType="object". The transaction object that was created 
			*/
			var t = this._createDeleteRowTransaction(rowId);
			this._addTransaction(t);
			if (autoCommit === true) {
				this.commit(rowId);
			}
		},
		getDetachedRecord: function (t) {
			/* returns a standalone object (copy) that represents the commited transactions, but detached from the data source 
				paramType="object" a transaction object
				returnType="object" a copy of a record from the data source
			*/
			var o = $.type(this._data[0]) === "array" ? [] : {}, i, originalRec;
			
			if (this.settings.primaryKey === null) {
				originalRec = this._data[parseInt(t.rowId, 10)];
			} else {
				originalRec = this.findRecordByKey(t.rowId);
			}
			//o = $.extend(true, {}, originalRec);
			if (this._data[0] !== "array") {
				for (i in originalRec) {
					if (originalRec.hasOwnProperty(i)) {
						o[i] = originalRec[i];
					}
				}
			} else {
				for (i = 0; i < originalRec.length; i++) {
					o[i] = originalRec[i];
				}
			}
			if (t.type === 'cell') {
				o[t.col] = t.value;
				return o;
			} else {
				// merge objects or arrays
				//return $.extend(true, {}, o, t.row);
				if (o !== "array") {
					for (i in t.row) {
						if (t.row.hasOwnProperty(i)) {
							o[i] = t.row[i];
						}
					}
				} else {
					// if it's array, t.row is expected to have the same number of cells (elements) as the original record. it cannot contain partial data only for the updated cells 
					for (i = 0; i < t.row.length; i++) {
						o[i] = t.row[i];
					}
				}
				return o;
			}
		},
		commit: function (id) {
			/* update the data source with every transaction from the log
				paramType="number" optional="true" Id of the transaction to commit. If no id is specified, will commit all transactions to the data source. 
			*/
			var i = 0;
			// if "id" is defined, commit only the transaction with the specified id
			if (id !== null && id !== undefined) {
				this._commitTransactionsByRowId(id);
			} else {
				// commit all
				for (i = 0; i < this._transactionLog.length; i++) {
					this._commitTransaction(this._transactionLog[i]);
				}
			}
		},
		rollback: function (id) {
			/* clears the transaction log without updating anything in the data source 
				paramType="number" optional="true" Id of the transaction to rollback. If no id is specified, will rollback all transactions to the data source. 
			*/
			var i;
			
			if (id !== null && id !== undefined) {
				this._rollbackTransactionsByRowId(id);
			} else {
				// exclude the current transaction log from the accumulated transaction log. 
				// rollback all
				for (i = 0; i < this._transactionLog.length; i++) {
					this._rollbackTransaction(this._transactionLog[i]);
				}
			}
		},
		pendingTransactions: function () {
			/* returns a list of all transaction objects that are pending to be committed or rolled back to the data source 
				returnType="array"
			*/
			return this._transactionLog;
		},
		allTransactions: function () {
			/* returns a list of all transaction objects that are either pending, or have been committed in the data source. 
				returnType="array"
			*/
			return this._accumulatedTransactionLog;
		},
		_createCellTransaction: function (rowId, colId, val) {
			return {type: 'cell',  rowId: rowId, tid: this._generateTransactionId(), col: colId, value: val};
		},
		_createRowTransaction: function (rowId, rowObject) {
			return {type: 'row', tid: this._generateTransactionId(), row: rowObject, rowId: rowId};
		},
		_createNewRowTransaction: function (rowId, rowObject) {
			return {type: 'newrow', tid: this._generateTransactionId(), row: rowObject, rowId: rowId};
		},
		_createDeleteRowTransaction: function (rowId) {
			return {type: 'deleterow', tid: this._generateTransactionId(), rowId: rowId};
		},
		_addTransaction: function (t) {
			this._transactionLog.push(t);
			this._accumulatedTransactionLog.push(t);
		},
		_removeTransactionByTransactionId: function (tid, removeFromAll) {
			// removes a transaction by a transaction ID
			var i;
			for (i = 0; i < this._transactionLog.length; i++) {
				if (this._transactionLog[i].tid === tid) {
					this._transactionLog.remove(i);
					break;
				}
			}
			if (removeFromAll === true) {
				for (i = 0; i < this._accumulatedTransactionLog.length; i++) {
					if (this._accumulatedTransactionLog[i].tid === tid) {
						this._accumulatedTransactionLog.remove(i);
						break;
					}
				}
			}
		},
		_removeTransactionsByRecordId: function (id) {
			// removes all transactions matching a specific row id (index or primary key)
			var i;
			for (i = 0; i < this._transactionLog.length; i++) {
				if (this._transactionLog[i].rowId === id) {
					this._transactionLog.remove(i);
					break;
				}
			}
		},
		_commitTransaction: function (t) {
			// commit, then remove from the transaction log
			var i, prop, rec;
			
			if (this.settings.primaryKey === null) {
				rec = this._data[parseInt(t.rowId, 10)];
			} else {
				rec = this.findRecordByKey(t.rowId);
			}
			
			if (t.type === 'cell') {
				rec[t.col] = t.value;
			} else if (t.type === 'row') {
				if ($.type(t.row) === "array") {
					for (i = 0; i < t.row.length; i++) {
						rec[i] = t.row[i];
					}
				} else {
					for (prop in t.row) {
						if (t.row.hasOwnProperty(prop)) {
							rec[prop] = t.row[prop];
						}
					}
				}
			} else if (t.type === 'deleterow') {
				if (this.settings.primaryKey === null) {
					this._data.remove(parseInt(t.rowId, 10));
				} else {
					this.removeRecordByKey(t.rowId);
				}
			} else if (t.type === 'newrow') {
				this._data.push(t.row);
			}
			// finally remove from the log, since the transaction is already committed and shouldn't be pending
			this._removeTransactionByTransactionId(t.tid);
		},
		_rollbackTransaction: function (t) {
			this._removeTransactionByTransactionId(t.tid, true);
		},
		_commitTransactionsByRowId: function (id) {
			var i;
			
			for (i = 0; i < this._transactionLog.length; i++) {
				if (this._transactionLog[i].rowId === id) {
					this._commitTransaction(this._transactionLog[i]);
				}
			}
		},
		_rollbackTransactionsByRowId: function (id) {
			var i;
			
			for (i = 0; i < this._transactionLog.length; i++) {
				if (this._transactionLog[i].rowId === id) {
					this._rollbackTransaction(this._transactionLog[i]);
				}
			}
		},
		transactionsAsString: function () {
			/* returns the accumulated transaction log as a string. The purpose of this is to be passed to URLs or used conveniently
				returnType="string"
			*/
			return JSON.stringify(this._accumulatedTransactionLog);
		},
		_generateTransactionId: function () {
			return ((1 + Math.random()) * parseInt('10000', 16)).toString(16).substring(1, 5);
		},
		saveChanges: function () {
			/* posts to the settings.updateUrl using $.ajax, by serializing the changes as url params */
			if (this.settings.updateUrl !== null) {
				// post to the Url using $.ajax, by serializing the changes as url params 
				$.post(this.settings.updateUrl, {'ig_transactions': JSON.stringify(this._accumulatedTransactionLog)});
			}
		},
		// callback is the function to call when databinding is async (remote)
		// callee is the object on which to call the callback function
		dataBind: function (callback, callee) {
			/* data binds to the current data source  data source
				databinding works using the following workflow:
				1. fire the databinding event
				2. based on the data source type (see analyzeDataSource()), do the following:
				3. if type is HtmlTable, parse the table and set the data and dataView respectively. 
				if the type is Function, call it, apply Paging/Filtering/Sorting, and set this._dataView . If the developer wants to do his own paging, filtering or sorting
				in that case, then he should handle the PageIndexChanging and/or DataFiltering, and/or ColumnSorting client-side events, and cancel them. 
				if no paging/sorting/filtering are enabled, use just this._data to save space
				if the data source is of type RemoteUrl, use jQuery's $.ajax API to trigger a remote request to the service. Use the param() API to encode the URL
				if the data source is invalid, throw an exception 
				if the analyzed runtime data source type , that is, the result of analyzeDataSource(), is Unknown, check if 
				the value of settings.type is set to XML or JSON. if string, eval for JSON, and parse for the XML to build the object ree
				4. now normalize/transform the data, if a schema is supplied. This inplies any additional data type  conversion
				5. next, if OpType is Local, apply paging, sorting, and/or filtering to the data, and store the result in this._dataView
				6. fire the databound event 
				
				paramType="string" optional="true" callback function 
				paramType="object" optional="true" callee object on which the callback will be executed. If none is specified, will assume global execution context 
			*/
			// think about when would this._data be different than null at all? in which scenarios ?  
			var table, tableObj, dsObj, s, p = this.settings, args, ds, resKey, resPath, key, totalRecPath, noCancel = true, i, rec;
			
			this._transactionLog = [];
			this._accumulatedTransactionLog = [];
			
			if (!callback) {
				callback = p.callback;
			}
			
			// fire the data binding event
			args = {cancel: false};
			
			if ($.isFunction(p.dataBinding)) {
				noCancel = p.dataBinding(this, args);
				if (noCancel === undefined) {
					noCancel = true;
				}
			}
			//A.T. 18 Jan 2011 - Fix for bug #61623 - igDataSource dataBinding handler cannot cancel data binding
			//if (!args.cancel) {
			if (noCancel) {
				if (this.settings.type === "unknown" && (this._runtimeType === null || this._runtimeType === undefined)) {
					this._runtimeType = this.analyzeDataSource();
				} //else if (this.type !== $.ig.Constants.DataSourceType.Unknown) {
				//	this._runtimeType = this.settings.type;
				//}
				
				switch (this._runtimeType) {
				case "function":
					// TODO: determine context and pass parameters 
					this._data = p.dataSource(); // this.dataSource is a function
					if (this.schema()) {	
						this._data = this.schema().transform(this._data); // Q: do we store the normalized data in this._data, or in this._dataView ? 
					} 
					break;
				case "array":
					if (this.schema() && this.settings.localSchemaTransform) {	
						this._data = this.schema().transform(this.dataSource()); 
					} else {
						this._data = this.dataSource(); // no schema
					}
					break;
				case "htmlTableDom":
				case "htmlTableId":
				case "htmlTableString":
					//A.T. 18 Jan 2011 - Fix for bug #62123 - igDataSource HTMLTableString binding problem
					this._runtimeType = this.analyzeDataSource();
					if (this._runtimeType === "htmlTableId") {
						tableObj = $('#' + this.dataSource());
						table = this._validateTable(tableObj);
					} else if (this._runtimeType === "htmlTableString") {
						// the analyzeDataSource() call has already done most of the work to parse the string and attach to the DOM for us
						tableObj = $('#' + this.settings.id + ' > table');
						table = this._validateTable(tableObj);
					} else {
						table = this.dataSource();
					}
					if (this.schema()) {	
						this._data = this.schema().transform(table); 
					} else {
						this._data = this.tableToObject(table); // no schema
					}
					break;	
				case "invalid":
					throw new Error($.ig.DataSource.locale.invalidDataSource);
					//break;
				case "unknown":
				case "json":
				case "xml":
					if (this.settings.type !== "json" && p.type !== "xml") {
						//throw new Error("Cannot determine the data source type. Please specify if it is JSON or XML data. ");
						throw new Error($.ig.DataSource.locale.unknownDataSource);	
					} else {
						// there are two cases:
						// 1. string which is either JSON objects or XML string
						// 2. object - already parsed, or XML document element
						if ($.type(this.dataSource()) === "string") {
							if (p.type === "json") {
								dsObj = this.stringToJSONObject(this.dataSource());
							} else {
								dsObj = this.stringToXmlObject(this.dataSource());
							}
						} else {
							dsObj = this.dataSource();
						}
						// now check if there is schema defined
						if (this.schema() && this.settings.localSchemaTransform === true) {
							this._data = this.schema().transform(dsObj);	
						} else if ((!this.schema() || this.settings.localSchemaTransform === false) && p.type === "json") {
							resKey = this.settings.responseDataKey;
							if (resKey !== null && resKey !== undefined) {
								resPath = resKey.split(".");
								if (resPath.length > 0) {
									this._data = dsObj;
									for (i = 0; i < resPath.length; i++) {
										this._data = dsObj[resPath[i]];
									}
								} else {
									this._data = dsObj;
								}
							} else {
								this._data = dsObj;
							}
						} else if (!this.schema() && p.type === "xml") {
							// XML: we have an XML document but have no schema associated to it 
							//TODO: think about automating this a bit, i.e. even if there is no schema defined, assume a predefined structure and fallback to it
							// when a control like the client grid is bound to the data source, the column definitions automatically translate to a data schema ! 
							// in fact when the igGrid is bound to the igDataSource, and there is no explicit schema defined, we can assume a predefined schema, something like:
							// <row> <cell></cell> ... </row> and so on. The initial schema comes from the column definitions, and 1) => if we cannot find the XPath, fallback
							// to the default schema, or 2) => if no columns are defined, assume the default xml schema again. 
							throw new Error($.ig.DataSource.locale.errorXmlSourceWithoutSchema);
						}
						// make sure to read the responseTotalRecCountKey no matter if localSchemaTransform = true or false
						key = this.settings.responseTotalRecCountKey;
						if (key) {
							totalRecPath = key.split(".");
							rec = dsObj;
							for (i = 0; i < totalRecPath.length; i++) {
								rec = rec[totalRecPath[i]];
							}
							if (rec) {
								if ($.type(rec) === "number") {
									this.totalRecordsCount(rec);
								} else {
									// try parse
									this.totalRecordsCount(parseInt(rec, 10));
								}
								this.hasTotalRecordsCount(true);
							} else {
								this.hasTotalRecordsCount(false);
							}
						} else {
							this.hasTotalRecordsCount(false);
						}
					}
					break;
				case "remoteUrl":
					//TODO: when the response arrives, we still need to additionally analyze it and apply schema, if it is present
					// Note that the schema may have already been applied directly on the server-side 
					//1. encode the parameters for sorting, paging and filtering 
					this._remoteData(callback, callee);
					break;
				case "empty":
					this._data = [];
					this._dataView = [];
					break;
				default:
					break;
				}
				// describe the algorithm when dataView should be the same as data and when not
				this._dataView = this._data;
				this._filter = false;
				// apply initial sorting, if set, and if OpType is local.
				s = p.sorting;
				//if (s.type === $.ig.Constants.OpType.Local && s.defaultDirection !== $.ig.Constants.SortDirection.None && this._runtimeType !== $.ig.Constants.DataSourceType.RemoteUrl) {
				// A.T. fix for igGridSorting local sorting
				if (s.type === "local" && this._runtimeType !== "remoteUrl" && s.defaultFields.length > 0) {
					this.sort(s.defaultFields, s.defaultDirection, false);
				} 
				// Check if paging is configured, and if so, 
				// if OpType === $.ig.Constants.OpType.Local => apply local paging
				if (p.paging.enabled && p.paging.type === "local" && this._runtimeType !== "remoteUrl") {
					this._page();
					// this is necessary
				}
				ds = this;
				// invoke the callback if present:
				if (this._runtimeType !== "remoteUrl") {
					this._invokeCallback(callee, callback);
				}
				// fire the data bound event 
				if ($.isFunction(p.dataBound) && !args.cancel) {
					p.dataBound(this);
				}
			}
			return this;
		},
		_invokeCallback: function (callee, callback) {
		
			var cbResolved, calleeResolved;
			
			cbResolved = callback ? callback : this.settings.callback;
			calleeResolved = callee ? callee : this.settings.callee;
		
			if (cbResolved) {
				if (calleeResolved) {
					cbResolved.apply(calleeResolved, [true, "", this]);
				} else {
					cbResolved(true, "", this);
				}
			}
		},
		_remoteData: function (callback, callee) {
		
			var params, url = this.settings.dataSource, dataType = this.settings.responseDataType, contentType = this.settings.responseContentType, options; 
			//1. encode URL params
			params = this._encodeUrl();
			if (callback) {
				this._customCallback = callback;
			} else {
				this._customCallback = null;
			}
			this._callee = callee;
			// finally invoke the call to $.ajax. This can be easily "overriden" in an extension of the $.ig.DataSource 
			options = {
				url: url,
				//params: params,
				data: params,
				dataType: dataType,
				async: true,
				context: this,
				contentType: contentType,
				cache: false,
				dataFilter: this._dataFilter,
				success: this._successCallback,
				complete: this._completeCallback,
				error: this._errorCallback
			};
			this._processRequest(options);
		},
		_dataFilter: function (data, type) {
			var ds, schema = this.context.schema(), rawData, t = this.context.settings.type, ver;

			// fall back
			if (type === undefined) {
				type = "text"; 
			}
			if (type === "xml") {
				schema._type = "xml";
				ds = this.context._processXmlResponse(data, this.context);
				
			} else if (type === "json") {
				
				if (schema) {
					schema._type = "json";
				}
				// data may be already a parsed JSON object
				if ($.type(data) === "string") {
					rawData = JSON.parse(data);
				} else {
					rawData = data;
				}
				ds = this.context._processJsonResponse(rawData, this.context);
			// should we really bother about this for now ? HTML data coming from the server ? 
			//} else if (type === "html") {
			} else { // "text"
				//A.T. workaround for jQuery's 1.5 and above bug related to dataFilter and success callback. We need to explicitly set the dataType to "text" when manually parsing it
				// get jquery version
				if (jQuery.fn.jquery) {
					ver = jQuery.fn.jquery.split('.');
				}
				if (ver && ver.length >= 2) {
					// if jQuery is 1.5 and greater or if the first major version is greater than 1 (when jQuery 2 comes out)
					// As of jQuery 1.5, using this dataFilter approach for manually controlling deserialization will no longer work if the request�s dataType is set to �json� or even omitted.
					// another way of fixing this is using converters
					// http://api.jquery.com/extending-ajax/#Converters
					if (parseInt(ver[1], 10) > 4 || parseInt(ver[0], 10) > 1) {
						this.dataTypes = [];
						this.dataTypes.push("text");
					}
				}
				// try to analyze and detect automatically 
				data = $.type(data) === "string" ? $.trim(data) : data;
				if ((data && $.type(data) === "string" && (data.startsWith("<?xml") || 
					data.startsWith("<"))) || t === "xml") {
					// assume XML
					if (schema) {
						schema._type = "xml";
					}
					// we must convert the string to a document first
					ds = this.context._processXmlResponse(this.context.stringToXmlObject(data), false, this.context);
					
				} else if ((data && $.type(data) === "string" && data.startsWith("[")) ||
						(t === "json" || t === "array")) {
					if (schema) {
						schema._type = "json";
					}
					//ds = this.context._processJsonResponse(eval(data), this.context);
					//A.T. 20 Jan 2011 - fix for bug #62124 - igDataSource JSON string binding error
					ds = this.context._processJsonResponse(JSON.parse(data), this.context);
					
				} else if ((data && $.type(data) === "string" && data.startsWith("{")) ||
						t === "json") {
					if (schema) {
						schema._type = "json";
					}
					ds = this.context._processJsonResponse(JSON.parse(data), this.context);
					
				} else if ($.isXMLDoc(data)) {
					if (schema) {
						schema._type = "xml";
					}
					ds = this.context._processXmlResponse(data, true, this.context);
					
				} else if (data !== "" && data !== null) {
					throw new Error($.ig.DataSource.locale.errorUnrecognizedResponseType);
				}
			}
			
			/*
			resKey = this.context.settings.responseDataKey;
			if (resKey && resKey !== "") {
				ds = rawData[resKey];
			} else {
				ds = rawData;
			}
			
			if (this.context._isPagingReq || this.context._isFilteringReq) {
				key = this.context.settings.responseTotalRecCountKey;
				if (rawData && rawData[key]) {
					if ($.type(rawData[key]) === "number") {
						this.context.totalRecordsCount(rawData[key]);
					} else {
						// try parse
						this.context.totalRecordsCount(parseInt(rawData[key], 10));
					}
				}
			}
			*/
			return ds;
		},
		_successCallback: function (data) {
			// set the data & dataView
			//if the response doesn't hold the list of records directly in the root of the response, should we 
			// set the data to the list of records, or only the dataView? 
			// meaning , should the "_data" contain the raw response , in this case, an object, if the resKey is set ?
			//debugger;
			if (data === undefined || data === null) {
				this._data = [];
				this._dataView = [];
			} else {
				this._data = data;
				this._dataView = data;
			}
			
			this._isPagingReq = false;
			this._isFilteringReq = false;
			this._isSortingReq = false;
		},
		_errorCallback: function (req, status, error) {
			// first parameter denotes whether the request has been successful or not, second param is the error msg
			var f = this._customCallback ? this._customCallback : this.settings.callback, errmsg;
			this._isPagingReq = false;
			this._isFilteringReq = false;
			this._isSortingReq = false;
			errmsg = $.ig.DataSource.locale.errorRemoteRequest + " (" + status + ") " + (error !== undefined ? error.message : req && req.statusText ? req.statusText : "");
			if (f && this._callee) {
				f.apply(this._callee, [false, errmsg, this]);
			} else if (f) {
				f(false, errmsg, this);
			}
		},
		_completeCallback: function (req, status) {
		
			var f, callee, s = this.settings.sorting, p = this.settings.paging;
			
			if (s.type === "local" && s.defaultDirection !== "none") {
				this.sort(s.defaultFields, s.defaultDirection, false);
			}
			// Check if paging is configured, and if so, 
			// if OpType === $.ig.Constants.OpType.Local => apply local paging
			if (p.enabled && p.type === "local") {
				this._page();
			}
			
			f = this._customCallback ? this._customCallback : this.settings.callback;
			callee = this._callee ? this._callee : this.settings.callee;
			if (f && callee) {
				f.apply(callee, [true, "", this]);
			} else if (f) {
				f(true, "", this);
			}
		},
		_processRequest: function (options) {
			// trigger the call
			if (this.settings.responseDataType === 'jsonp') {
				$.getJSON(options.url, options.data, $.proxy(this._jsonpFilter, this));
			} else {
				$.ajax(options);
			/*
			$.ajax({
				url: url,
				// do not specify a dataType, let jQuery detect the response type, and filter the data later on. 
				dataType: dataType,
				async: true,
				context: this,
				data: params,
				contentType: contentType,
				cache: false,
				dataFilter: dataFilterFunction,
				success: successCallback,
				complete: completeCallback,
				error: errorCallback
			});
			*/
			}
		},
		_jsonpFilter: function (data, type) {
			var resp;
			this.context = this;
			resp = this._dataFilter(data, "json");
			this._data = resp;
			this._dataView = resp;
			this._completeCallback();
		},
		_processJsonResponse: function (data, context) {
		
			var ds, schema = context.schema(), resKey, key, resPath, i, totalRecPath, rec;
			
			if (schema && schema.fields && schema.fields().length > 0 && this.settings.localSchemaTransform) {
				ds = schema.transform(data);
			} else {
			
				resKey = context.settings.responseDataKey;
				if (resKey !== null && resKey !== undefined) {
					
					//we are not using eval() here, merge implementations with the schema code 
					//TODO: consider arrays here as well 
					resPath = resKey.split(".");
							
					//if (resKey && resKey !== "") {
					if (resPath.length > 0) {
					//	ds = data[resKey];
						ds = data;
						for (i = 0; i < resPath.length; i++) {
							ds = ds[resPath[i]];
						}
					} else {
						ds = data;
					}
				} else {
					ds = data;
				}
			}
			if (context._isPagingReq || context._isFilteringReq) {
				key = context.settings.responseTotalRecCountKey;
				
				if (key) {
				
					totalRecPath = key.split(".");
					rec = data;
					
					for (i = 0; i < totalRecPath.length; i++) {
						rec = rec[totalRecPath[i]];
					}
					
					if (data && rec) {
						if ($.type(rec) === "number") {
							context.totalRecordsCount(rec);
						} else {
							// try parse
							context.totalRecordsCount(parseInt(rec, 10));
						}
						this.hasTotalRecordsCount(true);
					} else {
						this.hasTotalRecordsCount(false);
					}
				} else {
					this.hasTotalRecordsCount(false);
				}
			}
			return ds;
		},
		// think about how to combine both searchField in the schema and responseDataKey, if defined in the root settings of the data source 
		_processXmlResponse: function (data, isParsed, context) {
			
			var ds, schema = context.schema(), tmpSchema, resKey;
			
			//TODO: make sure it's also possible to just define a searchfield without schema. currently the search field is in the schema? 
			if (schema && schema.fields && schema.fields().length > 0) {
				ds = this.settings.localSchemaTransform ? schema.transform(data) : data;
			} else {
				// convert the XML document to an array of JSON objects
				resKey = context.settings.responseDataKey;
				if (resKey && resKey !== "") {
					tmpSchema = new $.ig.DataSchema();
					ds = context._xmlToArray(tmpSchema._findXmlRecordsRoot(data, resKey));
				} else {
					ds = context._xmlToArray(data);
				}
			}
			return ds;
		},
		_xmlToArray: function (data) {
			// the assumptions here are several:
			// - the data that comes as a parameter is a XML document
			// - we are only going to traverse the children of the first root element - this is the default response type
			// for WCF services declared with BodyStyle = WebMessageBodyStyle.Wrapped attribute
			// we will also check of the root contains more than 1 node, and then assume the response is of type WebMessageBodyStyle.Bare
			// all other cases need to be handled by the developer - either specify schema or make sure the response has the format
			//  <root>
			//		< child> </child>
			//		....
			//  </root>
			var ds = [], root = data, i, r, j, name, val, o;
			
			o = window.ActiveXObject;
			
			if (data && data.childNodes && data.childNodes.length === 1) {
				// parse children of first root
				root = data.childNodes[0];
			}
			
			for (i = 0; i < root.childNodes.length; i++) {
				r = root.childNodes[i];
				ds[i] = [];
				for (j = 0; j < r.childNodes.length; j++) {
					name = o === undefined ? r.childNodes[j].localName : r.childNodes[j].baseName;
					val = o === undefined ? r.childNodes[j].textContent : r.childNodes[j].text;
					ds[i][name] = val;
				}
			}
			return ds;
		},
		_encodeUrl: function () {
		
			var props = this.settings, sParams = {}, fParams = {}, pParams = {}, params, args, selParams = {}, noCancel = true;
			// if the schema is defined on the client, but we have RemoteUrl data source type, 
			// in the oData protocol it's possible to list fields that will be included in the response
			// so let's read that from the schema and encode it in the URL, in case the server-side
			// supports it. Example:
			// http://www.odata.org/developers/protocols/uri-conventions#SelectSystemQueryOption
			
			args = {cancel: false};
			params = {"sortingParams" : sParams, "filteringParams" : fParams, "pagingParams" : pParams, "selectParams": selParams};
			
			if ($.isFunction(props.urlParamsEncoding)) {
				//args = props.urlParamsEncoding(this, params);
				noCancel = props.urlParamsEncoding(this, params);
			}
			
			//A.T. 18 Jan. 2011 - fix for bug #62309 - igDataSource unclear cancelability of urlParamsEncoding
			//if (!args.cancel) {
			if (noCancel) {
			
				this._encodeSelectParams(params);
				this._encodeSortingParams(params);
				this._encodeFilteringParams(params);
				this._encodePagingParams(params);

				if ($.isFunction(props.urlParamsEncoded)) {
					props.urlParamsEncoded(this, params);
				}
			}
			return $.extend(true, {}, params.sortingParams, params.filteringParams, params.pagingParams, params.selectParams);
		},
		_encodeSelectParams: function (params) {
		
			var selParams = params.selectParams, i;
			
			if (!this.settings.localSchemaTransform && this.schema() && this.schema().fields().length > 0) {
				// encode fields using oData $select
				// http://www.odata.org/developers/protocols/uri-conventions#SelectSystemQueryOption
				// example: http://services.odata.org/OData/OData.svc/Products?$select=Price,Name
				selParams.$select = "";
				for (i = 0; i < this.schema().fields().length; i++) {
					if (i !== 0) {
						selParams.$select += ",";
					}
					selParams.$select += this.schema().fields()[i].name;
				}
			} else if (!this.settings.localSchemaTransform && this.schema() && this.schema().fields().length === 0) {
				
				// include all fields
				// http://services.odata.org/OData/OData.svc/Products?$select=*
				selParams.$select = "*";
			}
		},
		_encodePagingParams: function (params) {
			var p = this.settings.paging;
			if (p.enabled && p.type === "remote") {
			//if (p.enabled) {
				// handle paging URL params
				// is also paging request
				this._isPagingReq = true;
				if (p.pageIndexUrlKey !== null && p.pageSizeUrlKey !== null) {
					params.pagingParams[p.pageIndexUrlKey] = this.pageIndex();
					params.pagingParams[p.pageSizeUrlKey] = this.pageSize();
				} else {
					// OData
					// $skip is the start index and $top is the end index 
					params.pagingParams.$skip = this.pageIndex() * this.pageSize();
					//params.pagingParams.$top = params.pagingParams.$skip + this.pageSize();
					params.pagingParams.$top = this.pageSize();
					
					// encode $inlinecount
					params.pagingParams.$inlinecount = "allpages";
					// set response key for total number of pages
					if (this.settings.responseTotalRecCountKey === null) {
						// http://www.odata.org/developers/protocols/uri-conventions#InlinecountSystemQueryOption
						this.settings.responseTotalRecCountKey = "d.__count"; // this is the default OData conventions
					}
				}
			}
		},
		_encodeSortingParams: function (params) {
			var s = this.settings.sorting, tmpdir, i, sfields;
			if (s.type === "remote") {	
				// handle sorting params
				if (s.exprString) {
					sfields = this._parseSortExpressions(s.exprString);
				} else {
					// handle expressions array
					sfields = s.expressions;
				}
				this._isSortingReq = true;	
				// now encode
				for (i = 0; i < sfields.length; i++) {
					// it's a sorting request
					if (s.sortUrlAscValueKey !== null && s.sortUrlDescValueKey !== null && s.sortUrlKey !== null) {
						tmpdir = (sfields[i].dir && sfields[i].dir.toLowerCase().startsWith("asc")) ? s.sortUrlAscValueKey : s.sortUrlDescValueKey;
						params.sortingParams[s.sortUrlKey + '(' + sfields[i].fieldName + ')'] = tmpdir;
					} else {
						// OData style encoding (the default)
						if (params.sortingParams.$orderby === undefined) { 
							params.sortingParams.$orderby = "";
						}
						params.sortingParams.$orderby = params.sortingParams.$orderby + sfields[i].fieldName + " " + sfields[i].dir.toLowerCase();
						if (i < sfields.length - 1) {
							params.sortingParams.$orderby += ",";
						}
						//params.sortingParams.$orderby = encodeURIComponent(params.sortingParams.$orderby);
					}
				}
			}
		},
		_encodeFilteringParams: function (params) {
			var f = this.settings.filtering, ffields, i, key, exprNotReq, cond, d;
			if (f.type === "remote") {
				// handle filtering params
				if (f.exprString) {
					ffields = this._parseFilterExprString(f.exprString);
				} else {
					ffields = f.expressions;
				}
				for (i = 0; i < ffields.length; i++) {
					// is a filtering request
					this._isFilteringReq = true;
					cond = ffields[i].cond;
					
					exprNotReq = cond === "false" || cond === "true" ||
						cond === "today" ||
						cond === "yesterday" || cond === "thisMonth" || 
						cond === "lastMonth" || cond === "nextMonth" ||
						cond === "thisYear" || cond === "lastYear" || 
						cond === "nextYear" || cond === "null" ||
						cond === "notNull" || cond === "empty" ||
						cond === "notEmpty";
					// if the filtering url key is explicitly defined, use this encoding: 
					// example something.php?filter(Name)=Contains(NY)
					// otherwise we use OData as the default
					if (f.filterExprUrlKey !== null) {
						// check if a filtering condition for the column already exists
						key = f.filterExprUrlKey + '(' + ffields[i].fieldName + ')';
						if ($.type(ffields[i].expr) === "date") {
							d = Date.UTC(ffields[i].expr.getFullYear(), ffields[i].expr.getMonth(), ffields[i].expr.getDate(), ffields[i].expr.getHours(), ffields[i].expr.getMinutes());
						} else {
							d = ffields[i].expr;
						}
						if (params.filteringParams[key] === undefined) {
							params.filteringParams[key] = ffields[i].cond + '(' + (exprNotReq ? '' : d) + ')';
						} else {
							params.filteringParams[key] = params.filteringParams[key] + ',' + ffields[i].cond + '(' + (exprNotReq ? '' : d) + ')';
						}
					} else {
						// OData:
						// http://www.odata.org/developers/protocols/uri-conventions#FilterSystemQueryOption
						// we support the following out of the box:
						// Eq, Ne, Gt, Ge, Lt, Le, And, Or, Not
						// as well as the following functions:
						// endswith, startswith, indexof
						if (params.filteringParams.$filter === undefined) { 
							params.filteringParams.$filter = "";
						}
						if (ffields[i].cond === "startsWith") {
						
							params.filteringParams.$filter += "startswith(" + ffields[i].fieldName + "," + "'" + ffields[i].expr + "') eq true";
							
						} else if (ffields[i].cond === "endsWith") {
						
							params.filteringParams.$filter += "endswith(" + ffields[i].fieldName + "," + "'" + ffields[i].expr + "') eq true";
							
						} else if (ffields[i].cond === "contains") {
							
							params.filteringParams.$filter += "indexof(" + ffields[i].fieldName + "," + "'" + ffields[i].expr + "') ge 0";
							
						} else if (ffields[i].cond === "doesNotContain") {
							
							params.filteringParams.$filter += "indexof(" + ffields[i].fieldName + "," + "'" + ffields[i].expr + "') eq -1";
						
						} else if (ffields[i].cond === "equals") {
						
							if ($.type(ffields[i].expr) === "string") {
								params.filteringParams.$filter += ffields[i].fieldName + " eq " + "'" + ffields[i].expr + "'";
							} else {
								params.filteringParams.$filter += ffields[i].fieldName + " eq " + ffields[i].expr;
							}
						} else if (ffields[i].cond === "true") {
							params.filteringParams.$filter += ffields[i].fieldName + " eq true";
						} else if (ffields[i].cond === "false") {
							params.filteringParams.$filter += ffields[i].fieldName + " eq false";
						} else if (ffields[i].cond === "doesNotEqual") {
						
							if ($.type(ffields[i].expr) === "string") {
								params.filteringParams.$filter += ffields[i].fieldName + " ne " + "'" + ffields[i].expr + "'";
							} else {
								params.filteringParams.$filter += ffields[i].fieldName + " ne " + ffields[i].expr;
							}
							
						} else if (ffields[i].cond === "greaterThan") {
						
							params.filteringParams.$filter += ffields[i].fieldName + " gt " + ffields[i].expr;
							
						} else if (ffields[i].cond === "lessThan") {
						
							params.filteringParams.$filter += ffields[i].fieldName + " lt " + ffields[i].expr;
							
						} else if (ffields[i].cond === "greaterThanOrEqualTo") {
						
							params.filteringParams.$filter += ffields[i].fieldName + " ge " + ffields[i].expr;
							
						} else if (ffields[i].cond === "lessThanOrEqualTo") {
						
							params.filteringParams.$filter += ffields[i].fieldName + " le " + ffields[i].expr;
						} else if (ffields[i].cond === "null") {
							params.filteringParams.$filter += ffields[i].fieldName + " eq null";
						} else if (ffields[i].cond === "notNull") {
							params.filteringParams.$filter += ffields[i].fieldName + " ne null";
						} else if (ffields[i].cond === "empty") {
							params.filteringParams.$filter += "length(" + ffields[i].fieldName + ") eq 0";
						} else if (ffields[i].cond === "notEmpty") {
							params.filteringParams.$filter += "length(" + ffields[i].fieldName + ") gt 0";
						}
						
						if (i < ffields.length - 1) {
							params.filteringParams.$filter += " and ";
						}
						//params.filteringParams.$filter = encodeURIComponent(params.filteringParams.$filter);
						// Before, After, Today, Yesterday, and so on - are not supported by OData, only by our custom filtering 
					}
				}
				// now encode the filtering logic, if defined
				if (f.filterLogicUrlKey !== null && ffields.length > 0) {
					// takes the first field's logic prop
					params.filteringParams[f.filterLogicUrlKey] = ffields[0].logic;
				}
			}
		},
		_page: function () {
			var count = 0, startIndex, endIndex, i = 0;
			//this._filteredDataView = [];
			// reset the dataView:
			this._dataView = [];
			if (!this._filter) {
				// this._dataView should contain only the number of records specified by pageSize. 
				// load the data for the current page only , in the DataView
				startIndex = this.pageIndex() * this.pageSize();
				endIndex = startIndex + this.pageSize() >= this._data.length ? this._data.length : startIndex + this.pageSize();
				for (i = startIndex; i < endIndex; i++) {
					this._dataView[count++] = this._data[i];
				}
			} else {
				startIndex = this.pageIndex() * this.pageSize();
				endIndex = startIndex + this.pageSize() >= this._filteredData.length ? this._filteredData.length : startIndex + this.pageSize();
				for (i = startIndex; i < endIndex; i++) {
					this._dataView[count++] = this._filteredData[i];
				}
			}
		},
		// multi-column sorting  (third column - whether sorting should be preserved or cleared ) 
		// field can be a schema field, or an index of the column 
		// fields => an array of fields object definitions: 
		// example: [{fieldName : "firstName"}, {fieldName : "lastName"}]
		// example 2: [{fieldIndex : 1} , {fieldIndex : 2}]
		sort: function (fields, direction, keepSortState) {
			/* Sorts the data source locally. The result (filtered data) can be obtained by calling dataView(). Remote filtering can be performed by just calling dataBind() and setting the settings.filtering.expressions
				multi-column sorting can be enabled by setting keepSortState to true. 
				fields => an array of fields object definitions: 
				example: [{fieldName : "firstName"}, {fieldName : "lastName"}]
				example 2: [{fieldIndex : 1} , {fieldIndex : 2}]
				
				paramType="object" an array of fields object definitions
				paramType="string" asc / desc direction
				paramType="bool" if set to true, enables multi-column sorting, and the previous sorting state is not cleared
			*/
			// check if there is a custom function defined
			var s  = this.settings.sorting, schema, sortF, convertFunc, p = this.settings.paging, data, resetPaging = false;
			if (fields === undefined || fields === null) {
				throw new Error($.ig.DataSource.locale.noSortingFields);
			}
			// default sort function
			sortF = function (fields, schema, reverse, convertf) {
				reverse = (reverse) ? -1 : 1;
				function compareVals(x, y) {
					if ((x === null || x === undefined) && (y === null || y === undefined)) {
						return 0;
					} else if ((x === null || x === undefined) && y !== null && y !== undefined) {
						return -1;
					} else if (x !== null && x !== undefined && (y === null || y === undefined)) {
						return 1;
					} else {
						return x > y ? 1 : x < y ? -1 : 0;
					}
				}
				return function (obj1, obj2) {
					var i, f, arr1 = [], arr2 = [], a, b;
					for (i = 0; i < fields.length; i++) {
						f = fields[i];
						if (f.fieldIndex >= 0) {
							f.fieldName = f.fieldIndex;
						}
						a = obj1[f.fieldName];
						b = obj2[f.fieldName];
						if (convertf !== undefined) {
						
							// this is assumed to be a custom-defined function, that will override the default data source type conversion logic
							a = convertf(a, f.fieldName);
							b = convertf(b, f.fieldName);
						}
						//A.T. 19 Jan 2011 - Fix for bug #62963 - igDataSource - case sensitivity is not applied to sorting
						if (s.caseSensitive === false) {
							if (a !== undefined && a !== null && a.toLowerCase) {
								a = a.toLowerCase();
							}
							if (b !== undefined && b !== null && b.toLowerCase) {
								b = b.toLowerCase();
							}
						}		
						// support a different direction for every separate column
						if (f.dir !== undefined && f.dir !== null) {
							reverse = f.dir.toLowerCase().startsWith("desc");
							reverse = (reverse) ? -1 : 1;
						} else if (direction !== undefined && direction !== null && direction !== "") {
							reverse = direction.toLowerCase().startsWith("desc");
							reverse = (reverse) ? -1 : 1;
						}
						// differentiate between single and multi-col sorting (for performance reasons)
						if (fields.length === 1) {
							arr1 = reverse * compareVals(a, b);
							arr2 = reverse * compareVals(b, a);
						} else {
							if (reverse === -1) {
								arr1.push(-compareVals(a, b));
								arr2.push(-compareVals(b, a));
							} else {
								arr1.push(compareVals(a, b));
								arr2.push(compareVals(b, a));
							}
						}
					}
					if (arr1 < arr2) {
						return -1;
					} else if (arr1 > arr2) {
						return 1;
					}
					return 0;
				};
			};
			if (s.applyToAllData && s.type === "local") {
				if (this._filter && ((p.type === "local" && p.enabled === true) || p.enabled === false)) {
					data = this._filteredData;
				} else {
					data = this.data();
				}
				resetPaging = true;
			} else {
				data = this.dataView();
			}
			if ($.type(s.customFunc) === 'function') {	
				// call the function, passing the data to be sorted, the fields, and the direction
				data = s.customFunc(data, fields, direction);
			} else {
				schema = this.settings.schema;
				/*
				for (i = 0; i < schema.fields.length; i++) {
					if (schema.fields[i].name === fields[0].fieldName) {
						type = schema.fields[i].type;
					}
				}
				*/
				if (!direction) {
					direction = "";
				}
				// check if a custom compare function is set
				if ($.type(s.compareFunc) === "function") {
					sortF = s.compareFunc;
				}
				// check if a custom conversion function is set
				if ($.isFunction(s.customConvertFunc)) {
					convertFunc = s.customConvertFunc;
				} 
				//else {
					// we do not want to reset the default data source type conversion logic
					// convertFunc returns a function 
					//convertFunc = this._convertf;
				//}
				
				// we allow the developer to provide a single string of sort expressions, in the following format:
				// "col1 asc, col2 desc, col3 asc" ... 
				if ($.type(fields) === "string") {
					fields = this._parseSortExpressions(fields);
				}
				// A.T. 21 Jan Fix for bug #63146 - reversing of sorting should be the other way around if "direction" is specified as parameter in sort()
				data = data.sort(sortF(fields, schema, direction.toLowerCase().startsWith("asc") ? false : true, convertFunc));
			}
			// now if paging is enabled, and "applyToAllData" is true, we need to re-initialize the dataView
			if (resetPaging && p.type === "local") {
				if (!this._filter) {
					this._filteredData = data;
				} else {
					this._data = data;
				}
				this._page();
			} else {
				// A.T. 14 Feb 2011 - fix for bug #66214
				this._dataView = data;
			}
			return this; // preserve chaining
		},
		// expected format is "col1 ASC, col2 DESC, col3 ASC" ... and so on 
		_parseSortExpressions: function (s) {
		
			var fields = [], tmp, tmp2, i;
			tmp = s.split(",");
			
			for (i = 0; i < tmp.length; i++) {
				fields[i] = {};
				tmp2 = $.trim(tmp[i]).split(" ");
				fields[i].fieldName = tmp2[0];
				fields[i].dir = tmp2[1];
			}
			
			return fields;
		},
		// this is used when sorting data
		// type can be "string", "number", "boolean", "date". 
		//Other values are ignored and default conversion is used 
		_convertf: function (val, type) {
			// not necessary for now. default type conversion happens in the data source directly 
		},
		// same regarding multi-col. filtering: rowFilter (ref: DataTable). 
		// example: [{fieldName : "firstName", expr: "abc", cond: "StartsWith"}, {fieldName : "lastName"}]
		// example 2: [{fieldIndex : 1} , {fieldIndex : 2, expr: "a", cond : "Contains"}]
		// expr is the filter expression text , such as "abc", or a regular expression such as *test*
		// cond is the filtering condition such as StartsWith, EndsWith, Contains, Equals, DoesNotEqual, DoesNotContain
		// if expr is detected to be a regular expression, the "cond" part is skipped 
		filter: function (fieldExpressions, boolLogic, keepFilterState) {
			/* filters the data source locally. Remote filtering can be performed by just calling dataBind() and setting the settings.filtering.expressions. The result (filtered data) can be obtained by calling dataView() 
				example: [{fieldName : "firstName", expr: "abc", cond: "StartsWith"}, {fieldName : "lastName"}]
				example 2: [{fieldIndex : 1} , {fieldIndex : 2, expr: "a", cond : "contains"}]
				expr is the filter expression text , such as "abc", or a regular expression such as *test*
				cond is the filtering condition such as startsWith, endsWith, contains, equals, doesNotEqual, doesNotContain
				if expr is detected to be a regular expression, the "cond" part is skipped 
			
				paramType="object" a list of field expression definitions
				paramType="AND|OR" boolean logic. Accepted values are AND and OR. 
				paramType="bool" if keepFilterState is set to true, it will not discard previous filtering expressions
			*/
			var i, j, expr = null, count = 0, skipRec = false, f = this.settings.filtering, p = this.settings.paging, data, t, k, schema, fields, tmpbool, resetPaging;
			schema = this.schema();
			if (schema === null || schema === undefined) {
				throw new Error($.ig.DataSource.locale.filteringNoSchema);
			}
			if ($.type(fieldExpressions) === "string") {
				expr = fieldExpressions;
			}
			if ($.type(fieldExpressions) === "array" && fieldExpressions.length === 0) {
				return;
			}
			if (f.applyToAllData && f.type === "local") {
				data = this.data();
				resetPaging = true;	
			} else {
				// cache the original dataView 
				if (this._cachedDataView && this._cachedDataView.length > 0) {
					//data = this.dataView();
					data = this._cachedDataView;
				} else {
					// COPY the this.dataView() in this._cachedDataView; this is necessary because we want to restore it later on 
					//this._cachedDataView = $.extend(true, {}, this.dataView());
					this._cachedDataView = $.merge([], this.dataView());
					data = this._cachedDataView;
				}
			}	
			if ($.type(f.customFunc) === 'function') {	
				// call the function, passing the filterExpression object which contains field names/indices, the current expression for the field, as well as condition for the field
				data = f.customFunc(fieldExpressions, data);
			} else {
				// re-initialize the dataView. We can do that safely, since data will either be cached, or will be stored in this.data(), meaning that will be the whole ds
				this._dataView = [];
				this._filteredData = [];
				// filter "data"
				// we will store all results in tmpData, and then assign it to the dataView. please ensure that 
				for (i = 0; i < data.length; i++) {
					skipRec = false;
					if (expr) {
						fieldExpressions = this._parseFilterExprString(expr);
					}
					for (j = 0; j < fieldExpressions.length; j++) {
						// if there is no match, break, we aren't going to add the record to the resulting data view. 
						// the default boolean logic is to "AND" the fields 
						fields = schema.fields();	
						if (fieldExpressions[j].fieldIndex) {
							if (fieldExpressions[j].fieldIndex < fields.length) {
								t =  fields[fieldExpressions[j].fieldIndex].type;
							}
							skipRec = !this._findMatch(data[i][fieldExpressions[j].fieldIndex], fieldExpressions[j].expr, t,  !f.caseSensitive, fieldExpressions[j].cond);
						} else {
							for (k = 0; k < fields.length; k++) {
								if (fields[k].name === fieldExpressions[j].fieldName) {
									t = fields[k].type;
									break;
								}
							}
							skipRec = !this._findMatch(data[i][fieldExpressions[j].fieldName], fieldExpressions[j].expr, t, !f.caseSensitive, fieldExpressions[j].cond);
						}
						tmpbool = (fieldExpressions[j].logic !== null && fieldExpressions[j].logic !== undefined && (fieldExpressions[j].logic.toLowerCase() === "or" ||
							fieldExpressions[j].logic.toLowerCase() === "and")) ? fieldExpressions[j].logic : boolLogic;
						//A.T. 18 Jan. 2011 fix for bug 62126 - igDataSource local filtering expressions: the OR operator does not work
						if (tmpbool === undefined || tmpbool === null || $.type(tmpbool) !== "string") {
							tmpbool = "and";
						}
						if (skipRec && tmpbool.toLowerCase() === "and") {
							break;
						} else if (!skipRec && tmpbool.toLowerCase() === "or") {
							break;
						}
					}
					if (!skipRec) {
						//this._dataView[count++] = data[i];
						this._filteredData[count++] = data[i];
					}
				}
			}
			if (resetPaging && p.type === "local" && p.enabled === true) {
				this._filter = true;
				// reset paging
				this.settings.paging.pageIndex = 0;
				this.pageSizeDirty(true);
				this._page();
			} else {
				if (p.enabled === false) {
					this._filter = true;
				}
				for (i = 0; i < this._filteredData.length; i++) {
					this._dataView[i] = this._filteredData[i];
				}
			}
			return this; // preserve chaining
		},
		_parseFilterExprString: function (expr) {
			//A.T. 18 Jan 2011 - fix for bug #62418 
			var exprs = $.trim(expr).split(/(?=AND+)|(?=OR+)/i), i, j, fields = [], tmp, tmp2, isInvalid = true;
			for (i = 0; i < exprs.length; i++) {
				fields[i] = {};
				//A.T. 18 Jan 2011 -  Fix for bug #62415 - equality sign (=) is not parsed when in a filtering expression string
				//A.T. 19 Jan 2011 - removing (IN) operator. (bug #62365)
				tmp = $.trim(exprs[i]).split(/(?= \=+)|(?=<>+)|(?=>+)|(?=<+)|(?=LIKE+)|(?=NOT\WLIKE)+|(?=>\=+)|(?=<\=+)/);
				if ($.trim(exprs[i]).toLowerCase().startsWith("and")) {
					fields[i].logic = "AND";
					// strip AND 
					//tmp[0] = tmp[0].substring(tmp.indexOf(3));
				} else if ($.trim(exprs[i]).toLowerCase().startsWith("or")) {
					fields[i].logic = "OR";
					// strip OR
					//tmp[0] = tmp[0].substring(tmp.indexOf(2));
				}
				// the current logic field is always for the previous term 
				if (i > 0 && (fields[i].logic === "AND" || fields[i].logic === "OR")) {
					fields[i - 1].logic = fields[i].logic;
				}
				if (tmp[0].toLowerCase().startsWith("and") || tmp[0].toLowerCase().startsWith("or")) {
					fields[i].fieldName = $.trim(tmp[0].split(" ")[1]);
				} else {
					fields[i].fieldName = $.trim(tmp[0]);
				}
				tmp2 = $.trim(tmp[1]).split(" ");
				// fix ambiguous matching between <, >, and <>
				if (exprs[i].indexOf("<>") !== -1) {
					tmp2[0] = "<>";
					tmp2[1]  = tmp[2].replace(">", "");
				}
				//A.T. 19 Jan 2011 - Fix for bug #62368 - igDataSource - Space character handling in filtering string expressions
				if (tmp2.length > 2) {
					// merge all entries from index one to the end into a single string 
					for (j = 2; j < tmp2.length; j++) {
						tmp2[1] = tmp2[1] + ' ' + tmp2[j];
					}
					tmp2 = [tmp2[0], tmp2[1]];
				}
				if (tmp[1].startsWith("NOT")) {
					fields[i].expr = $.trim(tmp[2].replace("LIKE", ""));
				} else {
					fields[i].expr = tmp2[1];
				}
				// validate field
				for (j = 0; j < this.schema().schema.fields.length; j++) {
					if (this.schema().schema.fields[j].name === fields[i].fieldName) {
						isInvalid = false;
						break;
					}
				}
				if (isInvalid) {
					//A.T. 18 Jan 2011 - fix for bug 62406 - filtering expression string fallback scenario should return an error
					throw new Error($.ig.DataSource.locale.fieldMismatch + fields[i].fieldName);
				}
				isInvalid = true;
				if (tmp2[0] === ">") { 
					fields[i].cond = "greaterThan";
				} else if (tmp2[0] === "LIKE") {
					if (fields[i].expr.startsWith("%") && fields[i].expr.endsWith("%")) {
						fields[i].cond = "contains";
					} else if (fields[i].expr.endsWith("%")) {
						fields[i].cond = "startsWith";
					} else if (fields[i].expr.startsWith("%")) {
						fields[i].cond = "endsWith";
					} else {
						fields[i].cond = "equals";
					}
					//A.T. 18 Jan 2011 - Fix for bug #62355 the LIKE operator does not work as substitute for the Contains local filtering condition
					fields[i].expr = fields[i].expr.replace(/%/g, '');
				} else if (tmp2[0] === "NOT LIKE" || tmp2[0] === "NOT") {
					
					if (fields[i].expr.startsWith("%") && fields[i].expr.endsWith("%")) {
						fields[i].cond = "doesNotContain";
					//} else if (fields[i].expr.endsWith("%")) {
					//	fields[i].cond = "startsWith";
					//} else if (fields[i].expr.startsWith("%")) {
					//	fields[i].cond = "endsWith";
					} else {
						fields[i].cond = "doesNotEqual";
					}
					fields[i].expr = fields[i].expr.replace(/%/g, '');
				} else if (tmp2[0] === "=") {
					fields[i].cond = "equals";
				} else if (tmp2[0] === "<>") {
					fields[i].cond = "doesNotEqual";
				} else if (tmp2[0] === "<") {
					fields[i].cond = "lessThan";
				} else if (tmp2[0] === "<=") {
					fields[i].cond = "lessThanOrEqualTo";
				} else if (tmp2[0] === ">=") {
					fields[i].cond = "greaterThanOrEqualTo";
				} else {
					//A.T. 18 Jan 2011 - fix for bug 62406 - filtering expression string fallback scenario should return an error
					throw new Error($.ig.DataSource.locale.unrecognizedCondition + expr);
					// fallback
					//fields[i].cond = "Contains";
				}
			}
			return fields;
		},
		// think about passing the type directly as parameter, to avoid performance parsing overhead 
		_findMatch: function (val, expr, t, ignoreCase, cond) {
			// if the filter condition is one of the below ones, we do not require a filter expression to be set
			var tmpExpr, exprNotReq = cond === "false" || cond === "true" ||
				cond === "today" ||
				cond === "yesterday" || cond === "thisMonth" || 
				cond === "lastMonth" || cond === "nextMonth" ||
				cond === "thisYear" || cond === "lastYear" || 
				cond === "nextYear" || cond === "null" ||
				cond === "notNull" || cond === "empty" ||
				cond === "notEmpty";
			
			// no filter, therefore everything matches OK 
			if (expr === "" && !exprNotReq) {
				return true;
			}
			tmpExpr = $.trim(expr);
			//if (t === null || t === undefined) {
			//	t = $.type(expr);
			//}
			if (t === "regexp" || (t === "string" && tmpExpr.startsWith("/") && tmpExpr.endsWith("/"))) {
				if (t === "regexp") {
					return this._findRegExpMatch(val, expr, false);
				} else {
					return this._findRegExpMatch(val, tmpExpr.substring(1, tmpExpr.length - 1), true);
				}
			} else if (($.type(val) === "date" && (t === undefined || t === null)) || t === "date") {
				// parse expr
				try {
					expr = this._parser.toDate(expr);
				} catch (e) {
					// log error that expr could not be converted 
				}
				return this._findDateMatch(val, expr, cond);
			} else if (($.type(val) === "boolean"  && (t === undefined || t === null)) || (t === "boolean" || t === "bool")) {
				return this._findBoolMatch(val, cond);
			} else if (($.type(val) === "number" && (t === undefined || t === null)) || t === "number") {
				return this._findNumericMatch(val, expr, cond);
			} else {
				return this._findStringMatch(val, expr, ignoreCase, cond);
			}
		},
		_findStringMatch: function (val, expr, ignoreCase, cond) {
			var localVal;
			if (val !== null) {
				localVal = ignoreCase ? val.toLowerCase() : val ? val : "";
			} else {
				localVal = val;
			}
			if (expr !== null && expr !== undefined) {
				expr = ignoreCase ? expr.toLowerCase() : expr;
			}
			// check if expr is a regular expression
			if (cond === "startsWith") {		
				return localVal !== null && localVal !== undefined && localVal.startsWith(expr);
			} else if (cond === "endsWith") {
				return localVal !== null && localVal !== undefined && localVal.endsWith(expr);
			} else if (cond === "contains") {
				return localVal !== null && localVal !== undefined && localVal.indexOf(expr) !== -1;
			} else if (cond === "doesNotContain") {
				return localVal !== null && localVal !== undefined && localVal.indexOf(expr) === -1;
			} else if (cond === "equals") {
				return localVal !== null && localVal !== undefined && localVal === expr;
			} else if (cond === "doesNotEqual") {
				return localVal !== null && localVal !== undefined && localVal !== expr;
			} else if (cond === "null") {
				return localVal === null;
			} else if (cond === "notNull") {
				return localVal !== null;
			} else if (cond === "empty") {
				return localVal === null || localVal === undefined || localVal.length === 0;
			} else if (cond === "notEmpty") {
				return localVal === null || localVal === undefined || localVal.length !== 0;
			} else {
				throw new Error($.ig.DataSource.locale.errorUnrecognizedFilterCondition + cond);
			}	
			//return false;
		},
		_findRegExpMatch: function (val, expr, str) {
			if (str) {
				return (new RegExp(expr)).test(val);
			} else {
				return val.match(expr);
			}
		},
		// Equals, DoesNotEqual, GreaterThan, LessThan, GreaterThanOrEqualTo, LEssThanOrEqualTo
		_findNumericMatch: function (val, expr, cond) {
			// if expr is not numeric, convert it
			if ($.type(expr) !== "number") {
				expr = this._parser.toNumber(expr);
			}
			if (cond === "equals") {
				return val === expr;	
			} else if (cond === "doesNotEqual") {
				return val !== expr;
			} else if (cond === "greaterThan") {
				return val > expr;
			} else if (cond === "lessThan") {
				return val < expr;
			} else if (cond === "greaterThanOrEqualTo") {
				return val >= expr;
			} else if (cond === "lessThanOrEqualTo") {
				return val <= expr;
			} else if (cond === "null") {
				return val === null;
			} else if (cond === "notNull") {
				return val !== null;
			// A.T. 14 Feb 2011 - Fix for bug #64156
			} else if (cond === "empty") {
				return (val === null || val === undefined || isNaN(val));
			} else if (cond === "notEmpty") {
				return (val !== null && val !== undefined && !isNaN(val));
			} else {
				throw new Error($.ig.DataSource.locale.errorUnrecognizedFilterCondition + cond);
			}
		},
		// True or False
		_findBoolMatch: function (val, cond) {
			if (cond === "true") {
				return val;
			} else if (cond === "false") {
				return !val;
			} else if (cond === "null") {
				return val === null;
			} else if (cond === "notNull") {
				return val !== null;
			} else if (cond === "empty") {
				return (val === null || val === undefined);
			} else if (cond === "notEmpty") {
				return (val !== null && val !== undefined);
			} else {
				throw new Error($.ig.DataSource.locale.errorUnrecognizedFilterCondition + cond);
			}
		},
		// Equals, DoesNotEqual, Before, After, Today, Yesterday, ThisMonth, LastMonth, NextMonth, ThisYear, LastYear, NextYear, ThisQuarter, LastQuarter, NextQuarter
		// the expected types are both Date for both val and expr.
		_findDateMatch: function (val, expr, cond) {
			var day1, mins1, secs1, hs1, ms1, yrs1, day2, mins2, secs2, hs2, ms2, yrs2, month1, month2, eq, cur,
				day3, mins3, secs3, hs3, ms3, yrs3, month3, mday1, mday2, mday3;
			// 1. get the "expr" date and divide it into year, month, quarter, day, week, etc.
			if (val !== null && val !== undefined) {
				day1 = val.getDay();
				mday1 = val.getDate();
				mins1 = val.getMinutes();
				secs1 = val.getSeconds();
				hs1 = val.getHours();
				ms1 = val.getMilliseconds();
				yrs1 = val.getYear();
				month1 = val.getMonth();
				//w1 = val.getWeek();
			}
			if ($.type(expr) === "date") {
				day2 = expr.getDay();
				mday2 = expr.getDate();
				mins2 = expr.getMinutes();
				secs2 = expr.getSeconds();
				hs2 = expr.getHours();
				ms2 = expr.getMilliseconds();
				yrs2 = expr.getYear();
				month2 = expr.getMonth();
			} else {
				expr = new Date(expr);
			}
			// current time
			cur = new Date();
			day3 = cur.getDay();
			mday3 = cur.getDate();
			mins3 = cur.getMinutes();
			secs3 = cur.getSeconds();
			hs3 = cur.getHours();
			ms3 = cur.getMilliseconds();
			yrs3 = cur.getYear();
			month3 = cur.getMonth();
			eq = day1 === day2 && mins1 === mins2 && hs1 === hs2 && yrs1 === yrs2 && month1 === month2;
			// now compare
			if (cond === "equals") {
				return eq;
			} else if (cond === "doesNotEqual") {
				return !eq;
			} else if (cond === "before") {
				return val < expr;
			} else if (cond === "after") {
				return val > expr;
			} else if (cond === "today") {
				return mday1 === mday3 && month1 === month3 && yrs1 === yrs3;
			} else if (cond === "yesterday") {
				// handle month and year boundaries 
				return mday1 === mday3 - 1 && month1 === month3 && yrs1 === yrs3;
			} else if (cond === "thisMonth") {
				return month1 === month3 && yrs1 === yrs3;
			} else if (cond === "lastMonth") {
				//A.T. 18 Jan 2011 - Fix for bug #62354 - igDataSource LastMonth and NextMonth local filtering doesn't work properly
				// first month of the year special case
				if (month3 === 0) {
					return month1 === 11 && yrs1 === yrs3 - 1;
				}
				return month1 === month3 - 1 && yrs1 === yrs3;
			} else if (cond === "nextMonth") {
				//A.T. 18 Jan 2011 - Fix for bug #62354 - igDataSource LastMonth and NextMonth local filtering doesn't work properly
				// last month of the year special case
				if (month3 === 11) {
					return month1 === 0 && yrs1 === yrs3 + 1;
				}
				return month1 === month3 + 1 && yrs1 === yrs3;
			} else if (cond === "thisYear") {
				return yrs1 === yrs3;
			} else if (cond === "lastYear") {
				return yrs1 === yrs3 - 1;
			} else if (cond === "nextYear") {
				return yrs1 === yrs3 + 1;
			} else if (cond === "on") {
				return yrs1 === yrs2 && month1 === month2 && mday1 === mday2;
			} else if (cond === "notOn") {
				return !(yrs1 === yrs2 && month1 === month2 && mday1 === mday2);
			//else if (cond === "ThisQuarter") {
			//
			//} else if (cond === "LastQuarter") {
			//
			//} else if (cond === "NextQuarter") {
			//
			} else if (cond === "null") {
				return val === null;
			} else if (cond === "notNull") {
				return val !== null;
			// A.T. 14 Feb 2011 - fix for bug #64465
			} else if (cond === "empty") {
				return (val === null || val === undefined);
			} else if (cond === "notEmpty") {
				return (val !== null && val !== undefined);
			} else {
				throw new Error($.ig.DataSource.locale.errorUnrecognizedFilterCondition + cond);
			}
		},
		/*
		clearFilter: function (fields) {
			// clears the filters, and rebinds the data so that there is no filtering applied on the dataView instance
			return this; // preserve chaining 
		},
		clearFilters: function () {	
			// clears all filters
		},
		*/
		// return 1 even if records count is 0.
		totalRecordsCount: function (count) {
			/* Applicable only when the data source is bound to remote data. gets / sets the total number of records in the data source. If data binding is remote, and there's paging or filteing enabled, the actual total number of records may not 
				match the number of records that exists on the client 
				paramType="number" optional="true" the total number of records 
			*/
			if (count === undefined || count === null) {
				return this._recCount;
			} else {
				this._recCount = count;
			}
		},
		hasTotalRecordsCount: function (hasCount) {
			/* gets / sets if the response from the server contains a property which specifies the total number of records in the server-side backend 
				paramType="bool" specifies if the data source contains a property that denotes the total number of records in the server-side backend
			*/
			if (hasCount === undefined || hasCount === null) {
				return this._hasCount;
			} else {
				this._hasCount = hasCount;
			}
		},
		totalLocalRecordsCount: function () {
			/* returns the total number of records in the local data source
				returnType="number" the number of records that are bound / exist locally 
			*/
			if (!this._filter) {
				return this._data.length;
			} else {
				return this._dataView.length;
			}
		},
		pageCount: function () {
			/* returns the total number of pages 
				returnType="number" total number fo pages
			*/
			var c, realCount;
			if (!this._filter) {
				realCount = this.totalRecordsCount() > 0 ? this.totalRecordsCount() : this._data.length;
			} else {
				realCount = this.totalRecordsCount() > 0 ? this.totalRecordsCount() : this._filteredData.length;
			}
			c = Math.ceil(realCount / this.settings.paging.pageSize);
			return c === 0 ? 1 : c;
		},
		pageIndex: function (index) {
			/* gets /sets the current page index. if an index is passed as a parameter, the data source is re-bound. 
				paramType="number" optional="true" the page index. if none is specified, returns the current page index
				returnType="number" the current page index 
			
			*/
			if (index === undefined || index === null) {
				//return this._pageIndex;
				return this.settings.paging.pageIndex === undefined ? 0 : this.settings.paging.pageIndex;
			} else {
				//this._pageIndex = index;
				// A.T. 18 Jan 2011 - Fix for bug #63149 - igDataSource - page content is erratic after changing page size
				this.settings.paging.pageIndex = parseInt(index, 10);
				this._cachedDataView = null;
				if (this.settings.paging.type === "local") {
					this._page();
					this._invokeCallback();
				} else {
					this.dataBind();
				}
				return this;
			}
		},
		// utility paging functions
		prevPage: function () {
			/* sets the page index to be equal to the previous page index and rebinds the data source */
			this.pageIndex(this.pageIndex() === 0 ? 0 : this.pageIndex() - 1);
			return this;
		},
		nextPage: function () {
			/* sets the page index to be equal to the next page index and rebinds the data source */
			if (this.pageIndex() >= this.pageCount() - 1) {
				return this;
			}
			this.pageIndex(this.pageIndex() + 1);
			return this;
		},
		pageSize: function (s) {
			/* gets /sets the page size and rebinds the data source if a parameter is specified. if no parameter is passed, returns the current page size
				paramType="number" optional="true" the page size. 
			*/
			if (s === undefined || s === null) {
				return this.settings.paging.pageSize;
			} else {
				// A.T. 18 Jan 2011 - Fix for bug #63149 - igDataSource - page content is erratic after changing page size
				this.settings.paging.pageSize = parseInt(s, 10);
				this.dataBind();
				return this;
			}
		},
		pageSizeDirty: function (dirty) {
			if (dirty === undefined || dirty === null) {
				return this._dirty;
			} else {
				this._dirty = dirty;
			}
		},
		recordsForPage: function (p) {
			/* returns a list of records for the specified page. implies that paging is enabled 
				paramType="number" optional="false" the page index for which records will be returned 
			
			*/
			var d = [], si, ps, ei, i, c = 0;
			ps = this.pageSize();
			si = p * ps;
			ei = si + ps >= this._data.length ? this._data.length : si + ps;
			for (i = si; i < ei; i++) {
				d[c++] = this._data[i];
			}
			return d;
		},
		tableToObject: function (tableDOM) {
			/* converts a HTML TABLE dom element to a JavaScript array of objects that contain the records data 
				paramType="dom" TABLE dom element to transform
				returnType="object" 
			*/
			try {
				// no schema, just parse the table and store t in arrays
				var rows = $(tableDOM).children("tbody").children(), len, data, i, j;	
				len = rows.length > 0 ? rows[0].cells.length : 0;
				data = []; 
				for (i = 0; i < rows.length; i++) {
					data[i] = [];
					for (j = 0; j < len; j++) {
						data[i][j] = rows[i].cells[j].innerHTML;
					}
				}
				return data;
			} catch (e) {
				throw new Error($.ig.DataSource.locale.errorParsingHtmlTableNoSchema + e.message);
			}
		},
		_validateTable: function (obj) {
			if (obj.length === 0) {
				throw new Error($.ig.DataSource.locale.errorTableWithIdNotFound + this.dataSource());
			} else {
				return obj[0];
			}
		},
		stringToJSONObject: function (s) {
			/* parses the string and returns an evaluated JSON object
				paramType="string" the JSON as string. 
			*/
			var data = {};
			try {
				//data = eval(s);
				//A.T. 20 Jan 2011 Fix for bug #62124 - igDataSource JSON string binding error
				data = JSON.parse(s);
			} catch (e) {
				throw new Error($.ig.DataSource.locale.errorParsingJsonNoSchema + e.message);
			}
			return data;
		},
		stringToXmlObject: function (s) {
			/* parses a string and returns a XML Document 
				paramType="string" the XML represented as a string
			*/
			var doc, parser;
			try {
				if (window.ActiveXObject) {
					doc = new ActiveXObject('Microsoft.XMLDOM');
					doc.async = 'false';
					doc.loadXML(s);
				} else {
					parser = new DOMParser();
					doc = parser.parseFromString(s, 'text/xml');
				}
			} catch (e) {
				throw new Error($.ig.DataSource.locale.errorParsingXmlNoSchema + e.message);
			}
			return doc;
		}
		// this function is not currently used
		/*
		_filterData: function (data) {
		
			if (this.settings.pageSize > 0)
			{
				var filteredData = [], count = 0, i = 0;
				for (i = this._pageIndex * this.settings.pageSize; i < this._pageIndex * this.settings.pageSize + this.settings.pageSize; i++) {
					filteredData[count++] = data[i];
				}
				return filteredData;
			}
			return data;
		}
		*/
	});
	$.ig.TypeParser = $.ig.TypeParser || Class.extend({

		toStr: function (obj) {
			return this.isNullOrUndefined(obj) ? "" : obj + this.empty();
		},
		toDate: function (obj) {
			if (this.isNullOrUndefined(obj) || $.type(obj) === 'function') {
				return null;
			} else if ($.type(obj) === 'date') {
				return obj;
			} else {
				// OData & MS
				if (obj.length && obj.indexOf('/Date(') !== -1) {
					return new Date(parseInt(obj.replace('/Date(', '').replace(')/', ''), 10));
				}
				return new Date(obj);
			}
		},
		toNumber: function (obj) {
			return (this.isNullOrUndefined(obj) || $.type(obj) === 'function') ? null : obj * this.num(); 
		},
		toBool: function (obj) {
			if ($.type(obj) === 'boolean') {
				return obj;
			} else if (this.isNullOrUndefined(obj) || $.type(obj) === 'function') {
				return false;
			} else if (obj === "1" || obj.toLowerCase() === "true" || obj === 1) {
				return true;
			} else {
				return false;
			}
		},
		isNullOrUndefined: function (obj) {
			return obj === null || obj === undefined;
		},
		empty: function () {
			return "";
		},
		num: function () {
			return 1;
		}
	});
	// the $.ig.DataSchema handles transformations for Array, JSON and Xml data objects.
	// if your data is in any other format and/or needs to be additionally worked on, please pass it through $.ig.DataSource first
	// Eg: when you need to fetch the data remotely, or when it is stored in a string and needs to be evaluated first 
	$.ig.DataSchema = $.ig.DataSchema || Class.extend({
		schema: {
			// fields collection (array)
			fields: [
			
			],
			// searchField
			searchField: null,
			// resultsField
			outputResultsName: null
		},		
		init: function (type,  options) {
			if (options) { 
				this.schema = $.extend(true, {}, $.ig.DataSchema.prototype.schema, options);
			}
			this._type = type;
			this._parser = new $.ig.TypeParser();
		},
		transform: function (data) {
			var ndata = []; // the resulting normalized data 
			// transform data according to the fields
			switch (this._type) {
			case "array":
				ndata = this._arrays(data);
				break;
			case "json":
				ndata = this._json(data);
				break;
			case "xml":
				ndata = this._xml(data);
				break;
			case "htmlTableDom":
				ndata = this._table(data);
				break;
			default:
				throw new Error('unknown data source type: ' + this._type);
				//break;
			}
			return ndata;
		},
		_setResKey: function (resKey, out) {
			if (!this.isEmpty(resKey)) {
				out[resKey] = []; // was {}
				return out[resKey];
			} else {
				return out;
			}
		},
		_convertType: function (t, obj) {
			if (t === "string") {
				return this._parser.toStr(obj);
			} else if (t === "date") {
				return this._parser.toDate(obj);
			} else if (t === "number") {
				return this._parser.toNumber(obj);
			} else if (t === "boolean" || t === "bool") {
				return this._parser.toBool(obj);
			} else {
				// no type conversion / unknown type
				return obj;
			}			
		},
		//_val: function (field, val, results, i, j, rec) {
		_val: function (field, val, results, i, rec) {	
			// TODO: return this to the state before 28 Nov
			var t = field.type, j;
			if (!this.isEmpty(t)) {
				if (this.isEmpty(field.name)) {
					results[i][j] = this._convertType(t, val);
				} else {
					results[i][field.name] = this._convertType(t, val);
				}
			} else {
				if (this.isEmpty(field.name)) {
					//results[i][j] = val;
					if (rec) {
						results[i][j] = rec[i][j];
					} else {
						results[i][j] = val;
					}
				} else {
					//results[i][field.name] = val;
					if (rec) {
						// we must copy the whole object refrence, in order to get "by reference" types. 
						results[i][field.name] = rec[i][field.name];
					} else {
						results[i][field.name] = val;
					}
				}
			}
		},
		isEmpty: function (o) {
			return o === undefined || o === null || o === "";
		},
		_arrays: function (data) {
			var i, j, tmp, hasArrays, resKey = this.schema.outputResultsName, out = {}, results;
			// optionally, a developer may decide to set all contents directly in the output object 
			results = this._setResKey(resKey, out);
			// object is empty and is not an array
			if (this.isObjEmpty(results) && $.type(results) !== "array") {
				results = [];
				out = results;
			}
			try {
				if (data.length > 0) {
					hasArrays = $.type(data[0]) === 'array';
				}
				for (i = 0; i < data.length; i++) {
					results[i] = {};
					for (j = 0; j < this.schema.fields.length; j++) {
						if (hasArrays) {
							tmp = data[i][j];
						} else {
							tmp = data[i][this.schema.fields[j].name];
						}
						this._val(this.schema.fields[j], tmp, results, i);
					}
				}
			} catch (e) {
				throw new Error($.ig.DataSource.locale.errorParsingArrays + e.message);
			}
			return out;
		},
		// the data that comes is expected to be already evaluated 
		_json: function (data) {
			var i, j, root, resKey = this.schema.outputResultsName, out = {}, results;
			// optionally, a developer may decide to set all contents directly in the output object 
			results = this._setResKey(resKey, out);
			if (this.isObjEmpty(results)) {
				results = [];
				out = results;
			}
			try {
				// find the object holding the data
				if (!this.isEmpty(this.schema.searchField)) {
					root = eval("data." + this.schema.searchField);
				} else {
					root = data;
				}	
				
				// traverse root
				if (root && root.length && root.length > 0) {	
					for (i = 0; i < root.length; i++) {
						results[i] = {};
						for (j = 0; j < this.schema.fields.length; j++) {
							if (root[i][this.schema.fields[j].name] === undefined) {
								// the input data doesn't match the schema
								throw new Error($.ig.DataSource.locale.errorSchemaMismatch + this.schema.fields[j].name);
							}
							this._val(this.schema.fields[j], root[i][this.schema.fields[j].name], results, i, root);
						}
					}
				}
			} catch (e) {
				throw new Error($.ig.DataSource.locale.errorParsingJson + e.message);
			}
			return out;
		},
		// the data that comes is already expected to be a parsed XML document object 
		_xml: function (data) {
			var i, j, root, resNode, item, resKey = this.schema.outputResultsName, out = {}, results, namespaced, sf, k, r, rc, len1, len2, o;
			o = window.ActiveXObject;
			// optionally, a developer may decide to set all contents directly in the output object 
			results = this._setResKey(resKey, out); 
			if (this.isObjEmpty(results)) {
				results = [];
				out = results;
			}
			try {
				// find the searchField, if set
				// data is assumed to be a XML document 
				if (!this.isEmpty(this.schema.searchField)) {
				
					// it makes a big difference if the XML has namespace declarations (xmlns) or not
					// in the first case, we cannot use XPath expressions reliably directly, because 
					// they won't return any matches. Therefore if the XML is namespaced, we are going to 
					// manually traverse it and find matches by parsing the xpath expression (search field)
					// which will also sacrifice performance a bit
					namespaced = this._xmlHasNamespaces(data);
					if (!namespaced) {
						if (window.ActiveXObject === undefined) {
							root = data.evaluate(this.schema.searchField, data, null,  XPathResult.ANY_TYPE, null);
						} else {
							root = data.selectNodes(this.schema.searchField);
						}
					} else {
						// find the elements list manually
						if (this.schema.searchField.startsWith("//")) {
							sf = this.schema.searchField.substring(2, this.schema.searchField.length);
						} else {
							sf = this.schema.searchField;
						}
						// find *the first* instance, and assume it's parent will hold them all ! 
						root = this._findXmlRecordsRoot(data, sf); 
					}
				} else {
					root = data;
				}
				// IEs
				if (!namespaced) {
					if (root && window.ActiveXObject !== undefined) {
						for (i = 0; i < root.length; i++) {
							item = root.item(i);
							results[i] = {};
							for (j = 0; j < this.schema.fields.length; j++) {
								// evaluate the xpath for the field, for the current item, if it is present
								resNode = item.selectSingleNode(this.schema.fields[j].xpath);
								if (resNode) {
									this._val(this.schema.fields[j], resNode.text, results, i);
								} else {
									results[i][this.schema.fields[j].name] = "";
								}
							}
						}
					} else if (root) { // FF, Opera, Safari, Chrome etc. 
						i = 0;
						item = root.iterateNext();
						while (item) {
							results[i] = {};
							for (j = 0; j < this.schema.fields.length; j++) {
								// evaluate the xpath for the field, for the current item, if it is present
								resNode = data.evaluate(this.schema.fields[j].xpath, item, null,  XPathResult.ANY_TYPE, null).iterateNext();
								if (resNode) {
									this._val(this.schema.fields[j], resNode.textContent, results, i);
								} else {
									results[i][this.schema.fields[j].name] = "";
								}
							}
							i++;
							item = root.iterateNext();
						}
					}
				} else {
					// list a list of records accessible by the childNodes prop
					len1 = root.childNodes.length;
					for (i = 0; i < len1; i++) {
						r = root.childNodes[i];
						results[i] = {};
						for (j = 0; j < this.schema.fields.length; j++) {
							//TODO: think about how to optimize this, like that it could be awfully slow for bigger data sets ... 
							len2 = r.childNodes.length;
							for (k = 0; k < len2; k++) {
								rc = r.childNodes[k];
								if (this.schema.fields[j].name === (o === undefined ? rc.localName : rc.baseName)) {
									this._val(this.schema.fields[j], o === undefined ? rc.textContent : rc.text, results, i);
									break;
								}
							}
						}
					}
				}
			} catch (e) {
				throw new Error($.ig.DataSource.locale.errorParsingXml + e.message);
			}
			return out;
		},
		// recursively find the parent root record holding the children
		_findXmlRecordsRoot: function (data, field) {
			var i, len, r, o, ret;
			o = window.ActiveXObject;
			if ((o === undefined ? data.localName : data.baseName) === field) {
				ret = data.parentNode;
			} else if (data && data.childNodes && data.childNodes.length > 0) {
				len = data.childNodes.length;
				for (i = 0; i < len; i++) {
					r = data.childNodes[i];
					//if ((o === undefined ? r.localName : r.baseName) === field) {
					//	ret = data;
					//}
					if (r.childNodes && r.childNodes.length > 0) {
						ret = this._findXmlRecordsRoot(r, field);
					}
				}
			}
			return ret;
		},
		_xmlHasNamespaces: function (data) {
			// in order not to introduce big performance hits, we are going to only to check the root elements, and the first child of the root, for 
			// "xmlns" attributes
			var i, ns, r, len, fc;
			if (data.childNodes && data.childNodes.length && data.childNodes.length > 0) {
				len = data.childNodes.length;
				for (i = 0; i < len; i++) {
					r = data.childNodes[i];
					if (!r) {
						return false;
					}
					ns = r.namespaceURI;
					if (ns !== "" && ns !== undefined && ns !== null) {
						return true;
					}
				}
				// if we still haven't found a namespace, try the first child element
				if (r && r.childNodes && r.childNodes.length > 0) {
					fc = r.childNodes[0];
					if (!fc) {
						return false;
					}
					ns = fc.namespaceURI;
					return (ns !== "" && ns !== undefined && ns !== null);
				}
			}
			return false;
		},
		_table: function (data) {
			// the assumption is that "data" contains the table DOM element. 
			var i, j, r, tbody, rows, resKey = this.schema.outputResultsName, out = {}, results;
			tbody = $(data).find("tbody")[0];
			
			// if there are headers, remove them. the grid will create its own. 
			$(data).find('thead').remove();
			
			// optionally, a developer may decide to set all contents directly in the output object 
			results = this._setResKey(resKey, out);
			if (this.isObjEmpty(results)) {
				results = [];
				out = results;
			}
			try {
				if (tbody && tbody.nodeName && tbody.nodeName === "TBODY") {
					rows = tbody.rows;
					for (i = 0; i < rows.length; i++) {
						r = rows[i];
						results[i] = { };		
						// iterate through the fields
						for (j = 0; j < this.schema.fields.length; j++) {
							this._val(this.schema.fields[j], r.cells[j].innerHTML, results, i);
						}
					}
				} else {
					throw new Error($.ig.DataSource.locale.errorExpectedTbodyParameter);
				}
			} catch (e) {
				throw new Error($.ig.DataSource.locale.errorParsingHtmlTable + e.message);
			}
			return out;
		},
		isObjEmpty: function (obj) {
			var prop;
			
			for (prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					return false;
				}
			}
			return true;
		},
		fields: function () {
			return this.schema.fields;
		}
	});
	// Helper/wrapper classes for $.ig.DataSource 
	$.ig.RemoteDataSource = $.ig.RemoteDataSource || $.ig.DataSource.extend({
		init: function (options) {
			if (!options) {
				options = {};
			}
			options.type = "remoteUrl";
			this._super(options);
			return this;
		}
	});
	$.ig.JSONDataSource = $.ig.JSONDataSource || $.ig.DataSource.extend({
		init: function (options) {
			if (!options) {
				options = {};
			}
			options.type = "json";
			this._super(options);
			return this;
		}
	});
	$.ig.JSONPDataSource = $.ig.JSONPDataSource || $.ig.DataSource.extend({
		init: function (options) {
			if (!options) {
				options = {};
			}
			options.responseDataType = 'jsonp';
			this._super(options);
			return this;
		}
	});
	$.ig.XmlDataSource = $.ig.XmlDataSource || $.ig.DataSource.extend({
		init: function (options) {
			if (!options) {
				options = {};
			}
			options.type = "xml";
			this._super(options);
			return this;
		}
	});
	$.ig.FunctionDataSource = $.ig.FunctionDataSource || $.ig.DataSource.extend({
		init: function (options) {
			if (!options) {
				options = {};
			}
			options.type = "function";
			this._super(options);
			return this;
		}
	});
	// the dataSource should be a reference to a DOM element
	$.ig.HtmlTableDataSource = $.ig.HtmlTableDataSource || $.ig.DataSource.extend({
		init: function (options) {
		
			if (!options) {
				options = {};
			}
			options.type = "htmlTableDom";
			this._super(options);
			return this;
		}
	});
	$.ig.ArrayDataSource = $.ig.ArrayDataSource || $.ig.DataSource.extend({
		init: function (options) {
			if (!options) {
				options = {};
			}
			options.type = "array";
			this._super(options);
			return this;
		}
	});
	// the idea of the mashup data source is to combine several flat data sources from different locations into a single one
	// primary key matching is performed if keys are defined in the respective flat DataSource instances
	// after the mashup is processed, a combined data view and data instances are created and paging / sorting / filtering can work *locally* on the mashup
	// when some of the mashup sources is remote, callbacks are executed in order, and the final data binding part to combine the mashup
	// is called only when all of the individual data sources are data bound 
	$.ig.MashupDataSource = $.ig.MashupDataSource || $.ig.DataSource.extend({
		// the mashup data source is an array of flat data sources, which could be anything: local / remote / XML / JSON, etc. 
		// if an element in the dataSource array is not of type $.ig.DataSource, then it is assumed to be in the following format:
		// {options } 
		// where options will be used to create an $.ig.DataSource instance , example:
		//	var sources = [
		//		{dataSource: namedData, primaryKey: "ProductID"}, 
		//		{dataSource: "/demos/server/proxy.php?url=http://services.odata.org/OData/OData.svc/Products?$format=json", primaryKey: "ID"}
		//	];
		//	
		//	var ds = new $.ig.MashupDataSource({callback:render, dataSource: sources});
		//	ds.dataBind();
		//
		mashupSettings: {
			ignorePartialRecords: false,
			dataSource: []
		},
		init: function (options) {
			// initialize $.ig.DataSource
			this._super(options);
			if (options) { 
				this.settings = $.extend(true, {}, $.ig.DataSource.prototype.settings, options);
				this.settings = $.extend(true, {}, $.ig.MashupDataSource.prototype.mashupSettings, this.settings);
			}
			// a list of flat data sources from which the mashup will be created 
			this._sources = [];
			this._dataBindingComplete = false;
			this._sourcesStatus = [];
			this._hashedDataViews = [];
			
			return this;
		},
		_checkDataBindingComplete: function (status, msg, ownerDs) {
			// once this is done, set it as dataSource of the actual mashup data source, and call super's dataBind()
			var i, j, k, hasPrimaryKeys = true, totalLength = 0, data = [], d, rindex, keyVal, prop;

			this._dataBindingComplete = true;

			for (i = 0; i < this._sources.length; i++) {
				if (this._sources[i] === ownerDs) {
					this._sourcesStatus[i] = 1;
				}
				
				if (this._sourcesStatus[i] === 0) {
					this._dataBindingComplete = false; // still expecting some data source 
				}
			}
			// now that we have all separate data sources bound individually, and their dataViews filled with data 
			// we start assembling the mashup data source, by doing indexing on the primary keys (if defined)
			if (this._dataBindingComplete) {
				// check if there are primary keys defined for every individual data source 
				for (i = 0; i < this._sources.length; i++) {
					if (this._sources[i].settings.primaryKey === "" || this._sources[i].settings.primaryKey === null || this._sources[i].settings.primaryKey === undefined) {
						hasPrimaryKeys = false;
						break;
					}
				}
				// 1. determine the number of rows = max ( data source length) , also depending on the value of ignorePartialRecords
				// the data source with the largest number of records defines the mashup data source length 
				totalLength = this._sources[0].dataView().length;
				for (i = 0; i < this._sources.length; i++) {
					totalLength = this.settings.ignorePartialRecords ? 
						(this._sources[i].dataView().length < totalLength ? this._sources[i].dataView().length : totalLength) :
						(this._sources[i].dataView().length > totalLength ? this._sources[i].dataView().length : totalLength);
				}
				// this also implies that there is schema present 
				if (hasPrimaryKeys) {
					// perform indexing based on the primary keys
					// for each data source, create hashes 
					for (i = 0; i < this._sources.length; i++) {
						this._hashedDataViews[i] = {};
						//consider the scenario where "primaryKey" is set to more than one field 
						// now iterate the records of the respective data source
						for (j = 0; j < this._sources[i].dataView().length; j++) {
							this._hashedDataViews[i][this._sources[i].dataView()[j][this._sources[i].settings.primaryKey]] = this._sources[i].dataView()[j];
						}
					}
					// now fill-in the "data":
					for (i = 0; i < totalLength; i++) {
						data[i] = {};
						// merge the objects
						for (j = 0; j < this._sources.length; j++) {
							if (this._sources[j].dataView().length > i) {
								keyVal = this._sources[j].dataView()[i][this._sources[j].settings.primaryKey];
								data[i] = $.extend(true, {}, data[i], this._hashedDataViews[j][keyVal]);
								//this._sources[j].dataView().length > i ? this._hashedDataViews[j][keyVal] : {});
							} else {
								data[i] = $.extend(true, {}, data[i], {});
							}
						}
					}					
				} else {
					// the easiest - no primary keys, process sequentially record by record 
					//TODO: optimize this
					for (i = 0; i < totalLength; i++) {
						data[i] = {};
						for (j = 0; j < this._sources.length; j++) {
							d = this._sources[j];
							if (d.dataView()[0].length) {
								for (k = 0; k < d.dataView()[0].length; k++) {
									// check if there is schema defined or not 
									rindex += k;
									if (d.schema() && d.schema().fields().length > 0) {
										data[i][d.schema().fields()[k]] = i >= d.dataView().length ? '' : d.dataView()[i][d.schema().fields()[k]];
									} else {
										data[i][rindex] = i >= d.dataView().length ? '' : d.dataView()[i][k];
									}
								} 
							} else {
								for (prop in d.dataView()[i]) {
									if (d.dataView()[i].hasOwnProperty(prop)) {
										//if (d.schema() && d.schema().fields().length > 0) {
										//	data[i][d.schema().fields().prop] = i >= d.dataView().length ? '' : d.dataView()[i][d.schema().fields().prop];
										//} else {
										data[i][prop] = i >= d.dataView().length ? '' : d.dataView()[i][prop];
										//}
									}
								}	
							}
						}
						rindex = 0;
					}
				}
				this.settings.dataSource = data;
				this.settings.type = "array";
				this._runtimeType = this.analyzeDataSource();
				// finally call the data binding of the mashup 
				this.dataBind();
			}
		},
		dataBind: function () {
			var i, ds = this.settings.dataSource;
			if (this._dataBindingComplete) {
				// we can proceed to data binding the mashup 
				this._dataBindingComplete = false; // reset 
				this._super();
			} else {
				// setup the mashup for binding its individual data sources 
				this._dataBindingComplete = false;
				// traverse the sources and instantiate a data source object, if not already passed as parameter 
				for (i = 0; i < ds.length; i++) {
					if (ds[i] instanceof $.ig.DataSource) {
						this._sources[i] = ds[i];
					} else {
						this._sources[i] = new $.ig.DataSource(ds[i]);
					}
					// now data bind
					// attach a callback that will keep track of the data binding progress of all individual data sources
					this._sources[i].settings.callee = this;
					this._sources[i].settings.callback = this._checkDataBindingComplete;
					this._sourcesStatus[i] = 0; // mark the data source as not bound yet 
				}
				for (i = 0; i < ds.length; i++) {
					this._sources[i].dataBind();
				}
			}
			return this;
		}
	});
	$.ig.HierarchicalDataSource = $.ig.HierarchicalDataSource || $.ig.DataSource.extend({
		hierarchicalSettings: {
			// autogenerate will have limited support, since we cannot automatically infer which are the primary keys, therefore scenarios such as cascade delete or 
			// hierarchies when multiple flat sources are combined will not work correctly. 
			autogenerate: false, // if this property is true, the contents of "childbands" is ignored. 
			// load on demand support: always load only the top level
			// think about how to 'tell' the server that we do not want children to be loaded 
			initialDataBindDepth: 0,
			defaultChildrenFieldName: "children", // identifies the default property name in the data source where child nodes will be stored relative to their parent node/record
			childbands: null, // a list of schemas and options, one for every level that we want to bind. Note that schemas here is different than relations. 
			// two defined schemas may have more than one relation defined. 
			//these two properties define if we want to do lazy loading based on virtualization, too. 
			// if virtualization is enabled, we may want to cache/load the data views for those records
			startRecord: -1,
			endRecord: -1
		},
		init: function (options) {
			// merge defaults with passed-in values 
			if (options) { 
				this.settings = $.extend(true, {}, $.ig.HierarchicalDataSource.prototype.settings, options);
				this.settings = $.extend(true, {}, $.ig.HierarchicalDataSource.prototype.hierarchicalSettings, this.settings);
			}
			// actually we won't keep an table of data Views. we'll keep a map of flat data sources instances, created on demand 
			this._sources = {};
			this._levels = [];
			// TODO: think about how to use the same code for the mashup data source and the hierarchical data source 
			this._dataBindingComplete = false;
			this._sourcesStatus = [];
			this._super(options);
			return this;
		},
		dataBind: function (callback, callee) {
			// data bind will need to be rewritten a bit in order to handle hierarchies , we will still rely on a lot of the base functionality
			// some data sources are not going to be valid here, such as HTML table
			var i, bands;
			// it is very important that we do add to the schemas the actual children fields, otherwise they won't be included when binding
			bands = this.settings.childbands;
			for (i = 0; i < bands.length; i++) {
				if (!bands[i].parentId && bands[i].settings.path) {
					this.schema().schema.fields.push({"name": bands[i].settings.path});
				}
			}
			// 1. bind the parent level first 
			// TODO: consider the case when there isn't schema defined for the parent source and 
			this._callbackInternal = this.settings.callback;
			this._calleeInternal = this.settings.callee;
			this._super(this._dataBindInternal, this);
			return this;
		},
		_dataBindInternal: function () {
			// now we have the root view. A hierarchical data grid must always have one root
			// TODO: think about the scenario where we have multiple "bands" on the same root level? Is this important to consider at all? 
			// now the root is bound and we must bind the children
			// in case any of the bands have a "dataSource" defined, we will use the same approach as the mashup data source to wait for the
			// "slowest"ly bound data source
			var i, mashupHierarchy = false, bands = this.settings.childbands, options;
			for (i = 0; i < bands.length; i++) {
				// we also need to take into account load on demand (i.e. initial data bind depth) 
				if (bands[i].settings.dataSource && this._levelForBand(bands[i]) < this.settings.initialDataBindDepth) {
					mashupHierarchy = true;
					options = {};
					options.callee = this;
					options.callback = this._checkDataBindingComplete;
					//options.responseDataKey = band.settings.path;
					options.schema = bands[i].settings.schema;
					options.dataSource = bands[i].settings.dataSource;
					options.primaryKey = bands[i].settings.primaryKey;
					bands[i].settings.dataSourceObject = new $.ig.DataSource(options);
					// now we have the complete data source 
					this._sourcesStatus[i] = 0; // mark the data source as not bound yet 
					bands[i].settings.dataSourceObject.dataBind();
				}
			}
			if (!mashupHierarchy) {
				this._initializeHierarchies();
			}
		},
		_checkDataBindingComplete: function (status, msg, ownerDs) {
			// once this is done, set it as dataSource of the actual mashup data source, and call super's dataBind()
			var i, bands = this.settings.childbands;
			this._dataBindingComplete = true;
			for (i = 0; i < bands.length; i++) {
				if (bands[i].settings.dataSourceObject === ownerDs) {
					this._sourcesStatus[i] = 1;
				}
				if (this._sourcesStatus[i] === 0) {
					this._dataBindingComplete = false; // still expecting some data source 
				}
			}
			if (this._dataBindingComplete) {
				// proceed to actual binding logic
				this._initializeHierarchies();
			}
		},
		_initializeHierarchies: function () {
			var depth, start, end, rootView, i;
			rootView = this.dataView();
			start = this.settings.startRecord === -1 ? 0 : this.settings.startRecord;
			end = this.settings.endRecord === -1 ? rootView.length : this.settings.endRecord;
			//2. determine the data binding depth to which we should bind
			depth = this.settings.initialDataBindDepth;
			this._initializeLevelsAndSources();
			// initialize root level structure
			this._initializeRootLevelSources();
			depth = depth > this._levels.length - 1 ? this._levels.length - 1 : depth; 
			if (depth >= 1) {
				for (i = 1; i <= depth; i++) {
					this._bindLevel(i, start, end);
				}
			}
			// after everything is bound, now call the real this._callbackInternal and this._calleeInternal
			if (this._callbackInternal) {
				if (this._calleeInternal) {
					this._callbackInternal.apply(this._calleeInternal, [true, "", this]);
				} else {
					this._callbackInternal(true, "", this);
				}
			}
		},
		_initializeLevelsAndSources: function () {
			// the number of levels depends on the bands defined, traverse the bands, but before that we always add the "root" level
			var i, bands = this.settings.childbands, level;
			this._sources = {"root": {"records": {}, "ds": this}};
			this._levels[0] = "root";
			
			for (i = 0; i < bands.length; i++) {
				if (!bands[i].settings.parentId) {
					// no parentId defined, so it's a children of the root band, therefore second level
					if (!this._levels[1]) {
						this._levels[1] = [];
						this._levels[1].push(bands[i].settings.id);
					}
					//this._levels[1][bands[i].id] = {};
				} else {
					// there is a parent band defined, but we must determine its level 
					level = this._levelForBand(bands[i]);
					if (!this._levels[level]) {
						this._levels[level] = [];
						this._levels[level].push(bands[i].id);
					}
					//this._levels[level][bands[i].id] = {};
				}
			}
		},
		_levelForBand: function (band) {
			var i = 0, level = 1, parentId = band.parentId, bands = this.settings.childbands;
			while (!(parentId === undefined || parentId === null || parentId === "")) {
				for (i = 0; i < bands.length; i++) {
					if (bands[i].settings.id === parentId) {
						level++;
						parentId = bands[i].settings.parentId;
						break;
					}
				}
			}
			return level;
		},
		_initializeRootLevelSources: function () {
			var i;
			// do we use the dataView here or the data()
			// could there be any scenario where data() must be used instead of dataView()
			for (i = 0; i < this.dataView().length; i++) {
				//this._sources[this.dataView()[i][this.settings.primaryKey]] = {};
				// TODO: performance ! 
				//this._levels[0].root[this.dataView()[i][this.settings.primaryKey]] = {"rec": this.dataView()[i]};
				this._sources.root.records[this.dataView()[i][this.settings.primaryKey]] = this.dataView()[i];
			}
		},
		_bindRecursively: function (level, recordsObj, currentLevel) {
			var rec, bandsForLevel = this._levels[level], band, j;
			if (currentLevel > level) {
				return;
			}
			for (rec in recordsObj) {
				if (recordsObj.hasOwnProperty(rec)) {
					if (level === currentLevel) {
						// we can now bind the record
						//for (band in bandsForLevel) {
						for (j = 0; j < bandsForLevel.length; j++) {
							//if (bandsForLevel.hasOwnProperty(band)) {
							band = bandsForLevel[j];
							recordsObj[rec][band] = {};
							recordsObj[rec][band].ds = this._createChildSource(band, recordsObj[rec]); 
							
							this._buildRecordsIndices(band, recordsObj[rec][band]);
						}
					} else {
						this._bindRecursively(level, recordsObj[rec], currentLevel + 1);
					}
				}
			}
		},
		_buildRecordsIndices: function (id, b) {
		
			var view, k, i, key;
			
			b.records = {};
			// create hash of child records 
			b.ds.dataBind();
			view = b.ds.dataView();
			for (k = 0; k < this.settings.childbands.length; k++) {
				if (this.settings.childbands[k].settings.id === id) {
					key = this.settings.childbands[k].settings.primaryKey;
				}
			}
			for (i = 0; i < view.length; i++) {
				if (key) {
					// copy references
					b.records[view[i][key]] = view[i];
				} else {
					b.records[i] = view[i];
				}
			}
			//}
		},
		_bindLevel: function (level, start, end) {
			
			//var bandsForLevel, band, i, k, ri, rj, band, parentViews, v, key, curKey, id, parentLevel; // , path
			//var bandsForLevel, parentLevel, band, key, childBand;
			
			// the algorithm is the following: we take the previous level's dataSources, and instantiate data sources for their direct children, that is
			// for the current level passed. If the current "level" is 0, we start with the root data source. 
			//parentLevel = level === 0 ? 0 : level - 1;
			//bandsForLevel = this._levels[parentLevel];
			
			this._bindRecursively(level, this._sources.root.records, 1);
			/*
			for (band in bandsForLevel) { // for the root level this is going to be "root"
				if (bandsForLevel.hasOwnProperty(band)) {
					for (key in band.records) {
						// instantiate the child data sources
						if (band.records.hasOwnProperty(key)) {
							for (childBand in this._levels[level]) {
								// child band name and parent record are passed-in as parameters 
								this._createChildSource(childBand, band.records.key);
							}
						}
					}
				}
			}
			*/
			/*
			for (i = 0; i < bandsForLevel.length; i++) {
				
				band = bandsForLevel[i];
				if (band.parentId === null) {
					parentViews =  [this.dataView()];
				}  else {
					parentViews = this._sources[band.parentId];
				}
				
				key = band.primaryKey;
				
				for (id in parentViews) {
					if (parentViews.hasOwnProperty(id)) {
						v = parentViews.id;
						// data virtualization scenarios 
						ri = start === -1 || start === undefined ? 0 : start;
						rj = end === -1 || end === undefined ? v.length : rj;
						
						for (k = ri; k <= rj; k++) {
							// 3. perform primary key mapping, and instantiate the data source 
							curKey = key === null ? k : v[k].key;
							this._createChildSource(band, curKey);
						}
					}
				}
			}
			*/
		},
		_createChildSource: function (bandId, parentRecord) {
			
			var band, options, i, ds, dv, sameStore = true, pkVal, bands = this.settings.childbands;
			// find the band instance
			for (i = 0; i < bands.length; i++) {
				if (bands[i].settings.id === bandId) {
					band = bands[i];
					break;
				}
			}
			
			if (!band.parentId) {
				// parent is the root
				pkVal = parentRecord[this.settings.primaryKey];
			} else {
				// find the primary key in order to find the primary key value (ID) inside the fields of the parent record
				for (i = 0; i < bands.length; i++) {
					if (bands[i].settings.id === band.parentId) {
						pkVal = parentRecord[bands[i].settings.primaryKey];
						break;
					}
				}
			}
			if (band) {
				options = {};
				//options.responseDataKey = band.settings.path;
				options.schema = band.settings.schema;
				// locate the parent record path (recursively)
				//parentRecord = this._getPath(band, parentKey);
				
				if (band.settings.dataSource === null) {
					// why whas this line below added ? 
					//options = this.settings.dataSource;
					//TODO: settings inheritance 
					options.dataSource = parentRecord[band.settings.path];
					
				} else {
					// the band has a data source defined . We will use that as a base of our current data source for the respective parent key
					// two cases
					// 1. local data
					// 2. remote data -> we need to either encode the parameters, or use OData's $expand
					// when should we data-bind the band? once => if no lazy loading is defined, on every requested child records set => if lazy loading is enabled
					if (band.settings.dataSourceObject && this._levelForBand(bands) < this.settings.initialDataBindDepth) {
						// now we need to do primary & foreign key matching of the records
						// dv - dataView to filter
						// foreignKey => foreign key to filter by 
						dv = band.settings.dataSourceObject.dataView();
						options.dataSource = this._matchRecords(dv, pkVal, band.settings.foreignKey);
						
					} //else {
						// need to pull data remotely, i.e. lazy loading
					//}
				}
				ds = new $.ig.DataSource(options);
				
				// add child bands schema paths 
				if (sameStore) {
					for (i = 0; i < this.settings.childbands.length; i++) {
						if (this.settings.childbands[i].settings.parentId === bandId) {
							ds.schema().schema.fields.push({"name": this.settings.bands[i].settings.path});
						}
					}
				}
				return ds;
			}
			// TODO: change the dataSource to a URL, if it has been loaded remotely	
		},
		// pkVal - value of the primary key from the parent record (actual value, not field name)
		// foreign key field name - the field in the data view records which we should match against pkVal
		_matchRecords: function (dataView, pkVal, fkName) {
			var r = [], i, c = 0;
			for (i = 0; i < dataView.length; i++) {
				if (dataView[i][fkName] === pkVal) {
					r[c++] = dataView[i];
				}
			}
			return r;
		},
		_getPath: function (band, key) {
			var bandPath;
			
			//TODO: consider the case to search XML paths here! 
			// TODO: do various check here if those are not defined 
			//bandPath = band.path ? band.path : band.schema.searchField;
			bandPath = band.path;
			
			// a band path has the format level1Field.level2Field.level3Field
			// an actual path in the dataSource therefore has the format:
			
			// the way we are going to support XML response data is only through combination of sources
			
		},
		// this doesn't return a data source or children, since they may not be even created
		// this works off the raw data source data instead ! 
		// keep in mind the parameter differences between this, and the ones for "getChildSource" and "getChildren"
		hasChildren: function (childRecordsFieldName, path) {
			// path has the format level1[id1].children[id2] => this is basically the id2'th child row of the id1'th root row 
			// TODO: assume JSON for now
			// determine the band first:
			// TODO: handle load on demand scenarios when this is empty, but it actually exists on the backend 
			if (path[childRecordsFieldName].length && path[childRecordsFieldName].length > 0) {
				return true;
			} else {
				return false;
			}
		},
		//getChildSource: function (band, parentKey) {
		//getChildSource: function (bandName, path) {
		// format is: /band1:id/childband1:id/childband3
		// another eg, to get the child source for the fifth root row:
		// /root:5/childband1
		getChildSource: function (path, dataBind) {
			//return path[childRecordsFieldName];
			// path has the format: id1/id2 => this points to the child records of the third level of rows, corresponding to 
			// parent rows id1 => id2 
			
			var pathKeys = path.split('/'), i, sourcePath = this._sources, bandId, recordId;
			for (i = 1; i < pathKeys.length; i++) {
				if (i === pathKeys.length - 1) {
					bandId = pathKeys[i].split(":")[0];
					if (dataBind) {
						sourcePath[bandId] = {};
						//ds = sourcePath[bandId].ds; // this must return an object of type $.ig.DataSource
						sourcePath[bandId].ds = this._createChildSource(bandId, sourcePath);
						this._buildRecordsIndices(bandId, sourcePath[bandId]);
						
						return sourcePath[bandId].ds;
						
					} else {
					
						return sourcePath[bandId].ds;
					}
				} else {
					bandId = pathKeys[i].split(":")[0];
					recordId = pathKeys[i].split(":")[1];
					sourcePath = sourcePath[bandId].records[recordId];
				}
			}
			return null;
		},
		//getChildView: function (band, parentKey) {
		// or just getChildDataRows
		//getChildren: function (bandName, path) {
		getChildren: function (path) {
			//return this._sources.band.parentKey instanceof $.ig.DataSource ? this._sources.band.parentKey.dataView() : null;
			//return path[childRecordsFieldName];
			return this.getChildSource(path).dataView();
		},
		bindChildren: function (path) {
			return this.getChildSource(path, true);
		}
	});
	
	// every band has a flat data source associated to it. Also, this flat source may have multiple data Views loaded 
	// a band defines the relation as well, through the parentId property in the constructor params 
	$.ig.Band = $.ig.Band || Class.extend({
		
		// if dataSource is not defined here, we create it automatically, so searchField from the schema or path will basically use the 
		// parent's $ig.DataSource dataSource property. 
		settings: {
			id: null,
			parentId: null, // if there is no parent ID defined, we assume the unique identifier is the parent record index. 
			path: null,
			schema: null,
			dataSource: null,
			primaryKey: null,
			foreignKey: null
		},
		
		init: function (options) {
		
			this.settings = $.extend(true, {}, $.ig.Band.prototype.settings, options);
			this._ds = null;
		}
		// here a developer can supply either the options to construct the data source, or the actual data source instance 
		// suppying a data source instance can satisfy very flexible scenarios, such as making hierarchies from mashup sources (that is sources which
		// on their own combine more than several flat sources) 
		/*
		dataSource: function (ds) {
		
		},
		id: function (id) {
		
		},
		path: function (p) {
		
		},
		schema: function (s) {
		
		},
		parentId: function (id) {
		
		}
		*/
	});
}(jQuery));
(function ($) {

	$.extend( $.ig.DataSource , {
	
		locale : {
			invalidDataSource: "The supplied data source is invalid. It happens to be a scalar.",
			unknownDataSource: "Cannot determine the data source type. Please specify if it is JSON or XML data.",
			errorParsingArrays: "There was an error parsing the array data and applying the defined data schema: ",
			errorParsingJson: "There was an error parsing the JSON data and applying the defined data schema: ",
			errorParsingXml: "There was an error parsing the XML data and applying the defined data schema: ",
			errorParsingHtmlTable: "There was an error extracting the data from the HTML Table and applying the schema : ",
			errorExpectedTbodyParameter: "Expected a tbody or a table as a parameter.",
			errorTableWithIdNotFound: "The HTML Table with the following ID was not found: ",
			errorParsingHtmlTableNoSchema: "There was an error parsing the Table DOM: ",
			errorParsingJsonNoSchema: "There was an error parsing/evaluating the JSON string: ",
			errorParsingXmlNoSchema: "There was an error parsing the XML string: ",
			errorXmlSourceWithoutSchema: "The supplied data source is an xml document, but there is no defined data schema ($.IgDataSchema) ",
			errorUnrecognizedFilterCondition: " The filter condition that was passed was not recognized: ",
			errorRemoteRequest: "The remote request to fetch data has failed: ", 
			errorSchemaMismatch: "The input data doesn't match the schema, the following field couldn't be mapped: ",
			errorSchemaFieldCountMismatch: "The input data doesn't match the schema in terms of number of fields. ",
			errorUnrecognizedResponseType: "The response type was either not set correctly, or it was not possible to detect it automatically. Please set settings.responseDataType and/or settings.responseContentType.",
			hierarchicalTablesNotSupported: "Tables are not supported for HierarchicalSchema",
            cannotBuildTemplate: "The jQuery template could not be built. There are no records present in the data source, and no columns defined.",
			unrecognizedCondition: "Unrecognized filtering condition in the following expression: ",
			fieldMismatch: "The following expression contains an invalid field or filtering condition: ",
			noSortingFields: "There are no fields specified. You need to specify at least one field to sort by, when calling sort().",
			filteringNoSchema: "There is no schema / fields specified. You need to specify a schema with field definitions and types to be able to filter the data source."
		}
	});

}(jQuery));
/*
 * Infragistics.Web.ClientUI jQuery Shared 11.1.20111.1014
 *
 * Copyright (c) 2011 Infragistics Inc.
 * <Licensing info>
 *
 * http://www.infragistics.com/
 *
 * Depends on:
 *  jquery-1.4.2.js
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  ig.util.js
 */
 
/*global window */
/*global jQuery */
(function ($) {
	// Loading indicator widget 
    $.widget("ui.igLoading", {
		options: {
			cssClass: null
		},
		_indicator: null,
		_create: function () {
			// M.H. 13 May 2011 fix bug 75501
			var offset, css;
			
			css = this.options.cssClass === null ? "ui-igloadingmsg" : this.options.cssClass;
			if (this.element.children('.' + css).length === 0) {
				this._indicator = $('<span></span>').appendTo("body").attr('id', this.element[0].id + '_loading').addClass(css);
				// calculate position
				//op = this.element.offsetParent();
				//if (op.is('body')) {
				offset = this.element.offset();
				//} else {
				//	offset = op.position();
				//}
				this._indicator.css('left', offset.left + this.element.innerWidth() / 2).css('top', offset.top + this.element.innerHeight() / 2);
			}
		},
		indicatorElement: function () {
			return this._indicator;
		},
		indicator: function () {
			return this;
		},
		show: function () {
			this.refreshPos();
			this._resId = setInterval($.proxy(this._resizeContainer, this), 300);
			this._indicator.show();
		},
		hide: function () {
			this._indicator.hide();
			clearInterval(this._resId);
		},
		_resizeContainer: function () {
			var offset = this.element.offset();
			if (offset.top + this.element.innerHeight() / 2 !== this._indicator.css('top')) {
				this.refreshPos();
			}
		},
		refreshPos: function () {
			var offset = this.element.offset();
			this._indicator.css('left', offset.left + this.element.innerWidth() / 2).css('top', offset.top + this.element.innerHeight() / 2);
		},
		destroy: function () {
			clearInterval(this._resId);
			this._indicator.remove();
		}
    });
    $.extend($.ui.igLoading, {version: '11.1.20111.1014'});

	$.widget("ui.igSlider", $.ui.mouse, {
		options: {
			/* type="bool" Get or set whether the slide handle will animate when it is moved. */
			animate: false,
			/* type="number" Get or set the slider range maximum value. */
			max: 100,
			/* type="number" Get or set the slider range minimum value. */
			min: 0,
			/* type="horizontal|vertical" Get or set the slider orientation. */
			orientation: 'horizontal',
			/* type="number" Get or set the step with which the value is increased. */
			step: 1,
			/* type="number" Get or set the slider value. */
			value: 0,
			/* Get or set the bookmarks array. */
			bookmarks: [{
				/* type="number" Get or set the bookmark value. Should be between slider min and max values. */	
				value: 0,
				/* type="string" Get or set the bookmark title. Show in tooltip on hover. */
				title: '',
				/* type="bool" Get or set whether the bookmark is disabled or not. */
				disabled: false,
				/* type="string" Get or set a custom css class to be applied to the bookmark anchor element. */
				css: ''
		    }],
			/* type="bool" Get or set the whether to show bookmarks title on bookmark hover or not. */
			showBookmarkTitle: true,
			/* type="bool" Get or set whether the handle will be moved to the bookmark position when a bookmark is clicked. */
			syncHandleWithBookmark: true
		},

		css: {
			/* Get or set the widget base CSS classes. */
			"baseClasses" : "ui-igslider ui-widget ui-widget-content ui-corner-all",
			/* Get or set the CSS class applied to the widget when orientation is horizontal. */
			"horizontalOrientationClass" : "ui-igslider-horizontal",
			/* Get or set the CSS class applied to the widget when orientation is vertical. */
			"verticalOrientationClass" : "ui-igslider-vertical",
			/* Get or set the CSS class applied when the widget is disabled. */
			"sliderDisabledClass" : "ui-igslider-disabled ui-disabled",
			/* Get or set the CSS class applied on the slider handle. */
			"handleClass" : "ui-igslider-handle",
			/* Get or set the CSS class applied on the bookmark anchors. */
			"bookmarkClass" : "ui-igslider-bookmark",
			/* Get or set the CSS class applied on the bookmarks when they are disabled. */
			"bookmarkDisabledClass" : "ui-igslider-bookmark-disabled",
			/* Get or set the CSS class applied on the bookmark tooltips. */
			"bookmarkTooltipClass" : "ui-igslider-bookmark-tooltip"
		},

		events: {
			/* cancel="true" Defines the slide start event. */
			start: "start",
			/* cancel="true" Defines the slide event. Fired when the user is sliding with mouse. */
			slide: "slide",
			/* Defines the slide stop event. Fired to mark the end of a sliding action. */
			stop: "stop",
			/* Defines the slider value change event. Fired when the value of the slider changes. It fires after the slide event. */
			change: "change",
			/* Defines the slider bookmark hit event. Fired when the slider handle passes after the bookmark value. */
			bookmarkHit: "bookmarkhit",
			/* cancel="true" Defines the slider bookmark click event. Fired when a bookmark is clicked. */
			bookmarkClick: "bookmarkclick"
		},

		_numpages : 5,
		
		widget: function () {
		    return this.element;
	    },

		_createWidget: function (options, element) {
			/* !Strip dummy objects from options, because they are defined for documentation purposes only! */
			this.options.bookmarks = [];
			$.Widget.prototype._createWidget.apply(this, arguments);
		},

		_create: function () {
			var o = this.options,
				self = this,
				css = this.css;
			this._keySliding = false;
			this._mouseSliding = false;
			this._animateOff = true;
			this._handleIndex = null;
			this._detectOrientation();
			this._mouseInit();

			this.element.addClass(css.baseClasses);

			if (o.disabled) {
				this.element.addClass(css.sliderDisabledClass);
			}

			if ($(".ui-igslider-handle", this.element).length === 0) {
				$("<a href='#'></a>").appendTo(this.element).addClass(css.handleClass);
			}

			this.handles = $(".ui-igslider-handle", this.element).addClass("ui-state-default" + " ui-corner-all").bind({
				click: function (event) {
					event.preventDefault();
				},
				mouseover: function () {
					if (!o.disabled) {
						$(this).addClass("ui-state-hover");
					}
				},
				mouseout: function () {
					$(this).removeClass("ui-state-hover");
				},
				focus: function () {
					if (!o.disabled) {
						$(".ui-igslider .ui-state-focus").removeClass("ui-state-focus");
						$(this).addClass("ui-state-focus");
					} else {
						$(this).blur();
					}
				},
				blur: function () {
					$(this).removeClass("ui-state-focus");
				},
				keydown: function (event) {
					var ret = true,
						index = $(this).data("index.ui-igslider-handle"),
						allowed,
						curVal,
						newVal,
						step;
		
					if (self.options.disabled) {
						return;
					}
		
					switch (event.keyCode) {
					case $.ui.keyCode.HOME:
					case $.ui.keyCode.END:
					case $.ui.keyCode.PAGE_UP:
					case $.ui.keyCode.PAGE_DOWN:
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						ret = false;
						if (!self._keySliding) {
							self._keySliding = true;
							$(this).addClass("ui-state-active");
							allowed = self._start(event, index);
							if (allowed === false) {
								return;
							}
						}
						break;
					}
		
					step = self.options.step;					
					curVal = newVal = self.value();
		
					switch (event.keyCode) {
					case $.ui.keyCode.HOME:
						newVal = self.options.min;
						break;
					case $.ui.keyCode.END:
						newVal = self.options.max;
						break;
					case $.ui.keyCode.PAGE_UP:
						newVal = self._trimValue(curVal + ((self.options.max - self.options.min) / this._numpages));
						break;
					case $.ui.keyCode.PAGE_DOWN:
						newVal = self._trimValue(curVal - ((self.options.max - self.options.min) / this._numpages));
						break;
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
						if (curVal === self.options.max) {
							return;
						}
						newVal = self._trimValue(curVal + step);
						break;
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						if (curVal === self.options.min) {
							return;
						}
						newVal = self._trimValue(curVal - step);
						break;
					}
		
					self._slide(event, index, newVal);
		
					return ret;		
				},
				keyup: function (event) {
					var index = $(this).data("index.ui-igslider-handle");

					if (self._keySliding) {
						self._keySliding = false;
						self._stop(event, index);
						self._change(event, index);
						$(this).removeClass("ui-state-active");
					}
				}
			}).each(function (i) {
				$(this).data("index.ui-igslider-handle", i);
			});

			this.handle = this.handles.eq(0);
			
			this._renderBookmarks();

			this._refreshValue();

			this._animateOff = false;
		},
		
		_renderBookmarks: function () {
			if (this.options.bookmarks && this.options.bookmarks.length > 0) {
				var len = this.options.bookmarks.length,
					i = 0,
					o = this.options,
					css = this.css,
					mark,
					self = this;

				for (i; i < len; i++) {
					mark = o.bookmarks[i];
					$("<a href='#'></a>").appendTo(this.element).data("index.ui-igslider-bookmark", i).addClass(mark.disabled ? css.bookmarkDisabledClass : css.bookmarkClass).addClass(mark.css && mark.css.length > 0 ? mark.css : '').css('left', (o.min !== o.max) ? ((mark.value - o.min) / (o.max - o.min) * 100) + '%' : '0%');
				}

				this.bookmarks = $(".ui-igslider-bookmark", this.element).addClass("ui-state-default").bind({
					mousedown: function (event) {
						var noCancel = true,
							bookmarkIndex = $(this).data("index.ui-igslider-bookmark");
						event.preventDefault();
						event.stopPropagation();
						noCancel = self._bookmarkClicked(event, bookmarkIndex);
						if (self.options.syncHandleWithBookmark && noCancel) {
							self._slide(event, 0, self.options.bookmarks[bookmarkIndex].value);
						}
					},
					// K.D. May 28, 2011 Bug #68785 we need the browser event to position the tooltip
					mouseover: function (event) {
						if (!o.disabled) {
							$(this).addClass("ui-state-hover");
							if (self.options.showBookmarkTitle) {
								self._showBookmarkTitle($(this), event);
							}
						}
					},
					mouseout: function () {
						if (!o.disabled) {
							$(this).removeClass("ui-state-hover");
							if (self.options.showBookmarkTitle) {
								self._hideBookmarkTitle($(this));
							}
						}
					},
					// K.D. May 27, 2011 Bug #73417 The browser window jumps if we don't prevent the default action of the
					// bookmark click
					click: function (event) {
						event.preventDefault();
					}
				});
				this._createBookmarkTooltip();
				this._buildBookmarkHit();
			}
		},

		destroy: function () {
			this.handles.remove();
			this.clearBookmarks();

			this.element
				.removeClass(this.css.baseClasses +
					" ui-igslider-horizontal" +
					" ui-igslider-vertical" +
					" ui-igslider-disabled")
				.removeData("slider")
				.unbind(".slider");

			this._mouseDestroy();

			return this;
		},
		
		_id: function (suffix) {
			return this.element[0].id + suffix;
		},

		_showBookmarkTitle: function (bookmark, browserEvent) {
			var tooltip = $('#' + this._id('_tooltip')),
				offset = bookmark.position(),
				title = this.options.bookmarks[bookmark.data("index.ui-igslider-bookmark")].title;
			if (title && title.length > 0) {
				tooltip.igTooltip('option', 'text', title);
				// K.D. May 28, 2011 Bug #68785 we need the browser event to position the tooltip
				tooltip.css('top', browserEvent.pageY - tooltip.outerHeight() - 5)
					.css('left', browserEvent.pageX - (tooltip.width() / 2) + (bookmark.width() / 2)).show();
			}
		},

		_hideBookmarkTitle: function (bookmark) {
			$('#' + this._id('_tooltip')).hide();
		},

		_createBookmarkTooltip: function () {
			var html = '<div id="' + this._id("_tooltip") + '" class="' + this.css.bookmarkTooltipClass + '"></div>';
			// K.D. May 28, 2011 Bug #68785 we beed the tooltip attached to the body to position it correctly when needed
			$(html).appendTo($(document.body)).igTooltip({
				arrowLocation: 'bottom'
			}).hide();
		},
		
		clearBookmarks: function () {
			if (this.bookmarks) {
				this.bookmarks.remove();
			}
		},

		_mouseCapture: function (event) {
			var o = this.options,
				position,
				normValue,
				index = 0,
				handle = this.handles.eq(index),
				self = this,
				allowed,
				offset,
				mouseOverHandle;

			if (o.disabled) {
				return false;
			}

			this.elementSize = {
				width: this.element.outerWidth(),
				height: this.element.outerHeight()
			};
			this.elementOffset = this.element.offset();

			position = { x: event.pageX, y: event.pageY };
			normValue = this._normValueFromMouse(position);
			allowed = this._start(event, index);
			if (allowed === false) {
				return false;
			}
			this._mouseSliding = true;

			self._handleIndex = index;

			handle.addClass("ui-state-active");
			if (!$.browser.opera) {
				handle.focus();
			}

			offset = handle.offset();
			mouseOverHandle = !$(event.target).parents().andSelf().is(".ui-igslider-handle");
			this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
				left: event.pageX - offset.left - (handle.width() / 2),
				top: event.pageY - offset.top -
					(handle.height() / 2) -
					(parseInt(handle.css("borderTopWidth"), 10) || 0) -
					(parseInt(handle.css("borderBottomWidth"), 10) || 0) +
					(parseInt(handle.css("marginTop"), 10) || 0)
			};

			this._slide(event, index, normValue);
			this._animateOff = true;
			return true;
		},

		_mouseStart: function (event) {
			return true;
		},

		_mouseDrag: function (event) {
			var position = { x: event.pageX, y: event.pageY },
				normValue = this._normValueFromMouse(position);
			
			this._slide(event, this._handleIndex, normValue);

			return false;
		},

		_mouseStop: function (event) {
			this.handles.removeClass("ui-state-active");
			this._mouseSliding = false;

			this._stop(event, this._handleIndex);
			this._change(event, this._handleIndex);

			this._handleIndex = null;
			this._clickOffset = null;
			this._animateOff = false;

			return false;
		},
		
		_detectOrientation: function () {
			var o = this.options,
				css = this.css;
			if (o.orientation === "vertical") {
				this.orientation = "vertical";
				this.element.removeClass(css.horizontalOrientationClass).addClass(css.verticalOrientationClass);
			} else {
				this.orientation = "horizontal";
				this.element.removeClass(css.verticalOrientationClass).addClass(css.horizontalOrientationClass);
			}
		},

		_normValueFromMouse: function (position) {
			var pixelTotal,
				pixelMouse,
				percentMouse,
				valueTotal,
				valueMouse;

			if (this.orientation === "horizontal") {
				pixelTotal = this.elementSize.width;
				pixelMouse = position.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0);
			} else {
				pixelTotal = this.elementSize.height;
				pixelMouse = position.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0);
			}

			percentMouse = (pixelMouse / pixelTotal);
			if (percentMouse > 1) {
				percentMouse = 1;
			}
			if (percentMouse < 0) {
				percentMouse = 0;
			}
			if (this.orientation === "vertical") {
				percentMouse = 1 - percentMouse;
			}

			valueTotal = this.options.max - this.options.min;
			valueMouse = this.options.min + percentMouse * valueTotal;

			return this._trimValue(valueMouse);
		},

		_start: function (event, index) {
			var uiHash = {
				handle: this.handles[index],
				value: this.value()
			};
			return this._trigger(this.events.start, event, uiHash);
		},

		_slide: function (event, index, newVal) {
			var allowed;
			if (newVal !== this.value()) {
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger(this.events.slide, event, {
					handle: this.handles[index],
					value: newVal
				});
				if (allowed !== false) {
					this.value(newVal);
				}
			}
		},

		_stop: function (event, index) {
			var uiHash = {
				handle: this.handles[index],
				value: this.value()
			};
			this._trigger(this.events.stop, event, uiHash);
		},

		_change: function (event, index) {
			if (!this._keySliding && !this._mouseSliding) {
				var uiHash = {
						handle: this.handles[index],
						value: this.value()
					};
				this._trigger(this.events.change, event, uiHash);
				this._checkBookmarkHit(uiHash.value, event);
				if (uiHash.value === this.options.max && this._marksHit && this._marksHit.length === 0) {
					this._buildBookmarkHit();
				}
			}
		},

		_checkBookmarkHit: function (currentValue, event) {
			if (this._marksHit && this._marksHit.length > 0 && currentValue >= this._marksHit[0].value) {
				var index = this._marksHit[0].index;
				this._marksHit.shift();
				this._bookmarkHit(event, index);
			}
		},
		
		_buildBookmarkHit: function () {
			var b = this.options.bookmarks || [],
				i = b.length - 1;
			this._marksHit = [];
			for (; i >= 0; i--) {
				if (!b[i].disabled) {
					this._marksHit.push({value: b[i].value, index: i });
				}
			}
			this._marksHit.sort(this._sortBookmarksJSON);
			this._marksHit = $.extend(true, [], this._marksHit);
		},

		_sortBookmarksJSON: function (a, b) {
			return (a.value - b.value);
		},

		_bookmarkClicked: function (event, index) {
			var uiHash = {
				bookmarkElement: this.bookmarks[index],
				bookmark: this.options.bookmarks[index]
			};
			return this._trigger(this.events.bookmarkClick, event, uiHash);
		},

		_bookmarkHit: function (event, index) {
			var uiHash = {
				bookmarkElement: this.bookmarks[index],
				bookmark: this.options.bookmarks[index]
			};

			if (uiHash.bookmarkElement && $(uiHash.bookmarkElement).is(':visible')) {
				this._trigger(this.events.bookmarkHit, event, uiHash);
			}
		},

		value: function (newValue) {
			if (arguments.length) {
				this.options.value = this._trimValue(newValue);
				this._refreshValue();
				this._change(null, 0);
			}
			return this._value();
		},

		_setOption: function (key, value) {
			$.Widget.prototype._setOption.apply(this, arguments);

			switch (key) {
			case "disabled":
				if (value) {
					this.handles.filter(".ui-state-focus").blur();
					this.handles.removeClass("ui-state-hover");
					this.handles.attr("disabled", "disabled");
					this.element.addClass("ui-disabled");
				} else {
					this.handles.removeAttr("disabled");
					this.element.removeClass("ui-disabled");
				}
				break;
			case "orientation":
				this._detectOrientation();
				this._refreshValue();
				break;
			case "value":
				this._animateOff = true;
				this._refreshValue();
				this._change(null, 0);
				this._animateOff = false;
				break;
			case "bookmarks":
				this.clearBookmarks();
				this._renderBookmarks();
				break;
			}
		},

		_value: function () {
			return this._trimValue(this.options.value);
		},

		_trimValue: function (val) {
			if (val < this.options.min) {
				return this.options.min;
			}
			if (val > this.options.max) {
				return this.options.max;
			}
			var step = (this.options.step > 0) ? this.options.step : 1,
				valModStep = val % step,
				alignValue = val - valModStep;

			if (Math.abs(valModStep) * 2 >= step) {
				alignValue += (valModStep > 0) ? step : (-step);
			}
			return parseFloat(alignValue.toFixed(5));
		},

		_normPercentValue: function (val) {
			var decrease = 0, retVal = val;
			if (this.orientation === 'vertical') {
				decrease = (this.handle.outerHeight() / this.element.outerHeight()).toFixed(2) * 100;
			}
			if (val - decrease > 0) {
				retVal = val - decrease;
			}
			return retVal;
		},

		_refreshValue: function () {
			var o = this.options,
				control = this,
				animate = (!this._animateOff ? o.animate : false),
				_set = {},
				value = this.value(),
				valueMin = this.options.min,
				valueMax = this.options.max,
				valPercent = (valueMax !== valueMin) ? (value - valueMin) / (valueMax - valueMin) * 100 : 0;
			_set[control.orientation === "horizontal" ? "left" : "bottom"] = this._normPercentValue(valPercent) + "%";
			this.handle.stop(1, 1)[animate ? "animate" : "css"](_set, o.animate);
		}
	});
	$.extend($.ui.igSlider, {version: '11.1.20111.1014'});

	$.widget("ui.igProgressBar", {
		options: {
			animate: false,
            animateTimeout: 100,
			max: 100,
			min: 0,
			orientation: 'horizontal',
			value: 0,
			width: '0px',
			height: '0px',
			range: false,
			endValue: 100 // show discontinous progress. I.e. we have data between value and endValue.
		},

		css: {
			"baseClasses" : "ui-igprogressbar ui-widget ui-widget-content ui-corner-all",
			"horizontalOrientationClass" : "ui-igprogressbar-horizontal",
			"verticalOrientationClass" : "ui-igprogressbar-vertical",
			"disabledClass" : "ui-igprogressbar-disabled ui-disabled",
			"progressRangeClass" : "ui-igprogressbar-range ui-widget-header ui-corner-all"
		},

		events: {
			change: "change"
		},

		_animationOff : true,
		
		widget: function () {
		    return this.element;
	    },

		_detectOrientation: function () {
			var css = this.css;
			if (this.options.orientation === "vertical") {
				this.orientation = "vertical";
				this.element.removeClass(css.horizontalOrientationClass).addClass(css.verticalOrientationClass);
			} else {
				this.orientation = "horizontal";
				this.element.removeClass(css.verticalOrientationClass).addClass(css.horizontalOrientationClass);
			}
		},
		
		_id: function (suffix) {
			return this.element[0].id + suffix;
		},

		_create: function () {
			var o = this.options,
				css = this.css;

			this._detectOrientation();

			this.element.addClass(css.baseClasses);
			
			if (o.disabled) {
				this.element.addClass(css.disabledClass);
			}

			if (o.width !== '0px') {
				this.element.css('width', o.width);
			}

			if (o.height !== '0px') {
				this.element.css('height', o.height);
			}

			if (o.orientation === 'horizontal') {
				$('<div id="' + this._id('_progress') + '" class="' + css.progressRangeClass + '" style="height:100%; top:0px; left:0%; width:0%;"></div>').appendTo(this.element);
			} else {
				$('<div id="' + this._id('_progress') + '" class="' + css.progressRangeClass + '" style="height:0%; bottom:0%; left:0px; width:100%;"></div>').appendTo(this.element);
			}

			this._refreshValue();
		},

		destroy: function () {
			this.element
				.removeClass("ui-igprogressbar" +
					" ui-igprogressbar-horizontal" +
					" ui-igprogressbar-vertical" +
					" ui-igprogressbar-disabled" +
					" ui-widget" +
					" ui-widget-content" +
					" ui-corner-all")
				.removeData("igProgressBar")
				.unbind(".igProgressBar");
			$('#' + this._id('_progress')).remove();
			return this;
		},

		_change: function (event) {
			var uiHash = {
				value: this.value()
			};
			this._trigger(this.events.change, event, uiHash);
		},

		value: function (newValue) {
			if (arguments.length) {
				this.options.value = this._trimValue(newValue);
				this._refreshValue();
				this._change(null);
			}
			return this.options.value;
		},

		_setOption: function (key, value) {
			$.Widget.prototype._setOption.apply(this, arguments);
			var o = this.options;
			switch (key) {
			case "disabled":
				if (value) {
					this.element.addClass(this.css.disabledClass);
				} else {
					this.element.removeClass(this.css.disabledClass);
				}
				break;
			case "orientation":
				this._detectOrientation();
				this._refreshValue();
				break;
			case "value":
				this._animationOff = true;
				o.value = this._trimValue(value);
				this._refreshValue();
				this._change(null);
				this._animationOff = false;
				break;
			case "endValue":
				o.endValue = this._trimValue(value);
				this._refreshValue();
				break;
			case "max":
				if (o.endValue > o.max) {
					o.endValue = o.max;
					this._refreshValue();
				}
				break;
			case "width":
				this.element.css('width', value);
				break;
			case "height":
				this.element.css('height', value);
				break;
            case "animate":
                o.animate = value;
                break;
            case "animateTimeout":
                o.animateTimeout = value;
                break;
			default:
				break;
			}
		},

		_trimValue: function (val) {
			if (val < this.options.min) {
				return this.options.min;
			}
			if (val > this.options.max) {
				return this.options.max;
			}
			return parseInt(val, 10);
		},

		_refreshValue: function () {
			var o = this.options,
				value = o.value,
				valueMin = o.min,
				valueMax = o.max,
				valueEnd = o.endValue,
				valPercent = (valueMax !== valueMin) ? (value - valueMin) / (valueMax - valueMin) * 100 : 0,
				valueEndPercent = (value !== valueEnd) ? (valueEnd - value) / (valueMax - valueMin) * 100 : 0, 
                progressBar = $('#' + this._id('_progress'));
			if (o.range) {
				if (o.orientation === 'horizontal') {
					progressBar.css('left', valPercent + '%').css('width', valueEndPercent + '%');
				} else {
					progressBar.css('bottom', valPercent + '%').css('height', valueEndPercent + '%');
				}
			} else {
                if (o.animate === true) {
                    if (o.orientation === 'horizontal') {
                        // in Opera animate width property throws error when width/height is firstly set as 0%
                        if (progressBar[0].style.width === '0%') {
                            progressBar.css({width: '0px'});
                        }
                        //fix for IE, when progress bar is hidden and try to animate throws error
                        if (progressBar.is(':hidden') === false) {
                            progressBar.animate({width: valPercent + '%'}, o.animateTimeout);
                        } else {
                            progressBar.css('width', valPercent + '%');
                        }
				    } else {
                        // in Opera animate width property throws error when width/height is firstly set as 0%
                        if (progressBar[0].style.height === '0%') {
                            progressBar.css({height: '0px'});
                        }
                        //fix for IE, when progress bar is hidden and try to animate throws error
                        if (progressBar.is(':hidden') === false) {
                            progressBar.animate({height: valPercent + '%'}, o.animateTimeout);
                        } else {
                            progressBar.animate({'height': valPercent + '%'}, o.animateTimeout);
                        }
				    }
                } else {
				    if (o.orientation === 'horizontal') {
					    progressBar.css('width', valPercent + '%');
				    } else {
					    progressBar.css('height', valPercent + '%');
				    }
                }
			}
		}
	});
	$.extend($.ui.igProgressBar, {version: '11.1.20111.1014'});
	
    //////////////////////////////////////////////////////////
    //For now igButton could be applied to these elements:
    //  1. input type="button" 
    //  2. input type="submit"
    //  3. a
    //  4. div
    //////////////////////////////////////////////////////////
    
    $.widget("ui.igButton", {
        options: {
	        width: null,
	        height: null,
	        link: { href: null, target: null, title: null },
	        labelText: "",
	        centerLabel: false,
	        css: null, 
            onlyIcons: false,
            icons: {primary: null, secondary: null},
			// M.H. 12 May 2011 - fix bug 74763: add new option for title
            title: false
	    },

        _id: function (suffix) {
			return this.element[0].id + suffix;		
        },
        
        _create: function () {
            var self = this, o = self.options,
                e = this.element,
                inputType,
                css = {
                    //            "baseClasses": "ui-widget ui-igbutton ui-button ui-state-default",
                    //            "baseDisabledClass": "ui-igbutton-disabled ui-state-disabled",
                    /* class for IE6 */
                    "buttonClassIE6": "ui-ie6",
                    "buttonClasses": "ui-button ui-igbutton ui-widget ui-widget-content ui-corner-all ui-state-default",
                    "buttonHoverClasses": "ui-state-hover",
                    "buttonActiveClasses": "ui-state-active", //when button is clicked 
                    "buttonFocusClasses": "ui-state-focus", //when button get focus
                    "buttonLabelClass": "ui-button-text",
                    "buttonDisabledClass": "ui-state-disabled",
                    "buttonPrimaryIconClass": "ui-button-icon-primary ui-icon",
                    "buttonMainElementPrimaryIconClass": " ui-button-text-icon-primary",
                    "buttonMainElementSecondaryIconClass": " ui-button-text-icon-secondary",
                    "buttonSecondaryIconClass": "ui-button-icon-secondary ui-icon", 
                    "buttonIconsOnly": "ui-button-icons-only",
                    "buttonIconOnly": "ui-button-icon-only",
                    "buttonIcons": "ui-button-text-icons", 
                    "buttonTextOnlyClass" : "ui-button-text-only"
                };
            
            this._attached = false;

            o.css = $.extend(css, o.css);
            self._getInitValues();

            if (e.is('div')) {
                self._renderDivButton();
            } else if (e.is('a')) {
                self._renderAHref();
            } else if (e.is('input')) {
                inputType = e.attr('type').toUpperCase();
                if (inputType === 'BUTTON' || inputType === 'SUBMIT' || inputType === 'RESET') {
                    self._renderInput();
                } else {
                    // we could not render button for other types
                    return;
                }
            } else if (e.is('button')) {
                self._renderButton();
            } else {
                // we could not render button for other DOM types
                return;
            }
            
            if (o.width !== null) {
                self._setWidth(o.width);
            }
            if (o.height !== null) {
                self._setHeight(o.height);
            }

            e.addClass(o.css.buttonClasses).addClass(o.css.buttonDefaultClasses);
            
            if ($.browser.msie === true && $.browser.version.slice(0, 1) === "6") {
                e.addClass(css.buttonClassIE6);
            }
            if (o.centerLabel === true) {
                self._centerLabel();
			}
            
            if (o.disabled) {
                self._disableButton(); //it should be dettached events too
			} else {                
                self._enableButton();
			}
            self._setOnlyIcons();
            
            /* HTML 5 Properties */
            e.attr("role", "button");
            e.attr("aria-disabled", "false");
            /* //HTML 5 Properties */
            
            self._attachButtonEvents();
			
			// M.H. 12 May 2011 - fix bug 74763:
            self.setTitle(o.title);
            return this;
        },
        
		setTitle: function (title) {
            // M.H. 12 May 2011 - fix bug 74763: add method setTitle - add/remove title attribute
            var e = this.element;

            if (title === false) {
                e.removeAttr('title');
            } else {
                e.attr('title', title);
            }
        },
		
        widget: function () {
		    return this.element;
	    },

        _isRedirect: function () {
            return this.options.link.href !== null;
        },
        /* render button functions according to tag name of main element of widget */

        _renderDivButton: function () {
            this._setLabel();
        },

        _renderAHref: function () {
            //set link properties if it is set in options            
            this._setLinkOptions(true);
            this._setLabel();            
        },

        _renderInput: function () {
            var e = this.element;
            
            e.attr('value', this.options.labelText);            
        },

        _renderButton: function () {
            this._setLabel();
        },

        /* //render button functions according to tag name */
        _disableButton: function () {
            var self = this, e = self.element;
            e.addClass(self.options.css.buttonDisabledClass);            

            //we should remove attributes for A because in FF disabled attribute does not work for anchors
            if (e.is('a') === true) {
                e.removeAttr('href');
                e.removeAttr('target');
                e.removeAttr('title');
            } else {
                e.attr('disabled', 'true');
            }
        },

        _enableButton: function () {
            var self = this, e = self.element, o = this.options;

            if (e.hasClass(o.css.buttonDisabledClass)) {
                e.removeClass(o.css.buttonDisabledClass);
            }
            
            e.removeAttr('disabled');
            if (e.is('a') === true) {
                self._setLinkOptions(true);
            }
        },

        _setLabel: function () {
            var e = this.element, 
                o = this.options, 
                icons = o.icons,
                css = o.css,
                html = '',
                isSetPrimary = this._isSetPrimaryIcon(), 
                isSetSecondary = this._isSetSecondaryIcon(), 
                labelText = (o.labelText === null || o.labelText === '') ? e.text() : o.labelText;
            
            e.attr('title', o.labelText);

            if (e.is('input')) {
                e.attr('value', o.labelText);
                return;
            }
            
            if (isSetPrimary) {                
                html += '<span class="' + css.buttonPrimaryIconClass + ' ' + icons.primary + '" id="' + this._id('_picn') + '"></span>';
            }           
            
            html += '<span class="' + o.css.buttonLabelClass + '" id="' + this._id('_lbl') + '">' + labelText + '</span>';
            if (isSetSecondary) {
                html += '<span class="' + css.buttonSecondaryIconClass + ' ' + icons.secondary + '" id="' + this._id('_sicn') + '"></span>';
            }
            
            if (isSetPrimary && isSetSecondary && !o.onlyIcons) {
                e.addClass(css.buttonIcons);
            } else if (o.onlyIcons) {
                this._setOnlyIcons();
            } else if (isSetPrimary) {
                e.addClass(css.buttonMainElementPrimaryIconClass);
            } else if (isSetSecondary) {
                e.addClass(css.buttonMainElementSecondaryIconClass);
            } else {
                e.addClass(css.buttonTextOnlyClass);
            }

            e.html(html);
        },

        _setOnlyIcons: function () {
            var e = this.element, css = this.options.css;
            if (this.options.onlyIcons === false) {
                if (e.hasClass(css.buttonIconsOnly)) {
                    e.removeClass(css.buttonIconsOnly);
                }
                if (e.hasClass(css.buttonIconOnly)) {
                    e.removeClass(css.buttonIconOnly);
                }
                if (this._isSetPrimaryIcon() && this._isSetSecondaryIcon()) { 
                    e.addClass(css.buttonIcons);
                }
            } else {
                if (this._isSetPrimaryIcon() && this._isSetSecondaryIcon()) {
                    e.addClass(css.buttonIconsOnly);
                } else {
                    e.addClass(css.buttonIconOnly);
                }                
            }
        },

        _setLinkOptions: function (isAHref) {
            var self = this, e = self.element, o = this.options;
            //if main element is really isAHref then we should only set its attributes 
            //otherwise we should set as inner data its properties and             
            if (isAHref) {
                //set link properties if it is set in options
                if (o.link !== null && o.link.href !== null) {
                    e.attr('href', o.link.href);
                } else {
                    e.removeAttr('href');
                }

                if (o.link !== null && o.link.target !== null) {
                    e.attr('target', o.link.target);
                } else {
                    e.removeAttr('target');
                }

                if (o.link !== null && o.link.title !== null) {
                    e.attr('title', o.link.title);
                } else {
                    e.removeAttr('title');
                }
            }            
        },

        /* //render button */
        _setWidth: function (value) {
            var e = this.element;
            
            if (value === null) { 
                e.css('width', '');
            } else {
                e.css('width', value);
            }
        },

        _setHeight: function (value) {
            var e = this.element;
            if (value === null) { 
                e.css('height', '');
            } else {
                e.css('height', value);
            }
        },

        _setOption: function (key, value) {
            // Particular Modifier
            var e = this.element, 
                self = this;
            
            $.Widget.prototype._setOption.apply(this, arguments);

            switch (key) {
			case "width":                    
				self._setWidth(value);
				break;
			case "height":
				self._setHeight(value);
				break;
			case "link":
				self._setLinkOptions(e.is('a') === true);
				break;
			case "disabled":
                value = Boolean(value);
                    
                if (value === true) {
					self._disableButton();
				} else {
                    self._enableButton();
				}
				break;
			case "labelText":
                self._setLabel();				    
				break;
			case "centerLabel":
				value = Boolean(value);
				if (value) {
					self._centerLabel();
				} else {
					self._removeCenterLabel();
				}
				break;
            case "onlyIcons": 
                value = Boolean(value);
                self._setOnlyIcons();
                break;
            case "icons":
                self._setLabel();
                break;
			// M.H. 12 May 2011 - fix bug 74763 - add option for title
			case "title":
				self.setTitle(value);
				break;
			default:
				break;
            }            
        },

        _centerLabel: function () {
            var self = this, 
                e = self.element,
                l = $('#' + self._id('_lbl')),
				left = (e.width() - l.width()) / 2,
                top = (e.height() - l.height()) / 2;
            l.css({ position: 'relative', top: top + 'px', left: left + 'px' });
        },

        _removeCenterLabel: function () {
            //just removes css properties set from _centerLabel
            var self = this,
                l = $('#' + self._id('_lbl'));

            if (l.length > 0) {
                l.css({ position: '', top: '', left: '' });
            }
        },

        _dettachEvents: function () {
            var self = this, e = self.element;
            
            this._attached = false;
            e.unbind(this._events);
            return;            
        },

        /* Event Functions */
        _onMouseOver: function (event) {
            //var self = event.data.self;            
            if (this.options.disabled === true) {
                return;
            }
            
            this.element.addClass(this.options.css.buttonHoverClasses);
            if (!this._trigger('mouseover', event)) {
                return;
            }
        },

        _onMouseOut: function (event) {            
            var self = this, e = self.element, o = this.options;
            if (o.disabled === true) {
                return;
            }
                       
            e.removeClass(o.css.buttonHoverClasses);
            if (!self._trigger('mouseout', event)) {
                return;
            }
        },

        _onClick: function (event) {
            var e = this.element, self = this, o = this.options;

            if (o.disabled === true) {
                return;
            }
            //event.preventDefault();
            //event.stopPropagation();
                    
            //if element is link and is not a                
            if (self._isRedirect() === true && e.is('a') === false) {
                if (o.link.target === '_blank') {
                    window.open(o.link.href);
                } else {
                    window.location = o.link.href;
                }
            }
            if (!self._trigger('click', event)) {
                return;
            }
        },

        _onMouseDown: function (event) {
            var e = this.element, o = this.options;

            if (o.disabled === true) {
                return;
            }

            e.addClass(o.css.buttonActiveClasses);
            if (!this._trigger('mousedown', event)) {
                return;
            }
        },

        _onMouseUp: function (event) {
            var o = this.options;

            if (o.disabled === true) {
                return;
            }

            this.element.removeClass(o.css.buttonActiveClasses);
            if (!this._trigger('mouseup', event)) {
                return;
            }
        },

        _onFocus: function (event) {
            var o = this.options;

            if (o.disabled === true) {
                return;
            }
            this.element.addClass(o.css.buttonFocusClasses);
            if (!this._trigger('focus', event)) {
                return;
            }
        },

        _onBlur: function (event) {
            var o = this.options;
            
            if (o.disabled === true) {
                return;
            }
            this.element.removeClass(o.css.buttonFocusClasses);
            if (!this._trigger('blur', event)) {
                return;
            }
        },

        _attachButtonEvents: function () {
            var self = this,
                e = self.element;
            
            //already attached - we should not attached events twice
            if (this._attached === true) {
                return;
            }
            this._attached = true;
            //e.bind('mouseover', {self: self}, self._onMouseOver)
            this._events = {
                mouseover: function (e) { 
					self._onMouseOver(e, self);
				},
                click: function (e) {
					self._onClick(e);
				},
                mouseout: function (e) {
					self._onMouseOut(e);
				}, 
                mousedown: function (e) {
					self._onMouseDown(e);
				},
                mouseup: function (e) {
					self._onMouseUp(e);
				}, 
                focus: function (e) {
					self._onFocus(e);
				},
                blur: function (e) {
					self._onBlur(e);
				}
            };
            e.bind(this._events);            
        },

        /************** Helper Functions *******************/
        _isSetPrimaryIcon: function () {
            var primary = this.options.icons.primary, isSet = false;

            if (primary !== undefined && primary !== null && typeof primary !== undefined) {
                isSet = true;
            }

            return isSet;
        },

        _isSetSecondaryIcon: function () {
            var secondary = this.options.icons.secondary, isSet = false;

            if (secondary !== undefined && secondary !== null && typeof secondary !== undefined) {
                isSet = true;
            }

            return isSet;
        },

        _setAttribute: function (e, attr, attrName) {
            if (attr !== undefined && attr !== '' && attr !== null) {
                e.attr(attrName, attr);
            } else {
                e.removeAttr(attrName);
            }
        },

        /************** //Helper Functions *******************/
        
        destroy: function () {
            this._dettachEvents();
            this._rollbackInitValues();

            $.Widget.prototype.destroy.apply(this, arguments);            
        },


        /**************************** Function which cache and rollback element style - need for destroy function  ***************************************/
        _getInitValues: function () {
            //cache all properties 
            // on destroy the widget will rollback this settings
            var e = this.element;
            
            this._innerHTML = e.html();
            this._cssClasses = e.attr('class');
            this._role = e.attr('role');

            // if e is anchor
            this._href = e.attr('href');
            this._title = e.attr('title');
            this._target = e.attr('target');
            
            this._width = e.attr('width');
            this._height = e.attr('height');
            this._disabled = e.attr('disabled');

            this._value = e.val();//in case elemen is input type="button|submit|"
        },

        _rollbackInitValues: function () {
            var e = this.element;
            e.html(this._innerHTML);

            if (e.is('a')) {
                this._setAttribute(e, this._href, 'href');                               

                this._setAttribute(e, this._target, 'target');
            } else if (e.is('input')) {
                e.val(this._value);
            }

            this._setAttribute(e, this._title, 'title');

            this._setAttribute(e, this._width, 'width');
            this._setAttribute(e, this._height, 'height');

            this._setAttribute(e, this._cssClasses, 'class');
            this._setAttribute(e, this._role, 'role');
            this._setAttribute(e, this._disabled, 'disabled');
        }
    });
    $.extend($.ui.igButton, { version: '11.1.20111.1014' });

	$.widget("ui.igTooltip", {
		css: {
			baseClasses: "ui-widget ui-igtooltip",
			arrowImageBaseClass: "ui-igtooltip-arrow-"
		},

		options: {
			text: '',
			arrowLocation: 'top'
		},

		_setOption: function (key, value) {
			$.Widget.prototype._setOption.apply(this, arguments);
			switch (key) {
			case 'text':
				$('div.ui-widget-content', this.element).html(value);
				break;
			case 'arrowLocation':
				$('div', this.element).remove(); // destroy tool tip and render new one.
				this._renderTooltip();
				break;
			}
		},

		_create: function () {
			if (this.element.is('div')) {
				this._renderTooltip();
				this.element.addClass(this.css.baseClasses);
			}
		},
		
		_renderTooltip: function () {
			switch (this.options.arrowLocation) {
			case 'top':
				this._createArrowDiv();
				this._createContentDiv();
				break;
			case 'bottom':
				this._createContentDiv();
				this._createArrowDiv();
				break;
			case 'left':
				break;
			case 'right':
				break;
			}
		},

		_createContentDiv: function () {			
			var t = (this.options.text && this.options.text.length > 0) ? this.options.text : '';
			$('<div class="ui-widget-content ui-corner-all">' + t + '</div>').appendTo(this.element);
		},
		
		_createArrowDiv: function () {
			$('<div class="' + this.css.arrowImageBaseClass + this.options.arrowLocation + '"></div>').appendTo(this.element);
		},

		destroy: function () {
			this.element.children().remove();
			this.element.removeClass(this.css.baseClasses);
		}
    });
    $.extend($.ui.igTooltip, {version: '11.1.20111.1014'});
}(jQuery));
/*
* Infragistics.Web.ClientUI Editors 11.1.20111.1014
*
* Copyright (c) 2011 Infragistics Inc.
* <Licensing info>
*
* http://www.infragistics.com/
* Depends on
* jquery-1.4.2.js
* jquery.ui.core.js
* jquery.ui.widget.js

* Example to use:
*	<script type="text/javascript">
*	$(function () {
*		$('#text1').igValidator({ minLength: 3 });
*	});
*	</script>
*	<input id="text1" type="text" />
*/
/*global jQuery*/
/*global setTimeout*/
(function ($) {
	// _id: backup id if target does not have one
	// _cur: igValidator which opened error-message with ongoing animation
	// _submit: collection of objects, each of them if defined by id of form
	//   each subobject for a form contains references to controls which should be validated on submit events
	var _id = '=id', _cur = null, _submit = {}, _stop = function (e) {
		try {
			e.preventDefault();
			e.stopPropagation();
		} catch (ex) { }
	}, _fid = function (form, fid) {
		var id = form.id;
		if (!id && fid) {
			form._fid = fid;
		}
		return id ? id : form._fid;
	};
	// igValidator can be attached to a INPUT, TEXTAREA, SELECT html element in order to validate its value and show appropriate error message.
	// It also can be used as internal member within igEditor and igRating.
	// Validation can be triggered on various events like onchange, onblur, onsubmit and when form.submit() was used by application explicitly.
	// Every igValidator may have its own rules and enable/disable specific trigger-validation events. If validation failed, then focus can be set back to target element once, always or do not interact with focus.
	// If target element is INPUT type=radio, then all elements with attribute name of that target are validated.
	// If validator is enabled for igEditor, then any specific failure like not filled required positions in igMaskEditor or invalid day of month in igDateEditor, etc, will trigger validation and show corresponding message.
	$.widget('ui.igValidator', {
		options: {
			/* type="bool" Gets or sets visibility of icon on error message.
				Default value comes from corresponding member in $.ui.igValidator.defaults object, which is true. */
			showIcon: null,
			/* type="number" Gets or sets duration of show animation in milliseconds.
				Default value comes from corresponding member in $.ui.igValidator.defaults object, which is 300. */
			animationShow: null,
			/* type="number" Gets or sets duration of hide animation in milliseconds.
				Default value comes from corresponding member in $.ui.igValidator.defaults object, which is 300. */
			animationHide: null,
			/* type="bool" Gets or sets ability to apply error css to target element.
				Default value comes from corresponding member in $.ui.igValidator.defaults object, which is true. */
			enableTargetErrorCss: null,
			/* type="string" Gets or sets location of error label relative to target element.
				Supported value: "bottom", "left" and "right".
				Default value comes from corresponding member in $.ui.igValidator.defaults object, which is "bottom". */
			alignment: null,
			/* type="string|number" Gets or sets option to set focus back to editor when validation failed.
				Supported values:
				'never' or 0 or null or undefined,
				'once' or 1,
				'always' or 2.
				Default value comes from corresponding member in $.ui.igValidator.defaults object, which is undefined. */
			keepFocus: null,
			/* type="bool" Gets or sets triggering validation when value in editor was changed.
				Default value comes from corresponding member in $.ui.igValidator.defaults object, which is true. */
			onchange: null,
			/* type="bool" Gets or sets triggering validation when editor lost focus.
				Default value comes from corresponding member in $.ui.igValidator.defaults object, which is true. */
			onblur: null,
			/* type="bool" Gets or sets triggering validation when application called form.submit().
				Default value comes from corresponding member in $.ui.igValidator.defaults object, which is false. */
			formSubmit: null,
			/* type="bool" Gets or sets triggering validation when form gets onsubmit event.
				Default value comes from corresponding member in $.ui.igValidator.defaults object, which is true. */
			onsubmit: null,
			/* type="bool" Gets or sets parent/location of error message.
				True: use the document.body as parent for error-message.
				False: insert error-message in parent of target element.
				Default value is true. */
			bodyAsParent: true,
			/* type="bool" Gets or sets option to validate if value was entered (not empty text, selected item, etc.) Default value is false. */
			required: false,
			/* type="number" Gets or sets minimum length of text or minimum number of selected items. Default value is -1. */
			minLength: -1,
			/* type="number" Gets or sets maximum length of text or maximum number of selected items. Default value is -1. */
			maxLength: -1,
			/* type="number" Gets or sets validation for minimum number. Default value is null. */
			min: null,
			/* type="number" Gets or sets validation for maximum number. Default value is null. */
			max: null,
			/* type="string|object" Gets or sets regular expression which is used to validate value in text editor.
				It can be a string or instance of RegExp.
				Default value is null. */
			regExp: null,
			/* type="bool" Gets or sets option to use the name attribute of checkboxes in order to validate ranges.
				That option has effect only when the target is checkbox. The value of true will use the "name" attribute of target to validate all checkboxes with that name.
				In this case the "required" option will be used to check if at least one checkboxes is checked and the "min/maxLength" options will be used for range validations.
				Default value is false. */
			checkboxesName: false,
			/* type="string|object" Gets or sets custom locale.
				It can be a string like "bg", or object which contains locale-members.
				Default value is null. */
			locale: null,
			/* type="dom" Gets or sets reference to html element, which is used to process mousedown and mouseup events in order to trigger validation. Default value is null. */
			element: null,
			/* type="string" Gets or sets selector for css classes.
				That option allows replacing all default css styles of validator by custom values.
				Application should provide css classes for all members defined in the css options with "theme" selector.
				Default value is null. */
			theme: null,
			/* type="string" Gets or sets text for error-message which overrides all possible specific error-messages. Default value is null. */
			errorMessage: null
		},
		css: {
			/* Classes applied to the SPAN element of error-label which shows message. Default value is 'ui-igvalidator ui-widget ui-state-error' */
			label: 'ui-igvalidator ui-widget ui-state-error',
			/* Classes applied to the SPAN on error-label which contains image. Default value is 'ui-igvalidator-icon ui-icon ui-icon-alert' */
			icon: 'ui-igvalidator-icon ui-icon ui-icon-alert',
			/* Class applied to the target element when validation failed. Default value is 'ui-igvalidator-target' */
			target: 'ui-igvalidator-target'
		},
		locale: {
			/* Message used when validator is not able to identify specific reason for failure */
			defaultMessage: 'Please fix this field',
			/* Message used when user should select a value (in drop-down list, radio buttons or similar) */
			selectMessage: 'Please select a value',
			/* Message for range selection */
			rangeSelectMessage: 'Please select no more than {0} and not less than {1} items',
			/* Message for minimum number of selected items */
			minSelectMessage: 'Please select at least {0} items',
			/* Message for maximum number of selected items */
			maxSelectMessage: 'Please select no more than {0} items',
			/* Message for range of text length */
			rangeLengthMessage: 'Please enter a value between {0} and {1} characters long',
			/* Message for minimum length of text */
			minLengthMessage: 'Please enter at least {0} characters',
			/* Message for maximum length of text */
			maxLengthMessage: 'Please enter no more than {0} characters',
			/* Message for required entry */
			requiredMessage: 'This field is required',
			/* Message for igMaskEditor when required positions are missing */
			maskMessage: 'Please fill all required positions',
			/* Message for igDateEditor when date fields are missing */
			dateFieldsMessage: 'Please enter values in date fields',
			/* Message for igDateEditor when day of month is invalid */
			invalidDayMessage: 'Invalid day of month. Please enter correct day',
			/* Message for igDateEditor when date is invalid (zero day, month or similar) */
			dateMessage: 'Please enter a valid date',
			/* Message for igNumericEditor when string can not be converted to a number (no digits) */
			numberMessage: 'Please enter a valid number',
			/* Message for igDateEditor and igNumericEditor when range validation of editor failed */
			rangeMessage: 'Please enter a value between {0} and {1}',
			/* Message for igDateEditor and igNumericEditor when minValue of editor is set and editor has larger value */
			minMessage: 'Please enter a value greater than or equal to {0}',
			/* Message for igDateEditor and igNumericEditor when maxValue of editor is set and editor has smaller value */
			maxMessage: 'Please enter a value less than or equal to {0}'
		},
		events: {
			/* cancel="true" Event which is raised on validation before default validation logic is applied.
				Return false in order to consider value as invalid and to display error message with ui.message.
				Function takes arguments evt and ui.
				Use ui.message to get text of message.
				Use ui.value to get current value in target. */
			checkValue: null,
			/* cancel="true" Event which is raised after value was validated but before any action takes effect.
				Return false to keep possible old/current error message unchanged, and possible new error message is not displayed.
				Function takes arguments evt and ui.
				Use ui.message to get text of message.
				Use ui.invalid to get state, where true is invalid and false is valid. */
			validation: null,
			/* cancel="true" Event which is raised before error message is displayed.
				Return false in order to prevent error message display.
				Function takes arguments evt and ui.
				Use ui.message to get text of message. */
			errorShowing: null,
			/* cancel="true" Event which is raised before error message is hidden.
				Return false in order to keep error message displayed.
				Function takes arguments evt and ui.
				Use ui.message to get text of message. */
			errorHiding: null,
			/* Event which is raised after error message was displayed.
				Function takes arguments evt and ui.
				Use ui.message to get text of message. */
			errorShown: null,
			/* Event which is raised after error message was hidden.
				Function takes arguments evt and ui.
				Use ui.message to get text of message. */
			errorHidden: null
		},
		_create: function () {
			var v, t, elem, o = this.options, me = this, def = $.ui.igValidator.defaults;
			for (v in o) {
				if (o.hasOwnProperty(v) && o[v] === null && def[v] !== undefined) {
					o[v] = def[v];
				}
			}
			elem = me.element;
			// 1: valid, 2: animation hide error message, 3/4: no error message, 6: invalid, 7: animation show error message, 8/9: error
			me._state = 3;
			me._focTime = 0;
			me._init0();
			t = elem[0].nodeName;
			if (t === 'SELECT') {
				t = 5;
			} else if ((t = elem[0].type) === 'checkbox') {
				t = o.checkboxesName ? 6 : 4;
			} else if (t === 'radio') {
				t = 6;
			} else {
				t = 0;
			}
			me._elem = (t !== 6) ? elem : $('[name=' + elem[0].name + ']').map(function () {
				return (this.form === elem[0].form) ? this : null;
			});
			// 0 - text element (INPUT, TEXTAREA) with val()
			// 1..3 - not used for now
			// 4 - single INPUT type=checkbox
			// 5 - SELECT
			// 6 - INPUT type=radio or INPUT type=checkbox with name (multiple checkboxes/radio buttons)
			me._t = t;
			if (!o.ctl) {
				me._elem.bind(me._evts = {
					keydown: function (e) {
						if ((v = e.keyCode) < 15 || v > 20) {
							me._evt(e, (v === 9) ? null : me, v === 9);
						}
					},
					change: function (e) { me._evt(e, me); },
					cut: function (e) { me._evt(e, me); },
					paste: function (e) { me._evt(e, me); },
					beforecut: function (e) { me._evt(e, me); },
					drop: function (e) { me._evt(e, me); },
					dragend: function (e) { me._evt(e, me); },
					blur: function (e) { me._evt(e, me, 1); }
				});
				if (o.element) {
					o.element.bind(me._evtsE = {
						mousedown: function (e) { me._evt(e, me); },
						mouseup: function (e) { me._evt(e); }
					});
				}
			}
		},
		_evt: function (e, me, blur) {
			var o = this.options;
			if ((blur && !o.onblur) || (!blur && !o.onchange)) {
				return;
			}
			if (me) {
				setTimeout(function () {
					me.validate(e);
				}, 20);
			} else {
				this.validate(e);
			}
		},
		_loc: function (key, m) {
			var v, o = this.options;
			if (!(v = o.errorMessage) && !(v = o[key += (m ? '' : 'Message')])) {
				o = o.locale;
				if (typeof o === 'string') {
					o = $.ui.igValidator.locale[o];
				}
				if (!o || !(v = o[key])) {
					v = $.ui.igValidator.locale.defaults[key];
				}
			}
			return v ? v : this.locale[key];
		},
		_foc1: function (o) {
			o = o.keepFocus;
			return (o && this._t !== 6 && !(o.indexOf && o.indexOf('n') === 0)) ? ((o === 'once' || o === 1) ? 1 : 2) : null;
		},
		_init0: function (end) {
			var form, fid, obj, id = this._id, o = this.options;
			// coming from igEditor
			if (end) {
				this._doError();
			} else {
				if (o.ctl) {
					o.ctl._validator = this;
				}
			}
			if (!(form = this.element[0].form)) {
				return;
			}
			fid = _fid(form, 'fid');
			// build faked unique id (like igRating)
			if (!id) {
				if (!(id = this.element[0].id)) {
					id = (_id += _id.length);
				}
				this._id = id;
			}
			obj = _submit[fid];
			if (!end && (o.onsubmit || o.formSubmit)) {
				if (!form._ig_onsubmit && o.onsubmit) {
					form._ig_onsubmit = 1;
					$(form).submit(function (e) {
						var f = _submit[_fid(this)];
						if (f) {
							f.validate(e);
						}
					});
				}
				if (!form._ig_formsubmit && o.formSubmit) {
					form._ig_formsubmit = form.submit;
					form.submit = function () {
						var f = _submit[_fid(this)];
						if (f && f.validate()) {
							return;
						}
						if (this._ig_formsubmit) {
							this._ig_formsubmit();
						}
					};
				}
				if (!obj) {
					obj = _submit[fid] = { ctls: {}, validate: function (e) {
						// 1: show error label
						var i, inv = false, lbl = 1, ctls = this.ctls;
						for (i in ctls) {
							if (ctls.hasOwnProperty(i) && ctls[i].validate(e, lbl)) {
								inv = true;
								if (!$.ui.igValidator.defaults.showAllErrorsOnSubmit) {
									// 2: do not show error label
									lbl = 2;
								}
							}
						}
						if (e && inv) {
							_stop(e);
						}
						return inv;
					}};
				}
				obj.ctls[id] = this;
			} else if (obj && obj.ctls && obj.ctls[id]) {
				delete obj.ctls[id];
			}
			/*
			if (obj && obj.ctls) {
				for (o in obj.ctls) {
					if (obj.ctls.hasOwnProperty(o) && typeof o === 'string' && o.length > 0) {
						return;
					}
				}
				alert('clear _submit');
			}
			*/
		},
		getLocaleOption: function (name) {
			/* Gets calculated value of locale option used by validator.
				paramType="string" Name of locale option such as "requiredMessage", "minMessage", etc.
				returnType="string" Returns value of locale option.
			*/
			return this._loc(name, 1);
		},
		isMessageDisplayed: function () {
			/* Checks if message is displayed.
				returnType="bool" Returns true if message is displayed, false if message is not displayed.
			*/
			return this._state > 6;
		},
		isValidState: function () {
			/* Checks if target element in valid state.
				returnType="bool" Returns true if target in valid state, false if target invalid.
			*/
			return this._state < 6;
		},
		hide: function (keepCss) {
			/* Hide possible error message.
				paramType="bool" optional="true" True: keep error-css applied to target, false: remove error-css from target.
			*/
			this._doError(null, null, keepCss ? 6 : 5);
		},
		// return: 1/2 - invalid
		validate: function (e, submit) {
			/* Trigger validation.
				paramType="object" optional="true" Reference to browser event.
				paramType="number" optional="true" Value 1 is used when validation was triggered by submit.
				returnType="number|object" Possible values:
				1 - application canceled error message.
				2 - error message is displayed.
				Any other value or undefined means that target is valid.
			*/
			var v, v2, val, txt = null, mes = 'Length', t = this._t, len = -1, o = this.options, el = this.element;
			// method can be called by setTimeout and igValidator can be already destroyed
			if (!el) {
				return;
			}
			// 4 - single INPUT type=checkbox
			// 5 - SELECT
			// 6 - INPUT type=radio or INPUT type=checkbox with name (multiple checkboxes/radio buttons)
			if (t > 3) {
				mes = 'Select';
				len = val = (t === 5) ? (el[0].multiple ? $('option:selected', el[0]).length : el[0].selectedIndex) : this._elem.filter(':checked').length;
			} else {
				val = el.val();
				len = val.length;
			}
			if (!this._trigger('checkValue', e, v2 = { message: this._loc('default'), value: o.ctl ? o.ctl.value() : val })) {
				// application did its own validation
				return this._doError(v2.message, e, submit);
			}
			if (!o.required && len === 0) {
				return this._doError(null, e, submit);
			}
			v = o.regExp;
			if (v) {
				if (!v.test) {
					v = new RegExp(v.toString());
				}
				return this._doError(v.test(val) ? null : v2.message, e, submit);
			}
			if (o.ctl) {
				v = o.ctl._doInvalid(null, 9);
				return this._doError(v ? v.message : null, e, submit);
			}
			v = o.minLength;
			v2 = o.maxLength;
			if (len >= 0 && (v > len || (v2 > 0 && v2 < len))) {
				if (v > 0 && v2 > 0) {
					txt = this._loc('range' + mes).replace('{0}', v2).replace('{1}', v);
				} else {
					txt = this._loc(((v > 0) ? 'min' : 'max') + mes).replace('{0}', (v > 0) ? v : v2);
				}
			}
			if (!txt && o.required && (len === 0 || !val)) {
				// 0 - text element (INPUT, TEXTAREA) with val()
				// 4 - single INPUT type=checkbox
				// 5 - SELECT
				// 6 - INPUT type=radio or INPUT type=checkbox with name (multiple checkboxes/radio buttons)
				txt = this._loc((t > 4) ? 'select' : 'required');
			}
			// process only string (no bool or number)
			// 0 - text element (INPUT, TEXTAREA) with val()
			if (!txt && t < 2 && len > 0 && (v = ((typeof o.min === 'number') ? 1 : 0) + ((typeof o.max === 'number') ? 2 : 0)) > 0) {
				if (isNaN(val = parseFloat(val))) {
					txt = this._loc('number');
				} else if (v === 3 && (val < o.min || val > o.max)) {
					txt = this._loc('range').replace('{0}', o.min).replace('{1}', o.max);
				} else if (v === 1 && val < o.min) {
					txt = this._loc('min').replace('{0}', o.min);
				} else if (v === 2 && val > o.max) {
					txt = this._loc('max').replace('{0}', o.max);
				}
			}
			return this._doError(txt, e, submit);
		},
		// show/hide drop-down validator error label
		// return: 2 - error message was displayed, 1 - application canceled error message
		// submit=5: unconditionally hide error label, submit=6: unconditionally hide error label and error-css
		_doError: function (txt, e, submit) {
			var marg, elem0, end, xy0, xy, arg, elem, val, ctl, align, same, css = this.css, x = 'left', y = 'top', st = this._state, show = txt, dd = this._lbl, me = this, o = this.options;
			if (!submit) {
				submit = 0;
			}
			ctl = o.ctl;
			// align: 0-bottom, -1-left, 1-right
			align = (o.alignment === 'bottom') ? 0 : (o.alignment === 'left') ? -1 : 1;
			// text for current error message (while hide)
			if (!txt && dd) {
				txt = dd._txt;
			}
			// st: 1: valid, 2: animation hide error message, 3/4: no error message, 6: invalid, 7: animation show error message, 8/9: error
			if (st < 6 && !show) {
				return;
			}
			same = dd && dd._txt === txt && !this._changed;
			this._changed = null;
			// suppress tab key
			if (show && e && e.keyCode === 9 && me._foc1(o) === 2) {
				_stop(e);
				if (same) {
					return 2;
				}
			}
			if (show && same) {
				if (st > 5) {
					if (_cur === me) {
						me._focus(o, submit, e);
					}
					return 2;
				}
			}
			// do not allow focus to another validator if previous validator attempts to set focus back to itself
			if (!submit && show && _cur && new Date().getTime() - _cur._focTime < 100) {
				return 2;
			}
			arg = { message: txt, invalid: !!show };
			// submit=5: unconditionally hide error label, submit=6: unconditionally hide error label and error-css
			if (submit < 5 && !me._trigger('validation', e, arg)) {
				// application canceled validation
				return;
			}
			// 1: valid, 2: animation hide error message, 3/4: no error message, 6: invalid, 7: animation show error message, 8/9: error
			me._state = show ? 6 : 1;
			if (!(elem = o.element)) {
				elem = me.element;
			}
			// adjust appearance of target editor
			if (o.enableTargetErrorCss) {
				if (show) {
					elem.addClass(css.target);
				// submit=5: unconditionally hide error label
				} else if (submit !== 5) {
					elem.removeClass(css.target);
				}
			}
			// 2: flag which set while submit: error message should not be displayed
			if (submit === 2) {
				return 2;
			}
			if (!me._trigger(show ? 'errorShowing' : 'errorHiding', e, arg)) {
				// 1: flag that application canceled error message
				return 1;
			}
			if (!show && !dd) {
				return;
			}
			txt = arg.message;
			// 1: valid, 2: animation hide error message, 3/4: no error message, 6: invalid, 7: animation show error message, 8/9: error
			// increment to 2 or 7 (previous state was 1 or 6)
			me._state++;
			// true: insert error element in front of editor and use marginLeft/Top
			// false: append to body and use left/top
			marg = !o.bodyAsParent;
			if (marg) {
				x = 'marginLeft';
				y = 'marginTop';
			}
			elem0 = ctl ? ctl._element : elem;
			if (!dd) {
				dd = me.element[0].id;
				if (dd) {
					dd = ' for="' + dd + '"';
				}
				dd = me._lbl = $('<label' + dd + '/>').addClass(css.label).css({ position: 'absolute', visibility: 'hidden' });
				dd[0].unselectable = 'on';
				dd[0].innerHTML = txt;
				// _id: 98:drop-down error label
				dd[0]._id = 98;
				me._dd = o.theme ? $('<span/>').addClass(o.theme).css('position', 'absolute').append(dd) : dd;
				if (marg) {
					me._dd.prependTo(elem0.parent());
				} else {
					me._dd.appendTo($('body'));
				}
			}
			if (show) {
				me._dd.css(x, '0px').css(y, '0px');
				dd._txt = txt;
				if (o.showIcon) {
					if (txt === ' ' || txt === '&nbsp;') {
						txt = '';
					}
					txt = '<span class="' + css.icon + '"></span><span style="display:inline-block;width:18px;"></span>' + txt;
				}
				dd[0].innerHTML = txt;
				dd.css('width', 'auto').css('height', 'auto');
				dd._width0 = dd[0].offsetWidth;
				dd._height0 = dd[0].offsetHeight;
				dd._width = Math.max(dd.width(), 5);
				dd._height = Math.max(dd.height(), 10);
				if (o.showIcon) {
					dd._height = Math.max(dd.children()[0].offsetHeight, dd._height);
				}
				me._focTime = 0;
				_cur = me;
			}
			// action on end animation
			end = function () {
				if (show) {
					dd.css('filter', '');
				} else {
					me._dd.remove();
					me._dd = me._lbl = _cur = null;
				}
				// 1: valid, 2: animation hide error message, 3/4: no error message, 6: invalid, 7: animation show error message, 8/9: error
				// increment to 3 or 8 (previous state was 2 or 7)
				me._state++;
			};
			// show error label
			if (show) {
				if ((val = o.animationShow) < 5) {
					val = null;
				}
				me._focus(o, submit, e);
				dd.css({ opacity: val ? 0 : 1, height: (val ? 0 : dd._height) + 'px', width: Math.floor(dd._width / ((val && align >= 0) ? 2 : 1)) + 'px', display: '', visibility: 'visible' });
				// if element was swapped, then under Firefox offset() returns wrong values: use original element
				xy0 = (ctl && ctl._swap) ? me.element : elem;
				xy = xy0.offset();
				xy.top += align ? 0 : xy0.outerHeight();
				if (ctl && ctl._swap) {
					xy.left -= ctl._leftShift();
				}
				if (align) {
					xy.left += (align < 0) ? -dd[0].offsetWidth : elem0[0].offsetWidth;
				}
				if (marg) {
					xy0 = dd.offset();
					xy.left -= xy0.left;
					xy.top -= xy0.top;
				}
				me._dd.css(x, xy.left + 'px').css(y, xy.top + 'px');
				if (val) {
					dd.animate({ opacity: 1, height: dd._height, width: dd._width }, val, null, end);
				} else {
					end();
				}
				me._trigger('errorShown', e, arg);
				// 2: flag error message was displayed
				return 2;
			}
			// hide error label
			if ((val = o.animationHide) < 5) {
				val = null;
			}
			if (val) {
				dd.animate({ opacity: 0.6 }, Math.floor(val * 0.34)).animate({ opacity: 0, height: 0, width: Math.floor(dd._width / ((align < 0) ? 1 : 2)) }, Math.floor(val * 0.66), null, end);
			} else {
				end();
			}
			me._trigger('errorHidden', e, arg);
		},
		_focus: function (o, submit, e) {
			var el = (!submit && this._foc1(o)) ? this.element : null;
			e = (e && e.keyCode !== 9) ? e.type : '';
			// unknown INPUT or igEditor without focus
			if (el && !(o.ctl && o.ctl._fcs) && (this._foc1(o) !== 1 || !this._focTime) && e.indexOf('key') < 0 && e.indexOf('mouse') < 0) {
				if ($.ui.igEditor) {
					$.ui.igEditor._keepFoc = o.ctl;
				}
				this._focTime = new Date().getTime();
				setTimeout(function () {
					try {
						el.focus();
					} catch (ex) { }
				}, 0);
			}
		},
		_setOption: function (key, val) {
			if (this.options[key] === val) {
				return;
			}
			$.Widget.prototype._setOption.apply(this, arguments);
			if (key !== 'locale') {
				this._init0();
			}
		},
		destroy: function () {
			/* Destroys igValidator.
				returnType="object" Returns reference to this igValidator.
			*/
			var o = this.options;
			if (!o.ctl) {
				this._elem.unbind(this._evts);
				if (this._evtsE) {
					o.element.unbind(this._evtsE);
				}
			}
			this._init0(1);
			o.element = o.ctl = this._evts = this._evtsE = this._elem = null;
			$.Widget.prototype.destroy.apply(this, arguments);
			return this;
		}
	});
	$.extend($.ui.igValidator, { version: '11.1.20111.1014' });
	$.ui.igValidator.locale = { defaults: {} };
	$.ui.igValidator.setDefaultCulture = function (locale) {
		/* Set values for strings used for error messages.
			paramType="string|object" optional="true" If the value of parameter is String, such as "bg", "fr", etc, then validator will attempt to find and use $.ui.igValidator.locale[param] object. Value of object should contain pairs or key:value members.
		*/
		$.ui.igValidator.locale.defaults = $.extend({}, (typeof locale === 'string') ? $.ui.igValidator.locale[locale] : locale);
	};
	/* Defaults used by igValidator. If appication change them, then all igValidators created after that will pickup new defaults. */
	$.ui.igValidator.defaults = {
		/* type="bool" Gets or sets ability to show all error labels on submit.
			Value false will show only error message for first failed target.
			Default value is false. */
		showAllErrorsOnSubmit: false,
		/* type="bool" Gets or sets visibility of icon on error message. Default value is true. */
		showIcon: true,
		/* type="number" Gets or sets duration of show animation in milliseconds. Default value is 300. */
		animationShow: 300,
		/* type="number" Gets or sets duration of hide animation in milliseconds. Default value is 300. */
		animationHide: 300,
		/* type="bool" Gets or sets ability to apply error css to target element. Default value is true. */
		enableTargetErrorCss: true,
		/* type="string" Gets or sets location of error label relative to target element.
			Supported values: "bottom", "left" and "right".
			Default value is "bottom". */
		alignment: 'bottom',
		/* type="string|number" Gets or sets option to set focus back to editor when validation failed.
			Supported values:
			'never' or 0 or null - focus is not set back to editor.
			'once' or 1 - focus is set back to editor only once.
			'always' or 2 - focus is set back to editor every time validation fails.
			Default value is null. */
		keepFocus: null,
		/* type="bool" Gets or sets triggering validation when value in editor was changed. Default value is true. */
		onchange: true,
		/* type="bool" Gets or sets triggering validation when editor lost focus.
			Default value comes from corresponding member in $.ui.igValidator.defaults object, which is true. */
		onblur: true,
		/* type="bool" Gets or sets triggering validation when application called form.submit(). Default value is false. */
		formSubmit: false,
		/* type="bool" Gets or sets triggering validation when form gets onsubmit event. Default value is true. */
		onsubmit: true
	};
}(jQuery));

/* English, US */
jQuery(function ($) {
	$.ui.igValidator.locale.en = {
		defaultMessage: 'Please fix this field',
		selectMessage: 'Please select a value',
		rangeSelectMessage: 'Please select no more than {0} and not less than {1} items',
		minSelectMessage: 'Please select at least {0} items',
		maxSelectMessage: 'Please select no more than {0} items',
		rangeLengthMessage: 'Please enter a value between {0} and {1} characters long',
		minLengthMessage: 'Please enter at least {0} characters',
		maxLengthMessage: 'Please enter no more than {0} characters',
		requiredMessage: 'This field is required',
		maskMessage: 'Please fill all required positions',
		dateFieldsMessage: 'Please enter values in date fields',
		invalidDayMessage: 'Invalid day of month. Please enter correct day',
		dateMessage: 'Please enter a valid date',
		numberMessage: 'Please enter a valid number',
		rangeMessage: 'Please enter a value between {0} and {1}',
		minMessage: 'Please enter a value greater than or equal to {0}',
		maxMessage: 'Please enter a value less than or equal to {0}'
	};
	$.ui.igValidator.setDefaultCulture('en');
});

/*
* Infragistics.Web.ClientUI Editors 11.1.20111.1014
*
* Copyright (c) 2011 Infragistics Inc.
* <Licensing info>
*
* http://www.infragistics.com/
*
* Depends on
* jquery-1.4.2.js
* jquery.ui.core.js
* jquery.ui.widget.js
* ig.util.js
*
* Example to use:
*	<script type="text/javascript">
*	$(function () {
*		$('#editor1').igEditor();
*	});
*	</script>
*	<input id="editor1" type="text" />
*/

/*global jQuery, setTimeout, setInterval, clearInterval, document, window*/
(function ($) {
	var _aNull = function (v, nan) {
		return v === null || v === undefined || (nan && typeof v === 'number' && isNaN(v));
	}, _int = function (val, nan) {
		if (isNaN(val = parseInt(val, 10))) {
			val = nan ? nan : 0;
		}
		return val;
	}, _str = function (v) {
		return _aNull(v) ? '' : v.toString();
	}, _stop = function (e) {
		try {
			e.preventDefault();
			e.stopPropagation();
		} catch (ex) { }
	};
	$.ig = $.ig || {};
	$.widget('ui.igEditor', {
		options: {
			/* type="string|date|number" Gets sets value in editor.
				Default is null.
				The effect of setting/getting that option depends on type of editor and on dataMode options.
				If it is used on initialization and the "type" option is missing, then if "value" is Number, then "numeric" editor is created automatically and if "value" is Date, then the "date" editor is created. */
			value: null,
			/* type="number" Gets sets value in tabIndex for editor. Default is null. */
			tabIndex: null,
			/* type="string" Sets gets text mode of editor such as: single-line text editor, password editor or multiline editor.
				That option has effect only on initialization and only if base element is not INPUT or TEXTAREA.
				Default is null.
				If based element (selector) is TEXTAREA, then it is used as input-field.
				If based element is INPUT, then it is used as input-field.
				Possible values:
				"text": single line text editor based on INPUT element is created;
				"password": editor based on INPUT element is created;
				"multiline" or "textarea": multiline editor based on TEXTAREA element is created. */
			textMode: null,
			/* type="string" Sets gets text which appears in editor when editor has no focus and "value" in editor is null or empty string. Default is null. */
			nullText: null,
			/* type="string" Sets gets visibility of spin and drop-down button.
				Default is "none".
				That option can be set only on initialization.
				Possible values:
				"dropdown": button to open list is located on the right side of input-field (or left side if base html element has direction:rtl);
				"clear": button to clear value is located on the right side of input-field (or left side if base html element has direction:rtl);
				"spin": spin buttons are located on the right side of input-field (or left side if base html element has direction:rtl).
				Combinations like "dropdown,spin" or "spinclear" are supported too. */
			button: 'none',
			/* type="bool" Sets gets visibility of dropdown button. Default is false. That option has effect only when dropdown or clear button is enabled. */
			buttonHidden: false,
			/* type="string" Sets gets ability to enter only specific characters in input-field from keyboard and on paste.
				Default is null.
				Notes:
				If "excludeKeys" option contains same characters as this option, then "excludeKeys" has priority.
				Letters should be set in upper case.
				Different filtering upper and lower cases is not supported. */
			includeKeys: null,
			/* type="string" Sets gets ability to prevent entering specific characters in input-field from keyboard and on paste.
				Default is null.
				Notes:
				If "includeKeys" option contains same characters as this option, then "excludeKeys" has priority. Letters should be set in upper case.
				Different filtering upper and lower cases is not supported. */
			excludeKeys: null,
			/* type="string" Sets gets horizontal alignment of text in editor.
				Default is null.
				Possible values: null, "left", "right", "center".
				Note: If that option is not set, then "right" is used for "numeric", "currency" and "percent" editors and the "left" is used for all other types of editor. */
			textAlign: null,
			/* type="array" Sets gets list of items which are used for drop-down list, spin, validation and auto-complete functionality.
				Default is null.
				Items in list can be strings, numbers, dates or objects in any combination.
				If type of editor is date or datepicker and item is string, then igEditor will try to convert it to Date object and show item in display format.
				If type of editor is numeric, currency or percent and item is string, then igEditor will try to convert it to number and show item in display format.
				If item is object and it has member "text", then that member is used.
				If item is object and besides "text" has function getHtml(), then that function is used to render item in list.
				The item or item.text is used to set "value" of particular editor when list-item is selected. */
			listItems: null,
			/* type="string|object" Sets gets custom regional settings for editor. Default is null. If it is string, then $.ig.regional[stringValue] is assumed. */
			regional: null,
			/* type="string" Sets gets selector for css classes used by editor.
				Default is null.
				That option allows replacing all default css styles of editor by custom values.
				Application should provide css classes for all members defined in the css options with "theme" selector.
				For example, if that property is set to "mytheme", then application should provide following css classes:
				.mytheme .ui-igedit-field{...};
				.mytheme .ui-igedit-focus{...};
				etc.
				Note: changing theme is not supported when base element is INPUT or TEXTAREA and fieldInContainer or button are not enabled. */
			theme: null,
			/* type="string|number" Sets type of editor.
				Default is null.
				If that option is not set, but the "value" option is defined, then if type of "value" is Number, then the "numeric" type is used, if type of "value" is Date, then the "date" type is used.
				For all other types of "value" the "text" type is used.
				Possible values:
				"text" or 0: text editor is created;
				"mask" or 1: mask editor is created;
				"date" or 2: date-time editor is created;
				"datepicker" or 3: date-picker is created;
				"numeric" or 4: numeric editor is created;
				"currency" or 5: currency editor is created;
				"percent" or 6: percent editor is created.
				Note: if that option is set to "datepicker", then application should ensure that css and js files used by jquery.ui.datepicker are available. */
			type: null,
			/* type="string|object" Sets gets strings used for title of buttons.
				Default is null.
				If the value of that option is String, such as "bg", "fr", etc., then editor will attempt to find and use $.ui.igEditor.locale[valueOfOption] object.
				Value of object should contain pairs or key:value members.
				Note: any sub-option of locale can appear within the main option of igEditor.
				In this case those values within main options will have highest priority and override corresponding value in locale. */
			locale: null,
			/* type="number" Sets gets width of editor in pixels.
				Default is null.
				Only positive values have effect. If that option is not set, then value of style.width of base html element will be used automatically. However, that value should be in the px units. */
			width: null,
			/* type="number" Sets gets height of editor in pixels.
				Default is null. Only positive values have effect.
				If that option is not set, then value of style.height of base html element will be used automatically. However, that value should be in the px units. */
			height: null,
			/* type="object" Sets gets options supported by igValidator.
				Default is null.
				In order to enable validation and use defaults, an empty object can be used.
				Note: validation rules of igValidator, such as min, max, minLength, required are not supported, but similar properties of igEditor should be used. */
			validatorOptions: null,
			/* type="bool" Set gets validation for empty value in editor. Default is false. */
			required: false,
			/* type="string" Sets gets style.display for outer html element.
				Default is "inline-block".
				The value of "" will disable changing style.display.
				If base html element is not INPUT, TEXTAREA, SPAN or DIV, then it is recommended to set value of that option to empty string.
				Because, some browsers may fail to handle display other than default value of browser.
				For example, if base element for editor is TD, then behavior of Chrome can be problematic. */
			display: 'inline-block',
			/* type="bool" Sets gets ability of numeric and date editors to prevent null value.
				Default is true.
				If that option is disabled, and editor has no value, then value of numeric editor is set to 0 (or minValue/maxValue) and value of date editor is set to today date (or minValue/maxValue). */
			nullable: true,
			/* type="bool" Sets gets option to wrap input field into SPAN.
				Default is false.
				That option can be set only on initialization and it is available only when base element is INPUT or TEXTAREA.
				If drop-down button or spin-buttons are enabled or the theme is set, then that option has no effect.
				The reason for that property is to allow vertical alignment of several igEditor controls when they are located in html inline and some of them have enabled buttons.
				If all editors are created within SPAN wrapper, then they will appear on the same line. Otherwise, editors in SPANs will be shifted 3-6 pixels above INPUT editors. */
			renderInContainer: false,
			/* type="bool" Sets gets ability to convert input characters to upper case (true) or keeps characters as they are (false). Default is false. That option has effect only while keyboard entries and paste. */
			toUpper: false,
			/* type="bool" Sets gets ability to convert input characters to lower case (true) or keeps characters as they are (false). Default is false. That option has effect only while keyboard entries and paste. */
			toLower: false,
			/* type="string|number" Sets gets behavior of selection/caret in input-field when editor gets focus.
				Default is -1.
				Possible values:
				"select" or -1 - select all text;
				"start" or 0 - set caret at the beginning of text;
				"end" or 1 - set caret at the end of text;
				"default" or 2 - use default behavior of browser (in case of mask, numeric and date editors it may be unreliable). */
			selectionOnFocus: -1,
			/* type="bool" Set gets ability to modify editor from keyboard (false) or disables keyboard (true).
				Default is false.
				Notes:
				If the "spinOnReadOnly" is enabled, then value will be modified on spin regardless of the "readOnly".
				If the "listItems" has items and "dropDownTriggers" is defined, then value will be modified from drop-down list regardless of the "readOnly". */
			readOnly: false,
			/* type="number" Sets gets maximum length of text which can be entered by user.
				Default is 0.
				Negative values or 0 disables that behavior.
				Note: that property has no effect if "type" of editor is "mask", "date" or "datepicker". */
			maxLength: 0,
			/* type="number" Sets gets delta-value which is used to increment or decrement value in editor on spin events.
				Default is 1.
				In case of numeric editors, the numeric value is modified.
				In case of date editors, the value of field where caret is located is modified.
				In case of all other editors spin is applied to the items in the "listItems" and value of editor is set to an item in list. */
			spinDelta: 1,
			/* type="bool" Sets gets ability to override the "readOnly" option and allow changes "value" of editor on spin events. Default is false. Value false does not allow spin when "readOnly" is true. */
			spinOnReadOnly: false,
			/* type="bool" Sets gets ability to automatically set focus to input-field when spin button is clicked by mouse (true), or keep focus at its original element (false).
				Default is false.
				If that option is disabled and focus element is not editor, then mouse click on spin button will keep text in editor in display (not focus) format and perform spin actions. */
			focusOnSpin: false,
			/* type="bool" Sets gets ability to automatically set value in editor to opposite limit, when spin action reached minimum or maximum limit (true), or stop spin when value reached minimum or maximum limit (false).
				Default is false.
				In case of listOfItems, the first and the last items in list are used as minimum and maximum values. */
			spinWrapAround: false,
			/* type="bool" Sets gets ability to hide the Enter key from browser. False: default browser action on the Enter key. Default is true. */
			hideEnterKey: true,
			/* type="bool" Default is false. Sets gets ability to override the "readOnly" option and allow to show drop-down list and change "value" of editor from list. Value false does not allow drop-down when "readOnly" is true. */
			dropDownOnReadOnly: false,
			/* type="string" Sets gets list of actions which trigger display of drop-down list or calendar.
				Default is "button,ctrl+arrow,alt+arrow".
				The list should include flags separated by the "," character. Flags may include optional "ctrl+", "shift+" or "alt+" prefix.
				If prefix is defined, then action is triggered for combination of flag-action with Ctrl, Shift or Alt key.
				Empty string disables drop-down functionality.
				Possible values of flags:
				"arrow" - down-arrow shows drop-down and up-arrow hides drop-down;
				"button" - shows and hides drop-down;
				"focus" - shows drop-down on focus.
				Any upper case character (including space): shows drop-down. */
			dropDownTriggers: 'button,ctrl+arrow,alt+arrow',
			/* type="bool" Sets gets case validation. Value of false enables and true disables validation for case of entries to match with items in listOfItems.
				Default is true.
				That option has effect only when "listMatchOnly" or "listAutoComplete" options are enabled. */
			listMatchIgnoreCase: true,
			/* type="bool" Set gets list match.
				Default is false.
				Value true enables and false disables validation of keyboard entries to match with items in listOfItems.
				If that option is enabled and entered text does not match with a part of any item in list, then entry is canceled.
				Notes:
				That option is supported only when the "type" of editor is "text" and it has effect only when listOfItems is set.
				Partial match can be validated from the beginning of an item or anywhere within an item. That is defined by the "listMatchContains" option.
				Validation can be case sensitive or not and that is defined by the "listMatchIgnoreCase" option. */
			listMatchOnly: false,
			/* type="bool" Sets gets list match contains.
				Default is false.
				Value true enables and false disables validation for partial match of entered text anywhere within an item in the listOfItems or only from the beginning of an item.
				That option has effect only when "listMatchOnly" or "listAutoComplete" options are enabled. */
			listMatchContains: false,
			/* type="bool" Sets gets autocomplete.
				Default is false.
				Value true enables and false disables auto-complete functionality to fill value of editor by a partially matching item from the listOfItems.
				If that option is enabled and entered text does not match with a part of any item in list, then original value is preserved.
				Notes:
				That option is supported only when the "type" of editor is "text" and it has effect only when listOfItems is set.
				Partial match can be validated from the beginning of an item or anywhere within an item. That is defined by the "listMatchContains" option.
				Validation can be case sensitive or not and that is defined by the "listMatchIgnoreCase" option. */
			listAutoComplete: false,
			/* type="bool" Sets gets location of drop-down list.
				Default is false.
				Value true will create html element for list as a child of main html element.
				Value false creates list as a child of body.
				Notes:
				That option has effect only for drop-down defined by listOfItems.
				The value of true is supported only when main (outer) html element of editor is container such as SPAN or DIV, or buttons are enabled, or renderInContainer is enabled, the theme is set.
				The value of true allows a better positioning and can be useful when editor is located in complex layout and containers with "position:fixed". */
			listDropDownAsChild: false,
			/* type="number" Sets gets custom width of drop-down list in pixels. Default is 0. If value is equal to 0 or negative, then the width of editor is used. */
			listWidth: 0,
			/* type="number" Sets gets maximum height of drop-down list in pixels. Default is 300. If value is equal to 0 or negative, then the height of list is defined by number of items in list. */
			listMaxHeight: 300,
			/* type="number" Sets gets number of columns in drop-down list. Default is 1. */
			listColumns: 1,
			/* type="number" Sets gets duration of animation in milliseconds when drop-down list is displayed. Default is 400. If value is less than 5, then animation is disabled. */
			listAnimationShow: 400,
			/* type="number" Sets gets duration of animation in milliseconds when drop-down list is hidden. Default is 450. If value is less than 5, then animation is disabled. */
			listAnimationHide: 450,
			/* type="bool" Sets gets ability to keep left and/or right borders of input-field unchanged if buttons are enabled. Default is false. Value false will remove borders. */
			borderBetweenFieldAndButtons: false
		},
		events: {
			/* cancel="true" Event which is raised on keydown event.
				Return false in order to cancel key action.
				Function takes arguments evt and ui.
				Use ui.key to obtain value of keyCode. */
			keydown: 0,
			/* cancel="true" Event which is raised on keypress event.
				Return false in order to cancel key action.
				Function takes arguments evt and ui.
				Use ui.key to obtain value of keyCode.
				Set ui.key to another character which will replace original entry. */
			keypress: 1,
			/* Event which is raised on keyup event.
				Function takes arguments evt and ui.
				Use ui.key to obtain value of keyCode. */
			keyup: 2,
			/* Event which is raised on mousedown at any part of editor including drop-down list.
				Function takes arguments evt and ui.
				Use ui.elementType to obtain type of html element under mouse, such as field, button, spinUpper, spinLower or item#.
				Use ui.id and ui.elementType to obtain flag which represents html element under mouse. */
			mousedown: 3,
			/* Event which is raised on mouseup at any part of editor including drop-down list.
				Function takes arguments evt and ui.
				Use ui.elementType to obtain type of html element under mouse, such as field, button, spinUpper, spinLower or item#.
				Use ui.id and ui.elementType to obtain flag which represents html element under mouse. */
			mouseup: 4,
			/* Event which is raised on mousemove at any part of editor including drop-down list.
				Function takes arguments evt and ui.
				Use ui.elementType to obtain type of html element under mouse, such as field, button, spinUpper, spinLower or item#.
				Use ui.id and ui.elementType to obtain flag which represents html element under mouse. */
			mousemove: 5,
			/* Event which is raised on mouseover at any part of editor including drop-down list.
				Function takes arguments evt and ui.
				Use ui.elementType to obtain type of html element under mouse, such as field, button, spinUpper, spinLower or item#.
				Use ui.id and ui.elementType to obtain flag which represents html element under mouse. */
			mouseover: 6,
			/* Event which is raised on mouseleave at any part of editor including drop-down list.
				Function takes arguments evt and ui.
				Use ui.elementType to obtain type of html element under mouse, such as field, button, spinUpper, spinLower or item#.
				Use ui.id and ui.elementType to obtain flag which represents html element under mouse. */
			mouseleave: 7,
			/* Event which is raised when input field of editor gets focus.
				Function takes argument evt.
				Use evt.originalEvent to obtain reference to event of browser. */
			focus: 8,
			/* Event which is raised when input field of editor loses focus.
				Function takes argument evt.
				Use evt.originalEvent to obtain reference to event of browser. */
			blur: 9,
			/* cancel="true" Event which is raised before value in editor was changed.
				Return false in order to cancel change.
				It can be raised on lost focus or on spin events.
				Function takes arguments evt and ui.
				Use ui.value to obtain new value and ui.oldValue to obtain old value. */
			valueChanging: 10,
			/* Event which is raised after value in editor was changed. It can be raised on lost focus or on spin events.
				Function takes arguments evt and ui.
				Use ui.value to obtain new value and ui.oldValue to obtain old value. */
			valueChanged: 11,
			/* Event which is raised after text in editor was changed.
				Function takes arguments evt and ui.
				Use ui.value to obtain new value and ui.oldValue to obtain old value. */
			textChanged: 12,
			/* Event which is raised on lost focus when editor contains invalid value. That event is available for all editors besides default "text" type editor.
				Function takes arguments evt and ui.
				Use ui.value to obtain suggested value.
				Set ui.value to change suggested value.
				If type of editor is numeric, currency, percent, date or datepicker, then ui.text contains actual text entered by user.
				If type of editor is numeric, currency or percent, then the ui.reason may have following flags: "null", "format" or "limit".
				If type of editor is date or datepicker, then ui contains following additional members:
				ui.reason may have following flags: "null", "dayOfMonth", "numberOfFields", "limit" or "invalid";
				ui.year - year of entered date;
				ui.month - month of entered date;
				ui.day - day of entered date;
				ui.hours - hours of entered date;
				ui.minutes - minutes of entered date;
				ui.seconds - seconds of entered date;
				ui.milliseconds - milliseconds of entered date. */
			invalidValue: 13,
			/* cancel="true" Event which is raised on spin event.
				Return false in order to cancel spin.
				Function takes arguments evt and ui.
				Use ui.delta to obtain delta for increment or decrement.
				Use ui.value to obtain the "value" of editor before spin action. */
			spin: 14,
			/* Event which is raised when button was clicked by mouse.
				Function takes argument evt.
				Use evt.originalEvent to obtain reference to event of browser. */
			buttonClick: 15,
			/* cancel="true" Event which is raised before drop-down list or calendar is opened.
				Return false in order to cancel drop-down action.
				Function takes argument evt.
				Use evt.originalEvent to obtain reference to event of browser. */
			showDropDown: 16,
			/* cancel="true" Event which is raised before drop-down list or calendar is opened.
				Function takes argument evt and ui.
				Use evt.originalEvent to obtain reference to event of browser.
				Use ui.value to obtain reference to the selected item in list or Date in calendar.
				If ui.value is not null and not undefined, that it means that drop-down was closed due to selection from drop-down list or from calendar.
				Otherwise, drop-down was closed due to lost focus or Esc key press.
				Return false in order to cancel hide action and keep drop-down visible.
				It is not recommended to cancel that action on blur event.
				Note: In case of calendar of datepicker, the evt or evt.originalEvent can be null. That happens if calendar was closed on blur or by Esc key.
				Returning the false in this situation will not prevent closing drop-down calendar. */
			hideDropDown: 17,
			/* cancel="true" Event which is raised before list item is selected.
				Return false in order to cancel select action.
				Function takes arguments evt and ui.
				Use evt.originalEvent to obtain reference to event of browser.
				Use ui.index to get new selected index.
				Use ui.oldIndex to get old selected index.
				Use ui.item to get reference to new selected item. */
			listSelecting: 18,
			/* Event which is raised after list item was selected.
				Function takes arguments evt and ui.
				Use evt.originalEvent to obtain reference to event of browser.
				Use ui.index to get new selected index.
				Use ui.oldIndex to get old selected index.
				Use ui.item to get reference to new selected item. */
			listSelected: 19
		},
		css: {
			/* Class applied to the main/top element. Default value is 'ui-igedit' */
			editor: 'ui-igedit',
			/* Class applied to the editing element. Default value is 'ui-igedit-field' */
			field: 'ui-igedit-field',
			/* Class applied to the TEXTAREA element. Default value is 'ui-igedit-textarea' */
			textArea: 'ui-igedit-textarea',
			/* Class applied to the editing element in mouse-over state. Default value is 'ui-igedit-hover' */
			hover: 'ui-igedit-hover',
			/* Class applied to the editing element in focus state. Default value is 'ui-igedit-focus' */
			focus: 'ui-igedit-focus',
			/* Class applied to the images of buttons when editor has focus or mouse-over, but mouse-over does not belong to a particular button. Default value is 'ui-igedit-buttonsimagestateoverride' */
			buttonsImageStateOverride: 'ui-igedit-buttonsimagestateoverride',
			/* Class applied to the editing element and buttons in normal state (not disabled and not focused). Default value is 'ui-igedit-bordercolor' */
			borderColor: 'ui-igedit-bordercolor',
			/* Classes applied to the editing element in disabled state. Default value is 'ui-igedit-disabled ui-state-disabled' */
			disabled: 'ui-igedit-disabled ui-state-disabled',
			/* Class applied to the editing element of numeric editor when value is negative. Default value is 'ui-igedit-negative' */
			negative: 'ui-igedit-negative',
			/* Class applied to the editing element when it has no value. Default value is 'ui-igedit-nullvalue' */
			nullValue: 'ui-igedit-nullvalue',
			/* Class applied to the editing element when it is located in (SPAN) container. That happens when buttons are enabled, or base element is not INPUT, or renderInContainer option is enabled. Default value is 'ui-igedit-fieldincontainer' */
			fieldInContainer: 'ui-igedit-fieldincontainer',
			/* Class applied to the SPAN element which represents button. Default value is 'ui-igedit-button' */
			button: 'ui-igedit-button',
			/* Classes applied to the SPAN element of button when editor has focus. Default value is 'ui-igedit-buttonfocus ui-state-focus' */
			buttonFocus: 'ui-igedit-buttonfocus ui-state-focus',
			/* Classes applied to the the SPAN element of button in default state (no focus, no mouse, no press). Default value is 'ui-igedit-buttondefault ui-state-default' */
			buttonDefault: 'ui-igedit-buttondefault ui-state-default',
			/* Classes applied to the SPAN element of button in mouse-over state. Default value is 'ui-igedit-buttonhover ui-state-hover' */
			buttonHover: 'ui-igedit-buttonhover ui-state-hover',
			/* Classes applied to the SPAN element of button in pressed state. Default value is 'ui-igedit-buttonpressed ui-state-highlight' */
			buttonPressed: 'ui-igedit-buttonpressed ui-state-highlight',
			/* Classes applied to the SPAN element of button in disabled state. Default value is 'ui-igedit-buttondisabled ui-state-disabled' */
			buttonDisabled: 'ui-igedit-buttondisabled ui-state-disabled',
			/* Classes applied to the SPAN element which represents image on dropdown/clear button. Default value is 'ui-igedit-buttonimage ui-icon-triangle-1-s ui-icon' */
			buttonImage: 'ui-igedit-buttonimage ui-icon-triangle-1-s ui-icon',
			/* Class applied to the SPAN element which represents image on clear button. Default value is 'ui-icon-circle-close' */
			buttonClearImage: 'ui-icon-circle-close',
			/* Class applied to the SPAN element which represents image on button in mouse-over state. Default value is 'ui-igedit-buttonimagehover' */
			buttonImageHover: 'ui-igedit-buttonimagehover',
			/* Class applied to the SPAN element which represents image on button in pressed state. Default value is 'ui-igedit-buttonimagepressed' */
			buttonImagePressed: 'ui-igedit-buttonimagepressed',
			/* Class applied to the SPAN element which represents image on button in disabled state. Default value is 'ui-igedit-buttonimagedisabled' */
			buttonImageDisabled: 'ui-igedit-buttonimagedisabled',
			/* Class applied to the SPAN element which contains spin buttons. Default value is 'ui-igedit-spinholder' */
			spinHolder: 'ui-igedit-spinholder',
			/* Class applied to the SPAN element which represents spin button. Default value is 'ui-igedit-spinbutton' */
			spinButton: 'ui-igedit-spinbutton',
			/* Class applied to the SPAN element which represents image on spin button. Default value is 'ui-igedit-spinbuttonimage' */
			spinButtonImage: 'ui-igedit-spinbuttonimage',
			/* Class applied to the SPAN element which represents image on lower spin button. Default value is 'ui-igedit-spinlowerimage ui-icon-triangle-1-s ui-icon' */
			spinLowerImage: 'ui-igedit-spinlowerimage ui-icon-triangle-1-s ui-icon',
			/* Class applied to the SPAN element which represents image on lower spin button in mouse-over state. Default value is 'ui-igedit-spinlowerimagehover' */
			spinLowerImageHover: 'ui-igedit-spinlowerimagehover',
			/* Class applied to the SPAN element which represents image on lower spin button in pressed state. Default value is 'ui-igedit-spinlowerimagepressed' */
			spinLowerImagePressed: 'ui-igedit-spinlowerimagepressed',
			/* Class applied to the SPAN element which represents image on lower spin button in disabled state. Default value is 'ui-igedit-spinlowerimagedisabled' */
			spinLowerImageDisabled: 'ui-igedit-spinlowerimagedisabled',
			/* Class applied to the SPAN element which represents image on upper spin button. Default value is 'ui-igedit-spinupperimage ui-icon-triangle-1-n ui-icon' */
			spinUpperImage: 'ui-igedit-spinupperimage ui-icon-triangle-1-n ui-icon',
			/* Class applied to the SPAN element which represents image on upper spin button in mouse-over state. Default value is 'ui-igedit-spinupperimagehover' */
			spinUpperImageHover: 'ui-igedit-spinupperimagehover',
			/* Class applied to the SPAN element which represents image on upper spin button in pressed state. Default value is 'ui-igedit-spinupperimagepressed' */
			spinUpperImagePressed: 'ui-igedit-spinupperimagepressed',
			/* Class applied to the SPAN element which represents image on upper spin button in disabled state. Default value is 'ui-igedit-spinupperimagedisabled' */
			spinUpperImageDisabled: 'ui-igedit-spinupperimagedisabled',
			/* Class applied to the drop-down element which contains list of items or datepicker-calendar. Default value is 'ui-igedit-dropdown' */
			dropDown: 'ui-igedit-dropdown',
			/* Class applied to the DIV element which is used as container for dropdown list. Default value is 'ui-igedit-list ui-widget ui-widget-content' */
			list: 'ui-igedit-list ui-widget ui-widget-content',
			/* Class applied to the SPAN element which represents item in dropdown list. Default value is 'ui-igedit-listitem ui-state-default' */
			listItem: 'ui-igedit-listitem ui-state-default',
			/* Class applied to the Class applied to the SPAN element which represents item in dropdown list with mouse-over state. Default value is 'ui-igedit-listitemhover ui-state-hover' */
			listItemHover: 'ui-igedit-listitemhover ui-state-hover',
			/* Class applied to the Class applied to the SPAN element which represents selected item in dropdown list. Default value is 'ui-igedit-listitemselected ui-state-highlight' */
			listItemSelected: 'ui-igedit-listitemselected ui-state-highlight',
			/* Class applied to the SPAN elements located in columns on the right in dropdown list. That has effect only when multiple columns in list are enabled. Default value is 'ui-igedit-listitemcolumnborder' */
			listItemColumnBorder: 'ui-igedit-listitemcolumnborder'
		},
		locale: {
			/* Title for upper spin button. */
			spinUpperTitle: 'Increment',
			/* Title for lower spin button. */
			spinLowerTitle: 'Decrement',
			/* Title for dropdown button. */
			buttonTitle: 'Show list',
			/* Title for dropdown button. */
			clearTitle: 'Clear value',
			/* Title for dropdown datepicker button. */
			datePickerButtonTitle: 'Show calendar'
		},
		regional: $.ig._regional || {},
		_create: function (type) {
			var v, val, css = this.css, elem, field, align, theme, oldCss, o = this.options, me = this;
			type = this._doType(_aNull(type) ? o.type : type, val = o.value);
			// selected index of item in listItems (used fro spin and drop-down list)
			this._listID = -1;
			theme = o.theme;
			// css for normal-state of field
			this._css = css.field;
			elem = this._element = this._render(this.element, o, css);
			if (o.display) {
				elem.css('display', o.display);
			}
			if (type === 3 && (!$.datepicker || this._ta)) {
				throw new Error('The ui.igDatePicker depends on jquery.ui.datepicker and TEXTAREA/multiline is not supported');
			}
			// textarea
			if (this._ta) {
				this._css += ' ' + css.textArea;
			}
			field = this._field;
			this._box = field[0].type === 'checkbox';
			// flag that editor has single element: no buttons and no extra span wrapper
			this._1e = field === elem;
			if (o.readOnly) {
				field[0].readOnly = 'readonly';
			}
			align = o.textAlign;
			if (!align && type > 3) {
				align = 'right';
			}
			if (align) {
				field.css('textAlign', align);
			}
			// _id: -1:field
			field[0]._id = -1;
			field[0].disabled = o.disabled;
			// id of element which owns mouse-over and mouse-down: -1:field, 0:none, 1:button, 2:upper-spin, 3:lower-spin
			this._hover = this._mouseDown = 0;
			// conditional flag to modify logic of set value/text
			this._fix = 1;
			// focus: -1:before create, 0:no focus, 1:focus read only, 2:focus
			this._fcs = -1;
			// (this._bad!=0) means failure to process keyboard
			this._bad = 0;
			// currently pressed key, start selection
			this._k0 = this._sel0 = 0;
			// (this._noPaste==1) no paste flag
			this._noPaste = 0;
			this._fixMode(1);
			this._butHide = false;
			// events used by control: required to support destroy
			field.bind(me._evts = {
				keydown: function (e) { me._onEvt(e, 0); },
				keypress: function (e) { me._onEvt(e, 1); },
				keyup: function (e) { me._onEvt(e, 2); },
				paste: function (e) { me._onEvt(e, 11); },
				beforecut: function (e) { me._onEvt(e, 11); },
				cut: function (e) { me._onEvt(e, 11); },
				drop: function (e) { me._onEvt(e, 11); },
				focus: function (e) { me._onEvt(e, 8); },
				blur: function (e) { me._onEvt(e, 9); }
			});
			v = {
				mousedown: function (e) { me._onEvt(e, 3); },
				mouseup: function (e) { me._onEvt(e, 4); },
				mousemove: function (e) { me._onEvt(e, 5); },
				mouseover: function (e) { me._onEvt(e, 6); },
				mouseleave: function (e) { me._onEvt(e, 7); }
			};
			if (this._buttons && this._buttons[1]) {
				v.DOMMouseScroll = function (e) { me._onEvt(e, 10); };
				v.mousewheel = function (e) { me._onEvt(e, 10); };
			}
			elem.bind(me._mEvts = v);
			//
			this._fcs = 0;
			v = o.maxLength;
			if (v && v > 0) {
				field[0].maxLength = v;
			}
			// Mvc helpers
			v = o._vsFormat;
			if (v && val && type > 3 && (typeof val !== 'number')) {
				val = parseFloat(this._txtAsNum(val.toString(), v, '-'));
			}
			// _value is coming from _render
			this._setVal(_aNull(val) ? this._value : val);
			if (this._val() === '') {
				this._text = this._field[0].value = this._focTxt('', false, '');
			}
			this._fixCss();
			oldCss = this._oldCss;
			// set width/height after _fixCss
			if (!(val = o.height) && !this._1e) {
				val = oldCss.height;
				if (val) {
					val = (val.indexOf('px') > 0) ? _int(val) : this.element.height();
				}
			}
			this._height(val);
			if (this._box) {
				this._fixBC(field, field);
			}
			if (!(val = o.width) && !this._1e) {
				val = oldCss.width;
				if (val) {
					val = (val.indexOf('px') > 0) ? _int(val) : this.element.width();
				}
			}
			if (this._selElem) {
				delete oldCss.width;
				delete oldCss.height;
			}
			this._width(val);
			this._lastText = this._val();
			this._initValidator();
			this._doClear(o.value);
		},
		_doType: function (type, val) {
			if (type === 'text') {
				type = 0;
			}
			if (type === 'mask') {
				type = 1;
			}
			if (type === 'date') {
				type = 2;
			}
			if (type === 'datepicker') {
				type = 3;
			}
			if (type === 'numeric') {
				type = 4;
			}
			if (type === 'currency') {
				type = 5;
			}
			if (type === 'percent') {
				type = 6;
			}
			if (typeof type !== 'number' || type < 0 || type > 6) {
				if (typeof val === 'number') {
					type = 4;
				} else if (val && val.getMonth) {
					type = 2;
				} else {
					type = 0;
				}
			}
			this._type = type;
			return type;
		},
		_render: function (elem, o, css) {
			var spin, name, par, csso, inp, noBdr, cont, oldC, oldA, i, obj, img, clear,
				left = elem.css('direction') === 'rtl', spinCont = null,
				but = o.button, field = elem, sel = null;
			name = elem[0].nodeName;
			par = elem[0].parentNode;
			if (name) {
				name = name.toUpperCase();
			}
			this._ta = (name === 'TEXTAREA');
			this._left = left;
			inp = name === 'INPUT';
			sel = this._selElem = name === 'SELECT';
			spin = but && but.indexOf('spin') >= 0;
			// flag for "clear" button
			clear = this._clear = but && but.indexOf('clear') >= 0;
			but = clear || (but && but.indexOf('dropdown') >= 0) || (sel && !spin);
			noBdr = !o.borderBetweenFieldAndButtons && (spin || but);
			cont = (but || spin || o.renderInContainer || o.theme);
			// old attributes which can be modified (used in destroy)
			oldC = this._oldCss = { display: 0, visibility: 0 };
			oldA = this._oldAttr = { className: 0, title: 0 };
			if (inp) {
				// extra old attributes of INPUT
				oldA.value = 0;
			} else if (sel) {
				if (!(sel = o.listItems)) {
					o.listItems = [];
					sel = elem[0].options;
					i = sel ? sel.length : 0;
					if (i > 0) {
						while (i-- > 0) {
							obj = sel[i].value;
							o.listItems[i] = {value: obj, text: _aNull(img = sel[i].text) ? obj : img};
						}
						this._listID = elem[0].selectedIndex;
					}
					sel = 1;
				}
			} else {
				// extra old attributes of TEXTAREA/SPAN/DIV/etc.
				oldA.innerHTML = 0;
			}
			if (inp || this._ta) {
				// extra old attributes/css of INPUT/TEXTAREA
				oldA.disabled = oldA.readOnly = oldA.alt = oldC.textAlign = 0;
				// extra old css of INPUT/TEXTAREA when buttons on and no left/right borders
				if (noBdr) {
					oldC[left ? 'borderLeftWidth' : 'borderRightWidth'] = 0;
				}
			}
			for (i in oldC) {
				if (oldC.hasOwnProperty(i)) {
					oldC[i] = elem.css(i);
				}
			}
			for (i in oldA) {
				if (oldA.hasOwnProperty(i)) {
					oldA[i] = elem[0][i];
				}
			}
			// Note: do not use css('width/height'), because it messy and depends on jquery version
			oldC.width = elem[0].style.width;
			oldC.height = elem[0].style.height;
			// backup if options.value is not set
			if ((i = inp ? oldA.value : (sel ? elem.val() : oldA.innerHTML)) === o.nullText) {
				i = '';
			}
			if (!this._ta && i) {
				i = i.replace(/[\x09\x0a]/g, '');
			}
			this._value = i;
			if (inp || this._ta || sel) {
				// className
				if (oldA.className) {
					this._css += ' ' + oldA.className;
				}
				if (cont) {
					this._swap = true;
					elem.css('display', sel ? 'none' : '');
					elem.css('visibility', sel ? 'hidden' : 'visible');
					elem = $('<span />');
					par.insertBefore(elem[0], field[0]);
					if (sel) {
						field = $('<input />');
					} else {
						par.removeChild(field[0]);
					}
					elem.css('display', oldC.display);
					elem.css('visibility', oldC.visibility);
				} else {
					this._css += ' ' + css.editor;
					return (this._field = elem);
				}
			} else {
				if (o.textMode === 'textarea' || o.textMode === 'multiline') {
					field = $('<textarea />');
					this._ta = 1;
				} else {
					field = $(o.textMode ? '<input type="' + o.textMode + '"/>' : '<input />');
				}
				elem[0].innerHTML = '';
			}
			elem.addClass(css.editor);
			this._css += ' ' + css.fieldInContainer;
			if (o.theme) {
				elem.addClass(o.theme);
			}
			if (but || spin) {
				this._buttons = [];
			}
			// remove left/right borders from input
			if (noBdr) {
				// this._bb: flag (name of css-attribute) to adjust border on show/hide button
				field.css(this._bb = left ? 'borderLeftWidth' : 'borderRightWidth', '0px');
				if (spin) {
					this._bb = null;
				}
			}
			if (but) {
				// 0:default, 1:local-hover, 2:pressed, 3:disabled, 4:image-default, 5:image-hover, 6:image-pressed, 7:image-disabled
				csso = [css.button + ' ' + css.buttonDefault, css.buttonHover, css.buttonPressed, css.buttonDisabled, css.buttonImage + (clear ? ' ' + css.buttonClearImage : ''), css.buttonImageHover, css.buttonImagePressed, css.buttonImageDisabled];
				but = this._buttons[0] = $('<span />').addClass(csso[0]);
				but[0].title = this._optVal('buttonTitle', 1);
				but._css = csso;
				img = $('<span />').addClass(csso[4]).appendTo(but);
				// _id: 1:button, 5:button-image
				img[0]._id = 5;
				but[0]._id = 1;
				if (left) {
					but.css('float', 'left');
					but.appendTo(elem);
				}
			}
			if (spin) {
				spinCont = $('<span />').addClass(css.spinHolder);
				// 0:default, 1:local-hover, 2:pressed, 3:disabled, 4:image-default, 5:image-hover, 6:image-pressed, 7:image-disabled
				csso = [css.spinButton + ' ' + css.buttonDefault, css.buttonHover, css.buttonPressed, css.buttonDisabled, css.spinButtonImage + ' ' + css.spinUpperImage, css.spinUpperImageHover, css.spinUpperImagePressed, css.spinUpperImageDisabled];
				obj = this._buttons[1] = $('<span />').addClass(csso[0]).appendTo(spinCont);
				obj[0].title = this._optVal('spinUpperTitle', 3);
				obj._css = csso;
				// _id: 2:upper-spin, 6:upper-spin-image
				obj[0]._id = 2;
				img = $('<span />').addClass(csso[4]).appendTo(obj);
				img[0]._id = 6;
				// 0:default, 1:local-hover, 2:pressed, 3:disabled, 4:image-default, 5:image-hover, 6:image-pressed, 7:image-disabled
				csso = [css.spinButton + ' ' + css.buttonDefault, css.buttonHover, css.buttonPressed, css.buttonDisabled, css.spinButtonImage + ' ' + css.spinLowerImage, css.spinLowerImageHover, css.spinLowerImagePressed, css.spinLowerImageDisabled];
				obj = this._buttons[2] = $('<span />').addClass(csso[0]).appendTo(spinCont);
				obj[0].title = this._optVal('spinLowerTitle', 3);
				obj._css = csso;
				// _id: 3:lower-spin, 7:lower-spin-image
				obj[0]._id = 3;
				img = $('<span />').addClass(csso[4]).appendTo(obj);
				img[0]._id = 7;
				if (left) {
					spinCont.appendTo(elem);
				}
			}
			this._field = field.appendTo(elem);
			if (!_aNull(i = o.tabIndex)) {
				field[0].tabIndex = i;
			}
			if (!left && spin) {
				spinCont.appendTo(elem);
			}
			if (!left && but) {
				but.appendTo(elem);
			}
			return elem;
		},
		_leftShift: function () {
			var but = this._buttons;
			return (this._left && but) ? (but[0] ? but[0].outerWidth() : 0) + (but[1] ? but[1].outerWidth() : 0) : 0;
		},
		_val: function () {
			return this._box ? this._field[0].checked : (this._nullT ? '' : this._field[0].value);
		},
		// sets nullText if control has no focus and adjusts nullTextCss and negativeCss
		_fixNull: function () {
			var txt, nullTxt = this.options.nullText;
			if (!nullTxt) {
				return;
			}
			txt = this._val();
			this._nullT = null;
			if (txt === '' && nullTxt && this._fcs < 2) {
				this._nullT = true;
				this._field[0].value = nullTxt;
			}
			this._fixCss();
		},
		// return NullText or txt and adjust NullText flag
		_focTxt: function (txt, foc, e) {
			var nt = this.options.nullText;
			this._nullT = null;
			if (!foc && txt === '' && nt && (!_aNull(e) || this.options.readOnly)) {
				txt = nt;
				this._nullT = true;
			}
			return txt;
		},
		validate: function (noLabel) {
			/* Triggers validation of editor and show error message. That method has effect only when validation is enabled.
				paramType="bool" optional="true" Value of true will allow to skip error message if validation failed.
				returnType="bool" Returns true if value is valid, false - if value is invalid and error message was displayed.
			*/
			return !this.options.validatorOptions || !this._doInvalid(null, noLabel ? 2 : 1);
		},
		isValid: function () {
			/* Checks if value in editor is value. Note: that method may fail if editor has focus (in edit mode).
				returnType="bool" Returns true if value is valid, false - value is invalid.
			*/
			return !this._doInvalid(null, 9);
		},
		// e - null or ''
		// flag: 1-show error message, 2-do not show error, 9-check only:return error message
		// return true: invalid, or error message (if flag=9)
		_doInvalid: function (e, flag) {
			if (!this._field) {
				return;
			}
			var ch, i, old, val = this._val(), cancel = false, fac = 1, inv = null, o = this.options, type = this._type;
			// reset value for argument of invalid event
			this._inv = null;
			// required entry
			if (o.required && (!val || (type === 1 && !this.getValueByMode(0, '', 1)))) {
				// temporary flag for required entry
				inv = 1;
			// text editor
			} else if (type === 0) {
				if (!o.nullable && !val) {
					// temporary flag for required entry
					inv = 1;
				}
			// mask editor
			} else if (type === 1) {
				val = this._txt;
				i = val.length;
				while (i-- > 0 && !inv) {
					ch = val.charCodeAt(i);
					// flag==21==# optional and allows digits and +/-, it should be replaced by Space
					// skip 21 for validatorOptions of required character
					if (ch < 21 && (ch % 2) === 1) {
						inv = { value: val = this._getVal(), message: this._optVal('mask', 2) };
					}
				}
			// date editors
			} else if (type < 4) {
				val = this._toDate(val, e === '', true, true);
				// value for argument of invalid event
				inv = this._inv;
			// numeric editors
			} else {
				val = this._toNum(val, true, true);
				// value for argument of invalid event
				inv = this._inv;
				// 7-numeric display factor (1-100)
				fac = this._prop(7);
				if (inv && val && fac > 1) {
					old = val;
					inv.value = (val /= fac);
				}
			}
			// fix temporary flag for required entry
			if (inv === 1) {
				inv = { value: val = null, message: this._optVal('required', 2) };
			}
			// request for error-message
			if (flag === 9) {
				return inv;
			}
			if (inv) {
				// 13-invalidValue
				cancel = this._fire(13, null, inv);
				// value was fixed by application
				if (val !== inv.value) {
					val = inv.value;
					inv = null;
				}
				if (old) {
					if (inv) {
						val = old;
					} else {
						if (_aNull(val, 1)) {
							val = null;
						} else if (val) {
							val *= fac;
						}
					}
				}
				if (type <= 1 && !inv) {
					this._setVal(val);
					return;
				}
			}
			if (type > 1 && type < 4) {
				if (!(this._isNull = _aNull(val))) {
					this._date = val;
				}
				if (val && o.useLastGoodDate) {
					this._goodD = val;
				}
			}
			// set _value to Number or Date for _focusTxt
			this._value = val;
			// used by this.validate
			if (flag && inv && !cancel && !this._setOpt) {
				return this._doError(flag, null, inv.message);
			}
		},
		_focusTxt: function (foc, e, txt0) {
			var e0 = e, txt = '', o = this.options, type = this._type, d = null, prompt = '';
			// mask editor
			if (type === 1) {
				txt0 = null;
				if (!_aNull(e) && !foc) {
					e = e !== '';
					if (e && this._bad !== 0) {
						this._txt = this._setTxt(this._val(), 5, true);
					}
					txt0 = this._txt;
					if (!e) {
						this._doInvalid(e0);
					}
				}
				txt = this._getTxt(foc ? 5 : 4, foc ? o.promptChar : o.padChar, txt0);
			// date editors
			} else if (type === 2 || type === 3) {
				if (_aNull(txt0)) {
					prompt = o.promptChar;
					// key-press
					if (_aNull(e) && foc) {
						return this._getTxt(5, prompt);
					}
					// ""-from _update=lostFocus
					if (!_aNull(e) && !foc) {
						this._doInvalid(e);
						// this._value was set by _doInvalid within call _toDate
						d = this._value;
					} else if (!this._isNull) {
						d = this._date;
					}
				} else {
					d = this._toDate(txt0, foc, true);
				}
				txt = this._toTxt(d, foc, prompt, !_aNull(e));
			// numeric editors
			} else if (type > 3) {
				if (!_aNull(e) && !foc) {
					this._doInvalid();
				}
				// this._value could be set by _doInvalid within call _toNum
				txt = this._toTxtNum(this._value, foc);
			// text editor
			} else {
				txt = this._val();
				if (!_aNull(e) && !foc) {
					this._doInvalid(e);
				}
			}
			return this._focTxt(txt, foc, e);
		},
		_repaint: function () {
			if (this._val() !== this._text) {
				this._field[0].value = this._text;
			}
		},
		_instant: function (p1, limit, f) {
			var val, type = this._type, mode = this._dataMode;
			if (this._box) {
				return this._val();
			}
			// mask editor
			// p1-prompt
			if (type === 1) {
				return this.getValueByMode(mode, p1, limit);
			}
			// date editors
			// p1-mode
			if (type === 2 || type === 3) {
				return this.getValueByMode(p1 ? 0 : mode, limit);
			}
			// numeric editors
			// p1-get number
			if (type > 3) {
				val = this._toNum(this._val(), limit);
				if (val && (limit || f) && !isNaN(val)) {
					// 7-numeric display factor (1-100)
					val /= this._prop(7);
				}
				// -1:text, 0:editModeText, 1:double, etc.
				return (p1 || mode > 0) ? val : this._toTxtNum(val, mode === 0);
			}
			// text editor
			return this._val();
		},
		// flag: 1-button title, 3-spin-button titles
		_optVal: function (key, flag) {
			var val = this._validator, o = this.options;
			// validation message
			if (flag === 2) {
				return val ? val._loc(key) : '';
			}
			if (!_aNull(val = o[key])) {
				return val;
			}
			// locale (titles of buttons)
			if (flag === 3 || flag === 1) {
				if (this._clear) {
					key = 'clearTitle';
				} else if (flag === 1 && this._type === 3) {
					key = 'datePickerButtonTitle';
				}
				o = o.locale;
				if (typeof o === 'string') {
					o = $.ui.igEditor.locale[o];
				}
				if (!o || !(val = o[key])) {
					val = $.ui.igEditor.locale.defaults[key];
				}
				return val ? val : this.locale[key];
			}
			// regional
			o = o.regional;
			if (typeof o === 'string') {
				o = $.ig.regional[o];
			}
			if (!o || _aNull(val = o[key])) {
				val = $.ig.regional.defaults[key];
			}
			return _aNull(val) ? this.regional[key] : val;
		},
		_setOption: function (key, val) {
			var v, old = val, dp = null, o = this.options, loc = key === 'locale', reg = key === 'regional', buts = this._buttons, field = this._field;
			if (o[key] === val || key === 'textMode') {
				return;
			}
			if (key === 'buttonHidden') {
				return this._butVis(val);
			}
			if (key === 'theme') {
				// editor has only 1 element
				if (this._1e) {
					return;
				}
				if (o.theme) {
					this._element.removeClass(o.theme);
				}
				if (val) {
					this._element.addClass(val);
				}
				this._listRemove();
			}
			if (key === 'inputMask' && this._type === 1) {
				old = this.getValueByMode(0, ' ', 1);
				this._setMask(val);
				this._setTxt(old, 0);
			}
			o[key] = val;
			if (reg && this._dp) {
				dp = this._dpRegion();
				if (dp) {
					this._dpOption(o.datepickerOptions = $.extend(o.datepickerOptions, dp));
				}
			}
			v = 'buttonTitle';
			if ((loc || key === v) && buts && buts[0]) {
				buts[0][0].title = this._optVal(v, 1);
			}
			v = 'spinUpperTitle';
			if ((loc || key === v) && buts && buts[1]) {
				buts[1][0].title = this._optVal(v, 3);
			}
			v = 'spinLowerTitle';
			if ((loc || key === v) && buts && buts[2]) {
				buts[2][0].title = this._optVal(v, 3);
			}
			if (key === 'disabled') {
				field[0].disabled = val;
				this._fixCss();
			}
			if (key === 'display') {
				this._element.css(key, val);
			}
			if (key === 'textAlign') {
				field.css(key, val);
			}
			if (key === 'readOnly') {
				field[0].readOnly = val ? 'readonly' : '';
			}
			if (key === 'maxLength' || key === 'tabIndex') {
				field[0][key] = val;
			}
			if (key === 'value') {
				this.value(val);
			}
			if (key === 'width') {
				this._width(val);
			}
			if (key === 'height') {
				this._height(val);
			}
			if (key === 'validatorOptions' || key === 'required') {
				this._initValidator();
			}
			// A.T. Fixing null text, it wasn't taken into account in _setOption
			if (key === 'nullText') {
				this._fixNull();
			}
			if (key === 'type') {
				this._doType(val);
				// request to reset value
				reg = 3;
			}
			key = key.toLowerCase();
			if (key.indexOf('list') === 0) {
				this._listRemove();
			} else if (key.indexOf('kero') > 0) {
				if (this._dp) {
					this._dpOption(val);
				}
			} else if (key.indexOf('data') >= 0 || reg || !_aNull(this.regional[key]) || key.indexOf('date') === 0 || key.indexOf('max') >= 0 || key.indexOf('min') >= 0 || key.indexOf('pat') >= 0 || key.indexOf('roup') > 0 || key.indexOf('sep') >= 0 || key.indexOf('ymb') > 0) {
				this._setOpt = true;
				this._listRemove();
				// reg=3 flag set by key=='type': request to reset value
				this._fixMode((reg === 3) ? 3 : 0);
				this._repaint();
				// last-value-string may change
				this._lastText = this._val();
				this._setOpt = null;
			}
			return this;
		},
		_dpRegion: function () {
			var reg = this.options.regional;
			return ($.datepicker && typeof reg === 'string') ? $.datepicker.regional[(reg === 'defaults' || reg === 'en-US') ? '' : reg] : null;
		},
		// fix datepicker options, if it already exists
		_dpOption: function (val) {
			var old = this._getVal(1);
			this._field.datepicker('option', val);
			// restore date which was 'friendly' destoyed when option of datepicker was modified
			this._setVal(old);
		},
		getRegionalOption: function (name) {
			/* Gets calculated value of regional option used by numeric and date editors.
				paramType="string" Name of regional option, such as "monthNames", "dateLongPattern", "currencySymbol", etc.
				returnType="string" Returns value of option used by editor.
			*/
			return this._optVal(name);
		},
		field: function () {
			/* Gets reference to jquery object which is used as edit field.
				returnType="$" Returns reference to jquery object. That can be INPUT or TEXTAREA.
			*/
			return this._field;
		},
		mainElement: function () {
			/* Gets reference to jquery object which is used as top/outer element of igEditor.
				returnType="$" Returns reference to jquery object.
			*/
			return this._element;
		},
		dropDownElement: function () {
			/* Gets reference to jquery object which is used as container of drop-down.
				returnType="$" Returns reference to jquery object or null. That can be container of list items or in case of igDatePicker it can be calendar of jquery.datepicker.
			*/
			var el = this._ddList;
			// datepicker
			if (this._type === 3) {
				el = $.datepicker;
				if (el) {
					el = (el._ig_dp === this) ? el.dpDiv : null;
				}
			}
			return el ? el : null;
		},
		show: function () {
			/* Shows editor (if it was hidden).
				returnType="object" Returns reference to this igEditor.
			*/
			return this._vis(true);
		},
		hide: function () {
			/* Hides editor.
				returnType="object" Returns reference to this igEditor.
			*/
			return this._vis();
		},
		remove: function () {
			/* Removes editor from its parent element, but keeps the rest of functionality.
				returnType="object" Returns reference to this igEditor.
			*/
			var p, e = this._element;
			p = (e && e[0]) ? e[0].parentNode : null;
			if (p && p.tagName) {
				this._doError();
				this._doDrop();
				this._stopTimer();
				this._hadFocus = $.ui.igEditor._keepFoc = null;
				this._noPaste = this._fcs = this._k0 = this._hover = this._mouseDown = 0;
				p.removeChild(e[0]);
			}
			return this;
		},
		dropDownVisible: function (showHide) {
			/* Shows editor (if it was hidden).
				paramType="bool" optional="true" Value true will show dropdown, false - hide dropdown. 
				returnType="bool|object" Returns reference to this igEditor if parameter is defined. If parameter is undefined, then Otherwise, that returns true is drop down is visible and false if drop down is hidden.
			*/
			if (!arguments.length) {
				return !!this._ddOn;
			}
			if (!showHide) {
				this._doDrop();
			} else if (!this._ddOn) {
				this._doDrop(1);
			}
			return this;
		},
		findListItemIndex: function (text, ignoreCase, partial, contains) {
			/* Finds index of list item by text.
				paramType="string" Text to search.
				paramType="bool" optional="true" Value true sets request to ignore case
				paramType="bool" optional="true" Value true will perform partial search rather than full match
				paramType="bool" optional="true" Value true will perform search anywhere within text of item, otherwise starts-with search is used.
				returnType="number" Returns index of item or -1.
			*/
			var item = this._find(_str(text), 0, 1, ignoreCase, partial, contains);
			return item ? item.id : -1;
		},
		addListItems: function (items, index) {
			/* Adds several items to list.
				paramType="object" Array of items.
				paramType="number" optional="true" Index within current list where items are inserted. If parameter is missing or too large or negative, then items are appended to list.
				returnType="object" Returns reference to this igEditor.
			*/
			return this._listChange(items, index, 2);
		},
		addListItem: function (item, index) {
			/* Adds item to list.
				paramType="string|number|date|object" Item for list.
				paramType="number" optional="true" Index within current list where item is inserted. If parameter is missing or too large or negative, then item is appended to list.
				returnType="object" Returns reference to this igEditor.
			*/
			return this._listChange([item], index, 2);
		},
		removeListItem: function (item) {
			/* Removes item from list.
				paramType="string|number|date|object" Current item in list.
				returnType="object" Returns reference to this igEditor.
			*/
			return this._listChange(item, -1, 1);
		},
		removeListItemAt: function (index) {
			/* Removes item from list at index.
				paramType="number" Index of item. If it is negative number, then last item in list is removed.
				returnType="object" Returns reference to this igEditor.
			*/
			return this._listChange(null, index, 1);
		},
		clearListItems: function () {
			/* Removes all items from list.
				returnType="object" Returns reference to this igEditor.
			*/
			return this._listChange(null, -1, 0);
		},
		selectedListIndex: function (index) {
			/* Gets sets selected index of list item.
				paramType="number" optional="true" Index of item.
				returnType="number" Returns index of selected item if parameter is undefined.
			*/
			if (!arguments.length) {
				return this._listID;
			}
			this._listSelect(index);
		},
		getSelectedListItem: function () {
			/* Gets reference to selected item in list.
				returnType="string|number|date|object" Returns reference to selected item or null.
			*/
			var list = this.options.listItems, id = this._listID;
			return (list && id >= 0) ? list[id] : null;
		},
		hasInvalidMessage: function () {
			/* Checks if invalid message is displayed.
				returnType="bool" Returns true if message is displayed.
			*/
			return this._validator ? this._validator.isMessageDisplayed() : false;
		},
		validator: function () {
			/* Gets reference to igValidator used by igEditor.
				returnType="object" Returns reference to igValidator or null.
			*/
			var v = this._validator;
			return v ? v : null;
		},
		text: function (val, s) {
			/* Gets sets text in editor.
				paramType="string" optional="true" New text for editor.
				returnType="string|object" Returns text in editor if parameter is undefined. Otherwise, it returns reference to this igEditor.
			*/
			if (!arguments.length) {
				return this._val();
			}
			// mask/date/numeric editors
			if (this._type > 0) {
				this._sTxt = 1;
				// mask
				if (this._type === 1) {
					this._setTxt(val, _aNull(s) ? 5 : (1000 + s));
				} else {
					this._setVal(val, true);
				}
				this._sTxt = 0;
			} else {
				if (val) {
					this._nullT = null;
				}
				this._text = val;
				this._repaint();
			}
			if (this._fix === 1) {
				this._old = this._instant(1, null, 1);
			}
			return this;
		},
		value: function (val) {
			/* Gets sets value in editor.
				paramType="string|number|date" optional="true" New value for editor.
				returnType="string|number|date|object" Returns value in editor if parameter is undefined. Otherwise, it returns reference to this igEditor.
			*/
			if (!arguments.length) {
				val = this._getVal();
				return (val === undefined) ? null : val;
			}
			this._setVal(val, true);
			this._lastText = this._val();
			return this;
		},
		_getVal: function (numDate) {
			// date editors: numDate-request Date
			// numeric editors: numDate-request Number
			var o = this.options, val = this._instant(numDate, 1);
			// numeric editors
			if (this._type > 3) {
				if (_aNull(val)) {
					val = o.nullValue;
					// -1:text, 0:editModeText, 1:double, etc.
					if (this._dataMode <= 0) {
						return _str(val);
					}
					return (o.nullable || !_aNull(val)) ? val : NaN;
				}
			}
			return val;
		},
		// set value and keep old value as a flag to raise value-change events
		// obj==2: flag that it is spin+noFocus in numeric editor
		_set_val: function (val, obj) {
			this._fix = 0;
			this._setVal(val, obj);
			this._fix = 1;
		},
		// obj==2: flag that it is spin+noFocus in numeric editor
		_setVal: function (val, obj) {
			var txt, max, type = this._type;
			if (this._box) {
				this._field[0].checked = val = (val === true || val === 'true');
			// mask editor
			// obj-mode
			} else if (type === 1) {
				this._setTxt(_str(val), this._dataMode);
			// date editors
			// obj=true-flag from set text(..)
			} else if (type === 2 || type === 3) {
				if (!_aNull(val) && !val.getTime) {
					if (!(obj = this._toDate(val = val.toString(), this._dataMode < 2))) {
						obj = this._toDate(val, true);
					}
					val = obj;
				}
				obj = val;
				if (_aNull(val = this._limits(val))) {
					val = obj;
				}
				this._txt = this._mask;
				if (!(this._isNull = _aNull(val))) {
					this._toTxt(val, true, '', true);
				} else {
					val = new Date();
				}
				this._date = val;
				if (this.options.useLastGoodDate) {
					this._goodD = val;
				}
				this._text = this._focusTxt(this._fcs > 1);
				this._repaint();
			// numeric editors
			} else if (type > 3) {
				if (_aNull(val, 1)) {
					val = null;
				}
				if (val && typeof val === 'number' && this._fix !== 0) {
					// 7-numeric display factor (1-100)
					val *= this._prop(7);
				}
				// 12-maxLength
				txt = this._toTxtNum(val = this._toNum(val, true), this._fcs === 2);
				max = this._prop(12);
				// obj=2: value change on spin + focus
				// check if new number which larger than maxLength
				if (obj === 2 && max > 0 && txt.length > max) {
					return;
				}
				// adjust _nullT flag
				this._focTxt(txt);
				this._text = txt;
				this._value = val;
				this._repaint();
			// text editor
			} else {
				this.text(_str(val));
			}
			// memorize old value. Note: set text(..) (line above) does it already
			if (this._fix === 1 && type > 0) {
				this._old = this._instant(1, null, 1);
			}
			txt = this.options.value = this._getVal();
			this._doClear(txt);
			this._fixNull();
			this._dtt();
		},
		// show/hide clear-button if edit has/doNotHas a value
		_doClear: function (val) {
			if (this._clear) {
				if (this._type === 1) {
					val = this.getValueByMode(0);
				}
				if (val === '') {
					val = null;
				}
				this._butVis(val === null);
			}
		},
		_vis: function (show) {
			var e = this._element;
			e.css('display', show ? this.options.display : 'none');
			e.css('visibility', show ? 'visible' : 'hidden');
			this._fixHeight();
			this._doError();
			return this;
		},
		// if base element is DIV with display:block, then its height can be collapsed
		_fixHeight: function () {
			// _1e: editor has only 1 element
			var nn, h = this._1e ? 0 : this._field[0].offsetHeight, e = this._element;
			nn = (h && e.css('display').indexOf('inline') < 0) ? e[0].nodeName : null;
			if (nn === 'DIV' || nn === 'SPAN') {
				e.css('height', h);
			}
		},
		_butW: function (e, p) {
			p = p ? e[0].parentNode : e[0];
			return ((p = p.offsetWidth) < 2 || (e = _int(e.css('width'), 0)) < 2) ? 0 : Math.max(p, e + 2);
		},
		// adjust width of editor on first paint
		// return 1/true in case of failure and null/false in case of success
		_fixWidth: function () {
			var v, width, height, i = 0, elem = this._element, field = this._field, buts = this._buttons;
			if (buts) {
				if ((width = this._field[0].offsetWidth - 1) < 2) {
					return 1;
				}
				this._noWidth = null;
				if (buts[0]) {
					if ((v = this._butW(buts[0])) < 2) {
						return 1;
					}
					// this._wB: width of button
					width += (this._wB = v);
					i += (16 - v);
				}
				if (buts[1]) {
					if ((v = this._butW(buts[1], 1)) < 2) {
						return 1;
					}
					width += v;
					i += (16 - v);
				}
				height = this._field[0].offsetHeight + 7;
				// this._w0: width of editor
				elem.css('width', this._w0);
				// this._wF: width of field, reduce width of field
				if (i < 0) {
					field.css('width', this._wF = Math.max(this._wF + i, 2));
				}
				// increase width of editor
				i = 0;
				while (i++ < 5 && height <= elem[0].offsetHeight) {
					elem.css('width', ++this._w0);
				}
				this._butVis();
			}
			this._stopTimer();
		},
		_butVis: function (hide) {
			// this._bb: flag (name of css-attribute) to adjust border on show/hide button
			// this._wF: width of field
			var v = this._wF, bb = this._bb, o = this.options, but = this._buttons, field = this._field;
			if (_aNull(hide)) {
				if (!(hide = o.buttonHidden)) {
					return;
				}
			} else {
				o.buttonHidden = hide;
			}
			// this._wB: width of button
			if (!this._wB || !but || !(but = but[0]) || this._butHide === hide) {
				return;
			}
			this._butHide = hide;
			if (hide) {
				but.hide();
				v += this._wB + (bb ? -1 : 0);
			} else {
				but.show();
			}
			if (bb) {
				field.css(bb, hide ? '' : '0px');
			}
			field.css('width', v);
		},
		// set width of editor
		_width: function (val) {
			// reduce width by widths of buttons
			var me = this, buts = this._buttons, field = this._field;
			// editor has only 1 element
			if (this._1e) {
				if (val) {
					field.css('width', val);
				}
				return;
			}
			val = parseInt(val, 10);
			if (!val || isNaN(val) || val < 1) {
				val = 120;
			}
			// this._w0: width of editor
			val = (this._w0 = _int(val)) - 1 - _int(field.css('paddingLeft')) - _int(field.css('paddingRight'));
			// assume that buttons have width=14px and borderWidth=1px
			if ((val -= buts ? ((buts[0] ? 16 : 0) + (buts[1] ? 16 : 0)) : 0) > 0) {
				field.css('width', val);
			}
			// this._wF: width of field
			this._wF = val;
			if (this._fixWidth() && !this._timer) {
				// process first paint, _noWidth: flag to calculate width
				this._noWidth = this._timer = setInterval(function () {
					me._fixWidth();
				}, 200);
			}
		},
		// set height of editor
		_height: function (val) {
			var e = this._field, buts = this._buttons;
			// editor has only 1 element
			if (this._1e) {
				if (val) {
					e.css('height', val);
				}
				return;
			}
			if ((val = _int(val)) > 6) {
				// replace odd by even
				if (buts && buts[1]) {
					val -= val % 2;
				}
				e.css('height', val);
				if (buts && buts[0]) {
					buts[0].css('height', val);
					buts[0].find('SPAN').css('marginTop', Math.floor((val - 16) / 2));
				}
				if (buts && buts[1]) {
					buts[1].css('height', val = Math.floor(val / 2) - 1);
					buts[2].css('height', val);
					buts[1].find('SPAN').css('marginTop', val = Math.floor((val - 16) / 2));
					buts[2].find('SPAN').css('marginTop', val);
				}
			}
			this._fixHeight();
		},
		// preprocess spin action
		_spin: function (delta) {
			var sel, fac, txt, nul = this._nullT, o = this.options;
			if (this._box) {
				return;
			}
			if (this._fcs < 1 && o.focusOnSpin) {
				this.setFocus();
				if (this._fcs < 1) {
					this._focSpin = delta;
					return;
				}
			}
			// 14-spin
			if (this._fire(14, null, delta)) {
				return;
			}
			// case when readOnly+spinOnReadOnly
			if (nul) {
				this._nullT = null;
				this._fixCss();
			}
			txt = this._val();
			this.spin(delta);
			if (this._val() === txt) {
				if (nul) {
					this._nullT = nul;
					this._fixCss();
					return;
				}
				// roll over for numeric editor
				// 10-minValue, 11-maxValue
				if (this._type > 3 && o.spinWrapAround && !_aNull(this._prop(10)) && !_aNull(this._prop(11))) {
					// 7-numeric display factor (1-100)
					sel = this._sel0;
					fac = this._prop(7);
					if (!fac) {
						fac = 1;
					}
					delta = this._limits(this._getVal(true) * fac, true);
					this._setVal(delta / fac, this._fcs);
					this.select(sel);
				}
			}
			if (this._val() !== txt) {
				// 12-textChanged
				this._fire(12);
			}
		},
		_item: function (item) {
			if (item && !_aNull(item.text)) {
				item = item.text;
			}
			if (typeof item === 'function') {
				item = item();
			}
			return _aNull(item) ? '' : item;
		},
		// perform spin action related to list
		_spinList: function (delta) {
			var val, id, roll, len, list, o = this.options;
			list = o.listItems;
			len = list ? list.length : 0;
			if (len < 1) {
				return 1;
			}
			delta = (delta < 0) ? 1 : -1;
			id = this._listID + delta;
			roll = o.spinWrapAround;
			if (id >= len) {
				if (!roll) {
					return;
				}
				id = 0;
			}
			if (id < 0) {
				if (!roll) {
					return;
				}
				id = len - 1;
			}
			val = this._instant(1, null, 1);
			if (val === this._item(list[id])) {
				if ((id += delta) < 0) {
					if (!roll) {
						return;
					}
					id = len - 1;
				}
				if (id >= len) {
					if (!roll) {
						return;
					}
					id = 0;
				}
			}
			val = this._item(list[id]);
			if (!this._listSelect(id)) {
				this._set_val(val);
			}
		},
		// process key event by specific editor
		_doKey: function (k, ch, txt, len, sel0, sel1, bad, e) {
			// 12-maxLength
			var maxDec, iDot, d09, ok, dot, min, decSep, minus, mask, ePow, maxLen = this._prop(12), type = this._type;
			// mask/date editors
			if (type > 0 && type < 4) {
				mask = this._mask;
				len = mask ? mask.length : 0;
				if (len < 1 || k < 7 || (k > 8 && k < 32)) {
					k = 0;
				}
				if (bad) {
					if (k === 0 || !(mask.indexOf(ch) > 0 || this._optVal('am').indexOf(ch) >= 0 || this._optVal('pm').indexOf(ch) >= 0 || (k >= 48 && k <= 57))) {
						_stop(e);
					}
					return;
				}
				if (k === 0) {
					return;
				}
				txt = this._txt;
				if (sel0 !== sel1) {
					while (--sel1 >= sel0) {
						txt = txt.substring(0, sel1) + mask.charAt(sel1) + txt.substring(sel1 + 1);
					}
					sel1++;
				//del
				} else if (k === 7) {
					while (sel1 < len && mask.charCodeAt(sel1) >= 22) {
						sel1++;
					}
					if (sel1 >= len) {
						return;
					}
					txt = txt.substring(0, sel1) + mask.charAt(sel1) + txt.substring(sel1 + 1);
					sel1++;
				//back
				} else if (k === 8) {
					while (sel1 > 0 && mask.charCodeAt(sel1 - 1) >= 22) {
						sel1--;
					}
					if (sel1-- < 1) {
						return;
					}
					txt = txt.substring(0, sel1) + mask.charAt(sel1) + txt.substring(sel1 + 1);
				}
				if (k > 8 && sel1 < len) {
					if (sel1 >= len) {
						return;
					}
					if ((sel0 = this._maskKey(k, ch, txt, len, sel1, mask)) >= 0) {
						txt = this._txt;
						sel1 = sel0;
					} else {
						if (sel0 === -1) {
							return;
						}
						while (mask.charCodeAt(sel1) >= 22) {
							if (++sel1 >= len) {
								return;
							}
						}
						if (_aNull(ch = this._maskFilter(mask.charCodeAt(sel1), ch, 0))) {
							return;
						}
						txt = txt.substring(0, sel1) + ch + txt.substring(sel1 + 1);
						sel1++;
					}
				}
				this._txt = txt;
				this._selKey = sel1;
				// _focusTxt may modify _selKey
				txt = this._focusTxt(true);
				this.select(this._selKey, 0, txt);
				this._selKey = 99999;
				this._listSelect(-1);
				return;
			}
			// numeric editors
			if (type > 3) {
				// 4-decimal separator
				decSep = this._prop(4);
				minus = this._isMinus(k);
				d09 = k >= 48 && k <= 57;
				// check if limit for negative values
				if (minus && sel0 === 0) {
					min = this._prop(10);
					if (!_aNull(min) && min >= 0) {
						return _stop(e);
					}
				}
				if (bad) {
					if (!(k < 9 || minus || d09 || k === decSep.charCodeAt(0))) {
						_stop(e);
					}
					return;
				}
				if (sel0 !== sel1) {
					txt = txt.substring(0, sel0) + txt.substring(sel1);
					sel1 = sel0;
					len = txt.length;
				// 7-del,8-back
				} else if (k === 7) {
					if (sel1++ >= len || len < 1) {
						return;
					}
				} else if (k === 8) {
					if (sel0-- < 1) {
						return;
					}
				}
				if (k < 9 || maxLen === 0 || maxLen > len) {
					dot = k === decSep.charCodeAt(0);
					iDot = txt.indexOf(decSep);
					// 8-maximum decimals
					maxDec = this._prop(8);
					ok = d09 || (sel0 === 0 && minus) || (dot && maxDec > 0);
					ePow = this._ePow();
					mask = ePow ? txt.indexOf(ePow) : -1;
					if (ePow && sel0 > 0) {
						// 69=E, 101=e
						if ((k === 69 || k === 101) && mask < 0) {
							ok = ch = ePow;
						}
						// do not allow dot after E
						if (dot && mask >= 0 && mask < sel0) {
							ok = false;
						}
					}
					// check for maxDecimals
					if (mask < 0 && d09 && iDot >= 0 && sel0 > iDot && iDot + maxDec < len) {
						// do not append digit after maxDecimals
						if (sel0 === len) {
							ok = false;
						// remove digits after maxDecimals
						} else {
							txt = txt.substring(0, --len);
						}
					}
					// allow minus after E
					if (sel0 > 0 && minus) {
						e = txt.charAt(sel0 - 1);
						if ((e === 'E' || e === 'e') && txt.substring(sel0 - 1).indexOf('-') < 0) {
							ok = true;
						}
					}
					if (len > 0 && sel0 === 0) {
						if (this._isMinus(txt.charCodeAt(0))) {
							ok = false;
						}
					}
					if (k > 8 && !ok) {
						return;
					}
					if (dot) {
						// remove old dot
						if (iDot >= 0) {
							if (iDot === sel0 || iDot === sel0 - 1) {
								return;
							}
							len--;
							if (iDot < sel0) {
								sel0 = --sel1;
							}
							txt = txt.substring(0, iDot) + txt.substring(iDot + 1);
						}
						// remove digits after maxDecimals
						if (mask < 0 && sel0 + maxDec < len) {
							txt = txt.substring(0, len = sel0 + maxDec);
						}
					}
					if (k > 8 && sel1 >= len) {
						txt += ch;
					} else {
						txt = txt.substring(0, sel0) + ch + txt.substring(sel1);
					}
				} else {
					k = 0;
				}
				this.select((k > 10) ? sel1 + 1 : sel0, 0, txt);
				this._listSelect(-1);
				return;
			}
			// text editor
			if (sel0 !== sel1) {
				txt = txt.substring(0, sel0) + txt.substring(sel1);
				sel1 = sel0;
				len = txt.length;
			// 7-del,8-back
			} else if (k === 7) {
				if (sel1++ >= len || len === 0) {
					return;
				}
				// get around IE mess with new lines in textarea: delete 2 characters instead of 1
				if (this._ta && txt.charCodeAt(sel1 - 1) === 13 && txt.charCodeAt(sel1) === 10) {
					sel1++;
				}
			} else if (k === 8) {
				if (sel0-- < 1) {
					return;
				}
				// get around IE mess with new lines in textarea: delete 2 characters instead of 1
				if (this._ta && txt.charCodeAt(sel0) === 10 && txt.charCodeAt(sel0 - 1) === 13) {
					sel0--;
				}
			}
			if (k < 9 || maxLen === 0 || maxLen > len) {
				if (k > 8 && sel1 >= len) {
					txt += ch;
				} else {
					txt = txt.substring(0, sel0) + ch + txt.substring(sel1);
				}
			} else {
				k = 0;
			}
			this._matchList(txt, k, (k > 10) ? sel1 + 1 : sel0);
		},
		_matchList: function (txt, key, sel) {
			var item;
			if (this._type > 0 || (key < 0 && !this.options.listAutoComplete)) {
				return txt;
			}
			if (!(item = this._findItem(txt, key, sel))) {
				return null;
			}
			this._listSelect(item.id);
			txt = item.text;
			if (key >= 0) {
				this.select(item.sel, 0, txt);
			} else {
				this._field[0].value = txt;
			}
			return txt;
		},
		_findItem: function (txt, key, sel) {
			var o = this.options;
			return this._find(txt, key, o.listMatchOnly, o.listMatchIgnoreCase, true, o.listMatchContains, sel);
		},
		_find: function (txt, key, matchOnly, noCase, partial, contains, sel) {
			// shift: index of match inside of item-string, when contains-match is used
			// id: index of selected drop-down item
			var item, up, part, inside = null, i = -1, many = 0, shift = 0,
				id = -1, str = txt, len = txt.length,
				items = this.options.listItems, match = key >= 0 && matchOnly;
			if (len > 0 && items && (match || key < 0)) {
				part = match = -1;
				up = noCase;
				if (up) {
					str = str.toUpperCase();
				}
				while (++i < items.length) {
					if (_aNull(item = this._item(items[i]))) {
						continue;
					}
					item = item.toString();
					if (up) {
						item = item.toUpperCase();
					}
					if ((shift = item.indexOf(str)) === 0) {
						// full match
						if (item === str) {
							match = i;
							break;
						}
						// partial start-with-match
						many++;
						if (part < 0) {
							part = i;
						}
					// partial contains-match
					} else if (shift > 0 && contains) {
						if (!inside) {
							inside = { i: i, shift: shift };
						}
						many++;
					}
				}
				shift = 0;
				// if no start-with-match, then use contains-match
				if (part < 0 && inside) {
					part = inside.i;
					shift = inside.shift;
				}
				if (match < 0) {
					if (!partial) {
						return null;
					}
					// blur/enter: use first partial match
					if (key < 0) {
						match = part;
					// keyboard: no partial match: reduce length of string and do recursive call
					// though, if entry is char and no partial match for string cut-off by that char, then disable entry
					} else if (part < 0) {
						return (key > 10 && len === sel) ? null : this._find(txt.substring(0, --len), key, matchOnly, noCase, contains, sel);
					// keyboard: single partial match: use it
					} else if (key > 10 && many === 1) {
						match = part;
					// keyboard: multiple partial matches: use substring of first partial match (upper/lower case)
					} else {
						txt = this._item(items[part]).toString().substring(0, len + shift);
					}
				}
				// match found
				if (match >= 0) {
					txt = this._item(items[match]).toString();
					// match found by single partial match: move caret to the end of text
					if (match === part) {
						sel = txt.length;
					}
				}
				id = (match >= 0) ? match : part;
			}
			return { text: txt, id: id, sel: (_aNull(sel, 1) ? len : sel) + shift };
		},
		_undo: function (redo) {
			var old, val = this._old;
			if (redo) {
				if (!this._canRedo) {
					return;
				}
				val = this._redo;
				this._canRedo = false;
			} else {
				old = this._instant(1, null, 1);
				if (old === val) {
					return;
				}
				this._canRedo = true;
				this._redo = old;
			}
			this._set_val(val);
			this._text = this._focusTxt(false);
		},
		// preprocess key (e)event, a: 0-keydown, 1-keypress, 2-keyup
		_doKey0: function (e, a) {
			var ch, up, len, excl, incl, bad = this._validator, me = this,
				t0 = this._text, t1 = this._val(), k = this._key, o = this.options;
			// can be called from setTimeout
			if (!this._field) {
				return;
			}
			// that is request from key-down on Ctrl+V: validate current value in field
			if (!e) {
				if (t0 !== t1) {
					this.paste(t1);
				}
				return;
			}
			// get around 'features' in Firefox under Japanese keyboard
			if (a === 1 && k === 192 && e.altKey && !e.ctrlKey) {
				return;
			}
			// Special keys in NumPad of Opera break all filters and go into input (42,43,45,46,47)
			if (this._type > 0 && $.browser.opera && k > 41 && k < 48) {
				if (a === 0) {
					this._noKey = k;
				} else if (this._noKey === k) {
					_stop(e);
				}
			}
			if (a !== 1) {
				this._noPaste = 2 - a;
			} else if (this._noPaste !== 2) {
				this._noPaste = 1;
			}
			if (k === 9) {
				this._k0 = (a === 2) ? 0 : 9;
				if (a === 0 && bad && bad._lbl) {
					_stop(e);
				}
			}
			if (k === 0 || (k === 114 && a !== 1) || k === 9) {
				return;
			}
			if (this._bad > 2) {
				if (a === 0) {
					this._bad = 2;
				}
				if (a === 2) {
					this._bad -= 3;
				}
			}
			if (a === 0 && k === 229) {
				if (t0 !== t1) {
					this._bad = 2;
				} else {
					this._bad += 3;
				}
			}
			// Japanese Enter keyup in mask editor (fake "save-client-state" action)
			if (k === 13 && this._k0 === 229 && this._type === 1) {
				this._txt = this._setTxt(this._val(), 5, true);
			}
			// Ctrl+Z/Y undo/redo actions
			if (a === 0 && e.ctrlKey && !e.altKey && (k === 90 || k === 89)) {
				this._undo(k === 89);
				return;
			}
			if (this._bad === 2 || (a === 1 && e.ctrlKey)) {
				return;
			}
			if (a === 0 && !e.ctrlKey && !e.altKey && !e.shiftKey) {
				if (this._listKey(e, k)) {
					// prepare for keypress on arrow/action-keys raised by Opera and Firefox
					this._kBad = k;
					return _stop(e);
				}
			}
			if (this._box) {
				return;
			}
			// get around keypress on arrow/action-keys raised by Opera and Firefox
			if (a === 1 && k === this._kBad) {
				return _stop(e);
			}
			this._kBad = null;
			// (Ctrl+V)=86 or (Ctrl+X)=88 or (Shift+Insert)=45 set request to validate value in editor and do paste/remove
			if (a === 0 && ((e.ctrlKey && (k === 86 || k === 88)) || (e.shiftKey && k === 45))) {
				setTimeout(function () {
					me._doKey0();
				}, 1);
			}
			if (a !== 1 && (e.ctrlKey || e.altKey || k === 17)) {
				if (e.altKey) {
					this._k0 = -1;
				} else if (t0 !== t1 && (k === 86 || (k === 17 && a === 2))) {
					this.paste(t1);
					this._noPaste = 1;
				} else if (k === 17) {
					this.getSelectedText();
				}
				return;
			}
			if (a === 0) {
				this._k0 = k;
			}
			if (a === 2) {
				if (this._k0 > 0) {
					this._k0 = 0;
				}
				this._spinField = -1;
			}
			len = t1.length;
			bad = this._bad !== 0;
			if (k <= 46) {
				switch (k) {
				case 8:
				case 46: // back del
					if (this._k0 === k && a === 1) {
						a = 2;
					}
					if (a === 0) {
						a = 1;
						if (k === 46) {
							k = 7;
						}
					}
					break;
				case 27:
					_stop(e);
					if (a === 0) {
						this._undo();
					}
					return;
				case 13: // enter
					if ((o.hideEnterKey && (!this._ta || !e.shiftKey)) || (this._type > 0 && this._ta && e.shiftKey)) {
						_stop(e);
					}
					return;
				case 38:
				case 40: // up down
					if (this._ta) {
						break;
					}
					if (a === 0 && !e.shiftKey) {
						this._spin((k === 38) ? o.spinDelta : -o.spinDelta);
					}
					if (this._k0 === k) {
						a = 2;
					}
					break;
				}
			}
			if (a === 1 && k === this._k0 && ((k < 48 && k > 9 && k !== 32) || k > 90)) {
				return;
			}
			if (!bad) {
				if (a !== 0 && k !== 9) {
					_stop(e);
				}
				if (a === 1 && this._k0 === -1) {
					this._k0 = 0;
					this.getSelectedText();
				}
				if (a === 0 || k < 9) {
					this.getSelectedText();
				}
			}
			if (a === 1 && k > 6) {
				if (k > 31) {
					// 1-keypress
					if (this._fire(1, e)) {
						if (bad) {
							_stop(e);
						}
						return;
					}
					k = this._key;
					excl = o.excludeKeys;
					incl = o.includeKeys;
					if (o.toUpper || o.toLower || excl || incl) {
						ch = String.fromCharCode(k);
						up = ch.toUpperCase();
						if ((excl && excl.toUpperCase().indexOf(up) >= 0) || (incl && incl.toUpperCase().indexOf(up) < 0)) {
							return _stop(e);
						}
						if (o.toUpper) {
							k = up.charCodeAt(0);
						} else if (o.toLower) {
							k = ch.toLowerCase().charCodeAt(0);
						}
						this._key = k;
					}
				}
				this._doKey(k, (k < 10) ? '' : String.fromCharCode(k), t1, len, this._sel0, this._sel1, bad, e);
			}
		},
		paste: function (txt, bad) {
			/* Paste text at location of caret. Note: method raises the "textChanged" event.
				paramType="string" New text to paste.
				returnType="object" Returns reference to this igEditor.
			*/
			var prop, o = this.options;
			if ((this._nullT && !bad) || this._noPaste === 1) {
				return this;
			}
			// 12-maxLength
			prop = this._prop(12);
			if (prop > 0 && prop < txt.length) {
				txt = txt.substring(0, prop);
			}
			prop = o.includeKeys;
			if (prop) {
				// convert expression-flag-characters into normal characters (escape them)
				prop = prop.toUpperCase().replace(/\[/gm, '\\[').replace(/\]/gm, '\\]').replace(/\^/gm, '\\^').replace(/\-/gm, '\\-');
				// remove everything from txt, but 'include' characters
				txt = txt.replace(new RegExp('[^' + prop + ']', 'igm'), '');
			}
			prop = o.excludeKeys;
			if (prop) {
				// convert expression-flag-characters into normal characters (escape them)
				prop = prop.toUpperCase().replace(/\[/gm, '\\[').replace(/\]/gm, '\\]').replace(/\^/gm, '\\^').replace(/\-/gm, '\\-');
				// remove from txt 'exclude' characters
				txt = txt.replace(new RegExp('[' + prop + ']', 'igm'), '');
			}
			if (o.toUpper) {
				txt = txt.toUpperCase();
			} else if (o.toLower) {
				txt = txt.toLowerCase();
			}
			if (_aNull(txt = this._matchList(txt, 0))) {
				txt = this._text;
			}
			this._text = '';
			this._fix = 0;
			this.text(txt, bad ? null : this._sel0); // mask
			this._fix = 1;
			// 12-textChanged
			this._fire(12);
			return this;
		},
		_fixCss: function () {
			var but, i, dis, csso,
				old = this._hoverOld, hov = this._hover, down = this._mouseDown,
				foc = this._fcs > 0, o = this.options, dd = this._ddList, css = this._css, border = '';
			if (!this._field) {
				return;
			}
			dis = o.disabled;
			csso = this.css;
			this._hoverOld = hov;
			if (!old || old === hov) {
				old = 0;
			}
			// remove hover from old hover-list-item of drop-down list
			if (old > 99) {
				if (!dd) {
					return;
				}
				this._listCss(dd, old, csso.listItemHover);
			}
			if (hov > 99) {
				this._listCss(dd, hov, csso.listItemHover, 1);
			}
			// css for normal-state of field
			if (hov) {
				css += ' ' + csso.hover;
			} else if (!dis && !foc) {
				css += (border = ' ' + csso.borderColor);
			}
			if (dis) {
				css += ' ' + csso.disabled;
			}
			if (foc) {
				css += ' ' + csso.focus;
			} else if (this._nullT) {
				css += ' ' + csso.nullValue;
			}
			// numeric editor
			if (this._type > 3 && csso.negative && !this._nullT) {
				if (this._instant(1) < 0) {
					css += ' ' + csso.negative;
				}
			}
			this._setCss(this._field, css);
			// adjust appearance of buttons
			i = this._buttons ? 3 : 0;
			while (i-- > 0) {
				// 0-button, 1-upper spin, 2-lower spin
				if (!(but = this._buttons[i])) {
					continue;
				}
				// _css: 0:default, 1:local-hover, 2:pressed, 3:disabled, 4:image-default, 5:image-hover, 6:image-pressed, 7:image-disabled
				csso = but._css;
				css = csso[0];
				if (dis) {
					css += ' ' + csso[3];
				}
				if (hov) {
					css += ' ' + csso[1];
				}
				if (foc) {
					css += ' ' + this.css.buttonFocus;
				}
				if (down === i + 1) {
					css += ' ' + csso[2];
				}
				this._setCss(but, css + border);
				css = csso[4];
				if (dis) {
					css += ' ' + csso[7];
				}
				if (down === i + 1) {
					css += ' ' + csso[6];
				} else if (hov === i + 1) {
					css += ' ' + csso[5];
				} else if (hov || foc) {
					css += ' ' + this.css.buttonsImageStateOverride;
				}
				this._setCss(but.find('SPAN'), css);
			}
		},
		_setCss: function (obj, css) {
			// check if css was modified externally
			var cur = obj[0].className, old = obj[0]._ig_oldCss;
			obj[0]._ig_oldCss = css;
			// avoid unneccary repainting/image-reloading (possible bugs in IE)
			if (css === old) {
				return;
			}
			// check if css was modified externally: keep external className
			if (old && cur && old !== cur && cur.indexOf(old) >= 0) {
				cur = cur.replace(old, '');
				css += ((cur.charAt(0) !== ' ') ? ' ' : '') + cur;
			}
			obj[0].className = css;
		},
		_enterTxt: function () {
			var d, type = this._type;
			// mask editor
			if (type === 1) {
				return this._getTxt(this._dataMode, '');
			}
			// date editor
			if (type === 2 || type === 3) {
				d = this._toDate(this._val(), true);
				return _aNull(d) ? '' : this._toTxt(d, true, '');
			}
			// numeric editors
			if (type > 3) {
				return this._toTxtNum(null, true, this._val(), '-', '.');
			}
			return this._val();
		},
		_update: function () {
			var v, old = this._old;
			if (this._lock) {
				return; //process valueChanged with alert(), enter part value in mask, keep mouse within text, press enter: 2 alerts.
			}
			this._lock = true;
			this._text = this._focusTxt(false, (this._fcs === 2 || this._hadFocus) ? '' : null); //''-still focus
			v = this._instant(1, null, 1);
			if (!_aNull(v) && !_aNull(old)) {
				if (v.getTime && v.getTime() === old.getTime()) {
					v = old;
				}
			}
			if (v !== old || this._bad === 2) {
				this._val10 = v;
				// 10-valueChanging
				if (this._fire(10, null, v, old)) {
					this._set_val(old);
					this._text = this._focusTxt(false);
				} else {
					if (v !== this._val10) {
						this._setVal(this._val10);
					}
					// if application calls text() within ValueChanged event, then text can be wrong
					this._repaint();
					this.options.value = v = this._instant(1, null, 1);
					// 11-valueChanged
					this._fire(11, null, v, old);
					if (this._k0 !== 13) {
						this._old = v;
					}
					this._dtt();
				}
			}
			this._lock = false;
		},
		// trigger drop-down show/hide. return null if no trigger was found or action failed/canceled
		// k: -2:button, -1:focus, 1..:keycode
		_dropTrigger: function (e, k) {
			var len, ch, acts, o = this.options, on = this._ddOn;
			acts = o.dropDownTriggers;
			if (k === 0 || !acts || (o.readOnly && !o.dropDownOnReadOnly) || (k === -2 && acts.indexOf('button') < 0) || (k === -1 && acts.indexOf('focus') < 0)) {
				return;
			}
			if (((k === 38 && !on) || (k === 40 && on))) {
				return;
			}
			if (k > 0) {
				ch = (k === 38 || k === 40) ? 'arrow' : String.fromCharCode(k);
				if (e.ctrlKey) {
					ch = 'ctrl+' + ch;
				} else if (e.altKey) {
					ch = 'alt+' + ch;
				} else if (e.shiftKey) {
					ch = 'shift+' + ch;
				}
				len = ch.length;
				ch = acts.indexOf(ch);
				if (ch < 0 || (ch > 0 && acts.charAt(ch - 1) !== ',') || (ch + len < acts.length && acts.charAt(ch + len) !== ',')) {
					return;
				}
			}
			// skip double triggers (button+focus)
			if (!on || k !== -1 || new Date().getTime() - on > 900) {
				return this._doDrop(1, e);
			}
		},
		// act for datepicker: 0:hide, 1:show, 2:refresh, 3:destroy
		_doDP: function (act, sel) {
			var o, dp, field, id;
			if (this._type !== 3) {
				return;
			}
			if (!this._dp && act !== 1) {
				return 1;
			}
			if (sel) {
				this._set_val(sel);
				// 12-textChanged
				this._fire(12);
			}
			dp = $.datepicker;
			field = this._field[0];
			id = field.id;
			// configure/hack-into $.datepicker
			if (!dp._old_selectDay) {
				dp._old_selectDay = dp._selectDay;
				dp._old_parseDate = dp.parseDate;
				dp._old_updateDatepicker = dp._updateDatepicker;
				dp._old_checkOffset = dp._checkOffset;
				// do not allow calendar to get focus on mousedown under firefox
				dp.dpDiv.bind('mousedown', function (evt) {
					if ($.datepicker._ig_dp) {
						_stop(evt);
					}
				});
				// prevent default update of field by calendar on select
				dp._selectDay = function (id, month, year, td) {
					var me = this._ig_dp;
					if (!me) {
						return this._old_selectDay(id, month, year, td);
					}
					if (!(id = $('a', td).html())) {
						id = td.firstChild.innerHTML;
					}
					// hide calendar and set value to selection
					me._doDrop(0, { type: 'mousedown' }, [year, month, _int(id)], 1);
				};
				// do not allow calendar to get focus on mousedown under UI
				dp._updateDatepicker = function (inst) {
					if (this._ig_dp) {
						this.dpDiv.addClass(this._ig_css = this._ig_dp.css.dropDown);
					} else if (this._ig_css) {
						this.dpDiv.removeClass(this._ig_css);
						delete this._ig_css;
					}
					this._old_updateDatepicker(inst);
					if (this._ig_dp) {
						this.dpDiv.find('*').attr('unselectable', 'on');
					}
				};
				// replace default parseDate by _getVal
				dp.parseDate = function (a, b, c) {
					return this._ig_dp ? this._ig_dp._getVal(1) : this._old_parseDate(a, b, c);
				};
				// adjust left-position of calendar for possible buttons on left
				dp._checkOffset = function (inst, offset, isFixed) {
					var me = this._ig_dp;
					offset = this._old_checkOffset(inst, offset, isFixed);
					if (me) {
						offset.left -= me._leftShift();
					}
					return offset;
				};
			}
			// show calendar
			if (act === 1) {
				// ensure that field has unique id
				if (id.length < 1) {
					id = this.element[0].id + '_ig_dp_id';
					while (document.getElementById(id)) {
						id += Math.floor(Math.random() * 10);
					}
					field.id = id;
				}
				// create $.datepicker and connect it to field
				if (!this._dp) {
					o = this.options.regional;
					if (!(o = $.extend(this.options.datepickerOptions, this._dpRegion()))) {
						o = {};
					}
					o.showOn = '';
					o.onClose = function () {
						var me = dp._ig_dp;
						if (me) {
							me._dpClosed = 1;
							me._doDrop();
							delete me._dpClosed;
							delete dp._ig_dp;
						}
					};
					this._dp = $(field).datepicker(o);
				}
				dp._ig_dp = this;
				// prevent hide calendar on field-mouse-down, and allow destroy
				this._css += ' ' + $.datepicker.markerClassName;
				dp._showDatepicker(field);
			} else if (act === 2) {
				// update calendar selection from change in field
				dp._doKeyUp({ target: field });
			// 0 - hide, 3 - destroy
			} else {
				// hide calendar
				if (!this._dpClosed) {
					dp._hideDatepicker(field);
				}
				// destroy calendar
				if (act === 3) {
					dp._destroyDatepicker(field);
				}
			}
			return 1;
		},
		_fixBC: function (src, e) {
			src = src.css('backgroundColor');
			e.css('backgroundColor', (!src || src === 'transparent' || src.replace(/ /g, '').indexOf('(0,0,0,0') > 0) ? 'white' : src);
		},
		// show/hide/create drop-down list/calendar
		// act: 0/null-hide, 1-toggle
		// sel: null or [year,month,day] or listIndex+100
		_doDrop: function (act, e, sel, dp) {
			var borderClr, widthOuter, heightOuter, height, up, ht, y, b,
				row, col, cols, rows, dif, cell, max, end, el, xy,
				width, dd, elem, body, len, items, par = this._ddParent,
				i = -1, val = sel, me = this, o = this.options;
			items = o.listItems;
			act = (act === 1) ? !this._ddOn : false;
			if (!act && !this._ddOn && !dp) {
				return;
			}
			len = items ? items.length : 0;
			// datepicker
			if (this._type === 3) {
				if (sel && !isNaN(sel[2])) {
					// 1: get Date object
					if (!(val = this._getVal(1))) {
						val = new Date(sel[0], sel[1], sel[2]);
					} else {
						val.setDate(10);
						val.setFullYear(sel[0]);
						val.setMonth(sel[1]);
						val.setDate(sel[2]);
					}
				}
			} else {
				if (len < 1) {
					return;
				}
				if (sel) {
					val = this._item(items[sel - 100]);
				}
			}
			// 16-show drop-down, 17-hide
			if (this._fire(act ? 16 : 17, e, act ? null : { value: val }) && e) {
				return;
			}
			this._ddOn = act ? new Date().getTime() : null;
			// show/hide calendar
			if (this._type === 3) {
				return this._doDP(act ? 1 : 0, val);
			}
			dd = me._ddList;
			elem = me._element;
			body = !o.listDropDownAsChild || elem === me._field;
			if (!dd) {
				dd = me._ddList = $('<div/>').addClass(me.css.dropDown + ' ' + me.css.list).scroll(function () {
					me._lazy();
				});
				// _id: 99:drop-down
				dd[0]._id = 99;
				dd._sel = -1;
				dd._len = len;
				dd.css({ position: 'absolute', visibility: 'hidden' });
				if ((width = o.listWidth) < 5) {
					if ((width = elem.outerWidth()) < 5) {
						width = 100;
					}
				}
				if (body) {
					me._ddParent = par = o.theme ? $('<span/>').addClass(o.theme).css('position', 'absolute').append(dd) : dd;
					par.css({ left: '0px', top: '0px' }).appendTo($('body'));
					dd.bind(me._mEvts);
				} else {
					me._ddParent = par = dd.prependTo(elem);
				}
				borderClr = dd.css('borderRightColor');
				cols = Math.max(1, o.listColumns);
				rows = dd._rows = Math.ceil(len / cols);
				dif = dd.outerWidth() - dd.width();
				width = Math.ceil((width - dif) / cols - 1);
				me._listLazy = [];
				for (col = 0; col < cols; col++) {
					for (row = 0; row < rows; row++) {
						if (++i >= len) {
							break;
						}
						// check for last item
						cell = '<div style="width:' + width + 'px;position:absolute;white-space:nowrap;overflow:hidden;';
						val = me._item(items[i]);
						if (typeof val !== 'string') {
							if (me._type >= 4 && typeof val === 'number') {
								val = me._toTxtNum(val);
							} else if (val && me._type === 2 && val.getMonth) {
								val = me._toTxt(val);
							} else {
								val = _str(val);
							}
						}
						el = items[i];
						if (el && typeof el.getHtml === 'function') {
							if (!(el = el.getHtml())) {
								el = val;
							}
						} else {
							el = val;
						}
						if (i > 0) {
							cell += 'height:' + height + 'px;left:' + (col * widthOuter) + 'px;top:' + row * heightOuter + 'px;';
						}
						if (col + 1 < cols) {
							cell += 'border-right-color:' + borderClr;
						}
						cell += '" title="' + me._item(items[i]) + '" _id="' + (i + 100) + '" class="' + me.css.listItem;
						if (col + 1 < cols) {
							cell += ' ' + me.css.listItemColumnBorder;
						}
						cell += '">' + ((el === '') ? '&nbsp;' : el) + '</div>';
						// create only first and last (for scrollbar) items
						if (i === 0 || i + 1 === len) {
							cell = $(cell).appendTo(dd);
							// _id: 100+index:drop-down-item
							cell[0]._id = i + 100;
						} else {
							// all other items create by _lazy
							me._listLazy[i] = cell;
						}
						// calculate inner/outer width/height
						if (i === 0) {
							if ((height = cell.height()) < 5) {
								height = 18;
							}
							if ((dif = cell.outerWidth() - cell.width()) > 0) {
								width -= dif;
								cell.css('width', width);
							}
							// width/height of drop-down container
							dd._width = (widthOuter = cell.outerWidth() + 1) * cols;
							dd._height = (dd._height0 = heightOuter = cell.outerHeight()) * rows;
							// ensure that dd-container has same backgroundColor as cell-item
							me._fixBC(cell, dd);
							max = Math.max(0, o.listMaxHeight);
							// make space for scrollbar
							if (max > 0 && dd._height > max) {
								dd._height = max;
								max = Math.ceil(16 / cols);
								cell.css('width', width -= max);
								widthOuter -= max;
							} else {
								max = 0;
							}
							dd.css('overflow', (max > 0) ? 'auto' : 'hidden');
							cell.css({ height: height, left: col * widthOuter, top: row * heightOuter });
						}
					}
				}
				dd._page = Math.max(2, Math.floor(Math.min(dd._height / height), len / 3) - 1);
			}
			if (sel) {
				if (!me._listSelect(sel - 100)) {
					me._set_val(val = this._item(items[sel - 100]));
					// 12-textChanged
					me._fire(12);
				}
			}
			me._listSelect(null, 1);
			val = act ? o.listAnimationShow : o.listAnimationHide;
			if (!val || val < 5) {
				val = null;
			}
			// starting height for show-animation, ending height for hide-animation
			dd._hEnd = val ? 0 : dd._height;
			end = function () {
				if (act) {
					dd.css('filter', '');
					// ensure scroll
					me._listSelect();
					// verify that there is no horizontal scrollbar and increase width (IE+quirks)
					if (!dd._fixW && (i = dd[0].scrollWidth - dd[0].clientWidth) > 0 && i && i < 4) {
						dd.css('width', dd._width += (dd._fixW = i + 1));
					}
				} else {
					dd.css({ display: 'none', visibility: 'hidden' });
				}
			};
			// show list
			if (act) {
				this._lazy();
				if (me._fcs < 1) {
					me.setFocus();
				}
				// validate if drop-down fits in window
				// ht: client height of window
				ht = 999;
				b = document.body;
				el = document.documentElement;
				// process window (not IE)
				if ((i = window.innerHeight) > 50 && i) {
					ht = i;
				} else if ((i = el.clientHeight) > 50 && i) {
					ht = i;
				} else if ((i = b.clientHeight) > 50 && i) {
					ht = i;
				}
				// y: scrollTop of window
				y = Math.max(b.scrollTop, el.scrollTop);
				// if element was swapped, then under Firefox offset() returns wrong values: use original element
				el = me._swap ? me._field : elem;
				xy = el.offset();
				xy.h = el[0].offsetHeight;
				// if enough space for drop-down below editor
				if ((up = xy.top + xy.h + dd._height - y - ht) > 0 && y - xy.top + dd._height < up) {
					// shift drop-down above editor
					if (xy.top - (up = dd._height + 2) < y) {
						// do not allow drop-down go above top edge of window
						up = Math.max(xy.top - y, 2);
					}
					// xy.h is used for "marginTop", when drop-down is local to editor
					// xy.top is used for "top", when drop-down belongs to body
					xy.top += (xy.h = -up);
					// disable animation of height
					dd._hEnd = dd._height;
				} else {
					// show drop-down below editor
					// xy.top is used for "top", when drop-down belongs to body
					xy.top += xy.h;
				}
				// initial styles before show-animation
				dd.css({ opacity: val ? 0 : 1, height: dd._hEnd, width: Math.floor(dd._width / (val ? 2 : 1)), display: '', visibility: 'visible' });
				if (body) {
					// adjust for shift between left edge of field inside of container
					if (me._swap) {
						xy.left -= me._leftShift();
					}
					par.css({ left: xy.left, top: xy.top });
				} else {
					par.css({ marginTop: xy.h, marginLeft: 0 });
					// IE in quirks mode shifts drop-down to the right edge
					up = par.offset();
					if ((up = up.left - xy.left) > 30 && up < elem[0].offsetWidth + 10) {
						par.css('marginLeft', -up + 'px');
					}
				}
				if (val) {
					dd.animate({ opacity: 1, height: dd._height, width: dd._width }, val, null, end);
				} else {
					end();
				}
			// hide list
			} else {
				if (val) {
					dd.animate({ opacity: 0.6 }, Math.floor(val * 0.34)).animate({ opacity: 0, height: dd._hEnd, width: Math.floor(dd._width / 2) }, Math.floor(val * 0.66), null, end);
				} else {
					end();
				}
			}
			return true;
		},
		_lazy: function (i) {
			var id, j, cols = Math.max(1, this.options.listColumns), items = this._listLazy, dd = this._ddOn ? this._ddList : null;
			if (!dd) {
				return;
			}
			if (i) {
				if (items[i]) {
					// _id: 100+index:drop-down-item
					$(items[i]).appendTo(dd)[0]._id = i + 100;
					delete items[i];
				}
				return;
			}
			id = Math.floor(dd[0].scrollTop / dd._height0);
			while (cols-- > 0) {
				for (i = 0; i < dd._page + 8; i++) {
					if (items[j = dd._rows * cols + id + i]) {
						// _id: 100+index:drop-down-item
						$(items[j]).appendTo(dd)[0]._id = j + 100;
						delete items[j];
					}
				}
			}
		},
		_listCss: function (dd, id, css, add) {
			dd = $(dd.children('[_id=' + id + ']'));
			if (add) {
				dd.addClass(css);
			} else {
				dd.removeClass(css);
			}
		},
		// adjust selected item in drop-down list and scroll
		// on=2: do not repaint list, on=1: repaint list, on=null: repaint list if opened
		_listSelect: function (id, on) {
			var top, scroll, sel, arg = null, dd = (on !== 2 && (on || this._ddOn)) ? this._ddList : null, o = this.options;
			if (!o.listItems) {
				return;
			}
			if (!_aNull(id) && this._listID !== id) {
				//18: listSelecting
				if (this._fire(18, null, arg = {index: id, oldIndex: this._listID, item: o.listItems[id]})) {
					return 1;
				}
				this._listID = id;
			}
			id = this._listID;
			if (dd) {
				if (on && id < 0) {
					if (!_aNull(on = this._findItem(this.text(), -1)) && id !== on.id) {
						//18: listSelecting
						if (this._fire(18, null, arg = {index: on.id, oldIndex: id, item: o.listItems[on.id]})) {
							return 1;
						}
						this._listID = id = on.id;
					}
				}
				// adjust css of selected item
				if ((sel = dd._sel) !== id) {
					this._lazy(id);
					this._listCss(dd, sel + 100, this.css.listItemSelected);
					this._listCss(dd, (sel = dd._sel = id) + 100, this.css.listItemSelected, 1);
				}
				if (sel >= 0) {
					// adjust scroll to keep selected item visible
					if ((top = (sel % dd._rows) * dd._height0) > (scroll = dd[0].scrollTop)) {
						if ((top += dd._height0 - dd._height) < scroll) {
							top = -9;
						}
					}
					if (top !== -9) {
						// get around scroll-bug in Safari after animation
						if ($.browser.safari && top > 20 && dd[0].scrollTop === top && !on) {
							dd[0].scrollTop = top - 1;
						}
						dd[0].scrollTop = top;
					}
				}
			}
			if (arg) {
				//19: listSelected
				this._fire(19, null, arg);
			}
		},
		// process keydown for drop-down list
		// return true if key was processed
		_listKey: function (e, k) {
			var i, len, dd = this._ddOn ? this._ddList : null, id = this._listID, kc = $.ui.keyCode;
			if (!dd) {
				return;
			}
			if (k === kc.ENTER || k === kc.SPACE || k === kc.ESCAPE) {
				this._doDrop(0, e, (k === kc.ESCAPE) ? null : id + 100);
				return true;
			}
			// not action key
			if (k < 33 || k > 40) {
				return;
			}
			len = dd._len - 1;
			if ((i = id) < 0) {
				i = -1000;
			}
			if (k === kc.DOWN) {
				i++;
			} else if (k === kc.UP) {
				i--;
			} else if (k === kc.PAGE_DOWN) {
				i += dd._page;
			} else if (k === kc.PAGE_UP) {
				i -= dd._page;
			} else if (k === kc.HOME) {
				i = 0;
			} else if (k === kc.END) {
				i = len;
			} else if (k === kc.RIGHT) {
				if ((i += dd._rows) > len) {
					i = id;
				}
			} else if (k === kc.LEFT) {
				if ((i -= dd._rows) < 0) {
					i = id;
				}
			} else {
				return;
			}
			this._listSelect(Math.max(0, Math.min(i, len)));
			return true;
		},
		_listChange: function (list, i, act) {
			var len, count, j, items = this.options.listItems;
			len = items ? items.length : 0;
			j = count = list ? list.length : 0;
			i = (_aNull(i) || i < 0) ? -1 : i;
			// 0:clear, 1:remove, 2:add
			if (act < 2) {
				if (len < 1) {
					return this;
				}
				// find index of item to remove
				if (act > 0 && i < 0) {
					if (list === null) {
						i = len - 1;
					} else {
						while (++i < len) {
							if (items[i] === list) {
								break;
							}
						}
					}
				}
				if (i < 0) {
					items.length = 0;
				} else if (i < len) {
					items.splice(i, 1);
				}
			} else if (!items) {
				this.options.listItems = list;
			} else {
				while (j-- > 0) {
					if (i >= len || i < 0) {
						items.push(list[count - j - 1]);
					} else if (i === 0) {
						items.unshift(list[j]);
					} else {
						items.splice(i, 0, list[j]);
					}
				}
			}
			this._listRemove();
			return this;
		},
		_listRemove: function () {
			if (this._ddList) {
				this._ddList.unbind();
				this._ddParent.remove();
				this._ddOn = this._ddList = this._ddParent = this._listLazy = null;
				this._listID = -1;
			}
		},
		_initValidator: function (end) {
			var v = this._validator, o = this.options.validatorOptions;
			// check if igValidator.js is available
			if (end || !o || !this.element.igValidator) {
				if (v) {
					v.destroy();
					delete this._validator;
				}
				return;
			}
			o.ctl = this;
			o.required = this.options.required;
			this._field.igValidator(o);
		},
		// show/hide drop-down validator error label
		// flag: 1-textChanged event, 2-focus event, null-unconditional hide
		// e: browser event or null
		// mes: error message from _doInvalid, if flag=2,then it is submit flag
		_doError: function (flag, e, mes) {
			var val = this._validator;
			if (val) {
				if (!_aNull(mes)) {
					// 1: error message was canceled by application (used by this.validate)
					return val._doError(mes, null, flag) !== 1;
				} else if (flag) {
					// notify validator about textChange/focus events
					val._evt(e, null, flag === 2);
					// if error displayed, then memorize current values of editor if focus is set back: used by _onEvt:focus
					if (val._lbl) {
						val._lbl._old = { t: new Date().getTime(), val: this._val(), sel0: this._sel0, sel1: this._sel1, lastTxt: this._lastText, last: this._last, txt: this._text };
					}
				} else {
					val.hide(1);
				}
			}
		},
		// try to get around scroll-to-caret bugs in Firefox/Safari/Opera/IE9+TEXTAREA
		_doScrl: function (field, txt) {
			var ch, e, fox = $.browser.mozilla && !this._dp, width = field.clientWidth, max = field.scrollWidth, len = txt.length, f = false, sel = this._sel0;
			if (this._tr !== 1 || len < 4) {
				return;
			}
			// width of character in INPUT
			ch = max / len * 1.1;
			// text-length after caret
			len -= sel;
			// TEXTAREA
			if (this._ta) {
				if (field.clientHeight + 2 > (max = field.scrollHeight)) {
					return;
				}
				txt = txt.split('\n');
				// only for caret at the end of last line
				if (len * 15 < width && (fox || txt[txt.length - 1].length * 15 > width)) {
					field.scrollTop = max;
					return;
				}
				if (!fox) {
					return;
				}
			// short text before caret
			} else if (sel * 15 < width) {
				return;
			}
			// Safari/Chrome (not Firefox)
			if (!fox) {
				if (max > width + 2) {
					// check length of text after caret and scroll to the end
					if (len * ch * 1.3 < width) {
						field.scrollLeft = max;
					// check length of text before caret and scroll to keep caret at right
					} else if (sel * ch > width + field.scrollLeft) {
						field.scrollLeft = Math.floor(sel * ch - width - 3);
					}
				}
				return;
			}
			// flag to ignore _onEvt
			this._scrl = 1;
			// fake Space+BackSpace: it should trigger horizontal scroll in Firefox
			try {
				e = document.createEvent('KeyboardEvent');
				e.initKeyEvent('keypress', !f, !f, null, f, f, f, f, 0, 32);
				field.dispatchEvent(e);
				e = document.createEvent('KeyboardEvent');
				e.initKeyEvent('keypress', !f, !f, null, f, f, f, f, 8, 0);
				field.dispatchEvent(e);
			} catch (ex) { }
			delete this._scrl;
		},
		_onEvt: function (e, type) {
			var old, txt, field = this._field, me = this;
			field = field ? field[0] : null;
			// _scrl: ignore-event-flag used for scroll-bug in Firefox
			if (!field || me._scrl) {
				return;
			}
			me._evt = e;
			if (type < 11) {
				me._doEvt(e, type, field);
				delete me._evt;
			} else {
				// paste, cut, drop, clear-button
				old = field.value;
				// try to get drop-data from clipboard (IE and Firefox)
				try {
					if (me._nullT && e && e.type === 'drop' && !_aNull(txt = e.originalEvent.dataTransfer)) {
						txt = txt.getData('Text');
					}
				} catch (ex) {
					txt = null;
				}
				me._pasting = 1;
				setTimeout(function () {
					if (!txt) {
						if (!me._field) {
							return;
						}
						txt = field.value;
					}
					if (txt && old !== txt) {
						me.paste(txt, 1);
					}
					delete me._pasting;
				}, 0);
			}
		},
		// eType: 0-keydown, 1-keypress, 2-keyup, 3-mousedown, 4-mouseup, 5-mousemove, 6-mouseover, 7-mouseleave, 8-focus, 9-blur
		_doEvt: function (e, eType, field) {
			var val, foc, skip, skip0, up, time, src, v = null, k = 0, me = this, o = this.options;
			// _noWidth: flag to calculate width
			if (me._noWidth) {
				me._fixWidth();
			}
			if (!e || o.disabled) {
				return;
			}
			if (eType === 10) {
				if (!(v = e.wheelDelta)) {
					v = e.detail;
				}
				if (v) {
					_stop(e);
					me._spin((v > 0) ? o.spinDelta : -o.spinDelta);
				}
				return;
			}
			val = src = e.target;
			// find field/button element which owns event
			// _id: -1:field, 1:button, 2:upper-spin, 3:lower-spin, 5:button-image, 6:upper-spin-image, 7:lower-spin-image, 99:drop-down, 100+index:drop-down-item
			// find element in editor to which belongs browser event
			while (val && k++ < 4 && !(v = val._id)) {
				val = val.parentNode;
			}
			// mouse leave
			if (eType === 7) {
				me._hover = me._mouseDown = 0;
				me._fixCss();
				me._fire(eType, e, v);
				return;
			}
			if (!v) {
				return;
			}
			// mouseover
			if (eType === 6) {
				// disable ability to get focus in IE
				if (v > 0 && !src.unselectable) {
					src.unselectable = 'on';
				}
				// get around drag-drop/paste in Chrome/Safari (no drop/paste/etc events is raised)
				val = field.value;
				if (val === me._lastText || me._pasting) {
					val = null;
				}
				// ignore drop if there is nullText
				if (!me._fcs && val && me._nullT) {
					if (val !== o.nullText) {
						me._fixNull();
					}
					val = null;
				}
				if (val) {
					me.paste(val, 1);
				}
			}
			// replace 5,6,7 (image id) by 1,2,3 (button id)
			if (v > 4 && v < 8) {
				v -= 4;
			}
			// keydown and no focus
			// get around bugs in IE8. It may set focus to element before 'init' was called, so: fake 'focus' event
			if (eType === 0 && me._fcs === 0) {
				me._onEvt({ target: src, type: 'focus' }, 8);
			}
			if (_aNull(me._evt0Spin1) && !me._box) {
				try {
					// new lines in TEXTAREA of IE9 are not compatible with IE6-8.
					// That kills calculations of caret: use selectionStart/End and sacrifice scrolling (process _scrl)
					if (!($.browser.msie && !me._ta) && !_aNull(field.selectionStart)) {
						me._tr = 1;
					}
				} catch (ex) { }
				if (me._tr !== 1) {
					me._tr = field.createTextRange ? field.createTextRange() : null;
				}
				me._bad = _aNull(me._tr) ? 1 : 0;
			}
			me._evt0Spin1 = 0;
			// cut from mask
			// 5-mousemove
			if (eType === 5 && me._fcs === 2 && e.button === 1) {
				me.getSelectedText();
			}
			time = (new Date()).getTime();
			// 0-keydown, 1-keypress, 2-keyup
			if (eType < 3) {
				if (!(k = e.keyCode)) {
					if (!(k = e.which)) {
						k = 0;
					}
				}
				me._key = k;
				me._time = time;
			}
			// 1-keypress
			// 0,2,3,4,5,6,7-keydown,keyup,mousedown,mouseup,mousemove,mouseover,mouseleave
			if (eType !== 1 && eType < 8) {
				if (me._fire(eType, e, v)) {
					if (eType < 4) {
						_stop(e);
					}
					return;
				}
			}
			// 0,1,2-keydown,keypress,keyup
			if (eType < 3) {
				// show/hide drop-down
				if (eType === 0 && (me._fcs === 2 || o.dropDownOnReadOnly) && me._dropTrigger(e, k)) {
					return;
				}
				// readOnly state: allow to process up/down arrows
				if (me._fcs === 1 && (e.shiftKey || eType === 1 || !(o.spinOnReadOnly || (o.dropDownOnReadOnly && me._ddOn)) || k < 9 || k > 40)) {
					return;
				}
				// that may happen in grid-editor under Opera on "+" key
				// k=86: skip possible paste by Ctrl+V
				if (eType === 2 && me._k0 === 0 && k > 0 && k !== 86 && me._text !== me._val()) {
					field.value = me._text;
					return;
				}
			}
			// 3-mousedown
			// v: -1:field, 1:button, 2:upper-spin, 3:lower-spin, 5:button-image, 6:upper-spin-image, 7:lower-spin-image, 99:drop-down, 100+index:drop-down-item
			// buttons, list
			if (eType === 3 && v > 0) {
				if (v === 99) {
					this._ddmd = time;
				}
				_stop(e);
			}
			if (eType === 3 && me._mouseDown !== v) {
				// spin buttons
				if (v > 1 && v < 4) {
					me._stopTimer();
					if (!o.readOnly || o.spinOnReadOnly) {
						up = (v === 2) ? o.spinDelta : -o.spinDelta;
						if (me._fcs < 1 && o.focusOnSpin) {
							me._evt0Spin1 = 1;
							me.setFocus();
						}
						me._spin(up);
						skip = skip0 = 5;
						me._spinField = -1;
						me._timer = setInterval(function () {
							if (me._mouseDown < 2) {
								return me._stopTimer();
							}
							if (--skip < 1) {
								me._spin(up);
								skip = (--skip0 > 8) ? --skip0 : skip0;
							}
						}, 60);
					}
				}
				me._hover = me._mouseDown = v;
				me._fixCss();
			}
			// 5-mousemove, 6-mouseover
			// v: -1:field, 1:button, 2:upper-spin, 3:lower-spin, 5:button-image, 6:upper-spin-image, 7:lower-spin-image, 99:drop-down, 100+index:drop-down-item
			if ((eType === 5 || eType === 6) && me._hover !== v) {
				me._hover = v;
				me._fixCss();
			}
			// 4-mouseup
			if (eType === 4 && me._mouseDown) {
				// v: 1:button
				if (v === 1 && v === me._mouseDown) {
					// 15-buttonClick
					if (!me._fire(15, e)) {
						if (me._clear) {
							// _onEvt(null, 11) will setTimeout to raise possible textChanged/valueChanged events
							me._onEvt(null, 11);
							// _set_val does not reset "old" values
							me._set_val(null);
							me.select(0);
						} else {
							me._dropTrigger(e, -2);
						}
					}
				}
				// close drop-down list and select item under mouse
				if (v > 99) {
					me._doDrop(0, e, v);
				}
				me._mouseDown = 0;
				me._fixCss();
			}
			if (v > 0) {
				return;
			}
			foc = me._focTime;
			// 4-mouseup
			if (eType === 4) {
				// if focus was set by mouse click, then validate selectionOnFocus,
				// because mouseup in Firefox may set caret and distroy selection
				if (foc && foc + 500 > time) {
					me._select();
				}
				// clear for double click
				me._focTime = 0;
			}
			// 0..2 key events
			if (eType < 3) {
				me._doKey0(e, eType);
			}
			val = me._val();
			// 2-keyup
			if (eType === 2) {
				me._last = val;
				// Firefox has list of last strings (like paste) and new value may come from nowhere on mousedown or enter
				if (me._key === 13 && $.browser.mozilla && me._text !== val) {
					me.text(val);
					// 12-textChanged
					me._fire(12, e);
					me._update();
				}
			}
			// get around text-scroll-bugs in Firefox/Safari/Chrome/IE9+TEXTAREA
			if (eType === 1 && me._keyMod) {			
				delete me._keyMod;
				me._doScrl(field, val);
			}
			// 8-focus, 9-blur
			if (eType >= 8) {
				if (me._bad > 2) {
					me._bad = 2;
				}
				me._spinField = -1;
				foc = (eType === 8);
				if (foc === (me._fcs > 0)) {
					return;
				}
				if (!foc && time - this._ddmd < 500) {
					return me.setFocus(-1);
				}
				me._noPaste = 0;
				// get around IE-content-menu "delete" action when no text is selected
				if (!foc && me._lastText !== val) {
					me.paste(val, 1);
				}
				if (!foc && me._type < 2 && !val && !o.nullable) {
					if (!(val = me._old)) {
						val = o.listItems ? o.listItems[0] : '';
					}
					if (val) {
						me._set_val(val);
						val = me._text = me._focusTxt(false);
					} else {
						val = '';
					}
				}
				me._fcs = foc ? (o.readOnly ? 1 : 2) : 0;
				v = $.ui.igEditor._keepFoc;
				if (v) {
					if (v !== me) {
						return;
					}
					if (!foc) {
						$.ui.igEditor._keepFoc = null;
					}
				}
				me._hadFocus = !foc;
				// reference to igValidator
				v = me._validator;
				if (foc) {
					me._k0 = 0;
					if (me._bad > 1) {
						me._bad = 0;
					}
					if (!o.readOnly) {
						if (me._nullT) {
							val = me._last = me._text = field.value = '';
						}
						me._nullT = null;
						// check if error/validator label is displayed (set by _doError)
						v = (v && v._lbl) ? v._lbl._old : null;
						if (v && v.t + 200 > new Date().getTime()) {
							field.value = me._text = v.txt;
							me._lastText = v.lastTxt;
							me._last = v.last;
							me.select(v.sel0, v.sel1);
						} else {
							if (val !== me._text) {
								me.getSelectedText();
								me.paste(val);
							}
							me._lastText = me._last = me._text = me._focusTxt(foc, e);
						}
					}
					me._focTime = time;
					// show drop-down on focus
					me._dropTrigger(e, -1);
				} else {
					// handle situation when error message was displayed, but editor lost focus
					// and value was fixed internally (range, invalid text or required)
					if (v) {
						// notify validator about blur
						me._doError(2, e);
						// set timeout in case validator failed and set focus back to editor
						setTimeout(function () {
							// if value became valid, then hide error
							if (!me._fcs && !me._doInvalid(e, 9)) {
								me._doError();
							}
						}, 100);
					}
					// close drop-down on blur
					me._doDrop(0, e);
					val = me._matchList(val, -1);
					me._canRedo = null;
					if (!o.readOnly) {
						// temporary enable focus state, because set text(..) may fail. Remove, me._fix=1 to disable me._old-change (ValueChange+fast-Tab).
						if (me._last !== val || me._bad !== 0) {
							v = me._fix;
							me._fix = 0;
							me._fcs = 2;
							me.text(val);
							me._fcs = 0;
							me._fix = v;
						}
						// it will raise valueChange events
						me._update();
					}
				}
				me._repaint();
				me._fixCss();
				// 13:selectionOnFocus: -1:select all, 0:caret to start, 1:caret to end, 2:browser default
				if (foc && this._prop(13) < 2) {
					me.select(this._prop(13) * 10000);
					// if focus is set by Tab, then in Firefox select() may fail
					// and default whole text will be selected: select with delay
					me._select();
				}
				me._hadFocus = false;
				// _focSpin is a flag set by the _spin, when no-focus-spin is not allowed
				// so, when focus is received, then send "continue" spin logic back to its sender _spin function
				if (foc && me._focSpin) {
					me._spin(me._focSpin);
				}
				me._focSpin = null;
				me._fire(eType, e, -1);
				me._lastText = me._val();
				return;
			}
			if (!(eType > 3 && me._k0 === 0) && !me._nullT && val !== me._text) {
				me._text = val;
				// 12-textChanged
				me._fire(12, e);
			}
		},
		_fire: function (id, e, arg, a2) {
			// 13-invalidValue, 17-hide drop-down, 18/19-listSelecting/listSelected
			var evt, ee = this.events, args = (id === 13 || id > 16) ? arg : {};
			for (evt in ee) {
				if (ee.hasOwnProperty(evt) && ee[evt] === id) {
					break;
				}
			}
			// 14-spin
			if (id === 14) {
				args.delta = arg;
				args.value = this._instant(1, null, 1);
			}
			// 12-textChanged
			if (id === 12) {
				if ((args.oldText = this._lastText) === (arg = this._val())) {
					return;
				}
				// notify validator about textChange event
				this._doError(1, e);
				this._doClear(arg);
				args.text = this._lastText = this._text = arg;
				// change/spin while no focus
				if (this._fcs < 2 && this._evt0Spin1 !== 1) {
					this._update();
				}
				// update calendar
				this._doDP(2);
				// numeric editor (negative/positive value)
				if (this._type > 3) {
					this._fixCss();
				}
			}
			// key events
			if (id < 3) {
				args.key = this._key;
			// mouse events
			} else if (id < 8) {
				args.elementType = (arg === -1) ? 'field' : ((arg === 1 || arg === 5) ? 'button' : ((arg === 2 || arg === 6) ? 'spinUpper' : ((arg === 3 || arg === 7) ? 'spinLower' : ((arg === 99) ? 'dropDown' : ((arg > 99) ? 'item' + (arg - 100) : '')))));
				args.id = arg;
			}
			// 10-valueChanging, 11-valueChanged
			if (id === 10 || id === 11) {
				args.value = arg;
				args.oldValue = a2;
			}
			// 11-valueChanged
			if (id === 11 && this._fcs === 2) {
				this._update();
			}
			args.owner = this;
			if (!this._trigger(evt, e ? e : this._evt, args)) {
				return true;
			}
			// key events
			if (id < 3) {
				this._key = args.key;
			}
			// 10-valueChanging
			if (id === 10) {
				this._val10 = args.value;
			}
		},
		// only when selectionStart/End is used: Firefox/Safari/Opera/IE9+TEXTAREA
		_select: function (x) {
			// 13:selectionOnFocus: -1:select all, 0:caret to start, 1:caret to end, 2:browser default
			var sel1, me = this, field = this._field[0], sel0 = this._prop(13);
			if (this._tr !== 1 || sel0 > 1) {
				return;
			}
			// flag to set timer
			if (!x) {
				setTimeout(function () {
					try {
						me._select(1);
					} catch (e) { }
				}, 0);
				return;
			}
			sel1 = field.value.length;
			// -1: select all, 0:caret to start, 1:caret to end
			if (sel0 === 0) {
				sel1 = 0;
			} else if (sel0 < 0) {
				sel0 = 0;
			} else {
				sel0 = sel1;
			}
			if (sel0 !== field.selectionStart || sel1 !== field.selectionEnd) {
				this.select(sel0, sel1);
			}
		},
		select: function (sel0, sel1, val) {
			/* Selects text in editor. If parameters are equal, then than method sets location of caret. That method has effect only when editor has focus.
				paramType="number" optional="true" Left edge of selection. If parameter is missing, then all text is selected.
				paramType="number" optional="true" Right edge of selection. If parameter is missing, then value of first parameter is used.
				paramType="string" optional="true" Internal use only (new text)
				returnType="object" Returns reference to this igEditor.
			*/
			var j, i, fix0 = 0, fix1 = 0, tr = this._tr, field = (this._fcs === 2) ? this._field[0] : null;
			if (!field || field.offsetWidth < 2 || this._box) {
				return this;
			}
			if (_aNull(val)) {
				val = field.value;
			} else {
				sel1 = sel0;
				if (field && field.value !== val) {
					this._keyMod = field.value = val;
				}
			}
			i = val.length;
			if (_aNull(sel1, 1)) {
				sel1 = sel0;
				if (_aNull(sel0, 1) || sel0 < 0) {
					sel0 = 0;
					sel1 = i;
				}
			}
			if (sel1 >= i) {
				sel1 = i;
			} else if (sel1 < sel0) {
				sel1 = sel0;
			}
			if (sel0 > sel1) {
				sel0 = sel1;
			}
			this._sel0 = sel0;
			this._sel1 = sel1;
			// IE8+TAB_key have problems with selection object
			try {
				// Firefox/Safari/Opera/IE9+TEXTAREA
				if (tr === 1) {
					field.selectionStart = sel0;
					field.selectionEnd = sel1;
					return this;
				}
				// unknown selection model or error
				if (!tr) {
					if (sel0 !== sel1) {
						field.select();
					}
					return this;
				}
				// all below is IE
				if (this._ta) {
					// get around IE-TEXTAREA mess with '\r\n'
					j = sel1;
					while (j-- > 0) {
						if (val.charCodeAt(j) === 10) {
							if (j < sel0) {
								fix0++;
							}
							fix1++;
						}
					}
					sel0 -= fix0;
					sel1 -= fix1;
				}
				sel1 -= sel0;
				if (this._ta) {
					tr.moveToElementText(field);
				} else {
					tr.move('textedit', -1);
				}
				tr.move('character', sel0);
				if (sel1 > 0) {
					tr.moveEnd('character', sel1);
				}
				// IE8 may raise exception on next line
				tr.select();
			} catch (ex) { }
			return this;
		},
		getSelectedText: function () {
			/* Gets selected text in editor.
				returnType="string" Returns selected text.
			*/
			var i, range, val, txt = '', field = this._field[0], tr = this._tr, sel0 = (this._sel0 = this._sel1 = 0);
			// unknown selection model or error
			if (_aNull(tr)) {
				return txt;
			}
			// Firefox/Safari/Opera/IE9+TEXTAREA
			if (tr === 1) {
				if ((this._sel0 = field.selectionStart) < (this._sel1 = field.selectionEnd)) {
					txt = field.value.substring(this._sel0, this._sel1);
				}
				return txt;
			}
			// all below is IE
			try {
				// IE8 may raise exception on next line
				range = document.selection.createRange();
				val = field.value;
				i = val.length;
				tr = range.duplicate();
				if (this._ta) {
					tr.moveToElementText(field);
				} else {
					tr.move('textedit', -1);
				}
				try {
					while (tr.compareEndPoints('StartToStart', range) < 0) {
						tr.moveStart('character', 1);
						sel0++;
						// get around IE-TEXTAREA mess with '\r\n'
						if (this._ta && val.charCodeAt(sel0) === 10) {
							sel0++;
						}
						if (sel0 > i) {
							break;
						}
					}
				} catch (e1) { }
				txt = range.text;
			} catch (e2) { }
			this._sel0 = sel0;
			this._sel1 = sel0 + txt.length;
			return txt;
		},
		getSelection: function (start) {
			/* Gets left or right edge of selection. That method can be used only when editor has focus.
				paramType="bool" optional="true" If true then left edge of selection is returned. Otherwise, right edge selection is returned.
				returnType="number" Position of left or right edge of selection.
			*/
			this.getSelectedText();
			return start ? this._sel0 : this._sel1;
		},
		setFocus: function (delay) {
			/* Set focus to editor with delay.
				paramType="number" optional="true" Delay in milliseconds. If parameter is missing, then 0 is used. If parameter is -1, then focus is set without delay.
				returnType="object" Returns reference to this igEditor.
			*/
			var me = this;
			// can be called from setTimeout
			if (me._field) {
				if (delay === -1) {
					try {
						me._field[0].focus();
					} catch (ex) { }
				} else {
					setTimeout(function () {
						if (me._fcs < 1) {
							me.setFocus(-1);
						}
					}, delay ? delay : 0);
				}
			}
			return this;
		},
		hasFocus: function () {
			/* Checks if editor has focus.
				returnType="bool" Returns true if editor has focus.
			*/
			return this._fcs > 0;
		},
		_jpn: function (k) {
			return (this._sTxt === 1 && k > 65295 && k < 65306) ? (k - 65248) : k;
		},
		_dtt: function () {
			var v, f, dt = this._oldAttr.title, o = this.options;
			if (o._id) {
				f = o._vsFormat;
				if (_aNull(v = this._getVal(1), this._type > 3)) {
					v = '';
				} else if (this._date) {
					v = v.getFullYear() + '-' + (v.getMonth() + 1) + '-' + v.getDate() + ' ' + v.getHours() + ':' + v.getMinutes() + ':' + v.getSeconds() + '.' + v.getMilliseconds();
				} else if (f && this._type > 3) {
					v = v.toString().replace('.', f);
				}
				$('#' + o._id).val(v);
			}
			if (!dt || dt.indexOf('{0}') < 0) {
				return;
			}
			if ((v = this._val()) === '') {
				v = this.options.nullText;
			}
			this._element[0].title = this._field[0].title = this._field[0].alt = dt.replace('{0}', v);
		},
		_stopTimer: function () {
			if (this._timer) {
				clearInterval(this._timer);
			}
			this._timer = null;
		},
		// mask
		_maskFlag: function (ch, upLow) {
			switch (ch) {
			case '>':
				return -1;
			case '<':
				return -2;
			case '&':
				ch = 1;
				break;
			case 'C':
				ch = 2;
				break;
			case 'A':
				ch = 7;
				break;
			case 'a':
				ch = 8;
				break;
			case 'L':
				ch = 13;
				break;
			case '?':
				ch = 14;
				break;
			case '0':
				return 19;
			case '9':
				return 20;
			case '#':
				return 21;
			default:
				return 0;
			}
			return ch + upLow * 2;
		},
		_maskFilter: function (flag, str, i, sf) {
			var ch, f;
			if (i >= str.length) {
				return sf;
			}
			ch = str.charCodeAt(i);
			f = Math.floor((flag - 1) / 6);
			str = str.charAt(i);
			if (ch < 22) {
				return sf;
			}
			if ((f === 1 || f === 3) && ch > 100) {
				if ((ch = this._jpn(ch)) < 100) {
					str = String.fromCharCode(ch);
				}
			}
			if (f === 3) {
				// flag==21==# optional and allows digits and +/-, it should be replaced by Space
				return ((flag === 21 && (str === '-' || str === '+')) || (ch > 47 && ch < 58)) ? str : sf;
			}
			if (f === 1 || f === 2) {
				if (f === 1 && ch > 47 && ch < 58) {
					return str;
				}
				if (ch < 256 && str.toUpperCase() === str.toLowerCase()) {
					return sf;
				}
			}
			if ((flag = Math.floor((flag - 1) / 2) % 3) === 0) {
				return str;
			}
			return (flag === 2) ? str.toLowerCase() : str.toUpperCase();
		},
		_getTxt: function (vt, prompt, txt0, getVal) {
			var i, len, flag, iLast = this._selKey, mask = this._mask, txt = '', non = !_aNull(txt0), o = this.options;
			if (!non) {
				txt0 = (this._bad !== 0 && this._fcs > 1) ? this._val() : this._txt;
			}
			if (non) {
				non = this._type === 1;
			}
			if (_aNull(txt0) || _aNull(mask)) {
				return txt;
			}
			len = mask.length;
			// iLast: last character to display (caret/endSelection)
			iLast = (this._fcs > 1 && !getVal && o.hideMaskOnFocus) ? ((iLast && iLast < len) ? iLast - 1 : -1) : len;
			for (i = 0; i < len; i++) {
				if ((flag = mask.charCodeAt(i)) < 22) {
					if (i < txt0.length && txt0.charCodeAt(i) >= 22) {
						txt += txt0.charAt(i);
						if (i > iLast) {
							iLast = i;
						}
						non = false;
					} else if (vt % 3 === 2 || (vt % 3 === 1 && flag % 2 === 1)) {
						// flag==21==# optional and allows digits and +/-, it should be replaced by Space
						txt += (flag === 21 && prompt === '') ? o.padChar : prompt;
					}
				} else if (vt >= 3) {
					txt += mask.charAt(i);
					// move to next available position
					if (i === iLast + 1) {
						if (this._selKey === i) {
							this._selKey++;
						}
						iLast++;
					}
				}
			}
			if (iLast++ < len) {
				txt = txt.substring(0, iLast);
			}
			return non ? '' : txt;
		},
		// used only by mask editor
		_setTxt: function (v, vt, render) {
			var ch, flag, j = 0, i = -1, mask = this._mask, txt = this._mask;
			if (!_aNull(v)) {
				while (++i < mask.length) {
					if (vt === 1000 + j) {
						vt = this._dataMode;
					}
					if (j >= v.length) {
						break;
					}
					if ((flag = mask.charCodeAt(i)) < 22) {
						if (!_aNull(ch = this._maskFilter(mask.charCodeAt(i), v, j))) {
							txt = txt.substring(0, i) + ch + txt.substring(i + 1);
						}
						j++;
					} else if (vt >= 3) {
						j++;
					}
				}
			}
			if (render) {
				return txt;
			}
			this._txt = txt;
			this._text = this._focusTxt(this._fcs > 1, ' ');
			this._repaint();
		},
		// convert inputMask (normal chars) to internal flags
		_setMask: function (str) {
			var x, ch, i, i0 = 0, upLow = 0, mask = '', txt = '', t0 = this._getTxt(0);
			for (i = 0; i < str.length; i++) {
				if ((x = this._maskFlag(ch = str.charAt(i), upLow)) !== 0) {
					if (x < 0) {
						upLow = (upLow === -x) ? 0 : -x;
						continue;
					}
					mask += (ch = String.fromCharCode(x));
					ch = this._maskFilter(x, t0, i0++, ch);
				} else if (ch === '\\' && i + 1 < str.length && this._maskFlag(str.charAt(i + 1), 0) !== 0) {
					mask += (ch = str.charAt(++i));
				} else {
					mask += ch;
				}
				txt += ch;
			}
			this._txt = txt;
			this._mask = mask;
		},
		// build mask for date editor
		_getMask: function (fields, v, foc) {
			var x, i, i0 = 0, flag = -1, txt = '';
			if (!v) {
				v = '';
			}
			if (foc) {
				v = v.replace('dddd', 'ddd').replace('ddd,', '').replace('ddd ', '').replace(' ddd', '').replace('ddd', '');
			}
			// temporary replace \\f,d,s,m,etc. by \x01-\x09
			v = v.replace(/\x08/g, ' ').replace(/\x09/g, ' ');
			v = v.replace(/\\f/g, '\x01').replace(/\\d/g, '\x02').replace(/\\s/g, '\x03').replace(/\\m/g, '\x04').replace(/\\t/g, '\x05').replace(/\\H/g, '\x06').replace(/\\h/g, '\x07').replace(/\\M/g, '\x08').replace(/\\y/g, '\x09');
			// 01-y,02-yy,03-yyyy,04-M,05-MM,06-MMM,07-MMMM,08-d,09-dd
			// 10-h,11-hh,12-H,13-HH,14-t,15-tt,16-m,17-mm,18-s,19-ss
			// 20-ddd,21-dddd,22-f,23-ff,24-fff
			v = v.replace('fff', '24').replace('ff', '23').replace('f', '22');
			v = v.replace('dddd', foc ? '' : '21').replace('ddd', foc ? '' : '20').replace('dd', '09').replace('d', '08').replace('ss', '19').replace('s', '18').replace('mm', '17').replace('m', '16');
			v = v.replace('tt', '15').replace('t', '14').replace('HH', '13').replace('H', '12').replace('hh', '11').replace('h', '10');
			v = v.replace('MMMM', foc ? 'MM' : '07').replace('MMM', foc ? 'MM' : '06').replace('MM', '05').replace('M', '04').replace('yyyy', '03').replace('yy', '02').replace('y', '01');
			// restore original \\f,d,s,m,etc.
			v = v.replace(/\x01/g, 'g').replace(/\x02/g, 'd').replace(/\x03/g, 's').replace(/\x04/g, 'm').replace(/\x05/g, 't').replace(/\x06/g, 'H').replace(/\x07/g, 'h').replace(/\x08/g, 'M').replace(/\x09/g, 'y');
			for (i = 0; i < v.length; i++) {
				x = v.charCodeAt(i);
				if (x < 48 || x > 57) {
					if (!foc && (flag = v.charAt(i)) === '\\' && i + 1 < v.length) {
						if ((x = v.charAt(++i)) === '\\') {
							continue;
						}
						if (x === '0' || x === '9') {
							txt += flag;
						}
						txt += x;
					} else {
						txt += v.charAt(i);
					}
					continue;
				}
				flag = (x - 48) * 10 + v.charCodeAt(++i) - 48;
				if (!foc) {
					fields[i0++] = flag;
					txt += '\x01';
					continue;
				}
				fields[i0++] = flag;
				if (flag === 14) {
					txt += 'L';
				} else if (flag === 15) {
					txt += 'LL';
				} else if (flag === 22) {
					txt += '0';
				} else {
					txt += '00';
					if (flag === 3) {
						txt += '00';
					}
					while (flag-- > 23) {
						txt += '0';
					}
				}
			}
			return txt;
		},
		getValueByMode: function (mode, v, getVal) {
			/* Get value in editor by dataMode.
				paramType="string|number" The value of dataMode option supported by editor.
				For example, in case of numeric editors that can be a number in range from -1 to 11, or string such as "text", "double", "byte", etc.
				returnType="string|number|date|object" Returns value in editor or null.
			*/
			var d, type = this._type, empty = this.options.emptyChar;
			mode = this._mode(mode, type);
			// text editor
			if (type === 0) {
				return this._val();
			}
			// numeric editors
			if (type > 3) {
				d = this._dataMode;
				this._dataMode = mode;
				v = this.value();
				this._dataMode = d;
				return v;
			}
			// mask editor
			if (type === 1) {
				return this._getTxt(mode, v ? '' : empty, null, getVal);
			}
			// date editors
			// v-limit
			d = (this._fcs < 2) ? (this._isNull ? null : this._date) : this._toDate(this._val(), true, v);
			return (mode === 0) ? d : (d ? this._toTxt(d, mode === 1, empty) : '');
		},
		// date
		// f:flag of field, d:Date, e:focus, ch:fill-up character
		_fieldVal: function (f, d, e, ch) {
			// 1-y,2-yy,3-yyyy,4-M,5-MM,6-MMM,7-MMMM,8-d,9-dd
			// 10-h,11-hh,12-H,13-HH,14-t,15-tt,16-m,17-mm,18-s,19-ss
			// 20-ddd,21-dddd,22-f,23-ff,24-fff
			var v, j, i = (f % 2) * 2, o = this.options;
			if (f < 4) {
				v = d.getFullYear() + o.yearShift;
				if (f === 3) {
					i = 4;
				} else {
					v %= 100;
					i = (f === 2) ? 2 : 0;
				}
			} else if (f < 8) {
				this.d_s = 2;
				v = d.getMonth() + 1;
				if (f > 5) {
					// 6-MMM,7-MMMM
					f = this._optVal((f === 6) ? 'monthNamesShort' : 'monthNames')[v - 1];
					if (f.length > 0) {
						return f;
					}
				}
			} else if (f < 10) {
				v = d.getDate();
			} else if (f < 16) {
				v = d.getHours();
				//ampm
				if (f > 13) {
					v = this._optVal((v < 12) ? 'am' : 'pm');
					if ((f -= 13) === (i = v.length)) {
						return v;
					}
					if (i < f) {
						v += ' ';
					}
					return v.substring(0, f);
				}
				if (f < 12) {
					v %= 12;
					if (v === 0) {
						v = 12;
					}
				}
			} else if (f < 18) {
				v = d.getMinutes();
			} else if (f < 20) {
				v = d.getSeconds();
			// 20-ddd,21-dddd
			} else if (f < 22) {
				return this._optVal((f === 20) ? 'dayNamesShort' : 'dayNames')[d.getDay()];
			} else {
				v = d.getMilliseconds();
				j = i = f - 21;
				while (j-- > 3) {
					v *= 10;
				}
				while (j++ < 2) {
					v = Math.floor(v / 10);
				}
			}
			v = _str(v);
			if (f < 20 || f > 22) {
				f = v.length;
				if (e) {
					if (i === 0) {
						i = 2;
					} else {
						e = false;
					}
				}
				if (i > 0) {
					if (i < f) {
						v = v.substring(0, i);
					} else {
						while (f++ < i) {
							v = (e ? ch : '0') + v;
						}
					}
				}
			}
			return v;
		},
		_limits: function (val, roll) {
			// 10-minValue, 11-maxValue
			var time, min = this._prop(10), max = this._prop(11);
			// numeric editors
			if (this._type > 3) {
				if (_aNull(val, 1) && !this.options.nullable) {
					val = this.options.nullValue;
					// -1:text, 0:editModeText, 1:double, 2:float, 3:decimal, etc.
					if (!val && this._dataMode > 2) {
						val = 0;
					}
				}
				if (!_aNull(val, 1)) {
					if (!_aNull(min, 1) && val <= min) {
						return roll ? max : min;
					}
					if (!_aNull(max, 1) && val >= max) {
						return roll ? min : max;
					}
				}
				return val;
			}
			// date editors
			if (_aNull(val)) {
				return val;
			}
			time = val.getTime();
			if (!_aNull(min)) {
				min = min.getTime();
			}
			if (!_aNull(max)) {
				max = max.getTime();
			}
			if (!_aNull(min) && (time < min || (roll && time === min))) {
				val.setTime(roll ? max : min);
				return val;
			}
			if (!_aNull(max) && (time > max || (roll && time === max))) {
				val.setTime(roll ? min : max);
				return val;
			}
			return null;
		},
		_date7: function (val) {
			var i;
			if (val.length < 13) {
				return null;
			}
			// build "y-M-d-h-m-s-ms-t" format and split it into array[7]
			val = val.replace(/[\. :]/g, '-').split('-');
			if ((i = val.length) !== 7) {
				return null;
			}
			while (i-- > 0) {
				if ((val[i] = _int(val[i], -1)) < 0) {
					return null;
				}
			}
			return new Date(val[0], val[1] - 1, val[2], val[3], val[4], val[5], val[6]);
		},
		// convert txt to Date
		// foc: focus state
		// limit: validate min/max limits
		// fire: request to fire invalid event (set this._inv)
		// fixNull: request to set value of _isNull
		_toDate: function (txt, foc, limit, fire, fixNull) {
			// n: count of ymd fields
			// mis: 0-all fields, 1..8-missing fields, 9..17-less than min number of fields
			var v, i0, c, iLen, invMes, mis = 0, n = 0, i = -1, j = -1,
				y = -1, mo = -1, day = -1, h = -2, m = -2, s = -2, ms = -2, pm = -1,
				any = false, inv = null, arg = {}, o = this.options,
				d = fire ? null : this._date7(txt),
				fields = (foc && fire) ? this._fields0(txt) : this._fields1(txt, foc);
			iLen = fields.length;
			if (!d) {
				while (++i < iLen) {
					j++;
					v = fields[i];
					i0 = foc ? this._field0IDs[i] : this._field1IDs[i];
					if (i0 < 4) {
						if (v > 100 && v > o.yearShift) {
							v -= o.yearShift;
						}
						if ((arg.year = y = v) < 0) {
							mis++;
						} else {
							n++;
							c = o.centuryThreshold;
							if (v < 100) {
								if (i0 < 3 && c < 0) {
									c = 29;
								}
								if (c >= 0) {
									y += (v > c) ? 1900 : 2000;
								}
							}
						}
					} else if (i0 < 8) {
						if (v < 1 || v > 12) {
							mis++;
						} else {
							arg.month = mo = v;
							n++;
						}
					} else if (i0 < 10) {
						arg.day = day = v;
						if (v < 1 || v > 31) {
							mis++;
						} else {
							n++;
						}
					} else if (i0 < 14) {
						if (v === 24) {
							v = 0;
						}
						if (i0 > 11) {
							pm = -4;
						} else {
							if (v === 12) {
								v = 0;
							}
							if (v > 12) {
								mis++;
							}
						}
						arg.hours = h = v;
						if (v > 23 || v < 0) {
							mis++;
						}
					} else if (i0 < 16) {
						j--;
						if (v > 0) {
							pm++;
						}
						continue;
					} else if (i0 < 18) {
						arg.minutes = m = v;
						if (v > 59 || v < 0) {
							mis++;
						}
					} else if (i0 < 20) {
						arg.seconds = s = v;
						if (v > 59 || v < 0) {
							mis++;
						}
					} else if (i0 < 22) {
						j--;
						continue;
					} else {
						while (i0++ < 24) {
							v *= 10;
						}
						while (i0-- > 25) {
							v = Math.floor(v / 10);
						}
						arg.milliseconds = ms = v;
						if (v > 999 || v < 0) {
							mis++;
						}
					}
					if (v >= 0) {
						any = true;
					}
					if (j < o.minNumberOfDateFields && mis > 0) {
						if (fire && any) {
							invMes = this._optVal('dateFields', 2);
							inv = 'numberOfFields';
						}
						// not enough fields
						mis += 9;
					}
				}
			}
			if (pm === 0 && h >= 0 && h < 12) {
				arg.hours = (h += 12);
			}
			if (!d && (!o.nullable || mis < 9)) {
				// ymd are defined
				if (n === 3) {
					d = new Date(y, mo - 1, day);
					if (y < 100) {
						d.setFullYear(y);
					}
				} else {
					d = new Date();
					if (this._date) {
						d.setTime(this._date.getTime());
					}
					if (day > 0) {
						d.setDate(10);
					}
					if (y >= 0) {
						d.setFullYear(y);
					}
					if (mo > 0) {
						d.setMonth(mo - 1);
					}
					if (day > 0) {
						d.setDate(day);
					}
				}
			}
			if (fire && day > 0 && d && day !== d.getDate()) {
				invMes = this._optVal('invalidDay', 2);
				inv = 'dayOfMonth';
			}
			day = o.useLastGoodDate ? this._goodD : null;
			if (fire && !d && !o.nullable) {
				d = day;
				if (!d || !d.getTime) {
					d = new Date();
				} else {
					invMes = this._optVal('required', 2);
					inv = 'null';
				}
			}
			if (d) {
				if (h > -2) {
					d.setHours((h < 0) ? 0 : h);
				}
				if (m > -2) {
					d.setMinutes((m < 0) ? 0 : m);
				}
				if (s > -2) {
					d.setSeconds((s < 0) ? 0 : s);
				}
				if (ms > -2) {
					d.setMilliseconds((ms < 0) ? 0 : ms);
				}
				if (limit) {
					if (_aNull(d = this._limits(i = d))) {
						d = i;
					} else if (fire) {
						if (!o.minValue) {
							invMes = this._optVal('max', 2).replace('{0}', this._toTxt(o.maxValue));
						} else if (!o.maxValue) {
							invMes = this._optVal('min', 2).replace('{0}', this._toTxt(o.minValue));
						} else {
							invMes = this._optVal('range', 2).replace('{0}', this._toTxt(o.minValue)).replace('{1}', this._toTxt(o.maxValue));
						}
						inv = 'limit';
					}
				}
			}
			if (fire) {
				if (any && !d && txt.length > 0 && day) {
					if (!inv) {
						invMes = this._optVal('date', 2);
						inv = 'invalid';
					}
					d = day;
				}
				if (!any && o.required) {
					invMes = this._optVal('required', 2);
					inv = 'null';
				}
				arg.value = d;
				if (inv && (txt || !o.nullable)) {
					if (o.reduceDayOfInvalidDate !== false && d && any && d.getDate() < 5 && arg.day > 27) {
						d.setDate(0);
						arg.value = d;
					}
					arg.text = txt;
					arg.reason = inv;
					arg.message = invMes;
					// set value for argument of invalid event
					this._inv = arg;
				}
			}
			return d;
		},
		_toTxt: function (d, foc, prompt, txt0) {
			var ch, k, i = -1, f0 = 0, txt = '',
				mask = foc ? this._mask : this._mask1,
				ids = foc ? this._field0IDs : this._field1IDs;
			if (_aNull(d)) {
				return foc ? this._getTxt(5, prompt, txt0 ? (this._txt = mask) : mask) : '';
			}
			this.d_s = 6; // seconds
			while (++i < mask.length) {
				ch = mask.charAt(i);
				if ((k = mask.charCodeAt(i)) < 22) {
					txt += this._fieldVal(ids[f0++], d, foc, ch);
					if (foc) {
						while (i + 1 < mask.length) {
							if (mask.charCodeAt(i + 1) === k) {
								i++;
							} else {
								break;
							}
						}
					}
				} else {
					txt += ch;
				}
			}
			if (!foc) {
				return txt;
			}
			if (txt0) {
				this._txt = txt;
			}
			return this._getTxt(5, prompt, txt);
		},
		_fields1: function (txt, foc) {
			var m, k, j, iLen, i = -1, v = -1, field = 0,
				fields = [], ids = foc ? this._field0IDs : this._field1IDs;
			iLen = ids.length;
			while (++i < iLen) {
				fields[i] = -1;
			}
			if (_aNull(txt)) {
				return fields;
			}
			txt = txt.toUpperCase();
			i = -1;
			while (++i < txt.length && field < iLen) {
				k = this._jpn(txt.charCodeAt(i)) - 48;
				j = ids[field];
				if (j === 20 || j === 21) {
					j = ids[++field]; //dow
				}
				//ampm
				if (j === 14 || j === 15) {
					if (k >= 0 && k <= 9) {
						v = -1;
						field++;
						i--;
						continue;
					}
					if (this._optVal('pm').charAt(0).toUpperCase() === txt.charAt(i)) {
						fields[field++] = 1;
						v = -1;
					}
				} else {
					if (k >= 0 && k <= 9) {
						if (v < 0) {
							v = k;
						} else {
							v = v * 10 + k;
						}
					} else {
						if (v >= 0) {
							fields[field++] = v;
							v = -1;
						// 6-MMM,7-MMMM
						} else if (j === 6 || j === 7) {
							//MMM
							while (v-- > -3) {
								for (k = 0; k < 12; k++) {
									m = this._optVal((j === 6) ? 'monthNamesShort' : 'monthNames')[k];
									m = m.toUpperCase();
									if ((j = m.length) < 1) {
										continue;
									}
									if (v === -3) {
										if (j < 4) {
											continue;
										}
										m = m.substring(0, 3);
									}
									if ((j = txt.indexOf(m) - 1) > -2) {
										if (j < 0 || txt.charAt(j).toLowerCase() === txt.charAt(j)) {
											break;
										}
									}
								}
								if (k < 12) {
									fields[field++] = k + 1;
									break;
								}
							}
						}
					}
				}
			}
			if (field < iLen) {
				fields[field] = v;
			}
			return fields;
		},
		_fields0: function (txt) {
			var x, k, j = -1, i = -1, v = -1, field = -1, n = 22, mask = this._mask, fields = [];
			if (!txt) {
				txt = '';
			}
			while (++i < mask.length) {
				j++;
				if ((x = mask.charCodeAt(i)) > 21 && n > 21) {
					continue;
				}
				if (x > 21) {
					if (field >= 0) {
						fields[field] = v;
					}
				} else {
					if (n > 21) {
						v = -1;
						field++;
					}
					if (j < txt.length) {
						if (x > 18) {
							k = this._jpn(txt.charCodeAt(j)) - 48;
							if (k >= 0 && k <= 9) {
								if (v < 0) {
									v = k;
								} else {
									v = v * 10 + k;
								}
							} else if (i + 1 < mask.length && txt.charAt(j) === mask.charAt(i + 1)) {
								j--;
							}
						} else if (n !== x && this._optVal('pm').charAt(0).toUpperCase() === txt.charAt(j).toUpperCase()) {
							v = 1;
						}
					}
				}
				n = x;
			}
			fields[field] = v;
			return fields;
		},
		_curField: function (s, mask) {
			var i, x, n = 22, field = this._n0 = this._n1 = -1;
			for (i = 0; i < mask.length; i++) {
				if (((x = mask.charCodeAt(i)) > 21) === (n > 21)) {
					continue;
				}
				if (x > 21) {
					if (i >= s) {
						break;
					}
				} else {
					this._n0 = i;
					field++;
				}
				n = x;
			}
			if (this._n0 >= 0) {
				this._n1 = i;
			}
			if (_aNull(field = this._field0IDs[field])) {
				return -1;
			}
			if (field < 8) {
				return (field < 4) ? 0 : 1;
			}
			if (field < 20) {
				return Math.floor((field - 4) / 2);
			}
			return (field > 21) ? 8 : -1;
		},
		_maskKey: function (k, ch, txt, i, s, mask) {
			var field, n = 0, v = -1;
			// not date editors
			if (this._type < 2) {
				return -2;
			}
			field = this._curField(s, mask);
			if (s >= this._n1) {
				if (txt.charCodeAt(--s) > 21) {
					return this._maskKey(k, ch, txt, i, s + 2, mask);
				}
			}
			if (field < 0) {
				return -1;
			}
			//ampm
			if (field === 5) {
				if (s <= this._n0) {
					v = this._optVal('am');
					if (v.charAt(0).toUpperCase() !== (ch = ch.toUpperCase())) {
						v = this._optVal('pm');
						if (v.charAt(0).toUpperCase() !== ch) {
							return -1;
						}
					}
					if (this._n1 === this._n0 + 1) {
						v = v.charAt(0);
					} else if ((i = v.length) < 2) {
						v += ' ';
					} else if (i > 2) {
						v = v.substring(0, 2);
					}
					this._txt = txt.substring(0, this._n0) + v + txt.substring(this._n1);
				}
				return this._n1;
			}
			if (k < 48 || k > 57) {
				if (s === 0 || (k !== 47 && k !== 58 && (k < 44 || k > 57))) {
					return -1;
				}
				if (mask.charCodeAt(s - 1) >= 22 || this._n1 === i) {
					return s;
				}
				while (s < i) {
					if (mask.charCodeAt(s++) >= 22) {
						break;
					}
					txt = txt.substring(0, s - 1) + mask.charAt(s - 1) + txt.substring(s);
				}
				this._txt = txt;
				return s;
			}
			k -= 48;
			if (this._n0 === s) {
				v = txt.charCodeAt(s + 1) - 48;
				// 0-y,1-M,2-d,3-h,4-H,5-AMPM,6-m,7-s,8-ms
				if (field === 2) {
					if (k > 3) {
						n = 1;
					} else if (k === 3 && v > 1) {
						n = 2;
					}
				// 6-m,7-s
				} else if (field === 6 || field === 7) {
					if (k > 6) {
						n = 1;
					} else if (k === 6 && v > 0) {
						n = 2;
					}
				// 1-M,3-h,4-H
				} else if (field > 0 && field < 5) {
					if (field === 4) {
						k--;
						v -= 2;
					}
					if (k > 1) {
						n = 1;
					} else if (k === 1 && v > 2) {
						n = 2;
					}
				}
			}
			if (this._n0 + 1 === s) {
				v = txt.charCodeAt(s - 1) - 48;
				// 0-y,1-M,2-d,3-h,4-H,5-AMPM,6-m,7-s,8-ms
				if (field === 2) {
					if (v > 3 || (v === 3 && k > 1)) {
						n = 3;
					}
				// 6-m,7-s
				} else if (field === 6 || field === 7) {
					if (v > 6 || (v === 6 && k > 0)) {
						n = 3;
					}
				// 1-M,3-h,4-H
				} else if (field > 0 && field < 5) {
					if (field === 4) {
						v--;
						k -= 2;
					}
					if (v > 1 || (v === 1 && k > 2)) {
						n = 3;
					}
				}
			}
			if (n === 1) {
				txt = txt.substring(0, s) + mask.charAt(s) + txt.substring(s + 1);
				s++;
			}
			if (n === 2) {
				txt = txt.substring(0, s + 1) + mask.charAt(s + 1) + txt.substring(s + 2);
			}
			if (n === 3) {
				while (++s < i) {
					if (mask.charCodeAt(s) < 22) {
						break;
					}
				}
				if (s >= i) {
					return -1;
				}
				return this._maskKey(k + 48, ch, txt, i, s, mask);
			}
			this._txt = txt.substring(0, s) + ch + txt.substring(s + 1);
			return ++s;
		},
		_add: function (v0, v) {
			var dot0, dot1, dot2, s1, s2 = v.toString(), s0 = v0.toString(), v1 = v0 + v;
			s1 = v1.toString();
			if ((dot0 = s0.indexOf('.')) < 1 || (dot1 = s1.indexOf('.')) < 1) {
				return v1;
			}
			if ((dot2 = s2.indexOf('.')) > 0) {
				dot2 = s2.length - dot2;
			}
			if (s1.length - dot1 <= (dot0 = Math.max(dot2, s0.length - dot0))) {
				return v1;
			}
			v = 10;
			while (dot0-- > 2) {
				v *= 10;
			}
			return Math.round(v1 * v) / v;
		},
		// Performs spin action.
		spin: function (delta) {
			/* Increments of decrements value in editor according to the parameter.
				If editor has listItems, then that method increments or decrements selected index in list and sets value in editor to new selected item.
				In this case if delta is positive, then list selected index in incremented by 1 and if delta is negative then selected index is decremented by 1.
				paramType="number" Value to increment or decrement current value in editor.
				returnType="object" Returns reference to this igEditor.
			*/
			var val, x, i, d, o = this.options;
			if (!this._spinList(delta)) {
				return this;
			}
			// text/mask editors: no increment/decrement on spin
			if (this._type < 2) {
				return this;
			}
			// numeric editors
			if (this._type > 3) {
				if (!(val = this._toNum(this._val()))) {
					val = 0;
				}
				this._set_val(this._add(val, delta), this._fcs);
				return this;
			}
			// date editors
			i = this._spinField;
			d = new Date();
			d.setTime(this._date.getTime());
			if (i < 0 || i > 8) {
				if (this._fcs === 2) {
					this.getSelectedText();
					i = this._curField(this._sel0, this._mask);
					if (_aNull(d = this._toDate(this._val(), true, true))) {
						d = new Date();
					}
					this._spinField = i;
				} else {
					this._spinField = i = this.d_s;
				}
			}
			// 0-y,1-M,2-d,3-h,4-H,5-AMPM,6-m,7-s,8-ms
			if (i === 5) {
				delta = (delta > 0) ? 12 : -12;
			}
			x = o.spin1Field;
			switch (i) {
			case 0:
				d.setFullYear(delta += d.getFullYear());
				if (x && delta !== d.getFullYear()) {
					i = -1;
				}
				break;
			case 1:
				d.setMonth(delta += d.getMonth());
				if (x && delta !== d.getMonth()) {
					i = -1;
				}
				break;
			case 2:
				d.setDate(delta += d.getDate());
				if (x && delta !== d.getDate()) {
					i = -1;
				}
				break;
			case 3:
			case 4:
			case 5:
				i = d.getDate();
				d.setHours(delta += d.getHours());
				if (x && i !== d.getDate()) {
					i = -1;
				}
				break;
			case 6:
				d.setMinutes(delta += d.getMinutes());
				if (x && delta !== d.getMinutes()) {
					i = -1;
				}
				break;
			case 7:
				d.setSeconds(delta += d.getSeconds());
				if (x && delta !== d.getSeconds()) {
					i = -1;
				}
				break;
			case 8:
				for (i = this._n1 - this._n0; i++ < 3;) {
					delta *= 10;
				}
				d.setMilliseconds(delta += d.getMilliseconds());
				if (x && delta !== d.getMilliseconds()) {
					i = -1;
				}
				break;
			}
			if (i < 0) {
				return this;
			}
			if (!_aNull(delta = this._limits(d))) {
				d = delta;
			}
			this._text = this._toTxt(d, this._fcs === 2, o.promptChar, true);
			this._date = d;
			this._isNull = false;
			this._repaint();
			this.select(this._sel0);
			if (this._fcs === 2) {
				this._last = this._val();
			}
			return this;
		},
		_mode: function (mode, t) {
			var mods;
			if (!mode || t < 1) {
				mode = _aNull(mode) ? ((t > 3) ? 1 : ((t === 1) ? 5 : 0)) : 0;
			} else if (typeof mode !== 'number') {
				mode = mode.toString().toLowerCase();
				if (t > 3) {
					// numeric: -1:text, 0:editModeText, 1:double, 2:float, 3:decimal, 4:long, 5:ulong, 6:int, 7:uint, 8:short, 9:ushort, 10:sbyte, 11:byte
					mods = { 'text': -1, 'editmodetext': 0, 'double': 1, 'float': 2, 'decimal': 3, 'long': 4, 'ulong': 5, 'int': 6, 'uint': 7, 'short': 8, 'ushort': 9, 'sbyte': 10, 'byte': 11 };
				} else if (t > 1) {
					// date: 0:date, 1:editModeText, 2:text
					mods = { 'date': 0, 'editmodetext': 1, 'text': 2 };
				} else if (t > 0) {
					// mask: 0:rawText, 1:rawTextWithRequiredPrompts, 2:rawTextWithAllPrompts, 3:rawTextWithLiterals, 4:rawTextWithRequiredPromptsAndLiterals, 5:allText
					mods = { 'rawtext': 0, 'rawtextwithrequiredprompts': 1, 'rawtextwithallprompts': 2, 'rawtextwithliterals': 3, 'rawtextwithrequiredpromptsandliterals': 4, 'alltext': 5 };
				}
				if (_aNull(mode = mods[mode])) {
					mode = -2;
				}
			}
			// numeric: 1:double
			return (mode < -1) ? ((t > 3) ? 1 : 0) : mode;
		},
		// fix dataMode, numeric: adjust maxLength, date: adjust masks
		_fixMode: function (init) {
			var len, format, mask, mask1, mode, t = this._type, o = this.options, val = this._value;
			this._dataMode = mode = this._mode(o.dataMode, t);
			this._maxLen = o.maxLength;
			// mask and date editors
			if (t > 0 && t < 4) {
				if (!o.promptChar) {
					o.promptChar = '_';
				}
				if (!o.padChar) {
					o.padChar = ' ';
				}
				if (!o.emptyChar) {
					o.emptyChar = ' ';
				}
				if (t === 1 && init) {
					t = o.inputMask;
					this._setMask(t ? t : 'CCCCCCCCCC');
				}
			}
			// text and mask editor
			if (t < 2) {
				if (init === 3) {
					this._setVal(val);
				}
				return;
			}
			// date editor
			if (t < 4) {
				if (!(format = o.dateInputFormat)) {
					o.dateInputFormat = format = 'date';
				}
				if (!o.yearShift) {
					o.yearShift = 0;
				}
				if (_aNull(o.centuryThreshold)) {
					o.centuryThreshold = 29;
				}
				if (_aNull(o.minNumberOfDateFields)) {
					o.minNumberOfDateFields = 3;
				}
				if (!(mask = mask1 = this._optVal(format + 'Pattern'))) {
					mask = mask1 = format;
				}
				len = o.dateDisplayFormat;
				format = len ? len : format;
				if (!(mask1 = this._optVal(format + 'Pattern'))) {
					mask1 = format ? format : mask;
				}
				mask = this._getMask(this._field0IDs = [], mask, 1);
				this._mask1 = this._getMask(this._field1IDs = [], mask1);
				if (init === 1) {
					this._date = new Date();
					this._isNull = false;
				}
				// index of spinning field
				this._spinField = -1;
				// days or seconds
				this.d_s = 10;
				this._setMask(mask);
				if (init !== 1 && !this._isNull) {
					this._setVal(this._date, 1);
				}
				return;
			}
			// numeric editors
			// adjust maxLength, numeric mode: 0:text, 1:double, 2:float, 3:decimal
			if (mode > 3 && this._maxLen < 1) {
				// byte
				len = 3;
				// long
				if (mode < 6) {
					len = 19;
				// int
				} else if (mode < 8) {
					len = 10;
				// short
				} else if (mode < 10) {
					len = 5;
				}
				// ((mode + 1) % 2 === 1) means signed data mode
				this._field[0].maxLength = this._maxLen = len + (mode + 1) % 2;
			}
			if (init === 3) {
				this._setVal(val, 1);
			}
			if (!init && (val || val === 0)) {
				// 7-numeric display factor (1-100)
				this._setVal(val / this._prop(7));
			}
		},
		// convert object to number
		// fire: request to fire invalid event (set this._inv)
		_toNum: function (txt, limit, fire) {
			var val, min = null, max = null, invMes, o = this.options, num = txt, len = 0;
			if (typeof txt !== 'number') {
				txt = _str(txt);
				len = txt.length;
				num = parseFloat(this._txtAsNum(txt));
			}
			if (isNaN(num)) {
				num = null;
			} else if (!isFinite(num)) {
				num = (num === Number.NEGATIVE_INFINITY) ? -Number.MAX_VALUE : Number.MAX_VALUE;
			}
			val = limit ? this._limits(num) : num;
			if (fire && (val !== num || (_aNull(val, 1) && len > 0))) {
				fire = _aNull(num, 1) ? ((len === 0) ? 'null' : 'format') : 'limit';
				if (_aNull(num, 1)) {
					if (len === 0) {
						fire = 'null';
						invMes = this._optVal('required', 2);
					} else {
						fire = 'format';
						invMes = this._optVal('number', 2);
					}
				} else {
					fire = 'limit';
					limit = null;
					if (_aNull(min = o.minValue, 1)) {
						// 10 - minValue
						if (!_aNull(min = this._prop(10), 1)) {
							if (min !== val) {
								min = null;
							}
						}
					}
					if (_aNull(max = o.maxValue, 1)) {
						// 11 - maxValue
						if (!_aNull(max = this._prop(11), 1)) {
							if (max !== val) {
								max = null;
							}
						}
					}
					invMes = _aNull(max, 1) ? this._optVal('min', 2).replace('{0}', min.toString(10)) : (_aNull(min, 1) ? this._optVal('max', 2).replace('{0}', max.toString(10)) : this._optVal('range', 2).replace('{0}', min.toString(10)).replace('{1}', max.toString(10)));
				}
				// set value for argument of invalid event
				this._inv = { value: val, text: txt, reason: fire, message: invMes };
			}
			return val;
		},
		// convert text to number in javascript format
		_txtAsNum: function (txt, dec, min) {
			var ch, len = txt.length;
			if (!dec) {
				// 4-decimal separator
				dec = this._prop(4);
			}
			if (!min) {
				// 3-minus
				min = this._prop(3);
			}
			// filter japanese characters
			while (len-- > 0) {
				ch = txt.charCodeAt(len);
				if (ch === 12290 || ch === 65294) {
					ch = '.';
				} else if (ch === 12289) {
					ch = ',';
				} else if (ch > 65295 && ch < 65306) {
					ch = String.fromCharCode(ch - 65248);
				} else {
					continue;
				}
				txt = txt.replace(new RegExp(txt.charAt(len), 'g'), ch);
			}
			txt = txt.replace('(', (txt.indexOf(min) < 0) ? '-' : '').replace(this._prop(2), '').replace(new RegExp(min, 'g'), '-');
			// temporary replace decimal separator by \01
			txt = txt.replace(dec, '\x01');
			// only one decimal separator
			if ((ch = txt.indexOf(dec)) > 0) {
				txt = txt.substring(0, ch);
			}
			// keep only e, E, -, digits and \01=decimalSeparator
			txt = txt.replace(/[^0-9\-eE\x01]/gm, '').replace('\x01', '.');
			// validate for one dot
			len = txt.length;
			// validate for one minus
			if ((ch = txt.indexOf('-')) >= 0) {
				if (ch + 1 < len && (ch = txt.indexOf('-', ch + 1)) > 0) {
					if (ch > 0 && txt.toUpperCase().charAt(ch - 1) !== 'E') {
						txt = txt.substring(0, ch);
					}
				}
				if (ch + 1 === (len = txt.length)) {
					txt = '-' + txt.substring(0, len - 1);
				}
			}
			return (txt === '-' || txt === '.') ? '' : txt;
		},
		_ePow: function (plus) {
			var ch, pow = this.options.scientificFormat;
			ch = (pow && pow.length > 0) ? pow.charAt(0) : null;
			return (ch && (ch === 'e' || ch === 'E')) ? (plus ? pow : ch) : null;
		},
		// convert object/number to text in display format
		_toTxtNum: function (val, foc, txt, minus, dec, str) {
			// 8-maximum decimals
			var grps, gr0, gr, ch, iL, ePow = this._ePow(), ig = 0, iDec = 0, i = -1, neg = val, maxDec = this._prop(8);
			if (_aNull(txt)) {
				if (_aNull(val, 1)) {
					return '';
				}
				neg = val < 0;
				if (neg) {
					val = -val;
				}
				try {
					txt = ePow ? val.toString(10) : val.toFixed(maxDec);
				} catch (ex) {
					str = txt = _str(val);
				}
				// 3-minus char, 4-decimal separator
				return this._toTxtNum(neg, foc, txt.toUpperCase(), _aNull(minus) ? this._prop(3) : minus, _aNull(dec) ? this._prop(4) : dec, str);
			}
			// number in javascript format (used when val.toFixed failed)
			if (str) {
				txt = this._txtAsNum(txt, dec);
			}
			iL = txt.indexOf('E');
			if (iL > 0) {
				ePow = ePow ? this._ePow(!foc && txt.charAt(iL + 1) !== '-') + txt.substring(iL + 1) : txt.substring(iL);
				txt = txt.substring(0, iL);
			} else {
				ePow = '';
			}
			// build string in requested (focus/display) format
			iL = txt.length;
			if (_aNull(neg)) {
				if (iL === 0) {
					return foc ? txt : '';
				}
				neg = this._isMinus(txt.charCodeAt(0));
				if (neg) {
					txt = txt.substring(1);
					iL--;
				}
			}
			// remove dot
			while (++i < iL) {
				ch = txt.charCodeAt(i);
				if (ch < 48 || ch > 57) {
					txt = txt.substring(0, i) + txt.substring(i + 1);
					iL--;
					break;
				}
			}
			// if dot,remove trailing 0s
			while (i < iL) {
				if (txt.charCodeAt(iL - 1) !== 48) {
					break;
				}
				txt = txt.substring(0, --iL);
			}
			iL = i;
			if (maxDec > 0 && iL < txt.length) {
				iDec = txt.length - iL;
				txt = txt.substring(0, iL) + dec + txt.substring(iL);
				iL += dec.length + maxDec;
			}
			if (iL < txt.length) {
				txt = txt.substring(0, iL);
			}
			// check for 0
			if (neg && (!(gr = txt.replace(/0/g, '')) || gr === dec)) {
				neg = false;
			}
			// 9-minimum decimals
			if ((iL = this._prop(9)) > 0) {
				if (iDec === 0) {
					txt += dec;
				}
				while (iL-- > iDec) {
					txt += '0';
				}
			}
			if (foc) {
				txt += ePow;
				return neg ? (minus + txt) : txt;
			}
			// 6-groups
			grps = this._prop(6);
			gr = gr0 = (grps.length > 0) ? grps[0] : 0;
			while (gr > 0 && --i > 0) {
				if (--gr === 0) {
					// 5-group separator
					txt = txt.substring(0, i) + this._prop(5) + txt.substring(i);
					gr = grps[++ig];
					if (_aNull(gr) || gr < 1) {
						gr = gr0;
					} else {
						gr0 = gr;
					}
				}
			}
			// format numeric text according to format pattern
			val = this._prop(neg ? 1 : 0).replace('n', txt + ePow);
			// 0-positive pattern, 1-negative pattern, 2-symbol
			return val.replace('$', this._prop(2));
		},
		_prop: function (flag) {
			var min, val, sign, o = this.options, t = this._type, mode = this._dataMode;
			if (flag === 13) {
				o = o.selectionOnFocus;
				return (o === -1 || o === 'select') ? -1 : ((o === 0 || o === 'start') ? 0 : ((o === 1 || o === 'end') ? 1 : 2));
			}
			if (flag === 12) {
				return (o.maxLength > 0) ? o.maxLength : this._maxLen;
			}
			if (flag === 0) {
				if (!(val = o.positivePattern)) {
					return (t === 6) ? this._optVal('percentPositivePattern') : ((t === 5) ? this._optVal('currencyPositivePattern') : 'n');
				}
				return val;
			}
			if (flag === 1) {
				if (!(val = o.negativePattern)) {
					return this._optVal((t === 6) ? 'percentNegativePattern' : ((t === 5) ? 'currencyNegativePattern' : 'numericNegativePattern'));
				}
				return val;
			}
			if (flag === 2) {
				if (!_aNull(val = o.symbol)) {
					return val;
				}
				return (t === 6) ? this._optVal('percentSymbol') : ((t === 5) ? this._optVal('currencySymbol') : '');
			}
			if (flag === 3) {
				return this._optVal('negativeSign');
			}
			if (flag === 4) {
				if (!(val = o.decimalSeparator)) {
					return this._optVal((t === 6) ? 'percentDecimalSeparator' : ((t === 5) ? 'currencyDecimalSeparator' : 'numericDecimalSeparator'));
				}
				return val;
			}
			if (flag === 5) {
				if (!_aNull(val = o.groupSeparator)) {
					return val;
				}
				return this._optVal((t === 6) ? 'percentGroupSeparator' : ((t === 5) ? 'currencyGroupSeparator' : 'numericGroupSeparator'));
			}
			if (flag === 6) {
				if (!(val = o.groups)) {
					return this._optVal((t === 6) ? 'percentGroups' : ((t === 5) ? 'currencyGroups' : 'numericGroups'));
				}
				return val;
			}
			if (flag === 7) {
				if (!_aNull(val = o.displayFactor)) {
					return val;
				}
				return (t === 6) ? this._optVal('percentDisplayFactor') : 1;
			}
			if (flag === 8) {
				// mode: 0:text, 1:double, 2:float, 3:decimal, 4:long, etc.
				if (mode > 3) {
					return 0;
				}
				if (!_aNull(val = o.maxDecimals)) {
					return val;
				}
				return this._optVal((t === 6) ? 'percentMaxDecimals' : ((t === 5) ? 'currencyMaxDecimals' : 'numericMaxDecimals'));
			}
			if (flag === 9) {
				// mode: 0:text, 1:double, 2:float, 3:decimal, 4:long, etc.
				if (mode > 3) {
					return 0;
				}
				if (!_aNull(val = o.minDecimals)) {
					return val;
				}
				return this._optVal((t === 6) ? 'percentMinDecimals' : ((t === 5) ? 'currencyMinDecimals' : 'numericMinDecimals'));
			}
			min = flag === 10;
			if (min || flag === 11) {
				val = min ? o.minValue : o.maxValue;
				if (t > 3 && typeof val === 'string') {
					val = parseFloat(val);
				}
				// mode: 0:text, 1:double, 2:float, 3:decimal, 4:long, etc.
				if (!_aNull(val, 1) || t < 4 || mode < 2 || mode === 3 || mode > 11) {
					return val;
				}
				// float
				if (mode === 2) {
					return min ? -3.40282347e38 : 3.40282347e38;
				}
				// byte
				val = 127;
				sign = (mode % 2) === 0;
				if (!sign && min) {
					return 0;
				}
				// long
				if (mode < 6) {
					val = 9223372036854775807;
				// int
				} else if (mode < 8) {
					val = 2147483647;
				// short
				} else if (mode < 10) {
					val = 32767;
				}
				return sign ? (min ? -(val + 1) : val) : (val * 2 + 1);
			}
		},
		_isMinus: function (k) {
			// japanese "'-","-","("
			// _prop: 3-minus, 1-negative pattern
			return k === this._prop(3).charCodeAt(0) || k === 45 || (k === 40 && this._prop(1).indexOf('(') >= 0) || k === 12540 || k === 65293 || k === 65288;
		},
		destroy: function () {
			/* Destroys editor and return base element back to its pre-init state.
				returnType="object" Returns reference to this igEditor.
			*/
			var par, i, e, b, elem = this._element, field = this._field, elem0 = this.element, buts = this._buttons;
			e = elem ? elem[0] : null;
			if (!field || !e) {
				return this;
			}
			// stop timer, remove drop-downs, unbind events
			this._stopTimer();
			// 3-flag to destroy
			this._doDP(3);
			// 1-flag to destroy
			this._initValidator(1);
			this._listRemove();
			field.unbind(this._evts);
			elem.unbind(this._mEvts);
			// restore layout
			b = (buts && buts[0]) ? buts[0][0] : null;
			if (b && b.parentNode === e) {
				e.removeChild(b);
			}
			b = (buts && buts[1]) ? buts[1][0].parentNode : null;
			if (b && b.parentNode === e) {
				e.removeChild(b);
			}
			// do not call this._field.remove(), because it triggers recursive call to destroy
			if (field[0].parentNode === e) {
				e.removeChild(field[0]);
			}
			if (this._selElem) {
				elem.remove();
			} else if (this._swap) {
				par = e.parentNode;
				par.insertBefore(elem0[0], e);
				par.removeChild(e);
			}
			// restore attributes
			par = this._oldCss;
			for (i in par) {
				if (par.hasOwnProperty(i)) {
					elem0.css(i, par[i]);
				}
			}
			par = this._oldAttr;
			for (i in par) {
				if (par.hasOwnProperty(i)) {
					elem0[0][i] = par[i];
				}
			}
			elem0[0]._ig_oldCss = null;
			elem0 = elem = field = this._dp = this._buttons = this._field = this._element = null;
			this._evts = this._mEvts = this._oldAttr = this._oldCss = this._validator = null;
			$.Widget.prototype.destroy.apply(this, arguments);
			return this;
		}
	});
	$.extend($.ui.igEditor, { version: '11.1.20111.1014' });
	$.ui.igEditor.locale = { defaults: {} };
	$.ui.igEditor.setDefaultCulture = function (regional, locale) {
		/* Set values for regional options and titles for buttons.
			paramType="string|object" optional="true" Override for regional options.
			If the value of parameter is String, such as "bg", "fr", etc, then editor will attempt to find and use $.ui.regional[param] object.
			Value of object should contain pairs or key:value members.
			If that parameter is string, then editor attempts to call $.datepicker.setDefaults($.datepicker.regional[param]).
			paramType="string|object" optional="true" Override fol locale options.
			If the value of parameter is String, such as "bg", "fr", etc, then editor will attempt to find and use $.ui.igEditor.locale[param] object.
			Value of object should contain pairs or key:value members. If that parameter is missing and first parameter is string, then value of first parameter is used.
		*/
		$.ig.regional = $.ig.regional || {};
		$.ig.regional.defaults = $.extend($.ig._regional, (typeof regional === 'string') ? $.ig.regional[regional] : regional);
		if (!locale && typeof regional === 'string' && $.ui.igEditor.locale[regional]) {
			locale = regional;
		}
		if (locale) {
			$.ui.igEditor.locale.defaults = $.extend({}, (typeof locale === 'string') ? $.ui.igEditor.locale[locale] : locale);
		}
		if (regional === 'en' || regional === 'en-US') {
			regional = '';
		}
		if ($.datepicker && $.datepicker.regional && $.datepicker.regional[regional]) {
			$.datepicker.setDefaults($.datepicker.regional[regional]);
		}
	};
	$.widget('ui.igTextEditor', $.ui.igEditor, {
		_create: function () {
			$.ui.igEditor.prototype._create.apply(this, [0]);
		}
	});
	$.widget('ui.igMaskEditor', $.ui.igEditor, {
		// igMaskEditor extends igEditor and in addition to options of igEditor 
		options: {
			/* type="string" Sets gets input mask. Mask may include filter-flags and literal characters.
				Literal characters are part of mask which cannot be modified by end user. In order to use a filter-flag as a literal character, the escape "\\" character should be used.
				Default is "CCCCCCCCCC"
				Note: optional flags/entries affect the value returned by get of the "value" and "text" methods.
				List of filter-flags:
				C: any keyboard character. Entry is optional.
				&: any keyboard character. Entry is required.
				a: letter or digit character. Entry is optional.
				A: letter or digit character. Entry is required.
				?: letter character. Entry is optional.
				L: letter character. Entry is required.
				9: digit character. Entry is optional.
				0: digit character. Entry is required.
				#: digit character or "+" or "_". Entry is optional with replacement by "emptyPositionChar" or by "padChar".
				>: all letters to the right are converted to the upper case. In order to disable conversion, the ">" flag should be used again.
				<: all letters to the right are converted to the lower case. In order to disable conversion, the "<" flag should be used again.
			*/
			inputMask: 'CCCCCCCCCC',
			/* type="string" Sets gets character which is used as prompt in edit mode for available entry position. Default is "_". */
			promptChar: '_',
			/* type="string" Sets gets character which is used as replacement of not-filled required position in mask when editor is in display mode (not focused). Default is " ". */
			padChar: ' ',
			/* type="string" Sets gets character which is used as replacement of not-filled required position in mask when application calls get for the "value" or for the "text" methods. Default is " ". */
			emptyChar: ' ',
			/* type="string|number" Sets gets option which defines value returned by the get of value() method, functionality of the set value(val) method and it also affects the copy and paste operations of browser.
				Default is "alltext".
				Possible values:
				"rawText" or 0: only entered text. All unfilled prompts (positions) and literals are ignored (removed). Note: that is used as default.
				"rawTextWithRequiredPrompts" or 1: only entered text and required prompts (positions). All optional unfilled prompts and literals are ignored (removed).
				"rawTextWithAllPrompts" or 2: only entered text and prompts (positions). All literals are ignored (removed).
				"rawTextWithLiterals" or 3: only entered text and literals. All unfilled prompts are ignored (removed).
				"rawTextWithRequiredPromptsAndLiterals" or 4: only entered text, required prompts (positions) and literals. All optional unfilled prompts are ignored (removed).
				"allText" or 1: entered text, all prompts (positions) and literals.
			*/
			dataMode: 'alltext',
			/* type="bool" Set gets ability to hide mask in focus state.
				Value of false allows to show all input mask with prompt characters regardless if available mask positions are filled or not.
				Value of true will show only part of mask located on the left side from caret when available mask positions on the right side from caret are empty.
				Default is false. */
			hideMaskOnFocus: false
		},	
		_create: function () {
			$.ui.igEditor.prototype._create.apply(this, [1]);
		}
	});
	$.widget('ui.igDateEditor', $.ui.igEditor, {
		//igDateEditor extends igEditor and in addition to options of igEditor
		options: {
			/* type="bool" Sets gets ability to spin 1 field only.
				Value false enables changes of other date fields when incremented or decremented date-field reaches its limits.
				Value true modifies only value of one field.
				Default is false. */
			spin1Field: false,
			/* type="date" Sets gets the minimum value which can be entered in editor by user. Default is null. */
			minValue: null,
			/* type="date" Sets gets the maximum value which can be entered in editor by user. Default is null. */
			maxValue: null,
			/* type="string"
				Sets gets format of date while editor has no focus.
				Value of that option can be set to explicit date pattern or to a flag defined by regional settings.
				If value is not set, then the dateInputFormat is used automatically.
				If value is set to explicit date pattern and pattern besides date-flags has explicit characters which match with date-flags or mask-flags, then the "escape" character should be used in front of them. 
				Default is null and $.ig.regional.defaults is used.
				List of predefined regional flags:
				"date": the datePattern member of regional option is used
				"dateLong": the dateLongPattern member of regional option is used
				"time": the timePattern member of regional option is used
				"timeLong": the timeLongPattern member of regional option is used
				"dateTime": the dateTimePattern member of regional option is used
				List of explicit characters, which should have escape \\ character in front of them:
					C, &, a, A, ?, L, 9, 0, #, >, <, y, M, d, h, H, m, s, t, f.
				List of date-flags when explicit date pattern is used:
				"y": year field without century and without leading zero
				"yy": year field without century and with leading zero
				"yyyy": year field with leading zeros
				"M": month field as digit without leading zero
				"MM": month field as digit with leading zero
				"MMM": month field as short month name
				"MMMM": month field as long month name
				"d": day of month field without leading zero 
				"dd": day of month field with leading zero
				"ddd": day of the week as short name
				"dddd": day of the week as long name
				"t": first character of string which represents AM/PM field 
				"tt": 2 characters of string which represents AM/PM field
				"h": hours field in 12-hours format without leading zero
				"hh": hours field in 12-hours format with leading zero
				"H": hours field in 24-hours format without leading zero
				"HH": hours field in 24-hours format with leading zero
				"m": minutes field without leading zero
				"mm": minutes field with leading zero
				"s": seconds field without leading zero
				"ss": seconds field with leading zero
				"f": milliseconds field in thousands
				"ff": milliseconds field in hundreds
				"fff": milliseconds field
			*/
			dateDisplayFormat: null,
			/* type="string"
				Sets gets format of date while editor has focus.
				Value of that option can be set to explicit date pattern or to a flag defined by regional settings.
				If value is set to explicit date pattern and pattern besides date-flags has explicit characters which match with date-flags or mask-flags, then the "escape" character should be used in front of them.
				If option is not set, then the "date" is used automatically.
				Default is null.
				List of predefined regional flags:
				"date": the datePattern member of regional option is used
				"dateLong": the dateLongPattern member of regional option is used
				"time": the timePattern member of regional option is used
				"timeLong": the timeLongPattern member of regional option is used
				"dateTime": the dateTimePattern member of regional option is used
				List of explicit characters, which should have escape \\ character in front of them: C, &, a, A, ?, L, 9, 0, #, >, <, y, M, d, h, H, m, s, t, f.
				List of date-flags when explicit date pattern is used:
				"y": year field without century and without leading zero
				"yy": year field without century and with leading zero
				"yyyy": year field with leading zeros
				"M": month field as digit without leading zero
				"MM": month field as digit with leading zero
				"MMM": month field as short month name
				"MMMM": month field as long month name
				"d": day of month field without leading zero 
				"dd": day of month field with leading zero
				"ddd": day of the week as short name
				"dddd": day of the week as long name
				"t": first character of string which represents AM/PM field 
				"tt": 2 characters of string which represents AM/PM field
				"h": hours field in 12-hours format without leading zero
				"hh": hours field in 12-hours format with leading zero
				"H": hours field in 24-hours format without leading zero
				"HH": hours field in 24-hours format with leading zero
				"m": minutes field without leading zero
				"mm": minutes field with leading zero
				"s": seconds field without leading zero
				"ss": seconds field with leading zero
				"f": milliseconds field in thousands
				"ff": milliseconds field in hundreds
				"fff": milliseconds field
			*/
			dateInputFormat: null,
			/* type="string" Sets gets character which is used as prompt in edit mode for available entry position. Default is "_" */
			promptChar: '_',
			/* type="string|number"
				Sets gets type of value returned by the get of value() method, functionality of the set value(val) method and it also affects the copy and paste operations of browser.
				Default is "date".
				Possible values:
				"date" or 0: the Date object is used. Note: that is used as default.
				"editModeText" or 1: the String object is used and the "text" in edit mode (focus) format (pattern).
				"text" or 2: the String object is used and the "text" in display mode (no focus) format (pattern).
			*/
			dataMode: 'date',
			/* type="number" Sets gets the minimum number of date fields, which makes entered date-string valid.
				All missing fields are automatically filled up from the previous valid date or by zeros or the values from the today date.
				Default is 3.
				For example, if "dateInputPattern" is set to "yyyy/MM/dd hh:mm" and user entered only first 3 fields (year, month, day), then values for hours and minutes are filled by zeros. */
			minNumberOfDateFields: 3,
			/* type="bool" Set gets ability to use last valid date when user entered invalid value.
				Value of true allows automatically use last valid date, when editor loses focus and user failed to enter a valid date.
				In case of value false, the entered date is considered invalid and null is used.
				Default is false. */
			useLastGoodDate: false,
			/* type="bool" Sets gets abitlity to reduce day of month.
				Value of true allows reduce day of month, when editor loses focus and user entered day of month which is larger maximum for that particular month.
				Value of false will automatically increment month and reduce day of month.
				Default is true.
				Examples.
				If that option is true and user entered "09/31/2010", then on lost focus that string will be converted to "09/30/2010".
				If that option is false, then in similar situation the string will be converted to "10/01/2010". */
			reduceDayOfInvalidDate: true,
			/* type="bool" Sets gets ability to hide mask in focus state.
				Value of true allows show or hide all input mask with prompt characters regardless if available mask positions are filled or not.
				Value of true will show only part of mask located on the left side from caret when available mask positions on the right side from caret are empty. Default is false. */
			hideMaskOnFocus: false,
			/* type="number" Sets gets year for auto detection of 20th and 21st centuries.
				That value is used to fill century of entered year when user entered only 1 or 2 digits into the year field or when date pattern includes on 1 or 2 positions for year: "yy" or "y".
				If user entered value larger than value of this option, then 20th century is used, otherwise the 21st. Default is 29. */
			centuryThreshold: 29,
			/* type="number" Sets gets difference between year in Gregorian calendar and displayed year. Default is 0. */
			yearShift: 0
		},
		_create: function () {
			$.ui.igEditor.prototype._create.apply(this, [2]);
		}
	});
	$.widget('ui.igDatePicker', $.ui.igDateEditor, {
		// igDatePickerEditor extends igDateEditor. In order to use that editor application should ensure that jquery.ui.datepicker.js is loaded on client.
		options: {
			/* type="string" Sets gets visibility of spin and drop-down button.
			Default is "dropdown".
			That option can be set only on initialization.
			Possible values:
			"dropdown": button to open list is located on the right side of input-field (or left side if base html element has direction:rtl);
			"clear": button to clear value is located on the right side of input-field (or left side if base html element has direction:rtl);
			"spin": spin buttons are located on the right side of input-field (or left side if base html element has direction:rtl); */
			button: 'dropdown',
			/* type="object" Sets gets options supported by the jquery.ui.datepicker. Default is null. */
			datepickerOptions: null
		},
		_create: function () {
			$.ui.igEditor.prototype._create.apply(this, [3]);
		}
	});
	$.widget('ui.igNumericEditor', $.ui.igEditor, {
		//igNumericEditor extends igEditor and in addition to options of igEditor it exposes some extra options.
		options: {
			/* type="string" Sets gets the pattern for positive numeric values, which is used in display (no focus) state.
				The "$" flag represents "numericSymbol" and the "n" flag represents the value of number.
				Default is null and $.ig.regional.defaults is used.
				Note: this option has priority over possible regional settings. */
			positivePattern: null,
			/* type="string" Sets gets the pattern for negative numeric values, which is used in display (no focus) state.
				The "$" flag represents "numericSymbol".
				Default is null and $.ig.regional.defaults is used.
				The "n" flag represents the value of number. The "-" and "()" flags are static part of pattern.
				Note: this option has priority over possible regional settings. */
			negativePattern: null,
			/* type="string" Sets gets symbol, which is used in display (no focus) state.
				Default is null and $.ig.regional.defaults is used.
				Note: this option has priority over possible regional settings. */
			symbol: null,
			/* type="string" Sets gets the character, which is used for negative numeric values.
				Default is null and $.ig.regional.defaults is used.
				Note: this option has priority over possible regional settings. */
			negativeSign: null,
			/* type="string" Sets gets the character, which is used as decimal separator.
				Default is null and $.ig.regional.defaults is used.
				Note: this option has priority over possible regional settings. */
			decimalSeparator: null,
			/* type="string" Sets gets the character, which is used as separator for groups (like thousands).
				That option has effect only in display (no focus) state.
				Default is null and $.ig.regional.defaults is used.
				Note: this option has priority over possible regional settings. */
			groupSeparator: null,
			/* type="object" (array of number objects) Sets gets the number of digits in integer part of number, which are divided into groups.
				The "numericGroupSeparator" is inserted between groups.
				If the sum of all values in array is smaller than the length of integer part, then the last item in array is used for all following groups.
				Count of groups starts from the decimal point (from right to left).
				That option has effect only in display (no focus) state.
				Default is null and $.ig.regional.defaults is used.
				Note: this option has priority over possible regional settings. */
			groups: null,
			/* type="number" Sets gets the factor which used for the get and set of the "value" method.
				On the get number (string) entered by user is divided by that factor and on the set the number (string) displayed in editor is multiplied by that factor.
				For example, if factor is 100 and the "value" is set to 0.123, then editor will show string "12.3".
				Possible values: 1, 10, 100, 1000, 10000, 100000, etc.
				Default is null and $.ig.regional.defaults is used.
				Note: this option has priority over possible regional settings. */
			displayFactor: null,
			/* type="number" Sets gets the maximum number of decimal places which are used in display (no focus) state.
				Default is null and $.ig.regional.defaults is used.
				Note: this option has priority over possible regional settings. */
			maxDecimals: null,
			/* type="number" Sets gets the minimum number of decimal places which are used in display (no focus) state.
				If number of digits in fractional part of number is less than the value of this option, then the "0" characters are used to fill missing digits.
				Default is null and $.ig.regional.defaults is used.
				Note: this option has priority over possible regional settings. */
			minDecimals: null,
			/* type="number" Sets gets the minimum value which can be entered in editor by end user. Default is null. */
			minValue: null,
			/* type="number" Sets gets the maximum value which can be entered in editor by end user. Default is null. */
			maxValue: null,
			/* type="string"
				Sets gets support for E-power format in edit mode.
				If that option is set, then numeric value appears as a string with possible E-power flag. In edit mode the "E" or "e" character can be entered as well.
				List of possible values for that option:
				null or null: scientific format is disabled.
				"E": scientific format is enabled and the "E" character is used.
				"e": scientific format is enabled and the "e" character is used.
				"E+": scientific format is enabled and the "E" character is used. The "E+" is used for positive values in display mode.
				"e+": scientific format is enabled and the "e" character is used. The "e+" is used for positive values in display mode.
				Notes: The "+" character is not supported in edit mode. The minimum and maximum number of decimal places are applied to the string which appears in front of E-part of string.
				Default is null. */
			scientificFormat: null,
			/* type="number" Sets gets the representation of null value. Default is null. */
			nullValue: null,
			/* type="string|number"
				Sets gets type of value returned by the get of value() method. That also affect functionality of the set value(val) method and it also affects the copy and paste operations of browser.
				Default is "double".
				Possible values:
				"text" or -1: the String object is used with "text" in display mode format.
				"editModeText" or 0: the String object is used with "text" in edit mode format.
				"double" or 1: the Number object is used with limits of double and if value is not set, then the null or Number.NaN is used depending on the option "nullable". Note: that is used as default.
				"float" or 2: the Number object is used with limits of double and if value is not set, then the null or Number.NaN is used depending on the option "nullable".
				"decimal" or 3: the Number object is used with limits of double and if value is not set, then 0 is used.
				"long" or 4: the Number object is used with limits of signed long and if value is not set, then 0 is used. 
				"ulong" or 5: the Number object is used with limits of unsigned long and if value is not set, then 0 is used.
				"int" or 6: the Number object is used with limits of signed int and if value is not set, then 0 is used.
				"uint" or 7: the Number object is used with limits of unsigned int and if value is not set, then 0 is used.
				"short" or 8: the Number object is used with limits of signed short and if value is not set, then 0 is used.
				"ushort" or 9: the Number object is used with limits of unsigned short and if value is not set, then 0 is used.
				"sbyte" or 10: the Number object is used with limits of signed byte and if value is not set, then 0 is used.
				"byte" or 11: the Number object is used with limits of unsigned byte and if value is not set, then 0 is used.
			*/	
			dataMode: 'double'
		},
		_create: function () {
			$.ui.igEditor.prototype._create.apply(this, [4]);
		}
	});
	$.widget('ui.igCurrencyEditor', $.ui.igNumericEditor, {
		//igCurrencyEditor extends igNumericEditor and in addition to options of igNumericEditor it exposes extra options.
		_create: function () {
			$.ui.igEditor.prototype._create.apply(this, [5]);
		}
	});
	$.widget('ui.igPercentEditor', $.ui.igNumericEditor, {
		// igPercentEditor extends igNumericEditor and in addition to options of igNumericEditor it exposes extra options.
		_create: function () {
			$.ui.igEditor.prototype._create.apply(this, [6]);
		}
	});
}(jQuery));

/* English, US */
(function ($) {
	$.ui.igEditor.locale['en-US'] = {
		spinUpperTitle: 'Increment',
		spinLowerTitle: 'Decrement',
		buttonTitle: 'Show list',
		clearTitle: 'Clear value',
		datePickerButtonTitle: 'Show calendar'
	};
	$.ui.igEditor.locale.defaults = $.extend({}, $.ui.igEditor.locale['en-US']);
}(jQuery));

/*
 * Infragistics.Web.ClientUI Grid 11.1.20111.1014
 *
 * Copyright (c) 2011 Infragistics Inc.
 * <Licensing info>
 *
 * http://www.infragistics.com/
 *
 * Depends on: 
 *  jquery-1.4.4.js
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	ig.dataSource.js
 *  ig.ui.shared.js
 *	ig.util.js
 */

/*global jQuery window */
if (typeof (jQuery) === "undefined") {
    throw new Error("The Infragistics Grid requires jQuery to be loaded");
}

(function ($) {
	var _hovTR;
	/*
		igGrid is a widget based on jQuery UI that provides Excel like functionality by rendering data in tabular form
		and includes support for paging, sorting, filtering and selection (both local and remote)
		the widget can be bound to various types of data sources such as JSON, XML, Remote WCF/REST services, etc.
	*/
	$.widget("ui.igGrid", {
		css: {
			/* classes applied to the top container element */
			"baseClass" : "ui-widget ui-helper-clearfix ui-corner-all",
			/* Widget content class applied to various content containers in the grid */
			"baseContentClass" : "ui-widget-content",
			/* class applied to the top container element */
			"gridClasses" : "ui-iggrid",
			/* classes applied to the TBODY, and inherited through css for the records */
			"recordClass" : "ui-ig-record ui-iggrid-record",
			/* classes applied on alternate records */
			"recordAltClass" : "ui-ig-altrecord ui-iggrid-altrecord",
			/* classes applied to the grid header elements */
			"headerClass" : "ui-iggrid-header ui-widget-header", 
			/* classes applied to the header text container */
			"headerTextClass" : "ui-iggrid-headertext",
			/* jQuery UI class applied to the grid header elements */
			"baseHeaderClass" : "ui-widget-header",
			/* classes applied to the TABLE which holds the grid records */
			"gridTableClass" : "ui-iggrid-table ui-widget-content",
			/* when fixed headers is enabled, this class is applied to the table that holds the header TH elements */
			"gridHeaderTableClass" : "ui-iggrid-headertable",
			/* when no headers are shown or fixed headers is false, the caption (if any) needs to be rendered in a separate table */
			"gridCaptionTableClass": "ui-iggrid-captiontable",
			/* classes applied to the element that's on top of the header that has some description */
			"gridHeaderCaptionClass" : "ui-iggrid-headercaption ui-widget-header ui-corner-top",
			/* class applied to the TABLE's TBODY holding data records */
			"gridTableBodyClass" : "ui-iggrid-tablebody",
			/* classes applied to the scrolling div container when width and height are defined and scrollbars is 'true' */
			"gridScrollDivClass" : "ui-iggrid-scrolldiv ui-widget-content",
			/* classes applied to the grid footer caption contents */
			"gridFooterCaptionClass" : "ui-iggrid-footercaption",
			/* classes applied to the grid footer (for example the area there the pager is rendered) */
			"footerClass" : "ui-widget-header ui-iggrid-footer" 
	    },
	    options: {
			/* type="object" null will stretch to fit data, if no other widths are defined (default). Can be set to both numbers and strings (px and percentage) */
			width : null,
			/* type="object" null will stretch vertically to fit data, no other height are defined (default). Can be set to both numbers and strings (px and percentage). this is the total height of the grid, including all UI elements - scroll container with data rows, header, footer, filter row -  (if any), etc.  */
			height : null,
			/* type="bool" if autoAdjustHeight is set to false, the options.height will be set only on the scrolling container, and all other UI elements such as paging footer / filter row/ headers will add on top of that, so the total height of the grid will be more than this value - the height of the scroll container (content area) will not be dynamically calculated. setting this option to false will usually result in a lot better initial rendering performance for large data sets ( > 1000 rows rendered at once, no virtualization enabled), since no reflows will be made by browsers when accessing DOM properties such as offsetHeight */
			autoAdjustHeight: true,
			/* type="object" (both strings and numbers are accepted) used for virtualization, this is the average value in pixels (default) that will be used to calculate how many rows and which ones to render as the end user scrolls. Also all rows' height will be automatically equal to this value */
			avgRowHeight : 25,
			/* type="object" (both strings and numbers are accepted) used for virtualization, this is the average value in pixels for a column width */
			avgColumnWidth: null,
			/* type="object" - both strings and numbers are accepted - default column width that will be set for all columns ( default is null) */
			defaultColumnWidth : null,
			/* type="bool" if no columns collection is defined, and autoGenerateColumns is set to true (default), columns will be inferred from the data source */
			autoGenerateColumns : true,
			/* type="bool" enables/ disables virtualization, which can greatly enhance rendering performance. If enabled, the number of actual rended rows (DOM elements) will be constant and related to the visible viewport of the grid. as the end user scrolls, those DOM elements will be dynamically reused to render the new data */	
			virtualization : false,
			requiresDataBinding: true,
			/* type="bool" option to enable virtualization for rows only (vertical) */
			rowVirtualization : false,
			/* type="bool" option to enable virtualization for columns only (horizontal) */
			columnVirtualization : false,
			/* type="number" number of pixels to move the grid when virtualization is enabled, and mouse wheel scrolling is performed over the virtual grid area. Default value (null) will assume this is set to avgRowHeight */
			virtualizationMouseWheelStep: null,
			//visibleVirtualRecords: null, // if this is specified, then the height of the grid will be calculated automatically based on the average row height and the visible virtual records. if no average row height is specified, one will be calculated automatically at runtime 
			/* type="bool" if this option is true, then no matter what avg row height is set, one will be automatically calculated at runtime */
			adjustVirtualHeights: false,
			/* type="string" jQuery templating style template that will be used to render data records */
			rowTemplate: null,
			/* type="bool" custom high-performance rendering will be used for rendering by default. jQuery Templating plugin can be used and enabled by setting this option to true. This will allow usage of column / row templates in jQuery Templating style. If virtualization is enabled, it is advised to keep this option to "false", in order to have better scrolling/rendering performance  */
			jQueryTemplating: false,
			/* type="object" an array of column objects */
			columns : [
				{
					/* type="string" Column header text */
					headerText: null,
					/* type="string" column key (property in the data source to which the column is bound) */
					key: null,
					/* type="object" reference to a function (string or function) which will be used for formatting the cell values. the function should accept a value and return the new formatted value */
					formatter: null,
					/* type="string" Sets gets format for cells in column. Default value is null.
						If dataType is "date", then supported formats are following: "date", "dateLong", "dateTime", "time", "timeLong", "MM/dd/yyyy", "MMM-d, yy, h:mm:ss tt", "dddd d MMM", etc.
						If dataType is "number", then supported numeric formats are following: "number", "currency", "percent", "int", "double", "0.00", "#.0####", "0", "#.#######", etc.
						The value of "double" will be similar to "number", but with unlimited maximum number of decimal places.
						The format patterns and rules for numbers and dates are defined in $.ig.regional.defaults object.
						If dataType is "string" or not set, then format is rendered as it is with replacement of possible "{0}" flag by value in cell. Example, if format is set to "Name: {0}" and value in cell is "Bob", then value will appear as "Name: Bob"
					*/
					format: null,
					/* type="string|number|bool|date" data type of the column cell values */ 
					dataType: "string"
				}
			],
			/* type="object" can be any valid data source accepted by $.ig.DataSource, or an instance of an $.ig.DataSource itself */
			dataSource : null,
			dataSourceUrl: null,
			/* type="string" explicitly set data source type (such as "json"). Please refer to the documentation of $.ig.DataSource and its type property */
			dataSourceType: null,
			/* type="string" see $.ig.DataSource. This is basically the property in the responses where data records are held, if the response is wrapped */
			responseDataKey: null,
			/* type="string" see $.ig.DataSource. property in the response specifying the total number of records on the server */
			responseTotalRecCountKey: null,
			/* type="bool" option controlling the visibility of the grid header */
			showHeader : true,
			/* type="bool" headers will be fixed if this option is set to true, and only the grid data will be scrollable. If virtualization is enabled, fixedHeaders will always act as if it's true, no matter which value is set */
			fixedHeaders: true,
			/* type="string" caption text that will be shown above the grid header */
			caption: null,
			/* type="object" a list of grid features definitions: sorting, paging, etc. Each feature goes with its separate options that are documented for the feature accordingly */ 
			features : [
				{
					/* feature options object */
				}
			],
			/* type="number" initial tabIndex attribute that will be set on the container element */
			tabIndex: 0,
			/* type="bool" if this option is set to true, ARIA and role attributes will be rendered for data records, cells and grid containers */
			accessibilityRendering: false,
			/* type="bool" if this option is set to false, the data to which the grid is bound will be used "as is" with no additional transformations based on columns defined */
			localSchemaTransform: true,
			/* type="string" primary key name of the column containing unique identifiers */
			primaryKey: null,
			/* type="bool" if true, the transaction log will always be sent in the request for remote data, by the data source. Also this means that if there are values in the log, a POST will be done instead of GET */
			serializeTransactionLog: true,
			/* type="bool" automatically commits the transactions as rows/cells are being edited */
			autoCommit: false,
			/* type="string|bool" Sets gets ability to automatically format text in cells for numeric and date columns. Default value is "date".
				Possible values: "date" - formats only Date columns; "number" - formats only number columns; "dateandnumber" or true - formats Date and number columns; false - auto formatting is disabled.
				The format patterns and rules for numbers and dates are defined in $.ig.regional.defaults object. If a column defined in "columns" has its own "format" or "formatter", then it has priority over this option.
			*/
			autoFormat: 'date',
			/* type="string" if autoCommit is true, updates will be done immediately to the data source, without keeping interim transaction logs */
			updateUrl: null,
			/* type="bool" enables/disables rendering of alternating row styles (odd and even rows receive different styling). Note that if a custom jQuery template is set, this has no effect and CSS for the row should be adjusted manually in the template contents.  */
			alternateRowStyles: true
	    },
		events: {
			/* event fired when a cell is clicked  */
			cellClick: "cellClick",
			/* cancel="true" event fired before data binding takes place */
			dataBinding: "dataBinding",
			/* event fired after data binding is complete */
			dataBound: "dataBound",
			/* event fired before the grid starts rendering (all contents)  */
			rendering: "rendering",
			/* event fired after the whole grid widget  has been rendered (including headers, footers, etc.) */
			rendered: "rendered", 
			/* cancel="true" event fired before the TBODY holding the data records starts its rendering */
			dataRendering: "dataRendering",
			/* event fired after all of the data records in the grid table body have been rendered */
			dataRendered: "dataRendered",
			/* cancel="true" event fired before the header starts its rendering */
			headerRendering: "headerRendering",
			/* event fired after the header has been rendered */
			headerRendered: "headerRendered",
			rowAdding: "rowAdding",
			rowAdded: "rowAdded",
			/* event fired after every TH in the grid header has been rendered */
			headerCellRendered: "headerCellRendered" 
		},
		resizeTimeout: 300,
		/* type="boolean" setting this global widget property manually to true will always remove the data table's body at once, with the risk of memory leaks in IE and FF. The advantage is much faster operations 
			that need to cleanup existing data rows, such as sorting or filtering */
		speedupDOMCleanup: false,
	    widget: function () {
			// returns the element holding the data records 
		    return this.element; 
	    },
		_createWidget: function (options, element) {
			/* !Strip dummy objects from options, because they are defined for documentation purposes only! */
			this.options.columns = [];
			this.options.features = [];
			$.Widget.prototype._createWidget.apply(this, arguments);
		},
	    _init: function () {

	    },
	    _setOption: function (key, value) {
			var header, isScrolling, id = this.element[0].id + '_scroll';
		    // handle new settings and update options hash
			//isScrolling = this.options.scrollbars && (this.options.height !== null || this.options.width !== null);
			//A.T. 7 Feb. 2011 - usability review changes 
			isScrolling = (this.options.height !== null || this.options.width !== null);
			$.Widget.prototype._setOption.apply(this, arguments);
			// options that are supported:
			// width, height, defaultColumnWidth, dataSource, showHeader, showFooter, header caption
			// start by throwing an error for all option changes that aren't supported after the widget has been created
			if (key === 'virtualization' || key === 'autoGenerateColumns' || key === 'accessibilityRendering' ||
					key === 'rowVirtualization' || key === 'columnVirtualization' || key === 'fixedHeaders' || key === 'scrollbars') {
				throw new Error($.ig.Grid.locale.optionChangeNotSupported + ' ' + key);
			}
			if (key === 'width') {
				if (isScrolling === true) {
					this.container().css('width', value);
					this.element.css('width', value);
				} else {
					throw new Error($.ig.Grid.locale.optionChangeNotScrollingGrid + ' ' + key);
				}
			} else if (key === 'height') {
				// depends if the grid is scrolling or not
				if (isScrolling === true) { 
					$('#' + id).css('overflow-y', 'auto');
					if (this.options.autoAdjustHeight) {
						this.container().css('height', value);
						this._initializeHeights();
					} else {
						this.scrollContainer().css('height', value);
					}
					
					/*
					children = this.container().children();
					height = 0;
					for (i = 0; i < children.length; i++) {
						if (!$(children[i]).attr('id').endsWith('_scroll') && $(children[i]).is(':visible')) {
							height += $(children[i]).outerHeight();
						}
					}
					*/
					//$('#' + this.element[0].id + '_scroll').height(this.container().height() - height);
				} else {
					throw new Error($.ig.Grid.locale.optionChangeNotScrollingGrid + ' ' + key);
				}
			} else if (key === 'dataSource') {
				this.options.dataSource = value;
				this.dataBind();
			} else if (key === 'showHeader') {
				header = $('#' + this.id() + '_headers');
				if (header.length > 0 && header.is('table')) {
					if (value === true) {
						header.show();
					} else {
						header.hide();
					}
				} else {
					header = this.element.find('thead tr');
					if (value === true) {
						header.show();
					} else {
						header.hide();
					}
				}
			} else if (key === 'caption') {
				$('#' + this.id() + 'caption').text(value);
			}
	    },
		_initialized: false,
		_headersInitialized: false,
		_footerInitialized: false,
	    _create: function () {
            var grid = this;
			
			this._firstBind = true;
			// virtualization always uses fixed headers 
			if ((this.options.virtualization === true || this.options.columnVirtualization === true || this.options.rowVirtualization === true) &&
					parseInt(this.options.width, 10) > 0 && this.options.fixedHeaders === true) {
				this.options.fixedHeaders = false;
			}
			/*
			if (this.options.jQueryTemplating === null && (this.options.virtualization === false && this.options.rowVirtualization === false)) {
				this.options.jQueryTemplating = true;
			} else if (this.options.jQueryTemplating === null && (this.options.virtualization === true || this.options.rowVirtualization === true)) {
				this.options.jQueryTemplating = false;
			}
			*/
			
			if ((this.options.height === null || parseInt(this.options.height, 10) <= 0) && this.options.fixedHeaders === true) {
				this.options.fixedHeaders = false;
			}
			/*
			if (this.options.alternateRowStyles === null && (this.options.virtualization === true || this.options.rowVirtualization === true)) {
				this.options.alternateRowStyles = false;
			} else if (this.options.alternateRowStyles === null) {
				this.options.alternateRowStyles = true;
			}
			*/
			// trigger an internal data bind call
			this.dataBind(true);
		    this.element.bind({
			    click: function (event) {
				    // click for the main grid element; 'event' is the browser event 
				    if (event.target.nodeName === 'TD') { // we need to conclude if the element that was clicked is a grid cell or not. As a start this check will be enough. 
						grid._trigger(grid.events.cellClick, event, {'rowIndex' : $(event.target).data('row'), 'colIndex' : $(event.target).data('col'), 'cellElement' : event.target, owner: grid});
				    }
			    },
			    mousedown: function (event) {
				    // mouse down for the main grid element ; 'event' is the browser event 
				    if (event.target.nodeName === 'TD') {
						grid._trigger(grid.events.cellClick, event, {'rowIndex' : $(event.target).data('row'), 'colIndex' : $(event.target).data('col'), 'cellElement' : event.target, owner: grid});
				    }
			    }
		    });
			
			// auto adjusting heights when resizing and the grid height is defined with a percentage. In that case we need to either use a timeout
			// or resize (which only works in IE)
			if (this.options.height !== null && this.options.height.indexOf && this.options.height.indexOf('%') !== -1) {
				this._resId = setInterval($.proxy(this._resizeContainer, this), this.resizeTimeout);
			}
			
			// listen to soft dispose. If a feature is of local type, but the invoking one is of remote type, the local one must be marked as fully dirty
			// example: sorting a column when sorting is local and then changing the page index when paging is remote
			this._uiSoftDirtyHandler = $.proxy(this._onFeaturesSoftDirty, this);
			this.element.bind('iggriduisoftdirty', this._uiSoftDirtyHandler);
	    },
		_resizeContainer: function () {
			if (this.options.autoAdjustHeight && this.container().height() !== this._prevContainerHeight) {
				this._initializeHeights();
			}
		},
		id: function () {
			/* returns the ID of the TABLE element where data records are rendered 
				returnType="string" 
			*/
			return this.element[0].id;
		},
		container: function () {
			/* returns the DIV that is the topmost container of the grid widget
				returnType="dom"
			*/
			if (this._isWrapped === true) {
				return this.element;
			} else {
				return $('#' + this.element[0].id + '_container');
			}
		},
		headersTable: function () {
			/* returns the table that contains the header cells 
				returnType="dom"
			*/
			if (this.options.fixedHeaders === true && this.options.height !== null) {
				return $('#' + this.element[0].id + '_headers');
			} else {
				return this.element;
			}
		},
		scrollContainer: function () {
			/* returns the DIV that is used as a scroll container for the grid contents
				returnType="dom"
			*/
			return $('#' + this.element[0].id + '_scroll');
		},
		// Accepts parameters:
		// x - column index
		// y - row index
		cellAt: function (x, y) {
			/* returns the cell TD element at the specified location
				paramType="number" the column index
				paramType="number" the row index
				returnType="dom" the cell at (x, y) 
			*/
			var i;
			// returns a cell at the specified location in the table. jQuery selectors are not used for performance reasons. 
			if (x === undefined || y === undefined) {
				return null;
			}
			//return this.element.find('tbody tr:nth-child(' + (y + 1) + ') td:nth-child(' + (x + 1) + ')');
			if (this.table === undefined) {
				this.table = this.element[0];
			}
			//A.T. 21 Jan 2011 - We must account for all THEAD and TFOOT rows ! . Calculate that only once, for perf. reasons
			i = this._dataRowIndex(y);
			return this.table.rows[i].cells[x];
		},
		_calculateHeaderFooterRows: function () {
			return this.element.find('thead tr').length + this.element.find('tfoot tr').length;
		},
		_dataRowIndex: function (i) {
			if (this._additionalTrCount === undefined || this._additionalTrCount === null) {
				this._additionalTrCount = this._calculateHeaderFooterRows();
			}
			if (i + this._additionalTrCount > this.table.rows.length) {
				i = this.table.rows.length - 1;
			} else {
				i = i + this._additionalTrCount;
			}
			return i;
		},
		// Accepts parameters:
		// i - row index 
		rowAt: function (i) {
			/* returns the row (TR element) at the specified index. jQuery selectors aren't used for performance reasons 
				paramType="number" the row index
				returnType="dom" the row at the specified index
			*/
			if (this.table === undefined) {
				this.table = this.element[0];
			}
			//A.T. 21 Jan 2011 - We must account for all THEAD and TFOOT rows ! . Calculate that only once, for perf. reasons
			i = this._dataRowIndex(i);
			return this.table.rows[i];
		},
		rows: function () {
			/* returns a list of all TR elements holding data in the grid
				returnType="array"
			*/
			return this.element.find('tbody tr');
		},
		columnByKey: function (key) {
			/* returns a column object by the specified column key 
				paramType="string" the column key
				returnType="object" a column definition
			*/
			var cols = this.options.columns, i;
			for (i = 0; i < cols.length; i++) {
				if (cols[i].key === key) {
					return cols[i];
				}
			}
			return null;
		},
		columnByText: function (text) {
			/* returns a column object by the specified header text. if there are multiple matches, returns the first one
				paramType="string" the column header text
				returnType="object" a column definition
			*/
			var cols = this.options.columns, i;
			for (i = 0; i < cols.length; i++) {
				if (cols[i].headerText === text) {
					return cols[i];
				}
			}
			return null;
		},
		activeCell: function () {
			/* returns the current active cell if any, Selection must be enabled. 
				returnType="object"
			*/
			return this._activeCell;
		},
		activeRow: function () {
			/* returns the current active row if any, Selection must be enabled. 
				returnType="object"
			*/
			return this._activeRow;
		},
		selectedCell: function () {
			/* returns the current selected cell if any, Selection must be enabled. 
				returnType="object"
			*/
			return this._selectedCell;
		},
		selectedRow: function () {
			/* returns the current selected row if any, Selection must be enabled. 
				returnType="object"
			*/
			return this._selectedRow;
		},
		selectedCells: function () {
			/* returns the current array of selected cells if any, Selection must be enabled and multipleSelection must be true. 
				returnType="array"
			*/
			return this._selectedCells;
		},
		selectedRows: function () {
			/* returns the current array of selected rows if any, Selection must be enabled and multipleSelection must be true. 
				returnType="array"
			*/
			return this._selectedRows;
		},
		getCellValue: function (rowId, colKey) {
			/* retrieves a cell value using the row index and the column key. if a primaryKey is defined, rowId is assumed to be the row Key (not index). 
				If primary key is not defined, then rowId is converted to a number and is used as a row index 
				if colKey is a number, the index of the column is used (instead of a column name)
				paramType="object" row index or row key (primary key)
				paramType="string" the column key
				returnType="object" the corresponding cell value
			*/
			var id = parseInt(rowId, 10), col, i, cols = this.options.columns, colFound = false, rec, primaryKeyCol;
			// check for primary key
			if (this.options.primaryKey !== null) {
				// assume rowId is the primary Key, not the row index
				primaryKeyCol = this.columnByKey(this.options.primaryKey);
				if (primaryKeyCol.dataType === "number" || primaryKeyCol.dataType === "numeric") {
					rec = this.dataSource.findRecordByKey(parseInt(rowId, 10));
				} else {
					rec = this.dataSource.findRecordByKey(rowId);
				}
				if (rec === null || rec === undefined) {
					throw new Error($.ig.Grid.locale.recordNotFound + " " + rowId);
				}
				return rec[colKey];
			} else {
				// validate
				if (id >= this.dataSource.dataView().length) {
					throw new Error($.ig.Grid.locale.indexOutOfRange);
				}
				if ($.type(colKey) === 'string') {
					for (i = 0; i < cols.length; i++) {
						if (cols[i].key === colKey) {
							col = cols[i];
							colFound = true;
							break;
						}
					}
					if (colFound === false) {
						throw new Error($.ig.Grid.locale.noSuchColumnDefined);
					}
					return this.dataSource.dataView()[id][colKey];
				} else {
					if (cols.length <= colKey) {
						throw new Error($.ig.Grid.locale.columnIndexOutOfRange);
					}
					return this.dataSource.dataView()[id][colKey];
				}
			}
		},
		getCellText: function (rowId, colKey) {
			/* returns the cell text. if colKey is a number, the index of the column is used (instead of a column name)
				this is the actual text (or HTML string) for the contents of the cell. 
				paramType="object" row index or row data key (primary key)
				paramType="string" column key 
				returnType="string" the cell text for the respective cell 
			*/
			var i, cols = this.options.columns, colIndex, primaryKeyIndex;
			
			if ($.type(colKey) === 'string') {
				for (i = 0; i < cols.length; i++) {
					if (cols[i].key === colKey) {
						colIndex = i;
						break;
					}
				} 
			} else {
				colIndex = colKey;
			}
			if (colIndex === undefined) {
				throw new Error($.ig.Grid.locale.columnNotFound + " " + colKey);
			}
			// use with care. 
			if (this.options.primaryKey !== null) {
				// find the index of the primary key column
				for (i = 0; i < cols.length; i++) {
					if (cols[i].key === this.options.primaryKey) {
						primaryKeyIndex = i;
						break;
					}
				}
				if (primaryKeyIndex === undefined) {
					throw new Error($.ig.Grid.locale.columnNotFound + " " + this.options.primaryKey);
				}
				// find the TR using a selector
				return this.element.find("td:nth-child('" + (primaryKeyIndex + 1) + "'):contains('" + rowId + "')").parent().find("td:nth-child(" + (colIndex + 1) + ")").text();
			} else {
				return $(this.cellAt(colIndex, parseInt(rowId, 10))).text();
			}
		},
		setCellValue: function (rowId, colKey, value, tableCell, autoCommit) {
			/* sets a cell value for the specified cell. Creates a transaction & updates the UI. if autoCommit is true, immediately persists the transaction on the client-side data source
				paramType="object" row index or row data key (primary key)
				paramType="string" column key
				paramType="object" the new cell value
				paramType="dom" optional="true" a reference to the TD of the cell
				paramType="bool" if true, will automatically commit to the client data source
			*/
			var rec, tr, t, key;
			// tableCell is optional. if primaryKey is defined it will be needed 
			// autoCommit means that commit() will be automatically called to update the changes in the data source
			key = this._normalizedKey(rowId);
			
			t = this.dataSource.setCellValue(key, colKey, value, autoCommit);
			
			if (tableCell === undefined || tableCell === null) {
				tr = this._findTableRowByKey(rowId);
			} else {
				tr = $(tableCell).parent()[0];
			}
			// we need a fresh detached object because we can't get the data row off the data source view (this will only happen after commit!)
			rec = this.dataSource.getDetachedRecord(t);
			// update the UI (DOM)
			this._renderRow(rec, tr);
		},
		updateRow: function (rowId, rowObject, tableRow, autoCommit) {
			/* updates the whole row in the UI by setting cell values individually, and keeping one transaction for this operation in the transaction log (through the data source)
				the actual data source is not updated until commit() is called, or in case the autoCommit parameter is true
				paramType="object" row index or row data key (primary key)
				paramType="object" row object in the format {colKey1: newval1, colKey2: newval2, ... } . if specific column values are omitted, they won't be updated
				paramType="dom" optional="true" reference to the row element
				paramType="bool" if true, will  not only update the UI automatically persist the changes to the client data source
			*/
			var rec, tr, t, key;
			
			key = this._normalizedKey(rowId);
			t = this.dataSource.updateRow(key, rowObject, autoCommit);

			if (tableRow === undefined || tableRow === null) {
				tr = this._findTableRowByKey(rowId);
			} else {
				tr = tableRow;
			}
			// we need a fresh detached object because we can't get the data row off the data source view (this will only happen after commit!)
			// and the detached row is used just for rendering in the UI
			rec = this.dataSource.getDetachedRecord(t);
			// update the UI (DOM)
			this._renderRow(rec, tr);
			// return the transaction object
			return t;
		},
		addRow: function (rowObject, autoCommit) {
			/* Adds a new row to the grid, updates the UI accordingly 
				paramType="object" row object in the form {colkey1: val1, colkey2: val2, ... } 
				paramType="bool" if auto commit is true will update the UI as well as the client data source
			*/
			var t, noCancel, rowId = null;
			
			// fire the row Adding event
			noCancel = this._trigger(this.events.rowAdding, null, {row: rowObject});
			
			if (noCancel) {
				if (this.options.primaryKey !== null && rowObject[this.options.primaryKey] !== null && rowObject[this.options.primaryKey] !== undefined) {
					// find the record 
					rowId = rowObject[this.options.primaryKey];
				}
				t = this.dataSource.addRow(rowId, rowObject, autoCommit);
				// create a new tr and append it to the grid
				this.renderNewRow(rowObject);
				// fire rowAdded
				this._trigger(this.events.rowAdded, null, {row: rowObject});
				// return the transaction object 
				return t;
			}
		},
		deleteRow: function (rowId, tr, autoCommit) {
			/* deletes a row from the grid and updates the UI. if the autoCommit parameter is set to true, also persists the changes to the underlying client data source
				paramType="object" row index or row data key (primary key)
				paramType="dom" optional="true" reference to the row's element
				paramType="bool" if true, will also persist the changes directly to the underlying data source
			*/
			var t;
			t = this.dataSource.deleteRow(rowId, autoCommit);
			if (!tr) {
				tr = this._findTableRowByKey(rowId);
			}
			$(tr).remove();
			return t;
		},
		commit: function (id) {
			/* commits all pending transactions to the client data source. Note that there won't be anything to commit on the UI, since it is updated instantly. in order to rollback the actual UI, a call to dataBind() is required
				paramType="string" optional="true" if specified, will commit only that transaction corresponding to the specified index/ key 
			*/
			var key;
			key = this._normalizedKey(id);
			// commits all changes to the data source (delegates to igDataSource). Note that there won't be anything to commit on the UI, since it is updated instantly ! 
			// in order to rollback the actual UI, a call to dataBind() is required ! 
			this.dataSource.commit(key);
		},
		rollback: function (id, updateUI) {
			/* clears the transaction log (delegates to igDataSource). note that this does not update the UI , in case the UI must be updated, set the second parameter "updateUI" to true, which will trigger a call to dataBind() to re-render the contents. 
				paramType="string" optional="true" if specified, will only rollback the row with that index / key
				paramType="bool" optional="true" whether to update the UI or not (will perform a rebind, if true)
			*/
			var rec, tr, primaryKeyIndex, cols = this.options.columns, key, i;
			
			key = this._normalizedKey(id);
			this.dataSource.rollback(key);
			
			if (updateUI === true && id !== null && id !== undefined) {
				// rebind the grid to force re-rendering 
				// update the UI for the specified record only!
				if (this.options.primaryKey !== null) {
					rec = this.dataSource.findRecordByKey(key);
					if (rec === undefined || rec === null) {
						throw new Error($.ig.Grid.locale.recordNotFound + " " + id);
					}
					for (i = 0; i < cols.length; i++) {
						if (cols[i].key === this.options.primaryKey) {
							primaryKeyIndex = i;
							break;
						}
					}
					if (primaryKeyIndex === undefined) {
						throw new Error($.ig.Grid.locale.columnNotFound + " " + this.options.primaryKey);
					}
					tr = this.element.find("td:nth-child('" + (primaryKeyIndex + 1) + "'):contains('" + id + "')").parent()[0];
				} else {
					if (parseInt(id, 10) >= this.dataSource.dataView().length) {
						throw new Error($.ig.Grid.locale.indexOutOfRange);
					}
					rec = this.dataSource.dataView()[parseInt(id, 10)];
					tr = this.rowAt(parseInt(id, 10));
				}
				// rerender the row
				this._renderRow(rec, tr);
				
			} else if (id === true || updateUI === true) {
				this.dataBind();
			}
		},
		_normalizedKey: function (id) {
			// returns a normalized key because id can be both index or a primary key (string / number) 
			var key, primaryKeyCol;
			key = id;
			if (this.options.primaryKey !== null) {
				primaryKeyCol = this.columnByKey(this.options.primaryKey);
				if (primaryKeyCol.dataType === "number" || primaryKeyCol.dataType === "numeric") {
					key = parseInt(id, 10);
				}
			} else {
				key = parseInt(id, 10);
			}
			return key;
		},
		saveChanges: function () {
			/* invokes an AJAX request to the updateUrl option (if specified) and passes the serialized transaction log - a serialized JSON string - as part of the POST request */
			this.dataSource.saveChanges();
		},
		_renderRow: function (rec, tr) {
			var cols = this.options.columns, i;
			// check if templating is used
			if (this.options.jQueryTemplating === true) {
				$(tr).replaceWith($.tmpl(this._generateRowTemplate(), [rec], this._buildFormatters()));
			} else {
				for (i = 0; i < tr.cells.length; i++) {
					tr.cells[i].innerHTML = this._renderCell(rec[cols[i].key], cols[i]);
				}
			}
		},
		// assumes the record will have the primary key
		renderNewRow: function (rec) {
			var tbody = this.element.children("tbody");
			if (this.options.jQueryTemplating === true) {
				$.tmpl(this._generateRowTemplate(), [rec], this._buildFormatters()).appendTo(tbody);
			} else {
				this._renderRecord(null, tbody, rec, this.dataSource.data().length);
			}
		},
		_findTableRowByKey: function (key) {
			var primaryKeyIndex, cols = this.options.columns, r, i;
			// find the index of the primary key column
			if (this.options.primaryKey !== null) {
				for (i = 0; i < cols.length; i++) {
					if (cols[i].key === this.options.primaryKey) {
						primaryKeyIndex = i;
						break;
					}
				}
				if (primaryKeyIndex === undefined) {
					throw new Error($.ig.Grid.locale.columnNotFound + " " + this.options.primaryKey);
				}
				r = this.element.find("td:nth-child('" + (primaryKeyIndex + 1) + "'):contains('" + key + "')").parent();
				return r.length === 0 ? null : r[0];
			} else {
				return this.rowAt(parseInt(key, 10));
			}
		},
		/* A.T. 21 Jan 2010 - Fix for bug #62277 - Data rebinding doesn't work properly. You have to reset all the properties for the binding
		 * widget options are deep cloned !!! Therefore if the data source is LOCAL json array or some object, it must be set through the API, not in the options
		 * alternatively if it is set from options, it will be deep copied !
		 */
		dataSourceObject: function (dataSource) {
			/* if the data source points to a local JSON array of data, and it is necessary to reset it at runtime, it must be done through this API member instead of the options (options.dataSource) 
				paramType="object" new data source object. 
			*/
			if (dataSource !== undefined) {
				this.options.dataSource = dataSource;
			} else {
				return this.options.dataSource;
			}
		},
		totalRecordsCount: function () {
			/* returns the total number of records in the underlying backend. if paging or filtering is enabled, this may differ from the number of records in the client-side data source.
				in order for this to work, the response JSON/XML must include a property that specifies the total number of records, which name is specified by options.responseTotalRecCountKey
				this functionality is completely delegated to the data source control
				returnType="number" total number of records in the backend
			*/
			return this.dataSource.totalRecordsCount();
		},
		dataBind: function (internal) {
			/* causes the grid to data bind to the data source (local or remote) , and re-render all of the data as well */
			var dataOptions, i, noCancel = true;
			// fire data binding event
			noCancel = this._trigger(this.events.dataBinding, null, {owner: this});
			if (internal === undefined) {
				this.options.requiresDataBinding = true;
			}
			if (noCancel) {
				if (this.options.requiresDataBinding) {
					dataOptions = this._generateDataSourceOptions(this.options);
					//A.T. 18 Jan 2011 - Fix for bug #62277 - Data rebinding doesn't work properly. You have to reset all the properties for the binding
					this._setupDataSource(dataOptions);
					//initialize grid features and attach their event handlers
					this._dataOptions = dataOptions;
					//if (this.options.autoGenerateColumns === false) {
					if (!this._initialized) {
						for (i = 0; i < this.options.features.length; i++) {
							this._initFeature(this.options.features[i], dataOptions);
						}
					} else {
						this.element.trigger('iggriduidirty', {owner: this});
						// fire UI State dirty so that features reset their UI (without destroying them)
						for (i = 0; i < this.options.features.length; i++) {
							this._initFeatureSettings(this.options.features[i]);
						}
					}
					//}
					this._renderGrid();
					if (this._loadingIndicator === undefined) {
						this._initLoadingIndicator();
					}
					this._loadingIndicator.show();
					this.dataSource.dataBind();
					this.options.requiresDataBinding = false;
				} else {
					// data source is already bound 
					this._renderGrid();
				}
			}
		},
		_generateDataSourceOptions: function (options) {
			
			var schema, dataOptions, t, headers, i;
			// if there is neither options.dataSource specified, nor options.dataSourceUrl, we check if we are binding to a table and if there is any existing
			// data in it, and then we set the data source to that table DOM element, so that it can be processed by the data source control
			if (!this.options.dataSource && !this.options.dataSourceUrl && this.element.is('table') && this.element.find('tbody').children().length > 0) {
				this.options.dataSource = this.element[0];
			}
			
			// we need to look ahead and check if the data source is a HTML Table and has column headers defined. in that case we need to update the headerText in the column definitions
			if (this.options.dataSource && this.options.dataSource.tagName && this.options.dataSource.nodeType) {
				t = $(this.options.dataSource);
				if (t.is('table') && t.find('thead th').length > 0) {
					// generate column headers 
					headers = t.find('thead tr th');
					this._tb_h = true;
					this._tb_h_arr = [];
					for (i = 0; i < headers.length; i++) {
						this._tb_h_arr.push($(headers[i]).text());
					}
					/*
					if (this.options.columns.length > 0) {
						for (i = 0; i < headers.length && i < this.options.columns.length; i++) {
							this.options.columns[i].headerText = $(headers[i]).text();
						}
					} else {
						for (i = 0; i < headers.length; i++) {
							this.options.columns.push({"headerText": $(headers[i]).text()});
						}
					}
					*/
				}
			}
			
			dataOptions = {
			    callback : this._renderData,
			    callee : this,
				responseDataKey: this.options.responseDataKey,
				responseTotalRecCountKey: this.options.responseTotalRecCountKey,
				dataSource: this.options.dataSource,
				primaryKey: this.options.primaryKey,
				localSchemaTransform: this.options.localSchemaTransform,
				autoCommit: this.options.autoCommit,
				serializeTransactionLog: this.options.serializeTransactionLog,
				updateUrl: this.options.updateUrl
		    };
			if (this.options.dataSourceType !== null) {
				dataOptions.type = this.options.dataSourceType;
			}
			// create a schema based on the columns definition
			// iterate over the columns collection, if such exists. Otherwise bind to everything
			//A.T. 28 March 2011 - fix for bug #68548
			schema = this._generateDataSourceSchema();
			if ((this.options.dataSource instanceof $.ig.DataSource && this.options.dataSource.settings.schema === null) || !(this.options.dataSource instanceof $.ig.DataSource)) {
				dataOptions = $.extend(dataOptions, {schema: schema}); 
			}
			return dataOptions;
		},
		_generateDataSourceSchema: function () {
			var schema, i, rec, prop, count = 0, cols = this.options.columns;
			//if (this.options.columns.length > 0) {
			if (this.options.columns.length > 0 && !this.options.autoGenerateColumns) {
			// if autoGenerateColumns is true, fields for all columns in the data source must be specified
				schema = {};
				schema.fields = [];
				for (i = 0; i < this.options.columns.length; i++) {
					schema.fields[i] = {};
					schema.fields[i].name = this.options.columns[i].key;
					schema.fields[i].type = this.options.columns[i].dataType;
				}
				schema.searchField = this.options.responseDataKey;
			//} else if (this.options.columns.length > 0 && this.options.autoGenerateColumns) {
			} else if (this.options.autoGenerateColumns) {
				schema = {};
				schema.fields = [];
				// A.T. Fix for #74240. Please note that in this case (if autoGenerateColumns=true, and there are custom cols defined,
				// and they have widths defined, there MUST be defaultColumnWidth specified, otherwise the remaining columns in the data source
				// will be shrinked to zero and they won't be visible ! 
				if (this.options.dataSource && this.options.dataSource.tagName && $(this.options.dataSource).is("table")
						&& $(this.options.dataSource).find("tbody tr").length > 0) {
					rec = $(this.options.dataSource).find("tbody tr")[0];
				//	count = $(rec).find('td').length;
					$(rec).find('td').each(function () {
						if (cols.length > count) {
							schema.fields.push({name: cols[count].key ? cols[count].key : (count + 1),
								type: cols[count].dataType ? cols[count].dataType : "string"});
						} else {
							schema.fields.push({name: (count + 1), type: "string"});
						}
						count++;
					});
				} else if (this.options.dataSource && this.options.dataSource.length && this.options.dataSource.length > 0 &&
						$.type(this.options.dataSource) === "array") {
					rec = this.options.dataSource[0];
					for (prop in rec) {
						if (rec.hasOwnProperty(prop)) {
							// if the column isn't already defined in the columns collection 
							if (this.columnByKey(prop) === null) {
								schema.fields.push({name: prop, type: this._getColType(rec[prop])});
							} else {
								schema.fields.push({name: prop, type: this.columnByKey(prop).dataType});
							}
							count++;
						}
					}
				}
			}
			return schema;
		},
		_setupDataSource: function (dataOptions) {	
			if (!(this.options.dataSource instanceof $.ig.DataSource)) {
				this.dataSource = new $.ig.DataSource(dataOptions);
			} else {
				this.dataSource = this.options.dataSource;
				dataOptions.dataSource = this.dataSource.settings.dataSource;
				//A.T. 12 Feb 2011 - Fix for bug #65899
				if (this.dataSource.settings.responseDataKey !== null) {
					delete dataOptions.responseDataKey;
					if (dataOptions.schema) {
						dataOptions.schema.searchField = this.dataSource.settings.responseDataKey;
					}
				}
				this.dataSource.settings = $.extend(true, {}, this.dataSource.settings, dataOptions);
				if (dataOptions.schema) {
					this.dataSource._initSchema();
				}
			}
		},
		_getColType: function (o) {
			var t = typeof o;
			if (t === "undefined") {
				return "string";
			} else if (t === "object" && t instanceof Date) {
				return "date";
			} else if (t === "boolean") {
				return "bool";
			} else if (t === "number") {
				return t;
			} else {
				return "string";
			}
		},
		_generateColumns: function () {
			var r, key, i, hasExplicitCols = this.options.columns.length > 0, hasHeaders = false, len, isTable = false, arr = [];
			//this.options.columns = []; // A.T. 28 Feb  2011 - we shouldn't be clearing the columns !@ 
			// we need to take into account the case where columns are already defined. This means we render them first, and only then proceed
			// with the rest of the columns in the data source 
			
			// special case - having columns defined manually, and autoGenerateColumns = true at the same time
			// A.T. that's basically bug (#74240) - we shouldn't be using the dataView, because it's already bound according to whatever is defined in options.columns
			// and everything else is not bound at all !
			if (this.options.dataSource && this.options.dataSource.tagName && $(this.options.dataSource).is('table')) {
				len = $(this.options.dataSource).find('tbody tr').length;
				isTable = true;
			} else if (this.options.dataSource && this.options.dataSource.length) {
				len = this.options.dataSource.length;
			}
			if (this.options.dataSource && len && len === 0 && this.options.columns.length === 0) {
				throw new Error($.ig.Grid.locale.autoGenerateColumnsNoRecords);
			} else {
				if (this.options.dataSource && len && len > 0) {
					//r = this.dataSource.dataView()[0];
					if (isTable) {
						r = $(this.options.dataSource).find('tbody tr')[0];
					} else {
						r = this.options.dataSource[0];
					}
					if ($.type(r) === "array" || isTable) {
						// check if we aren't binding to a table that has headers defined already
						/*
						if (hasExplicitCols && this.options.columns[0].headerText) {
							hasHeaders = true;
							for (i = 0; i < this.options.columns.length; i++) {
								headers.push(this.options.columns[i].headerText);
							}
							this.options.columns = [];
						}
						*/
						hasHeaders = this._tb_h;
						if (isTable) {
							$(r).find('td').each(function () { arr.push($(this).text()); });
							r = arr;
						}
						for (i = 0; i < r.length; i++) {
							// detect type
							if (this.columnByKey(i + 1) === null) {
								this.options.columns.push({headerText: hasHeaders ? this._tb_h_arr[i] : $.ig.Grid.locale.colPrefix + (i + 1), key: (i + 1), dataType: this._getColType(r[i])});
							} else if (hasHeaders && !this.columnByKey(i + 1).headerText) {
								this.columnByKey(i + 1).headerText = this._tb_h_arr[i];
							}
						}
					} else {
						for (key in r) {
							// also detect type
							if (r.hasOwnProperty(key) && this.columnByKey(key) === null) {
								this.options.columns.push({headerText: key, key: key, dataType: this._getColType(r[key])});
							}
						}
					}
				}
			}
			// we need to set the data source schema
			if ((this.dataSource.schema() === null || this.dataSource.schema().fields().length === 0) && !hasExplicitCols) {
				this.dataSource.settings.schema = this._generateDataSourceSchema();
				this.dataSource._initSchema();
			}
			if (this.options.width === null) {
				this._setContainerWidth(this.element[0].id + '_container');
			}
		},
		_renderGrid: function () {

			var grid = this, gridElement = this.element[0],
				containerId,
				containerDiv,
				noCancel,
				tbody = this.element.children('tbody'), //gridElement.find('tbody')
				ar = this.options.accessibilityRendering;
			grid._trigger(this.events.dataBound, null, {owner: this});
			noCancel = grid._trigger(this.events.rendering, null, {owner: this});

			if (noCancel) {
				if (!this._initialized) {
					// we should have the data now in the data view
					// determine automatically if we want virtualization enabled or not 
					// IMPORTANT: height must also be always set ! 
					if ($.type(this.options.virtualization) === "number" && this.dataSource.dataView().length > this.options.virtualization && this.options.height !== null) {
						this.options.virtualization = true;
					}
					// check if the element passed on the widget is of type table or div
					if (gridElement.nodeName.toLowerCase() === "div") {
						this._isWrapped = true;
						this.element = $("<table></table>").appendTo(gridElement);
						gridElement = this.element[0];
					} 
					if (ar) {
						this.element.attr('role', 'grid');
					}
					if (this.options.virtualization === true || this.options.rowVirtualization === true || this.options.columnVirtualization === true) {
						this._createVirtualGrid();
					} else if (this.options.height !== null || this.options.width !== null) {
						this._createScrollingGrid();	
					} else {
						// just wrap with a div, if it doesn't exist 
						if (!this._isWrapped) {
							containerId =  gridElement.id + '_container';
							containerDiv = '<div id="' + containerId + '" class="' + this.css.gridClasses + ' ' + this.css.baseClass + '"> </div>';
							this.element.wrap(containerDiv);
						} else {
							containerId = this.element.parent().addClass(this.css.gridClasses).addClass(this.css.baseClass).attr('id');
						}
						this.element.addClass(this.css.gridTableClass);
						if (ar) {
							this.element.attr('aria-describedby', containerId);
						}
						this._setContainerWidth(containerId);
						
						$("#" + containerId).attr('tabIndex', this.options.tabIndex);
						if (this.options.height !== null) {
							$("#" + containerId).css('overflow-y', 'hidden');
							//this.scrollContainer().css('height', this.options.height);
						}
					}
					// render colgroup for column widths
					if (this.options.columns.length > 0
							&& (this.options.virtualization !== true && this.options.rowVirtualization !== true && this.options.columnVirtualization !== true) 
							&& this.options.autogenerateColumns === false && this.options.columns.length > 0
							) {
						this._renderColgroup(this.element[0]);
					} 
					// cellpadding, cellspacing, etc.
					$(gridElement).attr('cellpadding', '0');
					$(gridElement).attr('cellspacing', '0');
					$(gridElement).attr('border', '0');
					$(gridElement).css('table-layout', 'fixed');
					$(gridElement).addClass(this.css.gridTableClass);
					if (this.options.autoGenerateColumns === false && this.options.columns.length > 0) {
						this._renderHeader();
					}
					// render header caption
					this._renderCaption();
					if (this.options.autoAdjustHeight) {
						this._initializeHeights();
					}
				}
				if (tbody.length === 0) {
					tbody = $('<tbody></tbody>').appendTo(gridElement).addClass(this.css.baseContentClass).addClass(this.css.gridTableBodyClass).addClass(this.css.recordClass);
				}
				if (this.dataSource.type() !== 'htmlTableDom' && this.dataSource.type() !== 'htmlTableId') {
					tbody.empty();
				}
			}
		},
		_setContainerWidth: function (id, rendered) {
			var cols = this.options.columns, width = 0;
			// calculate based on column widths
			// if no col width is set, use the defaultColumnWidth
			//if (cols.length > 0 && !this.options.autoGenerateColumns) {
			if (cols.length > 0) {
				width = this._calculateContainerWidth();
				if (width > 0) {
					if (rendered) {
						// get outer widths for column headers
						width = 0;
						this.container().find('.ui-iggrid-header').each(function () {
							width += $(this).outerWidth();
						});
						$('#' + id).width(width);
					} else {
						$('#' + id).css('width', width);
					}
				}
			} else if (this.options.width !== null) {
				$('#' + id).css('width', this.options.width);
			} 
		},
		_calculateContainerWidth: function () {
			var width = 0, cols = this.options.columns, i;
			for (i = 0; i < cols.length; i++) {
				width += cols[i].width ? parseInt(cols[i].width, 10) : this.options.defaultColumnWidth === null ? 0 : parseInt(this.options.defaultColumnWidth, 10); 
			}
			// add the scrollbar width if any 
			if (this.options.height !== null && this.options.fixedHeaders === true && width > 0) {
				width += this._scrollbarWidth();
			}
			return width;
		},
	    // creates a scrolling, non-virtual grid
	    _createScrollingGrid: function () {
		    var id =  this.element[0].id + '_scroll',
				scrollDiv = '<div id="' + id + '"> </div>';
				
			this.element.wrap(scrollDiv);
			if (this.options.accessibilityRendering) {
				this.element.attr('aria-describedby', id);
			}
			
			$('#' + id).addClass(this.css.gridScrollDivClass).wrap("<div id='" + this.element[0].id + "_container'></div>");
			this.container().attr('tabIndex', this.options.tabIndex).addClass(this.css.baseClass).addClass(this.css.gridClasses);
			
		    if (this.options.width !== null) {   
				this.container().css('width', this.options.width);
				// A.T. 14 Feb 2011 - Fix for bug #66086
				if (this.options.width.indexOf && this.options.width.indexOf('%') !== -1) {
					//if ((this.options.width.indexOf('%') !== -1 && parseInt(this.options.width, 10) === 100) || this.options.width.indexOf('%') === -1) {
						//this.element.css('width', this.options.width);
					//} else if (this.options.width.indexOf('%') !== -1) {
					//if (this.options.width.indexOf('%') !== -1) {
					this.element.css('width', '100%');
					//}
				}// else {
					//this.element.css('width', this.options.width);
				//}
            } else {
				this._setContainerWidth(this.element[0].id + '_container');
				// set overflow-x: hidden on the scrolling container
				$('#' + this.element[0].id + '_scroll').css('overflow-x', 'hidden');
            }
		    if (this.options.height !== null) {
				$('#' + id).css('overflow-y', 'auto');
				if (this.options.autoAdjustHeight) {
					this.container().css('height', this.options.height);
				} else {
					this.scrollContainer().css('height', this.options.height);
				}
            }
	    },
	    // virtual grid implies scrolling grid 
	    _createVirtualGrid: function () {
		    /* 
		     *  // this is the general structure for virtualization when both column and row virtualization are enabled
		     *	<table border="0" cellspacing="0" cellpadding="0">
		     *		<tr>
		     *			<td><div id="#gridID_headers"></div></td>
		     *			<td></td>
		     *		</tr>
		     *			<tr>
		     *				<td><div id="#gridID_displayContainer"></td>
		     *				<td><div id="#gridID_scrollContainer"></div></td>
		     *			</tr>
		     *			<tr>
		     *			<td><div id="#gridID_horizontalScrollContainer"></div></td>
		     *			<td></td>
		     *			</tr>
		     *	</table>
		     */
		    var id = this.element[0].id,
				grid,
				percWidthStr = $.browser.webkit ? 'width=100%' : '',
				totalWidth,
				scrollContainerInner,
				scrollbarWidth,
				horizontalScrollContainerInner,
				w = 0,
				virtualGridMarkup = '<div id="' + id + '_container" style="margin:0px; border:0px; padding:0px;"><table border="0" cellspacing="0" cellpadding="0" class="ui-iggrid-layout-helper" style="border-spacing:0px" id="' + id + '_virtualContainer" ><tbody><tr><td colspan="2" style="border-width:0px"><div id="' + id + '_headers_v"></div></td></tr><tr><td style="border-width:0px;"><div id="' +
					id + '_displayContainer"></td>$verticalMarkup$</tr>$horizontalMarkup$</tbody></table></div>',
				verticalMarkup,
				horizontalMarkup = '<tr><td colspan="2" style="border-width: 0px"><div id="' + id + '_horizontalScrollContainer"></div></td></tr>';
		
			scrollbarWidth = this._scrollbarWidth();
			if ($.browser.msie) {
				scrollbarWidth += 1;
			}
			if (parseInt(this.options.height, 10) > 0) {
				verticalMarkup = '<td style="border-width: 0px;"><div id="' + id + '_scrollContainer" style="overflow:scroll; overflow-x:hidden; width: ' + scrollbarWidth + 'px; height:' + parseInt(this.options.height, 10) + 'px;"></div></td>';
			} else {
				verticalMarkup = '<td style="border-width: 0px;"><div id="' + id + '_scrollContainer" style="overflow:scroll; overflow-x:hidden; width: ' + scrollbarWidth + 'px;"></div></td>';
			}
			
		    if (this.options.virtualization === true) {
			    virtualGridMarkup = virtualGridMarkup.replace('$verticalMarkup$', verticalMarkup).replace('$horizontalMarkup$', horizontalMarkup);
			
		    } else if (this.options.rowVirtualization === true) {
			    virtualGridMarkup = virtualGridMarkup.replace('$verticalMarkup$', verticalMarkup).replace('$horizontalMarkup$', '');
			
		    } else if (this.options.columnVirtualization === true) {
			    virtualGridMarkup = virtualGridMarkup.replace('$horizontalMarkup$', horizontalMarkup).replace('$verticalMarkup$', '');
		    }

			// if column virtualization is enabled we really need to make sure that we set the width of the data table to 100 % otherwise 
			// the column widths will not be correct and will try to be accomodated in the specified fixed width of the grid.
			if (this.options.virtualization === true || this.options.columnVirtualization === true) {
				this.element.css('width', '100%');
			}
		    // now inject our existing grid in the place of the "displayContainer"
		    this.element.wrap(virtualGridMarkup);
			
			// apply the base classes
			this.container().addClass(this.css.baseClass).addClass(this.css.gridClasses);
			if (this.options.width !== null) {
				this.container().width(this.options.width);
			} else {
				this._setContainerWidth(this.container()[0].id);
			}
			
		    $('#' + id + '_displayContainer').append(this.element[0]);
			this._renderColgroup(this.element[0]);
		    
		    grid = this;
			
			totalWidth = this._calculateContainerWidth();
			if (this.options.width !== null) {
				w = parseInt(this.options.width, 10);
			} else {
				w = totalWidth;
			}
			if (this.options.height !== null) {
				w -= this._scrollbarWidth();
			}
				
		    // set virtual container's width correctly
			$('<colgroup><col ' + (w <= 0 ? percWidthStr : ('width="' + w + '"')) + '></col><col width="' + this._scrollbarWidth() + '"></col></colgroup>').prependTo('#' + id + '_virtualContainer');
		    $('#' + id + '_virtualContainer').css('width', this.options.width).css('max-width', this.options.width);
		    // now create the inner scrolling containers, that will be placed inside of the scrollContainer/horizonalScrollContainer,
		    // and will cause the virtual scrollbars to appear and grow according to the total records in the data source
			scrollContainerInner = '<div style="width:1px; overflow:hidden; height:' + (this._totalRowCount * parseInt(this.options.avgRowHeight, 10)) + 'px;"></div>';
		    $('#' + id + '_scrollContainer').append(scrollContainerInner);
		    if ((this.options.virtualization === true || this.options.columnVirtualization === true) && totalWidth > parseInt(this.options.width, 10)) {
			    // do the same for the horizontal scrolling
			    $('#' + id + '_horizontalScrollContainer').css('height', this._scrollbarWidth() + 'px').css('overflow', 'scroll');
				//if (this.options.virtualization === true || this.options.rowVirtualization === true) {
				//	$('#' + id + '_horizontalScrollContainer').css('width', parseInt(this.options.width, 10) - this._scrollbarWidth());
				//} else {
				if ($.browser.msie) {
					$('#' + id + '_horizontalScrollContainer').css('width', parseInt(this.options.width, 10) + 1);
				} else {
					$('#' + id + '_horizontalScrollContainer').css('width', this.options.width);
				}
				//}
			    horizontalScrollContainerInner = '<div style="width:' + totalWidth + 'px;height:1px;"></div>';
			    $('#' + id + '_horizontalScrollContainer').append(horizontalScrollContainerInner);
		    }
			if (parseInt(this.options.height, 10) > 0) {
				$('#' + id + '_displayContainer').css('height', this.options.height).css('vertical-align', 'top');
			}
			$('#' + id + '_displayContainer').append("<a href='#' id='" + id + "_displayContainer_a'></a>").css('width', w).css('maxWidth', w);
			if (this.options.width && this.options.virtualization === false && this.options.columnVirtualization === false) {
				$('#' + id + '_displayContainer').css({'overflow-y': 'hidden', 'overflow-x': 'auto'});
			} else {
				$('#' + id + '_displayContainer').css('overflow', 'hidden');
			}
			
			// make sure mouse wheel scrolling also works for the table with data, not only the virtual scrollbar
			// it's a smart and little-known technique i am going to use here -:) 
			$('#' + id + '_displayContainer').parent().bind({
				mouseover: function (event) {
					grid._isMouseOverVirtualTable = true;
				},
				mouseout: function (event) {
					grid._isMouseOverVirtualTable = false;
				}
			});
			// Refactor to keep in one place 
			$(document).bind({
				DOMMouseScroll: function (event) { // Firefox
					var dir = 'down', delta, step;
					step = grid.options.virtualizationMouseWheelStep === null ? parseInt(grid.options.avgRowHeight, 10) : grid.options.virtualizationMouseWheelStep;
					delta = -event.detail / 3; // // determine if we are scrolling up or down
					if (delta > 0) { // scroll up 
						dir = 'up';
					}  // else default => scroll down 
					// determine if mouse over  is true
					if (grid._isMouseOverVirtualTable) {
						grid._onVirtualVerticalScroll(event, step, dir); // define this # of pixels automatically
						event.preventDefault();
					}
				},
				mousewheel: function (event) { // IE, Chrome, Safari, Opera
					var dir = 'down', delta, step;
					step = grid.options.virtualizationMouseWheelStep === null ? parseInt(grid.options.avgRowHeight, 10) : grid.options.virtualizationMouseWheelStep;
					delta = event.wheelDelta / 120; // determine if we are scrolling up or down
					if (delta > 0) {
						dir = 'up';
					}
					if (grid._isMouseOverVirtualTable) {
						grid._onVirtualVerticalScroll(event, step, dir); // define this # of pixels automatically 
						event.preventDefault();
					}
				}
			});
			// bind scroll event handlers
			if (this.options.virtualization === true || this.options.rowVirtualization === true) {
			    $('#' + id + '_scrollContainer').bind({
				    scroll: function (event) {
					    grid._onVirtualVerticalScroll(event);
						//bugs #70681  and bug #72116
						grid._virtualScrollMouseDown = false;
				    },
					mousedown: function (event) {
						// this is necessary because of one special case. When we scroll just once, we want to move by 1 row always (in chrome and FF)
						// but when we scroll continuously, we don't want the scrollbar to jump (Refer to bugs #70681  and bug #72116
						grid._virtualScrollMouseDown = true;
					}
			    });
		    }
		    if (this.options.virtualization === true || this.options.columnVirtualization === true) {
			    $('#' + id + '_horizontalScrollContainer').bind({
				    scroll: function (event) {
					    grid._onVirtualHorizontalScroll(event);
				    }
			    });
		    }
			this.element.height($('#' + id + '_scrollContainer').height());
	    },
		// if offset is defined, this means there is mouse-wheel scroll which we are manually handling. the offset is the amount of px to move - up or down 
	    _onVirtualVerticalScroll: function (event, offset, dir) {
			if (this._ignoreScroll && event) {
				return false;
			}
			this._isHorizontal = false;
		//	originalEvent = event.originalEvent,
		    var scrollContainer = this._scrollContainer(), scrollTopDiff,
				current = scrollContainer.scrollTop();
			if (offset !== undefined) {
				if (dir === 'down') {
					scrollContainer.scrollTop(current + offset);
				} else {
					scrollContainer.scrollTop(current - offset);
				}
			} /*else {
				// A.T. 31 March 2011 - fix for bug #70681 
				// Please revise
				if (Math.abs(current - this._oldScrollTop) < this.options.avgRowHeight && current - this._oldScrollTop !== 0) {
					if (current > this._oldScrollTop) {
						scrollContainer.scrollTop(this._oldScrollTop + this.options.avgRowHeight);
					} else {
						scrollContainer.scrollTop(this._oldScrollTop - this.options.avgRowHeight);
					}
				}
			}
			*/
			//this._startRowIndex = Math.ceil(scrollContainer.scrollTop() * this._totalRowCount / (scrollContainer[0].scrollHeight - scrollContainer[0].offsetHeight));
			this._startRowIndex = Math.ceil(scrollContainer.scrollTop() / parseInt(this.options.avgRowHeight, 10));

			scrollTopDiff = scrollContainer.scrollTop() - this._oldScrollTop;
			if ((!$.browser.msie) && this._startRowIndex === this._oldStartRowIndex && this._virtualScrollMouseDown) {
				if (scrollTopDiff > 0 && scrollTopDiff < parseInt(this.options.avgRowHeight, 10)) {
					this._startRowIndex++;
					scrollContainer.scrollTop(scrollContainer.scrollTop() - scrollTopDiff + parseInt(this.options.avgRowHeight, 10));
				} else if (scrollTopDiff < 0 && Math.abs(scrollTopDiff) < parseInt(this.options.avgRowHeight, 10)) {
					this._startRowIndex--;
					scrollContainer.scrollTop(scrollContainer.scrollTop() - scrollTopDiff - parseInt(this.options.avgRowHeight, 10));
				}
			}
			
			if (this._startRowIndex > this._totalRowCount - this._virtualRowCount) {
				this._startRowIndex = this._totalRowCount - this._virtualRowCount;
			}
			if (this._startRowIndex < 0) {
				this._startRowIndex = 0;
			}
	
			if (Math.abs(scrollTopDiff) < 5 && $.browser.mozilla && !$.browser.msie) {
				return;
            }
			this._oldStartRowIndex = this._startRowIndex;
		    this._renderVirtualRecords();
		    this._oldScrollTop = scrollContainer.scrollTop();
	    },
		_scrollContainer: function () {
			if (!this._scrollContainerObj) {
				this._scrollContainerObj = $('#' + this.element[0].id + '_scrollContainer');
			}
			return this._scrollContainerObj;
		},
	    _onVirtualHorizontalScroll: function (event) {
		    var id = this.element[0].id,
				horizontalScrollContainer = $('#' + id + '_horizontalScrollContainer');
			
			this._isHorizontal = true;
			
		    this._startColIndex = Math.ceil(horizontalScrollContainer.scrollLeft() * this._totalColumnCount / (horizontalScrollContainer[0].scrollWidth - horizontalScrollContainer[0].offsetWidth));
			//this._startColIndex = Math.ceil(horizontalScrollContainer.scrollLeft() / this.options.avgColumnWidth);
		    if (this._startColIndex > this._totalColumnCount - this._virtualColumnCount) {
                this._startColIndex = this._totalColumnCount - this._virtualColumnCount;
            }
		    if (Math.abs(horizontalScrollContainer.scrollLeft() - this._oldScrollLeft) < 5 && $.browser.mozilla && !$.browser.msie) {
			    return;
            }
		    this._renderVirtualRecords();
		    this._oldScrollLeft = horizontalScrollContainer.scrollLeft();
			
			// trigger an event so that features that are header-dependent, such as filtering and sorting , update their UI accordingly
			this._trigger('virtualhorizontalscroll', null, {startColIndex: this._startColIndex, endColIndex: this._startColIndex + this._virtualColumnCount});
	    },
		_initLoadingIndicator: function () {
		
			// attach loading indicator widget
			if (this.container().data("igLoading")) {
				this._loadingIndicator = this.container().data("igLoading").indicator();
			} else {
				this._loadingIndicator = this.container().igLoading().data("igLoading").indicator();
			}
		},
	    _renderData: function (success, errmsg) {
		
			var gridElement = this.element,
				noCancel = true,
				i,
				lastc,
				isTable = false,
				lastHeader,
				tbody; //gridElement.find('tbody')

			if (success === false) {
				throw new Error(errmsg);
			}
			if (this._fireDataBoundInternal) {
				this._fireDataBoundInternal = false;
				this._trigger(this.events.dataBound, null, {owner: this});
			}
			this.element.trigger('iggriduisoftdirty', {owner: this});
			
			tbody = gridElement.children('tbody');
			noCancel = this._trigger(this.events.dataRendering, null, {owner: this});
			
			if (noCancel) {
				// show loading indicator
				//this.options.dataSource = this.dataSource.dataView();
				// generate and render markup on the client 
				// reset virtualization buffer
				
				/* jQuery's empty() will try to find all handlers, etc. which is very slow. On the other hand if we don't use a similar approach
					and just remove the tbody, there will be memory leaks (inherent in Firefox and IE by design). 
					tbody.innerHTML="" won't work for IE ! since it's read only for many types of DOM elements, including TBODY ! 
				*/
				//if (this.options.jQueryTemplating === true) {
				if (!(this.options.dataSource && this.options.dataSource.tagName && $(this.options.dataSource).is('table'))) {
					if ($.ui.igGrid.speedupDOMCleanup === false) {
						tbody.empty();
					} else {
						if (tbody.children().length > 0) {
							this.element[0].removeChild(tbody[0]);
							tbody = $('<tbody></tbody>').appendTo(this.element).addClass(this.css.baseContentClass).addClass(this.css.gridTableBodyClass).addClass(this.css.recordClass);
						}
					}
				} else {
					isTable = true;
				}
				//}
				this._virtualDom = null;
				
				if (!this._initialized) {
					// auto generate the columns collection, if options.autogenerateColumns is true
					if (this.options.autoGenerateColumns === true) {
						this._generateColumns();
						// reinitialize all features
						for (i = 0; i < this.options.features.length; i++) {
							this._initFeature(this.options.features[i], this._dataOptions);
						}
					}
					if (isTable) {
						// now clean up the TABLE
						tbody.empty(); 
					}
					if (this.container().find('.ui-iggrid-header').length === 0) {
						this._renderHeader();
						this._renderCaption();
					}
					if (this.element.find('colgroup').length === 0) {
						this._renderColgroup(this.element[0]);
					}
				}
				if (this.options.autoGenerateColumns === false && ((this.options.columns && this.options.columns.length === 0) || !this.options.columns)) {
					throw new Error($.ig.Grid.locale.noColumnsButAutoGenerateTrue);
				}
				//A.T. 12 Feb - Fix for bug #65676 - Grid autogenerates columns when the columns are not defined and autoGenerateColumns = false
				if (this.options.columns.length > 0) {
					if (this.options.virtualization === true || this.options.rowVirtualization === true || this.options.columnVirtualization === true) {
						this._renderVirtualRecords();
					} else {
						this._renderRecords();
					}
				}
				
				//this._setContainerWidth(this.element[0].id + '_container', true);
				// if fixed headers is enabled, we need to make sure the last column's width is adjusted appropriately
				// we have to do this here, because we don't know if we need a scroll bar or not, before data is actually rendered
				if (this._headerParent && this.options.fixedHeaders === true && this._lastCol && this.options.showHeader &&
						this._lastColWidth !== undefined && this.options.height && parseInt(this.options.height, 10) > 0) {
					// A.T. the below line is very slow on IE. Therefore we need to do some magic to avoid reflow, which will be caused
					// by calling height() on the various elements which have many children. height() just calls offsetHeight, which is a performance killer on IE9
					// when invoked on elements with many children 
					if ((this.options.autoAdjustHeight && this.element.height() <= $('#' + this.element[0].id + '_scroll').height()) ||
							(!this.options.autoAdjustHeight && this.options.avgRowHeight * this.element[0].rows.length < parseInt(this.options.height, 10))) {
					
					//if (this.element.height() <= $('#' + this.element[0].id + '_scroll').height()) {
					//if (this.options.avgRowHeight * this.element[0].rows.length < parseInt(this.options.height, 10)) {
						this._lastCol.css('width', this._lastColWidth);
						// remove padding from header table
						this._headerParent.css('padding-right', 0);
						
						// this must be done on all browsers (because of filter row last col and bug #75760), not just safari/chrome
						//if ($.browser.webkit) {
							lastHeader = this._headerParent.find('th:last-child');
							lastHeader.css('width', this._lastColWidth);
						//}
					} else {
						if (this._lastColWidth.charAt && this._lastColWidth.endsWith('%')) {
							this._lastCol.css('width', this._lastColWidth);
							this._headerParent.css('padding-right', this._scrollbarWidth());
						} else {
							this._lastCol.css('width', this._lastColWidth + this._scrollbarWidth());
						}
					}
				// this is the case where there aren't column widths defined. We must handle this case as well. 
				} else if (!this._lastCol && this.options.height !== null) {
					if (this.options.autoAdjustHeight && this.element.height() <= $('#' + this.element[0].id + '_scroll').height()) {
						// get the header and remove the padding
						this.headersTable().css('padding-right', 0);
					} else {
						// add the padding
						//this.headersTable().css('padding-right', this._scrollbarWidth());
					}
				}
				
				this._registerAdditionalEvents();
				this._trigger(this.events.dataRendered, null, {owner: this});
				this._fireInternalEvent("_dataRendered");
				
				if (!this._initialized) {
					this._renderFooter();
					if (this.options.autoAdjustHeight) {
						this._initializeHeights();
					}
				}
				// adjust scrolling grid height
				if (!this._initialized) {
					this._trigger(this.events.rendered, null, {owner: this});
				}
				if (!this._initialized) {
					this._initialized = true;
				}

				if (this._loadingIndicator === undefined) {
					this._initLoadingIndicator();
				}
				this._loadingIndicator.hide();
			}
			// scenarios where the first load is sending JSON, but the second time we are actually making an AJAX request (MVC for example)
			if (this.options.dataSourceUrl !== null && this._firstBind) {
				this.options.dataSource = this.options.dataSourceUrl;
				this.dataSource.settings.dataSource = this.options.dataSourceUrl;
				this.dataSource.settings.type = "remoteUrl";
				this.dataSource._runtimeType = this.dataSource.analyzeDataSource(); 
				this._firstBind = false;
			}
			this._fireInternalEvent("_gridRendered", $('#' + gridElement[0].id + '_container'));
	    },
		_initializeHeights: function () {
			// A.T. 6 April 2011 - changing this logic so that it's executed async in the background. This is just for re-setting the proper height of the scroll container,
			// in case there are other elements that take up space, such as paging footers, filter summaries, etc. 
			// with this approach , including setting overflow hidden to the container, and initializing the scroll container with the height of its parent, we don't get
			// the nasty visual flickerings and resetting of the scrollbar
			var initialHeight;
			if (this.options.height === null || this.options.height === undefined) {
				return;
			}
			initialHeight = parseInt(this.options.height, 10);
			//if ($.browser.msie && $('.ui-iggrid-footer', this.container()).length === 0) {
			//
			$('#' + this.element[0].id + '_scroll').height(initialHeight);
			//	setTimeout($.proxy(this._initializeHeightsInternal, this), 1);
			//} else {
			this._initializeHeightsInternal();
			//}
		},
		_initializeHeightsInternal: function () {
			var children, height, i, $child, ch;
			ch = this.container().height();
			this._prevContainerHeight = ch;
			if (this.options.height !== null) {
				children = this.container().children();
				height = 0;
				for (i = 0; i < children.length; i++) {
					$child = $(children[i]);
					// also check for the "excludeFromHeight" attribute. Such elements are filter dropdowns, which are children of the grid container
					// and may appear visible once they are open, but we don't want to include them in any calculations
					if ((($child.attr('id') !== undefined && !$child.attr('id').endsWith('_scroll') && 
							!$child.attr("id").endsWith("_loading")) || !$child.attr('id')) && $child.is(':visible')
							&& $child.data('efh') !== '1') {
						// the caption's table shows height of 0 on all browsers ! 
						if ($child.is('table') && $child.children().first().is('caption')) {
							height += $child.children().first().outerHeight();
						} else {
							height += $child.outerHeight();
						}
					}
				}
				if (height > 0) {
					$('#' + this.element[0].id + '_scroll').height(ch - height);
				}
			}
		},
		_registerAdditionalEvents: function () {
			var css = 'ui-state-hover';
			// hovering (Hot Tracking) and unhovering
			$('#' + this.element[0].id + ' th.ui-state-default').hover(
				function () { $(this).addClass('ui-state-hover'); },
				function () { $(this).removeClass('ui-state-hover'); }
			);
			this.element.bind(this._hovEvts = {
				mousemove: function (e) {
					var par, tag, tr = e.target;
					while (tr) {
						par = tr.parentNode;
						if ((tag = tr.nodeName) === 'TR' && par.nodeName === 'TBODY') {
							break;
						}
						tr = (tag === 'TABLE') ? null : par;
					}
					if (_hovTR !== tr) {
						if (_hovTR) {
							$('td', _hovTR).removeClass(css);
						}
						if (tr) {
							$('td', tr).addClass(css);
						}
						_hovTR = tr;
					}
				},
				mouseleave: function (e) {
					if (_hovTR) {
						$('td', _hovTR).removeClass(css);
						_hovTR = null;
					}
				}
			});
		},
		_renderColgroup: function (table, isHeader) {
		
			var colgroup, i, cols, defWidth = this.options.defaultColumnWidth, colWidth = 0, totalWidth = this.options.width, lastCol, isPercentage = false;
			colgroup = $("<colgroup></colgroup>").prependTo(table);
			cols = this.options.columns;
			// we render colgroup, if there are columns defined and autoGenerateColumns is false
			
			if (defWidth && defWidth.charAt && defWidth.endsWith('%')) {
				isPercentage = true;
			}
			
			for (i = 0; i < cols.length; i++) {
				if (cols[i].width) {
					if (cols[i].width.charAt && cols[i].width.endsWith('%')) {
						isPercentage = true;
					}
					colWidth += parseInt(cols[i].width, 10);
					// special case last col !
					// A.T. fix for bug #69194 
					if (i === cols.length - 1 && isHeader === true && this.options.height && parseInt(this.options.height, 10) > 0 && this.options.showHeader) {
						if (!isPercentage) {
							lastCol = $("<col></col>").appendTo(colgroup).css("width", parseInt(cols[i].width, 10) + this._scrollbarWidth());
							this._lastColWidth = parseInt(cols[i].width, 10);
						} else {
							lastCol = $("<col></col>").appendTo(colgroup).css("width", cols[i].width);
							this._lastColWidth = cols[i].width;					
						}
						this._lastCol = lastCol;
					} else if (this.options.fixedHeaders === false && i === cols.length - 1 && parseInt(this.options.height, 10) > 0 && this.options.showHeader) {
						$("<col></col>").appendTo(colgroup).css("width", cols[i].width).css('padding-right', this._scrollbarWidth());
					} else {
						if (this._virtualColumnCount === undefined && (this.options.virtualization || this.options.columnVirtualization)) {
							this._virtualColumnCount = this.options.width === null ? this.options.columns.length : parseInt(this.options.width, 10) / this._avgColumnWidth();
							this._virtualColumnCount = Math.ceil(this._virtualColumnCount);
						}
						if (this._virtualColumnCount && this._virtualColumnCount < cols.length && i === this._virtualColumnCount - 1 && this.options.showHeader) {
							this._lastCol = $("<col></col>").appendTo(colgroup).css("width", cols[i].width).css('padding-right', this._scrollbarWidth());
							this._lastColWidth = cols[i].width;
						} else {
							$("<col></col>").appendTo(colgroup).css("width", cols[i].width);
						}
					}
				} else {
					colWidth += parseInt(defWidth, 10);
					if (defWidth !== null) {
						if (i === cols.length - 1 && this.options.fixedHeaders === true && isHeader === true && this.options.height && parseInt(this.options.height, 10) > 0) {
							if (!isPercentage) {
								lastCol = $("<col></col>").appendTo(colgroup).css("width", parseInt(defWidth, 10) + this._scrollbarWidth());
								this._lastColWidth = parseInt(defWidth, 10);
							} else {
								lastCol = $("<col></col>").appendTo(colgroup).css("width", defWidth);
								this._lastColWidth = defWidth;							
							}
							this._lastCol = lastCol;
						} else {
							$("<col></col>").appendTo(colgroup).css("width", defWidth);
						}
					} else {
						$("<col></col>").appendTo(colgroup);
					}
				}
			}
			// account for the special case where the grid has a width defined, and width in pixels for every column
			// but the total sum of column widths is less than the width of the grid, then we need to "expand" the last column
			// to fill in the remaining blank space (so that it is not blank)
			if (totalWidth !== null) {
				totalWidth = parseInt(totalWidth, 10);
				if (totalWidth > colWidth) {
					lastCol = colgroup.children().last();
					lastCol.css('width', parseInt(lastCol.css('width'), 10) + totalWidth - colWidth);
				}
			}
		},
		_generateRowTemplate: function () {
			
			var key, type, format, auto = this.options.autoFormat, ar = this.options.accessibilityRendering, firstRec = null, grid = this, i, prop, tmplName,
				tmpl = grid.options.rowTemplate, cols = grid.options.columns;
			
			if (this._tmpl) {
				return this._tmpl;
			}
			if (grid.dataSource.dataView().length > 0) {
				firstRec = grid.dataSource.dataView()[0];
			}
			
			if (tmpl) {
				for (i = 0; i < cols.length; i++) {
					key = cols[i].key;
					if (cols[i].formatter) {
						format = '${$item.' + key + 'Formatter(this.data ? this.data.' + key + ' : undefined)}';
					} else {
						format = cols[i].format;
						type = cols[i].dataType;
						type = (type === 'date' || type === 'number') ? type : '';
						if (format || ((auto === true || auto === 'dateandnumber') && type) || (auto && auto === type)) {
							// possible {0} may raise exception in $.template: replace it by [0] and add check in $.ig.formatter
							format = '${$.ig.formatter(typeof ' + key + ' ==="undefined"?"":' + key + ',"' + type + '","' + (format ? format.replace('{0}', '[0]') : '') + '")}';
						}
					}
					if (format) {
						// patterns: ${key}, $ {key}, ${  key}, etc.
						tmpl = tmpl.replace(new RegExp('\\$ *\\{ *' + key + ' *\\}', 'g'), format);
					}
				}
			} else {
				if (ar) {
					tmpl = '<tr role="row" '; 
				} else {
					tmpl = '<tr ';
				}
				// now that we are not using nth-child, we must make sure we preserve zebra styling 
				//if ($.browser.msie) {
				if (this.options.alternateRowStyles) {
					tmpl += "class=\"${$item.data.ig_zebraStyle % 2 !== 0 ? \'\' : \'" + this.css.recordAltClass + "\' }\">";
				} else {
					tmpl += ">";
				}
				if (cols.length > 0) {
				
					if (firstRec === null || (firstRec.hasOwnProperty(cols[0].key) && $.type(firstRec) !== "array")) {
						for (i = 0; i < cols.length; i++) {
							key = cols[i].key;
							if (ar) {
								tmpl += '<td role=gridcell aria-describedby="' + key + '">'; 
							} else {
								tmpl += '<td>';
							}
							if (cols[i].formatter !== undefined) {
								tmpl += '${$item.' + key + 'Formatter(this.data ? this.data.' + key + ' : undefined)}</td>';
							} else {
								format = cols[i].format;
								type = cols[i].dataType;
								type = (type === 'date' || type === 'number') ? type : '';
								if (format || ((auto === true || auto === 'dateandnumber') && type) || (auto && auto === type)) {
									// possible {0} may raise exception in $.template: replace it by [0] and add check in $.ig.formatter
									tmpl += '${$.ig.formatter(typeof ' + key + ' ==="undefined"?"":' + key + ',"' + type + '","' + (format ? format.replace('{0}', '[0]') : '') + '")}</td>';
								} else if (type === 'bool') {
									tmpl += '${' + key + '}</td>';
								} else {
									tmpl += '${(typeof ' + key + ' =="undefined"||' + key + '==null)?"&nbsp;":' + key + '}</td>';
								}
							}
						}
					// arrays 
					} else {
						tmpl += '{{each $data}}';
						if (ar) {
							tmpl += '<td role="gridcell">${this}</td>';
						} else {
							tmpl += '<td>${this}</td>';
						}
						tmpl += '{{/each}}';
					}
				} else {
					//try to figure it out automatically
					//take the first row, and figure out the template manually
					//if (grid.options.dataSource.length > 0) {
					if (grid.dataSource.dataView().length > 0) {
						for (prop in firstRec) {
							if (firstRec.hasOwnProperty(prop)) {
								if (ar) {
									tmpl += '<td role="gridcell">${' + prop + '}</td>';
								} else {
									tmpl += '<td>${' + prop + '}</td>';
								}
							}
						}
					} else {
						// log an error
						throw new Error($.ig.DataSource.locale.cannotBuildTemplate);
					}
				}
				tmpl += "</tr>";
			}
			tmplName = this.element[0].id + "rowTemplate";
			$.template(tmplName, tmpl);
			this._tmpl = tmpl;
			return tmpl;
		},
	    _renderRecords: function () {
		    var grid = this, tbody = this.element.children("tbody"), tmpl, ds = this.dataSource.dataView(), i, d = [];
			if (!grid.options.jQueryTemplating) {
				$(ds).map(function (i) {
					//var rec;
					//rec = grid._renderRecord(tbody, this, i);
					//if (i % 2 !== 0 && grid.options.alternateRowStyles) {
					//	rec.addClass(grid.css.recordAltClass);
					//}
					d.push(grid._renderRecord(d, tbody, this, i));
				});
				tbody.html(d.join(""));
				d = [];
			} else {
				tmpl = this._generateRowTemplate();
				/*
				if ($.browser.msie) {
					for (i = 0; i < ds.length; i++) {
						ds[i].i = i;
					}
				}
				*/
				if (this.options.alternateRowStyles) {
					for (i = 0; i < ds.length; i++) {
						ds[i].ig_zebraStyle = i;
					}
				}
				$.tmpl(tmpl, ds, this._buildFormatters()).appendTo(tbody);
				
				if (this.options.alternateRowStyles) {
					for (i = 0; i < ds.length; i++) {
						ds[i].ig_zebraStyle = null;
					}
				}
				/*
				if ($.browser.msie) {
					for (i = 0; i < ds.length; i++) {
						ds[i].i = null;
					}
				}
				*/
			}
	    },
		_buildFormatters: function () {
			var i, cols = this.options.columns, ret = {};
			for (i = 0; i < cols.length; i++) {
				if (cols[i].formatter !== undefined) {
					if ($.type(cols[i].formatter) === "function") {
						ret[cols[i].key + 'Formatter'] = cols[i].formatter;
					} else {
						ret[cols[i].key + 'Formatter'] = eval(cols[i].formatter);
					}
				}
			}
			return ret;
		},
	    _renderVirtualRecords: function () {
		    var i, j, tmpl, row, c, val, headersTexts;

		    if (this._startRowIndex === undefined || this._startRowIndex === null) {
                this._startRowIndex = 0;
            }
		    if (this._startColIndex === undefined || this._startColIndex === null) {
                this._startColIndex = 0;
            }
		    if (this._virtualDom === null || this._virtualDom === undefined) {
			    this._buildVirtualDom();
				if (this.options.adjustVirtualHeights === true) {
					this._adjustVirtualHeights();
				}
		    } else {
				tmpl =  this._generateRowTemplate();
				//this._adjustVirtualHeights();
			    for (i = 0; i < this._virtualRowCount && i < this._totalRowCount; i++) {
					if (this.options.jQueryTemplating === false) {
						for (j = 0; j < this._virtualColumnCount; j++) {
							if (this.options.columns.length > 0) {
								val = this.dataSource.dataView()[this._startRowIndex + i][this.options.columns[this._startColIndex + j].key];
								this._virtualDom[i][j].innerHTML = this._renderCell(val, this.options.columns[this._startColIndex + j]);
							} else {
								val = this.dataSource.dataView()[this._startRowIndex + i][this._startColIndex + j];
								this._virtualDom[i][j].innerHTML = this.dataSource.dataView()[this._startRowIndex + i][this._startColIndex + j];
							}
							this._virtualDom[i][j].className = '';
						}
					} else {
						if ($.type(this.dataSource.dataView()[i]) === "array") {
							row = $.tmpl(tmpl, [this.dataSource.dataView()[this._startRowIndex + i]], this._buildFormatters());
						} else {
							row = $.tmpl(tmpl, this.dataSource.dataView()[this._startRowIndex + i], this._buildFormatters());
						}
						// loop through cells
						c = row.children();
						//for (j = 0; j < c.length; j++) {
						for (j = 0; j < this._virtualColumnCount; j++) {
							this._virtualDom[i][j].innerHTML = c[j + this._startColIndex].innerHTML;
							// reset classes
							//$(this._virtualDom[i][j]).attr('class', '');
							this._virtualDom[i][j].className = '';
						}
					}
					this._virtualDom[i][0].parentNode.className = (i % 2 === 0 && this.options.alternateRowStyles) ? 'ui-iggrid-virtualrow ui-ig-altrecord' : 'ui-iggrid-virtualrow';
			    }
				// make sure to update the headers , too.
				if (this._isHorizontal) {
					if ((this.options.virtualization === true || this.options.columnVirtualization === true) && parseInt(this.options.width, 10) > 0) {
						if (!this._vheaders) {
							headersTexts = this.element.find('thead > tr > th > a > span:first-child');
							if (headersTexts.length > 0) {
								this._vheaders = headersTexts;
							} else {
								this._vheaders = this.element.find('thead > tr > th > span');
							}
						}
						for (j = 0; j < this._virtualColumnCount; j++) {
							this._vheaders[j].innerHTML = this.options.columns[j + this._startColIndex].headerText;
						}
					}
				}
		    }
			// trigger event so that features such as selection can apply the selection
			this._trigger('virtualrecordsrender', null, {dom: this._virtualDom});
	    },
	    _buildVirtualDom: function () {
            var grid = this, markup = '', row, i, j, dataLinkFn, ar = this.options.accessibilityRendering, tmpl, shouldHide = false, c, tmpRow;
			if (this._startRowIndex === undefined || this._startRowIndex === null) {
				this._startRowIndex = 0;
				this._startColIndex = 0;
				this._oldStartRowIndex = 0;
				this._oldStartColIndex = 0;
			}
		    this._virtualDom = [];
		    this._totalRowCount = this.dataSource.dataView().length;
			if (this.options.height === null) {
				this._virtualRowCount = this._totalRowCount;
			} else {
				this._virtualRowCount = parseInt(this.options.height, 10) / parseInt(this.options.avgRowHeight, 10);
			}
		    this._totalColumnCount = this.options.columns ? this.options.columns.length : this.dataSource.dataView()[0].length;
			if (this.options.columnVirtualization === false && this.options.virtualization === false) {
				this._virtualColumnCount = this.options.columns.length;
			} else {
				this._virtualColumnCount = this.options.width === null ? this.options.columns.length : parseInt(this.options.width, 10) / this._avgColumnWidth();
				this._virtualColumnCount = Math.ceil(this._virtualColumnCount);
			}
			if (this.options.height !== null) {
				$('#' + this.element[0].id + '_scrollContainer').children().first().height(this._totalRowCount * parseInt(this.options.avgRowHeight, 10));
			}
			dataLinkFn = function (row, i, vc) {
				var j;
				//$(row).children().each(function (col) {
					//$(this).data('row', i).data('col', col);
					// link references 
				//for (j = grid._startColIndex; j < vc + grid._startColIndex; j++) {
				for (j = 0; j < vc; j++) {
					if (j < grid._totalColumnCount) {
						grid._virtualDom[i][j] = row[0].cells[j];
					}
				}
				//});
			};
			
			tmpl =  this._generateRowTemplate();
			this.element.children('tbody').empty();

		    for (i = 0; i < this._virtualRowCount; i++) {
				shouldHide = false;
			    this._virtualDom[i] = [];
				markup = '';
				if (!this.options.jQueryTemplating) {
					for (j = this._startColIndex; j < this._virtualColumnCount + this._startColIndex; j++) {
						if (j >= this._totalColumnCount) {
							break;
						}
						if (ar) {
							markup += '<td role="gridcell" ';
						} else {
							markup += '<td ';
						}
						if (this.options.columns.length > 0) {
							if (ar) {
								markup += 'aria-describedby="' + this.options.columns[j].key + '">';
							} else {
								markup += '>';
							}
							if (!this.dataSource.dataView()[i]) {
								shouldHide = true;
							} else {
								if (this.options.autoFormat !== false) {
									markup += this._renderCell(this.dataSource.dataView()[i][this.options.columns[j].key], this.options.columns[j]) + '</td>';
								} else {
									markup += this.dataSource.dataView()[i][this.options.columns[j].key] + '</td>';
								}
							}
						} else {
							if (!this.dataSource.dataView()[i]) {
								shouldHide = true;
							} else {
								markup += this.dataSource.dataView()[i][j] + '</td>';
							}
						}
					}
					row = $('<tr>' + markup + '</tr>').appendTo(this.element.children('tbody'));
					if (shouldHide) {
						row.css('visibility', 'hidden');
					}
					if (i % 2 === 0 && this.options.alternateRowStyles) {
						row.addClass('ui-ig-altrecord');
					}
				} else {
					if ($.type(this.dataSource.dataView()[i]) === "array") {
						row = $.tmpl(tmpl, [this.dataSource.dataView()[i]], this._buildFormatters()).appendTo(this.element.children('tbody'));
					} else {
						row = $.tmpl(tmpl, this.dataSource.dataView()[i], this._buildFormatters());
						if ((this.options.virtualization === true || this.options.columnVirtualization === true) && parseInt(this.options.width, 10) > 0) {
							// only append the right number of TDs
							tmpRow = $('<tr></tr>').appendTo(this.element.children('tbody'));
							for (c = 0; c < this._virtualColumnCount; c++) {
								$(row[0].cells[c]).clone().appendTo(tmpRow);
							}
							row = tmpRow;
						} else {
							this.element.children('tbody').append(row);
						}
					}
					if (!this.dataSource.dataView()[i]) {
						row.css('visibility', 'hidden');
					}
				}
				row.addClass('ui-iggrid-virtualrow');
				if (i % 2 === 0 && this.options.alternateRowStyles) {
					row.addClass('ui-ig-altrecord');
				}
				if (ar) {
					row.attr('role', 'row');
				}
				dataLinkFn(row, i, this._virtualColumnCount);
		    }
	    },
		_adjustVirtualHeights: function () {
			var c = $('#' + this.element[0].id + '_displayContainer'), tbody = c.find('tbody'), h = tbody.children().first().height();
			if (this.options.height === null) {
				return;
			}
			// 1. adjust avgRowHeight
			if (this.options.avgRowHeight !== h) {
				this.options.avgRowHeight = h;
				// adjust the first child of the scroll container
				//$('#' + this.element[0].id + '_scrollContainer').children().first().height(this._totalRecordsCount * this.options.avgRowHeight);
				// recalc
				//this._virtualRowCount = parseInt(this.options.height, 10) / parseInt(this.options.avgRowHeight, 10);
				this._buildVirtualDom();
			}
		},
		_verticalScroller: function () {
			if (!this._verticalScrollerObj) {
				this._verticalScrollerObj = $('#' + this.element[0].id + '_scrollContainer').children().first();
			}
			return this._verticalScrollerObj;
		},
		// calculates the average column width. This is needed for horizontal virtual scrolling where we need to determine 
		// the visible virtual columns
		_avgColumnWidth: function () {
			var width = 0, cols = this.options.columns, count = cols.length, def = this.options.defaultColumnWidth, i;

			if (this.options.avgColumnWidth !== null) {
				return parseInt(this.options.avgColumnWidth, 10);
			}
			for (i = 0; i < count; i++) {
				width += parseInt(cols[i].width, 10);
			}
			if ((count === 0 || isNaN(width)) && def) {
				return parseInt(def, 10);
			} else if (count > 0 && this.options.autoGenerateColumns && isNaN(width)) {
				if (this.options.width === null || this.options.width === undefined) {
					throw new Error($.ig.DataSource.locale.columnVirtualizationRequiresWidth);
				} else {
					return parseInt(this.options.width, 10) / count;
				}
			} else {
				if (width === 0 || (width < def)) {
					return def;
				} else {
					return width / count;
				}
			}
		},
		_scrollHeader: function () {
			// move the fixed header when the grid scrolling DIV moves
			var scrollContainer = $('#' + this.element[0].id + '_scroll'), headers = $('#' + this.element[0].id + '_headers').parent();
			headers.scrollLeft(scrollContainer.scrollLeft());
		},
		_renderCaption: function () {
			if (this.options.caption !== null) {
				if (this.container().find('.ui-iggrid-headercaption').length > 0) {
					return;
				}
				if (this.options.fixedHeaders === true && this.options.showHeader === true) {
					$('<caption></caption>').prependTo(this.headersTable()).text(this.options.caption).attr('id', this.element[0].id + '_caption').addClass(this.css.gridHeaderCaptionClass);
				} else {
					// we need to render the caption in a separate table, which will be a first child of grid's container. otherwise won't stick.
					// also if there are no headers, we need to have some table to put the caption in :)
					$('<caption></caption>').appendTo($('<table></table>').prependTo(this.container()).css('width', '100%').addClass(this.css.captionTable)).text(this.options.caption).attr('id', this.element[0].id + '_caption').addClass(this.css.gridHeaderCaptionClass);
				}
			}
		},
	    _renderHeader: function () {
            var header, grid = this, id, headerClass, markup, headerDom, headerMarkup = "",
				scrollc = this.scrollContainer(),
				noCancel = true,
				headerCell,
				headerParent = this.element[0], width, ar = this.options.accessibilityRendering,
				headerText,
				totalHeadersWidth = 0,
				usingPercent = false,
				m,
				headerScrollDiv;
			
			noCancel = this._trigger(this.events.headerRendering, null, {owner: this});
			
			if (noCancel) {
				id = this.element[0].id;
				// in order to have fixed headers, we must have a height set at least 
				headerMarkup = "<thead><tr></tr></thead>";
				
				headerParent = this.container();
				width = scrollc.css('width');
				if (this.options.showHeader && this.options.fixedHeaders && this.options.height !== null) {
					// set header parent
					if (this.options.virtualization !== true) {
						if (headerParent.length === 0) {
							scrollc.removeClass(this.css.gridClasses).removeClass(this.css.baseClasses).css('width', '').wrap("<div id='" + id + "_container'></div>");
							headerParent = $('#' + id + '_container').addClass(this.css.baseClasses).addClass(this.css.gridClasses).css('width', width);
							this._isWrapped = true;
						}
					} else {
						// virtualization
						headerParent = $('#' + id + '_headers_v').css('width', width);
						//headerParent = $('#' + id + '_headers').css('width', width);
					}
					headerParent = $("<table id='" + id + "_headers'></table>").prependTo(headerParent).addClass(this.css.gridHeaderTableClass).attr('cellpadding', 0).attr('cellspacing', 0).attr('border', '0');
					if (this.options.virtualization !== true && this.options.rowVirtualization !== true && this.options.columnVirtualization !== true) {
						// the fixed headers table should be inside another scrolling div
						headerScrollDiv = $("<div></div>").prependTo(headerParent.parent());
						headerScrollDiv.css('overflow', 'hidden').css('position', 'relative');
						headerScrollDiv.append(headerParent);
						// now attach a handler on the grid scrolling container
						this.element.parent().bind("scroll", $.proxy(this._scrollHeader, this));
					}
					this._renderColgroup(headerParent, true);
				} else if (this.options.fixedHeaders !== true && this.options.showHeader) {
					headerParent = this.element;
				}
				// no scrolling
				if (this.options.width === null && this.options.height === null) {
					headerParent = this.element;
				}
				if (this.options.width !== null && this.options.height === null) {
					scrollc.css('overflow-y', 'hidden').css('overflow-x', 'auto');
					headerParent = this.element;
				}
				if (this.options.showHeader) {
					if (this.options.headerTemplate === null || this.options.headerTemplate === undefined) {
						if (this.options.virtualization === true || this.options.rowVirtualization === true) {
							//append headers to the topmost table, so that they are fixed 
							$('#' + id + '_headers_v').addClass(this.css.gridClasses).addClass(this.css.baseClasses);
							//$('#' + id + '_headers').addClass(this.css.gridClasses).addClass(this.css.baseClasses);
							headerParent.addClass(this.css.gridHeaderTableClass).attr('cellpadding', 0).attr('cellspacing', 0).attr('border', '0');
						}
						header = $(headerMarkup).appendTo(headerParent).children().first();
						headerClass = this.css.headerClass;
						// render header with the column names , if they are not defined, leave it empty 
						$(this.options.columns).map(function (i) {
							headerText = '<span>' + this.headerText + '</span>';
							markup = '<th></th>';
							m = this.width === undefined ? (grid.options.defaultColumnWidth === null ? this.width : grid.options.defaultColumnWidth) : this.width;
							if (this.key) {
								if (ar) {
									headerCell = $(markup).appendTo(header).attr('id', grid.element[0].id + '_' + this.key).attr('role', 'rowheader').addClass(headerClass).data('columnIndex', i);
								} else {
									headerCell = $(markup).appendTo(header).attr('id', grid.element[0].id + '_' + this.key).addClass(headerClass).data('columnIndex', i);
								}
								// set text
								$(headerText).appendTo(headerCell).addClass(grid.css.headerTextClass);
								
								if (i === grid.options.columns.length - 1 && grid.options.height && parseInt(grid.options.height, 10) > 0) {
									if (m && m.charAt && m.endsWith('%')) {
										usingPercent = true;
										headerCell.css('width', m);
									} else {
										if (grid.options.fixedHeaders === false && grid.options.showHeader) {
											headerCell.css('width', m).css('padding-right', grid._scrollbarWidth());
										} else {
											headerCell.css('width', parseInt(m, 10) + grid._scrollbarWidth());
										}
									}
									totalHeadersWidth += grid._scrollbarWidth();
								} else {

									if (grid._virtualColumnCount && grid._virtualColumnCount < grid.options.columns.length && i === grid._virtualColumnCount - 1 && grid.options.showHeader) {
										headerCell.css('width', m).css('padding-right', grid._scrollbarWidth());
									} else {
										headerCell.css('width', m);
									}
								}
								if (m !== null && m !== undefined && m !== "") {
									totalHeadersWidth += parseInt(m, 10);
								}
								grid._trigger(grid.events.headerCellRendered, null, {owner: grid, th: headerCell, columnKey: this.key});
							}
						});
						//A.T. commenting since it's already handled in CSS
						/*
						// set width for the headers table 
						if (this.options.width !== null && this.options.fixedHeaders === true && 
								((this.options.width.indexOf && this.options.width.indexOf('%') === -1) || !this.options.width.indexOf)) {
							if (totalHeadersWidth > parseInt(this.options.width, 10)) {
								headerParent.css('width', totalHeadersWidth);
							} else {
								headerParent.css('width', this.options.width);
							}
						}
						*/
					} else {
						// check if there is a user defined template
						// the header template DOES NOT use jQuery templating, it's plain HTML with the actual column text there. 
						headerDom = this.options.headerTemplate;
						if (this.options.virtualization === true || this.options.rowVirtualization === true) {
							$(headerDom).children().map(function () {
								this.appendTo('#' + id + '_headers');
							});
							header = $('#' + id + '_headers').addClass(this.css.gridClasses);
						} else {
							header = $(headerMarkup).appendTo(headerParent).append(headerDom);
						}
					}
				}
				this._headerParent = headerParent;
				if (parseInt(this.options.height, 10) > 0 && this.options.fixedHeaders === true && (usingPercent === true || !m) && this.options.showHeader) {
					headerParent.css('padding-right', this._scrollbarWidth).addClass('ui-widget-header').css('border-width', 0);
				} 
				this._trigger(this.events.headerRendered, null, {owner: this});
			}
	    },
	    _renderFooter: function () {
	
	    },
	    _renderRecord: function (darr, tbody, data, rowIndex) {
		    // generate a Tr and append it to the table
		    var i, key, ar = this.options.accessibilityRendering, grid = this, appendBehavior = false;
			if (darr === null) {
				darr = [];
				appendBehavior = true;
			}
			if (rowIndex % 2 !== 0 && this.options.alternateRowStyles) {
				darr.push('<tr class="' + grid.css.recordAltClass + '"');
			} else {
				darr.push('<tr');
			}
			if (ar) {
				darr.push(' role="row">');
			} else {
				darr.push('>');
			}
			if (this.options.columns.length > 0) {
			    $(this.options.columns).map(function (colIndex) {
					if (ar) {
						darr.push('<td role="gridcell" aria-describedby="' + this.key + '">');
					} else {
						darr.push('<td>');
					}
					if (data[this.key] === undefined) {
						darr.push(grid._renderCell(data[colIndex], this));
						darr.push('</td>');
					} else {
						darr.push(grid._renderCell(data[this.key], this));
						darr.push('</td>');
					}
				});
			} else {
				// check if array
				if ($.type(data) === "array") {
					for (i = 0; i < data.length; i++) {
						if (ar) {
							darr.push('<td role="gridcell">' + data[i] + '</td>');
						} else {
							darr.push('<td>');
							darr.push(data[i]);
							darr.push('</td>');
						}
					}
				} else {
					for (key in data) {
						if (data.hasOwnProperty(key)) {
							if (ar) {
								darr.push('<td role="gridcell" aria-describedby="' + key + '">' + data[key] + '</td>'); 
							} else {
								darr.push('<td>');
								darr.push(data[key]);
								darr.push('</td>'); 
							}
						}
					}
				}
			}
			//noCancel = this._trigger(this.events.rowRendering, null, {owner: this, 'tableBody' : tbody, 'rowIndex' : rowIndex});
			
			//if (noCancel) {
			//row = $('<tr></tr>').appendTo(tbody);
			//if (ar) {
			//	row.attr('role', 'row');
			//}
			/*
			if ($.isFunction(this.options.onRowContainerRendered)) {
				p = this.element.data('path');
				if (p) {
					p += "/" + cb + ":" + data[this.options.primaryKey];
				} else {
					p = "/root:" + data[this.options.primaryKey];
				}
				this.options.onRowContainerRendered(this, {'sender': this, 'row' : row, 'rowIndex': rowIndex, 'rowKey': data[this.options.primaryKey], 'path': p});
			}
			*/
			//row.append(markup);
			//this._trigger(this.events.rowRendered, null, {owner: this, 'tableBody' : tbody, 'row' : row, 'rowIndex' : rowIndex});
			//return row;
			darr.push('</tr>');
			//}
			if (appendBehavior) {
				tbody.append(darr.join(''));
			}
	    },
		// handles formatting
	    _renderCell: function (val, col) {
			var type = col.dataType, format = col.format, auto = this.options.autoFormat;
			if (col.formatter) {
				return col.formatter(val);
			}
			type = (type === 'date' || type === 'number') ? type : '';
			if (format || ((auto === true || auto === 'dateandnumber') && type) || (auto && auto === type)) {
				return $.ig.formatter(val, type, format);
			}
			return (val || val === 0 || val === false) ? val : '&nbsp;';
	    },
	    // cross-browser calculation to check for the scrollbar width. we need this when creating the virtualization-enabled grid's layout 
	    _scrollbarWidth: function () {
		    if (!this._scrollbarWidthResolved) {
			    var $div = $('<div />').css({ width: 50, height: 50, overflow: 'auto', position: 'absolute', top: -500, left: -500 }).prependTo('body')
					.append('<div />').find('div').css({ width: '100%', height: 100 });
			    this._scrollbarWidthResolved =  50 - $div.width();
			    $div.parent().remove();
		    }
		    return this._scrollbarWidthResolved;
	    },
		_fireInternalEvent: function (name, args) {
			var i, f, featureName;
			for (i = 0; i < this.options.features.length; i++) {
				f = this.options.features[i];
				if (f !== undefined && f !== null && f.name !== undefined) {
					featureName = 'igGrid' + f.name;
					if (this.element.data(featureName)[name]) {
						if (args) {
							this.element.data(featureName)[name](args);
						} else {
							this.element.data(featureName)[name]();
						}
					}
				}
			}
		},
	    _initFeature: function (featureObject, dataOptions, destroy) {
		    if (!featureObject) {
			    return;
            }
		    // construct widget name
			if (featureObject.name === undefined) {
				return;
			}
		    var widget = 'igGrid' + featureObject.name;
			// validate widget
			if ($.type($('#' + this.element[0].id)[widget]) !== "function") {
				throw new Error($.ig.Grid.locale.noSuchWidget + ' ' + widget);
			}
			// instantiate widget
			//A.T. 4 Jan 2011
			$('#' + this.element[0].id)[widget]('destroy');
			$('#' + this.element[0].id)[widget](featureObject);
		    this.element.data(widget)._injectGrid(this);
	    },
		_initFeatureSettings: function (featureObject) {
		    if (!featureObject) {
			    return;
            }
		    // construct widget name
			if (featureObject.name === undefined) {
				return;
			}
		    var widget = 'igGrid' + featureObject.name;
			// validate widget
			if ($.type($('#' + this.element[0].id)[widget]) !== "function") {
				throw new Error($.ig.Grid.locale.noSuchWidget + ' ' + widget);
			}
		    this.element.data(widget)._injectGrid(this, true);
	    },
		_onFeaturesSoftDirty: function (e, args) {
			var i, feature;
			if (args.owner.options.type !== 'remote') {
				return;
			}
			for (i = 0; i < this.options.features.length; i++) {
				feature = $('#' + this.element[0].id).data('igGrid' + this.options.features[i].name);
				if (feature && feature !== args.owner && feature.options && feature.options.type === 'local') {
					if (feature._onUIDirty && $.type(feature._onUIDirty) === 'function') {
						feature._onUIDirty(e, args);
					}
				}
			}
		},
	    destroy: function () {
			// destroy is part of the jQuery UI widget API and does the following:
			// 1. remove custom CSS classes that were added
			// 2. unwrap any wrapping elements such as scrolling divs and other containers
			// 3. unbind all events that were bound 
			// we need to make sure we check if the element has siblings, if it doesn't we append the actual this.element to its parent
			// this is necessary to return everything exactly to its previous state in the DOM tree
			var prev = this.container().prev();
			if (prev.length === 0) {
				prev = this.container().parent();
			}
			prev.append(this.element);
			this.element.find('thead').empty();
			this.element.find('colgroup').empty();
			//A.T. 19 Feb 2011 - fix for bug #66088
			// call remove() on the children of the container instead of the container directly because this will automatically call destroy again
			// resulting in too much recursion error message 
			$.Widget.prototype.destroy.call(this);
			this.container().remove();
			// now empty the records
			this.element.find('tbody').empty().removeClass(this.css.gridTableBodyClass).removeClass(this.css.gridRecordClass);
			this.element.removeClass(this.css.gridTableClass);
			
			this.element.unbind('iggriduisoftdirty', this._uiSoftDirtyHandler);
			// clear reisizing timeout
			if (this._resId) {
				clearInterval(this._resId);
			}
			return this;
	    }
    });
    $.extend($.ui.igGrid, {version: '11.1.20111.1014'});
}(jQuery));

/*
 * Infragistics.Web.ClientUI Grid Selection (and Keyboard navigation) 11.1.20111.1014
 *
 * Copyright (c) 2011 Infragistics Inc.
 * <Licensing info>
 *
 * http://www.infragistics.com/
 *
 * Depends on:
 * Depends on:
 *  jquery-1.4.4.js
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	ig.ui.grid.framework.js
 *  ig.ui.shared.js
 *  ig.dataSource.js
 *	ig.util.js
 */
 
/*global jQuery Class */
if (typeof (jQuery) === "undefined") {
    throw new Error("The Infragistics Grid Selection feature requires jQuery to be loaded");
}

(function ($) {
	/* Grid selection jQuery UI widget */
    $.widget("ui.igGridSelection", {
		/* the instance of the grid to which this feature is going to attach its functionality */
		grid: null,
		css: {
			/* classes applied to a cell once it's selected */
			selectedCell: "ui-iggrid-selectedcell ui-state-active",
			/* classes applied to a row once it's selected */
			selectedRow: "ui-iggrid-selectedrow ui-state-active",
			//selectedHeader: "ui-iggrid-selectedheader ui-state-active", // for columns
			/* classes applied to the currently active cell, if any (mode = "cell") */
			activeCell: "ui-iggrid-activecell ui-state-focus",
			/* classes applied to the currently active row, if any (mode = "row") */
			activeRow: "ui-iggrid-activerow ui-state-focus"
		},
		options: {
			/* type="bool" Enables / Disables multiple selection of cells and rows - depending on the mode */
			multipleSelection: false,
			/* type="bool" Enables / disables selection via dragging with the mouse - only applicable for cell selection */
			mouseDragSelect: true,
			/* type="row|cell" type of selection. */
			mode: 'row',
			/* type="bool" Enables / disables activation of rows and cells. Activation implies ability to perform navigating through cells and rows via the keyboard, and selecting rows and cells using CTRL / SHIFT - in the way cells/rows are selected in Ms Excel */
			activation: true,
			/* type="bool" if wrapAround is enabled and selection is on the first or last row or cell, then when the end user tries to go beyond that, the first/last row or cell will be selected */
			wrapAround: true
		},
		events: {
			/* cancel="true" fired before a row or more is about to be selected, cancellable */
			rowSelectionChanging: "rowSelectionChanging",
			/* fired after row(s) are selected */
			rowSelectionChanged: "rowSelectionChanged",
			/* cancel="true" fired before cell(s) are about to be selected, cancellable */
			cellSelectionChanging: "cellSelectionChanging",
			/* cancel="true" fired after cell(s) are selected */
			cellSelectionChanged: "cellSelectionChanged",
			/* cancel="true" fired before a cell is active (focus style applied) (cancellable) */
			activeCellChanging: "activeCellChanging",
			/* fired after a cell becomes active (focus style applied) */
			activeCellChanged: "activeCellChanged",
			/* cancel="true" fired before a row is active (focus style applied) (cancellable) */
			activeRowChanging: "activeRowChanging",
			/* fired after a row becomes active (focus style applied) */
			activeRowChanged: "activeRowChanged"
		},
		_create: function () {
			this._isMouseDown = false;
			this._isDrag = false;
			this._registeredEvents = false;
		},
		_setOption: function (key, value) {
			// handle new settings and update options hash
			$.Widget.prototype._setOption.apply(this, arguments);
			// throw an error for the options that cannot be changed after the widget has been created
			if (key === 'mode') {
				throw new Error($.ig.Grid.locale.optionChangeNotSupported + ' ' + key);
			}
		},
		_dataRendered: function () {
			if (!this._registeredEvents) {
				this._registerEvents();
				this._registeredEvents = true;
			} else {
				this._registerTbodyEvents();
			}
			this._refresh(true);
			// if selectedRowIndex and selectedCellIndex are defined, select them (initial programmatic selection)
			if (!this._initialSelectionInitialized) {
				if (this.options.selectedRowIndex !== undefined && this.options.selectedRowIndex !== null && this.options.selectedRowIndex >= 0) {
				
					if (this.options.selectedCellIndex === undefined) {
						this.selectRow(this.options.selectedRowIndex);
					} else if (this.options.selectedCellIndex !== undefined && this.options.selectedRowIndex !== null && this.options.selectedCellIndex >= 0) {
						this.selectCell(this.options.selectedRowIndex, this.options.selectedCellIndex);
					}
				}
				this._initialSelectionInitialized = true;
			}
		},
		_refresh: function (init) {
			if (!init || !this._firstCell) {
				this._firstCell = this.grid.element.find('tbody tr:nth-child(1) td:nth-child(1)');
				if (!this._firstCell) {
					this._firstRow = this.grid.element.find('tbody tr:nth-child(1)');
				}
			}
			if (!init || !this._firstRow || !this._rowCount) {
				this._firstRow = this.grid.element.find('tbody tr:nth-child(1)');
				if (this.grid.options.virtualization || this.grid.options.rowVirtualization) {
					this._rowCount = this.grid.dataSource.dataView().length;
				} else {
					this._rowCount = this.grid.element.find('tbody tr').length;
				}
				this._length = this._firstRow ? this._firstRow.children().length : 0;
			}
		},
		_registerTbodyEvents: function () {
		
			this._mouseDownHandler = $.proxy(this._mouseDown, this);
			this._selectStartHandler = $.proxy(this._selectStart, this);
			this._mouseMoveHandler = $.proxy(this._dragSelectChange, this);
			this._mouseUpHandler = $.proxy(this._selectInternal, this);
			
			this.grid.element.find('tbody').bind({
				mousedown: this._mouseDownHandler,
				selectstart: this._selectStartHandler,
				mousemove: this._mouseMoveHandler,
				mouseup: this._mouseUpHandler
			});
		},
		_registerEvents: function () {
			
			this._registerTbodyEvents();
			
			$(document).bind({
				mouseup: $.proxy(this._releaseMouse, this)
			});
			
			if (this.grid.options.virtualization) {
				$('#' + this.grid.element[0].id + '_scrollContainer').bind({
					scroll: $.proxy(this._releaseMouse, this)
				});
			} else {
				$('#' + this.grid.element[0].id + '_scroll').bind({
					scroll: $.proxy(this._releaseMouse, this)
				});
			}
			
			this._keyDownHandler = $.proxy(this._navigate, this);
			this._focusHandler = $.proxy(this._navigateFocus, this);
			this._markMouseDownHandler = $.proxy(this._markMouseDown, this);
			
			if (this.grid.options.virtualization || this.grid.options.rowVirtualization) {
				$('#' + this.grid.element[0].id + '_displayContainer_a').bind({
					keydown: this._keyDownHandler,
					focus: this._focusHandler
				//	mousedown: this._markMouseDownHandler
				});	
			} else {
				this.grid.container().bind({
					keydown: this._keyDownHandler,
					focus: this._focusHandler
				//	mousedown: this._markMouseDownHandler
				});
			}
			if (this.options.multipleSelection === true) {
				this.grid.element.addClass('ui-iggrid-canceltextselection');
			}
		},
		_unregisterEvents: function () {
			this.grid.element.unbind('mousedown', this._mouseDownHandler);
			this.grid.element.unbind('selectstart', this._selectStartHandler);
			this.grid.element.unbind('mousemove', this._mouseMoveHandler);
			this.grid.element.unbind('mouseup', this._mouseUpHandler);
			
			this.grid.container().unbind('keydown', this._keyDownHandlerHandler);
			this.grid.container().unbind('focus', this._focusHandler);
			this.grid.container().unbind('mousedown', this._markMouseDownHandler);
			
			this.grid.element.unbind('iggriduisoftdirty', this._uiDirtyHandler);
			//this.grid.element.unbind('iggriduidirty', this._uiDirtyHandler);
			delete this._uiDirtyHandler;
			
			this.grid.element.removeClass('ui-iggrid-canceltextselection');
		},
		_dragSelectChange: function (event) {
		
			var selectedCells = [], startRowIndex, startColIndex, endRowIndex, endColIndex, i, j,
				currentCell, tmp, cell, noCancel = true, v = this.grid.options.virtualization || this.grid.options.rowVirtualization;

			if (event && this._suspend) {
				return;
			}
			if (this.options.mouseDragSelect === false || this.options.multipleSelection === false || this.options.mode === 'row') {
				return;
			}
			if (this._isMouseDown === true) {
				this._isDrag = true;
			} else {
				return;
			}
			// check if dragging
			if (this._isMouseDown !== true || this.options.mode !== 'cell') {
				return;
			}
			currentCell = this._cellFromEvent(event);
			if (!currentCell) {
				return;
			}
			if (currentCell && this.grid._activeCell && currentCell.index === this.grid._activeCell.index && currentCell.rowIndex === this.grid._activeCell.rowIndex) {
				return;
			}
			noCancel = this._trigger(this.events.cellSelectionChanging, event, {cell: currentCell, selectedCells: this.grid._selectedCells, owner: this, manual: false});
			if (noCancel) {
			
				// activate the cell
				if (this.options.activation === true) {
					this._activateCell(currentCell, event);
				}
				startRowIndex = this._firstDragCell.rowIndex;
				startColIndex = this._firstDragCell.index;
				endRowIndex = currentCell.rowIndex;
				endColIndex = currentCell.index;
				
				if (endRowIndex < startRowIndex) {
					tmp = startRowIndex;
					startRowIndex = endRowIndex;
					endRowIndex = tmp;
				}
				
				if (endColIndex < startColIndex) {
					tmp = startColIndex;
					startColIndex = endColIndex;
					endColIndex = tmp;
				}
				
				// A.T. Fix for bug #73402
				// A.T. should call clear selection here
				this.clearSelection(true);
				/*
				for (i = 0; i < this.grid._selectedCells.length; i++) {
					this.grid._selectedCells[i].element.removeClass(this.css.selectedCell);
				}
				this.grid._selectedCells = [];
				*/
				if (v) {
					startRowIndex -= this.grid._startRowIndex;
					endRowIndex -= this.grid._startRowIndex;
				}
				for (i = startRowIndex; i <= endRowIndex; i++) {
					for (j = startColIndex; j <= endColIndex; j++) {
						cell = $(this.grid.cellAt(j, i)).addClass(this.css.selectedCell);
						this.grid._selectedCells.push(this._cellFromElement(cell, i + this.grid._startRowIndex, j));
					}
				}
				// fire Selection Changed 
				this._currentCells = selectedCells;
				this._trigger(this.events.cellSelectionChanged, event, {cell: currentCell, selectedCells: this.grid._selectedCells, owner: this, manual: false});
			}
		},
		_cellFromEvent: function (event) {
			var target, $target;
			$target = $(event.originalEvent.originalTarget ? event.originalEvent.originalTarget : event.originalEvent.srcElement);
			target = $target.is('td') ? $target[0] : $target.closest('td')[0];
			return this._cellFromElement(target);
		},
		_cellFromElement: function (e, row, col) {
			var $target, parent, parentIndex, cellIndex, key;
			$target = $(e);
			parent = $target.parent();
			if (row === undefined || col === undefined) {
				cellIndex = $target.index();
				parentIndex = parent.index();
				// virtualization fix
				if (this.grid.options.virtualization || this.grid.options.rowVirtualization || this.grid.options.columnVirtualization) {
					if (this.grid._startRowIndex > 0) {
						parentIndex += this.grid._startRowIndex;
					}
					if (this.grid._startColIndex > 0) {
						cellIndex += this.grid._startColIndex;
					}
				}
			} else {
				cellIndex = col;
				parentIndex = row;
			}
			if (cellIndex === -1) {
				return;
			}
			key = this.grid.options.columns.length > 0 ? this.grid.options.columns[cellIndex].key : null;
			return {element: $target, row: parent, index: cellIndex, rowIndex: parentIndex, columnKey: key};
		},
		_mouseDown: function (event) {
			var v = (this.grid.options.virtualization || this.grid.options.rowVirtualization || this.grid.options.columnVirtualization);
			if (event && this._suspend) {
				return;
			}
			if (event.which === 2) {
				return; // middle mouse button was clicked, so we don't want to do anything in that case
			}

			this._isMouseDown = true;
			if (this.options.multipleSelection === false && v) {
				$('#' + this.grid.element[0].id + '_displayContainer_a').focus();
			}
			
			if (this.options.mouseDragSelect === false || this.options.multipleSelection === false) {
				if (this.grid.options.virtualization || this.grid.options.rowVirtualization) {
					return false;
				} else {
					return;
				}
			}
			// save mouse coordinates
			this._mouseLocation = {clientX: event.clientX, clientY: event.clientY};
			
			this._firstDragCell = this._cellFromEvent(event);
			
			if (!event.ctrlKey && !event.shiftKey && this.options.multipleSelection !== true) {
				this.clearSelection(true);
			}
			this._isInternalFocus = true;
			// focus the grid container element
			if (this.options.multipleSelection === true && v) {
				$('#' + this.grid.element[0].id + '_displayContainer_a').focus();
			} else {
				this.grid.container().focus();
			}
			event.stopPropagation();
			event.preventDefault();
		},
		_markMouseDown: function (event) {
			this._isMouseDown = true;
		},
		_selectStart: function (event) {
		
			if (event && this._suspend) {
				return;
			}
			if (this.options.mouseDragSelect === false || this.options.multipleSelection === false) {
				return false;
			}
			event.stopPropagation();
			event.preventDefault();
		},
		_releaseMouse: function () {
			this._isMouseDown = false;
		},
		_selectInternal: function (event, row, col) {
		
			// apply row selected class to TR 
			// add row to the selected rows collection
			var target, parent, $target, gridCell, gridRow, i, noCancel = true, isInternal = false, vindex,
				isRowSelection = false, parentIndex, v = this.grid.options.virtualization || this.grid.options.columnVirtualization;
			
			if (this.grid._startRowIndex === undefined) {
				this.grid._startRowIndex = 0;
			}
			
			if (event && this._suspend) {
				return;
			}
			if (event !== null) {
				this._isMouseDown = false;
			}
			if (event && event.which === 2) {
				return;
			}
			if (this._isDrag === true && event !== null) {
				this._isDrag = false;
				return;
			}
			// check for programmatic access
			if (event === null) {
				isInternal = true;
				//vindex = row - this.grid._startRowIndex < 0 ? 0 : row - this.grid._startRowIndex;
				vindex = row;
				event = {originalEvent: {}};
				if (col === null || col === undefined) {
					isRowSelection = true;
					if (v) {
						event.originalEvent.originalTarget = this.grid.rowAt(vindex);
					} else {
						event.originalEvent.originalTarget = this.grid.rowAt(row);
					}
				} else {
					if (v) {
						event.originalEvent.originalTarget = this.grid.cellAt(col, vindex);
					} else {
						event.originalEvent.originalTarget = this.grid.cellAt(col, row);
					}
				}
				event.originalEvent.srcElement = event.originalEvent.originalTarget;
			}
			target = event.originalEvent.originalTarget ? event.originalEvent.originalTarget : event.originalEvent.srcElement;
			$target = $(target);
			// fix for templating. if the cell template contains other elements, and we click on them, just taking $(target) won't give us the TR but (probably) the TD ! 
			parent = $target.closest('tr');
			//parent = $target.parent();
			
			if ($target.closest('th').length > 0) {
				return; // we are clicking on the headers 
			}
			
			if (event.ctrlKey) {
				this._mouseCtrlSelect = true;
			}
			if (this.options.mode === 'cell' && isRowSelection === false) {
				target = $target.is('td') ? $target[0] : $target.closest('td')[0];
				gridCell = this._cellFromElement(target);
				if (this.options.activation === true && this._rangeSelect !== true && this._singleShiftSelect !== true && this._ctrlSelect !== true) {
					if (this.grid._activeCell && gridCell && this._mouseCtrlSelect !== true && 
							gridCell.index === this.grid._activeCell.index && gridCell.rowIndex === this.grid._activeCell.rowIndex) {
						return; // we want to activate the same cell 
					} 
					if (this._mouseCtrlSelect !== true) {
						this._activateCell(gridCell, event);
					} else if (this.grid._activeCell && (gridCell.index !== this.grid._activeCell.index || gridCell.rowIndex !== this.grid._activeCell.rowIndex)) {
						this._activateCell(gridCell, event);
					}
				}
			} else {
				if (isInternal) {
					parent = $(target);
				}
				parentIndex = parent.index();
				//if (v) {
				//	parentIndex += this.grid._startRowIndex;
				//}
				gridRow = {element: parent, index: parentIndex + this.grid._startRowIndex};
				if (this.options.activation === true && this._rangeSelect !== true && this._singleShiftSelect !== true && this._ctrlSelect !== true) {
					if (this.grid._activeRow && gridRow && this._mouseCtrlSelect !== true && 
							gridRow.index === this.grid._activeRow.index) {
						return; // we want to activate the same cell 
					}
					if (this._mouseCtrlSelect !== true) {
						this._activateRow(gridRow, event);
					} else if (this.grid._activeRow && gridRow.index !== this.grid._activeRow.index) {
						this._activateRow(gridRow, event);
					}
				}
			}
			if (this.options.mode === 'row' && this.grid._selectedRow && this._singleShiftSelect !== true && this._ctrlSelect !== true && this._mouseCtrlSelect !== true &&
					gridRow && gridRow.index === this.grid._selectedRow.index) {
				return; // we don't want to select the same cell
			}
			if (this.options.mode === 'cell' && this.grid._selectedCell && gridCell && this._singleShiftSelect !== true && this._ctrlSelect !== true && this._mouseCtrlSelect !== true &&
					gridCell.index === this.grid._selectedCell.index && gridCell.rowIndex === this.grid._selectedCell.rowIndex) {
				return; // we don't want to select the same cell 
			}
			if ((isInternal === false && this.options.mode === 'cell') || (isInternal === true && isRowSelection === false)) {
				// fire 'ing' event
				if ((isInternal === false && !event.shiftKey) || this._ctrlSelect === true) {
					noCancel = this._trigger(this.events.cellSelectionChanging, event, {cell: gridCell, selectedCells: this.grid._selectedCells, owner: this, manual: isInternal});
				}
				if (noCancel) {
					// check if multiple selection is not enabled, remove the previous selection
					if (this.options.multipleSelection !== true) {
						// remove the previous selection
						if (this.grid._selectedCell !== null) {
							this.grid._selectedCell.element.removeClass(this.css.selectedCell);
						}
					} else {
						// check if CTRL is pressed
						if (event.ctrlKey || this._ctrlSelect === true) { 
							// add the cell to the selected cells collection
							if (gridCell.element.hasClass(this.css.selectedCell)) {
								for (i = 0; i < this.grid._selectedCells.length; i++) {
									if (this.grid._selectedCells[i].index === gridCell.index && this.grid._selectedCells[i].rowIndex === gridCell.rowIndex) {
										this.grid._selectedCells.remove(i);
									}
								}
							} else {
								this.grid._selectedCells.push(gridCell);
							}
						} else if (event.shiftKey) {
							this._shiftCellSelection(gridCell);
							return;
						} else {
							if (!isInternal) {
								this.clearSelection(true);
							}
							if (!this._isCellSelected(gridCell.rowIndex, gridCell.index)) {
								this.grid._selectedCells.push(gridCell);
							}
							if (!isInternal) {
								this._realActiveCell = gridCell;
							}
						}
					}
					if ((event.ctrlKey || this._ctrlSelect === true) && $target.hasClass(this.css.selectedCell)) {
						gridCell.element.removeClass(this.css.selectedCell);
					} else {
						gridCell.element.addClass(this.css.selectedCell);
						this.grid._selectedCell = gridCell;
					}
					// fire 'ed' event
					if (isInternal === false || this._ctrlSelect === true) {
						this._trigger(this.events.cellSelectionChanged, event, {cell: gridCell, selectedCells: this.grid._selectedCells, owner: this, manual: isInternal});
					}
				}
			} else if ((isInternal === false && this.options.mode === 'row') || (isInternal === true && isRowSelection === true)) {
				
				if ((isInternal === false && !event.shiftKey) || this._ctrlSelect === true) {
					noCancel = this._trigger(this.events.rowSelectionChanging, event, {row: gridRow, selectedRows: this.grid._selectedRows, owner: this, manual: isInternal});
				}
				if (noCancel) {
					if (this.options.multipleSelection !== true) {
						// remove the previous selection
						if (this.grid._selectedRow !== null) {
							$(this.grid._selectedRow.element).children().removeClass(this.css.selectedCell);
						}
					} else {
						if (event.ctrlKey || this._ctrlSelect === true) {
							if (gridRow.element.children().hasClass(this.css.selectedCell)) {
								for (i = 0; i < this.grid._selectedRows.length; i++) {
									if (this.grid._selectedRows[i].index === gridRow.index) {
										this.grid._selectedRows.remove(i);
									}
								}
							} else {
								this.grid._selectedRows.push(gridRow);
							}
						} else if (event.shiftKey) {
							this._shiftRowSelection(gridRow);
							return;
						} else {
							if (!isInternal) {
								this.clearSelection(true);
							}
							this.grid._selectedRows.push(gridRow);
							if (!isInternal) {
								this._realActiveRow = gridRow;
							}
						}
						
					}
					if ((event.ctrlKey || this._ctrlSelect === true) && gridRow.element.children().hasClass(this.css.selectedCell)) {
						gridRow.element.removeClass(this.css.selectedRow);
						gridRow.element.children().removeClass(this.css.selectedCell);

					// protect igGridUpdating
					} else if (parent.is('tr')) {
						parent.children().addClass(this.css.selectedCell);
					}
					this.grid._selectedRow = gridRow;
					if (isInternal === false || this._ctrlSelect === true) {
						this._trigger(this.events.rowSelectionChanged, event, {row: gridRow, selectedRows: this.grid._selectedRows, owner: this, manual: isInternal});
					}
				}
			}
			this._mouseCtrlSelect = false;
		},
		_shiftRowSelection: function (row, noClear, singleRowNavigate, currentRow, event) {
		
			var i, startIndex, endIndex, noCancel = true;
			
			if (this.grid._selectedRows.length === 0) {
				//this.grid._selectedRows.push(row);
				this._singleShiftSelect = true;
				// select the current row and return
				noCancel = this._trigger(this.events.rowSelectionChanging, null, {row: row, startIndex: row.index, endIndex: row.index, selectedRows: this.grid._selectedRows, owner: this, manual: false});
				if (noCancel) {
					this.selectRow(row.index);
					this._trigger(this.events.rowSelectionChanged, null, {row: row, selectedRows: this.grid._selectedRows, owner: this, manual: false});
				}
				this._singleShiftSelect = false;
				return;
			}
			endIndex = row.index;
			startIndex = this.grid._selectedRows[0].index;
			
			noCancel = this._trigger(this.events.rowSelectionChanging, null, {row: row, startIndex: startIndex, endIndex: endIndex, selectedRows: this.grid._selectedRows, owner: this, manual: false});
			if (noCancel) {
				// the list of below scenarios is taken from the behavior in MS Excel
				// 1. new index > last selected row index => select all remaining rows from last existing to the current "row" one
				if (!singleRowNavigate) {
					this._rangeSelect = true;
					if (this.grid._selectedRows.length > 0 && this.grid._selectedRows[0].index < row.index) {
						if (noClear !== false) {
							this.clearSelection(true);
						}
						for (i = startIndex; i <= endIndex; i++) {
							this.selectRow(i);
						}
					}
					// 2. new index < first selected row index
					if (this.grid._selectedRows.length > 0 && this.grid._selectedRows[0].index > row.index) {
						// select from new index to initial index
						if (noClear !== false) {
							this.clearSelection(true);
						}
						for (i = startIndex; i >= endIndex; i--) {
							this.selectRow(i);
						}
					}
					this._rangeSelect = false;
				} else {
					this._singleShiftSelect = true;
					if (event) {
						this._activateRow(row, event);
					}
					if (this._isRowSelected(this.grid._activeRow.index)) {
						this.deselectRow(currentRow.index);
					} else {
						this.selectRow(this.grid._activeRow.index);
					}
					this._singleShiftSelect = false;
				}
				// 3. selection in between
				this._trigger(this.events.rowSelectionChanged, null, {row: row, selectedRows: this.grid._selectedRows, owner: this, manual: false});
			} 
		},
		_shiftCellSelection: function (cell, noClear, singleCellNavigate, currentCell, event) {
			
			var firstCell, firstRowIndex, lastRowIndex, firstCellIndex, lastCellIndex, i, j,
				noCancel = true, lastSelRow = 0, firstSelRow = Number.MAX_VALUE, lastSelCol = 0, firstSelCol = Number.MAX_VALUE;
			if (this.grid._selectedCells.length === 0) {
				this._singleShiftSelect = true;
				// select the current cell and return
				noCancel = this._trigger(this.events.cellSelectionChanging, null, {cell: cell, firstRowIndex: cell.rowIndex, lastRowIndex: cell.rowIndex, firstColumnIndex: cell.index, lastColumnIndex: cell.index, selectedCells: this.grid._selectedCells, owner: this, manual: false});
				if (noCancel) {
					this.selectCell(cell.rowIndex, cell.index);
					this._trigger(this.events.cellSelectionChanged, null, {cell: cell, selectedCells: this.grid._selectedCells, owner: this, manual: false});
				}
				this._singleShiftSelect = false;
				return;
			}
			firstCell = this.grid._selectedCells[0];
			firstRowIndex = firstCell.rowIndex;
			lastRowIndex = cell.rowIndex;
			firstCellIndex = firstCell.index;
			lastCellIndex = cell.index;
				
			noCancel = this._trigger(this.events.cellSelectionChanging, null, {cell: cell, firstRowIndex: firstRowIndex, 
				lastRowIndex: lastRowIndex, firstColumnIndex: firstCellIndex, lastColumnIndex: lastCellIndex, selectedCells: this.grid._selectedCells, owner: this, manual: false});
			if (noCancel) {
				if (noClear !== false) {
					this.clearSelection(true);
				}
				if (!singleCellNavigate) {
					this._rangeSelect = true;
					if (firstRowIndex <= lastRowIndex) {
						for (i = firstRowIndex; i <= lastRowIndex; i++) {
							if (firstCellIndex <= lastCellIndex) {
								for (j = firstCellIndex; j <= lastCellIndex; j++) {
									this.selectCell(i, j);
								}
							} else {
								for (j = firstCellIndex; j >= lastCellIndex; j--) {
									this.selectCell(i, j);
								}
							}
						}
					} else {
						for (i = firstRowIndex; i >= lastRowIndex; i--) {
							if (firstCellIndex <= lastCellIndex) {
								for (j = firstCellIndex; j <= lastCellIndex; j++) {
									this.selectCell(i, j);
								}
							} else {
								for (j = firstCellIndex; j >= lastCellIndex; j--) {
									this.selectCell(i, j);
								}
							}
						}
					}
					this._rangeSelect = false;
				} else {
					// additional scenarios:
					// 1. firstSelRow - lastSelRow > 0 && moving left
					// 2. firstSelRow - lastSelRow > 0 && moving right 
					// 3. firstSelCol - lastSelCol > 0 && moving up
					// 4. firstSelCol - lastSelCol > 0 && moving down 
					// we are moving one cell to the left, top, right or bottom 
					this._singleShiftSelect = true;
					if (event) {
						this._activateCell(cell, event);
					}
					if (this._isCellSelected(this.grid._activeCell.rowIndex, this.grid._activeCell.index)) {
						this.deselectCell(currentCell.rowIndex, currentCell.index);
						// calc boundaries after last deselect
						for (i = 0; i < this.grid._selectedCells.length; i++) {
							if (this.grid._selectedCells[i].rowIndex > lastSelRow) {
								lastSelRow = this.grid._selectedCells[i].rowIndex;
							}
							if (this.grid._selectedCells[i].rowIndex < firstSelRow) {
								firstSelRow = this.grid._selectedCells[i].rowIndex;
							}
							if (this.grid._selectedCells[i].index > lastSelCol) {
								lastSelCol = this.grid._selectedCells[i].index;
							}
							if (this.grid._selectedCells[i].index < firstSelCol) {
								firstSelCol = this.grid._selectedCells[i].index;
							}
						}

						if (Math.abs(firstSelRow - lastSelRow) > 0 && Math.abs(this.grid._activeCell.index - currentCell.index) > 0) { // moving right or left
							if (firstSelRow <= lastSelRow) {
								for (i = firstSelRow; i <= lastSelRow; i++) {
									this.deselectCell(i, currentCell.index);
								}
							} else {
								for (i = firstSelRow; i >= lastSelRow; i--) {
									this.deselectCell(i, currentCell.index);
								}
							}
						} else if (Math.abs(firstSelCol - lastSelCol) > 0 && Math.abs(this.grid._activeCell.rowIndex - currentCell.rowIndex) > 0) { // moving up or down
							if (firstSelCol <= lastSelCol) {
								for (i = firstSelCol; i <= lastSelCol; i++) {
									this.deselectCell(currentCell.rowIndex, i);
								}
							} else {
								for (i = firstSelCol; i >= lastSelCol; i--) {
									this.deselectCell(currentCell.rowIndex, i);
								}
							}
						} 
					} else {
						this.selectCell(this.grid._activeCell.rowIndex, this.grid._activeCell.index);
						// calc boundaries after last select
						for (i = 0; i < this.grid._selectedCells.length; i++) {
							if (this.grid._selectedCells[i].rowIndex > lastSelRow) {
								lastSelRow = this.grid._selectedCells[i].rowIndex;
							}
							if (this.grid._selectedCells[i].rowIndex < firstSelRow) {
								firstSelRow = this.grid._selectedCells[i].rowIndex;
							}
							if (this.grid._selectedCells[i].index > lastSelCol) {
								lastSelCol = this.grid._selectedCells[i].index;
							}
							if (this.grid._selectedCells[i].index < firstSelCol) {
								firstSelCol = this.grid._selectedCells[i].index;
							}
						}
						// we need to select also all cells which are selected in column currentCell.index, but not in this.grid._activeCell.index
						if (Math.abs(firstSelRow - lastSelRow) > 0 && Math.abs(this.grid._activeCell.index - currentCell.index) > 0) { // moving right or left
							if (firstSelRow <= lastSelRow) {
								for (i = firstSelRow; i <= lastSelRow; i++) {
									this.selectCell(i, this.grid._activeCell.index);
								}
							} else {
								for (i = firstSelRow; i >= lastSelRow; i--) {
									this.selectCell(i, this.grid._activeCell.index);
								}
							}
						} else if (Math.abs(firstSelCol - lastSelCol) > 0 && Math.abs(this.grid._activeCell.rowIndex - currentCell.rowIndex) > 0) { // moving up or down
							if (firstSelCol <= lastSelCol) {
								for (i = firstSelCol; i <= lastSelCol; i++) {
									this.selectCell(this.grid._activeCell.rowIndex, i);
								}
							} else {
								for (i = firstSelCol; i >= lastSelCol; i--) {
									this.selectCell(this.grid._activeCell.rowIndex, i);
								}
							}
						}
					}
					this._singleShiftSelect = false;
				}
				this._trigger(this.events.cellSelectionChanged, null, {cell: cell, selectedCells: this.grid._selectedCells, owner: this, manual: false});
			}
		},
		// Activation (with arrow keys) - changes the currently focused cell
		_navigate: function (event) {
			var firstCell, firstCellKey, firstRow, vcontainer = $('#' + this.grid.element[0].id + '_displayContainer_a');
			if (event && this._suspend) {
				return;
			}
			if (this._isMouseDown === true) {
				return;
			}
			// check if we are actually navigating on cells (rows) or the header row 
			if (this.grid.options.virtualization) {
				if ($.browser.msie && document.activeElement && (document.activeElement.id !== vcontainer.attr('id') && !$(document.activeElement).is('td'))) {
					return;
				} else if (!$.browser.msie && event.target.id !== vcontainer.attr('id')) {
					return;
				}
			} else {
				if ($.browser.msie && document.activeElement && (document.activeElement.id !== this.grid.container().attr('id') && !$(document.activeElement).is('td'))) {
					return;
				} else if (!$.browser.msie && event.target.id !== this.grid.container().attr('id')) {
					return;
				}
			}
			// if there is no active cell, and activation is enabled, activate the cell. 
			firstCellKey = this.grid.options.columns.length > 0 ? this.grid.options.columns[0].key : null;

			firstCell = this._firstCell;
			firstRow = this._firstRow;
			if (this.options.activation === true) {
				// if there is multiple selection , we just apply the active style, otherwise we apply both active and selected
				if (this.options.mode === 'cell') {
					if (this.options.multipleSelection === true) {
						if (this.grid._activeCell === null || this.grid._activeCell === undefined) {
							// the first cell on the first row becomes active
							//this._activateCell({element: firstCell, index: 0, rowIndex: 0, columnKey: firstCellKey, row: $(this.grid.rowAt(0))}, event);
							this.selectCell(0, 0);
						} else {
							this._navigateCell(event, false);
						}
					} else {
						if ((this.grid._activeCell === null && this.grid._selectedCell === null) || (this.grid._activeCell === undefined && this.grid._selectedCell === undefined)) {
							//this._activateCell({element: firstCell, index: 0, rowIndex: 0, columnKey: firstCellKey, row: $(this.grid.rowAt(0))}, event);
							this.selectCell(0, 0);
						} else {
							this._navigateCell(event, true);
						}
					}
				} else { // row
					if (this.options.multipleSelection === true) {
						if (this.grid._activeRow === null || this.grid._activeRow === undefined) {
							// the first cell on the first row becomes active
							//this._activateRow({element: firstRow, index: 0}, event);
							this.selectRow(0);
						} else {
							this._navigateRow(event, false);
						}
					} else {
						if ((this.grid._activeRow === null && this.grid._selectedRow === null) || (this.grid._activeRow === undefined && this.grid._selectedRow === undefined)) {
							//this._activateRow({element: firstRow, index: 0}, event);
							this.selectRow(0);
						} else {
							this._navigateRow(event, true);
						}
					}
				}
			}
		},
		_navigateFocus: function (event) {
			if (($.browser.mozilla && event.originalEvent && $(event.originalEvent.explicitOriginalTarget).is('th'))) {
				return;
			}
			this._navigate(event);
		},
		_navigateCell: function (event, select) {
			
			var nextX, nextY, x, y, currentCell = this.grid._activeCell, firstRow, rowCount, newCell, length, newCellObject, noCancel = true, v,
					sri = this.grid._startRowIndex, sci = this.grid._startColIndex;
			v = this.grid.options.virtualization || this.grid.options.rowVirtualization;
			
			if (sri === undefined || sri === null) {
				sri = 0;
			}
			if (sci === undefined || sri === null) {
				sci = 0;
			}
			if (v) {
				x = currentCell.index - sci;
				y = currentCell.rowIndex - sri;
			} else {
				x = currentCell.index;
				y = currentCell.rowIndex;
			}
			firstRow = this._firstRow;
			rowCount = this._rowCount;
			length = this._length;
			
			if (event.keyCode === $.ui.keyCode.ENTER || event.keyCode === $.ui.keyCode.SPACE) {
				// select (does nothing if select in the args is true)
				nextX = x;
				nextY = y;
				if (event.ctrlKey && this._isCellSelected(y + sri, x + sci)) {
					// fire events
					noCancel = this._trigger(this.events.cellSelectionChanging, event, {cell: currentCell, selectedCells: this.grid._selectedCells, owner: this, manual: false});
					if (noCancel) {
						this.deselectCell(y + sri, x + sci);
						this._trigger(this.events.cellSelectionChanged, event, {cell: currentCell, selectedCells: this.grid._selectedCells, owner: this, manual: false});
					} 
				// fix for bug #75165 - Cell selection cannot be triggered by pressing SPACE or ENTER
				} else if (event.ctrlKey || !this._isCellSelected(y, x)) {
					this._ctrlSelect = true;
					this._selectInternal(null, y, x);
					this._ctrlSelect = false;
				}
				// go to the next cell and activate it (optionally select it if select in the args is true)
			} else if (event.keyCode === $.ui.keyCode.DOWN) {
				// go to the next row, same cell 
				nextX = x;
				nextY = y + 1;
				
				if (this._realActiveCell !== null && this._realActiveCell !== undefined &&
						this.options.multipleSelection === true && this.grid._selectedCells.length > 1 && !event.shiftKey && !event.ctrlKey) {
					nextX = this._realActiveCell.index - sci;
					nextY = this._realActiveCell.rowIndex + 1 - sri;
				}
				
				if (nextY > rowCount - 1 - sri && this.options.wrapAround === true && !v) {
					nextY = 0;
				} else if (nextY > rowCount - 1 - sri && this.options.wrapAround === false) {
					//nextY = y;
					return;
				}
			} else if (event.keyCode === $.ui.keyCode.UP) {
				// go to the prev. row, same cell 
				nextX = x;
				nextY = y - 1;
				
				if (this._realActiveCell !== null && this._realActiveCell !== undefined &&
						this.options.multipleSelection === true && this.grid._selectedCells.length > 1 && !event.shiftKey && !event.ctrlKey) {
					nextX = this._realActiveCell.index - sci;
					nextY = this._realActiveCell.rowIndex - 1 - sri;
				}
				if (!v) {
					if (nextY < 0 && this.options.wrapAround === true) {
						nextY = rowCount - 1;
					} else if (nextY < 0 && this.options.wrapAround === false) {
						//nextY = y;
						return;
					}
				}
			} else if (event.keyCode === $.ui.keyCode.LEFT) {
				// go to the prev. cell on the same row
				nextX = x - 1;
				nextY = y;
				if (nextX < 0) {
					nextX = length - 1;
					nextY = y - 1;
				}
				
				if (this._realActiveCell !== null && this._realActiveCell !== undefined &&
						this.options.multipleSelection === true && this.grid._selectedCells.length > 1 && !event.shiftKey && !event.ctrlKey) {
					nextX = this._realActiveCell.index - 1 - sci;
					nextY = this._realActiveCell.rowIndex - sri;
				}
				if (!v) {
					if (nextY < 0 && this.options.wrapAround === true) {
						nextX = length - 1;
						nextY = rowCount - 1;
					} else if (nextY < 0 && this.options.wrapAround === false) {
						//nextX = x;
						//nextY = y;
						return;
					}
				}
			} else if (event.keyCode === $.ui.keyCode.RIGHT) {
				// go to the next cell on the same row
				nextX = x + 1;
				nextY = y;
				if (nextX >= length) {
					nextX = 0;
					nextY = y + 1;
				}
				
				if (this._realActiveCell !== null && this._realActiveCell !== undefined &&
						this.options.multipleSelection === true && this.grid._selectedCells.length > 1 && !event.shiftKey && !event.ctrlKey) {
					nextX = this._realActiveCell.index + 1 - sci;
					nextY = this._realActiveCell.rowIndex - sri;
				}
				if (!v) {
					if (nextY >= rowCount && this.options.wrapAround === true) {
						nextX = 0;
						nextY = 0;
					} else if (nextY >= rowCount && this.options.wrapAround === false) {
						//nextX = x;
						//nextY = y;
						return;
					}
				}
			} else {
				return;
			}
			if (v && nextY >= this.grid._virtualRowCount) {
				//if (nextY !== y) {
				this._setScrollTop(this.grid.element.parent(), newCell, nextY > y ? 'down' : 'up', nextY);
				//}
				nextY = this.grid._virtualRowCount - 1;
				newCell = this.grid.cellAt(nextX, nextY);
			} else if (v && nextY < 0 && sri > 0) {
				//if (nextY !== y) {
				this._setScrollTop(this.grid.element.parent(), newCell, 'up', nextY);
				//}
				nextY = 0;
				newCell = this.grid.cellAt(nextX, nextY);
			} else if (v && nextY < 0) {
				return;
			} else {
				newCell = this.grid.cellAt(nextX, nextY);
			}
			// recalc scrollTop and scrollLeft
			if (!v) {
				this._setScrollTop(this.grid.element.parent(), newCell, nextY >= y ? 'down' : 'up', nextY);
				this._setScrollLeft(this.grid.element.parent(), newCell, nextX >= x ? 'right' : 'left', nextX);
			}
			if (newCell === undefined || newCell.length > 1) {
				return;
			}
			if (event.keyCode !== $.ui.keyCode.ENTER && event.keyCode !== $.ui.keyCode.SPACE) {
				$(currentCell.element).removeClass(this.css.activeCell);
				if (v) {
					newCellObject = {element: $(newCell), index: nextX + sci, rowIndex: nextY + sri, row: $(this.grid.rowAt(nextY)), columnKey: this.grid.options.columns[nextX].key};
				} else {
					newCellObject = {element: $(newCell), index: nextX, rowIndex: nextY, row: $(this.grid.rowAt(nextY)), columnKey: this.grid.options.columns[nextX].key};
				}
				if (event.ctrlKey && this.grid._activeCell && (this.grid._activeCell.index !== newCellObject.index || this.grid._activeCell.rowIndex !== newCellObject.rowIndex)) {
					this._activateCell(newCellObject, event);
				}
				if (!event.ctrlKey && event.shiftKey && this.options.multipleSelection === true) {
					this._shiftCellSelection(newCellObject, false, true, currentCell, event);
				} else if (!event.ctrlKey) {
					noCancel = this._trigger(this.events.cellSelectionChanging, event, {cell: newCellObject, selectedCells: this.grid._selectedCells, owner: this, manual: false});
					if (noCancel) {
						this.clearSelection(true);
						//if (v) {
						//	this._selectInternal(null, nextY + sri, nextX + sci);
						//} else {
							this._selectInternal(null, nextY, nextX);
						//}
						this._trigger(this.events.cellSelectionChanged, event, {cell: newCellObject, selectedCells: this.grid._selectedCells, owner: this, manual: false});
					}
				}
			}
			event.preventDefault();
			event.stopPropagation();
		},
		_navigateRow: function (event, select) {
			var nextY, y, currentRow = this.grid._activeRow, firstRow, rowCount, length, newRowObject, newRow, noCancel = true, v,
					sri = this.grid._startRowIndex, sci = this.grid._startColIndex;
			v = this.grid.options.virtualization || this.grid.options.rowVirtualization;
			
			if (v) {
				y = currentRow.index - sri;
			} else {
				y = currentRow.index;
			}
			
			firstRow = this._firstRow;
			rowCount = this._rowCount;
			length = this._length;
			
			if (event.keyCode === $.ui.keyCode.ENTER || event.keyCode === $.ui.keyCode.SPACE) {
				// select (does nothing if select in the args is true)
				nextY = y;
				if (event.ctrlKey && this._isRowSelected(y)) {
					noCancel = this._trigger(this.events.rowSelectionChanging, event, {row: currentRow, selectedRows: this.grid._selectedRows, owner: this, manual: false});
					if (noCancel) {
						this.deselectRow(y);
						this._trigger(this.events.rowSelectionChanged, event, {row: currentRow, selectedRows: this.grid._selectedRows, owner: this, manual: false});
					}
					noCancel = true;
					
				} else {
					this._ctrlSelect = true;
					this._selectInternal(null, y);
					this._ctrlSelect = false;
				}
			} else if (event.keyCode === $.ui.keyCode.DOWN) {
				// go to the next row
				//if (!this.grid.options.virtualization) {
				nextY = y + 1;
				//}
				if (this._realActiveRow !== null && this._realActiveRow !== undefined && this.options.multipleSelection === true && this.grid._selectedRows.length > 1 && !event.shiftKey && !event.ctrlKey) {
					nextY = this._realActiveRow.index + 1;
				}
				if (!v) {
					if (nextY > rowCount - 1 && this.options.wrapAround === true) {
						nextY = 0;
					} else if (nextY > rowCount - 1 && this.options.wrapAround === false) {
						//nextY = y;
						return;
					}
				}
			} else if (event.keyCode === $.ui.keyCode.UP) {
				// go to the prev. row
				nextY = y - 1;
				if (this._realActiveRow !== null && this._realActiveRow !== undefined && this.options.multipleSelection === true && this.grid._selectedRows.length > 1 && !event.shiftKey && !event.ctrlKey) {
					nextY = this._realActiveRow.index - 1;
				}
				if (!v) {
					if (nextY < 0 && this.options.wrapAround === true) {
						nextY = rowCount - 1;
					} else if (nextY < 0 && this.options.wrapAround === false) {
						//nextY = y;
						return;
					}
				}
			} else {
				return;
			}
			// get the new cell
			event.preventDefault();
			event.stopPropagation();
			//nextY = this._adjustVirtualVerticalPosition(nextY);
			if (v && nextY >= this.grid._virtualRowCount) {
				this._setScrollTop(this.grid.element.parent(), newRow, nextY >= y ? 'down' : 'up', nextY);
				nextY = this.grid._virtualRowCount - 1;
				newRow = this.grid.rowAt(nextY);
			} else if (v && nextY < 0 && sri > 0) {
				this._setScrollTop(this.grid.element.parent(), newRow, 'up', nextY);
				nextY = 0;
				newRow = this.grid.rowAt(nextY);
			} else if (v && nextY < 0) {
				// virtualization & selection does not support wrapping around
				return;
			} else {
				newRow = this.grid.rowAt(nextY);
			}

			if (newRow === undefined || newRow.length > 1) {
				return;
			}
			if (!v) {
				this._setScrollTop(this.grid.element.parent(), newRow, nextY >= y ? 'down' : 'up', nextY);
			}
			
			if (event.keyCode !== $.ui.keyCode.ENTER && event.keyCode !== $.ui.keyCode.SPACE) {
				$(currentRow.element).removeClass(this.css.activeRow);
				if (v) {
					newRowObject = {element: $(newRow), index: nextY + sri};
				} else {
					newRowObject = {element: $(newRow), index: nextY};
				}
				if (event.ctrlKey && this.grid._activeRow && this.grid._activeRow.index !== newRowObject.index) {
					this._activateRow(newRowObject, event);
				}
				if (!event.ctrlKey && event.shiftKey && this.options.multipleSelection === true) {
					this._shiftRowSelection(newRowObject, false, true, currentRow, event);
				} else if (!event.ctrlKey) {
					noCancel = this._trigger(this.events.rowSelectionChanging, event, {row: newRowObject, selectedRows: this.grid._selectedRows, owner: this, manual: false});
					if (noCancel) {
						this.clearSelection(true);
						this._selectInternal(null, nextY);
						this._trigger(this.events.rowSelectionChanged, event, {row: newRowObject, selectedRows: this.grid._selectedRows, owner: this, manual: false});
					}
				}
			}
		},
		_setScrollTop: function (parent, child, direction, index) {
			var parentOffset = parent.offset(), childOffset = $(child).offset(), childh, isDown, isUp, v, st;
			
			v = this.grid.options.virtualization === true || this.grid.options.rowVirtualization === true;
			
			childh = v ? parseInt(this.grid.options.avgRowHeight, 10) : $(child).outerHeight();
			
			if (!v) {
				isDown = childOffset.top + childh + this.grid._scrollbarWidth() > parentOffset.top + $(parent).outerHeight();
				isUp = childOffset.top < parentOffset.top;
			} else {
				isDown = childh * (index + 1) >= parseInt(this.grid.options.height, 10);
				isUp = index < 0;
			}
			if (index === 0) {
				parent[0].scrollTop = 0;
			} else if (direction === 'down') {
				if (isDown) {
					if (!v) {
						st = parent[0].scrollTop + childOffset.top + this.grid._scrollbarWidth() - (parentOffset.top + parent.outerHeight()) + $(child).outerHeight();
						parent[0].scrollTop = st;
					} else {
						this._scrollVmanual(true);
					}
				}
			} else {
				if (isUp) {
					if (!v) {
						st = parent[0].scrollTop - $(child).outerHeight();
						parent[0].scrollTop = st;
					} else {
						this._scrollVmanual(false);
					}
				}
			}
		},
		_scrollVmanual: function (down) {
			var sc = $('#' + this.grid.element[0].id + '_scrollContainer'), h = parseInt(this.grid.options.avgRowHeight, 10);
			this.grid._ignoreScroll = true;
			if (down) {
				sc.scrollTop(sc.scrollTop() + h);
			} else {
				sc.scrollTop(sc.scrollTop() - h);
			}
			this.grid._onVirtualVerticalScroll();
			this.grid._ignoreScroll = false;
		},
		_setScrollLeft: function (parent, child, direction, index) {
			var parentOffset = parent.offset(), childOffset = $(child).offset();
			
			if (index === 0) {
				parent[0].scrollLeft = 0;
			} else if (direction === 'right') {
				if (childOffset.left + $(child).outerWidth()  > parentOffset.left + $(parent).outerWidth()) {
					parent[0].scrollLeft = parent[0].scrollLeft + childOffset.left - (parentOffset.left + parent.outerWidth()) + $(child).outerWidth();
				}
			} else {
				if (childOffset.left < parentOffset.left) {
					parent[0].scrollLeft = parent[0].scrollLeft - $(child).outerWidth();
				}
			}
		},
		_isRowSelected: function (y) {
			var i;
			for (i = 0; i < this.grid._selectedRows.length; i++) {
				if (this.grid._selectedRows[i].index === y) {
					return true;
				}
			}
			return false;
		},
		_isCellSelected: function (y, x) {
			var i;
			for (i = 0; i < this.grid._selectedCells.length; i++) {
				if (this.grid._selectedCells[i].index === x && this.grid._selectedCells[i].rowIndex === y) {
					return true;
				}
			}
			return false;
		},
		// refreshes selection 
		_rs: function (e, args) {
			//var cells = this.grid._selectedCells, row = this.grid._selectedRows;
			var dom = args.dom, i = 0, j = 0, ac = this.grid._activeCell, ar = this.grid._activeRow,
				sri = this.grid._startRowIndex, sci = this.grid._startColIndex;
			// we need to return back the styles 
			for (i = 0; i < dom.length; i++) {
				for (j = 0; j < dom[i].length; j++) {
					if (this.options.mode === "cell") {
						if (this.options.multipleSelection) {
							if (this._isCellSelected(i + sri, j + sci)) {
								// add selected style
								$(dom[i][j]).addClass(this.css.selectedCell);
							}
						} else if (this.grid._selectedCell) {
							if (i + sri === this.grid._selectedCell.rowIndex && j + sci === this.grid._selectedCell.index) {
								$(dom[i][j]).addClass(this.css.selectedCell);
							}
						}
					} else {
						if (this.options.multipleSelection) {
							if (this._isRowSelected(i + sri)) {
								// add selected style
								$(dom[i][j]).addClass(this.css.selectedRow);
							}
						} else if (this.grid._selectedRow) {
							if (i + sri === this.grid._selectedRow.index) {
								$(dom[i][j]).addClass(this.css.selectedRow);
							}
						}
					}
				}
			}
			if (!$.browser.mozilla) {
				if (ac) {
					$(dom[ac.rowIndex - sri][ac.index - sci]).addClass(this.css.activeCell);
				}
				if (ar) {
					$(dom[ar.index - sri]).addClass(this.css.activeRow);
				}
			}
		},
		// API for programatically selecting rows and cells
		selectCell: function (row, col) {
			/* selects a cell by row/col 
				paramType="number" row index
				paramType="number" column index
			*/
			this._selectInternal(null, row, col);
		},
		deselectCell: function (row, col) {
			/* deselects a cell by row/col 
				paramType="number" row index
				paramType="number" column index
			*/
			var i;
			// find the cell
			if (this.options.multipleSelection === true) {
				for (i = 0; i < this.selectedCells().length; i++) {
					if (this.selectedCells()[i].index === col && this.selectedCells()[i].rowIndex === row) {
						this.selectedCells()[i].element.removeClass(this.css.selectedCell);
						this.selectedCells().remove(i);
						this.grid._selectedCell = null;
						break;
					}
				}
			} else {
				if (this.selectedCell() !== null && this.selectedCell() !== undefined) {
					this.selectedCell().element.removeClass(this.css.selectedCell);
					this.grid._selectedCell = null;
				}
			}
		},
		selectRow: function (index) {
			/* selects a row by index
				paramType="number" row index
			*/
			this._selectInternal(null, index);
		},
		deselectRow: function (index) {
			/* deselects a row by index
				paramType="number" row index
			*/
			var i;
			if (this.options.multipleSelection === true) {
				for (i = 0; i < this.selectedRows().length; i++) {
					if (this.selectedRows()[i].index === index) {
						this.selectedRows()[i].element.removeClass(this.css.selectedRow);
						this.selectedRows()[i].element.children().removeClass(this.css.selectedCell);
						this.selectedRows().remove(i);
						this.grid._selectedRow = null;
						break;
					}
				}
			} else {
				if (this.selectedRow() !== null && this.selectedRow() !== undefined) {
					this.selectedRow().element.removeClass(this.css.selectedRow);
					this.selectedRow().element.children().removeClass(this.css.selectedCell);
					this.grid._selectedRow = null;
				}
			}
		},
		_activateCell: function (cell, event) {
			var noCancel = true;
			noCancel = this._trigger(this.events.activeCellChanging, event, {cell: cell, owner: this});

			if (noCancel) {
				if (this.grid._activeCell) {
					$(this.grid._activeCell.element).removeClass(this.css.activeCell);
				}
				this.grid._activeCell = cell;
				$(this.grid._activeCell.element).addClass(this.css.activeCell);
				this._trigger(this.events.activeCellChanged, event, {cell: cell, owner: this});
			}
		},
		_activateRow: function (row, event) {
			var noCancel = true, v = this.grid.options.virtualization || this.grid.options.rowVirtualization;
			
			noCancel = this._trigger(this.events.activeRowChanging, event, {row: row, owner: this});
			if (noCancel) {
				if (this.grid._activeRow) {
					//if (v) {
					//	$(this.grid.rowAt(this.grid._activeRow.index - this.grid._startRowIndex)).removeClass(this.css.activeRow);
					//} else {
					$(this.grid._activeRow.element).removeClass(this.css.activeRow);
					//}
				}
				this.grid._activeRow = row;
				//if (v) {
				//	$(this.grid.rowAt(this.grid._activeRow.index - this.grid._startRowIndex)).addClass(this.css.activeRow);
				//} else {
				$(this.grid._activeRow.element).addClass(this.css.activeRow);
				//}
				this._trigger(this.events.activeRowChanged, event, {row: row, owner: this});
			}
		},
		// API - should we have both (cells vs. cell) or only the multiple: and in case of single it will return only one object? 
		// returns an array of $.ig.GridCell objects
		selectedCells: function () {
			/* returns an array of selected cells where every objects has the format {element: , row: , index: , rowIndex: , columnKey: }
				returnType="array"
			*/
			return this.grid._selectedCells;
		},
		// returns an array of $.ig.GridRow objects
		selectedRows: function () {
			/* returns an array of selected rows where every object has the format {element: , index: }
				returnType="array"
			*/
			return this.grid._selectedRows;
		},
		// returns an instance of $.ig.GridCell
		selectedCell: function () {
			/* returns the currently selected cell, if any. If multiple selection is enabled, will return null 
				returnType="object" an object that has the format {element: , row: , index: , rowIndex: , columnKey: }
			*/
			return this.grid._selectedCell;
		},
		// returns an instance of $.ig.GridRow
		selectedRow: function () {
			/* returns the currently selected row, if any. If multiple selection is enabled, will return null 
				returnType="object" an object that has the format {element: , index: }
			*/
			return this.grid._selectedRow;
		},
		// returns an instance of $.ig.GridCell
		activeCell: function () {
			/* returns the currently active (focused) cell, if any. If multiple selection is enabled, will return null 
				returnType="object" an object that has the format {element: , row: , index: , rowIndex: , columnKey: }
			*/
			return this.grid._activeCell;
		},
		activeRow: function () {
			/* returns the currently active (focused) row, if any. If multiple selection is enabled, will return null 
				returnType="object" an object that has the format {element: , index: }
			*/
			return this.grid._activeRow;
		},
		clearSelection: function (internal, uiDirty) {
			/* clears all selected cells, selected rows, active cell and active row. Also updates the UI accordingly */
			// clear selected cells
			var i, v = this.grid.options.virtualization || this.grid.options.rowVirtualization;
			for (i = 0; i < this.grid._selectedCells.length; i++) {
				if (!v || (v && this.grid._selectedCells[i].rowIndex - this.grid._startRowIndex >= 0)) {
					this.grid._selectedCells[i].element.removeClass(this.css.selectedCell);
				}
			}
			this.grid._selectedCells = [];
			
			// clear selected rows
			for (i = 0; i < this.grid._selectedRows.length; i++) {
				if (!v || (v && this.grid._selectedRows[i].index - this.grid._startRowIndex >= 0)) {
					$(this.grid._selectedRows[i].element.children()).removeClass(this.css.selectedCell);
				}
			}
			this.grid._selectedRows = [];
			
			// clear selected row (single)
			if (this.grid._selectedRow !== null && this.grid._selectedRow !== undefined) {
				if (v && this.grid._selectedRow.index - this.grid._startRowIndex >= 0) {
					$(this.grid.rowAt(this.grid._selectedRow.index - this.grid._startRowIndex)).children().removeClass(this.css.selectedCell);
				} else {
					$(this.grid._selectedRow.element.children()).removeClass(this.css.selectedCell);
				}
				this.grid._selectedRow = null;
			}
			// clear selected cell (single)
			if (this.grid._selectedCell !== null && this.grid._selectedCell !== undefined) {
				if (v && this.grid._selectedCell.rowIndex - this.grid._startRowIndex >= 0) {
					$(this.grid.cellAt(this.grid._selectedCell.index, this.grid._selectedCell.rowIndex - this.grid._startRowIndex)).removeClass(this.css.selectedCell);
				} else {
					this.grid._selectedCell.element.removeClass(this.css.selectedCell);
				}
				this.grid._selectedCell = null;
			}
			if (uiDirty) {
				this.grid._activeCell = null;
				this.grid._activeRow = null;
			}
			if (!internal) {
				if (this.grid._activeCell) {
					this.grid._activeCell.element.removeClass(this.css.activeCell);
					this.grid._activeCell = null;
				}
				if (this.grid._activeRow) {
					this.grid._activeRow.element.removeClass(this.css.activeRow);
					this.grid._activeRow = null;
				}
			}
		},
		destroy: function () {
			this.clearSelection();
			this._unregisterEvents();
			$.Widget.prototype.destroy.call(this);
			return this;
		},
		_onUIDirty: function (e, args) {
			// if selection itself has triggered the event, return
			if (args.owner === this) {
				return;
			}
			// reset row count
			if (!this.grid.options.virtualization && !this.grid.options.rowVirtualization) {
				this._rowCount = this.grid.dataSource.dataView().length;
			}
			this.clearSelection(true, true);
		},
		// every grid feature widget should implement this 
	    _injectGrid: function (gridInstance) {
			this.grid = gridInstance;
			this.grid._activeCell = null;
			this.grid._selectedCell = null;
			this.grid._selectedRow = null;
			this.grid._activeRow = null;
			this.grid._selectedCells = [];
			this.grid._selectedRows = [];
			this.grid.element.bind('iggridvirtualrecordsrender', $.proxy(this._rs, this));
			this._uiDirtyHandler = $.proxy(this._onUIDirty, this);
			this.grid.element.bind('iggriduisoftdirty', this._uiDirtyHandler);
			//this.grid.element.bind('iggriduidirty', this._uiDirtyHandler);
		}
    });
    $.extend($.ui.igGridSelection, {version: '11.1.20111.1014'});

}(jQuery));
/*
 * Infragistics.Web.ClientUI Grid Sorting 11.1.20111.1014
 *
 * Copyright (c) 2011 Infragistics Inc.
 * <Licensing info>
 *
 * http://www.infragistics.com/
 *
 * Depends on:
 * Depends on:
 *  jquery-1.4.4.js
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	ig.ui.grid.framework.js
 *  ig.ui.shared.js
 *  ig.dataSource.js
 *	ig.util.js
 */

/*global jQuery */
if (typeof (jQuery) === "undefined") {
    throw new Error("The Infragistics Grid requires jQuery to be loaded");
}

(function ($) {

    // we will define a new widget for sorting. That kind of widget is completely independent one and doesn't subclass the grid 
    // it subscribes to grid events such as BodyRendering/BodyRendered, and has the grid instance (igGrid) injected into it
    // for sorting the this.element[0] will be the TR hosting the <TH>s 
    $.widget("ui.igGridSorting", {
		/* igGridSorting widget -  The widget is pluggable to the element where the grid is instantiated and the actual igGrid object doesn't know about this
			the sorting widget just attaches its functionality to the grid
			it supports single and multiple column sorting, with predefined sorting settings specified on a per column basis
			the sorted column headers have spefific appearance and icons applied based on the current sorting condition applied, also the column cells can receive special styling (configurable)
			the widget also implements has full keyboard support with the TAB , SPACE/ENTER keys. 
		*/
		/* the instance of the grid to which this feature is going to attach its functionality */
	    grid: null,
	    css: {
			/* classes applied to a sortable column header */
			"sortableColumnHeader": "ui-iggrid-sortableheader ui-state-default",
			/* classes appied to a sortable header when it's active (navigated with keyboard / clicked) */
			"sortableColumnHeaderActive": "ui-iggrid-sortableheaderactive ui-state-active",
			/* classes applied to a sortable column header when it is hovered */
			"sortableColumnHeaderHover": "ui-iggrid-sortableheaderhover ui-state-hover",
			/* classes applied to the sortable column header when it has focus */
			"sortableColumnHeaderFocus": "ui-iggrid-sortableheaderfocus ui-state-focus",
			/* classes applied to a column header when it's sorted ascending */
			"ascendingColumnHeader": "ui-iggrid-colheaderasc",
			/* classes applied to a column header when it's sorted descending */
			"descendingColumnHeader": "ui-iggrid-colheaderdesc",
			/* classes applied to a column's cells when it's sorted ascending */
			"ascendingColumn": "ui-iggrid-colasc ui-state-highlight",
			/* classes applied to a column's cells when it's sorted descending */
			"descendingColumn": "ui-iggrid-coldesc ui-state-highlight",
			/* classes applied to the sorting indicator SPAN rendered inside the column header */
			"sortIndicator": "ui-iggrid-colindicator", 
			/* classes applied to the sorting indicator span when it's in ascending state */
			"sortIndicatorAscending": "ui-iggrid-colindicator-asc ui-icon ui-icon-arrowthick-1-n", 
			/* classes applied to the sorting indicator span when it's in descending state */
			"sortIndicatorDescending": "ui-iggrid-colindicator-desc ui-icon ui-icon-arrowthick-1-s" 
	    },
	    options: {
			/* type="remote|local" type of sorting - local or remote. Default is remote */
			type: "remote",
			/* type="bool" Case sensitivity of the sorting */
			caseSensitive: false,
			/* type="bool" if false , sorted column cells will not have any special sort-related styling */
			applySortedColumnCss: true,
			/* type="string" URL param name which specifies how sorting expressions will be encoded in the URL. Default is null and uses OData conventions. ex: ?sort(col1)=asc */
			sortUrlKey: null, 
			/* type="string" URL param value for ascending type of sorting. Default is null and uses OData conventions. Example: ?sort(col1)=asc */
			sortUrlKeyAscValue: null,
			/* type="string" URL param value for descending type of sorting. Default is null and uses OData conventions */
			sortUrlKeyDescValue: null,
			/* type="single|multi" specifies single or Multiple sorting. If multiple sorting is enabled, previous sorted state for columns won't be cleared */
			mode: "single",
			/* type="function" custom sort function accepting three parameters - the data to be sorted, an array of data source field definitions, and the direction to sort with (optional). The function should return the sorted data array */
			customSortFunction: null,
			/* type="ascending|descending" specifies which direction to use on the first click / keydown, if the column hasn't been sorted before */
			firstSortDirection: 'ascending',
			/* type="string" custom sorted column tooltip in jQuery templating format */
			sortedColumnTooltip: $.ig.GridSorting.locale.sortedColumnTooltipFormat, 
			/* type="string" custom unsorted column tooltip in jQuery templating format */
			unsortedColumnTooltip: $.ig.GridSorting.locale.unsortedColumnTooltip,
			/* a list of custom column settings that specify custom sorting settings for a specific column (whether sorting is enabled / disabled, default sort direction, first sort direction, etc.) */
			columnSettings: [
				{
					/* type="string" optional="true" column key. Either key or index must be set in every column setting */
					columnKey: null,
					/* type="number" optional="true" column index. Either key or index must be set in every column setting */
					columnIndex: -1,
					/* type="asc|desc" optional="true". this will be the first sort direction when the column hasn't been sorted before */
					firstSortDirection: null,
					/* type="asc|desc" optional="true". the current (or default) sort direction. If this setting is specified, the column will be rendered sorted according to this */
					currentSortDirection: null,
					/* type="bool" enables / disables sorting on the specified column. By default all columns are sortable */
					allowSorting: true
				}
			]
	    },
		events: {
			/* cancel="true" event fired before sorting is invoked for a certain column */
			columnSorting: "columnSorting",
			/* cancel="false" event fired after the column has already been sorted and data - re-rendered */
			columnSorted: "columnSorted"
		},
		_createWidget: function (options, element) {
			/* !Strip dummy objects from options, because they are defined for documentation purposes only! */
			this.options.columnSettings = [];
			$.Widget.prototype._createWidget.apply(this, arguments);
		},
	    _create: function () {
			var self = this;
			this._headers = [];
			this._clickHandler = function (event) {
				$(event.currentTarget).closest('th').find('a').focus();
				self._handleSort(event);
			};
			this._dragStartHandler = function (event) {
				event.stopPropagation();
				event.preventDefault();
				return false;
			};
			this._mouseOverHandler = function (event) {
				// check if the column is sortable
				var $target = $(event.currentTarget), cs;
				cs = self._getColSettingFromElement(event.currentTarget);
				if (cs && cs.allowSorting !== false) {
					$target.addClass(self.css.sortableColumnHeaderHover);
				}
			};
			this._mouseOutHandler = function (event) {
				$(event.currentTarget).removeClass(self.css.sortableColumnHeaderHover);
			};
		    // bind events - we assume the <tr> holding the <th>s is already there 
		    $('#' + this.element[0].id + ' th').live({
			    click: this._clickHandler,
				//A.T. 21 Jan 2011 - Fix for bug #63737 - Droping a column in the filter row area results in displaying "javascript:void(0)" in the filter area
				dragstart: this._dragStartHandler,
				mouseover: this._mouseOverHandler,
				mouseout: this._mouseOutHandler
		    });
			
			$('#' + this.element[0].id + '_headers th').live({
			    click: this._clickHandler,
				//A.T. 21 Jan 2011 - Fix for bug #63737 - Droping a column in the filter row area results in displaying "javascript:void(0)" in the filter area
				dragstart: this._dragStartHandler,
				mouseover: this._mouseOverHandler,
				mouseout: this._mouseOutHandler
		    });
			
			this._keyDownHandler = function (event) {
				self._handleSortKb(event);
			};
			this._focusHandler = function (event) {
				self._handleFocusKb(event);
			};
			this._blurHandler = function (event) {
				self._handleBlurKb(event);
			};
			$('#' + this.element[0].id + ' th a').live({
				keydown: this._keyDownHandler,
				focus: this._focusHandler,
				blur: this._blurHandler
			});
			$('#' + this.element[0].id + '_headers th a').live({
				keydown: this._keyDownHandler,
				focus: this._focusHandler,
				blur: this._blurHandler
			});
			
	    },
		_setOption: function (key, value) {
		    // handle new settings and update options hash
			$.Widget.prototype._setOption.apply(this, arguments);
			
			// start by throwing an error for the options that aren't supported:
			if (key === 'type') {
				throw new Error($.ig.Grid.locale.optionChangeNotSupported + ' ' + key);
			} else if (key === 'caseSensitive') {
				// reinitialize data source setting
				//A.T. 12 Feb 2011 - Fix for #66143 - igSorting caseSensitive option doesn't change case sensitivity
				this.grid.dataSource.settings.sorting.caseSensitive = this.options.caseSensitive;
			}
	    },
		_getColSettingFromElement: function (e) {
			var index, cs = this.options.columnSettings, $e = $(e);
			index = parseInt($e.data('columnIndex'), 10);
			return cs[index];
		},
		_handleSortKb: function (event) {
			var index = $(event.currentTarget).closest('th').data('columnIndex');
			if (event.keyCode === $.ui.keyCode.ENTER || event.keyCode === $.ui.keyCode.SPACE) {
				if (this._currentActiveHeader) {
					this._currentActiveHeader.removeClass(this.css.sortableColumnHeaderActive);
				}
				$(event.currentTarget).closest('th').addClass(this.css.sortableColumnHeaderActive);
				this._currentActiveHeader = $(event.currentTarget).closest('th');
				//A.T. 15 Feb 2011 - fix for bug #66140
				this.sortColumn(index, null, $(event.currentTarget).closest('th'));
				
				event.stopPropagation();
				event.preventDefault();
			}
		},
		_handleFocusKb: function (event) {
			$(event.currentTarget).closest('th').addClass(this.css.sortableColumnHeaderFocus);
		},
		_handleBlurKb: function (event) {
			$(event.currentTarget).closest('th').removeClass(this.css.sortableColumnHeaderFocus);
		},
		_handleSort: function (event) {
			var index = $(event.currentTarget).closest('th').data('columnIndex');
			if (this._currentActiveHeader) {
				this._currentActiveHeader.removeClass(this.css.sortableColumnHeaderActive);
			}
			$(event.currentTarget).addClass(this.css.sortableColumnHeaderActive);
			this._currentActiveHeader = $(event.currentTarget).closest('th');
			this.sortColumn(index, null, $(event.currentTarget));
			
			event.stopPropagation();
			event.preventDefault();
		},
		_initLoadingIndicator: function () {
			// attach loading indicator widget
			this._loadingIndicator = this.grid.container().length > 0 ? this.grid.container().igLoading().data("igLoading").indicator() : this.grid.element.igLoading().data("igLoading").indicator();
		},
	    sortColumn: function (index, direction, header) {
			/* sorts a grid column and updates the UI  
				paramType="object" column key (string) or index (number). Specifies the column which we want to sort. If the mode is multiple, previous sorting states are not cleared. 
				paramType="asc|desc" specifies sorting direction (ascending or descending) 
			*/
			var colKey, expr, noCancel, s, i, visualIndex;
			if ($.type(index) === 'number') {
				colKey = this.grid.options.columns[index].key;
			} else {
				colKey = index;
				for (i = 0; i < this.grid.options.columns.length; i++) {
					if (this.grid.options.columns[i].key === colKey) {
						index = i;
						break;
					}
				}
			}
			expr = this.grid.dataSource.settings.sorting.expressions;
			s = this._findColumnSetting(colKey);
			
			if (this.grid.options.virtualization === true || this.grid.options.columnVirtualization === true) {
				visualIndex = index - this.grid._startColIndex;
			} else {
				visualIndex = index;
			}
			if (header === null || header === undefined) {
				// programmatic sorting 
				if (this._currentActiveHeader) {
					this._currentActiveHeader.removeClass(this.css.sortableColumnHeaderActive);
				}
				if (this.grid.options.fixedHeaders) {
					header = this.grid.container().find('#' + this.grid.element[0].id + '_headers thead th:nth-child(' + (visualIndex + 1) + ')');
				} else {
					header = this.grid.element.find('thead th:nth-child(' + (visualIndex + 1) + ')');
				}
			}
			if (s && s.allowSorting === false) {
				return;
			}
			
			if (direction !== null && direction !== undefined) {
				s.currentSortDirection = direction;
			} else {
				if ((s.currentSortDirection !== undefined && s.currentSortDirection !== null && !s.currentSortDirection.startsWith('asc') && !s.currentSortDirection.startsWith('desc')) || s.currentSortDirection === undefined || s.currentSortDirection === null) {
					s.currentSortDirection = s.firstSortDirection === undefined ? this.options.firstSortDirection : s.firstSortDirection;
				} else {
					s.currentSortDirection = (s.currentSortDirection !== undefined && s.currentSortDirection !== null && s.currentSortDirection.indexOf('asc') !== -1) ? 'descending' : 'ascending';
				}
			}
			// fire sorting event
			noCancel = this._trigger(this.events.columnSorting, null, {columnKey: colKey, direction: s.currentSortDirection, owner: this});
			
			if (noCancel) {
				this._loadingIndicator.show();
				
				//  update title attributes
				header.attr('title', s.currentSortDirection.startsWith('asc') ? this.options.sortedColumnTooltip.replace('${direction}', $.ig.GridSorting.locale.ascending) : this.options.sortedColumnTooltip.replace('${direction}', $.ig.GridSorting.locale.descending));
				
				if (this.options.mode === "single") {
					this._clearSortStates(header, index);
					this.grid.dataSource.settings.sorting.expressions = [{fieldName: colKey, dir: s.currentSortDirection.startsWith('asc') ? 'asc' : 'desc'}];
				} else {
					// multi-column sorting
					for (i = 0; i < expr.length; i++) {
						if (expr[i].fieldName === colKey) {
							expr.splice(i, 1);
						}
					}
					this.grid.dataSource.settings.sorting.expressions = expr.concat([{fieldName: colKey, dir: s.currentSortDirection}]);
				}
				// trigger DataBinding event on the grid
				noCancel = this.grid._trigger(this.grid.events.dataBinding, null, {owner: this.grid});
				if (noCancel) {
					// A.T. 13 April 2011 fix for bug #72284
					this.grid.element.trigger('iggriduisoftdirty', {owner: this});
					
					this._currentHeader = header;
					this._currentIndex = index;
					if (this.options.type === "remote") {
						this.grid._fireDataBoundInternal = true;
						this._shouldFireColumnSorted = true;
						this.grid.dataSource.dataBind();
					} else {
						this.grid.dataSource.sort(this.grid.dataSource.settings.sorting.expressions, s.currentSortDirection);
						this.grid._trigger(this.grid.events.dataBound, null, {owner: this.grid});
						this.grid._renderData();
						this._trigger(this.events.columnSorted, null, {columnKey: colKey, direction: s.currentSortDirection, owner: this});
					}
					this._curColKey = colKey;
					this._curSortDir = s.currentSortDirection;
				}
			}
	    },
		/* A.T. fix for bug #73496 */
		_excludeExpr: function (key) {
			var expr = this.grid.dataSource.settings.sorting.expressions, i;
			for (i = 0; i < expr.length; i++) {
				if (expr[i].fieldName === key) {
					// remove the entry from the array
					expr.remove(i);
				}
			}
		},
		_applySortStyles: function (header, index) {
			var span, col, indicatorContainer, visualIndex;
			
			if (this.grid.options.virtualization === true || this.grid.options.columnVirtualization === true) {
				visualIndex = index - this.grid._startColIndex;
			} else {
				visualIndex = index;
			}
			// apply class to sorting indicator
			span = header.find('.ui-iggrid-colindicator');
			indicatorContainer = header.find('.ui-iggrid-indicatorcontainer');
			if (indicatorContainer.length === 0) {
				indicatorContainer = $('<div></div>').appendTo(header).addClass('ui-iggrid-indicatorcontainer');
			}
			indicatorContainer.append(span);
			// A.T. fix failing unit tests
			if (this.grid.options.fixedHeaders !== true) {
				col = header.closest('thead').parent().find('tbody tr td:nth-child(' + (visualIndex + 1) + ')');
			} else if (this.options.applySortedColumnCss !== false) {
				col = this.grid.element.find('tr td:nth-child(' + (visualIndex + 1) + ')');
			}
			if (this.options.columnSettings[index].currentSortDirection !== undefined && this.options.columnSettings[index].currentSortDirection.indexOf('asc') !== -1) {
				span.removeClass(this.css.sortIndicatorDescending).addClass(this.css.sortIndicatorAscending);
				header.removeClass(this.css.descendingColumnHeader).addClass(this.css.ascendingColumnHeader);
				// change the CSS class for the column
				if (this.options.applySortedColumnCss !== false) {
					col.removeClass(this.css.descendingColumn).addClass(this.css.ascendingColumn);
				}
			} else {
				span.removeClass(this.css.sortIndicatorAscending).addClass(this.css.sortIndicatorDescending);
				header.removeClass(this.css.ascendingColumnHeader).addClass(this.css.descendingColumnHeader);
				// change the css class for the column
				if (this.options.applySortedColumnCss !== false) {
					col.removeClass(this.css.ascendingColumn).addClass(this.css.descendingColumn);
				}
			}
		},
		// will clear all sort states except the one specified as index. If none is specified will clear all
		_clearSortStates: function (header, index) {
			var i, cs = this.options.columnSettings;
			for (i = 0; i < this.options.columnSettings.length; i++) {
				if (cs[i].allowSorting !== false) {
					if (index !== undefined && cs[i].columnIndex !== index) {
						//cs[i].currentSortDirection = null;
						//if (cs[i].currentSortDirection) {
						//	cs[i].currentSortDirection = cs[i].userSet_currentSortDirection;
						//}
						delete cs[i].currentSortDirection;
						this._clearSortState(header, i);
					}
				}
			}
		},
		_clearSortState: function (header, i) {
			var spanHeader = header.closest('thead').children().first().find('th:nth-child(' + (i + 1) + ')'), span = spanHeader.find('.ui-iggrid-colindicator'), col;
			if (span.hasClass('ui-iggrid-colindicator-desc') || span.hasClass('ui-iggrid-colindicator-asc')) {
				span.removeClass(this.css.sortIndicatorDescending).removeClass(this.css.sortIndicatorAscending);
				// we need to get the correct header, that corresponds to the span
				spanHeader.removeClass(this.css.ascendingColumnHeader).removeClass(this.css.descendingColumnHeader).removeClass(this.css.sortableColumnHeaderFocus);
			}
			//A.T. 12 Feb 2011 - Fix for bug #66082
			// reset tooltip
			this._headers[i].header.attr('title', this.options.unsortedColumnTooltip);
			
			if (this.options.applySortedColumnCss !== false) {
				if (this.grid.options.fixedHeaders !== true) {
					col = header.closest('thead').parent().find('tbody tr td:nth-child(' + (i + 1) + ')');
				} else if (this.options.applySortedColumnCss !== false) {
					col = this.grid.element.find('tr td:nth-child(' + (i + 1) + ')');
				}
				// change the CSS class for the column
				col.removeClass(this.css.descendingColumn).removeClass(this.css.ascendingColumn);
			}
		},
		_initDefaultSettings: function () {
			// fill in default column settings, so that later on we can get the current sort state of every sortable column 
			// iterate through columns
			var settings = [], key, cs = this.options.columnSettings, i, j, defaultExpressions = [];
			// initialize
			if (this.grid.options.columns && this.grid.options.columns.length > 0) {
				for (i = 0; i < this.grid.options.columns.length; i++) {
					settings[i] = {'columnIndex': i, 'columnKey': this.grid.options.columns[i].key, 'allowSorting': true};
				}
			}
			for (i = 0; i < cs.length; i++) {
				for (key in cs[i]) {
					if (cs[i].hasOwnProperty(key) && key !== 'columnKey' && key !== 'columnIndex') {
						if (key === "userSet_currentSortDirection") {
							if (cs[i].userSet_currentSortDirection === "undefined") {
								delete cs[i].currentSortDirection;
								//delete cs[i]["userSet_currentSortDirection"];
							} else {
								cs[i].currentSortDirection = cs[i].userSet_currentSortDirection;
							}
						} else if (key === "userSet_allowSorting") {
							cs[i].allowSorting = cs[i].key;
							delete cs[i].key;
						}
					}
				}
			}
			for (i = 0; i < cs.length; i++) {
				for (j = 0; j < settings.length; j++) {
					if (settings[j].columnKey === cs[i].columnKey || settings[j].columnIndex === cs[i].columnIndex) {
						break;
					}
				}
				if (j === settings.length) {
					continue;
				}
				for (key in cs[i]) {
					if (cs[i].hasOwnProperty(key) && key !== 'columnKey' && key !== 'columnIndex' && !key.startsWith('userSet')) {
						
						settings[j][key] = cs[i][key];
						settings[j]['userSet_' + key] = cs[i][key]; // we need to do that so after rebind the original user defined settings are restored
						if (key === 'currentSortDirection' && cs[i][key]) {
							if ($.type(settings[j].columnKey) !== "number") {
								defaultExpressions.push({fieldName: settings[j].columnKey, dir: cs[i][key].startsWith('asc') ? 'asc' : 'desc'});
							} else {
								defaultExpressions.push({fieldIndex: settings[j].columnKey, dir: cs[i][key].startsWith('asc') ? 'asc' : 'desc'});
							}
						}
					}
				}
			}
			for (i = 0; i < settings.length; i++) {
				if (!settings[i].hasOwnProperty("currentSortDirection")) {
					settings[i].userSet_currentSortDirection = "undefined";
				}
			}
			// copy
			this.options.columnSettings = settings;
			// store default expressions
			this.grid.dataSource.settings.sorting.expressions = defaultExpressions;
			this.grid.dataSource.settings.sorting.defaultFields = defaultExpressions;
		},
	    // grid event handlers
		_headerCellRendered: function (event, ui) {
			// decorate sorting logic, apply CSS classes, etc. 
			// apply sortable CSS class
			var cs = this._findColumnSetting(ui.columnKey);
			if (ui.columnKey && cs) {
			
				this._headers.push({header: ui.th, index: cs.columnIndex});
				if (cs.allowSorting !== false) {
					ui.th.addClass(this.css.sortableColumnHeader);
					// apply title attributes
					if (cs.currentSortDirection === undefined || cs.currentSortDirection === null) {
						ui.th.attr('title', this.options.unsortedColumnTooltip);
					} else {
						ui.th.attr('title', cs.currentSortDirection.startsWith('asc') ? this.options.sortedColumnTooltip.replace('${direction}', $.ig.GridSorting.locale.ascending) : this.options.sortedColumnTooltip.replace('${direction}', $.ig.GridSorting.locale.descending));
					}
					// render span
					$('<span></span>').appendTo(ui.th).addClass(this.css.sortIndicator);
					// keyboard navigation
					$(ui.th).wrapInner('<a href="#"></a>');
					// if the column has been initially sorted
					if (cs.currentSortDirection !== undefined) {
						this._applySortStyles(ui.th, cs.columnIndex);
					}
				} else {
					$(ui.th).wrapInner('<a href="#"></a>');
				}
			}
		},
		_findColumnSetting: function (key) {
			var i;
			for (i = 0; i < this.options.columnSettings.length; i++) {
				if (this.options.columnSettings[i].columnKey === key) {
					return this.options.columnSettings[i];
				}
			}
		},
		_dataRendered: function () {
			if (!this._loadingIndicator) {
				this._initLoadingIndicator();
			}
			// fire column sorted if rendering has been triggered by sorting
			if (this._shouldFireColumnSorted) {
				this._trigger(this.events.columnSorted, null, {columnKey: this._curColKey, direction: this._curSortDir, owner: this});
				this._shouldFireColumnSorted = false;
			}
			this._loadingIndicator.hide();
			if (this._currentIndex !== undefined && this._currentIndex !== null && this._currentHeader !== undefined && this._currentHeader !== null) {
				this._applySortStyles(this._currentHeader, this._currentIndex);
			}
		},
        _onUIDirty: function (e, args) {
            // if sorting itself has triggered the event, return
            if (args.owner === this) {
                return;
            }
			this._currentIndex = null;
            this._currentHeader = null;
            this._clearUi(true);
        },
        _clearUi: function (resetAll) {
			var i, header, csd;

            for (i = 0; i < this._headers.length; i++) {
				// A.T. fix for bug 72281 - (Related to bug #67517)
				csd = this.options.columnSettings[i].userSet_currentSortDirection;
				if (csd === undefined || csd === null || csd === "undefined") {
					//this._clearSortStates(this._headers[i].header, resetAll === true ? null : this._headers[i].index);
					this._clearSortState(this._headers[i].header, i);
					//A.T. Fix for bug #73496
					if (this.options.mode === "multi") {
						delete this.options.columnSettings[i].currentSortDirection;
						// exclude the expression from the expressions in the data source
						this._excludeExpr(this.options.columnSettings[i].columnKey);
					}
				} else {
					// apply sort State
					this._applySortStyles(this._headers[i].header, i);
				}
				header = this._headers[i].header;
				header.removeClass(this.css.sortableColumnHeaderActive).removeClass(this.css.sortableColumnHeaderHover).removeClass(this.css.sortableColumnAscending).removeClass(this.css.sortableColumnDescending).addClass(this.grid.css.headerClass).addClass(this.css.sortableColumnHeader);
			}
        },
		_virtualHorizontalScroll: function (event, args) {

			// get the current col index from args, and reinitialize the header cells 
			var start = args.startColIndex, end = args.endColIndex, i, j, cs = this.options.columnSettings, header;
			for (i = 0; i < this._headers.length; i++) {
				// 1. clear && 2. apply styles
				// set correct key/values using data()
				this._clearSortState(this._headers[i].header, i);
				header = this._headers[i].header;
				header.removeClass(this.css.sortableColumnHeaderActive).removeClass(this.css.sortableColumnHeaderHover).removeClass(this.css.sortableColumnAscending).removeClass(this.css.sortableColumnDescending).addClass(this.grid.css.headerClass).addClass(this.css.sortableColumnHeader);
				//this._applySortStyles(this._headers[i].header, i);
				// remove the column styles
			}
			for (i = start; i <= end; i++) {
				this._headers[i - start].header.data('columnIndex', i);
				for (j = 0; j < cs.length; j++) {
					if (cs[j].currentSortDirection && cs[j].columnIndex === i) {
						this._applySortStyles(this._headers[i - start].header, i);
						// don't break cause it may be multi-col sorting
					}
				}
			}
		},
	    destroy: function () {
			// unbind events, removes added sorting elements, etc. 
			var i, a, header, span, text;
			$('#' + this.element[0].id + ' th').die('dragstart', this._dragStartHandler);
			$('#' + this.element[0].id + ' th').die('mouseover', this._mouseOverHandler);
			$('#' + this.element[0].id + ' th').die('mouseout', this._mouseOutHandler);
			$('#' + this.element[0].id + ' th').die('click', this._clickHandler);
			
			$('#' + this.element[0].id + '_headers th').die('dragstart', this._dragStartHandler);
			$('#' + this.element[0].id + '_headers th').die('mouseover', this._mouseOverHandler);
			$('#' + this.element[0].id + '_headers th').die('mouseout', this._mouseOutHandler);
			$('#' + this.element[0].id + '_headers th').die('click', this._clickHandler);
			
			$('#' + this.element[0].id + ' th a').die('keydown', this._keyDownHandler);
			$('#' + this.element[0].id + ' th a').die('focus', this._focusHandler);
			$('#' + this.element[0].id + ' th a').die('blur', this._blurHandler);
			
			$('#' + this.element[0].id + '_headers th a').die('keydown', this._keyDownHandler);
			$('#' + this.element[0].id + '_headers th a').die('focus', this._focusHandler);
			$('#' + this.element[0].id + '_headers th a').die('blur', this._blurHandler);
			
			this.grid.element.unbind('iggridheadercellrendered', this._headerCellRenderedHandler);
			this.grid.element.unbind('iggridvirtualhorizontalscroll', this._virtualHorizontalScrollHandler);
			this.grid.element.unbind('iggriduidirty', this._uiDirtyHandler);
			
			delete this._blurHandler;
			delete this._clickHandler;
			delete this._headerCellRenderedHandler;
			delete this._focusHandler;
			delete this._keyDownHandler;
			delete this._mouseOutHandler;
			delete this._mouseOverHandler;
			delete this._dragStartHandler;
			delete this._uiDirtyHandler;
			delete this._virtualHorizontalScrollHandler;
			
			// remove sorted classes for columns
			this.grid.element.find('.ui-iggrid-colasc').removeClass('ui-iggrid-colasc ui-state-highlight');
			this.grid.element.find('.ui-iggrid-coldesc').removeClass('ui-iggrid-coldesc ui-state-highlight');
			
			this._clearUi(true);
			// clear styling and markup
			for (i = 0; i < this._headers.length; i++) {
				header = this._headers[i].header;
				header.removeClass('ui-iggrid-sortableheader ui-state-default ui-state-active ui-state-hover ui-state-focus');
				header.attr('title', '');
				span = header.find('a span');
				text = span.text();
				//span.remove();
				a = header.find('a');
				$('<span>' + text + '</span>').appendTo(header).addClass('ui-iggrid-headertext');
				a.remove();
				//delete header;
			}
			this._headers = null;
            $.Widget.prototype.destroy.apply(this, arguments);
			
			return this;
	    },
	    // every grid feature widget should implement this 
	    _injectGrid: function (gridInstance, isRebind) {
		    this.grid = gridInstance;
			this.grid.dataSource.settings.sorting.type = this.options.type ? this.options.type : "remote";
			//A.T. 12 Feb 2011 - Fix for #66143 - igSorting caseSensitive option doesn't change case sensitivity
			this.grid.dataSource.settings.sorting.caseSensitive = this.options.caseSensitive;
			this.grid.dataSource.settings.sorting.defaultFields = this.grid.dataSource.settings.sorting.expressions;
			this.grid.dataSource.settings.sorting.enabled = true;
			this.grid.dataSource.settings.sorting.sortUrlKey = this.options.sortUrlKey;
			this.grid.dataSource.settings.sorting.sortUrlAscValueKey = this.options.sortUrlKeyAscValue;
			this.grid.dataSource.settings.sorting.sortUrlDescValueKey = this.options.sortUrlKeyDescValue;
			
			if ($.type(this.options.customSortFunction) === 'function') {
				this.grid.dataSource.settings.sorting.customFunc = this.options.customSortFunction;
			}
			if (this._headerCellRenderedHandler !== null) {
				this.grid.element.unbind('iggridheadercellrendered', this._headerCellRenderedHandler);
			}
			if (this._uiDirtyHandler !== null) {
				this.grid.element.unbind('iggriduidirty', this._uiDirtyHandler);
			}
			this._headerCellRenderedHandler = $.proxy(this._headerCellRendered, this);
			this._uiDirtyHandler = $.proxy(this._onUIDirty, this);
			this.grid.element.bind('iggridheadercellrendered', this._headerCellRenderedHandler);
			
			this._virtualHorizontalScrollHandler = $.proxy(this._virtualHorizontalScroll, this);
			this.grid.element.bind('iggridvirtualhorizontalscroll', this._virtualHorizontalScrollHandler);

            // register for uiDirty so that sorting states are cleared when dirty  event gets fired 
			this.grid.element.bind('iggriduidirty', this._uiDirtyHandler);
			//if (!isRebind) {
			this._initDefaultSettings();
			//}
			this._clearUi();
			this._currentActiveHeader = null;
			this._currentHeader = null;
			this._currentIndex = null;
	    }
    });
    $.extend($.ui.igGridSorting, {version: '11.1.20111.1014'});
}(jQuery));

/*
 * Infragistics.Web.ClientUI Grid Paging 11.1.20111.1014
 *
 * Copyright (c) 2011 Infragistics Inc.
 * <Licensing info>
 *
 * http://www.infragistics.com/
 *
 * Depends on:
 * Depends on:
 *  jquery-1.4.4.js
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	ig.ui.grid.framework.js
 *  ig.ui.editors.js
 *  ig.ui.shared.js
 *  ig.dataSource.js
 *	ig.util.js
 */

/*global jQuery */
if (typeof (jQuery) === "undefined") {
    throw new Error("The Infragistics Grid requires jQuery to be loaded");
}

(function ($) {
    // we will define a new widget for paging. That kind of widget is completely independent one and doesn't subclass the grid 
    // it subscribes to grid events such as BodyRendered, and has the grid instance (igGrid) injected into it
    // for paging 
	/*
		igGridPaging widget -  The widget is pluggable to the element where the grid is instantiated and the actual igGrid object doesn't know about this
		the paging widget just attaches its functionality to the grid 
		the paging widget renders most of its UI in the grid footer. Optionally there can be a dropdown to choose the page size, that can be placed above the header
		keyboard navigation inside the pager is supported with TAB & SPACE/ENTER keys 
	*/
    $.widget("ui.igGridPaging", {
		/* the instance of the grid to which this feature is going to attach its functionality */
	    grid : null,
	    css : {
			/*  classes applied to the pager area */
		    "pagerClass" : "ui-widget ui-iggrid-pager ui-helper-clearfix ui-corner-bottom ui-widget-header ui-iggrid-footer",
			/* classes applied to a page link that can be clicked with the mouse */
		    "pageLink" : "ui-iggrid-pagelink ui-helper-reset",
			/* classes applied to a page container element (list item) */
			"page" : "ui-iggrid-page ui-state-default ui-corner-all",
			/* classes applied to a page list item when it's hovered */
			"pageHover": "ui-iggrid-page-hover ui-state-hover",
			/* classes applied to the UL list that holds all pages */
			"pageList" : "ui-helper-reset ui-iggrid-pagelist ui-iggrid-paging-item",
			/* classes applied to the anchor of the current page item */
		    "pageLinkCurrent" : "ui-iggrid-pagelinkcurrent",
			/* clases applied to the current page (corresponding to the current page index) */
			"pageCurrent" : "ui-iggrid-pagecurrent ui-state-active ui-corner-all", 
			/* classes applied to the current page that has focus (when keyboard anvigation is used) */
			"pageFocused" : "ui-iggrid-pagefocused ui-state-focus",
			/* classes applied to the area where the next page button and label are rendered */
			"nextPage" : "ui-iggrid-nextpage ui-iggrid-paging-item ui-state-default",
			/* classes applied to the area where the prev page button and label are rendered */
			"prevPage" : "ui-iggrid-prevpage ui-iggrid-paging-item ui-state-default", 
			/* classes applied to the area where the first page button and label are rendered */
			"firstPage" : "ui-iggrid-firstpage ui-iggrid-paging-item ui-state-default ui-corner-left", 
			/* classes applied to the area where the last page button and label are rendered */
			"lastPage" : "ui-iggrid-lastpage ui-iggrid-paging-item ui-state-default ui-corner-right",
			/* classes applied to the next page's label (span) */
			"nextPageLabel" : "ui-iggrid-nextpagelabel",
			/* classes applied to the prev page's label (span) */
			"prevPageLabel" : "ui-iggrid-prevpagelabel",
			/* classes applied to the first page's label (span) */
			"firstPageLabel" : "ui-iggrid-firstpagelabel",
			/* classes applied to the last page's label (span) */
			"lastPageLabel" : "ui-iggrid-lastpagelabel",
			/* classes applied to the next page's label (span) when it's disabled */
			"nextPageLabelDisabled" : "ui-iggrid-nextpagelabeldisabled ui-state-disabled",
			/* classes applied to the prev page's label (span) when it's disabled */
			"prevPageLabelDisabled" : "ui-iggrid-prevpagelabeldisabled ui-state-disabled",
			/* classes applied to the first page's label (span) when it's disabled */
			"firstPageLabelDisabled" : "ui-iggrid-firstpagelabeldisabled ui-state-disabled",
			/* classes applied to the last page's label (span) when it's disabled */
			"lastPageLabelDisabled" : "ui-iggrid-lastpagelabeldisabled ui-state-disabled",
			/* classes applied to the next page area that holds the span for the icon */
			"nextPageImage" : "ui-iggrid-pageimg ui-iggrid-nextpageimg ui-icon ui-icon-triangle-1-e",
			/* classes applied to the prev page area that holds the span for the icon */
			"prevPageImage" : "ui-iggrid-pageimg ui-iggrid-prevpageimg ui-icon ui-icon-triangle-1-w", 
			/* classes applied to the first page area that holds the span for the icon */
			"firstPageImage" : "ui-iggrid-pageimg ui-iggrid-firstpageimg ui-icon ui-icon-arrowstop-1-w",
			/* classes applied to the last page area that holds the span for the icon */
			"lastPageImage" : "ui-iggrid-pageimg ui-iggrid-lastpageimg ui-icon ui-icon-arrowstop-1-e", 
			/* classes applied to the next page area that holds the span for the icon when it is disabled */
			"nextPageImageDisabled" : "ui-iggrid-pageimg ui-iggrid-nextpageimgdisabled ui-icon ui-state-disabled ui-icon-triangle-1-e",
			/* classes applied to the prev page area that holds the span for the icon when it is disabled */
			"prevPageImageDisabled" : "ui-iggrid-pageimg ui-iggrid-prevpageimgdisabled ui-icon ui-state-disabled ui-icon-triangle-1-w",
			/* classes applied to the first page area that holds the span for the icon when it is disabled */
			"firstPageImageDisabled" : "ui-iggrid-pageimg ui-iggrid-firstpageimgdisabled ui-icon ui-state-disabled ui-icon-arrowstop-1-w",
			/* classes applied to the last page area that holds the span for the icon when it is disabled */
			"lastPageImageDisabled" : "ui-iggrid-pageimg ui-iggrid-lastpageimgdisabled ui-icon ui-state-disabled ui-icon-arrowstop-1-e",
			/* classes applied to the label showing how many records are rendered of some total number */
			"pagerRecordsLabel" : "ui-iggrid-pagerrecordslabel ui-iggrid-results",
			/* classes applied to the editor dropdown label from where page size can be changed */
			"pageSizeLabel" : "ui-iggrid-pagesizelabel",
			/* classes applied to the editor dropdown from where page size can be changed */
			"pageSizeDropDown" : "ui-iggrid-pagesizedropdown",
			/* classes applied to the element that holds the page size dropdown */
			"pageSizeDropDownContainer" : "ui-helper-clearfix ui-iggrid-pagesizedropdowncontainer",
			/* classes applied to the container of the page size dropdown editor, when it is rendered above the header */
			"pageSizeDropDownContainerAbove" : "ui-widget ui-helper-clearfix ui-iggrid-pagesizedropdowncontainerabove ui-iggrid-toolbar ui-widget-header and ui-corner-top", 
			/* classes applied to the element holding the editor dropdown from where the page index can be changed */
			"pageDropDownContainer" : "ui-iggrid-pagedropdowncontainer",
			/* classes applied to the spans that are before and after the dropdown editor from where the page index can be changed */
			"pageDropDownLabels" : "ui-iggrid-pagedropdownlabels", 
			/* classes applied to the editor dropdown from where the page index can be changed */
			"pageDropDown" : "ui-iggrid-pagedropdown", 
			/* classes applied to the area on the right of the footer where first, last, prev, next buttons as well as page links and page index dropdown are rendered */
			"pagerRightAreaContainer": "ui-iggrid-paging",
			/* classes applied around the label showing the currently rendered record indices out of some total value */
			"pagingResults": "ui-iggrid-results" 
	    },
	    options: {
			/* type="number" default number of records per page */
		    pageSize: 25, 
			/* type="string" the property in the response that will hold the total number of records in the data source */
			recordCountKey: null,
			/* type="string" denotes the name of the encoded URL parameter that will state what is the currently requested page size */
			pageSizeUrlKey: null,
			/* type="string" denotes the name of the encoded URL parameter that will state what is the currently requested page index */
			pageIndexUrlKey: null,
			/* type="number" current page index that's bound and rendered in the UI */
			currentPageIndex: 0,
			/* type="remote|local" type can be remote (request) or local (paging on the client-side) */
			type: "remote", 
			/* type="bool" if false, a dropdown allowing to change the page size will not be rendered in the UI */
			showPageSizeDropDown: true,
			/* type="string" label rendered in front of the page size dropdown */
			pageSizeDropDownLabel: $.ig.GridPaging.locale.pageSizeDropDownLabel,
			/* type="string" Trailing label for the page size dropdown */
			pageSizeDropDownTrailingLabel: $.ig.GridPaging.locale.pageSizeDropDownTrailingLabel,
			/* type="above|inpager" can be 'above' meaning it will be rendered above the grid header, or 'inpager' meaning that it will be rendered next to page links */
			pageSizeDropDownLocation: 'above',
			/* type="bool" option specifying whether to show summary label for the currently rendered records or not */
			showPagerRecordsLabel: true,
			/* type="string" custom pager records label template - in jQuery templating style and syntax */
			pagerRecordsLabelTemplate: $.ig.GridPaging.locale.pagerRecordsLabelTemplate,
			/* type="string" localized text for the next page label */
			nextPageLabelText: $.ig.GridPaging.locale.nextPageLabelText,
			/* type="string" localized text for the prev page label */
			prevPageLabelText: $.ig.GridPaging.locale.prevPageLabelText, 
			/* type="string" localized text for the first page label */
			firstPageLabelText: $.ig.GridPaging.locale.firstPageLabelText,
			/* type="string" localized text for the last page label */
			lastPageLabelText: $.ig.GridPaging.locale.lastPageLabelText,
			/* type="bool" option specifying whether to render the first and last page buttons */
			showFirstLastPages: true,
			/* type="bool" option specifying whether to render the previous and next page buttons */
			showPrevNextPages: true,
			/* type="string" leading label for the dropdown from where the page index can be switched */
			currentPageDropDownLeadingLabel: $.ig.GridPaging.locale.currentPageDropDownLeadingLabel, 
			/* type="string" localized trailing label for the dropdown from where the page index can be switched */
			currentPageDropDownTrailingLabel: $.ig.GridPaging.locale.currentPageDropDownTrailingLabel,
			/* type="string" custom localized tooltip for the page index dropdown */
			currentPageDropDownTooltip: $.ig.GridPaging.locale.currentPageDropDownTooltip,
			/* type="string" custom localized tooltip for the page size dropdown */
			pageSizeDropDownTooltip: $.ig.GridPaging.locale.pageSizeDropDownTooltip, 
			/* type="string" custom localized tooltip for the pager records label */
			pagerRecordsLabelTooltip: $.ig.GridPaging.locale.pagerRecordsLabelTooltip,
			/* type="string" custom localized tooltip for the prev. page button */
			prevPageTooltip: $.ig.GridPaging.locale.prevPageTooltip,
			/* type="string" custom localized tooltip for the next. page button */
			nextPageTooltip: $.ig.GridPaging.locale.nextPageTooltip,
			/* type="string" custom localized tooltip for the first. page button */
			firstPageTooltip: $.ig.GridPaging.locale.firstPageTooltip,
			/* type="string" custom localized tooltip for the last. page button */
			lastPageTooltip: $.ig.GridPaging.locale.lastPageTooltip,
			/* type="string" custom localized tooltip for a page link/button  */
			pageTooltipFormat: $.ig.GridPaging.locale.pageTooltipFormat,
			/* type="number" Default: [5, 10, 20, 25, 50, 75, 100]. contents of the page size dropdown indicating what preconfigured page sizes are available to the end user */
			pageSizeList: [], 
			/* type="number" number of pages after which we will switch to drop down rendering */
			pageCountLimit: 10,
			/* type="number" number of pages that are constantly visible. For the invisible pages, prev and next buttons are used */
			visiblePageCount: 5,
			/* type="number" dropdown width for page size and page index dropdowns */
			defaultDropDownWidth: 70
	    },
		events: {
			/* cancel="true" event fired before the page index is changed */
			pageIndexChanging: "pageIndexChanging",
			/* event fired after the page index is changed , but before grid data rebinds */
			pageIndexChanged: "pageIndexChanged",
			/* cancel="true" event fired when the page size is about to be changed from the page size dropdown */
			pageSizeChanging: "pageSizeChanging",
			/* event fired after the page size is changed from the page size dropdown */
			pageSizeChanged: "pageSizeChanged",
			/* cancel="true" event fired before the pager footer is rendered (the whole area below the grid records) */
			pagerRendering: "pagerRendering",
			/* event fired after the pager footer is rendered */
			pagerRendered: "pagerRendered"
		},
		_loadingIndicator: null,
		_isPaging: false,
	    _create: function () {
		
	    },
		_setOption: function (key, value) {
		
			var items, label, id, pager;
			
			id = this.grid.element[0].id;
			pager = $('#' + id + '_pager');
		    // handle new settings and update options hash
			$.Widget.prototype._setOption.apply(this, arguments);
			
			// options that are supported: pageSize, currentPageIndex, showFirstLastPages, showPrevNextPages, pageSizeList, 
			// nextPageLabelText, prevPageLabelText, firstPageLabelText, lastPageLabelText
			// start by throwing an error for the options that aren't supported
			if (key === 'type' || key === 'showPageSizeDropDown' || key === 'pageSizeDropDownLocation' || key === 'showPagerRecordsLabel' ||
					key === 'visiblePageCount') {
				throw new Error($.ig.Grid.locale.optionChangeNotSupported + ' ' + key);
			}
			if (key === 'pageSize') {
				this.pageSize(value);
			} else if (key === 'currentPageIndex') {
				this.pageIndex(value);
			} else if (key === 'showFirstLastPages') {
				if (value === true) {
					pager.find('.ui-iggrid-firstpage').show();
					pager.find('.ui-iggrid-lastpage').show();
				} else {
					pager.find('.ui-iggrid-firstpage').hide();
					pager.find('.ui-iggrid-lastpage').hide();
				}
			} else if (key === 'showPrevNextPages') {
				if (value === true) {
					pager.find('.ui-iggrid-prevpage').show();
					pager.find('.ui-iggrid-nextpage').show();
				} else {
					pager.find('.ui-iggrid-prevpage').hide();
					pager.find('.ui-iggrid-nextpage').hide();
				}
			} else if (key === 'pageSizeList') {
			
				if ($.type(value) === 'string') {
					items = value.split(',');
				} else {
					items = value;
				}
				if (this._pageSizeDD) {
					this._pageSizeDD.igEditor('option', 'listItems', items);
				}
			} else if (key === 'nextPageLabelText') {
				label = pager.find('.ui-iggrid-nextpagelabel');
				label = label.length === 0 ? pager.find('.ui-iggrid-nextpagelabeldisabled') : label;
				label.text(value);
			} else if (key === 'prevPageLabelText') {
				label = pager.find('.ui-iggrid-prevpagelabel');
				label = label.length === 0 ? pager.find('.ui-iggrid-prevpagelabeldisabled') : label;
				label.text(value);
			} else if (key === 'firstPageLabelText') {
				label = pager.find('.ui-iggrid-firstpagelabel');
				label = label.length === 0 ? pager.find('.ui-iggrid-firstpagelabeldisabled') : label;
				label.text(value);
			} else if (key === 'lastPageLabelText') {
				label = pager.find('.ui-iggrid-lastpagelabel');
				label = label.length === 0 ? pager.find('.ui-iggrid-nextpagelabeldisabled') : label;
				label.text(value);
			} 
	    },
		// Accepts parameters:
		// index - page index to switch to 
		pageIndex: function (index) {
			/* gets /sets the current page index, delegates data binding and paging to $.ig.DataSource 
				paramType="number" optional="true" the page index to go to
				returnType="number" optional="true" if no param is specified, returns the current page index
			*/
			if (index !== null && index !== undefined) {
				this._overrideLabel = true;
				this.options.currentPageIndex = index;
			}
			// fire partial dirty event - currently used only in Selection - cause we just need to call clearSelection without clearing any visual states or reset the whole UI 
			// we cannot use UI Dirty cause if we trigger this event here it means behaviors such as *Sorting* (not Selection!) will reset their whole state, and we want to keep the
			// data sorted (for example) while paging locally
			this.grid.element.trigger('iggriduisoftdirty', {owner: this});
			return this.grid.dataSource.pageIndex(index);
		},
		// Accepts parameters:
		// size - page size 
		pageSize: function (size) {
			/* gets / sets the page Size. if no parameter is specified, just returns the current page size
				paramType="number" optional="true" the page size 
				returnType="number" optional="true" if no param is specified, returns the current page size
			*/
			var noCancel = true;
			if (size) {
				this.grid.dataSource.settings.paging.pageIndex = 0;
				this.options.currentPageIndex = 0;
				// trigger DataBinding / DataBound
				noCancel = this.grid._trigger(this.grid.events.dataBinding, null, {owner: this.grid});
				if (noCancel) {
					this.grid._fireDataBoundInternal = true;
					this.grid.dataSource.pageSize(size);
				}
				//A.T. 14 Feb 2011 - fix for bug #65975
				// update page size dropdown
				if (this._pageSizeDD) {
					this._pageSizeDD.igEditor('value', size);
				}
			} else {
				return this.grid.dataSource.pageSize();
			}
		},
		_initLoadingIndicator: function () {
			// attach loading indicator widget
			this._loadingIndicator = this.grid.container().igLoading().data("igLoading").indicator();
		},
		_nextPage: function () {
			var noCancel = true, noCancelBinding = true;
			noCancel = this._trigger(this.events.pageIndexChanging, null, {newPageIndex: this.options.currentPageIndex + 1, currentPageIndex: this.options.currentPageIndex, owner: this});
			if (noCancel) {
				if (this.options.currentPageIndex >= this.grid.dataSource.pageCount() - 1) {
					return;
				} else {
					this.options.currentPageIndex = this.options.currentPageIndex + 1;
				}
				noCancelBinding = this.grid._trigger(this.grid.events.dataBinding, null, {owner: this.grid});
				this._shouldFirePageIndexChanged = true;
				if (noCancelBinding) {
					this.grid._fireDataBoundInternal = true;
					this._showLoading();
					this._overrideLabel = true;
					this.grid.dataSource.nextPage();
				}
				this.grid.element.trigger('iggriduisoftdirty', {owner: this});
				//this._trigger(this.events.pageIndexChanged, null, {pageIndex: this.options.currentPageIndex, owner: this});
			}
		},
		_prevPage: function () {
			var noCancel = true, noCancelBinding = true;
			noCancel = this._trigger(this.events.pageIndexChanging, null, {newPageIndex: this.options.currentPageIndex - 1, currentPageIndex: this.options.currentPageIndex, owner: this});
			if (noCancel) {
				if (this.options.currentPageIndex === 0) {
					return;
				} else {
					this.options.currentPageIndex = this.options.currentPageIndex - 1;
				}
				noCancelBinding = this.grid._trigger(this.grid.events.dataBinding, null, {owner: this.grid});
				this._shouldFirePageIndexChanged = true;
				if (noCancelBinding) {
					this._showLoading();
					this._overrideLabel = true;
					this.grid._fireDataBoundInternal = true;
					this.grid.dataSource.prevPage();
				}
				this.grid.element.trigger('iggriduisoftdirty', {owner: this});
				//this._trigger(this.events.pageIndexChanged, null, {pageIndex: this.options.currentPageIndex, owner: this});
			}
		},
		_firstPage: function () {
			var noCancel = true, noCancelBinding = true;
			noCancel = this._trigger(this.events.pageIndexChanging, null, {newPageIndex: 0, currentPageIndex: this.options.currentPageIndex, owner: this});
			if (noCancel) {
				noCancelBinding = this.grid._trigger(this.grid.events.dataBinding, null, {owner: this.grid});
				this._shouldFirePageIndexChanged = true;
				if (noCancelBinding) {
					this._showLoading();
					this.grid._fireDataBoundInternal = true;
					this.pageIndex(0);
				}
				//this._trigger(this.events.pageIndexChanged, null, {pageIndex: 0, owner: this});
			}
		},
		_lastPage: function () {
			var noCancel = true, noCancelBinding = true;
			noCancel = this._trigger(this.events.pageIndexChanging, null, {newPageIndex: this.grid.dataSource.pageCount() - 1, currentPageIndex: this.options.currentPageIndex, owner: this});
			if (noCancel) {
				noCancelBinding = this.grid._trigger(this.grid.events.dataBinding, null, {owner: this.grid});
				this._shouldFirePageIndexChanged = true;
				if (noCancelBinding) {
					this._showLoading();
					this.grid._fireDataBoundInternal = true;
					this.pageIndex(this.grid.dataSource.pageCount() - 1);
				}
				//this._trigger(this.events.pageIndexChanged, null, {pageIndex: this.grid.dataSource.pageCount() - 1, owner: this});
			}
		},
		_showLoading: function () {
			this._loadingIndicator.show();
		},
		_hideLoading: function () {
			this._loadingIndicator.hide();
		},
	    _bindEvents: function (pagerElement) {
		    var paging = this, grid = this.grid, noCancel = true, id, noCancelBinding = true;
			id = '#' + grid.element[0].id + '_pager';
		    $(id + ' li a').bind({
			    mousedown: function (event) {
				    // page changed 
					var newIndex = $(event.target).parent().data('pageIndex');
					if ($.type(newIndex) === "number" && newIndex !== paging.options.currentPageIndex) {
						// fire PageIndexChanging
						noCancel = paging._trigger(paging.events.pageIndexChanging, event, {newPageIndex: newIndex, currentPageIndex: paging.options.currentPageIndex, owner: paging});
						paging._shouldFirePageIndexChanged = true;
						if (noCancel) {
							noCancelBinding = paging.grid._trigger(paging.grid.events.dataBinding, null, {owner: paging.grid});
							if (noCancelBinding) {
								paging._showLoading(grid.element.children("tbody"));
								paging.grid._fireDataBoundInternal = true;
								paging.pageIndex(newIndex);
							}
							// decide exactly when should the pageIndexChanged event fire
							//paging._trigger(paging.events.pageIndexChanged, event, {pageIndex: paging.options.currentPageIndex, owner: paging});
						}
					}
			    }
			});
			
			// hover styles
			$(id + ' li').bind({
				mouseover: function (event) {
					$(event.currentTarget).addClass(paging.css.pageHover);
				},
				mouseout: function (event) {
					$(event.currentTarget).removeClass(paging.css.pageHover);
				}
			});
	    },
		_gridRendered: function (gridContainer) {
		
			if (this.options.showPageSizeDropDown === true && this.options.pageSizeDropDownLocation === 'above' && !this._pageSizeDropDownRendered) {
				// the second arg means prepend not append if it is true
				this._renderPageSizeDropDown(gridContainer, true);
				if (this.grid.options.autoAdjustHeight) {
					this.grid._initializeHeights();
				}
				// remove rounded corners from the caption, if any
				if (this.grid.options.caption !== null) {
					$('#' + this.grid.element[0].id + '_caption').removeClass('ui-corner-top');
				}
			} 
	    },
	    _dataRendered: function () {
		    var id = this.grid.element[0].id,
				pageCount,
				i,
				html,
				// construct pager div
				pagerHtml = '<div id="' + id +  '_pager"></div>',
				pageLinkHtml = '<li class="${pageClass}"><a class="${pageLinkClass}" href="javascript:void(0);">${page}</a></li>',
				pager = null,
				startRecord = 0,
				endRecord = 0,
				recordsCount = 0,
				localRecordsCount = 0,
				noCancel = true,
				pageList,
				pagesArray,
				dropDownContainer,
				startPageIndex = 0,
				endPageIndex = 0,
				template = this.options.pagerRecordsLabelTemplate,
				self = this,
				pagerRight = null,
				vpc = this.options.visiblePageCount,
				val = 0,
				recordsLabel = null;
			this._deleteOld();
			noCancel = this._trigger(this.events.pagerRendering, null, {dataSource: this.grid.dataSource, owner: this});
			
			if (noCancel) {
				
				if (this.grid._shouldResetPaging) {
					this.options.currentPageIndex = 0;
					this.grid._shouldResetPaging = false;
				}
				// empty everything but the summary label
				if ($('#' + id + '_pager_label').length > 0) {
					$('#' + id + '_pager .ui-iggrid-paging').remove();
				} else {
					$('#' + id + '_pager').empty();
				}
				
				this._initLoadingIndicator();
				
				if (this.grid.dataSource.pageSizeDirty()) {
					this.options.currentPageIndex = this.grid.dataSource.pageIndex();
					this.grid.dataSource.pageSizeDirty(false);
				}
				// check if we have virtualization enabled or not
				if ($('#' + id + '_pager').length === 0) {
					id = this.grid.element[0].id;
					pager = $(pagerHtml).appendTo('#' + id + '_container');
				} else {
					pager = $('#' + id + '_pager');
				}
				// apply pager class
				pager.addClass(this.css.pagerClass);
				if (this.options.showPagerRecordsLabel) {
					// calculate startRecord and endRecord
					recordsCount = this.grid.dataSource.totalRecordsCount() > 0 ? this.grid.dataSource.totalRecordsCount() : this.grid.dataSource.totalLocalRecordsCount();
					startRecord = this.options.currentPageIndex === 0 ? 1 : this.options.currentPageIndex * this.pageSize() + 1;

					// special case when there is filtering (Bug #67998)
					if (this.grid.dataSource._filter) {
						recordsCount = this.grid.dataSource._filteredData.length;
						localRecordsCount = this.grid.dataSource._filteredData.length;
					} else {
						localRecordsCount = this.grid.dataSource.totalLocalRecordsCount();
					}
					endRecord = this.options.currentPageIndex === 0 ? this.pageSize() : startRecord + this.pageSize() > recordsCount ? recordsCount : (startRecord - 1) + this.pageSize();

					if (this.grid.dataSource.totalLocalRecordsCount() === 0) {
						startRecord = 0;
					}
					// check if dataView has less records than page size
					if (endRecord > localRecordsCount && this.options.type === "local") {
						endRecord = localRecordsCount;
					}
					// render label
					if (this._overrideLabel || !this.grid.dataSource._filter) {
						$('#' + pager[0].id + '_label').remove();
						template = template.replace('${startRecord}', startRecord).replace('${endRecord}', endRecord).replace('${recordCount}', recordsCount);
						recordsLabel = $('<span>' + template + '</span>').appendTo(pager).attr('id', pager[0].id + '_label').addClass(this.css.pagerRecordsLabel).attr('title', this.options.pagerRecordsLabelTooltip).show();
					} else if ($('#' + pager[0].id + '_label').length === 0) {
						recordsLabel = $('<span></span>').appendTo(pager).attr('id', pager[0].id + '_label').addClass(this.css.pagerRecordsLabel).attr('title', this.options.pagerRecordsLabelTooltip).show();
					}
					if (recordsLabel) {
						recordsLabel.data('hideflag', false);
					}
					$(pager[0].id + '_label').show();
					this._overrideLabel = false;
				}
				// get page count from the data source and render a span for each page index
				pageCount = this.grid.dataSource.pageCount();
				// A.T. render the container for first page, prev page, the page links, next page and last page
				pagerRight = $('<div></div>').appendTo(pager).addClass(this.css.pagerRightAreaContainer);
				if (this.options.showFirstLastPages === true) {
					this._renderFirstPage(pagerRight);
				}
				if (this.options.showPrevNextPages === true) {
					this._renderPrevPage(pagerRight);
				}
				// if the pageCountLimit is exceeded, switch to dropdown rendering automatically ! 
				if (this.grid.dataSource.pageCount() <= this.options.pageCountLimit) {
					pageList = $('<ul></ul>').appendTo(pagerRight).addClass(this.css.pageList);
					$('#' + id + '_pager li a').live({
						keydown: function (event) {
							if (event.keyCode === $.ui.keyCode.ENTER || event.keyCode === $.ui.keyCode.SPACE) {
								self.pageIndex($(event.currentTarget).closest('li').data('pageIndex'));
								event.stopPropagation();
								event.preventDefault();
							}
						},
						focus: function (event) {
							$(event.currentTarget).closest('li').addClass(self.css.pageFocused);
						},
						blur: function (event) {
							$(event.currentTarget).closest('li').removeClass(self.css.pageFocused);
						}
					});
					
					val = Math.floor(parseInt(vpc, 10) / 2);
					// we will render the number of page links specified by visiblePageCount
					startPageIndex = this.options.currentPageIndex - val;
					if (startPageIndex < 0) {
						startPageIndex = 0;
					}
					endPageIndex = this.options.currentPageIndex + val;
					// compensate the indices, so that we always get the same count
					if (this.options.currentPageIndex - startPageIndex < val) {
						endPageIndex += val - (this.options.currentPageIndex - startPageIndex);
					}
					if (this.grid.dataSource.pageCount() - (this.options.currentPageIndex + 1) < val && vpc % 2 !== 0) {
						startPageIndex = startPageIndex - (val - (this.grid.dataSource.pageCount() - (this.options.currentPageIndex + 1)));
					}
					if (endPageIndex >= this.grid.dataSource.pageCount()) {
						endPageIndex = this.grid.dataSource.pageCount() - 1;
					}
					if (startPageIndex < 0) {
						startPageIndex = 0;
					}
					if (vpc % 2 === 0 && endPageIndex - startPageIndex < vpc - 1) {
						startPageIndex -= (vpc - 1) - (endPageIndex - startPageIndex);
					}
					if (startPageIndex < 0) {
						startPageIndex = 0;
					}
					for (i = startPageIndex; i <= endPageIndex && i - startPageIndex < vpc; i++) {
						html = pageLinkHtml.replace('${page}', (i + 1)).replace('${pageLinkClass}', i === this.options.currentPageIndex ? this.css.pageLinkCurrent : this.css.pageLink);
						html = html.replace('${pageClass}', i === this.options.currentPageIndex ? this.css.pageCurrent : this.css.page);
						$(html).appendTo(pageList).attr('title', this.options.pageTooltipFormat.replace('${index}', i + 1)).data('pageIndex', i);
					}
				} else {
					// render dropdown
					pagesArray = [];
					for (i = 1; i <= pageCount; i++) {
						pagesArray.push(i + this._empty());
					}
					// create the igEditor
					dropDownContainer = $('<div></div>').appendTo(pagerRight).addClass(this.css.pageDropDownContainer).attr('title', this.options.currentPageDropDownTooltip);
					$('<span></span>').appendTo(dropDownContainer).text(this.options.currentPageDropDownLeadingLabel).addClass(this.css.pageDropDownLabels);
					// render igEditor now
					this._curPageDD = $('<span />').css('display', 'none').appendTo(dropDownContainer).addClass(this.css.pageDropDownContainer).igEditor({
						listItems: pagesArray,
						readOnly: false,
						listMatchOnly: true,
						width: this.options.defaultDropDownWidth,
						nullable: false,
						listAutoComplete: true,
						button: 'dropdown',
						type: 'text',
						value: this.options.currentPageIndex + 1,
						dropDownTriggers: 'button,focus',
						textChanged: $.proxy(this._dropDownPageIndex, this)
					}).css('display', '');
					// render trailing label
					$('<span></span>').appendTo(dropDownContainer).text(this.options.currentPageDropDownTrailingLabel.replace('${count}', this.grid.dataSource.pageCount())).addClass(this.css.pageDropDownLabels);
				}
				
				if (this.options.showPrevNextPages === true) {
					this._renderNextPage(pagerRight);
				}
				if (this.options.showFirstLastPages === true) {
					this._renderLastPage(pagerRight);
				}
					
				if (this.options.showPageSizeDropDown && this.options.pageSizeDropDownLocation === 'inpager') {
					this._renderPageSizeDropDown(pagerRight);
				}
				this._bindEvents(pager);
				// hide loading message
				this._hideLoading(this.grid.element.children("tbody"));
				pager.show();
				// fire pager rendered event 
				this._trigger(this.events.pagerRendered, null, {dataSource: this.grid.dataSource, owner: this});
	
				if (this._shouldFirePageIndexChanged) {
					this._shouldFirePageIndexChanged = false;
					this._trigger(this.events.pageIndexChanged, null, {pageIndex: this.options.currentPageIndex, owner: this});
				}
			}
	    },
		_dropDownPageIndex: function (event, args) {
			var noCancel = true, noCancelBinding = true;
			noCancel = this._trigger(this.events.pageIndexChanging, null, {newPageIndex: parseInt(args.text, 10), currentPageIndex: this.options.currentPageIndex, owner: this});
			if (noCancel) {
				noCancelBinding = this.grid._trigger(this.grid.events.dataBinding, null, {owner: this.grid});
				if (noCancelBinding) {
					if (args.text) {
						this.pageIndex(parseInt(args.text, 10) - 1);
					}
					this.grid._fireDataBoundInternal = true;
				}
				this.grid.element.trigger('iggriduisoftdirty', {owner: this});
				this._shouldFirePageIndexChanged = true;
				//this._trigger(this.events.pageIndexChanged, null, {pageIndex: this.options.currentPageIndex, owner: this});
			}
		},
		_renderPrevPage: function (pager) {
			// we render one div, which has one span for the prev image, and one span for the prev text
			var prev, self = this, imgspan;
			prev = $('<div></div>').appendTo(pager).addClass(this.css.prevPage).attr('title', this.options.prevPageTooltip);
			if (this.options.currentPageIndex === 0) {	
				$('<span></span>').appendTo(prev).addClass(this.css.prevPageImageDisabled);
				$('<span></span>').appendTo(prev).addClass(this.css.prevPageLabelDisabled).append(this.options.prevPageLabelText);
			} else {
				prev.bind('mousedown', $.proxy(this._prevPage, this));
				imgspan = $('<span></span>').appendTo(prev).addClass(this.css.prevPageImage);
				$('<span></span>').appendTo(prev).addClass(this.css.prevPageLabel).append(this.options.prevPageLabelText);
				imgspan.wrap('<a href="javascript:void(0);"></a>');
				imgspan.parent().bind({
					keydown: function (event) {
						if (event.keyCode === $.ui.keyCode.ENTER || event.keyCode === $.ui.keyCode.SPACE) {
							self._prevPage();
							event.stopPropagation();
							event.preventDefault();
						}
					},
					focus: function (event) {
						$(event.currentTarget).closest('div').removeClass('ui-state-default').addClass('ui-state-focus');
					},
					blur: function (event) {
						$(event.currentTarget).closest('div').removeClass('ui-state-focus').addClass('ui-state-default');
					}
				});
			}
		},
		_renderNextPage: function (pager) {
			// we render one div, which has one span for the next image, and one span for the next text
			var next, recordsCount, self = this, imgspan;
			
			next = $('<div></div>').appendTo(pager).addClass(this.css.nextPage).attr('title', this.options.nextPageTooltip);
			recordsCount = this.grid.dataSource.totalRecordsCount() > 0 ? this.grid.dataSource.totalRecordsCount() : this.grid.dataSource.data().length;
			if (this.options.currentPageIndex === this.grid.dataSource.pageCount() - 1) {	
				$('<span></span>').appendTo(next).addClass(this.css.nextPageLabelDisabled).append(this.options.nextPageLabelText);
				$('<span></span>').appendTo(next).addClass(this.css.nextPageImageDisabled);
			} else {
				next.bind('mousedown', $.proxy(this._nextPage, this));
				$('<span></span>').appendTo(next).addClass(this.css.nextPageLabel).append(this.options.nextPageLabelText);
				imgspan = $('<span></span>').appendTo(next).addClass(this.css.nextPageImage);
				imgspan.wrap('<a href="javascript:void(0);"></a>');
				imgspan.parent().bind({
					keydown: function (event) {
						if (event.keyCode === $.ui.keyCode.ENTER || event.keyCode === $.ui.keyCode.SPACE) {
							self._nextPage();
							event.stopPropagation();
							event.preventDefault();
						}
					},
					focus: function (event) {
						$(event.currentTarget).closest('div').removeClass('ui-state-default').addClass('ui-state-focus');
					},
					blur: function (event) {
						$(event.currentTarget).closest('div').removeClass('ui-state-focus').addClass('ui-state-default');
					}
				});
			}
		},
		_renderFirstPage: function (pager) {
		
			var first, self = this, imgspan;
			
			first = $('<div></div>').appendTo(pager).addClass(this.css.firstPage).attr('title', this.options.firstPageTooltip);
			
			if (this.options.currentPageIndex === 0) {	
				$('<span></span>').appendTo(first).addClass(this.css.firstPageImageDisabled);
				$('<span></span>').appendTo(first).addClass(this.css.firstPageLabelDisabled).append(this.options.firstPageLabelText);
			} else {
				first.bind('mousedown', $.proxy(this._firstPage, this));
				imgspan = $('<span></span>').appendTo(first).addClass(this.css.firstPageImage);
				$('<span></span>').appendTo(first).addClass(this.css.firstPageLabel).append(this.options.firstPageLabelText);
				
				imgspan.wrap('<a href="javascript:void(0);"></a>');

				imgspan.parent().bind({
					keydown: function (event) {
						if (event.keyCode === $.ui.keyCode.ENTER || event.keyCode === $.ui.keyCode.SPACE) {
							self._firstPage();
							event.stopPropagation();
							event.preventDefault();
						}
					},
					focus: function (event) {
						$(event.currentTarget).closest('div').removeClass('ui-state-default').addClass('ui-state-focus');
					},
					blur: function (event) {
						$(event.currentTarget).closest('div').removeClass('ui-state-focus').addClass('ui-state-default');
					}
				});
			}
		},
		_renderLastPage: function (pager) {
			// we render one div, which has one span for the next image, and one span for the next text
			var last, self = this, imgspan;
			
			last = $('<div></div>').appendTo(pager).addClass(this.css.lastPage).attr('title', this.options.lastPageTooltip);
			if (this.options.currentPageIndex === this.grid.dataSource.pageCount() - 1) {	
				$('<span></span>').appendTo(last).addClass(this.css.lastPageLabelDisabled).append(this.options.lastPageLabelText);
				$('<span></span>').appendTo(last).addClass(this.css.lastPageImageDisabled);
			} else {
				last.bind('mousedown', $.proxy(this._lastPage, this));
				$('<span></span>').appendTo(last).addClass(this.css.lastPageLabel).append(this.options.lastPageLabelText);
				imgspan = $('<span></span>').appendTo(last).addClass(this.css.lastPageImage);
				imgspan.wrap('<a href="javascript:void(0);"></a>');
				imgspan.parent().bind({
					keydown: function (event) {
						if (event.keyCode === $.ui.keyCode.ENTER || event.keyCode === $.ui.keyCode.SPACE) {
							self._lastPage();
							event.stopPropagation();
							event.preventDefault();
						}
					},
					focus: function (event) {
						$(event.currentTarget).closest('div').removeClass('ui-state-default').addClass('ui-state-focus');
					},
					blur: function (event) {
						$(event.currentTarget).closest('div').removeClass('ui-state-focus').addClass('ui-state-default');
					}
				});
			}
		},
		_renderPageSizeDropDown: function (parent, prepend) {
			// render label here 
			var editorId = this.grid.id() + '_editor', cClass, items;
			
			cClass = this.options.pageSizeDropDownLocation === 'above' ? this.css.pageSizeDropDownContainerAbove : this.css.pageSizeDropDownContainer;
			if (prepend) {
				parent = $('<div></div>').prependTo(parent).addClass(cClass);
			} else {
				parent = $('<div></div>').appendTo(parent).addClass(cClass);
			}
			parent.attr('title', this.options.pageSizeDropDownTooltip);
			parent = $('<div></div>').appendTo(parent).addClass(this.css.pagingResults);
			if (prepend) {
				$('<span>' + this.options.pageSizeDropDownTrailingLabel + '</span>').prependTo(parent).addClass(this.css.pageSizeLabel);
				$('<span></span>').prependTo(parent).attr('id', editorId).addClass(this.css.pageSizeDropDown);
				$('<span>' + this.options.pageSizeDropDownLabel + '</span>').prependTo(parent).addClass(this.css.pageSizeLabel);
			} else {
				$('<span>' + this.options.pageSizeDropDownLabel + '</span>').appendTo(parent).addClass(this.css.pageSizeLabel);
				$('<span></span>').appendTo(parent).attr('id', editorId).addClass(this.css.pageSizeDropDown);
				$('<span>' + this.options.pageSizeDropDownTrailingLabel + '</span>').appendTo(parent).addClass(this.css.pageSizeLabel);
			}
			items = (this.options.pageSizeList === null || this.options.pageSizeList.length === 0) ? [5, 10, 20, 25, 50, 75, 100] : this.options.pageSizeList;
			
			if ($.type(items) === 'string') {
				items = items.split(',');
			}
			this._pageSizeDD = $('#' + editorId).css('display', 'none').igEditor({
				width: this.options.defaultDropDownWidth,
				button: 'dropdown',
				dropDownOnReadOnly: true,
				listItems: items,
				listMatchOnly: true,
				readOnly: true,
				textAlign: 'left',
				type: 'numeric',
				value: this.pageSize(),
				textChanged: $.proxy(this._changePageSize, this)
			}).css('display', '');
			this._pageSizeDropDownRendered = true;
		},
		_changePageSize: function (event, args) {
		
			var noCancel = true, size =  parseInt(args.text, 10);
			noCancel = this._trigger(this.events.pageSizeChanging, null, {currentPageSize: this.pageSize(), newPageSize: size, owner: this});
			if (noCancel) {
				this.pageSize(size);
				this._trigger(this.events.pageSizeChanged, null, {pageSize: size, owner: this});
                // trigger UI dirty on the grid
                this.grid.element.trigger('iggriduidirty', {owner: this});
			}
		},
		_deleteOld: function (destroy) {
			if (this._curPageDD) {
				this._curPageDD.igEditor('destroy');
				delete this._curPageDD;
			}
			if (this._pageSizeDD && (destroy || this.options.pageSizeDropDownLocation === 'inpager')) {
				this._pageSizeDD.igEditor('destroy');
				delete this._pageSizeDD;
			}
		},
	    destroy: function () {
			// destroys the igGridPaging feature by removing all elements in the pager area, unbinding events, and resetting data to discard data filtering on paging
			var pager = $('#' + this.grid.element[0].id + '_pager');
			// rebind the grid by setting pageSize to 0
			this.pageSize(0);
			this._deleteOld(true);
			// unbind events and remove elements
			if (this.options.showPageSizeDropDown === true && this.options.pageSizeDropDownLocation === 'above') {
				$('#' + this.grid.container()[0].id + ' .ui-iggrid-pagesizedropdowncontainerabove').remove();
			}
			// jQuery's remove is recursive and should take care of unregistering all events and removing all child elements
			pager.remove();
			$.Widget.prototype.destroy.call(this);
			return this;
	    },
	    // every grid feature widget should implement this 
	    _injectGrid: function (gridInstance, isRebind) {
		    this.grid = gridInstance;
			// delegate to the data source all paging options
			this.grid.dataSource.settings.paging.type = this.options.type ? this.options.type : "remote";
			//if (!isRebind) {
			this.grid.dataSource.settings.paging.pageIndex = this.options.currentPageIndex;
			//} else {
			//	this.grid.dataSource.settings.paging.pageIndex = 0;
			//	this.options.currentPageIndex = 0;
			//}
			this.grid.dataSource.settings.paging.pageSize = parseInt(this.options.pageSize, 10);
			if (this.options.pageSizeUrlKey !== null && this.options.pageIndexUrlKey) {
				this.grid.dataSource.settings.paging.pageSizeUrlKey = this.options.pageSizeUrlKey;
				this.grid.dataSource.settings.paging.pageIndexUrlKey = this.options.pageIndexUrlKey;
			}
			if (this.options.recordCountKey !== null) {
				this.grid.dataSource.settings.responseTotalRecCountKey = this.options.recordCountKey;
			}
			this.grid.dataSource.settings.paging.enabled = true;
			
			//A.T 13 April 2011 - fix for bug #72431
			if (this._pageSizeDD) {
				this._pageSizeDD.igEditor('option', 'value', this.options.pageSize);
			}
	    },
		_empty: function () {
			return "";
		}
    });
    $.extend($.ui.igGridPaging, {version: '11.1.20111.1014'});
}(jQuery));


/*
 * Infragistics.Web.ClientUI Grid Sorting 11.1.20111.1014
 *
 * Copyright (c) 2011 Infragistics Inc.
 * <Licensing info>
 *
 * http://www.infragistics.com/
 *
 * Depends on:
 *  jquery-1.4.4.js
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	ig.ui.grid.framework.js
 *  ig.ui.editors.js
 *  ig.ui.shared.js
 *  ig.dataSource.js
 *	ig.util.js
 */
 
/*global jQuery window */
if (typeof (jQuery) === "undefined") {
    throw new Error("The Infragistics Grid requires jQuery to be loaded");
}

(function ($) {
	/*
		igGridFiltering widget. The widget is pluggable to the element where the grid is instantiated and the actual igGrid object doesn't know about this
		the filtering widget just attaches its functionality to the grid
		it supports filtering dropdowns with various predefined filtering expressions based on the column type 
		the widget also implements has full keyboard support with the TAB , SPACE/ENTER keys. 
	*/
    $.widget("ui.igGridFiltering", {
		/* reference to the grid on which this filtering widget is instantiated */
		grid: null,
		options: {
			/* type="bool". Enables / disables filtering case sensitivity */
			caseSensitive: false,
			//dropDownAnimations: true,
			/* type="bool" if false, the filter summary row (in the footer) will only be visible when paging is enabled (or some other feature that renders a footer) */
			filterSummaryAlwaysVisible: true,
			/* type="string" summary template that will appear in the bottom left corner of the footer. Has the format "${matches} matching records" */
			filterSummaryTemplate: $.ig.GridFiltering.locale.filterSummaryTemplate,
			/* type="linear|none" type of animations for the column filter dropdowns */
			filterDropDownAnimations: "linear",
			/* type="number" animation duration in milliseconds for the filter dropdown animations */
			filterDropDownAnimationDuration: 500,
			/* type="object" width of the column filter dropdowns (both numeric or string are accepted) */
			filterDropDownWidth: 0,
			/* type="object" height of the column filter dropdowns (both numeric or string are accepted) */
			filterDropDownHeight: 0,
			/* type="string" URL key name that specifies how the filtering expressions will eb encoded for remote requests, e.g. &filter('col') = startsWith. Default is OData */
			filterExprUrlKey: null,
			/* type="bool" if true, all predefined filters in the filter dropdowns will have icons rendered in front of the text */
			filterDropDownItemIcons: true,
			/* type="object" a list of column settings that specifies custom filtering options on a per column basis */
			columnSettings: [
				{
					/* type="string" column key. this is a required property in every column setting if columnIndex is not set */
					columnKey: null,
					/* type="number" column index. Can be used in place of column key. the preferred way of populating a column setting is to always use the column keys as identifiers */
					columnIndex: null,
					/* type="bool" enables disables filtering for the column */
					allowFiltering: true,
					/* type="empty|notEmpty|null|notNull|equals|doesNotEqual|startsWith|contains|doesNotContain|endsWith|greaterThan|lessThan|greaterThanOrEqualTo|lessThanOrEqualTo|true|false|on|notOn|before|after|today|yesterday|thisMonth|lastMonth|nextMonth|thisYear|nextYear|lastYear" default filtering condition for the column */
					condition: null
				}
			],
			/* type="remote|local" type of filtering - Local or Remote, delegates all filtering functionality to the $.ig.DataSource */
			type: "remote",
			/* type="number" filter delay when an end user starts typing a filter expression in the column editor. (in milliseconds). Before this time passes, no filtering request will be made */
			filterDelay: 500,
			/* type="simple|advanced" Simple filtering renders just a filter row, while advanced allows to configure multiple filters from a dialog - Excel style. Default is 'simple' for non-virtualized grids, and 'advanced' when virtualization is enabled */
			mode: null,
			/* type="bool" when false (default) no editors will be rendered in the advanced mode */
			advancedModeEditorsVisible: false,
			/* type="left|right" location of the advanced filtering button when advancedModeEditorsVisible is false (i.e. when the button is rendered in the header) */
			advancedModeHeaderButtonLocation: "left",
			/* showEditorsOnClick: false, // when true, editors will not be rendered for every column, and one shared editor will be reused */
			/* type="object" can be both number or string (px) default filter dialog width (used for Advanced filtering) */
			filterDialogWidth: 350,
			/* type="object" can be both number or string (px or empty) default filter dialog height (used for Advanced filtering)  */
			filterDialogHeight: '',
			/* type="object" width of the filtering condition dropdowns in the advanced filter dialog */
			filterDialogFilterDropDownDefaultWidth: 80,
			/* type="object" width of the filtering expression input boxes in the advanced filter dialog */
			filterDialogExprInputDefaultWidth: 80,
			/* type="object" width of the column chooser dropdowns in the advanced filtering dialog */
			filterDialogColumnDropDownDefaultWidth: null,
			/* showFilterDialogClearAllButton: true, // if false, doesn't render the "Clear ALL" button link in the advanced filtering dialog */
			/* type="bool" if false, no filter dropdown buttons will be rendered and predefined list of filters will not be rendered for the columns */
			renderFilterButton: true,
			/* type="left|right" the filtering button for filter dropdowns can be rendered either on the left of the filter editor or on the right */
			filterButtonLocation: "left",
			/* list of configurable and localized null texts that will be used for the filter editors */
			nullTexts: {
				"startsWith": $.ig.GridFiltering.locale.startsWithNullText,
				"endsWith": $.ig.GridFiltering.locale.endsWithNullText,
				"contains": $.ig.GridFiltering.locale.containsNullText,
				"doesNotContain": $.ig.GridFiltering.locale.doesNotContainNullText,
				"equals": $.ig.GridFiltering.locale.equalsNullText,
				"doesNotEqual": $.ig.GridFiltering.locale.doesNotEqualNullText,
				"greaterThan": $.ig.GridFiltering.locale.greaterThanNullText,
				"lessThan": $.ig.GridFiltering.locale.lessThanNullText,
				"greaterThanOrEqualTo": $.ig.GridFiltering.locale.greaterThanOrEqualToNullText,
				"lessThanOrEqualTo": $.ig.GridFiltering.locale.lessThanOrEqualToNullText,
				"on": $.ig.GridFiltering.locale.onNullText,
				"notOn": $.ig.GridFiltering.locale.notOnNullText,
				"thisMonth": $.ig.GridFiltering.locale.thisMonthLabel,
				"lastMonth": $.ig.GridFiltering.locale.lastMonthLabel,
				"nextMonth": $.ig.GridFiltering.locale.nextMonthLabel,
				"thisYear": $.ig.GridFiltering.locale.thisYearLabel,
				"lastYear": $.ig.GridFiltering.locale.lastYearLabel,
				"nextYear": $.ig.GridFiltering.locale.nextYearLabel,
				"empty": $.ig.GridFiltering.locale.emptyNullText,
				"notEmpty": $.ig.GridFiltering.locale.notEmptyNullText,
				"null": $.ig.GridFiltering.locale.nullNullText,
				"notNull": $.ig.GridFiltering.locale.notNullNullText
			},
			/* a list of configurable and localized labels that will be used for teh predefnied filtering conditions in the filter dropdowns */ 
			labels: {
				noFilter: $.ig.GridFiltering.locale.noFilterLabel,
				clear: $.ig.GridFiltering.locale.clearLabel,
				startsWith: $.ig.GridFiltering.locale.startsWithLabel,
				endsWith: $.ig.GridFiltering.locale.endsWithLabel,
				contains: $.ig.GridFiltering.locale.containsLabel,
				doesNotContain: $.ig.GridFiltering.locale.doesNotContainLabel,
				equals: $.ig.GridFiltering.locale.equalsLabel,
				doesNotEqual: $.ig.GridFiltering.locale.doesNotEqualLabel,
				greaterThan: $.ig.GridFiltering.locale.greaterThanLabel,
				lessThan: $.ig.GridFiltering.locale.lessThanLabel,
				greaterThanOrEqualTo: $.ig.GridFiltering.locale.greaterThanOrEqualToLabel,
				lessThanOrEqualTo: $.ig.GridFiltering.locale.lessThanOrEqualToLabel,
				trueLabel: $.ig.GridFiltering.locale.trueLabel,
				falseLabel: $.ig.GridFiltering.locale.falseLabel,
				after: $.ig.GridFiltering.locale.afterLabel,
				before: $.ig.GridFiltering.locale.beforeLabel,
				today: $.ig.GridFiltering.locale.todayLabel,
				yesterday: $.ig.GridFiltering.locale.yesterdayLabel,
				thisMonth: $.ig.GridFiltering.locale.thisMonthLabel,
				lastMonth: $.ig.GridFiltering.locale.lastMonthLabel,
				nextMonth: $.ig.GridFiltering.locale.nextMonthLabel,
				thisYear: $.ig.GridFiltering.locale.thisYearLabel,
				lastYear: $.ig.GridFiltering.locale.lastYearLabel,
				nextYear: $.ig.GridFiltering.locale.nextYearLabel,
				onLabel: $.ig.GridFiltering.locale.onLabel,
				notOnLabel: $.ig.GridFiltering.locale.notOnLabel,
				advancedButtonLabel: $.ig.GridFiltering.locale.advancedButtonLabel,
				filterDialogCaptionLabel: $.ig.GridFiltering.locale.filterDialogCaptionLabel,
				filterDialogConditionLabel1: $.ig.GridFiltering.locale.filterDialogConditionLabel1,
				filterDialogConditionLabel2: $.ig.GridFiltering.locale.filterDialogConditionLabel2,
				filterDialogOkLabel: $.ig.GridFiltering.locale.filterDialogOkLabel,
				filterDialogCancelLabel: $.ig.GridFiltering.locale.filterDialogCancelLabel,
				filterDialogAnyLabel: $.ig.GridFiltering.locale.filterDialogAnyLabel,
				filterDialogAllLabel: $.ig.GridFiltering.locale.filterDialogAllLabel,
				filterDialogAddLabel: $.ig.GridFiltering.locale.filterDialogAddLabel,
				filterDialogErrorLabel: $.ig.GridFiltering.locale.filterDialogErrorLabel,
				filterSummaryTitleLabel: $.ig.GridFiltering.locale.filterSummaryTitleLabel,
				filterDialogClearAllLabel: $.ig.GridFiltering.locale.filterDialogClearAllLabel,
				empty: $.ig.GridFiltering.locale.emptyNullText,
				notEmpty: $.ig.GridFiltering.locale.notEmptyNullText,
				nullLabel: $.ig.GridFiltering.locale.nullNullText,
				notNull: $.ig.GridFiltering.locale.notNullNullText
			},
			/* type="string" custom tooltip template for the filter button, when a filter is applied */
			tooltipTemplate: $.ig.GridFiltering.locale.tooltipTemplate,
			filterDialogAddConditionTemplate: "<div><span>${label1}</span><div><select></select></div><span>${label2}</span></div>",
			filterDialogAddConditionDropDownTemplate: "<option value='${value}'>${text}</option>",
			filterDialogFilterTemplate: "<tr><td><input/></td><td><select></select></td><td><input /> </td><td><span></span></td></tr>",
			filterDialogFilterColumnsListTemplate: "<option value='${columnKey}'>${columnKey}</option>",
			filterDialogFilterConditionTemplate: "<option value='${conditionName}'>${conditionLabel}</option>",
			/* type="object" add button width - in the advanced filter dialog */
			filterDialogAddButtonWidth: 100,
			/* type="object" width of the Ok and Cancel buttons in the advanced filtering dialogs */
			filterDialogOkCancelButtonWidth: 100,
			/* type="number" maximum number of filter rows in the advanced filtering dialog. if this number is exceeded, an error message will be rendered */
			filterDialogMaxFilterCount: 5,
			/* type="bool" if true, will show empty and not empty filtering conditions in the dropdowns */
			showEmptyConditions: false,
			/* type="bool" if true, will show null and not null filtering conditions in the dropdowns */
			showNullConditions: false
		},
		css: {
			/* Classes applied to the filter row TR in the headers table */
			"filterRow": "ui-iggrid-filterrow ui-widget", // A.T. 15 Feb 2011 - removing ui-widget-content as it messes up hover and focus styles for buttons
			/* Classes applied to every filter cell TH */
			"filterCell": "ui-iggrid-filtercell",
			/* Classes applied to every filter editor element (igEditor) */
			"filterCellEditor": "ui-iggrid-filtereditor",
			/* Classes applied to the UL filter dropdown list */
			"filterDropDownList": "ui-menu ui-widget ui-widget-content ui-iggrid-filterddlist ui-corner-all",
			/* Classes applied to the DIV which wraps the dropdown UL */
			"filterDropDown": "ui-iggrid-filterdd",
			/* Classes applied to the element that holds the text in every filter list item (LI) */
			"filterDropDownListItemTextContainer": "ui-iggrid-filterddlistitemcontainer",
			/* Classes applied to each filter dropdown list item  (LI) */
			"filterDropDownListItem": "ui-iggrid-filterddlistitem",
			/* Class applied to the list item that holds the Advanced button, if options are configured such that editors are shown when mode = "advanced" */
			"filterDropDownListItemAdvanced": "ui-iggrid-filterddlistitemadvanced",
			/* Classes applied to the list item when filtering icons are visible for it */
			"filterDropDownListItemWithIcons": "ui-iggrid-filterddlistitemicons ui-state-default",
			/* Classes applied to the "clear" filter list item */
			"filterDropDownListItemClear": "ui-iggrid-filterddlistitemclear",
			/* Classes applied to the list item when it is hovered */
			"filterDropDownListItemHover": "ui-iggrid-filterddlistitemhover ui-state-hover",
			/* Classes applied to the list item when it is selected */
			"filterDropDownListItemActive": "ui-iggrid-filterddlistitemactive ui-state-active",
			"filterDateCell": "",
			"filterTextCell": "",
			"filterNumberCell": "",
			"filterBoolCell": "",
			/* Classes applied to every filtering dropdown button */
			"filterButton": "ui-iggrid-filterbutton ui-corner-all ui-icon ui-icon-triangle-1-s",
			/* Classes applied to the button when mode = advanced. This also applies to the button when it's rendered in the header (which is the default behavior). */
			"filterButtonAdvanced": "ui-iggrid-filterbutton ui-iggrid-filterbuttonadvanced ui-icon ui-icon-search", // icon similar to Excel's filtering
			/* Classes applied to the advanced filtering button when it is rendered on the right */
			"filterButtonAdvancedRight": "ui-iggrid-filterbuttonright ui-iggrid-filterbuttonadvanced ui-icon ui-icon-search",
			/* Classes applied to the filter button when it is hovered */
			"filterButtonHover": "ui-iggrid-filterbuttonhover ui-state-hover",
			/* Classes applied to the filter button when it is selected */
			"filterButtonActive": "ui-iggrid-filterbuttonactive ui-state-active",
			/* Classes applied to the filter button when it has focus but is not selected. */
			"filterButtonFocus": "ui-iggrid-filterbuttonfocus ui-state-focus",
			/* Classes applied to the filtering button when it is disabled  */
			"filterButtonDisabled": "ui-iggrid-filterbuttondisabled ui-state-disabled",
			/* Classes applied to the filter button when a date filter is defined for the column */
			"filterButtonDate": "ui-iggrid-filterbuttondate",
			/* Classes applied to the filter button when a string filter is applied for the column (default) */
			"filterButtonString": "ui-iggrid-filterbuttonstring",
			/* Classes applied to the filter button when a number filter is applied for the column (default) */
			"filterButtonNumber": "ui-iggrid-filterbuttonnumber",
			/* Classes applied to the filter button when a boolean filter is applied for the column (default) */
			"filterButtonBoolean": "ui-iggrid-filterbuttonbool",
			"filterButtonCustom": "ui-iggrid-filterbuttoncustom",
			/* Classes applied on the advanced button when it is hovered */
			"filterButtonAdvancedHover": "ui-iggrid-filterbuttonadvancedhover ui-state-hover",
			/* Classes applied on the advanced button when it is selected */
			"filterButtonAdvancedActive": "ui-iggrid-filterbuttonadvancedactive ui-state-active",
			/* Classes applied on the advanced button when it has focus */
			"filterButtonAdvancedFocus": "ui-iggrid-filterbuttonadvancedfocus ui-state-focus",
			/* Classes applied on the advanced button when it is disabled */
			"filterButtonAdvancedDisabled": "ui-iggrid-filterbuttonadvanceddisabled ui-state-disabled",
			/* Classes applied to every filter dropdown list item's image icon area */
			"filterItemIcon": "ui-iggrid-filtericon",
			/* Classes applied to the item icon's container element */
			"filterItemIconContainer": "ui-iggrid-filtericoncontainer",
			/* Classes applied to the item icon's span when the item holds a startsWith condition */
			"filterItemIconStartsWith": "ui-iggrid-filtericonstartswith",
			/* Classes applied to the item icon's span when the item holds an endsWith condition */
			"filterItemIconEndsWith": "ui-iggrid-filtericonendswith",
			/* Classes applied to the item icon's span when the item holds a contains condition */
			"filterItemIconContains": "ui-iggrid-filtericoncontains",
			/* Classes applied to the item icon's span when the item holds a contains condition */
			"filterItemIconEquals": "ui-iggrid-filtericonequals",
			/* Classes applied to the item icon's span when the item holds a doesNotEqual condition */
			"filterItemIconDoesNotEqual": "ui-iggrid-filtericondoesnotequal",
			/* Classes applied to the item icon's span when the item holds a doesNotContain condition */
			"filterItemIconDoesNotContain": "ui-iggrid-filtericondoesnotcontain",
			/* Classes applied to the item icon's span when the item holds a greaterThan condition */
			"filterItemIconGreaterThan": "ui-iggrid-filtericongreaterthan",
			/* Classes applied to the item icon's span when the item holds a lessThan condition */
			"filterItemIconLessThan": "ui-iggrid-filtericonlessthan",
			/* Classes applied to the item icon's span when the item holds a greaterThanOrEqualTo condition */
			"filterItemIconGreaterThanOrEqualTo": "ui-iggrid-filtericongreaterthanorequalto",
			/* Classes applied to the item icon's span when the item holds a lessThanOrEqualTo condition */
			"filterItemIconLessThanOrEqualTo": "ui-iggrid-filtericonlessthanorequalto",
			/* Classes applied to the item icon's span when the item holds a true condition */
			"filterItemIconTrue": "ui-iggrid-filtericontrue",
			/* Classes applied to the item icon's span when the item holds a false condition */
			"filterItemIconFalse": "ui-iggrid-filtericonfalse",
			/* Classes applied to the item icon's span when the item holds an after condition */
			"filterItemIconAfter": "ui-iggrid-filtericonafter",
			/* Classes applied to the item icon's span when the item holds a before condition */
			"filterItemIconBefore": "ui-iggrid-filtericonbefore",
			/* Classes applied to the item icon's span when the item holds a today condition */
			"filterItemIconToday": "ui-iggrid-filtericontoday",
			/* Classes applied to the item icon's span when the item holds a yesterday condition */
			"filterItemIconYesterday": "ui-iggrid-filtericonyesterday",
			/* Classes applied to the item icon's span when the item holds a thisMonth condition */
			"filterItemIconThisMonth": "ui-iggrid-filtericonthismonth",
			/* Classes applied to the item icon's span when the item holds a lastMonth condition */
			"filterItemIconLastMonth": "ui-iggrid-filtericonlastmonth",
			/* Classes applied to the item icon's span when the item holds a nextMonth condition */
			"filterItemIconNextMonth": "ui-iggrid-filtericonnextmonth",
			/* Classes applied to the item icon's span when the item holds a thisYear condition */
			"filterItemIconThisYear": "ui-iggrid-filtericonthisyear",
			/* Classes applied to the item icon's span when the item holds a lastYear condition */
			"filterItemIconLastYear": "ui-iggrid-filtericonlastyear",
			/* Classes applied to the item icon's span when the item holds a nextYear condition */
			"filterItemIconNextYear": "ui-iggrid-filtericonnextyear",
			/* Classes applied to the item icon's span when the item holds an on condition */
			"filterItemIconOn": "ui-iggrid-filtericonon",
			/* Classes applied to the item icon's span when the item holds a notOn condition */
			"filterItemIconNotOn": "ui-iggrid-filtericonnoton",
			/* Classes applied to the item icon's span when the item holds a clear condition */
			"filterItemIconClear": "ui-iggrid-filtericonclear",
			/* Classes applied to the filtering block area, when the advanced filter dialog is opened and the area behind it is grayed out (that's the block area) */
			"blockArea": "ui-widget-overlay ui-iggrid-blockarea",
			/* Classes applied to the filter dialog element */
			"filterDialog": "ui-dialog ui-draggable ui-resizable ui-iggrid-dialog ui-widget-content ui-corner-all",
			/* Classes applied to the filter dialog header caption area */
			"filterDialogHeaderCaption": "ui-dialog-titlebar ui-iggrid-filterdialogcaption ui-widget-header ui-corner-all ui-helper-reset ui-helper-clearfix",
			/* Class applied to the filter dialog header caption title */
			"filterDialogHeaderCaptionTitle": "ui-dialog-title",
			/* Classes applied to the filter dialog add condition area */
			"filterDialogAddCondition": "ui-iggrid-filterdialogaddcondition",
			/* Classes applied to the filter dialog add condition SELECT dropdown. */
			"filterDialogAddConditionDropDown": "ui-iggrid-filterdialogaddconditionlist",
			/* Classes applied to the filter dialog add button */
			"filterDialogAddButton": "ui-iggrid-filterdialogaddbuttoncontainer ui-helper-reset",
			/* Classes applied to the filter dialog OK and Cancel buttons. */
			"filterDialogOkCancelButton": "ui-dialog-buttonpane ui-widget-content ui-helper-clearfix ui-iggrid-filterdialogokcancelbuttoncontainer",
			/* Classes applied to the filter dialog filters table */
			"filterDialogFiltersTable": "ui-iggrid-filtertable ui-helper-reset",
			/* Classes applied to the "X" button used to remove filters from the filters table */
			"filterDialogFilterRemoveButton": "ui-icon ui-icon-closethick",
			/* Classes applied to the filter dialog "Clear All" button. */
			"filterDialogClearAllButton": "ui-iggrid-filterdialogclearall"
		},
		events: {
			/* cancel="true" event fired before a filtering operation is executed (remote request or local) */
			dataFiltering: "dataFiltering",
			/* event fired after the filtering has been executed and results are rendered */
			dataFiltered: "dataFiltered",
			/* cancel="true" event fired before the filter dropdown is opened for a specific column filter */
			dropDownOpening: "dropDownOpening",
			/* event fired after the filter dropdown is opened for a specific column */
			dropDownOpened: "dropDownOpened", 
			/* cancel="true" event fired before the dropdown for a filter dropdown starts closing */
			dropDownClosing: "dropDownClosing",
			/* event fired after a filter column dropdown is completely closed */
			dropDownClosed: "dropDownClosed",
			/* cancel="true" event fired before the advanced filtering dialog is opened */
			filterDialogOpening: "filterDialogOpening",
			/* event fired after the advanced filtering dialog is already opened */
			filterDialogOpened: "filterDialogOpened",
			/* event fired every time the advanced filtering dialog changes its position */ 
			filterDialogMoving: "filterDialogMoving",
			/* cancel="true" event fired before a filter row is added to the advanced filtering dialog */
			filterDialogFilterAdding: "filterDialogFilterAdding",
			/* event fired after a filter row is added to the advanced filtering dialog */
			filterDialogFilterAdded: "filterDialogFilterAdded",
			/* cancel="true" event fired before the advanced filtering dialog is closed */
			filterDialogClosing: "filterDialogClosing",
			/* event fired after the advanced filtering dialog has been closed */
			filterDialogClosed: "filterDialogClosed",
			/* cancel="true" event fired before the contents of the advanced filtering dialog are rendered */
			filterDialogContentsRendering: "filterDialogContentsRendering",
			/* event fired after the contents of the advanced filtering dialog are rendered */
			filterDialogContentsRendered: "filterDialogContentsRendered",
			/* event fired when the OK button in the advanced filtering dialog is pressed */
			filterDialogFiltering: "filterDialogFiltering"
		},
		_createWidget: function (options, element) {
			/* !Strip dummy objects from options, because they are defined for documentation purposes only! */
			this.options.columnSettings = [];
			$.Widget.prototype._createWidget.apply(this, arguments);
		},
		_create: function () {
			this._editors = [];
			if (!$.fn.fadeToggle) {
				$.fn.fadeToggle = $.fn.toggle;
			}
			// filter item template (when buttons are enabled for the filter dropdowns
			this._ft = "<li class='${itemClass}'><span class='${imgContainerClass}'><span class='" + this.css.filterItemIcon + " ${imgClass}'></span></span><span class='${textClass}'> ${text} </span></li>";
			
			if (this.options.filterDropDownAnimations === 'none') {
				this.options.filterDropDownAnimationDuration = 1;
				this.options.filterDropDownAnimations = 'linear';
			}
		},
		_setOption: function (key, value) {
		    // handle new settings and update options hash
			$.Widget.prototype._setOption.apply(this, arguments);
			// options that are supported: filterDropDownWidth, filterDropDownHeight, filterDialogWidth, filterDialogHeight
			// start by throwing an error for the options that aren't supported:
			if (key === 'mode' || key === 'renderFilterButton' || key === 'filterButtonLocation' || key === 'type') {
				throw new Error($.ig.Grid.locale.optionChangeNotSupported + ' ' + key);
			}
			// handle filterDropDownWidth
			if (key === 'filterDropDownWidth') {
				this.grid.container().find('div ul').parent().css('width', value);
			// handle filterDropDownHeight
			} else if (key === 'filterDropDownHeight') {
				this.grid.container().find('div ul').parent().css('height', value);
			// handle filterDialogWidth
			} else if (key === 'filterDialogWidth') {
				$('#' + this.grid.container().attr('id') + '_dialog').css('width', value);
			// handle filterDialogHeight
			} else if (key === 'filterDialogHeight') {
				$('#' + this.grid.container().attr('id') + '_dialog').css('height', value);
			}
	    },
		destroy: function () {
			// destroys the filtering widget - remove fitler row, unbinds events, returns the grid to its previous state. 
			var block = $('#' + this.grid.id() + '_container_block'), dialog = $('#' + this.grid.id() + '_container_dialog');
			// remove the filter row, and it will take care of unbinding all events
			$('#' + this.grid.container()[0].id + ' .ui-iggrid-filterrow').remove();
			// also remove all filtering dropdowns
			$('#' + this.grid.container()[0].id + ' .ui-iggrid-filterdd').remove();
			// and the advanced filter dialog and block area, if present (if Advanced filtering is enabled)
			if (this.options.mode === "advanced") {
				block.remove();
				dialog.remove();
			}
			this.grid.element.unbind('iggridheaderrendered', this._headerRenderedHandler);
			this.grid.element.unbind('iggridvirtualhorizontalscroll', this._virtualHorizontalScrollHandler);
			$.Widget.prototype.destroy.call(this);
			return this;
		},
		_initLoadingIndicator: function () {
			// attach loading indicator widget
			this._loadingIndicator = this.grid.container().length > 0 ? this.grid.container().igLoading().data("igLoading").indicator() : this.grid.element.igLoading().data("igLoading").indicator();
		},
		// if uiDirty event is fired, it means that all subscribed features will need to reset their state. For example page size change triggers onUIDirty
		_onUIDirty: function (e, args) {
			var i;
            if (args.owner === this) {
                return;
            }
			// reset all filtering states & UI
            this._filterDialogClearAll();
			if (this._editors !== null && this._editors !== undefined) {
				for (i = 0; i < this._editors.length; i++) {
					if (this.options.columnSettings[i].allowFiltering !== false) {
						this._editors[i].value(null);
					}
				}
			}
			// clear tooltips
			$('.ui-iggrid-filterbutton', this.grid.container()).parent().attr('title', this.options.tooltipTemplate.replace('${condition}', this.options.labels.noFilter));
		},
		_dataRendered: function () {
			var matches = 0, summary = this.grid.container().find(".ui-iggrid-footer .ui-iggrid-results"),
				footer = summary.parent(), shouldInitHeights = false, lastcw = null, lastcell;
			if (!this._loadingIndicator) {
				this._initLoadingIndicator();
			}
			if (this._shouldFireDataFiltered) {
				this._shouldFireDataFiltered = false;
				this._trigger(this.events.dataFiltered, null, {columnKey: this._curColKey, columnIndex: this._curColIndex, owner: this});
			}
			// change filter summary
			if (this._isFilteringRequest === true) {
				if (this.options.filterSummaryAlwaysVisible === true && summary.length === 0) {
					// we need to render a footer
					footer = $('<div></div>').appendTo(this.grid.container()).addClass("ui-widget ui-helper-clearfix ui-corner-bottom ui-widget-header ui-iggrid-footer");
					summary = $('<span></span>').appendTo(footer).addClass("ui-iggrid-results");
					shouldInitHeights = true;
				}
				if (this.options.type === "local" || (this.options.type === "remote" && this.grid.dataSource.hasTotalRecordsCount() === false)) {
					if (this.grid.dataSource._filter) {
						//matches = this.grid.dataSource.dataView().length; // this should be used when applyToAllData = false
						matches = this.grid.dataSource._filteredData.length;
					} else {
						matches = this.grid.dataSource._data.length;
					}
				// we need that when, say, both paging and filtering are enabled, and both are remote
				} else {
					matches = this.grid.dataSource.totalRecordsCount();
				}
				summary.text(this.options.filterSummaryTemplate.replace("${matches}", matches)).attr('title', this.options.labels.filterSummaryTitleLabel);
				summary.show();
				this._isFilteringRequest = false;
			} else if (this._isFilteringRequest === false) {
				if (summary.data('hideflag') !== false) {
					summary.hide();
				} else {
					summary.data('hideflag', true);
				}
			}
			this._loadingIndicator.hide();
			if (shouldInitHeights) {
				this.grid._initializeHeights();
			}
			// #75760 => make sure we recalc the width of the filter cell , in case there is no need for a scrollbar (and there is fixed headers of course) 
			// get the last filter cell
			lastcw = this.grid.options.columns[this.grid.options.columns.length - 1].width;
			lastcell = this.grid.container().find('.ui-iggrid-filterrow td:last-child');
			if (this.grid.options.fixedHeaders && this.options.mode === "simple" && lastcw) {
				if ((this.grid.options.autoAdjustHeight && this.grid.element.height() <= $('#' + this.grid.element[0].id + '_scroll').height()) ||
					(!this.grid.options.autoAdjustHeight && this.grid.options.avgRowHeight * this.grid.element[0].rows.length < parseInt(this.grid.options.height, 10))) {
					//lastcell.css('width', lastcw);
					this._editors[this.grid.options.columns.length - 1]._width(lastcell.data('editorWidth') - this.grid._scrollbarWidth());
				} else {
					lastcell.css('width', parseInt(lastcw, 10) + this.grid._scrollbarWidth());
					this._editors[this.grid.options.columns.length - 1]._width(lastcell.data('editorWidth'));
				}
			}
		},
		_headerRendered: function () {
			// render the filter row
			var thead, filterrow, i, cell, w, button, cols = this.grid.options.columns,
				id, j, cs = this.options.columnSettings, skipColumn = false, buttonCss,
				showAdvancedInHeader = false, indicatorContainer, cancelFunc;
			// 1. find the correct THEAD
			thead = this.grid.container().find('thead');
			// add the filter row
			//V1
			if (this.options.mode === "simple" || this.options.advancedModeEditorsVisible === true) {
				filterrow = $('<tr></tr>').appendTo(thead).addClass(this.css.filterRow);
			} else {
				//V2: A.T. 27 Jan 2011
				filterrow = thead.find('tr:first');
			}
			cancelFunc = function (e) { e.preventDefault(); e.stopPropagation(); };
			// render the filter row cells
			for (i = 0; i < cols.length; i++) {
				// A.T. V1
				if (this.options.mode === "simple" || this.options.advancedModeEditorsVisible === true) {
					cell = $('<td></td>').appendTo(filterrow).addClass(this.css.filterCell);
					// A.T. V2 27 Jan 2011
				} else {
					cell = $(filterrow[0].cells[i]);
					// Sorting and other features which modify the header 
					if (cell.children().first().is('a')) {
						cell.children().first().css('display', 'inline');
						cell.css('cursor', 'pointer');
					}
					//cell.data('colName', cols[i].headerText);
					cell.data('colName', cols[i].key);
				}
				if (i === cols.length - 1 && this.grid.options.height && parseInt(this.grid.options.height, 10) > 0) {
					// set last col width explicitly
					cell.css('width', parseInt(cols[i].width, 10) + this.grid._scrollbarWidth());
				} else {
					cell.css('width', cols[i].width);
				}
				// continue if filtering is disabled for that particular column
				for (j = 0; j < cs.length; j++) {
					if (cs[j].columnKey === cols[i].key && cs[j].allowFiltering === false) {
						if (this.options.advancedModeEditorsVisible === true || this.options.mode !== "advanced") {
							this._editors.push({});
						}
						skipColumn = true;
						break;
					}
				}
				if (skipColumn) {
					skipColumn = false;
					continue;
				}
				// render editor in cell
				if (!$.browser.opera && ((this.grid.options.height && this.grid.options.fixedHeaders === true) || $.browser.webkit)) {
					//A.T. 10 April 2011 - changing from outerWidth to innerWidth, so that the borders width is accounted for, and excluded from the calculations 
					// if inner height is used, there is the border space remaining. if outer height is used, the editors /dropdowns are a bit cut on the right. 
					w = thead.children().first().find('th:nth-child(' + (i + 1) + ')').innerWidth();
				} else {
					w = thead.children().first().find('th:nth-child(' + (i + 1) + ')').width();
				}

				showAdvancedInHeader = (this.options.advancedModeEditorsVisible === false && this.options.mode === "advanced");
				if (this.options.renderFilterButton === true || showAdvancedInHeader) {
					id = this.grid.element.attr('id') + '_dd_' + cols[i].key;
					// render the dropdown associated with that button
					if (this.options.advancedModeEditorsVisible === true || this.options.mode !== "advanced") {
						this._renderDropDown(cols[i].dataType, id, cols[i].key);
					}
					buttonCss = this.options.mode === "advanced" ? this.css.filterButtonAdvanced : this.css.filterButton;
					if (showAdvancedInHeader && this.options.advancedModeHeaderButtonLocation === "right") {
						buttonCss = this.css.filterButtonAdvancedRight;
						button = $('<span></span>').appendTo(cell).addClass(buttonCss).data('colIndex', i);
					} else {
						button = $('<span></span>').prependTo(cell).addClass(buttonCss).data('colIndex', i);
					}
					if (this.options.mode === "simple" || 
							(this.options.mode === "advanced" && this.options.advancedModeEditorsVisible === true)) {
						button.wrap('<a id="' + id + '_button" href="#" title="' + this.options.tooltipTemplate.replace('${condition}', this.options.labels.noFilter) + '" ></a>');
					} else {
						button.wrap('<a id="' + id + '_button" href="#" title="' + this.options.tooltipTemplate.replace('${condition}', this.options.labels.noFilter) + '" style="display:inline;"></a>');
					}
					indicatorContainer = cell.find('.ui-iggrid-indicatorcontainer');
					
					if (indicatorContainer.length === 0) {
						indicatorContainer = $('<div></div>').appendTo(cell).addClass('ui-iggrid-indicatorcontainer');
					}
					
					indicatorContainer.append(button.parent());
					w = parseInt(w, 10);
					if (this.grid.options.height === null && $.browser.mozilla) {
						w -= button.outerWidth(true);
					} else {
						w -= button.outerWidth(false);
					}
					cell.data('editorWidth', w);
				}
				if (this.options.renderFilterButton === true) {
					if (this.options.advancedModeEditorsVisible === true || this.options.mode !== "advanced") {
						button.parent().bind({
							mousedown: $.proxy(this._toggleDropDown, this),
							mouseup: cancelFunc,
							click: cancelFunc,
							blur: $.proxy(this._closeDropDown, this), 
							keydown: $.proxy(this._toggleDropDownKeyboard, this),
							mouseover: $.proxy(this._hoverButton, this),
							mouseout: $.proxy(this._unhoverButton, this),
							focus: $.proxy(this._activateButton, this)
						});
					} else {
						button.parent().bind({
							click: $.proxy(this._openFilterDialog, this),
							keydown: $.proxy(this._openFilterDialogFromKeyboard, this),
							focus: $.proxy(this._activateButton, this),
							blur: $.proxy(this._deactivateButton, this)
						});
					}
				}
				if (this.options.advancedModeEditorsVisible === true || this.options.mode !== "advanced") {
					this._createEditor(cell, w, i, cols[i].dataType, cols[i].key);
				}
			}
			// if advanced filtering is enabled we will also render the advanced filtering dialog
			// NOTE that it is only a single dialog for the whole grid, not per column !
			if (this.options.mode === "advanced") {
				this._renderFilterDialog();
			}
		},
		_createEditor: function (parent, w, colIndex, colType, colKey) {
			var editor, options, type = this._getEditorType(colType);
			editor = $('<span />').css('float', 'left').css('width', '5px');
			if (this.options.filterButtonLocation === "left") {
				editor.appendTo(parent);
			} else {
				editor.prependTo(parent);
			}
			options = {
				textChanged: $.proxy(this._filter, this),
				width: w,
				readOnly: (this.grid.options.columns[colIndex].dataType === "bool" || this.grid.options.columns[colIndex].dataType === "boolean"),
				type: type,
				textAlign: 'left',
				button: (type === 'datepicker') ? 'dropdown' : null,
				// fix for bug #76266
				maxDecimals: 6,
				nullText: this.options.nullTexts[this._findColumnSetting(colKey).condition],
				focus: $.proxy(this._fireEnterEditModeEvents, this),
				blur: $.proxy(this._fireExitEditModeEvents, this)
			};
			editor.data('colIndex', colIndex).data('colKey', colKey);
			editor.igEditor(options);
			this._editors.push(editor.data('igEditor'));
			// A.T. 29 Dec 2010
			editor.find('input').addClass(this.css.filterCellEditor);
			return editor;
		},
		_showEditor: function (e) {
			var cell = e.target, $cell = $(cell), colKey = $cell.data('colKey'), colType = $cell.data('colType'), editor, w = $cell.data('editorWidth'), options;
			
			if (colKey === undefined || colType === undefined) {
				return;
			}
			// get shared editor which is already instantiated
			editor = $('#' + this.grid.element[0].id + '_sharedEditor', this.grid.container());
			// append the editor to this cell after changing its default settings:
			// width
			// type
			// nullText
			options = {
				width: w,
				type: this._getEditorType(colType),
				nullText: this.options.nullTexts[this._findColumnSetting(colKey).condition],
				textChanged: $.proxy(this._filter, this)
			};
			editor.igEditor('destroy').css('width', w).css('height', $cell.height());
			editor.igEditor(options);
			if (this.options.filterButtonLocation === "left") {
				$cell.append(editor);
			} else {
				$cell.prepend(editor);
			}
			editor.show().find('input').focus();
			return editor;
		},
		_getEditorType: function (type) {
			return (type === 'date') ? 'datepicker' : ((type === 'number') ? 'numeric' : 'text');
		},
		_findColumnSetting: function (key) {
			var i;
			for (i = 0; i < this.options.columnSettings.length; i++) {
				if (this.options.columnSettings[i].columnKey === key) {
					return this.options.columnSettings[i];
				}
			}
		},
		// Accepts parameters:
		// expressions - a list of filtering expressions (objects) 
		// updateUI - flag specifying whether the filter row UI should also be updated when applying the filter 
		filter: function (expressions, updateUI, addedFromAdvanced) {
			/* applies filtering programmatically and updates the UI by default
				paramType="array" an array of filtering expressions, each one having the format {fieldName: , expr: , cond: , logic: }  where fieldName is the key of the column, expr is the actual expression string with which we would like to filter, logic is "AND" or "OR", and cond
				is one of the folling strings: equals, doesNotEqual, contains, doesNotContain, greaterThan, lessThan, greaterThanOrEqualTo, lessThanOrEqualTo, true, false, null, notNull, empty, notEmpty, startsWith, endsWith,
				today, yesterday, on, notOn, thisMonth, lastMonth, nextMonth, before, after, thisYear, lastYear, nextYear. The difference between the empty and null filtering conditions is that empty includes null, NaN, and undefined, as well as the empty string. 
				
				paramType="bool" optional="true" specifies whether the filter row should be also updated once the grid is filtered 
			*/
			this._loadingIndicator.show();
			if (expressions !== undefined && expressions.length > 0) {
				this._isFilteringRequest = true;
			}
			if (!addedFromAdvanced) {
				this._filterDataSource(expressions, true);
			} else {
				this._filterDataSource(expressions);
			}
			
			if (updateUI === undefined || updateUI === true) {
				this._updateFiltersUI(expressions === undefined ? this._generateExpressions() : expressions, addedFromAdvanced);
			}
		},
		_filter: function (ui, args) {
			clearTimeout(this._timeoutId);
			this._ui = ui;
			this._args = args;
			if (parseInt(this.options.filterDelay, 10) === 0) {
				this._filterInternal();
			} else {
				this._timeoutId = setTimeout($.proxy(this._filterInternal, this), this.options.filterDelay);
			}
		},
		_filterInternal: function (colIndex, colKey) {
			// determine the column
			var args = this._args, _colIndex, _colKey, noCancel;
			
			if (args !== undefined) {
				_colIndex = $(args.owner.element).data('colIndex');
				_colKey = $(args.owner.element).data('colKey');
			} else {
				_colIndex = colIndex;
				_colKey = colKey;
			}
			noCancel = this._trigger(this.events.dataFiltering, null, {columnKey: _colKey, columnIndex: _colIndex, owner: this});
			if (noCancel) {
				this._loadingIndicator.show();
				// mark the column so that we know it's not generated from the advanced filters 
				if (this._editors && this._editors[_colIndex]) {
					this._editors[_colIndex]._addedFromAdvanced = false;
				}
				this._filterDataSource();
				//this._trigger(this.events.dataFiltered, null, {columnKey: _colKey, columnIndex: _colIndex, owner: this});
				this._curColKey = _colKey;
				this._curColIndex = _colIndex;
			}
		},
		_filterDataSource: function (expressions, apiCall) {
			var exprs, i, j, button, cols = this.grid.options.columns, found = false, defaultTooltip, noCancel; // i, exprs;
			defaultTooltip = this.options.tooltipTemplate.replace('${condition}', this.options.labels.noFilter);
			if (expressions !== undefined) {
				this.grid.dataSource.settings.filtering.expressions = expressions;
			} else {
				exprs = this._generateExpressions(true);
				// update the tooltips, since we are doing simple filtering (expressions are not provided)
				for (i = 0; i < cols.length; i++) {
					found = false;
					button = $('#' + this.grid.element[0].id + '_dd_' + cols[i].key + '_button');
					for (j = 0; j < exprs.length; j++) {
						if (cols[i].key === exprs[j].fieldName) {
							found = true;
							if ((exprs[j].expr === undefined || exprs[j].expr === null || exprs[j].expr === '') && this._requiresEntry(exprs[j].cond)) {
								button.attr('title', defaultTooltip);
							} else {
								//button.attr('title', exprs[j].fieldName + ' ' + exprs[j].cond + ' ' + exprs[j].expr + ' ');
								button.attr('title', this.options.tooltipTemplate.replace('${condition}', exprs[j].cond));
							}
							break;
						}
					}
					if (!found) {
						// place the default no filter 
						button.attr('title', defaultTooltip);
					}
				}
				this.grid.dataSource.settings.filtering.expressions = exprs;
			}
			// A.T. 13 April 2011 fix for bug #72284
			this.grid.element.trigger('iggriduisoftdirty', {owner: this});
			noCancel = this.grid._trigger(this.grid.events.dataBinding, null, {owner: this.grid});
			if (noCancel) {
				exprs = this.grid.dataSource.settings.filtering.expressions;
				
				// A.T. fix for bug #73509
				// it's important that paging also resets its "current" page Index, otherwise the paging dropdown, etc. won't be refreshed. 
				this.grid.dataSource.settings.paging.pageIndex = 0;
				this.grid._shouldResetPaging = true;
				
				if (exprs.length === 0) {
					// A.T. 4 April 2011 - Fix for bug #66210
					this._isFilteringRequest = true;
					//this._isFilteringRequest = false;
					this.grid._fireDataBoundInternal = true;
					if (!apiCall) {
						this._shouldFireDataFiltered = true;
					}
					this.grid.dataSource.dataBind();
				} else {
					this._isFilteringRequest = true;
					if (this.options.type === "remote") {
						this.grid._fireDataBoundInternal = true;
						if (!apiCall) {
							this._shouldFireDataFiltered = true;
						}
						this.grid.dataSource.dataBind();
					} else {
						this.grid.dataSource.settings.filtering.type = "local";
						this.grid.dataSource.filter(exprs);
						this.grid._trigger(this.grid.events.dataBound, null, {owner: this.grid});
						this.grid._renderData();
						if (!apiCall) {
							this._trigger(this.events.dataFiltered, null, {columnKey: this._curColKey, columnIndex: this._curColIndex, owner: this});
						}
					}
				}
			}
		},
		_filterDataSourceClear: function (colKey) {
			var i, exprs = this._generateExpressions(true), noCancel, noCancelFiltering;
			for (i = 0; i < exprs.length; i++) {
				if (exprs[i].fieldName === colKey) {
					exprs.remove(i);
					break;
				}
			}
			this.grid.dataSource.settings.filtering.expressions = exprs;
			// trigger dirty so that any other features reset their UI and state 
            this.grid.element.trigger('iggriduidirty', {owner: this});
			noCancelFiltering = this._trigger(this.events.dataFiltering, null, {columnKey: this._curColKey, columnIndex: this._curColIndex, owner: this});
			if (noCancelFiltering) {
				noCancel = this.grid._trigger(this.grid.events.dataBinding, null, {owner: this.grid});
				
				if (noCancel) {
				
					this.grid.dataSource.settings.paging.pageIndex = 0;
					this.grid._shouldResetPaging = true;
					
					if (exprs.length > 0) {
						this._isFilteringRequest = true;
						if (this.options.type === "remote") {
							this.grid._fireDataBoundInternal = true;
							this._shouldFireDataFiltered = true;
							this.grid.dataSource.dataBind();
						} else {
							this.grid.dataSource.settings.filtering.type = "local";
							this.grid.dataSource.filter(exprs);
							this.grid._trigger(this.grid.events.dataBound, null, {owner: this.grid});
							this.grid._renderData();
							this._trigger(this.events.dataFiltered, null, {columnKey: this._curColKey, columnIndex: this._curColIndex, owner: this});
						}
					} else {
						this.grid._fireDataBoundInternal = true;
						this._isFilteringRequest = false;
						this._shouldFireDataFiltered = true;
						this.grid.dataSource.dataBind();
					}
				}
			}
		},
		_updateFiltersUI: function (expressions, addedFromAdvanced) {
			var i, j, editor, filterList, items;
			
			if (expressions.length === 0 && this.options.mode === 'advanced' && this.options.advancedModeEditorsVisible === true) {
				// make sure we update (clear) the inputs 
				for (i = 0; i < this._editors.length; i++) {
					if (this.options.columnSettings[i].allowFiltering !== false) {
						this._editors[i].value(null);
						//this._editors[i]._addedFromAdvanced = false;
					}
				}
			}
			for (i = 0; i < expressions.length; i++) {
				//1.  update the selected item in the filter dropdown
				filterList = $('#' + this.grid.element[0].id + '_dd_' + expressions[i].fieldName).find('ul');
				items = filterList.children();
				for (j = 0; j < items.length; j++) {
				
					if ($(items[j]).data('cond') === expressions[i].cond) {
						 // update selection
						this._selectDropDownItem({currentTarget: items[j]});
						break;
					}
				}
				//2. update the editor text (and value)
				editor = this._editors[this._columnIndexFromKey(expressions[i].fieldName)];
				if (editor !== undefined && editor !== null) {
					editor.value(expressions[i].expr);
					editor._addedFromAdvanced = true;
				}
			}
			this._updateTooltips(expressions);
		},
		_updateTooltips: function (expressions) {
			var button, title, found, titleText, tempTooltipExpr, cols = this.grid.options.columns, i, j;
			titleText = this.options.tooltipTemplate.replace('${condition}', this.options.labels.noFilter);
			title = '';
			for (i = 0; i < expressions.length; i++) {
				// update the advanced filtering tooltips
				// 1. find the tooltip for the column
				button = $('#' + this.grid.element[0].id + '_dd_' + expressions[i].fieldName + '_button');
				if (expressions[i].expr === undefined || expressions[i].expr === null) {
					tempTooltipExpr = '';
				} else {
					tempTooltipExpr = expressions[i].expr;
				}
				if (i === 0) {
					button.attr('title', expressions[i].fieldName + ' ' + expressions[i].cond + ' ' + tempTooltipExpr + ' ');
				} else {
					button.attr('title', title + expressions[i].logic + ' ' + expressions[i].fieldName + ' ' + expressions[i].cond + ' ' + tempTooltipExpr + ' ');
				}
				title = button.attr('title');
			}
			// if some column doesn't have a filter applied, we should update its tooltip to match the "no filter" tooltip 
			for (i = 0; i < cols.length; i++) {
				found = false;
				for (j = 0; j < expressions.length; j++) {
					if (expressions[j].fieldName === cols[i].key) {
						found = true;
						break;
					}
				}
				if (!found) {
					// update tooltip
					$('#' + this.grid.element[0].id + '_dd_' + cols[i].key + '_button').attr('title', titleText);
				}
			}
		},
		_columnIndexFromKey: function (key) {
			var i;
			for (i = 0; i < this.grid.options.columns.length; i++) {
				if (this.grid.options.columns[i].key === key) {
					return i;
				}
			}
		},
		_generateExpressions: function (filterRowTrigger) {
			// iterate over the columns and generate the current filtering expressions array
			var exprs = [], cols = this.grid.options.columns, expr, i, currentCondition, requiresEntry;
			for (i = 0; i < cols.length; i++) {
				if (this._editors && this._editors[i] && this._editors[i]._addedFromAdvanced && !filterRowTrigger) {
					continue;
				}
				// if filtering is disabled for this column, exit
				if (this.options.columnSettings[i].allowFiltering !== true) {
					continue;
				}
				expr = this._editors[i].value();
				requiresEntry = this._requiresEntry(this.options.columnSettings[i].condition);
				if ((expr === undefined || expr === null ||  expr === "") && requiresEntry) {
					continue;
				} /* else if (!requiresEntry) {
					expr = null;
				}
				*/
				currentCondition = this.options.columnSettings[i].condition;
				
				if (currentCondition === undefined || currentCondition === null || currentCondition === "") {
					continue;
				}
				//A.T. 28 March 2011 - Fix for bug #69561
				if (cols[i].dataType !== 'date' || (cols[i].dataType === 'date' && expr !== null && 
						expr !== undefined && currentCondition !== 'empty' && 
						currentCondition !== 'notEmpty' && currentCondition !== 'null' && currentCondition !== 'notNull')
						|| (cols[i].dataType === 'date' && !this._requiresEntry(this.options.columnSettings[i].condition))) {
					if (expr !== "" && !this.options.filterExprUrlKey) {
						exprs.push({fieldName: cols[i].key, cond: currentCondition, expr: expr});
					} else if ((cols[i].dataType === "bool" && expr !== "") || (cols[i].dataType !== "bool" &&
							((this.options.filterExprUrlKey !== undefined && this.options.filterExprUrlKey !== null) || this.options.type === "local"))) {
						exprs.push({fieldName: cols[i].key, cond: currentCondition, expr: expr});
					} else if (cols[i].dataType === "bool" && expr === "" && (currentCondition === 'null' || currentCondition === 'notNull'
							|| currentCondition === 'empty' || currentCondition === 'notEmpty')) {
						exprs.push({fieldName: cols[i].key, cond: currentCondition, expr: expr});
					}
				}
			}
			return exprs; 
		},
		_getDefaultCondition: function (type) {
			if (type === undefined || type === null || type === "string") {
				return "contains";
			} else if (type === "number") {
				return "equals";
			} else if (type === "date") {
				return "on";
			} else if (type === "bool") {
				return "true";
			}
			return "equals";
		},
		_initDefaultSettings: function () {
			// fill in default column settings, so that later on we can get the current sort state of every sortable column 
			// iterate through columns
			var settings = [], key, cs = this.options.columnSettings, i, j, defaultExpressions = [], cols = this.grid.options.columns;
			// initialize
			if (cols && cols.length > 0) {
				for (i = 0; i < cols.length; i++) {
					settings[i] = {'columnIndex': i, 'columnKey': cols[i].key, condition: this._getDefaultCondition(cols[i].dataType), 'allowFiltering': true};
				}
			}
			for (i = 0; i < cs.length; i++) {
				
				for (j = 0; j < settings.length; j++) {
					if (settings[j].columnKey === cs[i].columnKey || settings[j].columnIndex === cs[i].columnIndex) {
						break;
					}
				}
				if (j === settings.length) {
					continue;
				}
				for (key in cs[i]) {
					if (cs[i].hasOwnProperty(key) && key !== 'columnKey' && key !== 'columnIndex') {
						settings[j][key] = cs[i][key];
					}
				}
			}
			// copy
			this.options.columnSettings = settings;
			// store default expressions
			this.grid.dataSource.settings.filtering.expressions = defaultExpressions;
		},
		_renderDropDown: function (type, id, colName) {
			var ul, i, cs = this.options.columnSettings, cols = this.grid.options.columns, item, obj;
			if (type === "number") {
				ul = this._renderNumericFilterDropDown(id, colName);
			} else if (type === "date") {
				ul = this._renderDateFilterDropDown(id, colName);
			} else if (type === "boolean" || type === "bool") {
				//A.T. 12 Feb 2011 - Fix for bug #66113
				ul = this._renderBooleanFilterDropDown(id, colName);
			} else {
				// string 
				ul = this._renderStringFilterDropDown(id, colName);
			}
			if (this.options.filterDropDownItemIcons !== true) {
				if (this.options.showEmptyConditions) {
					$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'empty')).text(this.options.labels.empty).addClass('ui-corner-all');
					$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'notEmpty')).text(this.options.labels.notEmpty).addClass('ui-corner-all');
				}
				if (this.options.showNullConditions) {
					$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'null')).text(this.options.labels.nullLabel).addClass('ui-corner-all');
					$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'notNull')).text(this.options.labels.notNull).addClass('ui-corner-all');
				}
			} else {
			
				obj = {itemClass: this.css.filterDropDownListItemWithIcons, imgContainerClass: this.css.filterItemIconContainer, textClass: this.css.filterDropDownListItemTextContainer};
				
				if (this.options.showEmptyConditions) {
					// Empty
					obj.text = this.options.labels.empty;
					obj.imgClass = this.css.filterItemIcon;
					$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'empty');
					
					// Not Empty
					obj.text = this.options.labels.notEmpty;
					obj.imgClass = this.css.filterItemIcon;
					$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'notEmpty');
				}
				if (this.options.showNullConditions) {
					// Null
					obj.text = this.options.labels.nullLabel;
					obj.imgClass = this.css.filterItemIcon;
					$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'null');
					
					// Not Null
					obj.text = this.options.labels.notNull;
					obj.imgClass = this.css.filterItemIcon;
					$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'notNull');
				}
			}
			// if the mode is "Advanced", add the "Advanced" button
			if (this.options.mode === "advanced") {
				this._renderAdvancedButton(ul);
			}
			//A.T. 14 Feb 2011 - Fix for bug #65814
			// set initially selected value, if any
			for (i = 0; i < cs.length; i++) {
				if (cs[i].columnKey === colName && cs[i].condition !== this._getDefaultCondition(cols[i].dataType)) {
					// find the item
					if (cs[i].condition === 'null') {
						item = ul.find(':contains("' + this.options.labels.nullLabel + '")');
					} else {
						item = ul.find(':contains("' + this.options.labels[cs[i].condition] + '")');
					}
					item = item.children().first().closest('li');
					item.addClass(this.css.filterDropDownListItemActive).parent().data('selectedItem', $('li', item.parent()).index(item));
				}
			}
		},
		_renderAdvancedButton: function (ul) {
			var li;
			li = $('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItemAdvanced);
			// render the igButton inside the LI 
			this._currentButton = $('<input type="button"></input>');
			this._currentButton.igButton({labelText: this.options.labels.advancedButtonLabel}).bind({
				mousedown: $.proxy(this._openFilterDialog, this)
			});
			li.append(this._currentButton);
		},
		_openFilterDialogFromKeyboard: function (event) {
			if (event.keyCode === $.ui.keyCode.ENTER) {
				this._openFilterDialog(event);
			}
		},
		_openFilterDialog: function (event) {
			// show the dialog that has been created before
			var left, top, pos, h, w, bh, bw, noCancel = true, block = $('#' + this.grid.container().attr('id') + '_block'),
				dialog = $('#' + this.grid.container().attr('id') + '_dialog'), tableBody, i, colKey, rows, addDefault = true;
			
			// fire filterDialogOpening event
			this._dialogCurrentColumn = $(event.target).closest('ul').data('colName');
			if (this._dialogCurrentColumn === undefined || this._dialogCurrentColumn === null) {
				// in advanced mode when we don't render dropdowns there is no UL, so we take the col name from the closest TH which is the header's TH
				this._dialogCurrentColumn = $(event.target).closest('th').data('colName');
			}
			//A.T. - determine if there is an entry for the specified column or not, if there isn't, add one !
			tableBody = $('#' + this.grid.container().attr('id') + '_dialog table tbody');
			rows = tableBody.find('tr');
			for (i = 0; i < rows.length; i++) {
				if ($(rows[i]).children().first().find('input').attr('value') === this._dialogCurrentColumn) {
					addDefault = false;
					break;
				}
			}
			//colKey = this.grid.columnByText(this._dialogCurrentColumn).key;
			colKey = this._dialogCurrentColumn;
			
			for (i = 0; i < this.grid.options.columns.length; i++) {
				if (this.grid.options.columns[i].key === colKey) {
					this._dialogCurrentType = this.grid.options.columns[i].dataType;
				}
			}
			if (addDefault === true) {
				this._addFilterFromDialog();
			}
			noCancel = this._trigger(this.events.filterDialogOpening, null, {dialog: dialog, owner: this});
			if (noCancel) {
				pos = this.grid.container().offset();
				left = pos.left;
				top = pos.top;
				if (block.outerWidth() !== this.grid.container().outerWidth()) {
					block.css('width', this.grid.container().outerWidth()).css('height', this.grid.container().outerHeight());
				}
				// hide any error messages that are shown
				$('#' + this.grid.container().attr('id') + '_dialog_error').hide();
				block.css({left: left, top: top}).fadeToggle();
				// show the actual dialog
				w = this.grid.container().outerWidth();
				h = this.grid.container().outerHeight();
				// calculate browser height and width, and if the grid's w  & h exceed the browser ones, position the advanced filtering dialog
				// so that it can be seen on screen
				bw = $(window).width(); 
				bh = $(window).height(); 
				if (w + left > bw) {
					w = w - (w + left - bw);
				}
				if (w <= 0) {
					w = this.grid.container().outerWidth();
				}
				if (h + top > bh) {
					h = h - (h + top - bh);
				}
				if (h <= 0) {
					h = this.grid.container().outerHeight();
				}
				dialog.css({left: left + parseInt(w / 2, 10) - this.options.filterDialogWidth / 2, top: top + parseInt(h / 2, 10) - this.options.filterDialogHeight / 2}).fadeToggle();
				// fire opened event
				this._trigger(this.events.filterDialogOpened, null, {dialog: dialog, owner: this});
				// focus dialog so that the dropdown closes (on blur), and the advanced dialog can be closed with the ESCAPE key 
				dialog.focus();
				event.preventDefault();
				event.stopPropagation();
				// close dropdown
				if (!(this.options.mode === 'advanced' && this.options.advancedModeEditorsVisible === false)) {
					this._toggleDropDown({currentTarget: this._currentTarget}, true);
				}
			}
		},
		_closeFilterDialog: function (e) {
			var noCancel = true;
			noCancel = this._trigger(this.events.filterDialogClosing, null, {owner: this});
			if (noCancel) {
				$('#' + this.grid.container().attr('id') + '_block').fadeToggle();
				$('#' + this.grid.container().attr('id') + '_dialog').fadeToggle();
				this._trigger(this.events.filterDialogClosed, null, {owner: this});
				if (e) {
					e.preventDefault();
					e.stopPropagation();
				}
				return false;
			}
		},
		_searchFilterDialog: function (e) {
			var expressions = [], rows, boolLogic, selectLogic, noCancel = true, i, type, expr;
			noCancel = this._trigger(this.events.filterDialogFiltering, null, {dialog: $('#' + this.grid.container().attr('id') + '_dialog'), owner: this});
			
			if (noCancel) {
				// construct filter expressions from table
				rows = $('#' + this.grid.container().attr('id') + '_dialog table tbody').children();
				boolLogic = "and";
				selectLogic = $('#' + this.grid.container().attr('id') + '_dialog select:first');
				if (selectLogic.length > 0) {
					boolLogic = $('#' + this.grid.container().attr('id') + '_dialog select:first')[0].value === "all" ? "AND" : "OR";
				}
				for (i = 0; i < rows.length; i++) {
					type = this.grid.columnByText($(rows[i].cells[0]).find('input')[0].value).dataType; // get the column type 
					expr = $(rows[i].cells[2]).find('input').igEditor('value');
					if (expr && (expr.nodeName || (expr[0] && expr[0].nodeName))) {
						expr = $(rows[i].cells[2]).find('span').igEditor('value');
					}
					expressions.push({
						// fire user-defined function to extract expression from row
						fieldName: this.grid.columnByText($(rows[i].cells[0]).find('input')[0].value).key,
						cond: $(rows[i].cells[1]).find('select')[0].value,
						expr: expr,
						logic: boolLogic,
						type: type
					});
				}
				this._closeFilterDialog(e);
				// when the editors are visible and the mode is advanced, make sure we are not ignoring the filter row (Bug #70099)
				if (this.options.advancedModeEditorsVisible === true && this.options.mode === "advanced") {
					// merge the two arrays of expressions
					$.merge(expressions, this._generateExpressions());
				}
				this._currentAdvancedExpressions = expressions;
				this.filter(expressions, true, true); // the third parameter denotes that those filters have been added from the advanced window 
			}
			e.preventDefault();
			e.stopPropagation();
		},
		_filterDialogStartMove: function (e) {
			this._isFilterDialogMouseDown = true;
		},
		_filterDialogStopMove: function (e) {
			this._isFilterDialogMouseDown = false;
			this._dialogClientX = undefined;
			this._dialogClientY = undefined;
		},
		_filterDialogMove: function (e) {
			$(e.target).find('.ui-igedit-fieldincontainer').igEditor('dropDownVisible', false);
			//var dialog = $('#' + this.grid.container().attr('id') + '_dialog'), left, top, newLeft, newTop, noCancel = true;
			this._trigger(this.events.filterDialogMoving, null, {dialog: e.target, owner: this});
			/*
			noCancel = this._trigger(this.events.filterDialogMoving, null, {dialog: dialog, owner: this});
			if (noCancel) {
				left = parseInt(dialog.css('left'), 10);
				top = parseInt(dialog.css('top'), 10);
				if (this._isFilterDialogMouseDown !== undefined && this._isFilterDialogMouseDown === true) {
					if (this._dialogClientX === undefined && this._dialogClientY === undefined) {
						this._dialogClientX = parseInt(e.clientX, 10);
						this._dialogClientY = parseInt(e.clientY, 10);
						newLeft = left;
						newTop = top;
					} else {
						newLeft = left + (e.clientX - this._dialogClientX);
						newTop = top + (e.clientY - this._dialogClientY);
					}
					this._dialogClientX = e.clientX;
					this._dialogClientY = e.clientY;
					dialog.css({left: newLeft, top: newTop});
				}
			}
			*/
		},
		_renderFilterDialog: function () {
			var dialog, condObj, dropDownData, condElement, okCancelContainer, f = this, caption, dialogContent, noCancel = true, addClearButtons;
			// append the block area div to the grid's "_container"
			$('<div></div>').appendTo("body").attr('id', this.grid.container().attr('id') + '_block').css('position', 'absolute').addClass(this.css.blockArea).data('efh', '1').hide();
			dialog = $('<div></div>').appendTo("body").attr('id', this.grid.container().attr('id') + '_dialog').css('position', 'absolute').css('width', this.options.filterDialogWidth).css('height', this.options.filterDialogHeight).addClass(this.css.filterDialog).data('efh', '1').hide();
			noCancel = this._trigger(this.events.filterDialogContentsRendering, null, {dialogElement: dialog, owner: this});
			if (noCancel) {
				// add caption to the dialog
				$('<span></span>').appendTo(caption = $('<div></div>').appendTo(dialog).addClass(this.css.filterDialogHeaderCaption))
					.text(this.options.labels.filterDialogCaptionLabel).addClass(this.css.filterDialogHeaderCaptionTitle);
				$('<span></span>').appendTo($('<a></a>').appendTo(caption).attr('href', '#').attr('role', 'button').addClass('ui-dialog-titlebar-close ui-corner-all')).bind({
					click: $.proxy(this._closeFilterDialog, this)
				}).addClass('ui-icon ui-icon-closethick');
				dialogContent = $('<div></div>').appendTo(dialog).css('overflow', 'hidden').addClass('ui-dialog-content');
				// add condition dialog
				condObj = {label1: this.options.labels.filterDialogConditionLabel1, label2: this.options.labels.filterDialogConditionLabel2};
				dropDownData = [
					{text: this.options.labels.filterDialogAllLabel, value: 'all'},
					{text: this.options.labels.filterDialogAnyLabel, value: 'any'}
				];
				condElement = $.tmpl(this.options.filterDialogAddConditionTemplate, condObj).appendTo(dialogContent).addClass(this.css.filterDialogAddCondition); /* bind({
					change: $.proxy(this._changeFilterCondition, this) 
				}); */
				
				$.tmpl(this.options.filterDialogAddConditionDropDownTemplate, dropDownData).appendTo(condElement.find('div').addClass(this.css.filterDialogAddConditionDropDown).find('select'));
				addClearButtons = $('<div></div>').appendTo(dialogContent);
				// add filters table
				$('<input type="button"></input>').appendTo($('<span></span>').appendTo(addClearButtons).addClass(this.css.filterDialogAddButton)).igButton({labelText: this.options.labels.filterDialogAddLabel, 
					width: this.options.filterDialogAddButtonWidth}).bind({
					mousedown: $.proxy(this._addFilterFromDialog, this)
				});
				// add Clear All button
				/* if (this.options.showFilterDialogClearAllButton === true) { */
				$('<button />').appendTo(addClearButtons).css('float', 'right').igButton({
					labelText: this.options.labels.filterDialogClearAllLabel,
					click: $.proxy(this._filterDialogClearAll, this),
					css: {
						"buttonClasses": this.css.filterDialogClearAllButton,
						"buttonHoverClasses": "",
						"buttonActiveClasses": "", //when button is clicked 
						"buttonFocusClasses": "", //when button get focus
						"buttonLabelClass": ""
					}
				});	
				$('<label></label>').appendTo(dialogContent).attr('id', dialog.attr('id') + '_error').hide().text(this.options.labels.filterDialogErrorLabel).addClass("ui-widget ui-state-error ui-igvalidator-label");
				$('<table><tbody></tbody></table>').appendTo(dialogContent).addClass(this.css.filterDialogFiltersTable);
				okCancelContainer = $('<div></div>').appendTo($('<div></div>').appendTo(dialog).addClass(this.css.filterDialogOkCancelButton)).addClass('ui-dialog-buttonset');
				//Add Cancel button
				$('<button/>').appendTo(okCancelContainer).igButton({labelText: this.options.labels.filterDialogCancelLabel,
					width: this.options.filterDialogOkCancelButtonWidth}).bind({
					mousedown: $.proxy(this._closeFilterDialog, this)
				});
				// Add Ok button
				$('<button/>').appendTo(okCancelContainer).igButton({labelText: this.options.labels.filterDialogOkLabel,
					width: this.options.filterDialogOkCancelButtonWidth}).bind({
					click: $.proxy(this._searchFilterDialog, this)
				});
				//A.T. 14 Feb 2011 - Fix for #64483
				dialog.bind({
					keydown: function (e) { if (e.keyCode === $.ui.keyCode.ESCAPE) { f._closeFilterDialog(); } }
				}).draggable({containment: this.grid.container(), handle: caption, drag: $.proxy(this._filterDialogMove, this)}).resizable({ alsoResize: dialogContent, minHeight: dialog.outerHeight() / 4, minWidth: dialog.outerWidth() / 2, containment: "parent"}).attr('role', 'dialog').attr('tabIndex', -1);
				this._trigger(this.events.filterDialogContentsRendered, null, {dialogElement: dialog, owner: this});
			}
		},
		_changeFilterCondition: function (e) {
			// if the condition does not require an entry, set the value in the third dropdown and disable it
			var requiresEntry, col, editor, condition, editorObject;
			condition = e.target.value;
			col = this.grid.columnByText($(e.target).closest('td').parent().find('td:nth-child(1)').find('input')[0].value);
			editor = $(e.target).closest('td').parent().find('td:nth-child(3)').find('input');
			requiresEntry = this._requiresEntry(condition);
			if (!requiresEntry) {
				editor.igEditor("option", "readOnly", true);
				editorObject = editor.data('igEditor');
				// set correct input value if it doesn't require an entry
				this._editorValueForCondition(condition, editorObject);
			} else {
				editor.igEditor("option", "readOnly", false);
			}
		},
		_addFilterFromDialog: function (e) {
			var tableBody = $('#' + this.grid.container().attr('id') + '_dialog table tbody'), j, cs = this.options.columnSettings,
				filterObj = {}, filterRow, colKeys, i, noCancel = true, field, type, cnd, allowed;
			noCancel = this._trigger(this.events.filterDialogFilterAdding, null, {filtersTableBody: tableBody, owner: this});
			if (noCancel) {
				if (tableBody.children().length >= this.options.filterDialogMaxFilterCount) {
					// use the validation framework to validate the button?
					$('#' + this.grid.container().attr('id') + '_dialog_error').show();
					return;
				}
				// fire filter adding event
				filterRow = $.tmpl(this.options.filterDialogFilterTemplate, filterObj).appendTo(tableBody).hide();
				// instantiate editors and fill in values
				// 1. list of columns
				colKeys = [];
				for (i = 0; i < this.grid.options.columns.length; i++) {
					// check if filtering is allowed on this column
					allowed = true;
					for (j = 0; j < cs.length; j++) {
						if ((this.grid.options.columns[i].key === cs[j].columnKey || i === cs[j].columnIndex) && cs[j].allowFiltering === false) {
							allowed = false;
							break;
						}
					}
					if (allowed) {
						colKeys.push(this.grid.options.columns[i].headerText);
					}
				}
				field = this._dialogCurrentColumn === undefined ? this.grid.options.columns[0].headerText : this.grid.columnByKey(this._dialogCurrentColumn).headerText;
				type = this._dialogCurrentType === undefined ? this.grid.options.columns[0].dataType : this._dialogCurrentType;
				// use igeditor
				filterRow.find('td:first').find('input').igEditor({
					listItems: colKeys,
					button: 'dropdown',
					listAutoComplete: true,
					listMatchOnly: true,
					width: this.options.filterDialogColumnDropDownDefaultWidth,
					textChanged: $.proxy(this._polulateFilterConditionDropDown, this),
					//value: this.grid.columnByKey(field).headerText
					value: field
				});
				cnd = filterRow.find('td:nth-child(2)').children().first();
				//2. conditions for the respective column will be populated later dynamically, when the column is changed
				this._populateConditionsList(cnd, field, type);
				// attach a handler to the conditions list for value change
				cnd.bind('change', $.proxy(this._changeFilterCondition, this));
				filterRow.find('td:nth-child(2)').children().first().css('width', this.options.filterDialogFilterDropDownDefaultWidth);
				this._populateFilterDialogInput(filterRow.find('td:nth-child(3)').children().first(), type);
				//3. remove button for the filter
				filterRow.find('td:last').children().first().addClass(this.css.filterDialogFilterRemoveButton).bind({
					mousedown: $.proxy(this._removeFilterFromDialog, this)
				});
				// fire filter added
				filterRow.show();
				this._trigger(this.events.filterDialogFilterAdded, null, {filter: filterRow, owner: this});
			}
		},
		_filterDialogClearAll: function (e) {
			// events? 
			var tableBody = $('#' + this.grid.container().attr('id') + '_dialog table tbody');
			tableBody.empty();
			//A.T. 12 Feb 2011 - Fix for bug #64538
			// clear validation error message if any
			$('#' + this.grid.container().attr('id') + '_dialog_error').hide();
		},
		_polulateFilterConditionDropDown: function (e) {
			var selectedColKey = e.target.value, conditionList, cols = this.grid.options.columns, type, expr, i;
			// find the column, and populate the conditions based on the type
			conditionList = $(e.target).closest('tr').find('td:nth-child(2)').children().first();
			expr = $(e.target).closest('tr').find('td:nth-child(3)').children().first();
			for (i = 0; i < cols.length; i++) {
				if (cols[i].headerText === selectedColKey) {
					type = cols[i].dataType;
					break;
				}
			}
			// no full match
			if (type === undefined) {
				return;
			}
			this._populateConditionsList(conditionList, selectedColKey, type);
			this._populateFilterDialogInput(expr, type);
		},
		_populateFilterDialogInput: function (input, type) {
		
			var options = {
				type: this._getEditorType(type),
				buttonHidden: type !== 'date',
				button: 'dropdown',
				maxDecimals: 12,
				textAlign: (type === 'number') ? 'right' : 'left',
				width: this.options.filterDialogExprInputDefaultWidth,
				value: null
			};
			// do not allow to create same igEditor for different elements. First time it is INPUT, but later it can be SPAN or INPUT
			if (!input.is('input')) {
				input = input.find('INPUT');
			}
			if (type === "bool") {
				options.readOnly = true;
			}
			input.igEditor(options);
		},
		_populateConditionsList: function (conditionList, selectedColKey, type) {
						
			var conditions = [];
			
			if (type === "number") {
				conditions.push({conditionName: "equals", conditionLabel: this.options.labels.equals});
				conditions.push({conditionName: "doesNotEqual", conditionLabel: this.options.labels.doesNotEqual});
				conditions.push({conditionName: "greaterThan", conditionLabel: this.options.labels.greaterThan});
				conditions.push({conditionName: "lessThan", conditionLabel: this.options.labels.lessThan});
				conditions.push({conditionName: "greaterThanOrEqualTo", conditionLabel: this.options.labels.greaterThanOrEqualTo});
				conditions.push({conditionName: "lessThanOrEqualTo", conditionLabel: this.options.labels.lessThanOrEqualTo});
				
			} else if (type === "bool" || type === "boolean") {
				conditions.push({conditionName: "true", conditionLabel: this.options.labels.trueLabel});
				conditions.push({conditionName: "false", conditionLabel: this.options.labels.falseLabel});
				
			} else if (type === "date") {
				conditions.push({conditionName: "on", conditionLabel: this.options.labels.onLabel});
				conditions.push({conditionName: "notOn", conditionLabel: this.options.labels.notOnLabel});
				conditions.push({conditionName: "after", conditionLabel: this.options.labels.after});
				conditions.push({conditionName: "before", conditionLabel: this.options.labels.before});
				conditions.push({conditionName: "today", conditionLabel: this.options.labels.today});
				conditions.push({conditionName: "yesterday", conditionLabel: this.options.labels.yesterday});
				conditions.push({conditionName: "thisMonth", conditionLabel: this.options.labels.thisMonth});
				conditions.push({conditionName: "lastMonth", conditionLabel: this.options.labels.lastMonth});
				conditions.push({conditionName: "nextMonth", conditionLabel: this.options.labels.nextMonth});
				conditions.push({conditionName: "thisYear", conditionLabel: this.options.labels.thisYear});
				conditions.push({conditionName: "lastYear", conditionLabel: this.options.labels.lastYear});
				conditions.push({conditionName: "nextYear", conditionLabel: this.options.labels.nextYear});
			} else { // string
				conditions.push({conditionName: "startsWith", conditionLabel: this.options.labels.startsWith});
				conditions.push({conditionName: "endsWith", conditionLabel: this.options.labels.endsWith});
				conditions.push({conditionName: "contains", conditionLabel: this.options.labels.contains});
				conditions.push({conditionName: "doesNotContain", conditionLabel: this.options.labels.doesNotContain});
				conditions.push({conditionName: "equals", conditionLabel: this.options.labels.equals});
				conditions.push({conditionName: "doesNotEqual", conditionLabel: this.options.labels.doesNotEqual});
			}
			
			if (this.options.showEmptyConditions) {
				conditions.push({conditionName: "empty", conditionLabel: this.options.labels.empty});
				conditions.push({conditionName: "notEmpty", conditionLabel: this.options.labels.notEmpty});
			}
			
			if (this.options.showNullConditions) {
				conditions.push({conditionName: "null", conditionLabel: this.options.labels.nullLabel});
				conditions.push({conditionName: "notNull", conditionLabel: this.options.labels.notNull});
			}
			// clear the list from existing conditions
			conditionList.empty();
			// reset selected value
			$.tmpl(this.options.filterDialogFilterConditionTemplate, conditions).appendTo(conditionList);
			// IE9 has a pretty obvious bug, we need this hack to handle that case
			if ($.browser.msie) {
				conditionList.parent().append(conditionList);
				conditionList.width(conditionList.width());
			}
		},
		_removeFilterFromDialog: function (e) {
			// remove filter
			var tableBody = $('#' + this.grid.container().attr('id') + '_dialog table tbody');
			$(e.target).closest('tr').remove();
			// hide the error message if it is shown
			if (tableBody.children().length < this.options.filterDialogMaxFilterCount) {
				$('#' + this.grid.container().attr('id') + '_dialog_error').hide();
			}
		},
		// append dropdowns as children of the grid container
		// create string filtering dropdowns
		_renderStringFilterDropDown: function (id, colName) {
			
			var ul = this._renderDropDownElement(id, colName), obj;
			// render items in the list
			if (this.options.filterDropDownItemIcons !== true) {
				
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).addClass(this.css.filterDropDownListItemClear)).text(this.options.labels.clear).addClass('ui-corner-all');
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'startsWith')).text(this.options.labels.startsWith).addClass('ui-corner-all');
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'endsWith')).text(this.options.labels.endsWith).addClass('ui-corner-all');
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'contains')).text(this.options.labels.contains).addClass('ui-corner-all');
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'doesNotContain')).text(this.options.labels.doesNotContain).addClass('ui-corner-all');
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'equals')).text(this.options.labels.equals).addClass('ui-corner-all');
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'doesNotEqual')).text(this.options.labels.doesNotEqual).addClass('ui-corner-all');
				
			} else {
				
				// the template is: "<li class='${itemClass}'><span class='${imgClass}'></span><span class='${textClass}'> ${text} </span></li>"
				obj = {itemClass: this.css.filterDropDownListItemWithIcons, imgContainerClass: this.css.filterItemIconContainer, imgClass: this.css.filterItemIconClear, textClass: this.css.filterDropDownListItemTextContainer, text: this.options.labels.clear};
				
				// render the templates (Clear)
				$.tmpl(this._ft, obj).appendTo(ul);
				
				// Starts With
				obj.text = this.options.labels.startsWith;
				obj.imgClass = this.css.filterItemIconStartsWith;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'startsWith');
				
				// Ends with
				obj.text = this.options.labels.endsWith;
				obj.imgClass = this.css.filterItemIconEndsWith;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'endsWith');
				
				// Contains
				obj.text = this.options.labels.contains;
				obj.imgClass = this.css.filterItemIconContains;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'contains');
				
				// Does Not Contain
				obj.text = this.options.labels.doesNotContain;
				obj.imgClass = this.css.filterItemIconDoesNotContain;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'doesNotContain');
				
				// Equals
				obj.text = this.options.labels.equals;
				obj.imgClass = this.css.filterItemIconEquals;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'equals');
				
				// Does Not Equal
				obj.text = this.options.labels.doesNotEqual;
				obj.imgClass = this.css.filterItemIconDoesNotEqual;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'doesNotEqual');
			}
			return ul;
		},
		// create numeric filtering dropdowns
		_renderNumericFilterDropDown: function (id, colName) {
			var ul = this._renderDropDownElement(id, colName), obj;
			// render items in the list 
			if (this.options.filterDropDownItemIcons !== true) { 
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).addClass(this.css.filterDropDownListItemClear)).text(this.options.labels.clear);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'equals')).text(this.options.labels.equals);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'doesNotEqual')).text(this.options.labels.doesNotEqual);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'greaterThan')).text(this.options.labels.greaterThan);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'lessThan')).text(this.options.labels.lessThan);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'greaterThanOrEqualTo')).text(this.options.labels.greaterThanOrEqualTo);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'lessThanOrEqualTo')).text(this.options.labels.lessThanOrEqualTo);
			} else {
				obj = {itemClass: this.css.filterDropDownListItemWithIcons, imgContainerClass: this.css.filterItemIconContainer, imgClass: this.css.filterItemIconClear, textClass: this.css.filterDropDownListItemTextContainer, text: this.options.labels.clear};
				// render the templates (Clear)
				$.tmpl(this._ft, obj).appendTo(ul);
				// Equals
				obj.text = this.options.labels.equals;
				obj.imgClass = this.css.filterItemIconEquals;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'equals');
				// DoesNotEqual
				obj.text = this.options.labels.doesNotEqual;
				obj.imgClass = this.css.filterItemIconDoesNotEqual;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'doesNotEqual');
				// GreaterThan
				obj.text = this.options.labels.greaterThan;
				obj.imgClass = this.css.filterItemIconGreaterThan;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'greaterThan');
				// LessThan
				obj.text = this.options.labels.lessThan;
				obj.imgClass = this.css.filterItemIconLessThan;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'lessThan');
				// GreaterThanOrEqualTo
				obj.text = this.options.labels.greaterThanOrEqualTo;
				obj.imgClass = this.css.filterItemIconGreaterThanOrEqualTo;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'greaterThanOrEqualTo');
				// LessThanOrEqualTo
				obj.text = this.options.labels.lessThanOrEqualTo;
				obj.imgClass = this.css.filterItemIconLessThanOrEqualTo;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'lessThanOrEqualTo');
			}
			return ul;
		},
		// create date filtering dropdowns 
		_renderDateFilterDropDown: function (id, colName) {
			var ul = this._renderDropDownElement(id, colName), obj;
			// render items in the list 
			if (this.options.filterDropDownItemIcons !== true) {
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).addClass(this.css.filterDropDownListItemClear)).text(this.options.labels.clear);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'on')).text(this.options.labels.onLabel);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'notOn')).text(this.options.labels.notOnLabel);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'after')).text(this.options.labels.after);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'before')).text(this.options.labels.before);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'today')).text(this.options.labels.today);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'yesterday')).text(this.options.labels.yesterday);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'thisMonth')).text(this.options.labels.thisMonth);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'lastMonth')).text(this.options.labels.lastMonth);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'nextMonth')).text(this.options.labels.nextMonth);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'thisYear')).text(this.options.labels.thisYear);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'lastYear')).text(this.options.labels.lastYear);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'nextYear')).text(this.options.labels.nextYear);
			} else {
				obj = {itemClass: this.css.filterDropDownListItemWithIcons, imgContainerClass: this.css.filterItemIconContainer, imgClass: this.css.filterItemIconClear, textClass: this.css.filterDropDownListItemTextContainer, text: this.options.labels.clear};
				// render the templates (Clear)
				$.tmpl(this._ft, obj).appendTo(ul);
				// On
				obj.text = this.options.labels.onLabel;
				obj.imgClass = this.css.filterItemIconOn;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'on');
				// Not On
				obj.text = this.options.labels.notOnLabel;
				obj.imgClass = this.css.filterItemIconNotOn;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'notOn');
				// After
				obj.text = this.options.labels.after;
				obj.imgClass = this.css.filterItemIconAfter;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'after');
				// Before
				obj.text = this.options.labels.before;
				obj.imgClass = this.css.filterItemIconBefore;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'before');
				//Today
				obj.text = this.options.labels.today;
				obj.imgClass = this.css.filterItemIconToday;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'today');
				// Yesterday
				obj.text = this.options.labels.yesterday;
				obj.imgClass = this.css.filterItemIconYesterday;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'yesterday');
				// thisMonth
				obj.text = this.options.labels.thisMonth;
				obj.imgClass = this.css.filterItemIconThisMonth;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'thisMonth');
				// lastMonth
				obj.text = this.options.labels.lastMonth;
				obj.imgClass = this.css.filterItemIconLastMonth;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'lastMonth');
				// NextMonth
				obj.text = this.options.labels.nextMonth;
				obj.imgClass = this.css.filterItemIconNextMonth;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'nextMonth');
				// ThisYear
				obj.text = this.options.labels.thisYear;
				obj.imgClass = this.css.filterItemIconThisYear;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'thisYear');
				// LastYear
				obj.text = this.options.labels.lastYear;
				obj.imgClass = this.css.filterItemIconLastYear;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'lastYear');
				// NextYear
				obj.text = this.options.labels.nextYear;
				obj.imgClass = this.css.filterItemIconNextYear;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'nextYear');
			}
			return ul;
		},
		// create boolean filtering dropdowns
		_renderBooleanFilterDropDown: function (id, colName) {
			
			var ul = this._renderDropDownElement(id, colName), obj;
			// render items in the list
			if (this.options.filterDropDownItemIcons !== true) {
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).addClass(this.css.filterDropDownListItemClear)).text(this.options.labels.clear);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'true')).text(this.options.labels.trueLabel);
				$('<a></a>').appendTo($('<li></li>').appendTo(ul).addClass(this.css.filterDropDownListItem).data('cond', 'false')).text(this.options.labels.falseLabel);
			} else {
				obj = {itemClass: this.css.filterDropDownListItemWithIcons, imgContainerClass: this.css.filterItemIconContainer, imgClass: this.css.filterItemIconClear, textClass: this.css.filterDropDownListItemTextContainer, text: this.options.labels.clear};
				// render the templates (Clear)
				$.tmpl(this._ft, obj).appendTo(ul);
				// True
				obj.text = this.options.labels.trueLabel;
				obj.imgClass = this.css.filterItemIconTrue;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'true');
				// False
				obj.text = this.options.labels.falseLabel;
				obj.imgClass = this.css.filterItemIconFalse;
				$.tmpl(this._ft, obj).appendTo(ul).data('cond', 'false');
			}
			return ul;
		},
		_renderDropDownElement: function (id, colName) {
			var ul, container;
			ul = $('<ul></ul>').appendTo("body").addClass(this.css.filterDropDownList);
			container = $('<div></div>').appendTo("body").attr('id', id).addClass(this.css.filterDropDown).css('overflow', 'hidden').css('position', 'absolute').hide();
			if (!$.browser.msie) {
				container.css('overflow-y', 'auto');
			}
			container.remove();
			if (this.options.filterDropDownWidth > 0) {
				ul.css('width', this.options.filterDropDownWidth);
			}
			if (this.options.filterDropDownHeight > 0) {
				container.css('height', this.options.filterDropDownHeight);
			}
			ul.data('colName', colName);
			ul.wrap(container);
			// mark it with the "efh" attribute - "excludeFromHeight"
			ul.parent().data('efh', '1');
			// attach events
			$('#' + id + ' li').live({
				mousedown: $.proxy(this._selectDropDownItem, this),
				mouseover: $.proxy(this._hoverDropDownItem, this),
				mouseout: $.proxy(this._unhoverDropDownItem, this)
			});
			return ul;
		},
		_hoverButton: function (event) {
			var $target  = $(event.currentTarget).find('span');
			if (this.options.mode === "advanced") {
				$target.addClass(this.css.filterButtonAdvancedHover);
			} else {
				$target.addClass(this.css.filterButtonHover);
			}
		},
		_unhoverButton: function (event) {
			var $target  = $(event.currentTarget).find('span');
			if (this.options.mode === "advanced") {
				$target.removeClass(this.css.filterButtonAdvancedHover);
			} else {
				$target.removeClass(this.css.filterButtonHover);
			}
		},
		_activateButton: function (event) {
			var $target = $(event.currentTarget).find('span');
			if (this._dontApplyStyles) {
				this._dontApplyStyles = false;
				return;
			}
			if (this.options.mode === "advanced") {
				$target.addClass(this.css.filterButtonAdvancedActive);
			} else {
				$target.addClass(this.css.filterButtonActive);
			}
		},
		_deactivateButton: function (event) {
			var target = $(event.target).find('span');
			target.removeClass(this.css.filterButtonAdvancedActive);
			target.removeClass(this.css.filterButtonActive);
		},
		_toggleDropDown: function (event, close, dontFocus) {
			var $target  = $(event.currentTarget), id = $target.attr('id'), dd, left, top, leftScroll, topScroll, noCancel = true, button = $target.find('span');
			
			if (this._animating && id === this._animatingId) {
				return;
			}
			// find the dropdown
			dd = $('#' + id.substring(0, id.indexOf('_button')));
			// set left and top to position the dropdown below the button
			leftScroll = 0;
			topScroll = 0;
			
			if (!(!dd.is(":visible") && close === true)) { 
				this._animating = true;
				this._animatingId = id;
			}
			
			if (this._openingAnimation !== true) {
				this._dontFocus = dontFocus;
			} else {
				this._dontFocus = null;	
			}
			this._isClosing = false;
			// trigger dropdown opening / closing
			if (dd.is(":visible")) {
				// trigger closing
				noCancel = this._trigger(this.events.dropDownClosing, null, {dropDown: dd, owner: this});
				this._isClosing = true;
			} else {
				// trigger opening
				if (!close) {
					noCancel = this._trigger(this.events.dropDownOpening, null, {dropDown: dd, owner: this});
				}
			}
			if (noCancel) {
				// looks like this issue is fixed in FF4, therefore i am not going to 
				//if (!$.browser.webkit && !$.browser.msie) {
					//leftScroll = $(document).scrollLeft();
					//topScroll = $(document).scrollTop();
				//} 
				left = button.offset().left;
				top = button.offset().top + button.outerHeight();
				// account for body padding
				//left = left + parseInt($('body').css('margin-left'), 10) + parseInt($('body').css('padding-left'), 10);
				//top = top + parseInt($('body').css('margin-top'), 10) + parseInt($('body').css('padding-top'), 10);
				// finally, show the dropdown, if it is hidden, or hide it alternatively
				if (dd.offset().left !== left && dd.offset().top !== top) {
					dd.css('left', left).css('top', top);
				}
				this._currentTarget = $target;
				this._dd = dd;
				if ($.browser.msie) {
					dd.css('overflow-x', 'hidden');
					dd.css('overflow-y', 'hidden');
				}
				if (close !== undefined && close === true) {
					if (dd.is(':visible')) {
						if (this.options.filterDropDownAnimations !== "none") {
							dd.hide(this.options.filterDropDownAnimationDuration, $.proxy(this._animationEnd, this));
						} else {
							dd.hide();
							// trigger closed event
							this._trigger(this.events.dropDownClosed, null, {dropDown: dd, owner: this});
						}
					}
				} else {
					if (this.options.filterDropDownAnimations !== "none") {
						if (dd.is(':visible')) {
							this._closingTarget = this._currentTarget; 
						} else {
							this._openingTarget = this._currentTarget;
							this._openingAnimation = true;
						}
						dd.toggle(this.options.filterDropDownAnimationDuration, $.proxy(this._animationEnd, this));
					} else {
						dd.toggle();
						// trigger closed/opened events
						if (this._isClosing) {
							this._trigger(this.events.dropDownClosed, null, {dropDown: dd, owner: this});
						} else {
							this._trigger(this.events.dropDownOpened, null, {dropDown: dd, owner: this});
						}
						// we need to focus the button manually
						if (dontFocus !== true) {
							this._dontApplyStyles = true;
							$target.focus();
						} 
					}
				}
			}
		},
		_animationEnd: function () {
			if (this._isClosing === true) {
				this._trigger(this.events.dropDownClosed, null, {dropDown: this._dd, owner: this});
			} else {
				this._trigger(this.events.dropDownOpened, null, {dropDown: this._dd, owner: this});
				this._openingAnimation = false;
			}
			if (this._dd && $.browser.msie) {
				this._dd.css('overflow-y', 'auto');
			}
			this._isClosing = null;
			// we need to focus the button manually
			if (this._dontFocus !== true) {
				this._dontApplyStyles = true;
				this._openingTarget.focus();
			}
			this._animating = false;
		},
		_toggleDropDownKeyboard: function (event) {
			if (event.keyCode === $.ui.keyCode.ENTER || event.keyCode === $.ui.keyCode.SPACE) {
				event.stopPropagation();
				event.preventDefault();
				this._toggleDropDown(event);
			} else if (event.keyCode === $.ui.keyCode.DOWN) {
				event.stopPropagation();
				event.preventDefault();
				this._selectDropDownItem(event, 'next');
			} else if (event.keyCode === $.ui.keyCode.UP) {
				event.stopPropagation();
				event.preventDefault();
				this._selectDropDownItem(event, 'prev');
			}
		},
		_closeDropDown: function (event) {
			var $target = $(event.currentTarget).find('span');
			if (this._openingTarget && event.target.id === this._openingTarget.attr('id') && this._openingAnimation === true) {
				return;
			} 
			this._toggleDropDown(event, true, true);
			if (this._dontApplyStyles) {
				this._dontApplyStyles = false;
				return;
			}
			if (this.options.mode === "advanced") {
				$target.removeClass(this.css.filterButtonAdvancedActive);
			} else {
				$target.removeClass(this.css.filterButtonActive);
			}
		},
		_selectDropDownItem: function (event, nav) {
			var $target = $(event.currentTarget), filterCondition, colIndex, sel, parent, button, requiresEntry, currentCond;
			if ($target.find('input').length > 0 && this.options.mode === "advanced") {
				return;
			}
			if (nav === 'next' || nav === 'prev') {
				parent = $('#' + $target.attr('id').substring(0, $target.attr('id').indexOf('_button'))).find('ul');
			}
			if (nav === 'next') {
				// get the currently selected item
				if (parent.data('selectedItem') === undefined) {
					$target = parent.find('li:first');
				} else {
					$target = parent.find('li:nth-child(' + (parent.data('selectedItem') + 1) + ')');
					if ($target.next().length === 0) {
					// last, get the first
						$target = parent.find('li:first');
					} else {
						$target = $target.next();
					}
				}
			}
			if (nav === 'prev') {
				// get the currently selected item
				if (parent.data('selectedItem') === undefined) {
					$target = parent.find('li:last');
				} else {
					$target = parent.find('li:nth-child(' + (parent.data('selectedItem') + 1) + ')');
					if ($target.prev().length === 0) {
						// last, get the first
						$target = parent.find('li:last');
					} else {
						$target = $target.prev();
					}
				}
			}
			filterCondition = $target.data('cond');
			// update tooltip
			button = $('#' + $target.closest('div').attr('id') + '_button');
			if ($target.data('cond') === undefined) {
				button.attr('title', this.options.tooltipTemplate.replace('${condition}', this.options.labels.noFilter));
			} else {
				button.attr('title', this.options.tooltipTemplate.replace('${condition}', $target.text()));
			}
			colIndex = $('#' + $target.closest('div').attr('id') + '_button').find('span').data('colIndex');
			currentCond = this.options.columnSettings[parseInt(colIndex, 10)].condition;
			if (filterCondition !== undefined) {
				// change the editor condition
				this.options.columnSettings[parseInt(colIndex, 10)].condition = filterCondition;
			} else if (currentCond === 'empty' || currentCond === 'notEmpty' || currentCond === 'null' || currentCond === 'notNull' || !this._requiresEntry(currentCond)) {
				// should not be null but the default condition !
				this.options.columnSettings[parseInt(colIndex, 10)].condition = this._getDefaultCondition(this.grid.options.columns[colIndex].dataType);
			}
			// apply active state on target
			sel = $target.parent().data('selectedItem');
			if (sel !== undefined) {
				$target.parent().find('li:nth-child(' + (sel + 1) + ')').removeClass(this.css.filterDropDownListItemActive);
			}
			$target.addClass(this.css.filterDropDownListItemActive);
			$target.parent().data('selectedItem', $('li', $target.parent()).index($target));
			// reinitialize editor
			this._editors[colIndex].element.igEditor("option", "nullText", this.options.nullTexts[filterCondition]);
			requiresEntry = this._requiresEntry(filterCondition);
			// we should always clear the filter after a new one has been selected
			if ($target.hasClass('ui-iggrid-filterddlistitemclear') || (this.options.filterDropDownItemIcons === true && $target.find('.ui-iggrid-filtericonclear').length > 0)) {
				// clear editor
				// if the default condition does not require an entry, set readOnly to false on the editor
				if (!requiresEntry || filterCondition === undefined) {
					this._editors[colIndex].element.igEditor("option", "readOnly", false);
				}
				this._editors[colIndex].value(null);
				this._filterDataSourceClear(this.grid.options.columns[colIndex].key);
			} else {
				// determine if the condition requires entry
				if (!requiresEntry) {
					this._editors[colIndex].element.igEditor("option", "readOnly", true);
					// set correct input value if it doesn't require an entry
					this._editorValueForCondition(filterCondition, this._editors[colIndex]);
					this._filterInternal(colIndex, this.grid.options.columns[colIndex].key);
				//A.T. 14 Feb 2011 - Fix for bug #64465
				} else if (this._editors[colIndex].value() !== "" && this._editors[colIndex].value() !== null) {
					this._editors[colIndex].value(null);
				}
				if (requiresEntry) {
					this._editors[colIndex].element.igEditor("option", "readOnly", false);
				}
				if (nav === undefined && filterCondition !== undefined) {
					this._editors[colIndex].setFocus();
				}
			}
		},
		_requiresEntry: function (filterCondition) {
			if (filterCondition === "true" ||
					filterCondition === "false" ||
					filterCondition === "today" ||
					filterCondition === "yesterday" ||
					filterCondition === "thisMonth" ||
					filterCondition === "nextMonth" ||
					filterCondition === "lastMonth" ||
					filterCondition === "thisYear" ||
					filterCondition === "lastYear" ||
					filterCondition === "empty" ||
					filterCondition === "notEmpty" ||
					filterCondition === "null" ||
					filterCondition === "notNull" ||
					filterCondition === "nextYear") {
				return false;
			} 
			if (filterCondition === undefined || filterCondition === null) {
				return false;
			}
			return true;
		},
		_editorValueForCondition: function (filterCondition, editor) {
			var date = new Date();
			if (filterCondition === "true") {
				editor.value(true);
			} else if (filterCondition === "false") {
				editor.value(false);
			} else if (filterCondition === "today") {
				editor.value(new Date());
			} else if (filterCondition === "yesterday") {
				editor.value(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, 0, 0, 0, 0));
			/*
			} else if (filterCondition === "empty") {
				editor.value('empty');
			} else if (filterCondition === "notEmpty") {
				editor.value('notEmpty');
			} else if (filterCondition === "null") {
				editor.value('null');
			} else if (filterCondition === "notNull") {
				editor.value('notNull');
			*/
			} else {
				editor.value(null);
			}
		},
		_hoverDropDownItem: function (event) {
			if ($(event.currentTarget).find('input').length === 0) {
				$(event.currentTarget).addClass(this.css.filterDropDownListItemHover);
			}
		},
		_unhoverDropDownItem: function (event) {
			$(event.currentTarget).removeClass(this.css.filterDropDownListItemHover);
		},
		_virtualHorizontalScroll: function (event, args) {
			var start = args.startColIndex, i, headers = this.grid.headersTable().find('th');
			if (this._currentTarget) {
				this._toggleDropDown({currentTarget: this._currentTarget}, true);
			}
			
			if (this.options.mode === "advanced" && this.options.advancedModeEditorsVisible !== true) {
				for (i = 0; i < this.grid._virtualColumnCount; i++) {
					$(headers[i]).data('colName', this.grid.options.columns[i + start].key);
					// update button ID
					$(headers[i]).find('a').attr('id', this.grid.element[0].id + '_dd_' + this.grid.options.columns[i + start].key + '_button');
				}
				this._updateTooltips(this._currentAdvancedExpressions ? this._currentAdvancedExpressions : []);
			} else {
				throw new Error($.ig.GridFiltering.locale.virtualizationSimpleFilteringNotAllowed);
				/*
				// re-create the editors and reset the dropdown buttons as we scroll
				buttons = $('.ui-iggrid-filterrow', this.grid.container()).find('.ui-iggrid-filterbutton');
				for (i = 0; i < this.grid._virtualColumnCount; i++) {
					// change the button ids and the header IDs
					$(buttons[i]).parent().attr('id', this.grid.element[0].id + '_dd_' + this.grid.options.columns[i + start].key + '_button');
					$(headers[i]).attr('id', this.grid.options.columns[i + start].key);
					
					// now swap the editors
					this._editors[i].element.swap(this._editors[i + start].element);
				}
				*/
			}
		},
		_injectGrid: function (gridInstance, isRebind) {
			this.grid = gridInstance;
			// attach headerRendered handler
			if (this.options.filterExprUrlKey) {
				this.grid.dataSource.settings.filtering.filterExprUrlKey = this.options.filterExprUrlKey;
			}
			this.grid.dataSource.settings.filtering.caseSensitive = this.options.caseSensitive;
			if (this._headerRenderedHandler !== null) {
				this.grid.element.unbind('iggridheaderrendered', this._headerRenderedHandler);
			}
			this._headerRenderedHandler = $.proxy(this._headerRendered, this);
			this.grid.element.bind('iggridheaderrendered', this._headerRenderedHandler);
			//if (!isRebind) {
			this._initDefaultSettings();
			//}
			// register for uiDirty
			this.grid.element.bind('iggriduidirty', $.proxy(this._onUIDirty, this));
			
			// manage horizontal virtual scrolling -> columns need to be updated accordingly and 
			this._virtualHorizontalScrollHandler = $.proxy(this._virtualHorizontalScroll, this);
			this.grid.element.bind('iggridvirtualhorizontalscroll', this._virtualHorizontalScrollHandler);
			
			if (((this.grid.options.virtualization === true && this.grid.options.width !== null) || this.grid.options.columnVirtualization === true) && this.options.mode === null) {
				this.options.mode = 'advanced';
			} else if (((this.grid.options.virtualization === false || (this.grid.options.virtualization === true && this.grid.options.width === null)) && this.grid.options.columnVirtualization === false) && this.options.mode === null) {
				this.options.mode = 'simple';
			} else if (this.options.mode === 'simple' && (this.grid.options.virtualization === true || this.grid.options.columnVirtualization === true)) {
				throw new Error($.ig.GridFiltering.locale.virtualizationSimpleFilteringNotAllowed);
			}
		}
	});
    $.extend($.ui.igGridFiltering, {version: '11.1.20111.1014'});
}(jQuery));
/*
 * Infragistics.Web.ClientUI Grid Editing 11.1.20111.1014
 *
 * Copyright (c) 2011 Infragistics Inc.
 * <Licensing info>
 *
 * http://www.infragistics.com/
 *
 * Depends on:
 * Depends on:
 *  jquery-1.4.4.js
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	ig.ui.grid.framework.js
 *  ig.ui.editors.js
 *  ig.ui.validator.js
 *  ig.ui.shared.js
 *  ig.dataSource.js
 *	ig.util.js
 */
 
/*global jQuery, window, document */
(function ($) {
	var _aNull = function (v, nan) {
		return v === null || v === undefined || (nan && isNaN(v));
	}, _int = function (e, val) {
		val = e ? e.css(val) : 0;
		try {
			val = parseInt(val, 10);
		} catch (ex) {}
		return (val && !isNaN(val)) ? val : 0;
	}, _stop = function (e) {
		if (e && e !== 1) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }
		}
	};
	$.widget('ui.igGridUpdating', {
		grid: null,
		options: {
			/* type="object" Sets gets array of settings for each column. */
			columnSettings: [ {
				/* type="string|number|object" Sets gets identifier for column. Default is null. */
				key: null,
				/* type="string|number" Sets gets type of igEditor, such as "currency", "datepicker", "mask", etc. Default is null. */
				editorType: null,
				/* type="object" Sets gets options supported by igEditor. Default is null. */
				editorOptions: null,
				/* type="bool" Sets gets validation for required entry.
					Default is null.
					True: validate for required entry.
					False: do not validate for required entry. */
				required: null,
				/* type="bool" Sets gets read only.
					Default is null.
					True: exclude cells in column from editing.
					False: allow editing cells in column. */
				readOnly: null,
				/* type="bool" Sets gets validation of cell.
					Default is null.
					True: enable validation according to rules of igEditor, such as min/maxValue in numeric/date editors, etc.
					False: do not enable validation. */
				validation: null,
				/* type="string|number|date|object" Sets gets default value in cell for add-new-row. Default is null. */
				defaultValue: null
			} ],
			/* type="string" Sets gets edit mode.
				Default value is "row".
				Supported values: "row", "cell", "none" or null. */
			editMode: 'row',//'cell', 'none', null
			/* type="bool" Sets gets delete-row functionality.
				True: the "Delete" button is displayed on mouse-over a row and all selected rows are deleted by Delete-key.
				False: delete-row is disabled.
				Default value is true. */
			enableDeleteRow: true,
			/* type="bool" Sets gets add-new-row functionality.
				True: the "Add Row" button is displayed on header, click on that button shows editors in all columns and new row inserted at the end of editing.
				False: add-row is disabled.
				Default value is true. */
			enableAddRow: true,
			/* type="bool" Sets gets validation for all columns.
				True: the validation for all columns is enabled.
				False: validation is disabled.
				Default value is false. */
			validation: false,
			/* type="string|object" Sets gets strings for titles and buttons used by igGridUpdating.
				Default is null.
				If the value of that option is String, such as "bg", "fr", etc., then editor will attempt to find and use $.ui.igGridUpdating.locale[valueOfOption] object.
				Value of object should contain pairs or key:value members.
				Note: any suboption of locale can appear within the main option of igEditor.
				In this case those values within main options will have highest priority and override corresponding value in locale. */
			locale: null,
			/* type="bool" Sets gets visibility of the icon on the Done editing button.
				True: icon is displayed.
				False: no icon.
				Default value is true. */
			showDoneIcon: true,
			/* type="bool" Sets gets visibility of the icon on the Cancel editing button.
				True: icon is displayed.
				False: no icon.
				Default value is true. */
			showCancelIcon: true,
			/* type="bool" Sets gets visibility of the icon on the add-new-row button.
				True: icon is displayed.
				False: no icon.
				Default value is true. */
			showAddRowIcon: true,
			/* type="bool" Sets gets visibility of the text on the add-new-row button.
				True: text is displayed.
				False: no text.
				Default value is true. */
			showAddRowText: true,
			/* type="bool" Sets gets visibility of the end-edit pop-up dialog with Done/Cancel buttons.
				True: end-edit pop-up is used.
				False: no confirm pop-up.
				Default value is true. */
			showDoneCancelButtons: true,
			/* type="bool" Sets gets visibility of the text on the Delete-row button.
				True: text is displayed.
				False: no text.
				Default value is true.
				Note: text is defined by the locale.deleteText option. */
			showDeleteText: true,
			/* type="bool" Sets gets visibility of the icon on the Delete-row button.
				True: icon is displayed.
				False: no icon.
				Default value is true. */
			showDeleteIcon: true,
			/* type="bool" Sets gets automatic commit on any change like add-new-row, delete row and end edit.
				True: auto commit is enabled.
				False: no auto commint.
				Default value is true. */
			autoCommit: true,
			/* type="string" Sets gets triggers for start edit mode.
				Possible values: "click", "dblclick", "F2", "enter" and their combinations separated by coma.
				Default value is "click,F2,enter". */
			startEditTriggers: 'click,F2,enter'
		},
		events: {
			/* cancel="true" Event which is raised before start row editing.
				Return false in order to cancel editing and do not show editors in row.
				Function takes arguments evt and ui.
				Use ui.row to get key or index of row.
				Use ui.rowAdding to check if that event is raised while new-row-adding. */
			editRowStarting: 0,
			/* Event which is raised after start row editing.
				Function takes arguments evt and ui.
				Use ui.row to get key or index of row.
				Use ui.rowAdding to check if that event is raised while new-row-adding. */
			editRowStarted: 1,
			/* cancel="true" Event which is raised before end row editing.
				Return false in order to cancel update of data source.
				Function takes arguments evt and ui.
				Use ui.row to get key or index of row.
				Use ui.keepEditing=true in order to keep editing.
				Use ui.update to check if value of any cell was modified and data source will be updated.
				Use ui.rowAdding to check if that event is raised while new-row-adding. */
			editRowEnding: 2,
			/* Event which is raised after end row editing.
				Function takes arguments evt and ui.
				Use ui.row to get key or index of row.
				Use ui.update to check if value of any cell was modified and data source will be updated.
				Use ui.rowAdding to check if that event is raised while new-row-adding. */
			editRowEnded: 3,
			/* cancel="true" Event which is raised before start cell editing.
				Return false in order to cancel start editing and do not show editors.
				Function takes arguments evt and ui.
				Use ui.row to get key or index of row.
				Use ui.column to get index of column.
				Use ui.key to get key of column.
				Use ui.editor to get reference to igEditor.
				Use ui.value to get or set value of editor.
				Use ui.rowAdding to check if that event is raised while new-row-adding. */
			editCellStarting: 4,
			/* Event which is raised after start cell editing.
				Function takes arguments evt and ui.
				Use ui.row to get key or index of row.
				Use ui.column to get index of column.
				Use ui.key to get key of column.
				Use ui.editor to get reference to igEditor.
				Use ui.value to get value of editor.
				Use ui.rowAdding to check if that event is raised while new-row-adding. */
			editCellStarted: 5,
			/* cancel="true" Event which is raised before end cell editing.
				Return false in order to cancel update of data source.
				Function takes arguments evt and ui.
				Use ui.row to get key or index of row.
				Use ui.column to get index of column.
				Use ui.key to get key of column.
				Use ui.editor to get reference to igEditor.
				Use ui.value to get value of cell/editor. That value can be modified and it will be used to update data source.
				Use ui.update to check if value was modified and data source will be updated.
				Use ui.rowAdding to check if that event is raised while new-row-adding. */
			editCellEnding: 6,
			/* Event which is raised after end cell editing.
				Function takes arguments evt and ui.
				Use ui.row to get key or index of row.
				Use ui.column to get index of column.
				Use ui.key to get key of column.
				Use ui.editor to get reference to igEditor.
				Use ui.value to get value of cell.
				Use ui.update to check if cell was modified and data source will be updated.
				Use ui.rowAdding to check if that event is raised while new-row-adding. */
			editCellEnded: 7,
			/* cancel="true" Event which is raised before adding new row.
				Return false in order to cancel adding new row to data source.
				Function takes arguments evt and ui.
				Use ui[keyOfColumn] to get or set value of cell in column with the key equals to keyOfColumn. These cell values can be modified and they will be used to update data source. */
			rowAdding: 8,
			/* Event which is raised after adding new row.
				Function takes arguments evt and ui.
				Use ui[keyOfColumn] to get value of cell in column with the key equals to keyOfColumn. */
			rowAdded: 9,
			/* cancel="true" Event which is raised before row deleting.
				Return false in order to cancel.
				Function takes arguments evt and ui.
				Use ui.element to get reference to jquery object which represents TR of row to delete.
				Use ui.row to get key or index of row to delete. */
			rowDeleting: 10,
			/* Event which is raised after row deleting.
				Function takes arguments evt and ui.
				Use ui.element to get reference to jquery object which represents TR of row to delete.
				Use ui.row to get key or index of row to delete. */
			rowDeleted: 11
		},
		css: {
			/* Classes applied to the container of Done and Cancel editing buttons. Default value is 'ui-iggrid-buttoncontainer ui-widget-content' */
			buttonContainer: 'ui-iggrid-buttoncontainer ui-widget-content',
			/* Classes applied to the buttons. Default value is 'ui-iggrid-button ui-state-default' */
			button: 'ui-iggrid-button ui-state-default',
			/* Classes applied to the Done button. Default value is 'ui-iggrid-donebutton ui-priority-primary' */
			doneButton: 'ui-iggrid-donebutton ui-priority-primary',
			/* Class applied to the Cancel button. Default value is 'ui-iggrid-cancelbutton' */
			cancelButton: 'ui-iggrid-cancelbutton',
			/* Classes applied to the Delete button. Default value is 'ui-iggrid-deletebutton ui-state-default' */
			deleteButton: 'ui-iggrid-deletebutton ui-state-default',
			/* Classes applied to buttons in mouse-over state. Default value is 'ui-iggrid-buttonhover ui-state-hover' */
			buttonHover: 'ui-iggrid-buttonhover ui-state-hover',
			/* Classes applied to buttons in disabled state. Default value is 'ui-iggrid-buttondisabled ui-state-disabled' */
			buttonDisabled: 'ui-iggrid-buttondisabled ui-state-disabled',
			/* Classes applied to buttons in active/focus state. Default value is 'ui-iggrid-buttonactive ui-state-active' */
			buttonActive: 'ui-iggrid-buttonactive ui-state-active',
			/* Classes applied to the icon on Done button. Default value is 'ui-iggrid-doneicon ui-icon ui-icon-check' */
			doneIcon: 'ui-iggrid-doneicon ui-icon ui-icon-check',
			/* Classes applied to the icon on Done button. Default value is 'ui-iggrid-cancelicon ui-icon ui-icon-cancel' */
			cancelIcon: 'ui-iggrid-cancelicon ui-icon ui-icon-cancel',
			/* Classes applied to the editing cells. Default value is 'ui-iggrid-editingcell' */
			editingCell: 'ui-iggrid-editingcell',
			/* Classes applied to the add-new-row button. Default value is 'ui-iggrid-addrow ui-widget-header' */
			addRow: 'ui-iggrid-addrow ui-widget-header',
			/* Classes applied to the add-new-row button in mouse-over state. Default value is 'ui-iggrid-addrowhover ui-state-hover' */
			addRowHover: 'ui-iggrid-addrowhover ui-state-hover',
			/* Classes applied to the add-new-row button in active/focus state. Default value is 'ui-iggrid-addrowactive ui-state-active' */
			addRowActive: 'ui-iggrid-addrowactive ui-state-active',
			/* Classes applied to the icon on add-new-row button. Default value is 'ui-iggrid-addrowicon ui-icon ui-icon-circle-plus' */
			addRowIcon: 'ui-iggrid-addrowicon ui-icon ui-icon-circle-plus',
			/* Classes applied to the icon on Delete button. Default value is 'ui-iggrid-deleteicon ui-icon ui-icon-circle-close' */
			deleteIcon: 'ui-iggrid-deleteicon ui-icon ui-icon-circle-close',
			/* Class applied to editors. Default value is 'ui-iggrid-editor' */
			editor: 'ui-iggrid-editor'
		},
		locale: {
			/* Text for Done editing button. */
			done: 'Done',
			/* Text for title of Done editing button. */
			doneTitle: 'Stop editing and update',
			/* Text for Cancel editing button. */
			cancel: 'Cancel',
			/* Text for title of Cancel editing button. */
			cancelTitle: 'Stop editing and do not update',
			/* Text for add-new-row button. */
			addRow: 'Add new row',
			/* Text for title of add-new-row button. */
			addRowTitle: 'Click to start adding new row',
			/* Text for Delete row button. */
			deleteRow: 'Delete',
			/* Text for title of Delete row button. */
			deleteRowTitle: 'Delete row'
		},
		startEdit: function (row, col, e) {
			/* Start editing.
				paramType="number" Index of row.
				paramType="number" Index of column.
				paramType="object" optional="true" Browser event. If it is defined, then events are raised.
				returnType="bool" Returns true in case of success or current editing is continued.
			*/
			var td = this.grid.cellAt(col, row);
			if (td) {
				return this._startEdit($(td), e ? e : 1, 1) === 1;
			}
		},
		startAddRowEdit: function (e) {
			/* Start row editing.
				paramType="object" optional="true" Browser event. If it is defined, then events are raised.
				returnType="bool" Returns true in case of success or current editing is continued.
			*/
			var tr = this._newTR;
			if (tr) {
				return this._startEdit($(tr.children()[0]), e ? e : 1, 1, 1, this._addTR.children()[0].offsetHeight) === 1;
			}
		},
		endEdit: function (update, e) {
			/* End row editing.
				paramType="bool" optional="true" Request to update grid with new values.
				paramType="object" optional="true" Browser event. If it is defined, then events are raised.
				returnType="bool" Returns false if request failed and editing is continued.
			*/
			return !this._endEdit(e ? e : 1, update);
		},
		findInvalid: function () {
			/* Find column-key which editor has invalid value. It has effect only while row-editing in on.
				returnType="string|number" Return key of column which editor has invalid value and validation of column is enabled.
			*/
			var key, all = this._editors;
			for (key in all) {
				if (all.hasOwnProperty(key) && all[key] && all[key].igEditor('validator') && !all[key].igEditor('isValid')) {
					return key;
				}
			}
		},
		isEditing: function () {
			/* Check if editing is on.
				returnType="bool" Returns true if editing is on.
			*/
			return !!this._tds;
		},
		editorForKey: function (key) {
			/* Find editor for a column with key.
				paramType="string|number" Key of column.
				returnType="object" Returns reference to igEditor or null.
			*/
			var e = this._editors;
			return e ? e[key] : null;
		},
		editorForCell: function (td, add) {
			/* Find or create editor which is used for a jquery TD object.
				paramType="$" Reference to jquery TD object.
				paramType="bool" optional="true" Value true should be used if first parameter TD belongs to add-new-row.
				returnType="object" Returns reference to igEditor or null.
			*/
			var e, key = this._key(td), edits = this._editors;
			if (!edits) {
				edits = this._editors = {};
			}
			if (!(e = edits[key]) && add) {
				e = edits[key] = this._createEditor(td, key);
			}
			return e;
		},
		numberOfRows: function () {
			/* Get number of rows in grid.
				returnType="number" Returns number of rows in view of grid's dataSource.
			*/
			return this.grid.dataSource.dataView().length;
		},
		_setOption: function (key, value) {
			var o = this.options;
			if (o[key] === value) {
				return;
			}
			this._endEdit();
			// 2-remove buttons
			this._doButtons(2);
			o[key] = value;
			if (key.indexOf('ddRow') > 0 || (key === 'locale' && o.enableAddRow)) {
				this._headerRendered();
				this.grid._initializeHeights();
			}
		},
		_fire: function (id, e, a) {
			var name, ee = this.events;
			if (a && e && e !== 1) {
				for (name in ee) {
					if (ee.hasOwnProperty(name) && ee[name] === id) {
						return this._trigger(name, e, a);
					}
				}
			}
			return 1;
		},
		// get localized string with following priority: options, options.locale, locale.defaults, this.locale
		_loc: function (prop) {
			var v, o = this.options;
			if (_aNull(v = o[prop]) && _aNull(v = o[prop + 'Text'])) {
				o = o.locale;
				if (typeof o === 'string') {
					o = $.ui.igGridUpdating.locale[o];
				}
				if (!o || _aNull(v = o[prop])) {
					v = $.ui.igGridUpdating.locale.defaults[prop];
				}
			}
			return _aNull(v) ? this.locale[prop] : v;
		},
		_div: function () {
			return this.grid.container();
		},
		//i=1: flag to destroy
		_headerRendered: function (i) {
			// render the filter row
			var th, plus, td, cols, txt, css = this.css, tr = this._addTR, o = this.options, grid = this.grid;
			if (!o.enableAddRow || i === 1) {
				if (tr) {
					tr.remove();
					this._newTR.remove();
					this._newTR = this._addTR = null;
				}
				return;
			}
			txt = this._loc('addRow');
			txt = (!txt || !o.showAddRowText) ? '&nbsp;' : txt;
			if (tr) {
				tr.find('.anr_t').attr('innerHTML', txt);
				tr.find('.anr_i').css('display', o.showAddRowIcon ? 'inline-block' : 'none');
			}
			th = this._div().find('thead');
			if (!th || tr) {
				return;
			}
			plus = o.showPlusIcon;
			cols = grid.options.columns;
			tr = this._addTR = $('<tr />').addClass(css.addRow).appendTo(th);
			td = $('<td colspan="' + cols.length + '"></td>').attr('title', this._loc('addRowTitle')).addClass(css.addRow).bind(this._evts).appendTo(tr);
			td.attr('tabIndex', this._ti);
			// initial shift of AddNewRow content from left edge of table
			this._addLeft = _int(td, 'paddingLeft');
			$('<span />').css('display', o.showAddRowIcon ? 'inline-block' : 'none').addClass(css.addRowIcon).addClass('anr_i').appendTo(td);
			$('<span>' + txt + '</span>').addClass('anr_t').appendTo(td);
			// render (hidden) cells
			tr = this._newTR = $('<tr />').appendTo(th).hide();
			for (i = 0; i < cols.length; i++) {
				td = $('<td>&nbsp;</td>').addClass(css.editingCell).appendTo(tr);
			}
		},
		_dataRendered: function () {
			if (this._wasInit) {
				return;
			}
			// enable processing scroll events
			this._scrollDiv();
			this._div().bind(this._evts);
			this._wasInit = true;
		},
		_findCell: function (e) {
			var i = 0, td = $(e), grid = this.grid.element[0];
			if (!td.is('td')) {
				td = td.closest('td');
			}
			e = td;
			while (e && i++ < 5) {
				e = e.parent();
				if (e && e[0] === grid) {
					break;
				}
			}
			return (i === 3 && this._col(td) >= 0 && this._row(td) >= 0) ? td : null;
		},
		_td: function () {
			var i, tds = this._tds;
			if (tds) {
				for (i in tds) {
					if (tds.hasOwnProperty(i) && tds[i]) {
						return tds[i];
					}
				}
			}
		},
		_row: function (td) {
			return td ? td.parent().index() : -1;
		},
		_col: function (td) {
			return td ? td.index() : -1;
		},
		_colSet: function (td, key) {
			var i, cols = this.options.columnSettings;
			if (!key) {
				key = this._key(td);
			}
			i = (cols && key) ? cols.length : 0;
			while (i-- > 0) {
				if (cols[i].key === key) {
					return cols[i];
				}
			}
		},
		_isSame: function (td1, td2) {
			return this._row(td1) === this._row(td2) && this._col(td1) === this._col(td2);
		},
		_gridCol: function (key, id) {
			var i = -1, cols = this.grid.options.columns;
			while (++i < cols.length) {
				if (cols[i].key === key) {
					return id ? i : cols[i];
				}
			}
		},
		_prime: function (td) {
			var i = this._gridCol(this.grid.options.primaryKey, 1);
			if (!_aNull(i)) {
				td = td.parent()[0].childNodes[i];
				i = _aNull(i = td._txt) ? $(td).text() : i;
				td = this._gridCol(this.grid.options.primaryKey);
				if (td && td.dataType === 'number' && !isNaN(td = parseFloat(i))) {
					i = td;
				}
				return i;
			}
			return this._row(td);
		},
		_key: function (td) {
			var cols = this.grid.options.columns, col = this._col(td);
			col = (cols && col >= 0) ? cols[col] : null;
			return col ? col.key : null;
		},
		_equals: function (v1, v2) {
			return v1 === v2 || (v1 && v2 && v1.getTime && v2.getTime && v1.getTime() === v2.getTime());
		},
		// get/set value of cell in grid
		// if set and edit mode is row, then update vals[key] with new value and return "not undefined"
		_val: function (td, arg, vals) {
			var val, add = this._adding, grid = this.grid, row = this._row_, key = this._key(td);
			if (add) {
				val = this._colSet(td, key);
				if (val) {
					val = val.defaultValue;
				}
			} else {
				val = grid.getCellValue(row, key);
			}
			// set cell value
			if (arg) {
				if (add || !this._equals(val, arg.value)) {
					// row update container
					if (vals) {
						return (vals[key] = arg.value);
					}
					// cell update
					grid.setCellValue(row, key, arg.value, td[0], this.options.autoCommit);
				}
				return undefined;
			}
			// get cell value
			return val;
		},
		// find next TD which should go in edit mode
		// shift: 0-next TR, 1-next TD, -1-previous TD
		//	cur: {tbl: td.parent().parent(), row: this._rowIndex, col: this._col(td)}
		_nextTD: function (cur, shift, edit) {
			var i, tds, len, tr, td, rows = cur.tbl.childNodes;
			if (!rows || !(tr = rows[cur.row])) {
				return;
			}
			// TDs in current row
			tds = tr.childNodes;
			len = tds.length;
			// index of next TD
			i = cur.col + shift;
			// index of next TR
			tr = cur.row + (shift ? shift : 1);
			// tab key: next/prev TD in TR
			if (shift) {
				if (i >= 0 && i < len) {
					td = tds[cur.col = i];
				} else if (edit) {
					td = (tr >= 0 && tr < rows.length) ? rows[cur.row = tr].childNodes[cur.col = (shift > 0) ? 0 : len - 1] : null;
				}
			// enter key: next TR
			} else {
				td = (tr < rows.length) ? rows[cur.row = tr].childNodes[cur.col = i] : null;
			}
			cur.td = td ? $(td) : null;
			return td ? cur : null;
		},
		// find next editor in row
		_nextEditor: function (key, shift) {
			var e, col, ok = null, edits = this._editors;
			for (col in edits) {
				if (edits.hasOwnProperty(col)) {
					if (shift && key === col) {
						return ok;
					}
					if (col) {
						e = edits[col];
						if (e && e[0] && e[0].offsetWidth > 0) {
							if (key === null) {
								return e;
							}
							ok = e;
						}
					}
					if (key === col) {
						key = null;
					}
				}
			}
		},
		// start edit mode for next cell/row
		// shift: 0-next TR, 1-next TD in TR, -1-previous TD in TR
		_nextEdit: function (e, shift) {
			var cur, td = this._td();
			if (!td) {
				return;
			}
			cur = { tbl: td.parent().parent()[0], row: this._rowIndex, col: this._col(td) };
			while (this._nextTD(cur, shift, 1)) {
				if (this._startEdit(cur.td, e, 1)) {
					return;
				}
			}
			this._endEdit(e, 1);
		},
		_createEditor: function (td, key) {
			var editor, v, oValid, dt, format, gridCol = this._gridCol(key), o = this.options, css = this.css, me = this, oGrid = this.grid.options, xy = this._xy, oEdit = {}, col = this._colSet(td, key);
			if (col) {
				if (col.readOnly) {
					return null;
				}
				v = col.editorOptions;
				if (v) {
					oEdit = v;
				}
				oValid = oEdit.validatorOptions;
				v = col.required;
				if (v) {
					oEdit.required = true;
				}
				if (!oValid && (col.validation || v)) {
					oValid = {};
				}
				v = col.editorType;
				if (v) {
					oEdit.type = v;
				}
			}
			format = gridCol ? gridCol.format : null;
			if (!(v = oEdit.type)) {
				dt = gridCol ? gridCol.dataType : null;
				if (dt === 'bool') {
					oEdit.textMode = 'checkbox';
				} else if (format === 'currency' || format === 'percent' || format === 'date') {
					v = format;
				} else if (dt === 'number') {
					v = 'numeric';
				} else if (dt === 'date') {
					v = 'date';
				} else if (!dt) {
					v = this._val(td);
					v = (typeof v === 'number') ? 'numeric' : ((v && v.getTime) ? 'date' : null);
				}
				oEdit.type = v;
			}
			if (format === 'int') {
				oEdit.maxDecimals = 0;
			} else if (format === 'double' && !oEdit.maxDecimals) {
				oEdit.maxDecimals = 100;
			} else if (format && v && v.toString().indexOf('date') === 0 && !oEdit.dateInputFormat) {
				oEdit.dateInputFormat = format;
			}
			if (v === 'datepicker' && !oEdit.button) {
				oEdit.button = 'dropdown';
			}
			if (o.validation && !oValid) {
				oValid = {};
			}
			if (oValid) {
				oValid.bodyAsParent = false;
				oEdit.validatorOptions = oValid;
				oValid.errorHidden = function () {
					// remove current-error flag
					me._error = null;
				};
				oValid.errorShowing = function () {
					// do not show error message if another editor has it
					if (!_aNull(me._error) && me._error !== key) {
						return false;
					}
					if (me._hideError && me._hideError > new Date().getTime()) {
						return false;
					}
				};
				oValid.errorShown = function () {
					// set current-error flag
					me._error = key;
					if (me._butDone) {
						me._butDone.addClass(css.buttonDisabled);
					}
					me._scrollTo(key);
				};
			}
			v = oGrid.theme;
			if (v && v !== 'default') {
				oEdit.theme = v;
				if (oValid) {
					oValid.theme = v;
				}
			}
			oEdit.tabIndex = this._ti;
			oEdit.textChanged = function (e) {
				e = me._butDone;
				if (e) {
					if (me.findInvalid()) {
						e.addClass(css.buttonDisabled);
					} else {
						e.removeClass(css.buttonDisabled);
					}
				}
				me._modified = 1;
			};
			// editor cancels esc, tab and enter keys, so, they can not be processed by grid
			oEdit.keydown = function (e, ui) {
				me._editorKey(e, key);
			};
			// measure attributes of editor class
			if (!xy) {
				v = $('<span />').addClass(css.editor).prependTo(td);
				// shift of editor relative to the left-top corner of cell
				this._xy = xy = {x: _int(v, 'marginLeft'), y: _int(v, 'marginTop')};
				// reduction of editor width/height
				xy.dx = xy.x + _int(v, 'marginRight');
				xy.dy = xy.y + _int(v, 'marginBottom');
				v.remove();
			}
			editor = $('<span />').igEditor(oEdit).addClass(css.editor).css({marginLeft: (xy.x - _int(td, 'paddingLeft')) + 'px', marginTop: (xy.y - _int(td, 'paddingTop')) + 'px'});
			return editor;
		},
		// process esc, enter tab keys of igEditor
		_editorKey: function (e, colKey) {
			var but, old, val, next, cur, esc, key = e.keyCode, o = this.options;
			esc = key === 27;
			if (key !== 9 && key !== 13 && !esc) {
				return;
			}
			if (!(cur = this._editors[colKey])) {
				return;
			}
			if (esc) {
				old = cur._oldCellVal;
				val = cur.igEditor('value');
				if (!this._equals(old, val)) {
					cur.igEditor('value', old);
					return;
				}
				return this._endEdit(e, null, 200);
			}
			// enter key or cell-edit mode
			if (key === 13 || (!this._adding && o.editMode === 'cell')) {
				return this._nextEdit(e, (key === 9) ? (e.shiftKey ? -1 : 1) : 0);
			}
			// tab key + row-editing
			next = this._nextEditor(colKey, e.shiftKey);
			if (!cur.igEditor('validate')) {
				_stop(e);
				return;
			}
			_stop(e);
			if (next) {
				// scroll to and edit next cell in row
				this._scrollTo(next.parent(), next);
				return;
			}
			but = this._butDone;
			// if no Done/Cancel buttons, then start edit cell in another row
			if (!but || but[0].offsetWidth === 0) {
				return this._nextEdit(e, 0);
			}
			// if Done button is disabled, then set focus to Cancel button
			if (but.hasClass(this.css.buttonDisabled)) {
				but = this._butCancel;
			}
			but[0].focus();
			// used by shift+tab keys
			this._lastEditor = cur;
		},
		_evtArg: function (td, editor, val, update) {
			var arg = { rowAdding: !!this._adding, column: this._col(td), row: this._row_, key: this._key(td), editor: editor };
			if (val !== undefined) {
				arg.value = val;
				if (!_aNull(update)) {
					arg.update = !!update;
				}
			}
			return arg;
		},
		// return 1: success or keep editing
		// td: jquery TD, e: event, foc: setFocus, add:addNewRow, height:height of row
		// e: browser event, null, or 1-flag from startEdit
		_startEdit: function (td, e, foc, add, height) {
			var i, tds, width, arg, editor, but = null, v = false, o = this.options;
			if (!td) {
				return;
			}
			if (e) {
				this._delHover();
				// ensure end-edit
				if (this._tds) {
					// after _endEdit grid can be modified, so, reference to td will be wrong
					// save props of td and restore it after _endEdit
					if (!add) {
						td = { tbl: td.parent().parent()[0], row: this._row(td), col: this._col(td) };
					}
					if (this._endEdit(e, 1)) {
						return 1;
					}
					if (!add) {
						// restore td after _endEdit
						if (!(td = (td.row < 0 || td.col < 0) ? null : td.tbl.childNodes[td.row].childNodes[td.col])) {
							return;
						}
						td = $(td);
					}
				}
				if (!add && !this._checkRow(td.parent())) {
					return;
				}
				this._row_ = add ? -1 : this._prime(td);
				this._rowIndex = add ? -1 : this._row(td);
				if (!height) {
					height = td[0].offsetHeight;
				}
				if (add || o.editMode === 'row') {
					// editRowStarting: 0,
					if (!this._fire(0, e, arg = { rowAdding: !!add, row: this._row_ })) {
						this._row_ = null;
						this._rowIndex = -3;
						return;
					}
					if (add) {
						this._adding = add;
						this._addTR.hide();
						this._newTR.show();
					}
					tds = td.parent().children();
					this._evt = e;
					for (i = 0; i < tds.length; i++) {
						td = $(tds[i]);
						td.addClass(this.css.editingCell);
						if (!but && tds[i].offsetWidth > 0) {
							but = td;
						}
						if (this._startEdit(td, null, foc, add, height)) {
							v = 1;
							foc = null;
						}
					}
					delete this._evt;
					if (v && but && o.showDoneCancelButtons) {
						this._doButtons(but);
					}
					if (v) {
						_stop(e);
						// editRowStarted: 1,
						this._fire(1, e, arg);
					} else {
						for (i = 0; i < tds.length; i++) {
							$(tds[i]).removeClass(this.css.editingCell);
						}
					}
					// change active row
					this._sel(e, but);
					// disable selection
					this._sel(1);
					return v;
				}
			}
			if (_aNull(this._row_) || !(editor = this.editorForCell(td, 1))) {
				return;
			}
			width = td.outerWidth();
			if (!height) {
				height = td[0].offsetHeight;
			}
			// editCellStarting: 4,
			if (!width || !height || !this._fire(4, e ? e : this._evt, arg = this._evtArg(td, editor, this._val(td)))) {
				return;
			}
			// adjust width/height for shift of editor relative to the left-top corner of cell
			width -= this._xy.dx + 2;
			height -= this._xy.dy + 2;
			if (e) {
				_stop(e);
				td.addClass(this.css.editingCell);
			}
			editor.igEditor({ width: Math.max(8, width), height: Math.max(10, height) }).prependTo(td);
			if (!this._tds) {
				this._tds = {};
			}
			this._tds[this._key(td)] = td;
			v = editor.igEditor('validator');
			if (v && v._setOption) {
				v._setOption('bodyAsParent', !!this._adding);
			}
			editor.igEditor('value', arg.value);
			editor._oldCellVal = editor.igEditor('value');
			// editCellStarted: 5,
			this._fire(5, e ? e : this._evt, arg);
			if (foc) {
				// scroll to and edit cell, delay of 100 ms can be not enough: request double setFocus in 300ms
				this._scrollTo(td, editor, false, 300);
			}
			if (e) {
				// change active row
				this._sel(e, td);
				// disable selection
				this._sel(1);
			}
			return 1;
		},
		// return 1: keep editing
		// e: browser event, null, or 1-flag from endEdit
		// update: request to update grid
		// foc: request to set focus to grid with delay in ms
		_endEdit: function (e, update, foc) {
			var i, editor, val, key, td, arg, add = this._adding, tr = null, argR = null, vals = null, tds = this._tds, o = this.options;
			if (!tds) {
				return;
			}
			_stop(e);
			// flag for row-editing and request to remove editingCell css
			i = add || o.editMode === 'row';
			if (!this._modified) {
				update = false;
			}
			if (e && i) {
				// editRowEnding: 2,
				if (!this._fire(2, e, argR = { row: this._row_, keepEditing: false, update: !!update, rowAdding: !!add })) {
					argR.update = update = false;
				}
				if (argR.keepEditing) {
					return 1;
				}
				// check if there is already error message
				for (key in tds) {
					if (tds.hasOwnProperty(key) && !_aNull(td = tds[key])) {
						if (update && !_aNull(editor = this.editorForCell(td)) && editor.igEditor('hasInvalidMessage')) {
							// scroll to and set focus to editor
							this._scrollTo(td, editor, 1);
							return 1;
						}
					}
				}
				// trigger validation and check if values are valid
				for (key in tds) {
					if (tds.hasOwnProperty(key) && update && !_aNull(td = tds[key]) && !_aNull(editor = this.editorForCell(td))) {
						// true for 2nd param will prevent showing error message
						if (!editor.igEditor('validate', !o)) {
							if (o) {
								// scroll to and set focus to editor
								this._scrollTo(td, editor, 1);
							}
							// flag for failed validation
							o = null;
						}
					}
				}
				// row validation failed
				if (!o) {
					return 1;
				}
				// flag that instead of setCellValue, this "vals" container of changes should be filled
				vals = {};
			}
			// remove editingCell from all TDs in editing row
			if (i) {
				// all TDs row
				tr = this._td().parent().children();
				for (i = 0; i < tr.length; i++) {
					$(tr[i]).removeClass(this.css.editingCell);
				}
			}
			// tr-flag reference to TR if value of cell in row was modified
			tr = null;
			for (key in tds) {
				if (tds.hasOwnProperty(key) && !_aNull(td = tds[key]) && !_aNull(editor = this.editorForCell(td))) {
					// cell editing
					if (!vals) {
						if (update && !editor.igEditor('validate')) {
							// scroll to and set focus to editor
							this._scrollTo(td, editor, 1);
							return 1;
						}
						td.removeClass(this.css.editingCell);
					}
					// 1-hide buttons
					this._doButtons(1);
					val = editor.igEditor('value');
					editor.igEditor('remove');
					// editCellEnding: 6,
					if (!this._fire(6, e, arg = this._evtArg(td, editor, val, update))) {
						arg.value = editor._oldCellVal;
					}
					val = arg.value;
					// (tr!=null) flag that cell in row was modified
					if ((add && update) || !this._equals(val, editor._oldCellVal)) {
						if (this._val(td, arg, vals) !== undefined && !tr) {
							tr = td.parent()[0];
						}
					}
					delete tds[key];
					// editCellEnded: 7,
					this._fire(7, e, arg);
				}
			}
			this._modified = this._lastEditor = this._tds = this._error = null;
			if (add) {
				this._addTR.show();
				this._newTR.hide();
				this._adding = null;
				// rowAdding: 8,
				if (update && this._fire(8, e, vals)) {
					this.grid.addRow(vals, o.autoCommit);
					// refresh selection
					this._sel(2);
					// rowAdded: 9,
					this._fire(9, e, vals);
				}
			} else if (tr) {
				this.grid.updateRow(this._row_, vals, tr, o.autoCommit);
			}
			// editRowEnded: 3,
			this._fire(3, e, argR);
			// remove pointers to currently editing rowIndex and rowKey
			this._rowIndex = -3;
			this._row_ = null;
			// enable selection
			this._sel();
			this._focusGrid(foc);
		},
		_scrollDiv: function () {
			var div, me = this, tbl = this.grid.element;
			div = tbl ? tbl.parent() : null;
			if (div && !this._sEvts && div.is('div')) {
				this._scrollX = div.scrollLeft;
				div.bind(this._sEvts = {
					scroll: function (e) {
						me._onEvt(e, 9);
					}
				});
			}
			return div ? div : tbl;
		},
		// td: reference to TD or column key
		// editor: reference to igEditor (null if td is key)
		// checkError: false/null/undefined-skip validation/adjustments for error message
		// delay: undefined or extra milliseconds to repeat set focus
		_scrollTo: function (td, editor, checkError, delay) {
			var cur, rect, div, x, y, lbl, xy, shift, add = this._adding, errorWidth = 0, errorHeight = 0, foc = editor;
			// check if instead of td the column key is used and find td and editor
			if (!editor && typeof td === 'string') {
				if (!(td = this._tds ? this._tds[td] : null)) {
					return;
				}
				if (!(editor = this.editorForCell(td))) {
					return;
				}
				checkError = 1;
			}
			// request to set focus to editor
			if (foc) {
				editor.igEditor('setFocus', 100);
				// delay of 100 ms can be not enough: request to repeat setFocus
				if (delay) {
					editor.igEditor('setFocus', delay);
				}
			}
			if (editor && checkError) {
				// get reference to error label used by validator
				lbl = editor.igEditor('validator');
				lbl = lbl ? lbl._lbl : null;
				// if validator is external to td, then skip error label adjustments
				// validator._lbl._width0 contains offsetWidth of label before animation
				if (lbl && (add || td.has(lbl).length !== 0)) {
					errorWidth = lbl._width0;
					errorHeight = lbl._height0;
					cur = { tbl: td.parent().parent()[0], row: this._row(td), col: this._col(td) };
				}
			}
			div = this._scrollDiv();
			xy = td.offset();
			rect = div.offset();
			div = div[0];
			rect.w = div.clientWidth;
			rect.h = div.clientHeight;
			xy.w = td.outerWidth();
			xy.h = td.outerHeight();
			x = xy.left - rect.left;
			y = xy.top - rect.top;
			// adjust for width of validion error message
			if (errorWidth > xy.w) {
				// save original index of column
				delay = cur.col;
				shift = xy.w;
				xy.w = (errorWidth += 5);
				// _nextTD sets "cur.td" to the TD located on right side from current td
				while (shift < errorWidth && this._nextTD(cur, 1)) {
					shift += cur.td[0].offsetWidth;
				}
				// condition when right edge of error label is outside of table
				if ((shift -= errorWidth) < 0) {
					// do not allow left edge of error message outside of table
					if ((xy.x += shift) < 0 && !add) {
						shift -= xy.x;
						xy.x = 0;
					}
					// shift error message to right
					lbl.css('marginLeft', shift + 'px');
				}
			}
			// do not allow validion error message below table
			if (!add && errorHeight > 1 && cur.row > 1) {
				// restore original index of column
				cur.col = delay;
				shift = errorHeight += 3;
				// _nextTD sets "cur.td" to the TD located below current td
				while (shift > 0 && this._nextTD(cur, 0)) {
					shift -= cur.td[0].offsetHeight;
				}
				if (shift > 0) {
					// shift error message above cell
					lbl.css('marginTop', '-' + errorHeight + 'px');
					y -= errorHeight;
				}
			}
			if (div.nodeName !== 'DIV') {
				return;
			}
			if (x > 0) {
				if ((x += xy.w - rect.w) < 0) {
					x = 0;
				}
			}
			// check vertical visibility
			if (y > 0) {
				if ((y += errorHeight + xy.h - rect.h) < 0) {
					y = 0;
				}
			}
			// adjust scroll
			if (x !== 0) {
				div.scrollLeft += x;
			}
			if (!add && y !== 0) {
				div.scrollTop += y;
			}
		},
		// td: 1-hide buttons, 2-remove buttons, [object]-parent TD for buttons, null-adjust scroll
		_doButtons: function (td) {
			var xyTD, xyBut, htBut, htTD, txt, div, cont, scroll, down, add = this._adding, css = this.css, x = null, grid = this.grid.element, buts = this._buts, o = this.options;
			if (td === 1 || td === 2) {
				if (buts) {
					buts.hide();
					if (td === 2) {
						buts.remove();
						this._buts = null;
					}
				}
				if (td === 2 && this._delBut) {
					this._delHover();
					delete this._delBut;
				}
				return;
			}
			if (td) {
				cont = grid.parent();
				if (!buts) {
					buts = this._buts = $('<div />').css('position', 'absolute').addClass(css.buttonContainer).attr('unselectable', 'on').prependTo(cont);
					this._butDone = x = $('<span />').addClass('done_id').addClass(css.button).addClass(css.doneButton).attr('unselectable', 'on').attr('title', this._loc('doneTitle')).appendTo(buts).bind(this._evts);
					if (o.showDoneIcon) {
						$('<span />').css('display', 'inline-block').addClass(css.doneIcon).attr('unselectable', 'on').appendTo(x);
					}
					txt = this._loc('done');
					if (txt) {
						$('<span />').css('display', 'inline-block').attr('innerHTML', txt).attr('unselectable', 'on').appendTo(x);
					}
					this._butCancel = x = $('<span />').addClass(css.button).addClass(css.cancelButton).attr('unselectable', 'on').attr('title', this._loc('cancelTitle')).appendTo(buts).bind(this._evts);
					if (o.showCancelIcon) {
						$('<span />').css('display', 'inline-block').addClass(css.cancelIcon).attr('unselectable', 'on').appendTo(x);
					}
					txt = this._loc('cancel');
					if (txt) {
						$('<span />').css('display', 'inline-block').attr('innerHTML', txt).attr('unselectable', 'on').appendTo(x);
					}
					buts._height = buts[0].offsetHeight;
					buts.css('width', Math.max(buts[0].clientWidth, (buts._width = buts[0].offsetWidth) - 4));
				}
			}
			if (!buts) {
				return;
			}
			div = this._scrollDiv();
			// reset x/y location and adjust y location
			if (td) {
				buts.show();
				this._butDone.addClass(css.buttonDisabled);
				buts.css({marginLeft: (this._butsX = 0) + 'px', marginTop: '0px'});
				xyBut = buts.offset();
				htBut = buts[0].offsetHeight;
				xyTD = td.offset();
				htTD = td[0].offsetHeight;
				xyTD.top -= xyBut.top;
				scroll = div[0].scrollTop;
				// compare available space below and above row
				// if (down>0), then dropDown, else dropUp
				down = div[0].clientHeight + scroll - xyTD.top - htTD - 5 - htBut;
				if (down < 1 && down > xyTD.top - htBut - scroll - 5) {
					down = 1;
				}
				down = (down > 0 || add) ? (xyTD.top + htTD + 5) : (xyTD.top - htBut - 5);
				buts.css({marginTop: down + 'px'});
				// add-button and data are located in same TABLE
				this._butsY = (add && grid.has(this._addTR).length === 1) ? down : 0;
			}
			// adjust x location
			if ((x = div[0].clientWidth - (buts.offset().left + buts._width + 3 - div.offset().left)) !== 0) {
				buts.css('marginLeft', (this._butsX += x) + 'px');
			}
			if (add) {
				buts.css('marginTop', (this._butsY + div[0].scrollTop + 2) + 'px');
			}
		},
		_isEditor: function (e) {
			var end, el, editor, key, td, tds = this._tds, o = this.options;
			if (!tds) {
				return;
			}
			td = this._findCell(e);
			if (td && o.editMode === 'row' && (this._row(td) === this._rowIndex)) {
				return 1;
			}
			end = this.grid.element[0];
			for (key in tds) {
				if (tds.hasOwnProperty(key)) {
					td = tds[key];
					if (td) {
						editor = this.editorForCell(td);
						if (editor) {
							el = e;
							editor = editor[0];
							while (el && el !== end) {
								if (el === editor) {
									return 1;
								}
								el = el.parentNode;
							}
						}
					}
				}
			}
		},
		// return jquery TD for active cell to start edit
		_aCell: function () {
			var td, i = -1, sel = this._sel(0, 1);
			td = sel ? sel.activeCell() : null;
			if (td) {
				return td.element;
			}
			td = sel ? sel.activeRow() : null;
			if (td) {
				td = td.element[0].childNodes;
				while (++i < td.length) {
					if (td[i].offsetWidth > 0) {
						return $(td[i]);
					}
				}
			}
		},
		// flag (if no td): 0/null-enable selection, 1-disable selection, 2-refresh selection
		// flag (if td=object): browser event
		// td: null, 1-return gridSelection, [object]-reference to jquery-TD (request to change active row/cell in selection)
		_sel: function (flag, td) {
			var sel = this.grid.element.data('igGridSelection');
			if (sel) {
				if (td === 1) {
					return sel;
				}
				if (td) {
					if (!flag) {
						return;
					}
					if (sel.options.mode === 'row') {
						return sel._activateRow(sel._realActiveRow = { element: td.parent(), index: this._row(td) });
					}
					td = sel._cellFromElement(td[0], this._row(td), this._col(td));
					return sel._activateCell(td);
				}
				if (flag === 2) {
					sel._refresh();
				} else {
					sel._suspend = flag;
				}
			}
		},
		_doDelete: function (e, tr) {
			var i, sel, arg;
			// delete-key
			if (!tr) {
				sel = this._sel(0, 1);
				arg = sel ? sel.selectedRows() : null;
				for (i = 0; i < (arg ? arg.length : 0); i++) {
					this._doDelete(e, arg[i].element);
				}
			}
			// rowDeleting: 10,
			if (!tr || !this._fire(10, e, arg = { element: tr, row: this._prime($(tr.children()[0])) })) {
				return;
			}
			_stop(e);
			this._delHover();
			this.grid.deleteRow(arg.row, tr[0], this.options.autoCommit);
			if (e) {
				// refresh selection
				this._sel(2);
			}
			// rowDeleted: 11
			this._fire(11, e, arg);
			return 1;
		},
		_checkRow: function (tr) {
			return (tr && tr.index() < this.numberOfRows()) ? tr[0] : null;
		},
		_delHover: function (src) {
			var i, v, left, iBut, iTD, iDiv, iScroll, shift, xyBut, xyTD, xyTbl, div, tds, td, but = this._delBut, tr = this._delTR, css = this.css, o = this.options;
			if (but) {
				this._doHov(this._isSrc(but, src) ? but[0] : null, css.buttonHover);
			}
			src = src ? this._checkRow($(src).closest('tr')) : null;
			if (src === tr || (!tr && !src)) {
				return;
			}
			this._delTR = src;
			if (!but) {
				this._delBut = but = $('<span />').css('position', 'absolute').addClass(css.deleteButton).attr('unselectable', 'on').attr('title', this._loc('deleteRowTitle'));
				if (o.showDeleteIcon) {
					$('<span />').css('display', 'inline-block').addClass(css.deleteIcon).attr('unselectable', 'on').appendTo(but);
				}
				v = this._loc('deleteRow');
				if (v && o.showDeleteText) {
					$('<span />').css('display', 'inline-block').attr('innerHTML', v).attr('unselectable', 'on').appendTo(but);
				}
			}
			// remove delete-button from old hover-td
			if (tr) {
				td = but.parent()[0];
				if (td) {
					delete td._txt;
				}
				but.remove();
			}
			// insert delete-button into new hover-td
			if (!src) {
				return;
			}
			tds = src.childNodes;
			for (i = 0; i < tds.length; i++) {
				if (tds[i].offsetWidth > 0) {
					break;
				}
			}
			if (!(src = tds[i])) {
				return;
			}
			td = $(src);
			div = this._scrollDiv();
			src._txt = td.text();
			but.css({marginLeft: '0px', marginTop: '0px'}).prependTo(td);
			xyBut = but.offset();
			xyTD = td.offset();
			xyTbl = this.grid.element.offset();
			iBut = but[0].offsetHeight;
			iTD = src.offsetHeight;
			iDiv = div[0].clientHeight;
			iScroll = div[0].scrollTop;
			shift = xyTD.top - xyBut.top;
			xyTD.top -= xyTbl.top;
			i = iDiv + iScroll - xyTD.top - iTD - iBut;
			i = (i >= 0 || i > xyTD.top - iScroll - iBut || xyTD.top < iBut) ? iTD + shift - 1 : shift + 1 - iBut;
			iScroll = div[0].scrollLeft;
			iDiv = div[0].clientWidth;
			iBut = but[0].offsetWidth;
			left = iDiv + iScroll - iBut - _int(td, 'paddingLeft') - _int(td, 'borderLeftWidth') - 5;
			but.css({ marginTop: i + 'px', marginLeft: left + 'px' });
			// get around bugs in IE, if text-align is not left
			if ((shift = iBut + but.offset().left - xyTD.left - iScroll - iDiv + 5) > 0) {
				but.css('marginLeft', (left - shift) + 'px');
			}
		},
		_isSrc: function (e, src) {
			if (e && src && (e[0] === src || e.has(src).length > 0)) {
				return e;
			}
		},
		_doHov: function (e, css) {
			var hov = this._hov;
			if (hov && css && hov.e[0] === e) {
				return 1;
			}
			if (hov) {
				hov.e.removeClass(hov.css);
			}
			if (css) {
				this._hov = { e: e = $(e), css: css };
				return e.addClass(css);
			}
			delete this._hov;
		},
		_focusGrid: function (delay) {
			var me = this;
			if (delay) {
				setTimeout(function () {
					try {
						me._div()[0].focus();
					} catch (e) { }
				}, delay);
			}
		},
		// process events
		// type: 1-mousedown, 2-click, 3-dblclick, 4-keydown, 5-focus, 6-blur, 7-mousemove, 8-mouseleave, 9-scroll
		_onEvt: function (e, type) {
			var src, td, cancel, done, k, addTD, x, tbody, css = this.css, newTR = this._newTR, addTR = this._addTR, error = this._error, tbl = this.grid.element, o = this.options;
			if (!e || !tbl || !(src = e.target)) {
				return;
			}
			if (type < 4 && (e.shiftKey || e.ctrlKey)) {
				return;
			}
			// 8-mouseleave
			if (type === 8) {
				this._delHover();
				return this._doHov();
			}
			if (this._delBut && type < 3 && this._isSrc(this._delBut, src)) {
				if (type === 2 && this._doDelete(e, $(this._delTR))) {
					delete this._delTR;
				}
				return;
			}
			addTD = addTR ? addTR.children()[0] : null;
			k = e.keyCode;
			if (k === 46) {
				return o.enableDeleteRow ? this._doDelete(e) : null;
			}
			// 9-scroll
			if (type === 9) {
				this._delHover();
				x = src.scrollLeft;
				if (this._tds) {
					this._doButtons();
					if (this._adding && x !== this._scrollX) {
						// set timeout to suspend show-error
						this._hideError = new Date().getTime() + 700;
						if (error) {
							error = this._editors[error].igEditor('validator').hide();
						}
					}
				}
				if (addTR && x !== this._scrollX) {
					$(addTD).css('paddingLeft', (this._addLeft + x) + 'px');
				}
				this._scrollX = x;
				return;
			}
			if (this._isSrc(addTR, src)) {
				this._delHover();
				src = addTD;
				if (type === 5) {
					return $(src).addClass(css.addRowActive);
				}
				if (type === 6) {
					return $(src).removeClass(css.addRowActive);
				}
				if (type === 7) {
					return this._doHov(src, css.addRowHover);
				}
				if (k === 32 || k === 13) {
					// add-new-row
					return this.startAddRowEdit(e);
				}
			}
			// 27-esc keydown
			if (k === 27) {
				return this._endEdit(e, null, 50);
			}
			// check if it is event coming from Done/Cancel buttons or their container
			done = this._isSrc(this._butDone, src);
			cancel = this._isSrc(this._butCancel, src);
			td = this._isSrc(this._buts, src);
			if (td || done || cancel) {
				// check for Done/Cancel buttons
				if (done || cancel) {
					_stop(e);
					src = done ? done : cancel;
					// type: 1-mousedown, 2-click, 3-dblclick, 4-keydown, 5-focus, 6-blur, 7-mousemove, 8-mouseleave, 9-scroll
					if (type === 2) {
						if (src.hasClass(css.buttonDisabled)) {
							return;
						}
						this._endEdit(e, done, 1);
					} else if (type === 7 && !src.hasClass(css.buttonDisabled)) {
						this._doHov(src[0], css.buttonHover);
					} else if (type === 5) {
						src.addClass(css.buttonActive);
					} else if (type === 6) {
						src.removeClass(css.buttonActive);
					} else if (k === 13 || k === 32) {
						this._endEdit(e, done, 1);
					} else if (k === 9) {
						if (e.shiftKey) {
							td = (done || this._butDone.hasClass(css.buttonDisabled)) ? null : this._butDone;
						} else {
							if (!td) {
								return;
							}
							td = this._butCancel;
						}
						if (td) {
							td[0].focus();
							return;
						}
						src = this._lastEditor;
						td = src ? src.parent() : null;
						if (td) {
							this._scrollTo(td, src);
						}
					}
				}
				return;
			}
			tbody = tbl.find('tbody');
			// mousemove
			if (type === 7) {
				return this._delHover((this._tds || !o.enableDeleteRow || (!o.showDeleteText && !o.showDeleteIcon) || !this._isSrc(tbody, src)) ? null : src);
			}
			// newTR-flag to trigger addNewRow action
			// mouse events
			if (newTR && type < 4) {
				// mouse on add-row while editing
				if (this._isSrc(newTR, src)) {
					return;
				}
				// inside of AddNewRow label
				if (this._isSrc(addTR, src)) {
					// only click on AddNewRow can start edit mode
					if (type === 2) {
						this.startAddRowEdit(e);
					}
					return;
				}
			}
			// mousedown outside of grid-table
			if (type < 4 && !this._isSrc(tbody, src)) {
				// check for DIV
				if (this._tds && src !== tbl.parent()[0] && src !== this._div()[0]) {
					// header, footer, etc.
					this._endEdit(e);
				}
				return;
			}
			// 13-enter keydown
			if (k === 13) {
				this._nextEdit(e, 0);
				if (this._tds) {
					return;
				}
			}
			if (this._isEditor(src)) {
				return;
			}
			td = this._findCell(src);
			// stop editing
			// 1-mousedown, 2-click, 3-dblclick
			if (this._tds && type > 1 && type < 4) {
				if (this._endEdit(e, 1)) {
					return;
				}
			}
			// start editing
			// 1-mousedown, 2-click, 3-dblclick
			x = o.editMode === 'cell';
			src = o.startEditTriggers;
			if (src && !this._tds && (x || o.editMode === 'row')) {
				src = src.toLowerCase();
				if ((k === 113 && src.indexOf('f2') >= 0) || (k === 13 && src.indexOf('enter') >= 0)) {
					td = this._aCell();
				} else if (src.indexOf(e.type) < 0 || (type === 2 && src.indexOf('dbl') >= 0)) {
					td = null;
				}
				if (td && this._startEdit(td, e, x)) {
					return;
				}
			}
			// set focus to grid if no editing and no selection/activation
			if (!this._tds && type === 1 && !this._sel(0, 1)) {
				this._focusGrid(1);
			}
		},
		destroy: function () {
			/* Destroys igGridUpdating
				returnType="object" Returns reference to this igGridUpdating.
			*/
			var el, div, grid = this.grid;
			if (!this._evts || !(el = grid.element) || !(div = this._div())) {
				return this;
			}
			// 2-remove buttons
			this._doButtons(2);
			div.unbind(this._evts);
			if (this._sEvts) {
				el.parent().unbind(this._sEvts);
			}
			el.unbind(this._gEvts);
			this._endEdit();
			// remove addNewRow from header
			this._headerRendered(1);
			this._evts = this._sEvts = this._gEvts = null;
			$.Widget.prototype.destroy.call(this);
			return this;
		},
		// every grid feature widget should implement this 
		_injectGrid: function (grid) {
			var me = this, ti = grid.options.tabIndex;
			// initialize options.css
			this.grid = grid;
			// process iggridheaderrendered and headerRendered events of grid
			this._gEvts = {
				iggriduidirty: function () { me._delHover(); me._endEdit(); }
			};
			if (this.options.enableAddRow) {
				this._gEvts.iggridheaderrendered = function () { me._headerRendered(); };
			}
			grid.element.bind(this._gEvts);
			this._ti = ti ? ti : 1;
			this._evts = {
				mousedown: function (e) { me._onEvt(e, 1); },
				click: function (e) { me._onEvt(e, 2); },
				dblclick: function (e) { me._onEvt(e, 3); },
				keydown: function (e) { me._onEvt(e, 4); },
				focus: function (e) { me._onEvt(e, 5); },
				blur: function (e) { me._onEvt(e, 6); },
				mousemove: function (e) { me._onEvt(e, 7); },
				mouseleave: function (e) { me._onEvt(e, 8); }
			};
		}
	});
	$.extend($.ui.igGridUpdating, {version: '11.1.20111.1014'});
	// Note: no need in extend, because this._loc(prop) is used
	$.ui.igGridUpdating.locale = { defaults: {} };
	$.ui.igGridUpdating.setDefaultCulture = function (locale) {
		/* Set values for strings used for titles and text on buttons.
			paramType="string|object" optional="true" If the value of parameter is String, such as "bg", "fr", etc, then validator will attempt to find and use $.ui.igGridUpdating.locale[param] object.
			Value of object should contain pairs or key:value members.
		*/
		$.ui.igGridUpdating.locale.defaults = $.extend({}, (typeof locale === 'string') ? $.ui.igGridUpdating.locale[locale] : locale);
	};
}(jQuery));

/* English */
jQuery(function ($) {
	$.ui.igGridUpdating.locale['en'] = {
		done: 'Done',
		doneTitle: 'Stop editing and update',
		cancel: 'Cancel',
		cancelTitle: 'Stop editing and do not update',
		addRow: 'Add new row',
		addRowTitle: 'Click to start adding new row',
		deleteRow: 'Delete',
		deleteRowTitle: 'Delete row'
	};
	$.ui.igGridUpdating.setDefaultCulture('en');
});

