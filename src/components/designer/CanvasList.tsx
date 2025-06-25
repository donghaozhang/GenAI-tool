import { listCanvases } from '@/api/canvas'
import CanvasCard from './CanvasCard'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Home, Layout, Palette, Settings, Layers3 } from 'lucide-react'

const CanvasList: React.FC = () => {
  const { t } = useTranslation()
  const { data: canvases, refetch } = useQuery({
    queryKey: ['canvases'],
    queryFn: listCanvases,
    enabled: true, // Enable API call now that backend is ready
  })

  const navigate = useNavigate()
  const handleCanvasClick = (id: string) => {
    navigate(`/canvas/${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Layers3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Canvas Library</h1>
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
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/agent-studio')}>
              <Settings className="w-4 h-4" /> <span className="hidden lg:inline">Agents</span>
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
            <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/agent-studio')}>
              <Settings className="w-4 h-4" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col px-10 mt-10 gap-4 select-none max-w-[1200px] mx-auto">
        {canvases && canvases.length > 0 && (
          <motion.span
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('home:allProjects')}
          </motion.span>
        )}

      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full pb-10">
          {canvases?.map((canvas, index) => (
            <CanvasCard
              key={canvas.id}
              index={index}
              canvas={canvas}
              handleCanvasClick={handleCanvasClick}
              handleDeleteCanvas={() => refetch()}
            />
          ))}
        </div>
      </AnimatePresence>
      </div>
    </div>
  )
}

export default CanvasList
