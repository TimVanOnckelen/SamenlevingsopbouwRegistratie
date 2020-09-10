if (typeof (XeApp) == "undefined") { XeApp = {}; }
let partnersApp;

const ArrayOfPartnerData = {
    "partner-voornaam": { "listName" : "Title","required" : true,"resultsArray" : false},
    "partner-achternaam": { "listName": "Achternaam", "required": true,"resultsArray" : false },
    "partner-telefoon": { "listName": "Telefoon", "required": false,"resultsArray" : false },
    "partner-mail": { "listName": "Mailadres", "required": false,"resultsArray" : false },
    "partner-organisatie": {"listName": "OrganisatieId", "required": true, "resultsArray": false},
    "partner-contact": {"listName": "ContactSASId", "required": true, "resultsArray": false},
    "partner-id": { "listName": "Id", "required": true,"resultsArray" : false }
};


$(document).ready(function () {


        // Init the partners pages
        initSection("partners-page", "Partners");


    $("body").on("click","#addNewPartner",function(e){

        e.preventDefault();

        XeApp.Partners.loadSinglePartner();

    });

    $("body").on("click","#addNewOrganisation",function(e){

        e.preventDefault();

        Swal.fire({
            title: 'Organisatie toevoegen',
            html: 'Je kan zelf geen nieuwe organisaties toevoegen. Wil je een nieuwe organisatie laten toevoegen? Mail dan naar <a href="mailto:secretariaatsas@samenlevingsopbouw.be">secretariaatsas@samenlevingsopbouw.be</a>',
            type: 'info',
            confirmButtonText: 'Ok'
        });

    });

    // Update a partner
    $(document).on("click","#updatePartnerButton",function (e) {
        e.preventDefault();
        let formData = XeApp.Lib.loadFormData(ArrayOfPartnerData);
        XeApp.Partners.updatePartner(formData);
    });


    $("body").on("change keyup",".filter-partners",function (e) {

        e.preventDefault();

        if(XeApp.Partners.loadOnStart === false){
            return;
        }

        XeApp.Partners.loadFromFilters();

    });

    /**
     * Open a single person window
     */
    $("body").on("click",".openPartner",function (e) {

        e.preventDefault();

        let theId = $(this).data("id");


        // Load the geslacht items
        XeApp.Lib.loadListItemsInSelect("lijstVrijwilligers","Geslacht","person-geslacht");

        XeApp.Partners.loadSinglePartner(theId);

    });

    /**
     * Single vrijwilliger menu
     */
    $("body").on("click","#singlePartner li a:not('.edit-activiteit')",function (e) {

        e.preventDefault();

        // Add and remove class
        $("#singlePartner .tabs ul li a").parent().removeClass("is-active");
        $(this).parent().addClass("is-active");

        let id = $(this).attr("href");

        // show & hide content :)
        $("#singlePartner .tab-content").hide();
        $(id).show();

    });

    /**
     * Check all partners
     */
    $("body").on("change","#check-all-partners",function(){

        if ($(this).is(':checked')) {
            // Check all checkboxes from partners
            $(".partner-checkbox").prop('checked', true);
            $(".partner-checkbox:checked:first").trigger('change');
            $("#partner-checkbox-function").show();
        }else{
            $(".partner-checkbox").prop('checked', false);
            $("#partner-checkbox-function").hide();
        }

    });

    /**
     * Check if a checkbox is checked
     */
    $("body").on("change",".partner-checkbox",function(){

        if ($('.partner-checkbox:checked').length > 0) {
            $("#partner-checkbox-function").show();

            let mailto = "mailto:?bcc=";
            let smsto = "sms:";

            $('.partner-checkbox:checked').each(function( index ) {
                // Add mails
               let email = $(this).data("mail");
                let phone = $(this).data("phone");

                // Email
               if(typeof email !== "undefined") {
                   email = email.replace(/\s/g, "");
                   email = email.replace(/"/g, "");

                   mailto = mailto + email + ';';
               }

               // Sms
                if(typeof phone !== "undefined") {
                    phone = phone.replace(/\s/g, "");
                    phone = phone.replace(/"/g, "");

                    smsto = smsto + phone + ',';
                }


            });

            $("#bulkSmsPartners").attr("href",smsto);
            $("#bulkMailPartners").attr("href",mailto);

        }else{
            $("#partner-checkbox-function").hide();
        }

    });

});

XeApp.Partners =
{
    currentPartnerId: 0,
    loadOnStart: false,

    load: function() {

        if(XeApp.Partners.loadOnStart === false) {
            let startLoadingAppPage = new Promise(function (resolve, reject) {

                if ($("#partners-page div").length > 0) { // element already exists
                    resolve();
                } else {

                    $("#partners-page").load(cdnUrl + "html/partners.html", function () {
                        resolve();
                    });
                }

            });

            // Start loading the app
            startLoadingAppPage.then(function () {


                // Load the vue
                partnersApp = new Vue(
                    {
                        el: "#partners-page",
                        data: {
                            items: {},
                            person: {
                                Organisatie: {},
                                ContactSAS: {}
                            }
                        },
                        computed: {
                            recordViewEntries() {
                                return this.items;
                            },
                        },
                    }
                );

                // Load filters
                loadFilterData([{
                    listName: 'Organisaties',
                    selectId: '#partners-filter-organisatie',
                    listCols: ['Id', 'Title'],
                    nameValue: 'Title',
                    OrderBy: 'Title',
                    LoadAll: true
                }]);

                // Load filters
                loadFilterData([{
                    listName: 'inDienst',
                    selectId: '#partners-filter-contact',
                    listCols: ['contactSASId', 'voornaam', 'achternaam'],
                    nameValue: ['voornaam', 'achternaam'],
                    idName: 'contactSASId',
                    OrderBy: 'voornaam',
                    LoadAll: true
                }]);

                // Load the partners
                XeApp.Partners.loadPartners();

                // Load select 2
                $(".select2").select2({width: '100%', closeOnSelect: true}); //

            });

        }

    },

    loadOrganisations: function(){

    },

    /**
     * Load partners into vue
     */
    loadPartners: function(filters = {}) {

        // Setup filter data
        filters = setupFilterData(filters);

        partnersApp.items = {};

        // Load the partners
        sprLib.list('Partners').items({
            listCols: ['Id','VolledigeNaam','Organisatie/Title','Telefoon','Mailadres'],
            queryOrderby: 'Title',
            queryLimit: 5000,
            queryFilter: filters
        }).then(function (data) {

            console.log(data);

            // Partners items
            partnersApp.items = data;

            XeApp.Partners.loadOnStart = true;


        }).catch(function (error) {

            Swal.fire({
                title: 'Kon partners niet laden.',
                text: 'Partners konden niet worden geladen. Probeer het opnieuw.',
                type: 'error',
                confirmButtonText: 'Ok'
            });

        });

    },

    loadSinglePartner: function(theId = 0, showFirst = true){

        $(".loadingOverflow").show().html("Laden...");
        // Hide the list
        $("#partners-overview,.appFilters").hide();

        // clear person
        partnersApp.person = {
            Organisatie: {},
            ContactSAS: {}
        };

        if(theId > 0) {

            let filters = {};
            filters["Id"] = theId;
            XeApp.Partners.currentPartnerId = theId;
            filters = setupFilterData(filters);

            sprLib.list('Partners').items({listCols: ['Id','VolledigeNaam','Title','Achternaam','OrganisatieId','Organisatie/Title','Telefoon','Mailadres','ContactSAS/Title','ContactSASId'],queryFilter: filters}).then(function (data) {

                // Get the data
                partnersApp.person = data[0];

                // Show the single
                $("#singlePartner").show();

                if (showFirst === true) {

                    $("#singlePartner .tabs ul li a").parent().removeClass("is-active").show();
                    $("#singlePartner .tabs ul li:first-child a").parent().addClass("is-active");

                    $("#singlePartner .tab-content:first").show();
                }

                // Contact SAS
                loadFilterData([{
                    listName: 'inDienst',
                    selectId: '#partner-contact',
                    listCols: ['contactSASId', 'voornaam', 'achternaam'],
                    nameValue: ['voornaam', 'achternaam'],
                    idName: 'contactSASId',
                    OrderBy: 'voornaam'
                }]).then(function () {

                    // set person contact :)
                    $("#partner-contact").val(data[0].ContactSASId).trigger("change");

                });

                // Organisatie SAS
                loadFilterData([{
                    listName: 'Organisaties',
                    selectId: '#partner-organisatie',
                    listCols: ['Id', 'Title'],
                    nameValue: 'Title',
                    OrderBy: 'Title',
                    loadEmpty: true
                }]).then(function () {

                    // set person contact :)
                    $("#partner-organisatie").val(data[0].OrganisatieId).trigger("change");

                });

                $(".loadingOverflow").hide();

            });
        }else{

            // Organisatie SAS
            loadFilterData([{
                listName: 'Organisaties',
                selectId: '#partner-organisatie',
                listCols: ['Id', 'Title'],
                nameValue: 'Title',
                OrderBy: 'Title',
                loadEmpty: true
            }]).then(function () {


            });

            // Contact SAS
            loadFilterData([{
                listName: 'inDienst',
                selectId: '#partner-contact',
                listCols: ['contactSASId', 'voornaam', 'achternaam'],
                nameValue: ['voornaam', 'achternaam'],
                idName: 'contactSASId',
                OrderBy: 'voornaam'
            }]).then(function () {

                // Adding new user
                // Show the single
                $("#singlePartner").show();

                partnersApp.person = {
                    VolledigeNaam: "Nieuwe partner aanmaken",
                    Organisatie: {},
                    ContactSAS: {}
                };

                $("#singlePartner .tab-content").hide();
                $("#singlePartner .tabs ul li a").parent().removeClass("is-active").hide();
                $("#singlePartner .tabs ul li:nth-child(2) a").parent().addClass("is-active").show();
                $("#singlePartner .tabs ul li:nth-child(3)").show();

                $(".loadingOverflow").hide();

                // Trigger the content
                $("#singlePartner .tabs ul li:nth-child(2) a").click();

                // set person contact :)
                $("#partner-contact").val(currentUser.contactSASId).trigger("change");

            });

        }


    },

    closeSinglePartner: function(){

        // Hide the list
        $("#partners-overview,.appFilters").show();
        // Show the single
        $("#singlePartner").hide();

    },

    /**
     * Load data based on filters :)
     */
    loadFromFilters: function () {

        let filters = {};

        filters["OrganisatieId"] = $("#partners-filter-organisatie").val();

        filters["ContactSASId"] = $("#partners-filter-contact").val();

        // Search filter
        let search = $("#partners-filter-search").val();

        if(search !== '') {
            filters["VolledigeNaam"] = [];
            filters["VolledigeNaam"]["custom"] = "substringof('" + search + "',Title) or substringof('" + search + "',Achternaam)";
        }

        // Load the vrijwilligers
        XeApp.Partners.loadPartners(filters);

    },

    updatePartner: function(data){

        // If no id is set, create new
        if(data["Id"] === null){
            XeApp.Partners.createNewPartner(data);
            return;
        }

        $(".loadingOverflow").show().html("Opslaan..");

        sprLib.list("Partners").update(data).then(function (objItem) {

            Swal.fire({
                title: 'Gelukt!',
                text: 'Persoon succesvol aangepast!',
                type: 'success',
                confirmButtonText: 'Ok'
            });

            // Reload the vrijwilliger data
            XeApp.Partners.loadSinglePartner(data["Id"],false);
            // Reload the vrijwilligers overview :)
            XeApp.Partners.loadFromFilters();

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

    createNewPartner: function(data){

        delete data["Id"];

        $(".loadingOverflow").show().html("Opslaan..");

        sprLib.list("Partners").create(data).then(function (objItem) {

            Swal.fire({
                title: 'Gelukt!',
                text: 'Persoon succesvol aangemaakt!',
                type: 'success',
                confirmButtonText: 'Ok'
            });

            // Reload the vrijwilliger data
            XeApp.Partners.loadSinglePartner(objItem["Id"],false);
            // Reload the vrijwilligers overview :)
            XeApp.Partners.loadFromFilters();

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

}