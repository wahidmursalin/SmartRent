const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm">
        <p className="font-semibold text-white mb-1">🏠 Smart Rent</p>
        <p>Find your perfect rental home, hassle-free.</p>
        <p className="mt-4 text-gray-500">
          © {new Date().getFullYear()} Smart Rent. Built with React, Express & MongoDB.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
