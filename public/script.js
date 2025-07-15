// API Base URL
const API_BASE = '/api';

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const addProductBtn = document.getElementById('add-product-btn');
const addProductModal = document.getElementById('add-product-modal');
const addProductForm = document.getElementById('add-product-form');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const closeModal = document.querySelector('.close');

// State
let products = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    addProductBtn.addEventListener('click', openAddProductModal);
    closeModal.addEventListener('click', closeAddProductModal);
    addProductForm.addEventListener('submit', handleAddProduct);
    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addProductModal) {
            closeAddProductModal();
        }
    });
}

// API Functions
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const result = await response.json();
        
        if (result.success) {
            products = result.data;
            renderProducts(products);
        } else {
            console.error('Failed to load products:', result.error);
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function createProduct(productData) {
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadProducts(); // Reload products
            closeAddProductModal();
            return true;
        } else {
            alert('Error creating product: ' + result.error);
            return false;
        }
    } catch (error) {
        console.error('Error creating product:', error);
        alert('Error creating product');
        return false;
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadProducts(); // Reload products
        } else {
            alert('Error deleting product: ' + result.error);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
    }
}

// UI Functions
function renderProducts(productsToRender) {
    productsGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = '<p>No products found. Add your first product!</p>';
        return;
    }
    
    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const tags = Array.isArray(product.tags) ? product.tags : [];
    const tagsHtml = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    const rating = '★'.repeat(Math.floor(product.user_rating)) + '☆'.repeat(5 - Math.floor(product.user_rating));
    
    card.innerHTML = `
        <h3>${product.name}</h3>
        <div class="category">${product.category}</div>
        <div class="rating">${rating} (${product.user_rating}/5)</div>
        <p>${product.description || 'No description available'}</p>
        <div class="tags">${tagsHtml}</div>
        <div class="actions">
            <button class="edit-btn" onclick="editProduct(${product.id})">Edit</button>
            <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
        </div>
    `;
    
    return card;
}

function openAddProductModal() {
    addProductModal.style.display = 'block';
}

function closeAddProductModal() {
    addProductModal.style.display = 'none';
    addProductForm.reset();
}

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    
    let filteredProducts = products;
    
    // Filter by search term
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by category
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => 
            product.category === categoryFilter
        );
    }
    
    renderProducts(filteredProducts);
}

// Form Handlers
function handleAddProduct(event) {
    event.preventDefault();
    
    const formData = new FormData(addProductForm);
    const tags = document.getElementById('product-tags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    
    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        category: document.getElementById('product-category').value,
        tags: tags
    };
    
    createProduct(productData);
    console.log(productData.name + " Created!");
}

// Placeholder functions for future implementation
function editProduct(id) {
    alert('Edit functionality will be implemented in Week 4');
}

// Make functions globally available
window.deleteProduct = deleteProduct;
window.editProduct = editProduct;