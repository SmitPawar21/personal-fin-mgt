import { Pencil, Trash2, Info } from 'lucide-react';

function ExpenseList({ expenses, onEdit, onDelete }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-card border border-border p-8 rounded text-center flex flex-col items-center">
        <Info className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No expenses found matching the criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-center">UPI</th>
              <th className="px-5 py-3">Created By</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 font-medium whitespace-nowrap">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  {expense.description || <span className="text-muted-foreground italic">No description</span>}
                </td>
                <td className="px-5 py-3">
                  <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-medium">
                    {expense.category}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-bold text-negative">
                  ₹{Number(expense.amount).toFixed(2)}
                </td>
                <td className="px-5 py-3 text-center">
                  {expense.upi_transaction === 'YES' || expense.upi_transaction === true ? (
                    <span className="text-positive bg-positive/15 px-2 py-0.5 rounded text-xs font-bold">YES</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">NO</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="text-xs">
                    <p className="font-medium">{expense.created_by}</p>
                    {expense.updated_by && expense.updated_by !== expense.created_by && (
                      <p className="text-muted-foreground mt-0.5">Edited by: {expense.updated_by}</p>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onEdit(expense)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-1.5 text-muted-foreground hover:text-negative hover:bg-negative/10 rounded transition-colors cursor-pointer"
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
