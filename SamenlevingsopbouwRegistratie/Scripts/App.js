'use strict';

ExecuteOrDelayUntilScriptLoaded(initializePage, "sp.js");

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
    "aandachtVoor": { "listName": "aandachtsGebied", "required": true,"resultsArray" : true },
    "titel": { "listName": "Title", "required": true,"resultsArray" : false },
    "vrijwilligers": { "listName": "vrijwilligersId", "required": false,"resultsArray" : true },
    "aantalVrijwilligers": { "listName": "aantalVrijwilligers", "required": true,"resultsArray" : false },
    "aantalInitatiefnemers": { "listName": "aantalInitiatiefnemers", "required": true,"resultsArray" : false },
    "deelnemers": { "listName": "deelnemersId", "required": false,"resultsArray" : true },
    "aantalDeelnemers": { "listName": "aantalDeelnemers", "required": false,"resultsArray" : false },
    "aantalOplossingact": { "listName": "aantalOplossingsact", "required": true,"resultsArray" : false },
    //"partners": { "listName": "partnersOrgs", "required": false,"resultsArray" : true },
    "aantalPartners": { "listName": "aantalPartners", "required": true,"resultsArray" : false }
};

var lastMomentId = 0;
var alreadyLoadingOnScroll = false;
var currentUser = {};
var woordenboekLoaded = false;
var editId = 0;
var editMoment = {};

function initializePage() {

    // This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
    $(document).ready(function () {

        // Append extra fields
        appendExtraFields();

        // Get current user Data
        getUserInfo();

        // getListInfo();


        // Show woordenboek
        $("[href='#woordenboek']").on("click", function () {
            $("#app-container-main").hide();
            $("#woordenboek").show();

            // Load the woordenboek
            loadWoordenboek();
        });

        // Show App
        $("[href='#app-container-main']").on("click", function () {
            $("#app-container-main").show();
            $("#woordenboek").hide();

            // Load the woordenboek
            // loadWoordenboek();
        });

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

        // Enable select 2
        $(".select2").select2({width: '100%'}); // closeOnSelect: false

        // Set date
        $('#datum').val(moment().format("YYYY-MM-DD"));

        sprLib.options({baseUrl: '/sites/sas'});

        sprLib.user().info()
            .then(function (objUser) {
                $("[data-content='user.name']").html(objUser.Title);
            });


        $("#project").on("change", function (e) {

            var value = $(this).val();

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
        $("#project,#locatie").on('change', function (e) {

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

                    var newOption = new Option(arrayItem.VolledigeNaam, arrayItem.Id, false, false);
                    $('#deelnemers').append(newOption).trigger('change');

                });

                // add vrijwilligers & deelnemers on edit
                if (editId  > 0){
                    $("#vrijwilligers").val(editMoment.vrijwilligersId.results).trigger("change");
                    $("#deelnemers").val(editMoment.deelnemersId.results).trigger("change");
                    $("#registratie-container").removeClass("loading");
                }




            });

        });


        $("#vrijwilligers").on("change", function () {

            var countVrijwilligers = $("#vrijwilligers option:selected").length;
            $("#aantalVrijwilligers").val(countVrijwilligers).addClass("highlight");

        });

        $("#partners").on("change", function () {

            var countVrijwilligers = $("#partners option:selected").length;
            $("#aantalPartners").val(countVrijwilligers).addClass("highlight");

        });

        $("#deelnemers").on("change", function () {

            var countDeelnemers = $("#deelnemers option:selected").length;
            $("#aantalDeelnemers").val(countDeelnemers).addClass("highlight");

        });

        $("#activiteit").on("change", function () {

            if(editMoment === 0) {
                var nameGenrated = $("#activiteit option:selected").text();
                $("#titel").val(nameGenrated);
            }

        });


        // Load Moments on start
        loadMoments('');

        // Filter moments on location & projects
        $("#filter-locatie, #filter-project, #filter-activiteit").on("change", function () {

            var filter = getFilter();
            // Reset paging
            lastMomentId = 0;

            loadMoments(filter);

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

        $("body").on("click", ".edit", function () {

            $("#registratie-container").addClass("loading");

            // Trigger edit
            triggerEditForm(true);

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
                        title: 'Hoi ' + currentUser.Title,
                        text: 'Jouw huidige project is ' + arrData[0][0].TitelLang + ' in ' + arrData[1][0].TitelLang + '.',
                        type: 'info',
                        confirmButtonText: 'Ok'
                    });
                });


        });


    });
}

function loadMoments(filter = '', clear = true) {

    if (clear == true) {
        $("#momenten-overview ul").html("Laden..");
    } else {
        $("#momenten-overview ul").append('<li class="loadMore"><b>Meer momenten aan het laden..</b></li>');
    }


    /** Laad momenten */
    /**  queryOrderby: 'datum desc,Id desc, Title' } */
    sprLib.list("lijstMomenten").items({ queryFilter: filter, listCols: ['ID', 'Id', 'Title', 'datum','aantalDeelnemers'], queryLimit: 200,  queryNext: { prevId: lastMomentId, maxItems: 200 }, queryOrderby: 'datum desc' }).then(function (arrData) {

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

                var editFields = '<span class="is-pulled-right"><i class="far fa-edit edit" data-id="' + arrayItem.Id + '"></i><i class="fas fa-trash delete" data-id="' + arrayItem.Id + '"></i></span>';
                $("#momenten-overview ul").append("<li><span class='sortDate'><b>" + date + "</b></span> - " + arrayItem.Title + " " + editFields + "</li>");

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

    console.log(formData);

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
            text: 'Oeps er ging iets technisch mis, probeer het opnieuw!',
            type: 'error',
            confirmButtonText: 'Ok'
        })

        console.error(strErr);

    });


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
                // Add to return array as multiple results
                arrayOfReturn[theNameInList] = {};
                arrayOfReturn[theNameInList]["results"] = theValue;
            }else{
                // Add to return array
                arrayOfReturn[theNameInList] = theValue;
            }
        }

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

function editTheMoment(momentId){

    sprLib.list("lijstMomenten").items({
        queryFilter: "(Id eq '" + momentId + "')",
        queryLimit: 1
    }).then(function (arrData) {
        // Set edit id
        editId = momentId;
        editMoment = arrData[0];
        /*
        Set data into fields
         */
        var theDate = moment(arrData[0].datum).format("YYYY-MM-DD");

        $("#datum").val(theDate);
        $("#soortActiviteit").val(arrData[0].soortActiviteit);
        $("#locatie").val(arrData[0].locatieId).trigger("change");
        $("#project").val(arrData[0].projectId).trigger("change");
        $("#activiteit").val(arrData[0].activiteitId).trigger("change");
        $("#titel").val(arrData[0].Title).trigger("change");

        $("#partners").val(editMoment.partnersOrgsId.results).trigger("change");
        $("#aandachtvoor").val(editMoment.aandachtsGebied.results).trigger("change");

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
    var act_filter = "";

    if(activiteit){
        act_filter = " and (activiteitId eq "+activiteit+")";
    }

    if (locatie && project) {
        return "(locatieId eq " + locatie + ") and (projectId eq " + project + ")"+act_filter;
    } else if (locatie && !project) {
        return "(locatieId eq " + locatie + ")"+act_filter;
    } else if (!locatie && project) {
        return "(projectId eq " + project + ")"+act_filter;
    } else if (!locatie && !project) {
        // Load all moments
        return "";
    }

}

function appendExtraFields(){
    $("div #datum").parent().after('<div class="field"><label>Soort</label><select id="soortActiviteit" name="soortActiviteit"><option value="individueel contact">Individueel contact</option><option value="werkgroep">werkgroep</option> <option value="groepssamenkomst">groepssamenkomst</option><option value="vorming of infomoment">vorming of infomoment</option></select></div>');
    $("div #aantalPartners").parent().after('<div class="field"><label>Aandacht voor</label><select id="aandachtVoor" name="aandachtVoor" class="select2"><option value=""></option><option value="7">digitale oefenkansen</option> <option value="0">informatie en vorming over een thema</option><option value="1">oefenkans Nederlands</option><option value="3">Verbinden over verschillen heen</option><option value="4">vormgeving / beheer leefomgeving</option><option value="5">Kronenburg</option><option value="6">directe leefomgeving (SOS)</option></select></div>');

}

function getUserInfo(){
    var user = sprLib.user().info().then(function(objUser){

        getUserData(objUser.Id);

    });
}

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
                $("#project").append(
                    $('<option>', {
                        value: arrayItem.Id,
                        text: arrayItem.TitelLang
                    }));
            });


            /** Project */
            arrData[0].forEach(function (arrayItem) {
                $("#filter-project").append(
                    $('<option>', {
                        value: arrayItem.Id,
                        text: arrayItem.TitelLang
                    }));
            });

            /** Locaties */
            arrData[1].forEach(function (arrayItem) {
                $("#locatie").append(
                    $('<option>', {
                        value: arrayItem.Id,
                        text: arrayItem.TitelLang
                    }));
            });


            /** Locaties add to filter*/
            arrData[1].forEach(function (arrayItem) {
                $("#filter-locatie").append(
                    $('<option>', {
                        value: arrayItem.Id,
                        text: arrayItem.TitelLang
                    }));
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
                $("#filter-activiteit").append(
                    $('<option>', {
                        value: arrayItem.Id,
                        text: arrayItem.TitelLang
                    }));
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


}

/**
 * Load the woordenboek items
 */
function loadWoordenboek(){

    // Already loaded
    if(woordenboekLoaded === true){
        return;
    }

    sprLib.list("Registratiewoordenboek").items().then(function (arrData) {

        // Woordenboek is loaded
        woordenboekLoaded = true;

        arrData.forEach(function (arrayItem) {
            $("#woordenboek").append('<div class="card woordenboek-item"><header class="card-header">'+arrayItem.Title+'</header><div class="card-content">'+arrayItem.Uitleg+'</div></div>');
        });
    });
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
function triggerEditForm(isEdit=false) {

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
}


