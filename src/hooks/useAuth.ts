import { useMutation } from "@tanstack/react-query";
import { sendEmailOtp, verifyOtp, login } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

// Hook to send OTP email
export const useSendOtp = () => {
  return useMutation({
    mutationFn: sendEmailOtp,
  });
};

// Hook to verify OTP and create account
export const useVerifyOtp = () => {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      // Set user and token in auth store
      setUser(data.user, data.token);

      // Redirect to dashboard
      router.push("/dashboard");
    },
  });
};

// Hook to login
export const useLogin = () => {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Set user and token in auth store
      setUser(data.user, data.token);

      // Redirect to dashboard
      router.push("/dashboard");
    },
  });
};

// Hook to logout
export const useLogout = () => {
  const { logout } = useAuthStore();
  const router = useRouter();

  return () => {
    logout();
    router.push("/auth/signin");
  };
};
