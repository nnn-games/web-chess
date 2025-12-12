# Build the project
npm run build

# Navigate to build output
cd dist

# Initialize a new git repo for deployment
git init
git checkout -b gh-pages
git add -A
git commit -m "deploy"

# Add remote (using the one from your config)
git remote add origin https://github.com/nnn-games/web-chess.git

# Force push to gh-pages branch
git push -f origin gh-pages

# Clean up
cd ..
Remove-Item -Recurse -Force dist/.git
Write-Host "Deployment Complete!"
