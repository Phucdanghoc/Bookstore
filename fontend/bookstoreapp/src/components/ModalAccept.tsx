import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
};

export default function ModalAccept({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "I accept",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative ">
        <div className="flex items-center justify-between border-b pb-4 mb-4 border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 ">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 ">{children}</div>
        <div className="flex items-center mt-6 border-t pt-4 border-gray-200 dark:border-gray-600">
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
            >
              {confirmText}
            </button>
          )}
          <button
            onClick={onClose}
            className="py-2.5 px-5 ml-3 text-sm font-medium  bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
