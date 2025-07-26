# Variant Credible Set Graph

This project is an interactive data visualization component built with **Remix and React** for visualizing genetic association data. Its primary feature is a two-step Manhattan plot designed to display credible sets and the individual genetic variants they contain.

It allows researchers to get a high-level, genome-wide view of significant genetic regions and then seamlessly drill down to investigate the specific variants within those regions.

## Key Features

- **Credible Set Overview:** The initial view displays a Manhattan plot of the lead variants for each credible set, providing a clear overview of significant loci across the genome.
- **Variant-Level Detail:** By interacting with the plot, users can "zoom in" on a specific credible set to see a detailed plot of all the individual variants it contains.
- **Interactive Exploration:** The visualization is fully interactive, supporting smooth zooming and panning across chromosomes for detailed data exploration.
- **Focus + Context View:** A small overview plot at the bottom shows the entire genome and is synchronized with the main plot, making it easy to understand your current position and navigate large datasets.

## How It Works

The application uses the powerful **D3.js** library to render a custom SVG-based visualization. The core logic processes genetic data to calculate a "global position" for each variant, allowing all chromosomes to be displayed in a single, continuous line.

The interface consists of two main parts:

1.  **The Main Plot (Focus):** The large, detailed plot where you can see individual data points. You can zoom and pan within this plot.
2.  **The Overview Plot (Context):** A small plot at the bottom that shows the entire dataset. You can drag a selection on this plot to control the region displayed in the main plot above.

## Core Technologies

- **Remix:** The full-stack web framework used for routing, data loading, and structuring the application.
- **React:** Powers the user interface and the functional, component-based architecture.
- **D3.js:** Used for all low-level data binding, SVG rendering, and interactivity (zooming, brushing).

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Macmilan24/Remix-variant-credibleset-graph.git
    cd Remix-variant-credibleset-graph.git
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Run the development server**

    ```bash
    npm run dev
    ```

4.  **Open your browser** and navigate to the local URL provided in the terminal (usually `http://localhost:5173`).

## Data Source

This project is currently configured to load sample data for demonstration purposes. In a Remix application, this data is typically managed within a `loader` function for a specific route, often located in files like `app/routes/_index.jsx`. The architecture is designed to be easily adaptable to fetch live data from a database or a GraphQL API within these loaders.
