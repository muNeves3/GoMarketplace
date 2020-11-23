/* eslint-disable no-param-reassign */
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsPersisted = await AsyncStorage.getItem(
        '@GoMarketplace:product',
      );

      if (productsPersisted) {
        setProducts(JSON.parse(productsPersisted));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const cartProductExists = products.find(
        productItem => productItem.id === product.id,
      );

      if (cartProductExists) {
        product.quantity += 1;
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:product',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productFind = products.find(productItem => productItem.id === id);

      if (productFind) {
        const incrementProducts = products.map(product =>
          product.id === id
            ? { ...product, quantity: product.quantity += 1 }
            : product,
        );
        setProducts(incrementProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:product',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productFind = products.find(productItem => productItem.id === id);

      if (productFind) {
        const decrementProducts = products.map(product =>
          product.id === id
            ? { ...product, quantity: product.quantity -= 1 }
            : product,
        );
        setProducts(decrementProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:product',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
