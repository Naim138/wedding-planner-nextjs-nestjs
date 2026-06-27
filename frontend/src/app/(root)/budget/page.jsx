"use client";
import React, { useEffect, useState } from 'react';
import { axiosClient } from '@/utils/AxiosClient';
import { toast } from 'react-toastify';
import { CgSpinner } from 'react-icons/cg';
import { IoTrashOutline, IoCreateOutline, IoCheckmarkOutline, IoCloseOutline, IoDownloadOutline } from 'react-icons/io5';
import BreadCrums from '@/components/BreadCrums';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BudgetTrackerPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetBudget, setTargetBudget] = useState(1000000);
  const [editingTarget, setEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState("1000000");

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editEstimated, setEditEstimated] = useState(0);
  const [editActual, setEditActual] = useState(0);
  const [editNotes, setEditNotes] = useState('');

  // Add Item form state
  const [newCategory, setNewCategory] = useState('');
  const [newEstimated, setNewEstimated] = useState('');
  const [newActual, setNewActual] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token") || '';
      const response = await axiosClient.get("/budget", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setItems(response.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to load budget spreadsheet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    // Load target budget from localstorage if set
    const savedTarget = localStorage.getItem("wedding_target_budget");
    if (savedTarget) {
      setTargetBudget(Number(savedTarget));
      setTempTarget(savedTarget);
    }
  }, []);

  const handleSaveTarget = () => {
    const value = Number(tempTarget);
    if (isNaN(value) || value <= 0) {
      toast.warning("Please enter a valid positive number for your budget");
      return;
    }
    setTargetBudget(value);
    localStorage.setItem("wedding_target_budget", value.toString());
    setEditingTarget(false);
    toast.success("Target budget updated!");
  };

  const handleStartEdit = (item) => {
    setEditingId(item._id);
    setEditCategory(item.category);
    setEditEstimated(item.estimatedCost);
    setEditActual(item.actualCost);
    setEditNotes(item.notes);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    if (!editCategory.trim()) {
      toast.warning("Category name is required");
      return;
    }

    try {
      const token = localStorage.getItem("token") || '';
      const response = await axiosClient.put(`/budget/${id}`,
        {
          category: editCategory,
          estimatedCost: Number(editEstimated) || 0,
          actualCost: Number(editActual) || 0,
          notes: editNotes
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setItems(prev => prev.map(item => item._id === id ? response.data : item));
      setEditingId(null);
      toast.success("Expense updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save changes");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      toast.warning("Category name is required");
      return;
    }

    try {
      setAdding(true);
      const token = localStorage.getItem("token") || '';
      const response = await axiosClient.post('/budget',
        {
          category: newCategory,
          estimatedCost: Number(newEstimated) || 0,
          actualCost: Number(newActual) || 0,
          notes: newNotes
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setItems(prev => [...prev, response.data]);
      toast.success("New expense category added!");
      setNewCategory('');
      setNewEstimated('');
      setNewActual('');
      setNewNotes('');
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add expense");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this expense category?")) return;

    try {
      const token = localStorage.getItem("token") || '';
      await axiosClient.delete(`/budget/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setItems(prev => prev.filter(item => item._id !== id));
      toast.success("Category deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete expense");
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(88, 28, 135);
      doc.text('Wedding Budget Report', 14, 22);
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add summary
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Target Budget: BDT ${targetBudget.toLocaleString()}`, 14, 42);
      doc.text(`Total Estimated: BDT ${totalEstimated.toLocaleString()}`, 14, 50);
      doc.text(`Total Actual: BDT ${totalActual.toLocaleString()}`, 14, 58);
      doc.text(`Remaining: BDT ${remainingBudget.toLocaleString()}`, 14, 66);
      
      // Add table
      const tableData = items.map(item => [
        item.category,
        `BDT ${item.estimatedCost.toLocaleString()}`,
        `BDT ${item.actualCost.toLocaleString()}`,
        `BDT ${(item.estimatedCost - item.actualCost).toLocaleString()}`,
        item.notes || '—'
      ]);
      
      autoTable(doc, {
        startY: 75,
        head: [['Category', 'Estimated', 'Actual', 'Difference', 'Notes']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [88, 28, 135],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      // Save the PDF
      doc.save(`wedding-budget-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Budget report downloaded successfully!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  // Math summary
  const totalEstimated = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = items.reduce((sum, item) => sum + item.actualCost, 0);
  const remainingBudget = targetBudget - totalActual;
  const budgetUsagePercent = Math.min(100, Math.round((totalActual / targetBudget) * 100)) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadCrums text="Wedding Budget Tracker" />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <CgSpinner className="animate-spin text-6xl text-logo mb-4" />
          <p className="text-zinc-600 font-medium">Loading budget worksheet...</p>
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          {/* Top Overview Cards */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-psmbold text-zinc-900">Budget Overview</h2>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-x-2 px-4 py-2 bg-logo hover:bg-logo/90 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              <IoDownloadOutline className="text-lg" />
              <span>Export PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Target Budget Card */}
            <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Target Budget</p>
                {editingTarget ? (
                  <div className="flex items-center gap-x-2 mt-2">
                    <input
                      type="number"
                      value={tempTarget}
                      onChange={(e) => setTempTarget(e.target.value)}
                      className="w-full px-2 py-1 text-xl border rounded outline-none"
                    />
                    <button onClick={handleSaveTarget} className="p-1 bg-green-500 text-white rounded">
                      <IoCheckmarkOutline className="text-lg" />
                    </button>
                    <button onClick={() => setEditingTarget(false)} className="p-1 bg-zinc-300 text-zinc-700 rounded">
                      <IoCloseOutline className="text-lg" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-psmbold text-zinc-900">BDT {targetBudget.toLocaleString()}</h3>
                    <button
                      onClick={() => {
                        setTempTarget(targetBudget.toString());
                        setEditingTarget(true);
                      }}
                      className="text-xs text-logo font-semibold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-4">Total planning allowance target</p>
            </div>

            {/* Total Estimated Spend */}
            <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Estimated Spend</p>
                <h3 className="text-2xl font-psmbold text-zinc-900">BDT {totalEstimated.toLocaleString()}</h3>
              </div>
              <p className="text-xs text-zinc-500 mt-4">Sum of all planned category costs</p>
            </div>

            {/* Total Actual Spend */}
            <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Actual Spend</p>
                <h3 className={`text-2xl font-psmbold ${totalActual > targetBudget ? 'text-rose-600' : 'text-green-600'}`}>
                  BDT {totalActual.toLocaleString()}
                </h3>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Usage</span>
                <span className={`text-xs font-semibold ${totalActual > targetBudget ? 'text-rose-600' : 'text-green-600'}`}>
                  {budgetUsagePercent}%
                </span>
              </div>
            </div>

            {/* Remaining Balance */}
            <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Remaining</p>
                <h3 className={`text-2xl font-psmbold ${remainingBudget < 0 ? 'text-rose-600' : 'text-indigo-600'}`}>
                  BDT {remainingBudget.toLocaleString()}
                </h3>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border self-start mt-4 ${
                remainingBudget < 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
              }`}>
                {remainingBudget < 0 ? 'Over Budget' : 'Within Budget'}
              </span>
            </div>
          </div>

          {/* Visual Budget Progress Bar */}
          <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm">
            <div className="flex items-center justify-between text-sm font-semibold mb-2">
              <span className="text-zinc-600">Budget Consumed</span>
              <span className="text-zinc-900">{budgetUsagePercent}% (BDT {totalActual.toLocaleString()} of BDT {targetBudget.toLocaleString()})</span>
            </div>
            <div className="w-full bg-zinc-100 h-4 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  totalActual > targetBudget ? 'bg-rose-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${budgetUsagePercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Table Spreadsheet View */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-zinc-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-150 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4 w-28">Estimate</th>
                        <th className="px-6 py-4 w-28">Actual</th>
                        <th className="px-6 py-4">Difference</th>
                        <th className="px-6 py-4">Notes</th>
                        <th className="px-6 py-4 w-24 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
                      {items.map((item) => {
                        const isEditing = editingId === item._id;
                        const diff = item.estimatedCost - item.actualCost;

                        return (
                          <tr key={item._id} className="hover:bg-zinc-50/50 transition-colors">
                            {isEditing ? (
                              <>
                                <td className="px-6 py-3">
                                  <input
                                    type="text"
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="w-full px-2 py-1 border border-zinc-200 rounded outline-none text-sm bg-transparent"
                                  />
                                </td>
                                <td className="px-6 py-3">
                                  <input
                                    type="number"
                                    value={editEstimated}
                                    onChange={(e) => setEditEstimated(e.target.value)}
                                    className="w-full px-2 py-1 border border-zinc-200 rounded outline-none text-sm bg-transparent"
                                  />
                                </td>
                                <td className="px-6 py-3">
                                  <input
                                    type="number"
                                    value={editActual}
                                    onChange={(e) => setEditActual(e.target.value)}
                                    className="w-full px-2 py-1 border border-zinc-200 rounded outline-none text-sm bg-transparent"
                                  />
                                </td>
                                <td className="px-6 py-3 text-zinc-400">
                                  -
                                </td>
                                <td className="px-6 py-3">
                                  <input
                                    type="text"
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    className="w-full px-2 py-1 border border-zinc-200 rounded outline-none text-sm bg-transparent"
                                  />
                                </td>
                                <td className="px-6 py-3 text-right flex justify-end gap-x-1 mt-1">
                                  <button
                                    onClick={() => handleSaveEdit(item._id)}
                                    className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                    title="Save"
                                  >
                                    <IoCheckmarkOutline className="text-lg" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1.5 bg-zinc-50 text-zinc-600 rounded-lg hover:bg-zinc-100"
                                    title="Cancel"
                                  >
                                    <IoCloseOutline className="text-lg" />
                                  </button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-4 font-semibold text-zinc-900">{item.category}</td>
                                <td className="px-6 py-4">BDT {item.estimatedCost.toLocaleString()}</td>
                                <td className="px-6 py-4">BDT {item.actualCost.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                  <span className={`font-semibold ${diff < 0 ? 'text-rose-500' : diff > 0 ? 'text-green-500' : 'text-zinc-500'}`}>
                                    {diff < 0 ? `-BDT ${Math.abs(diff).toLocaleString()}` : `BDT ${diff.toLocaleString()}`}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-zinc-500 italic max-w-[120px] truncate" title={item.notes}>
                                  {item.notes || '—'}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-x-1">
                                  <button
                                    onClick={() => handleStartEdit(item)}
                                    className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <IoCreateOutline className="text-lg" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item._id)}
                                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <IoTrashOutline className="text-lg" />
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Add Custom Item Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-psmbold text-zinc-900 mb-4">Add Custom Expense</h3>
                
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 uppercase mb-1">Category <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wedding Florist"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 text-sm transition-colors bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 uppercase mb-1">Estimated Cost (BDT)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={newEstimated}
                      onChange={(e) => setNewEstimated(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 text-sm transition-colors bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 uppercase mb-1">Actual Cost (BDT)</label>
                    <input
                      type="number"
                      placeholder="e.g. 45000"
                      value={newActual}
                      onChange={(e) => setNewActual(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 text-sm transition-colors bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 uppercase mb-1">Notes</label>
                    <textarea
                      placeholder="Additional details..."
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 text-sm transition-colors bg-transparent resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={adding}
                    className="w-full py-2.5 bg-logo hover:bg-logo/90 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-x-2 shadow-sm"
                  >
                    {adding ? (
                      <CgSpinner className="animate-spin text-lg" />
                    ) : (
                      <span>Add Expense</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTrackerPage;
