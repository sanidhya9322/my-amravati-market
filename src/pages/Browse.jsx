import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
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
  serverTimestamp
} from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FiltersPanel from '../components/FiltersPanel';
import { debounce } from '../utils/debounce';
import { IconFilter } from '../icons/IconFilter';

const PAGE_SIZE = 24;

const Browse = () => {
  const [products, setProducts] = useState([]); // loaded pages
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  // url sync
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Refs for infinite loader
  const loadMoreRef = useRef(null);

  // initial load (paginated)
  const fetchPage = useCallback(async (startAfterDoc = null) => {
    setLoading(true);
    try {
      const productsRef = collection(db, 'products');
      // Firestore query with limit for pagination
      let q = query(productsRef, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
      if (startAfterDoc) q = query(productsRef, orderBy('createdAt', 'desc'), startAfter(startAfterDoc), limit(PAGE_SIZE));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs;
      const list = docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(prev => (startAfterDoc ? [...prev, ...list] : list));
      setLastDoc(docs.length ? docs[docs.length - 1] : null);
      setHasMore(docs.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // initial mount - check for URL params for filters/search/sort
  useEffect(() => {
    const initialSearch = searchParams.get('q') || '';
    const initialLocation = searchParams.get('loc') || '';
    const initialCategory = searchParams.get('cat') || '';
    const initialSort = searchParams.get('sort') || 'newest';

    setSearchTerm(initialSearch);
    setFilterLocation(initialLocation);
    setFilterCategory(initialCategory);
    setSortOrder(initialSort);

    // initial fetch
    fetchPage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL when filters change
  useEffect(() => {
    const params = {};
    if (searchTerm) params.q = searchTerm;
    if (filterLocation) params.loc = filterLocation;
    if (filterCategory) params.cat = filterCategory;
    if (sortOrder && sortOrder !== 'newest') params.sort = sortOrder;
    setSearchParams(params, { replace: true });
    // also reset products to first page when search/filter change
    // Debounce reload slightly to avoid double reloads
    const t = setTimeout(() => fetchPage(null), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterLocation, filterCategory, sortOrder]);

  // debounced search input handler
  const onSearchChange = useMemo(() => debounce((value) => {
    setSearchTerm(value);
  }, 300), []);

  // computed & memoized filteredProducts (client-side)
  const filteredProducts = useMemo(() => {
    const q = (products || []).filter(p => {
      const title = (p.title || '').toLowerCase();
      const term = (searchTerm || '').toLowerCase();
      const matchesTitle = !term || title.includes(term);
      const locationMatch = !filterLocation || p.location === filterLocation;
      const categoryMatch = !filterCategory || p.category === filterCategory;
      return matchesTitle && locationMatch && categoryMatch;
    });

    // sorting + promoted prioritization
    q.sort((a, b) => {
      if (a.promoted && !b.promoted) return -1;
      if (!a.promoted && b.promoted) return 1;

      if (a.promoted && b.promoted) {
        return (b.promotedAt?.seconds || 0) - (a.promotedAt?.seconds || 0);
      }

      if (sortOrder === 'priceLowHigh') return (a.price || 0) - (b.price || 0);
      if (sortOrder === 'priceHighLow') return (b.price || 0) - (a.price || 0);
      // newest
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

    return q;
  }, [products, searchTerm, filterLocation, filterCategory, sortOrder]);

  // Load more handler
  const loadMore = async () => {
    if (!hasMore || loading) return;
    await fetchPage(lastDoc);
  };

  // IntersectionObserver to auto-load on scrolling near bottom (optional)
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    }, { root: null, rootMargin: '400px', threshold: 0.1 });
    obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMoreRef.current, hasMore, loading, lastDoc]);

  // favorites (keeps same logic, but non-blocking feedback)
  const handleAddToFavorites = async (product) => {
    const user = auth.currentUser;
    if (!user) {
      // For production, replace with a nice toast or modal sign-in flow
      return window.alert('Please login to save favorites');
    }
    try {
      const favRef = doc(db, 'users', user.uid, 'favorites', product.id);
      const favSnap = await getDoc(favRef);
      if (favSnap.exists()) {
        await deleteDoc(favRef);
        // replace with toast
        window.alert('Removed from favorites!');
      } else {
        await setDoc(favRef, {
          productId: product.id,
          title: product.title || '',
          imageUrl: product.imageUrl || (product.imageUrls?.[0]) || '',
          price: product.price || 0,
          description: product.description || '',
          category: product.category || '',
          location: product.location || '',
          sellerPhone: product.sellerPhone || '',
          createdAt: product.createdAt || serverTimestamp(),
        });
        window.alert('Added to favorites!');
      }
    } catch (err) {
      console.error('Error saving favorite:', err);
      window.alert('Something went wrong. Try again.');
    }
  };

  // Derive dynamic lists for filters
  const availableLocations = useMemo(() => {
    const setLoc = new Set();
    products.forEach(p => p.location && setLoc.add(p.location));
    // fallback to common list if empty
    if (setLoc.size === 0) {
      return [
        "Amravati", "Achalpur", "Anjangaon Surji", "Bhatkuli",
        "Chandur Bazar", "Chandur Railway", "Chikhaldara", "Warud",
        "Dhamangaon Railway", "Dharni", "Daryapur", "Morshi",
        "Nandgaon Khandeshwar", "Teosa", "Anjangaon"
      ];
    }
    return Array.from(setLoc).sort();
  }, [products]);

  const availableCategories = useMemo(() => {
    const setCat = new Set();
    products.forEach(p => p.category && setCat.add(p.category));
    if (setCat.size === 0) {
      return [
        "Books & Notes", "Handmade Items", "Homemade Food",
        "Second-hand Items", "New Items", "From Shop"
      ];
    }
    return Array.from(setCat).sort();
  }, [products]);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header / Search */}
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-lg sm:text-2xl font-bold flex-1">🛒 Explore MyAmravati Market</h1>

          {/* Mobile filter button */}
          <button
            aria-expanded={isFilterOpen}
            aria-controls="filters-panel"
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg bg-white shadow-sm sm:hidden"
          >
            <IconFilter /> Filters
          </button>

          <div className="hidden sm:flex items-center gap-3">
            <input
              aria-label="Search products"
              defaultValue={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, category or seller..."
              className="border rounded-lg px-3 py-2 w-80 text-sm focus:ring focus:ring-blue-300"
            />
            <select
              aria-label="Sort products"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters (desktop sticky) */}
          <aside className="hidden lg:block lg:col-span-1">
            <FiltersPanel
              id="filters-panel"
              locations={availableLocations}
              categories={availableCategories}
              valueLocation={filterLocation}
              onChangeLocation={setFilterLocation}
              valueCategory={filterCategory}
              onChangeCategory={setFilterCategory}
              onClear={() => { setFilterLocation(''); setFilterCategory(''); setSearchTerm(''); setSortOrder('newest'); }}
            />
          </aside>

          {/* Main content */}
          <section className="lg:col-span-3">
            {/* Top bar for small screens */}
            <div className="sm:hidden mb-3 flex items-center justify-between gap-3">
              <input
                aria-label="Search products"
                defaultValue={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by title..."
                className="border rounded-lg px-3 py-2 w-full text-sm"
              />
            </div>

            {/* Results Meta - **FIXED: Removed "{filteredProducts.length} items"** */}
            <div className="flex items-center justify-between mb-4">
              {/* Removed: <div className="text-sm text-gray-600">{filteredProducts.length} items</div> */}
              <div className="hidden sm:flex items-center gap-2">
                <label className="text-xs text-gray-500">Sort</label>
                <select
                  aria-label="Sort products"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="priceLowHigh">Price: Low to High</option>
                  <option value="priceHighLow">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {filteredProducts.length === 0 && !loading ? (
                <div className="col-span-full p-6 bg-white rounded-xl shadow text-center">
                  <h2 className="font-semibold mb-2">No products found</h2>
                  <p className="text-sm text-gray-600">Try adjusting filters or clear search.</p>
                </div>
              ) : (
                filteredProducts.map((p, idx) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onToggleFavorite={() => handleAddToFavorites(p)}
                  />
                ))
              )}
            </div>

            {/* Load more / infinite loader */}
            <div className="mt-6 flex flex-col items-center gap-3">
              {loading && <div className="text-sm text-gray-500">Loading...</div>}
              {!loading && hasMore && (
                <button
                  onClick={loadMore}
                  className="px-4 py-2 bg-white border rounded-lg shadow-sm"
                >
                  Load more
                </button>
              )}
              <div ref={loadMoreRef} style={{ height: 1, width: '100%' }} aria-hidden />
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filters-panel"
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setIsFilterOpen(false)} aria-label="Close filters">Close</button>
            </div>
            <FiltersPanel
              id="filters-panel-mobile"
              locations={availableLocations}
              categories={availableCategories}
              valueLocation={filterLocation}
              onChangeLocation={setFilterLocation}
              valueCategory={filterCategory}
              onChangeCategory={setFilterCategory}
              onClear={() => { setFilterLocation(''); setFilterCategory(''); setIsFilterOpen(false); }}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default Browse;