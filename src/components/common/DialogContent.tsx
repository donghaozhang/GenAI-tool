import { cn } from '@/lib/utils'
import { DialogContent } from '@/components/ui/dialog'
import { forwardRef } from 'react'

type CommonDialogProps = {
  open: boolean
  children: React.ReactNode
  className?: string
  transformPerspective?: number
}

const CommonDialogContent = forwardRef<HTMLDivElement, CommonDialogProps>(
  ({ open, children, className, transformPerspective = 500 }, ref) => {
    return (
      <DialogContent
        ref={ref}
        className={cn(
          'flex flex-col p-0 gap-0 w-screen h-screen max-h-[100vh] max-w-[100vw] rounded-none border-none shadow-none',
          className
        )}
      >
        {children}
      </DialogContent>
    )
  }
)

CommonDialogContent.displayName = 'CommonDialogContent'

export default CommonDialogContent 