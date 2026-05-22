import React from 'react';

const CategoryFilters: React.FC = () => {
  const categories = ['Technology', 'Business', 'Marketing', 'Design', 'Health'];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Categories</h3>
      <ul>
        {categories.map((category, index) => (
          <li key={index} className="mb-2">
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-primary rounded" />
              <span className="ml-2 text-foreground">{category}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryFilters;
