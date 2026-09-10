import { useState, useEffect } from 'react';
import { getCategories } from '../../lib/expenseService';

function ExpenseFilters({ filters, setFilters }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-card border border-border p-4 rounded-lg flex flex-col md:flex-row gap-4 mb-6 shadow-sm">
      <div className="flex-1">
        <label className="block text-sm font-medium text-muted-foreground mb-1">Search</label>
        <input
          type="text"
          name="search"
          value={filters.search || ''}
          onChange={handleChange}
          placeholder="Search descriptions..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-muted-foreground mb-1">Month</label>
        <input
          type="month"
          name="month"
          value={filters.month || ''}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
        <select
          name="category"
          value={filters.category || ''}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-muted-foreground mb-1">UPI Transaction</label>
        <select
          name="upi_transaction"
          value={filters.upi_transaction || ''}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    </div>
  );
}

export default ExpenseFilters;
