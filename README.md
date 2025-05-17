# Kuşbakış (Bird's Eye View) 🗺️

A Next.js application with Mapbox integration that allows users to explore maps, save favorite locations, and manage their profile.

## 📋 Project Overview

Kuşbakış (Turkish for "Bird's Eye View") is a web application that displays interactive maps using the Mapbox GL JS library. The application includes the following features:

- **Interactive Map**: Explore locations with an interactive map that displays coordinates and zoom level
- **Favorites Management**: Save and organize your favorite locations by category
- **User Profile**: View and manage your user information

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn package manager
- A Mapbox access token (free tier available at [mapbox.com](https://www.mapbox.com))

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd bird/frontend
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

Create a `.env.local` file in the frontend directory and add your Mapbox access token:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## 🗂️ Project Structure

```
frontend/
├── public/            # Static assets
├── src/
│   ├── components/    # React components
│   │   ├── MapComponent.tsx  # Mapbox integration
│   │   └── Navbar.tsx        # Navigation bar
│   ├── pages/         # Next.js pages
│   │   ├── api/       # API routes
│   │   ├── _app.tsx   # App component
│   │   ├── _document.tsx # Document component
│   │   ├── favorites.tsx # Favorites page
│   │   ├── index.tsx     # Home page with map
│   │   └── profile.tsx   # User profile page
│   └── styles/        # CSS modules for styling
│       ├── Favorites.module.css  # Favorites page styles
│       ├── Home.module.css       # Main styles
│       ├── MapComponent.module.css # Map styles
│       └── Navbar.module.css      # Navigation styles
├── .env.local         # Environment variables (create this file)
├── next.config.js     # Next.js configuration
├── package.json       # Project dependencies
└── tsconfig.json      # TypeScript configuration
```

## 🧩 Key Components

### MapComponent

The `MapComponent` integrates with Mapbox GL JS to display an interactive map. It supports:

- Dynamic rendering with custom coordinates and zoom level
- Navigation controls for zoom and pan
- Real-time coordinate and zoom level display

The component is dynamically imported to avoid server-side rendering issues with Mapbox GL JS.

### Navbar

The `Navbar` component provides navigation between different pages of the application:

- Home (Map view)
- Favorites (Saved locations)
- Profile (User information)

## 🎨 Styling

The application uses CSS Modules for styling. Key style files include:

### Home.module.css

Contains base layout styles for the entire application, including:

- Container layouts
- Main content area
- Footer styling
- Profile page components
- Map wrapper styles

### MapComponent.module.css

Specific styles for the map component:

- Map container dimensions (uses viewport-relative sizing with `calc(100vh - 150px)`)
- Map element positioning
- Sidebar for displaying coordinates

### Favorites.module.css

Styles for the favorites page including:

- Favorite location cards
- Category filtering
- Action buttons (visited/remove)

### Navbar.module.css

Styling for the navigation bar including:

- Logo
- Navigation links
- Active state indicators

## ⚙️ Configuration

### Mapbox Configuration

The application uses Mapbox GL JS for map rendering. You must provide a Mapbox access token in the `.env.local` file:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

Without this token, the map will not render properly.

### Next.js Configuration

The application uses Next.js with TurboRepo for improved development experience:

```bash
npm run dev  # Starts the development server with TurboRepo
npm run build  # Creates a production build
npm run start  # Starts the production server
npm run lint  # Runs ESLint for code quality
```

## 📝 Development Notes

### Adding New Locations to Favorites

Currently, the Favorites page displays a hard-coded list of locations. To implement adding new locations from the map to favorites, you would need to:

1. Create a new state management solution (Context API or Redux)
2. Add UI elements to the MapComponent for saving locations
3. Connect the saved locations with the Favorites page

### Map Customization

You can customize the map appearance by changing the style URL in the MapComponent:

```typescript
style: 'mapbox://styles/mapbox/streets-v11',
```

Mapbox offers several predefined styles including:
- `mapbox://styles/mapbox/streets-v11`
- `mapbox://styles/mapbox/outdoors-v11`
- `mapbox://styles/mapbox/light-v10`
- `mapbox://styles/mapbox/dark-v10`
- `mapbox://styles/mapbox/satellite-v9`

## 🔗 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📄 License

This project is licensed under the MIT License.
