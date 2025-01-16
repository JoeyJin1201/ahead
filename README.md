# Ahead

## Overview

This project is a React-based application that visualizes data and provides interactive controls. With the addition of Docker support, you can now containerize and run the application seamlessly across different environments.

## Prerequisites

Before getting started, make sure you have the following installed:

- [Docker](https://www.docker.com/)

## Getting Started

### 1. Clone the Repository

Clone the project repository to your local machine:

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Build and Run with Docker

1. Build the Docker image:

   ```bash
   docker build -t ahead .
   ```

2. Run the Docker container:

   ```bash
   docker run -p 3000:3000 ahead
   ```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to access the application.

### 3. Stopping the Application

To stop the container, press `Ctrl+C` in the terminal or use the following command to stop and remove the running container:

```bash
docker stop $(docker ps -q --filter ancestor=my-app)
```

Replace `my-app` with your Docker image name if you used a different one.

## Project Structure

```
├── public/
│   ├── favicon.ico
│   ├── index.html
│   └── data/
│       └── CD45_pos.csv
├── src/
│   ├── components/
│   │   ├── PolygonControls.jsx
│   │   ├── ScatterPlotCanvas.jsx
│   │   └── ScatterPlotWithPolygonTool.jsx
│   ├── utils/
│   │   └── fileOperations.js
│   ├── App.js
│   ├── index.css
│   └── index.js
├── Dockerfile
├── package.json
├── package-lock.json
└── README.md
```

## Troubleshooting

If you encounter any issues:

1. Ensure Docker is running.
2. Check for port conflicts (default is `3000`).
3. Use the following command to rebuild the container:
   ```bash
   docker build -t my-app .
   docker run -p 3000:3000 my-app
   ```
