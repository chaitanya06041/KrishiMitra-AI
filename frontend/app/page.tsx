"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, Bot, Image as ImageIcon, TrendingUp, MapPin, Sparkles } from 'lucide-react';
import Login from '@/components/landing-page/Login';
import Signup from '@/components/landing-page/Signup';
import ProfileSetup from '@/components/landing-page/ProfileSetup';import { createClient } from '@/lib/supabase/client';
import { toast } from "sonner";

type AuthView = 'none' | 'login' | 'signup' | 'profile-setup';

interface BubbleStyle {
  width: string;
  height: string;
  left: string;
  top: string;
  animation: string;
  animationDelay: string;
  filter: string;
}

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [authView, setAuthView] = useState<AuthView>('none');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to false until checked
  const [bubbleStyles, setBubbleStyles] = useState<BubbleStyle[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Generate bubble styles only on the client-side after initial mount
    const styles = Array.from({ length: 20 }, () => ({
      width: `${Math.random() * 300 + 50}px`,
      height: `${Math.random() * 300 + 50}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
      animationDelay: `${Math.random() * 5}s`,
      filter: 'blur(40px)',
    }));
    setBubbleStyles(styles);
  }, []);

  useEffect(() => {
    // Check auth status on the client
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      setAuthView('login');
    }
  };

  const handleSignupSuccess = () => {
    setAuthView('profile-setup');
  };

  const handleLoginSuccess = () => {
    setAuthView('none');
    toast.success("Logged in successfully");
    router.push('/dashboard');
  };

  const handleProfileComplete = () => {
    setAuthView('none');
    toast.success("Signed up successfully");
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              transform: `translateY(${scrollY * 0.5}px)`,
            }}
          >
            {bubbleStyles.map((style, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-green-400"
                style={style}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div
            className="opacity-0 animate-fadeInUp"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Smart Agriculture Platform
            </div>
          </div>

          <h1
            className="text-6xl md:text-8xl font-bold mb-6 opacity-0 animate-fadeInUp"
            style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
          >
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              KrushiMitra
            </span>
          </h1>

          <p
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto opacity-0 animate-fadeInUp"
            style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
          >
            Your intelligent farming companion. Predict diseases, optimize yields, and get expert recommendations powered by AI.
          </p>

          <div
            className="flex flex-wrap gap-4 justify-center opacity-0 animate-fadeInUp"
            style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
          >
            <button
              onClick={handleGetStarted}
              className="bg-green-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
            <button className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-green-600">
              Learn More
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-green-600 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-green-600 rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div
            className="text-center mb-20 transition-all duration-1000"
            style={{
              opacity: scrollY > 300 ? 1 : 0,
              transform: `translateY(${scrollY > 300 ? 0 : 50}px)`,
            }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to make informed farming decisions
            </p>
          </div>

          {/* Feature 1 - Disease Prediction */}
          <div
            className="mb-32 transition-all duration-1000"
            style={{
              opacity: scrollY > 500 ? 1 : 0,
              transform: `translateX(${scrollY > 500 ? 0 : -100}px)`,
            }}
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-12 rounded-3xl aspect-square flex items-center justify-center">
                  <ImageIcon className="w-32 h-32 text-green-600" strokeWidth={1.5} />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <ImageIcon className="w-4 h-4" />
                  AI-Powered Analysis
                </div>
                <h3 className="text-4xl font-bold mb-6">Crop Disease Prediction</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Upload images of your crops and get instant disease detection with precise recommendations for fertilizers and pesticides. Protect your yield with intelligent insights.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Instant disease identification
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Customized treatment plans
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Fertilizer & pesticide recommendations
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 2 - Chatbot */}
          <div
            className="mb-32 transition-all duration-1000"
            style={{
              opacity: scrollY > 1000 ? 1 : 0,
              transform: `translateX(${scrollY > 1000 ? 0 : 100}px)`,
            }}
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Bot className="w-4 h-4" />
                  AI Assistant
                </div>
                <h3 className="text-4xl font-bold mb-6">Intelligent Chatbot</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Your 24/7 farming expert ready to help with predictions, recommendations, and answers to all your agricultural questions.
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border-l-4 border-green-600">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Yield Prediction</h4>
                        <p className="text-sm text-gray-600">
                          Get accurate yield forecasts using soil NPK values, rainfall, and area data
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border-l-4 border-emerald-600">
                    <div className="flex items-start gap-3">
                      <Sprout className="w-5 h-5 text-emerald-600 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Crop Recommendation</h4>
                        <p className="text-sm text-gray-600">
                          Discover the best crops for your soil conditions and maximize profitability
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border-l-4 border-teal-600">
                    <div className="flex items-start gap-3">
                      <Bot className="w-5 h-5 text-teal-600 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Expert Q&A</h4>
                        <p className="text-sm text-gray-600">
                          Ask any farming question and get instant, reliable answers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-gradient-to-br from-blue-100 to-teal-100 p-12 rounded-3xl aspect-square flex items-center justify-center">
                  <Bot className="w-32 h-32 text-blue-600" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 - Location-Based */}
          <div
            className="transition-all duration-1000"
            style={{
              opacity: scrollY > 1500 ? 1 : 0,
              transform: `translateY(${scrollY > 1500 ? 0 : 100}px)`,
            }}
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-12 md:p-16 rounded-3xl">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <MapPin className="w-4 h-4" />
                  Location Intelligence
                </div>
                <h3 className="text-4xl font-bold mb-6">Don't Have Soil Data?</h3>
                <p className="text-lg text-gray-600 mb-8">
                  No problem! Get predictions and recommendations using just your location details. Our AI uses regional data including district, state, and area to provide accurate insights.
                </p>
                <div className="inline-flex items-center gap-8 justify-center flex-wrap">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <MapPin className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-semibold">Location-Based</p>
                  </div>
                  <div className="text-2xl text-green-600">→</div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-semibold">Smart Predictions</p>
                  </div>
                  <div className="text-2xl text-green-600">→</div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Sprout className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-semibold">Better Yields</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-32 px-6 relative overflow-hidden"
        style={{
          opacity: scrollY > 2000 ? 1 : 0,
          transform: `translateY(${scrollY > 2000 ? 0 : 50}px)`,
          transition: 'all 1s',
        }}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of farmers already using KrushiMitra
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-green-600 text-white px-12 py-5 rounded-full font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg"
          >
            Start Your Journey
          </button>
        </div>
      </section>

      {/* ... Footer ... */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sprout className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold">KrushiMitra</span>
          </div>
          <p className="text-gray-400">
            Empowering farmers with intelligent agriculture solutions
          </p>
        </div>
      </footer>

      {/* Modals */}
      {authView === 'login' && (
        <Login
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setAuthView('signup')}
          onClose={() => setAuthView('none')}
        />
      )}

      {authView === 'signup' && (
        <Signup
          onSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setAuthView('login')}
          onClose={() => setAuthView('none')}
        />
      )}

      {authView === 'profile-setup' && (
        <ProfileSetup
          onComplete={handleProfileComplete}
          onSkip={handleProfileComplete}
        />
      )}
    </div>
  );
}