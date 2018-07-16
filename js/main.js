//function calls
$(document).ready(function() {
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                  //
    //                                                                                                  //
    //                                    Button Functions                                              //
    //                                                                                                  //
    //                                                                                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ///TOGGLE THE FORECAST
    $('#more').click(function() {
        $('.forecast-container').slideToggle(850);
        $('.forecast-container').css({
            'display': 'block'
        });
        $('#more i').toggleClass('wi-rotate-180');
        console.log('Show Forecast');
    });
    //Locate button
    $('#locate').click(function() {
        console.log('Location clicked by user');
        $('#searchTerm').val(''); //clear search term if there is one.
        $('h3, .main, .sub, .forcastSub').fadeOut('fast');
        testDevice(); ////invoke fetch
        $('h3, .main, .sub, .forcastSub').fadeIn('slow');
        $('#warning').css({
            'display': 'none'
        });
    });
    //go button search
    $('#search').click(function() {
        var term = $('#searchTerm').val();
        console.log('Search for ' + term + ' clicked');
        $('#warning').css({
            'display': 'none'
        });
        if (term !== '') {
            $('h3, .main, .sub, .forcastSub').fadeOut('fast');
            fetch(); //go straight to fetch
            $('h3, .main, .sub, .forcastSub').fadeIn('slow');
        }
    });
    //enter/return key search
    $('#searchTerm').keyup(function(event) {
        var term = $('#searchTerm').val();

        $('#warning').css({
            'display': 'none'
        });
        if (event.keyCode == 13) {
            if (term !== '') {
                console.log('Search for ' + term + ' entered');
                $('h3, .main, .sub, .forcastSub').fadeOut('fast');
                fetch();
                $('h3, .main, .sub, .forcastSub').fadeIn('slow');
            }
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                  //
    //                                                                                                  //
    //                                    Get Data for pagefill Functions                               //
    //                                                                                                  //
    //                                                                                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //Location error handling - check which error, log the error and call weather api with IP address as an argument. warn user about accuracy.
    function geoError(error) {
        var warning = document.getElementById("warning");
        var jsonURL = "https://api.apixu.com/v1/forecast.json?key=ca0c16d6a3bf407d9cb223846161809&days=6&q=";
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.log("PERMISSION_DENIED - enable device location services or enable https://");
                $('#warning').css({
                    'display': 'block'
                });
                warning.innerHTML = "<i class='wi wi-small-craft-advisory fa-lg'></i><p>Sorry, we weren't allowed to get your location, so we took a wild guess instead. Make sure your using secure connection or use the search box.</p>";
                $.getJSON(jsonURL + "auto:ip", function(getByIPInstead) {
                    populate(getByIPInstead);
                });
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("POSITION_UNAVAILABLE");
                $('#warning').css({
                    'display': 'block'
                });
                warning.innerHTML = "<i class='wi wi-small-craft-advisory fa-lg'></i><p>Sorry, your position is unavailable for some reason, so we guessed it instead. Use the search box for more accurate results.</p>";
                $.getJSON(jsonURL + "auto:ip", function(getByIPInstead) {
                    populate(getByIPInstead);
                });
                break;
            case error.TIMEOUT:
                console.log("TIMEOUT");
                $('#warning').css({
                    'display': 'block'
                });
                warning.innerHTML = "<i class='wi wi-small-craft-advisory fa-lg'></i><p>Sorry, the location request timed out, so we guessed it instead. Use the search box for more accurate results.</p>";
                $.getJSON(jsonURL + "auto:ip", function(getByIPInstead) {
                    populate(getByIPInstead);
                });
                break;
            case error.UNKNOWN_ERROR:
                console.log("UNKOWN_ERROR");
                $('#warning').css({
                    'display': 'block'
                });
                warning.innerHTML = "<i class='wi wi-small-craft-advisory fa-lg'></i><p>Sorry, something weird happened so we guessed your location. Use the search box for more accurate results.</p>";
                $.getJSON(jsonURL + "auto:ip", function(getByIPInstead) {
                    populate(getByIPInstead);
                });
                break;
        }
    }

    //Get json data by search or location means and send for call page fill
    function fetch(location) {
        var jsonURL = "https://api.apixu.com/v1/forecast.json?key=ca0c16d6a3bf407d9cb223846161809&days=6&q=";
        var jsonSearchURL = "https://api.apixu.com/v1/forecast.json?key=ca0c16d6a3bf407d9cb223846161809&q=";
        var warning = document.getElementById("warning");
        var term = $('#searchTerm').val();
        if (term === '') {
            var lats = location.coords.latitude;
            var longs = location.coords.longitude;
            var accuracy = location.coords.accuracy;
            //build API key
            $.getJSON(jsonURL + lats + "," + longs, function(gotByGeo) {
                console.log('Location Found - Fetching Data');
                populate(gotByGeo);
            });
        } else {
            $.getJSON(jsonURL + term, function(gotBySearch) {
                //search error handling
                if (gotBySearch.hasOwnProperty('error')) {
                    console.log('Search for ' + term + ' unsuccessful');
                    warning.innerHTML = "<p>" + gotBySearch.error.message + "</p>";
                    $('#warning').css({
                        'display': 'block'
                    });
                } else {
                    console.log('Search for ' + term + ' successful. Loading Data');
                    populate(gotBySearch);
                }
            });
        }
    }
    //check location support, call functions or warn user
    function testDevice() {
        if (navigator.geolocation) {
            console.log('Location Requested');
            navigator.geolocation.getCurrentPosition(fetch, geoError);
        } else {
            var warning = document.getElementById("warning");
            console.log('Location unavailable. Either turn on location on your browser/device or ensure you are using https://');
            warning.innerHTML = "<i class='wi wi-small-craft-advisory fa-lg'></i><p>Sorry, Geolocation is not available on your device, so we guessed where you are instead. Use the search box for more accurate results.</p>";
        }
    }
    //doc ready call to test/invoke fetch & poulate
    testDevice();
}); //end ready

//////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                  //
//                                                                                                  //
//                                    POPULATE PAGE                                                 //
//                                                                                                  //
//                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////

///USE DATA FROM API REQUEST TO POPULATE PAGE

function populate(response) {
    console.log(response);
    console.log('Data recieved, Populating Page');
    //the following just to use custom icons :/
    //SELECT ICON BASED ON COVERTED TIME BOOLIAN///////////////////////////////////////////////////////
    var currentWeatherIcon = getIcon(response.current.condition.code, false);
    var currentWeatherIcon1 = getIcon(response.forecast.forecastday["0"].day.condition.code, true);
    var currentWeatherIcon2 = getIcon(response.forecast.forecastday[0].condition.code, true);
    var currentWeatherIcon3 = getIcon(response.forecast.forecastday[0].condition.code, false);
    var forecastWeatherIcon1 = getIcon(response.forecast.forecastday[1].day.condition.code, true);
    var forecastWeatherIcon2 = getIcon(response.forecast.forecastday[2].day.condition.code, true);
    var forecastWeatherIcon3 = getIcon(response.forecast.forecastday[3].day.condition.code, true);
    var forecastWeatherIcon4 = getIcon(response.forecast.forecastday[4].day.condition.code, true);
    var forecastWeatherIcon5 = getIcon(response.forecast.forecastday[5].day.condition.code, true);

    function getIcon(iconCode, forceDay) {
        var icon;
        switch (iconCode) {
            case 1000:
                //if it is daylight, or if the icon is for the forecast section forceday true, use day icon
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-day-sunny';
                } else {
                    icon = 'wi-stars';
                }
                break;
            case 1003:
            case 1006:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-day-cloudy';
                } else {
                    icon = 'wi-night-alt-cloudy';
                }
                break;
            case 1009:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-cloud';
                } else {
                    icon = 'wi-cloud';
                }
                break;
            case 1030:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-fog';
                } else {
                    icon = 'wi-night-fog';
                }
                break;
            case 1135:
            case 1147:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-fog';
                } else {
                    icon = 'wi-fog';
                }
                break;
            case 1063:
            case 1180:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-day-sprinkle';
                } else {
                    icon = 'wi-night-alt-sprinkle';
                }
                break;
            case 1150:
            case 1072:
            case 1153:
            case 1168:
            case 1171:
            case 1183:
            case 1240:
            case 1198:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-day-showers';
                } else {
                    icon = 'wi-night-alt-showers';
                }
                break;
            case 1201:
            case 1186:
            case 1189:
            case 1243:
            case 1246:
            case 1192:
            case 1195:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-day-rain';
                } else {
                    icon = 'wi-night-alt-rain';
                }
                break;
            case 1273:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-day-storm-showers';
                } else {
                    icon = 'wi-night-alt-storm-showers';
                }
                break;
            case 1087:
            case 1276:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-day-thunderstorm';
                } else {
                    icon = 'wi-night-alt-thunderstorm';
                }
                break;
            case 1204:
            case 1069:
            case 1207:
            case 1249:
            case 1252:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-day-sleet';
                } else {
                    icon = 'wi-night-alt-sleet';
                }
                break;
            case 1261:
            case 1264:
            case 1237:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-day-hail';
                } else {
                    icon = 'wi-night-alt-hail';
                }
                break;
            case 1255:
            case 1066:
            case 1114:
            case 1210:
            case 1213:
            case 1216:
            case 1258:
            case 1219:
            case 1222:
            case 1225:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-snow';
                } else {
                    icon = 'wi-night-alt-snow';
                }
                break;
            case 1279:
            case 1282:
                if (forceDay === true || (response.current.is_day === 1)) {
                    icon = 'wi-day-snow-thunderstorm';
                } else {
                    icon = 'wi-night-alt-snow-thunderstorm';
                }
                break;
        }
        return icon;

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                  //
    //                                                                                                  //
    //                                    WRITE TO PAGE                                                 //
    //                                                                                                  //
    //                                                                                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////////////

    //Populate current weather title//////////////////////////////////////////////////////////////////////////////////////
    $('.current-title').html("<h3>Currently in" + " " + response.location.name + ", " + response.location.region + "</h3>");
    //Populate Current weather panel//////////////////////////////////////////////////////////////////////
    $('.weather .upper .bottom').html(response.current.condition.text);
    $('.weather .upper .main').html('<i class="wi ' + currentWeatherIcon + '"></i>');
    $('.weather .sub1').html('8am' + '&nbsp;&nbsp;' + '<i class="wi ' + currentWeatherIcon1 + '"></i>');
    $('.weather .sub2').html('2pm' + '&nbsp;&nbsp;' + '<i class="wi ' + currentWeatherIcon2 + '"></i>');
    $('.weather .sub3').html('8pm' + '&nbsp;&nbsp;' + '<i class="wi ' + currentWeatherIcon3 + '"></i>');

    //Populate current date panel ////////////////////////////////////////////////////////////////////////
    //Call current date from browser, format and populate
    var dateObj = new Date();
    var monthNum = dateObj.getMonth();
    var day = dateObj.getDate();
    var hour = dateObj.getHours();
    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var d = dateObj.getDay();
    var forecastDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    console.log(dateObj);
    function getForecastDate(num){
      dateObj.setDate(dateObj.getDate() + num);
      monthNum = dateObj.getMonth();
      day = dateObj.getDate();
      hour = dateObj.getHours();
      d = dateObj.getDay();
    }
    console.log(dateObj);
    $('.date .top').html(forecastDay[d]);
    $('.date .day').html(day);
    $('.main .bottom').html(month[monthNum]);
    $('.date .sub1').html("<i class='wi wi-sunrise'></i>" + " " + response.forecast.forecastday[0].astro.sunrise);
    $('.date .sub2').html("<i class='wi wi-sunset'></i>" + " " + response.forecast.forecastday[0].astro.sunset);

    //CURRENT TEMPERATURE POPULATE
    $('.temp .main').html(Math.floor(response.current.temp_c) + '<span class="degs">&#176;C<span>');
    $('.temp .sub1').html("<i class='wi wi-direction-down'></i>" + " " + Math.floor(response.forecast.forecastday[0].day.mintemp_c) + "&#176;c");
    $('.temp .sub2').html("<i class='wi wi-direction-up'></i>" + " " + Math.floor(response.forecast.forecastday[0].day.maxtemp_c) + "&#176;c");
    //CURRENT WIND POPULATE, ROTATE ICON FOR WIND DIRECTION
    var direction = response.current.wind_dir;
    var icon_dir = {
        "N": 0,
        "NNE": 22,
        "NE": 45,
        "ENE": 67,
        "E": 90,
        "ESE": 112,
        "SE": 135,
        "SSE": 157,
        "S": 180,
        "SSW": 202,
        "SW": 225,
        "WSW": 247,
        "W": 270,
        "WNW": 292,
        "NW": 315,
        "NNW": 337
    };
    $('#windArrow').css({
        'transform': 'rotate(' + (icon_dir[direction]) + 'deg)'
    });
    $('.wind .sub1').html("<i class='wi wi-strong-wind'></i>" + " " + response.current.wind_dir);
    $('.wind .sub2').html(Math.floor(response.current.wind_mph) + " MPH");

    //POPULATE FORECAST PANELS/////////////////////////////////////////////////////////////////
    //Populate current weather title//////////////////////////////////////////////////////////////////////////////////////
    $('.forecast-title').html("<h3>Next 5 Days" + " for " + response.location.name + "</h3>");
    //PANELS
    getForecastDate(1);
    console.log(dateObj);
    $('#1 .fSub1').html('<h3>' + (forecastDay[d]) + "<br/>" + (month[monthNum]) + "<br/>" + [day] + '</h3>');
    $('#1 .fSubIcon').html('<i class="wi ' + forecastWeatherIcon1 + '"></i>');
    $('#1 .fSub2').html(response.forecast.forecastday[1].day.condition.text);
    $('#1 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[1].day.maxtemp_c) + "&#176;C");
    $('#1 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[1].day.maxwind_mph) + "MPH");
    getForecastDate(1);
    console.log(dateObj);
    $('#2 .fSub1').html('<h3>' + (forecastDay[d]) + "<br/>" + (month[monthNum]) + "<br/>" + [day] + '</h3>');
    $('#2 .fSubIcon').html('<i class="wi ' + forecastWeatherIcon2 + '"></i>');
    $('#2 .fSub2').html(response.forecast.forecastday[2].day.condition.text);
    $('#2 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[2].day.maxtemp_c) + "&#176;C");
    $('#2 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[2].day.maxwind_mph) + "MPH");
    getForecastDate(1);
    console.log(dateObj);
    $('#3 .fSub1').html('<h3>' + (forecastDay[d]) + "<br/>" + (month[monthNum]) + "<br/>" + [day] + '</h3>');
    $('#3 .fSubIcon').html('<i class="wi ' + forecastWeatherIcon3 + '"></i>');
    $('#3 .fSub2').html(response.forecast.forecastday[3].day.condition.text);
    $('#3 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[3].day.maxtemp_c) + "&#176;C");
    $('#3 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[3].day.maxwind_mph) + "MPH");
    getForecastDate(1);
    console.log(dateObj);
    $('#4 .fSub1').html('<h3>' + (forecastDay[d]) + "<br/>" + (month[monthNum]) + "<br/>" + [day] + '</h3>');
    $('#4 .fSubIcon').html('<i class="wi ' + forecastWeatherIcon4 + '"></i>');
    $('#4 .fSub2').html(response.forecast.forecastday[4].day.condition.text);
    $('#4 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[4].day.maxtemp_c) + "&#176;C");
    $('#4 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[4].day.maxwind_mph) + "MPH");
    getForecastDate(1);
    console.log(dateObj);
    $('#5 .fSub1').html('<h3>' + (forecastDay[d]) + "<br/>" + (month[monthNum]) + "<br/>" + [day] + '</h3>');
    $('#5 .fSubIcon').html('<i class="wi ' + forecastWeatherIcon5 + '"></i>');
    $('#5 .fSub2').html(response.forecast.forecastday[5].day.condition.text);
    $('#5 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[5].day.maxtemp_c) + "&#176;C");
    $('#5 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[5].day.maxwind_mph) + "MPH");
    dateObj = new Date();
    console.log(dateObj);
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                  //
    //                                                                                                  //
    //                                    UNIT SWITCHES                                                 //
    //                                                                                                  //
    //                                                                                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////////////

    //Centigrade/Fahrenheit units switch - pages are filled by default first above, (in 'POPULATE FORECAST PANELS')
    $('#temp-toggle').unbind().click(function() {
        $(this).toggleClass('units-toggle-on');
        var button = document.getElementById("temperature-button");
        if ($('#temp-toggle').hasClass('units-toggle-on')) {
            button.innerHTML = "&#176;C";
            console.log('Temperature units set to Celcius');
            $('.temp .main').html(Math.floor(response.current.temp_c) + '<span class="degs">&#176;C<span>');
            $('.temp .sub1').html("<i class='wi wi-direction-down'></i>" + " " + Math.floor(response.forecast.forecastday[0].day.mintemp_c) + "&#176;C");
            $('.temp .sub2').html("<i class='wi wi-direction-up'></i>" + " " + Math.floor(response.forecast.forecastday[0].day.maxtemp_c) + "&#176;C");
            $('#1 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[1].day.maxtemp_c) + "&#176;C");
            $('#2 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[2].day.maxtemp_c) + "&#176;C");
            $('#3 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[3].day.maxtemp_c) + "&#176;C");
            $('#4 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[4].day.maxtemp_c) + "&#176;C");
            $('#5 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[5].day.maxtemp_c) + "&#176;C");
        } else {
            button.innerHTML = "&#176;F";
            console.log('Temperature units set to fahrenheit');
            $('.temp .main').html(Math.floor(response.current.temp_f) + '<span class="degs">&#176;F<span>');
            $('.temp .sub1').html("<i class='wi wi-direction-down'></i>" + " " + Math.floor(response.forecast.forecastday[0].day.mintemp_f) + "&#176;F");
            $('.temp .sub2').html("<i class='wi wi-direction-up'></i>" + " " + Math.floor(response.forecast.forecastday[0].day.maxtemp_f) + "&#176;F");
            $('#1 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[1].day.maxtemp_f) + "&#176;F");
            $('#2 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[2].day.maxtemp_f) + "&#176;F");
            $('#3 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[3].day.maxtemp_f) + "&#176;F");
            $('#4 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[4].day.maxtemp_f) + "&#176;F");
            $('#5 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + Math.floor(response.forecast.forecastday[5].day.maxtemp_f) + "&#176;F");
        }
    });

    //MPH/KPH units switch - pages are filled by default first above, (in 'POPULATE FORECAST PANELS')
    $('#speed-toggle').unbind().click(function() {
        $(this).toggleClass('units-toggle-on');
        var SPbutton = document.getElementById("speed-button");
        if ($('#speed-toggle').hasClass('units-toggle-on')) {
            SPbutton.innerHTML = "MPH";
            console.log('Speed Units set to MPH');
            $('.wind .sub2').html(Math.floor(response.current.wind_mph) + " MPH");
            $('#1 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[1].day.maxwind_mph) + " MPH");
            $('#2 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[2].day.maxwind_mph) + " MPH");
            $('#3 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[3].day.maxwind_mph) + " MPH");
            $('#4 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[4].day.maxwind_mph) + " MPH");
            $('#5 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[5].day.maxwind_mph) + " MPH");
        } else {
            SPbutton.innerHTML = "KPH";
            console.log('Speed Units set to KPH');
            $('.wind .sub2').html(Math.floor(response.current.wind_kph) + " KPH");
            $('#1 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[1].day.maxwind_kph) + " KPH");
            $('#2 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[2].day.maxwind_kph) + " KPH");
            $('#3 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[3].day.maxwind_kph) + " KPH");
            $('#4 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[4].day.maxwind_kph) + " KPH");
            $('#5 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + Math.floor(response.forecast.forecastday[5].day.maxwind_kph) + " KPH");
        }
    });
    console.log('Page Populated. Have a nice Day :)');
}
//ALLOWS CROSS ORIGIN HTTP API VIA HTTPS SITE (Thanks stack overflow)
/*no longer requred
jQuery.ajaxPrefilter(function(options) {
  if (options.crossDomain && jQuery.support.cors) {
    options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
  }
});*/
