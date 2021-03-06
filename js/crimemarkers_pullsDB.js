///////////////////CRIME COUNTER/////////////////////
// 1. CREATE THE 2020 CRIME COUNTER
////path to the DB
var path = "http://young-beach-08773.herokuapp.com/get_file?filename=raw_data/crime_weather_2020.csv"

//read in the crimes and count each one for 2020
d3.csv(path).then((data) => {
  // create the filter function, set to only see 2020 dates
  function filterYears(date) {
    return date.year == "2020";
  }
    // filter on the date to narrow down the data for only the year selected
  data = data.filter(filterYears);
  //create a crimer counter variable
  var crimeCount = 0
  //loop through all the crimes and add to the counter for each
  data.forEach((crime)=> {
    crimeCount ++;
  });
  //Append the crime count to the card 
  d3.selectAll("#crimeCount").text(crimeCount);
});

// 2. ADD IN "UPDATED AS OF" TO TOTAL CRIMES
//read in the crimes and count each one for 2020
var updatedDates = []
d3.csv(path).then((data) => {
  // sort the dates so you get the most recent date on top
  data.forEach((date) => {
    //remove the dash in the date so you have just the number and sort based on that to get the most recent date
    var dates = date.date.replace(/-/g,"")
    updatedDates.push(parseInt(dates));
  });
  //slice the most recent date
  var recentDate = updatedDates.sort((a, b) => b-a).slice(0,1);

  //convert the date back to string sand add back the dashes
  recentDate = String(recentDate[0]);

  var latestCrimeDate = +recentDate.slice(4,6) + "/" + recentDate.slice(6,8) +"/"+ recentDate.slice(0,4);

  console.log(latestCrimeDate);

  d3.selectAll("#asOfDate").text("Updated as of "+latestCrimeDate)
  });






///////////////////CRIME MAP////////////////////////
// 1. CREATE THE DATE DROPDOWN
//path to the csv
var path = "http://young-beach-08773.herokuapp.com/get_file?filename=raw_data/crime_weather_2020.csv"
//create the empty drop-down array for the dates
var dropdownDates = []
//create the drop down with all of the dates so you can choose to look at a single day of data by year
d3.csv(path).then((data) => {
  // create the filter function, set to only see 2020 dates
  function filterYears(date) {
    return date.year == "2020";
  }
    // filter on the date to narrow down the data for only the year selected
  data = data.filter(filterYears);
  //loop through all the dates and if unique, add to the dropdownDates array
  data.forEach((crime)=> {
    //if the date is already in the array, then it is discarded, otherwise it is added
    if (dropdownDates.indexOf(crime.date) == -1) {
      dropdownDates.push(crime.date);
    };
  });
  //Loop through the dropdownDates and add each element text and value to the dropdown
  dropdownDates.forEach((date) => {
    //create the dropdown element
    var day = document.createElement("option");
    //add the element text and value equal to the date
    day.text = date;
    day.value = date;
    //append the date to the selDataset element
    var sel = document.getElementById("selDate");
    sel.appendChild(day);
  });
});



// 2. ADD IN THE LEAFLET MAP WITH TILE LAYER
// Creating map object
var myMap = L.map("map", {
  center: [33.7490, -84.3880],
  zoom: 11
});
// Adding tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap);



// 3. CREATE chooseMarker FUNCTION WHICH DETERMINES THE COLOR MARKER FOR EACH CRIMEON THE MAP
function chooseMarker(crime) {
  switch (crime) {
    case "LARCENY":
      return "pink";
    case "AUTO THEFT":
      return "red";
    case "ROBBERY":
      return "orange";
    case "BURGLARY":
      return "black";
    case "HOMICIDE":
      return "purple";
    case "MANSLAUGHTER":
      return "blue";
    case "AGG ASSAULT":
      return "green";
    default:
      return "white";
  }
}


// 4. SET UP MAP LEGEND
//set the legend to be in the topright of the page
var legend = L.control({position: "topright"});
//put together the legend function
legend.onAdd = function() {
  //create the "info legend" class in the html
  var div = L.DomUtil.create("div", "info legend");
  //list out the category lables and the colors used
  var categories = [" Larceny"," Robbery", " Auto Theft", " Burglary", " Homicide"," Manslaughter", " Agg Assault"];
  var colors = ["pink", "orange", "red","black","purple", "blue", "green"];
  //loop through the categories and push the labels and colors to the legend html
  for (i=0; i<colors.length; i++) {

    div.innerHTML +=
    '<li style=\"background:' + colors[i] +'"></li>' +(categories[i] ? categories[i] +'<br>' : '+')
  }
return div;
}
//add the legend to the map   
legend.addTo(myMap)



// 5. CALL buildMap FUNCTION WHEN A CHANGE IS MADE ON THE FILTER
d3.selectAll("#selDate").on("change", buildMap);



// 6. CREATE THE buildMap FUNCTION TO RUN WHEN A DROPDOWN ITEM IS SELECTED
function buildMap() {

  //reset the dropdownDate to nothing everytime a change is made to the filter
  var dropdownDate = "";

  //clear the markers from the table everytime a change is made to the filter
  d3.selectAll("path").remove();
  d3.selectAll(".leaflet-image-layer").remove();

  //grab the dropdown value selected by the user for our data filter
  dropdownDate = d3.select("#selDate").property("value");

  var path = "http://young-beach-08773.herokuapp.com/get_file?filename=raw_data/crime_weather_2020.csv";

  d3.csv(path).then(function(data) {

    //call the getDate function to get the new date choosen from the dropdown menu
    //create the filter function
    function filterDates(date) {
      return date.date == dropdownDate;
    }


    //filter on the date to narrow down the data
    data = data.filter(filterDates);
    
    
    //CREATE MARKERS:
    //loop through the data and create a marker for each crime on the Atlanta map
    data.forEach(function(crime) {
      //create the markers
      L.circleMarker([crime.lat, crime.lon], {
        radius: 13,
        fillColor: chooseMarker(crime.type_crime),
        color: "white",
        fillOpacity: .75,
        weight: 2
      })


        //Add on the event listeners
        //mouse on & mouse off events
        .on({
          mouseover: function(event) {
            circleMarker = event.target;
            circleMarker.setStyle({
              fillOpacity: 1,
              weight: 4
            })
          },
          mouseout: function(event) {
            circleMarker = event.target;
            circleMarker.setStyle({
              fillOpacity: 0.70,
              weight: 2
            });
          },
        })


        //bind the popup to each marker
        .bindPopup("<h1>" + crime.type_crime + "</h1><hr><h3> Location: "+crime.Neigborhood +"</h3><hr><h3> High Temperature(F): "+Math.round(crime.temperature,0)+"</h3><hr><h3>Date: "+crime.date+"</h3>")

        .addTo(myMap)
      });
      
    //WEATHER ICON TO MAP BASED ON RAIN
    //Add on the weather icon to indicate if it is sunny or rainy that day
    //store the icon paths
    var rain = "../images/sad-rain.png";
    var sun = "../images/11561_Sun.png";
    //store the lat and long of where the icon goes
    var imageBounds = [[33.869747, -84.662046],[33.773773,-84.522717]];

    //determine which icon to add based on rain or sun
    // data.forEach(function(crime) {
    //pull the rain percentage number for the sun or rain icon
    rainOrShine = data[0].percentage_rain;
    console.log(rainOrShine);

    if (rainOrShine > .5) {
      console.log(rainOrShine);

      var image = L.imageOverlay(rain, imageBounds).addTo(myMap);

      } 
      else {

        var image = L.imageOverlay(sun, imageBounds).addTo(myMap);

    };
    return image.addTo(myMap);

  });
};









