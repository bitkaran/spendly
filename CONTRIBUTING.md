# Contributing to Spendly

Thank you for your interest in contributing to **Spendly**! Follow these guidelines to ensure a smooth collaboration process.

## Code of Conduct

Please remain respectful and collaborative in all issues, pull requests, and discussions.

## Development Workflow

1. **Fork & Clone**: Fork the repository on GitHub and clone your fork locally:
   ```bash
   git clone https://github.com/your-username/spendly.git
   cd spendly
   ```

2. **Install Dependencies**: Install all client and server dependencies using the root helper script:
   ```bash
   npm run install:all
   ```

3. **Configure Environments**: Copy `.env.example` configurations to local `.env` files in `server/` and `client/` directories, and add your local credentials (like database URLs or email SMTP options). **Do not commit `.env` files.**

4. **Run Dev Environment**: Start both frontend and backend development hot-reloading configurations simultaneously:
   ```bash
   npm run dev
   ```

5. **Create Branch**: Create a feature or bugfix branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Submit PR**: Commit your changes, push your branch, and open a Pull Request against the `main` branch. Ensure the frontend compiles successfully (`npm run build`) and there are no server startup crashes before opening a PR.

## Coding Guidelines

* Set `"type": "module"` in package scripts and use standard ES Module import/export syntax for Node.js files.
* Use Tailwind CSS variables and responsive classes for mobile-first visual features.
* Scopes all API database operations per-user using JWT payload descriptors.
