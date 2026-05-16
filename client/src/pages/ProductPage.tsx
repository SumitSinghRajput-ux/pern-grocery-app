import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import type { Product } from "../types";
import { dummyProducts } from "../assets/assets";
import Loading from "../components/Loading";
import { ArrowLeftIcon, HomeIcon } from "lucide-react";

const ProductPage = () => {

  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
  const { id } = useParams()
  const navigate = useNavigate()
  const {items, addToCart, updateQuantity, removeFromCart} = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true);
  const [localQuantity, setLocalQuantity] = useState(1)

  useEffect(()=>{
    setLoading(true)
    setLocalQuantity(1);
    window.scrollTo(0,0)
    const product = dummyProducts.find((p)=>p._id === id)
    setProduct(product!)
    setRelatedProducts(dummyProducts.filter((p)=>p._id !== id))
    setLoading(false)
  },[id, navigate])

  if(loading) return <Loading />
  if(!product) return null;

  const cartItem = items.find((item)=> item.product._id === product._id)
  const inCart = !!cartItem;
  const displayQuantity = inCart ? cartItem.quantity : localQuantity

  const categoryLabel = product.category.replace(/-/g, " ");
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <Link to='/' className="hover:text-app-green transition-colors">
          <HomeIcon className="size-4" />
          </Link>
          <span>/</span>
          <Link to='/products' className="hover:text-app-green transition-colors">
          Products
          </Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-app-green transition-colors capitalize">
          {categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-app-green font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Back Button */}
        <button onClick={()=> navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm text-app-text-light hover:text-app-green transition-colors">
          <ArrowLeftIcon className="size-4" /> Back
        </button>

        {/* Product Details Section */}
        <div className="bg-white/50 rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">

        </div>
        </div>


        {/* Customer Reviews */}

        {/* related Products */}
      </div>
    </div>
  )
}

export default ProductPage