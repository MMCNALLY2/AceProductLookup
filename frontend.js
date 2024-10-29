document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables at the top of the script
    let categoriesList = []; // To store all categories
    let skuCopyCounts = {}; // To track how many times each SKU is copied
    let recentlyCopiedItems = []; // Array to store 10 most recently copied items
    let currentEditingProduct = null; // To keep track of the product being edited

    const searchBar = document.getElementById('searchBar');
    const categorySearchInput = document.getElementById('categorySearchInput');
    const categoriesFilter = document.getElementById('categoriesFilter');
    const results = document.getElementById('results');
    const topItemsList = document.getElementById('topItemsList');
    const recentItemsList = document.getElementById('recentItemsList');

    // Key names for storing data in local storage
    const TOP_ITEMS_STORAGE_KEY = 'topItems';
    const RECENT_ITEMS_STORAGE_KEY = 'recentItems';

    // Load data from local storage before event listeners or function calls
    loadStoredLists(); // Load `skuCopyCounts` and `recentlyCopiedItems` from local storage

 //--------------------------Event listeners----------------------------------------------------------------------------------------
    document.getElementById('closeEditButton').addEventListener('click', closeEditForm);

    document.getElementById('saveChangesButton').addEventListener('click', saveProductChanges);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
            searchBar.value = '';
            categoriesFilter.value = '';
            categorySearchInput.value = '';
            results.innerHTML = '';
            categoriesFilter.style.display = 'none';
            searchBar.focus();
        }
    });

    // Filter the categories dropdown based on the input in the search field
    categorySearchInput.addEventListener('input', () => {
        const query = categorySearchInput.value.toLowerCase();
        const filteredCategories = categoriesList.filter(category => category.toLowerCase().includes(query));
        populateCategoriesDropdown(filteredCategories);
        categoriesFilter.style.display = 'block';
    });

    searchBar.addEventListener('input', () => {
        searchProducts(searchBar.value, categoriesFilter.value);
    });

    // Add event listener for selecting an option from the dropdown
    categoriesFilter.addEventListener('change', function () {
        const selectedCategory = categoriesFilter.value;

        // Update the category input box with the selected category
        categorySearchInput.value = selectedCategory;

        // Hide the dropdown
        categoriesFilter.style.display = 'none';

        // Trigger a product search with the selected category
        searchProducts(searchBar.value, selectedCategory);
    });

    categorySearchInput.addEventListener('focus', () => {
        populateCategoriesDropdown(categoriesList);
        categoriesFilter.style.display = 'block';
    });

    document.addEventListener('click', (event) => {
        if (!categorySearchInput.contains(event.target) && !categoriesFilter.contains(event.target)) {
            categoriesFilter.style.display = 'none';
        }
    });

    // Load categories on page load
    loadCategories();
//----------------------------------------------------------------------------------------------------------------------------------



//-------------------------------Load the stored lists from local storage---------------------------------------------------
    function loadStoredLists() {
        const storedTopItems = JSON.parse(localStorage.getItem(TOP_ITEMS_STORAGE_KEY)) || {};
        const storedRecentItems = JSON.parse(localStorage.getItem(RECENT_ITEMS_STORAGE_KEY)) || [];

        // Ensure `skuCopyCounts` is an object
        skuCopyCounts = typeof storedTopItems === 'object' ? storedTopItems : {};
        
        // Ensure `recentlyCopiedItems` is an array
        recentlyCopiedItems = Array.isArray(storedRecentItems) ? storedRecentItems : [];

        console.log('Loaded skuCopyCounts from storage:', skuCopyCounts);
        console.log('Loaded recentlyCopiedItems from storage:', recentlyCopiedItems);

        // Update UI with loaded data
        updateTopCopiedItems();
        updateRecentlyCopiedItems();
    }
//----------------------------------------------------------------------------------------------------------------------



//----------------------------------Save top items to local storage-------------------------------------------------------
    function saveTopItems() {
        localStorage.setItem(TOP_ITEMS_STORAGE_KEY, JSON.stringify(skuCopyCounts));
    }
//-----------------------------------------------------------------------------------------------------------------------



//----------------------------------Save recent items to local storage---------------------------------------------------
    function saveRecentItems() {
        console.log('Saving recent items to local storage:', recentlyCopiedItems);
        localStorage.setItem(RECENT_ITEMS_STORAGE_KEY, JSON.stringify(recentlyCopiedItems));
    }
//-----------------------------------------------------------------------------------------------------------------------



//--------------------------------------Function to handle SKU copy event------------------------------------------------
    function handleSkuCopy(product) {
        console.log('Handling SKU copy event for product:', product); // Log the product being copied
    
        // Increment the copy count for this SKU and store the product name
        if (!skuCopyCounts[product.sku]) {
            skuCopyCounts[product.sku] = { name: product.name, count: 0 };
        }
        skuCopyCounts[product.sku].count += 1;
    
        // Update the top 10 most copied items list
        updateTopCopiedItems();
    
        // Add the product to the recently copied list
        console.log('Before adding to recentlyCopiedItems:', recentlyCopiedItems); // Log the array before update
        recentlyCopiedItems = recentlyCopiedItems.filter(item => item.sku !== product.sku); // Remove duplicates
        recentlyCopiedItems.unshift(product); // Add to beginning of the array
        console.log('After adding to recentlyCopiedItems:', recentlyCopiedItems); // Log the array after update
    
        // Limit the array to 10 items
        if (recentlyCopiedItems.length > 10) {
            recentlyCopiedItems.pop();
        }
    
        // Update the recent items list
        updateRecentlyCopiedItems();
    }
//--------------------------------------------------------------------------------------------------------------------------



//--------------------------------------Function to update the top 10 most copied items list-----------------------------------
    function updateTopCopiedItems() {
        // Get the top 10 SKUs by copy count
        const topCopiedSKUs = Object.entries(skuCopyCounts)
            .sort((a, b) => b[1].count - a[1].count) // Sort by copy count, descending
            .slice(0, 10); // Get top 10 items

        // Clear the top items list
        topItemsList.innerHTML = '';

        // Populate the top items list
        topCopiedSKUs.forEach(([sku, { name }]) => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'top-item');

            // Display the product name
            const itemName = document.createElement('span');
            itemName.textContent = name;

            // Create a button to copy the SKU
            const copyButton = document.createElement('button');
            copyButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
            copyButton.textContent = sku;
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(sku).then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = sku;
                    }, 1000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });

            li.appendChild(itemName);
            li.appendChild(copyButton);
            topItemsList.appendChild(li);
        });

        // Save the updated top items to local storage
        saveTopItems();
    }
//-----------------------------------------------------------------------------------------------------------------------------



//------------------------Function to update the right panel with 10 most recently copied items-----------------------------------
    function updateRecentlyCopiedItems() {
        console.log('Updating recent copied items UI:', recentlyCopiedItems); // Log the array before rendering
    
        // Clear and update the recent items list
        recentItemsList.innerHTML = '';
        recentlyCopiedItems.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'top-item');
    
            // Display the product name
            const itemName = document.createElement('span');
            itemName.textContent = item.name;
    
            // Create a button to copy the SKU
            const copyButton = document.createElement('button');
            copyButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
            copyButton.textContent = item.sku;
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(item.sku).then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = item.sku;
                    }, 1000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });
    
            li.appendChild(itemName);
            li.appendChild(copyButton);
            recentItemsList.appendChild(li);
        });
    
        // Save the updated recent items to local storage
        saveRecentItems();
        console.log('Recent items saved to local storage:', recentlyCopiedItems); // Confirm data is saved
    }

    // Initial load of stored lists
    loadStoredLists();
//----------------------------------------------------------------------------------------------------------------------------------



//-------------------------------Function to fetch categories and populate the dropdown----------------------------------------------
    function loadCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                categoriesList = categories; // Save the categories to a global variable
                console.log('Categories received from API:', categories);

                populateCategoriesDropdown(categories);
            })
            .catch(error => console.error('Error fetching categories:', error));
    }
//-----------------------------------------------------------------------------------------------------------------------------------



//------------------------Function to populate the categories dropdown based on a given list of categories---------------------------
    function populateCategoriesDropdown(categories) {
        categoriesFilter.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All Categories';
        categoriesFilter.appendChild(defaultOption);

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoriesFilter.appendChild(option);
        });
    }
//------------------------------------------------------------------------------------------------------------------------------------



//--------------------------Function to search products using the query and selected category-----------------------------------------
    function searchProducts(query, category) {
        const url = `/api/products?query=${encodeURIComponent(query)}&categories=${encodeURIComponent(category)}`;

        fetch(url)
            .then(response => response.json())
            .then(products => {
                results.innerHTML = '';

                console.log('Filtered products received from API:', products);

                if (products.length > 0) {
                    products.forEach(product => {
                        const li = document.createElement('li');
                        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

                        // Create a span to hold the product details
                        const productDetails = document.createElement('span');
                        productDetails.textContent = `${product.name} - Location: ${product.location}`;

                        // Create a button for copying the SKU
                        const copyButton = document.createElement('button');
                        copyButton.classList.add('btn', 'btn-outline-primary', 'btn-lg', 'w-50', 'ms-auto');
                        copyButton.textContent = product.sku;

                        // Add click event listener to copy the SKU and track it
                        copyButton.addEventListener('click', () => {
                            navigator.clipboard.writeText(product.sku).then(() => {
                                // Increment the copy count for this SKU and store the product name
                                if (!skuCopyCounts[product.sku]) {
                                    skuCopyCounts[product.sku] = { name: product.name, count: 0 };
                                }
                                skuCopyCounts[product.sku].count += 1;
                                
                                // Optionally, provide user feedback that the SKU has been copied
                                copyButton.textContent = 'Copied!';
                                handleSkuCopy(product);
                                setTimeout(() => {
                                    copyButton.textContent = product.sku;
                                }, 1000);
                        
                                // Update the top 10 most copied and recent items lists
                                updateTopCopiedItems();
                                updateRecentlyCopiedItems({ name: product.name, sku: product.sku });

                            }).catch(err => {
                                console.error('Failed to copy text: ', err);
                            });
                        });

                    // Create a container to hold the edit options (3-dot icon and edit button)
                    const editOptionsContainer = document.createElement('div');
                    editOptionsContainer.classList.add('edit-options-container');

                    // Create the 3-dot icon button
                    const threeDotIcon = document.createElement('button');
                    threeDotIcon.innerHTML = '⋮'; // 3-dot icon character
                    threeDotIcon.classList.add('btn', 'three-dot-icon');
                    threeDotIcon.setAttribute('aria-label', 'More options');

                    // Create the Edit button, initially hidden
                    const editButton = document.createElement('button');
                    editButton.classList.add('btn', 'btn-outline-secondary', 'btn-sm', 'edit-button');
                    editButton.textContent = 'Edit';
                    editButton.style.display = 'none'; // Initially hidden

                    // Add click event listener to the 3-dot icon to toggle the edit button
                    threeDotIcon.addEventListener('click', () => {
                        // Toggle the display of the edit button
                        editButton.style.display = editButton.style.display === 'none' ? 'block' : 'none';
                    });
                    // Add click event listener to open the edit form/modal
                    editButton.addEventListener('click', () => {
                        openEditForm(product); // Function to open the edit form with product details
                    });

                    // Append the 3-dot icon and edit button to the container
                    editOptionsContainer.appendChild(threeDotIcon);
                    editOptionsContainer.appendChild(editButton);

                        li.appendChild(productDetails);
                        li.appendChild(copyButton);
                        li.appendChild(editOptionsContainer);
                        results.appendChild(li);
                    });
                } else {
                    results.innerHTML = '<li class="list-group-item">No products found</li>';
                }
            })
            .catch(error => {
                console.error('Error fetching products:', error.message);
                results.innerHTML = `<li class="list-group-item">Error: ${error.message}</li>`;
            });
    }
//------------------------------------------------------------------------------------------------------------------------------------



//---------------------------------Functions to open the edit form with product details-----------------------------------------
  function openEditForm(product) {
    currentEditingProduct = product; // Store the current product being edited

    // Fill the form with the product's current details
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductSKU').value = product.sku;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductLocation').value = product.location;

    // Show the edit modal
    document.getElementById('editProductModal').style.display = 'block';
  }
//---------------------------------------------------------------------------------------------------------------------------------


//-----------------------------Function to close the edit form----------------------------------------------------------------------
  function closeEditForm() {
    document.getElementById('editProductModal').style.display = 'none';
  }
//-----------------------------------------------------------------------------------------------------------------------------------



// Function to handle saving the product changes
function saveProductChanges() {
    // Get the updated values from the form
    const updatedProduct = {
      name: document.getElementById('editProductName').value,
      sku: document.getElementById('editProductSKU').value, // New SKU value
      newSku: document.getElementById('editProductSKU').value, // Send new SKU as a separate field
      category: document.getElementById('editProductCategory').value,
      location: document.getElementById('editProductLocation').value
    };
  
    // Send the updated product to the backend for saving
    fetch(`/api/products/${currentEditingProduct.sku}`, { // Use original SKU in the URL
      method: 'PUT', // Use PUT or PATCH for updating
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedProduct) // Send updated data with new SKU field
    })
      .then(response => response.json())
      .then(data => {
        console.log('Product updated successfully:', data);
  
        // Update the UI with the new product details
        updateProductInLists(updatedProduct);
        searchProducts(searchBar.value, categoriesFilter.value);
  
        // Close the edit form
        closeEditForm();
      })
      .catch(error => {
        console.error('Error updating product:', error);
      });
  }  
//-------------------------------------------------------------------------------------------------------------------------------



// ------------------------Function to update product details in both common and recent items lists-------------------------------
    function updateProductInLists(updatedProduct) {
        console.log('Updating product in lists:', updatedProduct);

        // Update in commonItems (if applicable)
        if (skuCopyCounts && typeof skuCopyCounts === 'object') {
            // Check if the product SKU exists in the skuCopyCounts object
            if (skuCopyCounts[updatedProduct.sku]) {
                // Update the name field of the corresponding product
                skuCopyCounts[updatedProduct.sku].name = updatedProduct.name;
            } else {
                // If the SKU is not found, you can add it (optional)
                console.warn(`SKU ${updatedProduct.sku} not found in skuCopyCounts. Adding it.`);
                skuCopyCounts[updatedProduct.sku] = { name: updatedProduct.name, count: 0 };
            }
            
            console.log('Updated common items:', skuCopyCounts);
        
            // Save the updated common items to local storage
            localStorage.setItem('skuCopyCounts', JSON.stringify(skuCopyCounts));
        }

        // Update in recentlyCopiedItems (if applicable)
        if (recentlyCopiedItems) {
            recentlyCopiedItems = recentlyCopiedItems.map(item =>
                item.sku === updatedProduct.sku ? { ...item, name: updatedProduct.name } : item
            );
            console.log('Updated recent items:', recentlyCopiedItems);

            // Save the updated recent items to local storage
            localStorage.setItem('recentItems', JSON.stringify(recentlyCopiedItems));
        }
    }
//-----------------------------------------------------------------------------------------------------------------------------



});