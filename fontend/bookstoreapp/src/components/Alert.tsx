import React from "react";
import { X } from "lucide-react"; // Icon đóng alert (có thể dùng Heroicons)

type AlertProps = {
  type: "info" | "danger" | "success" | "warning" | "dark";
  message: string;
  onClose: () => void;
};

const alertStyles = {
  info: "text-blue-800 border-blue-300 bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800",
  danger: "text-red-800 border-red-300 bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800",
  success: "text-green-800 border-green-300 bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800",
  warning: "text-yellow-800 border-yellow-300 bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800",
  dark: "text-gray-800 border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
};

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  
  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 flex items-center p-4 mb-4 text-sm border rounded-lg shadow-md ${alertStyles[type]} z-10`}
      role="alert"
    >
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 text-lg">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Alert;
