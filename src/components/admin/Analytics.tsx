import React, { useEffect, useState } from 'react';
import { useApi } from '../../context/context';
import { Eye, Home, MapPin, Bed, Bath, Ruler, Star, Heart, Calendar, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import AddPropertyModal from '@/components/ui/addPropertyModal';

const PropertyAnalytics: React.FC = () => {
  const { api, loading, error } = useApi();
  const [properties, setProperties] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    rentedProperties: 0,
    averagePrice: 0
  });
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [priceDistribution, setPriceDistribution] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Enhanced logging function
  const log = (message: string, data?: any, type: 'info' | 'error' | 'success' = 'info') => {
    const styles = {
      info: 'color: #2563EB; background: #EFF6FF; padding: 2px 4px; border-radius: 4px;',
      error: 'color: #DC2626; background: #FEE2E2; padding: 2px 4px; border-radius: 4px;',
      success: 'color: #059669; background: #D1FAE5; padding: 2px 4px; border-radius: 4px;'
    };
    console.log(`%c[PropertyAnalytics] ${message}`, styles[type]);
    if (data) {
      console.log('Data:', data);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      log('Initiating properties.getAll() API call');
      const response = await api.properties.getAll();
      
      log('API Response Received', response, 'success');
      
      if (response.data) {
        log('Processing properties data', response.data);
        setProperties(response.data);
        calculateStats(response.data);
        calculateStatusDistribution(response.data);
        calculatePriceDistribution(response.data);
        log('State updated with properties data');
      } else {
        log('No data property in response', response, 'error');
      }
    } catch (err) {
      log('Error fetching properties', err, 'error');
    }
  };

  const calculateStats = (properties: any[]) => {
    log('Calculating statistics from properties data', properties);
    
    const total = properties.length;
    const active = properties.filter(p => p.status === 'active').length;
    const rented = properties.filter(p => p.status === 'rented').length;
    const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / total || 0;

    log('Calculated Stats', {
      totalProperties: total,
      activeProperties: active,
      rentedProperties: rented,
      averagePrice: avgPrice
    }, 'success');

    setStats({
      totalProperties: total,
      activeProperties: active,
      rentedProperties: rented,
      averagePrice: avgPrice
    });
  };

  const calculateStatusDistribution = (properties: any[]) => {
    log('Calculating status distribution from properties data');
    
    const statusCounts: Record<string, number> = {};
    
    properties.forEach(property => {
      const status = property.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const distribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: getStatusColor(status)
    }));

    log('Status Distribution Calculated', distribution, 'success');
    setStatusDistribution(distribution);
  };

  const calculatePriceDistribution = (properties: any[]) => {
    log('Calculating price distribution from properties data');
    
    const priceRanges = [
      { range: '0-500', min: 0, max: 500 },
      { range: '500-1000', min: 500, max: 1000 },
      { range: '1000-2000', min: 1000, max: 2000 },
      { range: '2000-5000', min: 2000, max: 5000 },
      { range: '5000+', min: 5000, max: Infinity }
    ];

    const distribution = priceRanges.map(range => {
      const count = properties.filter(p => 
        p.price >= range.min && p.price < range.max
      ).length;
      return {
        name: range.range,
        count,
        color: getPriceRangeColor(range.range)
      };
    });

    log('Price Distribution Calculated', distribution, 'success');
    setPriceDistribution(distribution);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: '#10B981',
      rented: '#3B82F6',
      maintenance: '#F59E0B',
      unavailable: '#EF4444',
      unknown: '#9CA3AF'
    };
    return colors[status] || '#9CA3AF';
  };

  const getPriceRangeColor = (range: string): string => {
    const colors: Record<string, string> = {
      '0-500': '#10B981',
      '500-1000': '#3B82F6',
      '1000-2000': '#F59E0B',
      '2000-5000': '#EF4444',
      '5000+': '#8B5CF6'
    };
    return colors[range] || '#9CA3AF';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    log('Rendering loading state');
    return <div className="p-6 text-center">Loading properties...</div>;
  }

  if (error) {
    log('Rendering error state', error, 'error');
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  log('Rendering main component with properties', properties);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Analytics</h1>
          <p className="text-gray-600">Comprehensive overview of all properties and their performance metrics.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Property
        </button>
      </div>

      <AddPropertyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPropertyAdded={fetchProperties}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProperties}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Active Properties</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeProperties}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Rented Properties</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.rentedProperties}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Avg. Price</h3>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.averagePrice)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((entry, index) => {
                    log(`Rendering pie chart segment for ${entry.name}`, entry);
                    return <Cell key={`cell-${index}`} fill={entry.color} />;
                  })}
                </Pie>
                <Tooltip formatter={(value, name, props) => {
                  log('Pie chart tooltip interaction', { value, name, props });
                  return [
                    `${props.payload.name}: ${value}`,
                    `${((Number(value) / stats.totalProperties) * 100).toFixed(1)}%`
                  ];
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Properties">
                  {priceDistribution.map((entry, index) => {
                    log(`Rendering bar chart segment for ${entry.name}`, entry);
                    return <Cell key={`cell-${index}`} fill={entry.color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Properties</h3>
          <p className="text-sm text-gray-500 mt-1">
            Showing {properties.length} properties with detailed information
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {properties.map((property) => {
            log('Rendering property card', property);
            return (
              <div key={property.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Property Image */}
                  <div className="w-full md:w-1/4">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                      {property.images ? (
                        <img 
                          src={`https://realestate.learnock.com/storage/${property.images[0].image_path}`}
                          alt={property.title_en}
                          className="w-full h-full object-cover max-h-40"
                          onLoad={() => log('Property image loaded', property.id)}
                          onError={() => log('Property image failed to load', property.id, 'error')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Home className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Property Details */}
                  <div className="w-full md:w-3/4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{property.title_en}</h4>
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{property.location_en}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          property.status === 'active' ? 'bg-green-100 text-green-800' :
                          property.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between gap-4 text-center">
                      <div className="flex items-center text-gray-700 justify-center">
                        <Bed className="w-5 h-5 mr-2 text-gray-500" />
                        <span>{property.beds || 'N/A'} Beds</span>
                      </div>
                      <div className="flex items-center text-gray-700 justify-center">
                        <Bath className="w-5 h-5 mr-2 text-gray-500" />
                        <span>{property.bathrooms || 'N/A'} Baths</span>
                      </div>
                      <div className="flex items-center text-gray-700 justify-center">
                        <Ruler className="w-5 h-5 mr-2 text-gray-500" />
                        <span>{property.land_space || 'N/A'} sqft</span>
                      </div>
                      <div className="flex items-center text-gray-700 justify-center">
                        <Star className="w-5 h-5 mr-2 text-gray-500" />
                        <span>{property.share_price || 'N/A'} Share price</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-gray-600 line-clamp-2">{property.description_en}</p>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrency(property.price)}
                        </span>
                        {property.rent_amount && (
                          <span className="ml-2 text-gray-500">
                            / {formatCurrency(property.rent_amount)} rent
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <a
                        href={`https://arkan-last.vercel.app/site/ApartmentDetails/${property.id}`} 
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={() => log('View Details clicked', property.id)}
                        >
                          View Details
                        </a>
                        <button 
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          onClick={() => log('Favorite clicked', property.id)}
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PropertyAnalytics;