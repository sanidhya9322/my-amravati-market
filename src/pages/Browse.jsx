import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  limit,
  startAfter,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Link, useSearchParams } from "react-router-dom";
import { db, auth } from "../firebase/firebaseConfig";
import ProductCard from "../components/ProductCard";
import FiltersPanel from "../components/FiltersPanel";
import { debounce } from "../utils/debounce";
import { IconFilter } from "../icons/IconFilter";

const PAGE_SIZE = 24;

const Browse = () => {
  /* -------------------- DATA STATE -------------------- */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  /* -------------------- UI STATE -------------------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const loadMoreRef = useRef(null);

  /* -------------------- FETCH -------------------- */
  const fetchPage = useCallback(async (startAfterDoc = null) => {
    setLoading(true);
    try {
      const productsRef = collection(db, "products");
      let q = query(
        productsRef,
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );

      if (startAfterDoc) {
        q = query(
          productsRef,
          orderBy("createdAt", "desc"),
          startAfter(startAfterDoc),
          limit(PAGE_SIZE)
        );
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      setProducts((prev) =>
        startAfterDoc ? [...prev, ...docs] : docs
      );
      setLastDoc(snapshot.docs.at(-1) || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("Browse fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* -------------------- INITIAL LOAD -------------------- */
  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
    setFilterLocation(searchParams.get("loc") || "");
    setFilterCategory(searchParams.get("cat") || "");
    setSortOrder(searchParams.get("sort") || "newest");
    fetchPage(null);
    // eslint-disable-next-line
  }, []);

  /* -------------------- URL SYNC -------------------- */
  useEffect(() => {
    const params = {};
    if (searchTerm) params.q = searchTerm;
    if (filterLocation) params.loc = filterLocation;
    if (filterCategory) params.cat = filterCategory;
    if (sortOrder !== "newest") params.sort = sortOrder;
    setSearchParams(params, { replace: true });

    const t = setTimeout(() => fetchPage(null), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [searchTerm, filterLocation, filterCategory, sortOrder]);

  /* -------------------- SEARCH -------------------- */
  const onSearchChange = useMemo(
    () =>
      debounce((val) => {
        setSearchTerm(val);
      }, 300),
    []
  );

  /* -------------------- FILTER + SORT -------------------- */
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        (!term || p.title?.toLowerCase().includes(term)) &&
        (!filterLocation || p.location === filterLocation) &&
        (!filterCategory || p.category === filterCategory)
      );
    });

    list.sort((a, b) => {
      if (a.promoted && !b.promoted) return -1;
      if (!a.promoted && b.promoted) return 1;

      if (sortOrder === "priceLowHigh")
        return (a.price || 0) - (b.price || 0);
      if (sortOrder === "priceHighLow")
        return (b.price || 0) - (a.price || 0);

      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

    return list;
  }, [products, searchTerm, filterLocation, filterCategory, sortOrder]);

  /* -------------------- INFINITE SCROLL -------------------- */
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          fetchPage(lastDoc);
        }
      },
      { rootMargin: "400px" }
    );
    obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, lastDoc, fetchPage]);

  /* -------------------- FAVORITES -------------------- */
  const handleAddToFavorites = async (product) => {
    const user = auth.currentUser;
    if (!user) return alert("Please login to save favorites");

    const favRef = doc(db, "users", user.uid, "favorites", product.id);
    const snap = await getDoc(favRef);

    if (snap.exists()) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, {
        productId: product.id,
        title: product.title,
        imageUrl: product.imageUrls?.[0] || "",
        price: product.price || 0,
        createdAt: serverTimestamp(),
      });
    }
  };

  /* -------------------- FILTER LISTS -------------------- */
  const locations = useMemo(
    () => [...new Set(products.map((p) => p.location).filter(Boolean))],
    [products]
  );

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const isMarketplaceEmpty = !loading && products.length === 0;
  const isFilteredEmpty =
    !loading && products.length > 0 && filteredProducts.length === 0;

  /* ==================== UI ==================== */
  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* SEARCH HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <input
            placeholder="Search products in Amravati..."
            defaultValue={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 border rounded-xl px-4 py-3 text-sm bg-white shadow-sm"
          />
          <button
            onClick={() => setIsFilterOpen(true)}
            className="sm:hidden flex items-center gap-2 border px-4 py-3 rounded-xl bg-white shadow-sm"
          >
            <IconFilter /> Filters
          </button>
        </div>

        {/* EMPTY MARKETPLACE */}
        {isMarketplaceEmpty && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              No products yet in Amravati
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Be the first one to list a product and help start the local market.
            </p>
            <Link
              to="/add-product"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              Add First Product
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* DESKTOP FILTERS */}
          <aside className="hidden lg:block">
            <FiltersPanel
              locations={locations}
              categories={categories}
              valueLocation={filterLocation}
              valueCategory={filterCategory}
              onChangeLocation={setFilterLocation}
              onChangeCategory={setFilterCategory}
              onClear={() => {
                setFilterLocation("");
                setFilterCategory("");
                setSearchTerm("");
                setSortOrder("newest");
              }}
            />
          </aside>

          {/* PRODUCT GRID */}
          <section className="lg:col-span-3">
            {isFilteredEmpty && (
              <div className="bg-white rounded-xl p-6 text-center mb-6">
                <h3 className="font-semibold">No matching products</h3>
                <p className="text-sm text-gray-500">
                  Try changing search keywords or clearing filters.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onToggleFavorite={() => handleAddToFavorites(p)}
                />
              ))}

              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 bg-gray-200 rounded-xl animate-pulse"
                  />
                ))}
            </div>

            <div ref={loadMoreRef} className="h-1 w-full" />
          </section>
        </div>
      </div>

      {/* MOBILE FILTER */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white p-4 overflow-auto">
            <FiltersPanel
              locations={locations}
              categories={categories}
              valueLocation={filterLocation}
              valueCategory={filterCategory}
              onChangeLocation={setFilterLocation}
              onChangeCategory={setFilterCategory}
              onClear={() => setIsFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default Browse;
