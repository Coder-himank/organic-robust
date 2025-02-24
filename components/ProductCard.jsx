import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import styles from "@/styles/product-card.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link"

export const SkeletonCard = () => {
  return (
    <>
      <motion.div
        className={`${styles.product_card} ${styles.skeleton_card}`}
        initial={{ opacity: 0, y: 20 }} // Animation when card appears
        animate={{ opacity: 1, y: 0 }}
        // whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" }}
        transition={{ duration: 0.3 }}
      >
        <div className={`${styles.product_image} ${styles.skeleton_image}`}></div>

        <div className={styles.product_info}>
          <h3 className={styles.skeleton_text_1}></h3>
          <p className={styles.skeleton_text_2}></p>
          <div className={styles.product_actions}>

            <div
              className={`${styles.product_btn} ${styles.btn_buy} ${styles.skeleton_btn}`}
            >
            </div>
            <div
              className={`${styles.product_btn} ${styles.btn_buy} ${styles.skeleton_btn}`}
            >
            </div>
            <div
              className={`${styles.product_btn} ${styles.btn_buy} ${styles.skeleton_btn}`}
            >
            </div>

          </div >
        </div >
      </motion.div ></>
  )
}
const ProductCard = ({ product }) => {

  const router = useRouter()
  async function onAddToCart(productId, quantity) {
    if (!session?.user) {
      router.push({ pathname: `/authenticate`, query: { callback: `/cart`, productId } })
      return

    }

    try {
      const response = await fetch(`/api/cart?userId=${session.user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id, productId, quantity })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating user data:", error);
      return { success: false, message: "Request failed" };
    }
  }
  async function onAddToWishlist(productId) {
    if (!session?.user?.id) {
      router.push({ pathname: `/authenticate`, query: { callback: `/wishlist`, productId } })
      return
    }
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id, productId })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating user data:", error);
      return { success: false, message: "Request failed" };
    }
  }

  const onBuy = (productId) => {
    router.push({ pathname: `/checkout`, query: { productId } })
  }
  const { t } = useTranslation("common");
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [productData, setProductData] = useState({ ...product })



  // incase product id is provided we will fetch data of product from database directly
  return (
    <motion.div
      className={styles.product_card}
      initial={{ opacity: 0, y: 20 }} // Animation when card appears
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)" }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${productData._id}`}>
        {/* Lazy Loaded Image */}
        <Image
          // src={product.image}
          src={productData.imageUrl || "/products/hoodie.jpg"}
          alt={productData.name}
          width={300} // Set the desired width
          height={300} // Set the desired height
          layout="responsive"
          objectFit="cover"
          className={styles.product_image}
        />

      </Link >

      <div className={styles.product_info}>
        <Link href={`/products/${productData._id}`}>
          <h3 className={styles.product_name}>{productData.name}</h3>
          <p className={styles.product_price}>${productData.price}</p>
        </Link >

        <div className={styles.product_actions}>

          <motion.button
            className={`${styles.product_btn} ${styles.btn_buy}`}
            onClick={() => onBuy(productData._id)}
            whileTap={{ scale: 0.9 }}
          >
            {t("buy_now")}
          </motion.button>
          <motion.button
            className={`${styles.product_btn} ${styles.btn_cart}`}
            onClick={() => onAddToCart(productData._id, 1)}
            whileTap={{ scale: 0.9 }}
          >
            {t("add_to_cart")}
          </motion.button>
          <motion.button
            className={`${styles.product_btn} ${styles.btn_wishlist}`}
            onClick={() => onAddToWishlist(productData._id)}
            whileTap={{ scale: 0.9 }}
            aria-label="Add to Wishlist"
          >
            ♥
          </motion.button>
        </div>
      </div>
    </motion.div >
  );
};

export default ProductCard;
