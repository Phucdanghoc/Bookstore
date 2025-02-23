export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} BookStore. All rights reserved.</p>
                <div className="mt-2 space-x-4">
                    <a href="#" className="hover:underline">Chính sách bảo mật</a>
                    <a href="#" className="hover:underline">Điều khoản sử dụng</a>
                </div>
            </div>
        </footer>
    );
}