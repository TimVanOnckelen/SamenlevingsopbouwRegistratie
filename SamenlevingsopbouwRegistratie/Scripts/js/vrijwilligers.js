const ArrayOfVrijwilligersData = {
    "person-voornaam": { "listName" : "Title","required" : true,"resultsArray" : false},
    "person-achternaam": { "listName": "Achternaam", "required": true,"resultsArray" : false },
    "person-telefoon": { "listName": "telefoon", "required": false,"resultsArray" : false },
    "person-geslacht": { "listName": "geslacht", "required": false,"resultsArray" : false },
    "person-gsm": { "listName": "Gsm", "required": false,"resultsArray" : false },
    "person-mail": { "listName": "Mail", "required": false,"resultsArray" : false },
    "person-AdresStraatEnNummer": { "listName": "AdresStraatEnNummer", "required": false,"resultsArray" : false },
    "person-postcode": { "listName": "AdresPostcode", "required": false,"resultsArray" : false },
    "person-gemeente": { "listName": "AdresGemeente", "required": false,"resultsArray" : false },
    "person-geboortedatum": { "listName": "Geboortedatum", "required": false,"resultsArray" : false },
    "person-contact": { "listName": "contactSASId", "required": true,"resultsArray" : false },
    "person-het-statuut": { "listName": "statuut", "required": true,"resultsArray" : false },
    "person-locatie": { "listName": "Locatie1Id", "required": true,"resultsArray" : true },
    "person-project": {"listName": "Project1Id", "required": true, "resultsArray": true},
     "person-id": { "listName": "Id", "required": true,"resultsArray" : false },
    "person-nieuwsbrief": {"listName": "Inschrijven_x0020_maandkalender", "required":false,"resultsArray":false},
    "person-migratieachtergrond": {"listName": "migratie_x002d_achtergrond", "required":false,"resultsArray":false},
    "person-werkschema": {"listName": "Werkschema", "required":false,"resultsArray":false},
    "person-opmerkingen": {"listName": "opmerkingen", "required":false,"resultsArray":false},
    "person-contactvoorkeur": {"listName": "contactVoorkeur", "required":false,"resultsArray":false},
    "person-nieuwevrijwilliger": {"listName": "ContractMailSturen","required": false, "resultsArray": false}

};



$(document).ready(function () {

    // Init the partners pages
    initSection("vrijwilligers-page","Vrijwilligers & Deelnemers");


    $("body").on("change keyup",".filter-vrij",function (e) {

        e.preventDefault();

        if(XeApp.Vrijwilligers.loadOnStart === false){
            return;
        }

        XeApp.Vrijwilligers.loadFromFilters();

    });


    /**
     * Open a single person window
     */
    $("body").on("click",".openPerson",function (e) {

        e.preventDefault();

        let theId = $(this).data("id");

        console.log($(this).data("id"));

        // Load the geslacht items
        XeApp.Lib.loadListItemsInSelect("lijstVrijwilligers","contactVoorkeur","person-contactvoorkeur");



        XeApp.Vrijwilligers.loadSingleVrijwilliger(theId);

    });

    /**
     * Single vrijwilliger menu
     */
    $("body").on("click","#singleVrijwilliger li a:not('.edit-activiteit,.open-bijlage')",function (e) {

        e.preventDefault();

        // Add and remove class
        $("#singleVrijwilliger .tabs ul li a").parent().removeClass("is-active");
        $(this).parent().addClass("is-active");

        let id = $(this).attr("href");

        // show & hide content :)
        $("#singleVrijwilliger .tab-content").hide();
        $(id).show();

    });

    $("body").on("click","#addNewVrijwilliger",function(e){

        e.preventDefault();
        // Load the geslacht items
        XeApp.Lib.loadListItemsInSelect("lijstVrijwilligers","contactVoorkeur","person-contactvoorkeur");

        XeApp.Vrijwilligers.loadSingleVrijwilliger();

    });

    // Search by name
    $("body").on("keyup","#vrijwilligers-filter-search",function (e) {
        e.preventDefault();
    })



    // Update a vrijwilliger
    $(document).on("click","#updateVrijwilligerButton",function (e) {
        e.preventDefault();
        let formData = XeApp.Lib.loadFormData(ArrayOfVrijwilligersData);

        XeApp.Vrijwilligers.updateVrijwilliger(formData);
    });

    // Create a doorverwijzing
    $(document).on("click","#doorverwijzingVrijwilligerButton",function (e) {
        e.preventDefault();


        let formData = {};
        formData["datum"] = $("#dv-datum").val();
        formData["organisatieId"] = $("#dv-organisatie").val();
        formData["Title"] = $("#dv-omschrijving").val();
        formData["zin"] = $("#dv-zin").val();
        formData["partnerId"] = $("#dv-partner").val();
        formData["projectId"] = $("#dv-project").val();
        formData["locatieId"] = $("#dv-locatie").val();
        formData["doelgroepId"] = $("#dv-person").val();

        XeApp.Vrijwilligers.createNewDoorverwijzing(formData);

    });

    // Archive a vrijwilliger
    $(document).on("click","#archiveVrijwilligerButton",function (e) {
        e.preventDefault();

        let formData = {};

        formData["ArchiefReden"] = {};
        formData["ArchiefReden"]["results"] = $("#archive-vrijwilligers [name='archief-reden']").val();
        formData["Id"] = $("#archive-vrijwilligers [name='person-id']").val();
        formData["Einddatum"] = $("#archive-vrijwilligers [name='eind-datum']").val();
        formData["Archief"] = true;

        XeApp.Vrijwilligers.updateVrijwilliger(formData);
    });

    // DeArchive a vrijwilliger
    $(document).on("click","#activedVrijwilligerButton",function (e) {
        e.preventDefault();

        let formData = {};

        formData["ArchiefReden"] = {'results' : []};
        formData["Id"] = $(this).data("id");
        formData["Einddatum"] = null;
        formData["Archief"] = false;

        XeApp.Vrijwilligers.updateVrijwilliger(formData);
    });


    $('form input').on("keydown",function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            return false;
        }
    });


    /**
     * Check all vrijwilligers
     */
    $("body").on("change","#check-all-vrijwilligers",function(){

        if ($(this).is(':checked')) {
            // Check all checkboxes from partners
            $(".vrijwilliger-checkbox").prop('checked', true);
            $(".vrijwilliger-checkbox:checked:first").trigger('change');
            $("#vrijwilligers-checkbox-function").show();
        }else{
            $(".vrijwilliger-checkbox").prop('checked', false);
            $("#vrijwilligers-checkbox-function").hide();
        }

    });

    /**
     * Check if a checkbox is checked
     */
    $("body").on("change",".vrijwilliger-checkbox",function(){

        if ($('.vrijwilliger-checkbox:checked').length > 0) {
            $("#vrijwilligers-checkbox-function").show();

            let mailto = "mailto:?bcc=";
            let smsto = "sms:";

            $('.vrijwilliger-checkbox:checked').each(function( index ) {
                // Add mails
                let email = $(this).data("mail");
                let phone = $(this).data("phone");

                // Email
                if(typeof email !== "undefined") {
                    email = email.replace(/\s/g, "");
                    email = email.replace(/"/g, "");

                    if(email !== '') {
                    mailto = mailto + email + ';';
                    }
                }

                // Sms
                if(typeof phone !== "undefined") {
                    phone = phone.replace(/\s/g, "");
                    phone = phone.replace(/"/g, "");

                    if(phone !== '') {
                        smsto = smsto + phone + ',';
                    }
                }


            });

            $("#bulkSmsVrijwilligers").attr("href",smsto);
            $("#bulkMailVrijwilligers").attr("href",mailto);

        }else{
            $("#vrijwillgers-checkbox-function").hide();
        }

    });

    /**
     * Delete a doorverwijzing
     */
    $("body").on("click",".deleteDoorverwijzing",function(){

        let id = $(this).data("id");

        XeApp.Vrijwilligers.deleteDoorverwijzing(id);

    });

});





XeApp.Vrijwilligers = {

    loadOnStart: false,
    initialized: false, // Is the app loaded or not?
    currentVrijwilligerId: false,
    currentVrijwillgersName: '',
    /**
     * Load vrijwilligers
     */
    load: function() {

        $(".loadingOverflow").show().html("Laden...");

        // Is this part already loaded?
        if(XeApp.Vrijwilligers.initialized === false) {

            let startLoadingAppPage = new Promise(function (resolve, reject) {

                if ($("#vrijwilligers-page div").length > 0) { // element already exists
                    resolve();
                } else {

                    $("#vrijwilligers-page").load(cdnUrl + "html/vrijwilligers.html", function () {
                        resolve();
                    });
                }

            });


            // Start loading the app
            startLoadingAppPage.then(function () {

                // Load the vue
                XeApp.Vrijwilligers.VueData = new Vue(
                    {
                        el: "#vrijwilligers-page",
                        data: {
                            items: {},
                            person: { },
                            events: {},
                            doorverwijzingen: {},
                            bijlagen: {},
                            amountOfPersons: 0
                        },
                        computed: {
                            recordViewEntries() {
                                return this.items;
                            },
                        },
                    }
                );

                // Load select 2
                $(".select2").select2({width: '100%', closeOnSelect: true}); //


                // Contact SAS
                loadFilterData([{
                    listName: 'inDienst',
                    selectId: '#vrijwilligers-filter-contact',
                    listCols: ['contactSASId', 'voornaam', 'achternaam'],
                    nameValue: ['voornaam', 'achternaam'],
                    idName: 'contactSASId',
                    OrderBy: 'voornaam',
                    LoadAll: true
                }]).then(function () {

                    // Load filters
                    loadFilterData([{
                        listName: 'lijstLocaties',
                        selectId: '#vrijwilligers-filter-locatie',
                        listCols: ['Id', 'TitelLang'],
                        nameValue: 'TitelLang',
                        OrderBy: 'TitelLang',
                        LoadAll: true
                    }]).then(function () {

                        // lijst projecten
                        loadFilterData([{
                            listName: 'lijstProjecten',
                            selectId: '#vrijwilligers-filter-project',
                            listCols: ['Id', 'TitelLang'],
                            nameValue: 'TitelLang',
                            idName: 'Id',
                            OrderBy: 'TitelLang',
                            LoadAll: true
                        }]).then(function () {

                            $("#vrijwilligers-filter-locatie").val(currentUser.locatieId.results[0]).trigger('change');
                            $("#vrijwilligers-filter-contact").val(currentUser.contactSASId).trigger('change');
                            // Enable loading data :)
                            XeApp.Vrijwilligers.loadOnStart = true;
                            $("#vrijwilligers-filter-project").val(currentUser.projectId.results[0]).trigger('change');

                        });

                    });


                });


                // App part is loaded
                XeApp.Vrijwilligers.initialized = true;

            });

        }else{
            $(".loadingOverflow").hide();
        }


    },

    updateVrijwilliger: function(data){

        // If no id is set, create new
        if(data["Id"] === null){
            XeApp.Vrijwilligers.createNewVrijwilliger(data);
            return;
        }

        $(".loadingOverflow").show().html("Opslaan..");

        sprLib.list("lijstVrijwilligers").update(data).then(function (objItem) {

            Swal.fire({
                title: 'Gelukt!',
                text: 'Persoon succesvol aangepast!',
                type: 'success',
                confirmButtonText: 'Ok'
            });

            // Reload the vrijwilliger data
            XeApp.Vrijwilligers.loadSingleVrijwilliger(data["Id"],false);
            // Reload the vrijwilligers overview :)
            XeApp.Vrijwilligers.loadFromFilters();

            $(".loadingOverflow").hide();

        }).catch(function (strErr) {

            Swal.fire({
                title: 'Oeps...',
                text: 'Oeps er ging iets technisch mis, probeer het opnieuw! '+strErr,
                type: 'error',
                confirmButtonText: 'Ok'
            });
            $(".loadingOverflow").hide();
            console.error(strErr);

        });
    },

    createNewVrijwilliger: function(data){

        delete data["Id"];

        $(".loadingOverflow").show().html("Opslaan..");

        sprLib.list("lijstVrijwilligers").create(data).then(function (objItem) {

            Swal.fire({
                title: 'Gelukt!',
                text: 'Persoon succesvol aangemaakt!',
                type: 'success',
                confirmButtonText: 'Ok'
            });

            // Reload the vrijwilliger data
            XeApp.Vrijwilligers.loadSingleVrijwilliger(objItem["Id"],false);
            // Reload the vrijwilligers overview :)
            XeApp.Vrijwilligers.loadFromFilters();

            XeApp.Vrijwilligers.closeSingleVrijwillger();

            $(".loadingOverflow").hide();

        }).catch(function (strErr) {

            Swal.fire({
                title: 'Oeps...',
                text: 'Oeps er ging iets technisch mis, probeer het opnieuw! '+strErr,
                type: 'error',
                confirmButtonText: 'Ok'
            });
            $(".loadingOverflow").hide();
            console.error(strErr);

        });

    },

    loadSingleVrijwilliger: function(theId = 0, showFirst = true){

        $(".loadingOverflow").show().html("Laden...");
        // Hide the list
        $("#vrijwilligers-overview,.appFilters").hide();

        XeApp.Vrijwilligers.VueData.person = {};
        XeApp.Vrijwilligers.VueData.bijlagen = {};

        if(theId > 0) {

            let filters = {};
            filters["Id"] = theId;
            XeApp.Vrijwilligers.currentVrijwilligerId = theId;
            filters = setupFilterData(filters);

            sprLib.list('lijstVrijwilligers').items({queryFilter: filters}).then(function (data) {

                // Set current name
                XeApp.Vrijwilligers.currentVrijwillgersName = data[0]["VolledigeNaam"];

                // Load profile pic
                if (data[0]["profielfotoId"] !== null) {

                    let filters = "Id eq " + data[0]["profielfotoId"];

                    sprLib.list('profielfotos').items({
                        listCols: 'File/ServerRelativeUrl',
                        queryFilter: filters
                    }).then(function (profielfoto) {

                        if(profielfoto[0]) {
                            data[0]["profielfoto"] = profielfoto[0].File.ServerRelativeUrl;
                        }
                        XeApp.Vrijwilligers.VueData.person = data[0];

                    });

                } else {
                    XeApp.Vrijwilligers.VueData.person = data[0];
                }

                /**
                 * Get user attachements
                 */
                sprLib.rest({
                    url:          '_api/Web/Lists(guid\'90c63ac5-a14e-471d-aea4-58283339c683\')/Items('+theId+')/AttachmentFiles',
                }).then(function(attachementResult){


                    if(attachementResult.length > 0){
                        XeApp.Vrijwilligers.VueData.bijlagen = attachementResult;
                        console.table(XeApp.Vrijwilligers.VueData.bijlagen);
                    }else{
                        // No files
                    }

                });

                /**
                 * Set today as archive date
                 */
                $("#archive-vrijwilligers input[name='eind-datum']").val(today);

                // Show the single
                $("#singleVrijwilliger").show();

                if (showFirst === true) {

                    $("#singleVrijwilliger .tabs ul li a").parent().removeClass("is-active").show();
                    $("#singleVrijwilliger .tabs ul li:first-child a").parent().addClass("is-active");

                    $("#singleVrijwilliger .tab-content:first").show();
                }

                // Contact SAS
                loadFilterData([{
                    listName: 'inDienst',
                    selectId: '#person-contact',
                    listCols: ['contactSASId', 'voornaam', 'achternaam'],
                    nameValue: ['voornaam', 'achternaam'],
                    idName: 'contactSASId',
                    OrderBy: 'voornaam'
                }]).then(function () {

                    // set person contact :)
                    $("#person-contact").val(data[0].contactSASId).trigger("change");

                });

                // Load location
                loadFilterData([{
                    listName: 'lijstLocaties',
                    selectId: '#person-locatie',
                    listCols: ['Id', 'TitelLang'],
                    nameValue: 'TitelLang',
                    OrderBy: 'TitelLang'
                }]).then(function () {

                    $("#person-locatie").val(data[0].Locatie1Id.results[0]).trigger('change');

                });

                loadFilterData([{
                    listName: 'lijstProjecten',
                    selectId: '#person-project',
                    listCols: ['Id', 'TitelLang'],
                    nameValue: 'TitelLang',
                    idName: 'Id',
                    OrderBy: 'TitelLang'
                }]).then(function () {

                    $("#person-project").val(data[0].Project1Id.results[0]).trigger('change');

                });


                $(".loadingOverflow").hide();

            });
        }else{

            // Load location
            loadFilterData([{
                listName: 'lijstLocaties',
                selectId: '#person-locatie',
                listCols: ['Id', 'TitelLang'],
                nameValue: 'TitelLang',
                OrderBy: 'TitelLang'
            }]).then(function () {


                $("#person-locatie").val(currentUser.locatieId.results[0]).trigger('change');

            });

            /** Load projects */
            loadFilterData([{
                listName: 'lijstProjecten',
                selectId: '#person-project',
                listCols: ['Id', 'TitelLang'],
                nameValue: 'TitelLang',
                idName: 'Id',
                OrderBy: 'TitelLang'
            }]).then(function () {

                $("#person-project").val(currentUser.projectId.results[0]).trigger('change');

            });

            // Contact SAS
            loadFilterData([{
                listName: 'inDienst',
                selectId: '#person-contact',
                listCols: ['contactSASId', 'voornaam', 'achternaam'],
                nameValue: ['voornaam', 'achternaam'],
                idName: 'contactSASId',
                OrderBy: 'voornaam'
            }]).then(function () {

                // Adding new user
                // Show the single
                $("#singleVrijwilliger").show();

                XeApp.Vrijwilligers.VueData.person = {VolledigeNaam: "Nieuwe deelnemer/vrijwilliger toevoegen", statuut:"deelnemer"};

                $("#singleVrijwilliger .tabs ul li a").parent().removeClass("is-active").hide();
                $("#singleVrijwilliger .tabs ul li:nth-child(5) a").parent().addClass("is-active").show();
                $("#singleVrijwilliger .tabs ul li:nth-child(7)").show();

                $("#singleVrijwilliger .tab-content:nth-child(7)").show();
                $(".loadingOverflow").hide();

                // set person contact :)
                $("#person-contact").val(currentUser.contactSASId).trigger("change");

            });

        }


    },

    closeSingleVrijwillger: function(){

        // Hide the list
        $("#vrijwilligers-overview,.appFilters").show();
        // Show the single
        $("#singleVrijwilliger").hide();

    },

    loadSingleVrijwilligerEvents: function(){

        // Get the id
        let theId = XeApp.Vrijwilligers.VueData.person.Id;

        let oneYearFromNow = moment().subtract("1","year").toISOString();
        let date = "(datum ge datetime'"+oneYearFromNow+"')";
        let filters = "vrijwilligersId eq "+theId + " and "+date;


        // Load the partners
        sprLib.list('lijstMomenten').items({queryFilter: filters}).then(function (data) {


            // put inside the events object
            XeApp.Vrijwilligers.VueData.events = data;


        }).catch(function (error) {

            Swal.fire({
                title: 'Kon evenementen van persoon niet laden.',
                text: 'Evenementen konden niet worden geladen. Probeer het opnieuw.',
                type: 'error',
                confirmButtonText: 'Ok'
            });

        });

    },

    createNewDoorverwijzing: function(data){

        $(".loadingOverflow").show().html("Opslaan..");

        sprLib.list("doorverwijzingen").create(data).then(function (objItem) {

            Swal.fire({
                title: 'Gelukt!',
                text: 'Doorverwijzing succesvol aangemaakt!',
                type: 'success',
                confirmButtonText: 'Ok'
            });

            // Reload doorverwijzingen
            XeApp.Vrijwilligers.loadSingleVrijwilligerDoorverwijzingen();

            $(".loadingOverflow").hide();

        }).catch(function (strErr) {

            Swal.fire({
                title: 'Oeps...',
                text: 'Oeps er ging iets technisch mis, probeer het opnieuw! '+strErr,
                type: 'error',
                confirmButtonText: 'Ok'
            });
            $(".loadingOverflow").hide();
            console.error(strErr);

        });

    },

    loadSingleVrijwilligerDoorverwijzingen: function(){

        // Get the id
        let theId = XeApp.Vrijwilligers.VueData.person.Id;

        let oneYearFromNow = moment().subtract("1","year").toISOString();
        let date = "(datum ge datetime'"+oneYearFromNow+"')";
        let filters = "doelgroepId eq "+theId + " and "+date;


        // Load location
        loadFilterData([{
            listName: 'lijstLocaties',
            selectId: '#dv-locatie',
            listCols: ['Id', 'TitelLang'],
            nameValue: 'TitelLang',
            OrderBy: 'TitelLang'
        }]).then(function () {
            $("#dv-locatie").val(currentUser.locatieId.results[0]).trigger('change');
        });

        /** Load organisaties */
        loadFilterData([{
            listName: 'Organisaties',
            selectId: '#dv-organisatie',
            listCols: ['Id', 'Title'],
            nameValue: 'Title',
            OrderBy: 'Title',
            loadEmpty: true
        }]);

        /** Load organisaties */
        loadFilterData([{
            listName: 'Partners',
            selectId: '#dv-partner',
            listCols: ['Id', 'VolledigeNaam'],
            nameValue: 'VolledigeNaam',
            OrderBy: 'Title',
            loadEmpty: true
        }]);

        /** Load projects */
        loadFilterData([{
            listName: 'lijstProjecten',
            selectId: '#dv-project',
            listCols: ['Id', 'TitelLang'],
            nameValue: 'TitelLang',
            idName: 'Id',
            OrderBy: 'TitelLang'
        }]).then(function () {

            $("#dv-project").val(currentUser.projectId.results[0]).trigger('change');

        });

        XeApp.Lib.loadListItemsInSelect("doorverwijzingen","zin","dv-zin");


        // Load the partners
        sprLib.list('doorverwijzingen').items({
            listCols: ['Id','datum','organisatie/Title','partner/Title','project/TitelLang','zin','Title','locatie/TitelLang'],
            queryOrderby: 'datum',
            queryLimit: 5000,
            queryFilter: filters}).then(function (data) {


            // put inside the events object
            XeApp.Vrijwilligers.VueData.doorverwijzingen = data;


        }).catch(function (error) {

            Swal.fire({
                title: 'Kon doorverwijzingen van persoon niet laden.',
                text: 'Doorverwijzingen konden niet worden geladen. Probeer het opnieuw.',
                type: 'error',
                confirmButtonText: 'Ok'
            });

        });

    },

    /**
     * Load partners into vue
     */
    loadVrijwilligers: function(filters) {

        XeApp.Vrijwilligers.VueData.items = [{"VolledigeNaam" : "Laden..."}];
        XeApp.Vrijwilligers.VueData.items = {};

        // Setup filter data
        filters = setupFilterData(filters);

        // Load the partners
        sprLib.list('lijstVrijwilligers').items({queryFilter: filters,queryLimit: 10000, queryOrderby: 'Title'}).then(function (data) {

            XeApp.Vrijwilligers.VueData.amountOfPersons = data.length;

            for(i = 0; i < data.length; i++){

                let now = moment();
                var birthDay = moment(data[i]["Geboortedatum"]).year(now.year());
                var birthDayNextYear = moment(data[i]["Geboortedatum"]).year(now.year() + 1);
                var daysRemaining = Math.min(Math.abs(birthDay.diff(now, 'days')), Math.abs(birthDayNextYear.diff(now, 'days')));

                // Check if users birthday is within 14 days
                if((daysRemaining >= 0) && (daysRemaining <= 14)) {
                    data[i]["jarig"] = true;
                    data[i]["daysBirthday"] = daysRemaining;
                }else{
                    data[i]["jarig"] = false;
                }
            }


            // Partners items
            XeApp.Vrijwilligers.VueData.items = data;

            $(".loadingOverflow").hide();


        }).catch(function (error) {

            console.log(error);

            Swal.fire({
                title: 'Kon vrijwilligers niet laden.',
                text: 'Vrijwilligers konden niet worden geladen. Probeer het opnieuw.',
                type: 'error',
                confirmButtonText: 'Ok'
            });

            $(".loadingOverflow").hide();

        });

    },


    /**
     * Load data based on filters :)
      */
    loadFromFilters: function () {

        let filters = {};

        filters["Locatie1Id"] = $("#vrijwilligers-filter-locatie").val();
        filters["Project1Id"] = $("#vrijwilligers-filter-project").val();

        if($("#vrijwilligers-filter-statuut").val() != '') {
            filters["statuut"] = $("#vrijwilligers-filter-statuut").val();
        }

        filters["contactSASId"] = $("#vrijwilligers-filter-contact").val();

        // Search filter
        let search = $("#vrijwilligers-filter-search").val();

        if(search !== '') {
            filters["VolledigeNaam"] = [];
            filters["VolledigeNaam"]["custom"] = "substringof('" + search + "',Title) or substringof('" + search + "',Achternaam)";
        }

        /**
         * Filter the archive
         * @type {jQuery}
         */

        if (!$('#vrijwilliger-filter-archief').is(":checked")){
            filters["Archief"] = {};
            filters["Archief"]["custom"] = "Archief eq false";
        }

        // Load the vrijwilligers
        XeApp.Vrijwilligers.loadVrijwilligers(filters);

    },

    /**
     * Init vrijwilliger Archive Function
     */
    loadArchiveVrijwilliger: function(){

        XeApp.Lib.loadListItemsInSelect("lijstVrijwilligers","ArchiefReden","archief-reden");

    },

    /**
     * Delete the give doorverwijzing
     */
    deleteDoorverwijzing: function(id){

        $(".loadingOverflow").show();

        sprLib.list('doorverwijzingen').delete({ "ID": id })
            .then(function (intId) {

                // Reload doorverwijzingen
                XeApp.Vrijwilligers.loadSingleVrijwilligerDoorverwijzingen();

                $(".loadingOverflow").hide();

                Swal.fire({
                    title: 'Gelukt!',
                    text: 'Doorverwijzing succesvol verwijderd. ',
                    type: 'success',
                    confirmButtonText: 'Ok'
                });


            })
            .catch(function (strErr) { alert(strErr); });

    }


}