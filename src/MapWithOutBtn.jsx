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

const MapComponentMap = () => {
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const mapRef = useRef(null);
    const roadSourceRef = useRef(null);
    const markerSourceRef = useRef(null);

    useEffect(() => {
        const initialMap = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: new VectorSource(), // Marker layer
                }),
            ],
            view: new View({
                center: fromLonLat([0, 0]),
                zoom: 2,
            }),
        });

        markerSourceRef.current = initialMap.getLayers().getArray()[1].getSource(); // Get the marker layer source
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

        // Add click event listener to add markers
        initialMap.on('click', handleMapClick);

        setMap(initialMap);
        return () => {
            initialMap.setTarget(null);
          };
    }, []);

    const handleMapClick = (event) => {
        const coordinate = event.coordinate;
        console.log('Map clicked at:', coordinate);
        const marker = new Feature({
            geometry: new Point(coordinate),
        });

        marker.setStyle(
            new Style({
                image: new Icon({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    src: 'marker.png', // Make sure the path is correct
                }),
            })
        );

        markerSourceRef.current.addFeature(marker);
        setMarkers((prevMarkers) => [...prevMarkers, marker]);
    };

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
    // const handleHighlightRoad = (event) => {
    //     console.log("event" +event)
    //     const selectedFeatures = event.target.getFeatures();
    //     if (selectedFeatures.getLength() > 0) {
    //       const selectedFeature = selectedFeatures.item(0);
    
    //       // Check if the selected feature is a road feature
    //       if (roadSourceRef.current.getFeatureById(selectedFeature.getId())) {
    //         const color = document.getElementById('color').value;
    
    //         selectedFeature.setStyle(
    //           new Style({
    //             stroke: new Stroke({
    //               color,
    //               width: 5,
    //               height:5,
    //             }),
    //           })
    //         );
    //       }
    //     }
    //   };
    
    return (
        <div>
            <div ref={mapRef} style={{ height: '1000px' }} >
            {markers.map((marker, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: marker.getGeometry().getCoordinates()[0],
            top: marker.getGeometry().getCoordinates()[1],
            width: '20px',
            height: '20px',
            backgroundColor: 'red',
            color:"red",
            borderRadius: '50%',
            zIndex: 1000,
          }}
        />
      ))}
          
            </div>
            {/* <div>
                <label>
                    Color:
                    <input type="color" id="color" onChange={handleHighlightRoad} />
                </label>
            </div> */}
        </div>
    )
}
export default MapComponentMap