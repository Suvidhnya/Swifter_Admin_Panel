# GitHub Push Guide - Quick Reference

## Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click `+` → `New repository`
3. Name: `swifter-admin-panel`
4. Click "Create repository"
5. **Copy the HTTPS URL** shown on the page

## Step 2: Setup Git Locally (First Time Only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@gmail.com"
```

## Step 3: Initialize & Push
```bash
cd c:\Study\Swifter

git init
git add .
git commit -m "Initial commit: Swifter Admin Panel"
git remote add origin https://github.com/YourUsername/swifter-admin-panel.git
git branch -M main
git push -u origin main
```

**Replace `YourUsername` with your GitHub username!**

## Done! 🎉
Your code is now on GitHub: `https://github.com/YourUsername/swifter-admin-panel`

---

## Future Updates (Every Time You Change Code)
```bash
git add .
git commit -m "Your change description"
git push
```

## Example Commit Messages
```bash
git commit -m "Fix: Login validation error"
git commit -m "Feature: Add user search"
git commit -m "Docs: Update README"
```
