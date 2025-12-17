
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import ClusterVisualizer3D from "./App.tsx";
// import './src/index.css'
import './index.css'
const App = () => {
  const [activeTab, setActiveTab] = useState("research");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  // New States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [projectViewMode, setProjectViewMode] = useState<'details' | 'demo'>('details');

  const projects = [
    {
      id: "01",
      title: "Cluster Visualizer 3D",
      category: "Global heat mapping",
      year: "2024-present",
      description: "A 3D exploration of high-dimensional data clusters using PCA and K-Means.",
      tech: ["Python", "Three.js", "React"],
      hasDemo: true, // ✅ 关键
      component: <ClusterVisualizer3D />,
      details: {
        abstract: "An interactive 3D visualization tool that enables users to explore clustered high-dimensional datasets. By applying PCA for dimensionality reduction and K-Means for clustering, the project visualizes complex data patterns in an intuitive manner.",
        challenge: "compressed 223 cities in global data and revel the pattern from window period of time-series data from 2017 to 2019 with both day and night time data",
        solution: "Implemented PCA to reduce dimensions while preserving variance, and K-Means to identify clusters. Leveraged Three.js for rendering and React for UI management, ensuring smooth interactivity and performance."
      }
      

    }
    // ,
    // {
    //   id: "02",
    //   title: "Design System 2.0",
    //   category: "UI Architecture",
    //   year: "2023",
    //   description: "Comprehensive component library focusing on accessibility and strict typing.",
    //   tech: ["TypeScript", "Figma", "Storybook"],
    //   details: {
    //     abstract: "A centralized design language system constructed to unify the visual identity across 12 different product lines. Focusing on AA compliance for accessibility and developer ergonomics.",
    //     challenge: "Balancing flexibility for designers with strict type-safety for developers.",
    //     solution: "Created a 'Theme Token' engine that generates type definitions automatically from Figma variables."
    //   }
    // },
    // {
    //   id: "03",
    //   title: "Urban Data Index",
    //   category: "Data Analysis",
    //   year: "2023",
    //   description: "Visualizing metropolitan traffic patterns via public datasets.",
    //   tech: ["D3.js", "Next.js"],
    //   details: {
    //     abstract: "An analytical dashboard visualizing 24-hour traffic flow in metropolitan areas using open government data APIs.",
    //     challenge: "Normalizing inconsistent data formats from legacy government endpoints.",
    //     solution: "Built a server-side ETL pipeline in Next.js to cache and standardize data before serving it to the D3 visualization layer."
    //   }
    // }
  ];


  // Handler for tab switching - resets selection
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedProject(null);
    setProjectViewMode('details');
  };

  const handleProjectSelect = (project: any) => {
    setSelectedProject(project);
    setProjectViewMode('details'); // Reset to details view when opening a project
  };

  return (
    <div className="min-h-screen p-0 md:p-0 bg-neutral-100 flex justify-center items-center h-screen overflow-hidden">

      <div className="w-full max-w-10xl h-[100vh] bg-white border border-neutral-10 shadow-xl flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <header className="border-b border-neutral-200 p-4 flex justify-between items-center bg-white z-10 shrink-0 h-10">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Lili Lin <span className="text-neutral-300 font-light mx-2">/</span> <span className="text-sm font-mono font-normal text-neutral-500">PORTFOLIO_OS</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <SocialLink href="https://github.com/lililin0324" label="GH" />
            <SocialLink href="lili0324@snu.ac.kr" label="EM" />
            <SocialLink href="https://www.linkedin.com/in/lililin0324" label="LK" />
          </div>
        </header>

        {/* Main Content Area - Flex Layout for Collapsible Sidebar */}
        <main className="flex flex-1 overflow-hidden relative">
          
          {/* Sidebar */}
          <aside 
            className={`
              border-r border-neutral-200 bg-neutral-50/50 flex flex-col justify-between
              transition-all duration-500 ease-in-out relative
              ${isSidebarOpen ? 'w-80 p-6' : 'w-12 py-6 items-center'}
            `}
          >
            {/* Toggle Button */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="absolute top-1/2 -right-3 w-6 h-12 bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-400 hover:text-neutral-900 z-20 rounded-r-md cursor-pointer"
              title="Toggle Sidebar"
            >
              {isSidebarOpen ? '‹' : '›'}
            </button>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 w-full overflow-hidden">
              {isSidebarOpen && <span className="text-xs font-mono text-neutral-400 mb-4 uppercase tracking-wider whitespace-nowrap">Directory</span>}
              
              {['research', 'about', 'contact'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`
                    relative group transition-all duration-200
                    ${isSidebarOpen 
                      ? 'text-left px-4 py-3 text-sm font-medium border-l-2' 
                      : 'w-8 h-8 flex items-center justify-center rounded-sm'
                    }
                    ${activeTab === tab 
                      ? (isSidebarOpen ? 'border-neutral-900 text-neutral-900 bg-white' : 'bg-neutral-900 text-white')
                      : (isSidebarOpen ? 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300' : 'text-neutral-400 hover:bg-neutral-200')
                    }
                  `}
                >
                  {isSidebarOpen ? (
                    tab.charAt(0).toUpperCase() + tab.slice(1)
                  ) : (
                    <span className="font-mono font-bold text-xs">{tab.charAt(0).toUpperCase()}</span>
                  )}
                </button>
              ))}
            </nav>

            {/* Stats (Only visible when open) */}
            <div className={`mt-auto transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <div className="text-xs font-mono text-neutral-400 mb-2 uppercase tracking-wider">Status</div>
              <div className="space-y-2 text-xs font-mono text-neutral-600 whitespace-nowrap">
                <div className="flex justify-between">
                  <span>Avail:</span> <span className="text-green-600">● On</span>
                </div>
                <div className="flex justify-between">
                  <span>Ver:</span> <span>2.0.4</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Panel Content */}
          <section className="flex-1 bg-white relative overflow-y-auto overflow-x-hidden">
            
            {activeTab === 'research' && (
              <div className="h-full">
                {selectedProject ? (
                  // ==========================
                  // PROJECT DETAIL VIEW
                  // ==========================
                  <div className="h-full flex flex-col animate-in slide-in-from-right-4 duration-500">
                    
                    {/* Project Toolbar */}
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-6 py-4 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => setSelectedProject(null)}
                          className="flex items-center gap-2 text-xs font-mono text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
                        >
                          ← Index
                        </button>
                        <div className="h-4 w-px bg-neutral-200"></div>
                        <h2 className="text-sm font-bold text-neutral-900">{selectedProject.title}</h2>
                      </div>

                      {/* View Mode Toggle */}
                      <div className="flex bg-neutral-100 p-1 rounded-sm border border-neutral-200">
                        <button
                          onClick={() => setProjectViewMode('details')}
                          className={`px-3 py-1 text-xs font-mono transition-colors ${projectViewMode === 'details' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                          DOCS
                        </button>
                        {selectedProject.hasDemo && (
                          <button
                            onClick={() => setProjectViewMode('demo')}
                            className={`px-3 py-1 text-xs font-mono transition-colors flex items-center gap-2 ${projectViewMode === 'demo' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                          >
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            SIMULATION
                          </button>
                        )}
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 overflow-y-auto relative">
                      
                      {/* VIEW: DETAILS */}
                      {projectViewMode === 'details' && (
                        <div className="p-6 md:p-10 max-w-7xl mx-auto">
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm text-neutral-600 border-b border-neutral-100 pb-8">
                            <div>
                              <span className="block font-mono text-xs text-neutral-400 uppercase mb-1">ID</span>
                              NO. {selectedProject.id}
                            </div>
                            <div>
                              <span className="block font-mono text-xs text-neutral-400 uppercase mb-1">Year</span>
                              {selectedProject.year}
                            </div>
                            <div>
                              <span className="block font-mono text-xs text-neutral-400 uppercase mb-1">Category</span>
                              {selectedProject.category}
                            </div>
                            <div>
                              <span className="block font-mono text-xs text-neutral-400 uppercase mb-1">Tech</span>
                               <span className="text-xs truncate block">{selectedProject.tech.join(', ')}</span>
                            </div>
                          </div>

                          <div className="prose prose-neutral prose-sm max-w-none">
                            <h1 className="text-3xl font-light mb-6 text-neutral-900">{selectedProject.title}</h1>
                            
                            <div className="bg-neutral-50 border-l-2 border-neutral-900 p-6 mb-8 font-serif italic text-neutral-700">
                              "{selectedProject.description}"
                            </div>

                            <div className="grid md:grid-cols-12 gap-8">
                              <div className="md:col-span-8 space-y-8">
                                <section>
                                  <h3 className="text-xs font-mono uppercase text-neutral-400 mb-2">01 // Abstract</h3>
                                  <p className="leading-relaxed text-neutral-800">{selectedProject.details.abstract}</p>
                                </section>
                                <section>
                                  <h3 className="text-xs font-mono uppercase text-neutral-400 mb-2">02 // Methodology</h3>
                                  <p className="leading-relaxed text-neutral-800">{selectedProject.details.solution}</p>
                                </section>
                              </div>
                              <div className="md:col-span-4 bg-neutral-50 p-4 border border-neutral-100 h-fit">
                                <h3 className="text-xs font-mono uppercase text-neutral-400 mb-2">03 // Challenges</h3>
                                <p className="text-xs leading-relaxed text-neutral-600">{selectedProject.details.challenge}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* VIEW: DEMO (Component Render or Iframe) */}
                      {projectViewMode === 'demo' && selectedProject.hasDemo && (
                        <div className="w-full h-full bg-neutral-100 flex flex-col absolute inset-0">
                          {selectedProject.component ? (
                            // 这里直接渲染你的复杂项目组件
                            selectedProject.component
                          ) : selectedProject.demoUrl ? (
                            // 如果是 iframe 类型的旧项目

                            <iframe 
                              src={selectedProject.demoUrl} 
                              className="w-full h-full border-0"
                              title="Project Simulation"
                              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-neutral-400 font-mono">
                                NO_SIGNAL_DETECTED
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // ==========================
                  // PROJECT LIST VIEW
                  // ==========================
                  <div className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-end border-b border-neutral-100 pb-4 mb-8">
                      <h2 className="text-xl font-medium text-neutral-900">Selected Research</h2>
                      <span className="text-xs font-mono text-neutral-400">Idx: {projects.length}</span>
                    </div>

                    <div className="grid gap-4">
                      {projects.map((project) => (
                        <div 
                          key={project.id} 
                          onClick={() => handleProjectSelect(project)}
                          className="group relative border border-neutral-200 p-6 hover:border-neutral-900 transition-all duration-300 bg-white hover:bg-neutral-50 cursor-pointer hover:shadow-sm"
                        >
                          <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-[10px] font-mono border border-neutral-900 px-1">OPEN_PROJECT ↗</span>
                          </div>

                          <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-mono text-neutral-400">NO. {project.id}</span>
                            <span className="text-xs font-mono text-neutral-500">{project.year}</span>
                          </div>
                          
                          <div className="grid md:grid-cols-4 gap-6 items-center">
                            <div className="md:col-span-3">
                              <h3 className="text-xl font-bold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {project.title}
                              </h3>
                              <p className="text-neutral-500 text-sm truncate">
                                {project.description}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 justify-end">
                              {project.tech.slice(0, 3).map(t => (
                                <span key={t} className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 border border-neutral-200">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* KEEP ABOUT & CONTACT SECTIONS UNCHANGED OR MINIMALLY ADAPTED TO NEW LAYOUT */}
            {activeTab === 'about' && (
              <div className="p-6 md:p-10 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-medium text-neutral-900 border-b border-neutral-100 pb-4 mb-8">
                  About the Engineer
                </h2>
                <div className="prose prose-neutral prose-sm">
                  <p className="text-lg text-neutral-800 leading-relaxed mb-6 font-light">
                    I am Lili Lin, a Master’s student at Seoul National University in the City Energy Lab, where my research focuses on <span className="font-medium border-b border-neutral-300">AI-assisted urban planning</span> especially on <span className="font-medium border-b border-neutral-300">heat environments.</span>
                  </p>
                  <p className="text-neutral-600 mb-8">
                    In my current researches, I use machine learning models and statistic analysis to understand how environmental factors influence climate-related risks. Using Landsat 8 and spatial regression to quantified how Local Climate Zones affect urban heat resilience in NYC and LA; Examined the MAUP problem using GBDT and PDP analyses to reveal non-linear relationships between urban form, land cover, and heat exposure across multiple spatial scales in Seoul.
                  </p>
                </div>
                 <div className="grid grid-cols-2 gap-8 mt-12 border-t border-neutral-100 pt-8">
                  <div>
                    <h4 className="font-mono text-xs text-neutral-400 uppercase mb-4">Core Competencies</h4>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li>React / Next.js ecosystem</li>
                      <li>TypeScript Architecture</li>
                      <li>WebGL / Three.js</li>
                      <li>UI Systems Design</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="h-full flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 border border-neutral-300 flex items-center justify-center mb-6 text-2xl rotate-45 hover:rotate-90 transition-transform duration-500">
                  ✉️
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">Initialize Connection</h2>
                <a href="mailto:hello@example.com" className="bg-neutral-900 text-white px-8 py-3 text-sm font-mono hover:bg-neutral-700 transition-colors">
                  SEND_TRANSMISSION
                </a>
              </div>
            )}

          </section>
        </main>
      </div>
    </div>
  );
};
const SocialLink = ({ href, label }: { href: string, label: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-8 h-8 flex items-center justify-center border border-neutral-200 text-xs font-mono text-neutral-500 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
  >
    {label}
  </a>
);

const root = createRoot(document.getElementById("root")!);
root.render(<App />);