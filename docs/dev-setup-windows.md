# Windows Development Setup

This guide covers setting up the GenAI-tool development environment on Windows using WSL (Windows Subsystem for Linux).

## Prerequisites

- Windows 10/11 with WSL2 enabled
- Ubuntu 24.04 LTS installed via WSL
- Node.js and npm installed in the WSL environment
- Supabase CLI installed (if using local Supabase)

## Bootstrap Local Development Environment

Run the following sequence in PowerShell to bootstrap your local development environment:

```ps1
wsl -d Ubuntu-24.04
cd ~/GenAI-tool
cp .env.example .env            # ensure env variables
npm i                            # restore JS deps
supabase start                   # if using local Supabase
npm run dev                      # start Next/Vite dev server
```

## Troubleshooting

### Path Mapping Issues

**Problem**: Cannot access WSL files from Windows or vice versa.

**Solution**: Use the `\\wsl$` network path to access WSL files from Windows:
- WSL Ubuntu files: `\\wsl$\Ubuntu-24.04\home\<username>\GenAI-tool`
- Or use the newer `\\wsl.localhost\` path: `\\wsl.localhost\Ubuntu-24.04\home\<username>\GenAI-tool`

**Tips**:
- Pin the WSL project folder to Windows Explorer Quick Access
- Use VS Code's WSL extension to seamlessly edit files
- Avoid storing project files in Windows filesystem (`/mnt/c/`) for better performance

### Port Forwarding Issues

**Problem**: Cannot access development server from Windows browser.

**Solutions**:
1. **Automatic Port Forwarding** (Windows 11 22H2+):
   - WSL2 automatically forwards ports by default
   - Access your app at `http://localhost:3000` (or configured port)

2. **Manual Port Forwarding** (older Windows versions):
   ```ps1
   # In PowerShell as Administrator
   netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=<WSL_IP>
   ```
   
   Get WSL IP with: `wsl hostname -I`

3. **Firewall Issues**:
   - Allow Node.js through Windows Defender Firewall
   - Check WSL2 firewall settings: `sudo ufw status`

### Common Windows → WSL Pitfalls

#### 1. Line Ending Issues
**Problem**: Git showing files as modified due to CRLF/LF differences.

**Solution**:
```bash
# In WSL
git config --global core.autocrlf input
git config --global core.eol lf
```

#### 2. Node.js Performance
**Problem**: Slow npm install or build times.

**Solutions**:
- Store project files in WSL filesystem (not `/mnt/c/`)
- Use `npm ci` instead of `npm install` for faster installs
- Consider using `pnpm` or `yarn` for better performance

#### 3. Environment Variables
**Problem**: Environment variables not working correctly.

**Solutions**:
- Ensure `.env` file has Unix line endings (LF)
- Check file permissions: `chmod 644 .env`
- Verify environment variables are loaded: `printenv | grep NODE_ENV`

#### 4. File Permissions
**Problem**: Permission denied errors when running scripts.

**Solutions**:
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix ownership if needed
sudo chown -R $USER:$USER ~/GenAI-tool
```

#### 5. WSL2 Memory Usage
**Problem**: WSL2 consuming too much RAM.

**Solution**: Create/edit `%USERPROFILE%\.wslconfig`:
```ini
[wsl2]
memory=4GB
processors=2
swap=2GB
```

Then restart WSL: `wsl --shutdown`

#### 6. Docker/Supabase Issues
**Problem**: Docker containers not starting or Supabase failing.

**Solutions**:
- Ensure Docker Desktop is running with WSL2 backend enabled
- Check Docker service in WSL: `sudo service docker status`
- Restart Docker service: `sudo service docker start`
- For Supabase: `supabase status` to check service health

#### 7. VS Code Integration
**Problem**: VS Code not detecting WSL or extensions not working.

**Solutions**:
- Install "WSL" extension in VS Code
- Open project with: `code .` from WSL terminal
- Install extensions in WSL context, not Windows context

### Network Connectivity Issues

If you encounter network issues:

1. **Reset WSL network**:
   ```ps1
   # In PowerShell as Administrator
   wsl --shutdown
   netsh winsock reset
   netsh int ip reset all
   netsh winhttp reset proxy
   ipconfig /flushdns
   ```

2. **Check WSL DNS**:
   ```bash
   # In WSL
   cat /etc/resolv.conf
   # Should show nameserver (usually 172.x.x.x)
   ```

3. **Manual DNS fix** (if needed):
   ```bash
   # In WSL
   sudo sh -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
   ```

### Getting Help

- Check WSL logs: `wsl --status` and `dmesg | tail`
- Restart WSL: `wsl --shutdown` then `wsl -d Ubuntu-24.04`
- Update WSL: `wsl --update`
- Check Windows Event Viewer for WSL-related errors

## Additional Tips

- Use Windows Terminal for better WSL experience
- Consider using `zsh` with `oh-my-zsh` for improved terminal experience
- Set up SSH keys in WSL for Git operations
- Use `rsync` for fast file synchronization between Windows and WSL if needed
