import Head from "next/head";
import dbConnect from "@/server/db";
import Image from "next/image";
import { useEffect, useState } from "react";
import Product from "@/server/models/Product";
import styles from "@/styles/productPage.module.css";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { onAddToCart, onAddToWishlist, onBuy } from "@/components/ProductAction";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import productsJson from "@/public/products.json"
import getConfig from "next/config";
import Carousel from "@/components/Carousel";
import Link from "next/link";
import axios from "axios";
import { FaArrowRight } from "react-icons/fa";

const ExpandableSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);


    return (
        <div className={styles.expandable_section}>
            <h2 onClick={() => setIsOpen(!isOpen)} className={styles.expandable_title}>
                {title} {isOpen ? "-" : "+"}
            </h2>
            {isOpen && <div className={styles.expandable_content}>{children}</div>}
        </div>
    );
};

const ProductPage = ({ locale, locales, product, translatedData }) => {
    if (!product) {
        return <h1>Product not found</h1>;
    }
    const { publicRuntimeConfig } = getConfig()
    const site_url = publicRuntimeConfig.BASE_URL

    const { data: session } = useSession();
    const [notification, setNotification] = useState(null);
    const { t } = useTranslation("common");

    const translatedName = translatedData.name;
    // const translatedName = seoTitle;
    const translatedDescription = `${translatedName} : ${translatedData.description}`;
    const translatedKeywords = translatedData.keywords
    const brand_name = t("brand_name")

    const router = useRouter();

    const [uMayLikeProducts, setUMayLikeProducts] = useState([])
    useEffect(() => {
        const fetchRecommendedProducts = async () => {
            try {
                const resposne = await axios.get("/api/products")
                console.log(resposne);
                if (resposne.status == 200) {
                    setUMayLikeProducts(resposne.data)
                    console.log(resposne.data);
                } else {
                    setUMayLikeProducts([])

                }
            } catch (e) {

                console.log(e)

            }

        }

        fetchRecommendedProducts()
    }, [])


    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": translatedName,
        "image": [
            `${site_url}${product.imageUrl}`
        ],
        "description": translatedDescription,
        "brand": {
            "@type": "Brand",
            "name": brand_name
        },
        "sku": "ORG-ALOE-001",
        "mpn": "123456",
        "identifier": {
            "@type": "PropertyValue",
            "propertyID": "GTIN",
            "value": "0123456789012"
        },
        "offers": {
            "@type": "Offer",
            "url": `${site_url}/products/${product._id}`,

            "priceCurrency": "INR",
            "price": `${product.price}`,
            "priceValidUntil": "2025-12-31",
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {
                "@type": "Organization",
                "name": brand_name
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "56"
        },
        "review": [
            {
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": "John Doe"
                },
                "datePublished": "2025-01-15",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                },
                "reviewBody": "Amazing product! My skin feels so refreshed."
            }
        ]
    };

    const newNotify = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 2000);
    };

    return (
        <>
            <Head>
                <title>{`${translatedName} | Organic Store`}</title>
                <meta name="description" content={translatedDescription} />
                <meta name="keywords" content={translatedKeywords} />
                <meta name="author" content={brand_name} />
                <meta name="robots" content="index, follow" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="product" />
                <meta property="og:title" content={translatedName} />
                <meta property="og:description" content={translatedDescription} />
                <meta property="og:image" content={`${site_url}/${product.imageUrl}`} />
                <meta property="og:url" content={site_url + `/${locale}` + "/products/" + product._id} />
                <meta property="og:site_name" content={brand_name} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={translatedName} />
                <meta name="twitter:description" content={translatedDescription} />
                <meta name="twitter:image" content={`${site_url}/${product.imageUrl}`} />
                <meta name="twitter:site" content={brand_name} />

                {/* Canonical URL (Language-Specific) */}
                <link rel="canonical" href={`${site_url}/products/${product._id}`} />


                {/* Multilanguage Support with hreflang */}
                {locales.map((lang) => (
                    <link
                        key={lang}
                        rel="alternate"
                        hrefLang={lang}
                        href={`${site_url}/${lang}/products/${product._id}`}
                    />
                ))}

                {/* Product Schema */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...productSchema, inLanguage: locale }) }} />
                {/* <script type="application/ld+json">
                    {JSON.stringify(productSchema)}
                </script> */}
            </Head>
            <div className="navHolder"></div>

            <div className={styles.product_container}>
                {notification && <div className="notification">{notification}</div>}
                <h1>{translatedName}</h1>
                <section className={styles.sec_1}>
                    <Image src={product.imageUrl} width={350} height={400} alt={translatedName} />

                    <div className={styles.details}>
                        <div className={styles.sci_name}>{translatedData.scientificName}</div>
                        <div className={styles.oth_name}>
                            {/* {t(`${productName}.otherNames`)} */}
                        </div>
                        <div className={styles.price}><strong>{t("price")}:</strong> ${product.price}</div>
                        <div>{t("rating")}: ⭐⭐⭐⭐☆</div>
                        <hr />
                        <div className={styles.description}>
                            <p>{translatedDescription}</p>
                        </div>

                        <div className={styles.action_btn}>
                            <button onClick={() => onAddToWishlist(router, product._id, session).success == false ? newNotify(t("unable_to_add_to_wishlist")) : newNotify(t("added_to_wishlist"))} className="button-outline ">{t("add_to_wishlist")}</button>
                            <button onClick={() => onAddToCart(router, product._id, session).success == false ? newNotify(t("unable_to_add_to_cart")) : newNotify(t("added_to_cart"))}>{t("add_to_cart")}</button>
                            <button onClick={() => onBuy(router, product._id, session)}>{t(`buy_now`)}</button>
                        </div>
                        <hr />
                    </div>
                </section>
                <section>
                    <ExpandableSection title={t("product_page.more_details")}>
                        <section className={styles.other_details}>
                            <div>
                                <strong>{t("product_page.ingredients")}</strong>  {
                                    translatedData.ingredients?.map((item) => { return item }).join(" | ")
                                }
                            </div>
                            <div>
                                <strong>{t("product_page.suitable_for")}</strong>  {translatedData.suitableFor?.map((item) => { return item }).join(" | ")}
                            </div>
                            <div>
                                <strong>{t("product_page.use_with")}</strong> {translatedData.ingredientsToUseWith?.map((item) => { return item }).join(" | ")}
                            </div>
                            <div>
                                <strong>{t("product_page.category")}</strong> {translatedData.category?.map((item) => { return item }).join(" | ")}
                            </div>
                            <div>
                                <strong>{t("product_page.timePeriod")}</strong> {translatedData.timePeriod}
                            </div>
                            <div className={styles.notes}>
                                <strong>{t("product_page.note")}:</strong>
                                <ul>
                                    {translatedData.notes?.map((item) => { return <li>{item}</li> })}
                                </ul>
                            </div>
                        </section>
                    </ExpandableSection>
                    <hr />

                    <ExpandableSection title={t("product_page.benefits")}>
                        <h3 className={styles.detail_title}>{t("product_page.for_hair")}</h3>
                        <p className={styles.detail_para}>{translatedData.benefits?.hair || "No data available."}</p>
                        <h3 className={styles.detail_title}>{t("product_page.for_skin")}</h3>
                        <p className={styles.detail_para}>{translatedData.benefits?.skin || "No data available."}</p>
                        <h3 className={styles.detail_title}>{t("product_page.for_health")}</h3>
                        <p className={styles.detail_para}>{translatedData.benefits?.health || "No data available."}</p>
                    </ExpandableSection>
                </section>
                <hr />
                <section className="sec sec-2">
                    <ExpandableSection title={t("product_page.how_to_use")}>
                        <h3 className={styles.detail_title}>{t("product_page.for_hair")}</h3>
                        <p className={styles.detail_para}>{translatedData.howToUse?.hair || "No data available."}</p>
                        <h3 className={styles.detail_title}>{t("product_page.for_skin")}</h3>
                        <p className={styles.detail_para}>{translatedData.howToUse?.skin || "No data available."}</p>
                        <h3 className={styles.detail_title}>{t("product_page.for_health")}</h3>
                        <p className={styles.detail_para}>{translatedData.howToUse?.health || "No data available."}</p>
                    </ExpandableSection>
                </section>

                <section className={styles.reviews}>
                    <div className={styles.review_card}>
                        <span>Name</span>
                        <span>review</span>
                    </div>
                </section>

                <section className={styles.more_products}>
                    <Carousel>
                        {uMayLikeProducts.length !== 0 &&
                            uMayLikeProducts.map((product, index) =>
                                <div key={index} className={styles.productCard}>
                                    <Image src={product.imageUrl} alt={product.name} width={300} height={300} />
                                    <section className={styles.product_info}>
                                        <h3>{product.name}</h3>
                                        {/* {t("home.read_more")} */}
                                        <Link href={`/products`}><FaArrowRight /></Link>
                                    </section>
                                </div>
                            )}
                    </Carousel>
                </section>
            </div>
        </>
    );
};

export async function getStaticPaths() {
    await dbConnect();
    const products = await Product.find({}, "_id"); // Fetch IDs only

    console.log("Fetched Products:", products); // Check structure

    const paths = [];
    const supportedLocales = ["en", "hi"];

    products.forEach((product) => {
        const productId = product._id?.toString(); // Convert ObjectId to String
        if (!productId) {
            console.error("❌ Missing Product ID for:", product);
            return;
        }

        supportedLocales.forEach((locale) => {
            paths.push({
                params: { id: productId },
                locale, // Generate paths for each language
            });
        });
    });

    console.log("Generated Paths:", paths);

    return {
        paths,
        fallback: "blocking",
    };
}

export async function getStaticProps({ params, locale, locales }) {
    await dbConnect();

    const product = await Product.findById(params.id).lean();
    if (!product) {
        return { notFound: true };
    }

    const replacedProductName = product.name.replace(/\s/g, "").toLowerCase();
    const productData = productsJson?.[replacedProductName] ?? {};

    console.log(replacedProductName);


    const translations = await serverSideTranslations(locale, ["common"])

    const translatedData = translations._nextI18Next.initialI18nStore[locale].common[replacedProductName]
    console.log(translations)
    return {
        props: {
            locale, locales,
            product: JSON.parse(JSON.stringify(product)), // Ensures serializable object
            translatedData,
            ...translations

        },
        revalidate: 10, // Revalidates every 10 minutes
    };
}

export default ProductPage;