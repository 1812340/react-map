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
import { Style, Icon } from 'ol/style';
import { Select } from 'ol/interaction';

const MapComponentPagale = () => {
    const [map, setMap] = useState(null);
    const mapRef = useRef(null);
    const roadSourceRef = useRef(null);
    const markerSourceRef = useRef(null);
    const [markers, setMarkers] = useState()

    useEffect(() => {
        const initialMap = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: new VectorSource(), // Road layer
                }),

            ],
            view: new View({
                center: fromLonLat([0, 0]),
                zoom: 2,
            }),
        });
        const markerSource = new VectorSource();
        initialMap.addLayer(
            new VectorLayer({
                source: markerSource,
            })
        );

        markerSourceRef.current = markerSource // Get the marker layer source
        // markerSourceRef.current = initialMap.getLayers().getArray()[2].getSource(); // Get the marker layer source

        // Fetch and render road data
        fetch('https://overpass-api.de/api/interpreter?data=[out:json];way["highway"](bbox);out;bbox=-122.4192,37.7749,-122.4192,37.7749')
            .then((response) => response.json())
            .then((data) => {
                const roadSource = new VectorSource({
                    features: new GeoJSON().readFeatures(data),
                });
                roadSourceRef.current = roadSource;
                initialMap.getLayers().getArray()[1].setSource(roadSource); // Set the road layer source
            });

        // Add interaction for selecting road features
        const selectInteraction = new Select({
            layers: [initialMap.getLayers().getArray()[1]], // Assuming the road layer is the second layer
        });
        selectInteraction.on('select', handleHighlightRoad);
        initialMap.addInteraction(selectInteraction);

        // Add click event listener to add markers
        initialMap.on('click', handleMapClick);

        setMap(initialMap);

        // Cleanup function to remove the map when the component unmounts
        return () => {
            initialMap.setTarget(null);
        };
    }, []);

    const handleMapClick = (event) => {
        const coordinate = event.coordinate;
        setMarkers(coordinate)
        console.log('Map clicked at:', coordinate); // Add this line
        const markerIcon = new Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: 'marker.png', // Make sure the path is correct
        });
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
                    scale: 0.5, // Adjust the scale to make the marker larger or smaller
                    color: '#FF0000', // Set a color for the marker
                }),
            })
        );


        marker.setStyle(new Style({ image: markerIcon }));
        markerSourceRef.current.addFeature(marker);
        // setMarkers(markerSourceRef.current.addFeature(marker));

        // markerSourceRef.current.addFeature(marker);
        // console.log("Maerker inside " + markers[0][1])

    };

    const handleHighlightRoad = (event) => {
        const selectedFeatures = event.target.getFeatures();
        if (selectedFeatures.getLength() > 0) {
            const selectedFeature = selectedFeatures.item(0);
            if (roadSourceRef.current.getFeatureById(selectedFeature.getId())) {
                const color = document.getElementById('color').value;

                selectedFeature.setStyle(
                    new Style({
                        stroke: new Stroke({
                            color,
                            width: 5,
                        }),
                    })
                );
            }
        }
    };

    return (
        <div>
            <div ref={mapRef} style={{ height: '500px' }}>

                {/* {map && (
        <Marker
          coordinate={markers.} // Example coordinate
          markerSource={markerSourceRef.current}
        />
      )} */}
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

export default MapComponentPagale