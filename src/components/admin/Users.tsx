import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Edit, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApi } from '../../context/context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  last_login: string;
  image?: string;
}

const Users: React.FC = () => {
  const { api, loading, error, token, isAuthenticated } = useApi();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Fetch users from API with token verification
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Check authentication before making the request
        if (!isAuthenticated || !token) {
          toast.error('Please login to view users');
          navigate('/login');
          return;
        }

        const response = await api.users.getAll();
        if (response.data) {
          setUsers(response.data);
        }
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        
        // Handle unauthorized error
        if (err.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else {
          toast.error(err.response?.data?.message || 'Failed to fetch users');
        }
      }
    };
    console.log(token)
    fetchUsers();
  }, [ isAuthenticated, token, navigate]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || user.status.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteUser = async (userId: number) => {
    try {
      if (!isAuthenticated || !token) {
        toast.error('Please login to perform this action');
        navigate('/login');
        return;
      }

      await api.users.deleteUser(String(userId));
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  // const getStatusColor = (status: string) => {
  //   switch (status.toLowerCase()) {
  //     case 'active': return 'bg-green-100 text-green-800';
  //     case 'inactive': return 'bg-gray-100 text-gray-800';
  //     case 'pending': return 'bg-yellow-100 text-yellow-800';
  //     default: return 'bg-gray-100 text-gray-800';
  //   }
  // };

  const handleAddUser = () => {
    if (!isAuthenticated || !token) {
      toast.error('Please login to add users');
      navigate('/login');
      return;
    }
    navigate('/users/add');
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
          <p className="text-gray-600">Manage your users and their permissions.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus size={20} className="mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <Button variant="outline">
              <Filter size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && <div className="text-center py-4">Loading users...</div>}
      {error && <div className="text-red-500 py-4">Error: {error}</div>}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900">User</th>
                <th className="text-left p-4 font-semibold text-gray-900">Role</th>
                {/* <th className="text-left p-4 font-semibold text-gray-900">Status</th> */}
                <th className="text-left p-4 font-semibold text-gray-900">Last Login</th>
                <th className="text-center p-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center">
                      {user.image ? (
                        <img 
                          src={user.image} 
                          alt={`${user.first_name} ${user.last_name}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </span>
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-gray-900">{user.role}</span>
                  </td>
                  {/* <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td> */}
                  <td className="p-4 text-gray-600">{user.last_login || 'Never'}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;