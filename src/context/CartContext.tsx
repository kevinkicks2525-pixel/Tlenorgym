"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: number | string;
  name: string;
  price: string;
  numericPrice: number;
  category: string;
  image?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: { id?: number | string; name: string; price: string; category?: string; image?: string }, quantity?: number) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("tlenorgym_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {
      // fallback
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("tlenorgym_cart", JSON.stringify(newCart));
    } catch {
      // fallback
    }
  };

  const parseNumericPrice = (priceStr: string): number => {
    const cleaned = priceStr.replace(/[^0-9]/g, "");
    return parseInt(cleaned, 10) || 0;
  };

  const addToCart = (product: { id?: number | string; name: string; price: string; category?: string; image?: string }, quantity: number = 1) => {
    const productId = product.id || product.name;
    const existingIndex = cart.findIndex((item) => item.id === productId);

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      saveCart(updated);
    } else {
      const newItem: CartItem = {
        id: productId,
        name: product.name,
        price: product.price,
        numericPrice: parseNumericPrice(product.price),
        category: product.category || "Produit",
        image: product.image,
        quantity: quantity,
      };
      saveCart([...cart, newItem]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number | string) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const updateQuantity = (id: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const updated = cart.map((item) => (item.id === id ? { ...item, quantity } : item));
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.numericPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
