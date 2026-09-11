import { Pencil, Trash2, Info } from 'lucide-react';

function ExpenseList({ expenses, onEdit, onDelete }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-card border border-border p-8 rounded-lg text-center flex flex-col items-center shadow-sm">
        <Info className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No expenses found matching the criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3 text-center">UPI</th>
              <th className="px-6 py-3">Created By</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {expense.description || <span className="text-muted-foreground italic">No description</span>}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-semibold">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                  ₹{Number(expense.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">
                  {expense.upi_transaction === 'YES' || expense.upi_transaction === true ? (
                    <span className="text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-bold">YES</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">NO</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs">
                    <p className="font-medium">{expense.created_by}</p>
                    {expense.updated_by && expense.updated_by !== expense.created_by && (
                      <p className="text-muted-foreground mt-0.5">Edited by: {expense.updated_by}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(expense)}
                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpenseList;
