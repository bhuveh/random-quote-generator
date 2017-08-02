var main = function() {
  $('#theButton').click(function() {
    ajaxTitle('breaking bad'); 
    //console.log('--- Get New Quote ---');
  });
};

/*Print and error functions.*/
var printF = function (data) {
  $('.quote').html(data);
};
var errF = function() {
  printF('Error retreiving quote. Give me another chance!');
};

//Gets exact title from rough title using Wiki's opensearch, and passes it on to ajax call for page ID.
var ajaxTitle = function (roughTitle) {
  var url = 'https://en.wikiquote.org/w/api.php';
  var props = {
    dataType: "jsonp",
    data: {
      format: 'json',
      action: 'opensearch',
      search: roughTitle
    }
  };
  var ajaxCall = $.ajax(url, props);
  ajaxCall.done(function(data) {
    //console.log('--- Got ID ---');
    //console.log(String(data[1]));
    ajaxPageId(String(data[1]));
  });
  ajaxCall.fail(errF);
};

//Gets page ID from the given exact title, and passes on to processing.
var ajaxPageId = function (title) {
  var url = 'https://en.wikiquote.org/w/api.php';
  var props = {
    dataType: "jsonp",
    data: {
      format: 'json',
      action: 'query',
      redirects: '',
      titles: title
    }
  };
  var ajaxCall = $.ajax(url, props);
  ajaxCall.done(getPageId);
  ajaxCall.fail(errF);
};

//Processes page ID to make sure it isn't a missing page, and passes it on to ajax call for sections.
var getPageId = function (data) {
  var pages = data.query.pages;
  var pageId = -1;
  for(var p in pages) {
    var page = pages[p];
    if(!("missing" in page)) {
      pageId = page.pageid;
      break;
    };
  };
  if(pageId > 0) {
    //console.log('--- Got Sections ---');
    ajaxSections(String(pageId));
  } else {
    errF();
  };
};

//Gets all sections in a page using page ID, and passes them on to processing. 
var ajaxSections = function (pageId) {
  var url = 'https://en.wikiquote.org/w/api.php';
  var props = {
    dataType: "jsonp",
    data: {
      format: "json",
      action: "parse",
      prop: "sections",
      pageid: pageId
    }
  };
  var ajaxCall = $.ajax(url, props);
  ajaxCall.done(getSections);
  ajaxCall.fail(errF);
};

//Filters all sections to create an array of episodes only, selects a random episode and passes it on to ajax call for quotes.
var getSections = function (data) {
  //code specific to breaking bad page
  var pageId = String(data.parse.pageid);
  var sections = data.parse.sections;
  var sectionArr = [];
  for (index in sections) {
    if(sections[index]['number'].includes('.')) {
      var a = {
        secIndex: String(sections[index]['index']),
        secName: String(sections[index]['line'])
      };
      sectionArr.push(a);
    };
  };
  var sectionArrInd = Math.floor(sectionArr.length*Math.random());
  //console.log('--- Got Single Section ---');
  ajaxQuotes(pageId, sectionArr[sectionArrInd]['secIndex']);
};

//Gets all quotes in a given section/episode, and passes them on for processing.
var ajaxQuotes = function (pageId, secIndex) {
  var url = 'https://en.wikiquote.org/w/api.php';
  var props = {
    dataType: "jsonp",
    data: {
      format: "json",
      action: "parse",
      noimages: "",
      pageid: pageId,
      section: secIndex
    }
  };
  var ajaxCall = $.ajax(url, props);
  ajaxCall.done(getQuotes);
  ajaxCall.fail(errF);
};

//Makes an array of all quotes in the given episode, and chooses and displays a random one.
var getQuotes = function (data) {
  var allT = data.parse.text['*'];
  //console.log('--- Got Quotes ---');
  var allD = $($.parseHTML(allT));
  //console.log(allD);
  var allQ = allD.children('dl');
  var quoteArr = [];
  $.each(allQ, function(i, v) {
    if($(this).html().length < 1000) {
      quoteArr.push($(this).html());
    }
  });
  //All quotes added as HTML blocks in the array.
  var quoteArrInd = Math.floor(quoteArr.length*Math.random());
  //console.log('--- Got Single Quote ---');
  //console.log(quoteArr[quoteArrInd]);
  printF(quoteArr[quoteArrInd]);
};

$(document).ready(main);