import { useState } from "react";
import { Lock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasNumber: false,
    hasLetter: false,
    hasSpecialChar: false,
    hasMinLength: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "newPassword") {
      // Check password requirements
      const hasNumber = /\d/.test(value);
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const hasMinLength = value.length >= 6;

      setPasswordRequirements({
        hasNumber,
        hasLetter,
        hasSpecialChar,
        hasMinLength,
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords don't match" });
      setIsSubmitting(false);
      return;
    }

    // Validate password requirements
    if (!passwordRequirements.hasMinLength) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setIsSubmitting(false);
      return;
    }

    if (
      !passwordRequirements.hasNumber ||
      !passwordRequirements.hasLetter ||
      !passwordRequirements.hasSpecialChar
    ) {
      setMessage({
        type: "error",
        text: "Password must contain at least one number, one letter, and one special character",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/users/${id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <-- Authorization header added here
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      setMessage({ type: "success", text: "Password changed successfully!" });
      setTimeout(() => navigate("/users"), 2000);
    } catch (error) {
      console.error("Password change error:", error);
      setMessage({
        type: "error",
        text: error.message || "An error occurred while changing password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm";

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-8">
        🔒 Change Password
      </h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-white font-medium shadow-md ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Old Password */}
        <div className="flex items-center gap-3">
          <Lock className="text-blue-500 w-5 h-5" />
          <input
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            placeholder="Current Password"
            className={inputClass}
            required
          />
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Lock className="text-blue-500 w-5 h-5" />
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="New Password (min 6 characters)"
              className={inputClass}
              required
              minLength="6"
            />
          </div>

          {/* Password requirements indicator */}
          <div className="grid grid-cols-2 gap-2 text-sm pl-8">
            <div className="flex items-center gap-1">
              {passwordRequirements.hasNumber ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={passwordRequirements.hasNumber ? "text-green-500" : "text-gray-500"}>
                Contains number
              </span>
            </div>
            <div className="flex items-center gap-1">
              {passwordRequirements.hasLetter ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={passwordRequirements.hasLetter ? "text-green-500" : "text-gray-500"}>
                Contains letter
              </span>
            </div>
            <div className="flex items-center gap-1">
              {passwordRequirements.hasSpecialChar ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span
                className={passwordRequirements.hasSpecialChar ? "text-green-500" : "text-gray-500"}
              >
                Contains special character
              </span>
            </div>
            <div className="flex items-center gap-1">
              {passwordRequirements.hasMinLength ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={passwordRequirements.hasMinLength ? "text-green-500" : "text-gray-500"}>
                At least 6 characters
              </span>
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex items-center gap-3">
          <Lock className="text-blue-500 w-5 h-5" />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm New Password"
            className={inputClass}
            required
            minLength="6"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Changing Password...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Change Password
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
