import React from 'react';

const FiltersPanel = ({
  id,
  locations = [],
  categories = [],
  valueLocation = '',
  onChangeLocation = () => {},
  valueCategory = '',
  onChangeCategory = () => {},
  onClear = () => {}
}) => {
  return (
    <div id={id} className="bg-white rounded-lg p-3 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-semibold">Filters</h4>
        <button className="text-sm text-blue-600" onClick={onClear}>Clear</button>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium block mb-2">Location</label>
        <select
          value={valueLocation}
          onChange={(e) => onChangeLocation(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
          aria-label="Filter by location"
        >
          <option value="">All locations</option>
          {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium block mb-2">Category</label>
        <select
          value={valueCategory}
          onChange={(e) => onChangeCategory(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* future: price range, seller type toggles, promoted toggle */}
      <div className="mt-3 text-xs text-gray-500">
        Tip: Use filters to narrow results faster.
      </div>
    </div>
  );
};

export default FiltersPanel;
