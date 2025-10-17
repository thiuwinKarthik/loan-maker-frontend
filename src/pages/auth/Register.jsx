import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/authApi";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // The API call returns the response data
      const response = await registerUser(formData);

      // CHECK THE RESPONSE!
      if (response.token) {
        // Real success: we got a token back
        setSuccess("✅ Registration successful! Redirecting to login...");
        // You could also store the token here if needed
        setTimeout(() => navigate("/"), 2000);
      } else {
        // It was a 200 OK response, but a logical failure
        setError(response.message || "❌ An unknown error occurred.");
      }
    } catch (err) {
      // This will now catch 409, 500, etc.
      setError(err.message || "❌ Registration failed");
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/30 to-white/10 shadow-card">
          <div className="card backdrop-blur supports-[backdrop-filter]:bg-white/85 transition-transform duration-200 hover:shadow-soft">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Create an Account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Join <span className="text-green-600 font-semibold">Loan Maker</span> today!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm mb-5">
            {success}
          </div>
        )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                name="name"
                onChange={handleChange}
                value={formData.name}
                required
                placeholder="Enter your full name"
                inputClassName="py-3.5 text-base"
              />

              <Input
                label="Email"
                type="email"
                name="email"
                onChange={handleChange}
                value={formData.email}
                required
                placeholder="Enter your email"
                inputClassName="py-3.5 text-base"
              />

              <Input
                label="Phone"
                type="tel"
                name="phone"
                onChange={handleChange}
                value={formData.phone}
                required
                placeholder="Enter your phone number"
                inputClassName="py-3.5 text-base"
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={handleChange}
                value={formData.password}
                required
                placeholder="Enter your password"
                inputClassName="py-3.5 text-base"
                trailingIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />

              <Button type="submit" className="w-full py-3 text-base hover:brightness-105" isLoading={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>

            {/* Login Link */}
            <p className="text-center text-gray-500 text-sm mt-8">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/")}
                className="text-primary-600 font-medium hover:underline cursor-pointer"
              >
                Login here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
