import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  Plane, 
  Train, 
  Car, 
  Bus, 
  Ship, 
  HelpCircle,
  Hotel, 
  Home, 
  Building, 
  Palmtree, 
  Tent,
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  Check, 
  Utensils, 
  Camera, 
  Coffee, 
  Ticket, 
  Sparkles,
  Wallet,
  X,
  Tag
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Trip, 
  TripTransport, 
  TripLodging, 
  TripItineraryItem, 
  TripStatus, 
  TransportType, 
  LodgingType 
} from '../types';

export const TripsPage: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [activeTripTab, setActiveTripTab] = useState<'transport' | 'lodging' | 'itinerary' | 'budget'>('transport');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);
  const [editingTransport, setEditingTransport] = useState<TripTransport | null>(null);

  const [isLodgingModalOpen, setIsLodgingModalOpen] = useState(false);
  const [editingLodging, setEditingLodging] = useState<TripLodging | null>(null);

  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<TripItineraryItem | null>(null);
  const [defaultDayNumber, setDefaultDayNumber] = useState(1);

  // Fetch all trips
  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTrips();
      setTrips(data);
      if (selectedTripId && !data.some(t => t.id === selectedTripId)) {
        setSelectedTripId(null);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const currentTrip = trips.find(t => t.id === selectedTripId) || null;

  // Filtered trips
  const filteredTrips = trips.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  // Trip Status Helpers
  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'idea':
        return { label: 'Idea', bg: 'bg-stone-100 text-stone-700 border-stone-300' };
      case 'planning':
      case 'planned':
        return { label: 'Planned', bg: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'booked':
        return { label: 'Booked', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'completed':
        return { label: 'Completed', bg: 'bg-blue-50 text-blue-800 border-blue-300' };
      default:
        return { label: status, bg: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
  };

  const getTransportIcon = (type: TransportType) => {
    switch (type) {
      case 'flight': return <Plane className="w-4 h-4" />;
      case 'train': return <Train className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      case 'bus': return <Bus className="w-4 h-4" />;
      case 'ferry': return <Ship className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getLodgingIcon = (type: LodgingType) => {
    switch (type) {
      case 'hotel': return <Hotel className="w-4 h-4" />;
      case 'airbnb': return <Home className="w-4 h-4" />;
      case 'apartment': return <Building className="w-4 h-4" />;
      case 'resort': return <Palmtree className="w-4 h-4" />;
      case 'hostel': return <Building className="w-4 h-4" />;
      case 'other': return <Tent className="w-4 h-4" />;
      default: return <Hotel className="w-4 h-4" />;
    }
  };

  const getItineraryCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'food': return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
      case 'sightseeing': return <Camera className="w-3.5 h-3.5 text-blue-600" />;
      case 'relax': return <Coffee className="w-3.5 h-3.5 text-emerald-600" />;
      case 'culture': return <Ticket className="w-3.5 h-3.5 text-purple-600" />;
      case 'adventure': return <Sparkles className="w-3.5 h-3.5 text-rose-600" />;
      default: return <Tag className="w-3.5 h-3.5 text-stone-600" />;
    }
  };

  // Cost Calculations
  const calculateCosts = (trip: Trip) => {
    const selectedTransports = (trip.transports || []).filter(t => t.is_selected);
    const transportTotal = selectedTransports.reduce((sum, t) => sum + (t.cost || 0), 0);

    const selectedLodgings = (trip.lodgings || []).filter(l => l.is_selected);
    const lodgingTotal = selectedLodgings.reduce((sum, l) => sum + (l.cost || 0), 0);

    const activitiesTotal = (trip.itinerary_items || []).reduce((sum, i) => sum + (i.cost || 0), 0);

    const bookedTotal = transportTotal + lodgingTotal + activitiesTotal;
    const estimated = trip.estimated_budget || 0;
    const remaining = Math.max(0, estimated - bookedTotal);

    return {
      transportTotal,
      lodgingTotal,
      activitiesTotal,
      bookedTotal,
      estimated,
      remaining
    };
  };

  // Format Dates
  const formatDateRange = (start?: string, end?: string) => {
    if (!start && !end) return 'Dates to be decided';
    if (start && !end) return `From ${new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    if (!start && end) return `Until ${new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    
    const d1 = new Date(start!);
    const d2 = new Date(end!);
    const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    
    return `${d1.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${d2.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${diffDays} days)`;
  };

  const getDaysCountdown = (start?: string) => {
    if (!start) return null;
    const now = new Date();
    const tripDate = new Date(start);
    const diffTime = tripDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays === 0) return 'Today!';
    return 'Past trip';
  };

  // Handlers for Trip
  const handleSaveTrip = async (formData: any) => {
    try {
      if (editingTrip) {
        await api.updateTrip(editingTrip.id, formData);
        await fetchTrips();
      } else {
        const created = await api.createTrip(formData);
        await fetchTrips();
        if (created && created.id) {
          setSelectedTripId(created.id);
        }
      }
      setIsTripModalOpen(false);
      setEditingTrip(null);
    } catch (err) {
      alert('Error saving trip: ' + err);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!confirm('Are you sure you want to remove this trip proposal?')) return;
    try {
      await api.deleteTrip(tripId);
      if (selectedTripId === tripId) setSelectedTripId(null);
      await fetchTrips();
    } catch (err) {
      alert('Error removing trip: ' + err);
    }
  };

  const handleUpdateStatus = async (tripId: number, newStatus: TripStatus) => {
    try {
      await api.updateTrip(tripId, { status: newStatus });
      await fetchTrips();
    } catch (err) {
      alert('Error updating status: ' + err);
    }
  };

  // Handlers for Transport
  const handleToggleTransportSelected = async (transport: TripTransport) => {
    if (!currentTrip) return;
    try {
      await api.updateTransport(currentTrip.id, transport.id, {
        is_selected: !transport.is_selected
      });
      await fetchTrips();
    } catch (err) {
      alert('Error updating transport: ' + err);
    }
  };

  const handleDeleteTransport = async (transportId: number) => {
    if (!currentTrip || !confirm('Remove this transport option?')) return;
    try {
      await api.deleteTransport(currentTrip.id, transportId);
      await fetchTrips();
    } catch (err) {
      alert('Error removing transport: ' + err);
    }
  };

  const handleSaveTransport = async (formData: any) => {
    if (!currentTrip) return;
    try {
      if (editingTransport) {
        await api.updateTransport(currentTrip.id, editingTransport.id, formData);
      } else {
        await api.addTransport(currentTrip.id, formData);
      }
      setIsTransportModalOpen(false);
      setEditingTransport(null);
      await fetchTrips();
    } catch (err) {
      alert('Error saving transport option: ' + err);
    }
  };

  // Handlers for Lodging
  const handleToggleLodgingSelected = async (lodging: TripLodging) => {
    if (!currentTrip) return;
    try {
      await api.updateLodging(currentTrip.id, lodging.id, {
        is_selected: !lodging.is_selected
      });
      await fetchTrips();
    } catch (err) {
      alert('Error updating lodging: ' + err);
    }
  };

  const handleDeleteLodging = async (lodgingId: number) => {
    if (!currentTrip || !confirm('Remove this accommodation option?')) return;
    try {
      await api.deleteLodging(currentTrip.id, lodgingId);
      await fetchTrips();
    } catch (err) {
      alert('Error removing lodging: ' + err);
    }
  };

  const handleSaveLodging = async (formData: any) => {
    if (!currentTrip) return;
    try {
      if (editingLodging) {
        await api.updateLodging(currentTrip.id, editingLodging.id, formData);
      } else {
        await api.addLodging(currentTrip.id, formData);
      }
      setIsLodgingModalOpen(false);
      setEditingLodging(null);
      await fetchTrips();
    } catch (err) {
      alert('Error saving lodging: ' + err);
    }
  };

  // Handlers for Itinerary
  const handleToggleItineraryCompleted = async (item: TripItineraryItem) => {
    if (!currentTrip) return;
    try {
      await api.updateItineraryItem(currentTrip.id, item.id, {
        is_completed: !item.is_completed
      });
      await fetchTrips();
    } catch (err) {
      alert('Error updating activity: ' + err);
    }
  };

  const handleDeleteItineraryItem = async (itemId: number) => {
    if (!currentTrip || !confirm('Remove this activity from itinerary?')) return;
    try {
      await api.deleteItineraryItem(currentTrip.id, itemId);
      await fetchTrips();
    } catch (err) {
      alert('Error removing activity: ' + err);
    }
  };

  const handleSaveItinerary = async (formData: any) => {
    if (!currentTrip) return;
    try {
      if (editingItinerary) {
        await api.updateItineraryItem(currentTrip.id, editingItinerary.id, formData);
      } else {
        await api.addItineraryItem(currentTrip.id, formData);
      }
      setIsItineraryModalOpen(false);
      setEditingItinerary(null);
      await fetchTrips();
    } catch (err) {
      alert('Error saving activity: ' + err);
    }
  };

  // Group itinerary by day
  const itineraryDays = currentTrip ? Array.from(
    new Set((currentTrip.itinerary_items || []).map(i => i.day_number))
  ).sort((a, b) => a - b) : [];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Header */}
      {!currentTrip ? (
        <div className="arch-surface p-4 sm:p-6 md:p-8 border border-[#e5e0d4] shadow-xs relative">
          <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#b58c38]" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#b58c38]" />
          <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#b58c38]" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#b58c38]" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-stone-500 font-mono-tech text-xs uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4 text-[#9c7526]" />
                <span className="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-[#9c7526] font-semibold">
                  [ 03 // SHARED ADVENTURES ]
                </span>
              </div>
              <h1 className="font-serif-editorial text-2xl sm:text-3xl md:text-4xl text-[#181c24] font-medium tracking-tight">
                Travel Planner
              </h1>
            </div>

            <button
              onClick={() => {
                setEditingTrip(null);
                setIsTripModalOpen(true);
              }}
              className="px-4 sm:px-5 py-2.5 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider font-semibold rounded flex items-center justify-center gap-2 transition-all shadow-xs self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Propose New Trip</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace Header when a trip is selected */
        <div className="arch-surface p-4 sm:p-6 md:p-8 border border-[#e5e0d4] shadow-xs relative space-y-4">
          <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#b58c38]" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#b58c38]" />
          <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#b58c38]" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#b58c38]" />

          <button
            onClick={() => setSelectedTripId(null)}
            className="text-xs font-mono-tech uppercase tracking-wider text-stone-500 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Trips</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono-tech uppercase tracking-wider text-[#9c7526] font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {currentTrip.destination}
                </span>

                <span className={`px-2 py-0.5 text-[10px] font-mono-tech uppercase tracking-wider rounded border font-semibold ${getStatusBadge(currentTrip.status).bg}`}>
                  {getStatusBadge(currentTrip.status).label}
                </span>

                {currentTrip.status !== 'idea' && currentTrip.start_date ? (
                  <span className="px-2 py-0.5 text-[10px] font-mono-tech uppercase tracking-wider rounded border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    <span>Synced to Calendar</span>
                  </span>
                ) : currentTrip.status === 'idea' ? (
                  <span className="px-2 py-0.5 text-[10px] font-mono-tech uppercase tracking-wider rounded border border-stone-200 bg-stone-100 text-stone-500 font-medium">
                    Draft Idea (Not in Calendar)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-mono-tech uppercase tracking-wider rounded border border-amber-200 bg-amber-50 text-amber-700 font-medium">
                    Set Dates to Sync Calendar
                  </span>
                )}

                {getDaysCountdown(currentTrip.start_date) && (
                  <span className="px-2 py-0.5 text-[10px] font-mono-tech uppercase tracking-wider rounded bg-stone-100 text-stone-600 font-medium">
                    {getDaysCountdown(currentTrip.start_date)}
                  </span>
                )}
              </div>

              <h1 className="font-serif-editorial text-2xl sm:text-3xl md:text-4xl text-[#181c24] font-medium mt-1">
                {currentTrip.title}
              </h1>

              <p className="text-stone-500 text-xs font-mono-tech mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDateRange(currentTrip.start_date, currentTrip.end_date)}</span>
              </p>
            </div>

            {/* Quick Actions & Status Select */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <select
                value={currentTrip.status}
                onChange={(e) => handleUpdateStatus(currentTrip.id, e.target.value as TripStatus)}
                className="text-xs font-mono-tech bg-white border border-[#e5e0d4] rounded px-2.5 sm:px-3 py-1.5 sm:py-2 text-stone-700 focus:outline-none focus:border-[#9c7526]"
              >
                <option value="idea">Status: Idea (Brainstorming)</option>
                <option value="planning">Status: Planned (Planning)</option>
                <option value="booked">Status: Booked (Confirmed)</option>
                <option value="completed">Status: Completed</option>
              </select>

              <button
                onClick={() => {
                  setEditingTrip(currentTrip);
                  setIsTripModalOpen(true);
                }}
                className="p-2 border border-[#e5e0d4] hover:bg-white rounded text-stone-600 hover:text-stone-900 transition-colors"
                title="Edit Trip Details"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDeleteTrip(currentTrip.id)}
                className="p-2 border border-rose-200 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                title="Delete Trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {currentTrip.description && (
            <p className="text-sm text-stone-600 leading-relaxed font-sans max-w-3xl pt-1">
              {currentTrip.description}
            </p>
          )}

          {/* Cost Overview Ribbon */}
          {(() => {
            const costs = calculateCosts(currentTrip);
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                <div className="bg-[#fcfbf7] border border-[#e5e0d4] p-3 rounded-lg">
                  <span className="text-[10px] font-mono-tech uppercase tracking-wider text-stone-400 block">
                    Estimated Budget
                  </span>
                  <span className="font-serif-editorial text-xl font-medium text-stone-900 mt-0.5 block">
                    {costs.estimated > 0 ? `${costs.estimated.toFixed(2)} €` : 'Unset'}
                  </span>
                </div>

                <div className="bg-[#fcfbf7] border border-[#e5e0d4] p-3 rounded-lg">
                  <span className="text-[10px] font-mono-tech uppercase tracking-wider text-[#9c7526] font-semibold block">
                    Selected Total
                  </span>
                  <span className="font-serif-editorial text-xl font-medium text-[#9c7526] mt-0.5 block">
                    {costs.bookedTotal.toFixed(2)} €
                  </span>
                </div>

                <div className="bg-[#fcfbf7] border border-[#e5e0d4] p-3 rounded-lg">
                  <span className="text-[10px] font-mono-tech uppercase tracking-wider text-stone-500 block">
                    Transport Options
                  </span>
                  <span className="font-serif-editorial text-xl font-medium text-stone-800 mt-0.5 block">
                    {costs.transportTotal.toFixed(2)} €
                  </span>
                </div>

                <div className="bg-[#fcfbf7] border border-[#e5e0d4] p-3 rounded-lg">
                  <span className="text-[10px] font-mono-tech uppercase tracking-wider text-stone-500 block">
                    Lodging Options
                  </span>
                  <span className="font-serif-editorial text-xl font-medium text-stone-800 mt-0.5 block">
                    {costs.lodgingTotal.toFixed(2)} €
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Main Content: List of Trips vs Trip Workspace */}
      {!currentTrip ? (
        /* 1. All Trips View */
        <div className="space-y-6">
          {/* Status Filter Tabs */}
          <div className="arch-surface px-3 py-2 border border-[#e5e0d4] shadow-xs flex items-center gap-2 overflow-x-auto font-mono-tech text-xs uppercase tracking-wider">
            {['all', 'planning', 'idea', 'booked', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 border transition-all whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-[#181c24] text-white border-[#181c24] font-semibold shadow-xs'
                    : 'bg-white text-stone-600 border-[#e5e0d4] hover:border-stone-400'
                }`}
              >
                {tab === 'all' ? 'All Trips' : tab}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-stone-400 font-mono-tech text-xs uppercase tracking-widest">
              Loading adventures...
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-[#e5e0d4] rounded-xl p-8 bg-[#fcfbf7]">
              <Compass className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif-editorial text-xl text-stone-700">No trips proposed in this category</h3>
              <p className="text-xs text-stone-500 font-mono-tech mt-1 max-w-sm mx-auto">
                Ready for your next getaway? Propose a destination and start planning together!
              </p>
              <button
                onClick={() => {
                  setEditingTrip(null);
                  setIsTripModalOpen(true);
                }}
                className="mt-4 px-4 py-2 bg-[#181c24] text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider rounded inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Propose First Trip</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => {
                const costs = calculateCosts(trip);
                const statusInfo = getStatusBadge(trip.status);
                const countdown = getDaysCountdown(trip.start_date);

                return (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTripId(trip.id)}
                    className="bg-[#fcfbf7] border border-[#e5e0d4] hover:border-[#b58c38] rounded-xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono-tech uppercase tracking-wider text-[#9c7526] font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {trip.destination}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {trip.status !== 'idea' && trip.start_date && (
                            <span className="px-1.5 py-0.2 text-[8px] font-mono-tech uppercase rounded border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold" title="Synced to Calendar">
                              Synced
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-[9px] font-mono-tech uppercase tracking-wider rounded border font-semibold ${statusInfo.bg}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-serif-editorial text-2xl text-[#181c24] group-hover:text-[#9c7526] transition-colors leading-snug">
                        {trip.title}
                      </h3>

                      <p className="text-xs text-stone-500 font-mono-tech mt-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
                      </p>

                      {trip.description && (
                        <p className="text-xs text-stone-600 font-sans mt-2.5 line-clamp-2 leading-relaxed">
                          {trip.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#e5e0d4]/70">
                      <div className="flex items-center justify-between text-xs font-mono-tech">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-stone-400 block">Selected / Budget</span>
                          <span className="font-semibold text-stone-900">
                            {costs.bookedTotal.toFixed(0)} / {costs.estimated > 0 ? `${costs.estimated.toFixed(0)}` : '---'} €
                          </span>
                        </div>

                        {countdown && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                            {countdown}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono-tech mt-3 pt-2 border-t border-stone-100">
                        <span className="flex items-center gap-2">
                          <span>{(trip.transports || []).length} transport</span>
                          <span>•</span>
                          <span>{(trip.lodgings || []).length} stays</span>
                          <span>•</span>
                          <span>{(trip.itinerary_items || []).length} activities</span>
                        </span>
                        <span className="text-[#9c7526] font-semibold group-hover:translate-x-0.5 transition-transform">
                          Open →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* 2. Single Trip Detail Workspace */
        <div className="space-y-6">
          {/* Workspace Sub-tabs */}
          <div className="flex items-center gap-1 sm:gap-2 border-b border-[#e5e0d4] font-mono-tech text-[11px] sm:text-xs uppercase tracking-wider overflow-x-auto pb-1 whitespace-nowrap">
            <button
              onClick={() => setActiveTripTab('transport')}
              className={`px-3 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-2 relative shrink-0 whitespace-nowrap ${
                activeTripTab === 'transport'
                  ? 'text-[#9c7526] font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Plane className="w-4 h-4" />
              <span>Transportation ({currentTrip.transports?.length || 0})</span>
              {activeTripTab === 'transport' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9c7526]" />
              )}
            </button>

            <button
              onClick={() => setActiveTripTab('lodging')}
              className={`px-3 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-2 relative shrink-0 whitespace-nowrap ${
                activeTripTab === 'lodging'
                  ? 'text-[#9c7526] font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Hotel className="w-4 h-4" />
              <span>Accommodation ({currentTrip.lodgings?.length || 0})</span>
              {activeTripTab === 'lodging' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9c7526]" />
              )}
            </button>

            <button
              onClick={() => setActiveTripTab('itinerary')}
              className={`px-3 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-2 relative shrink-0 whitespace-nowrap ${
                activeTripTab === 'itinerary'
                  ? 'text-[#9c7526] font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Itinerary & Activities ({currentTrip.itinerary_items?.length || 0})</span>
              {activeTripTab === 'itinerary' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9c7526]" />
              )}
            </button>

            <button
              onClick={() => setActiveTripTab('budget')}
              className={`px-3 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-2 relative shrink-0 whitespace-nowrap ${
                activeTripTab === 'budget'
                  ? 'text-[#9c7526] font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Budget & Notes</span>
              {activeTripTab === 'budget' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9c7526]" />
              )}
            </button>
          </div>

          {/* TAB 1: Transportation */}
          {activeTripTab === 'transport' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif-editorial text-2xl text-[#181c24]">
                    Transit & Travel Options
                  </h3>
                  <p className="text-xs text-stone-500 font-mono-tech mt-0.5">
                    Compare flights, trains, rentals, and ferries. Toggle 'Selected' on options you choose to book.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingTransport(null);
                    setIsTransportModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider rounded flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              </div>

              {(currentTrip.transports || []).length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-[#e5e0d4] rounded-xl p-6 bg-[#fcfbf7]">
                  <Plane className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-mono-tech">No transportation options added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(currentTrip.transports || []).map((transport) => (
                    <div
                      key={transport.id}
                      className={`p-4 rounded-xl border transition-all ${
                        transport.is_selected
                          ? 'bg-amber-50/50 border-[#b58c38] shadow-xs'
                          : 'bg-[#fcfbf7] border-[#e5e0d4] opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`p-2 rounded-lg ${transport.is_selected ? 'bg-[#9c7526] text-white' : 'bg-stone-200 text-stone-700'}`}>
                            {getTransportIcon(transport.type)}
                          </span>
                          <div>
                            <span className="text-[10px] font-mono-tech uppercase tracking-wider text-stone-400 block">
                              {transport.type}
                            </span>
                            <h4 className="font-serif-editorial text-lg text-stone-900 font-medium leading-snug">
                              {transport.title}
                            </h4>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-serif-editorial text-xl font-medium text-stone-900">
                            {transport.cost > 0 ? `${transport.cost.toFixed(2)} €` : 'Free / Included'}
                          </span>
                        </div>
                      </div>

                      {/* Route / Times */}
                      {(transport.departure_location || transport.arrival_location) && (
                        <div className="mt-3 text-xs font-mono-tech text-stone-700 bg-white/80 p-2.5 rounded border border-[#e5e0d4]/70 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500">Departure:</span>
                            <span className="font-semibold text-right">{transport.departure_location || 'TBD'}</span>
                          </div>
                          {transport.departure_time && (
                            <div className="text-[11px] text-stone-400 text-right">
                              {new Date(transport.departure_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                            <span className="text-stone-500">Arrival:</span>
                            <span className="font-semibold text-right">{transport.arrival_location || 'TBD'}</span>
                          </div>
                          {transport.arrival_time && (
                            <div className="text-[11px] text-stone-400 text-right">
                              {new Date(transport.arrival_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Booking Reference & Notes */}
                      {transport.booking_reference && (
                        <p className="text-[11px] font-mono-tech text-stone-600 mt-2">
                          <span className="text-stone-400 uppercase">Ref / Seats:</span> {transport.booking_reference}
                        </p>
                      )}

                      {transport.notes && (
                        <p className="text-xs text-stone-600 font-sans mt-2 italic bg-stone-50 p-2 rounded">
                          "{transport.notes}"
                        </p>
                      )}

                      {/* Bottom Controls */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#e5e0d4]/70 text-xs font-mono-tech">
                        <button
                          onClick={() => handleToggleTransportSelected(transport)}
                          className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-semibold transition-all ${
                            transport.is_selected
                              ? 'bg-emerald-700 text-white'
                              : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{transport.is_selected ? 'Selected Option' : 'Select Option'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {transport.booking_url && (
                            <a
                              href={transport.booking_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-stone-500 hover:text-stone-900 border border-stone-200 rounded hover:bg-white"
                              title="Open Booking Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => {
                              setEditingTransport(transport);
                              setIsTransportModalOpen(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 border border-stone-200 rounded hover:bg-white"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteTransport(transport.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 border border-rose-200 rounded hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Accommodation */}
          {activeTripTab === 'lodging' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-editorial text-2xl text-[#181c24]">
                    Stays & Accommodations
                  </h3>
                  <p className="text-xs text-stone-500 font-mono-tech mt-0.5">
                    Compare hotels, villas, and Airbnbs. Select the chosen stay to include in total travel costs.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingLodging(null);
                    setIsLodgingModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider rounded flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stay</span>
                </button>
              </div>

              {(currentTrip.lodgings || []).length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-[#e5e0d4] rounded-xl p-6 bg-[#fcfbf7]">
                  <Hotel className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-mono-tech">No accommodation options added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(currentTrip.lodgings || []).map((lodging) => (
                    <div
                      key={lodging.id}
                      className={`p-4 rounded-xl border transition-all ${
                        lodging.is_selected
                          ? 'bg-amber-50/50 border-[#b58c38] shadow-xs'
                          : 'bg-[#fcfbf7] border-[#e5e0d4] opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`p-2 rounded-lg ${lodging.is_selected ? 'bg-[#9c7526] text-white' : 'bg-stone-200 text-stone-700'}`}>
                            {getLodgingIcon(lodging.type)}
                          </span>
                          <div>
                            <span className="text-[10px] font-mono-tech uppercase tracking-wider text-stone-400 block">
                              {lodging.type}
                            </span>
                            <h4 className="font-serif-editorial text-lg text-stone-900 font-medium leading-snug">
                              {lodging.name}
                            </h4>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-serif-editorial text-xl font-medium text-stone-900">
                            {lodging.cost > 0 ? `${lodging.cost.toFixed(2)} €` : 'Free'}
                          </span>
                        </div>
                      </div>

                      {lodging.location && (
                        <p className="text-xs text-stone-600 font-mono-tech mt-2 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span>{lodging.location}</span>
                        </p>
                      )}

                      {(lodging.check_in || lodging.check_out) && (
                        <div className="mt-2 text-xs font-mono-tech text-stone-600 bg-white/80 p-2 rounded border border-[#e5e0d4]/70 flex items-center justify-between">
                          <span>Check-in: {lodging.check_in ? new Date(lodging.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}</span>
                          <span>→</span>
                          <span>Check-out: {lodging.check_out ? new Date(lodging.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}</span>
                        </div>
                      )}

                      {lodging.notes && (
                        <p className="text-xs text-stone-600 font-sans mt-2.5 bg-stone-50 p-2 rounded leading-relaxed">
                          {lodging.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#e5e0d4]/70 text-xs font-mono-tech">
                        <button
                          onClick={() => handleToggleLodgingSelected(lodging)}
                          className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-semibold transition-all ${
                            lodging.is_selected
                              ? 'bg-emerald-700 text-white'
                              : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{lodging.is_selected ? 'Booked Stay' : 'Select Stay'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {lodging.booking_url && (
                            <a
                              href={lodging.booking_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-stone-500 hover:text-stone-900 border border-stone-200 rounded hover:bg-white"
                              title="Open Booking Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => {
                              setEditingLodging(lodging);
                              setIsLodgingModalOpen(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 border border-stone-200 rounded hover:bg-white"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteLodging(lodging.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 border border-rose-200 rounded hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Itinerary */}
          {activeTripTab === 'itinerary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-editorial text-2xl text-[#181c24]">
                    Day-by-Day Schedule & Activities
                  </h3>
                  <p className="text-xs text-stone-500 font-mono-tech mt-0.5">
                    Plan your visits, dinners, tours, and excursions. Check items off as you explore together.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingItinerary(null);
                    setDefaultDayNumber(itineraryDays.length > 0 ? Math.max(...itineraryDays) : 1);
                    setIsItineraryModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] text-xs font-mono-tech uppercase tracking-wider rounded flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Activity</span>
                </button>
              </div>

              {(currentTrip.itinerary_items || []).length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-[#e5e0d4] rounded-xl p-6 bg-[#fcfbf7]">
                  <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-mono-tech">No itinerary activities planned yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {itineraryDays.map((dayNum) => {
                    const dayItems = (currentTrip.itinerary_items || []).filter(i => i.day_number === dayNum);
                    return (
                      <div key={dayNum} className="border border-[#e5e0d4] bg-[#fcfbf7] rounded-xl p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e5e0d4]">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-[#181c24] text-[#fcd34d] text-xs font-mono-tech font-bold flex items-center justify-center">
                              {dayNum}
                            </span>
                            <h4 className="font-serif-editorial text-xl text-[#181c24] font-medium">
                              Day {dayNum}
                            </h4>
                          </div>

                          <button
                            onClick={() => {
                              setEditingItinerary(null);
                              setDefaultDayNumber(dayNum);
                              setIsItineraryModalOpen(true);
                            }}
                            className="text-[11px] font-mono-tech uppercase text-[#9c7526] hover:text-[#735213] font-semibold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add to Day {dayNum}</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {dayItems.map((item) => (
                            <div
                              key={item.id}
                              className={`p-3 rounded-lg border transition-all flex items-start gap-3 ${
                                item.is_completed
                                  ? 'bg-stone-100/60 border-stone-200 opacity-60'
                                  : 'bg-white border-[#e5e0d4]'
                              }`}
                            >
                              <button
                                onClick={() => handleToggleItineraryCompleted(item)}
                                className="mt-0.5 text-stone-400 hover:text-emerald-700 transition-colors"
                              >
                                {item.is_completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>

                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    {getItineraryCategoryIcon(item.category)}
                                    <h5 className={`font-serif-editorial text-base text-stone-900 font-medium ${item.is_completed ? 'line-through text-stone-500' : ''}`}>
                                      {item.title}
                                    </h5>
                                  </div>

                                  {item.cost > 0 && (
                                    <span className="text-xs font-mono-tech font-semibold text-stone-800">
                                      {item.cost.toFixed(2)} €
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 text-[11px] font-mono-tech text-stone-500 mt-1 flex-wrap">
                                  {item.time_of_day && (
                                    <span className="flex items-center gap-1 text-stone-600 font-medium">
                                      <Clock className="w-3 h-3 text-stone-400" />
                                      {item.time_of_day}
                                    </span>
                                  )}

                                  {item.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-stone-400" />
                                      {item.location}
                                    </span>
                                  )}
                                </div>

                                {item.description && (
                                  <p className="text-xs text-stone-600 font-sans mt-1.5 leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 self-center">
                                {item.location_url && (
                                  <a
                                    href={item.location_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 text-stone-400 hover:text-stone-700"
                                    title="Google Maps"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                <button
                                  onClick={() => {
                                    setEditingItinerary(item);
                                    setIsItineraryModalOpen(true);
                                  }}
                                  className="p-1 text-stone-400 hover:text-stone-700"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteItineraryItem(item.id)}
                                  className="p-1 text-rose-400 hover:text-rose-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Budget & Notes */}
          {activeTripTab === 'budget' && (
            <div className="space-y-6">
              <div className="bg-[#fcfbf7] border border-[#e5e0d4] rounded-xl p-5 shadow-xs">
                <h3 className="font-serif-editorial text-2xl text-[#181c24] mb-3">
                  Comprehensive Budget Breakdown
                </h3>

                {(() => {
                  const costs = calculateCosts(currentTrip);
                  const progressPct = costs.estimated > 0 
                    ? Math.min(100, (costs.bookedTotal / costs.estimated) * 100)
                    : 0;

                  return (
                    <div className="space-y-4">
                      {costs.estimated > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-xs font-mono-tech mb-1">
                            <span className="text-stone-500 uppercase">Budget Allocation</span>
                            <span className="font-semibold text-stone-800">
                              {costs.bookedTotal.toFixed(2)} of {costs.estimated.toFixed(2)} € ({progressPct.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${progressPct > 100 ? 'bg-rose-500' : 'bg-[#9c7526]'}`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3 bg-white rounded border border-[#e5e0d4]">
                          <span className="text-[10px] font-mono-tech uppercase text-stone-400 block">Transit (Selected)</span>
                          <span className="font-serif-editorial text-xl font-medium text-stone-900 mt-1 block">
                            {costs.transportTotal.toFixed(2)} €
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded border border-[#e5e0d4]">
                          <span className="text-[10px] font-mono-tech uppercase text-stone-400 block">Lodging (Selected)</span>
                          <span className="font-serif-editorial text-xl font-medium text-stone-900 mt-1 block">
                            {costs.lodgingTotal.toFixed(2)} €
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded border border-[#e5e0d4]">
                          <span className="text-[10px] font-mono-tech uppercase text-stone-400 block">Activities & Dining</span>
                          <span className="font-serif-editorial text-xl font-medium text-stone-900 mt-1 block">
                            {costs.activitiesTotal.toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Trip Notes Section */}
              <div className="bg-[#fcfbf7] border border-[#e5e0d4] rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e5e0d4]">
                  <h3 className="font-serif-editorial text-2xl text-[#181c24]">
                    Trip Notes & Packing Checklist
                  </h3>
                  <button
                    onClick={() => {
                      setEditingTrip(currentTrip);
                      setIsTripModalOpen(true);
                    }}
                    className="text-xs font-mono-tech text-[#9c7526] hover:text-[#735213] uppercase font-semibold"
                  >
                    Edit Notes
                  </button>
                </div>

                {currentTrip.notes ? (
                  <p className="text-sm text-stone-700 font-sans whitespace-pre-wrap leading-relaxed">
                    {currentTrip.notes}
                  </p>
                ) : (
                  <p className="text-xs text-stone-400 font-mono-tech italic">
                    No notes entered yet. Click 'Edit Notes' to add tips, packing items, or flight reminders.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL 1: Create / Edit Trip --- */}
      {isTripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#fcfbf7] border border-[#e5e0d4] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e5e0d4] pb-2">
              <div>
                <h3 className="font-serif-editorial text-2xl text-stone-900">
                  {editingTrip ? 'Edit Trip' : 'Propose a Trip'}
                </h3>
                <p className="text-xs text-stone-500 font-mono-tech mt-0.5">
                  {editingTrip
                    ? 'Update your trip details and preferences.'
                    : 'Only destination is required. You can add dates, stays, and travel plans together later.'}
                </p>
              </div>
              <button onClick={() => setIsTripModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const sDate = formData.get('start_date') as string;
                const eDate = formData.get('end_date') as string;
                const destination = ((formData.get('destination') as string) || '').trim();
                const rawTitle = ((formData.get('title') as string) || '').trim();
                const title = rawTitle || destination;

                handleSaveTrip({
                  title,
                  destination,
                  description: ((formData.get('description') as string) || '').trim() || null,
                  start_date: sDate ? new Date(sDate).toISOString() : null,
                  end_date: eDate ? new Date(eDate).toISOString() : null,
                  estimated_budget: parseFloat(formData.get('estimated_budget') as string) || 0,
                  currency: 'EUR',
                  status: formData.get('status') || 'idea',
                  notes: ((formData.get('notes') as string) || '').trim() || null,
                });
              }}
              className="space-y-3 font-mono-tech text-xs"
            >
              <div>
                <label className="block uppercase text-stone-600 font-semibold mb-1">Destination *</label>
                <input
                  name="destination"
                  required
                  autoFocus
                  defaultValue={editingTrip?.destination || ''}
                  placeholder="e.g. Rome, Italy or Norwegian Fjords"
                  className="w-full bg-white border border-[#e5e0d4] p-2.5 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                />
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">
                  Trip Title <span className="text-stone-400 font-normal lowercase">(optional - defaults to destination)</span>
                </label>
                <input
                  name="title"
                  defaultValue={editingTrip?.title || ''}
                  placeholder="e.g. Italian Summer Holiday"
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                />
              </div>

              <div className="pt-2 border-t border-[#e5e0d4]/70 space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                  Optional Details
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-stone-500 mb-1">Start Date</label>
                    <input
                      name="start_date"
                      type="date"
                      defaultValue={editingTrip?.start_date ? editingTrip.start_date.split('T')[0] : ''}
                      className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-stone-500 mb-1">End Date</label>
                    <input
                      name="end_date"
                      type="date"
                      defaultValue={editingTrip?.end_date ? editingTrip.end_date.split('T')[0] : ''}
                      className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-stone-500 mb-1">Estimated Budget (€)</label>
                    <input
                      name="estimated_budget"
                      type="number"
                      step="0.01"
                      defaultValue={editingTrip?.estimated_budget || ''}
                      placeholder="1200"
                      className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-stone-500 mb-1">Status</label>
                    <select
                      name="status"
                      defaultValue={editingTrip?.status || 'idea'}
                      className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                    >
                      <option value="idea">Idea (Brainstorming - not in calendar)</option>
                      <option value="planning">Planned (Synchronized to calendar)</option>
                      <option value="booked">Booked (Confirmed - in calendar)</option>
                      <option value="completed">Completed (Past trip - in calendar)</option>
                    </select>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-[11px] font-mono-tech text-emerald-900 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Trips with status <strong>Planned</strong> or higher and set dates automatically synchronize with your shared calendar.</span>
                </div>

                <div>
                  <label className="block uppercase text-stone-500 mb-1">Description / Highlights</label>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={editingTrip?.description || ''}
                    placeholder="Highlights, dreams, or reasons to go..."
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526] font-sans"
                  />
                </div>

                <div>
                  <label className="block uppercase text-stone-500 mb-1">Notes & Packing Reminders</label>
                  <textarea
                    name="notes"
                    rows={2}
                    defaultValue={editingTrip?.notes || ''}
                    placeholder="Passports, clothing, reservations..."
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526] font-sans"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e0d4]">
                <button
                  type="button"
                  onClick={() => setIsTripModalOpen(false)}
                  className="px-3 py-1.5 text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#181c24] hover:bg-[#2c323f] text-[#fcd34d] uppercase font-semibold rounded transition-colors"
                >
                  {editingTrip ? 'Save Changes' : 'Propose Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Add / Edit Transport --- */}
      {isTransportModalOpen && currentTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#fcfbf7] border border-[#e5e0d4] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e5e0d4] pb-2">
              <h3 className="font-serif-editorial text-2xl text-stone-900">
                {editingTransport ? 'Edit Transport Option' : 'Add Transport Option'}
              </h3>
              <button onClick={() => setIsTransportModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const depTime = formData.get('departure_time') as string;
                const arrTime = formData.get('arrival_time') as string;

                handleSaveTransport({
                  type: formData.get('type'),
                  title: formData.get('title'),
                  departure_location: formData.get('departure_location'),
                  arrival_location: formData.get('arrival_location'),
                  departure_time: depTime ? new Date(depTime).toISOString() : null,
                  arrival_time: arrTime ? new Date(arrTime).toISOString() : null,
                  cost: parseFloat(formData.get('cost') as string) || 0,
                  booking_reference: formData.get('booking_reference'),
                  booking_url: formData.get('booking_url'),
                  notes: formData.get('notes'),
                  is_selected: formData.get('is_selected') === 'on',
                });
              }}
              className="space-y-3 font-mono-tech text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Mode *</label>
                  <select
                    name="type"
                    defaultValue={editingTransport?.type || 'flight'}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  >
                    <option value="flight">Flight</option>
                    <option value="train">Train</option>
                    <option value="car">Car / Rental</option>
                    <option value="bus">Bus</option>
                    <option value="ferry">Ferry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Cost (€)</label>
                  <input
                    name="cost"
                    type="number"
                    step="0.01"
                    defaultValue={editingTransport?.cost || ''}
                    placeholder="150"
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Title / Connection *</label>
                <input
                  name="title"
                  required
                  defaultValue={editingTransport?.title || ''}
                  placeholder="e.g. Ryanair Morning Flight"
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Departure Location</label>
                  <input
                    name="departure_location"
                    defaultValue={editingTransport?.departure_location || ''}
                    placeholder="e.g. Warsaw Chopin (WAW)"
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Arrival Location</label>
                  <input
                    name="arrival_location"
                    defaultValue={editingTransport?.arrival_location || ''}
                    placeholder="e.g. Rome Ciampino (CIA)"
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Departure Time</label>
                  <input
                    name="departure_time"
                    type="datetime-local"
                    defaultValue={editingTransport?.departure_time ? editingTransport.departure_time.slice(0, 16) : ''}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Arrival Time</label>
                  <input
                    name="arrival_time"
                    type="datetime-local"
                    defaultValue={editingTransport?.arrival_time ? editingTransport.arrival_time.slice(0, 16) : ''}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Booking Ref / Seats</label>
                  <input
                    name="booking_reference"
                    defaultValue={editingTransport?.booking_reference || ''}
                    placeholder="e.g. FR4921 / Seats 14A, 14B"
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Booking URL</label>
                  <input
                    name="booking_url"
                    defaultValue={editingTransport?.booking_url || ''}
                    placeholder="https://..."
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingTransport?.notes || ''}
                  placeholder="Baggage rules, terminal info..."
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526] font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="is_selected_transport"
                  name="is_selected"
                  type="checkbox"
                  defaultChecked={editingTransport?.is_selected || false}
                  className="rounded border-[#e5e0d4] text-[#9c7526] focus:ring-0"
                />
                <label htmlFor="is_selected_transport" className="text-stone-700 cursor-pointer font-medium">
                  Select this option for the trip itinerary
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e0d4]">
                <button
                  type="button"
                  onClick={() => setIsTransportModalOpen(false)}
                  className="px-3 py-1.5 text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#181c24] text-[#fcd34d] uppercase font-semibold rounded"
                >
                  Save Transport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Add / Edit Lodging --- */}
      {isLodgingModalOpen && currentTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#fcfbf7] border border-[#e5e0d4] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e5e0d4] pb-2">
              <h3 className="font-serif-editorial text-2xl text-stone-900">
                {editingLodging ? 'Edit Accommodation' : 'Add Accommodation'}
              </h3>
              <button onClick={() => setIsLodgingModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const chIn = formData.get('check_in') as string;
                const chOut = formData.get('check_out') as string;

                handleSaveLodging({
                  type: formData.get('type'),
                  name: formData.get('name'),
                  location: formData.get('location'),
                  check_in: chIn ? new Date(chIn).toISOString() : null,
                  check_out: chOut ? new Date(chOut).toISOString() : null,
                  cost: parseFloat(formData.get('cost') as string) || 0,
                  booking_url: formData.get('booking_url'),
                  notes: formData.get('notes'),
                  is_selected: formData.get('is_selected') === 'on',
                });
              }}
              className="space-y-3 font-mono-tech text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Type *</label>
                  <select
                    name="type"
                    defaultValue={editingLodging?.type || 'hotel'}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="apartment">Apartment</option>
                    <option value="resort">Resort</option>
                    <option value="hostel">Hostel</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Cost (€)</label>
                  <input
                    name="cost"
                    type="number"
                    step="0.01"
                    defaultValue={editingLodging?.cost || ''}
                    placeholder="240"
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Name *</label>
                <input
                  name="name"
                  required
                  defaultValue={editingLodging?.name || ''}
                  placeholder="e.g. Hotel Boutique Navona"
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                />
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Location / Address</label>
                <input
                  name="location"
                  defaultValue={editingLodging?.location || ''}
                  placeholder="e.g. Piazza Navona 14, Rome"
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Check-in Date</label>
                  <input
                    name="check_in"
                    type="date"
                    defaultValue={editingLodging?.check_in ? editingLodging.check_in.split('T')[0] : ''}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Check-out Date</label>
                  <input
                    name="check_out"
                    type="date"
                    defaultValue={editingLodging?.check_out ? editingLodging.check_out.split('T')[0] : ''}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Booking Link</label>
                <input
                  name="booking_url"
                  defaultValue={editingLodging?.booking_url || ''}
                  placeholder="https://booking.com/..."
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                />
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Amenities & Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingLodging?.notes || ''}
                  placeholder="Breakfast included, rooftop view, cancellation policy..."
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526] font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="is_selected_lodging"
                  name="is_selected"
                  type="checkbox"
                  defaultChecked={editingLodging?.is_selected || false}
                  className="rounded border-[#e5e0d4] text-[#9c7526] focus:ring-0"
                />
                <label htmlFor="is_selected_lodging" className="text-stone-700 cursor-pointer font-medium">
                  Select this accommodation as the chosen stay
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e0d4]">
                <button
                  type="button"
                  onClick={() => setIsLodgingModalOpen(false)}
                  className="px-3 py-1.5 text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#181c24] text-[#fcd34d] uppercase font-semibold rounded"
                >
                  Save Stay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: Add / Edit Itinerary Activity --- */}
      {isItineraryModalOpen && currentTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#fcfbf7] border border-[#e5e0d4] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e5e0d4] pb-2">
              <h3 className="font-serif-editorial text-2xl text-stone-900">
                {editingItinerary ? 'Edit Activity' : 'Add Activity to Itinerary'}
              </h3>
              <button onClick={() => setIsItineraryModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);

                handleSaveItinerary({
                  day_number: parseInt(formData.get('day_number') as string, 10) || 1,
                  time_of_day: formData.get('time_of_day'),
                  title: formData.get('title'),
                  description: formData.get('description'),
                  location: formData.get('location'),
                  location_url: formData.get('location_url'),
                  cost: parseFloat(formData.get('cost') as string) || 0,
                  category: formData.get('category'),
                  is_completed: editingItinerary?.is_completed || false,
                });
              }}
              className="space-y-3 font-mono-tech text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Day Number *</label>
                  <input
                    name="day_number"
                    type="number"
                    min="1"
                    required
                    defaultValue={editingItinerary?.day_number ?? defaultDayNumber}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingItinerary?.category || 'sightseeing'}
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  >
                    <option value="sightseeing">Sightseeing</option>
                    <option value="food">Dining & Drinks</option>
                    <option value="relax">Relax & Promenade</option>
                    <option value="culture">Art & Museum</option>
                    <option value="adventure">Outdoor Adventure</option>
                    <option value="transport">Local Transit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Activity Title *</label>
                <input
                  name="title"
                  required
                  defaultValue={editingItinerary?.title || ''}
                  placeholder="e.g. Colosseum & Roman Forum Tour"
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Time of Day</label>
                  <input
                    name="time_of_day"
                    defaultValue={editingItinerary?.time_of_day || ''}
                    placeholder="e.g. 10:00 AM or Sunset"
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Estimated Cost (€)</label>
                  <input
                    name="cost"
                    type="number"
                    step="0.01"
                    defaultValue={editingItinerary?.cost || ''}
                    placeholder="35"
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Location</label>
                  <input
                    name="location"
                    defaultValue={editingItinerary?.location || ''}
                    placeholder="e.g. Piazza del Colosseo"
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
                <div>
                  <label className="block uppercase text-stone-500 mb-1">Map / Website URL</label>
                  <input
                    name="location_url"
                    defaultValue={editingItinerary?.location_url || ''}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526]"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-stone-500 mb-1">Description / Details</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingItinerary?.description || ''}
                  placeholder="Ticket details, reservations, what to see..."
                  className="w-full bg-white border border-[#e5e0d4] p-2 rounded text-stone-900 focus:outline-none focus:border-[#9c7526] font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e0d4]">
                <button
                  type="button"
                  onClick={() => setIsItineraryModalOpen(false)}
                  className="px-3 py-1.5 text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#181c24] text-[#fcd34d] uppercase font-semibold rounded"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
