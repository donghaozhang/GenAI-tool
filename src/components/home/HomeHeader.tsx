import ThemeButton from '@/components/theme/ThemeButton'
import { Button } from '@/components/ui/button'
import { useConfigs } from '@/contexts/ConfigsContext'
import { SettingsIcon } from 'lucide-react'
import { motion } from 'motion/react'
import AgentSettings from '../agent_studio/AgentSettings'

function HomeHeader() {
  return (
    <motion.div
      className="sticky top-0 z-0 flex w-full h-12 bg-background px-4 justify-between items-center select-none"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <p className="text-xl font-bold">Agent Studio</p>
      </div>
      <div className="flex items-center gap-2">
        <AgentSettings />
        <ThemeButton />
      </div>
    </motion.div>
  )
}

export default HomeHeader
