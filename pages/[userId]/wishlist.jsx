import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import wislistStyles from "@/styles/wishlist.module.css";
import { useSession } from "next-auth/react";
import UnAuthorizedUser from "@/components/UnAuthorizedUser";

export default function Wishlist() {
  const { data: session, status: sessionStatus } = useSession();
  const [wishProductData, setWishProductData] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.id) {
      fetchWishlist();
    }
  }, [sessionStatus]);

  const fetchWishlistData = async (wishlistItems) => {
    if (!wishlistItems.length) {
      setWishProductData([]);
      setIsLoading(false);
      return;
    }

    try {
      const productIds = wishlistItems.map((item) => item.productId);
      const { data: products } = await axios.get(`/api/getProducts?ids=${productIds.join(",")}`);
      setWishProductData(products);
    } catch (error) {
      console.error("Error Fetching Wishlist Item", error);
      setWishProductData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get("/api/secure/wishlist", {
        params: { userId: session.user.id },
      });
      fetchWishlistData(data.wishlist);
    } catch (error) {
      console.error("Error Fetching Whishlist Items", error);
      setWishProductData([]);
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete("/api/secure/wishlist", { data: { userId: session.user.id, productId } });
      setWishProductData((prev) => prev.filter((item) => item._id !== productId));
      showNotification(t("Item Removed From Wishlist"));
    } catch (error) {
      console.error("Error Removing Item from Wishlist", error);
      showNotification("Unable to remove item from wishlist.");
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  if (sessionStatus === "loading") {
    return (
      <div className={wislistStyles.wishlist_container}>
        <div className="navHolder"></div>
        <p>loading</p>
      </div>
    );
  }

  if (sessionStatus !== "authenticated") {
    return (
      <div className={wislistStyles.wishlist_container}>
        <div className="navHolder"></div>
        <UnAuthorizedUser />
      </div>
    );
  }

  return (
    <>
      <div className="navHolder"></div>
      <div className={wislistStyles.wishlist_container}>
        <h1 className={wislistStyles.wishlist_head}>Wishlist</h1>

        {notification && <div className="notification">You have a new notification!</div>}

        {isLoading ? (
          <WishlistSkeleton />
        ) : wishProductData.length === 0 ? (
          <EmptyWishlist />
        ) : (
          wishProductData.map((item) => (
            <div key={item._id} className={wislistStyles.wishlist_item}>
              <Link href={`/products/${item._id}`}>
                <motion.img
                  src={`${item.imageUrl}` || "/products/placeholder.jpg"}
                  alt={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              <div className={wislistStyles.wishlist_item_details}>
                <Link href={`/products/${item._id}`}>
                  <h3>{item.name}</h3>
                  <p>{item.category}</p>
                  <ul>
                    {(item.suitableFor || []).map((feature, index) => (
                      <li key={index} className={wislistStyles.list}>{feature}</li>
                    ))}
                  </ul>
                </Link>
              </div>
              <button className={wislistStyles.remove_btn} onClick={() => removeFromWishlist(item._id)}>x</button>
            </div>
          ))
        )}
      </div>
    </>

  );
}

const WishlistSkeleton = () => (
  <div className={wislistStyles.wishlist_container}>
    {[...Array(3)].map((_, index) => (
      <div key={index} className={`${wislistStyles.wishlist_item} ${wislistStyles.loading}`}>
        <div className={wislistStyles.skeleton_img}></div>
        <div className={wislistStyles.wishlist_item_details}>
          <div className={wislistStyles.skeleton_text}></div>
          <div className={wislistStyles.skeleton_text_small}></div>
          <div className={wislistStyles.skeleton_list}>
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className={wislistStyles.skeleton_list_item}></div>
            ))}
          </div>
        </div>
        <button className={wislistStyles.skeleton_btn}></button>
      </div>
    ))}
  </div>
);

const EmptyWishlist = () => (
  <div className={wislistStyles.empty_wishlist}>
    <p>Your Wishlist Is Empty</p>
    <Link href="/products">
      <button className="shop-now">Shop Now</button>
    </Link>
  </div>
);