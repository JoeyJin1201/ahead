import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import { exportPolygonsToFile, importPolygonsFromFile } from '../utils/fileOperations';
import PolygonControls from './PolygonControls';
import ScatterPlotCanvas from './ScatterPlotCanvas';

const ScatterPlotWithPolygonTool = () => {
  const [data, setData] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [activePolygon, setActivePolygon] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    Papa.parse('/data/CD45_pos.csv', {
      download: true,
      header: true,
      complete: (result) => {
        const parsedData = result.data.map((d) => ({
          x: +d['CD45-KrO'],
          y: +d['SS INT LIN'],
        }));
        setData(parsedData);
      },
    });
  }, []);

  const updateHistory = () => {
    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(polygons))]);
    setRedoStack([]);
  };

  const onCanvasClick = (event, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xValue = 200 + ((x - 50) / (canvas.width - 100)) * 800;
    const yValue = 1000 - ((y - 50) / (canvas.height - 100)) * 1000;

    if (activePolygon !== null) {
      updateHistory();
      setPolygons((prev) =>
        prev.map((polygon, index) =>
          index === activePolygon
            ? { ...polygon, points: [...polygon.points, { x: xValue, y: yValue }] }
            : polygon
        )
      );
    }
  };

  const onUpdatePolygon = (index, property, value) => {
    updateHistory();
    setPolygons((prev) =>
      property === 'delete'
        ? prev.filter((_, i) => i !== index)
        : prev.map((polygon, i) =>
            i === index ? { ...polygon, [property]: value } : polygon
          )
    );
  };

  const onChangeOrder = (index, direction) => {
    updateHistory();
    setPolygons((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(direction === 'up' ? index - 1 : index + 1, 0, moved);
      return updated;
    });
  };

  return (
    <div>
      <ScatterPlotCanvas
        data={data}
        polygons={polygons}
        activePolygon={activePolygon}
        onCanvasClick={onCanvasClick}
      />
      <PolygonControls
        polygons={polygons}
        activePolygon={activePolygon}
        onCreatePolygon={() => {
          updateHistory();
          setPolygons((prev) => [
            ...prev,
            { points: [], label: `Polygon ${prev.length + 1}`, borderColor: '#0000FF', hidden: false },
          ]);
          setActivePolygon(polygons.length);
        }}
        onClosePolygon={() => {
          if (activePolygon !== null) {
            updateHistory();
            setPolygons((prev) =>
              prev.map((polygon, index) =>
                index === activePolygon && polygon.points.length > 2
                  ? { ...polygon, points: [...polygon.points, polygon.points[0]] }
                  : polygon
              )
            );
            setActivePolygon(null);
          }
        }}
        onUndo={() => {
          if (history.length > 0) {
            const lastState = history.pop();
            setRedoStack((prev) => [polygons, ...prev]);
            setPolygons(lastState);
          }
        }}
        onRedo={() => {
          if (redoStack.length > 0) {
            const nextState = redoStack.shift();
            setHistory((prev) => [...prev, polygons]);
            setPolygons(nextState);
          }
        }}
        onExportPolygons={() => exportPolygonsToFile(polygons)}
        onImportPolygons={(e) => importPolygonsFromFile(e, setPolygons, updateHistory)}
        onUpdatePolygon={onUpdatePolygon}
        onChangeOrder={onChangeOrder}
      />
    </div>
  );
};

export default ScatterPlotWithPolygonTool;
