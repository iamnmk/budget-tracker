# Inngest Next.js 15 Receipt Tracker (AI Agent SAAS)

A modern receipt management application built with Next.js, Inngest, and Convex. This application allows users to manage and track their receipts with real-time updates and background processing capabilities.

## 🚀 Features

- **Real-time Receipt Management**: Create, view, and delete receipts instantly
- **Authentication**: Secure user authentication powered by Clerk
- **Real-time Database**: Built with Convex for real-time data synchronization
- **Background Processing**: Utilizes Inngest for reliable background job processing
- **Modern UI**: Built with Tailwind CSS and modern React components
- **Type Safety**: Full TypeScript support throughout the application

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.1, React 19
- **Authentication**: Clerk
- **Database**: Convex
- **Background Jobs**: Inngest
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript
- **Components**: Radix UI, Lucide React

## 📦 Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm
- Convex account
- Clerk account
- Inngest account

## 🚀 Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd inngest-nextjs
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=

   # Convex
   NEXT_PUBLIC_CONVEX_URL=

   # Other configuration variables as needed
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

This will start:

- Next.js frontend server
- Convex backend server
- Inngest development server

## 📝 Development Scripts

- `pnpm dev`: Start all development servers
- `pnpm build`: Build the production application
- `pnpm start`: Start the production server
- `pnpm lint`: Run ESLint

## 🏗️ Project Structure

```
inngest-nextjs/
├── app/                  # Next.js app directory
├── actions/              # Server actions
├── components/          # Reusable React components
├── convex/              # Convex backend functions and schema
├── inngest/             # Inngest functions and configurations
├── lib/                 # Utility functions and configurations
└── public/              # Static assets
```

## Join the World's Best Developer Course & Community Zero to Full Stack Hero! 🚀

### Want to Master Modern Web Development?

This project was built as part of the [Zero to Full Stack Hero](https://www.papareact.com/course) course. Join thousands of developers and learn how to build projects like this and much more!

#### What You'll Learn:

- 📚 Comprehensive Full Stack Development Training
- 🎯 50+ Real-World Projects
- 🤝 Access to the PAPAFAM Developer Community
- 🎓 Weekly Live Coaching Calls
- 🤖 AI & Modern Tech Stack Mastery
- 💼 Career Guidance & Interview Prep

#### Course Features:

- ⭐ Lifetime Access to All Content
- 🎯 Project-Based Learning
- 💬 Private Discord Community
- 🔄 Regular Content Updates
- 👥 Peer Learning & Networking
- 📈 Personal Growth Tracking

[Join Zero to Full Stack Hero Today!](https://www.papareact.com/course)

## Support

For support, join our Discord community or email support@example.com

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
