//function calls
$(document).ready(function() {

  var jsonURL = "https://api.apixu.com/v1/forecast.json?key=213f09f977944109a4f140232161009&days=6&q=";
  var term = $('#searchTerm').val();
  var warning = document.getElementById("warning");
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                                                                  //
  //                                                                                                  //
  //                                    Reuseable Functions                                           //
  //                                                                                                  //
  //                                                                                                  //
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  //Location error handling
  function geoError(error) {
    var warning = document.getElementById("warning");
    var jsonURL = "https://api.apixu.com/v1/forecast.json?key=213f09f977944109a4f140232161009&days=6&q=";
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("PERMISSION_DENIED");
        $('#warning').css({
          'display': 'block'
        });
        warning.innerHTML = "<i class='wi wi-small-craft-advisory fa-lg'></i><p>Sorry, location services appear to be blocked on your device, so we took a wild guess instead.</p><p>Use the search box for accurate results.</p>";
        $.getJSON(jsonURL + "auto:ip", function(getByIPInstead) {
          populate(getByIPInstead);
        });
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("POSITION_UNAVAILABLE");
        $('#warning').css({
          'display': 'block'
        });
        warning.innerHTML = "<i class='wi wi-small-craft-advisory fa-lg'></i><p>Sorry, your position is unavailable for some reason, so we guessed it instead.</p><p>Use the search box for more accurate results.</p>";
        $.getJSON(jsonURL + "auto:ip", function(getByIPInstead) {
          populate(getByIPInstead);
        });
        break;
      case error.TIMEOUT:
        console.log("TIMEOUT");
        $('#warning').css({
          'display': 'block'
        });
        warning.innerHTML = "<i class='wi wi-small-craft-advisory fa-lg'></i><p>Sorry, the location request timed out, so we guessed it instead.</p><p>Use the search box for more accurate results.</p>";
        $.getJSON(jsonURL + "auto:ip", function(getByIPInstead) {
          populate(getByIPInstead);
        });
        break;
      case error.UNKNOWN_ERROR:
        console.log("UNKOWN_ERROR");
        $('#warning').css({
          'display': 'block'
        });
        warning.innerHTML = "<i class='wi wi-small-craft-advisory fa-lg'></i><p>Sorry, something weird happened so we guessed your location.</p><p>Please use the search box for more accurate results.</p>";
        $.getJSON(jsonURL + "auto:ip", function(getByIPInstead) {
          populate(getByIPInstead);
        });
        break;
    }
  }

  function fetch() {
    var jsonURL = "https://api.apixu.com/v1/forecast.json?key=213f09f977944109a4f140232161009&days=6&q=";
    var term = $('#searchTerm').val();
    if (term === '') {
      navigator.geolocation.getCurrentPosition(function(location) {
        var lats = location.coords.latitude;
        var longs = location.coords.longitude;
        var accuracy = location.coords.accuracy;
        //build API key
        $.getJSON(jsonURL + lats + "," + longs, function(gotByGeo) {
          populate(gotByGeo);
        });
      });
    } else {
      $.getJSON(jsonURL + term, function(getBySearch) {
        populate(getBySearch);
      });
    }
  }
  //Get json data by search or location means and send for call page fill
  function testDevice() {
    var warning = document.getElementById("warning");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(fetch, geoError);
    } else {
      warning.innerHTML = "<i class='wi wi-small-craft-advisory fa-lg'></i><p>Sorry, something weird happened so we guessed your location.</p><p>Please use the search box for more accurate results.</p>";
    }
  }

  testDevice();
  
  $('#locate').click(function() {
    $('#searchTerm').val(''); //clear search term if there is one. 
    fetch();
    testDevice();
  });
  $('#search').click(fetch);
  $('#searchTerm').keyup(function(event) {
    if (event.keyCode == 13) {
      fetch();
      $('#warning').css({
        'display': 'none'
      });
    }
  });
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
  //the following just to use custom icons :/
  /// FOR ICON SELECTION - convert current time to compare with sun rise/set////////////////////////////
  var jsonSunRise = response.forecast.forecastday[0].astro.sunrise;
  var jsonSunSet = response.forecast.forecastday[0].astro.sunset;
  var getTime = new Date(new Date().getTime()).toLocaleTimeString('en-uk', {
    hour: 'numeric',
    minute: 'numeric'
  });
  var timeNow = convertTime(getTime);
  var sunRise = convertTime(jsonSunRise);
  var sunSet = convertTime(jsonSunSet);
  //Format time for comparison (thanks stack overflow)
  function convertTime(time) {
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var AMPM = time.match(/\s(.*)$/)[1];
    if (AMPM == "PM" && hours < 12) hours = hours + 12;
    if (AMPM == "AM" && hours == 12) hours = hours - 12;
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if (hours < 10) sHours = "0" + sHours;
    if (minutes < 10) sMinutes = "0" + sMinutes;
    var converted = (sHours + ":" + sMinutes);
    return converted;
  }

  //SELECT ICON BASED ON COVERTED TIME BOOLIAN///////////////////////////////////////////////////////
  var currentWeatherIcon = getIcon(response.current.condition.code, false);
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
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
          icon = 'wi-day-sunny';
        } else {
          icon = 'wi-stars';
        }
        break;
      case 1003:
      case 1006:
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
          icon = 'wi-day-cloudy';
        } else {
          icon = 'wi-night-alt-cloudy';
        }
        break;
      case 1009:
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
          icon = 'wi-cloud';
        } else {
          icon = 'wi-cloud';
        }
        break;
      case 1030:
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
          icon = 'wi-fog';
        } else {
          icon = 'wi-night-fog';
        }
        break;
      case 1135:
      case 1147:
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
          icon = 'wi-fog';
        } else {
          icon = 'wi-fog';
        }
        break;
      case 1063:
      case 1180:
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
          icon = 'wi-day-sprinkle';
        } else {
          icon = 'wi-night-alt-sprinkle';
        }
        break;
      case 1072:
      case 1153:
      case 1168:
      case 1171:
      case 1183:
      case 1240:
      case 1198:
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
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
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
          icon = 'wi-day-rain';
        } else {
          icon = 'wi-night-alt-rain';
        }
        break;
      case 1273:
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
          icon = 'wi-day-storm-showers';
        } else {
          icon = 'wi-night-alt-storm-showers';
        }
        break;
      case 1087:
      case 1276:
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
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
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
          icon = 'wi-day-sleet';
        } else {
          icon = 'wi-night-alt-sleet';
        }
        break;
      case 1261:
      case 1264:
      case 1237:
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
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
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
          icon = 'wi-snow';
        } else {
          icon = 'wi-night-alt-snow';
        }
        break;
      case 1279:
      case 1282:
        if (forceDay === true || (timeNow > sunRise && timeNow < sunSet)) {
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
  $('.weather .main').html('<i class="wi ' + currentWeatherIcon + '"></i>');
  $('.weather .sub1').html("<i class='wi wi-thermometer'></i>" + " " + response.current.temp_c + "&#176;C");
  $('.weather .sub2').html(response.current.condition.text);

  //Populate current date panel ////////////////////////////////////////////////////////////////////////
  //Call current date from browser, format and populate

  var dateObj = new Date();
  var monthNum = dateObj.getUTCMonth();
  var day = dateObj.getUTCDate();
  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";
  var d = dateObj.getDay();
  var forecastDay = new Array();
  forecastDay[0] = "Sunday";
  forecastDay[1] = "Monday";
  forecastDay[2] = "Tuesday";
  forecastDay[3] = "Wednesday";
  forecastDay[4] = "Thursday";
  forecastDay[5] = "Friday";
  forecastDay[6] = "Saturday";
  forecastDay[7] = "Sunday";
  forecastDay[8] = "Monday";
  forecastDay[9] = "Tuesday";
  forecastDay[10] = "Wednesday";
  forecastDay[11] = "Thursday";
  $('.date .weekDay').html(forecastDay[d]);
  $('.date .day').html(day);
  $('.main .month').html(month[monthNum]);
  $('.date .sub1').html("<i class='wi wi-sunrise'></i>" + " " + response.forecast.forecastday[0].astro.sunrise);
  $('.date .sub2').html("<i class='wi wi-sunset'></i>" + " " + response.forecast.forecastday[0].astro.sunset);

  //CURRENT TEMPERATURE POPULATE
  $('.temp .main').html(response.current.temp_c + '<span class="degs">&#176;C<span>');
  $('.temp .sub1').html("<i class='wi wi-direction-down'></i>" + " " + response.forecast.forecastday[0].day.mintemp_c + "&#176;C");
  $('.temp .sub2').html("<i class='wi wi-direction-up'></i>" + " " + response.forecast.forecastday[0].day.maxtemp_c + "&#176;C");
  //CURRENT WIND POPULATE, ROTATE ICON FOR WIND DIRECTION
  var direction = response.current.wind_dir;
  var icon_dir = new Array();
  icon_dir["N"] = 0;
  icon_dir["NNE"] = 22;
  icon_dir["NE"] = 45;
  icon_dir["ENE"] = 67;
  icon_dir["E"] = 90;
  icon_dir["ESE"] = 112;
  icon_dir["SE"] = 135;
  icon_dir["SSE"] = 157;
  icon_dir["S"] = 180;
  icon_dir["SSW"] = 202;
  icon_dir["SW"] = 225;
  icon_dir["WSW"] = 247;
  icon_dir["W"] = 270;
  icon_dir["WNW"] = 292;
  icon_dir["NW"] = 315;
  icon_dir["NNW"] = 337;
  $('#windArrow').css({
    'transform': 'rotate(' + (icon_dir[direction]) + 'deg)'
  });
  $('.wind .sub1').html("<i class='wi wi-strong-wind'></i>" + " " + response.current.wind_dir);
  $('.wind .sub2').html(response.current.wind_mph + " MPH");
  //POPULATE FORECAST PANELS/////////////////////////////////////////////////////////////////               
  //Populate current weather title//////////////////////////////////////////////////////////////////////////////////////
  $('.forecast-title').html("<h3>Next 5 Days" + " for " + response.location.name + "</h3>");
  //PANELS
  $('#1 .fSub1').html('<h3>' + (forecastDay[d + 1]) + "<br/>" + (month[monthNum]) + "<br/>" + [day + 1]);
  $('#1 .fSubIcon').html('<i class="wi ' + forecastWeatherIcon1 + '"></i>');
  $('#1 .fSub2').html(response.forecast.forecastday[1].day.condition.text);
  $('#1 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + response.forecast.forecastday[1].day.maxtemp_c + "&#176;C");
  $('#1 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + response.forecast.forecastday[1].day.maxwind_mph + "MPH");

  $('#2 .fSub1').html('<h3>' + (forecastDay[d + 2]) + "<br/>" + (month[monthNum]) + "<br/>" + [day + 2]);
  $('#2 .fSubIcon').html('<i class="wi ' + forecastWeatherIcon2 + '"></i>');
  $('#2 .fSub2').html(response.forecast.forecastday[2].day.condition.text);
  $('#2 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + response.forecast.forecastday[2].day.maxtemp_c + "&#176;C");
  $('#2 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + response.forecast.forecastday[2].day.maxwind_mph + "MPH");

  $('#3 .fSub1').html('<h3>' + (forecastDay[d + 3]) + "<br/>" + (month[monthNum]) + "<br/>" + [day + 3]);
  $('#3 .fSubIcon').html('<i class="wi ' + forecastWeatherIcon3 + '"></i>');
  $('#3 .fSub2').html(response.forecast.forecastday[3].day.condition.text);
  $('#3 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + response.forecast.forecastday[3].day.maxtemp_c + "&#176;C");
  $('#3 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + response.forecast.forecastday[3].day.maxwind_mph + "MPH");

  $('#4 .fSub1').html('<h3>' + (forecastDay[d + 4]) + "<br/>" + (month[monthNum]) + "<br/>" + [day + 4]);
  $('#4 .fSubIcon').html('<i class="wi ' + forecastWeatherIcon4 + '"></i>');
  $('#4 .fSub2').html(response.forecast.forecastday[4].day.condition.text);
  $('#4 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + response.forecast.forecastday[4].day.maxtemp_c + "&#176;C");
  $('#4 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + response.forecast.forecastday[4].day.maxwind_mph + "MPH");

  $('#5 .fSub1').html('<h3>' + (forecastDay[d + 5]) + "<br/>" + (month[monthNum]) + "<br/>" + [day + 5]);
  $('#5 .fSubIcon').html('<i class="wi ' + forecastWeatherIcon5 + '"></i>');
  $('#5 .fSub2').html(response.forecast.forecastday[5].day.condition.text);
  $('#5 .fSub3').html("<i class='wi wi-thermometer'></i>" + " " + response.forecast.forecastday[5].day.maxtemp_c + "&#176;C");
  $('#5 .fSub4').html("<i class='wi wi-strong-wind'></i>" + " " + response.forecast.forecastday[5].day.maxwind_mph + "MPH");
}
///TOGGLE THE FORECAST
$('#more').click(function() {
  $('.forecast-container').slideToggle(850);
  $('.forecast-container').css({
    'display': 'flex'
  });
});

//ALLOWS CROSS ORIGIN HTTP API VIA HTTPS SITE (Thanks stack overflow)

/*Not required now
jQuery.ajaxPrefilter(function(options) {
  if (options.crossDomain && jQuery.support.cors) {
    options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
  }
});*/