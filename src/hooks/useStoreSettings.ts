import { useQuery } from '@tanstack/react-query';

export interface StoreSettings {
  freeShippingThreshold: number;
  shippingCost: number;
  minOrderAmount: number;
  storeName: string;
  storeCurrency: string;
}

const defaults: StoreSettings = {
  freeShippingThreshold: 50,
  shippingCost: 25,
  minOrderAmount: 50,
  storeName: 'Botanic Care',
  storeCurrency: 'GTQ',
};

export const useStoreSettings = () => {
  return useQuery<StoreSettings>({
    queryKey: ['store-settings'],
    queryFn: async () => defaults,
    staleTime: 1000 * 60 * 60,
    retry: 0,
  });
};
