import React from "react";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";

export class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
  }
  render() {
    var points = [];
    this.props.restaurants.map(function(r) {
      points.push({
        lat: r.coordinates.latitude,
        lng: r.coordinates.longitude
      });
      return r;
    });
    var bounds = new this.props.google.maps.LatLngBounds();
    for (var i = 0; i < points.length; i++) {
      bounds.extend(points[i]);
    }
    return (
      <Map
        bounds={bounds}
        initialCenter={this.props.coords}
        google={this.props.google}
        style={{ width: "33%", height: "100%", position: "relative" }}
        zoom={8}
      >
        {this.props.restaurants.map(function(r) {
          if (!r.coordinates.latitude || !r.coordinates.longitude)
            return <div />;
          return (
            <Marker
              name={r.text}
              position={{
                lat: r.coordinates.latitude,
                lng: r.coordinates.longitude
              }}
            />
          );
        })}
      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyAKUQBdfc3TiuPEhiK1CvJi2kwMpeV7UiY"
})(MapContainer);
