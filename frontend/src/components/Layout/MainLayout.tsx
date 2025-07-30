import React from 'react';

const MainLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className="main-layout">
      <header className="main-header">
        <h1>RoPA Platform</h1>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </nav>
      </header>
      <main>
        {children}
      </main>
      <footer>
        <p>© {new Date().getFullYear()} RoPA Platform</p>
      </footer>
    </div>
  );
};

export default MainLayout;
