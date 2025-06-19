import React, { useState /* REMOVE useEffect */ } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Users, Code,Database, Shield, Star, Sparkles } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';

const AboutUs = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const teamMembers = [
    {
      id: 1,
      name: "Hmm183",
      role: "DBA and Lead Engineer",
      contribution: "Designed and maintained the database infrastructure. Implemented data security protocols and optimized query performance for scalability.implemented authentication with login and jwtAuth. Created APIs to manage Images and Faculty verifcation for the Admin Panel",
      image: "https://i.postimg.cc/26zdxxVH/Vrishank-about-us.jpg",
      github: "https://github.com/hmm183",
      icon: Database,
      gradient: "from-amber-400 via-orange-500 to-red-500",
      specialty: "Backend APIs & Security"
    },
    {
      id: 2,
      name: "BumbleBee",
      role: "Data Visualization Specialist",
      contribution: "Developed the Responsive Search Bar and implemented the Faculty get APIs to show the faculty details with Regex and created the AboutUS page.",
      image: "https://i.postimg.cc/kGspc4JS/Vishwanath-about-us.jpg",
      github: "https://github.com/Vishwa5395",
      icon: Shield,
      gradient: "from-violet-400 via-purple-500 to-indigo-600",
      specialty: "Backend APIs & Data Visualization"
    },
    {
      id: 3,
      name: "Odd Problem",
      role: "Backend Developer",
      contribution: "Created a Post API to Add Faculty with a rate limit. Implemented a Schema to log users and the faculty they added",
      image: "https://i.postimg.cc/0jcp3qRh/Argha-about-us.jpg",
      github: "https://github.com/oddproblem",
      icon: Code,
      gradient: "from-cyan-400 via-blue-500 to-purple-600",
      specialty: "Backend & APIs"
    },
    {
      id: 4,
      name: "RS",
      role: "Frontend Developer",
      contribution: "Developed responsive Home interface using React and modern CSS. Created the home page to show the paginated results.",
      image: "https://i.postimg.cc/sxLpsdK8/Raushan-about-us.jpg",
      github: "https://github.com/RaushanShrivastwa",
      icon: Code,
      gradient: "from-emerald-400 via-teal-500 to-cyan-600",
      specialty: "Frontend & React"
    },
    {
      id: 5,
      name: "Kunal",
      role: "User Access Control Panel Specialist",
      contribution: "Designed APIs to manage user profiles by implementing a PUT request to ban and unban users.",
      image: "https://i.postimg.cc/j2BJB6SY/Kunal-about-us.jpg",
      github: "https://github.com/priyanshuu-02",
      icon: Code,
      gradient: "from-pink-400 via-rose-500 to-orange-500",
      specialty: "User Management"
    }
  ];

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Inline Navbar */}
      <div className="fixed w-full z-50 bg-slate-900/70 backdrop-blur border-b border-white/10 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/facultyList')}
            className="text-white hover:text-cyan-400 transition"
          >
            ← Back
          </button>
          <Link to="/" className="text-white hover:text-cyan-400 transition">
            Home
          </Link>
        </div>
        <div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* About Us Content */}
      <div className="min-h-screen pt-24 bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
        {/* Background Blurs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="flex justify-center mb-8 relative">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-lg opacity-60 animate-pulse"></div>
                  <div className="relative p-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full shadow-2xl">
                    <Users className="w-16 h-16 text-white" />
                  </div>
                </div>
                <Sparkles className="absolute top-2 right-2 w-6 h-6 text-yellow-400 animate-bounce" />
                <Star className="absolute bottom-2 left-2 w-5 h-5 text-pink-400 animate-ping" />
              </div>

              <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-6 tracking-tight">
                Meet Our Team
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-600 mx-auto mb-8 rounded-full"></div>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
                We are a passionate group of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 font-semibold">digital craftsmen</span> dedicated to creating exceptional experiences. Each member brings unique expertise and boundless creativity.
              </p>
            </div>

            {/* Team Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => {
                const IconComponent = member.icon;
                const isHovered = hoveredCard === member.id;

                return (
                  <div
                    key={member.id}
                    className={`group relative transform transition-all duration-700 ${isHovered ? 'scale-105 z-20' : 'hover:scale-105'}`}
                    style={{ animationDelay: `${index * 150}ms` }}
                    onMouseEnter={() => setHoveredCard(member.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-700`}></div>
                    <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50 group-hover:border-slate-600/50 transition-all duration-500 hover:shadow-cyan-500/10">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="flex justify-between items-start mb-6">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${member.gradient} text-white shadow-lg`}>
                          {member.specialty}
                        </div>
                        <div className={`p-2 rounded-full bg-gradient-to-r ${member.gradient} shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-6">
                          <div className={`absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-all duration-500 scale-110`}></div>
                          <div className="relative">
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-28 h-28 rounded-full object-cover border-4 border-slate-600 shadow-2xl group-hover:border-transparent transition-all duration-300"
                            />
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-800 animate-pulse"></div>
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-600 transition-all duration-300">
                          {member.name}
                        </h3>
                        <p className={`text-sm font-bold bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent mb-4 uppercase tracking-wider`}>
                          {member.role}
                        </p>
                      </div>

                      <div className="mb-8">
                        <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors duration-300">
                          {member.contribution}
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={() => handleSocialClick(member.github)}
                          className="relative group/btn overflow-hidden"
                          aria-label={`${member.name}'s GitHub`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full scale-0 group-hover/btn:scale-100 transition-transform duration-300"></div>
                          <div className="relative flex items-center justify-center w-14 h-14 bg-slate-700 hover:bg-transparent rounded-full transition-all duration-300 group-hover/btn:scale-110">
                            <Github className="w-6 h-6 text-gray-300 group-hover/btn:text-white transition-colors duration-300" />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .group:nth-child(1) { animation: fade-in-up 0.8s ease-out 0.1s both; }
          .group:nth-child(2) { animation: fade-in-up 0.8s ease-out 0.2s both; }
          .group:nth-child(3) { animation: fade-in-up 0.8s ease-out 0.3s both; }
          .group:nth-child(4) { animation: fade-in-up 0.8s ease-out 0.4s both; }
          .group:nth-child(5) { animation: fade-in-up 0.8s ease-out 0.5s both; }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    </>
  );
};

export default AboutUs;
