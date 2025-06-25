# 🐧 WSL Deployment Guide for Jaaz Integration

## 🚨 WSL-Specific Supabase CLI Installation

The global npm installation doesn't work for Supabase CLI. Here are the WSL-compatible methods:

### Method 1: Direct Binary Installation (Recommended for WSL)

```bash
# Download the latest Supabase CLI binary
wget -O supabase-cli.tar.gz https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz

# Extract the binary
tar -xzf supabase-cli.tar.gz

# Make it executable and move to PATH
chmod +x supabase
sudo mv supabase /usr/local/bin/

# Verify installation
supabase --version
```

### Method 2: Using Package Manager (Alternative)

```bash
# Add Supabase repository
echo "deb [trusted=yes] https://apt.fury.io/supabase/ /" | sudo tee /etc/apt/sources.list.d/supabase.list

# Update package list
sudo apt update

# Install Supabase CLI
sudo apt install supabase

# Verify installation
supabase --version
```

### Method 3: Using npx (No Installation Required)

```bash
# Use npx to run Supabase commands without installation
npx supabase@latest --version

# For deployment, use npx prefix:
npx supabase@latest login
npx supabase@latest functions deploy jaaz-chat --no-verify-jwt
```

### Method 4: Using Docker (If Docker is available)

```bash
# Pull Supabase CLI Docker image
docker pull supabase/cli:latest

# Create alias for easier usage
echo 'alias supabase="docker run --rm -v $(pwd):/workdir -w /workdir supabase/cli:latest"' >> ~/.bashrc
source ~/.bashrc

# Verify
supabase --version
```

---

## 🚀 WSL Deployment Steps

### Step 1: Install Supabase CLI

Choose one of the methods above. **Method 1 (Direct Binary)** is recommended for WSL.

### Step 2: Authenticate with Supabase

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref wdprvtqbwnhwbpufcmgg
```

### Step 3: Deploy Edge Functions

```bash
cd /home/zdhpe/GenAI-tool

# Deploy each function
supabase functions deploy jaaz-chat --no-verify-jwt
supabase functions deploy jaaz-canvas --no-verify-jwt
supabase functions deploy jaaz-settings --no-verify-jwt
```

### Step 4: Apply Database Migration

```bash
# Apply the migration
supabase db push
```

### Step 5: Test Deployment

```bash
# Start development server
npm run dev

# Test in browser at:
# - http://localhost:8080/designer
# - http://localhost:8080/canvas
# - http://localhost:8080/settings
```

---

## 🔧 WSL-Specific Troubleshooting

### Issue 1: Permission Denied

```bash
# Fix permissions for binary installation
sudo chmod +x /usr/local/bin/supabase
```

### Issue 2: PATH Issues

```bash
# Add to PATH if not automatically added
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Issue 3: Network Issues in WSL

```bash
# Reset WSL network if needed
wsl --shutdown
# Restart WSL from Windows
```

### Issue 4: Docker Not Available

If Docker isn't available, stick with Method 1 (Direct Binary) or Method 3 (npx).

---

## 🌐 Alternative: Browser-Based Deployment

If CLI installation continues to fail, you can deploy through the Supabase Dashboard:

### 1. Open Supabase Dashboard
Navigate to: https://supabase.com/dashboard/project/wdprvtqbwnhwbpufcmgg

### 2. Deploy Edge Functions Manually

#### For jaaz-chat function:
1. Go to "Edge Functions" in sidebar
2. Click "Create Function"
3. Name: `jaaz-chat`
4. Copy content from `supabase/functions/jaaz-chat/index.ts`
5. Click "Deploy"

#### For jaaz-canvas function:
1. Click "Create Function"
2. Name: `jaaz-canvas`
3. Copy content from `supabase/functions/jaaz-canvas/index.ts`
4. Click "Deploy"

#### For jaaz-settings function:
1. Click "Create Function"
2. Name: `jaaz-settings`
3. Copy content from `supabase/functions/jaaz-settings/index.ts`
4. Click "Deploy"

### 3. Apply Database Migration

1. Go to "SQL Editor" in sidebar
2. Copy content from `supabase/migrations/20250125000000_create_jaaz_tables.sql`
3. Paste into editor
4. Click "Run"

---

## 🧪 Quick Test Commands

After installation, test these commands:

```bash
# Test CLI installation
supabase --version

# Test project connection
supabase status

# Test function deployment (dry run)
supabase functions deploy jaaz-chat --no-verify-jwt --dry-run
```

---

## 💡 WSL Pro Tips

### 1. Use Windows Terminal
Windows Terminal provides better WSL experience than Command Prompt.

### 2. Update WSL
```bash
# From PowerShell (as Administrator)
wsl --update
```

### 3. Set WSL as Default
```bash
# From PowerShell
wsl --set-default Ubuntu-24.04
```

### 4. File System Performance
Work in `/home/username/` rather than `/mnt/c/` for better performance.

---

## 🚀 Quick Start Script for WSL

Create and run this script to automate the installation:

```bash
#!/bin/bash
echo "🐧 Installing Supabase CLI for WSL..."

# Method 1: Direct binary installation
wget -O supabase-cli.tar.gz https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz
tar -xzf supabase-cli.tar.gz
chmod +x supabase
sudo mv supabase /usr/local/bin/
rm supabase-cli.tar.gz

# Verify installation
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI installed successfully!"
    supabase --version
else
    echo "❌ Installation failed. Try alternative methods."
fi
```

Save as `install-supabase-wsl.sh`, make executable with `chmod +x install-supabase-wsl.sh`, and run with `./install-supabase-wsl.sh`.

---

**🎯 Choose the installation method that works best for your WSL setup, then proceed with deployment!** 