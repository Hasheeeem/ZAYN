import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import ActionButton from './ActionButton';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: {
    edit?: (id: number | string) => void;
    delete?: (id: number | string) => void;
    view?: (id: number | string) => void;
  };
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: (number | string)[]) => void;
  bulkActions?: React.ReactNode;
  statusType?: 'lead' | 'opportunity' | 'user';
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  actions,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  bulkActions,
  statusType = 'lead'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = e.target.checked
      ? new Set(paginatedData.map(item => item.id))
      : new Set<number | string>();
    
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleSelectRow = (id: number | string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {(selectable && selectedRows.size > 0) && (
        <div className="bg-indigo-50 px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-indigo-700">
            {selectedRows.size} item{selectedRows.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            {bulkActions}
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {selectable && (
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={paginatedData.every(item => selectedRows.has(item.id))}
                    onChange={handleSelectAll}
                    className="rounded text-indigo-600"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer select-none' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <span className="text-gray-400">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )
                        ) : (
                          <ArrowUpDown size={16} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {selectable && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(item.id)}
                      onChange={() => handleSelectRow(item.id)}
                      className="rounded text-indigo-600"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={`${item.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {actions.view && (
                      <ActionButton
                        label="View"
                        variant="secondary"
                        size="sm"
                        onClick={() => actions.view?.(item.id)}
                      />
                    )}
                    {actions.edit && (
                      <ActionButton
                        label="Edit"
                        variant="primary"
                        size="sm"
                        onClick={() => actions.edit?.(item.id)}
                      />
                    )}
                    {actions.delete && (
                      <ActionButton
                        label="Delete"
                        variant="danger"
                        size="sm"
                        onClick={() => actions.delete?.(item.id)}
                      />
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
          </div>
          <div className="flex gap-2">
            <ActionButton
              label="Previous"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
            />
            <ActionButton
              label="Next"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;