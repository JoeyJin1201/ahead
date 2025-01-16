import React from 'react';

const PolygonControls = ({
  polygons,
  activePolygon,
  onCreatePolygon,
  onClosePolygon,
  onUndo,
  onRedo,
  onExportPolygons,
  onImportPolygons,
  onUpdatePolygon,
  onChangeOrder,
}) => (
  <div>
    <button onClick={onCreatePolygon}>Arbitrary Polygon</button>
    <button onClick={onClosePolygon} disabled={activePolygon === null}>
      Close Polygon
    </button>
    <button onClick={onUndo}>Undo</button>
    <button onClick={onRedo}>Redo</button>
    <button onClick={onExportPolygons}>Export Polygons</button>
    <input type="file" onChange={onImportPolygons} />
    <ul>
      {polygons.map((polygon, index) => (
        <li key={index}>
          <input
            type="text"
            value={polygon.label}
            onChange={(e) => onUpdatePolygon(index, 'label', e.target.value)}
          />
          <input
            type="color"
            value={polygon.borderColor}
            onChange={(e) => onUpdatePolygon(index, 'borderColor', e.target.value)}
          />
          <select
            onChange={(e) =>
              onUpdatePolygon(index, 'lineStyle', e.target.value === 'dashed' ? [5, 5] : [])
            }
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
          </select>
          <button onClick={() => onUpdatePolygon(index, 'hidden', !polygon.hidden)}>
            {polygon.hidden ? 'Show' : 'Hide'}
          </button>
          <button onClick={() => onChangeOrder(index, 'up')} disabled={index === 0}>
            Move Up
          </button>
          <button
            onClick={() => onChangeOrder(index, 'down')}
            disabled={index === polygons.length - 1}
          >
            Move Down
          </button>
          <button onClick={() => onUpdatePolygon(index, 'delete')}>Delete</button>
        </li>
      ))}
    </ul>
  </div>
);

export default PolygonControls;
