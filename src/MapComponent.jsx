// import React, { useRef, useEffect, useState } from 'react';
// import 'ol/ol.css';
// import Map from 'ol/Map';
// import View from 'ol/View';
// import TileLayer from 'ol/layer/Tile';
// import OSM from 'ol/source/OSM';
// import VectorLayer from 'ol/layer/Vector';
// import VectorSource from 'ol/source/Vector';
// import Feature from 'ol/Feature';
// import Point from 'ol/geom/Point';
// import { fromLonLat } from 'ol/proj';
// import { Style, Icon, Stroke } from 'ol/style';

// const MapComponent = () => {
//   const [map, setMap] = useState(null);
//   const [markers, setMarkers] = useState([]);
//   const [highlightedRoads, setHighlightedRoads] = useState({});
//   const mapRef = useRef(null);

//   useEffect(() => {
//     const initialMap = new Map({
//       target: mapRef.current,
//       layers: [
//         new TileLayer({
//           source: new OSM(),
//         }),
//         new VectorLayer({
//           source: new VectorSource(),
//         }),
//       ],
//       view: new View({
//         center: fromLonLat([0, 0]),
//         zoom: 2,
//       }),
//     });

//     setMap(initialMap);
//   }, []);

//   const handleMarkerClick = (event) => {
//     const coordinate = event.coordinate;
//     const marker = new Feature({
//       geometry: new Point(coordinate),
//     });
//     marker.setStyle(
//       new Style({
//         image: new Icon({
//           anchor: [0.5, 1],
//           anchorXUnits: 'fraction',
//           anchorYUnits: 'fraction',
//           src: 'marker.png',
//         }),
//       })
//     );
//     map.addLayer(
//       new VectorLayer({
//         source: new VectorSource({
//           features: [marker],
//         }),
//       })
//     );
//     setMarkers((prevMarkers) => [...prevMarkers, marker]);
//   };

//   const handleHighlightRoad = (event) => {
//     const roadId = event.target.id;
//     const color = event.target.value;
//     const roadFeature = map.getLayers().getArray()[1].getSource().getFeatureById(roadId);
//     roadFeature.setStyle(
//       new Style({
//         stroke: new Stroke({
//           color,
//           width: 5,
//         }),
//       })
//     );
//     setHighlightedRoads((prevHighlightedRoads) => ({ ...prevHighlightedRoads, [roadId]: color }));
//   };

//   return (
//     <div>
//       <div ref={mapRef} style={{ height: '500px' }} onClick={handleMarkerClick}></div>
//       <div>
//         <button onClick={() => handleMarkerClick({ coordinate: fromLonLat([0, 0]) })}>
//           Add Marker
//         </button>
//         {/* Add input fields for highlighting roads */}
//         <div>
//           <label>
//             Road ID:
//             <input type="text" id="roadId" />
//           </label>
//           <label>
//             Color:
//             <input type="color" id="color" onChange={handleHighlightRoad} />
//           </label>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MapComponent;