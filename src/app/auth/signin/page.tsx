"use client";

import axios from "axios";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation"; // Import the router
import { Input } from "@/components/ui/input";

const LoginPage = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Get the setUser function from your Zustand store
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 2. Make the API call and 'await' the response
      const response = await axios.post(
        "http://localhost:4000/api/v1/auth/login", // Add http:// protocol
        { username, password }
      );

      // Assuming your backend returns an object like { user: {...}, token: "..." }
      const { user, token } = response.data;

      // 3. Call setUser to save the data to your global store
      if (user && token) {
        setUser(user, token);

        // 4. Redirect to the dashboard on successful login
        router.push("/dashboard");
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      // 5. Handle any errors that occur during the API call
      console.error("Login failed:", err);
      setError("Invalid username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleLogin();
        }
      }}
    >
      <div className="w-full max-w-xs space-y-4 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        {/* Simple text inputs, you can replace these with Shadcn Input components */}
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-black"
          disabled={isLoading}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-black"
          disabled={isLoading}
        />
        <Button onClick={handleLogin} disabled={isLoading} className="w-full">
          {isLoading ? "Logging in..." : "Login"}
        </Button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
