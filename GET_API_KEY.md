# 🔑 How to Get Your Gemini API Key

## **Quick Steps (2 Minutes)**

### **Step 1: Visit Google AI Studio**

Open this link in your browser:
👉 **https://aistudio.google.com/app/apikey**

### **Step 2: Accept Terms (First Time Only)**

- You'll see a "Welcome to AI Studio" popup
- ✅ Check the box that says "I consent to the..."
- Click **"Continue"**

### **Step 3: Create API Key**

- Click the **"Create API key"** button (blue button on the right)
- Select or create a Google Cloud project (free)
- Your API key will be generated

### **Step 4: Copy the Key**

- Click the copy icon next to your new API key
- It will look like: `AIzaSyC-abc123xyz...`

### **Step 5: Add to HerCare+**

1. Open the file: `.env.local` (in your project root)
2. Replace this line:

   ```
   GEMINI_API_KEY=your_api_key_here_replace_this
   ```

   With your actual key:

   ```
   GEMINI_API_KEY=AIzaSyC-abc123xyz...
   ```

3. Save the file

### **Step 6: Restart the Server**

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

### **Step 7: Test It!**

1. Open http://localhost:3000
2. Go to Symptom Checker
3. Type "hi" or "headache"
4. You should now get AI responses! ✅

---

## **Troubleshooting**

### **"Failed to process request" error:**

- Double-check your API key in `.env.local`
- Make sure there are no spaces or quotes
- Restart the dev server

### **"Rate limit" error:**

- Free tier: 1,500 requests per day
- Wait a minute and try again

### **Still not working?**

1. Check the browser console (F12) for errors
2. Make sure `.env.local` is in the project root (same folder as `package.json`)
3. Verify the key starts with `AIza...`

---

## **Your API Key is FREE Forever** ✅

- No credit card required
- 1,500 requests/day (enough for 500+ users)
- No automatic charges
- Privacy-compliant

---

**Need help?** The key is already set up in `.env.local` - just replace the placeholder with your real key from Google AI Studio!
