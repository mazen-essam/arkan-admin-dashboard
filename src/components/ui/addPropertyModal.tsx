import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/context';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
Modal.setAppElement('#root');

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    inset: 'unset',
    padding: 0,
    border: 'none',
    background: 'none',
    overflow: 'visible',
    maxWidth: '90vw',
    width: '800px',
  },
};

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyAdded: () => void;
}

interface Category {
  id: number;
  name_en: string;
  name_ar: string;
}

interface PropertyType {
  id: number;
  name_en: string;
  name_ar: string;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose, onPropertyAdded }) => {
  const { api } = useApi();
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  
  const [newProperty, setNewProperty] = useState({
    title_en: '',
    title_ar: '',
    price: '',
    price_unit_en: '',
    price_unit_ar: '',
    unit_number: '',
    status: 'vacant',
    rooms: '',
    beds: '',
    bathrooms: '',
    land_space: '',
    is_furnished: false,
    is_completed: false,
    features_en: '[]',
    features_ar: '[]',
    amenities_en: '[]',
    amenities_ar: '[]',
    description_en: '',
    description_ar: '',
    type_en: '',
    type_ar: '',
    location_en: '',
    location_ar: '',
    coordinates_location: '',
    phone: '',
    images: [] as File[],
    user_id: '1',
    category_id: '',
    type_id: '',
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategoriesAndTypes = async () => {
      try {
        console.log("Fetching categories and property types...");
        const [categoriesRes, typesRes] = await Promise.all([
          api.categories.getAll(),
          api.types.getAll()
        ]);
        
        console.log("Categories fetched:", categoriesRes.data);
        console.log("Property types fetched:", typesRes.data);

        if (categoriesRes.data) setCategories(categoriesRes.data);
        if (typesRes.data) setPropertyTypes(typesRes.data);
      } catch (err) {
        console.error("Error fetching categories/types:", err);
      }
    };

    if (isOpen) {
      console.log("Modal opened, starting fetch...");
      fetchCategoriesAndTypes();
    }
  }, [isOpen, api.categories, api.types]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`Changed input: ${name} = ${value}`);

    setNewProperty(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    console.log(`Checkbox changed: ${name} = ${checked}`);

    setNewProperty(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newPreviews: string[] = [];
      console.log("Uploading images:", files);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });

      setNewProperty(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }));
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setNewProperty(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredFields = [
      'title_en',
      'title_ar',
      'price',
      'unit_number',
      'status',
      'user_id',
      'category_id',
      'type_id',
    ];

    const errors: Record<string, string[]> = {};

    requiredFields.forEach((field) => {
      const value = newProperty[field as keyof typeof newProperty];
      if (!value) {
        errors[field] = ['This field is required'];
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();

    // Add regular fields
    Object.entries(newProperty).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== 'images') {
        if (typeof value === 'boolean') {
          formData.append(key, value ? '1' : '0');
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add images
    formData.append('images[]', 'default-image.jpg');

    console.log('Payload:', [...formData.entries()]);

    try {
      console.log("🧾 propertyData before submit:", formData);

      setFormLoading(true);
      await api.properties.create(formData);

      // Reset state after successful creation
      setNewProperty({
        title_en: '',
        title_ar: '',
        price: '',
        price_unit_en: '',
        price_unit_ar: '',
        unit_number: '',
        status: 'vacant',
        rooms: '',
        beds: '',
        bathrooms: '',
        land_space: '',
        is_furnished: false,
        is_completed: false,
        features_en: '[]',
        features_ar: '[]',
        amenities_en: '[]',
        amenities_ar: '[]',
        description_en: '',
        description_ar: '',
        type_en: '',
        type_ar: '',
        location_en: '',
        location_ar: '',
        coordinates_location: '',
        phone: '',
        images: [],
        user_id: '1',
        category_id: '',
        type_id: '',
      });

      setImagePreviews([]);
      setValidationErrors({});
      toast.success('Property added successfully!');
      onClose();
      onPropertyAdded();
    } catch (err: any) {
      console.error('Error submitting property:', err);
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        toast.error('Validation failed. Please check the inputs.');
      } else {
        toast.error('Failed to add property. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const renderError = (field: string) => {
    if (validationErrors[field]) {
      return (
        <div className="mt-1 text-sm text-red-600">
          {validationErrors[field].join(', ')}
        </div>
      );
    }
    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Add New Property"
      style={customStyles}
    >
      <div className="bg-white rounded-lg p-6 w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Property</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {formError}
          </div>
        )}

        {formSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {formSuccess}
          </div>
        )}

        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            <h4 className="font-bold mb-2">Validation Errors:</h4>
            <ul className="list-disc pl-5">
              {Object.entries(validationErrors).map(([field, errors]) => (
                <li key={field}>
                  <strong>{field}:</strong> {errors.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    name="title_en"
                    value={newProperty.title_en}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.title_en ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {renderError('title_en')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (Arabic) *
                  </label>
                  <input
                    type="text"
                    name="title_ar"
                    value={newProperty.title_ar}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.title_ar ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {renderError('title_ar')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={newProperty.price}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {renderError('price')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Number *
                  </label>
                  <input
                    type="text"
                    name="unit_number"
                    value={newProperty.unit_number}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.unit_number ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {renderError('unit_number')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={newProperty.status}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.status ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    required
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                  </select>
                  {renderError('status')}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={newProperty.category_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name_en}
                      </option>
                    ))}
                  </select>
                  {renderError('category_id')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type *
                  </label>
                  <select
                    name="type_id"
                    value={newProperty.type_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${validationErrors.type_id ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    required
                  >
                    <option value="">Select Type</option>
                    {propertyTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name_en}
                      </option>
                    ))}
                  </select>
                  {renderError('type_id')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rooms
                  </label>
                  <input
                    type="number"
                    name="rooms"
                    value={newProperty.rooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beds
                  </label>
                  <input
                    type="number"
                    name="beds"
                    value={newProperty.beds}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={newProperty.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Land Space (sqft)
                  </label>
                  <input
                    type="number"
                    name="land_space"
                    value={newProperty.land_space}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_furnished"
                    checked={newProperty.is_furnished}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Is Furnished
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_completed"
                    checked={newProperty.is_completed}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Is Completed
                  </label>
                </div>
              </div>
            </div>

            {/* Location, Description & Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location, Description & Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (English)
                  </label>
                  <input
                    type="text"
                    name="location_en"
                    value={newProperty.location_en}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (Arabic)
                  </label>
                  <input
                    type="text"
                    name="location_ar"
                    value={newProperty.location_ar}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coordinates
                  </label>
                  <input
                    type="text"
                    name="coordinates_location"
                    value={newProperty.coordinates_location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="latitude,longitude"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={newProperty.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (English)
                </label>
                <textarea
                  name="description_en"
                  value={newProperty.description_en}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Arabic)
                </label>
                <textarea
                  name="description_ar"
                  value={newProperty.description_ar}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Images
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload images</span>
                        <input
                          id="file-upload"
                          name="images"
                          type="file"
                          multiple
                          onChange={handleImageUpload}
                          className="sr-only"
                          accept="image/*"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                  </div>
                </div>
                {renderError('images')}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : 'Save Property'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddPropertyModal;