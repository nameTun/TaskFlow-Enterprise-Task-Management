import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, Typography, Tabs, message, theme } from "antd";
import { useAuth } from "../context/Auth/Auth.context";
import { CheckSquare, Mail, Lock, User } from "lucide-react";

const { Title, Text } = Typography;

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  const { token } = theme.useToken();

  // Lấy trang trước đó user muốn vào, nếu không có thì về trang chủ
  const from = location.state?.from?.pathname || "/";

  // Nếu user đã login rồi thì đá về Dashboard ngay lập tức
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    /* global google */
    const renderGoogleButton = () => {
      if (!GOOGLE_CLIENT_ID) {
        console.error("Thiếu VITE_GOOGLE_CLIENT_ID trong file .env");
        return;
      }

      if (window.google && window.google.accounts) {
        try {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
          });

          const btnDiv = document.getElementById("googleSignInDiv");
          if (btnDiv) {
            google.accounts.id.renderButton(btnDiv, {
              theme: "outline",
              size: "large",
              width: "100%",
              logo_alignment: "center",
              text: "continue_with",
            });
          }
        } catch (e) {
          console.error("Lỗi khởi tạo Google Sign-in:", e);
        }
      }
    };

    const intervalId = setInterval(() => {
      if (window.google) {
        renderGoogleButton();
        clearInterval(intervalId);
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [GOOGLE_CLIENT_ID, activeTab]);

  const handleGoogleCallback = async (response) => {
    try {
      await loginWithGoogle(response.credential);
      message.success("Đăng nhập Google thành công!");
      // Navigate về trang trước đó hoặc trang chủ
      navigate(from, { replace: true });
    } catch (error) {
      message.error(error.message || "Đăng nhập Google thất bại");
    }
  };

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      if (activeTab === "login") {
        const user = await login(values.email, values.password);
        message.success(`Chào mừng ${user.name} trở lại!`);
        // Navigate về trang trước đó hoặc trang chủ
        navigate("/");
      } else {
        await register(values.name, values.email, values.password);
        message.success("Đăng ký thành công!");
        navigate(from, { replace: true });
      }
    } catch (err) {
      message.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const items = [
    { key: "login", label: "Đăng Nhập" },
    { key: "register", label: "Đăng Ký" },
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#000]">
      {/* Left Side - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-600 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1574&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "overlay",
            opacity: 0.2,
          }}
        ></div>

        <div className="relative z-10 text-white px-12 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <CheckSquare size={64} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-6">
            Enterprise Task Management
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed max-w-lg mx-auto">
            Quản lý công việc hiệu quả, cộng tác nhóm liền mạch và nâng cao năng
            suất với nền tảng Enterprise chuẩn mực.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background-light dark:bg-[#141414]">
        <div className="w-full max-w-[440px] space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 lg:hidden">
              <CheckSquare size={28} className="text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                TaskFlow
              </span>
            </div>
            <Title level={2} className="!mb-2 !text-gray-900 dark:!text-white">
              {activeTab === "login" ? "Chào mừng trở lại" : "Tạo tài khoản"}
            </Title>
            <Text type="secondary">
              {activeTab === "login"
                ? "Nhập thông tin xác thực để truy cập."
                : "Đăng ký miễn phí để bắt đầu quản lý công việc."}
            </Text>
          </div>

          <div className="bg-white dark:bg-[#1f1f1f] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={items}
              centered
              size="large"
              className="mb-6"
            />

            <Form
              form={form}
              name="auth_form"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
              requiredMark={false}
            >
              {activeTab === "register" && (
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                >
                  <Input
                    prefix={<User size={18} className="text-gray-400" />}
                    placeholder="Họ và tên đầy đủ"
                  />
                </Form.Item>
              )}

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  prefix={<Mail size={18} className="text-gray-400" />}
                  placeholder="Email công việc"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<Lock size={18} className="text-gray-400" />}
                  placeholder="Mật khẩu"
                />
              </Form.Item>

              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={isLoading}
                  size="large"
                  className="h-11 font-medium bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 border-none"
                >
                  {activeTab === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
                </Button>
              </Form.Item>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-700"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-[#1f1f1f] px-2 text-gray-500">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="w-full min-h-[44px] flex justify-center items-center">
              <div id="googleSignInDiv" className="w-full flex justify-center">
                {!GOOGLE_CLIENT_ID && (
                  <span className="text-red-500 text-xs">
                    Chưa cấu hình Google Client ID
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            &copy; 2024 Enterprise Task System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
