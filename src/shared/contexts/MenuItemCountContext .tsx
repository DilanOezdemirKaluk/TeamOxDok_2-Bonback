import { createContext, useContext, useEffect, useState } from "react";
import serviceService from "../api/services/serviceService";
import { useCurrentWorkgroupId } from "../api/services/loader/currentUserLoader";

const MenuItemCountContext = createContext<{
  counts: { disturbanceNoticeCount: number; messageCount: number };
  fetchCounts: () => Promise<void>;
} | null>(null);

export const MenuItemCountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const currentWorkgroupId = useCurrentWorkgroupId();
  const [counts, setCounts] = useState({
    disturbanceNoticeCount: 0,
    messageCount: 0,
  });

  const fetchCounts = async () => {
    if (!currentWorkgroupId) return;
    const data = await serviceService.getMenuItemCounts(currentWorkgroupId);
    setCounts(data);
  };

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(() => fetchCounts(), 300000);
    return () => clearInterval(interval);
  }, [currentWorkgroupId]);

  return (
    <MenuItemCountContext.Provider value={{ counts, fetchCounts }}>
      {children}
    </MenuItemCountContext.Provider>
  );
};

export const useMenuItemCounts = () => {
  const context = useContext(MenuItemCountContext);
  if (!context)
    throw new Error(
      "useMenuItemCounts must be used within a MenuItemCountProvider"
    );
  return context;
};
