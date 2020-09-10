/**
 * Init a new section
 * @param id
 * @param name
 */
function initSection(id,name) {

    // Load this part
    $(".navbar-start").append('<a class="navbar-item" href="#'+id+'">'+name+'</a>');
    $("#registratie-app-container").append('<div id="'+id+'" class="appPage"></div>');

}

/**
 *
 * @param filterParameters
 */
function loadFilterData(filterParameters = []) {

    return new Promise(function (resolve,error) {

        // Load filters into option set
        filterParameters.forEach(function(item,index){

            let listName = item.listName;
            let idName = "Id";
            let orderBy = "Id";

            if(item.idName !== undefined){
                idName = item.idName;
            }

            if(item.OrderBy !== undefined){
                orderBy = item.OrderBy;
            }


            sprLib.list(listName).items({queryLimit:1000,listCols:item.listCols,queryOrderby:orderBy}).then(function (data) {

                // Clear the select :)
                $(item.selectId).find('option').remove();


                // Add an empty "all" filter
                if(item.LoadAll !== undefined){
                    $(item.selectId).append('<option value="">Alle</option>');
                }

                // Empty option
                if(item.loadEmpty !== undefined){
                    $(item.selectId).append('<option value=""></option>');
                }

                data.forEach(function (listItem,index) {

                    // The name
                    let name = listItem[item.nameValue];

                    // If is array, loop over multiple fields
                    if(Array.isArray(item.nameValue)){

                        // Reset name
                        name = "";

                        item.nameValue.forEach(function (theItem,index) {

                            name += listItem[theItem]+' ';

                        });

                    }

                    if(name != null) {
                        // Append the item
                        $(item.selectId).append('<option value="' + listItem[idName] + '">' + name + '</option>')
                    }
                });

                resolve();

            });

        });

    });


}

/**
 * Create filter data from object
 * @param data
 */
function setupFilterData(data) {

    let filterData = '';
    let count = 0;

    if(data !== undefined) {
        const filters = Object.keys(data);

        for (const id of filters) {

            if (data[id] !== '' && data[id] !== undefined) {

                // Add and if not first in row
                if (count > 0) {
                    filterData += " and ";
                }

                if(data[id]["custom"] !== '' && data[id]["custom"] != undefined){
                    filterData += "(" + data[id]["custom"] + ")";
                }else{
                    filterData += "(" + id + " eq '" + data[id] + "')";
                }



                count++;
            }
        }
    }

    return filterData;
}

if (typeof (XeApp) == "undefined") { XeApp = {}; }

XeApp.Lib = {

    /**
     * Load all data from form into an array
     * */
    loadFormData: function(ArrayOfData) {

    var arrayOfReturn = {};

    for (var key in ArrayOfData) {

        // Get the value
        var theValue = $("#" + key).val();


        // Get name of field in list
        var theNameInList = ArrayOfData[key]["listName"];

        if (key == 'person-geboortedatum') {
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
                if(theValue === '' || theValue === null){
                    // Do not set
                    theValue = null;
                }else{
                    // Add to return array as multiple results
                    arrayOfReturn[theNameInList] = {};
                    arrayOfReturn[theNameInList]["results"] = [];
                    arrayOfReturn[theNameInList]["results"].push(theValue);

                }
            }else{

                // Set to null to fix exceptions
                if(theValue === ''){
                    theValue = null;
                }

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

},

    /**
     * Load a list of choise values into a select
     * @param listName
     * @param listColumn
     * @param ElementId
     */
    loadListItemsInSelect: function (listName,listColumn,ElementId) {

        // Clear select
        $("#"+ElementId).html('');

        sprLib.list(listName).cols().then(function(arrayResults){
            for (var key in arrayResults) {
                let name = arrayResults[key]["dispName"];

                if(name === listColumn){

                    let choiceItems = arrayResults[key]["choiceValues"];
                    for(key in choiceItems){
                        $("#"+ElementId).append(new Option(choiceItems[key], choiceItems[key]));
                    }
                }
            }
        });
    }


}

