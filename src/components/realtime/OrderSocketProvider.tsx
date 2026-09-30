'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_CONFIG } from '@/utils/constants';
import { useAuthStore } from '@/store/authStore';

const OrderSocketContext = createContext(false);

export function useOrderSocketConnected() {
  return useContext(OrderSocketContext);
}

type InventoryMaterial = {
  id: string;
  name: string;
  unit?: string;
  stock_quantity: number;
  min_stock_level: number;
};

export function OrderSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const token = Cookies.get('access_token');
    if (!token) return;

    const socket = io(`${API_CONFIG.BASE_URL}/realtime`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    const invalidateOrders = () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['kds'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['menu-pending-counts'] });
    };

    const invalidateInventory = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      queryClient.invalidateQueries({ queryKey: ['menu-pending-counts'] });
    };

    socket.on(
      'order:created',
      (payload: { order?: { status?: string; order_number?: string } }) => {
        invalidateOrders();
        if (payload?.order?.status === 'pending') {
          const label = payload.order.order_number
            ? `New order ${payload.order.order_number}`
            : 'New order received';
          toast.info(label);
        }
      }
    );

    socket.on('order:updated', () => {
      invalidateOrders();
    });

    socket.on(
      'inventory:low_stock',
      (payload: { materials?: InventoryMaterial[] }) => {
        invalidateInventory();
        const materials = payload?.materials || [];
        if (materials.length === 1) {
          const m = materials[0];
          toast.warning(
            `Low stock: ${m.name} (${m.stock_quantity}${m.unit ? ` ${m.unit}` : ''} ≤ min ${m.min_stock_level})`
          );
        } else if (materials.length > 1) {
          toast.warning(
            `${materials.length} materials are at or below minimum quantity`
          );
        }
      }
    );

    socket.on('inventory:updated', () => {
      invalidateInventory();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, queryClient]);

  return (
    <OrderSocketContext.Provider value={connected}>
      {children}
    </OrderSocketContext.Provider>
  );
}
