"use client";
import React, { useEffect, useState } from 'react';
import { axiosClient } from '@/utils/AxiosClient';
import { toast } from 'react-toastify';
import { CgSpinner } from 'react-icons/cg';
import { IoCheckmarkCircle, IoCheckmarkCircleOutline, IoTrashOutline, IoAddCircleOutline } from 'react-icons/io5';
import BreadCrums from '@/components/BreadCrums';

const ChecklistPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, COMPLETED
  
  // New Task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newDueDate, setNewDueDate] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token") || '';
      const response = await axiosClient.get("/checklist", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTasks(response.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to load checklist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (task) => {
    try {
      const token = localStorage.getItem("token") || '';
      const response = await axiosClient.put(`/checklist/${task._id}`, 
        { completed: !task.completed },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setTasks(prev => prev.map(t => t._id === task._id ? response.data : t));
      toast.success(task.completed ? "Task set to pending" : "Task marked as completed!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update task");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.warning("Task title is required");
      return;
    }

    try {
      setAdding(true);
      const token = localStorage.getItem("token") || '';
      const response = await axiosClient.post('/checklist', 
        {
          title: newTitle,
          category: newCategory,
          dueDate: newDueDate || undefined
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setTasks(prev => [...prev, response.data]);
      toast.success("Task added to your checklist!");
      setNewTitle('');
      setNewDueDate('');
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add task");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm("Are you sure you want to delete this planning task?")) return;

    try {
      const token = localStorage.getItem("token") || '';
      await axiosClient.delete(`/checklist/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success("Task deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete task");
    }
  };

  // Math
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'COMPLETED') return task.completed;
    if (filter === 'PENDING') return !task.completed;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadCrums text="Wedding Checklist" />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <CgSpinner className="animate-spin text-6xl text-logo mb-4" />
          <p className="text-zinc-600 font-medium">Loading checklist milestones...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main Checklist View */}
          <div className="lg:col-span-2">
            {/* Progress Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-md">
              <h2 className="text-xl font-psmbold mb-2">Planning Progress</h2>
              <p className="text-sm opacity-90 mb-4">
                {completedTasks} of {totalTasks} milestones completed ({percentComplete}%)
              </p>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-white h-full transition-all duration-500" 
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between bg-white border border-zinc-150 p-2 rounded-xl mb-6 shadow-sm">
              <div className="flex gap-x-2 w-full sm:w-auto">
                {['ALL', 'PENDING', 'COMPLETED'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                      filter === f
                        ? 'bg-logo text-white'
                        : 'text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <span className="hidden sm:inline text-xs text-zinc-500 font-medium px-2">
                Showing {filteredTasks.length} tasks
              </span>
            </div>

            {/* Task list */}
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-150 p-12 text-center shadow-sm">
                <p className="text-zinc-500 font-medium">No tasks found in this section.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`bg-white rounded-xl border p-4 flex items-center justify-between shadow-sm transition-all duration-300 ${
                      task.completed ? 'border-zinc-200 opacity-75' : 'border-zinc-150 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-x-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggle(task)}
                        className={`text-2xl transition-colors shrink-0 ${
                          task.completed ? 'text-green-500 hover:text-green-600' : 'text-zinc-300 hover:text-logo'
                        }`}
                      >
                        {task.completed ? <IoCheckmarkCircle /> : <IoCheckmarkCircleOutline />}
                      </button>
                      <div className="min-w-0">
                        <p 
                          className={`font-medium text-zinc-900 truncate ${
                            task.completed ? 'line-through text-zinc-400' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-x-2 mt-1 flex-wrap gap-y-1">
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-600 rounded border border-indigo-100">
                            {task.category}
                          </span>
                          {task.dueDate && (
                            <span className="text-[11px] text-zinc-400 flex items-center gap-x-1">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    >
                      <IoTrashOutline className="text-lg" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Custom Task Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-psmbold text-zinc-900 mb-4 flex items-center gap-x-2">
                <IoAddCircleOutline className="text-2xl text-logo" />
                Add Planning Task
              </h3>
              
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label htmlFor="task-title" className="block text-xs font-semibold text-zinc-600 uppercase mb-1">
                    Task Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Find wedding photographer"
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 text-sm transition-colors bg-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="task-category" className="block text-xs font-semibold text-zinc-600 uppercase mb-1">
                    Category
                  </label>
                  <select
                    id="task-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 text-sm bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Attire">Attire</option>
                    <option value="Music">Music</option>
                    <option value="Flowers & Decor">Flowers & Decor</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="task-due" className="block text-xs font-semibold text-zinc-600 uppercase mb-1">
                    Due Date
                  </label>
                  <input
                    id="task-due"
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 text-sm transition-colors bg-transparent"
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
                    <span>Add Task</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistPage;
