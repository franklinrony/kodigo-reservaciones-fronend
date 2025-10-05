import React, { useState } from 'react';

export const MobileDisclaimer: React.FC = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="sm:hidden bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 flex items-start justify-between gap-3">
      <div className="text-xs">
        Para mejor experiencia usa la vista en escritorio o gira tu dispositivo.
      </div>
      <button onClick={() => setVisible(false)} className="text-yellow-700 text-sm font-medium">Cerrar</button>
    </div>
  );
};

export default MobileDisclaimer;
