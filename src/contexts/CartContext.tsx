import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle, ShoppingCart } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  realImage: string;
  size: string;
  sku: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface WishlistItem {
  product: Product;
}

interface CartState {
  items: CartItem[];
  wishlist: WishlistItem[];
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_WISHLIST'; payload: { product: Product } }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: { productId: number } }
  | { type: 'CLEAR_WISHLIST' };

// Función para cargar el carrito desde localStorage
const loadCartFromStorage = (): CartState => {
  try {
    const savedCart = localStorage.getItem('botanic-care-cart');
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
  }
  return {
    items: [],
    wishlist: []
  };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.product.id === action.payload.product.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product.id === action.payload.product.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      } else {
        return {
          ...state,
          items: [...state.items, { product: action.payload.product, quantity: action.payload.quantity }]
        };
      }
    }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.payload.productId)
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    
    case 'ADD_TO_WISHLIST': {
      const existingItem = state.wishlist.find(item => item.product.id === action.payload.product.id);
      
      if (!existingItem) {
        return {
          ...state,
          wishlist: [...state.wishlist, { product: action.payload.product }]
        };
      }
      return state;
    }
    
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.product.id !== action.payload.productId)
      };
    
    case 'CLEAR_WISHLIST':
      return {
        ...state,
        wishlist: []
      };
    
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  clearWishlist: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getWishlistCount: () => number;
  isInWishlist: (productId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Inicializar el estado desde localStorage usando el initializer function
  const [state, dispatch] = useReducer(
    cartReducer, 
    { items: [], wishlist: [] }, // Estado inicial temporal
    loadCartFromStorage // Función que se ejecuta para obtener el estado inicial real
  );

  // Guardar el carrito en localStorage cada vez que cambie
  useEffect(() => {
    try {
      localStorage.setItem('botanic-care-cart', JSON.stringify(state));
      // Debug: verificar que se guardó correctamente
      console.log('Cart saved to localStorage:', state.items.length, 'items');
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }, [state]);

  const addToCart = (product: Product, quantity: number) => {
    const existingItem = state.items.find(item => item.product.id === product.id);
    const isUpdating = existingItem !== undefined;
    
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
    
    // Mostrar notificación bonita
    toast.success(
      isUpdating ? 'Cantidad actualizada' : '¡Producto agregado al carrito!',
      {
        description: `${product.name}${isUpdating ? ` - Cantidad: ${(existingItem?.quantity || 0) + quantity}` : ` - Q. ${product.price.toFixed(2)}`}`,
        icon: <ShoppingCart className="h-5 w-5 text-[#7d8768]" />,
        action: {
          label: 'Ver carrito',
          onClick: () => {
            // El estado ya está guardado en localStorage por el useEffect
            // Usar window.location para navegar (el estado se recuperará al cargar)
            window.location.href = '/cart';
          },
        },
        duration: 4000,
      }
    );
  };

  const removeFromCart = (productId: number) => {
    const item = state.items.find(item => item.product.id === productId);
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });
    
    if (item) {
      toast('Producto eliminado', {
        description: `${item.product.name} fue removido del carrito`,
        duration: 2000,
      });
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const item = state.items.find(item => item.product.id === productId);
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    
    if (item && quantity > 0) {
      toast.info('Cantidad actualizada', {
        description: `${item.product.name} - Cantidad: ${quantity}`,
        duration: 2000,
      });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const addToWishlist = (product: Product) => {
    const alreadyInWishlist = state.wishlist.some(item => item.product.id === product.id);
    
    if (alreadyInWishlist) {
      toast.info('Ya está en tu lista de deseos', {
        description: product.name,
        duration: 2000,
      });
      return;
    }
    
    dispatch({ type: 'ADD_TO_WISHLIST', payload: { product } });
    
    toast.success('Agregado a favoritos', {
      description: product.name,
      icon: '❤️',
      duration: 3000,
    });
  };

  const removeFromWishlist = (productId: number) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: { productId } });
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const getWishlistCount = () => {
    return state.wishlist.length;
  };

  const isInWishlist = (productId: number) => {
    return state.wishlist.some(item => item.product.id === productId);
  };

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    getCartTotal,
    getCartItemCount,
    getWishlistCount,
    isInWishlist
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 