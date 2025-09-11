import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // ✅ Step 1: Login & get token
      const loginResponse = await fetch("https://loan-maker-backend-production.up.railway.app/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status}`);
      }

      const loginData = await loginResponse.json();
      const token = loginData.token;

      if (!token) {
        setError("Invalid login credentials");
        toast.error("Invalid email or password ❌");
        setIsLoading(false);
        return;
      }

      // ✅ Step 2: Save token to localStorage
      localStorage.setItem("token", token);

      // ✅ Step 3: Fetch profile
      const profileResponse = await fetch("https://loan-maker-backend-production.up.railway.app/api/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileResponse.ok) {
        throw new Error(`Profile fetch failed: ${profileResponse.status}`);
      }

      const user = await profileResponse.json();
      localStorage.setItem("user", JSON.stringify(user));
      console.log("USer role:",user.role)
      toast.success(`Welcome back, ${user.name}! 🎉`);
      // ✅ Step 4: Navigate based on role
      if (user.role === "ROLE_ADMIN") {
        navigate("/admin");
      } else if (user.role === "USER") {
        navigate("/dashboard");
      } else {
        setError("Unauthorized role");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/30 to-white/10 shadow-card">
          <div className="card backdrop-blur supports-[backdrop-filter]:bg-white/85 transition-transform duration-200 hover:shadow-soft">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold text-gray-900">Welcome back</h1>
              <p className="text-gray-500 text-sm mt-2">Sign in to your Loan Maker account</p>
            </div>

        {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
              {error}
            </div>
          )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <Button
                type="submit"
                className="w-full py-3 text-base hover:brightness-105"
                isLoading={isLoading}
                leadingIcon={!isLoading ? <LogIn size={18} /> : null}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            {/* Register Link */}
            <p className="text-center text-gray-500 text-sm mt-8">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-primary-600 font-medium hover:underline cursor-pointer"
              >
                Register
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
