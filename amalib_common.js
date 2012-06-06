
/**
 * asin_list is hash array = [ {}, {}, ... ]
 */
function get_ls_asin_list() {
    if(localStorage["asin_list"] == undefined) {
        return [];
    } else {
        return JSON.parse(localStorage["asin_list"]);
    }
}

function set_ls_asin_list(list) {
    localStorage["asin_list"] = JSON.stringify(list);
}

function search_asin(a, asin) {
    for(var i = 0 ; i < a.length ; i++) {
        if(a[i].asin == asin) { 
            return i;
        }
    }
    return -1;
}

