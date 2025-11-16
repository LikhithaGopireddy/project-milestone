# Pictogram - Instagram-like Social Media App

A full-stack Instagram-like social media application built with React, TypeScript, and Lovable Cloud.

## Features

- 🔐 **User Authentication** - Sign up, login, and logout functionality
- 📸 **Post Creation** - Upload images with captions
- ❤️ **Like System** - Like and unlike posts
- 💬 **Comments** - Add and view comments on posts
- 👤 **User Profiles** - View and edit your profile, see your posts grid
- 📱 **Responsive Design** - Works beautifully on mobile, tablet, and desktop
- 🎨 **Instagram-inspired UI** - Clean, modern design with gradient accents

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for blazing fast development
- **Tailwind CSS** for styling
- **Shadcn UI** for beautiful components
- **React Router** for navigation
- **TanStack Query** for data fetching

### Backend (Lovable Cloud)
- **Authentication** - Email/password with auto-confirm
- **PostgreSQL Database** - For storing users, posts, likes, and comments
- **Storage** - For image uploads
- **Row Level Security (RLS)** - Data is properly secured

## Database Schema

### Tables
- `profiles` - User information (username, bio, avatar)
- `posts` - User posts (image URL, caption, timestamps)
- `likes` - Post likes
- `comments` - Post comments

### Storage
- `posts` bucket - For storing post images

## How to Run Locally

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## How to Use

1. **Sign Up** - Create a new account with email and password
2. **Sign In** - Log in with your credentials
3. **Create Post** - Click the "+" icon in the navbar to upload a new post
4. **Interact** - Like posts, add comments, and explore the feed
5. **Profile** - Click the user icon to view and edit your profile

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── ui/          # Shadcn UI components
│   ├── Navbar.tsx   # Navigation bar
│   └── PostCard.tsx # Post display component
├── pages/           # Page components
│   ├── Auth.tsx     # Authentication page
│   ├── Feed.tsx     # Main feed page
│   ├── CreatePost.tsx # Post creation page
│   └── Profile.tsx  # User profile page
├── integrations/    # Backend integrations (auto-generated)
│   └── supabase/    # Lovable Cloud client
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── App.tsx          # Main app component with routing
```

## Key Features Implementation

### Authentication
- Uses Lovable Cloud authentication with email/password
- Protected routes redirect to login if not authenticated
- Auto-confirm email enabled for easier testing

### Post Feed
- Displays posts in reverse chronological order
- Shows post images, captions, likes count, and comments count
- Real-time like updates

### Like System
- Toggle like/unlike with visual feedback
- Heart icon fills when liked
- Prevents duplicate likes with unique constraint

### Comments
- Add comments to any post
- View all comments on a post
- Comments display with username and timestamp

### User Profiles
- View any user's profile with their posts grid
- Edit your own username and bio
- Display user stats (post count)

### Image Upload
- Drag and drop or click to upload
- Image preview before posting
- Stored securely in Lovable Cloud storage

## Security

All data is protected with Row Level Security (RLS) policies:
- Users can only modify their own posts, likes, and comments
- Everyone can view all posts and profiles
- Storage policies restrict file access to owners

## Deployment

To deploy your app:
1. Click the "Publish" button in Lovable
2. Your app will be deployed with both frontend and backend
3. Backend changes deploy automatically, frontend requires clicking "Update"

## Customization

The app uses a design system defined in:
- `src/index.css` - Color tokens and global styles
- `tailwind.config.ts` - Tailwind configuration

Instagram-inspired gradient colors:
- Primary: Pink (`hsl(340 75% 55%)`)
- Accent: Purple (`hsl(291 64% 42%)`)
- Secondary: Orange (`hsl(45 100% 51%)`)

## Support

For questions or issues:
- Visit [Lovable Documentation](https://docs.lovable.dev/)
- Join [Lovable Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)

## License

This project is created with Lovable and can be modified and deployed as needed.
