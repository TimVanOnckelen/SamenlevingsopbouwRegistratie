window.addEventListener("load", function(event) {
    // Format date for user
    Vue.filter('formatDate', function (value) {
        let theValue = moment(value).format('DD-MM-YY');
        return theValue;
    });
    // Format the date for a date input field
    Vue.filter('formatDateInput', function (value) {
        let theValue = moment(value).format('YYYY-MM-DD');
        return theValue;
    });
});

