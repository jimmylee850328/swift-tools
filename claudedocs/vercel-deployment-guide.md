# Vercel Deployment Guide for Swift Tools

## Implementation Date
2025-10-22

## Overview
Simple, automated CI/CD setup using GitHub Actions for quality checks and Vercel for automatic deployment.

## Architecture

```
GitHub Repository
    ↓
GitHub Actions (Quality Checks)
    ├─ ESLint ✓
    ├─ Jest Tests (17 tests, 80% coverage) ✓
    └─ Production Build Verification ✓

Vercel (Automatic Deployment)
    ├─ Preview Deployments (every PR)
    └─ Production Deployment (main branch)
```

## Step 1: Connect GitHub to Vercel

### Initial Setup
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose `jimmylee850328/swift-tools`
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Deployment Settings
- **Production Branch**: `main` or `master`
- **Preview Branches**: All other branches
- **Automatic Deployments**: ✅ Enabled

## Step 2: Environment Variables (If Needed)

Currently, Swift Tools doesn't require environment variables, but if you add any:

1. Go to Project Settings → Environment Variables
2. Add variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.example.com
   ```
3. Select environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

## Step 3: Verify GitHub Actions

### CI Workflow (`.github/workflows/ci.yml`)
```yaml
name: CI
on:
  push:
    branches: ['**']
  pull_request:
    branches: [main, master]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 20
      - Install dependencies (npm ci)
      - Run ESLint
      - Run tests with coverage
      - Verify production build
```

**Runtime**: ~2-3 minutes
**Purpose**: Ensure code quality before Vercel builds

## Deployment Workflow

### For Pull Requests
```
1. Create PR
2. GitHub Actions runs quality checks
3. Vercel automatically creates preview deployment
4. Review preview URL in PR comments
5. Merge when ready
```

### For Production (main branch)
```
1. Merge PR to main
2. GitHub Actions verifies quality
3. Vercel automatically deploys to production
4. Live site updated
```

## Vercel Features You Get

### Automatic Preview Deployments
- Every PR gets a unique preview URL
- Test changes before merging
- Share with team for review
- Automatic cleanup when PR closed

### Automatic Production Deployments
- Push to main = automatic deployment
- Zero-downtime deployments
- Instant rollback if needed
- CDN edge caching worldwide

### Built-in Features
- ✅ SSL/HTTPS automatic
- ✅ CDN distribution
- ✅ Analytics (optional)
- ✅ Web Vitals monitoring
- ✅ Serverless functions (if needed)
- ✅ Custom domains

## Custom Domain Setup (Optional)

### Add Custom Domain
1. Go to Project Settings → Domains
2. Add your domain: `swift-tools.example.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: swift-tools
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (~5-10 minutes)
5. SSL automatically provisioned

### Recommended DNS Settings
```
# Production
Type: CNAME
Name: @ or www
Value: cname.vercel-dns.com

# Preview (optional)
Type: CNAME
Name: preview
Value: cname.vercel-dns.com
```

## Monitoring and Management

### View Deployments
- Dashboard: https://vercel.com/[your-username]/swift-tools
- Deployments tab shows all builds
- Click any deployment to see logs

### Deployment Logs
- Real-time build logs
- Function logs (if using serverless)
- Error tracking
- Performance metrics

### Analytics (Optional)
Enable in Project Settings → Analytics:
- Page views
- Top pages
- Visitor countries
- Web Vitals scores

## Troubleshooting

### Build Fails on Vercel
**Check**:
1. Deployment logs in Vercel dashboard
2. Ensure `npm run build` works locally
3. Verify all dependencies in package.json
4. Check Node.js version (should be 20.x)

**Common Issues**:
```bash
# Build works locally but fails on Vercel
# Solution: Check for environment-specific code

# Dependencies missing
# Solution: Verify package.json and package-lock.json committed

# TypeScript errors
# Solution: Run npm run build locally first
```

### Preview Deployment Not Created
**Check**:
1. Vercel GitHub integration enabled
2. PR is from same repository (not fork)
3. Deployment settings allow PR deployments
4. Check Vercel logs for errors

### Production Not Updating
**Check**:
1. Deployment succeeded (check Vercel dashboard)
2. Correct production branch configured
3. DNS cache (wait 5-10 minutes)
4. Browser cache (hard refresh: Ctrl+Shift+R)

## Status and Monitoring

### GitHub Status Badges
Add to README.md:
```markdown
[![CI](https://github.com/jimmylee850328/swift-tools/actions/workflows/ci.yml/badge.svg)](https://github.com/jimmylee850328/swift-tools/actions/workflows/ci.yml)
[![Deploy](https://vercel.com/button)](https://vercel.com/[your-username]/swift-tools)
```

### Vercel Status Badge
```markdown
[![Vercel](https://img.shields.io/badge/vercel-deployed-brightgreen)](https://swift-tools.vercel.app)
```

## Performance Optimization

### Vercel Edge Network
- Automatic CDN caching
- Global distribution
- Edge functions support
- Image optimization

### Recommended Settings
```javascript
// next.config.js (if needed)
module.exports = {
  // Enable static optimization
  output: 'standalone',

  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp'],
  },

  // Compression
  compress: true,
}
```

## Cost Monitoring

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL
- ✅ Preview deployments
- ✅ Analytics (basic)

### Usage Monitoring
1. Dashboard → Settings → Usage
2. Monitor:
   - Bandwidth
   - Build minutes
   - Serverless function invocations

## Security Best Practices

### Vercel Security
- ✅ Automatic SSL/TLS
- ✅ DDoS protection
- ✅ Firewall rules
- ✅ Security headers

### Recommended Headers
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Rollback Procedures

### Instant Rollback
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click **"Promote to Production"**
4. Confirm rollback
5. **Result**: Live in ~30 seconds

### Alternative: Git Revert
```bash
# Find commit to revert
git log --oneline

# Revert to previous commit
git revert HEAD

# Push to trigger new deployment
git push origin main
```

## Workflow Examples

### Making Changes
```bash
# 1. Create feature branch
git checkout -b feature/new-tool

# 2. Make changes
# ... edit code ...

# 3. Test locally
npm run lint
npm test
npm run build

# 4. Commit and push
git add .
git commit -m "feat: add new tool"
git push origin feature/new-tool

# 5. Create PR on GitHub
# ↓ GitHub Actions runs quality checks
# ↓ Vercel creates preview deployment

# 6. Review and merge
# ↓ Vercel deploys to production automatically
```

### Emergency Hotfix
```bash
# 1. Create hotfix branch from main
git checkout main
git pull
git checkout -b hotfix/critical-bug

# 2. Fix bug
# ... make fix ...

# 3. Test
npm test

# 4. Push and merge quickly
git push origin hotfix/critical-bug
# Create PR and merge immediately

# 5. Verify deployment
# Check Vercel dashboard for successful deployment
```

## Integration with GitHub Actions

### Current Setup
```yaml
GitHub Actions:
  ✓ Runs on every push
  ✓ Runs on every PR
  ✓ Verifies code quality (lint + test + build)
  ✓ Fails fast if issues found

Vercel:
  ✓ Deploys preview for all PRs
  ✓ Deploys production on main merge
  ✓ Independent of GitHub Actions
  ✓ Shows deployment status in GitHub
```

### Branch Protection (Recommended)
1. Settings → Branches → Add rule
2. Branch name: `main`
3. Enable:
   - ✅ Require status checks (select "quality-checks")
   - ✅ Require review (optional)
4. Save

**Result**: Can't merge unless CI passes

## Useful Links

### Vercel
- Dashboard: https://vercel.com/dashboard
- Documentation: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Status: https://www.vercel-status.com

### GitHub
- Repository: https://github.com/jimmylee850328/swift-tools
- Actions: https://github.com/jimmylee850328/swift-tools/actions
- CI Workflow: https://github.com/jimmylee850328/swift-tools/actions/workflows/ci.yml

## Quick Reference Commands

```bash
# Test before pushing
npm run lint && npm test && npm run build

# Check deployment status
vercel ls  # requires Vercel CLI

# Deploy manually (if needed)
vercel --prod  # requires Vercel CLI

# View logs
vercel logs [deployment-url]
```

## Support

### Issues with Deployment
1. Check Vercel deployment logs
2. Verify GitHub Actions passed
3. Review Vercel documentation
4. Contact Vercel support (if needed)

### Issues with CI
1. Check GitHub Actions logs
2. Test commands locally
3. Review workflow file
4. Ensure dependencies are current

## Next Steps

### Immediate
1. ✅ GitHub Actions configured
2. ⏳ Connect GitHub to Vercel
3. ⏳ Test first deployment
4. ⏳ Set up branch protection

### Future Enhancements
1. ⏳ Add custom domain
2. ⏳ Enable Vercel Analytics
3. ⏳ Set up monitoring/alerts
4. ⏳ Configure redirects (if needed)

## Summary

✅ **Simple, Automated CI/CD Pipeline**
- GitHub Actions: Quality checks (lint, test, build)
- Vercel: Automatic deployment (preview + production)
- Zero configuration deployment
- Built-in preview deployments
- Instant rollback capability

**Total Setup Time**: ~10 minutes
**Maintenance**: Minimal (automatic updates via Vercel)
