import ThemeButton from '@/components/theme/ThemeButton'
import { Button } from '@/components/ui/button'
import { useConfigs } from '@/contexts/ConfigsContext'
import { SettingsIcon, Home, Layout, Palette } from 'lucide-react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import AgentSettings from '../agent_studio/AgentSettings'

function HomeHeader() {
  const navigate = useNavigate();
  
  return (
    <motion.div
      className="sticky top-0 z-0 flex w-full h-12 bg-background px-4 justify-between items-center select-none"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-bold">Agent Studio</p>
        </div>
        
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/')}>
            <Home className="w-4 h-4" /> <span className="hidden lg:inline">Home</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/marketplace')}>
            <Layout className="w-4 h-4" /> <span className="hidden lg:inline">Marketplace</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/designer')}>
            <Palette className="w-4 h-4" /> <span className="hidden lg:inline">Designer</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/canvas')}>
            <Palette className="w-4 h-4" /> <span className="hidden lg:inline">Canvas</span>
          </Button>
        </nav>
        
        {/* Mobile nav */}
        <nav className="flex md:hidden items-center gap-1">
          <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/')}>
            <Home className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/marketplace')}>
            <Layout className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/designer')}>
            <Palette className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/canvas')}>
            <Palette className="w-4 h-4" />
          </Button>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <AgentSettings />
        <ThemeButton />
      </div>
    </motion.div>
  )
}

export default HomeHeader
