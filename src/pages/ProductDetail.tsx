import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../store/productStore';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchProductById, setLoading, setError } = useProductStore();
  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoadingState] = React.useState(true);

  useEffect(() => {
    const getProduct = async () => {
      if (id) {
        setLoading(true);
        try {
          const fetchedProduct = await fetchProductById(Number(id));
          setProduct(fetchedProduct);
        } catch (err) {
          setError('Failed to fetch product');
        } finally {
          setLoading(false);
          setLoadingState(false);
        }
      }
    };

    getProduct();
  }, [id, fetchProductById, setLoading, setError]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center">Product not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={product.images[0]?.src} alt={product.name} className="w-full rounded-lg" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="text-2xl text-gray-800 mb-4">₹{product.price}</div>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          <button className="mt-4 w-full py-2 bg-[#D4F871] uppercase rounded-md border-1 text-sm border-black">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;