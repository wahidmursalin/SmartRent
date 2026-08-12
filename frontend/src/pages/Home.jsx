import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  Users,
  Lock,
  Clock4,
  Building2,
  Home as HomeIcon,
  BedDouble,
  UsersRound,
  Filter as FilterIcon,
  ChevronDown,
  ArrowRight,
  Star,
  UserPlus,
  Send,
  Mail,
  Sparkles,
} from "lucide-react";
import HouseCard from "../components/HouseCard";
import Loading from "../components/Loading";
import * as api from "../services/api";

const CATEGORIES = [
  { label: "Apartment", icon: Building2, value: "Apartment" },
  { label: "House", icon: HomeIcon, value: "House" },
  { label: "Room", icon: BedDouble, value: "Room" },
  { label: "Sublet", icon: UsersRound, value: "" },
];

// These are fixed sample listings that always appear on the home page
// (e.g. to avoid an empty-looking page before real landlords add houses).
// They are NOT saved in MongoDB and can't be opened as a real house details
// page, so their "Details" button links to the browse page instead.
const DEMO_HOUSES = [
  {
    _id: "demo-1",
    isDemo: true,
    title: "Modern 3 Bedroom Apartment",
    location: { area: "Uttara", city: "Dhaka" },
    rent: 25000,
    bedrooms: 3,
    bathrooms: 2,
    available: true,
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=60"],
  },
  {
    _id: "demo-2",
    isDemo: true,
    title: "Cozy Single Room",
    location: { area: "Mirpur", city: "Dhaka" },
    rent: 8000,
    bedrooms: 1,
    bathrooms: 1,
    available: true,
    images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&q=60"],
  },
  {
    _id: "demo-3",
    isDemo: true,
    title: "Family Flat Near School",
    location: { area: "Dhanmondi", city: "Dhaka" },
    rent: 30000,
    bedrooms: 3,
    bathrooms: 2,
    available: false,
    images: ["https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=500&q=60"],
  },
  {
    _id: "demo-4",
    isDemo: true,
    title: "Luxury Apartment",
    location: { area: "Bashundhara R/A", city: "Dhaka" },
    rent: 28000,
    bedrooms: 3,
    bathrooms: 2,
    available: true,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&q=60"],
  },
];

const FEATURES = [
  { icon: ShieldCheck, label: "Verified Listings" },
  { icon: Users, label: "Trusted Landlords" },
  { icon: Lock, label: "Secure Booking" },
  { icon: Clock4, label: "24/7 Support" },
];

const STEPS = [
  {
    title: "Create Account",
    desc: "Register as Tenant or Landlord",
    icon: UserPlus,
  },
  {
    title: "Browse & Search",
    desc: "Find the perfect home",
    icon: Search,
  },
  {
    title: "Book / Manage",
    desc: "Send request & track status",
    icon: Send,
  },
];

const TESTIMONIALS = [
  {
    name: "Karim Ahmed",
    role: "Tenant",
    quote: "Smart Rent made it so easy to find my new apartment. Very reliable!",
  },
  {
    name: "Nadia Rahman",
    role: "Landlord",
    quote: "I can easily manage my rental homes and get booking requests online. Great platform!",
  },
];

// Visually matches HouseCard but is clearly labeled "Demo" and its Details
// button goes to the browse page (a demo house has no real detail page in the DB).
const DemoHouseCard = ({ house }) => (
  <Link
    to="/houses"
    className="bg-white rounded-xl shadow-sm border border-dashed border-brand-200 overflow-hidden hover:shadow-lg transition-shadow block"
  >
    <div className="relative">
      <img src={house.images[0]} alt={house.title} className="w-full h-44 object-cover" />
      <span className="absolute top-2 left-2 bg-brand-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
        <Sparkles size={11} /> Demo
      </span>
      {!house.available && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          Rented
        </span>
      )}
    </div>

    <div className="p-4">
      <h3 className="font-semibold text-gray-800 truncate">{house.title}</h3>
      <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
        📍 {house.location.area}, {house.location.city}
      </p>
      <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
        <span>🛏 {house.bedrooms}</span>
        <span>🚿 {house.bathrooms}</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-brand-600 font-bold">৳{house.rent.toLocaleString()}/mo</span>
        <span className="text-sm bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg">Sample</span>
      </div>
    </div>
  </Link>
);

// Fades + slides an element up into place the first time it scrolls into view.
// Pure Tailwind transition utilities — no extra CSS/config needed.
const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();

  // Hero search
  const [heroLocation, setHeroLocation] = useState("");
  const [heroMaxRent, setHeroMaxRent] = useState("");

  // Quick filter bar
  const [qLocation, setQLocation] = useState("");
  const [qPropertyType, setQPropertyType] = useState("");
  const [qMinRent, setQMinRent] = useState("");
  const [qMaxRent, setQMaxRent] = useState("");
  const [qBedrooms, setQBedrooms] = useState("");

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Newsletter
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.getHouses();
        setHouses(data.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const goToHouses = (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    navigate(`/houses?${query.toString()}`);
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    goToHouses({ location: heroLocation, maxRent: heroMaxRent });
  };

  const handleQuickFilter = () => {
    goToHouses({
      location: qLocation,
      propertyType: qPropertyType,
      minRent: qMinRent,
      maxRent: qMaxRent,
      bedrooms: qBedrooms,
    });
  };

  const handleCategoryClick = (value) => {
    goToHouses({ propertyType: value });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <div className="relative bg-brand-700 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=70"
            alt="Modern home at dusk"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-700/95 via-brand-700/80 to-brand-700/30" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="flex items-center gap-2 text-amber-300 mb-3">
            <HomeIcon size={28} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">Smart Rent</h1>
          <p className="text-brand-100 text-lg mb-1">Find Your Perfect Home</p>
          <p className="text-brand-200 text-sm mb-8">Rent a home. Live better.</p>

          <form
            onSubmit={handleHeroSearch}
            className="bg-white rounded-xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 max-w-2xl"
          >
            <input
              type="text"
              placeholder="Location (e.g., Uttara)"
              value={heroLocation}
              onChange={(e) => setHeroLocation(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="number"
              placeholder="Max Rent"
              value={heroMaxRent}
              onChange={(e) => setHeroMaxRent(e.target.value)}
              className="w-full sm:w-36 px-4 py-2.5 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Search size={16} /> Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-sm text-brand-100">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} /> Verified Listings
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={16} /> Trusted Landlords
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={16} /> Safe &amp; Secure
            </span>
          </div>
        </div>
      </div>

      {/* ---------------- Quick Filter bar ---------------- */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 -mt-6 relative z-10 p-3 flex flex-wrap items-center gap-2">
          <SelectPill
            icon={Building2}
            value={qPropertyType}
            onChange={setQPropertyType}
            placeholder="All Types"
            options={[
              { value: "", label: "All Types" },
              { value: "Apartment", label: "Apartment" },
              { value: "House", label: "House" },
              { value: "Studio", label: "Studio" },
              { value: "Duplex", label: "Duplex" },
              { value: "Room", label: "Room" },
            ]}
          />

          <input
            type="text"
            placeholder="Location"
            value={qLocation}
            onChange={(e) => setQLocation(e.target.value)}
            className="flex-1 min-w-[120px] border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <input
            type="number"
            placeholder="Min Rent"
            value={qMinRent}
            onChange={(e) => setQMinRent(e.target.value)}
            className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <input
            type="number"
            placeholder="Max Rent"
            value={qMaxRent}
            onChange={(e) => setQMaxRent(e.target.value)}
            className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <SelectPill
            icon={BedDouble}
            value={qBedrooms}
            onChange={setQBedrooms}
            placeholder="Bedrooms"
            options={[
              { value: "", label: "Bedrooms" },
              { value: "1", label: "1 Bed" },
              { value: "2", label: "2 Beds" },
              { value: "3", label: "3 Beds" },
              { value: "4", label: "4+ Beds" },
            ]}
          />

          <button
            onClick={handleQuickFilter}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 flex items-center gap-1.5"
          >
            <FilterIcon size={15} /> Filter
          </button>
        </div>
      </div>

      {/* ---------------- Featured Houses ---------------- */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Featured Houses</h2>
          <Link to="/houses" className="text-brand-600 text-sm font-medium flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEMO_HOUSES.map((house) => (
              <DemoHouseCard key={house._id} house={house} />
            ))}
            {houses.map((house) => (
              <HouseCard key={house._id} house={house} />
            ))}
          </div>
        )}
      </div>

      {/* ---------------- Categories + Why Choose Us ---------------- */}
      <div className="max-w-6xl mx-auto px-4 pb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Reveal className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-5">Popular Categories</h3>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map(({ label, icon: Icon, value }, i) => (
              <button
                key={label}
                onClick={() => handleCategoryClick(value)}
                className="flex flex-col items-center gap-2 group"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <span className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center transition-all duration-300 ease-out group-hover:bg-brand-600 group-hover:text-white group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-brand-200 group-active:scale-95">
                  <Icon size={22} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
                </span>
                <span className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-brand-600">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120} className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-5">Why Choose Smart Rent?</h3>
          <div className="grid grid-cols-4 gap-3">
            {FEATURES.map(({ label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center group cursor-default">
                <span className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center transition-all duration-300 ease-out group-hover:bg-brand-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-brand-200">
                  <Icon size={22} />
                </span>
                <span className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-brand-600">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ---------------- How It Works ---------------- */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <Reveal className="bg-brand-50 rounded-xl border border-brand-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-1">How It Works</h3>
          <p className="text-sm text-gray-500 mb-6">Renting a home is simple with Smart Rent.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map(({ title, desc, icon: Icon }, i) => (
              <Reveal key={title} delay={i * 150} className="flex items-start gap-3 group">
                <span className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-brand-300">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {i + 1}. {title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ---------------- Testimonials ---------------- */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-1.5">
          <Star size={16} className="text-amber-400 fill-amber-400" /> What Our Users Say
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 150}
              className="bg-white rounded-xl border border-gray-100 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-100"
            >
              <div className="flex text-amber-400 mb-2">
                {Array.from({ length: 5 }).map((_, starIdx) => (
                  <Star
                    key={starIdx}
                    size={14}
                    className="fill-amber-400 transition-transform duration-200"
                    style={{ transitionDelay: `${starIdx * 40}ms` }}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 italic mb-3">"{t.quote}"</p>
              <p className="text-sm font-medium text-gray-800">
                {t.name} <span className="text-gray-400 font-normal">· {t.role}</span>
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ---------------- Newsletter ---------------- */}
      <div className="bg-brand-700">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <Mail size={20} />
            <div>
              <p className="font-semibold">Stay Updated</p>
              <p className="text-brand-200 text-sm">Get new listings sent directly to your inbox.</p>
            </div>
          </div>

          {subscribed ? (
            <p className="text-white text-sm font-medium">Thanks for subscribing! 🎉</p>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 sm:w-64 px-4 py-2.5 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <button
                type="submit"
                className="bg-white text-brand-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-50 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Small reusable dropdown pill used in the quick filter bar
const SelectPill = ({ icon: Icon, value, onChange, options }) => (
  <div className="relative">
    <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none border border-gray-200 rounded-lg pl-8 pr-7 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

export default Home;