# Nicholas DiBella's Personal Website

This repository contains the source code for my personal academic website, hosted on GitHub Pages.

## Preview Locally

To preview the website locally before pushing changes:

### Quick Preview (Recommended)
```bash
python3 preview.py
```
This starts a local server and automatically opens the site in Safari.

### Alternative Methods

#### Option 1: Simple File Opening
```bash
open index.html
```
This opens the file directly in your default browser.

#### Option 2: Manual HTTP Server
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

#### Option 3: Using Node.js (if you have it installed)
```bash
npx serve .
```

## File Structure

- `index.html` - Main website content
- `CNAME` - Domain configuration for GitHub Pages
- `files/` - Directory for downloadable files (CV, papers, etc.)
- `files/DiBella_CV.pdf` - CV file

## Adding New Papers/Files

1. Add PDF files to the `files/` directory
2. Update links in `index.html` to point to `files/filename.pdf`
3. Commit and push changes

## Deployment

The site is automatically deployed via GitHub Pages when changes are pushed to the main branch.

**Live site:** https://nicholasdibella.com