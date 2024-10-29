# Ace Product Lookup

Ace Product Lookup is a web application designed to help cashiers and employees at a local hardware store quickly and easily find product information, including SKU numbers, descriptions, and warehouse locations. This app replaces the traditional paper binder used in-store, providing a more efficient and user-friendly experience.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Setup and Installation](#setup-and-installation)
- [Using Docker](#using-docker)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Product Search**: Quickly search for products by name, SKU, or category.
- **Category Filtering**: Filter products based on their categories.
- **Most Copied Items**: View the top 10 most copied items and the last 10 recently copied items.
- **Edit Product Details**: Authorized users can edit product details, such as name, SKU, and category.
- **Responsive Design**: Optimized for use on large screens, suitable for in-store kiosks or terminals.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Bootstrap for styling)
- **Backend**: Node.js, Express.js
- **Database**: SQLite (local storage)
- **Containerization**: Docker for development and deployment

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Docker (optional, for containerization)

### Setup and Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/bigspacebar/ace-product-lookup.git
    cd ace-product-lookup
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Start the application:

    ```bash
    node backend.js
    ```

4. Open your browser and navigate to `http://localhost:3000` to view the application.

### Using Docker

You can also run the application using Docker:

1. Build the Docker image:

    ```bash
    docker build -t ace-product-lookup .
    ```

2. Run the Docker container:

    ```bash
    docker run -p 3000:3000 ace-product-lookup
    ```

3. Access the application at `http://localhost:3000`.

### API Endpoints

- **GET** `/api/products`: Retrieve all products or filter by name, SKU, or category.
- **PUT** `/api/products/:sku`: Update the product details with the specified SKU.
- **GET** `/api/categories`: Retrieve all unique product categories.

### Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/my-new-feature`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/my-new-feature`).
5. Open a pull request.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
