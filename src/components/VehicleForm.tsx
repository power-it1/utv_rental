'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { getVehiclePlaceholderImage } from '@/lib/vehicle-utils';

interface VehicleFormProps {
  vehicleId?: string;
}

type VehicleType = 'motorcycle' | 'utv' | 'guided_tour';

type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];

interface VehicleFormState {
  type: VehicleType;
  name: string;
  description: string;
  price_per_day: string;
  available: boolean;
  specifications: Record<string, string>;
  images: string[];
}

export default function VehicleForm({ vehicleId }: VehicleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleFormState>({
    type: 'motorcycle',
    name: '',
    description: '',
    price_per_day: '',
    available: true,
    specifications: {},
    images: [],
  });

  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchVehicle = useCallback(async () => {
    if (!vehicleId) return;

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single<VehicleRow>();

    if (error) {
      console.error('Error fetching vehicle:', error);
      alert('Failed to load vehicle');
      router.push('/admin/vehicles');
    } else if (data) {
      const vehicle = data;

      const specs = vehicle.specifications
        ? Object.entries(vehicle.specifications as Record<string, unknown>).reduce<Record<string, string>>(
              (acc, [key, value]) => {
                acc[String(key)] = String(value ?? '');
                return acc;
              },
              {}
            )
        : {};

      const images = Array.isArray(vehicle.images) ? vehicle.images : [];

      const vehicleType: VehicleType =
        vehicle.type === 'motorcycle' || vehicle.type === 'utv' || vehicle.type === 'guided_tour'
          ? vehicle.type
          : 'motorcycle';

      setFormData({
        type: vehicleType,
        name: vehicle.name,
        description: vehicle.description || '',
        price_per_day: Number(vehicle.price_per_day ?? 0).toString(),
        available: vehicle.available,
        specifications: specs,
        images,
      });
    }
  }, [router, vehicleId]);

  useEffect(() => {
    if (vehicleId) {
      void fetchVehicle();
    }
  }, [fetchVehicle, vehicleId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const pricePerDay = Number.parseFloat(formData.price_per_day);
    const specifications = Object.keys(formData.specifications).length > 0 ? formData.specifications : null;

    const vehicleData: VehicleInsert = {
      type: formData.type,
      name: formData.name,
      description: formData.description,
      price_per_day: Number.isFinite(pricePerDay) ? pricePerDay : 0,
      available: formData.available,
      specifications,
      images:
        formData.images.length > 0
          ? formData.images
          : [getVehiclePlaceholderImage(formData.type)],
    };

    let error;
    if (vehicleId) {
      // Update existing vehicle
      const { error: updateError } = await supabase
        .from('vehicles')
        .update(vehicleData as never)
        .eq('id', vehicleId);
      error = updateError;
    } else {
      // Create new vehicle
      const { error: insertError } = await supabase
        .from('vehicles')
        .insert([vehicleData] as never);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      console.error('Error saving vehicle:', error);
      alert(`Failed to ${vehicleId ? 'update' : 'create'} vehicle: ${error.message}`);
    } else {
      router.push('/admin/vehicles');
    }
  }

  function addSpecification() {
    if (specKey && specValue) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [specKey]: specValue,
        },
      });
      setSpecKey('');
      setSpecValue('');
    }
  }

  function removeSpecification(key: string) {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({ ...formData, specifications: newSpecs });
  }

  function addImage() {
    const value = imageUrl.trim();
    if (!value) return;
    if (formData.images.includes(value)) {
      setImageUrl('');
      return;
    }
    setFormData({
      ...formData,
      images: [...formData.images, value],
    });
    setImageUrl('');
  }

  function removeImage(url: string) {
    setFormData({
      ...formData,
      images: formData.images.filter((image) => image !== url),
    });
  }

  function useDefaultImage() {
    const placeholder = getVehiclePlaceholderImage(formData.type);
    if (!formData.images.includes(placeholder)) {
      setFormData({
        ...formData,
        images: [...formData.images, placeholder],
      });
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pine-700 mb-2">
          {vehicleId ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h1>
        <p className="text-rock-600">
          {vehicleId ? 'Update vehicle information' : 'Add a new vehicle to your fleet'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-pine-700 mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-rock-600 mb-2">
                Vehicle Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="motorcycle">🏍️ Motorcycle</option>
                <option value="utv">🚛 UTV</option>
                <option value="guided_tour">🗺️ Guided Tour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-rock-600 mb-2">
                Vehicle Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Yamaha MT-07"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rock-600 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
                placeholder="Describe the vehicle features, capabilities, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rock-600 mb-2">
                Price Per Day ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="85.00"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="available" className="text-sm font-medium text-rock-600">
                Available for rental
              </label>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-pine-700 mb-4">Specifications</h2>
          
          <div className="mb-4">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Key (e.g., engine, power, weight)"
              />
              <input
                type="text"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Value (e.g., 689cc, 75hp, 184kg)"
              />
              <button
                type="button"
                onClick={addSpecification}
                className="px-6 py-2 bg-pine-700 text-white rounded-lg hover:bg-pine-800 transition-colors font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {Object.keys(formData.specifications).length > 0 && (
            <div className="space-y-2">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                  <div>
                    <span className="font-medium text-pine-700">{key}:</span>{' '}
                    <span className="text-rock-600">{value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {Object.keys(formData.specifications).length === 0 && (
            <p className="text-sm text-rock-600 text-center py-4">
              No specifications added yet
            </p>
          )}
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-pine-700 mb-4">Media</h2>

          <p className="text-sm text-rock-600 mb-3">
            Add hosted image URLs for this vehicle or use our default showcase shot. Images display on listings and admin dashboards.
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/vehicle.jpg"
              className="flex-1 min-w-[240px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addImage}
              className="px-6 py-2 bg-pine-700 text-white rounded-lg hover:bg-pine-800 transition-colors font-medium"
            >
              Add Image
            </button>
            <button
              type="button"
              onClick={useDefaultImage}
              className="px-6 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
            >
              Use Default {formData.type === 'guided_tour' ? 'Tour' : formData.type === 'motorcycle' ? 'Motorcycle' : 'UTV'} Shot
            </button>
          </div>

          {formData.images.length === 0 ? (
            <div className="text-sm text-rock-600 bg-sand-50 border border-sand-200 rounded-lg px-4 py-6 text-center">
              No images added yet. We&apos;ll automatically fall back to a curated placeholder when you save.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {formData.images.map((url) => (
                <div key={url} className="relative group rounded-xl overflow-hidden border border-sand-200">
                  <Image
                    src={url}
                    alt={formData.name || 'Vehicle image'}
                    width={320}
                    height={160}
                    className="h-40 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-2 right-2 hidden group-hover:inline-flex items-center gap-1 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded"
                  >
                    ✕ Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : vehicleId ? 'Update Vehicle' : 'Create Vehicle'}
          </button>
          <Link
            href="/admin/vehicles"
            className="btn-secondary flex-1 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
