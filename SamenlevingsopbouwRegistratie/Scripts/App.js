'use strict';

ExecuteOrDelayUntilScriptLoaded(initializePage, "sp.js");

/*
* Array of data 
* Format: "FieldName On App" => "FieldName In Sharepoint List"
*/
const ArrayOfData = {
    "project": { "listName" : "projectId","required" : true},
    "activiteit": { "listName": "activiteitId", "required": true },
    "locatie": { "listName": "locatieId", "required": true },
    "datum": { "listName": "datum", "required": true },
    "titel": { "listName": "Title", "required": true },
    "vrijwilligers": { "listName": "vrijwilligersId", "required": false },
    "aantalVrijwilligers": { "listName": "aantalVrijwilligers", "required": true },
    "aantalInitatiefnemers": { "listName": "aantalInitiatiefnemers", "required": true },
    "deelnemers": { "listName": "deelnemersId", "required": true },
    "aantalDeelnemers": { "listName": "aantalDeelnemers", "required": false },
    "aantalOplossingact": { "listName": "aantalOplossingact", "required": true },
    "partners": { "listName": "partnersId", "required": false },
    "aantalPartners": { "listName": "aantalPartners", "required": true }
};

var VrijwilligerId = 5;
var lastMomentId = 0;
var alreadyLoadingOnScroll = false;

function initializePage()
{

    // This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
    $(document).ready(function () {

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
        $(".select2").select2({ width: '100%' });

        // Set date
        $('#datum').val(moment().format("YYYY-MM-DD"));

        sprLib.options({ baseUrl: '/sites/development' });

        sprLib.user().info()
            .then(function (objUser) {
                $("[data-content='user.name']").html(objUser.Title);
            });

    /** Get List of projects */
        Promise.all([
            sprLib.list("lijstProjecten").items(["Title", "Id"]),
            sprLib.list("lijstLocaties").items(["Title", "Id", "Omschrijving"]),
            sprLib.list("Partners").items({ listCols: ["Title", "Id"], queryLimit: 5000})
        ]).then(
                function (arrData) {
                    /** Project */
                    arrData[0].forEach(function (arrayItem) {
                        $("#project").append(
                            $('<option>', {
                                value: arrayItem.Id,
                                text: arrayItem.Title
                            }));
                    });

                /** Project */
                arrData[0].forEach(function (arrayItem) {
                    $("#filter-project").append(
                        $('<option>', {
                            value: arrayItem.Id,
                            text: arrayItem.Title
                        }));
                });

                    /** Locaties */
                    arrData[1].forEach(function (arrayItem) {
                        $("#locatie").append(
                            $('<option>', {
                                value: arrayItem.Id,
                                text: arrayItem.Omschrijving
                            }));
                    });
                /** Locaties add to filter*/
                     arrData[1].forEach(function (arrayItem) {
                    $("#filter-locatie").append(
                        $('<option>', {
                            value: arrayItem.Id,
                            text: arrayItem.Omschrijving
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


                });

        $("#project").on("change", function (e) {

            var value = $(this).val();

            sprLib.list("lijstActiviteiten").items({
                listCols: ["Title", "Id", "Titel"],
                queryFilter: "(Project eq '" + value + "')"
            }).then(function (arrData) {

                // Clean fields
                $("#activiteit").find('option')
                    .remove()
                    .end();

            
                /** Activiteiten */
                arrData.forEach(function (arrayItem) {

                    var newOption = new Option(arrayItem.Title, arrayItem.Id, false, false);
                    $('#activiteit').append(newOption).trigger('change');

                });


            });

        });

        /** Change Vrijwilligers & deelnemers when location changes **/
        $("#locatie").on('change',function (e) {

            var value = $(this).val();
            Promise.all([
            sprLib.list("lijstVrijwilligers").items({
                listCols: ["Title", "Id", "VolledigeNaam", "LocatieId","statuut"],
                queryFilter: "(LocatieId eq '" + value + "') and (statuut eq 'vrijwilliger')",
                queryLimit: 5000
            }),
           sprLib.list("lijstVrijwilligers").items({
                    listCols: ["Title", "Id", "VolledigeNaam", "LocatieId","statuut"],
               queryFilter: "(LocatieId eq '" + value + "') and (statuut eq 'deelnemer')",
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


            });

        });


        $("#vrijwilligers").on("change", function () {

            var countVrijwilligers = $("#vrijwilligers option:selected").length;
            $("#aantalVrijwilligers").val(countVrijwilligers);

        });

        $("#partners").on("change", function () {

            var countVrijwilligers = $("#partners option:selected").length;
            $("#aantalPartners").val(countVrijwilligers);

        });

        $("#deelnemers").on("change", function () {

            var countDeelnemers = $("#deelnemers option:selected").length;
            $("#aantalDeelnemers").val(countDeelnemers);

        });

        $("#activiteit").on("change", function () {

            var nameGenrated = $("#activiteit option:selected").text();
            $("#titel").val(nameGenrated);

        });

        // Load Moments on start
        loadMoments('');

        // Filter moments on location & projects
        $("#filter-locatie, #filter-project").on("change", function () {

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
         * Delete an item
         * */
        $("body").on("click",".delete", function () {

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
    sprLib.list("lijstMomenten").items({ queryFilter: filter, listCols: ['ID', 'Id', 'Title', 'datum','aantalDeelnemers'], queryLimit: 200, queryNext: { prevId: lastMomentId, maxItems: 200 }, queryOrderby: 'Id desc' }).then(function (arrData) {

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

                var editFields = '<span class="is-pulled-right"> <i class="far fa-eye viewMoment" data-id="' + arrayItem.Id + '"></i> <i class="far fa-edit edit" data-id="' + arrayItem.Id + '"></i><i class="fas fa-trash delete" data-id="' + arrayItem.Id + '"></i></span>';
                $("#momenten-overview ul").append("<li data-time='" + timestamp +"'>#" + arrayItem.Id + " - <span class='sortDate'><b>" + date + "</b></span> - " + arrayItem.Title + " " + editFields + "</li>");

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


    }).catch(function (strErr) { console.error(strErr); });
    

}
function clearForm() {

    $(".select2").val(null).trigger('change');

    for (var key in ArrayOfData) {
        $("#" + key).val(0);
    }
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
            // Add to return array
            arrayOfReturn[theNameInList] = theValue;
        }

    }

    return arrayOfReturn;

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

    return Errors;
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
            })

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

    if (locatie && project) {
        return "(locatieId eq " + locatie + ") and (projectId eq " + project + ")";
    } else if (locatie && !project) {
        return "(locatieId eq " + locatie + ")";
    } else if (!locatie && project) {
        return "(projectId eq " + project + ")";
    } else if (!locatie && !project) {
        // Load all moments
        return "";
    }

}


