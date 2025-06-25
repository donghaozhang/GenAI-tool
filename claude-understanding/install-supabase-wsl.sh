#!/bin/bash

echo "🐧 Installing Supabase CLI for WSL..."
echo "===================================="

# Check if running in WSL
if [[ ! -f /proc/version ]] || ! grep -q Microsoft /proc/version; then
    echo "⚠️  This script is designed for WSL. Proceeding anyway..."
fi

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo "📥 Downloading Supabase CLI binary..."

# Download the latest Supabase CLI binary
if wget -O supabase-cli.tar.gz https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz; then
    echo "✅ Download successful"
else
    echo "❌ Download failed. Check your internet connection."
    exit 1
fi

echo "📦 Extracting binary..."

# Extract the binary
if tar -xzf supabase-cli.tar.gz; then
    echo "✅ Extraction successful"
else
    echo "❌ Extraction failed"
    exit 1
fi

echo "🔧 Installing binary..."

# Make it executable and move to PATH
chmod +x supabase

# Check if /usr/local/bin exists and is writable
if [[ -d /usr/local/bin ]]; then
    if sudo mv supabase /usr/local/bin/; then
        echo "✅ Binary installed to /usr/local/bin/"
    else
        echo "❌ Failed to move binary to /usr/local/bin/"
        echo "💡 Trying alternative location..."
        
        # Try installing to user's local bin
        mkdir -p "$HOME/.local/bin"
        mv supabase "$HOME/.local/bin/"
        
        # Add to PATH if not already there
        if ! echo "$PATH" | grep -q "$HOME/.local/bin"; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
            export PATH="$HOME/.local/bin:$PATH"
            echo "✅ Binary installed to $HOME/.local/bin/ and added to PATH"
        else
            echo "✅ Binary installed to $HOME/.local/bin/"
        fi
    fi
else
    echo "❌ /usr/local/bin not found. Installing to user directory..."
    mkdir -p "$HOME/.local/bin"
    mv supabase "$HOME/.local/bin/"
    
    # Add to PATH if not already there
    if ! echo "$PATH" | grep -q "$HOME/.local/bin"; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
        export PATH="$HOME/.local/bin:$PATH"
        echo "✅ Binary installed to $HOME/.local/bin/ and added to PATH"
    else
        echo "✅ Binary installed to $HOME/.local/bin/"
    fi
fi

# Clean up
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo ""
echo "🧪 Testing installation..."

# Verify installation
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI installed successfully!"
    echo "📋 Version information:"
    supabase --version
    echo ""
    echo "🚀 Next steps:"
    echo "1. Login to Supabase: supabase login"
    echo "2. Link to project: supabase link --project-ref wdprvtqbwnhwbpufcmgg"
    echo "3. Deploy functions: supabase functions deploy jaaz-chat --no-verify-jwt"
    echo ""
    echo "📚 Full deployment guide: See WSL_DEPLOYMENT_GUIDE.md"
else
    echo "❌ Installation failed. Supabase CLI not found in PATH."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Restart your terminal or run: source ~/.bashrc"
    echo "2. Check if binary exists: ls -la ~/.local/bin/supabase"
    echo "3. Try manual PATH export: export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
    echo "🌐 Alternative: Use browser-based deployment via Supabase Dashboard"
    echo "   https://supabase.com/dashboard/project/wdprvtqbwnhwbpufcmgg"
fi

echo ""
echo "🎯 Installation script complete!" 