import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, MapPin, CheckCircle, Navigation, Loader2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../components/common/Toast';
import { errMsg } from '../../utils/helpers';
import { COMPLAINT_CATEGORIES } from '../../constants';

// ─── Reverse geocode via Nominatim (free, no API key needed) ──────────────────
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
};

// ─── Map picker component ─────────────────────────────────────────────────────
function LocationMap({ location, onChange }) {
  const mapDivRef   = useRef(null);
  const mapRef      = useRef(null);   // Leaflet map instance
  const markerRef   = useRef(null);   // Leaflet marker instance
  const initialised = useRef(false);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError,   setGpsError]   = useState('');
  const [geocoding,  setGeocoding]  = useState(false);

  // Drop / move marker, reverse geocode, call parent onChange
  const placeMarker = useCallback(async (lat, lng) => {
    const L = window.L;
    if (!L || !mapRef.current) return;

    mapRef.current.setView([lat, lng], 16);

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Custom orange teardrop pin
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:28px;height:28px;
        background:linear-gradient(135deg,#f97316,#ea580c);
        border:3px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 3px 10px rgba(0,0,0,.4);
      "></div>`,
      iconSize:   [28, 28],
      iconAnchor: [14, 28],
    });

    markerRef.current = L.marker([lat, lng], { icon, draggable: true })
      .addTo(mapRef.current);

    // Drag to fine-tune
    markerRef.current.on('dragend', async (e) => {
      const pos = e.target.getLatLng();
      setGeocoding(true);
      const address = await reverseGeocode(pos.lat, pos.lng);
      setGeocoding(false);
      onChange({ latitude: pos.lat, longitude: pos.lng, address });
    });

    setGeocoding(true);
    const address = await reverseGeocode(lat, lng);
    setGeocoding(false);
    onChange({ latitude: lat, longitude: lng, address });
  }, [onChange]);

  // Init Leaflet once the div is mounted
  useEffect(() => {
    const L = window.L;
    if (!L || !mapDivRef.current || initialised.current) return;
    initialised.current = true;

    mapRef.current = L.map(mapDivRef.current, { zoomControl: true })
      .setView([20.5937, 78.9629], 5);   // default: India

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);

    mapRef.current.on('click', (e) => placeMarker(e.latlng.lat, e.latlng.lng));

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current  = null;
        markerRef.current = null;
        initialised.current = false;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If location is restored from state and no marker yet, show it
  useEffect(() => {
    if (location?.latitude && location?.longitude && !markerRef.current && mapRef.current) {
      placeMarker(location.latitude, location.longitude);
    }
  }, [location, placeMarker]);

  // GPS button
  const handleGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        placeMarker(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === 1
            ? 'Location access denied. Please allow location in your browser settings.'
            : 'Could not detect your location. Try clicking the map instead.'
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const clearLocation = () => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    onChange(null);
  };

  return (
    <div className="space-y-2">

      {/* GPS button + hint */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleGPS}
          disabled={gpsLoading}
          className="btn-secondary text-sm flex items-center gap-2 py-2 px-4"
        >
          {gpsLoading
            ? <Loader2 size={15} className="animate-spin" />
            : <Navigation size={15} />}
          {gpsLoading ? 'Detecting location…' : 'Use my current location'}
        </button>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          or click anywhere on the map to drop a pin · drag pin to adjust
        </span>
      </div>

      {/* GPS error */}
      {gpsError && (
        <div className="flex items-start gap-2 p-3 rounded-xl text-sm bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {gpsError}
        </div>
      )}

      {/* Leaflet map */}
      <div
        ref={mapDivRef}
        style={{
          height: 300,
          width: '100%',
          borderRadius: 16,
          border: '1px solid var(--border)',
          overflow: 'hidden',
          zIndex: 0,
          position: 'relative',
        }}
      />

      {/* Geocoding spinner */}
      {geocoding && (
        <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={12} className="animate-spin" /> Fetching address…
        </p>
      )}

      {/* Selected location card */}
      {!geocoding && location?.address && (
        <div
          className="flex items-start gap-3 p-3 rounded-xl text-sm"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
        >
          <MapPin size={16} className="mt-0.5 shrink-0 text-orange-500" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>
              Selected location
            </p>
            <p className="leading-snug" style={{ color: 'var(--text-primary)' }}>
              {location.address}
            </p>
            <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
              {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
            </p>
          </div>
          <button
            type="button"
            onClick={clearLocation}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ color: 'var(--text-muted)' }}
            title="Clear location"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* No pin yet hint */}
      {!geocoding && !location && (
        <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <MapPin size={12} /> No location selected — click the map or use GPS above
        </p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RaiseComplaint() {
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: '', description: '', category: '', customOtherLabel: '',
  });
  const [location,   setLocation]   = useState(null);
  const [images,     setImages]     = useState([]);
  const [previews,   setPreviews]   = useState([]);
  const [uploading,  setUploading]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const f = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setFieldErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim() || form.title.trim().length < 5)
      errs.title = 'Title must be at least 5 characters.';
    if (!form.description.trim() || form.description.trim().length < 10)
      errs.description = 'Description must be at least 10 characters.';
    if (!form.category)
      errs.category = 'Please select a category.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addImages = async (files) => {
    const valid = Array.from(files)
      .filter(file => file.size <= 10 * 1024 * 1024)
      .slice(0, 5 - images.length);
    if (!valid.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      valid.forEach(file => fd.append('image', file));
      const res = await api.post('/api/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages(p => [...p, ...(res.data?.urls || [])]);
      valid.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => setPreviews(p => [...p, e.target.result]);
        reader.readAsDataURL(file);
      });
    } catch {
      toast('Image upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeImg = (i) => {
    setImages(p => p.filter((_, j) => j !== i));
    setPreviews(p => p.filter((_, j) => j !== i));
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/api/user_issues', {
        title:            form.title.trim(),
        description:      form.description.trim(),
        category:         form.category,
        customOtherLabel: form.customOtherLabel.trim() || undefined,
        images,
        // Always send a location object so the backend validator is satisfied
        location: location
          ? { address: location.address, latitude: location.latitude, longitude: location.longitude }
          : { address: '', latitude: null, longitude: null },
      });
      setDone(true);
      toast('Complaint filed successfully!', 'success');
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setDone(false);
    setForm({ title: '', description: '', category: '', customOtherLabel: '' });
    setLocation(null);
    setImages([]);
    setPreviews([]);
    setFieldErrors({});
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-5 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <CheckCircle size={32} className="text-green-500" />
      </div>
      <div className="text-center">
        <h2 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>
          Complaint Filed!
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Your complaint has been submitted and will be reviewed shortly
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={resetForm} className="btn-secondary">File Another</button>
        <button onClick={() => navigate('/home/my-complaints')} className="btn-primary">
          View My Complaints
        </button>
      </div>
    </div>
  );

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>
          Raise an Issue
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Report a community problem to get it resolved
        </p>
      </div>

      <div className="card space-y-5">

        {/* Title */}
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Issue Title <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${fieldErrors.title ? 'border-red-400' : ''}`}
            placeholder="Brief title of the issue (min 5 chars)"
            value={form.title}
            onChange={f('title')}
            maxLength={200}
          />
          {fieldErrors.title
            ? <p className="text-xs text-red-500 mt-1">{fieldErrors.title}</p>
            : <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
                {form.title.length}/200
              </p>
          }
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {COMPLAINT_CATEGORIES.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setForm(p => ({ ...p, category: c.id }));
                  setFieldErrors(p => ({ ...p, category: '' }));
                }}
                className={`p-3 rounded-xl text-sm font-medium text-center transition-all border ${
                  form.category === c.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-transparent hover:border-[var(--border)]'
                }`}
                style={{
                  background: form.category === c.id ? undefined : 'var(--bg-secondary)',
                  color:      form.category === c.id ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                <span className="text-xl block mb-1">{c.icon}</span>
                <span className="text-xs">{c.label}</span>
              </button>
            ))}
          </div>
          {fieldErrors.category && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.category}</p>
          )}
          {form.category === 'other' && (
            <input
              className="input mt-2 text-sm"
              placeholder="Describe the type (e.g. fire, gas leak, flood…)"
              value={form.customOtherLabel}
              onChange={f('customOtherLabel')}
            />
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`input resize-none ${fieldErrors.description ? 'border-red-400' : ''}`}
            rows={4}
            placeholder="Describe the issue in detail — what happened, how severe, who is affected… (min 10 chars)"
            value={form.description}
            onChange={f('description')}
            maxLength={2000}
          />
          {fieldErrors.description
            ? <p className="text-xs text-red-500 mt-1">{fieldErrors.description}</p>
            : <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
                {form.description.length}/2000
              </p>
          }
        </div>

        {/* Location map */}
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
            Location{' '}
            <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
              (optional but recommended)
            </span>
          </label>
          <LocationMap location={location} onChange={setLocation} />
        </div>

        {/* Images */}
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
            Photos{' '}
            <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
              (up to 5, optional)
            </span>
          </label>
          <div
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-orange-400"
            style={{ borderColor: 'var(--border)' }}
            onClick={() => document.getElementById('img-input').click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); addImages(e.dataTransfer.files); }}
          >
            <input
              id="img-input"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => addImages(e.target.files)}
            />
            <Upload size={24} className="mx-auto mb-2 text-orange-400" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Drop images here or click to upload
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              JPG, PNG, WEBP · Max 10 MB each
            </p>
          </div>

          {uploading && (
            <p className="text-sm flex items-center gap-2 mt-2" style={{ color: 'var(--text-muted)' }}>
              <Loader2 size={14} className="animate-spin" /> Uploading images…
            </p>
          )}

          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt="" className="w-full h-16 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => removeImg(i)}
                    className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={submit}
          disabled={submitting || uploading}
          className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Submitting…' : 'Submit Complaint'}
        </button>

      </div>
    </div>
  );
}