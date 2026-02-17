# Botanic Care - E-commerce Platform

A modern e-commerce platform for natural skincare and wellness products built with React, TypeScript, Vite, and Supabase.

## Features

- 🛍️ Product catalog with filtering and search
- 🛒 Shopping cart and wishlist functionality
- 💳 Multiple payment methods
- 🎨 Beautiful, modern UI with custom branding
- 📱 Fully responsive design
- 🔐 Supabase backend integration

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Run the SQL script from `supabase-schema.sql` to create the products table
4. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Web3Forms Configuration (for contact form)
# Get your access key from https://web3forms.com
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_access_key
```

#### Setting up Web3Forms:

1. Go to [web3forms.com](https://web3forms.com) and sign up
2. Verify your email address
3. Get your Access Key from the dashboard
4. Add it to your `.env` file as `VITE_WEB3FORMS_ACCESS_KEY`

### 4. Run the Development Server

```bash
npm run dev
```

## Database Schema

The application uses a `products` table with the following structure:
- Product information (name, description, price)
- Category classification
- Images and media
- Inventory status
- Ratings and reviews
- Ingredients and benefits

See `supabase-schema.sql` for the complete schema definition.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React Query, Context API
- **Routing**: React Router v6
