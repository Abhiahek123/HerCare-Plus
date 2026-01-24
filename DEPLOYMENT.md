# 🚀 Deployment Guide - HerCare+

## **Pre-Deployment Checklist**

- [x] All TypeScript errors resolved
- [x] Build completes successfully (`npm run build`)
- [x] Environment variables configured
- [x] PWA manifest valid
- [x] SEO metadata complete
- [x] Accessibility tested
- [x] Security features enabled
- [x] Error boundaries implemented

---

## **1. Deploy to Vercel (Recommended)**

### **Why Vercel?**

- ✅ **Free** for personal projects
- ✅ **Automatic** HTTPS
- ✅ **Edge functions** for AI API
- ✅ **Zero-config** for Next.js
- ✅ **Global CDN**

### **Step-by-Step:**

#### **A. Via Vercel Dashboard (Easiest)**

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit: HerCare+ production ready"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/hercare-plus.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Vercel auto-detects Next.js settings ✅

3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add: `GEMINI_API_KEY` = `your_gemini_key`
   - Apply to: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

**Live URL:** `https://hercare-plus-YOUR_USERNAME.vercel.app`

#### **B. Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts - it will ask for:
# - Project name: hercare-plus
# - Framework preset: Next.js (auto-detected)
# - Build command: npm run build (default)
# - Output directory: .next (default)

# Add environment variable
vercel env add GEMINI_API_KEY production
# Paste your Gemini API key when prompted
```

---

## **2. Custom Domain (Optional)**

### **Free Options:**

- Vercel subdomain: `yourname.vercel.app` (instant)
- Custom domain: `hercare.app` (requires domain purchase)

### **Setup Custom Domain:**

1. **Buy domain** (₹500-1000/year):
   - Namecheap, GoDaddy, or Google Domains

2. **Add to Vercel**:
   - Vercel → Settings → Domains
   - Add: `hercare.app`
   - Copy DNS records

3. **Update DNS**:
   - In your domain registrar
   - Add Vercel's A/CNAME records
   - Wait 24-48 hours for propagation

4. **Force HTTPS**:
   - Vercel auto-enables SSL ✅

---

## **3. Environment Variables**

### **Required:**

```env
GEMINI_API_KEY=AIza...your_gemini_key
```

### **Optional:**

```env
# Custom domain (if using)
NEXT_PUBLIC_DOMAIN=hercare.app

# Analytics (privacy-first only)
# NEXT_PUBLIC_ANALYTICS_ID=
```

### **Where to Add:**

- **Vercel**: Dashboard → Settings → Environment Variables
- **Local dev**: `.env.local` file (create this, don't commit!)

---

## **4. Post-Deployment Testing**

### **Functionality Checks:**

- [ ] Home page loads
- [ ] Onboarding flow works
- [ ] Consent page shows
- [ ] Symptom checker accepts voice input
- [ ] Gemini AI responds correctly
- [ ] Cycle tracker saves data
- [ ] Privacy dashboard exports data
- [ ] PWA installs on mobile
- [ ] Offline mode works

### **Performance Testing:**

- Run Lighthouse audit (aim for 90+ on all)
- Test on slow 3G network
- Check mobile responsiveness

### **Security Testing:**

- [ ] No API keys exposed in client code
- [ ] Rate limiting works (try spamming)
- [ ] Input sanitization prevents XSS
- [ ] HTTPS enforced
- [ ] No console errors

---

## **5. Monitoring & Analytics**

### **Free Options:**

#### **Vercel Analytics (Privacy-First)**

```bash
npm i @vercel/analytics
```

In `src/app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics /> {/* Privacy-compliant */}
      </body>
    </html>
  );
}
```

#### **Error Tracking (Optional)**

- Sentry (free tier)
- LogRocket (privacy concerns - not recommended)

---

## **6. Continuous Deployment**

### **Auto-Deploy on Push:**

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Fix: improved symptom checker"
git push

# Vercel auto-deploys in ~2 minutes 🚀
```

### **Preview Deployments:**

- Every pull request gets a preview URL
- Test changes before merging to main

---

## **7. Scaling (Future)**

### **When traffic grows:**

1. **Upgrade Gemini**:
   - Switch to Gemini Pro API (still free tier)
   - Add response caching

2. **Add Database**:
   - Firebase Firestore (free tier: 1GB)
   - For multi-device sync (optional)

3. **CDN Optimization**:
   - Vercel handles this automatically
   - Add image optimization with `next/image`

4. **Rate Limiting**:
   - Already implemented ✅
   - Can upgrade to Upstash Redis if needed

---

## **8. Backup & Recovery**

### **Data Backup:**

- User data is client-side only (IndexedDB)
- No server-side backups needed
- Users can export their own data

### **Code Backup:**

- GitHub is your backup ✅
- Vercel keeps deployment history

---

## **9. Legal & Compliance**

### **Before Going Public:**

1. **Privacy Policy** (✅ Already in `/privacy`)
2. **Terms of Service** (create `/terms` page)
3. **Medical Disclaimer** (✅ Already in AI responses)
4. **GDPR Compliance** (✅ Data export/delete implemented)

### **Sample Terms:**

```markdown
HerCare+ is NOT a replacement for professional medical advice.
Always consult a licensed doctor for diagnosis and treatment.
By using this app, you agree that:

- This is an informational tool only
- We are not liable for medical decisions
- You understand the privacy policy
```

---

## **10. Launch Checklist**

### **Pre-Launch:**

- [ ] Test on iOS (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on desktop
- [ ] All features work
- [ ] No console errors
- [ ] Privacy policy live
- [ ] Terms of service live
- [ ] Domain configured
- [ ] Analytics enabled
- [ ] Social sharing works (OG tags)

### **Launch Day:**

- [ ] Announce on social media
- [ ] Post on Product Hunt
- [ ] Share with hackathon judges
- [ ] Monitor error logs
- [ ] Be ready to hotfix

---

## **11. Cost Breakdown**

| Service           | Plan        | Cost           |
| ----------------- | ----------- | -------------- |
| Vercel            | Hobby       | **FREE** ✅    |
| Gemini AI         | Free Tier   | **FREE** ✅    |
| GitHub            | Public Repo | **FREE** ✅    |
| Domain (optional) | .app        | ₹500-1000/year |
| **Total Monthly** |             | **₹0** 🎉      |

---

## **12. Troubleshooting**

### **Build Fails:**

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### **Environment Variables Not Working:**

- Ensure they're added in Vercel dashboard
- Redeploy after adding variables
- Prefix with `NEXT_PUBLIC_` for client-side access

### **PWA Not Installing:**

- Check manifest.json is accessible: `/manifest.json`
- Ensure HTTPS is enabled
- Check service worker: Developer Tools → Application → Service Workers

### **Gemini API Errors:**

- Verify API key is correct
- Check rate limits (1500 req/day on free tier)
- Add error handling in `/api/gemini/route.ts`

---

## **13. Success Metrics**

### **Track These:**

- **Users**: Daily active users
- **Engagement**: Avg. time on site
- **Conversions**: % who install PWA
- **Retention**: % who return next day
- **Privacy**: Zero data breaches ✅

### **Goals:**

- 100 users in Week 1
- 90+ Lighthouse score
- Zero crashes
- 4.5+ star rating (if on app stores)

---

## **🎉 You're Ready!**

Your app is now:

- ✅ Secure
- ✅ Fast
- ✅ Private
- ✅ Accessible
- ✅ Production-ready

**Go make an impact! 💜**
