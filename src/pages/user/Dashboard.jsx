import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { Link } from "react-router-dom";
import Modal from "../../components/common/Modal";
import { CheckCircle, XCircle,  DollarSign, Calendar, Building, ExternalLink } from "lucide-react";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [eligibleAmount, setEligibleAmount] = useState(0);
  const [eligibilityScore, setEligibilityScore] = useState(null);
  const [recommendedOffers, setRecommendedOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoan, setModalLoan] = useState(null);
  const [modalType, setModalType] = useState(""); // "approved" | "rejected"
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const resUser = await fetch("https://loan-maker-backend-production.up.railway.app/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await resUser.json();
      setUser(userData);

      const resLoans = await fetch(
        `https://loan-maker-backend-production.up.railway.app/api/loans/applications/${userData.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const loansData = await resLoans.json();
      setLoans(loansData || []);

      // Find latest approved or rejected loan
      const sorted = [...(loansData || [])].sort((a, b) => {
        const da = a.applicationDate ? new Date(a.applicationDate).getTime() : 0;
        const db = b.applicationDate ? new Date(b.applicationDate).getTime() : 0;
        if (da !== db) return db - da;
        return (b.id || 0) - (a.id || 0);
      });

      const latest = sorted[0];
      if (latest && ["approved", "rejected"].includes(latest.status.toLowerCase())) {
        const lastKey = `last_notified_${latest.status}_${userData.id}`;
        const lastId = localStorage.getItem(lastKey);
        if (String(latest.id) !== String(lastId || "")) {
          setModalLoan(latest);
          setModalType(latest.status.toLowerCase());
          setShowModal(true);
          localStorage.setItem(lastKey, String(latest.id));
        }
      }

      // Load saved eligibility results
      const savedRaw = localStorage.getItem(`eligibility_result_${userData.id}`);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (saved.eligibility_score) setEligibilityScore(saved.eligibility_score);
        if (saved.eligible_amount) setEligibleAmount(saved.eligible_amount);
        if (saved.recommendations && saved.recommendations.length > 0) {
          setRecommendedOffers(saved.recommendations.slice(0, 5));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    const onUpdated = () => fetchData();
    window.addEventListener("eligibility-updated", onUpdated);
    const onVisibilityChange = () => {
      if (!document.hidden) fetchData();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("eligibility-updated", onUpdated);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setModalLoan(null);
    }, 300);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
        <p className="text-gray-700 text-xl font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={user.role || "USER"} />

      <div className="flex-1 overflow-auto">
        <Navbar title={`Welcome, ${user.name || "User"}`} />

        <div className="p-8 space-y-8">
          {/* Enhanced Loan Status Modal */}
          <Modal
            isOpen={showModal}
            onClose={closeModal}
            title=""
            size="md"
            footer={
              <div className="flex justify-center gap-3 mt-6">
                <button
                  className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-all duration-300 transform hover:-translate-y-1 shadow-md"
                  onClick={closeModal}
                >
                  Close
                </button>
                <Link
                  to="/loan-history"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 shadow-md"
                >
                  View Details
                </Link>
              </div>
            }
          >
            {modalLoan && (
              <div className="space-y-4 text-center p-4 md:p-6">
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  
                </button>

                {/* Animated Icon */}
                <div className="flex justify-center">
                  <div className={`relative p-2 rounded-full ${modalType === "approved" ? "bg-green-100 animate-pulse" : "bg-red-100"} transition-all duration-500`}>
                    {modalType === "approved" ? (
                      <CheckCircle className="w-20 h-20 text-green-600 animate-bounce" />
                    ) : (
                      <XCircle className="w-20 h-20 text-red-600 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Dynamic Message */}
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {modalType === "approved"
                      ? "Congratulations! 🎊"
                      : "Application Status"}
                  </h3>
                  <p className={`text-lg font-semibold ${modalType === "approved" ? "text-green-700" : "text-red-700"}`}>
                    {modalType === "approved"
                      ? "Your loan has been approved!"
                      : "Your loan application was not approved."}
                  </p>
                </div>

                {/* Loan Details Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-5 border border-blue-100 shadow-lg mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Loan Amount</p>
                        <p className="font-semibold">₹{modalLoan.loanAmount}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tenure</p>
                        <p className="font-semibold">{modalLoan.tenure} months</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Provider</p>
                        <p className="font-semibold">{modalLoan.providerName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <ExternalLink className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Application ID</p>
                        <p className="font-semibold">{modalLoan.id}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-blue-100 flex justify-center">
                    <span className={`px-4 py-2 rounded-full text-white font-medium ${modalType === "approved" ? "bg-green-500" : "bg-red-500"} shadow-md`}>
                      {modalLoan.status}
                    </span>
                  </div>
                </div>

                {/* Additional Message */}
                <div className="text-gray-600 text-sm md:text-base">
                  {modalType === "approved" ? (
                    <p>Your funds will be disbursed to your account within 2-3 business days.</p>
                  ) : (
                    <p>Don't worry! You can explore other loan options or try again later.</p>
                  )}
                </div>
              </div>
            )}
          </Modal>

          {/* Profile & Eligibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Profile</h2>
              <p className="text-lg mb-2"><strong>Name:</strong> {user.name}</p>
              <p className="text-lg mb-2"><strong>Email:</strong> {user.email}</p>
              <p className="text-lg mb-2"><strong>Phone:</strong> {user.phone}</p>
              <p className="text-lg mb-2"><strong>Role:</strong> {user.role}</p>
            </div>

            {/* Loan Offers Card */}
            <div className="bg-gradient-to-br from-green-200 via-green-300 to-green-400 p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Loan Offers</h2>
              {recommendedOffers.length === 0 ? (
                <div className="mt-4 text-gray-700">
                  <p>No eligibility test results available.</p>
                  <Link
                    to="/offers"
                    className="mt-2 inline-block text-blue-700 font-semibold hover:underline"
                  >
                    Test your eligibility to see offers
                  </Link>
                </div>
              ) : (
                <p className="text-green-700 font-semibold text-lg mt-2">
                  ✅ You have {recommendedOffers.length} recommended offers
                </p>
              )}
            </div>
          </div>

          {/* Recommended Offers */}
          {recommendedOffers.length > 0 && (
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">⭐ Recommended Offers</h2>
              <p className="text-gray-600 mb-8">Based on your recent eligibility test</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedOffers.map((offer, idx) => {
                  const uniqueGradients = [
                    "from-red-200 via-red-300 to-red-400",
                    "from-orange-200 via-orange-300 to-orange-400",
                    "from-yellow-200 via-yellow-300 to-yellow-400",
                    "from-lime-200 via-lime-300 to-lime-400",
                    "from-teal-200 via-teal-300 to-teal-400",
                    "from-cyan-200 via-cyan-300 to-cyan-400",
                    "from-fuchsia-200 via-fuchsia-300 to-fuchsia-400",
                    "from-rose-200 via-rose-300 to-rose-400",
                  ];
                  const bgClass = uniqueGradients[idx % uniqueGradients.length];

                  return (
                    <div
                      key={idx}
                      className={`border border-gray-200 rounded-2xl p-6 flex flex-col justify-between bg-gradient-to-br ${bgClass} shadow-lg transform hover:scale-105 hover:shadow-2xl transition-all duration-300`}
                    >
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800 mb-3">
                          {offer.lender || offer.bankName || `Bank ${idx + 1}`}
                        </h4>
                        <p className="text-gray-700">
                          💰 Interest Rate:{" "}
                          <span className="text-blue-700 font-bold">
                            {offer.interest_rate || offer.interestRate}%
                          </span>
                        </p>
                        {(offer.maxAmount || offer.max_amount) && (
                          <p className="mt-1 font-semibold text-gray-800">
                            Max Loan: ₹{offer.maxAmount || offer.max_amount}
                          </p>
                        )}
                      </div>
                      <Link
                        to="/apply-loan"
                        state={{ providerName: offer.bankName || offer.lender }}
                        className="mt-4 btn btn-primary text-center"
                      >
                        Apply Now
                      </Link>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <Link to="/offers" className="text-blue-700 font-semibold hover:underline">
                  Test eligibility again or see more options
                </Link>
              </div>
            </div>
          )}

          {/* CTA if no offers */}
          {recommendedOffers.length === 0 && (
            <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 p-8 rounded-2xl shadow-xl text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                Check Your Loan Eligibility
              </h2>
              <p className="text-gray-700 mb-6 text-lg">
                Test your eligibility to see personalized loan offers from our partner banks.
              </p>
              <Link to="/offers" className="btn btn-primary px-8 py-3 text-lg">
                Test Eligibility Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;