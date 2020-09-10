$(document).ready(function () {

    /**
     * Woordenboek links
     */
    $("body").on("click",".woordenboek-link",function (e) {

        e.preventDefault();
        var theId = $(this).attr("data-id");
        var uitleg = woordenboek[theId].Uitleg.replace(/\r\n/g, '<br />').replace(/[\r\n]/g, '<br />');


        $(".woordenboek-data").html('<h2>'+woordenboek[theId].Title+'</h2>'+uitleg);
        $(".woordenboek-data").append('<h3><b>Zie ook:</b></h3><ul id="zieOok"></ul>');
        // Add the extra'

        console.log(woordenboek[theId].Zie_x0020_ookId.results);

        woordenboek[theId].Zie_x0020_ookId.results.forEach(function(item,index){
            $("#zieOok").append('<a class="woordenboek-link" data-id="'+item+'"><li>'+woordenboek[item].Title+'</li></a>');
        });

        $(".woordenboek-link").removeClass("is-active");
        $(this).addClass("is-active");
    });
});


if (typeof (XeApp) == "undefined") { XeApp = {}; }

XeApp.Woordenboek = {
    /**
     * Load the woordenboek items
     */
    load: function()
    {

        // Already loaded
        if (woordenboekLoaded === true) {
            return;
        }


        sprLib.list("Registratiewoordenboek").items({queryOrderby: 'Title asc'}).then(function (arrData) {

            // Woordenboek is loaded
            woordenboekLoaded = true;

            // Load the woordenboek data
            woordenboek = {}


            // Add woordenboek items
            $("#woordenboek").append('<aside class="menu"></aside>').addClass("columns");
            var aside = $("aside.menu");
            aside.after('<div class="woordenboek-data column"></div>');
            aside.append('<input type="text" id="searchWoordenboek"><ul id="woordenboekLijst" class="menu-list column"></ul>').addClass("is-one-third");

            arrData.forEach(function (arrayItem, index) {
                $("ul.menu-list").append('<li><a class="woordenboek-link"  data-id="' + arrayItem.Id + '">' + arrayItem.Title + '</a></li>');

                // Add to woordenboek
                woordenboek[arrayItem.Id] = arrayItem;

                // Show first
                if (index === 0) {
                    $('woordenboek-link[data-id="0"]').trigger("click");
                }
            });

            $("body").on("keyup", "#searchWoordenboek", function () {
                tableFiltering("searchWoordenboek", "woordenboekLijst");
            });

        });
    }

}