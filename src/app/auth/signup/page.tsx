"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { sendEmailOtp, verifyOtp } from "@/lib/api";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Zod validation schemas
const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Please enter a valid email address",
    }),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: "Please enter a valid email address",
      }),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^\w+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be less than 50 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Page = () => {
  const router = useRouter();

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Handle input changes with real-time validation
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(""); // Clear errors when user starts typing

    // Real-time validation for specific fields
    try {
      if (field === "email") {
        emailSchema.parse({ email: value });
      } else if (field === "otp") {
        otpSchema.parse({ otp: value });
      } else if (field === "confirmPassword" && formData.password) {
        if (value !== formData.password) {
          setError("Passwords do not match");
        }
      }
    } catch (error: any) {
      if (error instanceof z.ZodError && value.length > 0) {
        // Only show validation errors if the field has content
        setError(error.issues[0].message);
      }
    }
  };

  // Step 1: Send OTP with Zod validation
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate email using Zod
      const validatedData = emailSchema.parse({ email: formData.email });

      setLoading(true);
      setError("");

      const response = await sendEmailOtp(validatedData.email);

      if (response.message === "User already exists") {
        setError("User already exists. Please try logging in instead.");
        return;
      }

      if (response.message === "OTP sent successfully") {
        setSuccess("OTP sent successfully! Please check your email.");
        setCurrentStep(2);
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        setError(error.issues[0].message);
      } else {
        console.error("Error sending OTP:", error);
        setError(
          error.response?.data?.message ||
            "Failed to send OTP. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and create account with Zod validation
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate all fields using Zod
      const validatedData = signupSchema.parse({
        email: formData.email,
        otp: formData.otp,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setLoading(true);
      setError("");

      const response = await verifyOtp({
        email: validatedData.email,
        otp: validatedData.otp,
        username: validatedData.username,
        password: validatedData.password,
      });

      if (response.message === "User verified & created") {
        setSuccess("Account created successfully! Redirecting to login...");

        // Store the token if provided
        if (response.token) {
          localStorage.setItem(
            "auth-storage",
            JSON.stringify({
              state: {
                token: response.token,
                user: response.user,
              },
            })
          );

          // Redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          // Redirect to login
          setTimeout(() => {
            router.push("/auth/signin");
          }, 2000);
        }
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        setError(error.issues[0].message);
      } else {
        console.error("Error verifying OTP:", error);
        setError(
          error.response?.data?.error ||
            "Failed to verify OTP. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            Sign Up - Step {currentStep} of 2
          </CardTitle>
          <p className="text-sm text-gray-600">
            {currentStep === 1
              ? "Enter your email to get started"
              : "Verify your email and create your account"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error and Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Step 1: Email Input */}
          {currentStep === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  We'll send a 6-digit verification code to this email
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>

              <p className="text-xs text-center text-gray-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/auth/signin")}
                  className="text-blue-600 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Step 2: OTP Verification and Account Details */}
          {currentStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={(e) =>
                    handleInputChange(
                      "otp",
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  disabled={loading}
                  className="w-full text-center tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500">
                  OTP sent to: {formData.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Minimum 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCurrentStep(1);
                    setError("");
                    setSuccess("");
                  }}
                  disabled={loading}
                >
                  Back to Email
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
