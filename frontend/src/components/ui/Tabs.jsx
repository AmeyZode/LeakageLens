import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../utils/cn';

const TabsContext = createContext({
  activeTab: '',
  setActiveTab: () => {},
});

export const Tabs = ({ defaultValue, value, onValueChange, children, className }) => {
  const [selected, setSelected] = useState(defaultValue || '');
  const activeTab = value !== undefined ? value : selected;

  const setActiveTab = (val) => {
    if (onValueChange) onValueChange(val);
    setSelected(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }) => (
  <div className={cn('inline-flex items-center justify-center rounded-lg bg-slate-950 p-1 text-slate-400 border border-slate-800/80', className)}>
    {children}
  </div>
);

export const TabsTrigger = ({ value, children, className, icon: Icon }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs md:text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none cursor-pointer gap-2',
        isActive
          ? 'bg-indigo-600/90 text-white shadow-sm font-semibold'
          : 'hover:bg-slate-900 hover:text-slate-200 text-slate-400',
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;

  return (
    <div className={cn('mt-4 focus-visible:outline-none animate-in fade-in-50 duration-200', className)}>
      {children}
    </div>
  );
};
