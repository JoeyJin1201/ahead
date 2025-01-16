import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

const ScatterPlotCanvas = ({ data, polygons, onCanvasClick }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const drawCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      const xScale = d3.scaleLinear().domain([200, 1000]).range([50, width - 50]);
      const yScale = d3.scaleLinear().domain([0, 1000]).range([height - 50, 50]);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw title
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Cell Distribution (CD45+)', width / 2, 30);

      // Draw axes
      ctx.beginPath();
      ctx.moveTo(50, height - 50); // x-axis
      ctx.lineTo(width - 50, height - 50);
      ctx.moveTo(50, height - 50); // y-axis
      ctx.lineTo(50, 50);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw axis labels
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CD45-KrO', width / 2, height - 10); // x-axis label
      ctx.save();
      ctx.translate(10, height / 2); // y-axis label
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('SS INT LIN', 0, 0);
      ctx.restore();

      // Draw axis ticks
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      for (let i = 200; i <= 1000; i += 200) {
        const x = xScale(i);
        const y = yScale(i);

        // x-axis ticks
        ctx.fillText(i, x, height - 35);

        // y-axis ticks
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
          ctx.setLineDash(polygon.lineStyle || []);
          ctx.stroke();

          // Draw label and point count
          const labelPosX = xScale(polygon.points[0].x);
          const labelPosY = yScale(polygon.points[0].y);
          const insideCount = data.filter((d) =>
            d3.polygonContains(
              polygon.points.map((p) => [xScale(p.x), yScale(p.y)]),
              [xScale(d.x), yScale(d.y)]
            )
          ).length;
          const percentage = ((insideCount / data.length) * 100).toFixed(2);

          ctx.fillStyle = 'black';
          ctx.font = '14px Arial';
          ctx.fillText(`${polygon.label || `Polygon ${index + 1}`}`, labelPosX, labelPosY);
          ctx.fillText(`${insideCount} points (${percentage}%)`, labelPosX, labelPosY + 15);
        }
      });
    };

    drawCanvas();
  }, [data, polygons]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: '1px solid black' }}
      onClick={(e) => onCanvasClick(e, canvasRef.current)}
    />
  );
};

export default ScatterPlotCanvas;
