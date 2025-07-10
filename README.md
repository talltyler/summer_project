# Aquarium Products - Full Stack Project

A product management system that will evolve into a 3D aquarium experience over 8 weeks.

## Week 1: Foundation Setup

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Git
- Cloudflare account (free tier)

### Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd aquarium-products
   npm install
   ```

2. **Cloudflare Setup**
   ```bash
   # Install Wrangler globally
   npm install -g wrangler

   # Login to Cloudflare
   wrangler login

   # Create D1 database
   wrangler d1 create aquarium-db
   ```

3. **Configure Database**
   - Copy the database ID from the previous command
   - Update `wrangler.toml` with your actual database ID
   
   ```bash
   # Run migrations
   wrangler d1 execute aquarium-db --file=src/db/migrations/001_initial_schema.sql
   ```

4. **Local Development**
   ```bash
   # Start local development server
   npm run dev
   ```

5. Open http://localhost:8788 in your browser

6. **Deploy to Production**
   ```bash
   # Deploy to Cloudflare Pages
   npm run deploy
   ```

### Project Structure

```
aquarium-products/
├── src/                    # Backend source code
│   ├── models/            # Sutando ORM models
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express-like middleware
│   ├── db/               # Database config and migrations
│   └── utils/            # Utility functions
├── functions/            # Cloudflare Functions
├── public/              # Frontend static files
├── package.json         # Dependencies and scripts
└── wrangler.toml       # Cloudflare configuration
```

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/products` - List all products (with filtering)
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Student Learning Objectives - Week 1

By the end of this week, students should understand:

- How a full-stack application is structured
- The relationship between frontend, backend, and database
- How API endpoints work
- Basic CRUD operations
- How to make HTTP requests from JavaScript

### Next Steps

In Week 2, we'll add user authentication and expand the product management features.

### Troubleshooting

**Database Issues:**
- Ensure you've run the migration: `wrangler d1 execute aquarium-db --file=src/db/migrations/001_initial_schema.sql`
- Check that your database ID in `wrangler.toml` matches your actual D1 database

**API Not Working:**
- Check browser console for errors
- Verify the API health endpoint: `/api/health`
- Ensure CORS headers are properly set

**Deployment Issues:**
- Make sure you're logged into Wrangler: `wrangler login`
- Verify your Cloudflare account has Pages enabled
- Check that all dependencies are in `package.json`

## Student Homework Assignment - Week 1

**Individual Tasks (each student picks one):**

1. **Student A:** Add a new API endpoint `GET /api/products/categories` that returns all unique categories from the database
2. **Student B:** Add a new API endpoint `GET /api/products/stats` that returns basic statistics (total products, average rating, most popular category)
3. **Student C:** Enhance the frontend search to also search through tags, and add a "Clear Filters" button

**Shared Learning:**
- All students should add at least 3 products through the UI
- All students should test all existing API endpoints using browser developer tools
- All students should read through the entire codebase and add comments explaining what they understand

**Questions to Research:**
1. What is an ORM and why do we use Sutando?
2. What are the differences between PUT and POST HTTP methods?
3. How do database indexes improve performance?
4. What is CORS and why do we need it?

This foundation provides a complete, working product management system that students can understand, extend, and build upon. The code is extensively commented, follows best practices, and sets up all the infrastructure needed for the remaining 7 weeks of development.