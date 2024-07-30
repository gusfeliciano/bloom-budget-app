# Zero Based Budget App

## Overview

Welcome to the Zero Based Budget App! This web-based application helps you manage your finances using the zero-based budgeting method. With this app, you can allocate every dollar of your income to specific spending categories, ensuring that your income minus your expenses always equals zero.

This app is designed for self-hosting, allowing you to run it on your own server at home or in the cloud. It offers flexibility in data management, supporting integration with services like Plaid or Teller for bank syncing, as well as manual CSV imports.

We will be working on a docker compose file for easier homelab deployment in the future.

## Features

- Zero-based envelope budgeting system
- Self-hosted solution for privacy and control
- Potential integration with bank syncing services (e.g., Plaid, Teller)
- Manual transaction import via CSV
- Built with modern web technologies for a responsive and intuitive user experience

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase for authentication and data storage

## Getting Started

### Prerequisites

- Node.js (version specified in package.json)
- npm or yarn

### Installation

1. Clone the repository:

2. Install dependencies:
    a. npm install
    or 
    b. yarn install

### Configuration

Set up your Supabase environment variables. Create a `.env.local` file in the root directory and add your Supabase URL and anon key:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

### Running the App

To run the app in development mode:
    a. npm run dev
    or
    b. yarn dev

Visit `http://localhost:3000` in your browser to see the app.

## Contributing

We welcome contributions to the Zero Based Budget App! If you have suggestions for improvements or bug fixes, please feel free to submit a pull request or open an issue.

## License

This project is open source and available under the [MIT License](LICENSE).
