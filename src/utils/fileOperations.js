export const exportPolygonsToFile = (polygons) => {
  const blob = new Blob([JSON.stringify(polygons, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "polygons.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importPolygonsFromFile = (event, setPolygons, updateHistory) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const importedPolygons = JSON.parse(e.target.result);
      updateHistory();
      setPolygons(importedPolygons);
    };
    reader.readAsText(file);
  }
};
