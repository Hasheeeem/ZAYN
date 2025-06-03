import React from 'react';
import ActionButton from './ActionButton';
import StatusBadge from './StatusBadge';

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: {
    edit?: (id: number) => void;
    view?: (id: number) => void;
    delete?: (id: number) => void;
  };
  statusType?: 'lead' | 'opportunity' | 'user';
}

const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  data, 
  actions, 
  statusType = 'lead' 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.label}
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                {columns.map((column) => (
                  <td key={`${item.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? (
                      column.render(item[column.key], item)
                    ) : column.key === 'status' ? (
                      <StatusBadge status={item[column.key]} type={statusType} />
                    ) : (
                      item[column.key]
                    )}
                  </td>
                ))}
                
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {actions.edit && (
                      <ActionButton 
                        label="Edit" 
                        variant="primary" 
                        size="sm" 
                        onClick={() => actions.edit && actions.edit(item.id)} 
                      />
                    )}
                    {actions.view && (
                      <ActionButton 
                        label="View" 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => actions.view && actions.view(item.id)} 
                      />
                    )}
                    {actions.delete && (
                      <ActionButton 
                        label="Delete" 
                        variant="danger" 
                        size="sm" 
                        onClick={() => actions.delete && actions.delete(item.id)} 
                      />
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;