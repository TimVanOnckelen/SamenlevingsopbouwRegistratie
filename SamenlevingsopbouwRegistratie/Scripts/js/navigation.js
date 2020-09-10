$(document).ready(function () {

    // Append add page
    $("#woordenboek, #app-container-main").addClass("appPage");

    $("body").on("click",".navbar-item",function(e){

        e.preventDefault();

        let link = $(this).attr("href");

        // Hide all pages :)
        $(".appPage").hide();
        // Show requested page
        $(link).show();


        switch (link) {
            case "#app-container-main":
                // Nothing to do, already loaded :)
                break;

            case "#woordenboek":
                // Load the woordenboek
                XeApp.Woordenboek.load();
                break;

            case "#partners-page":
                  XeApp.Partners.load();
                break;

            case "#vrijwilligers-page":
                XeApp.Vrijwilligers.load();
                break;
        }
    });

});