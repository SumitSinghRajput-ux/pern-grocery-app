import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "../types";

// This defines the "shape" of our shopping cart — what data it holds
// and what actions can be performed on it
interface CartContextType {
    items: CartItem[];                                           // List of products currently in the cart
    addToCart: (product: Product, quantity?: number) => void;  // Add a product to the cart
    removeFromCart: (productID: string) => void;               // Remove a product from the cart by its ID
    updateQuantity: (productID: string, quantity: number) => void; // Change how many of a product are in the cart
    clearCart: () => void;                                     // Empty the entire cart
    cartCount: number;                                         // Total number of items in the cart
    cartTotal: number;                                         // Total price of everything in the cart
    isCartOpen: boolean;                                       // Whether the cart drawer/panel is visible
    setIsCartOpen: (open: boolean) => void;                    // Show or hide the cart drawer/panel
}

// Create a "shared space" (Context) where any part of the app can access cart data
// Starting as undefined — it gets filled in by CartProvider below
const CartContext = createContext<CartContextType | undefined>(undefined)

// CartProvider wraps around the app (or part of it) so that all child components
// can read and update the cart without passing data through every level manually
export function CartProvider({ children }: { children: ReactNode }) {

    // "items" holds all the products currently in the cart
    // On first load, we check localStorage (browser storage) to restore a previous cart session
    const [items, setItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem("app_cart")
        return saved ? JSON.parse(saved) : [] // If something was saved before, use it — otherwise start empty
    })

    // Tracks whether the cart sidebar/drawer is open or closed
    const [isCartOpen, setIsCartOpen] = useState(false)

    // Whenever the cart items change, save them to localStorage
    // This way the cart persists even if the user refreshes the page
    useEffect(() => {
        localStorage.setItem("app_cart", JSON.stringify(items))
    }, [items])

    // Adds a product to the cart
    // If the product is already in the cart, it increases the quantity instead of adding a duplicate
    // If not, it adds it as a new entry
    // After adding, it also opens the cart drawer so the user can see what they added
    const addToCart = (product: Product, quantity = 1) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.product._id === product._id)
            if (existing) {
                // Product already in cart — just increase the quantity
                return prev.map((item) => (item.product._id === product._id ? { ...item, quantity: item.quantity + quantity } : item))
            }
            // Product not in cart yet — add it fresh
            return [...prev, { product, quantity }]
        })
        setIsCartOpen(true) // Automatically open the cart to show the user what was added
    }

    // Removes a product from the cart entirely using its unique ID
    const removeFromCart = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.product._id !== productId));
    }

    // Updates how many of a specific product the user wants
    // If the new quantity is 0 or less, we remove the product from the cart completely
    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId); // No point keeping an item with zero quantity
            return;
        }
        setItems((prev) => prev.map((item) => (item.product._id === productId ? { ...item, quantity } : item)))
    }

    // Empties the cart and closes the cart drawer
    const clearCart = () => {
        setItems([])
        setIsCartOpen(false)
    }

    // Count the total number of individual items in the cart
    // e.g. 2 shirts + 3 pants = cartCount of 5
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

    // Calculate the total price of everything in the cart
    // Each item's price is multiplied by its quantity, then all are added together
    const cartTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    // Provide all the cart data and actions to any component inside this provider
    return <CartContext.Provider value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen
    }}>
        {children}
    </CartContext.Provider>
}

// A convenient hook that any component can call to access the cart
// Instead of writing "useContext(CartContext)" every time, you just write "useCart()"
// It also throws a helpful error if you accidentally use it outside of CartProvider
export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error("useCart must be used within CartProvider") // Safety check — the cart context must be available
    return context;
}