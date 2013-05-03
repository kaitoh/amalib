
function show_asin_log() {
    var d = document.getElementById("asin_log_div");
    var asin_list = get_ls_asin_list();

    d.innerHTML = "";
    for(var i = 0 ; i < asin_list.length ; i++) {
        if( asin_list[i].log != undefined ) {
            d.innerHTML += "<input type=checkbox name=cb value="+ asin_list[i].asin + ">"
            d.innerHTML += "<img src=" + asin_list[i].log.icon + " width=20px height=20px >";
            d.innerHTML += "<a href=" + asin_list[i].url + ">" + asin_list[i].title + "</a>";
            d.innerHTML += " :   " + asin_list[i].log.tooltip;
            // d.innerHTML += " :[" + asin_list[i].log.date+"]";
            d.innerHTML += "<br>";
        }
    }
}

function force_clear_log() {
    delete localStorage.asin_list;
}

function delete_asin_list() {
    var asin_list = get_ls_asin_list();
    var cb = document.getElementsByName("cb");

    for(var i = 0 ; i < cb.length ; i++) {
        if( cb[i].checked != false ) {
            var pos = search_asin(asin_list, cb[i].value);
            if( pos != -1 ) {
                asin_list.splice(pos, 1);
            }
        }
    }
    set_ls_asin_list(asin_list);
    show_asin_log();
}

function onload() {
    document.getElementById("delete").onclick = delete_asin_list;
    document.getElementById("delete_all").onclick = force_clear_log;
    show_asin_log();
}

window.addEventListener("load", onload);
