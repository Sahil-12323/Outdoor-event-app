# Fix Git Clone SSL Certificate Error

## Error Message:
```
fatal: unable to access 'https://github.com/...': SSL certificate problem: unable to get local issuer certificate
```

## Quick Solutions

### ✅ Solution 1: Download as ZIP (Easiest)

Instead of cloning, download directly from GitHub:

1. Go to: https://github.com/Sahil-12323/Outdoor-event-app
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file to your desired location
5. Open the extracted folder in VSCode

**This is the easiest and recommended method!**

---

### ✅ Solution 2: Temporarily Disable SSL Verification

**Warning**: Only use this temporarily and on trusted repositories.

```bash
git config --global http.sslVerify false
git clone https://github.com/Sahil-12323/Outdoor-event-app.git
git config --global http.sslVerify true
```

After cloning, immediately re-enable SSL verification with the third command.

---

### ✅ Solution 3: Update Git Certificate Bundle (Windows)

**For Windows users:**

```bash
git config --global http.sslbackend schannel
git clone https://github.com/Sahil-12323/Outdoor-event-app.git
```

---

### ✅ Solution 4: Use Git with Specific Certificate

```bash
# For Windows (Git Bash)
git config --global http.sslCAInfo "C:/Program Files/Git/mingw64/ssl/certs/ca-bundle.crt"

# For Mac
git config --global http.sslCAInfo /etc/ssl/cert.pem

# For Linux
git config --global http.sslCAInfo /etc/ssl/certs/ca-certificates.crt
```

Then try cloning again:
```bash
git clone https://github.com/Sahil-12323/Outdoor-event-app.git
```

---

### ✅ Solution 5: Update Git

Your Git version might be outdated. Update Git:

**Windows:**
- Download latest Git from: https://git-scm.com/download/win
- Run the installer

**Mac:**
```bash
brew upgrade git
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install git
```

---

### ✅ Solution 6: Clone via SSH (Alternative)

If you have SSH keys set up with GitHub:

```bash
git clone git@github.com:Sahil-12323/Outdoor-event-app.git
```

---

## 🎯 Recommended Steps

1. **Try Solution 1 (Download ZIP)** - Fastest and safest
2. If you need Git, try **Solution 3** (Windows) or **Solution 4**
3. If still not working, try **Solution 2** (temporary disable)
4. Make sure to update Git if it's old

---

## After Getting the Files

Once you have the files (via ZIP or clone):

1. Open the folder in VSCode
2. Follow the **VSCode_LOCAL_SETUP.md** guide
3. Run the setup script
4. Start the application

---

## Alternative: Use This Repository

If you still have issues, you can also use the files from this current workspace:

1. Download/copy all files from `/workspace/` directory
2. Move them to your local machine
3. Open in VSCode
4. Follow the setup instructions

The code is complete and ready to run!