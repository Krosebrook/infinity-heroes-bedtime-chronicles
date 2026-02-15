/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';

export const useApiKey = () => {
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const validateApiKey = useCallback(async (): Promise<boolean> => {
    // API key is now managed server-side via Vercel environment variables
    return true;
  }, []);

  const handleApiKeyDialogContinue = useCallback(async () => {
    setShowApiKeyDialog(false);
  }, []);

  return {
    showApiKeyDialog,
    setShowApiKeyDialog,
    validateApiKey,
    handleApiKeyDialogContinue,
  };
};
