/*
* Array of data
* Format: "FieldName On App" => "FieldName In Sharepoint List"
*/
const ArrayOfData = {
    "project": { "listName" : "projectId","required" : true,"resultsArray" : false},
    "activiteit": { "listName": "activiteitId", "required": true,"resultsArray" : false },
    "locatie": { "listName": "locatieId", "required": true,"resultsArray" : false },
    "datum": { "listName": "datum", "required": true,"resultsArray" : false },
    "soortActiviteit": { "listName": "soortActiviteit", "required": true,"resultsArray" : false },
    "aandachtVoor": { "listName": "aandachtsGebied", "required": false,"resultsArray" : true },
    "titel": { "listName": "Title", "required": true,"resultsArray" : false },
    "vrijwilligers": { "listName": "vrijwilligersId", "required": false,"resultsArray" : true },
    "aantalVrijwilligers": { "listName": "aantalVrijwilligers", "required": true,"resultsArray" : false },
    "aantalInitatiefnemers": { "listName": "aantalInitiatiefnemers", "required": true,"resultsArray" : false },
    "deelnemers": { "listName": "deelnemersId", "required": false,"resultsArray" : true },
    "aantalDeelnemers": { "listName": "aantalDeelnemers", "required": false,"resultsArray" : false },
    "aantalOplossingact": { "listName": "aantalOplossingsact", "required": true,"resultsArray" : false },
    "partners": { "listName": "partnersOrgsId", "required": false,"resultsArray" : true },
    "aantalPartners": { "listName": "aantalPartners", "required": true,"resultsArray" : false },
    "aanwezigeDoelgroep": {"listName": "AanwezigeDoelgroep", "required": false, "resultsArray": false}
};


// This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
$(document).ready(function () {

    // Get current user Data
    getUserInfo();

    // Append extra fields
    appendExtraFields();

    // Load the menu
    // addMenu();
    $("#topMenu").detach().prependTo("#DeltaPlaceHolderMain");
    // $("#topMenu").load( "https://xeweb.be/cdn/samenlevingsopbouw/navigatie.html" );
    $("#s4-ribbonrow,#suiteBarDelta").remove();
    // getListInfo();

    $("#momenten-overview").scroll(function () {
        let div = $(this).get(0);
        if (div.scrollTop + div.clientHeight >= div.scrollHeight) {

            if (alreadyLoadingOnScroll == false) {

                // Set already scrolling
                alreadyLoadingOnScroll = true;

                // Only do when there are more items
                if (lastMomentId != -1) {
                    // Load more moments
                    var filter = getFilter();
                    loadMoments(filter, false, lastMomentId);
                }
            }

        }
    });

    $("body").on("click","#triggerMobileReg",function(){


        $("#registratie-container").toggle();


        if ($("#registratie-container").is(":hidden")) {
            $(this).html("Nieuwe registratie toevoegen");
        }else{
            $(this).html("Sluiten");
        }

    });

    // Enable select 2
    $(".select2").select2({width: '100%',closeOnSelect: true}); //
    $(".select2[multiple]").select2({width: '100%',closeOnSelect: false}); //


    // Set date
    $('#datum').val(moment().format("YYYY-MM-DD"));

    sprLib.options({baseUrl: '/sites/sas'});

    sprLib.user().info()
        .then(function (objUser) {
            $("[data-content='user.name']").html(objUser.Title);
        });


    $("#project").on("change", function (e) {

        var value = $(this).val();


        if(value == 2){
            $("#momenten-aanwezige-doelgroep").show();

        }else{
            $("#momenten-aanwezige-doelgroep").hide();
        }

        sprLib.list("lijstActiviteiten").items({
            listCols: ["Title", "Id", "TitelLang"],
            queryFilter: "(Project eq '" + value + "')"
        }).then(function (arrData) {

            // Clean fields
            $("#activiteit").find('option')
                .remove()
                .end();




            /** Activiteiten */
            arrData.forEach(function (arrayItem) {

                var selected = false;

                // Set activiteit if set
                if(editId > 0 && editMoment.activiteitId == arrayItem.Id){
                    selected = true;
                }

                var newOption = new Option(arrayItem.TitelLang, arrayItem.Id, false, selected);
                $('#activiteit').append(newOption).trigger('change');

            });




        });

    });

    /** Change Vrijwilligers & deelnemers when location changes **/
    $("#project").on('change', function (e) {

        var locatie = $("#locatie").val();
        var project = $("#project").val();

        Promise.all([
            sprLib.list("lijstVrijwilligers").items({
                listCols: ["Title", "Id", "VolledigeNaam", "Locatie1Id", "statuut"],
                queryFilter: "(Locatie1Id eq '" + locatie + "') and (statuut eq 'vrijwilliger') and (Project1Id eq '" + project + "')",
                queryLimit: 5000
            }),
            sprLib.list("lijstVrijwilligers").items({
                listCols: ["Title", "Id", "VolledigeNaam", "Locatie1Id", "statuut"],
                queryFilter: "(Locatie1Id eq '" + locatie + "') and (statuut eq 'deelnemer') and (Project1Id eq '" + project + "')",
                queryLimit: 5000
            })
        ]).then(function (arrData) {

            // Clean fields
            $("#vrijwilligers").find('option')
                .remove()
                .end();

            $("#deelnemers").find('option')
                .remove()
                .end();


            /** Vrijwilligers */
            arrData[0].forEach(function (arrayItem) {

                var newOption = new Option(arrayItem.VolledigeNaam, arrayItem.Id, false, false);
                $('#vrijwilligers').append(newOption).trigger('change');

            });

            /** Deelnemers */
            arrData[1].forEach(function (arrayItem) {

                if(arrayItem.VolledigeNaam != null) {
                    var newOption = new Option(arrayItem.VolledigeNaam, arrayItem.Id, false, false);
                    $('#deelnemers').append(newOption).trigger('change');
                }

            });

            // add vrijwilligers & deelnemers on edit
            if (editId  > 0){
                $("#vrijwilligers").val(editMoment.vrijwilligersId.results).trigger("change");
                $("#deelnemers").val(editMoment.deelnemersId.results).trigger("change");
                $("#registratie-container").removeClass("loading");
            }

        });

    });

    var container = $("#registratie-container .title");

    $("#vrijwilligers").on("change", function () {

        var countVrijwilligers = $("#vrijwilligers option:selected").length;


        if(noChangeAmounts === false) {
            $("#aantalVrijwilligers").val(countVrijwilligers).addClass("highlight");
        }



    });

    $("#partners").on("change", function () {

        var countVrijwilligers = $("#partners option:selected").length;

        if(noChangeAmounts === false) {
            $("#aantalPartners").val(countVrijwilligers).addClass("highlight");
        }

    });

    $("#deelnemers").on("change", function () {

        var countDeelnemers = $("#deelnemers option:selected").length;
        if(noChangeAmounts === false) {
            $("#aantalDeelnemers").val(countDeelnemers).addClass("highlight");
        }

    });

    $("#activiteit").on("change", function () {

        if(!editId > 0) {
            var nameGenrated = $("#activiteit option:selected").text();
            $("#titel").val(nameGenrated);
        }

    });


    // Filter moments on location & projects
    $("#filter-locatie, #filter-project, #filter-activiteit,#date-from-filter,#date-to-filter").on("change", function () {

        var filter = getFilter();
        // Reset paging
        lastMomentId = 0;

        loadMoments(filter);

    });

    /**
     * Change activities on project change
     */
    $("#filter-project").on("change",function(){

        let projectId = $(this).val();

        sprLib.list("lijstActiviteiten").items({
            listCols: ["Title", "Id", "TitelLang"],
            queryFilter: "(Project eq '" + projectId + "')"
        }).then(function (arrData) {

            $("#filter-activiteit").find('option')
                .remove()
                .end();

            $("#filter-activiteit").append(

                $('<option>', {
                    value: '',
                    text: ''
                })

            );

            /** Activiteiten */
            arrData.forEach(function (arrayItem) {
                if (arrayItem.TitelLang != null) {
                    $("#filter-activiteit").append(
                        $('<option>', {
                            value: arrayItem.Id,
                            text: arrayItem.TitelLang
                        }));
                }
            });

        });
    });


    /**
     * Save registratie moment
     * */
    $("#saveRegistratie").on("click", function () {
        // Save moment
        SaveMoment();
        return false;

    });

    /**
     * View a moment
     */

    $("body").on("click", ".edit-activiteit", function () {

        // Go to the home tab :)
        $(".navbar-item[href='#app-container-main']").trigger("click");

        $("#registratie-container").addClass("loading");

        // Trigger edit
        triggerEditForm(true);

        var val = $(this).attr("data-id");

        editTheMoment(val);

    });


    $("body").on("click", ".view", function () {

        $("#registratie-container").addClass("loading");

        // Trigger edit
        triggerEditForm(true,true);

        var val = $(this).attr("data-id");

        editTheMoment(val);

    });

    /**
     * Cancel edit
     */
    $("body").on("click","#cancelRegistratie",function () {

        editMoment = {};
        editId = 0;

        clearForm();
        triggerEditForm();
        // Set standard values
        setStandardValues();

    });

    /**
     * Delete an item
     * */
    $("body").on("click", ".delete", function () {

        Swal.fire({
            title: 'Ben je zeker dat je dit moment wil verwijderen?',
            text: "Deze actie kan niet ongedaan worden gemaakt!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ja, verwijderen!'
        }).then((result) => {
            if (result.value) {
                var theId = $(this).data("id");
                // clear form
                clearForm();
                editId = 0;
                // Trigger edit form
                triggerEditForm();

                deleteMoment(theId);

                return false;
            }
        })

        return false;
    });

    /**
     * User profile info
     */
    $("#user-profile").on("click", function () {


        /** Get List of projects */
        Promise.all([
            sprLib.list("lijstProjecten").items({queryFilter: "(Id eq '" + currentUser.projectId.results[0] + "')"}),
            sprLib.list("lijstLocaties").items({queryFilter: "(Id eq '" + currentUser.locatieId.results[0] + "')"}),
        ]).then(
            function (arrData) {

                Swal.fire({
                    title: 'Hoi ' + currentUser.voornaam,
                    text: 'Jouw huidige project is ' + arrData[0][0].TitelLang + ' in ' + arrData[1][0].TitelLang + '.',
                    type: 'info',
                    confirmButtonText: 'Ok'
                });
            });


    });



});

/**
 * Get user info
 */
function getUserInfo(){
    var user = sprLib.user().info().then(function(objUser){

        getUserData(objUser.Id);

        // Load only in admin
        // if(objUser.IsSiteAdmin === true){
            // Load the partners script
            loadScripts(["https://cdn.jsdelivr.net/npm/vue/dist/vue.js","js/vue-filters.js","js/upload.js","js/partners.js","js/vrijwilligers.js"]).then(function () {
                // Load Partner Area
            });
        //}

    });
}

/**
 * Load a moment
 * @param filter
 * @param clear
 */
function loadMoments(filter = '', clear = true) {

    if (clear == true) {
        $("#momenten-overview ul").html("Laden..");
    } else {
        $("#momenten-overview ul").append('<li class="loadMore"><b>Meer activiteiten aan het laden..</b></li>');
    }


    /** Laad momenten */
    /**  queryOrderby: 'datum desc,Id desc, Title' } */
    sprLib.list("lijstMomenten").items({ queryFilter: filter, listCols: ['ID', 'Id', 'Title', 'datum','aantalDeelnemers','aantalVrijwilligers','aantalPartners',"aantalOplossingsact","aantalInitiatiefnemers"], queryLimit: 200,  queryNext: { "prevId": lastMomentId, "maxItems": 200 }, queryOrderby: 'datum desc' }).then(function (arrData) {

        if (clear == true) {
            $("#momenten-overview ul").html("");
        } else {
            $("#momenten-overview ul li.loadMore").remove();
        }

        if (arrData.length > 0) {

            // Show the amount of
            var currentAmount = parseInt($(".amount-moments").html());
            if (clear != true) {
                currentAmount = currentAmount + arrData.length;
            } else {
                currentAmount = arrData.length;
            }
            // Add amount
            $(".amount-moments").html(currentAmount);

            arrData.forEach(function (arrayItem) {

                var date = moment(arrayItem.datum).format("DD-MM-YYYY");
                var timestamp = moment(arrayItem.datum).unix();
                var threeMonthsAgo = moment().subtract("3","months").unix();

                // Only show edit within 3 months
                if(timestamp > threeMonthsAgo) {
                    var editFields = '<span class="is-pulled-right"><i class="far fa-edit edit-activiteit" data-id="' + arrayItem.Id + '"></i><i class="fas fa-trash delete" data-id="' + arrayItem.Id + '"></i></span>';
                }else{
                    editFields = '<span class="is-pulled-right"><i class="far fa-eye view" data-id="' + arrayItem.Id + '"></i></span>';
                }
                $("#momenten-overview ul").append("<li><span class='sortDate'><b>" + date + "</b> - </span>" + arrayItem.Title + " "+editFields+"  <span class=\"is-pulled-right\"> d:" +arrayItem.aantalDeelnemers+ " v:" +arrayItem.aantalVrijwilligers+ " i:"+arrayItem.aantalInitiatiefnemers+" p:"+arrayItem.aantalPartners+" o:"+arrayItem.aantalOplossingsact+ "</span></li>");

            });


            // Set next
            if (arrData[0]["__next"] != null) {
                let id = arrData.length - 1;

                lastMomentId = arrData[id]["Id"];
            } else {
                lastMomentId = -1;
            }

            // Resort divs
            // tinysort("#momenten-overview ul>li", {data: 'time', order: 'desc'});

            // Loading = done, so reset scrolling
            alreadyLoadingOnScroll = false;

        } else {
            $("#momenten-overview ul").html("Geen resultaten gevonden");


            // Set already scrolling
            alreadyLoadingOnScroll = false;

        }

    }).catch(function (strErr) {

        $.LoadingOverlay("hide");

        Swal.fire({
            title: 'Zoekopdracht niet specifiek genoeg.',
            text: 'Je dient de datums specifieker te kiezen. De huidige periode is te groot. Mogelijks ligt de zoekopdracht te ver in het verleden.',
            type: 'error',
            confirmButtonText: 'Ok'
        });

        $("#momenten-overview ul").html("Je dient de datums specifieker te kiezen. De huidige periode is te groot. Mogelijks ligt de zoekopdracht te ver in het verleden.");

    });
}

function SaveMoment() {

    $.LoadingOverlay("show");

    // Validate form
    var formValidation = validateForm();
    var formErrors = Object.keys(formValidation).length;
    if (formErrors > 0) {


        $.LoadingOverlay("hide");

        Swal.fire({
            title: 'Oeps...',
            text: 'Je moet alle velden correct invullen. Probeer het opnieuw!',
            type: 'error',
            confirmButtonText: 'Ok'
        })

        return;
    }

    // Load form data
    var formData = loadFormData();

    if(editId === 0) {

        sprLib.list("lijstMomenten").create(formData).then(function (objItem) {


            // Reset paging
            lastMomentId = 0;

            clearForm();

            loadMoments('');

            $.LoadingOverlay("hide");

            Swal.fire({
                title: 'Gelukt!',
                text: 'Moment succesvol toegevoegd!',
                type: 'success',
                confirmButtonText: 'Ok'
            })


        }).catch(function (strErr) {

            $.LoadingOverlay("hide");

            Swal.fire({
                title: 'Oeps...',
                text: 'Oeps er ging iets technisch mis, probeer het opnieuw! #lijst-momenten_001',
                type: 'error',
                confirmButtonText: 'Ok'
            })

            console.error(strErr);

        });
    }else {
        // Editing a moment
        sprLib.list("lijstMomenten").update(formData).then(function (objItem) {

            // Reset paging
            lastMomentId = 0;
            editId = 0;

            clearForm();
            // Reset to new
            triggerEditForm();

            loadMoments('');

            $.LoadingOverlay("hide");

            Swal.fire({
                title: 'Gelukt!',
                text: 'Moment succesvol aangepast!',
                type: 'success',
                confirmButtonText: 'Ok'
            })


        }).catch(function (strErr) {

            $.LoadingOverlay("hide");

            Swal.fire({
                title: 'Oeps...',
                text: 'Oeps er ging iets technisch mis, probeer het opnieuw! '+strErr,
                type: 'error',
                confirmButtonText: 'Ok'
            })

            console.error(strErr);

        });
    }



}

/**
 * Clear the form
 */
function clearForm() {

    $("#cancelRegistratie").remove();
    $("#registratie-container .select2").val(null).trigger('change');

    for (var key in ArrayOfData) {
        $("#" + key).val(0);
    }

    var theDate = moment().format("YYYY-MM-DD");

    $("#datum").val(theDate);
}


/**
 * Load all data from form into an array
 * */
function loadFormData() {

    var arrayOfReturn = {};

    for (var key in ArrayOfData) {

        // Get the value
        var theValue = $("#" + key).val();


        // Get name of field in list
        var theNameInList = ArrayOfData[key]["listName"];

        if (key == "datum") {
            theValue = new Date(theValue);
        }


        // Set array to object
        if (Array.isArray(theValue)) {
            // Add to return array as multiple results
            arrayOfReturn[theNameInList] = {};
            arrayOfReturn[theNameInList]["results"] = theValue;
        } else {
            // Niet project, locatie, activiteit
            if( ArrayOfData[key]["resultsArray"] === true){


                // Empty results
                if(theValue == '' || theValue == null){
                    // Do not set

                }else{
                    // Add to return array as multiple results
                    arrayOfReturn[theNameInList] = {};
                    arrayOfReturn[theNameInList]["results"] = theValue;
                }
            }else{
                // Add to return array
                arrayOfReturn[theNameInList] = theValue;
            }
        }

    }

    // Add edit id
    if(editId > 0){
        arrayOfReturn["Id"] = editId;
    }

    return arrayOfReturn;

}

function getListInfo(){
    sprLib.list('lijstActiviteiten').cols()
        .then(function(arrayResults){ console.table(arrayResults) });
}

function validateForm() {
    var Errors = {};

    for (var key in ArrayOfData) {
        var theValue = $("#" + key).val();
        var req = ArrayOfData[key]["required"];

        if (!theValue && req === true) {
            Errors[key] = key;
            // Trigger the color to be red
            $("#" + key).addClass("is-danger");
        } else {
            $("#" + key).removeClass("is-danger");
        }
    }

    console.log(Errors);

    return Errors;
}

function viewMoment(momentId){

    sprLib.list("lijstMomenten").items({
        queryFilter: "(Id eq '" + momentId + "')",
        queryLimit: 1,
        expand: "lijstVrijwilligers"
    }).then(function (arrData) {

        arrData.forEach(function (arrayItem) {

            var theHtml = '' +
                '<div>' +
                +arrayItem.projectId+'' +
                +arrayItem.soortActiviteit+'</div>';

            Swal.fire({
                title: arrayItem.Title,
                html: theHtml,
                confirmButtonText: 'Ok'
            });

        });


    }).catch(function (strErr) {

        Swal.fire({
            title: 'Moment bestaat niet.',
            text: 'Oeps, dit moment lijkt niet te bestaan. '+strErr,
            type: 'error',
            confirmButtonText: 'Ok'
        });

    });

}

function editTheMoment(momentId,onlyview=false){

    sprLib.list("lijstMomenten").items({
        queryFilter: "(Id eq '" + momentId + "')",
        queryLimit: 1
    }).then(function (arrData) {
        // Set edit id
        editId = momentId;
        editMoment = arrData[0];
        noChangeAmounts = true;
        /*
        Set data into fields
         */
        var theDate = moment(arrData[0].datum).format("YYYY-MM-DD");

        $("#datum").val(theDate);
        $("#soortActiviteit").val(arrData[0].soortActiviteit);
        $("#locatie").val(arrData[0].locatieId).trigger("change");
        $("#project").val(arrData[0].projectId).trigger("change");

        $("#titel").val(arrData[0].Title);
        $("#aantalVrijwilligers").val(arrData[0].aantalVrijwilligers);
        $("#aantalDeelnemers").val(arrData[0].aantalDeelnemers);
        $("#aantalPartners").val(arrData[0].aantalPartners);
        $("#aantalOplssingact").val(arrData[0].aantalOplossingact);
        $("#aanwezigeDoelgroep").val(arrData[0].AanwezigeDoelgroep);

        console.log(arrData[0].AanwezigeDoelgroep);


        $("#aantalInitatiefnemers").val(arrData[0].aantalInitiatiefnemers);
        // Partner organisaties
        if(editMoment.partnersOrgsId) {
            $("#partners").val(arrData[0].partnersOrgsId.results).trigger("change");
        }else{
            $("#partners").val();
        }

        // Aandachtsgebied toevoegen
        if(editMoment.aandachtsGebied) {
            $("#aandachtVoor").val(arrData[0].aandachtsGebied.results).trigger("change");
        }else{
            $("#aandachtVoor").val();
        }

        // setStandardValues();

        // Make it changeable again
        setTimeout(function () {
            noChangeAmounts = false;
        },3000);
    });
}

function deleteMoment(momentId) {

    $.LoadingOverlay("show");

    sprLib.list('lijstMomenten').delete({ "ID": momentId })
        .then(function (intId) {

            $.LoadingOverlay("hide");

            Swal.fire({
                title: 'Gelukt!',
                text: 'Moment ' + intId + ' succesvol verwijderd. ',
                type: 'success',
                confirmButtonText: 'Ok'
            });

            // Reset paging
            lastMomentId = 0;

            // Reload moments
            loadMoments();
        })
        .catch(function (strErr) { alert(strErr); });

}

function getFilter() {

    var locatie = $("#filter-locatie").val();
    var project = $("#filter-project").val();
    var activiteit = $("#filter-activiteit").val();
    var from = $("#date-from-filter").val();
    var to = $("#date-to-filter").val();
    var act_filter = "";
    var date = "";
    var location = "";

    if(activiteit){
        act_filter = " and (activiteitId eq "+activiteit+")";
    }

    if(from){
        var theDate = new Date(from);
        date = "(datum ge datetime'"+theDate.toISOString()+"')";
    }

    // To date
    if(to){
        var theDate = new Date(to);
        date += " and (datum le datetime'"+theDate.toISOString()+"')";
    }

    if(locatie){
        location = "and (locatieId eq " + locatie + ")";
    }

    if (locatie && project) {
        return date + " and (projectId eq " + project + ")"+act_filter+" "+location  ;
    } else if (locatie && !project) {
        return date + ""+act_filter+" "+location;
    } else if (!locatie && project) {
        return date + ""+act_filter+" "+location;
    } else if (!locatie && !project) {
        // Load all moments
        return "";
    }

}

/**
 * Append extra fields
 */
function appendExtraFields(){
    let startDate = moment().subtract(3,"months").format("YYYY-MM-DD");

    $("div #datum").parent().after('<div class="field"><label>Soort</label><select id="soortActiviteit" name="soortActiviteit"><option value="individueel contact">Individueel contact</option><option value="werkgroep">werkgroep</option> <option value="groepssamenkomst">groepssamenkomst</option><option value="vorming of infomoment">vorming of infomoment</option></select></div>');
    $("div #aantalPartners").parent().after('<div class="field" id="momenten-aandacht-voor"><label>Aandacht voor</label><select id="aandachtVoor" name="aandachtVoor" multiple class="select2"><option value=""></option><option value="informatie en vorming over een thema">informatie en vorming over een thema</option> <option value="oefenkans Nederlands">oefenkans Nederlands</option><option value="digitale oefenkans">digitale oefenkans</option><option value="verbinden over verschillen heen">verbinden over verschillen heen</option><option value="vormgeving / beheer leefomgeving">vormgeving / beheer leefomgeving</option><option value="Kronenburg">Kronenburg</option><option value="directe leefomgeving (SOS)">directe leefomgeving (SOS)</option></select></div>');
    $("div #aantalPartners").parent().after('<div class="field" style="display: none;" id="momenten-aanwezige-doelgroep"><label>Aanwezige doelgroep</label><select id="aanwezigeDoelgroep" name="aanwezigeDoelgroep" class="select2"><option value=""></option><option value="jongeren">Jongeren</option> <option value="vaderfiguren">Vaderfiguren</option><option value="jongeren en vaderfiguren">Jongeren en vaderfiguren</option></select></div>');

    $("#filter-activiteit").after('<div class="columns"><div class="field column"><label>Van</label><input type="date" name="date-from-filter" id="date-from-filter" value="'+startDate +'" /> </div><div class="column"><label>Tot</label><input type="date" name="date-to-filter" id="date-to-filter" /></div></div>');
    $("#registratie-container").before('<div id="triggerMobileReg" class="is-hidden-tablet button is-primary title is-4">Nieuwe registratie toevoegen</div>');

}

/**
 * Get list properties
 */
function getListOfProperties() {

    Promise.all([
        sprLib.list("lijstProjecten").items({listCols:["TitelLang", "Id"],queryOrderby: "TitelLang"}),
        sprLib.list("lijstLocaties").items({listCols:["TitelLang", "Id", "Omschrijving"],queryOrderby: "TitelLang"}),
        sprLib.list("Organisaties").items({ listCols: ["Title", "Id"], queryLimit: 5000,queryOrderby: "Title"}),
        sprLib.list("lijstActiviteiten").items({
            listCols: ["Title", "Id", "TitelLang"],
            queryFilter: "(Project eq '" + currentUser.projectId.results[0] + "')"
        })
    ]).then(
        function (arrData) {


            /** Project */
            arrData[0].forEach(function (arrayItem) {

                if (arrayItem.TitelLang != null && arrayItem.TitelLang != "null") {
                    $("#project").append(
                        $('<option>', {
                            value: arrayItem.Id,
                            text: arrayItem.TitelLang
                        }));

                };
            });


            /** Project */
            arrData[0].forEach(function (arrayItem) {
                if (arrayItem.TitelLang != null && arrayItem.TitelLang != "null") {
                    $("#filter-project").append(
                        $('<option>', {
                            value: arrayItem.Id,
                            text: arrayItem.TitelLang
                        }));
                }
            });

            /** Locaties */
            arrData[1].forEach(function (arrayItem) {

                if (arrayItem.TitelLang != null) {
                    $("#locatie").append(
                        $('<option>', {
                            value: arrayItem.Id,
                            text: arrayItem.TitelLang
                        }));

                }
            });


            /** Locaties add to filter*/
            arrData[1].forEach(function (arrayItem) {
                if (arrayItem.TitelLang != null) {
                    $("#filter-locatie").append(
                        $('<option>', {
                            value: arrayItem.Id,
                            text: arrayItem.TitelLang
                        }));
                }
            });

            /** Partners */
            arrData[2].forEach(function (arrayItem) {
                $("#partners").append(
                    $('<option>', {
                        value: arrayItem.Id,
                        text: arrayItem.Title
                    }));
            });

            /** Activiteiten */
            arrData[3].forEach(function (arrayItem) {
                if (arrayItem.TitelLang != null) {
                    $("#filter-activiteit").append(
                        $('<option>', {
                            value: arrayItem.Id,
                            text: arrayItem.TitelLang
                        }));
                }
            });


            // Set filters & standard values
            setStandardValues();
        });



}
/*
Set the standard values of the current user
 */
function setStandardValues(){
    $("#filter-project").val(currentUser.projectId.results[0]);
    $("#filter-locatie").val(currentUser.locatieId.results[0]).trigger("change");
    $("#locatie").val(currentUser.locatieId.results[0]).trigger("change");
    $("#project").val(currentUser.projectId.results[0]).trigger("change");
//    $("#activiteit").val(currentUser.activiteitId.results[0]).trigger("change");

}


/**
 *
 * @param item
 * @param id
 */
function getItemById(item,id){

    var result = {};

    sprLib.list(item).items({
        queryFilter: "(Id eq '" + id + "')"
    }).then(function (arrData) {
        result = arrData;
    });

    return result;
}

/**
 * Trigger edit form
 */
function triggerEditForm(isEdit=false,onlyview=false) {

    var container = $("#registratie-container .title");
    $("#cancelRegistratie").remove();

    if(container.hasClass("edit") && isEdit === false){
        container.removeClass("edit");
        container.html("Nieuwe registratie");
    }else{
        container.addClass("edit");
        container.html("Registratie bewerken")

        $("#saveRegistratie").after('<a id="cancelRegistratie" class="button is-large is-danger">Annuleren</a>');
    }

    if(onlyview === true){
        $("#saveRegistratie").hide();
    }else{
        $("#saveRegistratie").show();
    }
}



/**
 * Get the user data
 * @param userId
 */
function getUserData(userId) {

    sprLib.list("inDienst").items({
        queryFilter: "(contactSAS eq '" + userId + "')",
        queryLimit: 1,
    }).then(function (arrData) {

        arrData.forEach(function (arrayItem) {

            currentUser = arrayItem;
            // Get list of propertys
            getListOfProperties();

        });


    }).catch(function (strErr) {

        Swal.fire({
            title: 'Persoon bestaat niet.',
            text: 'Oeps, deze persoon lijkt niet te bestaan. '+strErr,
            type: 'error',
            confirmButtonText: 'Ok'
        });

    });

}