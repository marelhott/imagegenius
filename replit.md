# AI Image Forge - Replit Project Documentation

## Overview

AI Image Forge is a modern web application for AI-powered image-to-image generation. The application provides a professional interface inspired by RunwayML and Figma, allowing users to upload images and generate new variations using AI models with customizable settings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with a clear separation between client and server:

- **Frontend**: React + Vite with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Build Tool**: Vite for frontend, esbuild for backend

## Key Components

### Frontend Architecture

The client-side application is built with:

- **React Router**: Wouter for lightweight routing
- **Component Library**: shadcn/ui components for consistent UI
- **Styling**: Tailwind CSS with custom color scheme (#6C63FF primary, #F8F9FB background)
- **Typography**: Inter font family
- **State Management**: TanStack Query for API data fetching and caching

### Backend Architecture

The server follows RESTful API principles:

- **Framework**: Express.js with TypeScript
- **File Uploads**: Multer middleware for image processing
- **Storage**: In-memory storage (MemStorage class) for development
- **API Routes**: Centralized in `/server/routes.ts`
- **Development**: Vite integration for hot reloading

### Database Schema

The application uses Drizzle ORM with PostgreSQL:

- **Users Table**: Basic user authentication (id, username, password)
- **Generations Table**: Image generation records with settings and status tracking
- **Validation**: Zod schemas for type-safe data validation

Key tables:
- `users`: User account management
- `generations`: AI generation jobs with input/output URLs and processing status

## Data Flow

1. **Image Upload**: Users drag/drop or select images through the ImageUpload component
2. **Settings Configuration**: Users adjust AI generation parameters via SettingsPanel
3. **API Request**: Frontend sends FormData with image and settings to `/api/generate`
4. **Processing Simulation**: Backend simulates AI processing with timeout
5. **Response**: Generated image URL returned to frontend
6. **Display**: Output shown in preview area with fullscreen modal option

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives via shadcn/ui
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **HTTP Client**: Native fetch API with TanStack Query wrapper
- **Icons**: Lucide React icon library
- **Form Handling**: React Hook Form with Hookform resolvers

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **File Processing**: Multer for multipart form handling
- **Session Management**: connect-pg-simple for PostgreSQL sessions
- **Validation**: Zod for runtime type checking

## Deployment Strategy

The application is configured for both development and production:

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with nodemon-like behavior
- **Database**: Environment variable `DATABASE_URL` for connection

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: esbuild bundle to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Process**: Single Node.js process serving both API and static files

### Environment Configuration
- **Database**: PostgreSQL via `DATABASE_URL` environment variable
- **Sessions**: PostgreSQL-backed sessions for user authentication
- **File Storage**: Currently in-memory, designed for cloud storage integration

The application architecture supports easy scaling and deployment to platforms like Replit, with the database configuration already set up for Neon PostgreSQL integration.