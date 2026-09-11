// GeoJSON Polygons for Canadian Border Provinces & Mexico

export const CANADA_PROVINCES_GEOJSON: any = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'BC',
      properties: { name: 'British Columbia', id: 'BC' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-130.0, 56.0],
            [-120.0, 60.0],
            [-120.0, 53.7],
            [-114.1, 49.0],
            [-123.0, 49.0],
            [-124.7, 48.4],
            [-130.0, 55.0],
            [-130.0, 56.0],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'AB',
      properties: { name: 'Alberta', id: 'AB' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-120.0, 60.0],
            [-110.0, 60.0],
            [-110.0, 49.0],
            [-114.1, 49.0],
            [-120.0, 53.7],
            [-120.0, 60.0],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'SK',
      properties: { name: 'Saskatchewan', id: 'SK' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-110.0, 60.0],
            [-102.0, 60.0],
            [-102.0, 49.0],
            [-110.0, 49.0],
            [-110.0, 60.0],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'MB',
      properties: { name: 'Manitoba', id: 'MB' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-102.0, 60.0],
            [-95.0, 60.0],
            [-89.0, 56.8],
            [-95.1, 49.0],
            [-102.0, 49.0],
            [-102.0, 60.0],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'ON',
      properties: { name: 'Ontario', id: 'ON' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-95.1, 49.0],
            [-89.0, 56.8],
            [-79.5, 54.6],
            [-79.5, 46.0],
            [-83.1, 42.0],
            [-89.5, 48.0],
            [-95.1, 49.0],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'QC',
      properties: { name: 'Quebec', id: 'QC' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-79.5, 54.6],
            [-62.0, 62.0],
            [-57.1, 51.4],
            [-64.0, 48.0],
            [-71.5, 45.0],
            [-79.5, 46.0],
            [-79.5, 54.6],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'NB',
      properties: { name: 'New Brunswick', id: 'NB' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-69.0, 47.5],
            [-64.0, 48.0],
            [-64.0, 45.8],
            [-67.0, 45.0],
            [-69.0, 47.5],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'NS',
      properties: { name: 'Nova Scotia', id: 'NS' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-66.3, 44.2],
            [-64.0, 45.8],
            [-59.8, 47.0],
            [-61.5, 43.4],
            [-66.3, 44.2],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'YT',
      properties: { name: 'Yukon', id: 'YT' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-141.0, 69.6],
            [-130.0, 60.0],
            [-130.0, 56.0],
            [-141.0, 60.3],
            [-141.0, 69.6],
          ],
        ],
      },
    },
  ],
};

export const MEXICO_GEOJSON: any = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'MX',
      properties: { name: 'Mexico', id: 'MX' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-117.1, 32.5],
            [-114.7, 32.7],
            [-106.5, 31.7],
            [-99.5, 26.0],
            [-97.1, 25.9],
            [-90.5, 21.0],
            [-86.7, 21.2],
            [-89.2, 17.8],
            [-92.2, 14.5],
            [-96.5, 15.7],
            [-105.2, 19.8],
            [-115.0, 27.8],
            [-117.1, 32.5],
          ],
        ],
      },
    },
  ],
};
