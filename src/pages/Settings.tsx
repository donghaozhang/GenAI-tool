import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfigs } from '@/contexts/ConfigsContext';

const Settings = () => {
  const navigate = useNavigate();
  const { setShowSettingsDialog } = useConfigs();

  useEffect(() => {
    // Open the settings dialog when this route is accessed
    setShowSettingsDialog(true);
    // Navigate back to the previous page or home
    navigate(-1);
  }, [setShowSettingsDialog, navigate]);

  return null; // This component doesn't render anything
};

export default Settings; 