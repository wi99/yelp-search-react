import React, { useState } from "react";
import "./styles.css";
import MapContainer from "./MapContainer.js";

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [info, setInfo] = useState({});

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [locationAsked, setLocationAsked] = useState(false);

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      });
    }
    setLocationAsked(true);
  }
  if (!locationAsked) getLocation();

  return (
    <div className="App">
      <h1>Yelp! Search</h1>
      <div>
        <input
          type="text"
          value={searchLocation}
          placeholder="Custom Location (optional)"
          onChange={function(event) {
            const value = event.target.value;
            setSearchLocation(value);
          }}
        />
        <input
          type="text"
          value={searchTerm}
          placeholder="Search Term"
          onChange={function(event) {
            const value = event.target.value;
            setSearchTerm(value);
          }}
        />

        <button
          onClick={function() {
            if (!searchTerm.length) return;
            var params = {
              term: searchTerm
            };
            if (searchLocation) {
              params["location"] = searchLocation;
            } else if (latitude && longitude) {
              params["latitude"] = latitude;
              params["longitude"] = longitude;
            } else {
              alert("Please allow location access or enter a location");
              getLocation();
              return;
            }

            doSearch(params, restaurants, setRestaurants);
            setRestaurants([
              {
                id: Symbol(),
                text: "Loading...",
                coordinates: { latitude: 0, longitude: 0 }
              }
            ]);
            setSearchTerm("");
            setSearchLocation("");
          }}
        >
          Search
        </button>
      </div>
      <div class="row">
        <div class="column">
          <InfoComponent info={info} />
        </div>
        <div class="column">
          {restaurants.map(function(r) {
            return (
              <RestaurantItem
                text={r.text}
                setInfo={setInfo}
                business_id={r.business_id}
              />
            );
          })}
        </div>

        <div class="column">
          <MapContainer
            coords={{ lat: latitude, lng: longitude }}
            restaurants={restaurants}
            style={{ width: "33%" }}
          />
        </div>
      </div>
    </div>
  );
}

function InfoComponent(props) {
  if (!props.info.rating)
    return (
      <div>
        <h2>{props.info.name}</h2>
      </div>
    );
  console.log(props.info);
  return (
    <div style={{ padding: "5px" }}>
      <h2>
        <a target="_blank" rel="noopener noreferrer" href={props.info.url}>
          {props.info.name}
        </a>
      </h2>
      <h3>{props.info.rating}/5 stars</h3>
      <h4>{props.info.review_count} reviews</h4>
      <img height="300px" class="info" src={props.info.image_url} alt="" />
      <p>{props.info.display_phone}</p>
      <p>
        {props.info.location.display_address.map(function(a) {
          return <p>{a}</p>;
        })}
      </p>
    </div>
  );
}

function RestaurantItem(props) {
  let text = props.text;
  var info = props.info;
  var setInfo = props.setInfo;

  return (
    <div
      style={{ padding: "5px", border: "1px solid grey", cursor: "pointer" }}
      onClick={function() {
        doInfoLookup(props.business_id, info, setInfo);
      }}
    >
      <strong>{text}</strong>
    </div>
  );
}

function doInfoLookup(business_id, info, setInfo) {
  if (!business_id) return;
  var url =
    "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/" +
    business_id;
  getRequest(
    url,
    function(result) {
      var res = JSON.parse(result);
      setInfo(res);
    },
    function(error) {
      setInfo({
        name: "Error"
      });
    }
  );
  setInfo({
    name: "Loading..."
  });
}

function doSearch(params, restaurants, setRestaurants) {
  var url =
    "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?" +
    new URLSearchParams(params).toString();
  getRequest(
    url,
    function(result) {
      var res = JSON.parse(result);
      var newRestaurants = [];
      for (var i = 0; i < res["businesses"].length; i++) {
        var business = res["businesses"][i];
        //console.log(business);
        newRestaurants.push({
          id: Symbol(),
          text: business.name,
          business_id: business.id,
          rating: business.rating,
          image_url: business.image_url,
          coordinates: business.coordinates
        });
      }
      if (!newRestaurants.length) {
        setRestaurants([
          {
            id: Symbol(),
            text: "No Results Found.",
            coordinates: { latitude: 0, longitude: 0 }
          }
        ]);
        return;
      }
      setRestaurants([...newRestaurants]);
    },
    function(error) {
      setRestaurants([
        {
          id: Symbol(),
          text: "Error. Please Try Again",
          coordinates: { latitude: 0, longitude: 0 }
        }
      ]);
    }
  );
}

function getRequest(url, callbackSuccess, callbackError) {
  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "Bearer vkTRv1I30LwPH0DSj41dlh7Drs8kiL5vnR2kL63rNOQCur_a7Eu4eTW-W6crqv_0bYeTAjdQedGuAHcnEaTo_tn6vDxrOv3-pElV5Eb4NC8ZohiTrT7Kl-T0i5xhXnYx"
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  fetch(url, requestOptions)
    .then(response => response.text())
    .then(result => callbackSuccess(result))
    .catch(error => callbackError(error));
}
