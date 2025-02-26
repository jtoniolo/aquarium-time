'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, Tab } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export default function NavigationTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const { items: aquariums } = useSelector((state: RootState) => state.aquariums);

  // Map any route under /aquariums to the dashboard tab
  const currentTab = pathname.startsWith('/aquariums') ? '/' : pathname;

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    router.push(newValue);
  };

  return (
    <Tabs
      value={currentTab}
      onChange={handleChange}
      textColor="inherit"
      indicatorColor="secondary"
      sx={{
        '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.7)' },
        '& .Mui-selected': { color: '#fff' },
      }}
    >
      <Tab label="Dashboard" value="/" />
      <Tab 
        label="Discover Lights" 
        value="/discover"
        disabled={aquariums.length === 0}
      />
    </Tabs>
  );
}