'use strict';

ExecuteOrDelayUntilScriptLoaded(initializePage, "sp.js");

/*
* Array of data 
* Format: "FieldName On App" => "FieldName In Sharepoint List"
*/
var ArrayOfData = {
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

var pagingMomentsId = 0;

function initializePage()
{

    // This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
    $(document).ready(function () {


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
            sprLib.list("Partners").items(["Title", "Id"])
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
                queryFilter: "(LocatieId eq '" + value + "') and (statuut eq 'vrijwilliger')"
            }),
           sprLib.list("lijstVrijwilligers").items({
                    listCols: ["Title", "Id", "VolledigeNaam", "LocatieId","statuut"],
               queryFilter: "(LocatieId eq '" + value + "') and (statuut eq 'deelnemer')"
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

            var locatie = $("#filter-locatie").val();
            var project = $("#filter-project").val();


            if (locatie && project) {
                loadMoments("(locatieId eq " + locatie + ") and (projectId eq " + project + ")");
                return;
            } else if (locatie && !project) {
                loadMoments("(locatieId eq " + locatie + ")");
                return;
            } else if (!locatie && project) {
                loadMoments("(projectId eq " + project + ")");
                return;
            } else if (!locatie && !project) {
                // Load all moments
                loadMoments('');
                return;
            }

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

            var r = confirm("Ben je zeker dat je dit moment wil verwijderen?");
            if (r == true) {
                var theId = $(this).data("id");

                deleteMoment(theId);
     
                return false;

            } else {
                return false;
            }
        });


    });



}

function loadMoments(filter = '') {

    $("#momenten-overview ul").html("Laden..");

    /** Laad momenten */
    sprLib.list("lijstMomenten").items({ queryFilter: filter, queryOrderby: "datum desc", queryNext: { prevId: pagingMomentsId } }).then(function (arrData) {

        $("#momenten-overview ul").html("");

        if (arrData.length > 0) {

            arrData.forEach(function (arrayItem) {

                var date = moment(arrayItem.datum).format("DD-MM-YYYY");
                var editFields = '<span class="is-pulled-right"><a href="#" data-id="' + arrayItem.Id + '" class="edit"><i class="far fa-edit"></i></a><i class="fas fa-trash delete" data-id="' + arrayItem.Id + '"></i></span>';
                $("#momenten-overview ul").append("<li>#"+arrayItem.Id+" - <b>" + date + "</b> - " + arrayItem.Title + " " + editFields + "</li>");

            });

        } else {
            $("#momenten-overview ul").html("Geen resultaten gevonden");
        }

    });




}

function SaveMoment() {

    // Validate form
    var formValidation = validateForm();
    var formErrors = Object.keys(formValidation).length;
    if (formErrors > 0) {
        alert("Je moet alle velden correct invullen.");
        return;
    }

    // Load form data
    var formData = loadFormData();


    sprLib.list("lijstMomenten").create(formData).then(function (objItem) {

        loadMoments('');

        clearForm();


    }).catch(function (strErr) { console.error(strErr); });
    

}
function clearForm() {
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

    sprLib.list('lijstMomenten').delete({ "ID": momentId })
        .then(function (intId) {
            alert('Moment ' + intId + ' succesvol verwijderd. ');
            // Reload moments
            loadMoments();
        })
        .catch(function (strErr) { alert(strErr); });

}

