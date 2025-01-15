import * as d3 from 'd3';
import Papa from 'papaparse';
import React, { useEffect, useRef, useState } from 'react';

const ScatterPlotWithPolygonTool = () => {
  const canvasRef = useRef();
  const [data, setData] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [activePolygon, setActivePolygon] = useState(null);
  const [history, setHistory] = useState([]); // To store history for undo/redo
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    // Load CSV data
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
      error: (error) => {
        console.error("Error loading CSV:", error);
      },
    });
  }, []);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const xScale = d3.scaleLinear().domain([200, 1000]).range([50, width - 50]);
    const yScale = d3.scaleLinear().domain([0, 1000]).range([height - 50, 50]);

    ctx.clearRect(0, 0, width, height);

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(50, height - 50);
    ctx.lineTo(width - 50, height - 50);
    ctx.moveTo(50, height - 50);
    ctx.lineTo(50, 50);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CD45-KrO', width / 2, height - 10);
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('SS INT LIN', 0, 0);
    ctx.restore();

    // Draw axis ticks
    for (let i = 200; i <= 1000; i += 200) {
      const x = xScale(i);
      const y = yScale(i);
      ctx.fillText(i, x, height - 35);
      ctx.fillText(i, 30, y + 5);
    }

    // Draw scatter points
    data.forEach((d) => {
      ctx.beginPath();
      ctx.arc(xScale(d.x), yScale(d.y), 2, 0, Math.PI * 2);
      ctx.fillStyle = 'gray';
      ctx.fill();
    });

    // Draw polygons
    polygons.forEach((polygon, index) => {
      if (polygon.points.length > 1 && !polygon.hidden) {
        ctx.beginPath();
        ctx.moveTo(xScale(polygon.points[0].x), yScale(polygon.points[0].y));
        polygon.points.forEach((p) =>
          ctx.lineTo(xScale(p.x), yScale(p.y))
        );
        ctx.closePath();

        ctx.strokeStyle = polygon.borderColor || 'blue';
        ctx.lineWidth = polygon.lineWidth || 2;
        ctx.stroke();

        // Draw polygon label
        const labelPosX = xScale(polygon.points[0].x);
        const labelPosY = yScale(polygon.points[0].y);
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.fillText(polygon.label || `Polygon ${index + 1}`, labelPosX, labelPosY);

        // Calculate and display point count inside polygon
        const insideCount = data.filter((d) =>
          d3.polygonContains(
            polygon.points.map((p) => [xScale(p.x), yScale(p.y)]),
            [xScale(d.x), yScale(d.y)]
          )
        ).length;
        const percentage = ((insideCount / data.length) * 100).toFixed(2);
        ctx.fillText(`${insideCount} points (${percentage}%)`, labelPosX, labelPosY + 15);
      }
    });
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xScale = d3.scaleLinear().domain([200, 1000]).range([50, canvas.width - 50]);
    const yScale = d3.scaleLinear().domain([0, 1000]).range([canvas.height - 50, 50]);

    const xValue = xScale.invert(x);
    const yValue = yScale.invert(y);

    if (activePolygon !== null) {
      setPolygons((prevPolygons) =>
        prevPolygons.map((polygon, index) =>
          index === activePolygon
            ? { ...polygon, points: [...polygon.points, { x: xValue, y: yValue }] }
            : polygon
        )
      );
    }
  };

  const createNewPolygon = () => {
    setPolygons((prevPolygons) => [
      ...prevPolygons,
      {
        points: [],
        label: `Polygon ${prevPolygons.length + 1}`,
        borderColor: '#0000FF', // Default blue border
        lineWidth: 2,
        hidden: false,
        order: prevPolygons.length
      },
    ]);
    setActivePolygon(polygons.length);
  };

  const closePolygon = () => {
    if (activePolygon !== null) {
      setPolygons((prevPolygons) =>
        prevPolygons.map((polygon, index) =>
          index === activePolygon && polygon.points.length > 2
            ? { ...polygon, points: [...polygon.points, polygon.points[0]] }
            : polygon
        )
      );
      setActivePolygon(null);
    }
  };

  const updatePolygonBorderColor = (index, newColor) => {
    setPolygons((prevPolygons) =>
      prevPolygons.map((polygon, i) =>
        i === index ? { ...polygon, borderColor: newColor } : polygon
      )
    );
  };

  const undo = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setRedoStack((prevRedoStack) => [polygons, ...prevRedoStack]);
      setPolygons(lastState);
      setHistory((prevHistory) => prevHistory.slice(0, -1));
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setHistory((prevHistory) => [...prevHistory, polygons]);
      setPolygons(nextState);
      setRedoStack((prevRedoStack) => prevRedoStack.slice(1));
    }
  };

  const exportPolygons = () => {
    const blob = new Blob([JSON.stringify(polygons, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'polygons.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importPolygons = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const importedPolygons = JSON.parse(e.target.result);
        setPolygons(importedPolygons);
      };
      reader.readAsText(file);
    }
  };

  const changeOrder = (index, direction) => {
    setPolygons((prevPolygons) => {
      const newPolygons = [...prevPolygons];
      const [movedPolygon] = newPolygons.splice(index, 1);
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      newPolygons.splice(newIndex, 0, movedPolygon);
      return newPolygons;
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [data, polygons]);

  return (
    <div>
      <h1>Cell Distribution (CD45+)</h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black' }}
        onClick={handleCanvasClick}
      />
      <div>
        <button onClick={createNewPolygon}>Arbitrary Polygon</button>
        <button onClick={closePolygon} disabled={activePolygon === null}>
          Close Polygon
        </button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={exportPolygons}>Export Polygons</button>
        <input type="file" onChange={importPolygons} />
        <ul>
          {polygons.map((polygon, index) => (
            <li key={index}>
              <input
                type="text"
                value={polygon.label}
                onChange={(e) =>
                  setPolygons((prevPolygons) =>
                    prevPolygons.map((p, i) =>
                      i === index ? { ...p, label: e.target.value } : p
                    )
                  )
                }
              />
              <input
                type="color"
                value={polygon.borderColor}
                onChange={(e) => updatePolygonBorderColor(index, e.target.value)}
              />
              <button
                onClick={() =>
                  setPolygons((prevPolygons) =>
                    prevPolygons.map((p, i) =>
                      i === index ? { ...p, hidden: !p.hidden } : p
                    )
                  )
                }
              >
                {polygon.hidden ? 'Show' : 'Hide'}
              </button>
              <button onClick={() => changeOrder(index, 'up')} disabled={index === 0}>
                Move Up
              </button>
              <button
                onClick={() => changeOrder(index, 'down')}
                disabled={index === polygons.length - 1}
              >
                Move Down
              </button>
              <button
                onClick={() =>
                  setPolygons((prevPolygons) =>
                    prevPolygons.filter((_, i) => i !== index)
                  )
                }
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ScatterPlotWithPolygonTool;
