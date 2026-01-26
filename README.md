# SDSL Documentation

A quick and fun way to learn SDSL, the most elegant shading language known to man.

## 📚 Documentation

The documentation is built with [DocFX](https://dotfx.github.io/) and automatically deployed to GitHub Pages.

**[View the Documentation](https://tebjan.github.io/SDSL-docs/)**

## 🎨 Features

- **Modern Theme**: Supports both dark (default) and light themes
- **Automatic Deployment**: Updates automatically on every push to `main`
- **Easy Editing**: Simply edit markdown files in the repository
- **Search Functionality**: Built-in search for quick navigation

## 📝 Editing Documentation

All documentation content is in markdown format:

- `index.md` - Home page
- `articles/` - Documentation articles
  - `intro.md` - Introduction to SDSL
  - `tutorials.md` - Step-by-step tutorials
  - `reference.md` - Language reference

To edit the documentation:

1. Edit the markdown files locally or on GitHub
2. Commit and push to the `main` branch
3. GitHub Actions will automatically rebuild and deploy the site

## 🛠️ Local Development

To build the documentation locally:

1. Install [.NET SDK](https://dotnet.microsoft.com/download) (version 8.x or later)
2. Install DocFX:
   ```bash
   dotnet tool install -g docfx
   ```
3. Build the documentation:
   ```bash
   docfx docfx.json
   ```
4. Serve locally:
   ```bash
   docfx serve _site
   ```
5. Open your browser to `http://localhost:8080`

## 🚀 Deployment

The documentation is automatically built and deployed to GitHub Pages using GitHub Actions:

- Workflow file: `.github/workflows/docfx.yml`
- Triggered on: Push to `main` branch
- Output: GitHub Pages site

## 📖 About SDSL

SDSL (Shading Description Shader Language) is a powerful and elegant shading language designed for modern graphics programming.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Add new tutorials
- Improve existing documentation
- Fix typos or errors
- Suggest improvements

Simply edit the markdown files and submit a pull request.

## 📄 License

This documentation is open source and available to everyone.
