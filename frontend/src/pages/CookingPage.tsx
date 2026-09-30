import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Refrigerator, 
  ShoppingBag, 
  CalendarDays, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  Clock, 
  User, 
  ChefHat, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Tag, 
  Package, 
  X,
  CheckCircle2,
  ListPlus,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { api } from '../api/client';
import { 
  FridgeItem, 
  ShoppingItem, 
  MealPlan, 
  ItemCategory, 
  StorageLocation, 
  ItemFreshness, 
  ShoppingUrgency, 
  DayOfWeek, 
  MealType, 
  MealChef, 
  MealStatus 
} from '../types';

export const CookingPage: React.FC = () => {
  // Main Tab State: 'fridge' | 'shopping' | 'meals'
  const [activeTab, setActiveTab] = useState<'fridge' | 'shopping' | 'meals'>('meals');

  // Data states
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters for Fridge
  const [fridgeLocationFilter, setFridgeLocationFilter] = useState<string>('all');
  const [fridgeCategoryFilter, setFridgeCategoryFilter] = useState<string>('all');
  const [fridgeSearch, setFridgeSearch] = useState<string>('');

  // Modals
  const [isFridgeModalOpen, setIsFridgeModalOpen] = useState(false);
  const [editingFridgeItem, setEditingFridgeItem] = useState<FridgeItem | null>(null);

  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
  const [editingShoppingItem, setEditingShoppingItem] = useState<ShoppingItem | null>(null);

  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null);
  const [defaultDay, setDefaultDay] = useState<DayOfWeek>('monday');

  // Quick Add for Shopping
  const [quickShoppingName, setQuickShoppingName] = useState('');
  const [quickShoppingQuantity, setQuickShoppingQuantity] = useState('');
  const [quickShoppingCategory, setQuickShoppingCategory] = useState<ItemCategory>('produce');

  // Load all data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [fData, sData, mData] = await Promise.all([
        api.getFridgeItems(),
        api.getShoppingItems(),
        api.getMealPlans()
      ]);
      setFridgeItems(fData);
      setShoppingItems(sData);
      setMealPlans(mData);
    } catch (err) {
      console.error('Failed to load cooking data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers: Fridge ---
  const handleSaveFridgeItem = async (data: Partial<FridgeItem>) => {
    try {
      if (editingFridgeItem) {
        await api.updateFridgeItem(editingFridgeItem.id, data);
      } else {
        await api.createFridgeItem(data);
      }
      setIsFridgeModalOpen(false);
      setEditingFridgeItem(null);
      const updated = await api.getFridgeItems();
      setFridgeItems(updated);
    } catch (err) {
      alert('Error saving fridge item: ' + err);
    }
  };

  const handleDeleteFridgeItem = async (id: number) => {
    if (!confirm('Remove this item from inventory?')) return;
    try {
      await api.deleteFridgeItem(id);
      setFridgeItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert('Error removing item: ' + err);
    }
  };

  const handleAddFridgeItemToShopping = async (item: FridgeItem) => {
    try {
      await api.createShoppingItem({
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        urgency: 'normal',
        notes: `Restock for ${item.storage_location}`
      });
      const updatedShopping = await api.getShoppingItems();
      setShoppingItems(updatedShopping);
      alert(`Added "${item.name}" to shopping list!`);
    } catch (err) {
      alert('Error adding to shopping list: ' + err);
    }
  };

  // --- Handlers: Shopping ---
  const handleQuickAddShopping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickShoppingName.trim()) return;
    try {
      await api.createShoppingItem({
        name: quickShoppingName.trim(),
        quantity: quickShoppingQuantity.trim() || undefined,
        category: quickShoppingCategory,
        urgency: 'normal'
      });
      setQuickShoppingName('');
      setQuickShoppingQuantity('');
      const updated = await api.getShoppingItems();
      setShoppingItems(updated);
    } catch (err) {
      alert('Error adding item: ' + err);
    }
  };

  const handleToggleBought = async (item: ShoppingItem) => {
    try {
      await api.updateShoppingItem(item.id, { is_bought: !item.is_bought });
      setShoppingItems(prev => prev.map(i => i.id === item.id ? { ...i, is_bought: !item.is_bought } : i));
    } catch (err) {
      alert('Error updating item: ' + err);
    }
  };

  const handleDeleteShoppingItem = async (id: number) => {
    try {
      await api.deleteShoppingItem(id);
      setShoppingItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert('Error deleting item: ' + err);
    }
  };

  const handleClearPurchased = async () => {
    try {
      await api.clearPurchasedShoppingItems();
      setShoppingItems(prev => prev.filter(i => !i.is_bought));
    } catch (err) {
      alert('Error clearing purchased items: ' + err);
    }
  };

  const handleMoveToFridge = async (item: ShoppingItem) => {
    try {
      await api.moveShoppingItemToFridge(item.id);
      const [updatedFridge, updatedShopping] = await Promise.all([
        api.getFridgeItems(),
        api.getShoppingItems()
      ]);
      setFridgeItems(updatedFridge);
      setShoppingItems(updatedShopping);
    } catch (err) {
      alert('Error moving item to fridge: ' + err);
    }
  };

  // --- Handlers: Meal Plans ---
  const handleSaveMealPlan = async (data: Partial<MealPlan>) => {
    try {
      if (editingMeal) {
        await api.updateMealPlan(editingMeal.id, data);
      } else {
        await api.createMealPlan(data);
      }
      setIsMealModalOpen(false);
      setEditingMeal(null);
      const updated = await api.getMealPlans();
      setMealPlans(updated);
    } catch (err) {
      alert('Error saving meal proposal: ' + err);
    }
  };

  const handleDeleteMealPlan = async (id: number) => {
    if (!confirm('Remove this planned meal?')) return;
    try {
      await api.deleteMealPlan(id);
      setMealPlans(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert('Error deleting meal: ' + err);
    }
  };

  const handleUpdateMealStatus = async (id: number, newStatus: MealStatus) => {
    try {
      await api.updateMealPlan(id, { status: newStatus });
      setMealPlans(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } catch (err) {
      alert('Error updating meal status: ' + err);
    }
  };

  const handleAddIngredientsToShopping = async (meal: MealPlan) => {
    try {
      const added = await api.addMealIngredientsToShoppingList(meal.id);
      if (added.length > 0) {
        const updatedShopping = await api.getShoppingItems();
        setShoppingItems(updatedShopping);
        alert(`Added ${added.length} ingredient(s) from "${meal.recipe_title}" to your shopping list!`);
      } else {
        alert('No ingredients listed for this meal.');
      }
    } catch (err) {
      alert('Error adding ingredients to shopping list: ' + err);
    }
  };

  // Filtered fridge items
  const filteredFridgeItems = fridgeItems.filter(item => {
    if (fridgeLocationFilter !== 'all' && item.storage_location !== fridgeLocationFilter) return false;
    if (fridgeCategoryFilter !== 'all' && item.category !== fridgeCategoryFilter) return false;
    if (fridgeSearch.trim()) {
      const q = fridgeSearch.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchNotes) return false;
    }
    return true;
  });

  // Grouped meals by day of week
  const daysOfWeekOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels: Record<DayOfWeek, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const dayIndexToDay: Record<number, DayOfWeek> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };
  const todayDay: DayOfWeek = dayIndexToDay[new Date().getDay()];

  // Helper badges
  const getFreshnessBadge = (fresh: ItemFreshness) => {
    switch (fresh) {
      case 'fresh':
        return { label: 'Fresh', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'use_soon':
        return { label: 'Use Soon', bg: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'expired':
        return { label: 'Expired', bg: 'bg-rose-50 text-rose-800 border-rose-300' };
      default:
        return { label: fresh, bg: 'bg-stone-50 text-stone-700 border-stone-200' };
    }
  };

  const getChefBadge = (chef: MealChef) => {
    switch (chef) {
      case 'maciej':
        return { label: 'Chef Maciej', bg: 'bg-stone-100 text-stone-800 border-stone-300' };
      case 'selina':
        return { label: 'Chef Selina', bg: 'bg-amber-50 text-amber-900 border-amber-300' };
      case 'both':
        return { label: 'Cooking Together', bg: 'bg-[#fcf7ec] text-[#9c7526] border-[#e2c785]' };
      case 'dining_out':
        return { label: 'Dining Out', bg: 'bg-purple-50 text-purple-800 border-purple-300' };
      default:
        return { label: chef, bg: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
  };

  const getMealStatusBadge = (status: MealStatus) => {
    switch (status) {
      case 'proposed':
        return { label: 'Proposed', bg: 'bg-stone-100 text-stone-600 border-stone-300' };
      case 'accepted':
        return { label: 'Accepted', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'cooked':
        return { label: 'Cooked', bg: 'bg-blue-50 text-blue-800 border-blue-300' };
      default:
        return { label: status, bg: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
  };

  const unboughtCount = shoppingItems.filter(i => !i.is_bought).length;
  const boughtCount = shoppingItems.filter(i => i.is_bought).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Header Card */}
      <div className="arch-surface p-4 sm:p-6 md:p-8 border border-[#e5e0d4] shadow-xs relative">
        <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#b58c38]" />
        <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#b58c38]" />
        <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#b58c38]" />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#b58c38]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-[#e5e0d4]">
          <div>
            <div className="flex items-center gap-2 text-stone-500 font-mono-tech text-xs uppercase tracking-wider mb-1">
              <ChefHat className="w-4 h-4 text-[#9c7526]" />
              <span className="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-[#9c7526] font-semibold">
                [ 04 // CULINARY HORIZON ]
              </span>
            </div>
            <h1 className="font-serif-editorial text-2xl sm:text-3xl md:text-4xl text-[#181c24] font-medium tracking-tight">
              Cooking & Menu Planning
            </h1>
          </div>

          {/* Action Button depending on Active Tab */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {activeTab === 'fridge' && (
              <button
                onClick={() => {
                  setEditingFridgeItem(null);
                  setIsFridgeModalOpen(true);
                }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider font-semibold rounded flex items-center gap-2 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Fridge Item</span>
              </button>
            )}

            {activeTab === 'shopping' && (
              <button
                onClick={() => {
                  setEditingShoppingItem(null);
                  setIsShoppingModalOpen(true);
                }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider font-semibold rounded flex items-center gap-2 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Shopping List</span>
              </button>
            )}

            {activeTab === 'meals' && (
              <button
                onClick={() => {
                  setEditingMeal(null);
                  setDefaultDay('monday');
                  setIsMealModalOpen(true);
                }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider font-semibold rounded flex items-center gap-2 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Propose Meal</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-3 sm:pt-4 font-mono-tech text-[11px] sm:text-xs uppercase tracking-wider overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('meals')}
            className={`px-3 sm:px-3.5 py-1.5 border transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'meals'
                ? 'bg-[#181c24] text-white border-[#181c24] font-semibold shadow-xs'
                : 'bg-white text-stone-600 border-[#e5e0d4] hover:border-stone-400'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Weekly Menu ({mealPlans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fridge')}
            className={`px-3 sm:px-3.5 py-1.5 border transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'fridge'
                ? 'bg-[#181c24] text-white border-[#181c24] font-semibold shadow-xs'
                : 'bg-white text-stone-600 border-[#e5e0d4] hover:border-stone-400'
            }`}
          >
            <Refrigerator className="w-4 h-4" />
            <span>Fridge & Pantry ({fridgeItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shopping')}
            className={`px-3 sm:px-3.5 py-1.5 border transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'shopping'
                ? 'bg-[#181c24] text-white border-[#181c24] font-semibold shadow-xs'
                : 'bg-white text-stone-600 border-[#e5e0d4] hover:border-stone-400'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shopping List ({unboughtCount})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: WEEKLY MEAL PLANNER                               */}
      {/* ======================================================== */}
      {activeTab === 'meals' && (
        <div className="space-y-6">
          <div className="bg-[#fcfbf7] border border-[#e5e0d4] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-tech">
            <div>
              <span className="uppercase text-stone-400 block text-[10px]">Weekly Cooking Horizon</span>
              <span className="text-stone-800 font-semibold text-sm">
                Collaborative Dinner & Lunch Menu
              </span>
            </div>
            <div className="text-stone-500 flex items-center gap-3">
              <span>{mealPlans.filter(m => m.status === 'accepted').length} Accepted</span>
              <span>•</span>
              <span>{mealPlans.filter(m => m.status === 'proposed').length} Proposed</span>
              <span>•</span>
              <span>{mealPlans.filter(m => m.status === 'cooked').length} Cooked</span>
            </div>
          </div>

          <div className="space-y-4">
            {daysOfWeekOrder.map((day) => {
              const dayMeals = mealPlans.filter(m => m.day_of_week === day);
              const isWeekend = day === 'saturday' || day === 'sunday';
              const isToday = day === todayDay;

              return (
                <div
                  key={day}
                  className={`border rounded-xl transition-all shadow-xs overflow-hidden ${
                    isToday
                      ? 'bg-[#fdfbf6] border-[#cbb377] ring-1 ring-[#cbb377]/40'
                      : isWeekend
                      ? 'bg-[#fcfaf4] border-[#d8cca8]'
                      : 'bg-[#fcfbf7] border-[#e5e0d4]'
                  }`}
                >
                  {/* Day Header */}
                  <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[#e5e0d4] flex items-center justify-between gap-3 bg-white/70">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-mono-tech ${
                          isToday
                            ? 'bg-[#9c7526] text-white shadow-xs font-bold'
                            : isWeekend
                            ? 'bg-amber-100/70 text-amber-900 border border-amber-200 font-bold'
                            : 'bg-stone-100 text-stone-700 border border-stone-200 font-medium'
                        }`}
                      >
                        <span className="text-xs uppercase tracking-wider">{day.slice(0, 3)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif-editorial text-lg sm:text-xl text-stone-900 font-medium">
                            {dayLabels[day]}
                          </h3>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-full bg-[#9c7526]/15 text-[#9c7526] border border-[#9c7526]/30 text-[10px] font-mono-tech font-bold uppercase tracking-wider">
                              Today
                            </span>
                          )}
                          <span className="text-[10px] font-mono-tech uppercase text-stone-400">
                            {isWeekend ? 'Weekend' : 'Weekday'}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono-tech text-stone-500">
                          {dayMeals.length === 0
                            ? 'No meals planned'
                            : `${dayMeals.length} ${dayMeals.length === 1 ? 'meal' : 'meals'} scheduled`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingMeal(null);
                        setDefaultDay(day);
                        setIsMealModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#181c24] text-stone-700 hover:text-[#fcd34d] text-xs font-mono-tech uppercase font-medium flex items-center gap-1.5 transition-colors border border-stone-200 hover:border-transparent cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add Meal</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>

                  {/* Meals for this day */}
                  <div className="p-4 sm:p-5">
                    {dayMeals.length === 0 ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-dashed border-[#e5e0d4] bg-stone-50/40 text-stone-400">
                        <div className="flex items-center gap-2.5 text-xs font-mono-tech">
                          <UtensilsCrossed className="w-4 h-4 opacity-40 shrink-0" />
                          <span>No meals planned for {dayLabels[day]} yet.</span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingMeal(null);
                            setDefaultDay(day);
                            setIsMealModalOpen(true);
                          }}
                          className="text-xs font-mono-tech uppercase text-[#9c7526] hover:text-[#735213] font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Propose Dish</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dayMeals.map((meal) => {
                          const chefBadge = getChefBadge(meal.chef);
                          const statusBadge = getMealStatusBadge(meal.status);

                          return (
                            <div
                              key={meal.id}
                              className={`p-4 rounded-xl border font-mono-tech flex flex-col justify-between transition-all ${
                                meal.status === 'cooked'
                                  ? 'bg-stone-100/60 border-stone-200 opacity-70'
                                  : 'bg-white border-[#e5e0d4] hover:border-stone-400 shadow-2xs'
                              }`}
                            >
                              <div className="space-y-3">
                                {/* Header: Type + Status */}
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 px-2 py-0.5 rounded bg-stone-100">
                                    {meal.meal_type}
                                  </span>
                                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border font-semibold ${statusBadge.bg}`}>
                                    {statusBadge.label}
                                  </span>
                                </div>

                                {/* Dish Title */}
                                <div>
                                  <h4 className="font-serif-editorial text-lg text-stone-900 font-medium leading-snug">
                                    {meal.recipe_title}
                                  </h4>
                                </div>

                                {/* Chef & Prep Time */}
                                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                  <span className={`px-2 py-0.5 text-[10px] rounded border font-medium ${chefBadge.bg}`}>
                                    {chefBadge.label}
                                  </span>
                                  {meal.prep_time_minutes && (
                                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                                      {meal.prep_time_minutes} min
                                    </span>
                                  )}
                                </div>

                                {/* Notes */}
                                {meal.notes && (
                                  <p className="text-xs text-stone-600 font-sans italic bg-stone-50/70 p-2.5 rounded border border-stone-100">
                                    "{meal.notes}"
                                  </p>
                                )}

                                {/* Ingredients */}
                                {meal.ingredients && (
                                  <div className="pt-2 border-t border-stone-100 space-y-1.5">
                                    <span className="text-[10px] uppercase text-stone-400 font-semibold block">
                                      Ingredients
                                    </span>
                                    <p className="text-xs text-stone-700 font-mono-tech leading-relaxed">
                                      {meal.ingredients}
                                    </p>
                                    <button
                                      onClick={() => handleAddIngredientsToShopping(meal)}
                                      className="mt-1 text-xs text-[#9c7526] hover:text-[#735213] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <ListPlus className="w-3.5 h-3.5" />
                                      <span>Add ingredients to shopping list</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Card Footer Actions */}
                              <div className="pt-3 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                                <div className="flex items-center gap-2">
                                  {meal.status === 'proposed' && (
                                    <button
                                      onClick={() => handleUpdateMealStatus(meal.id, 'accepted')}
                                      className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 font-semibold text-[11px] uppercase transition-colors cursor-pointer"
                                    >
                                      Accept Recipe
                                    </button>
                                  )}
                                  {meal.status === 'accepted' && (
                                    <button
                                      onClick={() => handleUpdateMealStatus(meal.id, 'cooked')}
                                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 font-semibold text-[11px] uppercase transition-colors cursor-pointer"
                                    >
                                      Mark Cooked
                                    </button>
                                  )}
                                  {meal.status === 'cooked' && (
                                    <button
                                      onClick={() => handleUpdateMealStatus(meal.id, 'accepted')}
                                      className="text-stone-400 hover:text-stone-600 font-semibold text-[10px] uppercase transition-colors cursor-pointer"
                                      title="Reset to accepted"
                                    >
                                      Re-plan
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingMeal(meal);
                                      setDefaultDay(meal.day_of_week);
                                      setIsMealModalOpen(true);
                                    }}
                                    className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                                    title="Edit meal"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMealPlan(meal.id)}
                                    className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Delete meal"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FRIDGE & PANTRY INVENTORY                         */}
      {/* ======================================================== */}
      {activeTab === 'fridge' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-[#fcfbf7] border border-[#e5e0d4] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono-tech">
            {/* Storage Location Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-stone-400 uppercase text-[10px] mr-1">Location:</span>
              {[
                { id: 'all', label: 'All Items' },
                { id: 'fridge', label: 'Fridge' },
                { id: 'freezer', label: 'Freezer' },
                { id: 'pantry', label: 'Pantry' }
              ].map(loc => (
                <button
                  key={loc.id}
                  onClick={() => setFridgeLocationFilter(loc.id)}
                  className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                    fridgeLocationFilter === loc.id
                      ? 'bg-[#181c24] text-[#fcd34d] font-semibold'
                      : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={fridgeSearch}
                onChange={(e) => setFridgeSearch(e.target.value)}
                placeholder="Search food inventory..."
                className="w-full bg-white border border-[#e5e0d4] pl-8 pr-3 py-1.5 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono-tech">
            <span className="text-stone-400 uppercase text-[10px] mr-1">Category:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'produce', label: 'Produce' },
              { id: 'dairy', label: 'Dairy' },
              { id: 'bakery', label: 'Bakery' },
              { id: 'drinks', label: 'Drinks' },
              { id: 'pantry', label: 'Pantry / Spices' },
              { id: 'other', label: 'Other' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFridgeCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-full border transition-all whitespace-nowrap text-[11px] ${
                  fridgeCategoryFilter === cat.id
                    ? 'bg-[#9c7526] text-white border-[#9c7526] font-semibold'
                    : 'bg-white border-[#e5e0d4] text-stone-600 hover:border-stone-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid of Fridge Items */}
          {filteredFridgeItems.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-[#e5e0d4] rounded-xl p-6 bg-[#fcfbf7]">
              <Refrigerator className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-serif-editorial text-stone-800">No inventory items found</p>
              <p className="text-xs text-stone-500 font-mono-tech mt-1">
                {fridgeSearch || fridgeCategoryFilter !== 'all' || fridgeLocationFilter !== 'all'
                  ? 'Try clearing the search or category filters.'
                  : 'Start adding what you currently have in your fridge, freezer, or pantry.'}
              </p>
              <button
                onClick={() => {
                  setEditingFridgeItem(null);
                  setIsFridgeModalOpen(true);
                }}
                className="mt-4 px-4 py-2 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider rounded inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Item</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFridgeItems.map((item) => {
                const freshness = getFreshnessBadge(item.status);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-[#e5e0d4] bg-[#fcfbf7] hover:border-stone-400 transition-all flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono-tech uppercase tracking-wider text-stone-400 block">
                          {item.storage_location} • {item.category}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-mono-tech uppercase tracking-wider rounded border font-semibold ${freshness.bg}`}>
                          {freshness.label}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-2 mt-1">
                        <h4 className="font-serif-editorial text-lg text-stone-900 font-medium">
                          {item.name}
                        </h4>
                        {item.quantity && (
                          <span className="text-xs font-mono-tech font-semibold text-[#9c7526] whitespace-nowrap">
                            {item.quantity}
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-stone-600 font-sans mt-2 italic line-clamp-2">
                          "{item.notes}"
                        </p>
                      )}

                      {item.expiry_date && (
                        <p className="text-[10px] font-mono-tech text-stone-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>Exp: {new Date(item.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#e5e0d4] flex items-center justify-between text-xs font-mono-tech">
                      <button
                        onClick={() => handleAddFridgeItemToShopping(item)}
                        className="text-[10px] text-[#9c7526] hover:text-[#735213] font-semibold flex items-center gap-1"
                        title="Add to shopping list when low"
                      >
                        <ListPlus className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingFridgeItem(item);
                            setIsFridgeModalOpen(true);
                          }}
                          className="text-stone-400 hover:text-stone-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFridgeItem(item.id)}
                          className="text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SHOPPING LIST                                     */}
      {/* ======================================================== */}
      {activeTab === 'shopping' && (
        <div className="space-y-6">
          {/* Quick Add Bar */}
          <form
            onSubmit={handleQuickAddShopping}
            className="p-3 bg-[#fcfbf7] border border-[#e5e0d4] rounded-xl flex flex-col md:flex-row items-center gap-2 font-mono-tech text-xs shadow-2xs"
          >
            <input
              value={quickShoppingName}
              onChange={(e) => setQuickShoppingName(e.target.value)}
              placeholder="What do we need to buy? (e.g. Parmigiano, Basil, Wine)..."
              required
              className="flex-1 bg-white border border-[#e5e0d4] px-3 py-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526] w-full"
            />
            <input
              value={quickShoppingQuantity}
              onChange={(e) => setQuickShoppingQuantity(e.target.value)}
              placeholder="Qty (e.g. 500g, 2x)"
              className="w-full md:w-36 bg-white border border-[#e5e0d4] px-3 py-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
            />
            <select
              value={quickShoppingCategory}
              onChange={(e) => setQuickShoppingCategory(e.target.value as ItemCategory)}
              className="w-full md:w-36 bg-white border border-[#e5e0d4] px-3 py-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
            >
              <option value="produce">Produce</option>
              <option value="dairy">Dairy</option>
              <option value="meat_fish">Meat & Fish</option>
              <option value="bakery">Bakery</option>
              <option value="drinks">Drinks</option>
              <option value="pantry">Pantry</option>
              <option value="household">Household</option>
              <option value="other">Other</option>
            </select>
            <button
              type="submit"
              className="w-full md:w-auto px-4 py-2 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] uppercase font-semibold rounded flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </form>

          {/* List Status Summary & Clear Purchased */}
          <div className="flex items-center justify-between text-xs font-mono-tech border-b border-[#e5e0d4] pb-3">
            <span className="text-stone-500">
              <strong className="text-stone-800">{unboughtCount}</strong> items to buy •{' '}
              <strong className="text-stone-800">{boughtCount}</strong> in basket
            </span>

            {boughtCount > 0 && (
              <button
                onClick={handleClearPurchased}
                className="text-stone-400 hover:text-stone-700 underline transition-colors"
              >
                Clear checked items
              </button>
            )}
          </div>

          {/* Shopping items list */}
          {shoppingItems.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-[#e5e0d4] rounded-xl p-6 bg-[#fcfbf7]">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-serif-editorial text-stone-800">Your shopping list is empty</p>
              <p className="text-xs text-stone-500 font-mono-tech mt-1">
                Add groceries above, or click "+ Add to Shopping" on recipes and low-stock fridge items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shoppingItems.map((item) => {
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs font-mono-tech ${
                      item.is_bought
                        ? 'bg-stone-100/60 border-stone-200 opacity-60'
                        : 'bg-[#fcfbf7] border-[#e5e0d4] shadow-2xs hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleBought(item)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          item.is_bought
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-stone-300 hover:border-[#9c7526]'
                        }`}
                      >
                        {item.is_bought && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-serif-editorial text-base text-stone-900 truncate ${item.is_bought ? 'line-through text-stone-400' : 'font-medium'}`}>
                            {item.name}
                          </span>
                          {item.quantity && (
                            <span className="px-1.5 py-0.5 bg-stone-200/60 text-stone-700 rounded text-[10px] font-mono-tech">
                              {item.quantity}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                          <span className="uppercase">{item.category}</span>
                          {item.urgency === 'high' && (
                            <span className="text-rose-600 font-semibold uppercase">Urgent</span>
                          )}
                          {item.notes && <span>• {item.notes}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Move to Fridge if bought + Delete */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.is_bought && (
                        <button
                          onClick={() => handleMoveToFridge(item)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-mono-tech uppercase font-semibold flex items-center gap-1 transition-colors"
                          title="Move bought item directly into your fridge inventory"
                        >
                          <Refrigerator className="w-3 h-3" />
                          <span>To Fridge</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteShoppingItem(item.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: Add / Edit Fridge Item                          */}
      {/* ======================================================== */}
      {isFridgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#fcfbf7] border border-[#e5e0d4] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e5e0d4] pb-2">
              <h3 className="font-serif-editorial text-2xl text-stone-900">
                {editingFridgeItem ? 'Edit Inventory Item' : 'Add Item to Kitchen'}
              </h3>
              <button onClick={() => setIsFridgeModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const exp = formData.get('expiry_date') as string;

                handleSaveFridgeItem({
                  name: (formData.get('name') as string).trim(),
                  quantity: (formData.get('quantity') as string).trim() || undefined,
                  category: formData.get('category') as ItemCategory,
                  storage_location: formData.get('storage_location') as StorageLocation,
                  expiry_date: exp ? new Date(exp).toISOString() : undefined,
                  status: formData.get('status') as ItemFreshness,
                  notes: (formData.get('notes') as string).trim() || undefined,
                });
              }}
              className="space-y-3 font-mono-tech text-xs"
            >
              <div>
                <label className="block uppercase text-stone-600 font-semibold mb-1">Item Name *</label>
                <input
                  name="name"
                  required
                  defaultValue={editingFridgeItem?.name || ''}
                  placeholder="e.g. Parmigiano Reggiano, Fresh Basil, Greek Yogurt"
                  className="w-full bg-white border border-[#e5e0d4] p-2.5 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Quantity / Unit</label>
                  <input
                    name="quantity"
                    defaultValue={editingFridgeItem?.quantity || ''}
                    placeholder="e.g. 250g, 4 pcs, 1L"
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Location</label>
                  <select
                    name="storage_location"
                    defaultValue={editingFridgeItem?.storage_location || 'fridge'}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  >
                    <option value="fridge">Fridge</option>
                    <option value="freezer">Freezer</option>
                    <option value="pantry">Pantry / Shelf</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingFridgeItem?.category || 'produce'}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  >
                    <option value="produce">Produce (Fruits & Veggies)</option>
                    <option value="dairy">Dairy & Cheese</option>
                    <option value="bakery">Bakery & Bread</option>
                    <option value="drinks">Drinks & Wine</option>
                    <option value="pantry">Pantry & Spices</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Freshness Status</label>
                  <select
                    name="status"
                    defaultValue={editingFridgeItem?.status || 'fresh'}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  >
                    <option value="fresh">Fresh</option>
                    <option value="use_soon">Use Soon</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Best Before Date (Optional)</label>
                <input
                  name="expiry_date"
                  type="date"
                  defaultValue={editingFridgeItem?.expiry_date ? editingFridgeItem.expiry_date.split('T')[0] : ''}
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                />
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Notes (Optional)</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingFridgeItem?.notes || ''}
                  placeholder="e.g. Aged 24 months, bought for pasta night..."
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526] font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e0d4]">
                <button
                  type="button"
                  onClick={() => setIsFridgeModalOpen(false)}
                  className="px-3 py-1.5 text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] uppercase font-semibold rounded transition-colors"
                >
                  {editingFridgeItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: Propose / Edit Meal                             */}
      {/* ======================================================== */}
      {isMealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#fcfbf7] border border-[#e5e0d4] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e5e0d4] pb-2">
              <h3 className="font-serif-editorial text-2xl text-stone-900">
                {editingMeal ? 'Edit Planned Meal' : 'Propose a Meal'}
              </h3>
              <button onClick={() => setIsMealModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);

                handleSaveMealPlan({
                  recipe_title: (formData.get('recipe_title') as string).trim(),
                  day_of_week: formData.get('day_of_week') as DayOfWeek,
                  meal_type: formData.get('meal_type') as MealType,
                  chef: formData.get('chef') as MealChef,
                  prep_time_minutes: parseInt(formData.get('prep_time_minutes') as string) || undefined,
                  status: formData.get('status') as MealStatus,
                  ingredients: (formData.get('ingredients') as string).trim() || undefined,
                  notes: (formData.get('notes') as string).trim() || undefined,
                });
              }}
              className="space-y-3 font-mono-tech text-xs"
            >
              <div>
                <label className="block uppercase text-stone-600 font-semibold mb-1">Recipe / Dish Name *</label>
                <input
                  name="recipe_title"
                  required
                  defaultValue={editingMeal?.recipe_title || ''}
                  placeholder="e.g. Creamy Truffle Tagliatelle, Neapolitan Pizza"
                  className="w-full bg-white border border-[#e5e0d4] p-2.5 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Day of Week *</label>
                  <select
                    name="day_of_week"
                    defaultValue={editingMeal?.day_of_week || defaultDay}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase text-stone-500 mb-1">Meal Type</label>
                  <select
                    name="meal_type"
                    defaultValue={editingMeal?.meal_type || 'dinner'}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  >
                    <option value="dinner">Dinner</option>
                    <option value="lunch">Lunch</option>
                    <option value="breakfast">Breakfast / Brunch</option>
                    <option value="dessert">Dessert</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Who Cooks?</label>
                  <select
                    name="chef"
                    defaultValue={editingMeal?.chef || 'both'}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  >
                    <option value="both">Cooking Together</option>
                    <option value="maciej">Maciej</option>
                    <option value="selina">Selina</option>
                    <option value="dining_out">Dining Out</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase text-stone-500 mb-1">Prep Time (minutes)</label>
                  <input
                    name="prep_time_minutes"
                    type="number"
                    defaultValue={editingMeal?.prep_time_minutes || ''}
                    placeholder="35"
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={editingMeal?.status || 'proposed'}
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                >
                  <option value="proposed">Proposed (Idea to discuss)</option>
                  <option value="accepted">Accepted (Agreed for the week!)</option>
                  <option value="cooked">Cooked (Enjoyed!)</option>
                </select>
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">
                  Ingredients <span className="text-stone-400 font-normal lowercase">(comma or line separated — can be auto-added to shopping)</span>
                </label>
                <textarea
                  name="ingredients"
                  rows={3}
                  defaultValue={editingMeal?.ingredients || ''}
                  placeholder="e.g. Pasta, Garlic, Cherry tomatoes, Burrata, Basil..."
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526] font-mono-tech text-xs"
                />
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Recipe Notes / Link</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingMeal?.notes || ''}
                  placeholder="Cooking tips, wine pairing, or link..."
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526] font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e0d4]">
                <button
                  type="button"
                  onClick={() => setIsMealModalOpen(false)}
                  className="px-3 py-1.5 text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] uppercase font-semibold rounded transition-colors"
                >
                  {editingMeal ? 'Save Changes' : 'Propose Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: Detailed Add / Edit Shopping Item               */}
      {/* ======================================================== */}
      {isShoppingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#fcfbf7] border border-[#e5e0d4] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e5e0d4] pb-2">
              <h3 className="font-serif-editorial text-2xl text-stone-900">
                {editingShoppingItem ? 'Edit Shopping Item' : 'Add to Shopping List'}
              </h3>
              <button onClick={() => setIsShoppingModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);

                if (editingShoppingItem) {
                  api.updateShoppingItem(editingShoppingItem.id, {
                    name: (formData.get('name') as string).trim(),
                    quantity: (formData.get('quantity') as string).trim() || undefined,
                    category: formData.get('category') as ItemCategory,
                    urgency: formData.get('urgency') as ShoppingUrgency,
                    notes: (formData.get('notes') as string).trim() || undefined,
                  }).then(() => {
                    setIsShoppingModalOpen(false);
                    setEditingShoppingItem(null);
                    api.getShoppingItems().then(setShoppingItems);
                  });
                } else {
                  api.createShoppingItem({
                    name: (formData.get('name') as string).trim(),
                    quantity: (formData.get('quantity') as string).trim() || undefined,
                    category: formData.get('category') as ItemCategory,
                    urgency: formData.get('urgency') as ShoppingUrgency,
                    notes: (formData.get('notes') as string).trim() || undefined,
                  }).then(() => {
                    setIsShoppingModalOpen(false);
                    api.getShoppingItems().then(setShoppingItems);
                  });
                }
              }}
              className="space-y-3 font-mono-tech text-xs"
            >
              <div>
                <label className="block uppercase text-stone-600 font-semibold mb-1">Item Name *</label>
                <input
                  name="name"
                  required
                  defaultValue={editingShoppingItem?.name || ''}
                  placeholder="e.g. San Marzano Tomatoes, Olive Oil"
                  className="w-full bg-white border border-[#e5e0d4] p-2.5 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Quantity</label>
                  <input
                    name="quantity"
                    defaultValue={editingShoppingItem?.quantity || ''}
                    placeholder="e.g. 2 cans, 750ml"
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Urgency</label>
                  <select
                    name="urgency"
                    defaultValue={editingShoppingItem?.urgency || 'normal'}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High (Needed soon)</option>
                    <option value="low">Low (Whenever possible)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Category</label>
                <select
                  name="category"
                  defaultValue={editingShoppingItem?.category || 'produce'}
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                >
                  <option value="produce">Produce (Fruits & Veggies)</option>
                  <option value="dairy">Dairy & Cheese</option>
                  <option value="meat_fish">Meat & Seafood</option>
                  <option value="bakery">Bakery & Bread</option>
                  <option value="drinks">Drinks & Wine</option>
                  <option value="pantry">Pantry & Spices</option>
                  <option value="household">Household</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingShoppingItem?.notes || ''}
                  placeholder="Brand preference, specific shop..."
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526] font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e0d4]">
                <button
                  type="button"
                  onClick={() => setIsShoppingModalOpen(false)}
                  className="px-3 py-1.5 text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] uppercase font-semibold rounded transition-colors"
                >
                  {editingShoppingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
