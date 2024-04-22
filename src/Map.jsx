import React, { useRef, useEffect, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Icon, Stroke } from 'ol/style';
import { Select } from 'ol/interaction';
import GeoJSON from 'ol/format/GeoJSON';

const Mapp = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [highlightedRoads, setHighlightedRoads] = useState({});
  const mapRef = useRef(null);
  const roadSourceRef = useRef(null);

  useEffect(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: new VectorSource(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    // Fetch and render road data
    fetch('https://overpass-api.de/api/interpreter?data=[out:json];way["highway"](bbox);out;')
      .then((response) => response.json())
      .then((data) => {
        const roadSource = new VectorSource({
          features: new GeoJSON().readFeatures(data),
        });
        roadSourceRef.current = roadSource;
        initialMap.addLayer(
          new VectorLayer({
            source: roadSource,
          })
        );
      });

    // Add interaction for selecting road features
    const selectInteraction = new Select({
      layers: [initialMap.getLayers().getArray()[2]], // Assuming the road layer is the third layer
    });
    selectInteraction.on('select', handleHighlightRoad);
    initialMap.addInteraction(selectInteraction);

    setMap(initialMap);
  }, []);

 
  const handleMarkerClick = (event) => {
    const coordinate = event.coordinate;
    const markerSource = map.getLayers().getArray()[1].getSource(); // Assuming the marker layer is the second layer
    const marker = new Feature({
      geometry: new Point(coordinate),
    });
    marker.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'marker.png',
        }),
      })
    );
    markerSource.addFeature(marker);
    setMarkers((prevMarkers) => [...prevMarkers, marker]);
  };

//   const handleHighlightRoad = (event) => {
//     const selectedFeatures = event.target.getFeatures();
//     if (selectedFeatures.getLength() > 0) {
//       const roadFeature = selectedFeatures.item(0);
//       const roadId = roadFeature.getId();
//       const color = document.getElementById('color').value;

//       roadFeature.setStyle(
//         new Style({
//           stroke: new Stroke({
//             color,
//             width: 5,
//           }),
//         })
//       );

//       setHighlightedRoads((prevHighlightedRoads) => ({
//         ...prevHighlightedRoads,
//         [roadId]: color,
//       }));
//     }
//   };
  const handleHighlightRoad = (event) => {
    const selectedFeatures = event.target.getFeatures();
    if (selectedFeatures.getLength() > 0) {
      const roadFeature = selectedFeatures.item(0);
      const color = document.getElementById('color').value;
  
      roadFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color,
            width: 5,
          }),
        })
      );
    }
  };

  return (
    <div>
      <div ref={mapRef} style={{ height: '500px' }} onClick={handleMarkerClick}></div>
      <div>
        <button onClick={() => handleMarkerClick({ coordinate: fromLonLat([0, 0]) })}>
          Add Marker
        </button>
        <div>
          <label>
            Road ID:
            <input type="text" id="roadId" disabled />
          </label>
          <label>
            Color:
            <input type="color" id="color" onChange={handleHighlightRoad} />
          </label>
        </div>
      </div>
    </div>
  )
}
export default Mapp