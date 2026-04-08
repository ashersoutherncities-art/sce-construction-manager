import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

interface Material {
  id: number;
  category: string;
  subcategory: string;
  name: string;
  unit: string;
  price: number | null;
  brand: string;
  sku: string;
  in_stock: number;
  last_updated: string;
}

interface LineItem {
  material: Material;
  quantity: number;
}

const CATEGORIES = ['All', 'Lumber', 'Drywall', 'Concrete', 'Roofing', 'Insulation', 'Plumbing', 'Electrical', 'Fasteners', 'Flooring', 'Paint', 'HVAC'];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filtered, setFiltered] = useState<Material[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [projectName, setProjectName] = useState('');
  const [showEstimate, setShowEstimate] = useState(false);

  useEffect(() => {
    fetch('/api/materials')
      .then(r => r.json())
      .then(data => {
        setMaterials(data.materials || []);
        if (data.materials?.length) {
          const updated = data.materials[0]?.last_updated;
          setLastUpdate(updated ? new Date(updated).toLocaleDateString() : '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = materials;
    if (category !== 'All') {
      result = result.filter(m => m.category === category);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(s) ||
        m.subcategory?.toLowerCase().includes(s) ||
        m.category.toLowerCase().includes(s)
      );
    }
    setFiltered(result);
  }, [materials, category, search]);

  const addItem = useCallback((mat: Material) => {
    setLineItems(prev => {
      const exists = prev.find(li => li.material.id === mat.id);
      if (exists) return prev;
      return [...prev, { material: mat, quantity: 1 }];
    });
  }, []);

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) {
      setLineItems(prev => prev.filter(li => li.material.id !== id));
    } else {
      setLineItems(prev => prev.map(li => li.material.id === id ? { ...li, quantity: qty } : li));
    }
  };

  const total = lineItems.reduce((sum, li) => sum + (li.material.price || 0) * li.quantity, 0);

  const exportCSV = () => {
    const rows = [
      ['Material', 'Category', 'Unit', 'Qty', 'Unit Price', 'Total'],
      ...lineItems.map(li => [
        li.material.name,
        li.material.category,
        li.material.unit,
        li.quantity,
        li.material.price?.toFixed(2) || '0.00',
        ((li.material.price || 0) * li.quantity).toFixed(2),
      ]),
      ['', '', '', '', 'TOTAL', total.toFixed(2)],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'estimate'}-materials.csv`;
    a.click();
  };

  return (
    <>
      <Head>
        <title>Materials Estimator | SCE Construction</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#132452] px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-bold">Materials Price Database</h1>
            <p className="text-blue-200 text-sm">
              {materials.length} items — Home Depot prices{lastUpdate ? ` · Updated ${lastUpdate}` : ''}
            </p>
          </div>
          <a href="/dashboard" className="text-blue-200 hover:text-white text-sm">← Back to Dashboard</a>
        </div>

        <div className="flex h-[calc(100vh-72px)]">
          {/* Left: Material Catalog */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filters */}
            <div className="bg-white border-b px-4 py-3 flex gap-3 items-center flex-wrap">
              <input
                className="border rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#132452]"
                placeholder="Search materials..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="flex gap-1 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      category === cat
                        ? 'bg-[#132452] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-64 text-gray-400">Loading materials...</div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400">No materials found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map(mat => {
                    const inCart = lineItems.some(li => li.material.id === mat.id);
                    return (
                      <div
                        key={mat.id}
                        className={`bg-white rounded-lg border p-3 cursor-pointer hover:border-[#132452] transition-colors ${
                          inCart ? 'border-[#fa8c41] bg-orange-50' : ''
                        }`}
                        onClick={() => addItem(mat)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-medium text-[#fa8c41]">{mat.subcategory || mat.category}</span>
                          {inCart && <span className="text-xs text-[#fa8c41] font-bold">Added</span>}
                        </div>
                        <div className="font-medium text-gray-800 text-sm">{mat.name}</div>
                        {mat.brand && <div className="text-xs text-gray-400">{mat.brand}</div>}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-lg font-bold text-[#132452]">
                            {mat.price ? `$${mat.price.toFixed(2)}` : 'Price TBD'}
                          </span>
                          <span className="text-xs text-gray-400">/{mat.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Estimate Builder */}
          <div className="w-80 bg-white border-l flex flex-col">
            <div className="px-4 py-3 border-b bg-[#132452]">
              <h2 className="text-white font-bold">Estimate Builder</h2>
              <input
                className="mt-2 w-full border rounded px-2 py-1 text-sm focus:outline-none"
                placeholder="Project name..."
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y">
              {lineItems.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm px-4 text-center">
                  Click materials to add them to your estimate
                </div>
              ) : (
                lineItems.map(li => (
                  <div key={li.material.id} className="px-4 py-3">
                    <div className="font-medium text-sm text-gray-800 mb-1">{li.material.name}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          className="w-6 h-6 rounded bg-gray-100 text-gray-600 text-sm hover:bg-gray-200"
                          onClick={() => updateQty(li.material.id, li.quantity - 1)}
                        >-</button>
                        <span className="text-sm w-8 text-center">{li.quantity}</span>
                        <button
                          className="w-6 h-6 rounded bg-gray-100 text-gray-600 text-sm hover:bg-gray-200"
                          onClick={() => updateQty(li.material.id, li.quantity + 1)}
                        >+</button>
                        <span className="text-xs text-gray-400">{li.material.unit}</span>
                      </div>
                      <span className="font-semibold text-[#132452] text-sm">
                        ${((li.material.price || 0) * li.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total & Actions */}
            {lineItems.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">Materials Total</span>
                  <span className="text-xl font-bold text-[#132452]">${total.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Add 15-20% for waste. Labor billed separately.
                </div>
                <button
                  onClick={exportCSV}
                  className="w-full bg-[#fa8c41] text-white py-2 rounded font-medium text-sm hover:bg-orange-600 transition-colors"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => setLineItems([])}
                  className="w-full bg-gray-100 text-gray-600 py-2 rounded font-medium text-sm hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
