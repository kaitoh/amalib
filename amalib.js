/*
 * amalib.js
 */

var current_library = {};
var tab_id = null;
var asin = 0;

/* timer handler*/
var asin_list_count = 0;
var timer_interval = 120 * 60 * 1000;
setInterval( timer_handler, timer_interval );

function timer_handler() {
    var asin_list = get_ls_asin_list();
    var current_library = libraries[localStorage.default_library];
    if(current_library == undefined) {
        current_library = libraries.saitama;
    }

    if( 0 < asin_list.length ) {
        if( asin_list.length - 1 < asin_list_count) { asin_list_count = 0; }

        var res = get_book_status(current_library, asin_list[asin_list_count].asin);
        asin_list[asin_list_count].log = res;
        set_ls_asin_list(asin_list);

        asin_list_count++;
    }
};

/* Table of result icon */
icon = { ok : "Circle_Green.png",        // The book is exist and you can borrow it.
         not_left : "Circle_Yellow.png", // Thee book is exist in the Library, but not left.
         not_exist : "Circle_Grey.png"   // The book is no exist in the Library.
    };

/* Structure of Libraries */
libraries = { saitama:{
                url: "https://www2.lib.city.saitama.jp/licsxp-opac/WOpacMnuTopInitAction.do?WebLinkFlag=1&moveToGamenId=tifschcmpd",
                action: "https://www2.lib.city.saitama.jp/licsxp-opac/WOpacTifSchCmpdExecAction.do?tifschcmpd=1",
                create_form: create_form_data_saitama,
                parse_func: get_stock_info_saitama
              },
              shinagawa:{
                url: "http://lib.city.shinagawa.tokyo.jp/cgi-bin/Sopcsmin.sh",
                action: "http://lib.city.shinagawa.tokyo.jp/cgi-bin/Sopcsken.sh?",
                create_form: create_form_data_shinagawa,
                parse_func: get_stock_info_shinagawa
              }
            };


function create_form_data_saitama(isbn) {
    return "hash=&returnid=&gamenid=tiles.WTifSchCmpd&chkflg=check&loccodschkflg=nocheck&langcodschkflg=nocheck&mngshus=1&mngshus=2&mngshus=3&mngshus=4&mngshus=5&mngshus=6&mngshus=7&mngshus=8&condition1=0&condition1Text=&range1=0&mixing1=0&condition2=1&condition2Text=&range2=0&mixing2=0&condition4=2&condition4Text=&range4=0&mixing4=0&condition5=3&condition5Text=&range5=0&mixing5=0&condition3=6&condition3Text=" + isbn + "&jyanruLabel=&yearselect=0&yearstart=&monthstart=&yearend=&monthend=&dispmaxnum=10&disporder=0";
}

function create_form_data_shinagawa(isbn) {
    return "p_mode=1&g_mode=0&ryno=&c_key=&c_date=&list_cnt=10&mad_list_cnt=10&brws=ncdet&ktyp9=shk|atk|spk|kek&itfg9=c&ser_type=0&stkb=&sgid=spno&srsl1=1&srsl2=2&srsl3=3&ktyp0=shk&key0=&itfg0=c&ron0=a&ktyp1=atk&key1=&itfg1=c&ron1=a&ktyp2=spk&key2=&itfg2=c&ron2=a&ktyp3=ser&key3=&itfg3=c&ron3=a&ktyp4=shk|ser|atk|spk|kek|kjk&key4=&itfg4=c&tgid=tyo:010A&tkey=" + isbn + "&kkey=&skey=&srkbs=";
}


/**
 * stock_info = { icon: icon_path, tooltip: tooltip_string }
 */
function get_stock_info_saitama(body) {
    var tooltip_title = "Not Found";
    var icon_path = icon.not_exist;

    var infos = body.getElementsByClassName("info");
    if( infos.length == 2 ) {
        tbl = infos[1];
        left_book_num = tbl.rows[0].children[3].innerHTML;

        tbl_elements = tbl.rows[0].children;
        tooltip_title = "";
        for(i = 0 ; i < tbl_elements.length ; i += 2) {
            tooltip_title += tbl_elements[i].innerHTML + ":" + tbl_elements[i+1].innerHTML + " ";
        }

        if( parseInt(left_book_num) > 0 ) {
            icon_path = icon.ok;
        } else {
            icon_path = icon.not_left;
        }
    }
    return {icon:icon_path, tooltip:tooltip_title};
}

function get_stock_info_shinagawa(body) {
    var tooltip_title = "Not Found";
    var icon_path = icon.not_exist;

    var infos = body.getElementsByClassName("fontDef");
    if( infos.length == 3 ) {
        tooltip_title = "Found";
        stock = infos[2].children[5].innerHTML;
        if(stock.search("~") > 0) {
            icon_path = icon.ok;
        } else {
            icon_path = icon.not_left;
        }
    }
    return {icon:icon_path, tooltip:tooltip_title};
}

/**
 * update icon 
 */
function update_icon_tooltip(res) {
  var icon_detail = {path:res.icon,tabId:tab_id};
  var tooltip_detail = {title:res.tooltip, tabId:tab_id};

  chrome.pageAction.setIcon(icon_detail);
  chrome.pageAction.setTitle(tooltip_detail);
};

function parse_libsearch(library, xhr) {
    if(xhr.status == 200) {
        document.body.innerHTML = "";
        document.body.insertAdjacentHTML("beforeEnd", xhr.responseText);  // This is to parse "xhr.responseText"

        var res = library.parse_func(document.body);
        res.date = Date();
        return res;
    } else {
        return undefined;
    }
};

function search_in_lib(library, isbn) {
  if(library == undefined) { return; }

  var form_data = library.create_form(isbn);

  var dummy_xhr = new XMLHttpRequest();
  dummy_xhr.open("GET", library.url, false);
  dummy_xhr.send(null); 

  var xhr = new XMLHttpRequest();
  xhr.open("POST", library.action, true);
  xhr.onload = xhr_onload;
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(form_data); 

  /* on end of XHR */
  function xhr_onload() {
      var res = parse_libsearch(library, xhr);
      update_icon_tooltip(res);
      update_asin_list(isbn, res);
  }
};

function get_book_status(library, isbn) {
  if(library == undefined) { return; }

  var form_data = library.create_form(isbn);

  /* dummy access for error */
  var dummy_xhr = new XMLHttpRequest();
  dummy_xhr.open("GET", library.url, false);
  dummy_xhr.send(null); 

  var xhr = new XMLHttpRequest();
  xhr.open("POST", library.action, false);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(form_data); 

  return parse_libsearch(library, xhr);
};

function update_asin_list(isbn, res) {
    var list = get_ls_asin_list();
    var i = search_asin(list, isbn);
    if( i != -1 ) {
        list[i].log = res;
        set_ls_asin_list(list);
    } else {
        console.debug("update error");
    }
}

/**
 * asin_list = { asin: asin, title: title }
 */
function add_asin_list(asin, request) {
    var asin_list = get_ls_asin_list();

    if( search_asin(asin_list, asin) == -1 ) {
        asin_list.push({asin: asin, title: request.title, url: request.location.href} );
    }
    set_ls_asin_list( asin_list );
}

/************** Event *******************/
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        chrome.tabs.getSelected(null, function(tab) { tab_id = tab.id; chrome.pageAction.show(tab_id); });
        asin = request.asin;
        if( asin != undefined) {
            add_asin_list(asin, request);

            current_library = libraries[localStorage.default_library];
            if(current_library == undefined) {
                current_library = libraries.saitama;
            }

            search_in_lib(current_library, asin);
        }
        sendResponse({}); //return empty response
    }
);

chrome.pageAction.onClicked.addListener(
    function(tab){ 
        if( current_library != undefined) {
            chrome.tabs.create({url:current_library.action+"@post:"+current_library.create_form(asin)}, function(tab){});
        }
    }
);

chrome.omnibox.onInputEntered.addListener(
    function(text) {
        if(text == "history") {
            chrome.tabs.create({url: "history.html"});
        }
    }
);
