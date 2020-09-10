'use strict';

ExecuteOrDelayUntilScriptLoaded(initializePage, "sp.js");


var lastMomentId = 0;
var alreadyLoadingOnScroll = false;
var currentUser = {};
var woordenboekLoaded = false;
var editId = 0;
var editMoment = {};
var woordenboek = {};
var noChangeAmounts = false;
var cdnUrl = "https://www.xeweb.be/cdn/samenlevingsopbouw/";
var today = moment().format("YYYY-MM-DD");


function initializePage() {

    // This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
    $(document).ready(function () {

        let scriptsToLoad = ["js/lib.js","js/navigation.js","js/activiteiten.js","js/woordenboek.js"];

        // Load all the scripts, and go on :)
        loadScripts(scriptsToLoad).then(function () {

            // Load the menu
            // addMenu();
            $("#topMenu").detach().prependTo("#DeltaPlaceHolderMain");
            // $("#topMenu").load( "https://xeweb.be/cdn/samenlevingsopbouw/navigatie.html" );
            $("#s4-ribbonrow,#suiteBarDelta").remove();
            // getListInfo();

        });



    });

    // Mobile menu
    $(document).ready(function() {

        // Check for click events on the navbar burger icon
        $(".navbar-burger").click(function() {

            // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
            $(".navbar-burger").toggleClass("is-active");
            $(".navbar-menu").toggleClass("is-active");

        });
    });

}



/**
 * Filter the table based on given id
 * */
function tableFiltering(inputId,tableId) {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById(inputId); // searchJongeren
    filter = input.value.toUpperCase();
    table = document.getElementById(tableId); // dagregistratieTable
    tr = table.getElementsByTagName("li");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("a")[0];

        if (td) {
            txtValue = td.textContent || td.innerText;
            // console.log(td);

            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function loadScripts(urls = []){

    let counter = 0;


    return new Promise(function(reslove,reject){

        urls.forEach(function(url,index){
            // Host
            var host = "https://www.xeweb.be/cdn/samenlevingsopbouw/";

            // load the script
            var script = document.createElement("script")
            script.type = "text/javascript";

            if (script.readyState){  //IE
                script.onreadystatechange = function(){
                    if (script.readyState == "loaded" ||
                        script.readyState == "complete"){
                        script.onreadystatechange = null;
                        // Script loaded
                        counter++;
                    }
                };
            } else {  //Others
                script.onload = function(){
                    counter++;
                };
            }

            if(url.indexOf("https:") !== -1){
                host = "";
            }else{

            }

            script.src = host + url;
            document.getElementsByTagName("head")[0].appendChild(script);

            // Resolve when everything is loaded
            if(urls.length === counter){
                reslove();
            }

        });

    });





}